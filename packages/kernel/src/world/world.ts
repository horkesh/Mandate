/**
 * World format v2, the whole World: one pack's static data, self-contained so
 * it can be hashed and referenced from saves by hash (FOUNDATION section 10).
 *
 * The pack manifest supplies the rules, vocabularies and factions; the source
 * tables supply the rest; the generator writes the result to the pack's
 * `data/world.json`. Vocabularies are pack data (decision 0003): the engine
 * knows only the closed kinds declared in `graph.ts`, `people.ts` and
 * `scenario.ts`; every open list (terrains, post kinds, arms, ranks, traits)
 * belongs to the pack.
 */
import type { DepartmentId, FactionId } from '../ids.ts';
import type {
  CensusRecord,
  DepotRecord,
  EdgeRecord,
  InstallationRecord,
  Provenance,
  RailLineRecord,
  RegionRecord,
  SeasonReason,
  StringKey,
  WeatherZoneRecord,
} from './graph.ts';
import type { PersonRecord } from './people.ts';
import type { ReportTemplate } from '../knowledge/templates.ts';
import type { LatencyRules } from '../messages/latency.ts';
import type { RecruitmentRules, SelfEmancipationRules } from '../recruitment/rules.ts';
import type { PeopleRules } from '../people/rules.ts';
import type { CombatRules } from '../combat/rules.ts';

export const WORLD_FORMAT_VERSION = 2;

/** How a season reason changes an edge (0029), and its months when a source gives none. */
export interface SeasonEffect {
  readonly reason: SeasonReason;
  readonly defaultMonths: readonly number[];
  /** Edge length while in effect, permille of the base (1500 = half as long again). */
  readonly lengthPermille: number;
  /** Edge capacity while in effect, permille of the base. */
  readonly capacityPermille: number;
}

/**
 * Stores on hand (0040, 0064): what a block eats and carries. DESIGN PARAMETERS
 * the pack states, never sourced facts and never kernel defaults (hard rule 3).
 */
export interface StoresRules {
  /** Men (and non-combatants) one unit of the capacity scale feeds for a day. */
  readonly menPerCapacityUnit: number;
  /** The most days of stores a block refills to. */
  readonly capDays: number;
  /** Stores below this many days are low: crossing it is a truth event a report may tell. */
  readonly lowDays: number;
}

/** Occupation (0064): a side alone that marched in takes ground by its men. DESIGN PARAMETERS the pack states. */
export interface OccupationRules {
  /** Control a side alone in held ground gains a day at full strength, permille. */
  readonly occupyPermille: number;
  /** The men at which occupation reaches its full rate; fewer gain in proportion. */
  readonly occupyFullMen: number;
}

/** Movement and messages over the graph (0064). DESIGN PARAMETERS the pack states. */
export interface MovementRules {
  /** The least capacity an edge needs this month to carry a march, permille of one unit of the capacity scale. */
  readonly marchMinCapacityPermille: number;
  /** A courier's days on an edge, permille of a division's (rounded up, at least one day). */
  readonly courierPermille: number;
}

/**
 * The generic rule-seat principal's settings (0064). Its standing goals stay at
 * hold until its faction is at war; "at war" is a situation chain flag the pack
 * names per faction, so a history run keeps the peace until the war's opening
 * situation sets it. Lane 0.8's gate reads this; nothing else does.
 */
export interface RuleSeatRules {
  /** One row per faction: the chain flag that puts it at war, or null for war from day 1. */
  readonly warFlags: readonly { readonly faction: FactionId; readonly flag: string | null }[];
}

/**
 * Conflicting orders (0040, 0072). DESIGN PARAMETERS the pack states, never kernel defaults. STAND-IN: lane 1.1's
 * compliance function resolves conflicting orders and retires this window.
 */
export interface StandingRules {
  /** Days within which a chain order stands against a newer order that went around the chain (0040: conflicting orders). */
  readonly conflictWindowDays: number;
}

/**
 * How the planner turns a man's traits into his planning profile, and how it scores a plan (0062; lane 0.9). Each
 * score term is a signed sum of these weights times the plan's facts, so the score stays the exact sum of its terms
 * (hard rule 6). DESIGN PARAMETERS the pack states, calibrated with compliance (FOUNDATION section 12's note).
 */
