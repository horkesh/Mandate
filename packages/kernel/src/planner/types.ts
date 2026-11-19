/**
 * The planner's types (0062; FOUNDATION section 5): a draft set of candidate plans, each with axes, routes, phases,
 * support requests, gates and the typed terms of its score.
 *
 * A draft set is saved in State by `plans` on the day it was requested, because a later call on a changed map would
 * not reproduce it (planner-design note). So every record here is an immutable State record (declared in
 * `IMMUTABLE_RECORDS`), with keys prefixed so they are unique across State (decision 0044). Integers only: days in
 * permille days, scores in permille, strengths in men (decision 0002).
 */
import type { EdgeId, FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';

/** How an axis travels: on foot and by rail, or carried by ship or boat on rivers or the sea. */
export type AxisMode = 'land' | 'river' | 'sea';

export const PHASE_KINDS = ['assault', 'await', 'bombard', 'clear', 'concentrate', 'depot_step', 'hold', 'march', 'reduce', 'run_past'] as const;
export type PhaseKind = (typeof PHASE_KINDS)[number];

/** One phase of an axis, with its day offset from the plan's start. */
export interface PlanPhase {
  readonly phaseKind: PhaseKind;
  /** Day offset from the plan's start, permille days. */
  readonly phaseStart: number;
  readonly phaseDays: number;
  readonly phaseRegion: RegionId;
}

/** What stands in the way on a leg: works on a water edge to reduce, clear or run past, as he has been told of them. */
export type Obstacle = 'clear' | 'reduce' | 'run_past';

/** One edge crossed, with the cost terms that priced it (hard rule 6). */
export interface PlanLeg {
  readonly legEdge: EdgeId;
  readonly legFrom: RegionId;
  readonly legTo: RegionId;
  readonly legType: 'rail' | 'river' | 'road' | 'sea';
  readonly legDays: number;
  /** Threat where it lands, as permille days at his risk weight. */
  readonly legThreat: number;
  /** Days outside his supply network, at his supply care. */
  readonly legSupply: number;
  /** Days spent on works or enemy-held ground on this leg: an obstruction, works to reduce, a garrison to assault. */
  readonly legObstacleDays: number;
  /** The water-edge obstruction met on this leg, if any. */
  readonly legObstacle: Obstacle | null;
  /** The region it lands in is held by the enemy (lane 0.9 finding 9): an assault where garrisoned, a reduction where fortified. */
  readonly legHeld: boolean;
}

export interface PlanRoute {
  readonly routeFrom: RegionId;
  readonly routeTo: RegionId;
  readonly routeLegs: readonly PlanLeg[];
  /** The priced cost the search minimised. */
  readonly routeCost: number;
  /** Days on the road, plus days on works and held ground, permille. */
  readonly routeDays: number;
}

export interface PlanAxis {
  /** `main`, `partner`, `fixing`, `afloat`, `hold`, or `added:<region>` for an axis an edit added. */
  readonly axisName: string;
  /** The post whose forces make this axis: the commander's own, or a neighbour's under a support request. */
  readonly axisPost: PostId;
  readonly axisMode: AxisMode;
  readonly axisRoute: PlanRoute;
  readonly axisBlocks: readonly ForceBlockId[];
  readonly axisStrength: number;
  readonly axisPhases: readonly PlanPhase[];
  readonly axisArrival: number;
  /** The longest stretch, permille days, marched past his traced network or his last depot step. */
  readonly axisOutOfSupply: number;
  /** The fewest days of stores among the axis's blocks. */
  readonly axisStoresDays: number;
  /** Some of those stores are a pack norm's, not a source's (lane 1.4): the plan rests on an assumption, and says so. */
  readonly axisStoresAssumed: boolean;
}

export const REQUEST_KINDS = ['cooperating_axis', 'naval_support', 'reinforcement'] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];

/**
 * A request for support from another holder (FOUNDATION section 5: a fleet, a neighbouring army) or for men from the
 * principal. One flat record: the fields a kind does not use are null.
 */
export interface PlanRequest {
  readonly reqKind: RequestKind;
  /** The post asked: the answering post of a neighbour (walking up past vacancies); null for the principal. */
  readonly reqPost: PostId | null;
  readonly reqHolder: PersonId | null;
  /** Men asked of the principal (`reinforcement`). */
  readonly reqMen: number;
  /** Where a cooperating axis starts, and its objective. */
  readonly reqFrom: RegionId | null;
  readonly reqObjective: RegionId | null;
  /** The window, permille days from the plan's start, in which a cooperating axis should arrive. */
  readonly reqArriveFrom: number;
  readonly reqArriveTo: number;
  /** The ship asked to carry his troops (`naval_support`), and the edges it would sail. */
  readonly reqCarrier: ForceBlockId | null;
  readonly reqEdges: readonly EdgeId[];
}

export const GATE_KINDS = [
  'duplicate',
  'max_axes',
  'move_when_reinforced',
  'needs_permission',
  'no_carrier',
  'no_forces',
  'no_guns',
  'no_objective',
  'no_partner',
  'no_route',
  'no_target',
  'staging_not_adjacent',
  'vacant_post',
] as const;
export type GateKind = (typeof GATE_KINDS)[number];

