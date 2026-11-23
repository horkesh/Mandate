import { expect, it } from 'vitest';
import type { PushbackRegister } from '@mandate/pack-format';
import { PushbackMatchSchema } from '../../pack-format/src/pushback-register.ts';
import { coverageScore, type CoverageAct } from '../src/pushback-coverage.ts';
import { observePushback } from '../src/pushback-observer.ts';
import { observeExposure } from '../src/pushback-exposure.ts';
import { phase0 } from '@mandate/kernel';
import { indexedFixture } from '../../kernel/test/support/seats-fixture.ts';

const match = (evidence = 'course_challenge') => ({ kind: evidence === 'course_challenge' ? 'goal-proposal' : 'goal',
  purpose: 'attack_or_demonstrate', target: 'opponent_command', letters: [{namespace:'north',key:'first_demand',revision:1}], detentionEvidence: evidence });
const register = (evidence = 'course_challenge'): PushbackRegister => ({ side: 'north', through: '1861-07-31', cite: 'fictional fixture', rows: [{
  id: 'one', side: 'north', actor: 'commander', role: 'addressee', band: 'plan_objections', matter: 'detain command', act: 'challenge course',
  status: 'eligible', cite: 'fictional fixture', match: match(evidence),
}] }) as PushbackRegister;
const act = (over = {}): CoverageAct => ({ id: 'one', order: 'dispatch', side: 'north', actor: 'commander', role: 'addressee',
  kind: 'goal-proposal', actual: 'propose', declared: 'propose', day: 10, purpose: 'attack_or_demonstrate', target: 'opponent_command',
  letterKey: 'first_demand', letterNamespace: 'north', letterRevision: 1, courseGrounds: ['too_rash'], ...over });
const score = (a: CoverageAct[], evidence?: string) => coverageScore([register(evidence)], a, '1861-03-05', 148).rows[0]!.verdict;

it('requires a bounded authored detention matter and explicit performance evidence', () => {
  expect(PushbackMatchSchema.safeParse(match()).success).toBe(true);
  expect(PushbackMatchSchema.safeParse({ ...match(), letters: [] }).success).toBe(false);
  expect(PushbackMatchSchema.safeParse({ ...match(), target: undefined }).success).toBe(false);
  expect(score([act()])).toBe('matched');
  for (const over of [{ letterKey: 'second_demand' }, { letterNamespace: 'another_issuer' }, { letterRevision: 2 }, { target: 'screen_command' }, { purpose: undefined }]) {
    expect(score([act(over)])).not.toBe('matched');
  }
});
it('rejects questions, unsupported objections and claims of success as course challenges', () => {
  for (const over of [{ courseGrounds: [] }, { courseGrounds: undefined }, { kind: 'goal', actual: 'object', courseGrounds: undefined },
    { kind: 'goal', actual: 'comply', reportedSuccess: true }]) expect(score([act(over)])).not.toBe('matched');
});
it('requires actual deferral tied to the fresh answer and execution; a rung or reservation alone earns none', () => {
  const response = { kind: 'goal', actual: 'slow_walk', letterKey: 'first_demand', courseGrounds: undefined };
  expect(score([act(response)], 'actual_deferral')).toBe('mismatch');
  expect(score([act({ ...response, deferredIntervals: 1 })], 'actual_deferral')).toBe('matched');
  expect(score([act({ ...response, actual: 'comply_with_reservations', deferredIntervals: 0 })], 'actual_deferral')).toBe('mismatch');
  expect(score([act({ ...response, actual: 'comply', deferredIntervals: 1 })], 'actual_deferral')).toBe('mismatch');
});
it('keeps the fresh matters separate and one act covers at most one row', () => {
  const r = register();
  const rows = coverageScore([{ ...r, rows: [...r.rows, { ...r.rows[0]!, id: 'two' }] }], [act()], '1861-03-05', 148).rows;
  expect(rows.map(r => r.verdict)).toEqual(['matched', 'unresolved']);
});
it('archives same-day subordinate-authored demands by their real issuer, purpose and paper, even after transit ends', () => {
  const world = indexedFixture();
  const initial = phase0.createState(world, { seed: 1 });
  const observer = observePushback(), exposure = observeExposure();
  const purpose = { kind: 'attack_or_demonstrate', duty: 'detain', target: { kind: 'opposing_command', post: 'b_field' },
    detentionArea: ['crossing'], actionArea: ['crossing'], means: ['attack', 'demonstrate'] };
  const stored = { detKind: purpose.kind, detDuty: purpose.duty, detTargetKind: purpose.target.kind,
    detTargetPost: purpose.target.post, detDetentionArea: purpose.detentionArea, detActionArea: purpose.actionArea, detMeans: purpose.means };
  const message = { id: 'one', msgOrigin: 'opaque', msgTo: 'a_sec', msgToPost: 'a_office', msgPending: [], msgRole: 'addressee', msgVerb: null,
    msgOrder: { orderIssuer: 'b_lead', orderIssuedDay: 1, orderTarget: 'a_office', orderKind: 'goal',
      orderLetter: { namespace: 'north', key: 'first_demand', revision: 1 }, orderGoal: { goalPurpose: stored } } };
  const response = { respOrder: 'opaque', respPerson: 'a_sec', respRole: 'addressee', respKind: 'goal', respDay: 1,
    respActual: 'comply', respDeclared: 'comply', respPost: 'a_office' };
  const result = { state: { ...initial, orderResponses: { one: response } }, day: 1, events: [],
    requestDispatches: [message], requestReceipts: [message] } as unknown as phase0.TickResult;
  observer.onTick(world, result); exposure.onTick(world, result);
  expect(observer.observations()[0]).toMatchObject({ side: 'b', purpose: 'attack_or_demonstrate', target: 'b_field', letterKey: 'first_demand' });
  expect(exposure.observations()[0]).toMatchObject({ purpose: 'attack_or_demonstrate', target: 'b_field', letterKey: 'first_demand', receivedDays: [1] });
  const report = { id: 'report', msgOrigin: 'report', msgTo: 'b_lead', msgPending: [], msgOrder: null, msgVerb: null,
    msgReport: { reportAuthor: 'a_sec', reportAnswers: 'opaque', reportDay: 2, reportSubjectId: 'a_office', reportAdvice: null,
      reportClaims: [{ claimKind: 'detention-course', claimToken: 'insufficient_stores' }] } };
  const later = { ...result, day: 2, requestDispatches: [], requestReceipts: [],
    state: { ...result.state, messagesInTransit: [report], operationRecords: {
      one: { opOrder: 'opaque', opCommander: 'a_sec', opPurpose: purpose, opDeferredDays: [2, 2] },
      wrong: { opOrder: 'another_answer', opCommander: 'a_sec', opPurpose: purpose, opDeferredDays: [1, 2] },
    } } } as unknown as phase0.TickResult;
  observer.onTick(world, later);
  expect(observer.observations()[0]).toMatchObject({ courseGrounds: ['insufficient_stores'], deferredIntervals: 1 });
  const received = { ...later, day: 3, state: { ...later.state, messagesInTransit: [],
    knowledgeBySeat: { ...later.state.knowledgeBySeat, 'seat:a_sec': { knownReports: [{ knownReceivedDay: 3,
      knownBody: { ...report.msgReport, reportDay: 3, reportClaims: [{ claimKind: 'detention-course', claimToken: 'no_route' }] } }] } },
  } } as unknown as phase0.TickResult;
  observer.onTick(world, received);
  expect(observer.observations()[0]!.courseGrounds).toEqual(['insufficient_stores', 'no_route']);
  expect(score([observer.observations()[0]!])).not.toBe('matched');
});
