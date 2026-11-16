/**
 * Orders through chains (decision 0040): issuing an order, relaying it link by link, and its arrival.
 *
 * - An order carries a goal for the holder of a post, or the principal's answer to the plan that holder submitted
 *   (approve, send back, edit its arrows), or his word to go (lane 1.2). Each travels the same way.
 * - Relay is message passing between posts: each relaying holder receives the order as a message, applies his own
 *   compliance and delay, and forwards it or objects (stand-in compliance: `standin/traits.ts`; lane 1.1's).
 * - Going around the chain sends the order straight to the holder: fewer hops, so faster; each bypassed man gets a
 *   grievance (proposed to the people core, Phase 1), and the order may conflict with one that came down the chain.
 * - A special messenger is a route with a price.
 */
import { commandedBlocks, sideOfPerson } from '../command/command.ts';
import type { MessageId, PersonId, PostId, SeatId } from '../ids.ts';
import type { ReportBody, ReportClaim } from '../knowledge/report.ts';
import type { EditTerms, GoCommand, GoalTerms, OrderCommand, ReviewCommand } from '../log/commands.ts';
import type { Hop, OrderBody, TransitMessage } from '../messages/transit.ts';
import { mintMessageId } from '../messages/transit.ts';
import { ORDER_ROUTES } from '../messages/latency.ts';
import { resolveConflict } from '../plans/conflict.ts';
import { editProblems, goalProblems, type EditSpec, type PlanGoal } from '../plans/goal.ts';
import { execute } from '../plans/execute.ts';
import { approve, planOf, receiveCounter, release, sendBack, setGoal } from '../plans/plans.ts';
import type { State } from '../root-state.ts';
import { relayDecision } from '../standin/traits.ts';
import { isFieldPost, postFaction, relayChain } from '../seats/posts.ts';
import { fire, hop, sendReport, whereIs, type RejectionReason, type TickContext } from './context.ts';

/** A goal as `plans` holds it, from a command's terms. */
export function goalOf(t: GoalTerms): PlanGoal {
  return {
    goalObjective: t.objective,
    goalPosture: t.posture,
    goalRisk: t.risk,
    goalDeadlineDays: t.deadlineDays,
    goalRail: t.rail,
    goalRiver: t.river,
    goalSea: t.sea,
    goalNeutral: t.neutral,
    goalCommitted: [...t.committed],
    goalAwaitWord: t.awaitWord,
    goalApproveAsDrafted: t.approveAsDrafted,
  };
}

/** An edit as `plans` holds it, from a command's terms. */
export function editOf(t: EditTerms): EditSpec {
  return { editKind: t.kind, editAxis: t.axis, editRegion: t.region, editVia: [...t.via], editConcentration: t.concentration };
}

/** Whether an order is a goal to move (relay compliance reads it as an advance, as the stand-in did). */
export function isAdvance(order: OrderBody): boolean {
  return order.orderKind === 'goal' && order.orderGoal !== null && order.orderGoal.goalPosture !== 'hold';
}

/** The objective an order concerns, for the claims that answer it. */
function objectiveOf(state: State, order: OrderBody): ReportClaim['claimRegion'] {
  return order.orderGoal?.goalObjective ?? planOf(state, order.orderTarget)?.planGoal.goalObjective ?? null;
}

/**
 * Validate and send an order: a goal, a review of a submitted plan, or the word to go. Returns the reason for a
 * rejection, or null when it is on its way.
 *
 * Only a principal sends orders (review F3): a seat may make a principal's choices or choose among options the kernel
 * judged consistent, never issue commands of its own (decision 0015, FOUNDATION section 8).
 */
