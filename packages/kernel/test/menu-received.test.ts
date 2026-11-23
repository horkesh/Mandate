import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { State } from '../src/root-state.ts';
import { morningGround, pendingRequests, principalMenu } from '../src/seats/requests.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { fresh, report } from './support/s25-fixture.ts';
import { F, P, POST, R } from './support/seats-fixture.ts';

it('derives the principal’s force memberships in a single assignment pass', () => {
  const { world, state, seat } = fresh();
  const picture = viewFor(world, state, seat);
  const ground = morningGround(world, state, 1);
  const expected = principalMenu(world, state, F('a'), ground, undefined, picture);
  expect(expected.commandable.length).toBeGreaterThan(1);

  let enumerations = 0;
  const forceAssignments = new Proxy(state.forceAssignments, {
    ownKeys(assignments) {
      enumerations++;
      return Reflect.ownKeys(assignments);
    },
  });
  expect(principalMenu(world, { ...state, forceAssignments }, F('a'), ground, undefined, picture)).toEqual(expected);
  expect(enumerations).toBe(1);
});

it('S62: hidden holders, chains, seats, services, sides and remote battles cannot change principal menus or requests', () => {
  const { world, state: opening } = fresh();
  const state = { ...opening, stateDay: 10 };
  const variants: State[] = [
    { ...state, postStates: { ...state.postStates,
      [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: null, postParent: POST('a_filter'), postSeat: R('b_cap') },
      [POST('a_office')]: { ...state.postStates[POST('a_office')]!, postHolder: P('a_spy') },
    } },
    { ...state, personService: { ...state.personService, [P('a_gen')]: { serviceFaction: F('b'), serviceBloc: null, serviceChoice: 'resign', serviceDay: 5 } } },
    { ...state, departmentFactions: { ...state.departmentFactions, [toId('department', 'a_war')]: F('b') } },
    { ...state, forceAssignments: Object.fromEntries(Object.entries(state.forceAssignments).map(([id,post]) => [id,post === POST('a_army') ? null : post])) },
    { ...state, battleRecords: { hidden: { battleRegion: R('a_cap'), battleStartDay: 4, battleEndDay: null, battleFactions: [F('a'),F('b')], battleCauses: [], battleDays: [] } } },
  ];
  const menu = (s: State) => principalMenu(world, s, F('a'), morningGround(world, s, 11));
  const requests = (s: State, cache = createViewCache()) => pendingRequests(world, s, cache);
  const expectedMenu = JSON.stringify(menu(state));
  const expectedRequests = JSON.stringify(requests(state));
  const shared = createViewCache();
  for (const hidden of [...variants, { ...variants[0]!, personService: variants[1]!.personService, departmentFactions: variants[2]!.departmentFactions, battleRecords: variants[4]!.battleRecords, forceAssignments: variants[3]!.forceAssignments }]) {
    expect(JSON.stringify(menu(hidden))).toBe(expectedMenu);
    expect(JSON.stringify(requests(hidden))).toBe(expectedRequests);
    expect(JSON.stringify(requests(hidden, shared))).toBe(expectedRequests);
  }
});

it('S62: an unreceived vacancy stays commandable; a received loss opens only the known field vacancy', () => {
  const { world, state: opening, seat } = fresh();
  const state: State = { ...opening, stateDay: 10, postStates: { ...opening.postStates,
    [POST('a_army')]: { ...opening.postStates[POST('a_army')]!, postHolder: null },
    [POST('a_office')]: { ...opening.postStates[POST('a_office')]!, postHolder: null },
  } };
  const menu = (s: State) => principalMenu(world, s, F('a'), morningGround(world, s, 11));
  expect(menu(state).commandable.find(p => p.post === POST('a_army'))?.holder).toBe(P('a_gen'));
  expect(menu(state).vacancies).toEqual([]);
  let heard = state;
  for (const post of ['a_army','a_office']) heard = deliverReport(heard, seat, report(`m.loss.${post}`, {
    reportAuthor: P('a_clerk'), reportSubjectKind: 'post', reportSubjectId: post, reportDay: 5,
    reportClaims: [{ claimKind: 'commander-lost', claimRegion: null, claimValue: 1, claimToken: 'captured', claimConfidence: 1000 }],
  }, 10), NO_TRUTH);
  expect(menu(heard).commandable.some(p => p.post === POST('a_army'))).toBe(false);
  expect(menu(heard).vacancies.map(p => p.post)).toEqual([POST('a_army')]);
});

