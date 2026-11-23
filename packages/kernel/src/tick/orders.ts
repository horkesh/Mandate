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
import { allCommandedBlocks, sideOfPerson } from '../command/command.ts';
import type { MessageId, PersonId, PostId, RegionId, SeatId } from '../ids.ts';
import { term } from '../knowledge/truth.ts';
import { senderFor } from '../seats/sender.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import { hasRequiredPapers } from '../knowledge/papers.ts';
import { seatIdFor } from '../seats/seats.ts';
import { latestSentGoal, receivedAuthoredGo, receivedConditionalGoal, receivedPlanPapers, receivedProposalPapers } from '../seats/received.ts';
import { reportQualificationOf, type ReportBody, type ReportClaim } from '../knowledge/report.ts';
import type { DirectiveResponse } from '../directive.ts';
import type { AnswerProposalCommand, EditTerms, GoCommand, GoalTerms, OrderCommand, ReviewCommand } from '../log/commands.ts';
import type { Hop, OrderBody, TransitMessage } from '../messages/transit.ts';
import { mintMessageId } from '../messages/transit.ts';
import { ORDER_ROUTES } from '../messages/latency.ts';
import { editIssues, goalKindOf, goalProblems, sameGoal, type EditSpec, type GoalKind, type PlanGoal } from '../plans/goal.ts';
import { approve, challengeGoal, finishChallenge, planOf, receiveCounter, release, sendBack, setGoal, type PlanRecord, type NoteReading } from '../plans/plans.ts';
import { copyNote, noteProblems } from '../plans/notes.ts';
import type { State } from '../root-state.ts';
import { answerOrder, goalDirective, goalTerms, relayAction, resolveOrderConflict } from '../reading/orders.ts';
import { callDirective } from '../recruitment/rules.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { headquartersOf, postFaction } from '../seats/posts.ts';
import { fire, hop, oversightOf, sendReport, whereIs, type RejectionReason, type TickContext } from './context.ts';
import { arriveSupport } from './support.ts';
import { authoredGoal, letterDependencies } from '../world/doctrine.ts';
import { letterKey, sameLetterFamily } from '../world/letters.ts';
import { daysFromCivil, parseIsoDate } from '../world/calendar.ts';
import { warSince } from '../seats/requests.ts';

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
    ...(t.discretion === undefined ? {} : { goalDiscretion: { condition: t.discretion.condition, fallback: goalOf(t.discretion.fallback) } }),
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
type OrderEnclosure = Pick<OrderBody, 'orderKind' | 'orderGoal' | 'orderEdit' | 'orderCall' | 'orderNotes' | 'orderProposal' | 'orderDoctrine' | 'orderPlan' | 'orderLetter' | 'orderSupersedes' | 'orderPriorDispatch'>;

