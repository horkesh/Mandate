/** Entrusted carriage (0032), distinct from a command-chain relay or an incoming-wire filter. */
import { term } from '../knowledge/truth.ts';
import { mintMessageId, type TransitMessage } from '../messages/transit.ts';
import { dispatchLatency } from '../messages/ship.ts';
import { recordResponse, responseOf } from '../proxy/responses.ts';
import { answerOrder, relayAction } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import { fire, hop, oversightOf, sendReport, sideOf, whereIs, type TickContext } from './context.ts';
import { returnDispatch } from './orders.ts';

export function carryDispatch(ctx: TickContext, start: State, msg: TransitMessage): State {
  const post = msg.msgToPost!;
  const failed = (state: State, why: string): State => {
    if (msg.msgOrder !== null || msg.msgVerb !== null) return returnDispatch(ctx, state, msg, why);
    const carrierPresent = state.postStates[post]?.postHolder === msg.msgTo;
    sendReport(ctx, state, { to: msg.msgReport!.reportAuthor, tag: `undelivered.${msg.msgOrigin}`, deliveryFailure: true, route: 'courier',
      // As with an undelivered order, file the failure for its sender when no carrier can author it.
      // Never turn a departed holder into fresh institutional evidence for his former post.
      body: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: carrierPresent ? msg.msgTo : msg.msgReport!.reportAuthor, reportAuthorPost: carrierPresent ? post : null,
        reportSubjectKind: 'post', reportSubjectId: post, reportClaims: [{ claimKind: 'order-returned', claimRegion: null, claimValue: 0, claimToken: why, claimConfidence: 1000 }],
        reportDay: ctx.day, reportHour: null, reportAdvice: null, reportAnswers: msg.msgOrigin },
      truth: { truthTerms: [], truthTrimmed: [] } });
    return state;
  };
  if (start.postStates[post]?.postHolder !== msg.msgTo) return failed(start, 'carrier_unavailable');
  const instructions = msg.msgDeliveryTerms;
  if (instructions === undefined || msg.msgCarriage === undefined || msg.msgPending.length === 0) throw new RangeError('carrier needs delivery instructions and an addressee');
  const issuer = msg.msgOrder?.orderIssuer ?? msg.msgVerb?.verbIssuer ?? msg.msgReport!.reportAuthor;
  const answer = answerOrder(ctx.world, start, msg.msgTo, issuer, {
    boldness: instructions.deliveryBoldness, honours: instructions.deliveryHonours, offends: instructions.deliveryOffends, required: 0,
  }, { oversight: oversightOf(ctx, start, msg.msgTo, issuer).value });
  const state = recordResponse(start, responseOf(answer, { order: msg.msgOrigin, person: msg.msgTo, post, role: 'carrier', day: ctx.day, kind: 'dispatch' }));
  const action = relayAction(ctx.world.rules.people, answer, msg.msgTo, post);
  ctx.events.push({ event: 'carried', person: msg.msgTo, post, message: msg.msgOrigin, terms: action.terms });
  if (action.action === 'object') {
    if (msg.msgOrder !== null) fire(ctx, 'orders.relay_objected');
    return failed(state, 'carrier_declined');
  }
  const next = msg.msgPending[0]!;
  const from = whereIs(ctx, state, msg.msgTo);
  const to = whereIs(ctx, state, next.hopPerson);
  if (!dispatchLatency(ctx.latency, ctx.world.rules.latency, msg.msgCarriage, from, to, sideOf(ctx, state, msg.msgTo), null).ok) return failed(state, 'route_unavailable');
  const id = mintMessageId(ctx.mint, ctx.day, msg.msgTo, next.hopPerson, `carried.${msg.msgOrigin}`);
  const leg = hop(ctx, state, msg.msgCarriage, msg.msgTo, from, to, id, action.holdDays);
  const { msgCarriage: _oldCarriage, ...rest } = msg;
  ctx.outbox.push({ ...rest, id, msgFrom: msg.msgTo, msgTo: next.hopPerson, msgToPost: next.hopPost, msgRole: next.hopRole,
    ...(next.hopCarriage === undefined ? {} : { msgCarriage: next.hopCarriage }),
    msgRoute: leg.route, msgSentDay: ctx.day, msgArriveDay: leg.arrive, msgVia: [...msg.msgVia, post], msgPending: msg.msgPending.slice(1),
    msgTruth: msg.msgTruth === null ? null : { ...msg.msgTruth, truthTerms: [...msg.msgTruth.truthTerms, ...action.terms, term('reported', leg.arrive - ctx.day - action.holdDays, { person: msg.msgTo, post, rule: `carriage:${leg.route}` })] } });
  if (msg.msgOrder !== null) {
    fire(ctx, 'orders.relayed');
    if (action.holdDays > 0) fire(ctx, 'orders.relay_held', action.holdDays);
  }
  fire(ctx, 'messages.sent');
  return state;
}
