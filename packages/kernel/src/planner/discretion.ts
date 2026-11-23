/** Goal alternatives and the geography of conditional discretion, from the commander's planner picture. */
import { strictCompare } from '../compare.ts';
import type { RegionId } from '../ids.ts';
import type { GoalProposalReason } from '../knowledge/report.ts';
import type { Discretion, PlanGoal } from '../plans/goal.ts';
import { otherEnd } from '../world/graph.ts';
import { blocksOf, makeCtx, type PlannerInput } from './context.ts';
import { compareCandidates } from './draft.ts';
import { direct, directRoute, own, weights } from './methods.ts';
import { search } from './route.ts';
import { shortfallShare } from './score.ts';
import type { DraftSet } from './types.ts';

/** Adjacent areas he can engage on land. Water passage requires a separate, authorised mode. */
export function landNeighbours(input: PlannerInput, region: RegionId): RegionId[] {
  return [...new Set((input.ground.map.edgesAt.get(region) ?? [])
    .filter(e => e.type === 'road' || (e.type === 'rail' && input.goal.goalRail))
    .map(e => otherEnd(e, region)))].sort(strictCompare);
}

export function discretionThreat(input: PlannerInput, position: RegionId, grant: Discretion<PlanGoal>): { region: RegionId; estimate: number; strength: number; threshold: number } | null {
  const blocks = blocksOf(input, input.post, input.goal.goalCommitted).filter(b => !b.naval);
  const strength = blocks.reduce((men, block) => men + (block.region === position ? block.strength : 0), 0);
  if (strength <= 0) return null;
  // A cautious commander tolerates the same relative shortfall here that he tolerates when judging a draft.
  const tolerance = grant.condition === 'outmatched' ? Math.max(0, shortfallShare(input)) : 0;
  if (tolerance >= 1000) return null;
  const threshold = Math.trunc(strength * 1000 / (1000 - tolerance));
  let regions: RegionId[];
  if (grant.condition === 'outmatched') {
    regions = [position, ...landNeighbours(input, position)];
  } else {
    if (![...input.beliefs.values()].some(estimate => estimate > threshold)) return null;
    const ctx = makeCtx({ ...input, goal: grant.fallback });
    const objective = grant.fallback.goalObjective;
    const route = objective === null ? null : search(ctx, position, objective, 'land', weights(ctx, { supplyCare: 0 }));
    const line = route?.routeLegs.map(l => l.legTo) ?? [];
    // An enemy on the line, or able to reach both the position and its line from the side, may turn it.
    const flank = landNeighbours(input, position).filter(r => line.some(t => landNeighbours(input, t).includes(r)));
    regions = [...new Set([...line, ...flank])].filter(r => r !== position);
  }
  const threats = regions.map(region => ({ region, estimate: input.beliefs.get(region) ?? 0 }))
    .filter(r => r.estimate > threshold)
    .sort((a, b) => b.estimate - a.estimate || strictCompare(a.region, b.region));
  const worst = threats[0];
  return worst === undefined ? null : { ...worst, strength, threshold };
}

/** At most one direct search per safer neighbouring position, within the planner's normal search limit. */
export function preferableGoal(input: PlannerInput, drafted: DraftSet): { choice: { goal: PlanGoal; reason: GoalProposalReason } | null; searches: number } {
  const winner = drafted.draftCandidates[0];
  const { goalDiscretion: _grant, ...base } = input.goal;
  if (base.goalPosture !== 'hold') {
    if (winner?.candMethod !== 'holding') return { choice: null, searches: 0 };
    return { searches: 0, choice: { goal: { ...base, goalObjective: null, goalPosture: 'hold' },
      reason: { kind: 'hold_preferred', orderedScore: drafted.draftCandidates.find(c => c.candMethod !== 'holding')?.candScore ?? null, preferredScore: winner.candScore } } };
  }
  const ctx = makeCtx(input);
  const position = base.goalObjective ?? own(ctx)[0]?.region;
  if (position === undefined) return { choice: null, searches: 0 };
  const heldThreat = ctx.threat.get(position) ?? 0;
  if (heldThreat === 0) return { choice: null, searches: 0 };
  const neighbours = landNeighbours(input, position).filter(r => input.ground.index.holdings.get(r)?.holder === input.faction)
    .map(region => ({ region, threat: ctx.threat.get(region) ?? 0 }))
    .filter(r => r.threat < heldThreat)
    .sort((a, b) => a.threat - b.threat || strictCompare(a.region, b.region))
    .slice(0, Math.min(input.rules.topN, Math.max(0, input.rules.maxSearches - drafted.draftSearches)));
  let searches = 0;
  const alternatives = neighbours.flatMap(n => {
    const goal = { ...base, goalObjective: n.region };
    const alternative = { ...ctx, input: { ...input, goal }, searches: 0 };
    const plan = direct(alternative, directRoute(alternative));
    searches += alternative.searches;
    return 'ok' in plan && !plan.ok.candConditions.some(g => g.gateKind === 'move_when_reinforced')
      ? [{ goal, candidate: plan.ok, threat: n.threat }] : [];
  }).sort((a, b) => compareCandidates(a.candidate, b.candidate));
  const best = alternatives[0];
  const ordered = drafted.draftCandidates.find(c => c.candMethod !== 'holding');
  // A hold in place has no route to score. A proposed movement must be safer and score at least as well as any ordered route.
  if (best === undefined || (ordered !== undefined && best.candidate.candScore < ordered.candScore)) return { choice: null, searches };
  return { searches, choice: { goal: best.goal, reason: { kind: 'safer_position', heldThreat, preferredThreat: best.threat } } };
}
