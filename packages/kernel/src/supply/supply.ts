/**
 * Supply (FOUNDATION sections 4 and 10; decisions 0019, 0029): a path with
 * capacity from a source, traced along friendly edges, readable as "the line
 * to X is open" or "cut at Y". Derived, never saved: a pure function of the
 * World, the control index, the month and the network's condition.
 *
 * The model, stated so it can be checked:
 * - **Origins.** A source supplies whoever traces its region. A forward depot
 *   supplies only while a source's path reaches it; its capacity is the
 *   smaller of its own and that feed's. Days are counted from the nearest
 *   origin, since wagons haul from the depot, not from the source.
 * - **Passage.** A faction passes a land region or key point it traces (its
 *   share at or above the supply threshold, 250 to start), any river or sea
 *   region (open water is no one's; blockade is Phase 1), and never an
 *   off-map box. An edge is usable if both ends are passable, its capacity is
 *   above zero, and no obstruction closes it to the faction.
 * - **Obstructions.** Works or batteries named by an installation close the
 *   edge to everyone but the holder of the installation's region; unmanned
 *   works (no holder) close nothing. Works not modelled as an installation (a
 *   boom, hulks) close the edge to everyone.
 * - **Seasons** (0029). Each season window active in the month applies the
 *   pack's effect for its reason to length and capacity. Edge condition
 *   (1000 = intact) scales capacity; 0 cuts the edge.
 * - **Units.** Days are permille days and capacity is permille of the pack's
 *   capacity scale, so a season's effect never rounds away (decision 0002:
 *   integers only, one truncation rule).
 * - **Choice of path.** Fewest days, then the larger capacity. Both are exact:
 *   the key (days, capacity) is monotone along a path, so Dijkstra finds the
 *   best. Ties beyond them are broken where two paths first meet, by the
 *   smaller origin id, then the smaller edge id: deterministic, but local, so
 *   the final path is not always the one from the globally smallest origin
 *   (a test pins such a case). Paths are then served in the order of the
 *   demands (`allocateInPriorityOrder`).
 *
 * Every path carries its legs and each leg its effects (hard rule 6).
 */
import { strictCompare } from '../compare.ts';
import { lookup, type DepotId, type EdgeId, type FactionId, type InstallationId, type RailLineId, type RegionId } from '../ids.ts';
import type { EdgeRecord, EdgeType, SeasonReason } from '../world/graph.ts';
import { edgeDays, otherEnd, type WorldIndex } from '../world/index.ts';
import { connectedGroups, type ControlIndex } from '../control-index/control-index.ts';
import { MinHeap } from '../heap.ts';

/** The network's condition: State written by `infrastructure` (lane 0.5). Absent entries are intact. */
export interface NetworkConditions {
  /** Edge condition, permille (1000 intact, 0 cut). */
  readonly edgeCondition: Readonly<Record<EdgeId, number>>;
  /** Depot condition, permille. */
  readonly depotCondition: Readonly<Record<DepotId, number>>;
  /** Water edges obstructed, by an installation's works or by works not modelled (`by: null`). */
  readonly obstructions: readonly { readonly edge: EdgeId; readonly by: InstallationId | null }[];
  /**
   * Neutral ground (0055, 0058): each land region whose civil government is a department
   * of no faction, and whether that government has its territory open or closed. Built from
   * `command`'s governments and closing flags. A region absent here is not neutral ground
   * (its government is a side's, or unknown). Absent or empty: no neutral passage.
   */
  readonly neutralGround?: Readonly<Record<RegionId, 'open' | 'closed'>>;
}

export const INTACT_NETWORK: NetworkConditions = Object.freeze({ edgeCondition: Object.freeze({}), depotCondition: Object.freeze({}), obstructions: Object.freeze([]) });

/**
 * Network conditions from lists shaped like a scenario start's (0050): edge
 * and depot conditions and obstructions. Lane 0.5's `infrastructure` State
 * will hold these lists; until then tests read a start's through this.
 */
