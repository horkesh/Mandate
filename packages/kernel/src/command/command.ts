/**
 * Command (FOUNDATION section 10; decisions 0033, 0040, 0050): posts, the
 * people in them, and which post commands each force block, as State written
 * only here.
 *
 * - **Posts nest** (0033): each post names its parent, the next post up the
 *   chain an order relays through. A corps is a post, and moves as a bundle
 *   with its commander when its parent changes.
 * - **Transfers name a force** (0033): a number of blocks, a strength in men,
 *   or a corps; never blocks one by one. The sending commander picks which
 *   blocks go, by his own compliance (lane 1.5, `tick/verbs.ts`): a willing man
 *   sends from his strongest, one who drags his feet his weakest first ("his
 *   worst if he can"), by known strength, unknown strengths last, then id.
 * - **Temporary posts** (0040): an expedition command, made by appointment or
 *   directive when its kind allows, dissolves with its operation. Its blocks
 *   go back to its parent post, and posts under it move up to that parent.
 * - **Scheduled department changes** (0050) are applied on their date. They
 *   are a LABELLED SCHEDULED CHANGE (see `world/scenario.ts`): an
 *   administrative line, never a change of side.
 *
 * A post's department, and through it its faction, decide its side. A block's
 * department is whose forces they are (`forces`), its post who commands them
 * (here); the two may differ, but never across sides.
 *
 * **A department's side is State** (0065): copied from the World at the start
 * and changed only by a situation's typed proposal (`department_side`), apart
 * from a neutral government's closing (`government_closed`, 0058). When a
 * government joins a side its land stops being neutral ground, its posts and
 * blocks serve that side, and a man holding one of its posts serves it while he
 * holds the post. Control is `control`'s and does not move.
 */
import { strictCompare } from '../compare.ts';
import type { DepartmentId, FactionId, ForceBlockId, InstallationId, PersonId, PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { parseIsoDate } from '../world/calendar.ts';
import type { WorldIndex } from '../world/index.ts';
import type { PostLinkKind, ScenarioStart } from '../world/scenario.ts';

/** A department change waiting for its date. */
export interface ScheduledChangeState {
  /** ISO date it takes effect. */
  readonly schedOn: string;
  readonly schedDepartment: DepartmentId;
  readonly schedParent: PostId | null;
}

/** A standing agreement or prior order on a post (0040), read by its holder's compliance. */
export interface StandingOrderState {
  readonly soId: string;
  readonly soKind: string;
  readonly soFrom: PostId | null;
  readonly soIssuedOn: string;
  readonly soSummary: string;
}

export interface PostLinkState {
  readonly linkKind: PostLinkKind;
  readonly linkPost: PostId;
}

/** One post. Immutable: `command` replaces it whole. */
export interface PostState {
  readonly postName: string;
  /** A post kind from the pack's vocabulary. */
  readonly postKind: string;
  readonly postDepartment: DepartmentId;
  /** The next post up the chain; null at the top. */
  readonly postParent: PostId | null;
  readonly postHolder: PersonId | null;
  readonly postActing: boolean;
  /** Who runs the post's intelligence (0058), on its side; null when none is sourced. */
  readonly postIntelChief: PersonId | null;
  /** Where the office sits; its headquarters when it commands no force. */
  readonly postSeat: RegionId | null;
  /** For a temporary post, the operation it dissolves with; null otherwise. */
  readonly postOperation: string | null;
  readonly postInstallation: InstallationId | null;
  readonly postLinks: readonly PostLinkState[];
  readonly postScheduled: readonly ScheduledChangeState[];
  readonly postStandingOrders: readonly StandingOrderState[];
}

export type PostTable = Readonly<Record<PostId, PostState>>;
/** Each department's side (0065): a faction, or null for a neutral government. */
export type DepartmentSides = Readonly<Record<DepartmentId, FactionId | null>>;
/** Which post commands each block (null: none). */
export type AssignmentTable = Readonly<Record<ForceBlockId, PostId | null>>;

export class CommandError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid command:\n- ${problems.join('\n- ')}`);
    this.name = 'CommandError';
  }
}

/** The posts and assignments at a scenario start, copied once into State (0050). Every problem is reported together. */
export function initialCommand(map: WorldIndex, start: ScenarioStart): { readonly posts: PostTable; readonly assignments: AssignmentTable } {
  const problems: string[] = [];
  const departments = new Map(map.world.departments.map((d) => [d.id, d]));
  const kinds = new Set(map.world.vocabularies.postKinds.map((k) => k.id));
  const people = new Set(map.world.people.map((p) => p.id));
  const installations = new Set(map.world.installations.map((i) => i.id));
  const postIds = new Set(start.posts.map((p) => p.id));
  const posts: Record<PostId, PostState> = {};
  const holders = new Map<PersonId, PostId>();
  for (const p of [...start.posts].sort((a, b) => strictCompare(a.id, b.id))) {
    if (Object.prototype.hasOwnProperty.call(posts, p.id)) problems.push(`post ${p.id} is listed twice`);
    if (!kinds.has(p.kind)) problems.push(`post ${p.id}: kind ${p.kind} is not in the pack's vocabulary`);
    if (!departments.has(p.department)) problems.push(`post ${p.id}: department ${p.department} is not in the World`);
    if (p.parent !== null && !postIds.has(p.parent)) problems.push(`post ${p.id}: parent ${p.parent} is not a post`);
    if (p.region !== null && !map.regions.has(p.region)) problems.push(`post ${p.id}: region ${p.region} is not in the World`);
    if (p.installation !== null && !installations.has(p.installation)) problems.push(`post ${p.id}: installation ${p.installation} is not in the World`);
    if (p.holder !== null) {
      if (!people.has(p.holder)) problems.push(`post ${p.id}: holder ${p.holder} is not a person in the World`);
      const held = holders.get(p.holder);
      if (held !== undefined) problems.push(`post ${p.id}: ${p.holder} already holds ${held}`);
      holders.set(p.holder, p.id);
    }
    if (p.intelligenceChief !== null) {
      const chief = map.world.people.find((x) => x.id === p.intelligenceChief);
      if (chief === undefined) problems.push(`post ${p.id}: intelligence chief ${p.intelligenceChief} is not a person in the World`);
      else if (chief.faction !== departments.get(p.department)?.faction) problems.push(`post ${p.id}: intelligence chief ${p.intelligenceChief} is not on its side`);
    }
    for (const c of p.departmentChanges) {
      try {
        parseIsoDate(c.on);
      } catch {
        problems.push(`post ${p.id}: department change on "${c.on}" is not an ISO date`);
      }
      if (!departments.has(c.department)) problems.push(`post ${p.id}: department change to ${c.department}, which is not in the World`);
      else if (departments.get(c.department)!.faction !== departments.get(p.department)?.faction) problems.push(`post ${p.id}: a scheduled change may not move it to another side`);
    }
    posts[p.id] = {
      postName: p.name,
      postKind: p.kind,
      postDepartment: p.department,
      postParent: p.parent,
      postHolder: p.holder,
      postActing: p.acting,
      postIntelChief: p.intelligenceChief,
      postSeat: p.region,
      postOperation: p.temporary?.operation ?? null,
      postInstallation: p.installation,
      postLinks: p.links.map((l) => ({ linkKind: l.kind, linkPost: l.post })),
      postScheduled: [...p.departmentChanges]
        .sort((a, b) => strictCompare(a.on, b.on))
        .map((c) => ({ schedOn: c.on, schedDepartment: c.department, schedParent: c.parent })),
      postStandingOrders: p.standingOrders.map((s) => ({ soId: s.id, soKind: s.kind, soFrom: s.from, soIssuedOn: s.issuedOn, soSummary: s.summary })),
    };
  }
  if (problems.length === 0) problems.push(...chainProblems(posts, departments));
  const assignments: Record<ForceBlockId, PostId | null> = {};
  for (const b of [...start.forceBlocks].sort((x, y) => strictCompare(x.id, y.id))) {
    if (b.post !== null) {
      const post = posts[b.post];
      if (post === undefined) problems.push(`force block ${b.id}: post ${b.post} is not a post`);
      else if (departments.get(post.postDepartment)?.faction !== departments.get(b.department)?.faction) problems.push(`force block ${b.id}: commanded by ${b.post}, on another side`);
    }
    assignments[b.id] = b.post;
  }
  if (problems.length > 0) throw new CommandError(problems);
  return { posts, assignments };
}

