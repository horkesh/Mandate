/**
 * STAND-IN World for lane 0.6 (seats, knowledge and the command log).
 *
 * Lane 0.2 owns the real World format (regions, typed edges, depots,
 * provenance) and lane 0.5 owns forces, posts and the people in them. Until
 * they land, the seats layer needs a map to compute latency on, posts to
 * relay through and a strength to report. This file is that minimum, and
 * nothing more:
 * - regions with neighbours and a courier time per link, and whether the wire reaches them;
 * - factions with a principal and the region he sits in;
 * - posts (office, field, filter) with a holder, a superior, a headquarters region and a stand-in strength;
 * - people with the few traits the stand-in rules read.
 *
 * Post holders and strengths are World here and State later (lane 0.5).
 * When lanes 0.2 and 0.5 land, this file is replaced by their World and
 * State, and the functions that read it keep their signatures' meaning.
 * World data is immutable, hashed and never saved (FOUNDATION section 10).
 */
import { strictCompare } from '../compare.ts';
import type { FactionId, PersonId, PostId, RegionId } from '../ids.ts';
import { DEFAULT_REPORT_TEMPLATES, templateProblems, type ReportTemplate } from '../knowledge/templates.ts';
import { DEFAULT_LATENCY_RULES, latencyProblems, type LatencyRules } from '../messages/latency.ts';
import { DEFAULT_TRAIT_RULES, type TraitRules } from './traits.ts';

export interface CommsLink {
  readonly to: RegionId;
  /** Days for a courier to cross the link. */
  readonly days: number;
}

export interface CommsRegion {
  readonly id: RegionId;
  readonly neighbours: readonly CommsLink[];
  /**
   * The faction whose wire reaches the region (an office or a signal station),
   * or null. Nobody files a message at the enemy's office. Fixed here; lane
   * 0.4's control will make it follow who holds the region.
   */
  readonly wireOwner: FactionId | null;
}

export interface CommsFaction {
  readonly id: FactionId;
  readonly principal: PersonId;
  /** Where the principal sits; orders start and his reports end here. */
  readonly seatRegion: RegionId;
  /** A region pack data names as the faction's objective (rule seats read it; null if none). */
  readonly objective: RegionId | null;
}

export const POST_KINDS = ['field', 'filter', 'office'] as const;
export type PostKind = (typeof POST_KINDS)[number];

export interface CommsPost {
  readonly id: PostId;
  readonly faction: FactionId;
  readonly kind: PostKind;
  /** The headquarters region at the start (State once it can move: `movement/headquarters.ts`). */
  readonly region: RegionId;
  readonly holder: PersonId | null;
  /** The post an order relays through on its way here; null for a post that answers to the principal. */
  readonly superior: PostId | null;
  /** STAND-IN strength in men until force blocks exist (lane 0.5). */
  readonly strength: number;
  /** The person whose estimates of the enemy reach the holder, if not the holder himself. */
  readonly intelligenceChief: PersonId | null;
}

export interface CommsPerson {
  readonly id: PersonId;
  readonly faction: FactionId;
  /** Permille. */
  readonly boldness: number;
  /** Signed permille: his regard for his principal. */
  readonly regard: number;
  readonly values: readonly string[];
  /** Multiplier, permille, on enemy strength in the estimates he writes as an intelligence source (1000: none). */
  readonly intelligenceBias: number;
}

export interface CommsRules {
  readonly latency: LatencyRules;
  readonly traits: TraitRules;
  readonly templates: readonly ReportTemplate[];
  /** Days a stand-in headquarters waits after moving before it can move again (until lane 0.5's movement). */
  readonly marchDays: number;
}

export const DEFAULT_COMMS_RULES: CommsRules = Object.freeze({
  latency: DEFAULT_LATENCY_RULES,
  traits: DEFAULT_TRAIT_RULES,
  templates: DEFAULT_REPORT_TEMPLATES,
  marchDays: 3,
});

export interface CommsWorld {
  readonly regions: readonly CommsRegion[];
  readonly factions: readonly CommsFaction[];
  readonly posts: readonly CommsPost[];
  readonly persons: readonly CommsPerson[];
  readonly rules: CommsRules;
}

