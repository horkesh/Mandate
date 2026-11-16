/**
 * `plans` (FOUNDATION section 10): the only writer of goals, draft sets, the seat's selection, approvals and arrow
 * edits as counter-orders (0026, 0062; lane 1.2).
 *
 * A post's plan record moves through these statuses:
 * - `drafting`: a goal arrived (or a plan was sent back); the planner drafts it on a later phase of the day, within
 *   the pack's daily drafting cap (`WorldRules.planner.dailyDraftCap`), so a request may wait a day;
 * - `choosing`: the draft set is saved (on the request day); his seat picks one candidate the next morning;
 * - `review`: he submitted his pick to the goal's issuer, who approves it, sends it back with notes, or edits its
 *   arrows (unless the goal said "approve as drafted unless he objects" and he did not depart from it);
 * - `ready`: approved, assembling, awaiting the principal's word ("prepare, await my word", 0040);
 * - `approved`: executing, as an operation (lane 1.4: `operations/`, `tick/operations.ts`).
 *
 * A response to a goal, a plan or an edit (rungs and reasons) belongs to `proxy` (0073, lane 1.1); a plan record holds
 * only its key (`responseKey`).
 */
import type { MessageId, PersonId, PostId } from '../ids.ts';
import type { PlanCandidate, DraftSet, TermKind } from '../planner/types.ts';
import type { State } from '../root-state.ts';
import type { EditSpec, PlanGoal, PlanStatus } from './goal.ts';

export { PLAN_STATUSES, type PlanStatus } from './goal.ts';

/** A term that fell under an edit, and by how much (the edit's reasons, hard rule 6). */
export interface CounterDrop {
  readonly dropTerm: TermKind;
  readonly dropAmount: number;
}

/** An arrow edit the principal sent, as it reached the commander (a counter-order). Immutable. */
export interface PlanCounter {
  readonly counterSpec: EditSpec;
  readonly counterOrder: MessageId;
  readonly counterDay: number;
  /** His best plan's score less the edited plan's, permille (0 for an edit that could not be made). */
  readonly counterDistance: number;
  readonly counterFell: readonly CounterDrop[];
  /** Why the edit could not be made (an unreachable waypoint): a validation failure, not a compliance outcome. */
  readonly counterInvalid: string | null;
  /** His response to the edit: the key of the record `proxy` writes (`responseKey`), a reference only (0073); null for an invalid edit. */
  readonly counterResponse: string | null;
}

/** An edit that has reached him and waits for the day's plans phase, which re-expands it on the morning's map. */
export interface PendingCounter {
  readonly pendingSpec: EditSpec;
  readonly pendingOrder: MessageId;
}

/** A post's goal and its plan. Immutable: `plans` replaces it whole. */
export interface PlanRecord {
  readonly planGoal: PlanGoal;
  readonly planIssuer: PersonId;
  /** Whether the goal came down his own chain of command (false: it went around a relaying post). */
  readonly planViaChain: boolean;
  readonly planSetDay: number;
  /** The day the order was written (conflicting orders: the newer weighs more, 0040). */
  readonly planIssuedDay: number;
  /** The order that set the goal. */
  readonly planOrder: MessageId;
  /** His response to the goal: the key of the record `proxy` writes (`responseKey`), a reference only (0073). */
  readonly planResponse: string;
  readonly planStatus: PlanStatus;
  /** The draft set, saved on its request day; null before drafting, or for a goal that needs no plan (hold where he stands). */
  readonly planDraft: DraftSet | null;
  /** The candidate his seat chose, by id. */
  readonly planChosen: string | null;
  /** The plan approved for execution: his choice, or what an edit left him executing; null to hold where he stands. */
  readonly planApproved: PlanCandidate | null;
  /** The report that submitted his choice for review. */
  readonly planSubmitted: MessageId | null;
  readonly planCounters: readonly PlanCounter[];
  readonly planPending: PendingCounter | null;
}

export type PlanTable = Readonly<Record<PostId, PlanRecord>>;

/** A post's plan record, or undefined if it has never been given a goal. */
export function planOf(state: State, post: PostId): PlanRecord | undefined {
  return state.planRecords[post];
}

/** Posts with a plan record in this status, in id order. */
export function postsInStatus(state: State, status: PlanStatus): PostId[] {
  return (Object.keys(state.planRecords) as PostId[]).filter((p) => state.planRecords[p]!.planStatus === status).sort();
}

function put(state: State, post: PostId, record: PlanRecord): State {
  return { ...state, planRecords: { ...state.planRecords, [post]: record } };
}

/** The candidate a record's draft set holds under `id`. */
export function candidateOf(record: PlanRecord, id: string): PlanCandidate | undefined {
  return record.planDraft?.draftCandidates.find((c) => c.id === id);
}