/**
 * Each department's side at the start, copied once from the World into State (0065). Every problem is reported
 * together: a department listed twice, or a faction not in the World. The pack validator says the same at a source
 * cell; this keeps any World the kernel is handed (a fixture, an adapter) from setting up with a bad row.
 */
export function initialDepartmentSides(map: WorldIndex): DepartmentSides {
  const factions = new Set(map.world.factions.map((f) => f.id));
  const problems: string[] = [];
  const out: Record<DepartmentId, FactionId | null> = {};
  for (const d of [...map.world.departments].sort((a, b) => strictCompare(a.id, b.id))) {
    if (Object.prototype.hasOwnProperty.call(out, d.id)) problems.push(`department ${d.id} is listed twice`);
    if (d.faction !== null && !factions.has(d.faction)) problems.push(`department ${d.id}: faction ${d.faction} is not in the World`);
    out[d.id] = d.faction;
  }
  if (problems.length > 0) throw new CommandError(problems);
  return out;
}

/** A department's side today (0065): a faction, or null for a neutral government. Throws on a department not in State. */
export function departmentSide(state: State, department: DepartmentId): FactionId | null {
  if (!Object.prototype.hasOwnProperty.call(state.departmentFactions, department)) throw new CommandError([`department ${department} is not in the World`]);
  return state.departmentFactions[department]!;
}

/** Loops in the chain, and a parent on another side. */
function chainProblems(posts: Readonly<Record<PostId, PostState>>, departments: ReadonlyMap<DepartmentId, { readonly faction: FactionId | null }>): string[] {
  const problems: string[] = [];
  for (const id of (Object.keys(posts) as PostId[]).sort(strictCompare)) {
    const p = posts[id]!;
    if (p.postParent !== null) {
      const parent = posts[p.postParent]!;
      if (departments.get(parent.postDepartment)?.faction !== departments.get(p.postDepartment)?.faction) problems.push(`post ${id}: parent ${p.postParent} is on another side`);
    }
    const seen = new Set<PostId>([id]);
    for (let s = p.postParent; s !== null; s = posts[s]?.postParent ?? null) {
      if (seen.has(s)) {
        problems.push(`post ${id}: its chain loops at ${s}`);
        break;
      }
      seen.add(s);
    }
  }
  return problems;
}

