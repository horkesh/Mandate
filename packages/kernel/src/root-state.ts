/**
 * The Phase 0 State: mutable truth, saved and hashed (FOUNDATION section 10).
 *
 * Lane 0.6 adds the seats layer: seat assignments, messages in transit,
 * knowledge per seat and the truth behind reports, plus two clearly marked
 * stand-in (standing goals) that lane 0.9 and Phase 1's plans replace. Lane 0.5 replaced the
 * stand-in headquarters with forces, command, movement and infrastructure.
 * Lane 0.4 adds control and the calendar; lane 0.5 adds forces and command.
 *
 * Rules every field obeys (decision 0044, hard rule 5):
 * - each field has exactly one writer, listed in `OWNED_FIELDS` (`ownership.ts`);
 * - State is updated copy-on-write: a writer returns a new State sharing every
 *   unchanged record, never edits one in place. That is what lets `viewFor`
 *   return stable references for unchanged data (0035), and lets tests
 *   deep-freeze State so any write outside a writer throws (`tick/freeze.ts`);
 * - records below the root are immutable values (each is declared in
 *   `IMMUTABLE_RECORDS`), so a change always goes through a root field and
 *   therefore through its writer.
 *
 * The command log sits beside State, not in it (`log/log.ts`).
 */
import type { AssignmentTable, PostTable } from './command/command.ts';
import type { RegionControlTable } from './control/control.ts';
import type { ForceTable } from './forces/forces.ts';
import type { ConditionTable, ObstructionState } from './infrastructure/infrastructure.ts';
import type { ForceLocation } from './movement/movement.ts';
import type { DepartmentId, DepotId, EdgeId, ForceBlockId, MessageId, PostId, RegionId, SeatId, SituationId } from './ids.ts';
import type { SituationRecord } from './situations/situations.ts';
import type { SeatKnowledge } from './knowledge/knowledge.ts';
import type { ReportTruth } from './knowledge/truth.ts';
import type { TransitMessage } from './messages/transit.ts';
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
  /**
   * Each land region's civil government (0058): a department, or `unknown`. Jurisdiction, not control. From the
   * scenario start's `governments`; situations propose changes. Empty without a map. Writer: `command`.
   */
  readonly regionGovernments: Readonly<Record<RegionId, DepartmentId | 'unknown'>>;
  /** Neutral governments closed to passage, with the day each closed (0055 as amended by 0058). Empty at the start. Writer: `command`. */
  readonly closedGovernments: Readonly<Record<DepartmentId, number>>;
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
  /** Situations that have fired: status, clock, open options, decisions. Writer: `situations`. */
  readonly situationStates: Readonly<Record<SituationId, SituationRecord>>;
  /** Situation chain state: flags set by effects, with the day each was set. Writer: `situations`. */
  readonly situationFlags: Readonly<Record<string, number>>;
  /** Force blocks and detachments: strength, stores, non-combatants (0050). Writer: `forces`. */
  readonly forceBlockStates: ForceTable;
  /** Where each block stands, or the ship it is aboard. Writer: `movement`. */
  readonly forceLocations: Readonly<Record<ForceBlockId, ForceLocation>>;
  /** Posts: holders, chain, departments, temporary posts, standing orders. Writer: `command`. */
  readonly postStates: PostTable;
  /** Which post commands each block (division-to-post assignment). Writer: `command`. */
  readonly forceAssignments: AssignmentTable;
  /** Edge condition, permille, for edges not intact (an intact edge is absent). Writer: `infrastructure`. */
  readonly infraEdgeCondition: ConditionTable<EdgeId>;
  /** Depot condition, permille, for depots not intact. Writer: `infrastructure`. */
  readonly infraDepotCondition: ConditionTable<DepotId>;
  /** Water edges obstructed by works or batteries, in edge order. Writer: `infrastructure`. */
  readonly infraObstructions: readonly ObstructionState[];
}
