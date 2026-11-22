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
import { isWellFormedId, type MessageId, type PersonId, type PostId, type RegionId } from '../ids.ts';
import type { PlanNote } from '../plans/notes.ts';
import type { PlanPaper } from './plan-paper.ts';

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

/**
 * What a claim is about. Values are integers in the claim's own unit (men, days, permille, or 0/1 flags).
 *
 * Lane 1.2 adds what a commander is told of the ground, so he plans on it (0062: every input about the enemy or the
 * ground comes from his view, works and obstructions included), and the claims of the plan cycle:
 * - `works`: the fortification in `claimRegion`, permille (0 reported as none);
 * - `obstruction`: a water edge, named in `claimToken` (an edge id from the World), closed to the author's side
 *   (`claimValue` 1) or reported clear (0); `claimRegion` is the region of the installation whose works close it, or
 *   null for works no installation holds (a boom, hulks);
 * - `plan-submitted`: the plan a commander chose for his goal, sent to its issuer: `claimToken` its method,
 *   `claimRegion` the objective, `claimValue` its score;
 * - `plan-answer`: his answer to an edit of his plan: `claimToken` the rung he declares, `claimRegion` the objective;
 * - `verb-answered` (lane 1.5): his answer to a people verb: `claimToken` `<verb>:<declared rung>`, `claimValue` 1 if he
 *   carried it out, 0 if he declined.
 *
 * Lane 1.4 adds the claims of operations and battles:
 * - `support-answer`: a holder's answer to a support request: `claimToken` the rung he declares, `claimRegion` the
 *   objective, `claimValue` 1 if he says he will move;
 * - `battle-phase`: a battle-day's phase as its author saw it: `claimToken` the phase (`dawn`...), `claimRegion` the
 *   battle's region, `claimValue` 1 when he says the day goes well, 0 when not;
 * - `casualties`: a side's killed and wounded, men (`claimToken` `own` or `enemy`);
 * - `missing`: a side's missing, men; a first return counts the captured here too (0074, 0076);
 * - `captured`: a side's captured, men, which a later return reveals;
 * - `pocket`: the author's force is cut off in `claimRegion` (a closed pocket, 0054);
 * - `operation`: an operation's stage (`claimToken`: `assaulting`, `repulsed`, `withdrew`, `pursuing`, `held`).
 *
 * Lane 1.6 adds the front page's claims (`politics/press.ts`):
 * - `battle-result`: a battle its side closed, as its public hears it: `claimToken` `won`, `lost` or `drawn`,
 *   `claimRegion` the battle's region, `claimValue` the side's killed, wounded and missing (the captured among them) as
 *   its principal's casualty returns give them by the printing day, never the battle record; `claimConfidence` 900 from
 *   full returns, 500 while a first return stands for a day, and 0 with no return yet (no figure printed); once every
 *   day's full return has come, a `captured` claim beside it gives the captured apart (never before: no early split);
 *   the public closing report sends the same result vocabulary to the side's editors, with no figures. Its
 *   `claimBattle`, `claimBattleDays` and `claimCommander` identify what was reported. Phase dispatches and returns
 *   carry the same battle identity, so the press never matches different battles by place alone;
 * - `framing`: who its public believes began the war, signed permille (positive: the other side).
 * - `control` (0094): `claimToken` is the faction and `claimValue` its share, permille. A report's control claims
 *   for a region are a complete snapshot; an omitted faction has no share in that snapshot.
 * - `control-government`: the named department governs the region, with value 1 for neutral and 0 for aligned.
 */
export const CLAIM_KINDS = [
  // An explicit received request to see the principal; never inferred from an objection.
  'audience-request',
  'appointment-refused',
  'service-choice',
  'arrived',
  'battle-phase',
  'battle-result',
  'call-answer',
  'captured',
  'casualties',
  // Lane 1.12: a post's commander lost in battle (token: killed, wounded or captured); the subject is the post.
  'commander-lost',
  'control',
  'control-government',
  'effective-strength',
  'enemy-strength',
  // Lane 1.12: a fort surrendered under bombardment (token: the record's terms, evacuated_under_terms, or captured).
  'fort-surrendered',
  'framing',
  'goal-status',
  'levy-lapsed',
  'missing',
  'obstruction',
  'operation',
  'order-objected',
  'order-obeyed',
  // Lane 1.12: a dispatch returned undelivered (token: vacant_post, or holder_changed); the subject is the post.
  'order-returned',
  'own-losses',
  'plan-answer',
  'plan-submitted',
  'pocket',
  'position',
  'present-and-absent',
  'present-for-duty',
  // Commitment accounts: token is the kind; value is the promised due day. The subject (or author of a reply) names the recipient.
  'promise-made',
  'promise-kept',
  'promise-broken',
  'support-answer',
  'verb-answered',
  'works',
] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];
export type AppointmentRefusal = 'post_held' | 'person_holds_post' | 'other_side' | 'not_serving' | 'undeclared_post';

/** One typed claim. `claimToken` is a closed word from the claim kind's vocabulary (e.g. `holding`), never prose. */
export interface ReportClaim {
  readonly claimKind: ClaimKind;
  readonly claimRegion: RegionId | null;
  readonly claimValue: number;
  readonly claimToken: string | null;
  /** The author's confidence, permille. */
  readonly claimConfidence: number;
  /** Battle identity as reported, preserved through returns, filters and the front page (R54). */
  readonly claimBattle?: string;
  /** The days covered by this claim: one in a return, all in the public closing report. */
  readonly claimBattleDays?: readonly number[];
  /** The commander the source names, not a lookup of today's holder. */
  readonly claimCommander?: PersonId | null;
}

/** A reason as the author states it: visible, typed, weighted. His true reasons are terms in `truth.ts`. */
export interface StatedReason {
  readonly reasonKind: string;
  readonly reasonWeight: number;
}

/** A commander's account of a returned mark; contains no private willingness or actual rung. */
export interface NoteAccount {
  readonly accountMark: PlanNote;
  readonly accountOutcome: 'followed' | 'declined' | 'own_judgement' | 'unavailable';
  readonly accountReasons: readonly StatedReason[];
}

/** The advice payload (0040): a recommended option, stated reasons, and a confidence. */
export interface AdviceBody {
  readonly adviceRecommends: string;
  readonly adviceReasons: readonly StatedReason[];
  readonly adviceConfidence: number;
}

/** What a report says. Shared by a message in transit and the report as a seat holds it. */
export interface ReportBody {
  /** Sealed plan enclosure; public projections expose only its OptionView, never the planner's private inputs. */
  readonly reportPlan?: PlanPaper;
  readonly reportNotes?: readonly NoteAccount[];
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
    if (c.claimKind === 'control' || c.claimKind === 'control-government') {
      if (c.claimRegion === null || c.claimToken === null || !isWellFormedId(c.claimToken)) problems.push(`claim ${c.claimKind}: needs a region and a ${c.claimKind === 'control' ? 'faction' : 'department'} token`);
      if (c.claimKind === 'control' && !isPermille(c.claimValue)) problems.push('claim control: share must be a permille');
      if (c.claimKind === 'control-government' && c.claimValue !== 0 && c.claimValue !== 1) problems.push('claim control-government: value must be 0 or 1');
    }
  }
  if (body.reportHour !== null && (!Number.isSafeInteger(body.reportHour) || body.reportHour < 0 || body.reportHour > 23)) problems.push('hour must be 0..23');
  return problems;
}

function isPermille(v: number): boolean {
  return Number.isSafeInteger(v) && v >= 0 && v <= 1000;
}
