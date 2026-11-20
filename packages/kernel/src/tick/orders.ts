/**
 * Orders through chains (decision 0040): issuing an order, relaying it link by link, and its arrival.
 *
 * - An order carries a goal for the holder of a post, or the principal's answer to the plan that holder submitted
 *   (approve, send back, edit its arrows), or his word to go (lane 1.2). Each travels the same way.
 * - Relay is message passing between posts: each relaying holder receives the order as a message, applies his own
 *   compliance and delay, and forwards it or objects (lane 1.1: `reading/orders.ts`); `proxy` records his response.
 * - Going around the chain sends the order straight to the holder: fewer hops, so faster; each bypassed man gets a
 *   grievance (proposed to `people`), and the order may conflict with one that came down the chain: the holder resolves
 *   the two by his own compliance (lane 1.1's `resolveOrderConflict`, called at `arriveOrder`).
 * - A special messenger is a route with a price.
 */
import { commandedBlocks, sideOfPerson } from '../command/command.ts';
import type { MessageId, PersonId, PostId, RegionId, SeatId } from '../ids.ts';
import { term } from '../knowledge/truth.ts';
import { believedHolder, vacancyUnreported } from '../seats/believed.ts';
import type { ReportBody, ReportClaim } from '../knowledge/report.ts';
import type { EditTerms, GoCommand, GoalTerms, OrderCommand, ReviewCommand } from '../log/commands.ts';
import type { Hop, OrderBody, TransitMessage } from '../messages/transit.ts';
import { mintMessageId } from '../messages/transit.ts';
import { ORDER_ROUTES } from '../messages/latency.ts';
import { editProblems, goalKindOf, goalProblems, sameGoal, type EditSpec, type GoalKind, type PlanGoal } from '../plans/goal.ts';
import { approve, planOf, receiveCounter, release, sendBack, setGoal, type PlanRecord, type NoteReading } from '../plans/plans.ts';
import { copyNote, noteProblems } from '../plans/notes.ts';
import type { State } from '../root-state.ts';
import { answerOrder, goalTerms, relayAction, resolveOrderConflict } from '../reading/orders.ts';
import { callTerms } from '../recruitment/rules.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { headquartersOf, isFieldPost, postFaction, relayChain } from '../seats/posts.ts';
import { fire, hop, oversightOf, sendReport, whereIs, type RejectionReason, type TickContext } from './context.ts';
import { arriveSupport } from './support.ts';

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

/**
 * The goal kind a relaying link reads an order as (the pack's terms, `WorldRules.people.goalTerms`): a goal's own kind;
 * an answer to a plan, or the word to go, as the kind of the goal it serves.
 */
export function relayKindOf(state: State, order: OrderBody): GoalKind {
  if (order.orderGoal !== null) return goalKindOf(order.orderGoal);
  const plan = planOf(state, order.orderTarget);
  return plan === undefined ? 'hold' : goalKindOf(plan.planGoal);
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
  if ((!isFieldPost(state, cmd.to) && !vacancyUnreported(state, issuer.id, cmd.to)) || postFaction(world, state, cmd.to) !== side) return 'not_field_post';
  // Lane 1.12 (0052): refused at once only if he knows the post vacant. One he still believes held (the report of its
  // commander's loss not yet in his hands) is accepted, and the dispatch comes back undelivered when it arrives.
  if (target.postHolder === null && believedHolder(state, issuer.id, cmd.to) === null) return 'vacant_post';
  // Only the routes the principal's menu offers (review N1): an order "in person" would be a visit, a verb of its own.
  if (!ORDER_ROUTES.includes(cmd.route)) return 'route_unavailable';

  let body: Pick<OrderBody, 'orderKind' | 'orderGoal' | 'orderEdit' | 'orderCall' | 'orderNotes'>;
  if (cmd.cmd === 'order') {
    const goal = goalOf(cmd.goal);
    if (goalProblems(goal).length > 0) return 'bad_goal';
    if (goal.goalObjective !== null && !world.regionIds.includes(goal.goalObjective)) return 'bad_goal';
    const commands = commandedBlocks(state, cmd.to);
    if (!goal.goalCommitted.every((b) => commands.includes(b))) return 'bad_goal';
    body = { orderKind: 'goal', orderGoal: goal, orderEdit: null, orderCall: null };
  } else {
    const plan = planOf(state, cmd.to);
    if (plan === undefined || plan.planIssuer !== issuer.id) return 'no_plan';
    if (cmd.cmd === 'go') {
      if (plan.planStatus !== 'ready') return 'no_plan';
      body = { orderKind: 'go', orderGoal: null, orderEdit: null, orderCall: null };
    } else if (cmd.action === 'edit') {
      if (plan.planStatus !== 'review' && plan.planStatus !== 'approved' && plan.planStatus !== 'ready') return 'no_plan';
      if (plan.planApproved === null && plan.planChosen === null) return 'no_plan';
      const edit = editOf(cmd.edit!);
      if (editProblems(edit).length > 0) return 'bad_review';
      if ([edit.editRegion, ...edit.editVia].some((r) => r !== null && !world.regionIds.includes(r))) return 'bad_review';
      body = { orderKind: 'edit', orderGoal: null, orderEdit: edit, orderCall: null };
    } else {
      if (plan.planStatus !== 'review') return 'no_plan';
      const notes = cmd.notes;
      if (notes !== undefined) {
        const limits = world.map.world.rules.plans.notes;
        if (cmd.action !== 'send_back' || notes.length > limits.maxMarks) return 'bad_review';
        for (const n of notes) {
          if (noteProblems(n).length || n.markVia.length > limits.maxWaypoints || (n.markDays !== null && n.markDays > limits.maxWaitDays)) return 'bad_review';
          if ([n.markRegion, ...n.markVia].some(r => r !== null && !world.regionIds.includes(r))) return 'bad_review';
          if (!plan.planDraft?.draftCandidates.find(c => c.id === plan.planChosen)?.candAxes.some(a => a.axisName === n.markAxis)) return 'bad_review';
        }
      }
      body = { orderKind: cmd.action, orderGoal: null, orderEdit: null, orderCall: null, ...(notes === undefined ? {} : { orderNotes: notes.map(copyNote) }) };
    }
  }

  dispatchOrder(ctx, state, seat, issuer.id, cmd.to, cmd.route, cmd.bypass, body);
  return null;
}

