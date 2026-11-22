/**
 * Report templates (decision 0032: "each a pack-tunable template"). A template
 * sets a report type's usual route, how often it is written when it has a
 * cadence, and the pruning rule for knowledge (FOUNDATION section 8: faded
 * reports are pruned by age and supersession, so knowledge cannot grow
 * without limit).
 *
 * Every pack states its templates (`WorldRules.reportTemplates`), one for
 * each report type and subtype the kernel writes, and the kernel has no
 * default (0064's rule, applied by 0072). Delays come from the route and the
 * map (`messages/latency.ts`), never from the template.
 */
import { ROUTE_KINDS, type RouteKind } from '../messages/latency.ts';
import { ADVICE_SUBTYPES, INFORMAL_SUBTYPES, REPORT_TYPES, templateKey, type ReportType } from './report.ts';

export interface ReportTemplate {
  /** An uncandid reauthor with a listed value may omit who originated a received paper. Absence preserves attribution. */
  readonly templateDisclosure?: { readonly candidAt: number; readonly concealFor: readonly string[] };
  readonly templateType: ReportType;
  readonly templateSubtype: string | null;
  /** The usual route; an author off the wire falls back to courier (`messages/latency.ts`). */
  readonly templateRoute: RouteKind;
  /** Every this many days, for reports written on a cycle; 0 for reports written on an event. */
  readonly cadenceDays: number;
  /** A held report older than this is pruned. */
  readonly maxAgeDays: number;
  /**
   * A report superseded by a newer one with the same supersession key
   * (template, author, subject) is pruned once it is this many days old.
   */
  readonly keepSupersededDays: number;
}

/** The subtypes a report type has: informal and advice are families (`report.ts`); every other type has none (null). */
const SUBTYPES: Readonly<Partial<Record<ReportType, readonly string[]>>> = { informal: INFORMAL_SUBTYPES, advice: ADVICE_SUBTYPES };

/** Every report type and subtype the kernel writes, each of which needs one template, in key order. */
export const REPORT_KINDS: readonly { readonly type: ReportType; readonly subtype: string | null }[] = Object.freeze(
  REPORT_TYPES.flatMap((type) => (SUBTYPES[type] ?? [null]).map((subtype) => ({ type, subtype }))).sort((a, b) => (templateKey(a.type, a.subtype) < templateKey(b.type, b.subtype) ? -1 : 1)),
);

/** The template for a report type and subtype. Throws if the pack has none: a report never falls back to a default silently. */
export function templateFor(templates: readonly ReportTemplate[], type: ReportType, subtype: string | null): ReportTemplate {
  const found = templates.find((x) => x.templateType === type && x.templateSubtype === subtype);
  if (!found) throw new RangeError(`no report template for ${templateKey(type, subtype)}`);
  return found;
}

/**
 * The longest a template may keep a report, in days: a whole campaign (about
 * 1,460 days) with a margin. Without a ceiling a pack typo (100000) would make
 * knowledge effectively unbounded (review N4).
 */
export const MAX_REPORT_AGE_DAYS = 1500;

/**
 * Problems with a template table: a report kind with no template, a template for a kind the kernel does not write,
 * an unknown route, duplicates, negative or zero ages, ages past the ceiling. Empty when sound.
 */
export function templateProblems(templates: readonly ReportTemplate[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const kinds = new Set(REPORT_KINDS.map((k) => templateKey(k.type, k.subtype)));
  for (const x of templates) {
    const key = templateKey(x.templateType, x.templateSubtype);
    if (seen.has(key)) problems.push(`template ${key} appears twice`);
    seen.add(key);
    if (!kinds.has(key)) problems.push(`template ${key} is for no report type and subtype the kernel writes`);
    if (!(ROUTE_KINDS as readonly string[]).includes(x.templateRoute)) problems.push(`template ${key}: route ${x.templateRoute} is not a route`);
    if (x.templateDisclosure !== undefined && (!Number.isSafeInteger(x.templateDisclosure.candidAt) || x.templateDisclosure.candidAt < 0 || x.templateDisclosure.candidAt > 1000)) problems.push(`template ${key}: disclosure candidAt must be a permille`);
    for (const [name, v] of [['cadenceDays', x.cadenceDays], ['maxAgeDays', x.maxAgeDays], ['keepSupersededDays', x.keepSupersededDays]] as const) {
      if (!Number.isSafeInteger(v) || v < 0) problems.push(`template ${key}: ${name} must be a whole number of days`);
    }
    if (x.maxAgeDays < 1) problems.push(`template ${key}: maxAgeDays must be at least 1, or knowledge would hold nothing`);
    if (x.maxAgeDays > MAX_REPORT_AGE_DAYS) problems.push(`template ${key}: maxAgeDays must be at most ${MAX_REPORT_AGE_DAYS}, or knowledge would never fade`);
    if (x.keepSupersededDays > x.maxAgeDays) problems.push(`template ${key}: keepSupersededDays must not exceed maxAgeDays`);
  }
  for (const key of kinds) if (!seen.has(key)) problems.push(`report ${key} has no template: the pack states one for every report type and subtype`);
  return problems;
}
