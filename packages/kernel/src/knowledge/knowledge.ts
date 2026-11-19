/**
 * Knowledge per seat (writer: `knowledge`; FOUNDATION section 8; decision 0015).
 *
 * Each seat stores the reports that reached it, when and by what route.
 * Beliefs are derived on read (`beliefs.ts`), never stored. Faded reports are
 * pruned by the templates' age and supersession rules. The map keeps bounded
 * excerpts of expired reports for its dated marks. The truth behind each
 * held report is kept beside it and dropped when no seat holds it.
 */
import { strictCompare } from '../compare.ts';
import type { MessageId, SeatId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { controlEvidence } from './control-beliefs.ts';
import type { KnownReport } from './records.ts';
import { templateKey, type ReportBody, type ReportClaim } from './report.ts';
import { templateFor, type ReportTemplate } from './templates.ts';
import type { ReportTruth } from './truth.ts';

export type { KnownReport } from './records.ts';

export interface SeatKnowledge {
  /** In (received day, id) order. */
  readonly knownReports: readonly KnownReport[];
  /** Control excerpts of expired reports still supporting the map, in the same order. */
  readonly knownControlReports?: readonly KnownReport[];
  /** A shared day-zero bulletin. Its body lives in the opening report table. */
  readonly knownOpeningControl?: MessageId;
}

export const EMPTY_KNOWLEDGE: SeatKnowledge = Object.freeze({ knownReports: Object.freeze([]) });

function storedKnowledgeOf(state: State, seat: SeatId): SeatKnowledge {
  if (state.seatAssignments[seat] === undefined) throw new RangeError(`unknown seat id "${seat}"`);
  return state.knowledgeBySeat[seat] ?? EMPTY_KNOWLEDGE;
}

function openingReportOf(state: State, id: MessageId): KnownReport {
  const report = state.openingControlReports?.[id];
  if (report === undefined) throw new RangeError(`missing opening control report ${id}`);
  return state.openingControlClaims === undefined ? report : { ...report, knownBody: { ...report.knownBody, reportClaims: state.openingControlClaims } };
}

export type KnowledgeCache = WeakMap<SeatKnowledge, { readonly opening: KnownReport; readonly claims: readonly ReportClaim[] | undefined; readonly knowledge: SeatKnowledge }>;

/** What the seat holds, resolving its opening bulletin for the map without copying it into saved knowledge. */
export function knowledgeOf(state: State, seat: SeatId, cache?: KnowledgeCache): SeatKnowledge {
  const held = storedKnowledgeOf(state, seat);
  if (held.knownOpeningControl === undefined) return held;
  const stored = state.openingControlReports?.[held.knownOpeningControl];
  const previous = cache?.get(held);
  if (previous !== undefined && previous.opening === stored && previous.claims === state.openingControlClaims) return previous.knowledge;
  const opening = openingReportOf(state, held.knownOpeningControl);
  const knowledge = { ...held, knownControlReports: [{ ...opening, knownPublicOpening: true as const }, ...(held.knownControlReports ?? [])] };
  cache?.set(held, { opening: stored!, claims: state.openingControlClaims, knowledge });
  return knowledge;
}

/** Give each seat its opening bulletin by reference and store each original report and its truth once. */
export function fileOpeningReports(state: State, copies: ReadonlyMap<SeatId, KnownReport>, claims: readonly ReportClaim[]): State {
  const knowledge = new Map<SeatId, SeatKnowledge>();
  const reports = new Map<MessageId, KnownReport>();
  for (const [seat, report] of copies) {
    knowledge.set(seat, { ...storedKnowledgeOf(state, seat), knownOpeningControl: report.id });
    reports.set(report.id, { ...report, knownBody: { ...report.knownBody, reportClaims: [] } });
  }
  return {
    ...state,
    knowledgeBySeat: { ...state.knowledgeBySeat, ...Object.fromEntries(knowledge) },
    openingControlReports: Object.fromEntries(reports),
    openingControlClaims: claims,
    reportTruth: { ...state.reportTruth, ...Object.fromEntries([...reports.keys()].map((id) => [id, { truthTerms: [], truthTrimmed: [], truthOpeningClaims: true as const }])) },
  };
}

function reportOrder(a: KnownReport, b: KnownReport): number {
  return a.knownReceivedDay - b.knownReceivedDay || strictCompare(a.id, b.id);
}

/** Reports and map excerpts that a seat may read, in (received day, id) order. */
export function reportsForView(knowledge: SeatKnowledge): readonly KnownReport[] {
  const archived = knowledge.knownControlReports;
  return archived === undefined ? knowledge.knownReports : [...knowledge.knownReports, ...archived].sort(reportOrder);
}

/** Store a delivered report in a seat's knowledge, and its truth beside it. */
export function deliverReport(state: State, seat: SeatId, report: KnownReport, truth: ReportTruth): State {
  const held = storedKnowledgeOf(state, seat);
  if (held.knownOpeningControl === report.id || held.knownReports.some((r) => r.id === report.id) || held.knownControlReports?.some((r) => r.id === report.id)) {
    throw new RangeError(`seat ${seat} already holds report ${report.id}`);
  }
  const knownReports = [...held.knownReports, report].sort(reportOrder);
  return {
    ...state,
    knowledgeBySeat: { ...state.knowledgeBySeat, [seat]: { ...held, knownReports } },
    reportTruth: state.reportTruth[report.id] === undefined ? { ...state.reportTruth, [report.id]: truth } : state.reportTruth,
  };
}

/**
 * The supersession key: a newer report with the same template, author and
 * subject replaces an older one. A report answering an order is about that
 * order, so it is superseded only by a later answer to the same order, never
 * by the author's routine reports.
 */
export function supersessionKey(body: ReportBody): string {
  return `${templateKey(body.reportType, body.reportSubtype)}|${body.reportAuthor}|${body.reportSubjectKind}:${body.reportSubjectId}|${body.reportAnswers ?? ''}`;
}

export interface PruneCounts {
  readonly byAge: number;
  readonly bySupersession: number;
}

/**
 * Drop reports older than their template's `maxAgeDays`, and reports
 * superseded by a newer one with the same key once older than
 * `keepSupersededDays`. Age runs from the report's stamp, not its arrival:
 * a stale report is stale however late it came. Truth no seat holds is dropped.
 */
export function pruneKnowledge(state: State, templates: readonly ReportTemplate[], day: number, controlThreshold: number): { readonly state: State; readonly counts: PruneCounts } {
  let byAge = 0;
  let bySupersession = 0;
  let changed = false;
  const next: Record<SeatId, SeatKnowledge> = {};
  for (const seat of Object.keys(state.knowledgeBySeat).sort(strictCompare) as SeatId[]) {
    const held = state.knowledgeBySeat[seat]!;
    if (held.knownReports.length === 0) {
      next[seat] = held;
      continue;
    }
    const newest = new Map<string, number>();
    for (const r of held.knownReports) {
      const k = supersessionKey(r.knownBody);
      newest.set(k, Math.max(newest.get(k) ?? -1, stampOrder(r)));
    }
    const expiredControl: KnownReport[] = [];
    const kept = held.knownReports.filter((r) => {
      const tpl = templateFor(templates, r.knownBody.reportType, r.knownBody.reportSubtype);
      const age = day - r.knownBody.reportDay;
      const aged = age > tpl.maxAgeDays;
      const superseded = age > tpl.keepSupersededDays && stampOrder(r) < newest.get(supersessionKey(r.knownBody))!;
      if (!aged && !superseded) return true;
      const claims = r.knownBody.reportClaims.filter(isControlClaim);
      if (claims.length > 0) {
        const body = r.knownBody;
        expiredControl.push(claims.length === body.reportClaims.length && body.reportAdvice === null
          ? r
          : { ...r, knownBody: { ...body, reportClaims: claims, reportAdvice: null } });
      }
      if (aged) byAge++;
      else bySupersession++;
      return false;
    });
    if (kept.length === held.knownReports.length) {
      next[seat] = held;
      continue;
    }
    changed = true;
    let archive = held.knownControlReports;
    if (expiredControl.length > 0) {
      const candidates = [...(archive ?? []), ...expiredControl];
      const opening = held.knownOpeningControl === undefined ? [] : [openingReportOf(state, held.knownOpeningControl)];
      const sources = retainedControlSources([...opening, ...kept, ...candidates], controlThreshold);
      archive = candidates.filter((r) => sources.has(r.id)).sort(reportOrder);
    }
    next[seat] = {
      knownReports: kept,
      ...(archive === undefined || archive.length === 0 ? {} : { knownControlReports: archive }),
      ...(held.knownOpeningControl === undefined ? {} : { knownOpeningControl: held.knownOpeningControl }),
    };
  }
  if (!changed) return { state, counts: { byAge, bySupersession } };
  const live = new Set<string>();
  for (const k of Object.values(next)) {
    if (k.knownOpeningControl !== undefined) live.add(k.knownOpeningControl);
    for (const r of k.knownReports) live.add(r.id);
    for (const r of k.knownControlReports ?? []) live.add(r.id);
  }
  const truth: Record<MessageId, ReportTruth> = {};
  for (const id of Object.keys(state.reportTruth).sort(strictCompare) as MessageId[]) if (live.has(id)) truth[id] = state.reportTruth[id]!;
  return { state: { ...state, knowledgeBySeat: next, reportTruth: truth }, counts: { byAge, bySupersession } };
}

function isControlClaim(claim: ReportClaim): boolean {
  return claim.claimKind === 'control' || claim.claimKind === 'control-government';
}

/** Keep the map's evidence when its marks fade. At most four reports per region survive normal pruning this way. */
function retainedControlSources(reports: readonly KnownReport[], threshold: number): ReadonlySet<MessageId> {
  const retained = new Set<MessageId>();
  for (const { latest, corroboration, precedingChange, government } of controlEvidence(reports, threshold).values()) {
    retained.add(latest.report.id);
    if (corroboration !== undefined) retained.add(corroboration.id);
    if (precedingChange !== undefined) retained.add(precedingChange.id);
    if (government !== undefined) retained.add(government.report.id);
  }
  return retained;
}

/**
 * A report's place in time for supersession: its stamp day, then the day it
 * arrived (a report written the same day but received later is the newer copy).
 */
function stampOrder(r: KnownReport): number {
  return r.knownBody.reportDay * 100_000 + r.knownReceivedDay;
}