export function issueOrder(ctx: TickContext, state: State, seat: SeatId, cmd: OrderCommand | AnswerProposalCommand | ReviewCommand | GoCommand): RejectionReason | null {
  const { world } = ctx;
  const assignment = state.seatAssignments[seat];
  if (assignment === undefined) return 'unknown_seat';
  const sender = senderFor(world, state, seat, undefined, ctx.senderViews);
  if (sender === null) return 'not_a_principal';
  const issuer = { id: sender.principal };
  if (!sender.posts.has(cmd.to)) {
    const declared = sender.declaredSide(cmd.to);
    return declared != null && declared !== sender.faction ? 'not_field_post' : 'unknown_post';
  }
  const paper = cmd.cmd === 'review' ? receivedPlanPapers(state,issuer.id).find(r => r.knownBody.reportPlan?.paperPost === cmd.to && (cmd.paper === undefined || r.id === cmd.paper)) : undefined;
  if (!sender.field(cmd.to) || sender.side(cmd.to) !== sender.faction) return 'not_field_post';
  if (sender.holder(cmd.to) === null && paper === undefined) return 'vacant_post';
  // Only the routes the principal's menu offers (review N1): an order "in person" would be a visit, a verb of its own.
  if (!ORDER_ROUTES.includes(cmd.route)) return 'route_unavailable';

  let body: OrderEnclosure;
  if (cmd.cmd === 'order' || cmd.cmd === 'answer_proposal') {
    const priorGoal = ctx.outbox.find(m => m.msgOrder?.orderKind === 'goal' && m.msgOrder.orderIssuer === issuer.id && m.msgOrder.orderTarget === cmd.to);
    if (priorGoal?.msgOrder?.orderLetter !== undefined || (priorGoal !== undefined && cmd.cmd === 'order' && cmd.letter !== undefined)) return 'bad_goal';
    const proposal = cmd.cmd === 'answer_proposal'
      ? receivedProposalPapers(state, issuer.id).find(p => p.id === cmd.proposal && p.knownBody.reportSubjectId === cmd.to)
      : undefined;
    if (cmd.cmd === 'answer_proposal' && (proposal === undefined || proposal.knownBody.reportAuthor !== sender.holder(cmd.to) ||
      ctx.outbox.some(m => m.msgOrder?.orderProposal?.replyPaper === cmd.proposal))) return 'no_proposal';
    const goal = cmd.cmd === 'order' || cmd.action === 'discretion' ? goalOf(cmd.goal)
      : cmd.action === 'accept' ? proposal!.knownBody.reportProposal!.goal : null;
    const commands = allCommandedBlocks(ctx.world.map, state, cmd.to);
    if (goal !== null && goalProblems(goal).length > 0) return 'bad_goal';
    for (let term = goal; term !== null; term = term.goalDiscretion?.fallback ?? null) {
      if (term.goalObjective !== null && !world.regionIds.includes(term.goalObjective)) return 'bad_goal';
      if (!term.goalCommitted.every(b => commands.includes(b))) return 'bad_goal';
    }
    if (cmd.doctrine !== undefined) {
      const doctrine = world.map.world.rules.ruleSeats.principals.find(r => r.faction === sender.faction);
      const rows = cmd.cmd === 'order' ? doctrine?.offensives : doctrine?.proposalAnswers;
      if (!rows?.some(r => r.id === cmd.doctrine && r.post === cmd.to)) return 'bad_goal';
      const paperGate = rows.find(r => r.id === cmd.doctrine && r.post === cmd.to)?.requiresPapers;
      if (paperGate !== undefined && !hasRequiredPapers(paperGate, knowledgeOf(state, seatIdFor(issuer.id)), state.stateDay, world.rules.templates)) return 'bad_goal';
    }
    let authored: Pick<OrderBody, 'orderLetter' | 'orderSupersedes' | 'orderPriorDispatch'> = {};
    if (cmd.cmd === 'order' && cmd.letter !== undefined) {
      const key = letterKey(cmd.letter);
      const doctrine = world.map.world.rules.ruleSeats.principals.find(r => r.faction === sender.faction);
      const row = doctrine?.offensives.find(o => o.letter !== undefined && letterKey(o.letter) === key && o.post === cmd.to);
      if (row === undefined || doctrine === undefined || state.calendarStart === null || goal === null) return 'bad_goal';
      const knowledge = knowledgeOf(state, seatIdFor(issuer.id));
      const dispatches = knowledge.knownDoctrineDispatches ?? [];
      const lookup = (id: string) => dispatches.find(d => letterKey(d.dispatchLetter) === id);
      const sent = lookup(key);
      const prior = sent?.dispatchLatest ?? sent?.dispatchOrigin;
      if (prior !== cmd.retryOf) return 'bad_goal';
      if (!letterDependencies(row).every(d => lookup(letterKey(d)) !== undefined)) return 'bad_goal';
      const since = warSince(world, state, sender.faction);
      if (since === null || ctx.day <= since || ctx.day < daysFromCivil(parseIsoDate(row.fromDate)) - daysFromCivil(parseIsoDate(state.calendarStart))) return 'bad_goal';
      if (row.requiresNotice !== undefined && !knowledge.knownReports.some(r => r.knownReceivedDay <= state.stateDay && r.knownBody.reportDay <= state.stateDay &&
        r.knownBody.reportSubjectKind === 'situation' && r.knownBody.reportSubjectId === row.requiresNotice)) return 'bad_goal';
      if (prior === undefined && !hasRequiredPapers(row.requiresPapers, knowledge, state.stateDay, world.rules.templates)) return 'bad_goal';
      if (!sameGoal(goal, goalOf(authoredGoal(row, world.map.world.rules.plans.goalDefaults, doctrine.crossNeutral)))) return 'bad_goal';
      const repeat = row.repeats === undefined ? undefined : lookup(letterKey(row.repeats))?.dispatchOrigin;
      authored = { orderLetter: row.letter!, ...(row.supersedes === undefined ? {} : { orderSupersedes: row.supersedes }),
        ...(prior === undefined && repeat === undefined ? {} : { orderPriorDispatch: prior ?? repeat! }) };
    }
    body = { orderKind: goal === null ? 'decline_proposal' : 'goal', orderGoal: goal, orderEdit: null, orderCall: null,
      ...authored,
      ...(cmd.doctrine === undefined ? {} : { orderDoctrine: cmd.doctrine }),
      ...(cmd.cmd === 'answer_proposal' ? { orderProposal: {
        replyPaper: cmd.proposal, replyOrder: proposal!.knownBody.reportAnswers!, replyAction: cmd.action,
        ...(proposal!.knownBody.reportProposal!.proposalBasis === undefined ? {} : { replyBasis: proposal!.knownBody.reportProposal!.proposalBasis }),
      } } : {}),
    };
  } else {
    const knowledge = knowledgeOf(state, seatIdFor(issuer.id));
    const sent = knowledge.knownSentOrders ?? [];
    const goal = latestSentGoal(sent, knowledge.knownReports.filter(r => r.knownReceivedDay <= state.stateDay && r.knownBody.reportDay <= state.stateDay), cmd.to);
    const conditional = receivedConditionalGoal(state, issuer.id, cmd.to, sender.holder(cmd.to));
    const paperOrder = paper?.knownBody.reportLetter === undefined ? undefined : paper.knownBody.reportAnswers ?? undefined;
    if (cmd.cmd === 'review' && cmd.paper !== undefined && paperOrder === undefined) return 'no_plan';
    const review = sent.find(o => o.sentPost === cmd.to && (o.sentKind === 'approve' || o.sentKind === 'edit') && o.sentDay >= (goal?.sentDay ?? 0));
    const approved = conditional === undefined
      ? goal?.sentGoal?.goalApproveAsDrafted === true || review !== undefined
      : conditional.ready || conditional.goal.goalApproveAsDrafted || review?.sentPlan === conditional.order;
    if (cmd.cmd === 'go') {
      if ((conditional?.goal ?? goal?.sentGoal)?.goalAwaitWord !== true || !approved || (conditional !== undefined && !conditional.ready)) return 'no_plan';
      const authoredGo = goal?.sentLetter === undefined ? undefined : conditional?.order ?? receivedAuthoredGo(state, issuer.id, cmd.to, sender.holder(cmd.to));
      if (goal?.sentLetter !== undefined && authoredGo === undefined) return 'no_plan';
      body = { orderKind: 'go', orderGoal: null, orderEdit: null, orderCall: null,
        ...(authoredGo === undefined && conditional === undefined ? {} : { orderPlan: authoredGo ?? conditional!.order }) };
    } else if (cmd.action === 'edit') {
      if (paper === undefined && !approved) return 'no_plan';
      const edit = editOf(cmd.edit!);
      if (editIssues(edit).length > 0) return 'bad_review';
      if ([edit.editRegion, ...edit.editVia].some((r) => r !== null && !world.regionIds.includes(r))) return 'bad_review';
      body = { orderKind: 'edit', orderGoal: null, orderEdit: edit, orderCall: null,
        ...(paperOrder === undefined && conditional === undefined ? {} : { orderPlan: paperOrder ?? conditional!.order }) };
    } else {
      if (paper === undefined) return 'no_plan';
      const notes = cmd.notes;
      if (notes !== undefined) {
        const limits = world.map.world.rules.plans.notes;
        if (cmd.action !== 'send_back' || notes.length > limits.maxMarks) return 'bad_review';
        for (const n of notes) {
          if (noteProblems(n).length || n.markVia.length > limits.maxWaypoints || (n.markDays !== null && n.markDays > limits.maxWaitDays)) return 'bad_review';
          if ([n.markRegion, ...n.markVia].some(r => r !== null && !world.regionIds.includes(r))) return 'bad_review';
          if (!paper.knownBody.reportPlan!.paperChosen.candAxes.some(a => a.axisName === n.markAxis)) return 'bad_review';
        }
      }
      body = { orderKind: cmd.action, orderGoal: null, orderEdit: null, orderCall: null, ...(notes === undefined ? {} : { orderNotes: notes.map(copyNote) }),
        ...(paperOrder === undefined && conditional === undefined ? {} : { orderPlan: paperOrder ?? conditional!.order }) };
    }
  }

  dispatchOrder(ctx, state, seat, issuer.id, cmd.to, cmd.route, cmd.bypass, body);
  return null;
}