export class CommsWorldError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid comms world:\n- ${problems.join('\n- ')}`);
    this.name = 'CommsWorldError';
  }
}

/**
 * A World with its lookups and distance tables. Derived once from the World
 * and never saved; every kernel function in the seats layer takes this.
 */
export interface IndexedWorld {
  readonly world: CommsWorld;
  readonly rules: CommsRules;
  readonly regionIds: readonly RegionId[];
  readonly postIds: readonly PostId[];
  readonly personIds: readonly PersonId[];
  readonly factionIds: readonly FactionId[];
  region(id: RegionId): CommsRegion;
  post(id: PostId): CommsPost;
  person(id: PersonId): CommsPerson;
  faction(id: FactionId): CommsFaction;
  /** The post a person holds, or null. */
  postOf(person: PersonId): CommsPost | null;
  /** Courier days between two regions along the quickest path. Throws if unreachable. */
  courierDays(from: RegionId, to: RegionId): number;
  /** Courier days from a region to the nearest region on `faction`'s wire; null if it has none. */
  daysToWire(from: RegionId, faction: FactionId): number | null;
  /** Neighbours of `from` on a quickest path to `to`, in id order (empty if `from` is `to`). */
  nextSteps(from: RegionId, to: RegionId): readonly RegionId[];
  /** The chain of posts from below `top` down to `target`, inclusive of `target`: the relays an order passes. */
  chainBelow(top: PostId | null, target: PostId): readonly PostId[];
}

/** Every problem with a World, so a pack author sees them all at once. Empty when sound. */
export function commsWorldProblems(world: CommsWorld): string[] {
  const problems: string[] = [];
  const regions = new Map(world.regions.map((r) => [r.id, r]));
  const persons = new Map(world.persons.map((p) => [p.id, p]));
  const posts = new Map(world.posts.map((p) => [p.id, p]));
  const factions = new Map(world.factions.map((f) => [f.id, f]));
  const dup = (kind: string, ids: readonly string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`${kind} ${id} appears twice`);
      seen.add(id);
    }
  };
  dup('region', world.regions.map((r) => r.id));
  dup('person', world.persons.map((p) => p.id));
  dup('post', world.posts.map((p) => p.id));
  dup('faction', world.factions.map((f) => f.id));
  for (const r of world.regions) {
    for (const link of r.neighbours) {
      const other = regions.get(link.to);
      if (!other) problems.push(`region ${r.id}: neighbour ${link.to} is not a region`);
      else if (!other.neighbours.some((l) => l.to === r.id && l.days === link.days)) problems.push(`region ${r.id}: link to ${link.to} is not mirrored with the same days`);
      if (!Number.isSafeInteger(link.days) || link.days < 1) problems.push(`region ${r.id}: link to ${link.to} must take a whole number of days, at least 1`);
    }
    if (r.wireOwner !== null && !factions.has(r.wireOwner)) problems.push(`region ${r.id}: wire owner ${r.wireOwner} is not a faction`);
  }
  for (const f of world.factions) {
    if (persons.get(f.principal)?.faction !== f.id) problems.push(`faction ${f.id}: principal ${f.principal} is not one of its people`);
    if (!regions.has(f.seatRegion)) problems.push(`faction ${f.id}: seat region ${f.seatRegion} is not a region`);
    if (f.objective !== null && !regions.has(f.objective)) problems.push(`faction ${f.id}: objective ${f.objective} is not a region`);
  }
  const holders = new Map<PersonId, PostId>();
  for (const p of world.posts) {
    if (!factions.has(p.faction)) problems.push(`post ${p.id}: faction ${p.faction} does not exist`);
    if (!regions.has(p.region)) problems.push(`post ${p.id}: region ${p.region} does not exist`);
    if (p.holder !== null) {
      if (persons.get(p.holder)?.faction !== p.faction) problems.push(`post ${p.id}: holder ${p.holder} is not one of its faction's people`);
      if (holders.has(p.holder)) problems.push(`post ${p.id}: ${p.holder} already holds ${holders.get(p.holder)}`);
      holders.set(p.holder, p.id);
    }
    if (p.intelligenceChief !== null && persons.get(p.intelligenceChief)?.faction !== p.faction) problems.push(`post ${p.id}: intelligence chief is not one of its faction's people`);
    if (p.superior !== null) {
      const sup = posts.get(p.superior);
      if (!sup) problems.push(`post ${p.id}: superior ${p.superior} does not exist`);
      else if (sup.faction !== p.faction) problems.push(`post ${p.id}: superior ${p.superior} belongs to another faction`);
    }
    if (!Number.isSafeInteger(p.strength) || p.strength < 0) problems.push(`post ${p.id}: strength must be a whole number of men`);
    // A chain of superiors must end.
    const seen = new Set<string>([p.id]);
    for (let s = p.superior; s !== null; s = posts.get(s)?.superior ?? null) {
      if (seen.has(s)) {
        problems.push(`post ${p.id}: its chain of superiors loops at ${s}`);
        break;
      }
      seen.add(s);
    }
  }
  for (const p of world.persons) {
    if (!factions.has(p.faction)) problems.push(`person ${p.id}: faction ${p.faction} does not exist`);
    if (!Number.isSafeInteger(p.boldness) || p.boldness < 0 || p.boldness > 1000) problems.push(`person ${p.id}: boldness must be a permille`);
    if (!Number.isSafeInteger(p.regard) || p.regard < -1000 || p.regard > 1000) problems.push(`person ${p.id}: regard must be a signed permille`);
    if (!Number.isSafeInteger(p.intelligenceBias) || p.intelligenceBias < 250 || p.intelligenceBias > 4000) problems.push(`person ${p.id}: intelligence bias must be 250..4000 permille`);
  }
  problems.push(...templateProblems(world.rules.templates), ...latencyProblems(world.rules.latency));
  if (!Number.isSafeInteger(world.rules.marchDays) || world.rules.marchDays < 1) problems.push('marchDays must be a whole number of days, at least 1');
  return problems;
}

