/** Named-act coverage, supplied entirely by the pack (0111/0112). No simulation writes. */
import type { PushbackRegister, PushbackRow } from '@mandate/pack-format';
import { world as w } from '@mandate/kernel';

export interface CoverageAct {
  readonly id: string;
  readonly order: string;
  readonly side: string | null;
  readonly actor: string;
  readonly role: string;
  readonly kind: string;
  readonly actual: string;
  readonly declared: string;
  readonly day: number;
  /** Stable identity of an actor's act, including a send-back note when present. */
  readonly creditKey?: string;
  readonly callId?: string | null;
  readonly regiments?: number | null;
  readonly termDays?: number | null;
  readonly subject?: string;
  readonly objective?: string;
  readonly posture?: string;
  readonly post?: string;
  readonly to?: string;
  readonly advice?: string;
  readonly undertaking?: { readonly undertakingKind: string; readonly undertakingRequest: string | null; readonly clauses: readonly string[] } | null;
  readonly declaredUndertaking?: CoverageAct['undertaking'];
  readonly reservations?: readonly { readonly clause: string; readonly subject: string; readonly effect: string; readonly grounds?: { readonly groundKind: string; readonly groundFact?: string } }[];
  readonly declaredReservations?: CoverageAct['reservations'];
  readonly reservationGaps?: readonly { readonly clause: string; readonly subject: string; readonly effect: string; readonly mechanism: string }[];
  readonly declaredReservationGaps?: CoverageAct['reservationGaps'];
}
export type CoverageVerdict = 'matched' | 'mismatch' | 'exposure_mismatch' | 'not_observed' | 'unresolved' | 'representation_gap';
export interface CoverageResult {
  readonly id: string;
  readonly side: string;
  readonly actor: string;
  readonly role: string;
  readonly band: string;
  readonly matter: string;
  readonly cite: string;
  readonly verdict: CoverageVerdict;
  readonly reason: string;
  readonly candidates: readonly string[];
  readonly matched: string | null;
  readonly gap?: PushbackRow['gap'];
}
const cmp = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
const dayOf = (start: string, date: string) => w.daysFromCivil(w.parseIsoDate(date)) - w.daysFromCivil(w.parseIsoDate(start));
const MATTER_KEYS = ['kind', 'callId', 'regiments', 'termDays', 'subject', 'objective', 'posture', 'post', 'to'] as const;

