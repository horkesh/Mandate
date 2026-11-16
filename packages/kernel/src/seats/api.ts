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
import type { FactionId, PersonId, PostId, RegionId, SeatId, SituationId } from '../ids.ts';
import type { GoalTerms, SeatCommand } from '../log/commands.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { GoalView, SeatView } from '../view/types.ts';

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
  /** Posts the principal may hand the choice to; empty for a delegate. */
  readonly delegableTo: readonly PostId[];
}

/** A principal deciding what to order today, and which open situations to decide or hand on. */
export interface PrincipalMenu {
  readonly menuKind: 'principal';
  readonly faction: FactionId;
  /** The objective pack data names for his side, if any (public, like the map). */
  readonly objective: RegionId | null;
  /**
   * The day his side went to war (0064): the day the pack's war flag for it was set, 0 when it names none (war from
   * day 1) or the run started at war, null at peace. The generic rule-seat principal opens his campaign the first
   * morning at war and orders no advance before; a human or model seat may order at peace.
   */
  readonly atWarSince: number | null;
  readonly commandable: readonly CommandablePost[];
  readonly situations: readonly SituationChoice[];
  /** Plans his commanders submitted that have reached him and wait for his review (approve, send back, edit). */
  readonly reviews: readonly PlanReview[];
  /** Posts whose operation he approved under "prepare, await my word": each waits for his "go". */
  readonly awaiting: readonly PostId[];
  /** The goal terms the pack gives an order that names only an objective and a posture (`WorldRules.plans.goalDefaults`). */
  readonly goalDefaults: Omit<GoalTerms, 'objective' | 'posture' | 'committed'>;
}

/** A holder deciding a situation handed to him: the same options as the principal (0040, gate B7). */
export interface DelegatedMenu {
  readonly menuKind: 'delegated-situation';
  readonly choice: SituationChoice;
}

export type Menu = PrincipalMenu | PlanMenu | DelegatedMenu;

export interface SeatRequest {
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
