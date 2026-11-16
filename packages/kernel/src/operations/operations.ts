/**
 * Operations (FOUNDATION section 10: `operations` owns approved plans in execution, with a lifecycle per axis; 0073's
 * row 1.4). An approved plan becomes an operation, and each of its axes moves through the stages
 *
 *   assemble -> march -> (assault | works) -> ... -> end, with pause, pursue and withdraw between,
 *
 * day by day, by what the plan says and what the battle model did (`tick/operations.ts` runs the stages). This module
 * is the only writer of `operationRecords`; it holds no logic beyond replacing records whole.
 *
 * The player never moves a division (hard rule 1): an operation executes the commander's own plan, drafted by the
 * kernel's planner and chosen by his seat, under the goal the principal ordered.
 *
 * Every record below the root is an immutable value (0052) with prefixed keys (0044), declared in `IMMUTABLE_RECORDS`.
 */
import { strictCompare } from '../compare.ts';
import type { ComplianceRung } from '../directive.ts';
import type { ForceBlockId, MessageId, PersonId, PostId, RegionId } from '../ids.ts';
import type { Method, PlanPhase, PlanRoute, RequestKind } from '../planner/types.ts';
import type { Posture } from '../plans/goal.ts';
import type { State } from '../root-state.ts';

/** An axis's stages (0073's lifecycle): `works` is digging in at the objective it holds. */
export const AXIS_STAGES = ['assemble', 'march', 'works', 'assault', 'pause', 'pursue', 'withdraw', 'end'] as const;
export type AxisStage = (typeof AXIS_STAGES)[number];

/** How an operation ended. */
export const OPERATION_OUTCOMES = ['objective_reached', 'failed', 'superseded'] as const;
export type OperationOutcome = (typeof OPERATION_OUTCOMES)[number];

/** Why an axis entered a stage: a typed reason (hard rule 6). */
export const STAGE_REASONS = [
  'opened',
  'awaiting_word',
  'awaiting_support',
  'concentrating',
  'concentrated',
  'support_refused',
  'support_delayed',
  'on_route',
  'rerouted',
  'enemy_ahead',
  'battle_continues',
  'enemy_gone',
  'repulsed',
  'routed',
  'pause_over',
  'depot_step',
  'pursuing',
  'pursuit_over',
  'objective_reached',
  'objective_held',
  'repulsed_too_often',
  'no_forces',
  'no_route',
  'superseded',
  'force_taken',
] as const;
export type StageReason = (typeof STAGE_REASONS)[number];

/** One step in an axis's history: the stage it entered, when, where and why. */
export interface AxisEvent {
  readonly axevDay: number;
  readonly axevStage: AxisStage;
  readonly axevReason: StageReason;
  readonly axevRegion: RegionId | null;
}

/** One axis of an operation in execution. */
export interface OpAxis {
  /** The plan's axis name (`main`, `partner`, ...). */
  readonly oaxName: string;
  /** The post whose forces make the axis: the commander's own, or a partner's under a support request. */
  readonly oaxPost: PostId;
  readonly oaxBlocks: readonly ForceBlockId[];
  /** The plan's route and phases, as drafted (immutable, from the draft set). */
  readonly oaxRoute: PlanRoute;
  readonly oaxPhases: readonly PlanPhase[];
  readonly oaxObjective: RegionId;
  readonly oaxStage: AxisStage;
  /** The day the current stage began, and the day it ends when it has a term (assemble, pause, pursue), else null. */
  readonly oaxSince: number;
  readonly oaxUntil: number | null;
  /** Times it has been driven back (withdrew or routed) on its way. */
  readonly oaxRepulses: number;
  /** The region it pursues into, while pursuing. */
  readonly oaxPursuit: RegionId | null;
  /** Depot steps already taken, by the region of the step. */
  readonly oaxSteps: readonly RegionId[];
  /** The day it reached its objective, or null. */
  readonly oaxArrived: number | null;
  readonly oaxLog: readonly AxisEvent[];
}

/** What became of a support request (FOUNDATION section 5: a directive to another holder, who answers by his own compliance). */
export const REQUEST_ANSWERS = ['pending', 'complied', 'delayed', 'refused', 'vacant', 'to_principal'] as const;
export type RequestAnswer = (typeof REQUEST_ANSWERS)[number];