/**
 * Send a validated order down the chain (or around it): the hops, the first leg, a special messenger's price and each
 * bypassed relay's grievance. Shared by goals, reviews, the word to go and calls (lane 1.7).
 */
export function dispatchOrder(ctx: TickContext, state: State, seat: SeatId, issuerId: PersonId, to: PostId, route: OrderCommand['route'], bypass: boolean, body: OrderEnclosure, requisition?: PostId): MessageId {
  const { world } = ctx;
  const cmd = { to, route, bypass };
  const issuer = { id: issuerId };
  // The whole chain of posts between the principal's own post and the target relays his order.
  const sender = senderFor(world, state, seat, requisition, ctx.senderViews)!;
  const officeAddress = requisition !== undefined && sender.holder(cmd.to) === null;
  const chain = officeAddress ? [cmd.to] : sender.chain(cmd.to);
  // Vacant relay posts cannot relay: the order skips them.
  const relays = chain.slice(0, -1).filter((p) => sender.holder(p) !== null);
  // The addressee is the man the issuer believes holds the post (lane 1.12): its holder, or the commander a battle took
  // whose loss has not been reported to him.
  const hops: Hop[] = [...(cmd.bypass ? [] : relays), cmd.to].map((p, i, all) => ({
    hopPerson: i === all.length - 1 ? (officeAddress ? issuer.id : sender.holder(p) ?? receivedPlanPapers(state,issuer.id).find(r => r.knownBody.reportPlan?.paperPost === p)?.knownBody.reportAuthor)! : sender.holder(p)!,
    hopPost: p,
    hopRole: i === all.length - 1 ? 'addressee' : 'relay',
  }));
  const first = hops[0]!;
  const tag = body.orderLetter === undefined ? (body.orderKind === 'goal' ? `order.${cmd.to}` : `${body.orderKind}.${cmd.to}`)
    : `letter.${letterKey(body.orderLetter)}${body.orderPriorDispatch === undefined ? '' : `.${body.orderPriorDispatch}`}`;
  const id = mintMessageId(ctx.mint, ctx.day, issuer.id, first.hopPerson, tag);
  const leg = hop(ctx, state, cmd.route, issuer.id, whereIs(ctx, state, issuer.id), hopRegion(ctx, state, first), id);
  ctx.outbox.push({
    id,
    msgOrigin: id,
    ...(officeAddress ? { msgOfficeAddress: true as const } : {}),
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
      ctx.proposals.push({ proposal: 'grievance', person: sender.holder(p)!, cause: 'bypassed', order: id });
    }
  }
  return id;
}