export function networkConditions(parts: {
  readonly edgeConditions: readonly { readonly edge: EdgeId; readonly conditionPermille: number }[];
  readonly depotConditions: readonly { readonly depot: DepotId; readonly conditionPermille: number }[];
  readonly obstructions: readonly { readonly edge: EdgeId; readonly by: InstallationId | null }[];
}): NetworkConditions {
  const edgeCondition: Record<EdgeId, number> = {};
  for (const c of [...parts.edgeConditions].sort((a, b) => strictCompare(a.edge, b.edge))) edgeCondition[c.edge] = c.conditionPermille;
  const depotCondition: Record<DepotId, number> = {};
  for (const c of [...parts.depotConditions].sort((a, b) => strictCompare(a.depot, b.depot))) depotCondition[c.depot] = c.conditionPermille;
  const obstructions = parts.obstructions.map((o) => ({ edge: o.edge, by: o.by })).sort((a, b) => strictCompare(a.edge, b.edge) || strictCompare(a.by ?? '', b.by ?? ''));
  return { edgeCondition, depotCondition, obstructions };
}

export type EdgeEffect =
  | { readonly kind: 'season'; readonly reason: SeasonReason; readonly lengthPermille: number; readonly capacityPermille: number }
  | { readonly kind: 'condition'; readonly conditionPermille: number };

/** One edge crossed in one direction this month, with what changed it. */
export interface EdgeLeg {
  readonly edge: EdgeId;
  readonly from: RegionId;
  readonly to: RegionId;
  readonly type: EdgeType;
  readonly line: RailLineId | null;
  readonly breakOfBulk: boolean;
  readonly baseDays: number;
  readonly baseCapacity: number;
  readonly daysPermille: number;
  readonly capacityMilli: number;
  readonly effects: readonly EdgeEffect[];
}

export type OriginTerm =
  | { readonly kind: 'base'; readonly capacityMilli: number }
  | { readonly kind: 'condition'; readonly conditionPermille: number }
  | { readonly kind: 'feed'; readonly source: DepotId; readonly daysPermille: number; readonly capacityMilli: number };

export interface SupplyOrigin {
  readonly depot: DepotId;
  readonly kind: 'source' | 'depot';
  readonly region: RegionId;
  readonly capacityMilli: number;
  readonly terms: readonly OriginTerm[];
}

export interface SupplyPath {
  readonly faction: FactionId;
  readonly region: RegionId;
  readonly origin: DepotId;
  readonly daysPermille: number;
  readonly capacityMilli: number;
  /** What sets the capacity: the origin, or the narrowest edge. */
  readonly bottleneck: { readonly kind: 'origin'; readonly id: DepotId } | { readonly kind: 'edge'; readonly id: EdgeId };
  readonly legs: readonly EdgeLeg[];
  /** Rail lines used, in the order travelled, each once. */
  readonly lines: readonly RailLineId[];
  readonly breaksOfBulk: number;
}

export type CutReason = 'not_traced' | 'off_map' | 'edge_cut' | 'obstructed' | 'no_origin';

/** Where a pocket's line is cut: the first thing on the shortest way in that the faction cannot pass. */
export interface Cut {
  readonly why: CutReason;
  readonly region: RegionId | null;
  readonly edge: EdgeId | null;
  /** The installation whose works obstruct, for `obstructed`. */
  readonly by: InstallationId | null;
}

/** A connected group of regions a faction traces, none with a supply path. */
export interface Pocket {
  /** `pocket:<faction>:<first region>`. */
  readonly id: string;
  readonly faction: FactionId;
  readonly regions: readonly RegionId[];
  readonly cut: Cut | null;
}

export interface FactionSupply {
  readonly faction: FactionId;
  readonly origins: readonly SupplyOrigin[];
  /** A path for every traced land region that has one. */
  readonly paths: ReadonlyMap<RegionId, SupplyPath>;
  readonly pockets: readonly Pocket[];
}

export interface SupplyResult {
  readonly month: number;
  readonly factions: ReadonlyMap<FactionId, FactionSupply>;
}

export class SupplyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupplyError';
  }
}

