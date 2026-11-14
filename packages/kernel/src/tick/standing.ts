/**
 * STAND-IN for operations and movement (lanes 0.5 and 0.9): a commander with
 * a standing goal "advance" takes the step his seat chose from the morning's
 * menu, and the headquarters moves. Reaching the objective turns the goal
 * into "hold" there and wires the principal. No divisions move here.
 */
import type { OptionView } from '../seats/api.ts';
import type { PostId } from '../ids.ts';
import { moveHeadquarters } from '../movement/headquarters.ts';
import { goalReached } from '../plans/standing.ts';
import type { State } from '../root-state.ts';
import { fire, sendReport, type TickContext } from './context.ts';

/**
 * Apply each post's step. `menus` are the morning's options (what the seat was
 * offered); `choices` the logged answers by post. A goal that changed today
 * waits for tomorrow's menu.
 */
export function applyStanding(ctx: TickContext, start: State, menus: ReadonlyMap<PostId, readonly OptionView[]>, choices: ReadonlyMap<PostId, string>): State {
  let state = start;
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
        ctx.events.push({ event: 'seat_defaulted', person: ctx.world.post(post).holder!, post, message: null, terms: [] });
      }
    }
    if (chosen.kind !== 'advance' || chosen.region === null) continue;
    state = moveHeadquarters(state, post, chosen.region, ctx.day);
    fire(ctx, 'standin.advance');
    if (chosen.region === goal.standingSpec.goalSpecRegion) {
      state = goalReached(state, post, chosen.region, ctx.day);
      fire(ctx, 'standin.goal_reached');
      const holder = ctx.world.post(post).holder!;
      sendReport(ctx, state, {
        body: {
          reportType: 'wire-dispatch',
          reportSubtype: null,
          reportAuthor: holder,
          reportAuthorPost: post,
          reportSubjectKind: 'post',
          reportSubjectId: post,
          reportClaims: [{ claimKind: 'arrived', claimRegion: chosen.region, claimValue: 1, claimToken: null, claimConfidence: 1000 }],
          reportDay: ctx.day,
          reportHour: null,
          reportAdvice: null,
          reportAnswers: goal.standingOrder,
        },
        truth: { truthTerms: [], truthTrimmed: [] },
        to: ctx.world.faction(ctx.world.post(post).faction).principal,
        tag: `arrived.${post}`,
      });
    }
  }
  return state;
}