export interface OpRequest {
  readonly oreqKind: RequestKind;
  readonly oreqPost: PostId | null;
  readonly oreqHolder: PersonId | null;
  /** The axis it would put in motion (a cooperating axis), or null. */
  readonly oreqAxis: string | null;
  /** The directive sent, or null when it went to no one (vacant) or is the principal's to answer (men). */
  readonly oreqMessage: MessageId | null;
  readonly oreqSentDay: number;
  readonly oreqAnswer: RequestAnswer;
  /** The rung he acts on (`proxy` holds the full response, `oreqResponse` its key); null until answered. */
  readonly oreqRung: ComplianceRung | null;
  readonly oreqResponse: string | null;
  readonly oreqAnswerDay: number | null;
  /** A delayed answer moves from this day. */
  readonly oreqFrom: number | null;
}

/** An encirclement: two commanders' arrows meeting (FOUNDATION section 5), with what came of it. */
export const ENCIRCLEMENTS = ['pending', 'met', 'failed_human', 'failed_ground'] as const;
export type Encirclement = (typeof ENCIRCLEMENTS)[number];

export interface OperationRecord {
  readonly opPost: PostId;
  readonly opCommander: PersonId | null;
  /** The goal's order, and the approved candidate's id: an operation executes one plan for one goal. */
  readonly opOrder: MessageId;
  readonly opPlan: string;
  readonly opMethod: Method;
  readonly opPosture: Posture;
  readonly opObjective: RegionId | null;
  readonly opStartDay: number;
  readonly opEndDay: number | null;
  readonly opOutcome: OperationOutcome | null;
  readonly opAxes: readonly OpAxis[];
  readonly opRequests: readonly OpRequest[];
  /** For a pincer, whether the arrows met, and why not: a person (refused, late, vacant) or the ground (no route). */
  readonly opEncirclement: Encirclement | null;
  readonly opEncirclementWhy: StageReason | 'partner_refused' | 'partner_late' | 'partner_vacant' | null;
}

export type OperationId = string;
export type OperationTable = Readonly<Record<OperationId, OperationRecord>>;

/** An operation's id: its post and the day it opened (one opens per post per day at most). */
export const operationId = (post: PostId, day: number): OperationId => `op:${post}:${day}`;

/** The open operation of a post, if any. */
export function openOperationOf(state: State, post: PostId): OperationId | null {
  for (const id of Object.keys(state.operationRecords).sort(strictCompare)) {
    const op = state.operationRecords[id]!;
    if (op.opPost === post && op.opEndDay === null) return id;
  }
  return null;
}

/** Every open operation's id, in id order. */
export function openOperations(state: State): OperationId[] {
  return Object.keys(state.operationRecords)
    .filter((id) => state.operationRecords[id]!.opEndDay === null)
    .sort(strictCompare);
}

/** The only writer of `operationRecords`: put records whole, in the order given. Returns the State unchanged for none. */
export function putOperations(state: State, records: readonly { readonly id: OperationId; readonly record: OperationRecord }[]): State {
  if (records.length === 0) return state;
  const next: Record<OperationId, OperationRecord> = { ...state.operationRecords };
  for (const r of records) next[r.id] = r.record;
  return { ...state, operationRecords: next };
}

/**
 * Drop ended operations older than `keepDays` (the pack's pruning rule, as knowledge prunes): history beyond it is not kept.
 * A post's latest operation is always kept, so a plan whose operation has run is never executed again.
 */
export function pruneOperations(state: State, day: number, keepDays: number): State {
  const latest = new Map<PostId, OperationId>();
  for (const id of Object.keys(state.operationRecords).sort(strictCompare)) {
    const o = state.operationRecords[id]!;
    const prev = latest.get(o.opPost);
    if (prev === undefined || state.operationRecords[prev]!.opStartDay <= o.opStartDay) latest.set(o.opPost, id);
  }
  const kept = new Set(latest.values());
  const drop = Object.keys(state.operationRecords).filter((id) => {
    const end = state.operationRecords[id]!.opEndDay;
    return end !== null && day - end > keepDays && !kept.has(id);
  });
  if (drop.length === 0) return state;
  const next: Record<OperationId, OperationRecord> = { ...state.operationRecords };
  for (const id of drop) delete next[id];
  return { ...state, operationRecords: next };
}

/** An axis entering a stage, with its reason, recorded in its history. */
export function enter(axis: OpAxis, stage: AxisStage, reason: StageReason, day: number, region: RegionId | null, until: number | null = null): OpAxis {
  return { ...axis, oaxStage: stage, oaxSince: day, oaxUntil: until, oaxLog: [...axis.oaxLog, { axevDay: day, axevStage: stage, axevReason: reason, axevRegion: region }] };
}
