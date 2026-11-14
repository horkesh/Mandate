/**
 * Reports are typed data (decision 0032, amended by 0040): an author, a
 * subject, claims with the author's confidence, a stamp, and (as the message
 * that carries it records) a route and the posts it passed. Never free text:
 * AI voice is written from these fields and never feeds back (0022).
 *
 * What a report *says* lives here and is visible to the seat that receives
 * it. Why it says it (the author's and each filter's bias terms, and what a
 * filter trimmed) lives in `truth.ts`, which the view layer never imports.
 *
 * Every record here is immutable once created: each is declared in
 * `IMMUTABLE_RECORDS` (`ownership.ts`), and its keys are prefixed so they stay
 * unique across all State records (decision 0044).
 */
import type { MessageId, PersonId, PostId, RegionId } from '../ids.ts';

/** The report types of 0032, plus advice (0040). Each is a pack-tunable template (`ReportTemplate`). */
export const REPORT_TYPES = [
  'advice',
  'casualty-return',
  'effective-strength',
  'enemy-estimate',
  'informal',
  'observer-letter',
  'press',
  'retrospective',
  'strength-return',
  'wire-dispatch',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

/**
 * The informal route is a family, not one template: the situations catalogue
 * routes 44 of its 60 situations through it (SITUATIONS-1861-62 section 2).
 * A cabinet member's word in person, a caller at the door, a governor's wire,
 * a legislator's visit, a railroad or transport man's wire, and news that
 * comes through the navy's own department.
 */
export const INFORMAL_SUBTYPES = ['cabinet-word', 'caller', 'governor-wire', 'legislator', 'navy-channel', 'railroad-man'] as const;
export type InformalSubtype = (typeof INFORMAL_SUBTYPES)[number];

/** Advice that was asked for (Consult, a staff line) or volunteered (a memorandum, 0040). */
export const ADVICE_SUBTYPES = ['memorandum', 'requested'] as const;
export type AdviceSubtype = (typeof ADVICE_SUBTYPES)[number];

export const SUBJECT_KINDS = ['enemy', 'order', 'person', 'post', 'region', 'situation'] as const;
export type SubjectKind = (typeof SUBJECT_KINDS)[number];

/** What a claim is about. Values are integers in the claim's own unit (men, days, or 0/1 flags). */
export const CLAIM_KINDS = [
  'arrived',
  'effective-strength',
  'enemy-strength',
  'goal-status',
  'order-objected',
  'order-obeyed',
  'own-losses',
  'position',
  'present-and-absent',
  'present-for-duty',
] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];

/** One typed claim. `claimToken` is a closed word from the claim kind's vocabulary (e.g. `holding`), never prose. */
export interface ReportClaim {
  readonly claimKind: ClaimKind;
  readonly claimRegion: RegionId | null;
  readonly claimValue: number;
  readonly claimToken: string | null;
  /** The author's confidence, permille. */
  readonly claimConfidence: number;
}

/** A reason as the author states it: visible, typed, weighted. His true reasons are terms in `truth.ts`. */
export interface StatedReason {
  readonly reasonKind: string;
  readonly reasonWeight: number;
}

/** The advice payload (0040): a recommended option, stated reasons, and a confidence. */
export interface AdviceBody {
  readonly adviceRecommends: string;
  readonly adviceReasons: readonly StatedReason[];
  readonly adviceConfidence: number;
}

/** What a report says. Shared by a message in transit and the report as a seat holds it. */
export interface ReportBody {
  readonly reportType: ReportType;
  /** Required for `informal` (an `InformalSubtype`) and `advice` (an `AdviceSubtype`); null otherwise. */
  readonly reportSubtype: string | null;
  readonly reportAuthor: PersonId;
  readonly reportAuthorPost: PostId | null;
  readonly reportSubjectKind: SubjectKind;
  readonly reportSubjectId: string;
  readonly reportClaims: readonly ReportClaim[];
  /** The stamp: the day written, and the hour on battle days (null otherwise). */
  readonly reportDay: number;
  readonly reportHour: number | null;
  readonly reportAdvice: AdviceBody | null;
  /** The order this report answers (an acknowledgement or an objection), if any. */
  readonly reportAnswers: MessageId | null;
}

/** The template key of a report: `type`, or `type/subtype`. */
export function templateKey(type: ReportType, subtype: string | null): string {
  return subtype === null ? type : `${type}/${subtype}`;
}

/** Problems with a report body's typing: unknown subtypes, missing advice, bad confidences. Empty when sound. */
export function reportProblems(body: ReportBody): string[] {
  const problems: string[] = [];
  const sub = body.reportSubtype;
  if (body.reportType === 'informal') {
    if (sub === null || !(INFORMAL_SUBTYPES as readonly string[]).includes(sub)) problems.push(`informal report needs a subtype from ${INFORMAL_SUBTYPES.join(', ')}`);
  } else if (body.reportType === 'advice') {
    if (sub === null || !(ADVICE_SUBTYPES as readonly string[]).includes(sub)) problems.push(`advice needs a subtype from ${ADVICE_SUBTYPES.join(', ')}`);
    if (body.reportAdvice === null) problems.push('advice needs a recommendation, reasons and a confidence');
  } else if (sub !== null) {
    problems.push(`${body.reportType} takes no subtype, got ${sub}`);
  }
  if (body.reportType !== 'advice' && body.reportAdvice !== null) problems.push('only advice carries an advice body');
  if (body.reportAdvice !== null && !isPermille(body.reportAdvice.adviceConfidence)) problems.push('advice confidence must be a permille');
  for (const c of body.reportClaims) {
    if (!isPermille(c.claimConfidence)) problems.push(`claim ${c.claimKind}: confidence must be a permille`);
    if (!Number.isSafeInteger(c.claimValue)) problems.push(`claim ${c.claimKind}: value must be an integer`);
  }
  if (body.reportHour !== null && (!Number.isSafeInteger(body.reportHour) || body.reportHour < 0 || body.reportHour > 23)) problems.push('hour must be 0..23');
  return problems;
}

function isPermille(v: number): boolean {
  return Number.isSafeInteger(v) && v >= 0 && v <= 1000;
}
