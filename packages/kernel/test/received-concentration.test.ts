import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { State } from '../src/root-state.ts';
import type { SituationDef } from '../src/situations/types.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { F, indexedFixture, P, POST } from './support/seats-fixture.ts';
import { report } from './support/s25-fixture.ts';

const seat = seatIdFor(P('a_lead'));
const notice: SituationDef = {
  id: toId('situation', 'government_joins'), kind: 'notice', faction: F('a'), title: 'notice.title', text: 'notice.text',
  earliest: '1900-06-01', event: { dayAtLeast: 1 }, knowledge: null, railroad: 'test fixture', chain: null,
  subjects: [], options: [], inaction: null, historicalDefault: null, staffLine: null, delegableTo: [], resurfaceOn: [],
  effects: [{ propose: { owner: 'command', field: 'department_side', subject: 'b_war', side: F('a'), delta: 1, reason: 'notice' } }],
  report: { authors: [POST('a_office')], reportType: 'wire-dispatch', subtype: null },
  gate: { none: 'test fixture' }, gateReview: null, citations: [],
};
function fixture(required = 'a_war') {
  const base = indexedFixture({}, [notice]);
  const map = indexWorld({ ...base.map.world, rules: { ...base.map.world.rules, ruleSeats: {
    ...base.map.world.rules.ruleSeats, principals: base.map.world.rules.ruleSeats.principals.map(row => row.faction !== F('a') ? row : {
      ...row, concentrateAt: POST('a_reserve'), concentrateSource: 'fictional opening concentration',
      concentrations: [{ post: POST('a_army'), fromDate: '1900-06-05', requiresDepartment: toId('department', required),
        fromPosts: [POST('a_reserve')], source: 'fictional dated concentration' }],
    }),
  } } });
  const world = indexSeatsWorld(map, base.start, { situations: base.situations });
  const state = { ...createState(world, { seed: 17 }), stateDay: 10 };
  const cache = createViewCache();
  const doctrine = (s: State) => principalMenu(world, s, F('a'), morningGround(world, s, s.stateDay + 1), cache).doctrine;
  return { world, state, doctrine };
}

it('S40: unreceived holder, post-department and government changes leave dated concentration byte-identical', () => {
  const { world, state, doctrine } = fixture();
  expect(doctrine(state).concentrateAt).toBe(POST('a_army'));
  const hidden: State = { ...state,
    postStates: { ...state.postStates, [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: null, postDepartment: toId('department', 'b_war') } },
    departmentFactions: { ...state.departmentFactions, [toId('department', 'a_war')]: F('b') },
  };
  expect(viewFor(world, hidden, seat).posts).toEqual(viewFor(world, state, seat).posts);
  expect(JSON.stringify(doctrine(hidden))).toBe(JSON.stringify(doctrine(state)));
  const lost = deliverReport(hidden, seat, report('m.loss', {
    reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'), reportSubjectKind: 'post', reportSubjectId: 'a_army',
    reportDay: 5, reportClaims: [{ claimKind: 'commander-lost', claimRegion: null, claimValue: 1, claimToken: 'captured', claimConfidence: 1000 }],
  }, 10), NO_TRUTH);
  expect(doctrine(lost).concentrateAt).toBe(POST('a_reserve'));
  expect(doctrine({ ...state, stateDay: 2 }).concentrateAt).toBe(POST('a_reserve'));
});

it('S40: a government prerequisite waits for its matching received notice, not its live side', () => {
  const { state, doctrine } = fixture('b_war');
  const hidden: State = { ...state, departmentFactions: { ...state.departmentFactions, [toId('department', 'b_war')]: F('a') } };
  expect(doctrine(state).concentrateAt).toBe(POST('a_reserve'));
  expect(JSON.stringify(doctrine(hidden))).toBe(JSON.stringify(doctrine(state)));
  const paper = report('m.notice', { reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'),
    reportSubjectKind: 'situation', reportSubjectId: notice.id, reportDay: 5 }, 10);
  const heard = deliverReport(hidden, seat, paper, NO_TRUTH);
  expect(doctrine(heard).concentrateAt).toBe(POST('a_army'));
  expect(doctrine(deliverReport(state, seat, paper, NO_TRUTH))).toEqual(doctrine(heard));
  for (const changed of [
    { ...paper, knownReceivedDay: 11 },
    { ...paper, knownBody: { ...paper.knownBody, reportDay: 11 } },
    { ...paper, knownBody: { ...paper.knownBody, reportType: 'press' as const } },
    ...(['appoint:complied', 'call'] as const).map(token => ({ ...paper, knownBody: { ...paper.knownBody,
      reportSubjectKind: 'post' as const, reportSubjectId: 'a_army', reportClaims: [{ claimKind: token === 'call' ? 'call-answer' as const : 'verb-answered' as const,
        claimToken: token, claimValue: 1, claimRegion: null, claimConfidence: 1000 }],
    } })),
  ]) expect(doctrine(deliverReport(hidden, seat, changed, NO_TRUTH)).concentrateAt).toBe(POST('a_reserve'));
});
