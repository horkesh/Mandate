/**
 * STAND-IN writer of standing goals (`plans`, until lane 0.9 and Phase 1).
 * Proposed by message arrival: an order reaching its addressee, or the
 * stand-in movement reaching an objective.
 */
import type { MessageId, PersonId, PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { AssignmentTable, PostTable } from '../command/command.ts';
import type { WorldIndex } from '../world/index.ts';
import type { GoalSpec, StandingGoal } from './goal.ts';

/**
 * The goals the scenario starts with: every held field post on a side (one that commands a force block)
 * holds where it stands. Read from the post and assignment tables `command` was just given at setup.
 */
export function initialGoals(map: WorldIndex, posts: PostTable, assignments: AssignmentTable): Readonly<Record<PostId, StandingGoal>> {
  const sided = new Set(map.world.departments.filter((d) => d.faction !== null).map((d) => d.id));
  const commanding = new Set(Object.values(assignments).filter((p): p is PostId => p !== null));
  const goals: Record<PostId, StandingGoal> = {};
  for (const id of (Object.keys(posts) as PostId[]).sort()) {
    const p = posts[id]!;
    if (p.postHolder === null || !commanding.has(id) || !sided.has(p.postDepartment)) continue;
    goals[id] = holdWhereHeStands(0);
  }
  return goals;
}

/** A goal no one ordered: hold where he stands, from `day`. */
function holdWhereHeStands(day: number): StandingGoal {
  return { standingSpec: { goalSpecKind: 'hold', goalSpecRegion: null }, standingIssuer: null, standingViaChain: true, standingSetDay: day, standingOrder: null };
}

/**
 * Every field post on a side has a standing goal (exit review S1). A post becomes one during play when its government
 * joins a side (0065): `command` writes the side, and `plans`, which owns goals, gives each such post with no goal a
 * goal to hold where it stands, from `day`, as the start gives every field post. `fieldPosts` are today's held posts on
 * a side that command a block (`seats/posts.ts`), in id order. Returns the State unchanged when none lacks a goal.
 */
export function holdGoalsForNewFieldPosts(state: State, fieldPosts: readonly PostId[], day: number): State {
  let goals: Record<PostId, StandingGoal> | null = null;
  for (const post of fieldPosts) {
    if (state.standingGoals[post] !== undefined) continue;
    goals ??= { ...state.standingGoals };
    goals[post] = holdWhereHeStands(day);
  }
  return goals === null ? state : { ...state, standingGoals: goals };
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
 * An order reaches the holder of `post`. Two orders conflict (0040) when they
 * differ, the one he holds is less than the pack's conflict window old
 * (`WorldRules.standing.conflictWindowDays`, `windowDays` here), and one
 * came down his chain while the other went around it: with relays holding
 * orders, they arrive out of the order they were written. He resolves it by
 * his department (stand-in for resolving by his compliance): the chain's order
 * stands against one that went around it, and a chain order supersedes one
 * that went around (0040: a newer order from his own department supersedes).
 * Either way he says which he obeyed. A post with no goal (none should be left by
 * `holdGoalsForNewFieldPosts`, but an order may reach a post that no longer
 * commands a block) reads as one holding since day 0 on no order: the order is
 * obeyed, never a crash (exit review S1).
 */
export function receiveOrder(
  state: State,
  post: PostId,
  order: { readonly id: MessageId; readonly issuer: PersonId; readonly goal: GoalSpec; readonly viaChain: boolean },
  day: number,
  windowDays: number,
): { readonly state: State; readonly outcome: OrderOutcome } {
  const current = state.standingGoals[post] ?? holdWhereHeStands(0);
  const differs = !sameGoal(current.standingSpec, order.goal);
  const recent = current.standingOrder !== null && day - current.standingSetDay < windowDays;
  const conflict = differs && recent && current.standingViaChain !== order.viaChain;
  if (conflict && !order.viaChain) return { state, outcome: { obeyed: 'kept', conflict: true } };
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