/** A post by id. Throws on an unknown post. */
export function postStateOf(state: State, id: PostId): PostState {
  const p = state.postStates[id];
  if (p === undefined) throw new CommandError([`unknown post ${id}`]);
  return p;
}

/** Every post id in code-unit order. */
export function postIdsOf(state: State): PostId[] {
  return (Object.keys(state.postStates) as PostId[]).sort(strictCompare);
}

/** The post a person holds, or null. */
export function heldPost(state: State, person: PersonId): PostId | null {
  for (const id of postIdsOf(state)) if (state.postStates[id]!.postHolder === person) return id;
  return null;
}

/** The faction a post serves, through its department's side today (0065); null for a neutral government's post. */
export function factionOfPost(_map: WorldIndex, state: State, id: PostId): FactionId | null {
  const dept = postStateOf(state, id).postDepartment;
  if (!Object.prototype.hasOwnProperty.call(state.departmentFactions, dept)) throw new CommandError([`post ${id}: department ${dept} is not in the World`]);
  return state.departmentFactions[dept]!;
}

/**
 * A person's side (0065, 0055): the side of the post he holds, while he holds it; otherwise his own in the World.
 * A man with no post changes side only through situations or events (the people module, Phase 1).
 *
 * A holder follows his post only where `command` could have put him there: his own side is the post's today (he
 * was appointed to it) or its department's at the start (he held it when the government changed side, as a
 * neutral state's officer of no side follows his state into a side). A man in a post past `command`'s guard, the other side's man in
 * one of ours, keeps his own side, so no guard that reads this hands anything to the other side (standing review S6).
 */
export function sideOfPerson(map: WorldIndex, state: State, person: PersonId): FactionId | null {
  const record = map.world.people.find((x) => x.id === person);
  if (record === undefined) throw new CommandError([`${person} is not a person in the World`]);
  const post = heldPost(state, person);
  if (post === null) return record.faction;
  const side = factionOfPost(map, state, post);
  const startSide = map.world.departments.find((d) => d.id === postStateOf(state, post).postDepartment)?.faction ?? null;
  return record.faction === side || record.faction === startSide ? side : record.faction;
}

/** The posts an order passes from below `top` down to `target`, inclusive of `target` (the relays). */
export function chainBelow(state: State, top: PostId | null, target: PostId): PostId[] {
  const up: PostId[] = [];
  for (let p: PostId | null = target; p !== null && p !== top; p = postStateOf(state, p).postParent) up.push(p);
  return up.reverse();
}

/** The blocks a post commands directly, in id order. */
export function commandedBlocks(state: State, post: PostId): ForceBlockId[] {
  return (Object.keys(state.forceAssignments) as ForceBlockId[]).filter((b) => state.forceAssignments[b] === post).sort(strictCompare);
}

/** The post commanding a block, or null. Throws on an unknown block. */
export function assignmentOf(state: State, block: ForceBlockId): PostId | null {
  if (!Object.prototype.hasOwnProperty.call(state.forceAssignments, block)) throw new CommandError([`unknown force block ${block}`]);
  return state.forceAssignments[block]!;
}

function withPost(state: State, id: PostId, post: PostState): State {
  return { ...state, postStates: { ...state.postStates, [id]: post } };
}

/**
 * Put a person in a post (proposed by verbs, situations and promotion lists).
 * He may hold only one post, and only on his own side (`sideOfPerson`): a man
 * with no post brings his faction in the World, which must be the post's (a
 * neutral government's post takes a man of no faction). Changing a man's side
 * is a situation's work for the people module (Phase 1).
 */
export function appointHolder(map: WorldIndex, state: State, post: PostId, person: PersonId, acting = false): State {
  const p = postStateOf(state, post);
  if (sideOfPerson(map, state, person) !== factionOfPost(map, state, post)) throw new CommandError([`${person} is not on ${post}'s side`]);
  const held = heldPost(state, person);
  if (held !== null && held !== post) throw new CommandError([`${person} already holds ${held}`]);
  if (p.postHolder !== null && p.postHolder !== person) throw new CommandError([`post ${post} is held by ${p.postHolder}; relieve him first`]);
  return withPost(state, post, { ...p, postHolder: person, postActing: acting });
}

/** Leave a post empty (relieve, an operation's end). */
export function relieveHolder(state: State, post: PostId): State {
  const p = postStateOf(state, post);
  if (p.postHolder === null) return state;
  return withPost(state, post, { ...p, postHolder: null, postActing: false });
}

/** How the sending commander picks the blocks (lane 1.5): from his strongest, or his weakest first. */
export type TransferPick = 'strongest_first' | 'weakest_first';

/**
 * What a battle proposes to `command` (lane 1.3; 0073): a post left vacant because its holder was killed, wounded or
 * captured, and a surrendered block that no post commands any more. Typed, with the battle that caused it (hard rule 6).
 */
export type CombatCommandChange =
  | { readonly change: 'vacate'; readonly post: PostId; readonly person: PersonId; readonly why: 'killed' | 'wounded' | 'captured'; readonly battle: string }
  | { readonly change: 'release'; readonly block: ForceBlockId; readonly battle: string };

