/**
 * Support requests (FOUNDATION section 5; lane 1.4): a commander whose plan needs another holder's force sends that
 * holder a directive; it travels like any message, and the holder answers on arrival by his own compliance, with his
 * regard for the man asking (lane 1.1's `answerOrder`). `proxy` records the response; the operation keeps its key and
 * the rung he acts on. So a pincer can fail for a human reason: the partner refuses, or slow-walks past the window.
 *
 * - comply, exceed, or comply with reservations: the axis moves;
 * - slow walk or reinterpret: it moves after the pack's relay hold for that rung (`people.relay`);
 * - object or refuse: it never moves.
 * He wires his declared rung back to the man who asked, never his true one (0022).
 */
import type { DirectiveResponse } from '../directive.ts';
import type { MessageId, PersonId, PostId } from '../ids.ts';
import { term } from '../knowledge/truth.ts';
import { mintMessageId, type TransitMessage } from '../messages/transit.ts';
import { openOperations, putOperations, type OpRequest, type RequestAnswer } from '../operations/operations.ts';
import type { PlanGoal } from '../plans/goal.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { answerOrder, goalTerms } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import { fire, hop, oversightOf, sendReport, whereIs, type TickContext } from './context.ts';

/** Send a support request from `from` (holding `fromPost`) to the holder of `toPost`, straight to him. Returns its id. */
export function sendSupportRequest(ctx: TickContext, state: State, from: PersonId, fromPost: PostId, toPost: PostId, goal: PlanGoal): MessageId {
  const to = state.postStates[toPost]!.postHolder!;
  const id = mintMessageId(ctx.mint, ctx.day, from, to, `support.${fromPost}.${toPost}`);
  const leg = hop(ctx, state, 'wire', from, whereIs(ctx, state, from), whereIs(ctx, state, to), id);
  const msg: TransitMessage = {
    id,
    msgOrigin: id,
    msgFrom: from,
    msgTo: to,
    msgToPost: toPost,
    msgRole: 'addressee',
    msgRoute: leg.route,
    msgSentDay: ctx.day,
    msgArriveDay: leg.arrive,
    msgVia: [],
    msgPending: [],
    msgOrder: { orderKind: 'support', orderIssuer: from, orderTarget: toPost, orderGoal: goal, orderEdit: null, orderBypass: false, orderIssuedDay: ctx.day },
    msgReport: null,
    msgTruth: null,
  };
  ctx.outbox.push(msg);
  fire(ctx, 'messages.sent');
  fire(ctx, 'operations.support_sent');
  return id;
}

/** What his rung makes of the request, and from which day a delayed axis moves. */
export function answerOf(ctx: TickContext, response: DirectiveResponse): { readonly answer: RequestAnswer; readonly from: number | null } {
  const relay = ctx.world.rules.people.relay;
  switch (response.actual) {
    case 'exceed':
    case 'comply':
    case 'comply_with_reservations':
      return { answer: 'complied', from: ctx.day };
    case 'slow_walk':
      return { answer: 'delayed', from: ctx.day + relay.slowWalkHoldDays };
    case 'reinterpret':
      return { answer: 'delayed', from: ctx.day + relay.reinterpretHoldDays };
    default:
      return { answer: 'refused', from: null };
  }
}

/** A support request reaches its holder: he answers by his own compliance; the operation records it; he wires back his declared rung. */
export function arriveSupport(ctx: TickContext, start: State, msg: TransitMessage): State {
  const order = msg.msgOrder!;
  const post = msg.msgToPost!;
  const response = answerOrder(ctx.world, start, msg.msgTo, order.orderIssuer, goalTerms(ctx.world.rules.people, 'advance'), { oversight: oversightOf(ctx, start, msg.msgTo, order.orderIssuer) });
  let state = recordResponse(start, responseOf(response, { order: msg.msgOrigin, person: msg.msgTo, post, role: 'addressee', day: ctx.day }));
  const { answer, from } = answerOf(ctx, response);
  fire(ctx, 'operations.support_answered');
  if (answer === 'refused') fire(ctx, 'operations.support_refused');
  for (const id of openOperations(state)) {
    const op = state.operationRecords[id]!;
    const j = op.opRequests.findIndex((r) => r.oreqMessage === msg.msgOrigin);
    if (j < 0) continue;
    const req: OpRequest = { ...op.opRequests[j]!, oreqAnswer: answer, oreqRung: response.actual, oreqResponse: responseKey(msg.msgOrigin, msg.msgTo), oreqAnswerDay: ctx.day, oreqFrom: from };
    state = putOperations(state, [{ id, record: { ...op, opRequests: op.opRequests.map((r, k) => (k === j ? req : r)) } }]);
  }
  sendReport(ctx, state, {
    body: {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportAuthor: msg.msgTo,
      reportAuthorPost: post,
      reportSubjectKind: 'post',
      reportSubjectId: post,
      reportClaims: [{ claimKind: 'support-answer', claimRegion: order.orderGoal?.goalObjective ?? null, claimValue: response.declared === 'object' || response.declared === 'refuse' ? 0 : 1, claimToken: response.declared, claimConfidence: 1000 }],
      reportDay: ctx.day,
      reportHour: null,
      reportAdvice: null,
      reportAnswers: msg.msgOrigin,
    },
    truth: { truthTerms: response.contributions.map((c) => term('support_term', c.amount, { person: msg.msgTo, post, rule: c.term })), truthTrimmed: [] },
    to: order.orderIssuer,
    tag: `support-answer.${post}`,
  });
  return state;
}
