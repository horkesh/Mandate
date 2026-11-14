/**
 * Movement executing commanders' steps (FOUNDATION section 10, day-tick phase
 * 3; lane 0.5). A commander with a standing goal "advance" takes the step his
 * seat chose from the morning's menu: his marching group starts on that leg
 * (`movement/march.ts`). Then every march gains a day. When his group stands
 * at the objective, the goal becomes "hold" there and he wires the principal.
 *
 * The player never moves a division (hard rule 1): steps come only from the
 * kernel's menu of a holder's options, the goal from a principal's order.
 * Standing goals stand in for lane 0.9's planner and Phase 1's plans.
 */
import { advanceMarches, marchSteps, startLeg } from '../movement/march.ts';
import type { PostId } from '../ids.ts';
import { goalReached } from '../plans/standing.ts';
import type { State } from '../root-state.ts';
import type { OptionView } from '../seats/api.ts';
import { headquartersOf, postFaction } from '../seats/posts.ts';
import { marchingGroup, morningGround } from '../seats/requests.ts';
import { fire, sendReport, type TickContext } from './context.ts';

/** Every mechanic movement counts in the tick. */
export const MOVEMENT_MECHANICS = ['movement.arrived', 'movement.leg_started', 'plans.goal_reached'] as const;

/**
 * Apply each post's step, advance every march, and settle goals reached.
 * `menus` are the morning's options (what the seat was offered); `choices` the
 * logged answers by post. A goal that changed today waits for tomorrow's menu.
 */
export function applyStanding(ctx: TickContext, start: State, menus: ReadonlyMap<PostId, readonly OptionView[]>, choices: ReadonlyMap<PostId, string>): State {
  let state = start;
  const ground = morningGround(ctx.world, state, ctx.day).march;
  for (const [post, options] of [...menus].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    const goal = state.standingGoals[post]!;
    if (goal.standingSetDay === ctx.day) continue;
    const chosenId = choices.get(post);
    let chosen = options.find((o) => o.optionId === chosenId);
    if (chosen === undefined) {
      chosen = options[0]!;
      if (options.length > 1) {
        // A request went unanswered: the first option, logged as a default (replay reproduces it).
        fire(ctx, 'seats.defaulted');
        ctx.events.push({ event: 'seat_defaulted', person: state.postStates[post]!.postHolder!, post, message: null, terms: [] });
      }
    }
    if (chosen.kind !== 'advance' || chosen.region === null || goal.standingSpec.goalSpecRegion === null) continue;
    const side = postFaction(ctx.world, state, post)!;
    const group = marchingGroup(ctx.world, state, post);
    // The step as offered this morning; the ground has not changed since the menus were built.
    const step = marchSteps(ground, group.from, goal.standingSpec.goalSpecRegion, side, group.naval).find((s) => s.leg.to === chosen.region);
    // The menu was built from this same morning ground, and a marching group is offered no step: a missing step is a kernel bug.
    if (step === undefined || group.blocks.length === 0 || group.marching) throw new RangeError(`day ${ctx.day}: post ${post}'s step to ${chosen.region} was offered this morning and is gone`);
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
    if (holder === null) continue;
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
      to: ctx.world.faction(postFaction(ctx.world, state, post)!).principal,
      tag: `arrived.${post}`,
    });
  }
  return state;
}
