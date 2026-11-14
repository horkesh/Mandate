/**
 * Knowledge per seat (writer: `knowledge`; FOUNDATION section 8; decision 0015).
 *
 * Each seat stores the reports that reached it, when and by what route.
 * Beliefs are derived on read (`beliefs.ts`), never stored. Faded reports are
 * pruned by the templates' age and supersession rules, so knowledge stays
 * bounded however long the game runs. The truth behind each held report is
 * kept beside it in `State.reportTruth` and dropped when no seat holds it.
 */
import { strictCompare } from '../compare.ts';
import type { MessageId, PostId, SeatId } from '../ids.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { State } from '../root-state.ts';
import { templateKey, type ReportBody } from './report.ts';
import { templateFor, type ReportTemplate } from './templates.ts';
import type { ReportTruth } from './truth.ts';

/** A report as a seat holds it: what it says, and how and when it came. */
export interface KnownReport {
  /** The report's id (its first message's id). */
  readonly id: MessageId;
  readonly knownReceivedDay: number;
  readonly knownRoute: RouteKind;
  readonly knownVia: readonly PostId[];
  readonly knownBody: ReportBody;
}

export interface SeatKnowledge {
  /** In (received day, id) order. */
  readonly knownReports: readonly KnownReport[];
}

export const EMPTY_KNOWLEDGE: SeatKnowledge = Object.freeze({ knownReports: Object.freeze([]) });

/** What a seat holds. A seat with no entry holds nothing; an unknown seat id throws. */
export function knowledgeOf(state: State, seat: SeatId): SeatKnowledge {
  if (state.seatAssignments[seat] === undefined) throw new RangeError(`unknown seat id "${seat}"`);
  return state.knowledgeBySeat[seat] ?? EMPTY_KNOWLEDGE;
}

/** Store a delivered report in a seat's knowledge, and its truth beside it. */
export function deliverReport(state: State, seat: SeatId, report: KnownReport, truth: ReportTruth): State {
  const held = knowledgeOf(state, seat);
  if (held.knownReports.some((r) => r.id === report.id)) throw new RangeError(`seat ${seat} already holds report ${report.id}`);
  const knownReports = [...held.knownReports, report].sort((a, b) => a.knownReceivedDay - b.knownReceivedDay || strictCompare(a.id, b.id));
  return {
    ...state,
    knowledgeBySeat: { ...state.knowledgeBySeat, [seat]: { knownReports } },
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
export function pruneKnowledge(state: State, templates: readonly ReportTemplate[], day: number): { readonly state: State; readonly counts: PruneCounts } {
  let byAge = 0;
  let bySupersession = 0;
  let changed = false;
  const next: Record<SeatId, SeatKnowledge> = {};
  for (const seat of Object.keys(state.knowledgeBySeat).sort(strictCompare) as SeatId[]) {
    const held = state.knowledgeBySeat[seat]!;
    const newest = new Map<string, number>();
    for (const r of held.knownReports) {
      const k = supersessionKey(r.knownBody);
      newest.set(k, Math.max(newest.get(k) ?? -1, stampOrder(r)));
    }
    const kept = held.knownReports.filter((r) => {
      const tpl = templateFor(templates, r.knownBody.reportType, r.knownBody.reportSubtype);
      const age = day - r.knownBody.reportDay;
      if (age > tpl.maxAgeDays) {
        byAge++;
        return false;
      }
      if (stampOrder(r) < newest.get(supersessionKey(r.knownBody))! && age > tpl.keepSupersededDays) {
        bySupersession++;
        return false;
      }
      return true;
    });
    if (kept.length !== held.knownReports.length) changed = true;
    next[seat] = kept.length === held.knownReports.length ? held : { knownReports: kept };
  }
  if (!changed) return { state, counts: { byAge, bySupersession } };
  const live = new Set<string>();
  for (const k of Object.values(next)) for (const r of k.knownReports) live.add(r.id);
  const truth: Record<MessageId, ReportTruth> = {};
  for (const id of Object.keys(state.reportTruth).sort(strictCompare) as MessageId[]) if (live.has(id)) truth[id] = state.reportTruth[id]!;
  return { state: { ...state, knowledgeBySeat: next, reportTruth: truth }, counts: { byAge, bySupersession } };
}

/**
 * A report's place in time for supersession: its stamp day, then the day it
 * arrived (a report written the same day but received later is the newer copy).
 */
function stampOrder(r: KnownReport): number {
  return r.knownBody.reportDay * 100_000 + r.knownReceivedDay;
}
