/**
 * Lane 0.9 planner spike: the types a candidate plan is made of.
 *
 * Written as if it were kernel code so it can be ported (decision 0002):
 * integers only (days in permille days, everything else permille or men),
 * stable tie-breaks by id, no randomness, no clock. Nothing here names a
 * setting (hard rule 3); the testbed cases live in `testbed-cases.ts`.
 */
import type { ids } from '@mandate/kernel';

export type RegionId = ids.RegionId;
export type EdgeId = ids.EdgeId;
export type PostId = ids.PostId;
export type PersonId = ids.PersonId;
export type FactionId = ids.FactionId;
export type ForceBlockId = ids.ForceBlockId;

/** How an axis travels: on foot and by rail, by boat on rivers, or by ship. */
export type AxisMode = 'land' | 'river' | 'sea';

/** The goal a principal sets a commander (0016). Only `objective` names a place, as part of an order to a person (hard rule 1). */
export interface Goal {
  readonly objective: RegionId;
  readonly posture: 'take' | 'relieve';
  /** 0..1000: the risk the principal accepts. Scales the exposure he will tolerate before preferring a slower plan. */
  readonly risk: number;
  /** Days from the request day by which the objective should be reached. */
  readonly deadlineDays: number;
  readonly permissions: { readonly rail: boolean; readonly river: boolean; readonly sea: boolean };
  /** The blocks committed. Empty: every block his post commands. */
  readonly committed: readonly ForceBlockId[];
}

/**
 * Lane 0.5 will own force blocks (`forces`). This is the minimal stand-in the
 * planner reads; each field is a field of the World format's `ForceBlockStart`
 * (0033, 0040) under the same name, so the mapping is one to one.
 */
export interface ForceStandIn {
  readonly id: ForceBlockId;
  readonly post: PostId;
  readonly region: RegionId;
  /** `block` or `detachment` (0040). A detachment is a garrison: it stays unless the goal commits it. */
  readonly kind: 'block' | 'detachment';
  readonly arm: string;
  readonly strength: number;
  readonly storesDays: number;
  /** The naval block carrying it, for troops afloat. */
  readonly aboard: ForceBlockId | null;
}

/**
 * The commander as the planner sees him: a few permille knobs derived from
 * his traits by `profileOf`. Perception bias is NOT here: it is applied in
 * belief derivation, so the planner only ever reads his already-biased beliefs.
 */
export interface Profile {
  readonly person: PersonId;
  readonly boldness: number;
  /** Force ratio, permille, he needs over the enemy he perceives (kernel `demandRatio`). */
  readonly demand: number;
  /** Weight on threat along the route, permille. */
  readonly riskWeight: number;
  /** Weight on days spent outside his supply network, permille. */
  readonly supplyCare: number;
  /** Weight on getting there first, permille. */
  readonly gloryWeight: number;
  /** Days he spends concentrating before he moves. */
  readonly concentrationDays: number;
  /** Days he pauses between legs when he must establish a depot forward. */
  readonly pauseDays: number;
  /** How many axes he can run at once (from competence). */
  readonly maxAxes: number;
  /** Competence, permille: lowers the cost of coordinating axes. */
  readonly competence: number;
}

export type PhaseKind = 'concentrate' | 'march' | 'depot_step' | 'reduce' | 'clear' | 'run_past' | 'assault' | 'hold' | 'await';

export interface Phase {
  readonly kind: PhaseKind;
  /** Day offset from the plan's start, permille days. */
  readonly startPermille: number;
  readonly daysPermille: number;
  readonly region: RegionId;
}

/** One edge crossed, with the cost terms that priced it (hard rule 6). */
export interface RouteLeg {
  readonly edge: EdgeId;
  readonly from: RegionId;
  readonly to: RegionId;
  readonly type: 'road' | 'rail' | 'river' | 'sea';
  readonly daysPermille: number;
  readonly threatPermille: number;
  readonly supplyPermille: number;
  readonly obstaclePermille: number;
  /** Set when the edge is obstructed and must be reduced, cleared or run past. */
  readonly obstacle: 'reduce' | 'clear' | 'run_past' | null;
}

export interface Route {
  readonly from: RegionId;
  readonly to: RegionId;
  readonly legs: readonly RouteLeg[];
  /** The priced cost the search minimised. */
  readonly costPermille: number;
  readonly daysPermille: number;
}

export interface Axis {
  readonly id: string;
  /** The post whose forces make this axis: the commander's own, or a neighbour's under a support request. */
  readonly post: PostId;
  readonly mode: AxisMode;
  readonly route: Route;
  readonly blocks: readonly ForceBlockId[];
  readonly strength: number;
  readonly phases: readonly Phase[];
  readonly arrivalPermille: number;
  /** The longest stretch, permille days, marched past his traced network or his last depot step. */
  readonly outOfSupplyPermille: number;
  /** The fewest stores days among the axis's blocks. */
  readonly storesDays: number;
}

export type SupportRequest =
  | { readonly kind: 'reinforcement'; readonly to: 'principal'; readonly men: number }
  | { readonly kind: 'cooperating_axis'; readonly to: PostId; readonly holder: PersonId | null; readonly from: RegionId; readonly objective: RegionId; readonly arriveFromPermille: number; readonly arriveToPermille: number }
  | { readonly kind: 'naval_support'; readonly to: PostId; readonly holder: PersonId | null; readonly carrier: ForceBlockId; readonly route: readonly EdgeId[] };

/** A typed gate. A hard gate rejects the candidate; a condition keeps it with a start condition. */
export interface Gate {
  readonly kind:
    | 'no_route'
    | 'no_forces'
    | 'needs_permission'
    | 'max_axes'
    | 'no_partner'
    | 'no_carrier'
    | 'vacant_post'
    | 'staging_not_adjacent'
    | 'duplicate'
    | 'move_when_reinforced';
  readonly hard: boolean;
  readonly detail: string;
}

export const TERMS = ['goal_fit', 'force_ratio', 'time', 'haste', 'supply', 'exposure', 'coordination', 'dependence', 'glory', 'caution'] as const;
export type TermKind = (typeof TERMS)[number];

/** One scoring term with its cause, so the score is explainable (hard rule 6). */
export interface Contribution {
  readonly term: TermKind;
  readonly amount: number;
  readonly why: string;
}

export const METHODS = ['direct', 'flank', 'supply_line', 'pincer', 'by_water', 'holding'] as const;
export type Method = (typeof METHODS)[number];

export interface Candidate {
  /** Content-derived: method, then each axis's route. Computed once (FOUNDATION M10). */
  readonly id: string;
  readonly method: Method;
  readonly variant: string;
  readonly axes: readonly Axis[];
  readonly requests: readonly SupportRequest[];
  readonly conditions: readonly Gate[];
  readonly contributions: readonly Contribution[];
  /** Exactly the sum of `contributions` (a test asserts it). */
  readonly score: number;
  /** Perceived enemy at the objective, men, after his bias. */
  readonly perceivedAtObjective: number;
  readonly forceRatio: number;
}

export interface Rejected {
  readonly method: Method;
  readonly variant: string;
  /** Every gate that failed, never only the first (AWWV P10). */
  readonly gates: readonly Gate[];
}

export interface DraftSet {
  readonly goal: Goal;
  readonly commander: PersonId;
  readonly post: PostId;
  /** Ranked best first; a holding action is always included when legal. */
  readonly candidates: readonly Candidate[];
  readonly rejected: readonly Rejected[];
  /** Liveness counters for the request (D9). */
  readonly counters: { readonly searches: number; readonly generated: number; readonly deduplicated: number };
}
