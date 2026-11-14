/**
 * Orders through chains (decision 0040): issuing an order, relaying it link by
 * link, and its arrival.
 *
 * - Relay is message passing between posts: each relaying holder receives the
 *   order as a message, applies his own compliance and delay, and forwards it
 *   or objects (stand-in compliance: `standin/traits.ts`).
 * - Going around the chain sends the order straight to the holder: fewer hops,
 *   so faster; each bypassed man gets a grievance (proposed to the people core,
 *   Phase 1), and the order may conflict with one that came down the chain.
 * - A special messenger is a route with a price.
 */
import type { MessageId, PersonId, PostId, SeatId } from '../ids.ts';
import type { ReportBody } from '../knowledge/report.ts';
import type { OrderCommand } from '../log/commands.ts';
import type { Hop, TransitMessage } from '../messages/transit.ts';
import { mintMessageId } from '../messages/transit.ts';
import { receiveOrder } from '../plans/standing.ts';
import type { State } from '../root-state.ts';
import { relayDecision } from '../standin/traits.ts';
import { fire, hop, sendReport, whereIs, type RejectionReason, type TickContext } from './context.ts';

const ORDER_ROUTES_ALLOWED = ['courier', 'in-person', 'mail', 'special-messenger', 'wire'] as const;

/**
 * Validate and send an order. Returns the reason for a rejection, or null when it is on its way.
 *
 * Only a principal sends orders (review F3): a seat may make a principal's
 * choices or choose among options the kernel judged consistent, never issue
 * commands of its own (decision 0015, FOUNDATION section 8). A commander who
 * should order his subordinates needs a menu the kernel builds and judges.
 */
export function issueOrder(ctx: TickContext, state: State, seat: SeatId, cmd: OrderCommand): RejectionReason | null {
  const { world } = ctx;
  const assignment = state.seatAssignments[seat];
  if (assignment === undefined) return 'unknown_seat';
  const issuer = world.person(assignment.seatPerson);
  if (world.faction(issuer.faction).principal !== issuer.id) return 'not_a_principal';
  if (!world.postIds.includes(cmd.to)) return 'unknown_post';
  const target = world.post(cmd.to);
  if (target.kind !== 'field' || target.faction !== issuer.faction) return 'not_field_post';
  if (target.holder === null) return 'vacant_post';
  if (cmd.goal === 'advance' ? cmd.region === null || !world.regionIds.includes(cmd.region) : cmd.region !== null) return 'bad_goal';
  if (!(ORDER_ROUTES_ALLOWED as readonly string[]).includes(cmd.route)) return 'route_unavailable';
  // The whole chain of posts above the target relays a principal's order.
  const chain = world.chainBelow(null, target.id);
  // Vacant relay posts cannot relay: the order skips them.
  const relays = chain.slice(0, -1).filter((p) => world.post(p).holder !== null);
  const hops: Hop[] = [...(cmd.bypass ? [] : relays), target.id].map((p, i, all) => ({
    hopPerson: world.post(p).holder!,
    hopPost: p,
    hopRole: i === all.length - 1 ? 'addressee' : 'relay',
  }));
  const first = hops[0]!;
  const id = mintMessageId(ctx.mint, ctx.day, issuer.id, first.hopPerson, `order.${target.id}`);
  const leg = hop(ctx, cmd.route, issuer.id, whereIs(ctx, state, issuer.id), whereIs(ctx, state, first.hopPerson), id);
  ctx.outbox.push({
    id,
    msgOrigin: id,
    msgFrom: issuer.id,
    msgTo: first.hopPerson,
    msgToPost: first.hopPost,
    msgRole: first.hopRole,
    msgRoute: leg.route,
    msgSentDay: ctx.day,
    msgArriveDay: leg.arrive,
    msgVia: [],
    msgPending: hops.slice(1),
    msgOrder: { orderIssuer: issuer.id, orderTarget: target.id, orderGoal: { goalSpecKind: cmd.goal, goalSpecRegion: cmd.region }, orderBypass: cmd.bypass, orderIssuedDay: ctx.day },
    msgReport: null,
    msgTruth: null,
  });
  fire(ctx, 'messages.sent');
  if (cmd.route === 'special-messenger') {
    fire(ctx, 'messages.special_messenger');
    ctx.prices.push({ seat, attention: world.rules.latency.specialMessengerPrice, why: 'special-messenger' });
  }
  if (cmd.bypass && relays.length > 0) {
    for (const p of relays) {
      fire(ctx, 'orders.bypassed');
      ctx.proposals.push({ proposal: 'grievance', person: world.post(p).holder!, cause: 'bypassed', order: id });
    }
  }
  return null;
}

