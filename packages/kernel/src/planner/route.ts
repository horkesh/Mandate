/**
 * Integer route search (planner-design D3; 0062): Dijkstra over the typed graph on a priced cost in permille days,
 * ordered by (cost, region id, edge id), with the penalty method for alternatives and chained legs for waypoints.
 *
 * Cost of a leg = days (season and condition, through `edgeLeg`, times any penalty)
 *   + threat (perceived enemy where it lands, times his risk weight)
 *   + supply (days outside his network, times his supply care)
 *   + works and held ground (an obstruction he has been told of; works to reduce and a garrison to assault on
 *     enemy-held ground short of the objective, lane 0.9 finding 9).
 *
 * Where a force may go is `movement`'s passage rule (`passageBar`), imported, never copied (0062). On top of it the
 * planner applies only the goal's permissions: rail, river, sea, and a neutral government's open ground (0062: a
 * political act, so only by permission), and the obstructions from his view.
 */
import { MinHeap } from '../heap.ts';
import type { EdgeId, RegionId } from '../ids.ts';
import { passageBar } from '../movement/march.ts';
import { edgeLeg, neutralOpen, type EdgeLeg } from '../supply/supply.ts';
import type { EdgeRecord } from '../world/graph.ts';
import { otherEnd } from '../world/index.ts';
import { enemyHeld, type Ctx } from './context.ts';
import type { AxisMode, Obstacle, PlanRoute, PlanLeg } from './types.ts';

/** How a search weighs a leg: his risk weight and supply care, and how works on a water edge are met. */
export interface Weights {
  readonly riskWeight: number;
  readonly supplyCare: number;
  /** Deliberately (slow, safe) or forced in a night (fast, costly). */
  readonly obstacles: 'deliberate' | 'force';
}

/** Permille multipliers on edges' day cost, for the penalty method. */
export type Penalty = ReadonlyMap<EdgeId, number>;

/** A search on land, or by water (carried by ship or boat). */
export type SearchMode = 'land' | 'water';

interface Label {
  readonly region: RegionId;
  readonly cost: number;
  readonly leg: PlanLeg | null;
}

/** Strictly before: lower cost, then smaller region id, then smaller edge id. */
function before(a: Label, b: Label): boolean {
  if (a.cost !== b.cost) return a.cost < b.cost;
  if (a.region !== b.region) return a.region < b.region;
  return (a.leg?.legEdge ?? '') < (b.leg?.legEdge ?? '');
}

/** Whether the goal's permissions allow this edge type in this mode. */
function permitted(ctx: Ctx, edge: EdgeRecord, mode: SearchMode): boolean {
  const g = ctx.input.goal;
  switch (edge.type) {
    case 'road':
      return mode === 'land';
    case 'rail':
      return mode === 'land' && g.goalRail;
    case 'river':
      return mode === 'water' && (g.goalRiver || g.goalSea);
    case 'sea':
      return mode === 'water' && g.goalSea;
  }
}

/** Whether a force may take this leg: movement's passage rule, the goal's permissions, and (by water) landing only at the end. */
export function legPasses(ctx: Ctx, edge: EdgeRecord, leg: EdgeLeg, mode: SearchMode, isEnd: boolean): boolean {
  const { ground, faction, goal } = ctx.input;
  if (!permitted(ctx, edge, mode) || (ctx.regions !== undefined && !ctx.regions.has(leg.to))) return false;
  if (passageBar(ground, leg, faction, mode === 'water') !== null) return false;
  const kind = ground.map.regions.get(leg.to)!.kind;
  if (mode === 'water') return isEnd || kind === 'river' || kind === 'sea';
  const holding = ground.index.holdings.get(leg.to);
  if (!goal.goalNeutral && holding !== undefined && neutralOpen(holding, ground.network)) return false;
  return true;
}

/** The obstruction he has been told of on a water edge, priced; null if he knows of none (or his side now holds its works). */
function obstacleOf(ctx: Ctx, edge: EdgeRecord, weights: Weights): { readonly kind: Obstacle; readonly days: number; readonly threat: number | null } | null {
  const { ground, faction, rules, obstructions, works } = ctx.input;
  if (!obstructions.has(edge.id)) return null;
  const by = obstructions.get(edge.id)!;
  if (by === null) {
    // Works no installation holds (a boom, hulks): cleared deliberately, or forced in a night.
    return weights.obstacles === 'force' ? { kind: 'clear', days: rules.forceDays, threat: rules.forcingThreat } : { kind: 'clear', days: rules.clearDays, threat: 0 };
  }
  // Works close a water edge to everyone but whoever holds their region (supply's obstruction rule): his own side's do not bar him.
  if (ground.index.holdings.get(by)?.holder === faction) return null;
  const garrison = ctx.threat.get(by) ?? null;
  const fort = ground.map.world.installations.find((i) => i.region === by && i.fort !== null)?.fort ?? null;
  if (fort?.water === 'passage') return { kind: 'run_past', days: 0, threat: garrison === null ? null : garrison + rules.forcingThreat };
  return { kind: 'reduce', days: (works.get(by) ?? 0) * rules.reducePerLevel, threat: garrison };
}

