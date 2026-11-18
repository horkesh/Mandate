/**
 * The control index (FOUNDATION sections 4 and 10; decisions 0013, 0019): a
 * pure function of the World and a control table. Derived, never saved.
 *
 * The same holding and contact rules apply to the State table and to a
 * seat's claimed shares (0013, 0094).
 *
 * Terms:
 * - a faction **traces** a region when its share reaches the pack's supply
 *   threshold (250 to start, 0019); it may trace supply and rail through it;
 * - a region's **holder** is the faction with the largest share, if that
 *   share reaches the threshold and no other faction's equals it. A region
 *   two factions both trace is **contested**, and its holder is the larger;
 * - a **contact edge** joins regions with different holders;
 * - a **front segment** is a contact edge seen from one side: it belongs to
 *   the faction holding its own end and faces the enemy's end (0013: teeth
 *   facing the enemy). A **front line** is a faction's segments grouped by
 *   front regions that touch along edges inside its territory;
 * - a **component** is a connected group of regions a faction traces;
 * - a region's **wire owner** is its holder (0052; the wire belongs to a
 *   side). Open water and off-map boxes have none.
 *
 * Every list is in code-unit order of its ids (decision 0002).
 */
import { strictCompare } from '../compare.ts';
import { lookup, type EdgeId, type FactionId, type RegionId } from '../ids.ts';
import { otherEnd, type EdgeRecord, type RegionKind } from '../world/graph.ts';
import type { ControlShares, FrontSegment, RegionControlTable } from '../control/vocabulary.ts';

export type { FrontSegment } from '../control/vocabulary.ts';

/** The static map inputs the index and the seat's map need. */
export interface ControlMap {
  readonly world: { readonly rules: { readonly supplyControlPermille: number }; readonly factions: readonly { readonly id: FactionId }[] };
  readonly regions: ReadonlyMap<RegionId, { readonly kind: RegionKind }>;
  readonly edges: ReadonlyMap<EdgeId, EdgeRecord>;
  readonly edgesAt: ReadonlyMap<RegionId, readonly EdgeRecord[]>;
}

export type HoldingReason = 'held' | 'below_threshold' | 'tied' | 'no_control' | 'open_water' | 'off_map';

/**
 * Who holds a region, and why (hard rule 6). It carries only what the derived
 * map's cache key determines (bands and holder), so a cached index is never
 * stale; the exact shares behind it come from `rankShares`, read fresh.
 */
export interface RegionHolding {
  readonly region: RegionId;
  readonly holder: FactionId | null;
  readonly reason: HoldingReason;
  /** Every faction that traces it (share at or above the threshold). */
  readonly tracedBy: readonly FactionId[];
}

/** A region's shares, largest first (ties by faction id): the terms behind its holding. */
export function rankShares(control: RegionControlTable, region: RegionId): { readonly faction: FactionId; readonly permille: number }[] {
  return rankedShares(Object.hasOwn(control, region) ? control[region]! : {});
}

function rankedShares(shares: ControlShares) {
  return (Object.keys(shares) as FactionId[])
    .map((faction) => ({ faction, permille: shares[faction]! }))
    .filter((s) => s.permille > 0)
    .sort((x, y) => y.permille - x.permille || strictCompare(x.faction, y.faction));
}

export interface ContactEdge {
  readonly edge: EdgeId;
  readonly a: RegionId;
  readonly b: RegionId;
  readonly holderA: FactionId;
  readonly holderB: FactionId;
}

export interface FrontLine {
  /** `front:<faction>:<first own region>`, stable while the line's regions are. */
  readonly id: string;
  readonly faction: FactionId;
  /** The faction's front regions on this line. */
  readonly regions: readonly RegionId[];
  readonly segments: readonly FrontSegment[];
  readonly enemies: readonly FactionId[];
}

export interface Component {
  /** `component:<faction>:<first region>`. */
  readonly id: string;
  readonly faction: FactionId;
  readonly regions: readonly RegionId[];
}

export interface WireOwner {
  readonly region: RegionId;
  readonly owner: FactionId | null;
  readonly reason: HoldingReason;
}