/** A report answering an order: its subject is the post the order was for, and it names the order it answers. */
function reportBody(
  author: PersonId,
  authorPost: PostId | null,
  day: number,
  partial: Pick<ReportBody, 'reportType' | 'reportSubtype' | 'reportClaims' | 'reportAdvice'> & { readonly answers: MessageId; readonly about: PostId },
): ReportBody {
  return {
    reportType: partial.reportType,
    reportSubtype: partial.reportSubtype,
    reportAuthor: author,
    reportAuthorPost: authorPost,
    reportSubjectKind: 'post',
    reportSubjectId: partial.about,
    reportClaims: partial.reportClaims,
    reportDay: day,
    reportHour: null,
    reportAdvice: partial.reportAdvice,
    reportAnswers: partial.answers,
  };
}

/** An order reaches a relaying holder: he forwards it, after his own delay, or objects. */
export function relayOrder(ctx: TickContext, state: State, msg: TransitMessage): void {
  const { world } = ctx;
  const order = msg.msgOrder!;
  const relayer = world.person(msg.msgTo);
  const post = msg.msgToPost!;
  const decision = relayDecision(world.rules.traits, relayer, post, { advance: order.orderGoal.goalSpecKind === 'advance' });
  if (decision.action === 'object') {
    fire(ctx, 'orders.relay_objected');
    ctx.events.push({ event: 'objected', person: relayer.id, post, message: msg.msgOrigin, terms: decision.terms });
    sendReport(ctx, state, {
      body: reportBody(relayer.id, post, ctx.day, {
        reportType: 'advice',
        reportSubtype: 'memorandum',
        reportClaims: [{ claimKind: 'order-objected', claimRegion: order.orderGoal.goalSpecRegion, claimValue: 1, claimToken: 'withheld', claimConfidence: 1000 }],
        reportAdvice: { adviceRecommends: 'withdraw-order', adviceReasons: decision.stated, adviceConfidence: 800 },
        answers: msg.msgOrigin,
        about: order.orderTarget,
      }),
      truth: { truthTerms: decision.terms, truthTrimmed: [] },
      to: order.orderIssuer,
      tag: `objection.${order.orderTarget}`,
    });
    return;
  }
  const next = msg.msgPending[0]!;
  const id = mintMessageId(ctx.mint, ctx.day, relayer.id, next.hopPerson, `order.${order.orderTarget}`);
  const leg = hop(ctx, msg.msgRoute, relayer.id, whereIs(ctx, state, relayer.id), whereIs(ctx, state, next.hopPerson), id, decision.holdDays);
  fire(ctx, 'orders.relayed');
  if (decision.holdDays > 0) fire(ctx, 'orders.relay_held', decision.holdDays);
  ctx.events.push({ event: 'relayed', person: relayer.id, post, message: msg.msgOrigin, terms: decision.terms });
  ctx.outbox.push({
    ...msg,
    id,
    msgFrom: relayer.id,
    msgTo: next.hopPerson,
    msgToPost: next.hopPost,
    msgRole: next.hopRole,
    msgRoute: leg.route,
    msgSentDay: ctx.day,
    msgArriveDay: leg.arrive,
    msgVia: [...msg.msgVia, post],
    msgPending: msg.msgPending.slice(1),
  });
  fire(ctx, 'messages.sent');
}

/** An order reaches its addressee: his goal changes (or, in a conflict, does not), and he reports which order he obeyed. */
export function arriveOrder(ctx: TickContext, state: State, msg: TransitMessage): State {
  const order = msg.msgOrder!;
  const post = msg.msgToPost!;
  const { state: next, outcome } = receiveOrder(state, post, { id: msg.msgOrigin, issuer: order.orderIssuer, goal: order.orderGoal, viaChain: !order.orderBypass }, ctx.day);
  fire(ctx, 'orders.obeyed', outcome.obeyed === 'new' ? 1 : 0);
  if (outcome.conflict) {
    fire(ctx, 'orders.conflict');
    ctx.events.push({ event: 'conflict', person: msg.msgTo, post, message: msg.msgOrigin, terms: [] });
  }
  sendReport(ctx, next, {
    body: reportBody(msg.msgTo, post, ctx.day, {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportClaims: [
        { claimKind: 'order-obeyed', claimRegion: order.orderGoal.goalSpecRegion, claimValue: outcome.obeyed === 'new' ? 1 : 0, claimToken: outcome.conflict ? `conflict-${outcome.obeyed}` : outcome.obeyed, claimConfidence: 1000 },
      ],
      reportAdvice: null,
      answers: msg.msgOrigin,
      about: post,
    }),
    truth: { truthTerms: [], truthTrimmed: [] },
    to: order.orderIssuer,
    tag: `ack.${post}`,
  });
  return next;
}
