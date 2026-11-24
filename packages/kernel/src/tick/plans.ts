import { planAuthorized } from '../seats/local-actions.ts';
/**
 * The plan cycle in the day tick (lane 1.2; FOUNDATION sections 5 and 9):
 *
 * - **Choices** (phase 1b): a commander whose draft set was saved on an earlier day picks a candidate: his seat's
 *   answer to the morning's plan menu, or the best-scored when he had only one, or by default when his seat left the
 *   menu unanswered. His pick goes ahead, or goes to the goal's issuer for review by dispatch.
 * - **Plans** (phase 2b, after deliveries): edits that reached him today are re-expanded on the morning's map, scored by
 *   his scorer and answered through compliance; then goals awaiting a plan are drafted, oldest first, within the pack's
 *   daily drafting cap per side (0062). Plans are drafted on request, never every tick (FOUNDATION section 9).
 *
 * An approved plan (or one awaiting the word) is executed by the day's operations phase (`tick/operations.ts`, lane 1.4).
 */
import { strictCompare } from '../compare.ts';
import { deriveMap, type DerivedMap } from '../control-index/derived.ts';
import type { ComplianceRung, DirectiveAlternative, DirectiveTerms, QualificationInput, Reason } from '../directive.ts';
import type { MessageId, PersonId, PostId } from '../ids.ts';
import { reportQualificationOf, type DiscretionReport, type ReportBody, type ReportClaim, type StatedReason, type NoteAccount, type GoalProposal, type GoalProposalReason } from '../knowledge/report.ts';
import { followsNote } from '../planner/notes.ts';
import { templateFor } from '../knowledge/templates.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import { term } from '../knowledge/truth.ts';
import { clampPermille } from '../permille.ts';
import { liveTerms, draft } from '../planner/draft.ts';
import { discretionAssessment, preferableGoal } from '../planner/discretion.ts';
import { applyEdit, concretePlan, editDirective, editFailureDiagnostic, PLAN_HOLDS } from '../planner/edits.ts';
import { plannerInputFor } from '../planner/input.ts';
import { enclosePlan } from '../planner/paper.ts';
import { createViewCache } from '../view/view.ts';
import type { PlanPaper } from '../knowledge/plan-paper.ts';
import type { PlannerInput } from '../planner/context.ts';
import type { DraftSet, PlanCandidate, TermKind } from '../planner/types.ts';
import { goalKindOf } from '../plans/goal.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { answerOrder, goalTerms } from '../reading/orders.ts';
import { candidateOf, choose, endDetention, finishChallenge, finishProposal, planOf, plannedPosts, postsInStatus, saveDraft, settleCounter, submitted, switchGoal, type PlanCounter, type PlanRecord } from '../plans/plans.ts';
import type { State } from '../root-state.ts';
import type { OptionView } from '../seats/api.ts';
import { headquartersOf, postFaction } from '../seats/posts.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { viewFor, type ViewCache } from '../view/view.ts';
import { fire, sendReport, type TickContext, oversightOf } from './context.ts';
import { monthOf } from './map.ts';
import { answerBody, reportConditionalReady } from './orders.ts';
import { passageOf } from './passage.ts';

/** Every mechanic the plan cycle counts (FOUNDATION section 11.5), the planner's scoring terms among them. */
export const PLANS_MECHANICS = [
  'planner.candidates',
  'planner.searches',
  ...(['caution', 'coordination', 'dependence', 'exposure', 'force_ratio', 'glory', 'goal_fit', 'haste', 'notes', 'supply', 'time'] as const satisfies readonly TermKind[]).map((t) => `planner.term.${t}`),
  'plans.approved',
  'plans.chosen',
  'plans.draft_deferred',
  'plans.drafted',
  'plans.edit_answered',
  'plans.edit_invalid',
  'plans.edit_objected',
  'plans.edit_received',
  'plans.edit_shirked',
  'plans.goal_set',
  'plans.goal_proposed',
  'plans.discretion_exercised',
  'plans.released',
  'plans.sent_back',
  'plans.submitted',
  'plans.went_ahead',
] as const;