/**
 * Where a hop's leg ends: where its man is, or, for a man who no longer holds the post it is addressed to (a commander
 * a battle took, lane 1.12), the post's headquarters, where the dispatch goes looking for him.
 */
function hopRegion(ctx: TickContext, state: State, h: Hop): RegionId {
  if (h.hopPost !== null && state.postStates[h.hopPost]?.postHolder !== h.hopPerson) return addressRegion(ctx,state,h.hopPost,h.hopPerson);
  return whereIs(ctx, state, h.hopPerson);
}

/** Kernel transport still follows physical geography; a dissolved post is sought at its declared address. */
export function addressRegion(ctx: TickContext, state: State, post: PostId, fallback: PersonId): RegionId {
  if (state.postStates[post] !== undefined) return headquartersOf(ctx.world,state,post);
  const declared = ctx.world.start.posts.find(p => p.id === post) ?? ctx.world.start.temporaryPosts.find(p => p.id === post);
  return declared?.region ?? ctx.world.startHeadquarters(post) ?? whereIs(ctx,state,fallback);
}

/** Destination truth, consulted only when the letter gets there; neutral governors may receive calls. */
export function destinationFailure(ctx: TickContext, state: State, post: PostId, person: PersonId, issuer: PersonId, neutral = false): string | null {
  const target = state.postStates[post];
  if (target === undefined || target.postHolder === null) return 'vacant_post';
  if (target.postHolder !== person) return 'holder_changed';
  if ((state.personStatus[person]?.statusKind ?? 'serving') !== 'serving') return 'not_serving';
  const side = postFaction(ctx.world,state,post);
  const authority = sideOfPerson(ctx.world.map,state,issuer);
  if (side !== authority && !(neutral && side === null)) return 'other_side';
  const service = sideOfPerson(ctx.world.map,state,person);
  if (service !== authority && !(neutral && side === null && service === null)) return 'other_side';
  return null;
}

