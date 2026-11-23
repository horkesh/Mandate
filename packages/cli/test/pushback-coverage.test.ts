import { describe, expect, it } from 'vitest';
import { coverageScore, type CoverageAct } from '../src/pushback-coverage.ts';
import type { PushbackRegister } from '@mandate/pack-format';
import { canonicalHash, phase0 } from '@mandate/kernel';
import { indexedFixture } from '../../kernel/test/support/seats-fixture.ts';
import { observeRun } from '../src/history-run.ts';

const row = (id: string, over = {}) => ({ id, side: 'north', actor: 'governor', role: 'addressee', band: 'reservations', matter: 'first contingent', act: 'undertakes with a qualification', status: 'eligible', cite: 'original letter, pages 12–13', match: { kind: 'call', callId: 'first_call', actual: 'comply_with_reservations', qualification: [{ subject: 'appointments', effects: ['statement'] }] }, ...over });
const register = (...rows: ReturnType<typeof row>[]) => ({ side: 'north', through: '1861-07-31', cite: 'accepted register, decision and original pages', rows }) as PushbackRegister;
const act = (over: Partial<CoverageAct> = {}): CoverageAct => ({ id: 'answer_one', order: 'opaque', side: 'north', actor: 'governor', role: 'addressee', kind: 'call', actual: 'comply_with_reservations', declared: 'comply', day: 3, callId: 'first_call', undertaking: { undertakingKind: 'original', undertakingRequest: 'opaque', clauses: ['appointment'] }, reservations: [{ clause: 'appointment', subject: 'appointments', effect: 'statement' }], ...over });
const score = (r: PushbackRegister, acts: CoverageAct[], lastDay = 148) => coverageScore([r], acts, '1861-03-05', lastDay);