/** Why an edge is closed to a faction by an obstruction, or null. */
export function obstructionFor(map: WorldIndex, index: ControlIndex, network: NetworkConditions, edge: EdgeId, faction: FactionId): { readonly by: InstallationId | null } | null {
  for (const o of network.obstructions) {
    if (o.edge !== edge) continue;
    if (o.by === null) return { by: null };
    const installation = map.world.installations.find((i) => i.id === o.by);
    if (!installation) throw new SupplyError(`obstruction on ${edge}: installation ${o.by} is not in the World`);
    const holder = lookup('region', index.holdings, installation.region).holder;
    if (holder !== null && holder !== faction) return { by: o.by };
  }
  return null;
}

/** An edge crossed from `from` in `month`, with season and condition applied. */
export function edgeLeg(map: WorldIndex, edge: EdgeRecord, from: RegionId, month: number, network: NetworkConditions): EdgeLeg {
  const baseDays = edgeDays(edge, from);
  let daysPermille = baseDays * 1000;
  let capacityMilli = edge.capacity * 1000;
  const effects: EdgeEffect[] = [];
  for (const w of edge.seasons) {
    if (!w.months.includes(month)) continue;
    const rule = map.world.rules.seasons.find((s) => s.reason === w.reason);
    if (!rule) throw new SupplyError(`edge ${edge.id}: the pack has no season rule for ${w.reason}`);
    daysPermille = Math.trunc((daysPermille * rule.lengthPermille) / 1000);
    capacityMilli = Math.trunc((capacityMilli * rule.capacityPermille) / 1000);
    effects.push({ kind: 'season', reason: w.reason, lengthPermille: rule.lengthPermille, capacityPermille: rule.capacityPermille });
  }
  const condition = network.edgeCondition[edge.id] ?? 1000;
  if (condition !== 1000) {
    capacityMilli = Math.trunc((capacityMilli * condition) / 1000);
    effects.push({ kind: 'condition', conditionPermille: condition });
  }
  return {
    edge: edge.id,
    from,
    to: otherEnd(edge, from),
    type: edge.type,
    line: edge.line,
    breakOfBulk: edge.breakOfBulk,
    baseDays,
    baseCapacity: edge.capacity,
    daysPermille,
    capacityMilli,
    effects,
  };
}

interface Label {
  readonly region: RegionId;
  readonly daysPermille: number;
  readonly capacityMilli: number;
  readonly origin: DepotId;
  readonly leg: EdgeLeg | null;
  readonly bottleneck: SupplyPath['bottleneck'];
}

function better(a: Label, b: Label): boolean {
  if (a.daysPermille !== b.daysPermille) return a.daysPermille < b.daysPermille;
  if (a.capacityMilli !== b.capacityMilli) return a.capacityMilli > b.capacityMilli;
  if (a.origin !== b.origin) return a.origin < b.origin;
  return (a.leg?.edge ?? '') < (b.leg?.edge ?? '');
}

/** Everything one derivation needs, with edge legs memoised for the month. */
interface Ctx {
  readonly map: WorldIndex;
  readonly index: ControlIndex;
  readonly month: number;
  readonly network: NetworkConditions;
  readonly legs: Map<string, EdgeLeg>;
}

function legOf(ctx: Ctx, edge: EdgeRecord, from: RegionId): EdgeLeg {
  const key = `${edge.id}|${from}`;
  let leg = ctx.legs.get(key);
  if (!leg) {
    leg = edgeLeg(ctx.map, edge, from, ctx.month, ctx.network);
    ctx.legs.set(key, leg);
  }
  return leg;
}

/**
 * Neutral passage (0055, 0058): a land region or key point no side traces is open
 * to every side, as open water is, when its government is a neutral one that has
 * not closed it. A region whose government is unknown is not neutral ground.
 */
export function neutralOpen(holding: { readonly region: RegionId; readonly tracedBy: readonly FactionId[] }, network: NetworkConditions): boolean {
  return holding.tracedBy.length === 0 && network.neutralGround?.[holding.region] === 'open';
}

