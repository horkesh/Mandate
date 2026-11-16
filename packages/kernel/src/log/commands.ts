/**
 * The commands a seat can send, as they are logged (decision 0015: the command log is the truth):
 * - `order`: a goal for the holder of a post (FOUNDATION section 5: objective, posture, risk, deadline, permissions,
 *   the force committed, "prepare, await my word", "approve as drafted unless he objects"), sent by a route, through
 *   the chain of posts or around it. A place is named only as part of an order to a person (hard rule 1, 0016).
 * - `review`: the principal's answer to a plan submitted to him: approve it, send it back, or edit its arrows within
 *   0026's grammar (FOUNDATION section 11, rule 10: the edit grammar is part of the verb list). Each is a counter-order.
 * - `go`: the word an operation assembled under "prepare, await my word" waits for (0040). Free.
 * - `choose`: a seat's answer to a menu the kernel offered it (a commander's pick among the planner's candidates).
 * - `decide`, `delegate`: a situation's decision, or handing it to a holder (lane 0.7).
 * The Phase 1 verbs join this union; the verb-list test then lists them.
 */
import type { ForceBlockId, PostId, RegionId, SituationId } from '../ids.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { EditKind, Posture } from '../plans/goal.ts';

/** A goal as a command carries it (the plans record's `PlanGoal`, unprefixed). */
export interface GoalTerms {
  /** Null only for "hold where he stands". */
  readonly objective: RegionId | null;
  readonly posture: Posture;
  /** 0..1000. */
  readonly risk: number;
  readonly deadlineDays: number;
  readonly rail: boolean;
  readonly river: boolean;
  readonly sea: boolean;
  readonly neutral: boolean;
  /** Empty: every block (not detachment) his post commands. */
  readonly committed: readonly ForceBlockId[];
  readonly awaitWord: boolean;
  readonly approveAsDrafted: boolean;
}

export interface OrderCommand {
  readonly cmd: 'order';
  readonly to: PostId;
  readonly goal: GoalTerms;
  readonly route: RouteKind;
  /** Send it straight to the holder, around the posts that should relay it (0040). */
  readonly bypass: boolean;
}

/** One arrow edit as a command carries it (the plans record's `EditSpec`, unprefixed). */
export interface EditTerms {
  readonly kind: EditKind;
  readonly axis: string | null;
  readonly region: RegionId | null;
  readonly via: readonly RegionId[];
  readonly concentration: number | null;
}

export const REVIEW_ACTIONS = ['approve', 'edit', 'send_back'] as const;
export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export interface ReviewCommand {
  readonly cmd: 'review';
  /** The post whose plan he reviews. */
  readonly to: PostId;
  readonly action: ReviewAction;
  /** The edit, for `edit`; null otherwise. */
  readonly edit: EditTerms | null;
  readonly route: RouteKind;
  readonly bypass: boolean;
}

export interface GoCommand {
  readonly cmd: 'go';
  readonly to: PostId;
  readonly route: RouteKind;
  readonly bypass: boolean;
}

/**
 * A call for regiments to a governor's post (lane 1.7): an order through people. He answers by his own compliance with
 * the pack's call terms; his answer sets how many regiments he raises and when they muster (`tick/recruitment.ts`).
 */
export interface CallCommand {
  readonly cmd: 'call';
  /** The governor's post. */
  readonly to: PostId;
  /** Regiments asked of him. */
  readonly regiments: number;
  /** Days the men are enlisted for, from the muster. */
  readonly termDays: number;
  readonly route: RouteKind;
  readonly bypass: boolean;
}

export interface ChooseCommand {
  readonly cmd: 'choose';
  /** The request this answers (`SeatRequest.requestKey`). */
  readonly request: string;
  readonly option: string;
}

/**
 * A decision on an open situation (lane 0.7): the options taken, at most one
 * per group, or none to ignore it, which resolves to its `inaction` outcome
 * (0040). The principal sends it, or the holder it was delegated to.
 */
export interface DecideCommand {
  readonly cmd: 'decide';
  readonly situation: SituationId;
  readonly options: readonly string[];
}

/** Hand a situation's choice to a named holder (0040). The choice moves; the authority to order stays the principal's (0052). */
export interface DelegateCommand {
  readonly cmd: 'delegate';
  readonly situation: SituationId;
  readonly to: PostId;
}

/** What a seat may send in a `commands` answer. */
export type SeatCommand = OrderCommand | ReviewCommand | GoCommand | CallCommand | DecideCommand | DelegateCommand;

export type Command = OrderCommand | ReviewCommand | GoCommand | CallCommand | ChooseCommand | DecideCommand | DelegateCommand;

export const COMMAND_KINDS = ['call', 'choose', 'decide', 'delegate', 'go', 'order', 'review'] as const;
