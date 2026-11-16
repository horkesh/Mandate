/**
 * The seats layer's World (lane 0.5 replaces lane 0.6's stand-in comms World):
 * lane 0.2's v2 World and a scenario start, indexed once, with the lookups the
 * seats layer reads. Derived from World data, never saved.
 *
 * What lives where now:
 * - **Posts, holders, chains and strengths are State** (`command`, `forces`):
 *   read them through `seats/posts.ts`, never from here.
 * - **Courier days derive from the typed edges** (0052): a courier crosses an
 *   edge in the pack's courier fraction of a division's days (`WorldRules.movement.courierPermille`),
 *   rounded up, at least one.
 * - **A region's wire owner is its holder** (0052), so wire latency reads the
 *   day's control index (`latencyMapFor`), not a fixed table.
 * - **People's trait inputs are people State** (lane 1.1 retired lane 0.6's
 *   stand-in adapter, 0058): read a man through `traitsOf(world, state, id)`
 *   (`people/traits.ts`), never from here. This World keeps only a person's
 *   side at the start.
 * - **A faction's objective** is a LABELLED STAND-IN (0058): the other
 *   faction's capital, when there are exactly two. Its replacement is the
 *   goals of Phase 1's principals (0058, 0072).
 */
import { strictCompare } from '../compare.ts';
import { wireOwnerOf, type ControlIndex } from '../control-index/control-index.ts';
import type { FactionId, PersonId, PostId, RegionId, SituationId } from '../ids.ts';
import { templateProblems, type ReportTemplate } from '../knowledge/templates.ts';
import { latencyProblems, type LatencyMap, type LatencyRules } from '../messages/latency.ts';
import type { PlannerRules, PlansRules, StandingRules } from '../world/world.ts';
import { situationReferenceProblems } from '../situations/references.ts';
import type { SituationDef } from '../situations/types.ts';
import { peopleRulesProblems, type PeopleRules, type TraitRules } from '../people/rules.ts';
import { verbRulesProblems } from '../people/verb-rules.ts';
import { otherEnd, type WorldIndex } from '../world/index.ts';
import type { ScenarioStart } from '../world/scenario.ts';
import type { PostKindRole } from '../world/world.ts';

/**
 * The rules the seats layer reads, all the pack's (`WorldRules`, 0072), read from the World it was indexed with, never
 * a kernel default: latency, report templates, and the people rules (lane 1.1), whose trait rules (`traits`) replaced
 * lane 0.6's labelled stand-in (0058).
 */
export interface SeatsRules {
  readonly latency: LatencyRules;
  readonly traits: TraitRules;
  readonly people: PeopleRules;
  readonly templates: readonly ReportTemplate[];
}

/** A person as the seats layer's World knows him: his side at the start. His traits are people State (`traitsOf`). */
export interface SeatPerson {
  readonly id: PersonId;
  /** His side at the start (0055); null for foreigners, neutrals and the unknown. */
  readonly faction: FactionId | null;
}

export interface SeatFaction {
  readonly id: FactionId;
  readonly principal: PersonId;
  /** Where the principal sits: orders start and his reports end here (the start's capital). */
  readonly seatRegion: RegionId;
  /** STAND-IN (0058): the other faction's capital, when there are exactly two; null otherwise. */
  readonly objective: RegionId | null;
}