export function issueOrder(ctx: TickContext, state: State, seat: SeatId, cmd: OrderCommand | ReviewCommand | GoCommand): RejectionReason | null {
  const { world } = ctx;
  const assignment = state.seatAssignments[seat];
  if (assignment === undefined) return 'unknown_seat';
  const issuer = world.person(assignment.seatPerson);
  const side = sideOfPerson(world.map, state, issuer.id);
  if (side === null || !world.factionIds.includes(side) || world.faction(side).principal !== issuer.id) return 'not_a_principal';
  if (state.postStates[cmd.to] === undefined) return 'unknown_post';
  const target = state.postStates[cmd.to]!;
  if (!isFieldPost(state, cmd.to) || postFaction(world, state, cmd.to) !== side) return 'not_field_post';
  if (target.postHolder === null) return 'vacant_post';
  // Only the routes the principal's menu offers (review N1): an order "in person" would be a visit, a verb of its own.
  if (!ORDER_ROUTES.includes(cmd.route)) return 'route_unavailable';

  let body: Pick<OrderBody, 'orderKind' | 'orderGoal' | 'orderEdit'>;
  if (cmd.cmd === 'order') {
    const goal = goalOf(cmd.goal);
    if (goalProblems(goal).length > 0) return 'bad_goal';
    if (goal.goalObjective !== null && !world.regionIds.includes(goal.goalObjective)) return 'bad_goal';
    const commands = commandedBlocks(state, cmd.to);
    if (!goal.goalCommitted.every((b) => commands.includes(b))) return 'bad_goal';
    body = { orderKind: 'goal', orderGoal: goal, orderEdit: null };
  } else {
    const plan = planOf(state, cmd.to);
    if (plan === undefined || plan.planIssuer !== issuer.id) return 'no_plan';
    if (cmd.cmd === 'go') {
      if (plan.planStatus !== 'ready') return 'no_plan';
      body = { orderKind: 'go', orderGoal: null, orderEdit: null };
    } else if (cmd.action === 'edit') {
      if (plan.planStatus !== 'review' && plan.planStatus !== 'approved' && plan.planStatus !== 'ready') return 'no_plan';
      if (plan.planApproved === null && plan.planChosen === null) return 'no_plan';
      const edit = editOf(cmd.edit!);
      if (editProblems(edit).length > 0) return 'bad_review';
      if ([edit.editRegion, ...edit.editVia].some((r) => r !== null && !world.regionIds.includes(r))) return 'bad_review';
      body = { orderKind: 'edit', orderGoal: null, orderEdit: edit };
    } else {
      if (plan.planStatus !== 'review') return 'no_plan';
      body = { orderKind: cmd.action, orderGoal: null, orderEdit: null };
    }
  }

  // The whole chain of posts between the principal's own post and the target relays his order.
  const chain = relayChain(state, issuer.id, cmd.to);
  // Vacant relay posts cannot relay: the order skips them.
  const relays = chain.slice(0, -1).filter((p) => state.postStates[p]!.postHolder !== null);
  const hops: Hop[] = [...(cmd.bypass ? [] : relays), cmd.to].map((p, i, all) => ({
    hopPerson: state.postStates[p]!.postHolder!,
    hopPost: p,
    hopRole: i === all.length - 1 ? 'addressee' : 'relay',
  }));
  const first = hops[0]!;
  const tag = body.orderKind === 'goal' ? `order.${cmd.to}` : `${body.orderKind}.${cmd.to}`;
  const id = mintMessageId(ctx.mint, ctx.day, issuer.id, first.hopPerson, tag);
  const leg = hop(ctx, state, cmd.route, issuer.id, whereIs(ctx, state, issuer.id), whereIs(ctx, state, first.hopPerson), id);
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
    msgOrder: { ...body, orderIssuer: issuer.id, orderTarget: cmd.to, orderBypass: cmd.bypass, orderIssuedDay: ctx.day },
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
      ctx.proposals.push({ proposal: 'grievance', person: state.postStates[p]!.postHolder!, cause: 'bypassed', order: id });
    }
  }
  return null;
}

