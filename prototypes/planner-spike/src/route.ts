/**
 * Integer route search (planner-design D3): Dijkstra over the typed graph on a
 * priced cost in permille days, ordered by (cost, region id), with the
 * penalty method for alternatives and chained legs for waypoints.
 *
 * Cost of a leg = days (with season, through the kernel's `edgeLeg`, times any
 * penalty) + threat (perceived enemy where it lands, times his risk weight)
 * + supply (days spent outside his network, times his supply care)
 * + obstacle (works to reduce, clear or run past).
 *
 * Movement passability is not supply passability: an army may march into
 * enemy ground (that is the point), so land regions pass whoever holds them.
 * Off-map boxes never pass. Rail needs the rail permission and both ends in
 * his own traced network. River and sea need their permission.
 */
import { phase0, strictCompare, world as w } from '@mandate/kernel';
import type { Ctx } from './context.ts';
import type { AxisMode, EdgeId, RegionId, Route, RouteLeg } from './types.ts';

export interface Weights {
  readonly riskWeight: number;
  readonly supplyCare: number;
  /** How works on a water edge are handled: deliberately (slow, safe) or forced in a night (fast, costly). */
  readonly obstacles: 'deliberate' | 'force';
}

/** Permille multipliers on edges' day cost, for the penalty method. */
export type Penalty = ReadonlyMap<EdgeId, number>;

interface Label {
  readonly region: RegionId;
  readonly cost: number;
  readonly leg: RouteLeg | null;
}

/** Strictly better: lower cost, then smaller region id, then smaller edge id. */
function before(a: Label, b: Label): boolean {
  if (a.cost !== b.cost) return a.cost < b.cost;
  if (a.region !== b.region) return a.region < b.region;
  return (a.leg?.edge ?? '') < (b.leg?.edge ?? '');
}

/** A small binary heap. The kernel port reuses `supply/heap.ts` (never copy a function, FOUNDATION section 11). */
class Heap {
  private readonly items: Label[] = [];
  push(x: Label): void {
    const a = this.items;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!before(a[i]!, a[p]!)) break;
      [a[i], a[p]] = [a[p]!, a[i]!];
      i = p;
    }
  }
  pop(): Label | undefined {
    const a = this.items;
    if (a.length === 0) return undefined;
    const top = a[0]!;
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && before(a[l]!, a[m]!)) m = l;
        if (r < a.length && before(a[r]!, a[m]!)) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m]!, a[i]!];
        i = m;
      }
    }
    return top;
  }
}

function regionPasses(ctx: Ctx, region: RegionId, mode: AxisMode, isEnd: boolean): boolean {
  const kind = ctx.input.map.regions.get(region)!.kind;
  if (kind === 'off_map') return false;
  if (mode === 'land') return kind === 'land' || kind === 'key_point';
  if (mode === 'river') return kind === 'river' || kind === 'land' || kind === 'key_point';
  // By sea: water all the way, landing only at the end.
  return kind === 'sea' || kind === 'river' || isEnd;
}

function edgePasses(ctx: Ctx, edge: w.EdgeRecord, mode: AxisMode): boolean {
  const { permissions } = ctx.input.goal;
  const own = (r: RegionId) => ctx.input.controlIndex.holdings.get(r)?.tracedBy.includes(ctx.input.faction) ?? false;
  switch (edge.type) {
    case 'road':
      return mode !== 'sea';
    case 'rail':
      return mode === 'land' && permissions.rail && own(edge.a) && own(edge.b);
    case 'river':
      return mode !== 'land' && (mode === 'sea' ? permissions.sea || permissions.river : permissions.river);
    case 'sea':
      return mode === 'sea' && permissions.sea;
  }
}

/** The obstacle on an edge for his side, priced; null if the edge is open. */
function obstacleOf(ctx: Ctx, edge: w.EdgeRecord, weights: Weights): { kind: 'reduce' | 'clear' | 'run_past'; days: number; threat: number } | null {
  const { map, controlIndex, network, faction, rules, fortification } = ctx.input;
  const o = phase0.obstructionFor(map, controlIndex, network, edge.id, faction);
  if (o === null) return null;
  if (o.by === null) {
    // Works not modelled as an installation (a boom, hulks): cleared deliberately, or forced in a night.
    return weights.obstacles === 'force' ? { kind: 'clear', days: rules.forceDays, threat: rules.forcingThreat } : { kind: 'clear', days: rules.clearDays, threat: 0 };
  }
  const inst = map.world.installations.find((i) => i.id === o.by)!;
  const garrison = ctx.threat.get(inst.region) ?? 0;
  if (inst.fort?.water === 'passage') return { kind: 'run_past', days: 0, threat: garrison + rules.forcingThreat };
  return { kind: 'reduce', days: (fortification.get(inst.region) ?? 0) * rules.reducePerLevel, threat: garrison };
}

