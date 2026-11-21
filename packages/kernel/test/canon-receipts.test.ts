import { describe, expect, it } from 'vitest';
import { toId, type MessageId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import type { ReportBody } from '../src/knowledge/report.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { principalMenu, morningGround } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createState } from '../src/tick/setup.ts';
import type { State } from '../src/root-state.ts';
import { indexedFixture, F, P, POST } from './support/seats-fixture.ts';
import { tick } from '../src/tick/tick.ts';
import { goalTerms } from './support/test-seats.ts';
import { previewEdit } from '../src/tick/edit-preview.ts';
import { viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { plannerInputFor } from '../src/planner/input.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { passageOf } from '../src/tick/passage.ts';
import { draft } from '../src/planner/draft.ts';
import { pruneKnowledge } from '../src/knowledge/knowledge.ts';

const world = indexedFixture(), principal = P('a_lead'), seat = seatIdFor(principal);
const menu = (s: State) => principalMenu(world, s, F('a'), morningGround(world, s, s.stateDay + 1));
function received(s: State, over: Partial<ReportBody> = {}): State {
  return deliverReport(s, seat, { id: 'm.strength' as MessageId, knownReceivedDay: 1, knownRoute: 'courier', knownVia: [],
    knownBody: { reportType: 'strength-return', reportSubtype: null, reportAuthor: P('a_gen'), reportAuthorPost: POST('a_army'), reportSubjectKind: 'post', reportSubjectId: 'a_army', reportClaims: [{ claimKind: 'present-for-duty', claimRegion: null, claimValue: 876, claimToken: null, claimConfidence: 900 }], reportDay: 1, reportHour: null, reportAdvice: null, reportAnswers: null, ...over },
  }, NO_TRUTH);
}
describe('S36 received menus', () => {
  it('A01 keeps byte-identical menus across unreported own strength changes; absent returns are unknown', () => {
    const state = { ...createState(world, { seed: 1 }), stateDay: 2 };
    const id = toId('forceBlock', 'a_army_1');
    const changed = { ...state, forceBlockStates: { ...state.forceBlockStates, [id]: { ...state.forceBlockStates[id]!, fbStrength: 17 } } };
    expect(JSON.stringify(menu(changed))).toBe(JSON.stringify(menu(state)));
    expect(menu(state).commandable.find(p => p.post === POST('a_army'))!.men).toBeNull();
    const reported = menu(received(state)).commandable.find(p => p.post === POST('a_army'))!;
    expect(reported.men).toBe(876);
    expect(reported.strengthReport).toEqual({ source: 'm.strength', author: 'a_gen', asOfDay: 1 });
    expect(JSON.stringify(menu(received(changed)))).toBe(JSON.stringify(menu(received(state))));
  });
  it.each(['status', 'service', 'post', 'rank'] as const)('A02 ignores unreceived candidate %s', (change) => {
    const state = createState(world, { seed: 1 });
    const changed: State = change === 'status' ? { ...state, personStatus: { ...state.personStatus, [P('a_spy')]: { statusKind: 'killed', statusDay: 0 } } }
      : change === 'service' ? { ...state, personService: { ...state.personService, [P('a_spy')]: { serviceChoice: 'resign', serviceFaction: F('b'), serviceBloc: null, serviceDay: 0 } } }
      : change === 'post' ? { ...state, postStates: { ...state.postStates, [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: P('a_spy') } } }
      : { ...state, personRanks: { ...state.personRanks, [P('a_spy')]: { regular: { rankTerm: 'unknown-rank', rankSince: '1900-06-01' } } } };
    expect(menu(state).candidates.some(c => c.person === P('a_spy'))).toBe(true);
    expect(JSON.stringify(menu(changed).candidates)).toBe(JSON.stringify(menu(state).candidates));
    expect(JSON.stringify(viewFor(world,changed,seat))).toBe(JSON.stringify(viewFor(world,state,seat)));
  });
});

function submittedState(): State {
  let s = createState(world, { seed: 1 });
  for (let day = 1; day <= 20; day++) {
    s = tick(world, s, day === 1 ? [{ day, seat, command: { cmd: 'order', to: POST('a_reserve'), goal: goalTerms('take', 'b_mid', { approveAsDrafted: false }), route: 'special-messenger', bypass: true } }] : [], { freeze: true }).state;
    if (menu(s).reviews.some(r => r.post === POST('a_reserve'))) return s;
  }
  throw new Error('fixture never received submitted review');
}
it('A03 preserves the received paper across unreported vacancy and private replanning', () => {
  const state = submittedState(), post = POST('a_reserve');
  const changed = { ...state, postStates: { ...state.postStates, [post]: { ...state.postStates[post]!, postHolder: null } }, planRecords: { ...state.planRecords, [post]: { ...state.planRecords[post]!, planChosen: null, planStatus: 'drafting' as const } } };
  expect(JSON.stringify(menu(changed).reviews)).toBe(JSON.stringify(menu(state).reviews));
  expect(menu(changed).reviews).toHaveLength(1);
  expect(JSON.stringify(viewFor(world,changed,seat))).toBe(JSON.stringify(viewFor(world,state,seat)));
  const next = tick(world,changed,[{day:state.stateDay+1,seat,command:{cmd:'review',to:post,action:'approve',edit:null,route:'special-messenger',bypass:true}}],{freeze:true});
  expect(next.rejections).toEqual([]);
});
it('A04 previews from the received submission across unreceived intelligence, profile and vacancy changes', () => {
  const state = submittedState(), post = POST('a_reserve');
  const review = menu(state).reviews[0]!;
  const edit = { kind: 'timing' as const, axis: review.plan.axes[0]!.name, region: null, via: [], concentration: 3 };
  const before = previewEdit(world, state, post, edit, state.stateDay + 1);
  expect(before.ok).toBe(true);
  const otherSeat = seatIdFor(P('a_bold'));
  const privateIntel = deliverReport(state, otherSeat, { id: 'm.private' as MessageId, knownReceivedDay: state.stateDay, knownRoute: 'courier', knownVia: [], knownBody: { reportType: 'enemy-estimate', reportSubtype: null, reportAuthor: P('a_spy'), reportAuthorPost: null, reportSubjectKind: 'enemy', reportSubjectId: 'b', reportClaims: [{ claimKind: 'enemy-strength', claimRegion: toId('region','b_mid'), claimValue: 17000, claimToken: null, claimConfidence: 900 }], reportDay: state.stateDay, reportHour: null, reportAdvice: null, reportAnswers: null } }, NO_TRUTH);
  const hidden = { ...privateIntel, postStates: { ...privateIntel.postStates, [post]: { ...privateIntel.postStates[post]!, postHolder: null } }, personTrue: { ...privateIntel.personTrue, [P('a_bold')]: { ...privateIntel.personTrue[P('a_bold')]!, trueCompetence: 1 } } };
  expect(JSON.stringify(viewFor(world, privateIntel, seat))).toBe(JSON.stringify(viewFor(world,state,seat)));
  expect(JSON.stringify(previewEdit(world, privateIntel, post, edit, state.stateDay+1))).toBe(JSON.stringify(before));
  expect(JSON.stringify(previewEdit(world, hidden, post, edit, state.stateDay+1))).toBe(JSON.stringify(before));
  expect(JSON.stringify(menu(state))).not.toContain('paperProfile');
  expect(JSON.stringify(viewFor(world,state,seat))).not.toContain('paperProfile');
});

it('A03 keeps one received submission actionable beyond ordinary report age, without reading a live plan', () => {
  const state = submittedState();
  const aged = {...state,stateDay:state.stateDay+100};
  const pruned = pruneKnowledge(aged,world.rules.templates,aged.stateDay,world.map.world.rules.supplyControlPermille).state;
  expect(menu(pruned).reviews).toEqual(menu(aged).reviews);
  expect(menu(pruned).reviews).toHaveLength(1);
});

it('A05 keeps byte-identical drafts and views when only unreported enemy control changes', () => {
  const state = submittedState(), region = toId('region','b_mid'), post = POST('a_reserve');
  const changed = { ...state, regionControl: { ...state.regionControl, [region]: { [F('b')]: 900 } } };
  const seat = seatIdFor(P('a_bold'));
  const view = viewFor(world,state,seat);
  expect(JSON.stringify(viewFor(world,changed,seat))).toBe(JSON.stringify(view));
  const from = (s: State) => { const network = passageOf(world.map,s); return plannerInputFor(world,s,deriveMap(world.map,{control:s.regionControl,network,month:6}),network,6,view,post,state.planRecords[post]!.planGoal,state.stateDay+1); };
  const before = from(state), after = from(changed);
  expect([...after.supply.paths]).toEqual([...before.supply.paths]);
  expect(JSON.stringify(draft(after))).toBe(JSON.stringify(draft(before)));
});

it('A02 ranks candidates by the public opening ranks instead of hidden promotion state', () => {
  const map = indexWorld({ ...world.map.world, vocabularies: { ...world.map.world.vocabularies, ranks: [{id:'high',name:'rank.high',kind:'regular',seniority:1}], rankKinds: [{id:'regular',name:'rank.regular'}] } });
  const w = indexSeatsWorld(map,world.start), state = createState(w,{seed:1});
  const hidden = { ...state, personRanks: {...state.personRanks,[P('a_spy')]:{regular:{rankTerm:'high',rankSince:'1900-06-01'}}} };
  const candidates = (s: State) => principalMenu(w,s,F('a'),morningGround(w,s,1)).candidates;
  expect(JSON.stringify(candidates(hidden))).toBe(JSON.stringify(candidates(state)));
});

it('A02 accepts an apparently eligible nomination and reports actual ineligibility on resolution', () => {
  const w = indexSeatsWorld(world.map,{...world.start,posts:world.start.posts.map(p => p.id === POST('a_reserve') ? {...p,holder:null}:p)});
  let s = createState(w,{seed:1});
  s = {...s,personStatus:{...s.personStatus,[P('a_spy')]:{statusKind:'killed',statusDay:0}}};
  const first = tick(w,s,[{day:1,seat,command:{cmd:'appoint',post:POST('a_reserve'),person:P('a_spy'),rank:null,route:'special-messenger'}}],{freeze:true});
  expect(first.rejections).toEqual([]);
  s = first.state;
  for(let day=2; day<=12; day++) s=tick(w,s,[],{freeze:true}).state;
  expect(s.postStates[POST('a_reserve')]!.postHolder).toBeNull();
  const refusal = s.knowledgeBySeat[seat]!.knownReports.flatMap(r=>r.knownBody.reportClaims).find(c=>c.claimKind==='appointment-refused');
  expect(refusal).toMatchObject({claimToken:'not_serving',claimValue:0});
  expect(principalMenu(w,s,F('a'),morningGround(w,s,s.stateDay+1)).candidates.some(c=>c.person===P('a_spy'))).toBe(false);
});