/** A report answering an order: its subject is the post the order was for, and it names the order it answers. */
export function answerBody(
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
  const decision = relayDecision(world.rules.traits, relayer, post, { advance: isAdvance(order) });
  if (decision.action === 'object') {
    fire(ctx, 'orders.relay_objected');
    ctx.events.push({ event: 'objected', person: relayer.id, post, message: msg.msgOrigin, terms: decision.terms });
    sendReport(ctx, state, {
      body: answerBody(relayer.id, post, ctx.day, {
        reportType: 'advice',
        reportSubtype: 'memorandum',
        reportClaims: [{ claimKind: 'order-objected', claimRegion: objectiveOf(state, order), claimValue: 1, claimToken: 'withheld', claimConfidence: 1000 }],
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
  const leg = hop(ctx, state, msg.msgRoute, relayer.id, whereIs(ctx, state, relayer.id), whereIs(ctx, state, next.hopPerson), id, decision.holdDays);
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

/** The acknowledgement he wires back: which order he obeyed, or that an answer to his plan found it already changed. */
function acknowledge(ctx: TickContext, state: State, msg: TransitMessage, token: string, obeyed: boolean): void {
  const order = msg.msgOrder!;
  const post = msg.msgToPost!;
  sendReport(ctx, state, {
    body: answerBody(msg.msgTo, post, ctx.day, {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportClaims: [{ claimKind: 'order-obeyed', claimRegion: objectiveOf(state, order), claimValue: obeyed ? 1 : 0, claimToken: token, claimConfidence: 1000 }],
      reportAdvice: null,
      answers: msg.msgOrigin,
      about: post,
    }),
    truth: { truthTerms: [], truthTrimmed: [] },
    to: order.orderIssuer,
    tag: `ack.${post}`,
  });
}

/**
 * An order reaches its addressee.
 * - A goal: conflicting orders are resolved at this call site (0040; STAND-IN until lane 1.1's compliance function,
 *   `plans/conflict.ts`); the goal he works to waits for the day's drafting, and he reports which order he obeyed.
 * - An approval, a send-back or the word to go: applied if his plan still waits for it, else reported as stale.
 * - An edit: it waits for the day's plans phase, which re-expands it on the morning's map and has him answer it.
 */
export function arriveOrder(ctx: TickContext, state: State, msg: TransitMessage): State {
  const order = msg.msgOrder!;
  const post = msg.msgToPost!;
  const plan = planOf(state, post);
  if (order.orderKind === 'goal') {
    const outcome = resolveConflict(plan, { goal: order.orderGoal!, viaChain: !order.orderBypass }, ctx.day, ctx.world.map.world.rules.standing.conflictWindowDays);
    const next = outcome.obeyed === 'new' ? execute(setGoal(state, post, { id: msg.msgOrigin, issuer: order.orderIssuer, goal: order.orderGoal!, viaChain: !order.orderBypass }, ctx.day), post, ctx.day) : state;
    fire(ctx, 'orders.obeyed', outcome.obeyed === 'new' ? 1 : 0);
    if (outcome.obeyed === 'new') fire(ctx, 'plans.goal_set');
    if (outcome.conflict) {
      fire(ctx, 'orders.conflict');
      ctx.events.push({ event: 'conflict', person: msg.msgTo, post, message: msg.msgOrigin, terms: [] });
    }
    acknowledge(ctx, next, msg, outcome.conflict ? `conflict-${outcome.obeyed}` : outcome.obeyed, outcome.obeyed === 'new');
    return next;
  }
  if (order.orderKind === 'edit') {
    if (plan === undefined || plan.planIssuer !== order.orderIssuer || plan.planStatus === 'drafting' || plan.planStatus === 'choosing') {
      acknowledge(ctx, state, msg, 'stale', false);
      return state;
    }
    fire(ctx, 'plans.edit_received');
    return receiveCounter(state, post, { pendingSpec: order.orderEdit!, pendingOrder: msg.msgOrigin });
  }
  const wanted = order.orderKind === 'go' ? 'ready' : 'review';
  if (plan === undefined || plan.planIssuer !== order.orderIssuer || plan.planStatus !== wanted) {
    acknowledge(ctx, state, msg, 'stale', false);
    return state;
  }
  const changed = order.orderKind === 'approve' ? approve(state, post) : order.orderKind === 'send_back' ? sendBack(state, post) : release(state, post);
  fire(ctx, order.orderKind === 'approve' ? 'plans.approved' : order.orderKind === 'send_back' ? 'plans.sent_back' : 'plans.released');
  const next = execute(changed, post, ctx.day);
  acknowledge(ctx, next, msg, order.orderKind, true);
  return next;
}