/**
 * A dispatch that reaches a post whose holder is no longer the man it was addressed to (lane 1.12, 0052): the post fell
 * vacant, or changed hands, while it travelled. It is not answered; it comes back to its issuer, from the post, by the
 * way it went, as a returned dispatch naming the post and why (`vacant_post` or `holder_changed`). The player reads it
 * in his reports, like any answer to an order.
 */
export function returnDispatch(ctx: TickContext, state: State, msg: TransitMessage, failure?: string): State {
  const issuer = msg.msgOrder?.orderIssuer ?? msg.msgVerb!.verbIssuer;
  const post = msg.msgVerb?.verbPost ?? msg.msgToPost!;
  const why = failure ?? (state.postStates[post]?.postHolder == null ? 'vacant_post' : 'holder_changed');
  sendReport(ctx, state, {
    body: answerBody(issuer, null, ctx.day, {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportClaims: [{ claimKind: 'order-returned', claimRegion: msg.msgOrder === null ? null : objectiveOf(state, msg.msgOrder), claimValue: 0, claimToken: why, claimConfidence: 1000 }],
      reportAdvice: null,
      ...(msg.msgOrder?.orderLetter === undefined ? {} : { reportLetter: msg.msgOrder.orderLetter }),
      answers: msg.msgOrigin,
      about: post,
    }),
    truth: { truthTerms: [term('observed', 0, { ...(msg.msgOfficeAddress === true ? {} : { person: msg.msgTo }), post, rule: why })], truthTrimmed: [] },
    to: issuer,
    tag: `returned.${post}`,
    route: msg.msgRoute,
    fromRegion: addressRegion(ctx, state, post, issuer),
  });
  fire(ctx, 'orders.returned');
  return state;
}