/**
 * Apply a battle's proposals: a vacancy empties the post only while the hit man still holds it (anyone appointed since
 * keeps it); a released block is commanded by no post. Returns the State unchanged when nothing changes.
 */
export function applyCombatCommand(state: State, changes: readonly CombatCommandChange[]): State {
  let next = state;
  for (const c of changes) {
    if (c.change === 'vacate') {
      if (postStateOf(next, c.post).postHolder === c.person) next = relieveHolder(next, c.post);
      continue;
    }
    if (assignmentOf(next, c.block) !== null) next = { ...next, forceAssignments: { ...next.forceAssignments, [c.block]: null } };
  }
  return next;
}

/** What a transfer names (0033): a number of blocks, a strength in men, or a corps (a post that moves as a bundle). */
export type TransferForce =
  | { readonly force: 'blocks'; readonly count: number }
  | { readonly force: 'men'; readonly men: number }
  | { readonly force: 'corps'; readonly corps: PostId };

export interface TransferResult {
  readonly state: State;
  /** The blocks that changed post (for a corps: none; they stay under it). */
  readonly moved: readonly ForceBlockId[];
  /** Every man actually sent, detachments that went with their parent included (lane 1.4c; 0081). Unknown strengths count 0. */
  readonly menSent: number;
  /** Why these blocks: the sender's rule (hard rule 6). */
  readonly rule: TransferPick | 'corps_as_bundle';
}

/**
 * Transfer a force from one post to another (0033). Both posts must be on the
 * same side. The sender picks among his blocks by his rule, never one whose
 * strength is known to be 0: an emptied shell is no force to give (lane 1.4c;
 * 0081). A detachment he commands goes with its chosen parent only if it stands
 * in the parent's region: one that stands elsewhere (a landing ashore, a
 * garrison left behind) is a force in the field, not the parent's to give away,
 * so it stays where it is and under its post. The men reported sent are every
 * man that went.
 */
export function transferForce(map: WorldIndex, state: State, from: PostId, to: PostId, force: TransferForce, pick: TransferPick): TransferResult {
  if (from === to) throw new CommandError(['a transfer needs two different posts']);
  if (factionOfPost(map, state, from) !== factionOfPost(map, state, to)) throw new CommandError([`${from} and ${to} are on different sides`]);
  if (force.force === 'corps') {
    const corps = postStateOf(state, force.corps);
    if (corps.postParent !== from) throw new CommandError([`${force.corps} is not under ${from}`]);
    if (chainBelow(state, null, to).includes(force.corps)) throw new CommandError([`${to} is under ${force.corps}; the chain would loop`]);
    return { state: withPost(state, force.corps, { ...corps, postParent: to }), moved: [], menSent: 0, rule: 'corps_as_bundle' };
  }
  const own = commandedBlocks(state, from);
  const blocks = own
    .filter((id) => state.forceBlockStates[id]!.fbKind === 'block' && state.forceBlockStates[id]!.fbStrength !== 0)
    .sort((a, b) => {
      const sa = state.forceBlockStates[a]!.fbStrength;
      const sb = state.forceBlockStates[b]!.fbStrength;
      if (sa === null || sb === null) return sa === sb ? strictCompare(a, b) : sa === null ? 1 : -1;
      return (pick === 'weakest_first' ? sa - sb : sb - sa) || strictCompare(a, b);
    });
  // A chosen block takes with it only the detachments standing where it stands.
  const regionOf = (id: ForceBlockId) => state.forceLocations[id]?.locRegion ?? null;
  const following = (parent: ForceBlockId) =>
    own.filter((id) => state.forceBlockStates[id]!.fbKind === 'detachment' && state.forceBlockStates[id]!.fbParent === parent && regionOf(id) === regionOf(parent));
  const menOf = (ids: readonly ForceBlockId[]) => ids.reduce((s, id) => s + (state.forceBlockStates[id]!.fbStrength ?? 0), 0);
  const going = new Set<ForceBlockId>();
  const take = (id: ForceBlockId) => {
    going.add(id);
    for (const d of following(id)) going.add(d);
  };
  if (force.force === 'blocks') {
    if (!Number.isSafeInteger(force.count) || force.count < 1) throw new CommandError(['a transfer of blocks names at least one']);
    for (const id of blocks.slice(0, force.count)) take(id);
  } else {
    if (!Number.isSafeInteger(force.men) || force.men < 1) throw new CommandError(['a transfer of men names at least one man']);
    for (const id of blocks) {
      if (menOf([...going]) >= force.men) break;
      take(id);
    }
  }
  const moved = [...going].sort(strictCompare);
  const menSent = menOf(moved);
  if (moved.length === 0) return { state, moved, menSent, rule: pick };
  const next: Record<ForceBlockId, PostId | null> = { ...state.forceAssignments };
  for (const id of moved) next[id] = to;
  return { state: { ...state, forceAssignments: next }, moved, menSent, rule: pick };
}

/** A temporary post to create (0040): an expedition command for one department in one operation. */
export interface TemporaryPostSpec {
  readonly id: PostId;
  readonly name: string;
  readonly kind: string;
  readonly department: DepartmentId;
  readonly parent: PostId | null;
  readonly holder: PersonId | null;
  readonly seat: RegionId | null;
  readonly operation: string;
}