it('S62: a principal holding an office keeps his own declared side despite hidden department and service changes', () => {
  const { world: base } = fresh();
  const start = { ...base.start, posts: base.start.posts.map(p => p.id === POST('a_office') ? { ...p, holder: P('a_lead') } : p) };
  const world = indexSeatsWorld(base.map, start);
  const state = createState(world, { seed: 17 });
  const hidden: State = { ...state, departmentFactions: { ...state.departmentFactions, [toId('department', 'a_war')]: F('b') },
    personService: { ...state.personService, [P('a_lead')]: { serviceFaction: F('b'), serviceBloc: null, serviceChoice: 'resign', serviceDay: 0 } } };
  expect(pendingRequests(world, hidden)).toEqual(pendingRequests(world, state));
});

it('S62: a due appointment and raising offices use received establishment, never hidden acceptance or holders', () => {
  const { world: base } = fresh();
  const map = indexWorld({ ...base.map.world, vocabularies: { ...base.map.world.vocabularies,
    postKinds: base.map.world.vocabularies.postKinds.map(k => k.id === 'expedition' ? { ...k, creatable: 'appoint' as const } : k),
  }, rules: { ...base.map.world.rules,
    recruitment: { ...base.map.world.rules.recruitment, raisingPostKinds: ['office'] },
    ruleSeats: { ...base.map.world.rules.ruleSeats, principals: base.map.world.rules.ruleSeats.principals.map(r => r.faction !== F('a') ? r : {
      ...r, appointments: [{ post: POST('new_command'), person: P('a_spy'), onDate: '1900-06-02', source: 'fictional appointment' }],
    }) },
  } });
  const world = indexSeatsWorld(map, { ...base.start, temporaryPosts: [{ id: POST('new_command'), name: 'post.new', kind: 'expedition', department: toId('department', 'a_war'), parent: POST('a_office'), holder: null, region: R('a_front'), operation: 'new' }] });
  const state = { ...createState(world, { seed: 17 }), stateDay: 10 };
  const menu = (s: State) => principalMenu(world, s, F('a'), morningGround(world, s, 11));
  const expected = menu(state);
  expect(expected.historicalAppointments?.map(a => a.post)).toEqual([POST('new_command')]);
  expect(expected.raising.find(p => p.post === POST('a_office'))?.holder).toBe(P('a_sec'));
  const hidden: State = { ...state, postStates: { ...state.postStates,
    [POST('a_office')]: { ...state.postStates[POST('a_office')]!, postHolder: null, postSeat: R('b_cap') },
    [POST('new_command')]: { ...state.postStates[POST('a_army')]!, postHolder: P('a_spy') },
  } };
  expect(menu(hidden)).toEqual(expected);
});

it("S62: a hidden local battle changes its commanders' choices without reaching either principal", () => {
  const { world, state: opening } = fresh();
  const block = toId('forceBlock', 'b_army_1');
  const state: State = { ...opening, forceLocations: { ...opening.forceLocations, [block]: { ...opening.forceLocations[block]!, locRegion: R('a_front') } } };
  const hidden: State = { ...state, battleRecords: { hidden: { battleRegion: R('a_front'), battleStartDay: 0, battleEndDay: null, battleFactions: [F('a'),F('b')], battleCauses: [], battleDays: [] } } };
  const requests = (s: State) => pendingRequests(world, s);
  expect(requests(hidden).filter(r => r.menu.menuKind === 'principal')).toEqual(requests(state).filter(r => r.menu.menuKind === 'principal'));
  expect(requests(hidden).filter(r => r.menu.menuKind === 'battle').map(r => r.menu)).not.toEqual(requests(state).filter(r => r.menu.menuKind === 'battle').map(r => r.menu));
});
