/**
 * Marching over typed edges (FOUNDATION section 4; decisions 0019, 0029,
 * 0054, 0055): routes, legs and daily progress for force blocks. Part of
 * `movement`, the only writer of location.
 *
 * The model, stated so it can be checked:
 * - **A leg** is one edge crossed in one direction. It takes the edge's days
 *   for a division this month (`edgeLeg`, the same numbers supply uses: season
 *   and condition applied), in permille days. A block on a leg gains 1000 a
 *   day and arrives when it has the leg's days; a one-day edge started today
 *   is crossed today. A leg begun is finished: a cut behind the men does not
 *   recall them, it only stops the next leg.
 * - **Who may use an edge.** Land troops march on roads and rails; water
 *   edges carry only ships, and troops aboard move with their ship. A rail
 *   edge needs both ends traced by the side (0019: control lets a side trace
 *   rail) or open neutral ground. Nobody enters an off-map box. Land troops
 *   enter any land region or key point, enemy ground included (that is how
 *   ground is contested), except a neutral government's closed territory
 *   (0055); they never stand on open water.
 * - **Closed edges.** An edge carries a march only while its capacity this
 *   month is at least the pack's least capacity to march (`WorldRules.movement.marchMinCapacityPermille`, one whole unit in both packs):
 *   a season that narrows a small river below that (low water, ice) closes it,
 *   and damage that cuts an edge to nothing closes it to everyone. A water edge
 *   obstructed against the side is closed to its ships (`obstructionFor`).
 * - **Routes** take the fewest permille days, ties broken by edge id at each
 *   step; the steps offered toward a goal are every first leg of a quickest
 *   route, so a commander's menu is the kernel's, never his own (0052).
 */
