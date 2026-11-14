/**
 * STAND-IN writer of standing goals (`plans`, until lane 0.9 and Phase 1).
 * Proposed by message arrival: an order reaching its addressee, or the
 * stand-in movement reaching an objective.
 */
import type { MessageId, PersonId, PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { IndexedWorld } from '../standin/world.ts';
import type { GoalSpec, StandingGoal } from './goal.ts';

/** Days within which a chain order stands against a newer order that went around the chain (0040: conflicting orders). */
export const CONFLICT_WINDOW_DAYS = 7;

/** The goals the scenario starts with: every field post holds where it stands. */
export function initialGoals(world: IndexedWorld): Readonly<Record<PostId, StandingGoal>> {
  const goals: Record<PostId, StandingGoal> = {};
  for (const id of world.postIds) {
    if (world.post(id).kind !== 'field') continue;
    goals[id] = { standingSpec: { goalSpecKind: 'hold', goalSpecRegion: null }, standingIssuer: null, standingViaChain: true, standingSetDay: 0, standingOrder: null };
  }
  return goals;
}

export interface OrderOutcome {
  /** `new`: he works to the order that just arrived; `kept`: he keeps the goal he had. */
  readonly obeyed: 'new' | 'kept';
  /** Whether two orders conflicted (0040), so he reports which he obeyed. */
  readonly conflict: boolean;
}

function sameGoal(a: GoalSpec, b: GoalSpec): boolean {
  return a.goalSpecKind === b.goalSpecKind && a.goalSpecRegion === b.goalSpecRegion;
}

/**
 * An order reaches the holder of `post`. A newer order from his own chain
 * supersedes what he had (0040). An order that went around his chain, against
 * a different chain order less than `CONFLICT_WINDOW_DAYS` old, conflicts: he
 * keeps the chain's order (stand-in for resolving by his compliance) and says so.
 */
export function receiveOrder(
  state: State,
  post: PostId,
  order: { readonly id: MessageId; readonly issuer: PersonId; readonly goal: GoalSpec; readonly viaChain: boolean },
  day: number,
): { readonly state: State; readonly outcome: OrderOutcome } {
  const current = state.standingGoals[post];
  if (current === undefined) throw new RangeError(`post ${post} has no standing goal to replace`);
  const differs = !sameGoal(current.standingSpec, order.goal);
  const conflict = differs && current.standingOrder !== null && current.standingIssuer !== order.issuer;
  if (conflict && !order.viaChain && current.standingViaChain && day - current.standingSetDay < CONFLICT_WINDOW_DAYS) {
    return { state, outcome: { obeyed: 'kept', conflict: true } };
  }
  const next: StandingGoal = { standingSpec: order.goal, standingIssuer: order.issuer, standingViaChain: order.viaChain, standingSetDay: day, standingOrder: order.id };
  return { state: { ...state, standingGoals: { ...state.standingGoals, [post]: next } }, outcome: { obeyed: 'new', conflict } };
}

/** The stand-in movement reached the objective: the goal becomes "hold" there. */
export function goalReached(state: State, post: PostId, region: RegionId, day: number): State {
  const current = state.standingGoals[post];
  if (current === undefined) throw new RangeError(`post ${post} has no standing goal`);
  const next: StandingGoal = { ...current, standingSpec: { goalSpecKind: 'hold', goalSpecRegion: region }, standingSetDay: day };
  return { ...state, standingGoals: { ...state.standingGoals, [post]: next } };
}
