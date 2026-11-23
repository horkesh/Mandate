/**
 * The seat interface (FOUNDATION section 8; decision 0015).
 *
 * Every seat, whether rules, AI or human, receives the same request: a view
 * built only from what its person may know, and the kernel's menu of legal
 * responses. It returns a typed answer. One set of decision types serves all
 * three kinds. The kernel decides what a person actually does (compliance,
 * latency, what reports say); a seat only chooses among options the kernel
 * has already judged consistent with his state, or, for a principal, issues
 * commands the kernel then validates.
 *
 * Seats answer at turn boundaries (decision 0027). Their answers go into the
 * command log; replay and resume read the log and never ask a seat again.
 */
import type { BATTLE_ORDER_OPTIONS, CutOffChoice, NightChoice, Pursuit } from '../combat/order-kinds.ts';
import type { GoalProposalReason, NoteAccount } from '../knowledge/report.ts';
import type { Commit } from '../combat/rules.ts';
import type { FactionId, MessageId, PersonId, PostId, RegionId, SeatId, SituationId } from '../ids.ts';
import type { GoalTerms, SeatCommand } from '../log/commands.ts';
import type { DoctrineDiscretion, DoctrineProposalAnswer } from '../plans/goal.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { GoalView, SeatView } from '../view/types.ts';
import type { LetterIdentity } from '../world/letters.ts';
import type { PaperDecision } from '../world/paper-selectors.ts';
import type { TurnStopsView } from './turn-stops.ts';

export const SEAT_DRIVERS = ['ai', 'human', 'rules'] as const;
export type SeatDriver = (typeof SEAT_DRIVERS)[number];

/** One axis of a candidate plan, as its arrows show it: whose force, how it travels, where it goes, when it arrives. */
export interface AxisView {
  readonly name: string;
  readonly post: PostId;
  readonly mode: 'land' | 'river' | 'sea';
  /** The regions it passes, start first. */
  readonly regions: readonly RegionId[];
  readonly strength: number;
  /** Its phases in order (concentrate, march, reduce, assault, ...). */
  readonly phases: readonly string[];
  /** Permille days from the plan's start to its arrival. */
  readonly arrival: number;
}

/**
 * A candidate plan the planner drafted for him, with the facts it was scored on as he sees them (lane 1.2; 0062): its
 * method, its axes, the support it asks of others, its conditions, and every term of its score (hard rule 6).
 */
export interface OptionView {
  readonly optionId: string;
  readonly method: string;
  readonly variant: string;
  readonly score: number;
  readonly terms: readonly { readonly term: string; readonly amount: number }[];
  readonly axes: readonly AxisView[];
  /** Support it asks for: `cooperating_axis:<post>`, `naval_support:<post>`, `reinforcement:<men>`. */
  readonly requests: readonly string[];
  /** Conditions he attaches (`move_when_reinforced`, `vacant_post`). */
  readonly conditions: readonly string[];
  /** The enemy he believes stands at the objective, and his strength over it, permille. */
  readonly perceivedEnemy: number;
  readonly ratio: number;
}

/**
 * A commander choosing among the planner's candidates for his goal (lane 1.2; FOUNDATION section 8: a choice among
 * options the kernel has already judged, which replaces Phase 0's consistency judgement). Asked only when there are
 * at least two; ranked best first by his own scorer.
 */
export interface PlanMenu {
  readonly menuKind: 'plan-selection';
  readonly post: PostId;
  readonly goal: GoalView;
  readonly options: readonly OptionView[];
}

/** A plan submitted to the principal for review, once his commander's dispatch has reached him. */
export interface PlanReview {
  readonly authoredPaper?: MessageId;
  /** Only the account in the principal's received submission, never the actual compliance record. */
  readonly notes?: readonly NoteAccount[];
  readonly post: PostId;
  readonly holder: PersonId;
  /** The dispatch that brought it. */
  readonly report: string;
  readonly plan: OptionView;
}

/** A route as the sender may know it in advance: typical days (no weather) and its price. */
export interface RouteOption {
  readonly route: RouteKind;
  readonly typicalDays: number;
  /** Attention it costs (charged once attention exists, in Phase 1). */
  readonly price: number;
}

/** A post the principal may order. */
export interface CommandablePost {
  readonly post: PostId;
  readonly holder: PersonId;
  /** Posts an order relays through on the way; going around them is `bypass`. */
  readonly relays: readonly PostId[];
  readonly routes: readonly RouteOption[];
  /** Latest received present-for-duty return; null means no figure has reached the principal. */
  readonly men: number | null;
  readonly strengthReport?: { readonly source: MessageId; readonly author: PersonId; readonly asOfDay: number } | null;
  /** Whether it is a post that raises regiments (a governor's): the blocks it commands are levies to concentrate. */
  readonly raising: boolean;
  /** The kinds of his orders and verbs to this post still on their way (`order`, `call`, `transfer`, `inquire`...). */
  readonly inTransit: readonly string[];
}

