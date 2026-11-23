import { describe, expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport, knowledgeOf } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { generateCourseAdvice } from '../src/people/advice.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { replay } from '../src/log/session.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { indexWorld } from '../src/world/index.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import type { ConsultationRound } from '../src/world/consultations.ts';
import { F, fixtureMap, fixtureStart, P, POST } from './support/seats-fixture.ts';
import { report } from './support/s25-fixture.ts';

const first = { namespace: 'a_questions', key: 'first', revision: 1 };
const second = { ...first, key: 'second' };
const subject = toId('situation', 'harbour');
const course = { id: 'relief', honours: ['duty'], opposes: ['caution'], resources: ['men'], assumesPossible: false };
const round = (letter = first): ConsultationRound => ({ letter, subject, fromDate: '1900-06-02',
  question: 'What would relief require?', kind: 'feasibility', courses: [course],
  advisers: [{ post: POST('a_office'), person: P('a_sec') }], source: 'Fictional question book p.1' });
function fixture(rounds = [round(), round(second)]) {
  const map = fixtureMap();
  return indexSeatsWorld(indexWorld({ ...map.world, rules: { ...map.world.rules, ruleSeats: { ...map.world.rules.ruleSeats,
    principals: [{ faction: F('a'), letterNamespace: 'a_questions', crossNeutral: false, concentrateAt: null,
      concentrateSource: null, calls: [], offensives: [], consultations: rounds, inquireEveryDays: 7, appointKinds: { land: [], naval: [] } }] } } }), fixtureStart());
}
const world = fixture();
const adviser = P('a_sec');
const lead = seatIdFor(P('a_lead'));
const menu = (state: ReturnType<typeof createState>) => principalMenu(world, state, F('a'), morningGround(world, state, state.stateDay + 1));
function received(state: ReturnType<typeof createState>, id: string, available: number, receivedDay = 0) {
  return deliverReport(state, seatIdFor(adviser), report(id, { reportSubjectKind: 'situation', reportSubjectId: subject,
    reportCourseEvidence: [{ evidenceCourse: 'relief', evidenceResource: 'men', evidenceNeeded: 100, evidenceAvailable: available, evidenceReadyBy: 3, evidenceNeededBy: 4 }] }, receivedDay), NO_TRUTH);
}