/** A report answering an order: its subject is the post the order was for, and it names the order it answers. */
export function answerBody(
  author: PersonId,
  authorPost: PostId | null,
  day: number,
  partial: Pick<ReportBody, 'reportType' | 'reportSubtype' | 'reportClaims' | 'reportAdvice' | 'reportNotes' | 'reportPlan' | 'reportProposal' | 'reportDiscretion' | 'reportQualification' | 'reportLetter'> & { readonly answers: MessageId; readonly about: PostId },
): ReportBody {
  return {
    ...(partial.reportLetter === undefined ? {} : { reportLetter: partial.reportLetter }),
    ...(partial.reportPlan === undefined ? {} : { reportPlan: partial.reportPlan }),
    ...(partial.reportNotes === undefined ? {} : { reportNotes: partial.reportNotes }),
    ...(partial.reportProposal === undefined ? {} : { reportProposal: partial.reportProposal }),
    ...(partial.reportDiscretion === undefined ? {} : { reportDiscretion: partial.reportDiscretion }),
    ...(partial.reportQualification === undefined ? {} : { reportQualification: partial.reportQualification }),
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
  const terms = order.orderKind === 'call' ? callDirective(world.map.world.rules.recruitment, order.orderCall!)
    : order.orderGoal !== null ? goalDirective(rules, order.orderGoal) : goalTerms(rules, relayKindOf(start, order));
  const answer = answerOrder(world, start, relayer.id, order.orderIssuer, terms, { oversight: oversightOf(ctx, start, relayer.id, order.orderIssuer).value });
  const state = recordResponse(start, responseOf(answer, { order: msg.msgOrigin, person: relayer.id, post, role: 'relay', day: ctx.day, kind: order.orderKind, ...(order.orderCall?.callId === undefined ? {} : { callId: order.orderCall.callId }) }));
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
        reportAdvice: { adviceRecommends: 'withdraw-order', adviceReasons: decision.stated, adviceConfidence: ctx.world.map.world.rules.reportConfidence.orderObjection },
        ...(order.orderLetter === undefined ? {} : { reportLetter: order.orderLetter }),
        answers: msg.msgOrigin,
        about: order.orderTarget,
      }),
      truth: { truthTerms: decision.terms, truthTrimmed: [] },
      to: order.orderIssuer,
      tag: `objection.${order.orderTarget}`,
    });
    return state;
  }
  if (answer.declaredReservations.length > 0 || answer.declaredReservationGaps.length > 0) acknowledge(ctx, state, msg, 'relayed', true, answer);
  const next = msg.msgPending[0]!;
  const id = mintMessageId(ctx.mint, ctx.day, relayer.id, next.hopPerson,
    order.orderLetter === undefined ? `order.${order.orderTarget}` : `letter.${letterKey(order.orderLetter)}.${msg.msgOrigin}`);
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
function acknowledge(ctx: TickContext, state: State, msg: TransitMessage, token: string, obeyed: boolean, response?: DirectiveResponse): void {
  const order = msg.msgOrder!;
  const post = msg.msgToPost!;
  sendReport(ctx, state, {
    body: answerBody(msg.msgTo, post, ctx.day, {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportClaims: [{ claimKind: 'order-obeyed', claimRegion: objectiveOf(state, order), claimValue: obeyed ? 1 : 0, claimToken: token, claimConfidence: 1000 }],
      reportAdvice: null,
      ...(order.orderLetter === undefined ? {} : { reportLetter: order.orderLetter }),
      ...(response === undefined ? {} : reportQualificationOf(response)),
      answers: msg.msgOrigin,
      about: post,
    }),
    truth: { truthTerms: [], truthTrimmed: [] },
    to: order.orderIssuer,
    tag: `ack.${post}`,
  });
}