/** A candidate as a seat sees it on a menu or under review. */
export function optionView(c: PlanCandidate, privateTerms = true): OptionView {
  const visibleTerms = c.candTerms.filter(t => privateTerms || t.contribTerm !== 'notes');
  return {
    optionId: privateTerms ? c.id : c.id.replace(/\+note\d+/g, ''),
    method: c.candMethod,
    ...(c.candDetention === undefined ? {} : { detention: c.candDetention.means === 'attack' ? { means: 'attack' } :
      { means: 'demonstrate', task: c.candDetention.task, intervals: c.candDetention.intervals,
        recovery: [c.candDetention.recovery.routeFrom, ...c.candDetention.recovery.routeLegs.map(l => l.legTo)] } }),
    variant: privateTerms ? c.candVariant : c.candVariant.replace(/\+note\d+/g, ''),
    score: visibleTerms.reduce((s,t) => s+t.contribAmount,0),
    terms: visibleTerms.map((t) => ({ term: t.contribTerm, amount: t.contribAmount })),
    axes: c.candAxes.map((a) => ({
      name: a.axisName,
      post: a.axisPost,
      mode: a.axisMode,
      regions: [a.axisRoute.routeFrom, ...a.axisRoute.routeLegs.map((l) => l.legTo)],
      strength: a.axisStrength,
      phases: a.axisPhases.map((p) => p.phaseKind),
      arrival: a.axisArrival,
    })),
    requests: c.candRequests.map((r) => (r.reqKind === 'reinforcement' ? `reinforcement:${r.reqMen}` : `${r.reqKind}:${r.reqPost ?? 'principal'}`)),
    conditions: c.candConditions.map((g) => g.gateKind),
    perceivedEnemy: c.candPerceived,
    ratio: c.candRatio,
    ...(c.candUnavailableTerms === undefined ? {} : {unavailableTerms:c.candUnavailableTerms}),
  };
}

/** The request key of a commander's plan menu. */
export function planKey(post: PostId, day: number): string {
  return `plan:${post}:${day}`;
}

/** Posts whose holder picks a plan this morning (a draft saved on an earlier day), in id order. */
export function choosingPosts(state: State, day: number): PostId[] {
  return postsInStatus(state, 'choosing').filter(post => {
    const record = state.planRecords[post]!;
    return record.planDetentionEnd === undefined && record.planDraft!.draftDay < day && (state.postStates[post]?.postHolder ?? null) !== null;
  });
}

export function requiresEpisodeChoice(state: State, post: PostId): boolean {
  const plan = state.planRecords[post];
  return plan?.planGoal.goalPurpose !== undefined &&
    Object.values(state.operationRecords).some(o => o.opOrder === plan.planOrder && o.opEndDay !== null);
}

/** The options a commander is offered this morning: every candidate of his draft set, best first; null when he has nothing to pick. */
export function planOptions(state: State, post: PostId, day: number): readonly OptionView[] | null {
  if (!choosingPosts(state, day).includes(post)) return null;
  return state.planRecords[post]!.planDraft!.draftCandidates.map(c => optionView(c));
}

/** Kernel-judged choices addressed to their own commander (0052, Seats), not a principal's post catalogue. */
export function choosingMenus(state: State, day: number) {
  return choosingPosts(state, day).flatMap(post => {
    const options = planOptions(state, post, day);
    return options === null || (options.length < 2 && !requiresEpisodeChoice(state, post)) ? [] : [{ post, holder: state.postStates[post]!.postHolder!, options }];
  });
}