describe('S128 course and round advice', () => {
  it('changes feasibility only from received evidence, never the round date or hidden strength', () => {
    const start = createState(world, { seed: 11 });
    const unknown = generateCourseAdvice(world, start, adviser, round(), 1);
    expect(unknown.consultationAnswers[0]!.answerFeasibility).toMatchObject({ assessmentStatus: 'unknown', assessmentRequirements: [{ evidenceNeeded: null, evidenceAvailable: null, evidenceReadyBy: null, evidenceNeededBy: null }] });
    expect(generateCourseAdvice(world, { ...start, stateDay: 8 }, adviser, round(second), 9).consultationAnswers).toEqual(unknown.consultationAnswers);
    const one = generateCourseAdvice(world, received(start, 'm.first', 50), adviser, round(), 1);
    expect(one.consultationAnswers[0]!.answerFeasibility?.assessmentStatus).toBe('infeasible');
    const two = generateCourseAdvice(world, received(start, 'm.second', 150), adviser, round(second), 1);
    expect(two.consultationAnswers[0]!.answerFeasibility?.assessmentStatus).toBe('feasible');
    expect(generateCourseAdvice(world, received(start, 'm.future', 150, 2), adviser, round(), 1).consultationAnswers).toEqual(unknown.consultationAnswers);
    const otherSeat = deliverReport(start, lead, report('m.secret', { reportSubjectKind: 'situation', reportSubjectId: subject,
      reportCourseEvidence: [{ evidenceCourse: 'relief', evidenceResource: 'men', evidenceNeeded: 100, evidenceAvailable: 500, evidenceReadyBy: 3, evidenceNeededBy: 4 }] }), NO_TRUTH);
    expect(generateCourseAdvice(world, otherSeat, adviser, round(), 1).consultationAnswers).toEqual(unknown.consultationAnswers);
  });

  it('keeps policy wisdom separate from assumed possibility and uses this course stance on a tie', () => {
    const start = received(createState(world, { seed: 11 }), 'm.short', 50);
    const policy = { ...round(), kind: 'policy' as const, courses: [{ ...course, assumesPossible: true }] };
    expect(generateCourseAdvice(world, start, adviser, policy, 1).consultationAnswers[0]!.answerPosition).toBe('against');
    const tied = { ...policy, courses: [{ ...policy.courses[0]!, honours: [], opposes: [] }] };
    const changed = applyPeopleChanges(start, [{ change: 'stance', person: adviser, subject: `${subject}:relief`, recommends: 'favour', confidence: 700 }], 0, world.map.world.rules.people, world.map.world.vocabularies.ranks);
    expect(generateCourseAdvice(world, changed, adviser, tied, 1).consultationAnswers[0]!.answerPosition).toBe('favour');
    expect(generateCourseAdvice(world, start, adviser, tied, 1).consultationAnswers[0]!.answerPosition).toBe('undetermined');
    const revised = applyPeopleChanges(changed, [{ change: 'stance', person: adviser, subject: `${subject}:relief`, recommends: 'against', confidence: 700 }], 0, world.map.world.rules.people, world.map.world.vocabularies.ranks);
    expect(generateCourseAdvice(world, revised, adviser, { ...tied, letter: second }, 1).consultationAnswers[0]!.answerPosition).toBe('against');
  });

  it('offers rounds as choices, logs authored letters and receipt witnesses, and rejects automatic duplicates', () => {
    let state = createState(world, { seed: 11 });
    expect(menu(state).consultations?.map(q => q.letter)).toEqual([first, second]);
    const cmd = { cmd: 'consult' as const, situation: subject, posts: [POST('a_office')], round: first };
    const result = tick(world, state, [{ day: 1, seat: lead, command: cmd }]);
    expect(result.rejections).toEqual([]);
    state = result.state;
    expect(knowledgeOf(state, lead).knownConsultationDispatches).toHaveLength(1);
    expect(knowledgeOf(state, seatIdFor(adviser)).knownPaperReceipts?.some(p => p.receiptLetter?.key === 'first')).toBe(true);
    expect(menu(state).consultations?.map(q => q.letter)).toEqual([second]);
    const answer = knowledgeOf(state, lead).knownReports.find(r => r.knownBody.reportAdvice?.adviceConsultation !== undefined);
    expect(answer?.knownBody.reportAdvice?.adviceConsultation).toMatchObject({ consultationRound: first });
    expect(Object.values(state.orderResponses).filter(r => r.respKind === 'verb:consult').every(r => r.respActual !== 'object')).toBe(true);
    expect(tick(world, state, [{ day: 2, seat: lead, command: cmd }]).rejections).toHaveLength(1);
    const saved = decodeSave(encodeSave({ worldHash: '0'.repeat(64), state })).state as unknown as typeof state;
    expect(menu(saved).consultations).toEqual(menu(state).consultations);
    const again = { ...cmd, round: second };
    expect(tick(world, saved, [{ day: 2, seat: lead, command: again }]).state).toEqual(tick(world, state, [{ day: 2, seat: lead, command: again }]).state);
  });

  it('refuses altered terms or recipients under an authentic round and keeps refusal distinct from advice', () => {
    const state = createState(world, { seed: 11 });
    const malformed = tick(world, state, [{ day: 1, seat: lead, command: { cmd: 'consult', situation: subject, posts: [POST('a_reserve')], round: first } }]);
    expect(malformed.rejections).toHaveLength(1);
    expect(knowledgeOf(malformed.state, lead).knownConsultationDispatches ?? []).toHaveLength(0);
  });

  it('records sending separately from receiving, preserves courier identity and supports one linked deliberate retry', () => {
    const far = { ...round(), advisers: [{ person: P('a_bold'), post: POST('a_reserve') }] };
    const world = fixture([far, round(second)]);
    const start = createState(world, { seed: 11 });
    const cmd = { cmd: 'consult' as const, situation: subject, posts: [POST('a_reserve')], round: first };
    const log = [{ day: 1, seat: lead, command: cmd }];
    const sent = tick(world, start, log).state;
    expect(knowledgeOf(sent, lead).knownConsultationDispatches).toHaveLength(1);
    expect(knowledgeOf(sent, seatIdFor(P('a_bold'))).knownPaperReceipts ?? []).toHaveLength(0);
    const original = sent.messagesInTransit.find(m => m.msgVerb?.verbConsultation !== undefined)!;
    const extra = tick(world, start, [{ day: 1, seat: lead, command: { ...cmd, round: second, posts: [POST('a_office')] } }, ...log]).state;
    expect(extra.messagesInTransit.find(m => m.msgVerb?.verbConsultation?.[0].key === 'first')).toEqual(original);
    let arrived = sent;
    while (arrived.stateDay < original.msgArriveDay) arrived = tick(world, arrived, []).state;
    expect(knowledgeOf(arrived, seatIdFor(P('a_bold'))).knownPaperReceipts?.[0]?.receiptOrigin).toBe(original.msgOrigin);
    const retry = { ...cmd, retryOf: original.msgOrigin };
    const retryDay = arrived.stateDay + 1;
    const retried = tick(world, arrived, [{ day: retryDay, seat: lead, command: retry }]);
    expect(retried.rejections).toHaveLength(0);
    expect(knowledgeOf(retried.state, lead).knownConsultationDispatches?.[0]).toMatchObject({ questionOrigin: original.msgOrigin, questionLatest: expect.any(String) });
    expect(tick(world, retried.state, [{ day: retryDay + 1, seat: lead, command: retry }]).rejections).toHaveLength(1);
    const replayed = replay(world, start, [...log, { day: retryDay, seat: lead, command: retry }], retryDay);
    expect(canonicalHash(replayed.state)).toBe(canonicalHash(retried.state));
  });

  it('never combines a new partial estimate with an older complete paper', () => {
    const initial = received(createState(world, { seed: 11 }), 'm.complete', 150);
    const partial = deliverReport(initial, seatIdFor(adviser), report('m.newer', { reportDay: 2, reportSubjectKind: 'situation', reportSubjectId: subject,
      reportCourseEvidence: [{ evidenceCourse: 'relief', evidenceResource: 'men', evidenceNeeded: 100, evidenceAvailable: null, evidenceReadyBy: null, evidenceNeededBy: null }] }, 2), NO_TRUTH);
    expect(generateCourseAdvice(world, partial, adviser, round(), 2).consultationAnswers[0]?.answerFeasibility).toMatchObject({ assessmentStatus: 'unknown', assessmentRequirements: [{ assessmentPaper: 'm.newer', evidenceAvailable: null }] });
  });

  it('does not file a receipt when the named adviser has left the addressed post', () => {
    const far = { ...round(), advisers: [{ person: P('a_bold'), post: POST('a_reserve') }] };
    const world = fixture([far]);
    const initial = createState(world, { seed: 11 });
    const sent = tick(world, initial, [{ day: 1, seat: lead, command: { cmd: 'consult', situation: subject, posts: [POST('a_reserve')], round: first } }]).state;
    const letter = sent.messagesInTransit.find(m => m.msgVerb?.verbConsultation !== undefined)!;
    let vacant = { ...sent, postStates: { ...sent.postStates, [POST('a_reserve')]: { ...sent.postStates[POST('a_reserve')]!, postHolder: null } } };
    while (vacant.stateDay < letter.msgArriveDay) vacant = tick(world, vacant, []).state;
    expect(knowledgeOf(vacant, seatIdFor(P('a_bold'))).knownPaperReceipts ?? []).toHaveLength(0);
    expect(Object.values(vacant.orderResponses).some(r => r.respOrder === letter.msgOrigin)).toBe(false);
    const packet = letter.msgVerb!.verbConsultation!;
    let forged: typeof sent = { ...sent, messagesInTransit: sent.messagesInTransit.map(m => m.id !== letter.id ? m : { ...m, msgVerb: { ...m.msgVerb!,
      verbConsultation: [packet[0], 'Altered question under the authentic key', packet[2], packet[3]] as const } }) };
    while (forged.stateDay < letter.msgArriveDay) forged = tick(world, forged, []).state;
    expect(knowledgeOf(forged, seatIdFor(P('a_bold'))).knownPaperReceipts ?? []).toHaveLength(0);
    expect(Object.values(forged.orderResponses).some(r => r.respOrder === letter.msgOrigin)).toBe(false);
  });
});
