/**
 * STAND-IN, owned by lane 1.4 (0073): movement executing approved plans through Phase 0's standing-goal path (FOUNDATION
 * section 10, day-tick phase 3). An approved plan has the execution adapter (`plans/execute.ts`) tell this path to hold
 * or to advance to the plan's objective; a post advancing starts its marching group on the first leg of a quickest
 * route there (`movement/march.ts`, ties by edge id). Then every march gains a day. When the group stands at the
 * objective, the goal becomes "hold" there and he wires the principal. Lane 1.4's operations retire this path.
 *
 * The player never moves a division (hard rule 1): the plan is the commander's own, drafted by the kernel's planner
 * and chosen by his seat; the goal behind it is the principal's order.
 */
import { advanceMarches, marchSteps, startLeg } from '../movement/march.ts';
import type { PostId } from '../ids.ts';
import { goalReached } from '../plans/execute.ts';
import type { State } from '../root-state.ts';
import { headquartersOf, postFaction } from '../seats/posts.ts';
import { marchingGroup, morningGround } from '../seats/requests.ts';
import { fire, sendReport, type TickContext } from './context.ts';

/** Every mechanic movement counts in the tick. */
export const MOVEMENT_MECHANICS = ['movement.arrived', 'movement.leg_started', 'plans.goal_reached'] as const;

/** Start each advancing post's next leg, advance every march, and settle goals reached. A goal set today waits for tomorrow. */
export function applyStanding(ctx: TickContext, start: State): State {
  let state = start;
  const ground = morningGround(ctx.world, state, ctx.day).march;
  for (const post of Object.keys(state.standingGoals).sort() as PostId[]) {
    const goal = state.standingGoals[post]!;
    const target = goal.standingSpec.goalSpecRegion;
    if (goal.standingSetDay === ctx.day || goal.standingSpec.goalSpecKind !== 'advance' || target === null) continue;
    if ((state.postStates[post]?.postHolder ?? null) === null) continue;
    const side = postFaction(ctx.world, state, post);
    if (side === null) continue;
    const group = marchingGroup(ctx.world, state, post);
    if (group.marching || group.blocks.length === 0 || group.from === target) continue;
    const step = marchSteps(ground, group.from, target, side, group.naval)[0];
    if (step === undefined) continue;
    state = startLeg(ground, state, group.blocks, step.leg, side, group.naval, ctx.day);
    fire(ctx, 'movement.leg_started');
  }

  const marched = advanceMarches(state, ctx.day);
  state = marched.state;
  for (const a of marched.arrivals) fire(ctx, 'movement.arrived', 1 + a.carried.length);

  // Goals reached: the group stands at the objective and nobody is still on the road.
  for (const post of Object.keys(state.standingGoals).sort() as PostId[]) {
    const goal = state.standingGoals[post]!;
    const target = goal.standingSpec.goalSpecRegion;
    if (goal.standingSpec.goalSpecKind !== 'advance' || target === null) continue;
    const holder = state.postStates[post]?.postHolder ?? null;
    const side = postFaction(ctx.world, state, post);
    if (holder === null || side === null) continue;
    const group = marchingGroup(ctx.world, state, post);
    if (group.marching || headquartersOf(ctx.world, state, post) !== target) continue;
    state = goalReached(state, post, target, ctx.day);
    fire(ctx, 'plans.goal_reached');
    sendReport(ctx, state, {
      body: {
        reportType: 'wire-dispatch',
        reportSubtype: null,
        reportAuthor: holder,
        reportAuthorPost: post,
        reportSubjectKind: 'post',
        reportSubjectId: post,
        reportClaims: [{ claimKind: 'arrived', claimRegion: target, claimValue: 1, claimToken: null, claimConfidence: 1000 }],
        reportDay: ctx.day,
        reportHour: null,
        reportAdvice: null,
        reportAnswers: goal.standingOrder,
      },
      truth: { truthTerms: [], truthTrimmed: [] },
      to: ctx.world.faction(side).principal,
      tag: `arrived.${post}`,
    });
  }
  return state;
}