import { strictCompare } from '../compare.ts';
import type { ControlIndex } from '../control-index/control-index.ts';
import type { EdgeId, FactionId, ForceBlockId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { edgeLeg, neutralClosed, neutralOpen, obstructionFor, type EdgeLeg, type NetworkConditions } from '../supply/supply.ts';
import { MinHeap } from '../heap.ts';
import { otherEnd, type WorldIndex } from '../world/index.ts';
import { MovementError, type ForceLocation } from './movement.ts';

/** One leg under way. Immutable: `movement` replaces it whole. */
export interface MarchLeg {
  readonly marchEdge: EdgeId;
  readonly marchFrom: RegionId;
  readonly marchTo: RegionId;
  /** The leg's length, permille days. */
  readonly marchNeedMilli: number;
  /** Progress so far, permille days. */
  readonly marchDoneMilli: number;
  readonly marchStartDay: number;
}

/** Why a side's blocks cannot take a leg (hard rule 6). */
export type MarchBar = 'off_map' | 'needs_ship' | 'not_water' | 'closed_neutral' | 'open_water' | 'rail_not_traced' | 'edge_closed' | 'obstructed';

/** What a march is judged on: the map, today's control index and network, and the month. */
export interface MarchGround {
  readonly map: WorldIndex;
  readonly index: ControlIndex;
  readonly network: NetworkConditions;
  readonly month: number;
}

/** Whether a side may pass a region by rail: it traces it, or it is open neutral ground (0055). */
function railPasses(ground: MarchGround, region: RegionId, faction: FactionId): boolean {
  const kind = ground.map.regions.get(region)!.kind;
  if (kind !== 'land' && kind !== 'key_point') return false;
  const holding = ground.index.holdings.get(region)!;
  return holding.tracedBy.includes(faction) || neutralOpen(holding, ground.network);
}

/**
 * The movement passage rule (0062: `movement` owns it and the planner imports it): why `faction`'s blocks (naval or
 * not) cannot take `leg` on the ground as it is, leaving out only obstructions on water. A march meets the obstructions
 * that are there (`marchBar`); a commander plans on the ones he has been told of, from his own view (0062: a commander
 * learns of a boom by report), so the planner adds those itself. Null if they may pass.
 */
export function passageBar(ground: MarchGround, leg: EdgeLeg, faction: FactionId, naval: boolean): Exclude<MarchBar, 'obstructed'> | null {
  const to = ground.map.regions.get(leg.to)!;
  if (to.kind === 'off_map') return 'off_map';
  const water = leg.type === 'river' || leg.type === 'sea';
  if (naval && !water) return 'not_water';
  if (!naval) {
    if (water) return 'needs_ship';
    if (to.kind === 'river' || to.kind === 'sea') return 'open_water';
    const holding = ground.index.holdings.get(leg.to)!;
    // A neutral government's closed territory bars every side (0058); ground with an unknown government is not neutral.
    if (neutralClosed(holding, ground.network)) return 'closed_neutral';
    if (leg.type === 'rail' && (!railPasses(ground, leg.from, faction) || !railPasses(ground, leg.to, faction))) return 'rail_not_traced';
  }
  if (leg.capacityMilli < ground.map.world.rules.movement.marchMinCapacityPermille) return 'edge_closed';
  return null;
}

/** Why `faction`'s blocks (naval or not) cannot take `leg`, or null if they can: the passage rule, and the obstructions truly there. */
export function marchBar(ground: MarchGround, leg: EdgeLeg, faction: FactionId, naval: boolean): MarchBar | null {
  const bar = passageBar(ground, leg, faction, naval);
  if (bar !== null) return bar;
  const water = leg.type === 'river' || leg.type === 'sea';
  if (water && obstructionFor(ground.map, ground.index, ground.network, leg.edge, faction) !== null) return 'obstructed';
  return null;
}

/** Every leg a side's blocks may take out of a region this month, in edge-id order. */
export function legsFrom(ground: MarchGround, from: RegionId, faction: FactionId, naval: boolean): EdgeLeg[] {
  const out: EdgeLeg[] = [];
  for (const edge of ground.map.edgesAt.get(from) ?? []) {
    const leg = edgeLeg(ground.map, edge, from, ground.month, ground.network);
    if (marchBar(ground, leg, faction, naval) === null) out.push(leg);
  }
  return out;
}

/** Quickest days (permille) from every region to `goal` over legs the side may take: Dijkstra run backwards from the goal. */
function daysToGoal(ground: MarchGround, goal: RegionId, faction: FactionId, naval: boolean): Map<RegionId, number> {
  const best = new Map<RegionId, number>([[goal, 0]]);
  const done = new Set<RegionId>();
  const heap = new MinHeap<{ region: RegionId; days: number }>((a, b) => a.days < b.days || (a.days === b.days && a.region < b.region));
  heap.push({ region: goal, days: 0 });
  for (let e = heap.pop(); e !== undefined; e = heap.pop()) {
    if (done.has(e.region) || best.get(e.region) !== e.days) continue;
    done.add(e.region);
    for (const edge of ground.map.edgesAt.get(e.region) ?? []) {
      const from = otherEnd(edge, e.region);
      if (done.has(from)) continue;
      // The leg as travelled: from `from` into `e.region`.
      const leg = edgeLeg(ground.map, edge, from, ground.month, ground.network);
      if (marchBar(ground, leg, faction, naval) !== null) continue;
      const days = e.days + leg.daysPermille;
      const cur = best.get(from);
      if (cur === undefined || days < cur) {
        best.set(from, days);
        heap.push({ region: from, days });
      }
    }
  }
  return best;
}

/** A step a commander may take toward a goal: a first leg of a quickest route, and the days left after it. */
export interface MarchStep {
  readonly leg: EdgeLeg;
  /** Permille days from the leg's far end to the goal. */
  readonly remainingMilli: number;
}

/**
 * The first legs of every quickest route from `from` to `goal`, in edge-id
 * order; empty when `from` is the goal or the goal cannot be reached.
 */
export function marchSteps(ground: MarchGround, from: RegionId, goal: RegionId, faction: FactionId, naval: boolean): MarchStep[] {
  if (!ground.map.regions.has(goal)) throw new MovementError([`goal ${goal} is not in the World`]);
  if (from === goal) return [];
  const toGoal = daysToGoal(ground, goal, faction, naval);
  const total = toGoal.get(from);
  if (total === undefined) return [];
  return legsFrom(ground, from, faction, naval)
    .filter((leg) => toGoal.has(leg.to) && leg.daysPermille + toGoal.get(leg.to)! === total)
    .map((leg) => ({ leg, remainingMilli: toGoal.get(leg.to)! }));
}

/**
 * Put blocks on a leg. Each must stand at the leg's start, not be aboard a
 * ship, and not be on a leg already; the side must be allowed the leg (the
 * caller judged it with `marchBar`, and this checks again).
 */
export function startLeg(ground: MarchGround, state: State, blocks: readonly ForceBlockId[], leg: EdgeLeg, faction: FactionId, naval: boolean, day: number): State {
  const problems: string[] = [];
  const bar = marchBar(ground, leg, faction, naval);
  if (bar !== null) problems.push(`leg ${leg.edge} from ${leg.from} is barred: ${bar}`);
  if (blocks.length === 0) problems.push('a leg needs at least one block');
  const next: Record<ForceBlockId, ForceLocation> = { ...state.forceLocations };
  for (const id of [...blocks].sort(strictCompare)) {
    const loc = state.forceLocations[id];
    if (loc === undefined) {
      problems.push(`unknown force block ${id}`);
      continue;
    }
    if (loc.locRegion !== leg.from) problems.push(`${id} stands in ${loc.locRegion}, not ${leg.from}`);
    if (loc.locAboard !== null) problems.push(`${id} is aboard ${loc.locAboard} and moves with its ship`);
    if (loc.locMarch !== null) problems.push(`${id} is already on a leg`);
    next[id] = { ...loc, locMarch: { marchEdge: leg.edge, marchFrom: leg.from, marchTo: leg.to, marchNeedMilli: leg.daysPermille, marchDoneMilli: 0, marchStartDay: day } };
  }
  if (problems.length > 0) throw new MovementError(problems);
  return { ...state, forceLocations: next };
}

/** A side's blocks falling back from a region, as the contest proposes it (`combat/contest.ts`). */
export interface RetreatMove {
  readonly to: RegionId | null;
  readonly blocks: readonly ForceBlockId[];
}

/**
 * Apply retreats: each listed block stands in its retreat region from today,
 * off any leg. A retreat with nowhere to go moves no one. Ships and troops
 * aboard are never listed by the contest; any listed are refused.
 */
export function applyRetreats(state: State, retreats: readonly RetreatMove[], day: number): State {
  const moving = retreats.filter((r) => r.to !== null);
  if (moving.length === 0) return state;
  const next: Record<ForceBlockId, ForceLocation> = { ...state.forceLocations };
  for (const r of moving) {
    for (const id of r.blocks) {
      const loc = state.forceLocations[id];
      if (loc === undefined) throw new MovementError([`unknown force block ${id}`]);
      if (loc.locAboard !== null) throw new MovementError([`${id} is aboard ${loc.locAboard} and cannot retreat on its own`]);
      next[id] = { locRegion: r.to!, locAboard: null, locSinceDay: day, locMarch: null };
    }
  }
  return { ...state, forceLocations: next };
}

/** A block reaching the end of a leg today. */
export interface Arrival {
  readonly block: ForceBlockId;
  readonly region: RegionId;
  readonly edge: EdgeId;
  /** Blocks aboard it that came too. */
  readonly carried: readonly ForceBlockId[];
}

/**
 * One day's marching: every block on a leg gains a day; those that have the
 * leg's days arrive, and blocks aboard an arriving ship arrive with it.
 * Returns the arrivals in block order. If nobody is marching, the same State returns.
 */
export function advanceMarches(state: State, day: number): { readonly state: State; readonly arrivals: readonly Arrival[] } {
  const ids = (Object.keys(state.forceLocations) as ForceBlockId[]).filter((id) => state.forceLocations[id]!.locMarch !== null).sort(strictCompare);
  if (ids.length === 0) return { state, arrivals: [] };
  const next: Record<ForceBlockId, ForceLocation> = { ...state.forceLocations };
  const arrivals: Arrival[] = [];
  for (const id of ids) {
    const loc = state.forceLocations[id]!;
    const march = loc.locMarch!;
    const done = march.marchDoneMilli + 1000;
    if (done < march.marchNeedMilli) {
      next[id] = { ...loc, locMarch: { ...march, marchDoneMilli: done } };
      continue;
    }
    next[id] = { locRegion: march.marchTo, locAboard: null, locSinceDay: day, locMarch: null };
    const carried = (Object.keys(state.forceLocations) as ForceBlockId[]).filter((b) => state.forceLocations[b]!.locAboard === id).sort(strictCompare);
    for (const b of carried) next[b] = { ...state.forceLocations[b]!, locRegion: march.marchTo, locSinceDay: day };
    arrivals.push({ block: id, region: march.marchTo, edge: march.marchEdge, carried });
  }
  return { state: { ...state, forceLocations: next }, arrivals };
}
