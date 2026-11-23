import { describe, expect, it } from 'vitest';
import { resolveDirective } from '../src/compliance.ts';
import { callDirective } from '../src/recruitment/rules.ts';
import { callQualifications, receiveCallInformation, fileStateConditions } from '../src/knowledge/call-evidence.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createState } from '../src/tick/setup.ts';
import { arriveCall, issueCall } from '../src/tick/recruitment.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { indexedFixture, P, POST } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import type { KnownReport } from '../src/knowledge/records.ts';
import type { StateConditionRecord } from '../src/knowledge/evidence-types.ts';
import { tick } from '../src/tick/tick.ts';
import { encodeSave, decodeSave } from '../src/serialize/save.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import type { State } from '../src/root-state.ts';

const profile = {
  id: 'fixture_call', sourceProfile: 'fixture', honours: [], offends: [],
  callProvenance: [{ source: 'fixture original', page: 12 }], conditions: [], materialDemand: [],
  information: [
    { detail: 'purpose_detail' as const, value: null },
    { detail: 'muster_receiver' as const, value: null },
    { detail: 'rejection_return_support' as const, value: null },
  ], rationale: 'Original terms, not a reply.', limits: 'Unknown details stay null.',
};
function fixture() {
  const b = indexedFixture();
  const world = indexSeatsWorld(indexWorld({ ...b.map.world, rules: { ...b.map.world.rules, recruitment: {
    ...b.map.world.rules.recruitment, callProfiles: [profile],
    raisingPostKinds: [b.start.posts.find(p => p.id === POST('a_army'))!.kind],
  } } }), b.start);
  const state = { ...createState(world, { seed: 17 }), stateDay: 4 };
  const ctx = ctxFor(world, state, 4, [...TICK_MECHANICS, ...MAP_MECHANICS]);
  expect(issueCall(ctx, state, seatIdFor(P('a_lead')), { cmd: 'call', to: POST('a_army'), regiments: 1, termDays: 30, termsId: profile.id, route: 'courier', bypass: true })).toBeNull();
  return { world, state, ctx, msg: ctx.outbox[0]! };
}
const reader = { id: 'reader', boldness: 500, candour: 1000, standing: 0, regard: 0, values: ['caution'] };
const context = { available: 1000, oversight: 0, leaderCredibility: 0 };