/**
 * Send a validated order down the chain (or around it): the hops, the first leg, a special messenger's price and each
 * bypassed relay's grievance. Shared by goals, reviews, the word to go and calls (lane 1.7).
 */
export function dispatchOrder(ctx: TickContext, state: State, seat: SeatId, issuerId: PersonId, to: PostId, route: OrderCommand['route'], bypass: boolean, body: Pick<OrderBody, 'orderKind' | 'orderGoal' | 'orderEdit' | 'orderCall' | 'orderNotes'>): MessageId {
  const { world } = ctx;
  const cmd = { to, route, bypass };
  const issuer = { id: issuerId };
  // The whole chain of posts between the principal's own post and the target relays his order.
  const chain = relayChain(state, issuer.id, cmd.to);
  // Vacant relay posts cannot relay: the order skips them.
  const relays = chain.slice(0, -1).filter((p) => state.postStates[p]!.postHolder !== null);
  // The addressee is the man the issuer believes holds the post (lane 1.12): its holder, or the commander a battle took
  // whose loss has not been reported to him.
  const hops: Hop[] = [...(cmd.bypass ? [] : relays), cmd.to].map((p, i, all) => ({
    hopPerson: i === all.length - 1 ? believedHolder(state, issuer.id, p)! : state.postStates[p]!.postHolder!,
    hopPost: p,
    hopRole: i === all.length - 1 ? 'addressee' : 'relay',
  }));
  const first = hops[0]!;
  const tag = body.orderKind === 'goal' ? `order.${cmd.to}` : `${body.orderKind}.${cmd.to}`;
  const id = mintMessageId(ctx.mint, ctx.day, issuer.id, first.hopPerson, tag);
  const leg = hop(ctx, state, cmd.route, issuer.id, whereIs(ctx, state, issuer.id), hopRegion(ctx, state, first), id);
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
    msgVerb: null,
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
  return id;
}

/**
 * Where a hop's leg ends: where its man is, or, for a man who no longer holds the post it is addressed to (a commander
 * a battle took, lane 1.12), the post's headquarters, where the dispatch goes looking for him.
 */
function hopRegion(ctx: TickContext, state: State, h: Hop): RegionId {
  if (h.hopPost !== null && state.postStates[h.hopPost]?.postHolder !== h.hopPerson) return headquartersOf(ctx.world, state, h.hopPost);
  return whereIs(ctx, state, h.hopPerson);
}

/**
 * A dispatch that reaches a post whose holder is no longer the man it was addressed to (lane 1.12, 0052): the post fell
 * vacant, or changed hands, while it travelled. It is not answered; it comes back to its issuer, from the post, by the
 * way it went, as a returned dispatch naming the post and why (`vacant_post` or `holder_changed`). The player reads it
 * in his reports, like any answer to an order.
 */
