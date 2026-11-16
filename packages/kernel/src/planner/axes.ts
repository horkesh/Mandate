/**
 * Expanding a route into an axis (planner-design D5): concentration, march legs, works to reduce, clear or run past,
 * a phase for each enemy-held region on the way (an assault where he believes it garrisoned, a reduction where he has
 * been told it is fortified: lane 0.9 finding 9), depot steps when the route outruns his stores, and the objective's
 * own reduction and assault. Deterministic, integer permille days.
 */
import type { PostId } from '../ids.ts';
import { enemyHeld, type Ctx } from './context.ts';
import { search, type SearchMode } from './route.ts';
import type { PlanAxis, AxisMode, PlanPhase, PlannerForce, PlanRoute } from './types.ts';

export interface AxisSpec {
  readonly name: string;
  readonly post: PostId;
  readonly mode: AxisMode;
  readonly route: PlanRoute;
  readonly blocks: readonly PlannerForce[];
  /** Pause to bring a depot forward whenever the stretch past supply would outrun his tether (the supply-line method). */
  readonly depotSteps: boolean;
  /** Overrides his concentration days (a timing edit). */
  readonly concentrationDays?: number;
  /** Days added to every pause and to concentration (a slow walk). */
  readonly stretch?: number;
}

export function searchModeOf(mode: AxisMode): SearchMode {
  return mode === 'land' ? 'land' : 'water';
}

export function buildAxis(ctx: Ctx, spec: AxisSpec): PlanAxis {
  const { profile, goal, rules, works, beliefs, ground, faction } = ctx.input;
  const phases: PlanPhase[] = [];
  const staging = spec.route.routeFrom;
  // Blocks away from staging must march there first; the slowest sets concentration.
  let gather = 0;
  for (const b of spec.blocks) {
    if (b.region === staging || b.aboard !== null) continue;
    const r = search(ctx, b.region, staging, 'land', { riskWeight: 0, supplyCare: 0, obstacles: 'deliberate' });
    if (r !== null && r.routeDays > gather) gather = r.routeDays;
  }
  const stretch = spec.stretch ?? 0;
  const concentrate = Math.max(gather, (spec.concentrationDays ?? profile.concentrationDays) * 1000) + stretch;
  let t = 0;
  const push = (kind: PlanPhase['phaseKind'], days: number, region: PlanPhase['phaseRegion']) => {
    phases.push({ phaseKind: kind, phaseStart: t, phaseDays: days, phaseRegion: region });
    t += days;
  };
  push('concentrate', concentrate, staging);
  const storesDays = spec.blocks.length === 0 ? 0 : Math.min(...spec.blocks.map((b) => b.storesDays));
  // His tether: how far past his last depot he will march, from his stores and his want of supply care.
  const tether = storesDays * (1000 - profile.supplyCare);
  let longest = 0;
  let sinceDepot = 0;
  const objective = spec.route.routeTo;
  for (const leg of spec.route.routeLegs) {
    if (leg.legObstacle !== null) push(leg.legObstacle, leg.legObstacleDays, leg.legFrom);
    const leaves = spec.mode === 'land' && !ctx.inSupply.has(leg.legTo);
    if (leaves && spec.depotSteps && sinceDepot > 0 && sinceDepot + leg.legDays > tether) {
      // Halt to bring a depot forward (D4's supply line): the stretch past supply starts again.
      push('depot_step', profile.pauseDays * 1000 + stretch, leg.legFrom);
      sinceDepot = 0;
    }
    push('march', leg.legDays, leg.legTo);
    sinceDepot = leaves ? sinceDepot + leg.legDays : 0;
    if (sinceDepot > longest) longest = sinceDepot;
    // Enemy-held ground short of the objective: reduce its works, then assault its garrison (lane 0.9 finding 9).
    if (leg.legHeld && leg.legTo !== objective) {
      const w = works.get(leg.legTo) ?? 0;
      if (w > 0) push('reduce', w * rules.reducePerLevel, leg.legTo);
      if ((beliefs.get(leg.legTo) ?? 0) > 0) push('assault', rules.assaultDays, leg.legTo);
    }
  }
  // The objective: works to reduce where the enemy holds it fortified, and an assault where he would take it from a garrison.
  if (goal.goalPosture !== 'hold' && enemyHeld(ground.index, objective, faction)) {
    const w = works.get(objective) ?? 0;
    if (w > 0) push('reduce', w * rules.reducePerLevel, objective);
  }
  if ((beliefs.get(objective) ?? 0) > 0 && goal.goalPosture === 'take') push('assault', rules.assaultDays, objective);
  return {
    axisName: spec.name,
    axisPost: spec.post,
    axisMode: spec.mode,
    axisRoute: spec.route,
    axisBlocks: spec.blocks.map((b) => b.id),
    axisStrength: spec.blocks.reduce((s, b) => s + b.strength, 0),
    axisPhases: phases,
    axisArrival: t,
    axisOutOfSupply: longest,
    axisStoresDays: storesDays,
    axisStoresAssumed: spec.blocks.some((b) => b.storesAssumed),
  };
}

/** A holding axis: no route, the force stays at staging. The honest "not yet" (D4), or "assemble and await my word". */
export function holdingAxis(ctx: Ctx, post: PostId, blocks: readonly PlannerForce[], kind: 'await' | 'hold'): PlanAxis {
  const staging = blocks[0]?.region ?? ctx.input.posts.find((p) => p.id === post)?.region ?? ctx.input.goal.goalObjective!;
  return {
    axisName: kind,
    axisPost: post,
    axisMode: 'land',
    axisRoute: { routeFrom: staging, routeTo: staging, routeLegs: [], routeCost: 0, routeDays: 0 },
    axisBlocks: blocks.map((b) => b.id),
    axisStrength: blocks.reduce((s, b) => s + b.strength, 0),
    axisPhases: [{ phaseKind: kind, phaseStart: 0, phaseDays: ctx.input.goal.goalDeadlineDays * 1000, phaseRegion: staging }],
    axisArrival: 0,
    axisOutOfSupply: 0,
    axisStoresDays: blocks.length === 0 ? 0 : Math.min(...blocks.map((b) => b.storesDays)),
    axisStoresAssumed: blocks.some((b) => b.storesAssumed),
  };
}

/** Split blocks over axes in proportion to the weights, best blocks first, each to the axis furthest below its share (D5). */
export function splitBlocks(blocks: readonly PlannerForce[], weights: readonly number[]): PlannerForce[][] {
  const out: PlannerForce[][] = weights.map(() => []);
  const got = weights.map(() => 0);
  const total = weights.reduce((s, x) => s + Math.max(1, x), 0);
  for (const b of blocks) {
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