/** Days spent on enemy-held ground short of the objective: works to reduce, then a garrison he believes is there to assault. */
export function heldDays(ctx: Ctx, region: RegionId): number {
  const { ground, faction, rules, works, beliefs } = ctx.input;
  if (!enemyHeld(ground.index, region, faction)) return 0;
  return (works.get(region) ?? 0) * rules.reducePerLevel + ((beliefs.get(region) ?? 0) > 0 || ctx.input.beliefDetails?.get(region)?.strengthPresence === true ? rules.assaultDays : 0);
}

/** The least-cost route from `from` to `to` in this mode with these weights, or null. Counts one search. */
export function search(ctx: Ctx, from: RegionId, to: RegionId, mode: SearchMode, weights: Weights, penalty: Penalty = new Map()): PlanRoute | null {
  const { ground } = ctx.input;
  // Every route in this search uses the same evaluable cost domains. Missing
  // threat never makes a route cheaper than a route with a known threat.
  const numericThreat = [...ctx.threat].every(([r,n]) => (ctx.regions !== undefined && !ctx.regions.has(r)) || n !== null);
  ctx.searches += 1;
  if (ctx.searches > ctx.input.rules.maxSearches) return null;
  const best = new Map<RegionId, Label>();
  const done = new Set<RegionId>();
  const heap = new MinHeap<Label>(before);
  const start: Label = { region: from, cost: 0, leg: null };
  best.set(from, start);
  heap.push(start);
  for (let label = heap.pop(); label !== undefined; label = heap.pop()) {
    if (done.has(label.region) || best.get(label.region) !== label) continue;
    done.add(label.region);
    if (label.region === to) break;
    for (const edge of ground.map.edgesAt.get(label.region) ?? []) {
      const next = otherEnd(edge, label.region);
      if (done.has(next)) continue;
      const leg = edgeLeg(ground.map, edge, label.region, ground.month, ground.network);
      if (!legPasses(ctx, edge, leg, mode, next === to)) continue;
      const obstacle = mode === 'water' ? obstacleOf(ctx, edge, weights) : null;
      const days = Math.trunc((leg.daysPermille * (penalty.get(edge.id) ?? 1000)) / 1000);
      const landed = next === to ? 0 : (ctx.threat.get(next) ?? 0);
      const threatMen = landed + (obstacle?.threat ?? 0);
      const threat = numericThreat ? Math.trunc((Math.trunc((threatMen * 1000) / ctx.input.rules.menPerDay) * weights.riskWeight) / 1000) : null;
      // STAND-IN(owner: 1B, ships' stores; labelled by lane 1.4): ships and boats carry their own stores; only marching outside the network costs supply.
      const outside = mode === 'land' && !ctx.inSupply.has(next);
      const supply = outside ? Math.trunc((leg.daysPermille * weights.supplyCare) / 1000) : 0;
      const held = mode === 'land' && next !== to ? heldDays(ctx, next) : 0;
      const obstacleDays = (obstacle?.days ?? 0) + held;
      const routeLeg: PlanLeg = {
        legEdge: edge.id,
        legFrom: label.region,
        legTo: next,
        legType: edge.type,
        legDays: leg.daysPermille,
        legThreat: threat,
        legSupply: supply,
        legObstacleDays: obstacleDays,
        legObstacle: obstacle?.kind ?? null,
        legHeld: mode === 'land' && enemyHeld(ground.index, next, ctx.input.faction),
      };
      const cand: Label = { region: next, cost: label.cost + days + (threat ?? 0) + supply + obstacleDays, leg: routeLeg };
      const cur = best.get(next);
      if (cur === undefined || before(cand, cur)) {
        best.set(next, cand);
        heap.push(cand);
      }
    }
  }
  const end = best.get(to);
  if (end === undefined || (end.leg === null && from !== to)) return null;
  const legs: PlanLeg[] = [];
  for (let l = end; l.leg !== null; l = best.get(l.leg.legFrom)!) legs.push(l.leg);
  legs.reverse();
  return { routeFrom: from, routeTo: to, routeLegs: legs, routeCost: end.cost, routeDays: daysOfLegs(legs), ...(!numericThreat ? {routeUnknownThreat:true as const} : {}) };
}

