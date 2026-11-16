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
 * Whatever a plan record becomes, the STAND-IN execution adapter (`plans/execute.ts`, lane 1.4's) tells the movement
 * path what to do.
 */
import { strictCompare } from '../compare.ts';
import { deriveMap, type DerivedMap } from '../control-index/derived.ts';
import type { ComplianceRung, Reason } from '../directive.ts';
import type { MessageId, PostId } from '../ids.ts';
import type { ReportClaim, StatedReason } from '../knowledge/report.ts';
import { term } from '../knowledge/truth.ts';
import { liveTerms, draft } from '../planner/draft.ts';
import { applyEdit, concretePlan, editDirective } from '../planner/edits.ts';
import { plannerInputFor } from '../planner/input.ts';
import type { PlanCandidate, TermKind } from '../planner/types.ts';
import { execute } from '../plans/execute.ts';
import { goalKindOf } from '../plans/goal.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { answerOrder, goalTerms } from '../reading/orders.ts';
import { candidateOf, choose, postsInStatus, saveDraft, settleCounter, submitted, type PlanCounter, type PlanRecord } from '../plans/plans.ts';
import type { State } from '../root-state.ts';
import type { OptionView } from '../seats/api.ts';
import { postFaction } from '../seats/posts.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { viewFor, type ViewCache } from '../view/view.ts';
import { fire, sendReport, type TickContext } from './context.ts';
import { monthOf } from './map.ts';
import { answerBody } from './orders.ts';
import { passageOf } from './passage.ts';

/** Every mechanic the plan cycle counts (FOUNDATION section 11.5), the planner's scoring terms among them. */
export const PLANS_MECHANICS = [
  'planner.candidates',
  'planner.searches',
  ...(['caution', 'coordination', 'dependence', 'exposure', 'force_ratio', 'glory', 'goal_fit', 'haste', 'supply', 'time'] as const satisfies readonly TermKind[]).map((t) => `planner.term.${t}`),
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
  'plans.released',
  'plans.sent_back',
  'plans.submitted',
  'plans.went_ahead',
] as const;

/** A candidate as a seat sees it on a menu or under review. */
export function optionView(c: PlanCandidate): OptionView {
  return {
    optionId: c.id,
    method: c.candMethod,
    variant: c.candVariant,
    score: c.candScore,
    terms: c.candTerms.map((t) => ({ term: t.contribTerm, amount: t.contribAmount })),
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
  };
}

/** The request key of a commander's plan menu. */
export function planKey(post: PostId, day: number): string {
  return `plan:${post}:${day}`;
}

/** Posts whose holder picks a plan this morning (a draft saved on an earlier day), in id order. */
export function choosingPosts(state: State, day: number): PostId[] {
  return postsInStatus(state, 'choosing').filter((p) => state.planRecords[p]!.planDraft!.draftDay < day && (state.postStates[p]?.postHolder ?? null) !== null);
}

/** The options a commander is offered this morning: every candidate of his draft set, best first; null when he has nothing to pick. */
export function planOptions(state: State, post: PostId, day: number): readonly OptionView[] | null {
  if (!choosingPosts(state, day).includes(post)) return null;
  return state.planRecords[post]!.planDraft!.draftCandidates.map(optionView);
}

/** A report from a commander to the goal's issuer, answering the goal's order. */
function toIssuer(ctx: TickContext, state: State, post: PostId, record: PlanRecord, claims: readonly ReportClaim[], options: { readonly objection?: readonly StatedReason[]; readonly truth?: ReturnType<typeof term>[]; readonly answers: MessageId; readonly tag: string }): MessageId {
  const holder = state.postStates[post]!.postHolder!;
  return sendReport(ctx, state, {
    body: answerBody(holder, post, ctx.day, {
      reportType: options.objection === undefined ? 'wire-dispatch' : 'advice',
      reportSubtype: options.objection === undefined ? null : 'memorandum',
      reportClaims: claims,
      reportAdvice: options.objection === undefined ? null : { adviceRecommends: 'keep-own-plan', adviceReasons: options.objection, adviceConfidence: 800 },
      answers: options.answers,
      about: post,
    }),
    truth: { truthTerms: options.truth ?? [], truthTrimmed: [] },
    to: record.planIssuer,
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
    const options = record.planDraft!.draftCandidates;
    let pick = choices.get(post);
    if (pick === undefined) {
      pick = options[0]!.id;
      if (menus.has(post) && options.length > 1) {
        fire(ctx, 'seats.defaulted');
        ctx.events.push({ event: 'seat_defaulted', person: state.postStates[post]!.postHolder!, post, message: null, terms: [] });
      }
    }
    const chosen = choose(state, post, pick);
    state = chosen.state;
    fire(ctx, 'plans.chosen');
    if (chosen.status === 'review') {
      const c = candidateOf(record, pick)!;
      const report = toIssuer(ctx, state, post, record, [{ claimKind: 'plan-submitted', claimRegion: record.planGoal.goalObjective, claimValue: c.candScore, claimToken: c.candMethod, claimConfidence: 1000 }], { answers: record.planOrder, tag: `plan.${post}` });
      state = submitted(state, post, report);
      fire(ctx, 'plans.submitted');
    } else {
      fire(ctx, 'plans.went_ahead');
    }
    state = execute(state, post, ctx.day);
  }
  return state;
}


const SHIRKS: readonly ComplianceRung[] = ['slow_walk', 'reinterpret'];
const OBJECTS: readonly ComplianceRung[] = ['object', 'refuse'];

/** A stated reason's weight, permille, for the answer he sends: its gap, departure, shortfall or grievance weight; else full. */
function statedWeight(r: Reason): number {
  if ('gap' in r) return r.gap;
  if ('departure' in r) return r.departure;
  if ('shortfall' in r) return r.shortfall;
  if ('weight' in r) return Math.min(1000, r.weight);
  return 1000;
}

/** The day's edits and drafts, on the morning's map (one derivation, only when there is plan work today). */
export function plansPhase(ctx: TickContext, start: State, cache: ViewCache): State {
  const { world, day } = ctx;
  const pending = (Object.keys(start.planRecords) as PostId[]).filter((p) => start.planRecords[p]!.planPending !== null).sort(strictCompare);
  const drafting = postsInStatus(start, 'drafting');
  if (pending.length === 0 && drafting.length === 0) return start;
  const network = passageOf(world.map, start);
  const month = monthOf(start, day);
  const derived: DerivedMap = deriveMap(world.map, { control: start.regionControl, month, network });
  let state = start;

  for (const post of pending) state = answerEdit(ctx, state, post, derived, network, month, cache);

  // Drafts, oldest goal first, within the day's cap for each side (0062; lane 0.8 measured it as a day's whole cost); the rest wait.
  // Counted per faction: one side's requests never defer the other's (the player would see the enemy's activity in a delay).
  const cap = world.map.world.rules.planner.dailyDraftCap;
  const used: Record<string, number> = {};
  const order = [...drafting].sort((a, b) => state.planRecords[a]!.planSetDay - state.planRecords[b]!.planSetDay || strictCompare(a, b));
  for (const post of order) {
    const record = state.planRecords[post]!;
    const holder = state.postStates[post]?.postHolder ?? null;
    const faction = postFaction(world, state, post);
    if (holder === null || faction === null) continue;
    if ((used[faction] ?? 0) >= cap) {
      fire(ctx, 'plans.draft_deferred');
      continue;
    }
    used[faction] = (used[faction] ?? 0) + 1;
    const view = viewFor(world, state, seatIdFor(holder), cache);
    const set = draft(plannerInputFor(world, state, derived, network, month, view, post, record.planGoal, day));
    fire(ctx, 'plans.drafted');
    fire(ctx, 'planner.candidates', set.draftCandidates.length);
    fire(ctx, 'planner.searches', set.draftSearches);
    for (const t of liveTerms(set)) fire(ctx, `planner.term.${t}`);
    state = execute(saveDraft(state, post, set), post, day);
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
  const objective = record.planGoal.goalObjective;
  const invalid = (reason: string, state: State): State => {
    const counter: PlanCounter = { counterSpec: pending.pendingSpec, counterOrder: pending.pendingOrder, counterDay: day, counterDistance: 0, counterFell: [], counterInvalid: reason, counterResponse: null };
    fire(ctx, 'plans.edit_invalid');
    return settleCounter(state, post, counter, null);
  };
  if (holder === null || chosen === undefined || record.planDraft === null) return invalid('no plan to edit', start);
  const view = viewFor(world, start, seatIdFor(holder), cache);
  const input = plannerInputFor(world, start, derived, network, month, view, post, record.planGoal, day);
  const result = applyEdit(input, record.planDraft, chosen, pending.pendingSpec);
  if (!result.ok) {
    toIssuer(ctx, start, post, record, [{ claimKind: 'plan-answer', claimRegion: objective, claimValue: 0, claimToken: 'invalid', claimConfidence: 1000 }], { answers: pending.pendingOrder, tag: `answer.${post}` });
    return invalid(result.reason, start);
  }
  const terms = editDirective(input, record.planDraft, result.edited, result.distance, world.map.world.rules.plans.holdingRisk, goalTerms(world.rules.people, goalKindOf(record.planGoal)));
  const response = answerOrder(world, start, holder, record.planIssuer, terms);
  const state = recordResponse(start, responseOf(response, { order: pending.pendingOrder, person: holder, post, role: 'addressee', day, kind: 'edit' }));
  const executes = concretePlan(input, record.planDraft, chosen, result.edited, response.actual);
  for (const f of result.fell) fire(ctx, `planner.term.${f.term}`);
  fire(ctx, 'plans.edit_answered');
  if (SHIRKS.includes(response.actual)) fire(ctx, 'plans.edit_shirked');
  const objects = OBJECTS.includes(response.actual);
  if (objects) fire(ctx, 'plans.edit_objected');
  // What he says is his declared rung and his stated reasons; why he does it is his response (`proxy`) and the edit's distance (truth).
  const stated: StatedReason[] = response.statedReasons.map((r) => ({ reasonKind: r.kind, reasonWeight: statedWeight(r) }));
  toIssuer(ctx, state, post, record, [{ claimKind: 'plan-answer', claimRegion: objective, claimValue: 1, claimToken: response.declared, claimConfidence: 1000 }], {
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
  return execute(settleCounter(state, post, counter, objects ? null : executes), post, day);
}