/** Whether a region is a neutral government's territory, closed to every side (0055, 0058). */
export function neutralClosed(holding: { readonly region: RegionId; readonly tracedBy: readonly FactionId[] }, network: NetworkConditions): boolean {
  return holding.tracedBy.length === 0 && network.neutralGround?.[holding.region] === 'closed';
}

/** Why a faction cannot pass a region, or null if it can. */
function regionBar(ctx: Ctx, region: RegionId, faction: FactionId): CutReason | null {
  const kind = ctx.map.regions.get(region)!.kind;
  if (kind === 'river' || kind === 'sea') return null;
  if (kind === 'off_map') return 'off_map';
  const holding = ctx.index.holdings.get(region)!;
  if (holding.tracedBy.includes(faction)) return null;
  return neutralOpen(holding, ctx.network) ? null : 'not_traced';
}

/** Why a faction cannot use a leg, or null if it can. */
function legBar(ctx: Ctx, leg: EdgeLeg, faction: FactionId): { readonly why: CutReason; readonly by: InstallationId | null } | null {
  if (leg.capacityMilli <= 0) return { why: 'edge_cut', by: null };
  const o = obstructionFor(ctx.map, ctx.index, ctx.network, leg.edge, faction);
  return o === null ? null : { why: 'obstructed', by: o.by };
}

/** The constrained search: from the given starts over what `faction` may pass. */
function search(ctx: Ctx, faction: FactionId, starts: readonly Label[]): Map<RegionId, Label> {
  const best = new Map<RegionId, Label>();
  const done = new Set<RegionId>();
  const heap = new MinHeap<Label>(better);
  for (const s of starts) {
    const cur = best.get(s.region);
    if (cur === undefined || better(s, cur)) {
      best.set(s.region, s);
      heap.push(s);
    }
  }
  for (let label = heap.pop(); label !== undefined; label = heap.pop()) {
    if (done.has(label.region) || best.get(label.region) !== label) continue;
    done.add(label.region);
    for (const edge of ctx.map.edgesAt.get(label.region)!) {
      const to = otherEnd(edge, label.region);
      if (done.has(to) || regionBar(ctx, to, faction) !== null) continue;
      const leg = legOf(ctx, edge, label.region);
      if (legBar(ctx, leg, faction) !== null) continue;
      const narrower = leg.capacityMilli < label.capacityMilli;
      const next: Label = {
        region: to,
        daysPermille: label.daysPermille + leg.daysPermille,
        capacityMilli: narrower ? leg.capacityMilli : label.capacityMilli,
        origin: label.origin,
        leg,
        bottleneck: narrower ? { kind: 'edge', id: leg.edge } : label.bottleneck,
      };
      const cur = best.get(to);
      if (cur === undefined || better(next, cur)) {
        best.set(to, next);
        heap.push(next);
      }
    }
  }
  return best;
}

function legsTo(best: ReadonlyMap<RegionId, Label>, region: RegionId): EdgeLeg[] {
  const legs: EdgeLeg[] = [];
  for (let l = best.get(region); l?.leg; l = best.get(l.leg.from)) legs.push(l.leg);
  return legs.reverse();
}