describe('S111 common received-evidence path', () => {
  it('produces a question only from the addressee’s received original, never sending or another seat', () => {
    const { world, state, msg } = fixture();
    const terms = callDirective(world.map.world.rules.recruitment, msg.msgOrder!.orderCall!);
    const read = (s: typeof state, person = msg.msgTo) => callQualifications(s, person, msg.msgOrigin, msg.msgOrder!.orderIssuedDay, terms);
    expect(read(state)).toEqual([]);
    const received = receiveCallInformation(state, msg, 4);
    expect(read(received)).toHaveLength(3);
    expect(read(received, P('a_lead'))).toEqual([]);
    expect(read({ ...received, stateDay: 3 })).toEqual([]);
    expect(receiveCallInformation(received, msg, 4)).toEqual(received);
    expect(received.knowledgeBySeat[seatIdFor(msg.msgTo)]!.knownReports.at(-1)!.knownBody).toMatchObject({ reportAuthor: msg.msgOrder!.orderIssuer, reportAnswers: null });
    expect(received.postLevies).toBe(state.postLevies);
    expect(received.orderResponses).toBe(state.orderResponses);
  });

  it('keeps unknown detail, a known answer and an absent field distinct', () => {
    const { state, msg, world } = fixture();
    const terms = callDirective(world.map.world.rules.recruitment, msg.msgOrder!.orderCall!);
    const altered = { ...msg, msgOrder: { ...msg.msgOrder!, orderCall: { ...msg.msgOrder!.orderCall!, callProfile: { ...profile, information: [{ detail: 'muster_receiver' as const, value: 'named-officer' }] } } } };
    const received = receiveCallInformation(state, altered, 4);
    expect(callQualifications(received, msg.msgTo, msg.msgOrigin, 4, terms)).toEqual([]);
  });

  it('pairs a willing plain undertaking with a received question, without a protest or muster delay', () => {
    const { world, state, ctx, msg } = fixture();
    const next = arriveCall(ctx, state, msg);
    const response = Object.values(next.orderResponses)[0]!;
    expect(response).toMatchObject({ respActual: 'comply_with_reservations', respUndertaking: { undertakingKind: 'original', undertakingRequest: msg.msgOrigin } });
    expect(response.respReservations).toHaveLength(3);
    expect(response.respReservations!.every(r => r.treatment === 'clarify' && r.effect === 'request')).toBe(true);
    expect(response.respReasons.some(r => r.kind === 'values_offended')).toBe(false);
    const terms = callDirective(world.map.world.rules.recruitment, msg.msgOrder!.orderCall!);
    expect(resolveDirective(reader, terms, context).actual).toBe('comply');
    expect(Object.values(next.postLevies)[0]!.levyMusterDay).toBe(4 + world.map.world.rules.recruitment.musterDays);
  });

  it('reads today’s actual arrival while State still carries yesterday’s completed day', () => {
    const { state, ctx, msg } = fixture();
    const next = arriveCall(ctx, { ...state, stateDay: 3 }, msg);
    expect(Object.values(next.orderResponses)[0]!.respReservations).toHaveLength(3);
  });

  it('takes a resource limit and structural condition from own received records, not the reply', () => {
    const { state, msg, world } = fixture();
    const terms = { ...callDirective(world.map.world.rules.recruitment, msg.msgOrder!.orderCall!), clauses: [
      { clauseId: 'muster', clauseSubject: 'muster' as const }, { clauseId: 'law', clauseSubject: 'authority' as const },
    ] };
    const paper = (kind: 'resource_limit' | 'structural_condition'): KnownReport => ({
      id: `m.condition.${kind}` as typeof msg.id, knownReceivedDay: 3, knownRoute: 'in-person' as const, knownVia: [],
      knownBody: { reportType: 'wire-dispatch' as const, reportSubtype: null, reportAuthor: msg.msgTo, reportAuthorPost: msg.msgToPost,
        reportSubjectKind: 'post' as const, reportSubjectId: msg.msgToPost!, reportDay: 2, reportHour: null, reportAdvice: null, reportAnswers: null, reportClaims: [],
        reportStateCondition: kind === 'resource_limit'
          ? { conditionKind: kind, conditionSubject: 'muster', conditionFact: 'camp_finance_limited', conditionCites: [['fixture prior record', 7]] }
          : { conditionKind: kind, conditionSubject: 'authority', conditionFact: 'external_order_authority_absent', conditionCites: [['fixture prior record', 7]] },
      },
    });
    let held = deliverReport(state, seatIdFor(msg.msgTo), paper('resource_limit'), { truthTerms: [], truthTrimmed: [] });
    held = deliverReport(held, seatIdFor(msg.msgTo), paper('structural_condition'), { truthTerms: [], truthTrimmed: [] });
    const inputs = callQualifications(held, msg.msgTo, msg.msgOrigin, 4, terms);
    expect(inputs).toEqual([expect.objectContaining({ evidence: 'resource_report', reportedDay: 2, receivedDay: 3 }), expect.objectContaining({ evidence: 'structural_condition', treatment: 'protest' })]);
    const answer = resolveDirective(reader, terms, { ...context, qualifications: inputs, receivedDay: 4 });
    expect(answer.reservations.map(r => [r.subject, r.effect])).toEqual([['muster', 'request'], ['authority', 'statement']]);
    expect(answer.reservations[0]!.grounds).toMatchObject({ groundReportedDay: 2, groundReceivedDay: 3 });
    expect(callQualifications(held, msg.msgTo, msg.msgOrigin, 2, terms)).toEqual([]);
    expect(callQualifications(held, P('a_lead'), msg.msgOrigin, 4, terms)).toEqual([]);
    expect(callQualifications(held, msg.msgTo, msg.msgOrigin, 4, { ...terms, clauses: [] })).toEqual([]);
  });

  it('does not manufacture an original undertaking from an alternative or an unrequired arms reserve', () => {
    const t = { boldness: null, honours: [], offends: ['caution'], required: 0, clauses: [{ clauseId: 'arms', clauseSubject: 'arms_equipment' as const, clauseObligation: 'not_required' as const }] };
    const answer = resolveDirective(reader, t, { ...context, receivedDay: 4, qualifications: [{ clause: 'arms', evidence: 'resource_report', reference: 'received-limit', reportedDay: 2, receivedDay: 3, treatment: 'request_support' }] }, undefined, [{ id: 'alternative', terms: { ...t, offends: [] }, authority: 'authorized', changedClauses: ['course'] }]);
    expect(answer.undertaking).toMatchObject({ undertakingKind: 'alternative' });
    expect(answer.reservations.some(r => r.clause === 'arms')).toBe(false);
  });

  it('files a sourced actor condition on its date once and only for its own holder', () => {
    const { world, state, msg } = fixture();
    const records: StateConditionRecord[] = [{ recordId: 'camp', recordActor: msg.msgTo, recordPost: msg.msgToPost!, recordDate: '1900-06-03',
      recordCondition: { conditionKind: 'resource_limit' as const, conditionSubject: 'muster' as const, conditionFact: 'camp_finance_limited', conditionCites: [['fixture ledger', 7] as const] } }];
    const early = fileStateConditions(state, records, world.start.startDate, 1);
    expect(early).toBe(state);
    const filed = fileStateConditions(state, records, world.start.startDate, 2);
    expect(filed.knowledgeBySeat[seatIdFor(msg.msgTo)]!.knownReports).toHaveLength(1);
    expect(fileStateConditions(filed, records, world.start.startDate, 2)).toBe(filed);
    expect(fileStateConditions(state, [{ ...records[0]!, recordActor: P('a_lead') }], world.start.startDate, 2)).toBe(state);
  });

  it('replays and resumes actual dated receipt and call dispatch through the tick', () => {
    const { world: base, msg } = fixture();
    const conditions: StateConditionRecord[] = [{ recordId: 'ledger', recordActor: msg.msgTo, recordPost: msg.msgToPost!, recordDate: '1900-06-02',
      recordCondition: { conditionKind: 'resource_limit', conditionSubject: 'muster', conditionFact: 'camp_finance_limited', conditionCites: [['fixture ledger before call', 7]] } }];
    const world = indexSeatsWorld(indexWorld({ ...base.map.world, rules: { ...base.map.world.rules, recruitment: { ...base.map.world.rules.recruitment, stateConditions: conditions } } }), base.start);
    const initial = createState(world,{seed:17});
    const log = [{ day: 3, seat: seatIdFor(P('a_lead')), command: { cmd: 'call' as const, to: POST('a_army'), regiments: 1, termDays: 30, route: 'courier' as const, bypass: true, termsId: profile.id } }];
    const run = (start: State, stop: number) => {
      let state = start;
      const traces = [];
      while (state.stateDay < stop) {
        const day = state.stateDay+1;
        const result = tick(world,state,log.filter(e => e.day === day),{freeze:true});
        expect(result.rejections).toEqual([]);
        traces.push(...result.requestDispatches ?? [], ...result.requestReceipts ?? []);
        state=result.state;
      }
      return { state, traces };
    };
    const continuous = run(initial,10), replayed = run(initial,10), first = run(initial,4);
    const worldHash = canonicalHash(world.map.world);
    const saved = encodeSave({worldHash,state:first.state,log:log.filter(e=>e.day<=4)});
    const loaded = decodeSave(saved,{expectedWorldHash:worldHash}).state as unknown as State;
    const resumed=run(loaded,10);
    expect(canonicalHash(continuous.state)).toBe(canonicalHash(replayed.state));
    expect(canonicalHash(continuous.state)).toBe(canonicalHash(resumed.state));
    expect(continuous.traces.filter(m=>m.msgOrder?.orderKind==='call').length).toBe(2);
    expect(Object.values(continuous.state.orderResponses).find(r=>r.respKind==='call')!.respReservations).toContainEqual(expect.objectContaining({ grounds: expect.objectContaining({ groundKind:'resource_report', groundFact:'camp_finance_limited' }) }));
    expect(loaded.knowledgeBySeat[seatIdFor(msg.msgTo)]!.knownReports).toContainEqual(expect.objectContaining({ knownBody: expect.objectContaining({ reportStateCondition: conditions[0]!.recordCondition }) }));
  });
});