/** Create a temporary post. Its kind must be temporary and creatable in play; its parent on its side. */
export function createTemporaryPost(map: WorldIndex, state: State, spec: TemporaryPostSpec): State {
  const problems: string[] = [];
  const kind = map.world.vocabularies.postKinds.find((k) => k.id === spec.kind);
  if (kind === undefined) problems.push(`kind ${spec.kind} is not in the pack's vocabulary`);
  else {
    if (!kind.temporary) problems.push(`kind ${spec.kind} is not a temporary post`);
    if (kind.creatable === 'start_only') problems.push(`kind ${spec.kind} exists only at a start`);
  }
  if (state.postStates[spec.id] !== undefined) problems.push(`post ${spec.id} already exists`);
  const dept = map.world.departments.find((d) => d.id === spec.department);
  if (dept === undefined) problems.push(`department ${spec.department} is not in the World`);
  if (spec.parent !== null && dept !== undefined && factionOfPost(map, state, spec.parent) !== departmentSide(state, dept.id)) problems.push(`parent ${spec.parent} is on another side`);
  if (spec.holder !== null && heldPost(state, spec.holder) !== null) problems.push(`${spec.holder} already holds ${heldPost(state, spec.holder)}`);
  if (problems.length > 0) throw new CommandError(problems);
  return withPost(state, spec.id, {
    postName: spec.name,
    postKind: spec.kind,
    postDepartment: spec.department,
    postParent: spec.parent,
    postHolder: spec.holder,
    postActing: false,
    postIntelChief: null,
    postSeat: spec.seat,
    postOperation: spec.operation,
    postInstallation: null,
    postLinks: [],
    postScheduled: [],
    postStandingOrders: [],
  });
}

/**
 * An operation ends: its temporary posts dissolve (0040). Each dissolved post's
 * blocks go to its parent (or to no post), and posts under it move up to that
 * parent. Returns the posts dissolved.
 */
export function dissolveOperation(state: State, operation: string): { readonly state: State; readonly dissolved: readonly PostId[] } {
  const dissolved = postIdsOf(state).filter((id) => state.postStates[id]!.postOperation === operation);
  if (dissolved.length === 0) return { state, dissolved };
  const gone = new Set(dissolved);
  /** The nearest surviving post up the chain. */
  const survivor = (p: PostId | null): PostId | null => {
    let s = p;
    while (s !== null && gone.has(s)) s = state.postStates[s]!.postParent;
    return s;
  };
  const posts: Record<PostId, PostState> = {};
  for (const id of postIdsOf(state)) {
    if (gone.has(id)) continue;
    const p = state.postStates[id]!;
    const parent = survivor(p.postParent);
    posts[id] = parent === p.postParent ? p : { ...p, postParent: parent };
  }
  const assignments: Record<ForceBlockId, PostId | null> = { ...state.forceAssignments };
  for (const b of Object.keys(assignments) as ForceBlockId[]) {
    const post = assignments[b]!;
    if (post !== null && gone.has(post)) assignments[b] = survivor(post);
  }
  return { state: { ...state, postStates: posts, forceAssignments: assignments }, dissolved };
}

/**
 * Apply every scheduled department change due on or before `isoDate`. Returns the posts changed, and the changes
 * dropped: a scheduled change is an administrative line, never a change of side (0050), so one whose department is
 * now on another side than the post's (a government changed side since the start, 0065) is dropped, not applied.
 */
export function applyScheduledChanges(state: State, isoDate: string): { readonly state: State; readonly changed: readonly PostId[]; readonly dropped: readonly { readonly post: PostId; readonly department: DepartmentId }[] } {
  const changed: PostId[] = [];
  const dropped: { post: PostId; department: DepartmentId }[] = [];
  let posts: Record<PostId, PostState> | null = null;
  for (const id of postIdsOf(state)) {
    const p = state.postStates[id]!;
    const due = p.postScheduled.filter((c) => c.schedOn <= isoDate);
    if (due.length === 0) continue;
    const side = departmentSide(state, p.postDepartment);
    const kept = due.filter((c) => departmentSide(state, c.schedDepartment) === side);
    for (const c of due) if (!kept.includes(c)) dropped.push({ post: id, department: c.schedDepartment });
    const rest = p.postScheduled.filter((c) => c.schedOn > isoDate);
    const last = kept[kept.length - 1];
    posts ??= { ...state.postStates };
    posts[id] = last === undefined ? { ...p, postScheduled: rest } : { ...p, postDepartment: last.schedDepartment, postParent: last.schedParent, postScheduled: rest };
    if (last !== undefined) changed.push(id);
  }
  return posts === null ? { state, changed, dropped } : { state: { ...state, postStates: posts }, changed, dropped };
}

/**
 * Neutral ground (0055 as amended by 0058 and 0065): each region whose civil
 * government is a department of no side today, and whether that government
 * has closed its territory. A region whose government is a side's, or
 * `unknown`, is not neutral ground; a government that joins a side stops being
 * neutral ground that day. The supply derivation and movement read this beside
 * the network (`NetworkConditions.neutralGround`).
 */