/** The least-cost route from `from` to `to` for this mode and these weights, or null. Counts one search. */
export function search(ctx: Ctx, from: RegionId, to: RegionId, mode: AxisMode, weights: Weights, penalty: Penalty = new Map()): Route | null {
  const { map, month, network } = ctx.input;
  ctx.searches += 1;
  if (ctx.searches > ctx.input.rules.maxSearches) return null;
  const best = new Map<RegionId, Label>();
  const done = new Set<RegionId>();
  const heap = new Heap();
  const start: Label = { region: from, cost: 0, leg: null };
  best.set(from, start);
  heap.push(start);
  for (let label = heap.pop(); label !== undefined; label = heap.pop()) {
    if (done.has(label.region) || best.get(label.region) !== label) continue;
    done.add(label.region);
    if (label.region === to) break;
    for (const edge of w.edgesOf(map, label.region)) {
      const next = w.otherEnd(edge, label.region);
      if (done.has(next) || !edgePasses(ctx, edge, mode) || !regionPasses(ctx, next, mode, next === to)) continue;
      const kleg = phase0.edgeLeg(map, edge, label.region, month, network);
      if (kleg.capacityMilli <= 0) continue;
      const obstacle = obstacleOf(ctx, edge, weights);
      const days = Math.trunc((kleg.daysPermille * (penalty.get(edge.id) ?? 1000)) / 1000);
      const landed = next === to ? 0 : (ctx.threat.get(next) ?? 0);
      const threatMen = landed + (obstacle?.threat ?? 0);
      const threat = Math.trunc((Math.trunc((threatMen * 1000) / ctx.input.rules.menPerDay) * weights.riskWeight) / 1000);
      // Ships and boats carry their own stores; only marching outside the network costs supply.
      const outside = mode === 'land' && !ctx.inSupply.has(next);
      const supply = outside ? Math.trunc((kleg.daysPermille * weights.supplyCare) / 1000) : 0;
      const obstaclePermille = obstacle?.days ?? 0;
      const leg: RouteLeg = {
        edge: edge.id,
        from: label.region,
        to: next,
        type: edge.type,
        daysPermille: kleg.daysPermille,
        threatPermille: threat,
        supplyPermille: supply,
        obstaclePermille,
        obstacle: obstacle?.kind ?? null,
      };
      const cand: Label = { region: next, cost: label.cost + days + threat + supply + obstaclePermille, leg };
      const cur = best.get(next);
      if (cur === undefined || before(cand, cur)) {
        best.set(next, cand);
        heap.push(cand);
      }
    }
  }
  const end = best.get(to);
  if (end === undefined || (end.leg === null && from !== to)) return null;
  const legs: RouteLeg[] = [];
  for (let l = end; l.leg !== null; l = best.get(l.leg.from)!) legs.push(l.leg);
  legs.reverse();
  return {
    from,
    to,
    legs,
    costPermille: end.cost,
    daysPermille: legs.reduce((s, l) => s + l.daysPermille + l.obstaclePermille, 0),
  };
}

/** A route through waypoints, as chained legs. Null names the first unreachable leg. */
export function viaRoute(ctx: Ctx, from: RegionId, via: readonly RegionId[], to: RegionId, mode: AxisMode, weights: Weights): { route: Route | null; unreachable: RegionId | null } {
  const stops = [from, ...via, to];
  const legs: RouteLeg[] = [];
  let cost = 0;
  for (let i = 0; i + 1 < stops.length; i++) {
    const r = search(ctx, stops[i]!, stops[i + 1]!, mode, weights);
    if (r === null) return { route: null, unreachable: stops[i + 1]! };
    legs.push(...r.legs);
    cost += r.costPermille;
  }
  return { route: { from, to, legs, costPermille: cost, daysPermille: legs.reduce((s, l) => s + l.daysPermille + l.obstaclePermille, 0) }, unreachable: null };
}

/**
 * Unweighted days from every region to `to` by this mode (one search, the
 * reverse tree). Used to refuse retrograde alternatives: a flank that marches
 * back through his own rear is not a flank.
 */
export function daysTo(ctx: Ctx, to: RegionId, mode: AxisMode): ReadonlyMap<RegionId, number> {
  const { map, month, network } = ctx.input;
  ctx.searches += 1;
  const best = new Map<RegionId, number>([[to, 0]]);
  const done = new Set<RegionId>();
  const heap = new Heap();
  heap.push({ region: to, cost: 0, leg: null });
  for (let label = heap.pop(); label !== undefined; label = heap.pop()) {
    if (done.has(label.region)) continue;
    done.add(label.region);
    for (const edge of w.edgesOf(map, label.region)) {
      const next = w.otherEnd(edge, label.region);
      if (done.has(next) || !edgePasses(ctx, edge, mode) || !regionPasses(ctx, next, mode, false)) continue;
      const cost = label.cost + phase0.edgeLeg(map, edge, next, month, network).daysPermille;
      if (cost < (best.get(next) ?? Number.MAX_SAFE_INTEGER)) {
        best.set(next, cost);
        heap.push({ region: next, cost, leg: null });
      }
    }
  }
  return best;
}

/** True if a route passes a region more than `slack` permille days further from its end than its start is. */
export function retrograde(route: Route, dist: ReadonlyMap<RegionId, number>, slack: number): RegionId | null {
  const limit = (dist.get(route.from) ?? 0) + slack;
  for (const l of route.legs) if ((dist.get(l.to) ?? Number.MAX_SAFE_INTEGER) > limit) return l.to;
  return null;
}

/** The regions a route passes, start excluded, in order. */
export function regionsOf(route: Route): RegionId[] {
  return route.legs.map((l) => l.to);
}

/** Overlap of two region lists, permille of the smaller (the destination always shared, so excluded). */
export function overlap(a: readonly RegionId[], b: readonly RegionId[]): number {
  const sa = new Set(a.slice(0, -1));
  const sb = b.slice(0, -1);
  if (sa.size === 0 || sb.length === 0) return a.length === b.length ? 1000 : 0;
  const shared = sb.filter((r) => sa.has(r)).length;
  return Math.trunc((shared * 1000) / Math.min(sa.size, sb.length));
}

/** The penalty that doubles the edges a route used (D4 flank). */
export function penaltyFor(routes: readonly Route[], permille: number): Penalty {
  const p = new Map<EdgeId, number>();
  for (const r of routes) for (const l of r.legs) p.set(l.edge, permille);
  return new Map([...p].sort(([a], [b]) => strictCompare(a, b)));
}
