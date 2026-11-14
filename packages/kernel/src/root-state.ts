/**
 * The Phase 0 State: mutable truth, saved and hashed (FOUNDATION section 10).
 *
 * Lane 0.6 adds the seats layer: seat assignments, messages in transit,
 * knowledge per seat and the truth behind reports, plus two clearly marked
 * stand-ins (standing goals and headquarters) that lanes 0.5 and 0.9 replace.
 * Lane 0.4 adds control and the calendar; lane 0.5 adds forces and command.
 *
 * Rules every field obeys (decision 0044, hard rule 5):
 * - each field has exactly one writer, listed in `OWNED_FIELDS` (`ownership.ts`);
 * - State is updated copy-on-write: a writer returns a new State sharing every
 *   unchanged record, never edits one in place. That is what lets `viewFor`
 *   return stable references for unchanged data (0035), and lets tests
 *   deep-freeze State so any write outside a writer throws (`tick/freeze.ts`);
 * - records below the root are immutable values (their keys are in
 *   `IMMUTABLE_STATE_KEYS`), so a change always goes through a root field and
 *   therefore through its writer.
 *
 * The command log sits beside State, not in it (`log/log.ts`).
 */
import type { RegionControlTable } from './control/control.ts';
import type { MessageId, PostId, SeatId } from './ids.ts';
import type { SeatKnowledge } from './knowledge/knowledge.ts';
import type { ReportTruth } from './knowledge/truth.ts';
import type { TransitMessage } from './messages/transit.ts';
import type { Headquarters } from './movement/headquarters.ts';
import type { StandingGoal } from './plans/goal.ts';
import type { SeatAssignment } from './seats/seats.ts';

export interface State {
  /** The game's seed, set at setup; every named stream derives from it. Immutable. */
  readonly gameSeed: number;
  /** ISO date of day 0, from the scenario start (null without a map). Seasons read the month from it. Immutable. */
  readonly calendarStart: string | null;
  /** The last day the tick completed (0 at setup). Writer: `tick`. */
  readonly stateDay: number;
  /** Control: permille per faction per region, from the scenario start (0050); a region absent is no one's. Writer: `control`. */
  readonly regionControl: RegionControlTable;
  /** Who drives each person. Writer: `seats`. */
  readonly seatAssignments: Readonly<Record<SeatId, SeatAssignment>>;
  /** Orders and reports on their way, in (arrival day, id) order. Writer: `messages`. */
  readonly messagesInTransit: readonly TransitMessage[];
  /** The reports each seat holds. Writer: `knowledge`. */
  readonly knowledgeBySeat: Readonly<Record<SeatId, SeatKnowledge>>;
  /** Why each held report says what it says (the truth layer). Writer: `knowledge`. */
  readonly reportTruth: Readonly<Record<MessageId, ReportTruth>>;
  /** STAND-IN standing goals per field post (hold, or advance to a region) until lane 0.9's plans. Writer: `plans`. */
  readonly standingGoals: Readonly<Record<PostId, StandingGoal>>;
  /** STAND-IN headquarters region per post until lane 0.5's forces and movement. Writer: `movement`. */
  readonly headquarters: Readonly<Record<PostId, Headquarters>>;
}
