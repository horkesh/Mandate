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
 *   blocks go. STAND-IN until Phase 1's compliance: he sends his weakest first
 *   ("his worst if he can"), by known strength, unknown strengths last, then id.
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

/** The faction a post serves, through its department; null for a neutral government's post. */
export function factionOfPost(map: WorldIndex, state: State, id: PostId): FactionId | null {
  const dept = postStateOf(state, id).postDepartment;
  const d = map.world.departments.find((x) => x.id === dept);
  if (d === undefined) throw new CommandError([`post ${id}: department ${dept} is not in the World`]);
  return d.faction;
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
 * He may hold only one post, and only on his own side: his faction in the World
 * must be the post's (a neutral government's post takes a man of no faction).
 * Changing a man's side is a situation's work for the people module (Phase 1).
 */
export function appointHolder(map: WorldIndex, state: State, post: PostId, person: PersonId, acting = false): State {
  const p = postStateOf(state, post);
  const record = map.world.people.find((x) => x.id === person);
  if (record === undefined) throw new CommandError([`${person} is not a person in the World`]);
  if (record.faction !== factionOfPost(map, state, post)) throw new CommandError([`${person} is not on ${post}'s side`]);
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

/** What a transfer names (0033): a number of blocks, a strength in men, or a corps (a post that moves as a bundle). */
export type TransferForce =
  | { readonly force: 'blocks'; readonly count: number }
  | { readonly force: 'men'; readonly men: number }
  | { readonly force: 'corps'; readonly corps: PostId };

export interface TransferResult {
  readonly state: State;
  /** The blocks that changed post (for a corps: none; they stay under it). */
  readonly moved: readonly ForceBlockId[];
  /** Men asked for and sent, when the transfer named men. */
  readonly menSent: number;
  /** Why these blocks: the sender's rule (hard rule 6). */
  readonly rule: 'weakest_first' | 'corps_as_bundle';
}

/**
 * Transfer a force from one post to another (0033). Both posts must be on the
 * same side. Detachments commanded by the sender go with their parent block.
 */
export function transferForce(map: WorldIndex, state: State, from: PostId, to: PostId, force: TransferForce): TransferResult {
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
    .filter((id) => state.forceBlockStates[id]!.fbKind === 'block')
    .sort((a, b) => {
      const sa = state.forceBlockStates[a]!.fbStrength;
      const sb = state.forceBlockStates[b]!.fbStrength;
      if (sa === null || sb === null) return sa === sb ? strictCompare(a, b) : sa === null ? 1 : -1;
      return sa - sb || strictCompare(a, b);
    });
  const chosen: ForceBlockId[] = [];
  let menSent = 0;
  if (force.force === 'blocks') {
    if (!Number.isSafeInteger(force.count) || force.count < 1) throw new CommandError(['a transfer of blocks names at least one']);
    for (const id of blocks.slice(0, force.count)) chosen.push(id);
  } else {
    if (!Number.isSafeInteger(force.men) || force.men < 1) throw new CommandError(['a transfer of men names at least one man']);
    for (const id of blocks) {
      if (menSent >= force.men) break;
      chosen.push(id);
      menSent += state.forceBlockStates[id]!.fbStrength ?? 0;
    }
  }
  const going = new Set(chosen);
  for (const id of own) if (state.forceBlockStates[id]!.fbKind === 'detachment' && going.has(state.forceBlockStates[id]!.fbParent!)) going.add(id);
  const moved = [...going].sort(strictCompare);
  if (moved.length === 0) return { state, moved, menSent, rule: 'weakest_first' };
  const next: Record<ForceBlockId, PostId | null> = { ...state.forceAssignments };
  for (const id of moved) next[id] = to;
  return { state: { ...state, forceAssignments: next }, moved, menSent, rule: 'weakest_first' };
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
  if (spec.parent !== null && dept !== undefined && factionOfPost(map, state, spec.parent) !== dept.faction) problems.push(`parent ${spec.parent} is on another side`);
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

/** Apply every scheduled department change due on or before `isoDate`. Returns the posts changed. */
export function applyScheduledChanges(state: State, isoDate: string): { readonly state: State; readonly changed: readonly PostId[] } {
  const changed: PostId[] = [];
  let posts: Record<PostId, PostState> | null = null;
  for (const id of postIdsOf(state)) {
    const p = state.postStates[id]!;
    const due = p.postScheduled.filter((c) => c.schedOn <= isoDate);
    if (due.length === 0) continue;
    const last = due[due.length - 1]!;
    posts ??= { ...state.postStates };
    posts[id] = { ...p, postDepartment: last.schedDepartment, postParent: last.schedParent, postScheduled: p.postScheduled.filter((c) => c.schedOn > isoDate) };
    changed.push(id);
  }
  return posts === null ? { state, changed } : { state: { ...state, postStates: posts }, changed };
}

/**
 * Neutral ground (0055 as amended by 0058): each region whose civil government
 * is a department of no faction, and whether that government has closed its
 * territory. A region whose government is a side's, or `unknown`, is not
 * neutral ground. The supply derivation and movement read this beside the
 * network (`NetworkConditions.neutralGround`).
 */
export function neutralGroundOf(map: WorldIndex, state: State): Readonly<Record<RegionId, 'open' | 'closed'>> {
  const neutral = new Set(map.world.departments.filter((d) => d.faction === null).map((d) => d.id));
  const out: Record<RegionId, 'open' | 'closed'> = {};
  for (const region of (Object.keys(state.regionGovernments) as RegionId[]).sort(strictCompare)) {
    const dept = state.regionGovernments[region]!;
    if (dept === 'unknown' || !neutral.has(dept)) continue;
    out[region] = Object.prototype.hasOwnProperty.call(state.closedGovernments, dept) ? 'closed' : 'open';
  }
  return out;
}

/** The field id a situation names to close (delta above 0) or reopen (below 0) a neutral government (0055, 0058). */
export const GOVERNMENT_CLOSED_FIELD = 'government_closed';

/** A government that may close its territory: a department of no faction whose kind the pack marks a government. */
function closableGovernment(map: WorldIndex, department: DepartmentId): string | null {
  const d = map.world.departments.find((x) => x.id === department);
  if (d === undefined) return `department ${department} is not in the World`;
  if (d.faction !== null) return `department ${department} belongs to a side; only a neutral government closes its territory`;
  if (map.world.vocabularies.departmentKinds.find((k) => k.id === d.kind)?.government !== true) return `department ${department} is not a government`;
  return null;
}

/** A neutral government closes its territory to every side's movement and supply (0055), from `day`. */
export function closeGovernment(map: WorldIndex, state: State, department: DepartmentId, day: number): State {
  const problem = closableGovernment(map, department);
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

/** A situation's typed proposal, as the tick reports it. */
export interface CommandProposal {
  readonly owner: string;
  readonly field: string;
  readonly subject: string | null;
  readonly delta: number;
}

export interface AppliedProposal {
  readonly field: string;
  readonly subject: string;
  readonly change: 'closed' | 'reopened' | 'unchanged';
}

/**
 * Apply the proposals `command` owns (owner `command`), in order; others are
 * left for their owners. Today one field: `government_closed`. A proposal
 * naming a field `command` does not own, or a department that cannot close,
 * is refused with a reason (the situation's author made an error the pack
 * validator could not see, since it names State).
 */
export function applyCommandProposals(
  map: WorldIndex,
  start: State,
  proposals: readonly CommandProposal[],
  day: number,
): { readonly state: State; readonly applied: readonly AppliedProposal[]; readonly refused: readonly string[] } {
  let state = start;
  const applied: AppliedProposal[] = [];
  const refused: string[] = [];
  for (const p of proposals) {
    if (p.owner !== 'command') continue;
    if (p.field !== GOVERNMENT_CLOSED_FIELD || p.subject === null) {
      refused.push(`command owns no field "${p.field}" with subject ${p.subject ?? 'none'}`);
      continue;
    }
    const department = p.subject as DepartmentId;
    const problem = closableGovernment(map, department);
    if (problem !== null) {
      refused.push(problem);
      continue;
    }
    const before = state;
    state = p.delta > 0 ? closeGovernment(map, state, department, day) : p.delta < 0 ? reopenGovernment(state, department) : state;
    applied.push({ field: p.field, subject: department, change: state === before ? 'unchanged' : p.delta > 0 ? 'closed' : 'reopened' });
  }
  return { state, applied, refused };
}