/** A report from a commander to the goal's issuer, answering the goal's order. */
function toIssuer(ctx: TickContext, state: State, post: PostId, record: PlanRecord, claims: readonly ReportClaim[], options: Pick<ReportBody, 'reportQualification'> & { readonly plan?: PlanPaper; readonly notes?: readonly NoteAccount[]; readonly objection?: readonly StatedReason[]; readonly proposal?: GoalProposal; readonly discretion?: DiscretionReport; readonly truth?: ReturnType<typeof term>[]; readonly answers: MessageId; readonly issuer?: PersonId; readonly tag: string }): MessageId {
  const holder = state.postStates[post]!.postHolder!;
  const letter = options.answers === record.planOrder || options.answers === record.planDiscretionOrder ? record.planLetter
    : record.planChallenge?.challengeOrder === options.answers ? record.planChallenge.challengeLetter : undefined;
  return sendReport(ctx, state, {
    body: answerBody(holder, post, ctx.day, {
      reportType: options.objection === undefined ? 'wire-dispatch' : 'advice',
      reportSubtype: options.objection === undefined ? null : 'memorandum',
      reportClaims: claims,
      reportAdvice: options.objection === undefined ? null : { adviceRecommends: 'keep-own-plan', adviceReasons: options.objection, adviceConfidence: ctx.world.map.world.rules.reportConfidence.planObjection },
      ...(options.notes === undefined ? {} : { reportNotes: options.notes }),
      ...(options.plan === undefined ? {} : { reportPlan: options.plan }),
      ...(options.proposal === undefined ? {} : { reportProposal: options.proposal }),
      ...(options.discretion === undefined ? {} : { reportDiscretion: options.discretion }),
      ...(options.reportQualification === undefined ? {} : { reportQualification: options.reportQualification }),
      ...(letter === undefined ? {} : { reportLetter: letter }),
      answers: options.answers,
      about: post,
    }),
    truth: { truthTerms: options.truth ?? [], truthTrimmed: [] },
    to: options.issuer ?? record.planIssuer,
    tag: options.tag,
  });
}

/**
 * Apply the morning's picks: each choosing post's seat answer, or the best-scored by default (logged as a defaulted
 * seat when he was asked and did not answer). A pick that needs review is submitted to the goal's issuer by dispatch.
 */
export function applyPlanChoices(ctx: TickContext, start: State, menus: ReadonlyMap<PostId, readonly OptionView[]>, choices: ReadonlyMap<PostId, string>): State {
  let state = start;
  for (const post of choosingPosts(start, ctx.day)) {
    const record = state.planRecords[post]!;
    const options = record.planDraft!.draftCandidates.filter(c => planAuthorized(ctx.world,state,post,record,ctx.day,c));
    if (options.length === 0) continue;
    let pick = choices.get(post);
    if (pick === undefined) {
      if (requiresEpisodeChoice(start, post)) continue;
      pick = options[0]!.id;
      if (menus.has(post) && options.length > 1) {
        fire(ctx, 'seats.defaulted');
        ctx.events.push({ event: 'seat_defaulted', person: state.postStates[post]!.postHolder!, post, message: null, terms: [] });
      }
    }
    if (!options.some(c => c.id === pick)) continue;
    const chosen = choose(state, post, pick);
    state = chosen.state;
    fire(ctx, 'plans.chosen');
    if (chosen.status === 'review') {
      const c = candidateOf(record, pick)!;
      const notes: NoteAccount[] = (record.planNotes ?? []).map(n => {
        const response = state.orderResponses[n.readingResponse]!;
        const followed = followsNote(c, n.readingMark);
        const possible = record.planDraft!.draftCandidates.some(other => followsNote(other, n.readingMark));
        return { accountMark: n.readingMark,
          accountOutcome: followed ? 'followed' : OBJECTS.includes(response.respDeclared) ? 'declined' : possible ? 'own_judgement' : 'unavailable',
          accountReasons: response.respStated.map(r => ({ reasonKind: r.kind, reasonWeight: statedWeight(r) })),
          ...(response.respDeclaredReservations?.length ? { accountReservations: response.respDeclaredReservations } : {}) };
      });
      const network = passageOf(ctx.world.map, state);
      const month = monthOf(state, ctx.day);
      const derived = deriveMap(ctx.world.map, { control: state.regionControl, month, network });
      const input = withNotePreferences(plannerInputFor(ctx.world, state, derived, network, month, viewFor(ctx.world, state, seatIdFor(state.postStates[post]!.postHolder!), createViewCache()), post, record.planGoal, ctx.day), ctx.world, state, record);
      const report = toIssuer(ctx, state, post, record, [{ claimKind: 'plan-submitted', claimRegion: record.planGoal.goalObjective ?? null, claimValue: optionView(c, false).score, claimToken: c.candMethod, claimConfidence: 1000 }], { plan: enclosePlan(input, record.planDraft!, c), answers: record.planOrder, tag: `plan.${post}`, ...(notes.length ? { notes } : {}) });
      state = submitted(state, post, report);
      fire(ctx, 'plans.submitted');
    } else {
      fire(ctx, 'plans.went_ahead');
      if (chosen.status === 'ready') reportConditionalReady(ctx, state, post);
    }
  }
  return state;
}


