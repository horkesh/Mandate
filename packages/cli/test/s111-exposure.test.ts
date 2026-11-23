import { expect, it } from 'vitest';
import { phase0, canonicalHash } from '@mandate/kernel';
import { observeExposure, exposureRows } from '../src/pushback-exposure.ts';
import { coverageScore } from '../src/pushback-coverage.ts';
import { indexedFixture, P, POST } from '../../kernel/test/support/seats-fixture.ts';
import type { PushbackRegister } from '@mandate/pack-format';

const match: NonNullable<PushbackRegister['rows'][number]['match']> = { kind: 'call', callId: 'fixture', actual: 'comply_with_reservations', qualification: [{ subject: 'muster', effects: ['request'], groundKind: 'resource_report', groundFact: 'camp_finance_limited' }] };
const register: PushbackRegister = { side: 'a', through: '1900-06-10', cite: 'fixture page 1', rows: [{ id: 'one', side: 'a', actor: 'a_army', role: 'addressee', band: 'reservations', matter: 'fixture', act: 'request', status: 'eligible', cite: 'fixture page 1', match }] };
it('does not credit an unrelated muster question as a received finance limitation', () => {
  const act = { id: 'answer', order: 'letter', side: 'a', actor: 'a_army', post: 'a_army', role: 'addressee', kind: 'call', callId: 'fixture', actual: 'comply_with_reservations', declared: 'comply_with_reservations', day: 4,
    undertaking: { undertakingKind: 'original', undertakingRequest: 'letter', clauses: ['muster'] }, reservations: [{ clause: 'muster', subject: 'muster', effect: 'request', grounds: { groundKind: 'information_request', groundFact: 'muster_receiver' } }] };
  expect(coverageScore([register], [act], '1900-06-01', 10).rows[0]!.verdict).toBe('mismatch');
  const grounded = { ...act, reservations: [{ ...act.reservations[0]!, grounds: { groundKind: 'resource_report', groundFact: 'camp_finance_limited' } }] };
  expect(coverageScore([register], [grounded], '1900-06-01', 10).rows[0]!.verdict).toBe('matched');
});

it('distinguishes issued, same-day received, unanswered and absent requests without parsing an ID', () => {
  const world = indexedFixture();
  const state = phase0.createState(world, { seed: 1 });
  const trace = observeExposure();
  const message = { id: 'opaque', msgOrigin: 'opaque', msgFrom: P('a_lead'), msgTo: P('a_army'), msgToPost: POST('a_army'), msgRole: 'addressee', msgSentDay: 1, msgPending: [], msgVerb: null,
    msgOrder: { orderKind: 'call', orderIssuer: P('a_lead'), orderTarget: POST('a_army'), orderIssuedDay: 1, orderGoal: null, orderCall: { callId: 'fixture', callRegiments: 1, callTermDays: 30 } } } as unknown as phase0.TransitMessage;
  const result = { state, day: 1, requestDispatches: [message], requestReceipts: [message] } as unknown as phase0.TickResult;
  const before = canonicalHash(state);
  trace.onTick(world, result); trace.onTick(world, result);
  const rows = exposureRows([register], trace.observations(), [], '1900-06-01', 10);
  expect(rows[0]).toMatchObject({ issued: true, received: true, answered: false, cause: 'received_without_answer' });
  expect(trace.observations()).toHaveLength(1);
  expect(exposureRows([register], [], [], '1900-06-01', 10)[0]).toMatchObject({ issued: false, received: false, answered: false, cause: 'request_absent' });
  expect(canonicalHash(state)).toBe(before);
});

it('audits a proposal row’s incoming goal separately from its missing challenge',()=>{
  const world=indexedFixture(), state=phase0.createState(world,{seed:1}), trace=observeExposure();
  const goal={id:'held-order',msgOrigin:'held-order',msgFrom:P('a_lead'),msgTo:P('a_gen'),msgToPost:POST('a_army'),msgRole:'addressee',msgSentDay:1,msgPending:[],msgVerb:null,
    msgOrder:{orderKind:'goal',orderIssuer:P('a_lead'),orderTarget:POST('a_army'),orderIssuedDay:1,orderGoal:{goalObjective:'a_front',goalPosture:'hold'}}} as unknown as phase0.TransitMessage;
  trace.onTick(world,{state,day:1,requestDispatches:[goal],requestReceipts:[goal]} as unknown as phase0.TickResult);
  const row={...register.rows[0]!,actor:'a_gen',band:'plan_objections',match:{kind:'goal-proposal',objective:'a_front',posture:'hold' as const,actual:'propose'}};
  const answer={id:'ordinary-answer',order:'held-order',actor:'a_gen',side:'a',role:'addressee',kind:'goal',actual:'comply',declared:'comply',day:1};
  expect(exposureRows([{...register,rows:[row]}],trace.observations(),[answer],'1900-06-01',10)[0]).toMatchObject({issued:true,received:true,answered:true,cause:'answered'});
  expect(coverageScore([{...register,rows:[row]}],[answer],'1900-06-01',10).rows[0]!.verdict).toBe('not_observed');
});
