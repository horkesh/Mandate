/**
 * Report templates (decision 0032: "each a pack-tunable template"). A template
 * sets a report type's usual route, how often it is written when it has a
 * cadence, and the pruning rule for knowledge (FOUNDATION section 8: faded
 * reports are pruned by age and supersession, so knowledge cannot grow
 * without limit).
 *
 * The values are defaults a pack overrides; delays come from the route and
 * the map (`messages/latency.ts`), never from the template.
 */
import type { RouteKind } from '../messages/latency.ts';
import { templateKey, type ReportType } from './report.ts';

export interface ReportTemplate {
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

const t = (type: ReportType, subtype: string | null, route: RouteKind, cadenceDays: number, maxAgeDays: number, keepSupersededDays: number): ReportTemplate =>
  Object.freeze({ templateType: type, templateSubtype: subtype, templateRoute: route, cadenceDays, maxAgeDays, keepSupersededDays });

/** Defaults, from the information-flows note's table (docs/research/2026-11-14-union-information-flows.md, Design implications). */
export const DEFAULT_REPORT_TEMPLATES: readonly ReportTemplate[] = Object.freeze([
  t('wire-dispatch', null, 'wire', 2, 30, 3),
  t('strength-return', null, 'mail', 10, 60, 10),
  t('effective-strength', null, 'wire', 0, 30, 3),
  t('casualty-return', null, 'courier', 0, 90, 30),
  t('enemy-estimate', null, 'in-person', 1, 14, 0),
  t('press', null, 'mail', 0, 21, 3),
  t('informal', 'cabinet-word', 'in-person', 7, 21, 7),
  t('informal', 'caller', 'in-person', 0, 21, 7),
  t('informal', 'governor-wire', 'wire', 0, 21, 7),
  t('informal', 'legislator', 'in-person', 0, 21, 7),
  t('informal', 'navy-channel', 'wire', 0, 21, 7),
  t('informal', 'railroad-man', 'wire', 0, 21, 7),
  t('observer-letter', null, 'courier', 0, 60, 14),
  t('retrospective', null, 'mail', 0, 400, 400),
  t('advice', 'requested', 'in-person', 0, 60, 30),
  t('advice', 'memorandum', 'courier', 0, 60, 30),
]);

/** The template for a report type and subtype. Throws if the pack has none: a report never falls back to a default silently. */
export function templateFor(templates: readonly ReportTemplate[], type: ReportType, subtype: string | null): ReportTemplate {
  const found = templates.find((x) => x.templateType === type && x.templateSubtype === subtype);
  if (!found) throw new RangeError(`no report template for ${templateKey(type, subtype)}`);
  return found;
}

/** Problems with a template table: duplicates, negative or zero ages. Empty when sound. */
export function templateProblems(templates: readonly ReportTemplate[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const x of templates) {
    const key = templateKey(x.templateType, x.templateSubtype);
    if (seen.has(key)) problems.push(`template ${key} appears twice`);
    seen.add(key);
    for (const [name, v] of [['cadenceDays', x.cadenceDays], ['maxAgeDays', x.maxAgeDays], ['keepSupersededDays', x.keepSupersededDays]] as const) {
      if (!Number.isSafeInteger(v) || v < 0) problems.push(`template ${key}: ${name} must be a whole number of days`);
    }
    if (x.maxAgeDays < 1) problems.push(`template ${key}: maxAgeDays must be at least 1, or knowledge would hold nothing`);
  }
  return problems;
}