const SHIRKS: readonly ComplianceRung[] = ['slow_walk', 'reinterpret'];
const OBJECTS: readonly ComplianceRung[] = ['object', 'refuse'];

/** The same delivered marks and fixed compliance readings for a draft and its edits. */
function withNotePreferences(input: PlannerInput, world: SeatsWorld, state: State, record: PlanRecord): PlannerInput {
  const rules = world.map.world.rules.plans.notes;
  const notes = (record.planNotes ?? []).map(n => {
    const response = state.orderResponses[n.readingResponse]!;
    const executionRung = response.respReservations?.length && response.respActual === 'comply_with_reservations' ? 'comply' : response.respActual;
    const rung = rules.rungs.find(r => r.rung === executionRung);
    if (rung === undefined) throw new RangeError(`pack has no note weight for ${response.respActual}`);
    return { mark: n.readingMark, weight: rung.weight };
  });
  return notes.length ? { ...input, notes, noteScoreWeight: rules.scoreWeight } : input;
}

/** A stated reason's weight, permille, for the answer he sends: its gap, departure, shortfall or grievance weight; else full. */
function statedWeight(r: Reason): number {
  if ('gap' in r) return r.gap;
  if ('departure' in r) return r.departure;
  if ('shortfall' in r) return r.shortfall;
  if ('weight' in r) return Math.min(1000, r.weight);
  return 1000;
}

function draftFor(ctx: TickContext, input: PlannerInput): DraftSet {
  const set = draft(input);
  fire(ctx, 'plans.drafted');
  fire(ctx, 'planner.candidates', set.draftCandidates.length);
  fire(ctx, 'planner.searches', set.draftSearches);
  for (const t of liveTerms(set)) fire(ctx, `planner.term.${t}`);
  return set;
}

function draftProposal(ctx: TickContext, state: State, post: PostId, record: PlanRecord, input: PlannerInput, set: DraftSet,
  letter: { readonly answers: MessageId; readonly response: string; readonly issuer: PersonId; readonly basis?: MessageId }): boolean {
  const response = state.orderResponses[letter.response];
  if (response?.respPerson !== input.profile.person) return false;
  if (input.goal.goalPurpose !== undefined) {
    const challenged = OBJECTS.includes(response.respDeclared) &&
      (OBJECTS.includes(response.respActual) || response.respReservations?.some(r => r.subject === 'course'));
    const grounded = [...new Set(set.draftRejected.flatMap(r => r.rejGates.map(g => g.gateKind)))]
      .filter(g => g === 'insufficient_force' || g === 'insufficient_stores' || g === 'no_route').sort(strictCompare);
    if (!challenged || grounded.length === 0) return false;
    toIssuer(ctx, state, post, record, grounded.map(gate => ({ claimKind: 'detention-course', claimRegion: null,
      claimValue: 1, claimToken: gate, claimConfidence: ctx.world.map.world.rules.reportConfidence.planObjection })), {
      objection: response.respStated.map(r => ({ reasonKind: r.kind, reasonWeight: statedWeight(r) })),
      answers: letter.answers, issuer: letter.issuer, tag: `detention-course.${post}`,
    });
    return true;
  }
  const { searches, choice } = preferableGoal(input, set);
  if (searches > 0) fire(ctx, 'planner.searches', searches);
  if (choice === null) return false;
  const reading: GoalProposalReason[] = [];
  const challenged = (response.respDeclaredReservations === undefined
    ? response.respDeclared === 'comply_with_reservations'
    : response.respDeclaredReservations.some(r => r.effect === 'statement' && r.subject === 'course')) || OBJECTS.includes(response.respDeclared);
  if (!challenged) {
    if (response.respUndertaking === null || (response.respUndertaking === undefined && response.respActual !== 'comply' && response.respActual !== 'exceed')) return false;
    const joined = { ...input, forces: input.forces.filter(b => state.forceJoins[b.id] === undefined) };
    const position = headquartersOf(ctx.world, state, post);
    for (const condition of ['turned', 'outmatched'] as const) {
      const assessment = discretionAssessment(joined, position, { condition, fallback: choice.goal });
      if (assessment.status === 'established') {
        reading.push({ kind: 'position_threatened', condition, ...assessment.threat });
        break;
      }
    }
    if (reading.length === 0) return false;
  }
  toIssuer(ctx, state, post, record, [], {
    proposal: { goal: choice.goal, reasons: [...response.respStated, choice.reason, ...reading],
      ...(letter.basis === undefined ? {} : { proposalBasis: letter.basis }) },
    answers: letter.answers,
    issuer: letter.issuer,
    tag: `goal-proposal.${post}`,
  });
  fire(ctx, 'plans.goal_proposed');
  return true;
}

