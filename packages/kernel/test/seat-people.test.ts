import { expect, it } from 'vitest';
import { toId, type MessageId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { ReportBody } from '../src/knowledge/report.ts';
import type { State } from '../src/root-state.ts';
import type { SituationDef } from '../src/situations/types.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createState } from '../src/tick/setup.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { indexedFixture, F, P, POST } from './support/seats-fixture.ts';

const seat = seatIdFor(P('a_lead'));
const world = indexedFixture();
function receive(state: State, id: string, over: Partial<ReportBody> = {}, received = state.stateDay): State {
  return deliverReport(state, seat, {
    id: id as MessageId, knownReceivedDay: received, knownRoute: 'courier', knownVia: [],
    knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: P('a_gen'), reportAuthorPost: POST('a_army'),
      reportSubjectKind: 'post', reportSubjectId: 'a_army', reportDay: 1, reportHour: null, reportClaims: [], reportAdvice: null, reportAnswers: null, ...over },
  }, NO_TRUTH);
}
const claim = (kind: 'commander-lost' | 'verb-answered' | 'order-returned', token: string, value = 1) => ({ claimKind: kind, claimRegion: null, claimValue: value, claimToken: token, claimConfidence: 1000 });

it('includes own internal posts and initial vacancies, preserving pack parents, without inspecting current holders', () => {
  const start = { ...world.start, posts: world.start.posts.map(p => p.id === POST('a_reserve') ? { ...p, holder: null } : p) };
  const w = indexSeatsWorld(world.map, start);
  const state = createState(w, { seed: 1 });
  const view = viewFor(w, state, seat);
  expect(view.posts.map(p => [p.post, p.parent, p.holder, p.status])).toEqual([
    ['a_army', 'a_office', 'a_gen', 'held'], ['a_filter', null, 'a_clerk', 'held'],
    ['a_office', null, 'a_sec', 'held'], ['a_reserve', 'a_office', null, 'vacant'],
  ]);
  expect(view.posts.find(p => p.post === POST('a_reserve'))!.vacantSince).toBeNull();
  const hidden = { ...state, postStates: { ...state.postStates, [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: null, postParent: null } } };
  expect(viewFor(w, hidden, seat).posts).toEqual(view.posts);
});