function daysOfLegs(legs: readonly PlanLeg[]): number {
  return legs.reduce((s, l) => s + l.legDays + l.legObstacleDays, 0);
}

/** The axis mode of a water route: by sea if any leg is a sea edge, else by river. */
export function waterMode(route: PlanRoute): AxisMode {
  return route.routeLegs.some((l) => l.legType === 'sea') ? 'sea' : 'river';
}

/** A route through waypoints, as chained legs. A null route names the first stop that cannot be reached. */
export function viaRoute(ctx: Ctx, from: RegionId, via: readonly RegionId[], to: RegionId, mode: SearchMode, weights: Weights): { readonly route: PlanRoute | null; readonly unreachable: RegionId | null } {
  const stops = [from, ...via, to];
  const legs: PlanLeg[] = [];
  let cost = 0;
  for (let i = 0; i + 1 < stops.length; i++) {
    const r = search(ctx, stops[i]!, stops[i + 1]!, mode, weights);
    if (r === null) return { route: null, unreachable: stops[i + 1]! };
    legs.push(...r.routeLegs);
    cost += r.routeCost;
  }
  return { route: { routeFrom: from, routeTo: to, routeLegs: legs, routeCost: cost, routeDays: daysOfLegs(legs), ...(legs.some(l=>l.legThreat===null)?{routeUnknownThreat:true as const}:{}) }, unreachable: null };
}

/**
 * Unweighted days from every region to `to` on land (one search: the reverse tree), to refuse retrograde
 * alternatives: a flank that marches back through his own rear is not a flank.
 */
export function daysTo(ctx: Ctx, to: RegionId): ReadonlyMap<RegionId, number> {
  const { ground } = ctx.input;
  ctx.searches += 1;
  const best = new Map<RegionId, number>([[to, 0]]);
  const done = new Set<RegionId>();
  const heap = new MinHeap<{ readonly region: RegionId; readonly cost: number }>((a, b) => a.cost < b.cost || (a.cost === b.cost && a.region < b.region));
  heap.push({ region: to, cost: 0 });
  for (let e = heap.pop(); e !== undefined; e = heap.pop()) {
    if (done.has(e.region)) continue;
    done.add(e.region);
    for (const edge of ground.map.edgesAt.get(e.region) ?? []) {
      const from = otherEnd(edge, e.region);
      if (done.has(from)) continue;
      // The leg as travelled: from `from` into `e.region`.
      const leg = edgeLeg(ground.map, edge, from, ground.month, ground.network);
      if (!legPasses(ctx, edge, leg, 'land', false)) continue;
      const cost = e.cost + leg.daysPermille;
      if (cost < (best.get(from) ?? Number.MAX_SAFE_INTEGER)) {
        best.set(from, cost);
        heap.push({ region: from, cost });
      }
    }
  }
  return best;
}

/** The first region a route passes more than `slack` permille days further from its end than its start is, or null. */
export function retrograde(route: PlanRoute, dist: ReadonlyMap<RegionId, number>, slack: number): RegionId | null {
  const limit = (dist.get(route.routeFrom) ?? 0) + slack;
  for (const l of route.routeLegs) if ((dist.get(l.legTo) ?? Number.MAX_SAFE_INTEGER) > limit) return l.legTo;
  return null;
}

/** The regions a route passes, start excluded, in order. */
export function regionsOf(route: PlanRoute): RegionId[] {
  return route.routeLegs.map((l) => l.legTo);
}

/** Overlap of two region lists, permille of the smaller (the shared destination excluded). */
export function overlap(a: readonly RegionId[], b: readonly RegionId[]): number {
  const sa = new Set(a.slice(0, -1));
  const sb = b.slice(0, -1);
  if (sa.size === 0 || sb.length === 0) return a.length === b.length ? 1000 : 0;
  const shared = sb.filter((r) => sa.has(r)).length;
  return Math.trunc((shared * 1000) / Math.min(sa.size, sb.length));
}

/** The penalty that multiplies the edges the routes used (D4's flank), in edge order. */
export function penaltyFor(routes: readonly PlanRoute[], permille: number): Penalty {
  const p = new Map<EdgeId, number>();
  for (const r of routes) for (const l of r.routeLegs) p.set(l.legEdge, permille);
  return new Map([...p].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