export interface SeatsWorld {
  readonly map: WorldIndex;
  /** The scenario start it was indexed with: the game `createState` begins. */
  readonly start: ScenarioStart;
  readonly rules: SeatsRules;
  readonly regionIds: readonly RegionId[];
  readonly personIds: readonly PersonId[];
  /** Factions with a principal, the ones the seats layer asks. */
  readonly factionIds: readonly FactionId[];
  person(id: PersonId): SeatPerson;
  faction(id: FactionId): SeatFaction;
  /** A post kind's role (0058): the engine reads only this, never the pack's kind names. */
  roleOf(kind: string): PostKindRole | null;
  /** Courier days between two regions along the quickest path. Throws if unreachable. */
  courierDays(from: RegionId, to: RegionId): number;
  /** Regions a commander watches: where he stands and every neighbour across an edge, in id order. */
  watched(region: RegionId): readonly RegionId[];
  /**
   * Where a post's headquarters stood at the start of play: its strongest directly commanded block in the start (by
   * known men, ties by block id, as `headquartersOf` reads State), or null when the start gave it no block. Pack data,
   * so a principal may be told it; where the post's headquarters is today he may not (exit review P2).
   */
  startHeadquarters(post: PostId): RegionId | null;
  readonly situations: readonly SituationDef[];
  situation(id: SituationId): SituationDef;
}

export interface SeatsWorldOptions {
  readonly situations?: readonly SituationDef[];
}