/**
 * A goal reaches the holder of `post` and is obeyed: a new record. A goal to hold where he stands (no objective) needs
 * no plan and is approved at once; any other waits for the drafting phase.
 */
export function setGoal(
  state: State,
  post: PostId,
  order: { readonly id: MessageId; readonly issuer: PersonId; readonly goal: PlanGoal; readonly viaChain: boolean; readonly issuedDay: number; readonly response: string },
  day: number,
): State {
  const holdHere = order.goal.goalObjective === null;
  return put(state, post, {
    planGoal: order.goal,
    planIssuer: order.issuer,
    planViaChain: order.viaChain,
    planSetDay: day,
    planIssuedDay: order.issuedDay,
    planOrder: order.id,
    planResponse: order.response,
    planStatus: holdHere ? 'approved' : 'drafting',
    planDraft: null,
    planChosen: null,
    planApproved: null,
    planSubmitted: null,
    planCounters: [],
    planPending: null,
  });
}

/** Save a draft set on its request day: his seat chooses tomorrow. A draft with no candidate (no force to plan with) leaves him holding. */
export function saveDraft(state: State, post: PostId, draft: DraftSet): State {
  const record = state.planRecords[post]!;
  if (draft.draftCandidates.length === 0) return put(state, post, { ...record, planDraft: draft, planStatus: 'approved', planApproved: null });
  return put(state, post, { ...record, planDraft: draft, planStatus: 'choosing', planChosen: null, planApproved: null, planSubmitted: null });
}

/**
 * Whether his pick departs from the goal enough to stop even an "approve as drafted" goal (FOUNDATION section 9: an
 * objection or a large departure still stops): he would hold when ordered to take or relieve, or waits for men.
 */
export function departsFromGoal(goal: PlanGoal, chosen: PlanCandidate): boolean {
  if (goal.goalPosture === 'hold') return false;
  return chosen.candMethod === 'holding' || chosen.candConditions.some((g) => g.gateKind === 'move_when_reinforced');
}

/** His seat's pick. Goes ahead at once when the goal allows it and he does not depart from it; else waits for review. */
export function choose(state: State, post: PostId, candidate: string): { readonly state: State; readonly status: PlanStatus } {
  const record = state.planRecords[post]!;
  const chosen = candidateOf(record, candidate);
  if (chosen === undefined) throw new RangeError(`post ${post} has no candidate ${candidate}`);
  const goesAhead = record.planGoal.goalApproveAsDrafted && !departsFromGoal(record.planGoal, chosen);
  const status: PlanStatus = goesAhead ? (record.planGoal.goalAwaitWord ? 'ready' : 'approved') : 'review';
  return { state: put(state, post, { ...record, planChosen: candidate, planApproved: goesAhead ? chosen : null, planStatus: status }), status };
}

/** Record the report that submitted his pick for review. */
export function submitted(state: State, post: PostId, report: MessageId): State {
  const record = state.planRecords[post]!;
  return put(state, post, { ...record, planSubmitted: report });
}

/** The principal approves the plan under review: it executes, or assembles and awaits his word. */
export function approve(state: State, post: PostId): State {
  const record = state.planRecords[post]!;
  const chosen = record.planChosen === null ? undefined : candidateOf(record, record.planChosen);
  return put(state, post, { ...record, planApproved: chosen ?? null, planStatus: record.planGoal.goalAwaitWord ? 'ready' : 'approved' });
}

/** The principal sends the plan back: he drafts again, on the map as it is when he gets it. */
export function sendBack(state: State, post: PostId): State {
  const record = state.planRecords[post]!;
  return put(state, post, { ...record, planStatus: 'drafting', planChosen: null, planApproved: null, planSubmitted: null });
}

/** "Go" (0040): an assembled operation held for the principal's word moves. */
export function release(state: State, post: PostId): State {
  const record = state.planRecords[post]!;
  return put(state, post, { ...record, planStatus: 'approved' });
}

/** An edit reaches him: it waits for the day's plans phase. */
export function receiveCounter(state: State, post: PostId, pending: PendingCounter): State {
  const record = state.planRecords[post]!;
  return put(state, post, { ...record, planPending: pending });
}

/**
 * The day's plans phase answered an edit: record it as a counter-order, and the plan he now executes (null: none
 * changes, as when the edit was invalid or he objected and keeps his own under review).
 */
export function settleCounter(state: State, post: PostId, counter: PlanCounter, executes: PlanCandidate | null): State {
  const record = state.planRecords[post]!;
  const next: PlanRecord = { ...record, planCounters: [...record.planCounters, counter], planPending: null };
  if (executes === null) return put(state, post, next);
  return put(state, post, { ...next, planApproved: executes, planStatus: record.planGoal.goalAwaitWord && record.planStatus !== 'approved' ? 'ready' : 'approved' });
}