export function neutralGroundOf(_map: WorldIndex, state: State): Readonly<Record<RegionId, 'open' | 'closed'>> {
  const out: Record<RegionId, 'open' | 'closed'> = {};
  for (const region of (Object.keys(state.regionGovernments) as RegionId[]).sort(strictCompare)) {
    const dept = state.regionGovernments[region]!;
    if (dept === 'unknown' || state.departmentFactions[dept] !== null) continue;
    out[region] = Object.prototype.hasOwnProperty.call(state.closedGovernments, dept) ? 'closed' : 'open';
  }
  return out;
}

/** The field id a situation names to close (delta above 0) or reopen (below 0) a neutral government (0055, 0058). */
export const GOVERNMENT_CLOSED_FIELD = 'government_closed';
/** Lane 1.11: a declared government is established, and its declared regions pass to it (no side until one is proposed). */
export const GOVERNMENT_ESTABLISHED_FIELD = 'government_established';

export interface DeclaredGovernmentSpec {
  readonly id: DepartmentId;
  readonly regions: readonly RegionId[];
}

/**
 * The field id a situation names to move a government to a side (0065): the subject is the department, the
 * proposal's `side` the faction it joins, and the delta above 0. A change of side, never a closing.
 */
export const DEPARTMENT_SIDE_FIELD = 'department_side';
/** A temporary post the scenario start declares, opened by a situation's effect (0040: an expedition command; lane 1.11). */
export const TEMPORARY_POST_FIELD = 'temporary_post';

/** Why a department is not a government, or null: the pack's department kinds mark governments (0058). */
function notAGovernment(map: WorldIndex, department: DepartmentId): string | null {
  const d = map.world.departments.find((x) => x.id === department);
  if (d === undefined) return `department ${department} is not in the World`;
  if (map.world.vocabularies.departmentKinds.find((k) => k.id === d.kind)?.government !== true) return `department ${department} is not a government`;
  return null;
}

/** A government that may close its territory: a government of no side today. */
function closableGovernment(map: WorldIndex, state: State, department: DepartmentId): string | null {
  const d = map.world.departments.find((x) => x.id === department);
  if (d === undefined) return `department ${department} is not in the World`;
  if (departmentSide(state, department) !== null) return `department ${department} belongs to a side; only a neutral government closes its territory`;
  return notAGovernment(map, department);
}

/** A neutral government closes its territory to every side's movement and supply (0055), from `day`. */
export function closeGovernment(map: WorldIndex, state: State, department: DepartmentId, day: number): State {
  const problem = closableGovernment(map, state, department);
  if (problem !== null) throw new CommandError([problem]);
  if (Object.prototype.hasOwnProperty.call(state.closedGovernments, department)) return state;
  return { ...state, closedGovernments: { ...state.closedGovernments, [department]: day } };
}

/** A neutral government reopens its territory. */
export function reopenGovernment(state: State, department: DepartmentId): State {
  if (!Object.prototype.hasOwnProperty.call(state.closedGovernments, department)) return state;
  const next: Record<DepartmentId, number> = { ...state.closedGovernments };
  delete next[department];
  return { ...state, closedGovernments: next };
}

/**
 * What a change of side did (hard rule 6). Besides the side itself, each consequence keeps command's rule that
 * nothing it holds crosses sides: a post's parent, a block's commanding post and a post's intelligence chief.
 */
export interface SideChange {
  readonly department: DepartmentId;
  readonly from: FactionId | null;
  readonly to: FactionId;
  /** The day it had closed its territory, if it had: a government on a side no longer closes (0058), so it is open again. */
  readonly closingLifted: number | null;
  /** Posts whose parent is now on another side: each heads its own chain from today. */
  readonly postsCut: readonly PostId[];
  /** Blocks whose commanding post is now on another side: each has no post from today. */
  readonly blocksUnassigned: readonly ForceBlockId[];
  /** Posts whose intelligence chief is now on another side: each has none from today. */
  readonly chiefsCleared: readonly PostId[];
}

/** Why a government cannot join `side`, or null. */
function sideChangeProblem(map: WorldIndex, department: DepartmentId, side: FactionId | null): string | null {
  const problem = notAGovernment(map, department);
  if (problem !== null) return `${problem}; only a government changes side`;
  if (side === null) return `a change of side for ${department} names no side to join`;
  if (!map.world.factions.some((f) => f.id === side)) return `faction ${side} is not in the World`;
  return null;
}

/**
 * A government joins a side (0065): a state's secession, a legislature's choice, a nation's treaty. Its land stops
 * being neutral ground, its posts and blocks serve `side`, and a man holding one of its posts serves `side` while he
 * holds it (`sideOfPerson`). Control does not move: it is `control`'s (0054). Returns the change, or null when the
 * government is already on `side`. Throws `CommandError` for a department that is not a government, or a side not in
 * the World.
 */
