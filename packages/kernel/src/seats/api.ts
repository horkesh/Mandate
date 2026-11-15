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
import type { SeatCommand } from '../log/commands.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { GoalView, SeatView } from '../view/types.ts';

export const SEAT_DRIVERS = ['ai', 'human', 'rules'] as const;
export type SeatDriver = (typeof SEAT_DRIVERS)[number];

/** One option the kernel judged consistent with the person's state, with the facts it judged on (as he sees them). */
export interface OptionView {
  readonly optionId: string;
  readonly kind: 'advance' | 'hold';
  readonly region: RegionId | null;
  /** The kernel's score for the option, permille (higher: more in keeping with him). */
  readonly score: number;
  /** The enemy he believes stands in the region he would enter (0 if none known). */
  readonly perceivedEnemy: number;
  readonly ownStrength: number;
}

/** A commander with a standing goal choosing his next step (stand-in until lane 0.9's plan selection). */
export interface StandingMenu {
  readonly menuKind: 'standing-goal';
  readonly post: PostId;
  readonly goal: GoalView;
  readonly options: readonly OptionView[];
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
}

/** A holder deciding a situation handed to him: the same options as the principal (0040, gate B7). */
export interface DelegatedMenu {
  readonly menuKind: 'delegated-situation';
  readonly choice: SituationChoice;
}

export type Menu = PrincipalMenu | StandingMenu | DelegatedMenu;

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
