/**
 * The truth layer of a report (FOUNDATION section 8; hard rule 6).
 *
 * A report's claims are what its author says. These are the terms that
 * explain why he says it: the intelligence source's bias, his own perception
 * of the enemy, the strength category he chose, what a filter held or cut.
 * They are explainable to the kernel, the tests and the reckoning, and never
 * to a seat: the view layer (`seat-api.ts` and `view/types.ts`) cannot import
 * this file, and `test/boundary.test.ts` proves it.
 */
import type { PersonId, PostId, RegionId } from '../ids.ts';
import type { ReportClaim } from './report.ts';

export const BIAS_TERM_KINDS = [
  /** The raw value observed (an enemy strength seen by scouts, a strength on the rolls). */
  'observed',
  /** The intelligence source's multiplier on what it reports (0032's enemy estimate; planner-design finding 6). */
  'intelligence_bias',
  /** A reader's own multiplier on enemy strength, applied in belief derivation (planner-design finding 3). */
  'perception_bias',
  /** A value taken from another report the author holds (his belief, with its own terms carried below it). */
  'reported',
  /** The commander quotes a smaller "effective" figure because he wants men (0032). */
  'wants_men',
  /** The paper army: present and absent against present for duty (0032). */
  'paper_strength',
  /** A filter post held the report for days. */
  'filter_hold',
  /** A filter post cut a claim. */
  'filter_trim',
  /** A relaying holder held an order for days, and why. */
  'relay_hold',
  /** A relaying holder objected to an order, and why. */
  'relay_objection',
  /** One term of a relaying holder's willingness to an order (its rule names the term: values, temperament, regard...), lane 1.1. */
  'relay_term',
  /** How far an arrow edit departs from his own best plan, permille (his scorer: lane 1.2). */
  'edit_distance',
  // Lane 1.7: a governor's answer to a call (his rung and willingness), and his region's loyalty scaling what he raised.
  'call_rung',
  'call_loyalty',
  'levy_lapsed',
] as const;
export type BiasTermKind = (typeof BIAS_TERM_KINDS)[number];

/** One explainable term: what kind, whose, about where, and its integer value (men, permille or days by kind). */
export interface BiasTerm {
  readonly termKind: BiasTermKind;
  readonly termPerson: PersonId | null;
  readonly termPost: PostId | null;
  readonly termRegion: RegionId | null;
  readonly termValue: number;
  /** A closed word saying which rule produced the term (`regard`, `caution`, `values:order`), or null. */
  readonly termRule: string | null;
}

/** The truth behind one report: every term, and the claims filters cut from it. */
export interface ReportTruth {
  readonly truthTerms: readonly BiasTerm[];
  readonly truthTrimmed: readonly ReportClaim[];
}

export const NO_TRUTH: ReportTruth = Object.freeze({ truthTerms: Object.freeze([]), truthTrimmed: Object.freeze([]) });

export function term(kind: BiasTermKind, value: number, at: { person?: PersonId; post?: PostId; region?: RegionId; rule?: string } = {}): BiasTerm {
  return {
    termKind: kind,
    termPerson: at.person ?? null,
    termPost: at.post ?? null,
    termRegion: at.region ?? null,
    termValue: value,
    termRule: at.rule ?? null,
  };
}