/** An affirmative received association elsewhere, covering the detention area, can end a bounded duty. */
function closeReportedDeparture(ctx: TickContext, state: State, post: PostId): State {
  const record = state.planRecords[post]!;
  const purpose = record.planGoal.goalPurpose;
  const holder = state.postStates[post]?.postHolder ?? null;
  if (purpose === undefined || holder === null || record.planDetentionEnd !== undefined) return state;
  const maxAge = templateFor(ctx.world.rules.templates, 'enemy-estimate', null).maxAgeDays;
  const papers = knowledgeOf(state, seatIdFor(holder)).knownReports.filter(r => r.knownReceivedDay < ctx.day &&
    r.knownReceivedDay >= record.planSetDay && r.knownBody.reportType === 'enemy-estimate' &&
    ctx.day - r.knownBody.reportDay <= maxAge);
  const newest = papers.sort((a, b) => b.knownBody.reportDay - a.knownBody.reportDay ||
    b.knownReceivedDay - a.knownReceivedDay || strictCompare(a.id, b.id))[0];
  if (newest === undefined) return state;
  const claims = newest.knownBody.reportClaims.filter(c => c.claimConfidence > 0);
  const positions = claims.filter(c => c.claimKind === 'enemy-command' && c.claimToken === purpose.detTargetPost && c.claimRegion !== null);
  if (positions.length === 0 || positions.some(c => purpose.detDetentionArea.includes(c.claimRegion!)) ||
    !purpose.detDetentionArea.every(region => claims.some(c => c.claimKind === 'enemy-strength' && c.claimRegion === region))) return state;
  toIssuer(ctx, state, post, record, positions.map(c => ({ claimKind: 'detention-effect', claimRegion: c.claimRegion,
    claimValue: newest.knownBody.reportDay, claimToken: 'reported_departure', claimConfidence: c.claimConfidence })), {
    answers: record.planOrder, tag: `detention-departure.${post}`,
  });
  return endDetention(state, post, { dendReason: 'reported_departure', dendDay: ctx.day, dendReport: newest.id });
}