export interface PlannerWeights {
  /** Risk weight is this plus his timidity (1000 minus boldness), permille. */
  readonly riskBase: number;
  /** Supply care is this minus his boldness, permille. */
  readonly supplyBase: number;
  /** One day of concentration, plus one per this many points of timidity. */
  readonly concentrationPerTimid: number;
  /** One day of pause at a depot step, plus one per this many points of timidity. */
  readonly pausePerTimid: number;
  /** Competence at or above which he runs two axes, and three. */
  readonly twoAxesAt: number;
  readonly threeAxesAt: number;
  /** `goal_fit`: what reaching the objective is worth. */
  readonly goalFit: number;
  /** `force_ratio`: the most a surplus over his demand earns, and its divisor (permille of ratio per point). */
  readonly ratioBonusMax: number;
  readonly ratioBonusDivisor: number;
  /** `force_ratio`: the most a shortfall against his demand costs. */
  readonly ratioPenaltyMax: number;
  /** `time`: the most lateness costs, and the points per day late. */
  readonly latePenaltyMax: number;
  readonly latePerDay: number;
  /** `time`: the most an early arrival earns, and the divisor on days early times boldness. */
  readonly earlyBonusMax: number;
  readonly earlyDivisor: number;
  /** `time`: what a holding action costs, the deadline passing with nothing attempted. */
  readonly holdingTime: number;
  /** `haste`, `supply` and `coordination`: the base the man's trait is taken from (boldness or competence), and the divisor. */
  readonly traitBase: number;
  readonly hasteDivisor: number;
  readonly supplyDivisor: number;
  /** `supply`: what outrunning his stores costs, as a divisor of his supply care. */
  readonly outrunDivisor: number;
  /** `exposure`: the divisor on perceived men along the route, weighted. */
  readonly exposureDivisor: number;
  readonly coordinationDivisor: number;
  /** `coordination`: the cost of each axis beyond the first. */
  readonly perExtraAxis: number;
  /** `glory`: his boldness over this divisor. */
  readonly gloryDivisor: number;
  /** `caution`: his timidity over this divisor, for a holding action. */
  readonly cautionDivisor: number;
}

/**
 * The planner's thresholds (0062; lane 0.9's `PlannerRules`, its fixes, and lane 0.8's drafting cap). DESIGN PARAMETERS
 * the pack states, never kernel defaults (0072).
 */
export interface PlannerRules {
  /** Share of a neighbouring region's perceived enemy that adds to a region's threat, permille (one hop). */
  readonly hopShare: number;
  /** Men of perceived enemy that weigh as one day's march in route cost, at risk weight 1000. */
  readonly menPerDay: number;
  /** A flank is kept only if it shares fewer than this many permille of the direct route's regions. */
  readonly flankOverlapMax: number;
  /** A flank may take at most this many permille of the direct route's days. */
  readonly flankLengthMax: number;
  /** Penalty, permille, on the direct route's edges when looking for a flank (2000 doubles them). */
  readonly flankPenalty: number;
  /** An alternative may pass regions at most this many permille days further from the objective than its start. */
  readonly retrogradeSlack: number;
  /** Candidates sharing at least this many permille of their regions, with the same shape, are duplicates. */
  readonly dedupeOverlap: number;
  /** ... and only if they arrive within this many permille days of each other. */
  readonly dedupeArrival: number;
  /** Moving candidates on the menu, plus a holding action. */
  readonly topN: number;
  /** Route searches allowed per request; the cap is counted and reported, never silent. */
  readonly maxSearches: number;
  /** Permille days to reduce works per permille of fortification. */
  readonly reducePerLevel: number;
  /** Permille days to clear works no installation holds (a boom) deliberately, and to force them in a night. */
  readonly clearDays: number;
  readonly forceDays: number;
  /** Extra threat, as men, of forcing works or running past batteries. */
  readonly forcingThreat: number;
  /** Permille days an assault on a garrisoned region takes (lane 0.9 finding 9: on the route as at the objective). The assault margin on his demand is a people rule (`people.traits.assaultMargin`). */
  readonly assaultDays: number;
  /** A pincer's partner may arrive up to this many permille days before the main axis. */
  readonly pincerWindow: number;
  /** `dependence`: what one support request to another holder costs. */
  readonly dependenceCost: number;
  /**
   * The cooperation a drafter expects of a partner holder (lane 0.9 finding 7), permille of it counted against
   * `dependenceCost`. He expects it from what he can know (0062: beliefs, never truth; FOUNDATION section 6: temperament is
   * hidden): his own regard for the holder and the holder's public standing, weighted below. The partner's real answer is
   * his own compliance's, when the request reaches him.
   */
  readonly partnerWillingnessWeight: number;
  /** Permille of the drafter's regard for the partner's holder (signed; the pack's `regardUnknown` with no history) in the expectation. */
  readonly partnerRegardWeight: number;
  /** Permille of the partner holder's public standing, above or below `partnerStandingPivot`, in the expectation. */
  readonly partnerStandingWeight: number;
  /** The public standing, permille, at which a holder's reputation neither raises nor lowers what is expected of him. */
  readonly partnerStandingPivot: number;
  /** Drafts a side's commanders make in one day; the rest wait for the next (0062; lane 0.8 measured the worst day). */
  readonly dailyDraftCap: number;
  readonly weights: PlannerWeights;
}

