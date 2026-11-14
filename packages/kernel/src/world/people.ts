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
import type { FactionId, PersonId } from '../ids.ts';
import type { Citation, Provenance, StringKey } from './graph.ts';

export const STAT_DIRECTIONS = ['high', 'above', 'average', 'below', 'low'] as const;
export type StatDirection = (typeof STAT_DIRECTIONS)[number];

/** The four centres FOUNDATION section 6 names: three true stats and public standing at the start. */
export const CENTRE_STATS = ['competence', 'nerve', 'experience', 'reputation'] as const;
export type CentreStat = (typeof CENTRE_STATS)[number];

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
  readonly traits: readonly TraitEvidence[];
  /** A bloc from the pack's vocabulary, or null. */
  readonly bloc: string | null;
  /** Ranks in date order; the rank at a start is the last one on or before its date. */
  readonly ranks: readonly RankHeld[];
  /** Fields whose null means "unknown, needs a source" rather than "none". */
  readonly unknowns: readonly string[];
  readonly provenance: Provenance;
}
