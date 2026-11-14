/**
 * The commands a seat can send, as they are logged (decision 0015: the
 * command log is the truth). Two kinds in Phase 0:
 * - `order`: a goal for the holder of a post (hold, or advance to a region),
 *   sent by a route, through the chain of posts or around it. A place is named
 *   only as part of an order to a person (hard rule 1, decision 0016).
 * - `choose`: a seat's answer to a menu the kernel offered it.
 * The Phase 1 verbs join this union; the verb-list test then lists them.
 */
import type { PostId, RegionId, SituationId } from '../ids.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { GoalKind } from '../plans/goal.ts';

export interface OrderCommand {
  readonly cmd: 'order';
  readonly to: PostId;
  readonly goal: GoalKind;
  /** The objective of an `advance`; null for `hold`. */
  readonly region: RegionId | null;
  readonly route: RouteKind;
  /** Send it straight to the holder, around the posts that should relay it (0040). */
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
export type SeatCommand = OrderCommand | DecideCommand | DelegateCommand;

export type Command = OrderCommand | ChooseCommand | DecideCommand | DelegateCommand;

export const COMMAND_KINDS = ['choose', 'decide', 'delegate', 'order'] as const;
