/**
 * World format v2, people's historical records (FOUNDATION section 6;
 * decisions 0005, 0020, 0026, 0033).
 *
 * A real person's record is the centre that history's shadow draws true stats
 * around at setup, and each centre cites its evidence: the validator rejects a
 * centre without a citation, and research-note pointers never count. Stat
 * scales are not set yet, so a centre is a direction against peers in the same
 * kind of role; a permille centre can be added beside it without a format break.
 * Invented people (the officer pool) carry no citations.
 *
 * Which post a person holds, and his rank on a given day, are scenario and
 * State matters; the record keeps only what does not change in play.
 */
import type { DepartmentId, FactionId, PersonId } from '../ids.ts';
import type { Citation, Provenance, StringKey } from './graph.ts';

export const STAT_DIRECTIONS = ['high', 'above', 'average', 'below', 'low'] as const;
export type StatDirection = (typeof STAT_DIRECTIONS)[number];

/** The four centres FOUNDATION section 6 names: three true stats and public standing at the start. */
export const CENTRE_STATS = ['competence', 'nerve', 'experience', 'reputation'] as const;
export type CentreStat = (typeof CENTRE_STATS)[number];

/**
 * Temperament (lane 1.1): how bold a man likes action to be, and how truthfully he reports his own conduct. Each is a
 * centre like the stats, drawn at setup by history's shadow; compliance reads the drawn values (FOUNDATION section 6).
 */
export const TEMPERAMENT_STATS = ['boldness', 'candour'] as const;
export type TemperamentStat = (typeof TEMPERAMENT_STATS)[number];

/** A direction with its citations, or `direction: null` (unknown: no admissible evidence) with none. */
export interface StatCentre {
  readonly direction: StatDirection | null;
  readonly cites: readonly Citation[];
}

/** A trait from the pack's vocabulary, proved by a cited act (people draft, trait rule). */
export interface TraitEvidence {
  readonly trait: string;
  readonly cites: readonly Citation[];
}

/** A value from the pack's vocabulary that a person holds (lane 1.1, 0005), with the evidence for it. */
export interface ValueEvidence {
  readonly value: string;
  readonly cites: readonly Citation[];
}

/** A rank from the pack's vocabulary held from a date (ISO, or year-month or year when the day is unsourced). */
export interface RankHeld {
  readonly rank: string;
  readonly from: string;
}

export interface PersonRecord {
  readonly id: PersonId;
  readonly name: StringKey;
  /** An officer-pool person, checked against rosters so none is real; needs no citations. */
  readonly invented: boolean;
  /** The faction he serves at the pack's first start; null for foreigners and neutrals. */
  readonly faction: FactionId | null;
  /** A person kind from the pack's vocabulary (general, governor, editor...). */
  readonly kind: string;
  /** Historical dates: ISO, or year-month, or year; null when unknown. */
  readonly born: string | null;
  readonly died: string | null;
  readonly centres: Readonly<Record<CentreStat, StatCentre>>;
  /** Boldness and candour, each a cited centre (lane 1.1). */
  readonly temperament: Readonly<Record<TemperamentStat, StatCentre>>;
  /** The values he holds, an unordered set from the pack's vocabulary, each cited (lane 1.1); empty when none is known. */
  readonly values: readonly ValueEvidence[];
  /**
   * His regard for his own faction's principal at the pack's first start, a cited centre mapped to signed permille by
   * the pack's rule (`WorldRules.people.regardPermille`). Regard between people starts at none and moves in play.
   */
  readonly regard: StatCentre;
  /**
   * His regard for other people at the pack's first start (lane 1.5: rivals, partners), each a cited direction mapped by
   * the same pack rule as regard for the principal. Anyone not listed starts at the pack's regard for the unknown.
   */
  readonly regardOthers: readonly { readonly toward: PersonId; readonly direction: StatDirection; readonly cites: readonly Citation[] }[];
  /**
   * His own standing practices (lane 1.5b), each cited: conduct of his own that an order of the map can run against (a
   * row's `clashes`), such as a commander's practice toward fugitives (SENSITIVE-HISTORY 3.2). Gate content.
   */
  readonly practices: readonly { readonly practice: string; readonly cites: readonly Citation[] }[];
  readonly traits: readonly TraitEvidence[];
  /** A bloc from the pack's vocabulary, or null. */
  readonly bloc: string | null;
  /** Optional service choice. Government is an authored allegiance, never inferred from birthplace by the kernel. */
  readonly service?: {
    readonly government: DepartmentId | null;
    readonly toFaction: FactionId;
    readonly toBloc: string | null;
    /** Register's effective resignation date; null when no voluntary departure is established. */
    readonly historicalOn: string | null;
    readonly cites: readonly Citation[];
  };
  /** Ranks in date order; the rank at a start is the last one on or before its date. */
  readonly ranks: readonly RankHeld[];
  /** Fields whose null means "unknown, needs a source" rather than "none". */
  readonly unknowns: readonly string[];
  readonly provenance: Provenance;
}