export function changeDepartmentSide(map: WorldIndex, start: State, department: DepartmentId, side: FactionId): { readonly state: State; readonly change: SideChange | null } {
  const problem = sideChangeProblem(map, department, side);
  if (problem !== null) throw new CommandError([problem]);
  const from = departmentSide(start, department);
  if (from === side) return { state: start, change: null };
  let state: State = { ...start, departmentFactions: { ...start.departmentFactions, [department]: side } };
  const closingLifted = Object.prototype.hasOwnProperty.call(state.closedGovernments, department) ? state.closedGovernments[department]! : null;
  state = reopenGovernment(state, department);

  const postsCut: PostId[] = [];
  const chiefsCleared: PostId[] = [];
  let posts: Record<PostId, PostState> | null = null;
  for (const id of postIdsOf(state)) {
    const p = state.postStates[id]!;
    const mine = factionOfPost(map, state, id);
    const cut = p.postParent !== null && factionOfPost(map, state, p.postParent) !== mine;
    const cleared = p.postIntelChief !== null && sideOfPerson(map, state, p.postIntelChief) !== mine;
    if (!cut && !cleared) continue;
    if (cut) postsCut.push(id);
    if (cleared) chiefsCleared.push(id);
    posts ??= { ...state.postStates };
    posts[id] = { ...p, postParent: cut ? null : p.postParent, postIntelChief: cleared ? null : p.postIntelChief };
  }
  if (posts !== null) state = { ...state, postStates: posts };

  const blocksUnassigned: ForceBlockId[] = [];
  let assignments: Record<ForceBlockId, PostId | null> | null = null;
  for (const b of (Object.keys(state.forceAssignments) as ForceBlockId[]).sort(strictCompare)) {
    const post = state.forceAssignments[b]!;
    const block = state.forceBlockStates[b];
    if (post === null || block === undefined || departmentSide(state, block.fbDepartment) === factionOfPost(map, state, post)) continue;
    blocksUnassigned.push(b);
    assignments ??= { ...state.forceAssignments };
    assignments[b] = null;
  }
  if (assignments !== null) state = { ...state, forceAssignments: assignments };
  return { state, change: { department, from, to: side, closingLifted, postsCut, blocksUnassigned, chiefsCleared } };
}

/** A situation's typed proposal, as the tick reports it. */
export interface CommandProposal {
  readonly owner: string;
  readonly field: string;
  readonly subject: string | null;
  readonly delta: number;
  /** For a change of side, the side the government joins; a closing names none. */
  readonly side: FactionId | null;
  /**
   * What the proposal came from (0069): a `notice`'s effects, or a `decision`'s option, inaction or locked cost. A
   * self-governing government is moved only by a notice, its own act, never by a principal's choice.
   */
  readonly origin: ProposalOrigin;
}

export type ProposalOrigin = 'notice' | 'decision';

/** Why `command` refused a proposal: a typed reason (hard rule 6), with the sentence that says it. */
export const REFUSAL_REASONS = ['invalid', 'self_governing_decision', 'self_governing_region'] as const;
export type RefusalReason = (typeof REFUSAL_REASONS)[number];
export interface Refusal {
  readonly reason: RefusalReason;
  readonly why: string;
}

/** Whether a department is of a self-governing kind (0069). The engine reads the flag, never kind names. */
export function isSelfGoverning(map: WorldIndex, department: DepartmentId): boolean {
  const d = map.world.departments.find((x) => x.id === department);
  return d !== undefined && map.world.vocabularies.departmentKinds.find((k) => k.id === d.kind)?.selfGoverning === true;
}

/**
 * Why a proposal may not move a self-governing government (0069), or null: only a notice, the nation's own act,
 * changes its side or closes or reopens it.
 */
function selfGoverningProblem(map: WorldIndex, department: DepartmentId, origin: ProposalOrigin): string | null {
  if (origin === 'notice' || !isSelfGoverning(map, department)) return null;
  return `department ${department} governs itself: only a notice, its own act, moves it, never a decision option, inaction or a locked cost`;
}

/**
 * Why a region held by `from` may not pass to `to` (0069, 0070), or null. A region held by a self-governing government
 * moves only to another department of the same kind and the same polity, which allows a nation's own rival
 * governments (the Cherokee in 1862 and 1863) and never annexation to a state, a territory or a military department,
 * nor one nation's land passing to another nation's government. Nothing proposes a region's government yet (Phase 0);
 * whatever writes it must ask here first, and a test fails if `command` writes the field without it. `to` is `unknown`
 * for a region whose government is no longer known. The reserved refusal reason is `self_governing_region`.
 */
export function regionMoveProblem(map: WorldIndex, from: DepartmentId | 'unknown', to: DepartmentId | 'unknown'): string | null {
  if (from === 'unknown' || !isSelfGoverning(map, from)) return null;
  const record = (d: DepartmentId) => map.world.departments.find((x) => x.id === d);
  const own = record(from);
  const other = to === 'unknown' ? undefined : record(to);
  if (other !== undefined && other.kind === own?.kind) {
    if (own?.polity !== undefined && other.polity === own.polity) return null;
    return `a region held by ${from}, which governs itself, passes only to a government of its own people (polity ${own?.polity ?? 'none'}), not to ${to} (polity ${other.polity ?? 'none'})`;
  }
  return `a region held by ${from}, which governs itself, passes only to another department of its kind and polity, not to ${to}`;
}

