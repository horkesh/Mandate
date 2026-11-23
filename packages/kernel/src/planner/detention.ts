import { strictCompare } from '../compare.ts';
import type { RegionId } from '../ids.ts';
import { adjacent, detentionProblems } from '../plans/detention.ts';
import type { DetentionPurpose } from '../plans/goal.ts';
import { canonicalHash } from '../serialize/hash.ts';
import { buildAxis } from './axes.ts';
import type { Ctx } from './context.ts';
import { own, weights } from './methods.ts';
import { search } from './route.ts';
import { demandFor, makeCandidate } from './score.ts';
import type { DemonstrationCourse, DetentionCourse, DraftSet, GateKind, PlanCandidate, PlanGate, PlanRejected, PlanRoute } from './types.ts';

export function routeDays(route: PlanRoute): number {
  return route.routeLegs.reduce((sum, leg) => sum + Math.ceil(leg.legDays / 1000), 0);
}

export function courseDays(course: DemonstrationCourse, approach: PlanRoute): number {
  return routeDays(approach) + 1 + course.intervals + routeDays(course.recovery) + course.reserveDays;
}

/** One allocation, and one bounded pair of land routes per eligible regional endpoint. */
export function detentionDraft(ctx: Ctx, purpose: DetentionPurpose): DraftSet {
  const { input } = ctx;
  const map = input.ground.map;
  const policy = map.world.rules.plans.demonstration;
  const picture = input.detentionPicture;
  const common: PlanGate[] = [];
  const candidates: PlanCandidate[] = [];
  const rejected: PlanRejected[] = [];
  const gate = (gateKind: GateKind, gateDetail: string): PlanGate => ({ gateKind, gateDetail, gateHard: true });
  const blocks = own(ctx);
  const staging = blocks[0]?.region;
  for (const problem of detentionProblems(map, purpose)) common.push(gate('detention_policy', problem));
  if (!purpose.detentionArea.some(r => picture?.targetRegions.has(r))) common.push(gate('no_target', 'no fresh received attribution to the opposing command in the detention area'));
  if (staging === undefined || blocks.some(b => b.strength <= 0 || b.aboard !== null || picture?.unavailable.has(b.id))) {
    common.push(gate('no_forces', 'a known, available land allocation is required'));
  }
  if (staging !== undefined && (!purpose.actionArea.includes(staging) || blocks.some(b => b.region !== staging))) {
    common.push(gate('no_route', 'allocated blocks must assemble in the action area'));
  }
  if (input.goal.goalCommitted.some(b => !blocks.some(f => f.id === b))) common.push(gate('no_forces', 'a committed block is unavailable'));

  const reject = (variant: string, rejGates: PlanGate[]) => rejected.push({ rejMethod: 'direct', rejVariant: variant, rejGates });
  if (common.length > 0) reject(purpose.kind, common);
  else if (policy !== undefined && staging !== undefined) {
    const regions = new Set(purpose.actionArea);
    const detention = new Set(purpose.detentionArea);
    const scope: Ctx = { ...ctx, regions };
    const endpoints = [...regions].sort(strictCompare).filter(r => detention.has(r) || adjacent(map, r, detention));
    for (const endpoint of endpoints) {
      const goals = { ...input.goal, goalPurpose: undefined, goalObjective: endpoint, goalPosture: 'take' } as const;
      const attackCtx: Ctx = { ...scope, input: { ...input, goal: goals } };
      const route = (from: RegionId, to: RegionId) => attackCtx.searches >= input.rules.maxSearches ? null :
        search(attackCtx, from, to, 'land', weights(attackCtx));
      const approach = route(staging, endpoint);
      const recovery = route(endpoint, staging);
      scope.searches = attackCtx.searches;
      const record = (variant: string, course: DetentionCourse, local: Ctx, gates: PlanGate[]) => {
        if (gates.length > 0 || approach === null) {
          reject(variant, gates);
          return;
        }
        const expanded = buildAxis(local, { name: 'main', post: input.post, mode: 'land', route: approach, blocks, depotSteps: false });
        const axis = course.means === 'attack' ? expanded : { ...expanded,
          axisArrival: expanded.axisArrival + course.intervals * 1000,
          axisPhases: [...expanded.axisPhases, { phaseKind: 'hold' as const, phaseStart: expanded.axisArrival,
            phaseDays: course.intervals * 1000, phaseRegion: endpoint }],
        };
        const scored = makeCandidate(local, 'direct', variant, [axis], []);
        if (course.means === 'attack' && (scored.candRatio < demandFor(local) || scored.candConditions.length > 0)) {
          reject(variant, [gate('insufficient_force', 'the allocation cannot meet the ordinary attack demand')]);
          return;
        }
        candidates.push({ ...scored, id: `detention:${canonicalHash({ purpose, variant, endpoint, blocks: axis.axisBlocks, approach, course }).slice(0, 24)}`,
          candDetention: course, candConditions: [], candRequests: [] });
      };
      const routeGate = approach === null ? [gate('no_route', 'no authorized approach within the search budget')] : [];
      const attackGates = [...routeGate];
      if (picture?.targetRegions.has(endpoint) && detention.has(endpoint)) {
        if (!picture.freshEstimates.has(endpoint) || !input.beliefs.has(endpoint)) {
          attackGates.push(gate('insufficient_force', 'a current enemy estimate is required for attack'));
        }
      } else {
        attackGates.push(gate('no_target', 'the received attribution does not place the target at this attack endpoint'));
      }
      if (approach !== null && blocks.some(b => b.storesDays < input.profile.concentrationDays + routeDays(approach))) {
        attackGates.push(gate('insufficient_stores', 'the force cannot carry stores through approach'));
      }
      record(`attack.${endpoint}`, { means: 'attack' }, attackCtx, attackGates);
      const activityCtx: Ctx = { ...attackCtx, input: { ...attackCtx.input, goal: { ...goals, goalPosture: 'hold' } } };
      const tasks = [...policy.deploymentDays.map(intervals => ({ task: 'deployment' as const, intervals })),
        { task: 'reconnaissance_in_force' as const, intervals: policy.reconnaissanceDays }];
      for (const task of tasks) {
        const variant = `${task.task}.${task.intervals}.${endpoint}`;
        const gates = [...routeGate];
        if (approach !== null && approach.routeLegs.length === 0 && task.task === 'deployment') {
          gates.push(gate('no_deployment_march', 'deployment requires a movement leg'));
        }
        if (recovery === null) gates.push(gate('no_route', 'no authorized recovery within the search budget'));
        else {
          const stops = [recovery.routeFrom, ...recovery.routeLegs.map(l => l.legTo)];
          if (stops.some(r => !picture?.freshEstimates.has(r))) gates.push(gate('unknown_recovery', 'missing fresh recovery estimate'));
          if (recovery.routeLegs.some(l => (input.beliefs.get(l.legTo) ?? 0) > 0 && l.legHeld)) {
            gates.push(gate('no_route', 'received picture places a hostile force on the recovery line'));
          }
          const course = { means: 'demonstrate' as const, ...task, recovery, reserveDays: policy.reserveDays };
          if (approach !== null && blocks.some(b => b.storesDays < input.profile.concentrationDays + courseDays(course, approach))) {
            gates.push(gate('insufficient_stores', 'carried stores must cover preparation, both routes, task and reserve'));
          }
          record(variant, course, activityCtx, gates);
        }
        if (recovery === null) reject(variant, gates);
      }
    }
    ctx.searches = scope.searches;
  }
  const sorted = candidates.sort((a, b) => b.candScore - a.candScore || strictCompare(a.id, b.id));
  const selected = sorted.slice(0, input.rules.topN);
  return { draftCommander: input.profile.person, draftPost: input.post, draftFaction: input.faction, draftDay: input.day,
    draftCandidates: selected, draftRejected: rejected, draftSearches: ctx.searches, draftGenerated: candidates.length + rejected.length,
    draftDeduplicated: 0, draftFeasible: candidates.length, draftTruncated: candidates.length - selected.length };
}
