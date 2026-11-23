import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createState } from '../src/tick/setup.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { F, indexedFixture, P, POST, R } from './support/seats-fixture.ts';

const base = indexedFixture(), map = base.map.world;
const blocs = [
  { id: 'a_public', faction: F('a'), voice: 1000, rest: 200, values: ['duty'], victory: 30, defeat: -30, cite: 'fixture' },
  { id: 'b_public', faction: F('b'), voice: 1000, rest: 200, values: ['duty'], victory: 30, defeat: -30, cite: 'fixture' },
];
const world = indexSeatsWorld(indexWorld({ ...map, vocabularies: { ...map.vocabularies, blocs: blocs.map(b => ({ id: b.id, name: `bloc.${b.id}` })) },
  rules: { ...map.rules, politics: { ...map.rules.politics, blocs, press: { ...map.rules.politics.press, papers: [{ id: 'a_page', faction: F('a'), editor: P('a_sec'), region: R('a_cap'), reachPermille: 1000, cite: 'fixture' }] } } } }), base.start);
const seat = seatIdFor(P('a_lead'));
it('offers public own-side bloc identities in the view and principal menu, without private weights or support', () => {
  const state = createState(world, { seed: 1 });
  const expected = world.map.world.rules.politics.blocs.filter(b => b.faction === F('a')).map(b => ({ id: b.id, name: world.map.world.vocabularies.blocs.find(v => v.id === b.id)!.name })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  expect(expected.length).toBeGreaterThan(0);
  const view = viewFor(world, state, seat);
  expect(view).toHaveProperty('politics.blocs', expected);
  expect(principalMenu(world, state, F('a'), morningGround(world, state, 1))).toHaveProperty('politicalBlocs', expected);
  expect(viewFor(world, state, seatIdFor(P('a_gen')))).toHaveProperty('politics.blocs', []);
  expect(Object.isFrozen(view.politics!.blocs)).toBe(true);
});
it('political evidence follows only this seat?s received press, retaining author, stamp, source and confidence', () => {
  const start = { ...createState(world, { seed: 1 }), stateDay: 3 };
  const body = { reportType: 'press' as const, reportSubtype: null, reportAuthor: P('a_sec'), reportAuthorPost: null,
    reportSubjectKind: 'person' as const, reportSubjectId: 'a_lead', reportClaims: [{ claimKind: 'framing' as const, claimRegion: null, claimValue: 321, claimToken: null, claimConfidence: 650 }],
    reportDay: 2, reportHour: null, reportAdvice: null, reportAnswers: null };
  const paper = { id: toId('message', 'page'), knownReceivedDay: 3, knownRoute: 'mail' as const, knownVia: [], knownBody: body };
  const held = deliverReport(start, seat, paper, NO_TRUTH);
  expect(viewFor(world, held, seat)).toHaveProperty('politics.evidence', [{ source: paper.id, author: body.reportAuthor, day: 2, receivedDay: 3, kind: 'framing', value: 321, confidence: 650 }]);
  const future = deliverReport(start, seat, { ...paper, knownReceivedDay: 4 }, NO_TRUTH);
  expect(viewFor(world, future, seat)).toHaveProperty('politics.evidence', []);
  expect(viewFor(world, { ...future, stateDay: 4 }, seat)).toHaveProperty('politics.evidence.0.source', paper.id);
  const other = deliverReport(start, seatIdFor(P('a_gen')), paper, NO_TRUTH);
  expect(viewFor(world, other, seat)).toHaveProperty('politics.evidence', []);
});
it('keeps political projection and audience catalogue equal across hidden support, framing and people reactions with fresh/shared caches', () => {
  const state = createState(world, { seed: 1 });
  const hidden = { ...state, blocSupport: Object.fromEntries(Object.keys(state.blocSupport).map(k => [k, -999])), warFraming: { [F('a')]: 999 }, personGrievances: {}, personRegard: {} };
  for (const cache of [undefined, createViewCache()]) {
    expect(Reflect.get(viewFor(world, hidden, seat, cache), 'politics')).toEqual(Reflect.get(viewFor(world, state, seat, cache), 'politics'));
  }
});
it('keeps the seat side and office catalogue equal across hidden post states and services with fresh/shared caches', () => {
  const state = createState(world, { seed: 1 });
  const hidden = { ...state,
    postStates: { ...state.postStates,
      [POST('a_office')]: { ...state.postStates[POST('a_office')]!, postHolder: P('a_lead'), postDepartment: toId('department', 'b_war'), postSeat: R('b_cap') },
      [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: P('b_gen') },
    },
    personService: { ...state.personService, [P('a_lead')]: { serviceChoice: 'resign' as const, serviceFaction: F('b'), serviceBloc: null, serviceDay: 0 } },
  };
  const politicalView = (s: typeof state, cache?: ReturnType<typeof createViewCache>) => {
    const v = viewFor(world, s, seat, cache);
    return { faction: v.faction, post: v.post, region: v.region, posts: v.posts, politics: v.politics };
  };
  expect(state.knowledgeBySeat).toBe(hidden.knowledgeBySeat);
  expect(politicalView(hidden)).toEqual(politicalView(state));
  for (const pair of [[state, hidden], [hidden, state]]) {
    const cache = createViewCache();
    const before = politicalView(pair[0]!, cache);
    expect(politicalView(pair[1]!, cache)).toEqual(before);
  }
});
it('changes political eligibility only when the seat receives the service account, including with a shared cache', () => {
  const state = createState(world, { seed: 1 });
  const paper = { id: toId('message', 'own-service'), knownReceivedDay: 2, knownRoute: 'in-person' as const, knownVia: [],
    knownBody: { reportType: 'wire-dispatch' as const, reportSubtype: null, reportAuthor: P('a_lead'), reportAuthorPost: null,
      reportSubjectKind: 'person' as const, reportSubjectId: 'a_lead', reportDay: 1, reportHour: null, reportAdvice: null, reportAnswers: null,
      reportClaims: [{ claimKind: 'service-choice' as const, claimRegion: null, claimValue: 1, claimToken: 'resign', claimConfidence: 1000 }] } };
  const pending = deliverReport({ ...state, stateDay: 1 }, seat, paper, NO_TRUTH);
  const received = { ...pending, stateDay: 2 };
  const cache = createViewCache();
  expect(viewFor(world, pending, seat, cache)).toMatchObject({ faction: F('a'), politics: { blocs: [{ id: 'a_public' }] } });
  // This fixture declares no destination government. An account cannot invent one.
  expect(viewFor(world, received, seat, cache)).toMatchObject({ faction: null, posts: [], politics: { blocs: [], evidence: [] } });
  expect(viewFor(world, received, seat, cache)).toEqual(viewFor(world, received, seat));
});
