/**
 * Phase 2 of the day: deliver every message due today (FOUNDATION section 10).
 * Orders relay or arrive (`orders.ts`); reports pass a filter or reach their
 * addressee's knowledge. A message sent today with no delay is delivered
 * today too, so the phase repeats until nothing more is due.
 */
import { sideOfPerson } from '../command/command.ts';
import { deliverReport } from '../knowledge/knowledge.ts';
import { term } from '../knowledge/truth.ts';
import { mintMessageId, sendMessages, takeDue, type TransitMessage } from '../messages/transit.ts';
import type { State } from '../root-state.ts';
import { seatIdFor } from '../seats/seats.ts';
import { filterDecision } from '../standin/traits.ts';
import { fire, hop, whereIs, type TickContext } from './context.ts';
import { arriveOrder, relayOrder } from './orders.ts';

/** A day can chain same-day hops (a relay in the same town); more rounds than this means a loop, which is a bug. */
const MAX_ROUNDS = 64;

export function deliverDue(ctx: TickContext, start: State): State {
  let state = start;
  for (let round = 0; ; round++) {
    if (round >= MAX_ROUNDS) throw new Error(`day ${ctx.day}: deliveries did not settle after ${MAX_ROUNDS} rounds`);
    const taken = takeDue(state, ctx.day);
    if (taken.due.length === 0) return state;
    state = taken.state;
    for (const msg of taken.due) state = deliverOne(ctx, state, msg);
    state = sendMessages(state, ctx.outbox.splice(0));
  }
}

function deliverOne(ctx: TickContext, state: State, msg: TransitMessage): State {
  fire(ctx, 'messages.delivered');
  if (msg.msgOrder !== null) {
    if (msg.msgRole === 'relay') {
      relayOrder(ctx, state, msg);
      return state;
    }
    return arriveOrder(ctx, state, msg);
  }
  if (msg.msgRole === 'filter') {
    filterReport(ctx, state, msg);
    return state;
  }
  const report = msg.msgReport!;
  const seat = seatIdFor(msg.msgTo);
  const next = deliverReport(
    state,
    seat,
    { id: msg.msgOrigin, knownReceivedDay: ctx.day, knownRoute: msg.msgRoute, knownVia: msg.msgVia, knownBody: report },
    msg.msgTruth ?? { truthTerms: [], truthTrimmed: [] },
  );
  const world = ctx.world;
  const side = sideOfPerson(world.map, next, msg.msgTo);
  if (side !== null && world.factionIds.includes(side) && world.faction(side).principal === msg.msgTo) {
    if (report.reportType === 'advice' && report.reportSubtype === 'memorandum' && report.reportAnswers !== null) {
      ctx.decisionPoints.push({ point: 'objection', seat, report: msg.msgOrigin, situation: null });
    }
    if (report.reportClaims.some((c) => c.claimKind === 'arrived')) ctx.decisionPoints.push({ point: 'objective-reached', seat, report: msg.msgOrigin, situation: null });
    if (report.reportClaims.some((c) => c.claimKind === 'order-obeyed' && c.claimToken !== null && c.claimToken.startsWith('conflict'))) {
      ctx.decisionPoints.push({ point: 'order-conflict', seat, report: msg.msgOrigin, situation: null });
    }
  }
  return next;
}

/** A wire reaches the filter post on its way to the principal: its holder may hold it or cut claims (decision 0032). */
function filterReport(ctx: TickContext, state: State, msg: TransitMessage): void {
  const holder = ctx.world.person(msg.msgTo);
  const post = msg.msgToPost!;
  const decision = filterDecision(ctx.world.rules.traits, holder, post);
  const body = msg.msgReport!;
  const cut = body.reportClaims.filter((c) => decision.trims.includes(c.claimKind));
  const kept = body.reportClaims.filter((c) => !decision.trims.includes(c.claimKind));
  const truth = msg.msgTruth ?? { truthTerms: [], truthTrimmed: [] };
  const terms = [...decision.terms, ...cut.map((c) => term('filter_trim', c.claimValue, { person: holder.id, post, ...(c.claimRegion === null ? {} : { region: c.claimRegion }), rule: 'values:reputation' }))];
  fire(ctx, 'reports.filtered');
  if (cut.length > 0) fire(ctx, 'reports.trimmed', cut.length);
  ctx.events.push({ event: 'filtered', person: holder.id, post, message: msg.msgOrigin, terms });
  const next = msg.msgPending[0]!;
  const id = mintMessageId(ctx.mint, ctx.day, holder.id, next.hopPerson, `fwd.${msg.msgOrigin.length > 40 ? msg.msgOrigin.slice(-40) : msg.msgOrigin}`);
  const leg = hop(ctx, state, 'in-person', holder.id, whereIs(ctx, state, holder.id), whereIs(ctx, state, next.hopPerson), id, decision.holdDays);
  ctx.outbox.push({
    ...msg,
    id,
    msgFrom: holder.id,
    msgTo: next.hopPerson,
    msgToPost: next.hopPost,
    msgRole: next.hopRole,
    // It came by wire; the last step across the capital does not change how it is filed.
    msgRoute: msg.msgRoute,
    msgSentDay: ctx.day,
    msgArriveDay: leg.arrive,
    msgVia: [...msg.msgVia, post],
    msgPending: msg.msgPending.slice(1),
    msgReport: cut.length === 0 ? body : { ...body, reportClaims: kept },
    msgTruth: { truthTerms: [...truth.truthTerms, ...terms], truthTrimmed: [...truth.truthTrimmed, ...cut] },
  });
  fire(ctx, 'messages.sent');
}