export function deriveSupply(map: WorldIndex, index: ControlIndex, month: number, network: NetworkConditions = INTACT_NETWORK): SupplyResult {
  if (!Number.isSafeInteger(month) || month < 1 || month > 12) throw new SupplyError(`month must be 1-12, got ${month}`);
  const ctx: Ctx = { map, index, month, network, legs: new Map() };
  const depots = [...map.world.depots].sort((a, b) => strictCompare(a.id, b.id));
  const factions = new Map<FactionId, FactionSupply>();
  for (const faction of index.factions) {
    // An origin supplies only a side that traces its region: passing through a neutral region (0055) draws nothing from it.
    const tracedHere = (region: RegionId) => ctx.index.holdings.get(region)!.tracedBy.includes(faction);
    const originOf = (d: (typeof depots)[number]) => {
      const condition = network.depotCondition[d.id] ?? 1000;
      const terms: OriginTerm[] = [{ kind: 'base', capacityMilli: d.capacity * 1000 }];
      if (condition !== 1000) terms.push({ kind: 'condition', conditionPermille: condition });
      return { capacity: Math.trunc((d.capacity * 1000 * condition) / 1000), terms };
    };
    const start = (o: SupplyOrigin): Label => ({ region: o.region, daysPermille: 0, capacityMilli: o.capacityMilli, origin: o.depot, leg: null, bottleneck: { kind: 'origin', id: o.depot } });

    // Sources this faction can draw on, then the depots their paths reach.
    const sources: SupplyOrigin[] = [];
    for (const d of depots) {
      if (d.kind !== 'source' || !tracedHere(d.region)) continue;
      const { capacity, terms } = originOf(d);
      if (capacity > 0) sources.push({ depot: d.id, kind: 'source', region: d.region, capacityMilli: capacity, terms });
    }
    const fed = search(ctx, faction, sources.map(start));
    const origins: SupplyOrigin[] = [...sources];
    for (const d of depots) {
      if (d.kind !== 'depot' || !tracedHere(d.region)) continue;
      const feed = fed.get(d.region);
      if (feed === undefined) continue;
      const { capacity, terms } = originOf(d);
      const effective = Math.min(capacity, feed.capacityMilli);
      if (effective <= 0) continue;
      origins.push({
        depot: d.id,
        kind: 'depot',
        region: d.region,
        capacityMilli: effective,
        terms: [...terms, { kind: 'feed', source: feed.origin, daysPermille: feed.daysPermille, capacityMilli: feed.capacityMilli }],
      });
    }
    origins.sort((a, b) => strictCompare(a.depot, b.depot));

    const best = search(ctx, faction, origins.map(start));
    const paths = new Map<RegionId, SupplyPath>();
    const unsupplied: RegionId[] = [];
    for (const region of index.traced.get(faction)!) {
      const label = best.get(region);
      if (label === undefined) {
        unsupplied.push(region);
        continue;
      }
      const legs = legsTo(best, region);
      const lines: RailLineId[] = [];
      for (const leg of legs) if (leg.line !== null && !lines.includes(leg.line)) lines.push(leg.line);
      paths.set(region, {
        faction,
        region,
        origin: label.origin,
        daysPermille: label.daysPermille,
        capacityMilli: label.capacityMilli,
        bottleneck: label.bottleneck,
        legs,
        lines,
        breaksOfBulk: legs.filter((l) => l.breakOfBulk).length,
      });
    }

    const out = new Set(unsupplied);
    const groups = connectedGroups(unsupplied, (r) => map.edgesAt.get(r)!.map((e) => otherEnd(e, r)).filter((n) => out.has(n)));
    const pockets: Pocket[] = groups.map((regions) => ({ id: `pocket:${faction}:${regions[0]!}`, faction, regions, cut: cutInto(ctx, faction, origins, regions) }));
    factions.set(faction, { faction, origins, paths, pockets });
  }
  return { month, factions };
}

/**
 * Where the line into a pocket is cut: take the shortest way in from the
 * faction's origins over the whole map (control, condition and obstructions
 * ignored, off-map boxes excluded), and name the first region or edge on it
 * the faction cannot pass.
 */