/** Goals and plans (0040, 0062; lane 1.2). DESIGN PARAMETERS the pack states. */
export interface PlansRules {
  /** The goal terms an order carries when it names only a posture and an objective (a situation's option). */
  readonly goalDefaults: {
    readonly risk: number;
    readonly deadlineDays: number;
    readonly rail: boolean;
    readonly river: boolean;
    readonly sea: boolean;
    readonly neutral: boolean;
    readonly awaitWord: boolean;
    readonly approveAsDrafted: boolean;
  };
  /** A holding action's riskiness, for reading an edit's boldness against his own best plan (lane 0.9 finding 2). */
  readonly holdingRisk: number;
}

/** Pack-tunable rules the map needs (0019: thresholds start from AGEoD's tested values). */
export interface WorldRules {
  /** The top of the pack's capacity scale for edges and depots. */
  readonly capacityMax: number;
  /** Control a faction needs in a region to trace supply or rail through it. */
  readonly supplyControlPermille: number;
  /** Below this control an army cannot retreat into a region. */
  readonly retreatControlPermille: number;
  readonly seasons: readonly SeasonEffect[];
  readonly stores: StoresRules;
  readonly occupation: OccupationRules;
  /** The battle model (lane 1.3, the combat note): base rates, terms, frontage, morale, decisions, stragglers, the day shape. DESIGN PARAMETERS the pack states (0072). */
  readonly combat: CombatRules;
  readonly movement: MovementRules;
  readonly ruleSeats: RuleSeatRules;
  /** How long each route takes beside the map's courier days (0026, 0032). DESIGN PARAMETERS the pack states (0072). */
  readonly latency: LatencyRules;
  /**
   * One template per report type and subtype the kernel writes (0032: "each a pack-tunable template"): its usual
   * route, its cadence, and the pruning rule for knowledge (FOUNDATION section 8). DESIGN PARAMETERS the pack states (0072).
   */
  readonly reportTemplates: readonly ReportTemplate[];
  readonly standing: StandingRules;
  /** The people core's rules (lane 1.1): history's shadow, compliance, reading orders and reports, traits. DESIGN PARAMETERS the pack states (0072). */
  readonly people: PeopleRules;
  /** The planner (lane 1.2, 0062): thresholds, lane 0.9's fixes, the daily drafting cap and the scorer's weights. */
  readonly planner: PlannerRules;
  /** Goals and plans (lane 1.2): the goal terms an option's order carries, and how an edit's riskiness is read. */
  readonly plans: PlansRules;
  /** Governors raising regiments on a call (lane 1.7). */
  readonly recruitment: RecruitmentRules;
  /** The derived self-emancipation term (lane 1.7; 0046). */
  readonly selfEmancipation: SelfEmancipationRules;
}

export interface TerrainTerm {
  readonly id: string;
  readonly name: StringKey;
  /** A road edge's length is measured at the larger multiplier of its two ends. */
  readonly roadLengthPermille: number;
  /** Water terrains go on river and sea regions, land terrains on land and key points. */
  readonly water: boolean;
}

/** When a post of this kind may come into being (0040): only at a start, by an appointment, or by a directive. */
export const POST_CREATION = ['start_only', 'appoint', 'directive'] as const;
export type PostCreation = (typeof POST_CREATION)[number];

/**
 * What a post kind does in the chain that the engine reads (0058): a filter stands between the wire and its principal
 * and may hold or pass what comes in (0032); an intelligence post gathers and assesses what is known of the enemy.
 * The engine reads only the role, never the pack's kind names (hard rule 3).
 */
