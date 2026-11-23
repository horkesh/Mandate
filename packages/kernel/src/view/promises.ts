/** Commitment terms and settlements from own acts or received correspondence; no private people State. */
import { strictCompare } from '../compare.ts';
import type { PersonId } from '../ids.ts';
import type { PromiseView, ReportView } from './types.ts';

export function promiseProjection(person: PersonId, day: number, reports: readonly ReportView[]): readonly PromiseView[] {
  const received = reports.filter(r => r.day <= day && r.receivedDay <= day);
  const out: PromiseView[] = [];
  for (const r of received) for (const c of r.claims) {
    if (c.kind !== 'promise-made' || c.token === null) continue;
    const recipient = r.subjectKind === 'person' && r.author === person ? r.subjectId as PersonId : r.author;
    const settlement = received.flatMap(s => s.claims.filter(a =>
      (a.kind === 'promise-kept' || a.kind === 'promise-broken') && a.token === c.token && a.value === c.value
      && s.author === recipient && s.day >= r.day).map(a => ({ report: s, status: a.kind === 'promise-kept' ? 'kept' as const : 'expired' as const })))
      .sort((a, b) => a.report.day - b.report.day || strictCompare(a.report.id, b.report.id))[0];
    out.push(Object.freeze({ person: recipient, kind: c.token, day: r.day, dueDay: c.value, source: r.id,
      status: settlement?.status ?? 'pending', settledDay: settlement?.report.day ?? null, settlement: settlement?.report.id ?? null }));
  }
  return Object.freeze(out.sort((a, b) => a.day - b.day || strictCompare(a.source, b.source)));
}