export function returnDispatch(ctx: TickContext, state: State, msg: TransitMessage): State {
  const issuer = msg.msgOrder?.orderIssuer ?? msg.msgVerb!.verbIssuer;
  const post = msg.msgVerb?.verbPost ?? msg.msgToPost!;
  const why = state.postStates[post]?.postHolder === null ? 'vacant_post' : 'holder_changed';
  sendReport(ctx, state, {
    body: answerBody(issuer, null, ctx.day, {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportClaims: [{ claimKind: 'order-returned', claimRegion: msg.msgOrder === null ? null : objectiveOf(state, msg.msgOrder), claimValue: 0, claimToken: why, claimConfidence: 1000 }],
      reportAdvice: null,
      answers: msg.msgOrigin,
      about: post,
    }),
    truth: { truthTerms: [term('observed', 0, { person: msg.msgTo, post, rule: why })], truthTrimmed: [] },
    to: issuer,
    tag: `returned.${post}`,
    route: msg.msgRoute,
    fromRegion: headquartersOf(ctx.world, state, post),
  });
  fire(ctx, 'orders.returned');
  return state;
}

/** A report answering an order: its subject is the post the order was for, and it names the order it answers. */
export function answerBody(
  author: PersonId,
  authorPost: PostId | null,
  day: number,
  partial: Pick<ReportBody, 'reportType' | 'reportSubtype' | 'reportClaims' | 'reportAdvice' | 'reportNotes'> & { readonly answers: MessageId; readonly about: PostId },
): ReportBody {
  return {
    ...(partial.reportNotes === undefined ? {} : { reportNotes: partial.reportNotes }),
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

/**
 * An order reaches a relaying holder (0040): he reads it through his own compliance, with his regard for its issuer,
 * and forwards it after his own delay, or objects. `proxy` records his response; the relay's terms carry his rung
 * and each contribution (hard rule 6).
 */
export function relayOrder(ctx: TickContext, start: State, msg: TransitMessage): State {
  const { world } = ctx;
  const order = msg.msgOrder!;
  const relayer = world.person(msg.msgTo);
  const post = msg.msgToPost!;
  const rules = world.rules.people;
  // A call is read on the pack's call terms (lane 1.7); a goal, an answer to a plan and the word to go on its goal's. He reads it
  // watched from where he stands (lane 1.4's oversight).
  const terms = order.orderKind === 'call' ? callTerms(world.map.world.rules.recruitment) : goalTerms(rules, relayKindOf(start, order));
  const answer = answerOrder(world, start, relayer.id, order.orderIssuer, terms, { oversight: oversightOf(ctx, start, relayer.id, order.orderIssuer).value });
  const state = recordResponse(start, responseOf(answer, { order: msg.msgOrigin, person: relayer.id, post, role: 'relay', day: ctx.day, kind: order.orderKind }));
  const decision = relayAction(rules, answer, relayer.id, post);
  if (decision.action === 'object') {
    fire(ctx, 'orders.relay_objected');
    ctx.events.push({ event: 'objected', person: relayer.id, post, message: msg.msgOrigin, terms: decision.terms });
    sendReport(ctx, state, {
      body: answerBody(relayer.id, post, ctx.day, {
        reportType: 'advice',
        reportSubtype: 'memorandum',
        // The token names the kind of order withheld (a goal, or an answer to a plan): he knows what he sent.
        reportClaims: [{ claimKind: 'order-objected', claimRegion: objectiveOf(state, order), claimValue: 1, claimToken: order.orderKind, claimConfidence: 1000 }],
        reportAdvice: { adviceRecommends: 'withdraw-order', adviceReasons: decision.stated, adviceConfidence: 800 },
        answers: msg.msgOrigin,
        about: order.orderTarget,
      }),
      truth: { truthTerms: decision.terms, truthTrimmed: [] },
      to: order.orderIssuer,
      tag: `objection.${order.orderTarget}`,
    });
    return state;
  }
  const next = msg.msgPending[0]!;
  const id = mintMessageId(ctx.mint, ctx.day, relayer.id, next.hopPerson, `order.${order.orderTarget}`);
  const leg = hop(ctx, state, msg.msgRoute, relayer.id, whereIs(ctx, state, relayer.id), hopRegion(ctx, state, next), id, decision.holdDays);
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
  return state;
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
 * Two goals conflict (0040) when they differ, the one he holds is less than the pack's conflict window old
 * (`WorldRules.standing.conflictWindowDays`), and one came down his chain while the other went around it (with relays
 * holding orders, they arrive out of the order they were written). He resolves the two by his own compliance (lane
 * 1.1's `resolveOrderConflict`): each read with the pack's terms for its goal kind, the chain's order and the newer
 * one weighing more. A post with no goal yet simply obeys (exit review S1).
 */
function conflictOf(ctx: TickContext, state: State, msg: TransitMessage, plan: PlanRecord | undefined): { readonly obeyed: 'kept' | 'new'; readonly conflict: boolean } {
  const order = msg.msgOrder!;
  const goal = order.orderGoal!;
  const viaChain = !order.orderBypass;
  if (plan === undefined || sameGoal(plan.planGoal, goal) || plan.planViaChain === viaChain) return { obeyed: 'new', conflict: false };
  if (ctx.day - plan.planSetDay >= ctx.world.map.world.rules.standing.conflictWindowDays) return { obeyed: 'new', conflict: false };
  const rules = ctx.world.rules.people;
  const resolution = resolveOrderConflict(
    ctx.world,
    state,
    msg.msgTo,
    { order: plan.planOrder, terms: goalTerms(rules, goalKindOf(plan.planGoal)), viaChain: plan.planViaChain, issuedDay: plan.planIssuedDay, issuer: plan.planIssuer },
    { order: msg.msgOrigin, terms: goalTerms(rules, goalKindOf(goal)), viaChain, issuedDay: order.orderIssuedDay, issuer: order.orderIssuer },
  );
  return { obeyed: resolution.obeyed === 'held' ? 'kept' : 'new', conflict: true };
}

/**
 * An order reaches its addressee.
 * - A goal: he answers it through his compliance with the pack's terms for its kind, and `proxy` records his response
 *   (`plans` keeps its key). Conflicting orders are resolved by his compliance (`conflictOf`); the goal he works to
 *   waits for the day's drafting, and he reports which order he obeyed.
 * - An approval, a send-back or the word to go: applied if his plan still waits for it, else reported as stale.
 * - An edit: it waits for the day's plans phase, which re-expands it on the morning's map and has him answer it.
 * - A support request (lane 1.4): `tick/support.ts`.
 */
export function arriveOrder(ctx: TickContext, state: State, msg: TransitMessage): State {
  const order = msg.msgOrder!;
  // A support request between holders (lane 1.4): answered by the holder's own compliance, recorded by the operation.
  if (order.orderKind === 'support') return arriveSupport(ctx, state, msg);
  const post = msg.msgToPost!;
  const plan = planOf(state, post);
  if (order.orderKind === 'goal') {
    const goal = order.orderGoal!;
    const outcome = conflictOf(ctx, state, msg, plan);
    const answer = answerOrder(ctx.world, state, msg.msgTo, order.orderIssuer, goalTerms(ctx.world.rules.people, goalKindOf(goal)), { oversight: oversightOf(ctx, state, msg.msgTo, order.orderIssuer).value });
    let next = recordResponse(state, responseOf(answer, { order: msg.msgOrigin, person: msg.msgTo, post, role: 'addressee', day: ctx.day, kind: order.orderKind }));
    if (outcome.obeyed === 'new') {
      const set = { id: msg.msgOrigin, issuer: order.orderIssuer, goal, viaChain: !order.orderBypass, issuedDay: order.orderIssuedDay, response: responseKey(msg.msgOrigin, msg.msgTo) };
      next = setGoal(next, post, set, ctx.day);
    }
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
  let answered = state;
  const readings: NoteReading[] = [];
  if (order.orderKind === 'send_back') for (const [index, n] of (order.orderNotes ?? []).entries()) {
    const terms = ctx.world.map.world.rules.plans.notes.terms.find(t => t.kind === n.markKind);
    if (terms === undefined) throw new RangeError(`pack has no terms for note ${n.markKind}`);
    const answer = answerOrder(ctx.world, answered, msg.msgTo, order.orderIssuer, { boldness: terms.boldness, honours: terms.honours, offends: terms.offends, required: 0 }, { oversight: oversightOf(ctx, answered, msg.msgTo, order.orderIssuer).value });
    answered = recordResponse(answered, responseOf(answer, { order: msg.msgOrigin, person: msg.msgTo, post, role: 'addressee', day: ctx.day, kind: order.orderKind, note: index }));
    readings.push({ readingMark: n, readingResponse: responseKey(msg.msgOrigin, msg.msgTo, index) });
  }
  const changed = order.orderKind === 'approve' ? approve(answered, post) : order.orderKind === 'send_back' ? sendBack(answered, post, readings) : release(answered, post);
  fire(ctx, order.orderKind === 'approve' ? 'plans.approved' : order.orderKind === 'send_back' ? 'plans.sent_back' : 'plans.released');
  acknowledge(ctx, changed, msg, order.orderKind, true);
  return changed;
}