/** A conditional plan's readiness is a paper, like notice of the switch that authorised it. */
export function reportConditionalReady(ctx: TickContext, state: State, post: PostId): void {
  const record = planOf(state, post)!;
  if (record.planStatus !== 'ready' || (record.planGoal.goalDiscretion === undefined && record.planDiscretionOrder === undefined && record.planLetter === undefined)) return;
  const holder = state.postStates[post]!.postHolder!;
  sendReport(ctx, state, {
    body: answerBody(holder, post, ctx.day, {
      reportType: 'wire-dispatch', reportSubtype: null, reportAdvice: null, answers: record.planOrder, about: post,
      ...(record.planLetter === undefined ? {} : { reportLetter: record.planLetter }),
      reportClaims: [{ claimKind: 'goal-status', claimRegion: record.planGoal.goalObjective, claimValue: 1, claimToken: 'ready', claimConfidence: 1000 }],
    }),
    truth: { truthTerms: [], truthTrimmed: [] }, to: record.planIssuer, tag: `ready.${post}`,
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
  if (order.orderLetter !== undefined && plan?.planLetter !== undefined && sameLetterFamily(order.orderLetter, plan.planLetter)) return { obeyed: 'new', conflict: false };
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
 *   waits for the day's drafting, and he reports which order he obeyed. An unchanged goal from the same issuer
 *   reaffirms the held goal: its plan and operation keep their original identity and clocks (S51's lead ruling).
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
  if (order.orderPlan !== undefined && plan?.planOrder !== order.orderPlan) {
    acknowledge(ctx, state, msg, 'stale', false);
    return state;
  }
  const reply = order.orderProposal;
  if (reply !== undefined) {
    const stillHeld = plan?.planOrder === (reply.replyBasis ?? reply.replyOrder);
    const stillChallenged = reply.replyBasis === undefined || (plan?.planChallenge?.challengeOrder === reply.replyOrder &&
      plan.planChallenge.challengeIssuer === order.orderIssuer && plan.planChallenge.challengePending === undefined);
    if (!stillHeld || !stillChallenged) {
      acknowledge(ctx, state, msg, 'stale', false);
      return state;
    }
  }
  if (order.orderKind === 'decline_proposal') {
    acknowledge(ctx, state, msg, 'decline_proposal', true);
    return reply?.replyBasis === undefined ? state : finishChallenge(state, post, false);
  }
  if (order.orderKind === 'goal') {
    const goal = order.orderGoal!;
    const letter = order.orderLetter;
    const sameInstruction = letter === undefined ? plan?.planLetter === undefined : plan?.planLetter !== undefined &&
      order.orderPriorDispatch !== undefined && letterKey(letter) === letterKey(plan.planLetter);
    const reaffirmed = sameInstruction && plan !== undefined && plan.planIssuer === order.orderIssuer && sameGoal(plan.planGoal, goal);
    const outcome = conflictOf(ctx, state, msg, plan);
    const answer = answerOrder(ctx.world, state, msg.msgTo, order.orderIssuer, goalDirective(ctx.world.rules.people, goal), { oversight: oversightOf(ctx, state, msg.msgTo, order.orderIssuer).value });
    let next = recordResponse(state, responseOf(answer, { order: msg.msgOrigin, person: msg.msgTo, post, role: 'addressee', day: ctx.day, kind: order.orderKind }));
    const response = responseKey(msg.msgOrigin, msg.msgTo);
    if (letter !== undefined) {
      const obsolete = knowledgeOf(state, seatIdFor(msg.msgTo)).knownPaperReceipts?.some(r => r.receiptLetter !== undefined && r.receiptRole === 'addressee' && r.receiptPost === post &&
        r.receiptIssuer === order.orderIssuer && sameLetterFamily(r.receiptLetter, letter) && r.receiptLetter.revision > letter.revision);
      if (obsolete) {
        acknowledge(ctx, next, msg, 'obsolete', false, answer);
        return next;
      }
      if (order.orderSupersedes !== undefined && answer.undertaking === null) {
        acknowledge(ctx, next, msg, answer.declared, false, answer);
        if (plan === undefined) return next;
        return challengeGoal(next, post, { challengeOrder: msg.msgOrigin, challengeIssuer: order.orderIssuer,
          challengeGoal: goal, challengeResponse: response, challengePending: true, challengeLetter: letter });
      }
    }
    // 0116: without any positive received enemy claim, compliance cannot
    // qualify. Do not disturb an unchanged plan with a needless request.
    // The planner still judges the condition and the alternative in full.
    const receivedThreat = answer.undertaking !== null &&
      knowledgeOf(state, seatIdFor(msg.msgTo)).knownReports.some(r => r.knownReceivedDay <= ctx.day &&
        r.knownBody.reportDay <= ctx.day && r.knownBody.reportClaims.some(c => c.claimKind === 'enemy-strength' && (c.claimValue ?? 0) > 0));
    const propose = answer.declaredReservations.some(r => r.effect === 'statement' && r.subject === 'course') || answer.declared === 'object' || answer.declared === 'refuse'
      || receivedThreat;
    if (outcome.obeyed === 'new' && !reaffirmed) {
      const set = { id: msg.msgOrigin, issuer: order.orderIssuer, goal, viaChain: !order.orderBypass,
        issuedDay: order.orderIssuedDay, response, propose, ...(letter === undefined ? {} : { letter }) };
      next = setGoal(next, post, set, ctx.day);
    } else if (propose) {
      next = challengeGoal(next, post, { challengeOrder: msg.msgOrigin, challengeIssuer: order.orderIssuer,
        challengeGoal: goal, challengeResponse: response, challengePending: true, ...(letter === undefined ? {} : { challengeLetter: letter }) });
    }
    fire(ctx, 'orders.obeyed', outcome.obeyed === 'new' ? 1 : 0);
    if (outcome.obeyed === 'new' && !reaffirmed) fire(ctx, 'plans.goal_set');
    if (outcome.conflict) {
      fire(ctx, 'orders.conflict');
      ctx.events.push({ event: 'conflict', person: msg.msgTo, post, message: msg.msgOrigin, terms: [] });
    }
    acknowledge(ctx, next, msg, outcome.conflict ? `conflict-${outcome.obeyed}` : letter !== undefined && reaffirmed ? 'reaffirmed' : outcome.obeyed, outcome.obeyed === 'new', answer);
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
    const answer = answerOrder(ctx.world, answered, msg.msgTo, order.orderIssuer, {
      boldness: terms.boldness, honours: terms.honours, offends: terms.offends, required: 0,
      clauses: [{ clauseId: `mark:${index}`, clauseSubject: n.markKind === 'wait' ? 'timing' : 'course' }],
      valueClauseLinks: terms.offends.map(value => [value, `mark:${index}`]),
    }, { oversight: oversightOf(ctx, answered, msg.msgTo, order.orderIssuer).value });
    answered = recordResponse(answered, responseOf(answer, { order: msg.msgOrigin, person: msg.msgTo, post, role: 'addressee', day: ctx.day, kind: order.orderKind, note: index }));
    readings.push({ readingMark: n, readingResponse: responseKey(msg.msgOrigin, msg.msgTo, index) });
  }
  const changed = order.orderKind === 'approve' ? approve(answered, post) : order.orderKind === 'send_back' ? sendBack(answered, post, readings) : release(answered, post);
  if (order.orderKind === 'approve') reportConditionalReady(ctx, changed, post);
  fire(ctx, order.orderKind === 'approve' ? 'plans.approved' : order.orderKind === 'send_back' ? 'plans.sent_back' : 'plans.released');
  acknowledge(ctx, changed, msg, order.orderKind, true);
  return changed;
}
