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
import type { ForceBlockId, PersonId, PostId, RegionId, SituationId } from '../ids.ts';
import type { CounterTerms } from '../audience/counters.ts';
import type { BattleOrders } from '../combat/order-kinds.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { EditKind, Posture } from '../plans/goal.ts';
import type { PlanNote } from '../plans/notes.ts';

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
  /** Nonbinding marks, only on send_back. Omitted in older logs. */
  readonly notes?: readonly PlanNote[];
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
  readonly regiments: number | null;
  /** A separately sourced headcount; absent uses the pack's men per regiment. */
  readonly men?: number | null;
  /** Identity of a dated pack call, distinct from another call to the same governor. */
  readonly callId?: string;
  readonly arm?: string;
  /** Hold ready only; an absolute requisition must follow before muster. */
  readonly readiness?: boolean;
  /** Days from muster, or null for service during the war. */
  readonly termDays: number | null;
  readonly route: RouteKind;
  readonly bypass: boolean;
}

/**
 * A commander's battle orders for the day (lane 1.12): sent by the holder of the post whose men hold his side of a
 * battle, never by a principal (hard rule 1: the player never fights a division). Each point is an explicit choice or
 * `judge`, which leaves it to his traits (`combat/orders.ts`).
 */
export interface BattleCommand {
  readonly cmd: 'battle';
  readonly post: PostId;
  readonly commit: BattleOrders['commit'];
  readonly night: BattleOrders['night'];
  readonly cutOff: BattleOrders['cutOff'];
  readonly pursue: BattleOrders['pursue'];
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

/**
 * Lane 1.5: the people verbs. Each is an order to a person, answered through his compliance (FOUNDATION section 5).
 * None moves a division or names a place outside an order to a person (hard rule 1): a transfer names two posts and an
 * amount, and the sending commander picks the blocks (0033); an inquiry may name a region only as its subject (0040).
 */
export const RELIEF_MODES = ['own_request', 'outright', 'quiet_department'] as const;
export type ReliefMode = (typeof RELIEF_MODES)[number];

/** Appoint a person to a post (a vacant one: relieve its holder first), optionally conferring a rank (a volunteer general). */
export interface AppointCommand {
  readonly cmd: 'appoint';
  /** Reassignment from the named current post; absent keeps the ordinary unposted-candidate guard. */
  readonly from?: PostId;
  readonly post: PostId;
  readonly person: PersonId;
  readonly rank: string | null;
  readonly route: RouteKind;
}

/** Relieve a post's holder, by mode: to a quiet department (`to`, a vacant post), at his own request, or outright. */
export interface RelieveCommand {
  readonly cmd: 'relieve';
  readonly post: PostId;
  readonly mode: ReliefMode;
  readonly to: PostId | null;
  readonly route: RouteKind;
}

/** Transfer a force between two posts (0033): a number of blocks or a strength in men; the sending commander picks. */
export interface TransferCommand {
  readonly cmd: 'transfer';
  readonly from: PostId;
  readonly to: PostId;
  readonly force: 'blocks' | 'men';
  readonly amount: number;
  readonly route: RouteKind;
}

/** Ask a post's holder for a report: on his own command, or on a region as its subject (0040). */
export interface InquireCommand {
  readonly cmd: 'inquire';
  readonly to: PostId;
  readonly subject: RegionId | null;
  readonly route: RouteKind;
}

/** Ask the holders of these posts for written advice on an open situation; each answer is a stance on record (0040). */
export interface ConsultCommand {
  readonly cmd: 'consult';
  readonly situation: SituationId;
  readonly posts: readonly PostId[];
}

/** Hear a commander out about his plan, before or during, with counters (P3). */
export interface AudienceCommand {
  readonly cmd: 'audience';
  readonly to: PostId;
  readonly counters: readonly CounterTerms[];
}

/** Send a rostered person to a commander's headquarters as an observer, reporting to the sender (0040). */
export interface ObserverCommand {
  readonly cmd: 'observer';
  readonly person: PersonId;
  readonly to: PostId;
  readonly route: RouteKind;
}

/** Promise a person advancement (M2's promise): kept by an appointment before it falls due. */
export interface PromiseCommand {
  readonly cmd: 'promise';
  readonly person: PersonId;
}

/** Press a person: oversight rises for a while, and he holds a grievance. */
export interface PressureCommand {
  readonly cmd: 'pressure';
  readonly person: PersonId;
}

/** Address a bloc: a typed proposal for `politics`, which lane 1.6 applies. */
export interface AddressCommand {
  readonly cmd: 'address';
  readonly bloc: string;
}

export type VerbCommand = AppointCommand | RelieveCommand | TransferCommand | InquireCommand | ConsultCommand | AudienceCommand | ObserverCommand | PromiseCommand | PressureCommand | AddressCommand;

/** What a seat may send in a `commands` answer. */
export type SeatCommand = OrderCommand | ReviewCommand | GoCommand | CallCommand | DecideCommand | DelegateCommand | VerbCommand | BattleCommand;

export type Command = OrderCommand | ReviewCommand | GoCommand | CallCommand | ChooseCommand | DecideCommand | DelegateCommand | VerbCommand | BattleCommand;

export const COMMAND_KINDS = ['address', 'appoint', 'audience', 'battle', 'call', 'choose', 'consult', 'decide', 'delegate', 'go', 'inquire', 'observer', 'order', 'pressure', 'promise', 'relieve', 'review', 'transfer'] as const;