export class SeatsWorldError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid seats world:\n- ${problems.join('\n- ')}`);
    this.name = 'SeatsWorldError';
  }
}


/** Index a v2 World and its start for the seats layer. Throws `SeatsWorldError` listing every problem. */
export function indexSeatsWorld(map: WorldIndex, start: ScenarioStart, options: SeatsWorldOptions = {}): SeatsWorld {
  const pack = map.world.rules;
  const rules: SeatsRules = Object.freeze({ latency: pack.latency, templates: pack.reportTemplates, traits: pack.people?.traits, people: pack.people });
  // The kernel takes any World it is handed (a fixture, an adapter), so it checks the pack's rules as the validator does.
  const problems: string[] = [
    ...templateProblems(rules.templates),
    ...latencyProblems(rules.latency),
    ...standingProblems(pack.standing),
    ...peopleRulesProblems(pack.people, map.world.vocabularies.values?.map((v) => v.id) ?? []),
    // Lane 1.5: attention, the order-to-value map, the verbs, the ladder, the audience and initiatives.
    ...verbRulesProblems(pack.people?.attention, pack.people?.verbs, map.world.vocabularies.values?.map((v) => v.id) ?? [], map.world.vocabularies.personKinds.map((k) => k.id)),
    ...plannerRuleProblems(pack.planner, pack.plans),
  ];

  const people = new Map<PersonId, SeatPerson>();
  for (const p of map.world.people) people.set(p.id, { id: p.id, faction: p.faction });

  const capitals = start.factions.filter((f) => f.capital !== null);
  const factions = new Map<FactionId, SeatFaction>();
  for (const f of start.factions) {
    if (f.principal === null) continue;
    if (f.capital === null) {
      problems.push(`faction ${f.faction}: a principal needs a capital to sit in`);
      continue;
    }
    if (people.get(f.principal)?.faction !== f.faction) problems.push(`faction ${f.faction}: principal ${f.principal} is not one of its people`);
    const other = capitals.length === 2 ? capitals.find((c) => c.faction !== f.faction)!.capital : null;
    factions.set(f.faction, { id: f.faction, principal: f.principal, seatRegion: f.capital, objective: other });
  }

  const situations = [...(options.situations ?? [])].sort((a, b) => strictCompare(a.id, b.id));
  // Each start post's side at the start, through its department: null for a neutral government's post. A department not
  // in the World is a problem, never a side of '' (exit review P4; FOUNDATION 11.3: an unknown lookup throws).
  const postSides = new Map<string, { readonly faction: FactionId | null }>();
  for (const p of start.posts) {
    const d = map.world.departments.find((x) => x.id === p.department);
    if (d === undefined) problems.push(`post ${p.id}: department ${p.department} is not in the World`);
    else postSides.set(p.id, { faction: d.faction });
  }
  problems.push(
    ...situationReferenceProblems(situations, {
      factions,
      posts: postSides,
      persons: people,
      regions: map.regions,
    }),
  );
  if (problems.length > 0) throw new SeatsWorldError(problems);

  const regionIds = [...map.regions.keys()].sort(strictCompare);
  const courier = courierTable(map, regionIds, map.world.rules.movement.courierPermille);
  const roles = new Map(map.world.vocabularies.postKinds.map((k) => [k.id, k.role]));
  const situationById = new Map(situations.map((s) => [s.id, s]));
  const startBody = new Map<PostId, { readonly region: RegionId; readonly men: number }>();
  for (const b of [...start.forceBlocks].sort((x, y) => strictCompare(x.id, y.id))) {
    if (b.post === null) continue;
    const men = b.strength ?? 0;
    const best = startBody.get(b.post);
    if (best === undefined || men > best.men) startBody.set(b.post, { region: b.region, men });
  }
  const get = <K, V>(m: ReadonlyMap<K, V>, kind: string, id: K): V => {
    const v = m.get(id);
    if (v === undefined) throw new RangeError(`unknown ${kind} id "${String(id)}"`);
    return v;
  };
  return Object.freeze({
    map,
    start,
    rules,
    regionIds,
    personIds: [...people.keys()].sort(strictCompare),
    factionIds: [...factions.keys()].sort(strictCompare),
    person: (id: PersonId) => get(people, 'person', id),
    faction: (id: FactionId) => get(factions, 'faction', id),
    roleOf: (kind: string) => roles.get(kind) ?? null,
    courierDays: (from: RegionId, to: RegionId) => {
      const d = courier.get(`${from}|${to}`);
      if (d === undefined) throw new RangeError(`no courier path from ${from} to ${to}`);
      return d;
    },
    watched: (region: RegionId) => [region, ...(map.edgesAt.get(region) ?? []).map((e) => otherEnd(e, region))].filter((r, i, all) => all.indexOf(r) === i).sort(strictCompare),
    startHeadquarters: (post: PostId) => startBody.get(post)?.region ?? null,
    situations,
    situation: (id: SituationId) => get(situationById, 'situation', id),
  });
}

/** Problems with the conflicting-orders rule (0072): a conflict window of at least a day. */
export function standingProblems(rules: StandingRules): string[] {
  const problems: string[] = [];
  if (!Number.isSafeInteger(rules.conflictWindowDays) || rules.conflictWindowDays < 1) problems.push('standing rule conflictWindowDays must be a whole number of days, at least 1');
  return problems;
}

/**
 * Problems with the planner's and plans' rules (lane 1.2), as the validator checks them: whole numbers, divisors of
 * at least 1 (a weight of 0 would divide by zero), permilles in range, and at least one draft a day.
 */
export function plannerRuleProblems(planner: PlannerRules, plans: PlansRules): string[] {
  const problems: string[] = [];
  const whole = (name: string, v: number, min: number) => {
    if (!Number.isSafeInteger(v) || v < min) problems.push(`planner rule ${name} must be a whole number, at least ${min}`);
  };
  for (const k of ['hopShare', 'menPerDay', 'flankOverlapMax', 'flankLengthMax', 'flankPenalty', 'dedupeOverlap', 'topN', 'maxSearches', 'dailyDraftCap'] as const) whole(k, planner[k], 1);
  for (const k of ['retrogradeSlack', 'dedupeArrival', 'reducePerLevel', 'clearDays', 'forceDays', 'forcingThreat', 'assaultDays', 'pincerWindow', 'dependenceCost', 'partnerWillingnessWeight', 'partnerRegardWeight', 'partnerStandingWeight', 'partnerStandingPivot'] as const) whole(k, planner[k], 0);
  if (Number.isSafeInteger(planner.partnerStandingPivot) && planner.partnerStandingPivot > 1000) problems.push('planner rule partnerStandingPivot must be a permille');
  const w = planner.weights;
  for (const k of ['concentrationPerTimid', 'pausePerTimid', 'ratioBonusDivisor', 'earlyDivisor', 'hasteDivisor', 'supplyDivisor', 'outrunDivisor', 'exposureDivisor', 'coordinationDivisor', 'gloryDivisor', 'cautionDivisor'] as const) whole(`weights.${k}`, w[k], 1);
  for (const k of ['ratioPenaltyMax'] as const) whole(`weights.${k}`, w[k], 1);
  for (const k of ['riskBase', 'supplyBase', 'twoAxesAt', 'threeAxesAt', 'goalFit', 'ratioBonusMax', 'latePenaltyMax', 'latePerDay', 'earlyBonusMax', 'traitBase', 'perExtraAxis'] as const) whole(`weights.${k}`, w[k], 0);
  if (!Number.isSafeInteger(w.holdingTime)) problems.push('planner rule weights.holdingTime must be a whole number');
  const d = plans.goalDefaults;
  if (!Number.isSafeInteger(d.risk) || d.risk < 0 || d.risk > 1000) problems.push('plans rule goalDefaults.risk must be a permille');
  if (!Number.isSafeInteger(d.deadlineDays) || d.deadlineDays < 1) problems.push('plans rule goalDefaults.deadlineDays must be a whole number of days, at least 1');
  if (!Number.isSafeInteger(plans.holdingRisk)) problems.push('plans rule holdingRisk must be a whole number');
  return problems;
}

/** A courier's whole days across one edge: `courierPermille` of a division's, rounded up, at least one. */
export function courierEdgeDays(lengthDays: number, courierPermille: number): number {
  return Math.max(1, Math.trunc((lengthDays * courierPermille + 999) / 1000));
}

/** Quickest courier days between every pair of regions (Dijkstra from each over every edge, off-map boxes included). */
function courierTable(map: WorldIndex, ids: readonly RegionId[], courierPermille: number): Map<string, number> {
  const out = new Map<string, number>();
  for (const source of ids) {
    const best = new Map<RegionId, number>([[source, 0]]);
    const done = new Set<RegionId>();
    for (;;) {
      let next: RegionId | null = null;
      for (const [id, d] of best) {
        if (done.has(id)) continue;
        if (next === null || d < best.get(next)! || (d === best.get(next)! && id < next)) next = id;
      }
      if (next === null) break;
      done.add(next);
      for (const edge of map.edgesAt.get(next) ?? []) {
        const to = otherEnd(edge, next);
        const days = best.get(next)! + courierEdgeDays(Math.min(edge.lengthDays, edge.lengthDaysBA ?? edge.lengthDays), courierPermille);
        if (!best.has(to) || days < best.get(to)!) best.set(to, days);
      }
    }
    for (const [to, d] of best) out.set(`${source}|${to}`, d);
  }
  return out;
}

/**
 * Latency on today's map: courier days from the typed edges, and the wire of
 * whoever holds each region (0052: the wire belongs to a side). Build one per
 * tick from the morning's control index.
 */
export function latencyMapFor(world: SeatsWorld, index: ControlIndex): LatencyMap {
  const wired = new Map<FactionId, RegionId[]>();
  for (const region of world.regionIds) {
    const owner = wireOwnerOf(index, region).owner;
    if (owner === null) continue;
    const list = wired.get(owner) ?? [];
    list.push(region);
    wired.set(owner, list);
  }
  return {
    courierDays: (from, to) => world.courierDays(from, to),
    daysToWire: (from, faction) => {
      const list = wired.get(faction);
      if (list === undefined || list.length === 0) return null;
      let best: number | null = null;
      for (const r of list) {
        const d = world.courierDays(from, r);
        if (best === null || d < best) best = d;
      }
      return best;
    },
    region: (id) => ({ wireOwner: wireOwnerOf(index, id).owner }),
  };
}

/** The post kinds the World names, by role (a filter post's kinds, an intelligence post's). */
export function kindsWithRole(world: SeatsWorld, role: PostKindRole): readonly string[] {
  return world.map.world.vocabularies.postKinds.filter((k) => k.role === role).map((k) => k.id);
}