function cutInto(ctx: Ctx, faction: FactionId, origins: readonly SupplyOrigin[], pocket: readonly RegionId[]): Cut | null {
  if (origins.length === 0) return { why: 'no_origin', region: null, edge: null, by: null };
  const best = new Map<RegionId, { days: number; leg: EdgeLeg | null }>();
  const done = new Set<RegionId>();
  type Entry = { region: RegionId; days: number; leg: EdgeLeg | null };
  const heap = new MinHeap<Entry>((a, b) => a.days < b.days || (a.days === b.days && a.region < b.region));
  for (const o of origins) {
    if (!best.has(o.region)) {
      best.set(o.region, { days: 0, leg: null });
      heap.push({ region: o.region, days: 0, leg: null });
    }
  }
  const targets = new Set(pocket);
  let reached: RegionId | null = null;
  for (let e = heap.pop(); e !== undefined; e = heap.pop()) {
    if (done.has(e.region) || best.get(e.region)!.days !== e.days) continue;
    done.add(e.region);
    if (targets.has(e.region)) {
      reached = e.region;
      break;
    }
    for (const edge of ctx.map.edgesAt.get(e.region)!) {
      const to = otherEnd(edge, e.region);
      if (done.has(to) || ctx.map.regions.get(to)!.kind === 'off_map') continue;
      const leg = legOf(ctx, edge, e.region);
      const days = e.days + leg.daysPermille;
      const cur = best.get(to);
      if (cur === undefined || days < cur.days || (days === cur.days && leg.edge < (cur.leg?.edge ?? ''))) {
        best.set(to, { days, leg });
        heap.push({ region: to, days, leg });
      }
    }
  }
  if (reached === null) return null;
  const legs: EdgeLeg[] = [];
  for (let l = best.get(reached)!.leg; l !== null; l = best.get(l.from)!.leg) legs.push(l);
  legs.reverse();
  for (const leg of legs) {
    const bar = legBar(ctx, leg, faction);
    if (bar !== null) return { why: bar.why, region: null, edge: leg.edge, by: bar.by };
    const region = regionBar(ctx, leg.to, faction);
    if (region !== null) return { why: region, region: leg.to, edge: null, by: null };
  }
  return null;
}

/** A demand for supply at a region, in the order demands are served. */
export interface SupplyDemand {
  readonly faction: FactionId;
  readonly region: RegionId;
  readonly amountMilli: number;
  /** Who asks (a force block's id, later), for the explanation. */
  readonly label: string;
}

export interface SupplyAllocation {
  readonly demand: SupplyDemand;
  readonly deliveredMilli: number;
  /** What stopped a full delivery, if anything. */
  readonly limitedBy: { readonly kind: 'unsupplied' } | { readonly kind: 'origin'; readonly id: DepotId } | { readonly kind: 'edge'; readonly id: EdgeId } | null;
}

/**
 * Serve demands in priority order, not by maximum flow (FOUNDATION section 4):
 * each takes what its path's origin and edges still have, and leaves the rest
 * for the next. Edge capacity is shared by both directions and every faction;
 * a depot's feed is not charged (Phase 0 simplification, stated in the notes).
 */
export function allocateInPriorityOrder(supply: SupplyResult, demands: readonly SupplyDemand[]): SupplyAllocation[] {
  const originLeft = new Map<string, number>();
  const edgeLeft = new Map<EdgeId, number>();
  const out: SupplyAllocation[] = [];
  for (const demand of demands) {
    if (!Number.isSafeInteger(demand.amountMilli) || demand.amountMilli < 0) throw new SupplyError(`demand ${demand.label}: amount must be a whole, non-negative number`);
    const fs = lookup('faction', supply.factions, demand.faction);
    const path = fs.paths.get(demand.region);
    if (path === undefined) {
      out.push({ demand, deliveredMilli: 0, limitedBy: { kind: 'unsupplied' } });
      continue;
    }
    const originKey = `${demand.faction}|${path.origin}`;
    const origin = fs.origins.find((o) => o.depot === path.origin)!;
    let room = originLeft.get(originKey) ?? origin.capacityMilli;
    let limitedBy: SupplyAllocation['limitedBy'] = { kind: 'origin', id: path.origin };
    for (const leg of path.legs) {
      const left = edgeLeft.get(leg.edge) ?? leg.capacityMilli;
      if (left < room) {
        room = left;
        limitedBy = { kind: 'edge', id: leg.edge };
      }
    }
    const delivered = Math.min(room, demand.amountMilli);
    originLeft.set(originKey, (originLeft.get(originKey) ?? origin.capacityMilli) - delivered);
    for (const leg of path.legs) edgeLeft.set(leg.edge, (edgeLeft.get(leg.edge) ?? leg.capacityMilli) - delivered);
    out.push({ demand, deliveredMilli: delivered, limitedBy: delivered < demand.amountMilli ? limitedBy : null });
  }
  return out;
}