it('uses dated received evidence for losses, appointments and unknown holders, never fills a reported new post from truth', () => {
  let state = { ...createState(world, { seed: 1 }), stateDay: 10 };
  state = receive(state, 'm.loss', { reportDay: 5, reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'), reportClaims: [claim('commander-lost', 'captured')] });
  state = receive(state, 'm.old', { reportDay: 2 }, 10);
  expect(viewFor(world, state, seat).posts.find(p => p.post === POST('a_army'))).toMatchObject({ holder: null, status: 'vacant', vacantSince: 5, source: 'm.loss' });
  state = receive(state, 'm.appoint', { reportDay: 6, reportAuthor: P('a_bold'), reportAuthorPost: null, reportClaims: [claim('verb-answered', 'appoint:comply')] });
  expect(viewFor(world, state, seat).posts.find(p => p.post === POST('a_army'))).toMatchObject({ holder: 'a_bold', status: 'held' });
  state = receive(state, 'm.changed', { reportDay: 7, reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'), reportClaims: [claim('order-returned', 'holder_changed')] });
  state = receive(state, 'm.new', { reportSubjectId: 'unplaced', reportAuthorPost: null });
  expect(viewFor(world, state, seat).posts.find(p => p.post === POST('a_army'))).toMatchObject({ holder: null, status: 'unknown' });
  expect(viewFor(world, state, seat).posts.find(p => p.post === toId('post', 'unplaced'))).toMatchObject({ parent: null, placementKnown: false, holder: null, status: 'unknown' });
});

it('projects only received consults, person assessments and observer letters; public standing is explicitly public', () => {
  let state = { ...createState(world, { seed: 1 }), stateDay: 10 };
  state = receive(state, 'm.consult', { reportType: 'advice', reportSubtype: 'requested', reportClaims: [claim('verb-answered', 'consult:comply')], reportAdvice: { adviceRecommends: 'wait', adviceConfidence: 700, adviceReasons: [] } });
  state = receive(state, 'm.assessment', { reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'), reportSubjectKind: 'person', reportSubjectId: 'a_gen', reportType: 'advice', reportSubtype: 'memorandum', reportAdvice: { adviceRecommends: 'retain', adviceConfidence: 400, adviceReasons: [] } });
  state = receive(state, 'm.observer', { reportAuthor: P('a_spy'), reportAuthorPost: null, reportType: 'observer-letter' });
  state = receive(state, 'm.future', { reportDay: 11, reportAuthor: P('b_gen'), reportAuthorPost: POST('secret') }, 11);
  const view = viewFor(world, state, seat), person = view.people.find(p => p.person === P('a_gen'))!;
  expect(person.standing).toBe(state.personStanding[P('a_gen')]);
  expect(person.stances).toEqual([{ subjectKind: 'post', subjectId: 'a_army', recommends: 'wait', confidence: 700, day: 1, source: 'm.consult' }]);
  expect(person.assessments).toEqual(['m.assessment']);
  expect(view.posts.find(p => p.post === POST('a_army'))!.observerReports).toEqual(['m.observer']);
  expect(view.posts.some(p => p.post === POST('secret'))).toBe(false);
  expect(view.people.some(p => p.person === P('b_gen'))).toBe(false);
  const hidden = { ...state, personTraits: {}, personGrievances: {}, personStances: {}, observerPostings: {}, orderResponses: {}, audienceHeld: {}, reportTruth: {} };
  expect([viewFor(world, hidden, seat).posts, viewFor(world, hidden, seat).people]).toEqual([view.posts, view.people]);
  expect(Object.isFrozen(person.stances[0])).toBe(true);
});

it('keeps projection references stable, invalidates on receipt and public standing changes, and does not populate other seats', () => {
  const state = createState(world, { seed: 1 }), cache = createViewCache();
  const one = viewFor(world, state, seat, cache);
  expect(viewFor(world, state, seat, cache)).toBe(one);
  const two = viewFor(world, { ...state, stateDay: 1 }, seat, cache);
  expect(two.posts).toBe(one.posts); expect(two.people).toBe(one.people);
  const three = viewFor(world, { ...state, personStanding: { ...state.personStanding, [P('a_gen')]: 987 } }, seat, cache);
  expect(three.people.find(p => p.person === P('a_gen'))!.standing).toBe(987);
  expect(viewFor(world, receive({ ...state, stateDay: 1 }, 'm.received'), seat, cache).posts).not.toBe(one.posts);
  expect(viewFor(world, state, seatIdFor(P('a_gen'))).posts).toEqual([]);
});

it('does not reveal live standing for an enemy named as author or subject, with or without a shared cache', () => {
  let state = { ...createState(world, { seed: 1 }), stateDay: 10 };
  state = receive(state, 'm.enemy-author', { reportAuthor: P('b_gen'), reportAuthorPost: null });
  state = receive(state, 'm.enemy-subject', { reportSubjectKind: 'person', reportSubjectId: 'b_min' });
  const hidden = { ...state, personStanding: { ...state.personStanding, [P('b_gen')]: 999, [P('b_min')]: 1 } };
  const before = viewFor(world, state, seat);
  for (const id of ['b_gen', 'b_min']) expect(before.people.find(p => p.person === P(id))!.standing).toBeNull();
  expect(viewFor(world, hidden, seat)).toEqual(before);
  const cache = createViewCache();
  expect(viewFor(world, hidden, seat, cache)).toEqual(viewFor(world, state, seat, cache));
  expect(before.people.find(p => p.person === P('a_gen'))!.standing).toBe(state.personStanding[P('a_gen')]);
});

it.each([F('b'), null])('keeps standing and cached catalogues unchanged when hidden command tables change to %s', side => {
  const state = createState(world, { seed: 1 }), cache = createViewCache();
  const before = viewFor(world, state, seat, cache);
  const foreign = { ...state, departmentFactions: { ...state.departmentFactions, [toId('department', 'a_war')]: side } };
  const after = viewFor(world, foreign, seat, cache);
  expect(after.people).toBe(before.people);
  expect(after.posts).toBe(before.posts);
  expect(viewFor(world, foreign, seat).people).toEqual(before.people);
  const released = { ...foreign, postStates: { ...foreign.postStates, [POST('a_army')]: { ...foreign.postStates[POST('a_army')]!, postHolder: null } } };
  const restored = viewFor(world, released, seat, cache);
  expect(restored.people.find(p => p.person === P('a_gen'))!.standing).toBe(state.personStanding[P('a_gen')]);
  expect(restored.people).toBe(before.people);
  expect(restored.posts).toBe(before.posts);
  expect(viewFor(world, released, seat).people).toEqual(before.people);
});

const sideNotice = (id: string, side: 'a' | 'b'): SituationDef => ({
  id: toId('situation', id), kind: 'notice', faction: F('a'), title: 'notice.title', text: 'notice.text',
  earliest: '1900-06-01', event: { dayAtLeast: 1 }, knowledge: null, railroad: 'test fixture', chain: null,
  subjects: [], options: [], inaction: null, historicalDefault: null, staffLine: null,
  delegableTo: [], resurfaceOn: [],
  effects: [{ propose: { owner: 'command', field: 'department_side', subject: 'a_war', side: F(side), delta: 1, reason: 'notice' } }],
  report: { authors: [POST('a_office')], reportType: 'wire-dispatch', subtype: null },
  gate: { none: 'test fixture' }, gateReview: null, citations: [],
});

it('changes known side only on a received government notice, in written order, independent of hidden truth', () => {
  const w = indexedFixture({}, [sideNotice('joins_b', 'b'), sideNotice('returns_a', 'a')]);
  const state = { ...createState(w, { seed: 1 }), stateDay: 10 };
  const hidden = { ...state, departmentFactions: { ...state.departmentFactions, [toId('department', 'a_war')]: F('b') } };
  const notice = { reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'), reportSubjectKind: 'situation' as const, reportSubjectId: 'joins_b', reportDay: 5 };
  for (const cache of [undefined, createViewCache()]) {
    const before = viewFor(w, state, seat, cache);
    expect(viewFor(w, hidden, seat, cache).people).toEqual(before.people);
    const told = receive(state, 'm.notice', notice);
    const changed = viewFor(w, told, seat, cache);
    expect(changed.people.find(p => p.person === P('a_gen'))!.standing).toBeNull();
    expect(viewFor(w, receive(hidden, 'm.notice', notice), seat, cache).people).toEqual(changed.people);
    const restored = receive(told, 'm.newer', { ...notice, reportSubjectId: 'returns_a', reportDay: 7 });
    const late = receive(restored, 'm.old', { ...notice, reportDay: 3 });
    expect(viewFor(w, late, seat, cache).people.find(p => p.person === P('a_gen'))!.standing).toBe(state.personStanding[P('a_gen')]);
    const laterTruth = { ...told, personStanding: { ...state.personStanding, [P('a_gen')]: 999 }, postStates: { ...state.postStates, [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: null } } };
    expect(viewFor(w, laterTruth, seat, cache).people.find(p => p.person === P('a_gen'))!.standing).toBeNull();
    for (const over of [{ reportDay: 11 }, { reportType: 'observer-letter' as const }, { reportSubjectKind: 'post' as const }]) {
      expect(viewFor(w, receive(state, 'm.not-notice', { ...notice, ...over }), seat, cache).people).toEqual(before.people);
    }
    const pending = receive(state, 'm.pending', notice, 11);
    expect(viewFor(w, pending, seat, cache).people).toEqual(before.people);
    expect(viewFor(w, { ...pending, stateDay: 11 }, seat, cache).people.find(p => p.person === P('a_gen'))!.standing).toBeNull();
  }
});

it.each([null, P('a_bold')])('T5: a declined appointment preserves the last known holder %s', holder => {
  const w = indexSeatsWorld(world.map, { ...world.start, posts: world.start.posts.map(p => p.id === POST('a_reserve') ? { ...p, holder } : p) });
  let state = { ...createState(w, { seed: 1 }), stateDay: 10 };
  state = receive(state, 'm.declined', { reportAuthor: P('a_spy'), reportAuthorPost: null, reportSubjectId: 'a_reserve', reportClaims: [claim('verb-answered', 'appoint:refuse', 0)] });
  expect(viewFor(w, state, seat).posts.find(p => p.post === POST('a_reserve'))).toMatchObject({ holder, status: holder === null ? 'vacant' : 'held', source: null, asOfDay: 0 });
});

it('T6: an own letter about the man is not an assessment of him', () => {
  let state = { ...createState(world, { seed: 1 }), stateDay: 10 };
  const about = { reportSubjectKind: 'person' as const, reportSubjectId: 'a_gen', reportType: 'advice' as const, reportSubtype: 'memorandum', reportAdvice: { adviceRecommends: 'retain', adviceConfidence: 700, adviceReasons: [] } };
  state = receive(state, 'm.self', about);
  state = receive(state, 'm.other', { ...about, reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office') });
  const view = viewFor(world, state, seat);
  expect(view.people.find(p => p.person === P('a_gen'))!.assessments).toEqual(['m.other']);
  expect(view.reports.some(r => r.id === 'm.self')).toBe(true);
});

it.each([
  { subtype: 'memorandum', claims: [] },
  { subtype: 'requested', claims: [] },
  { subtype: 'requested', claims: [claim('verb-answered', 'inquire:comply')] },
  { subtype: 'requested', claims: [claim('verb-answered', 'consult:refuse', 0)] },
])('T9: advice without a recorded consult stance is not a stance (%j)', ({ subtype, claims }) => {
  let state = { ...createState(world, { seed: 1 }), stateDay: 10 };
  const advice = { reportType: 'advice' as const, reportSubtype: subtype, reportAdvice: { adviceRecommends: 'wait', adviceConfidence: 700, adviceReasons: [] } };
  state = receive(state, 'm.not-consult', { ...advice, reportClaims: claims });
  state = receive(state, 'm.actual-consult', { ...advice, reportSubtype: 'requested', reportDay: 2, reportClaims: [claim('verb-answered', 'consult:comply')] });
  const view = viewFor(world, state, seat);
  expect(view.people.find(p => p.person === P('a_gen'))!.stances).toEqual([{ subjectKind: 'post', subjectId: 'a_army', recommends: 'wait', confidence: 700, day: 2, source: 'm.actual-consult' }]);
  expect(view.reports.some(r => r.id === 'm.not-consult')).toBe(true);
});