describe('named pushback coverage (observations, never counts)', () => {
  it('observes relay and addressee truth without mutation, resolving opaque order IDs by the issuing principal', () => {
    const world = indexedFixture();
    const initial = phase0.createState(world, { seed: 1 });
    const observer = observeRun(null, '1861-03-05');
    const msg = { id: 'opaque', msgOrigin: 'opaque', msgOrder: { orderIssuer: 'b_lead', orderCall: { callId: 'first_call' }, orderGoal: null }, msgVerb: null };
    const tick = (state: unknown, day: number) => ({ state, day, events: [], map: null }) as unknown as phase0.TickResult;
    observer.onTick(world, tick({ ...initial, messagesInTransit: [msg] }, 1));
    const qualifications = { respUndertaking: null, respDeclaredUndertaking: { undertakingKind: 'original', undertakingRequest: 'opaque', clauses: ['course'] }, respReservations: [], respDeclaredReservations: [], respReservationGaps: [], respDeclaredReservationGaps: [] };
    const response = { respOrder: 'opaque', respPerson: 'a_sec', respRole: 'relay', respKind: 'call', respActual: 'slow_walk', respDeclared: 'comply', respCallId: 'first_call', respDay: 2, ...qualifications };
    const state = { ...initial, orderResponses: { one: response }, stateDay: 2 };
    const hash = canonicalHash(state);
    observer.onTick(world, tick(state, 2));
    observer.onTick(world, tick(state, 2));
    expect(observer.observations().pushbackActs).toHaveLength(1);
    expect(observer.observations().pushbackActs![0]).toMatchObject({ side: 'b', actor: 'a_sec', role: 'relay', actual: 'slow_walk', declared: 'comply', callId: 'first_call' });
    expect(observer.observations().pushbackActs![0]).toMatchObject({ undertaking: null, declaredUndertaking: qualifications.respDeclaredUndertaking, reservations: [], declaredReservations: [], reservationGaps: [], declaredReservationGaps: [] });
    expect(observer.observations().responses).toEqual([]);
    expect(canonicalHash(state)).toBe(hash);
  });
  it('recovers a same-day untagged call from its levy and a policy side from its typed issuer event', () => {
    const world = indexedFixture();
    const initial = phase0.createState(world, { seed: 1 });
    const observer = observeRun(null, '1861-03-05');
    const response = { respOrder: 'opaque', respPerson: 'a_sec', respPost: 'a_office', respRole: 'addressee', respKind: 'call', respActual: 'comply_with_reservations', respDeclared: 'comply', respDay: 2 };
    const policy = { ...response, respOrder: 'policy_opaque', respKind: 'policy' };
    const levy = { levyCall: 'opaque', levyIssuer: 'b_lead', levyTermDays: 90 };
    const r = { state: { ...initial, orderResponses: { one: response, two: policy }, postLevies: { one: levy } }, day: 2, events: [{ event: 'policy', person: 'b_lead', message: 'policy_opaque', terms: [] }], map: null } as unknown as phase0.TickResult;
    observer.onTick(world, r);
    expect(observer.observations().pushbackActs![0]).toMatchObject({ side: 'b', callId: null, termDays: 90, post: 'a_office' });
    expect(observer.observations().pushbackActs![1]!.side).toBe('b');
  });
  it('requires the same issuing side, actor, role and matter, independently of date, message spelling or outcome', () => {
    expect(score(register(row('one')), [act({ day: 100 })]).rows[0]!.verdict).toBe('matched');
    for (const over of [{ side: 'south' }, { actor: 'another' }, { role: 'relay' }, { callId: 'second_call' }]) {
      expect(score(register(row('one')), [act(over)]).problems.length).toBe(1);
    }
    expect(score(register(row('one')), [act({ day: 149 })]).rows[0]!.verdict).toBe('not_observed');
  });
  it('publishes contradictory and covert responses as mismatches and keeps declared and actual separate', () => {
    const s = score(register(row('one')), [act({ actual: 'slow_walk', declared: 'comply' })]);
    expect(s.rows[0]!.verdict).toBe('mismatch');
    expect(s.diagnostics[0]).toMatchObject({ actual: 'slow_walk', declared: 'comply' });
    expect(s.counts[0]).toMatchObject({ count: 1, side: 'north', actor: 'governor', role: 'addressee', kind: 'call' });
  });
  it('does not let one model act cover two rows, or unrelated extra acts buy coverage', () => {
    const s = score(register(row('one'), row('two')), [act(), act({ id: 'other', callId: 'other_call' })]);
    expect(s.rows.map(r => r.verdict)).toEqual(['matched', 'unresolved']);
    expect(s.problems).toHaveLength(1);
    expect(s.diagnostics).toHaveLength(2);
  });
  it('has no ceiling and distinguishes an absent exposure from absent or incomplete observations', () => {
    expect(score(register(row('one')), Array.from({ length: 20 }, (_, i) => act({ id: String(i) }))).problems).toEqual([]);
    expect(score(register(row('one')), [act({ callId: 'second_call' })]).rows[0]!.verdict).toBe('exposure_mismatch');
    expect(score(register(row('one')), []).rows[0]!.verdict).toBe('not_observed');
    expect(score(register(row('one')), [], 3).rows[0]!.verdict).toBe('unresolved');
    expect(score(register(row('one')), [act({ side: null })]).rows[0]!.verdict).toBe('unresolved');
  });
  it('reports representation gaps as neither pass nor failure and excludes qualified and excluded rows', () => {
    const gap = { mechanism: 'organisation terms and consent in transfers', location: 'packages/kernel/src/messages/transit.ts', reason: 'transfer body has no organisation or consent fields' };
    const s = score(register(row('one', { gap }), row('excluded', { status: 'excluded' }), row('held', { status: 'qualified_source' })), []);
    expect(s.rows).toHaveLength(1);
    expect(s.rows[0]).toMatchObject({ verdict: 'representation_gap', gap });
    expect(s.problems).toEqual([]);
    expect(s.matched).toBe(0);
  });
  it('uses typed goal and consultation content rather than treating every object as plan advice', () => {
    const r = register(row('one', { band: 'plan_objections', match: { kind: 'goal', objective: 'crossing', posture: 'hold', actual: 'object' } }));
    expect(score(r, [act({ kind: 'goal', objective: 'crossing', posture: 'hold', actual: 'object' })]).rows[0]!.verdict).toBe('matched');
    expect(score(r, [act({ kind: 'goal', objective: 'capital', posture: 'take', actual: 'object' })]).rows[0]!.verdict).toBe('exposure_mismatch');
    const advice = register(row('advice', { band: 'plan_objections', match: { kind: 'verb:consult', subject: 'supply_question', advice: 'withdraw' } }));
    expect(score(advice, [act({ kind: 'verb:consult', subject: 'supply_question', actual: 'comply', advice: 'withdraw' })]).rows[0]!.verdict).toBe('matched');
    expect(score(advice, [act({ kind: 'verb:consult', subject: 'supply_question', actual: 'comply' })]).rows[0]!.verdict).toBe('unresolved');
  });
});