export interface ControlIndex {
  /** The threshold used (the pack's supply permille). */
  readonly threshold: number;
  readonly factions: readonly FactionId[];
  readonly holdings: ReadonlyMap<RegionId, RegionHolding>;
  /** Regions each faction traces, in id order. */
  readonly traced: ReadonlyMap<FactionId, readonly RegionId[]>;
  readonly contested: readonly RegionId[];
  readonly contactEdges: readonly ContactEdge[];
  readonly fronts: ReadonlyMap<FactionId, readonly FrontLine[]>;
  readonly components: ReadonlyMap<FactionId, readonly Component[]>;
}

export function buildControlIndex(map: ControlMap, control: RegionControlTable): ControlIndex {
  const threshold = map.world.rules.supplyControlPermille;
  const factions = map.world.factions.map((f) => f.id).sort(strictCompare);
  const regionIds = [...map.regions.keys()].sort(strictCompare);
  const holdings = new Map<RegionId, RegionHolding>();
  const traced = new Map<FactionId, RegionId[]>(factions.map((f) => [f, []]));
  const contested: RegionId[] = [];
  for (const id of regionIds) {
    const h = holdingOf(map, control, id, threshold);
    holdings.set(id, h);
    for (const f of h.tracedBy) traced.get(f)!.push(id);
    if (h.tracedBy.length > 1) contested.push(id);
  }

  const contactEdges = contactEdgesOf(map, holdings);
  const fronts = new Map<FactionId, FrontLine[]>();
  const components = new Map<FactionId, Component[]>();
  for (const f of factions) {
    fronts.set(f, frontLines(map, holdings, f, frontSegmentsFor(contactEdges, f)));
    components.set(f, componentsOf(map, new Set(traced.get(f)!), f));
  }

  return { threshold, factions, holdings, traced, contested, contactEdges, fronts, components };
}

function contactEdgesOf(map: ControlMap, holdings: ReadonlyMap<RegionId, Pick<RegionHolding, 'holder'>>): ContactEdge[] {
  const edges = [...map.edges.values()].sort((x, y) => strictCompare(x.id, y.id));
  const contacts: ContactEdge[] = [];
  for (const e of edges) {
    const ha = holdings.get(e.a)?.holder ?? null;
    const hb = holdings.get(e.b)?.holder ?? null;
    if (ha !== null && hb !== null && ha !== hb) contacts.push({ edge: e.id, a: e.a, b: e.b, holderA: ha, holderB: hb });
  }
  return contacts;
}

function frontSegmentsFor(contacts: readonly ContactEdge[], faction: FactionId): FrontSegment[] {
  const segments: FrontSegment[] = [];
  for (const c of contacts) {
    if (c.holderA === faction) segments.push({ faction, edge: c.edge, own: c.a, faces: c.b, enemy: c.holderB });
    if (c.holderB === faction) segments.push({ faction, edge: c.edge, own: c.b, faces: c.a, enemy: c.holderA });
  }
  return segments;
}

/** The same oriented segments as the full index, without grouping lines or building supply components. */
export function frontSegmentsOf(map: ControlMap, holdings: ReadonlyMap<RegionId, Pick<RegionHolding, 'holder'>>): FrontSegment[] {
  if (holdings.size === 0) return [];
  const contacts = contactEdgesOf(map, holdings);
  return map.world.factions.map((f) => f.id).sort(strictCompare).flatMap((f) => frontSegmentsFor(contacts, f));
}

/** One region's holding. */
export function holdingOf(map: ControlMap, control: RegionControlTable, region: RegionId, threshold: number): RegionHolding {
  const record = lookup('region', map.regions, region);
  const empty = (reason: HoldingReason): RegionHolding => ({ region, holder: null, reason, tracedBy: [] });
  if (record.kind === 'river' || record.kind === 'sea') return empty('open_water');
  if (record.kind === 'off_map') return empty('off_map');
  return holdingFromShares(region, Object.hasOwn(control, region) ? control[region]! : {}, threshold);
}

/** A land holding from its share vector, whether reported or in State. */
export function holdingFromShares(region: RegionId, shares: ControlShares, threshold: number): RegionHolding {
  const ranked = rankedShares(shares);
  const top = ranked[0] ?? null;
  const runnerUp = ranked[1] ?? null;
  const tracedBy = ranked.filter((s) => s.permille >= threshold).map((s) => s.faction).sort(strictCompare);
  if (top === null) return { region, holder: null, reason: 'no_control', tracedBy };
  if (top.permille < threshold) return { region, holder: null, reason: 'below_threshold', tracedBy };
  if (runnerUp !== null && runnerUp.permille === top.permille) return { region, holder: null, reason: 'tied', tracedBy };
  return { region, holder: top.faction, reason: 'held', tracedBy };
}