export function coverageScore(registers: readonly PushbackRegister[], acts: readonly CoverageAct[], startDate: string, lastDay: number, daily: readonly { readonly day: number; readonly fires: Readonly<Record<string, number>> }[] = []) {
  const rows: CoverageResult[] = [];
  const used = new Set<string>();
  const seen = new Set<string>();
  const diagnostics = acts.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; }).sort((a, b) => a.day - b.day || cmp(a.id, b.id));
  for (const register of registers) {
    const through = dayOf(startDate, register.through);
    for (const row of register.rows) {
      if (row.status !== 'eligible') continue;
      const base = { id: row.id, side: row.side, actor: row.actor, role: row.role, band: row.band, matter: row.matter, cite: row.cite };
      const add = (verdict: CoverageVerdict, reason: string, candidates: readonly CoverageAct[] = [], matched: string | null = null) => rows.push({ ...base, verdict, reason, candidates: candidates.map(a => a.id), matched, ...(row.gap === undefined ? {} : { gap: row.gap }) });
      if (row.gap !== undefined) { add('representation_gap', `${row.gap.reason}; needed: ${row.gap.mechanism} in ${row.gap.location}`); continue; }
      const m = row.match;
      if (m === undefined) { add('unresolved', 'No matcher or representation mechanism was supplied.'); continue; }
      if (row.band === 'reservations' && m.qualification === undefined) {
        add('unresolved', 'The register lacks subject and compatible-effect requirements; a rung alone supplies no qualification credit.');
        continue;
      }
      if (m.qualification !== undefined && m.qualification.every(q => q.effects.every(e => e === 'gate' || e === 'offer'))) {
        add('representation_gap', `Qualification requires ${m.qualification.flatMap(q => q.effects.map(e => `${q.subject}/${e}`)).join(', ')}; needed: acceptance, consent or prerequisite execution in the recruitment, transfer, enlistment or operation owner. Recording a reservation does not execute it.`);
        continue;
      }
      const nearby = diagnostics.filter(a => a.day <= through && a.actor === row.actor && a.role === row.role && a.kind === m.kind && (a.side === row.side || a.side === null));
      const candidates = nearby.filter(a => a.side === row.side && MATTER_KEYS.every(k => m[k] === undefined || a[k] === m[k]));
      const incomplete = nearby.some(a => a.side === null || MATTER_KEYS.some(k => m[k] !== undefined && a[k] === undefined));
      if (candidates.length === 0) {
        if (lastDay < through || incomplete) add('unresolved', lastDay < through ? 'The observation window ended before the register horizon.' : 'The response lacks issuing-side or typed matter evidence; no identity inferred from its message ID.', nearby);
        else if (nearby.length > 0) add('exposure_mismatch', 'Same actor and role, but the observed requests address different matters. The represented historical request was not issued.', nearby);
        else add('not_observed', 'No act observed for this actor, role and represented matter.');
        continue;
      }
      const qualificationMatches = (a: CoverageAct) => m.qualification === undefined || (
        a.undertaking != null && a.undertaking.undertakingRequest === a.order &&
        (a.reservations ?? []).some(r => a.undertaking!.clauses.includes(r.clause) && m.qualification!.some(q => q.subject === r.subject && q.effects.includes(r.effect as 'statement' | 'request' | 'gate' | 'offer') &&
          (q.groundKind === undefined || r.grounds?.groundKind === q.groundKind) && (q.groundFact === undefined || r.grounds?.groundFact === q.groundFact)))
      );
      const eligible = candidates.filter(a => (m.actual === undefined || a.actual === m.actual) && (m.advice === undefined || a.advice === m.advice) && qualificationMatches(a));
      const identity = (a: CoverageAct) => a.creditKey ?? `${a.order}|${a.actor}|${a.role}`;
      const available = eligible.find(a => !used.has(identity(a)));
      if (available !== undefined) { used.add(identity(available)); add('matched', 'One act on the same issuing side, actor, role and bounded matter; nearest-type interpretation follows the accepted register.', candidates, available.id); }
      else if (eligible.length > 0) add('unresolved', 'Every qualifying act has already covered another row; credit cannot be reused.', candidates);
      else if (m.advice !== undefined && candidates.some(a => a.advice === undefined)) add('unresolved', 'Consultation participation is recorded, but matching advice content is missing.', candidates);
      else if (m.qualification !== undefined && candidates.some(a => a.undertaking === undefined || a.reservations === undefined)) add('unresolved', 'The response lacks typed undertaking or actual reservation evidence; the rung alone supplies no qualification credit.', candidates);
      else add('mismatch', 'The same request received a contrary actual response or advice; declared compliance cannot hide it.', candidates);
    }
  }
  const counts = new Map<string, { side: string | null; actor: string; role: string; kind: string; actual: string; declared: string; count: number }>();
  for (const a of diagnostics) {
    const fields = { side: a.side, actor: a.actor, role: a.role, kind: a.kind, actual: a.actual, declared: a.declared };
    const key = JSON.stringify(fields);
    const old = counts.get(key);
    counts.set(key, { ...fields, count: (old?.count ?? 0) + 1 });
  }
  const problems = rows.filter(r => r.verdict !== 'matched' && r.verdict !== 'representation_gap').map(r => `${r.side}/${r.id} ${r.actor} ${r.role} ${r.matter}: ${r.verdict}: ${r.reason}`);
  const evidence = rows.map(r => `${r.side}/${r.id}: ${r.verdict}: ${r.reason}${r.matched === null ? '' : ` [${r.matched}]`}`);
  evidence.push(...[...counts.values()].map(c => `raw diagnostic ${c.side ?? 'unresolved side'}/${c.actor}/${c.role}/${c.kind}/${c.actual} (declared ${c.declared}): ${c.count}; no historical ceiling`));
  evidence.push(...diagnostics.filter(a => a.reservations !== undefined || a.reservationGaps !== undefined).map(a => `raw qualifications ${a.id}: undertaking ${JSON.stringify(a.undertaking ?? null)}; actual ${JSON.stringify(a.reservations ?? [])}; declared ${JSON.stringify(a.declaredReservations ?? [])}; representation gaps actual ${JSON.stringify(a.reservationGaps ?? [])}; declared ${JSON.stringify(a.declaredReservationGaps ?? [])}`));
  const mechanics = Object.fromEntries(['orders.relay_objected', 'orders.relay_held', 'reports.filtered', 'reports.trimmed'].map(key => [key, daily.reduce((n, d) => n + (d.fires[key] ?? 0), 0)]));
  evidence.push(...Object.entries(mechanics).map(([key, n]) => `raw telemetry diagnostic ${key}: ${n}; no historical ceiling`));
  return { rows, problems, evidence, matched: rows.filter(r => r.verdict === 'matched').length, diagnostics, counts: [...counts.values()], mechanics };
}