/** The day's edits and drafts, on the morning's map (one derivation, only when there is plan work today). */
export function plansPhase(ctx: TickContext, initial: State, cache: ViewCache): State {
  const { world, day } = ctx;
  let start = initial;
  if (world.map.world.rules.plans.demonstration !== undefined) {
    for (const post of plannedPosts(initial)) start = closeReportedDeparture(ctx, start, post);
  }
  const posts = plannedPosts(start);
  const pending = posts.filter(p => planOf(start, p)!.planPending !== null);
  const granted = posts.filter(p => planOf(start, p)!.planGoal.goalDiscretion !== undefined);
  const retryDetention = (post: PostId, record: PlanRecord) => {
    const purpose = record.planGoal.goalPurpose;
    const holder = start.postStates[post]?.postHolder;
    if (purpose === undefined || holder === undefined || holder === null || record.planDraft === null ||
      record.planDetentionEnd !== undefined || !planAuthorized(world, start, post, record, day)) return false;
    const empty = record.planDraft.draftCandidates.length === 0;
    const prior = Object.values(start.operationRecords).filter(o => o.opOrder === record.planOrder && o.opPost === post)
      .sort((a, b) => b.opStartDay - a.opStartDay)[0];
    const recovered = prior !== undefined && prior.opEndDay !== null && prior.opDemonstration?.demEvents.at(-1)?.devReason === 'recovered';
    if (!empty && (!recovered || prior.opDraftDay !== record.planDraft.draftDay)) return false;
    // A recovered demonstration does not consume its target observation (the
    // separate limited-sortie form does). A new explicit logged choice, rather
    // than a newer report, is what permits another episode of this same duty.
    const earliest = recovered ? 0 : record.planDraft.draftDay;
    const maxAge = templateFor(ctx.world.rules.templates, 'enemy-estimate', null).maxAgeDays;
    return knowledgeOf(start, seatIdFor(holder)).knownReports.some(r => r.knownReceivedDay >= earliest &&
      day - r.knownBody.reportDay <= maxAge &&
      r.knownReceivedDay < day && r.knownBody.reportType === 'enemy-estimate' && r.knownBody.reportClaims.some(c =>
        c.claimKind === 'enemy-command' && c.claimToken === purpose.detTargetPost && c.claimRegion !== null &&
        purpose.detDetentionArea.includes(c.claimRegion)));
  };
  const needsDraft = (post: PostId, record: PlanRecord) => record.planDetentionEnd === undefined &&
    (record.planStatus === 'drafting' || record.planProposalPending === true || retryDetention(post, record));
  const hasChallenge = (record: PlanRecord) => record.planChallenge?.challengePending === true;
  if (pending.length === 0 && granted.length === 0 && !posts.some(p => {
    const record = planOf(start, p)!;
    return needsDraft(p, record) || hasChallenge(record);
  })) return start;
  const network = passageOf(world.map, start);
  const month = monthOf(start, day);
  const derived: DerivedMap = deriveMap(world.map, { control: start.regionControl, month, network });
  let state = start;

  for (const post of pending) state = answerEdit(ctx, state, post, derived, network, month, cache);

  for (const post of granted) {
    const record = state.planRecords[post]!;
    const grant = record.planGoal.goalDiscretion!;
    const holder = state.postStates[post]?.postHolder;
    if (holder == null || state.orderResponses[record.planResponse]?.respPerson !== holder || postFaction(world, state, post) === null) continue;
    const view = viewFor(world, state, seatIdFor(holder), cache);
    if (Object.keys(view.enemyBeliefs).length === 0) continue;
    const input = plannerInputFor(world, state, derived, network, month, view, post, record.planGoal, day);
    const joined = input.forces.filter(b => state.forceJoins[b.id] === undefined);
    const assessment = discretionAssessment({ ...input, forces: joined }, headquartersOf(world, state, post), grant);
    if (assessment.status !== 'established') continue;
    const threat = assessment.threat;
    const report: DiscretionReport = {
      switchCondition: grant.condition, switchGoal: grant.fallback, switchRegion: threat.region, switchEstimate: threat.estimate,
      switchStrength: threat.strength, switchThreshold: threat.threshold, switchEvidence: view.enemyBeliefs[threat.region]!.source,
    };
    const id = toIssuer(ctx, state, post, record, [], {
      discretion: report, answers: record.planDiscretionOrder ?? record.planOrder, tag: `discretion.${post}`,
    });
    state = switchGoal(state, post, id, day);
    fire(ctx, 'plans.discretion_exercised');
  }

  // Drafts, oldest goal first, within the day's cap for each side (0062; lane 0.8 measured it as a day's whole cost); the rest wait.
  // Counted per faction: one side's requests never defer the other's (the player would see the enemy's activity in a delay).
  const cap = world.map.world.rules.planner.dailyDraftCap;
  const used: Record<string, number> = {};
  const work = posts.flatMap(post => {
    const record = planOf(state, post)!;
    const incoming = record.planChallenge;
    return [
      ...(needsDraft(post, record) ? [{ post, since: record.planSetDay, separate: false }] : []),
      ...(incoming?.challengePending === true
        ? [{ post, since: state.orderResponses[incoming.challengeResponse]?.respDay ?? day, separate: true }] : []),
    ];
  }).sort((a, b) => a.since - b.since || strictCompare(a.post, b.post) || Number(a.separate) - Number(b.separate));
  for (const { post, separate } of work) {
    const record = state.planRecords[post]!;
    const incoming = separate ? record.planChallenge : undefined;
    const holder = state.postStates[post]?.postHolder ?? null;
    const faction = postFaction(world, state, post);
    if (holder === null || faction === null) continue;
    if ((used[faction] ?? 0) >= cap) {
      fire(ctx, 'plans.draft_deferred');
      continue;
    }
    used[faction] = (used[faction] ?? 0) + 1;
    const view = viewFor(world, state, seatIdFor(holder), cache);
    const ground = plannerInputFor(world, state, derived, network, month, view, post, incoming?.challengeGoal ?? record.planGoal, day);
    if (incoming !== undefined) {
      const proposed = draftProposal(ctx, state, post, record, ground, draftFor(ctx, ground), {
        answers: incoming.challengeOrder, response: incoming.challengeResponse, issuer: incoming.challengeIssuer, basis: record.planOrder,
      });
      state = finishChallenge(state, post, proposed);
      continue;
    }
    const input = withNotePreferences(ground, world, state, record);
    const drafted = draftFor(ctx, input);
    const set = record.planAuthority === undefined ? drafted : { ...drafted,
      draftCandidates: drafted.draftCandidates.filter(c => planAuthorized(world,state,post,record,day,c)) };
    if (record.planAuthority !== undefined && set.draftCandidates.length === 0 && record.planGoal.goalPurpose === undefined) continue;
    if (record.planProposalPending === true) {
      draftProposal(ctx, state, post, record, input, set, { answers: record.planOrder, response: record.planResponse, issuer: record.planIssuer });
      state = finishProposal(state, post);
    }
    if (record.planStatus === 'drafting' || retryDetention(post, record)) state = saveDraft(state, post, set);
  }
  return state;
}

