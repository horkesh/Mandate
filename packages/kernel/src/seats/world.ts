/**
 * The seats layer's World (lane 0.5 replaces lane 0.6's stand-in comms World):
 * lane 0.2's v2 World and a scenario start, indexed once, with the lookups the
 * seats layer reads. Derived from World data, never saved.
 *
 * What lives where now:
 * - **Posts, holders, chains and strengths are State** (`command`, `forces`):
 *   read them through `seats/posts.ts`, never from here.
 * - **Courier days derive from the typed edges** (0052): a courier crosses an
 *   edge in `courierPermille` of a division's days, rounded up, at least one.
 * - **A region's wire owner is its holder** (0052), so wire latency reads the
 *   day's control index (`latencyMapFor`), not a fixed table.
 * - **People's trait inputs** come from a LABELLED STAND-IN (0058) until the
 *   Phase 1 people recast: boldness from the cited `nerve` centre (high 800,
 *   above 650, average 500, below 350, low 200, unknown 500), regard 0, values
 *   empty, no intelligence bias. A caller may hand explicit inputs instead
 *   (`SeatsWorldOptions.traits`); the kernel tests of objections, filter holds
 *   and an intelligence chief's bias do, since v2 people carry none (0058).
 * - **A faction's objective** is the other faction's capital in Phase 0 (0058).
 */
import { strictCompare } from '../compare.ts';
import { wireOwnerOf, type ControlIndex } from '../control-index/control-index.ts';
import type { FactionId, PersonId, RegionId, SituationId } from '../ids.ts';
import { DEFAULT_REPORT_TEMPLATES, templateProblems, type ReportTemplate } from '../knowledge/templates.ts';
import { DEFAULT_LATENCY_RULES, latencyProblems, type LatencyMap, type LatencyRules } from '../messages/latency.ts';
import { situationReferenceProblems } from '../situations/references.ts';
import type { SituationDef } from '../situations/types.ts';
import { DEFAULT_TRAIT_RULES, type TraitHolder, type TraitRules } from '../standin/traits.ts';
import type { StatDirection } from '../world/people.ts';
import { otherEnd, type WorldIndex } from '../world/index.ts';
import type { ScenarioStart } from '../world/scenario.ts';
import type { PostKindRole } from '../world/world.ts';

export interface SeatsRules {
  readonly latency: LatencyRules;
  readonly traits: TraitRules;
  readonly templates: readonly ReportTemplate[];
  /** A courier's days on an edge, permille of a division's (DESIGN PARAMETER: about three times as fast). */
  readonly courierPermille: number;
}

export const DEFAULT_SEATS_RULES: SeatsRules = Object.freeze({
  latency: DEFAULT_LATENCY_RULES,
  traits: DEFAULT_TRAIT_RULES,
  templates: DEFAULT_REPORT_TEMPLATES,
  courierPermille: 333,
});

/** A person as the seats layer reads him: his side, and the stand-in trait inputs (0058). */
export interface SeatPerson extends TraitHolder {
  readonly id: PersonId;
  /** His side at the start (0055); null for foreigners, neutrals and the unknown. */
  readonly faction: FactionId | null;
  /** Multiplier, permille, on enemy strength in the estimates he writes as an intelligence source (1000: none). */
  readonly intelligenceBias: number;
}

/** Explicit trait inputs for a person, in place of the stand-in adapter. */
export interface TraitInputs {
  readonly boldness?: number;
  readonly regard?: number;
  readonly values?: readonly string[];
  readonly intelligenceBias?: number;
}

export interface SeatFaction {
  readonly id: FactionId;
  readonly principal: PersonId;
  /** Where the principal sits: orders start and his reports end here (the start's capital). */
  readonly seatRegion: RegionId;
  /** The other faction's capital, when there are exactly two (0058); null otherwise. */
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
  readonly situations: readonly SituationDef[];
  situation(id: SituationId): SituationDef;
}

export interface SeatsWorldOptions {
  readonly rules?: SeatsRules;
  readonly situations?: readonly SituationDef[];
  /** Explicit trait inputs by person id, in place of the stand-in adapter (0058). */
  readonly traits?: Readonly<Record<string, TraitInputs>>;
}

export class SeatsWorldError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid seats world:\n- ${problems.join('\n- ')}`);
    this.name = 'SeatsWorldError';
  }
}

/** STAND-IN (0058): boldness from the cited `nerve` direction. A design parameter, not a sourced fact. */
export const NERVE_BOLDNESS: Readonly<Record<StatDirection, number>> = Object.freeze({ high: 800, above: 650, average: 500, below: 350, low: 200 });
export const UNKNOWN_NERVE_BOLDNESS = 500;

/** Index a v2 World and its start for the seats layer. Throws `SeatsWorldError` listing every problem. */
export function indexSeatsWorld(map: WorldIndex, start: ScenarioStart, options: SeatsWorldOptions = {}): SeatsWorld {
  const rules = options.rules ?? DEFAULT_SEATS_RULES;
  const problems: string[] = [...templateProblems(rules.templates), ...latencyProblems(rules.latency)];
  if (!Number.isSafeInteger(rules.courierPermille) || rules.courierPermille < 1 || rules.courierPermille > 1000) problems.push('courierPermille must be 1..1000');

  const people = new Map<PersonId, SeatPerson>();
  for (const p of map.world.people) {
    const t = options.traits?.[p.id] ?? {};
    const nerve = p.centres.nerve.direction;
    people.set(p.id, {
      id: p.id,
      faction: p.faction,
      boldness: t.boldness ?? (nerve === null ? UNKNOWN_NERVE_BOLDNESS : NERVE_BOLDNESS[nerve]),
      regard: t.regard ?? 0,
      values: [...(t.values ?? [])],
      intelligenceBias: t.intelligenceBias ?? 1000,
    });
  }
  for (const id of Object.keys(options.traits ?? {})) if (!people.has(id as PersonId)) problems.push(`traits given for ${id}, who is not a person in the World`);

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
  problems.push(
    ...situationReferenceProblems(situations, {
      factions,
      posts: new Map(start.posts.map((p) => [p.id, { faction: map.world.departments.find((d) => d.id === p.department)?.faction ?? '' }])),
      persons: people,
      regions: map.regions,
    }),
  );
  if (problems.length > 0) throw new SeatsWorldError(problems);

  const regionIds = [...map.regions.keys()].sort(strictCompare);
  const courier = courierTable(map, regionIds, rules.courierPermille);
  const roles = new Map(map.world.vocabularies.postKinds.map((k) => [k.id, k.role]));
  const situationById = new Map(situations.map((s) => [s.id, s]));
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
    situations,
    situation: (id: SituationId) => get(situationById, 'situation', id),
  });
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

