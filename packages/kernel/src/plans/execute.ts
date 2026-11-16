/**
 * STAND-IN, owned by lane 1.4 (0073): the execution adapter. Until lane 1.4's operations take execution over, an
 * approved plan executes through Phase 0's standing-goal path (`tick/standing.ts`): hold, or advance to its objective.
 * The plan's route, phases, depot steps, partner axes and support requests are not yet executed; only its objective is.
 * Lane 1.4 retires this file, `StandingGoal` and the `standingGoals` field together.
 */
import type { PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { GoalSpec, StandingGoal } from './goal.ts';
import type { PlanRecord } from './plans.ts';

/** What an approved plan has the movement path do: advance to its own main axis's end, or hold. */
export function specOf(post: PostId, record: PlanRecord): GoalSpec {
  const plan = record.planApproved;
  if (record.planStatus !== 'approved' || plan === null || plan.candMethod === 'holding') return { goalSpecKind: 'hold', goalSpecRegion: null };
  const axis = plan.candAxes.find((a) => a.axisPost === post && a.axisRoute.routeLegs.length > 0);
  return axis === undefined ? { goalSpecKind: 'hold', goalSpecRegion: null } : { goalSpecKind: 'advance', goalSpecRegion: axis.axisRoute.routeTo };
}

/** Write the movement path's goal for a post from its plan record (after any change to the record). */
export function execute(state: State, post: PostId, day: number): State {
  const record = state.planRecords[post];
  if (record === undefined) return state;
  const spec = specOf(post, record);
  const current = state.standingGoals[post];
  if (current !== undefined && current.standingSpec.goalSpecKind === spec.goalSpecKind && current.standingSpec.goalSpecRegion === spec.goalSpecRegion && current.standingOrder === record.planOrder) {
    return state;
  }
  const next: StandingGoal = { standingSpec: spec, standingIssuer: record.planIssuer, standingViaChain: record.planViaChain, standingSetDay: day, standingOrder: record.planOrder };
  return { ...state, standingGoals: { ...state.standingGoals, [post]: next } };
}

/** The movement path reached the objective: it holds there. */
export function goalReached(state: State, post: PostId, region: RegionId, day: number): State {
  const current = state.standingGoals[post];
  if (current === undefined) throw new RangeError(`post ${post} has no goal to reach`);
  const next: StandingGoal = { ...current, standingSpec: { goalSpecKind: 'hold', goalSpecRegion: region }, standingSetDay: day };
  return { ...state, standingGoals: { ...state.standingGoals, [post]: next } };
}
