import { describe, expect, it } from 'vitest';
import { coverageScore, type CoverageAct } from '../src/pushback-coverage.ts';
import type { PushbackRegister } from '@mandate/pack-format';

const register = (effects = ['statement']) => ({ side: 'own', through: '1861-07-31', cite: 'fixture', rows: [{
  id: 'qualified', side: 'own', actor: 'recipient', role: 'addressee', band: 'reservations', matter: 'one call', act: 'undertakes with appointment protest', cite: 'fixture', status: 'eligible',
  match: { kind: 'call', callId: 'one', actual: 'comply_with_reservations', qualification: [{ subject: 'appointments', effects }] },
}] }) as PushbackRegister;
const reservation = { clause: 'appointments', subject: 'appointments', effect: 'statement', request: 'letter', revision: 'one' };
const act = (over = {}) => ({ id: 'answer', order: 'letter', side: 'own', actor: 'recipient', role: 'addressee', kind: 'call', callId: 'one', day: 2,
  actual: 'comply_with_reservations', declared: 'comply', undertaking: { undertakingKind: 'original', undertakingRequest: 'letter', clauses: ['appointments'] }, reservations: [reservation], declaredReservations: [], ...over,
}) as unknown as CoverageAct;
const score = (a: CoverageAct, effects?: string[]) => coverageScore([register(effects)], [a], '1861-03-05', 148);

describe('0118 qualification coverage', () => {
  it('requires actual undertaking, the same request and the row subject/effect', () => {
    expect(score(act()).rows[0]!.verdict).toBe('matched');
    for (const over of [
      { undertaking: null },
      { undertaking: { undertakingKind: 'original', undertakingRequest: 'different', clauses: ['appointments'] } },
      { reservations: [{ ...reservation, subject: 'arms_equipment' }] },
      { reservations: [{ ...reservation, effect: 'request' }] },
      { reservations: [{ ...reservation, clause: 'other-clause' }] },
      { reservations: [], declaredReservations: [reservation] },
    ]) expect(score(act(over)).rows[0]!.verdict).not.toBe('matched');
  });
  it('does not grant a bare legacy rung typed qualification credit', () => {
    expect(score(act({ undertaking: undefined, reservations: undefined })).rows[0]!.verdict).toBe('unresolved');
  });
  it('keeps unsupported offers as named gaps and cannot turn them into executed compliance', () => {
    const s = score(act({ undertaking: null, reservations: [] }), ['offer']);
    expect(s.rows[0]!.verdict).toBe('representation_gap');
    expect(s.rows[0]!.reason).toContain('offer');
    expect(s.matched).toBe(0);
    expect(s.problems).toEqual([]);
  });
  it('retains actual and declared qualification diagnostics separately', () => {
    const s = score(act());
    expect(s.diagnostics[0]).toMatchObject({ reservations: [reservation], declaredReservations: [] });
    expect(s.evidence.join('\n')).toContain('appointments');
  });
});