export type AppliedProposal =
  | { readonly field: typeof GOVERNMENT_CLOSED_FIELD; readonly subject: DepartmentId; readonly change: 'closed' | 'reopened' | 'unchanged' }
  | { readonly field: typeof DEPARTMENT_SIDE_FIELD; readonly subject: DepartmentId; readonly change: 'joined' | 'unchanged'; readonly side: SideChange | null }
  | { readonly field: typeof TEMPORARY_POST_FIELD; readonly subject: PostId; readonly change: 'opened' | 'unchanged' }
  | { readonly field: typeof GOVERNMENT_ESTABLISHED_FIELD; readonly subject: DepartmentId; readonly change: 'established' | 'unchanged' };

/**
 * Apply the proposals `command` owns (owner `command`), in order; others are
 * left for their owners. Two fields, kept apart: `government_closed` (a neutral
 * government closes or reopens its territory, 0058) and `department_side` (a
 * government joins a side, 0065). A proposal naming a field `command` does not
 * own, a department that cannot close or change side, or a change of side with
 * no side to join or a delta not above 0, is refused with a reason (the
 * situation's author made an error the pack validator could not see, since it
 * names State).
 */
export function applyCommandProposals(
  map: WorldIndex,
  start: State,
  proposals: readonly CommandProposal[],
  day: number,
  temporaryPosts: readonly TemporaryPostSpec[] = [],
  declaredGovernments: readonly DeclaredGovernmentSpec[] = [],
): { readonly state: State; readonly applied: readonly AppliedProposal[]; readonly refused: readonly Refusal[] } {
  let state = start;
  const applied: AppliedProposal[] = [];
  const refused: Refusal[] = [];
  const refuse = (reason: RefusalReason, why: string) => refused.push({ reason, why });
  for (const p of proposals) {
    if (p.owner !== 'command') continue;
    // A temporary post the start declares (0040): opened once, by a situation's effect; the post then serves as any post.
    if (p.field === TEMPORARY_POST_FIELD) {
      const spec = temporaryPosts.find((s) => s.id === p.subject);
      if (spec === undefined) {
        refuse('invalid', `no temporary post ${p.subject ?? 'none'} is declared in the start`);
        continue;
      }
      if (state.postStates[spec.id] !== undefined) {
        applied.push({ field: TEMPORARY_POST_FIELD, subject: spec.id, change: 'unchanged' });
        continue;
      }
      try {
        state = createTemporaryPost(map, state, spec);
        applied.push({ field: TEMPORARY_POST_FIELD, subject: spec.id, change: 'opened' });
      } catch (e) {
        refuse('invalid', e instanceof CommandError ? e.problems.join('; ') : String(e));
      }
      continue;
    }
    // Lane 1.11: a government the start declares is established once; its declared regions pass to it from whoever held them.
    if (p.field === GOVERNMENT_ESTABLISHED_FIELD) {
      const spec = declaredGovernments.find((g) => g.id === p.subject);
      if (spec === undefined) {
        refuse('invalid', `no government ${p.subject ?? 'none'} is declared in the start`);
        continue;
      }
      if (spec.regions.every((r) => state.regionGovernments[r] === spec.id)) {
        applied.push({ field: GOVERNMENT_ESTABLISHED_FIELD, subject: spec.id, change: 'unchanged' });
        continue;
      }
      // 0069, 0070: a region a people governs themselves passes only to a government of its own people.
      const moved = spec.regions.map((r) => regionMoveProblem(map, state.regionGovernments[r] ?? 'unknown', spec.id)).find((x) => x !== null) ?? null;
      if (moved !== null) {
        refuse('self_governing_region', moved);
        continue;
      }
      const governments: Record<string, DepartmentId | 'unknown'> = { ...state.regionGovernments };
      for (const r of spec.regions) governments[r] = spec.id;
      state = { ...state, regionGovernments: governments as State['regionGovernments'] };
      applied.push({ field: GOVERNMENT_ESTABLISHED_FIELD, subject: spec.id, change: 'established' });
      continue;
    }
    if ((p.field !== GOVERNMENT_CLOSED_FIELD && p.field !== DEPARTMENT_SIDE_FIELD) || p.subject === null) {
      refuse('invalid', `command owns no field "${p.field}" with subject ${p.subject ?? 'none'}`);
      continue;
    }
    const department = p.subject as DepartmentId;
    const own = selfGoverningProblem(map, department, p.origin);
    if (own !== null) {
      refuse('self_governing_decision', own);
      continue;
    }
    if (p.field === DEPARTMENT_SIDE_FIELD) {
      const problem = sideChangeProblem(map, department, p.side) ?? (p.delta > 0 ? null : `a change of side for ${department} joins the side it names, with a delta above 0; no proposal takes a side away`);
      if (problem !== null) {
        refuse('invalid', problem);
        continue;
      }
      const r = changeDepartmentSide(map, state, department, p.side!);
      state = r.state;
      applied.push({ field: DEPARTMENT_SIDE_FIELD, subject: department, change: r.change === null ? 'unchanged' : 'joined', side: r.change });
      continue;
    }
    const problem = closableGovernment(map, state, department);
    if (problem !== null) {
      refuse('invalid', problem);
      continue;
    }
    const before = state;
    state = p.delta > 0 ? closeGovernment(map, state, department, day) : p.delta < 0 ? reopenGovernment(state, department) : state;
    applied.push({ field: GOVERNMENT_CLOSED_FIELD, subject: department, change: state === before ? 'unchanged' : p.delta > 0 ? 'closed' : 'reopened' });
  }
  return { state, applied, refused };
}