export const POST_KIND_ROLES = ['filter', 'intelligence'] as const;
export type PostKindRole = (typeof POST_KIND_ROLES)[number];

export interface PostKindTerm {
  readonly id: string;
  readonly name: StringKey;
  readonly creatable: PostCreation;
  /** A temporary post (an expedition command) dissolves when its operation ends (0040). */
  readonly temporary: boolean;
  /** Its role, if the engine reads one (0058); null for every other kind. */
  readonly role: PostKindRole | null;
}

export interface ArmTerm {
  readonly id: string;
  readonly name: StringKey;
  /** Naval blocks (ships) can carry other blocks aboard. */
  readonly naval: boolean;
}

export interface TraitTerm {
  readonly id: string;
  readonly name: StringKey;
  /** A fact the sensitive-history gate places (0021, 0046); never a lever. */
  readonly gate: boolean;
}

export interface RankTerm {
  readonly id: string;
  readonly name: StringKey;
  /** Higher is senior; promotion over a senior costs standing (FOUNDATION section 5). */
  readonly seniority: number;
  /** Its kind from the pack's ankKinds (a regular, a volunteer or a brevet rank): a person holds one rank of each kind at once (0073). */
  readonly kind: string;
}

export interface Term {
  readonly id: string;
  readonly name: StringKey;
}

/** A department kind. `government`: a civil government that can hold a region's jurisdiction (0058), which the engine reads instead of kind names. */
export interface DepartmentKindTerm {
  readonly id: string;
  readonly name: StringKey;
  readonly government: boolean;
  /**
   * A government of a people who govern themselves (0069). Only its own act, a situation's notice, may change its
   * side, close or reopen it, or move its regions; never a principal's decision (an option, inaction or a locked
   * cost). A region it holds moves only to another department of the same kind. The engine reads this, never kind names.
   */
  readonly selfGoverning: boolean;
}

export interface Vocabularies {
  readonly terrains: readonly TerrainTerm[];
  readonly postKinds: readonly PostKindTerm[];
  readonly departmentKinds: readonly DepartmentKindTerm[];
  readonly arms: readonly ArmTerm[];
  readonly personKinds: readonly Term[];
  readonly traits: readonly TraitTerm[];
  readonly ranks: readonly RankTerm[];
  /** Kinds of rank held side by side (0073). */
  readonly rankKinds: readonly Term[];
  /** Values people hold (lane 1.1, 0005): the engine reads only the pack's rules that name them. */
  readonly values: readonly Term[];
  readonly blocs: readonly Term[];
  readonly standingOrderKinds: readonly Term[];
}

export interface FactionRecord {
  readonly id: FactionId;
  readonly name: StringKey;
}

/**
 * An executive department (a war ministry, a navy ministry, a state's own
 * government). Posts belong to one; relay follows it, so a newer order from a
 * holder's own department supersedes his standing orders, and another
 * department's order does not (0040).
 *
 * A department with no faction is a neutral government (a border state's
 * during its neutrality, review F6): its posts and forces are a side of their
 * own, never under or over either faction's chain, and the regions it holds
 * are no one's in control. Choosing a side is a situation's work, not data.
 */
export interface DepartmentRecord {
  readonly id: DepartmentId;
  readonly faction: FactionId | null;
  readonly kind: string;
  /**
   * A generic id for the people whose government this is (0070): rival governments of one nation share it. Required
   * of a self-governing department, whose land passes only to a department of the same kind and the same polity.
   * Absent for every other department.
   */
  readonly polity?: string;
  readonly name: StringKey;
  readonly provenance: Provenance;
}

export interface World {
  readonly formatVersion: typeof WORLD_FORMAT_VERSION;
  /** The pack id (its folder name). */
  readonly pack: string;
  readonly rules: WorldRules;
  readonly vocabularies: Vocabularies;
  readonly factions: readonly FactionRecord[];
  readonly departments: readonly DepartmentRecord[];
  readonly regions: readonly RegionRecord[];
  readonly installations: readonly InstallationRecord[];
  readonly edges: readonly EdgeRecord[];
  readonly railLines: readonly RailLineRecord[];
  readonly depots: readonly DepotRecord[];
  readonly weatherZones: readonly WeatherZoneRecord[];
  readonly people: readonly PersonRecord[];
  /** Protected census input for the derived self-emancipation term (lane 1.7); empty until a source gives it. */
  readonly census: readonly CensusRecord[];
}