/** Validate and index a World. Throws `CommsWorldError` listing every problem. */
export function indexWorld(world: CommsWorld): IndexedWorld {
  const problems = commsWorldProblems(world);
  if (problems.length > 0) throw new CommsWorldError(problems);
  const regions = new Map(world.regions.map((r) => [r.id, r]));
  const posts = new Map(world.posts.map((p) => [p.id, p]));
  const persons = new Map(world.persons.map((p) => [p.id, p]));
  const factions = new Map(world.factions.map((f) => [f.id, f]));
  const holderPost = new Map<PersonId, CommsPost>();
  for (const p of world.posts) if (p.holder !== null) holderPost.set(p.holder, p);
  const regionIds = [...regions.keys()].sort(strictCompare);
  const dist = allPairs(world.regions, regionIds);
  const toWire = new Map<string, number | null>();
  for (const f of factions.keys()) {
    const wired = regionIds.filter((r) => regions.get(r)!.wireOwner === f);
    for (const r of regionIds) toWire.set(key(r, f), wired.length === 0 ? null : Math.min(...wired.map((w) => dist.get(key(r, w)) ?? Number.MAX_SAFE_INTEGER)));
  }
  const get = <K, V>(map: ReadonlyMap<K, V>, kind: string, id: K): V => {
    const v = map.get(id);
    if (v === undefined) throw new RangeError(`unknown ${kind} id "${String(id)}"`);
    return v;
  };
  const courierDays = (from: RegionId, to: RegionId): number => {
    const d = dist.get(key(from, to));
    if (d === undefined) throw new RangeError(`no path from ${from} to ${to}`);
    return d;
  };
  return Object.freeze({
    world,
    rules: world.rules,
    regionIds,
    postIds: [...posts.keys()].sort(strictCompare),
    personIds: [...persons.keys()].sort(strictCompare),
    factionIds: [...factions.keys()].sort(strictCompare),
    region: (id: RegionId) => get(regions, 'region', id),
    post: (id: PostId) => get(posts, 'post', id),
    person: (id: PersonId) => get(persons, 'person', id),
    faction: (id: FactionId) => get(factions, 'faction', id),
    postOf: (person: PersonId) => holderPost.get(person) ?? null,
    courierDays,
    daysToWire: (from: RegionId, faction: FactionId) => {
      const d = toWire.get(key(from, faction));
      if (d === undefined) throw new RangeError(`unknown region or faction: "${from}", "${faction}"`);
      return d;
    },
    nextSteps: (from: RegionId, to: RegionId) => {
      if (from === to) return [];
      const total = courierDays(from, to);
      return get(regions, 'region', from)
        .neighbours.filter((l) => l.days + (dist.get(key(l.to, to)) ?? Number.MAX_SAFE_INTEGER) === total)
        .map((l) => l.to)
        .sort(strictCompare);
    },
    chainBelow: (top: PostId | null, target: PostId) => {
      const up: PostId[] = [];
      for (let p: PostId | null = target; p !== null && p !== top; p = get(posts, 'post', p).superior) up.push(p);
      return up.reverse();
    },
  });
}

function key(a: string, b: string): string {
  return `${a}|${b}`;
}

/** Quickest courier days between every pair of regions (Dijkstra from each, ties broken by id; integers only). */
function allPairs(regions: readonly CommsRegion[], ids: readonly RegionId[]): Map<string, number> {
  const byId = new Map(regions.map((r) => [r.id, r]));
  const out = new Map<string, number>();
  for (const source of ids) {
    const best = new Map<RegionId, number>([[source, 0]]);
    const done = new Set<RegionId>();
    for (;;) {
      let next: RegionId | null = null;
      for (const id of ids) {
        if (done.has(id) || !best.has(id)) continue;
        if (next === null || best.get(id)! < best.get(next)!) next = id;
      }
      if (next === null) break;
      done.add(next);
      for (const link of byId.get(next)!.neighbours) {
        const d = best.get(next)! + link.days;
        if (!best.has(link.to) || d < best.get(link.to)!) best.set(link.to, d);
      }
    }
    for (const [to, d] of best) out.set(key(source, to), d);
  }
  return out;
}