/** A typed gate. A hard gate rejects the candidate; a soft one keeps it with a condition. */
export interface PlanGate {
  readonly gateKind: GateKind;
  readonly gateHard: boolean;
  readonly gateDetail: string;
}

export const TERMS = ['caution', 'coordination', 'dependence', 'exposure', 'force_ratio', 'glory', 'goal_fit', 'haste', 'supply', 'time'] as const;
export type TermKind = (typeof TERMS)[number];

/** One scoring term with its cause, so the score is explainable (hard rule 6). */
export interface PlanTerm {
  readonly contribTerm: TermKind;
  readonly contribAmount: number;
  readonly contribWhy: string;
}

export const METHODS = ['bombard', 'by_water', 'direct', 'flank', 'holding', 'pincer', 'supply_line'] as const;
export type Method = (typeof METHODS)[number];

export interface PlanCandidate {
  /** Content-derived: method, variant, then each axis's regions (FOUNDATION M10). Computed once, never reassigned. */
  readonly id: string;
  readonly candMethod: Method;
  readonly candVariant: string;
  readonly candAxes: readonly PlanAxis[];
  readonly candRequests: readonly PlanRequest[];
  /** Soft gates: conditions he attaches ("move when reinforced", a vacant post). */
  readonly candConditions: readonly PlanGate[];
  readonly candTerms: readonly PlanTerm[];
  /** Exactly the sum of `candTerms` (a test asserts it). */
  readonly candScore: number;
  /** Enemy he believes stands at the objective (with a share of his neighbours), men, after his perception. */
  readonly candPerceived: number;
  /** His strength over that, permille. */
  readonly candRatio: number;
}

export interface PlanRejected {
  readonly rejMethod: Method;
  readonly rejVariant: string;
  /** Every gate that failed, never only the first (AWWV P10). */
  readonly rejGates: readonly PlanGate[];
}

/** A request's candidates, ranked best first, with every rejected method and the request's counters (D9). */
export interface DraftSet {
  readonly draftCommander: PersonId;
  readonly draftPost: PostId;
  readonly draftFaction: FactionId;
  /** The day it was drafted (the request day: a later call would see a changed map). */
  readonly draftDay: number;
  /** Ranked best first; a holding action is included whenever he has a force to hold with. */
  readonly draftCandidates: readonly PlanCandidate[];
  readonly draftRejected: readonly PlanRejected[];
  readonly draftSearches: number;
  readonly draftGenerated: number;
  readonly draftDeduplicated: number;
}

/** A block of his side as the planner reads it (`forces`, `movement`, `command`). */
export interface PlannerForce {
  readonly id: ForceBlockId;
  readonly post: PostId;
  readonly region: RegionId;
  /** A detachment is a garrison: it stays unless the goal commits it (lane 0.9 finding 6). */
  readonly kind: 'block' | 'detachment';
  readonly naval: boolean;
  /** Its arm (the pack's arm id): the bombardment method counts the guns of the pack's gun arms (lane 1.12). */
  readonly arm: string;
  /** Men; an unknown strength counts as none. */
  readonly strength: number;
  /** Whole days of stores; unknown counts as none. */
  readonly storesDays: number;
  /** Its stores are a pack norm's (lane 1.4). */
  readonly storesAssumed: boolean;
  /** The naval block carrying it, for troops afloat. */
  readonly aboard: ForceBlockId | null;
}

/** A post of his side as the planner reads it, with the cooperation he expects of its holder (lane 0.9 finding 7). */
export interface PlannerPost {
  readonly id: PostId;
  readonly holder: PersonId | null;
  readonly parent: PostId | null;
  /** Where its headquarters is (derived from its strongest block), or null for a post that commands nothing. */
  readonly region: RegionId | null;
  /** Its seat: its home region in pack data (the start's `region`), or null; a goal to hold with no objective holds it (lane 1.12). */
  readonly seat: RegionId | null;
  /**
   * The cooperation the drafting commander expects of this holder, signed permille, from what he can know: his regard for
   * him and the holder's public standing (`expectedCooperation`; never the holder's hidden temperament). 0 for a vacant post
   * or the drafter's own.
   */
  readonly holderWillingness: number;
}

/**
 * The commander as the planner sees him: permille knobs derived from his traits (`profile.ts`). His perception of the
 * enemy is NOT here: it is applied in belief derivation, so the planner only ever reads his already-biased beliefs (0052).
 */
export interface Profile {
  readonly person: PersonId;
  readonly boldness: number;
  /** Force ratio, permille, he needs over the enemy he perceives (the trait rules' `demandRatio`). */
  readonly demand: number;
  /** Weight on threat along the route, permille. */
  readonly riskWeight: number;
  /** Weight on days outside his supply network, permille. */
  readonly supplyCare: number;
  /** Weight on getting there first, permille. */
  readonly gloryWeight: number;
  /** Days he spends concentrating before he moves. */
  readonly concentrationDays: number;
  /** Days he pauses to bring a depot forward. */
  readonly pauseDays: number;
  /** How many axes he can run at once (from competence). */
  readonly maxAxes: number;
  /** Competence, permille: lowers the cost of coordinating axes. */
  readonly competence: number;
}