/** A post that raises regiments on his side, held, that he may call on (lane 1.12; lane 1.7's recruitment). */
export interface RaisingPost {
  readonly post: PostId;
  readonly holder: PersonId;
  readonly routes: readonly RouteOption[];
  /** Whether he has called on it already: a call on its way, or one it has answered. */
  readonly called: boolean;
}

/**
 * A post commanding troops on his side that was held when the scenario began and has nobody holding it now, as the
 * battle model can leave one (lane 1.12). A post the scenario starts vacant is not one.
 */
export interface Vacancy {
  readonly post: PostId;
  /** Whether the troops it commands are naval or land. */
  readonly arm: 'land' | 'naval';
  readonly routes: readonly RouteOption[];
  /** Whether an appointment to it is already on its way. */
  readonly appointing: boolean;
}

/** A man on his side, serving and holding no post, whom he may appoint (lane 1.5's appoint verb). */
export interface Candidate {
  readonly person: PersonId;
  readonly kind: string;
  /** His seniority: the highest place among his ranks in the pack's rank vocabulary (junior first), -1 with none. */
  readonly seniority: number;
}

/** His doctrine as the pack states it (lane 1.12; `rules.ruleSeats.principals`), with each offensive's date as a day. */
export interface DoctrineView {
  readonly paperReadiness?: readonly { readonly action: string; readonly results: readonly PaperDecision[] }[];
  /** 0 for a side with no doctrine: he never inquires. */
  readonly crossNeutral: boolean;
  readonly concentrateAt: PostId | null;
  readonly concentrateFrom?: readonly PostId[];
  /** False leaves unallocated statewide levies with their current commands. */
  readonly concentrateLevies?: boolean;
  /** Independent sourced command inclusions, newest destination per sending post. */
  readonly concentrationTransfers?: readonly { readonly from: PostId; readonly to: PostId }[];
  /** Donors reserved for named requests, even while no such request is ready. */
  readonly namedConcentrationDonors?: readonly PostId[];
  readonly namedConcentrationTransfers?: readonly { readonly id: string; readonly from: PostId; readonly to: PostId; readonly regiments: readonly string[] }[];
  readonly appointments?: readonly { readonly post: PostId; readonly person: PersonId; readonly from: PostId | null; readonly ready: boolean; readonly issued: boolean; readonly routes: readonly RouteOption[] }[];
  readonly calls: readonly { readonly address?: 'office'; readonly officeRoutes?: readonly RouteOption[]; readonly termsId?: string; readonly id?: string; readonly post: PostId; readonly regiments: number | null; readonly men?: number | null; readonly arm?: string; readonly readiness?: boolean; readonly termDays: number | null; readonly day: number; readonly atPeace?: boolean; readonly issued?: boolean; readonly ready?: boolean }[];
  readonly offensives: readonly { readonly id?: string; readonly letter?: LetterIdentity; readonly post: PostId; readonly objective: RegionId; readonly day: number; readonly posture?: 'hold' | 'relieve' | 'take'; readonly discretion?: DoctrineDiscretion; readonly ready?: boolean; readonly issued?: boolean }[];
  readonly proposalAnswers?: readonly (DoctrineProposalAnswer & { readonly day: number; readonly paper: MessageId; readonly ordered: GoalTerms })[];
  readonly inquireEveryDays: number;
  readonly appointKinds: { readonly land: readonly string[]; readonly naval: readonly string[] };
}

/** A received proposal the principal may now answer. */
export interface ProposalOffer {
  readonly paper: MessageId;
  readonly order: MessageId;
  readonly post: PostId;
  readonly author: PersonId;
  readonly goal: GoalTerms;
  readonly ordered: GoalTerms;
  readonly reasons: readonly GoalProposalReason[];
}

/** An option of an open situation as a seat may weigh it (never the historical default). */
export interface SituationOptionChoice {
  readonly optionId: string;
  readonly group: string | null;
  /** For a delegate: how far the option honours his values, permille (0040: he decides by his values). 0 for a principal. */
  readonly score: number;
}

/** An open situation the seat may decide (the view carries its text and proposers). */
export interface SituationChoice {
  readonly situation: SituationId;
  readonly options: readonly SituationOptionChoice[];
  /** Held own-side posts of the open options' proposers, excluding consultations already sent. Absent for delegates. */
  readonly consultPosts?: readonly PostId[];
  /** Posts the principal may hand the choice to; empty for a delegate. */
  readonly delegableTo: readonly PostId[];
}