/** A region's wire owner: its holder (0052). */
export function wireOwnerOf(index: ControlIndex, region: RegionId): WireOwner {
  const h = lookup('region', index.holdings, region);
  return { region, owner: h.holder, reason: h.reason };
}

/** Whether `faction` traces `region` (may trace supply and rail through it). */
export function traces(index: ControlIndex, faction: FactionId, region: RegionId): boolean {
  return lookup('region', index.holdings, region).tracedBy.includes(faction);
}

/**
 * Group a faction's segments into lines. Two segments are on one line when
 * their own ends are the same region or touch inside the faction's territory,
 * or their faced ends are the same region or touch inside the enemy's: a
 * front around an enemy salient is one line, though the friendly regions
 * around it need not touch each other.
 */
function frontLines(map: ControlMap, holdings: ReadonlyMap<RegionId, RegionHolding>, faction: FactionId, segments: readonly FrontSegment[]): FrontLine[] {
  const parent = segments.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) i = parent[i] = parent[parent[i]!]!;
    return i;
  };
  const union = (i: number, j: number) => {
    const a = find(i);
    const b = find(j);
    if (a !== b) parent[Math.max(a, b)] = Math.min(a, b);
  };
  const byOwn = new Map<RegionId, number[]>();
  const byFaced = new Map<RegionId, number[]>();
  segments.forEach((s, i) => {
    byOwn.set(s.own, [...(byOwn.get(s.own) ?? []), i]);
    byFaced.set(s.faces, [...(byFaced.get(s.faces) ?? []), i]);
  });
  const touching = (region: RegionId, side: ReadonlyMap<RegionId, number[]>, holder: FactionId) =>
    [region, ...map.edgesAt.get(region)!.map((e) => otherEnd(e, region)).filter((n) => holdings.get(n)!.holder === holder)].flatMap((n) => side.get(n) ?? []);
  segments.forEach((s, i) => {
    for (const j of touching(s.own, byOwn, faction)) union(i, j);
    for (const j of touching(s.faces, byFaced, s.enemy)) if (segments[j]!.enemy === s.enemy) union(i, j);
  });
  const groups = new Map<number, FrontSegment[]>();
  segments.forEach((s, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), s]));
  return [...groups.values()]
    .map((group) => {
      const own = [...group].sort((x, y) => strictCompare(x.own, y.own) || strictCompare(x.edge, y.edge));
      const regions = [...new Set(own.map((s) => s.own))].sort(strictCompare);
      return { id: `front:${faction}:${regions[0]!}`, faction, regions, segments: own, enemies: [...new Set(own.map((s) => s.enemy))].sort(strictCompare) };
    })
    .sort((x, y) => strictCompare(x.regions[0]!, y.regions[0]!));
}
function componentsOf(map: ControlMap, traced: ReadonlySet<RegionId>, faction: FactionId): Component[] {
  const regions = [...traced].sort(strictCompare);
  const groups = connectedGroups(regions, (r) => map.edgesAt.get(r)!.map((e: EdgeRecord) => otherEnd(e, r)).filter((n) => traced.has(n)));
  return groups.map((g) => ({ id: `component:${faction}:${g[0]!}`, faction, regions: g }));
}

/** Connected groups of `nodes` under `neighbours`, each sorted, the groups ordered by their first member. */
export function connectedGroups(nodes: readonly RegionId[], neighbours: (r: RegionId) => readonly RegionId[]): RegionId[][] {
  const seen = new Set<RegionId>();
  const groups: RegionId[][] = [];
  for (const start of [...nodes].sort(strictCompare)) {
    if (seen.has(start)) continue;
    const group: RegionId[] = [];
    const stack = [start];
    seen.add(start);
    while (stack.length > 0) {
      const r = stack.pop()!;
      group.push(r);
      for (const n of neighbours(r)) {
        if (!seen.has(n)) {
          seen.add(n);
          stack.push(n);
        }
      }
    }
    groups.push(group.sort(strictCompare));
  }
  return groups.sort((x, y) => strictCompare(x[0]!, y[0]!));
}
