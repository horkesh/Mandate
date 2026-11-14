/**
 * Expanding a route into an axis (planner-design D5): concentration, march
 * legs, works to reduce, clear or run past, depot steps when the route outruns
 * his stores, and the assault. Deterministic, integer permille days.
 */
import type { Ctx } from './context.ts';
import { search } from './route.ts';
import type { Axis, AxisMode, ForceStandIn, Phase, PostId, Route } from './types.ts';

export interface AxisSpec {
  readonly id: string;
  readonly post: PostId;
  readonly mode: AxisMode;
  readonly route: Route;
  readonly blocks: readonly ForceStandIn[];
  /** Insert a pause to bring a depot forward whenever days outside supply would exceed his stores (supply-line method). */
  readonly depotSteps: boolean;
  /** Overrides his concentration days (a timing edit). */
  readonly concentrationDays?: number;
  /** Days added to every pause and to concentration (a slow walk). */
  readonly stretchPermille?: number;
}

export function buildAxis(ctx: Ctx, spec: AxisSpec): Axis {
  const { profile, goal } = ctx.input;
  const phases: Phase[] = [];
  const staging = spec.route.from;
  // Blocks away from staging must march there first; the slowest sets concentration.
  let gather = 0;
  for (const b of spec.blocks) {
    if (b.region === staging || b.aboard !== null) continue;
    const r = search(ctx, b.region, staging, 'land', { riskWeight: 0, supplyCare: 0, obstacles: 'deliberate' });
    if (r !== null && r.daysPermille > gather) gather = r.daysPermille;
  }
  const stretch = spec.stretchPermille ?? 0;
  const concentrate = Math.max(gather, (spec.concentrationDays ?? profile.concentrationDays) * 1000) + stretch;
  let t = 0;
  phases.push({ kind: 'concentrate', startPermille: t, daysPermille: concentrate, region: staging });
  t += concentrate;
  const storesDays = spec.blocks.length === 0 ? 0 : Math.min(...spec.blocks.map((b) => b.storesDays));
  // His tether: how far past his last depot he will march, from his stores and his supply care.
  const tether = Math.trunc((storesDays * (1000 - profile.supplyCare) * 1000) / 1000);
  let longest = 0;
  let sinceDepot = 0;
  for (const leg of spec.route.legs) {
    if (leg.obstacle !== null) {
      phases.push({ kind: leg.obstacle, startPermille: t, daysPermille: leg.obstaclePermille, region: leg.from });
      t += leg.obstaclePermille;
    }
    const leaves = spec.mode === 'land' && !ctx.inSupply.has(leg.to);
    if (leaves && spec.depotSteps && sinceDepot > 0 && sinceDepot + leg.daysPermille > tether) {
      // Halt to bring a depot forward (D4 supply line): the stretch past supply starts again.
      const pause = profile.pauseDays * 1000 + stretch;
      phases.push({ kind: 'depot_step', startPermille: t, daysPermille: pause, region: leg.from });
      t += pause;
      sinceDepot = 0;
    }
    phases.push({ kind: 'march', startPermille: t, daysPermille: leg.daysPermille, region: leg.to });
    t += leg.daysPermille;
    sinceDepot = leaves ? sinceDepot + leg.daysPermille : 0;
    if (sinceDepot > longest) longest = sinceDepot;
  }
  const objective = spec.route.to;
  if ((ctx.input.beliefs.get(objective) ?? 0) > 0 && goal.posture === 'take') {
    phases.push({ kind: 'assault', startPermille: t, daysPermille: 1000, region: objective });
    t += 1000;
  }
  return {
    id: spec.id,
    post: spec.post,
    mode: spec.mode,
    route: spec.route,
    blocks: spec.blocks.map((b) => b.id),
    strength: spec.blocks.reduce((s, b) => s + b.strength, 0),
    phases,
    arrivalPermille: t,
    outOfSupplyPermille: longest,
    storesDays,
  };
}

/** A holding axis: no route, the force stays at staging. The honest "not yet" (D4). */
export function holdingAxis(ctx: Ctx, post: PostId, blocks: readonly ForceStandIn[], kind: 'hold' | 'await'): Axis {
  const staging = blocks[0]?.region ?? ctx.input.posts.find((p) => p.id === post)?.region ?? ctx.input.goal.objective;
  return {
    id: `${post}:${kind}`,
    post,
    mode: 'land',
    route: { from: staging, to: staging, legs: [], costPermille: 0, daysPermille: 0 },
    blocks: blocks.map((b) => b.id),
    strength: blocks.reduce((s, b) => s + b.strength, 0),
    phases: [{ kind, startPermille: 0, daysPermille: ctx.input.goal.deadlineDays * 1000, region: staging }],
    arrivalPermille: 0,
    outOfSupplyPermille: 0,
    storesDays: blocks.length === 0 ? 0 : Math.min(...blocks.map((b) => b.storesDays)),
  };
}

/** Split blocks over axes in proportion to each axis's perceived opposition, best blocks to the first (D5). */
export function splitBlocks(blocks: readonly ForceStandIn[], weights: readonly number[]): ForceStandIn[][] {
  const out: ForceStandIn[][] = weights.map(() => []);
  const got = weights.map(() => 0);
  const total = weights.reduce((s, x) => s + Math.max(1, x), 0);
  for (const b of blocks) {
    // Give the block to the axis furthest below its share (ties to the earlier axis).
    let pick = 0;
    let worst = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < weights.length; i++) {
      const share = Math.trunc((got[i]! * total * 1000) / Math.max(1, weights[i]!));
      if (share < worst) {
        worst = share;
        pick = i;
      }
    }
    out[pick]!.push(b);
    got[pick]! += b.strength;
  }
  return out;
}
