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

/** The simple control contest and occupation (0064). DESIGN PARAMETERS the pack states. */
export interface ContestRules {
  /** Control a side alone in held ground gains a day at full strength, permille. */
  readonly occupyPermille: number;
  /** The men at which occupation reaches its full rate; fewer gain in proportion. */
  readonly occupyFullMen: number;
  /** Control the stronger side gains a day at an overwhelming margin, permille (times its margin). */
  readonly contestPermille: number;
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
  readonly contest: ContestRules;
  readonly movement: MovementRules;
  readonly ruleSeats: RuleSeatRules;
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
}