/**
 * Answer one edit (0026; lane 0.9 finding 2): re-expand it on the morning's map, score it with his scorer, map it to
 * directive terms read against his own best plan (`ownBest`, `departure`), and let his compliance answer (lane 1.1's
 * `answerOrder`); `proxy` records his response and `plans` keeps its key. He executes the concrete plan for the rung he
 * actually takes; he tells the issuer the rung his candour lets him declare.
 */
function answerEdit(ctx: TickContext, start: State, post: PostId, derived: DerivedMap, network: ReturnType<typeof passageOf>, month: number, cache: ViewCache): State {
  const { world, day } = ctx;
  const record = start.planRecords[post]!;
  const pending = record.planPending!;
  const holder = start.postStates[post]?.postHolder ?? null;
  const chosen = record.planApproved ?? (record.planChosen === null ? undefined : candidateOf(record, record.planChosen));
  const objective = record.planGoal.goalObjective ?? null;
  const invalid = (reason: string, state: State): State => {
    const counter: PlanCounter = { counterSpec: pending.pendingSpec, counterOrder: pending.pendingOrder, counterDay: day, counterDistance: 0, counterFell: [], counterInvalid: reason, counterResponse: null };
    fire(ctx, 'plans.edit_invalid');
    return settleCounter(state, post, counter, null);
  };
  if (holder === null || chosen === undefined || record.planDraft === null) return invalid('no plan to edit', start);
  const view = viewFor(world, start, seatIdFor(holder), cache);
  const input = withNotePreferences(plannerInputFor(world, start, derived, network, month, view, post, record.planGoal, day), world, start, record);
  const result = applyEdit(input, record.planDraft, chosen, pending.pendingSpec);
  if (!result.ok) {
    toIssuer(ctx, start, post, record, [{ claimKind: 'plan-answer', claimRegion: objective, claimValue: 0, claimToken: 'invalid', claimConfidence: 1000 }], { answers: pending.pendingOrder, tag: `answer.${post}` });
    return invalid(editFailureDiagnostic(result.reason), start);
  }
  const base = goalTerms(world.rules.people, goalKindOf(record.planGoal));
  const holdingRisk = world.map.world.rules.plans.holdingRisk;
  const terms = editDirective(input, record.planDraft, result.edited, result.distance, holdingRisk, base);
  const edit = pending.pendingSpec.editKind;
  const subject = edit === 'timing' ? 'timing' : edit === 'objective' || edit === 'waypoints' ? 'destination' : 'organisation';
  const clause = `edit:${edit}`;
  const clauses = [{ clauseId: clause, clauseSubject: subject } as const, { clauseId: 'support', clauseSubject: 'support' as const }];
  const original: DirectiveTerms = { ...terms, clauses };
  const retained = editDirective(input, record.planDraft, chosen,
    clampPermille((record.planDraft.draftCandidates[0]?.candScore ?? chosen.candScore) - chosen.candScore),
    holdingRisk, base);
  const authorized = record.planApproved?.id === chosen.id;
  const supportRequests = (directive: DirectiveTerms): QualificationInput[] => (directive.support ?? []).map(need => ({
    clause: 'support', evidence: 'structural_condition', treatment: 'request_support', stateOfKnowledge: 'inferred',
    reference: `${need.supportKind}:${need.supportFrom ?? 'unassigned'}`,
  }));
  const alternative: DirectiveAlternative = {
    id: chosen.id, terms: { ...retained, clauses }, changedClauses: [clause], qualifications: supportRequests(retained),
    ...(authorized ? { authority: 'authorized' as const } : {
      authority: 'consent_required' as const, mechanism: 'plan approval by the issuing principal', acceptanceBy: record.planIssuer,
    }),
  };
  // Lane 1.5b: what he holds for the plan, on editDirective's scale, so an edit asking more men than it commits states the
  // shortfall; lane 1.4: read at the oversight where he stands.
  const response = answerOrder(world, start, holder, record.planIssuer, original, {
    available: PLAN_HOLDS, oversight: oversightOf(ctx, start, holder, record.planIssuer).value, qualifications: supportRequests(terms),
  }, [alternative]);
  const state = recordResponse(start, responseOf(response, { order: pending.pendingOrder, person: holder, post, role: 'addressee', day, kind: 'edit' }));
  const executes = response.undertaking?.undertakingKind === 'alternative' ? chosen : concretePlan(input, record.planDraft, chosen, result.edited, response.actual);
  for (const f of result.fell) fire(ctx, `planner.term.${f.term}`);
  fire(ctx, 'plans.edit_answered');
  if (SHIRKS.includes(response.actual)) fire(ctx, 'plans.edit_shirked');
  const objects = OBJECTS.includes(response.actual);
  if (objects) fire(ctx, 'plans.edit_objected');
  // What he says is his declared rung and his stated reasons; why he does it is his response (`proxy`) and the edit's distance (truth).
  const stated: StatedReason[] = response.statedReasons.map((r) => ({ reasonKind: r.kind, reasonWeight: statedWeight(r) }));
  toIssuer(ctx, state, post, record, [{ claimKind: 'plan-answer', claimRegion: objective, claimValue: 1, claimToken: response.declared, claimConfidence: 1000 }], {
    ...reportQualificationOf(response),
    ...(OBJECTS.includes(response.declared) ? { objection: stated } : {}),
    truth: [term('edit_distance', result.distance + 0, { person: holder, post })],
    answers: pending.pendingOrder,
    tag: `answer.${post}`,
  });
  const counter: PlanCounter = {
    counterSpec: pending.pendingSpec,
    counterOrder: pending.pendingOrder,
    counterDay: day,
    counterDistance: result.distance,
    counterFell: result.fell.map((f) => ({ dropTerm: f.term, dropAmount: f.drop })),
    counterInvalid: null,
    counterResponse: responseKey(pending.pendingOrder, holder),
  };
  const next = settleCounter(state, post, counter, objects ? null : executes);
  if (record.planStatus !== 'ready') reportConditionalReady(ctx, next, post);
  return next;
}