/** A principal deciding what to order today, and which open situations to decide or hand on. */
export interface PrincipalMenu {
  /** Authored questions the principal may ask; dates guide the history rule seat, never send events. */
  readonly consultations?: readonly {
    readonly letter: LetterIdentity;
    readonly subject: SituationId;
    readonly question: string;
    readonly kind: 'policy' | 'feasibility';
    readonly courses: readonly string[];
    readonly posts: readonly PostId[];
    readonly day: number;
  }[];
  readonly menuKind: 'principal';
  readonly faction: FactionId;
  /**
   * The day his side went to war (0064): the day the pack's war flag for it was set, 0 when it names none (war from
   * day 1) or the run started at war, null at peace. The rule-seat principal does nothing of his doctrine before it;
   * a human or model seat may order at peace.
   */
  readonly atWarSince: number | null;
  /** His doctrine (lane 1.12): what the rule-seat principal does, from the pack. */
  readonly doctrine: DoctrineView;
  /** Rules driver only: people reserved until their sourced effective appointment letter is sent. */
  readonly historicalAppointees?: readonly PersonId[];
  /** Due historical appointments, only for the rules driver; never in a human or AI menu. */
  readonly historicalAppointments?: readonly { readonly post: PostId; readonly person: PersonId; readonly routes: readonly RouteOption[] }[];
  /** Posts on his side that raise regiments, held (lane 1.12). */
  readonly raising: readonly RaisingPost[];
  /** Posts commanding troops on his side that have lost the holder the scenario gave them (lane 1.12). */
  readonly vacancies: readonly Vacancy[];
  /** Men he may appoint, senior first (lane 1.12). */
  readonly candidates: readonly Candidate[];
  /** His attention left this week, and what each kind of command costs (the pack's table, 0025, 0040); null left: no budget. */
  readonly attention: { readonly left: number | null; readonly costs: Readonly<Record<string, number>>; readonly specialMessenger: number };
  /** Public names of the own-side blocs he may address (0084), without support or private rule weights. */
  readonly politicalBlocs?: readonly { readonly id: string; readonly name: string }[];
  readonly commandable: readonly CommandablePost[];
  readonly situations: readonly SituationChoice[];
  /** Plans his commanders submitted that have reached him and wait for his review (approve, send back, edit). */
  readonly reviews: readonly PlanReview[];
  readonly proposals?: readonly ProposalOffer[];
  /** Posts whose operation he approved under "prepare, await my word": each waits for his "go". */
  readonly awaiting: readonly PostId[];
  /** The goal terms the pack gives an order that names only an objective and a posture (`WorldRules.plans.goalDefaults`). */
  readonly goalDefaults: Omit<GoalTerms, 'objective' | 'posture' | 'committed'>;
  /** Copies of his own sent goals, keyed by the letter a relay's answer names. Never a live commander's plan. */
  readonly sentGoals?: readonly { readonly post: PostId; readonly message: MessageId; readonly goal: GoalTerms; readonly proposalReply?: true; readonly doctrine?: string; readonly letter?: LetterIdentity }[];
}

/** A holder deciding a situation handed to him: the same options as the principal (0040, gate B7). */
export interface DelegatedMenu {
  readonly menuKind: 'delegated-situation';
  readonly choice: SituationChoice;
}

/**
 * A commander whose men hold his side where the enemy's stand (lane 1.12): his orders for the day's battle, one answer
 * at each decision point, or `judge` to leave it to his traits on the spot. `judged` is what his traits would choose on
 * this morning's numbers as he believes them; the battle itself decides `judge` points on the evening's numbers.
 */
export interface BattleMenu {
  readonly menuKind: 'battle';
  readonly post: PostId;
  readonly region: RegionId;
  /** The battle open there, or null when the armies stand together and none is open yet. */
  readonly battle: string | null;
  /** His own men against the enemy as he sees them, permille. */
  readonly believedRatio: number;
  /** Whether his side may attack today (its blocks marched in and none is recovering from a rout). */
  readonly mayAttack: boolean;
  readonly judged: { readonly commit: Commit; readonly night: NightChoice; readonly cutOff: CutOffChoice; readonly pursue: Pursuit };
  readonly options: typeof BATTLE_ORDER_OPTIONS;
}

export type Menu = PrincipalMenu | PlanMenu | DelegatedMenu | BattleMenu;

export interface SeatRequest {
  /** The human driver's current turn settings, when supplied by that driver. Not simulation State. */
  readonly turnStops?: TurnStopsView;
  /** The day the answer applies to (the morning of it). */
  readonly requestDay: number;
  readonly requestSeat: SeatId;
  /** Unique per seat and day; a `choose` answer names it. */
  readonly requestKey: string;
  readonly view: SeatView;
  readonly menu: Menu;
}

export type SeatAnswer =
  | { readonly answerKind: 'choose'; readonly option: string }
  | { readonly answerKind: 'commands'; readonly commands: readonly SeatCommand[] };

/** Whoever decides for a person. Rule seats live in their own package (FOUNDATION section 8). */
export interface Seat {
  readonly driver: SeatDriver;
  respond(request: SeatRequest): SeatAnswer;
}
