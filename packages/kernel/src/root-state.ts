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
import type { AssignmentTable, DepartmentSides, PostTable } from './command/command.ts';
import type { RegionControlTable } from './control/control.ts';
import type { ForceTable } from './forces/forces.ts';
import type { ConditionTable, ObstructionState } from './infrastructure/infrastructure.ts';
import type { ForceLocation } from './movement/movement.ts';
import type { DepartmentId, DepotId, EdgeId, ForceBlockId, MessageId, PersonId, PostId, RegionId, SeatId, SituationId } from './ids.ts';
import type { SituationRecord } from './situations/situations.ts';
import type { SeatKnowledge } from './knowledge/knowledge.ts';
import type { ReportTruth } from './knowledge/truth.ts';
import type { TransitMessage } from './messages/transit.ts';
import type { OperationTable } from './operations/operations.ts';
import type { PlanRecord } from './plans/plans.ts';
import type { SeatAssignment } from './seats/seats.ts';
import type { PersonGrievance, PersonPromise, PersonStatus, PersonTrue, Stance } from './people/people.ts';
import type { AttentionState } from './seats/attention.ts';
import type { LadderRung } from './people/verb-rules.ts';
import type { AudienceRecord } from './audience/audience.ts';
import type { ObserverPosting } from './command/observers.ts';
import type { PersonRank } from './people/ranks.ts';
import type { OrderResponse } from './proxy/responses.ts';
import type { ArrivalTable, FortificationTable, LoyaltyTable } from './regions/regions.ts';
import type { EnlistmentTable } from './forces/enlistment.ts';
import type { LevyTable } from './command/levies.ts';
import type { BattleTable } from './combat/records.ts';

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
  /**
   * Each department's side (0065): a faction, or null for a neutral government. Copied from the World's departments
   * at the start; a situation's `department_side` proposal moves a government to a side. Writer: `command`.
   */
  readonly departmentFactions: DepartmentSides;
  /** Who drives each person. Writer: `seats`. */
  readonly seatAssignments: Readonly<Record<SeatId, SeatAssignment>>;
  /** Orders and reports on their way, in (arrival day, id) order. Writer: `messages`. */
  readonly messagesInTransit: readonly TransitMessage[];
  /** The reports each seat holds. Writer: `knowledge`. */
  readonly knowledgeBySeat: Readonly<Record<SeatId, SeatKnowledge>>;
  /** Why each held report says what it says (the truth layer). Writer: `knowledge`. */
  readonly reportTruth: Readonly<Record<MessageId, ReportTruth>>;
  /** Each post's goal and its plan: draft set, the seat's pick, approval, edits as counter-orders (lane 1.2). Writer: `plans`. */
  readonly planRecords: Readonly<Record<PostId, PlanRecord>>;
  /** Approved plans in execution, each with its axes' stages, support requests and outcome (lane 1.4; `operations/`). Writer: `operations`. */
  readonly operationRecords: OperationTable;
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
  /** Each raised block's enlistment: who raised it on whose call, and the day its men's term ends (lane 1.7). Writer: `forces`. */
  readonly forceEnlistments: EnlistmentTable;
  /** Calls a governor answered and has not yet mustered, by the call's id: a prior order on his post (lane 1.7). Writer: `command`. */
  readonly postLevies: LevyTable;
  /** Edge condition, permille, for edges not intact (an intact edge is absent). Writer: `infrastructure`. */
  readonly infraEdgeCondition: ConditionTable<EdgeId>;
  /** Depot condition, permille, for depots not intact. Writer: `infrastructure`. */
  readonly infraDepotCondition: ConditionTable<DepotId>;
  /** Water edges obstructed by works or batteries, in edge order. Writer: `infrastructure`. */
  readonly infraObstructions: readonly ObstructionState[];
  /**
   * Fortification and entrenchment per region, permille, from the scenario start (0050); a region absent has none.
   * Nothing changes it in Phase 0; the siege method (0062) reads it. Writer: `regions`.
   */
  readonly regionFortification: FortificationTable;
  /** Loyalty per region, each faction's share permille, from the start (lane 1.7); never a stand-in for control. Writer: `regions`. */
  readonly regionLoyalty: LoyaltyTable;
  /** People who have reached the lines, by the region where they reached them (0046; the gate's `region_reached_union_lines`). Writer: `regions`, proposed only by the derived self-emancipation term; never a lever. */
  readonly regionReachedUnionLines: ArrivalTable;
  /**
   * Each person's ranks, one per kind (regular, volunteer, brevet) held at once, each with the date he holds it from
   * (seniority); from the start date (0050, 0073). A person absent holds none; a kind absent, none of that kind. Writer: `people`.
   */
  readonly personRanks: Readonly<Record<PersonId, Readonly<Record<string, PersonRank>>>>;
  /** Each person's hidden true stats and temperament, drawn at setup by history's shadow (lane 1.1). Writer: `people`. */
  readonly personTrue: Readonly<Record<PersonId, PersonTrue>>;
  /** Each person's traits: innate from the World at setup, earned in play (FOUNDATION section 6). Writer: `people`. */
  readonly personTraits: Readonly<Record<PersonId, readonly string[]>>;
  /** Each person's public standing, permille: from his reputation at setup, moved by the press and the blocs. Writer: `people`. */
  readonly personStanding: Readonly<Record<PersonId, number>>;
  /** What each person holds against whom, in the order given. A person absent holds none. Writer: `people`. */
  readonly personGrievances: Readonly<Record<PersonId, readonly PersonGrievance[]>>;
  /** Regard, signed permille, from each person toward others (his principal, rivals, partners); sparse: absent is 0. Writer: `people`. */
  readonly personRegard: Readonly<Record<PersonId, Readonly<Record<PersonId, number>>>>;
  /** Stances on record from Consult (0040), in the order given. Writer: `people`. */
  readonly personStances: Readonly<Record<PersonId, readonly Stance[]>>;
  /** Each person's status (serving, wounded, killed, captured) and the day it began (0073). Writer: `people`. */
  readonly personStatus: Readonly<Record<PersonId, PersonStatus>>;
  /** Each man's response to each order that reached him, keyed `order|person` (`proxy/responses.ts`). Writer: `proxy`. */
  readonly orderResponses: Readonly<Record<string, OrderResponse>>;
  /** Promises the principal made to each person (lane 1.5): kind, day made, day due. Writer: `people`. */
  readonly personPromises: Readonly<Record<PersonId, readonly PersonPromise[]>>;
  /** The days each person was inquired of in the last week (his patience, 0040). Writer: `people`. */
  readonly personInquiries: Readonly<Record<PersonId, readonly number[]>>;
  /** Each principal seat's attention: what is left this week and the day of its last refill (0025, 0040). Writer: `seats`. */
  readonly seatAttention: Readonly<Record<SeatId, AttentionState>>;
  /** Each seat's initiatives, each with the day it last fired, for its cooldown (0040). Writer: `seats`. */
  readonly seatInitiatives: Readonly<Record<SeatId, Readonly<Record<string, number>>>>;
  /** Each person's rung on the insubordination ladder; absent is loyal (P5). Writer: `ladder`. */
  readonly personRungs: Readonly<Record<PersonId, LadderRung>>;
  /** Rivals (P6), each with the day he became one. Writer: `ladder`. */
  readonly personRivals: Readonly<Record<PersonId, number>>;
  /** The last audience held with each person (P3). Writer: `audience`. */
  readonly audienceHeld: Readonly<Record<PersonId, AudienceRecord>>;
  /** Observers posted at commanders' headquarters, keyed by the observer (0040). Writer: `command`. */
  readonly observerPostings: Readonly<Record<PersonId, ObserverPosting>>;
  /** Every battle fought, open or closed, with each day's breakdowns (lane 1.3; `combat/records.ts`). Writer: `combat`. */
  readonly battleRecords: BattleTable;
}
