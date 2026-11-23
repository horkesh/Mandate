import { forceTotals } from '../src/forces/lots.ts';
import { expect, it } from 'vitest';
import { relieveHolder } from '../src/command/command.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { toId } from '../src/ids.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { draft } from '../src/planner/draft.ts';
import { plannerInputFor } from '../src/planner/input.ts';
import { saveDraft, setGoal } from '../src/plans/plans.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld, type SeatsWorld } from '../src/seats/world.ts';
import { commanderLossReports } from '../src/tick/commander-losses.ts';
import { bombardFort } from '../src/tick/bombard.ts';
import { controlReports } from '../src/tick/control-reports.ts';
import { deliverSituationOrders } from '../src/tick/deliver.ts';
import { applyDetachmentProposals } from '../src/tick/detachments.ts';
import { commandProposalsPhase } from '../src/tick/forces.ts';
import { deepFreeze } from '../src/tick/freeze.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { operationsPhase } from '../src/tick/operations.ts';
import { goalOf, issueOrder } from '../src/tick/orders.ts';
import { passageOf } from '../src/tick/passage.ts';
import { serviceChoices, WEEK_MECHANICS } from '../src/tick/people-week.ts';
import { choosingPosts, planKey } from '../src/tick/plans.ts';
import { politicsPhase, POLITICS_MECHANICS } from '../src/tick/politics.ts';
import { issueCall } from '../src/tick/recruitment.ts';
import { regionsPhase, REGIONS_MECHANICS } from '../src/tick/regions.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, TICK_MECHANICS } from '../src/tick/tick.ts';
import { viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { fresh } from './support/s25-fixture.ts';
import { B } from './support/forces-fixture.ts';
import { edge } from './support/map-fixture.ts';
import { F, P, POST, R } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';
import { goalTerms, order } from './support/test-seats.ts';

const mechanics = [...new Set([...TICK_MECHANICS, ...MAP_MECHANICS, ...WEEK_MECHANICS, ...POLITICS_MECHANICS, ...REGIONS_MECHANICS])];
const context = (world: SeatsWorld, state: State, day = 1) => ctxFor(world, state, day, mechanics);

function prepared(world = fresh().world) {
  const initial = createState(world, { seed: 17 });
  const post = POST('a_army'), network = passageOf(world.map, initial);
  const derived = deriveMap(world.map, { control: initial.regionControl, month: 6, network });
  const goal = goalOf(goalTerms('take', 'b_front'));
  const input = plannerInputFor(world, initial, derived, network, 6, viewFor(world, initial, seatIdFor(P('a_gen'))), post, goal, 1);
  const set = draft(input);
  const ordered = setGoal(initial, post, { id: toId('message', 's25.tick.goal'), issuer: P('a_lead'), goal, viaChain: true, issuedDay: 1, response: 's25.tick.answer' }, 1);
  return { world, initial, post, input, set, state: saveDraft(ordered, post, set) };
}

it('S25 tick-04: a bombardment with no casualties does not fire killed-and-wounded telemetry', () => {
  const { world: base } = fresh();
  const combat = base.map.world.rules.combat;
  const map = indexWorld({ ...base.map.world,
    edges: [...base.map.world.edges.filter(e => e.id !== 'road:a_front:b_front'), edge('a_front', 'b_front', { type: 'sea' })],
    rules: { ...base.map.world.rules, combat: { ...combat, bombardment: { ...combat.bombardment,
      objectives: [{ region: R('b_front'), source: 'FIXTURE' }], lossPermille: 0 } } },
  });
  const world = indexSeatsWorld(map, { ...base.start, forceBlocks: base.start.forceBlocks.map(b =>
    [B('a_army_1'), B('b_army_1')].includes(b.id) ? { ...b, arm: 'artillery' } : b) });
  const state = createState(world, { seed: 17 }), ctx = context(world, state);
  const result = bombardFort(ctx, state, POST('a_army'), [B('a_army_1')], R('b_front'), F('a'), []);
  expect(result.fort).not.toBeNull();
  expect(result.fort!.day.losses).toBe(0);
  expect(ctx.telemetry!.mechanics['combat.bombardment']!.fires).toBe(1);
  expect(ctx.telemetry!.mechanics['combat.killed_wounded']).toEqual({ fires: 0, magnitude: 0 });
});

it('S25 tick-05: a newly captured commander generates a loss report through his surviving staff', () => {
  const { world, state } = fresh();
  const next = relieveHolder(applyPeopleChanges(state, [{ change: 'status', person: P('a_gen'), status: 'captured' }], 1, world.rules.people, world.map.world.vocabularies.ranks), POST('a_army'));
  const ctx = context(world, state);
  commanderLossReports(ctx, state, next);
  expect(ctx.outbox.map(m => m.msgReport).filter(r => r?.reportClaims.some(c => c.claimKind === 'commander-lost'))).toHaveLength(1);
  expect(ctx.outbox[0]!.msgReport).toMatchObject({ reportSubjectId: 'a_army', reportAuthor: P('a_sec') });
});

it('S25 tick-07: a vacant local command cannot sign its own control return', () => {
  const { world, state } = fresh();
  const next = { ...relieveHolder(state, POST('a_army')), regionControl: { ...state.regionControl, [R('a_front')]: { a: 700 } } };
  const ctx = context(world, next);
  ctx.mapEvents.push({ event: 'control_changed', change: { region: R('a_front'), faction: F('a'), before: 100, after: 700, cause: 'occupation', takenFrom: [] } });
  controlReports(ctx, next, state.regionControl);
  expect(ctx.outbox).toHaveLength(1);
  expect(ctx.outbox[0]!.msgReport).toMatchObject({ reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office') });
});

it('S25 tick-08: the first late-day situation order can arrive the same day', () => {
  const { world, state, seat } = fresh();
  const near = { ...state, forceLocations: { ...state.forceLocations, [B('a_army_1')]: { ...state.forceLocations[B('a_army_1')]!, locRegion: R('a_cap') } } };
  const ctx = context(world, near);
  expect(issueOrder(ctx, near, seat, order('a_army', 'hold', null, 'wire', true))).toBeNull();
  expect(ctx.outbox).toHaveLength(1);
  expect(ctx.outbox[0]!.msgArriveDay).toBe(1);
  expect(deliverSituationOrders(ctx, near, 0).planRecords[POST('a_army')]!.planGoal.goalPosture).toBe('hold');
});

it('S25 tick-09: a valid garrison proposal reaches all three owners', () => {
  const { world, state } = fresh();
  const result = applyDetachmentProposals(world.map, state, [{ kind: 'garrison', parent: B('a_army_1'), men: 1, post: POST('a_army'), cause: 'command' }], 1);
  expect(result.refused).toEqual([]);
  expect(result.made).toHaveLength(1);
  const id = result.made[0]!;
  expect(forceTotals(result.state.forceBlockStates[id]!).fbStrength).toBe(1);
  expect(result.state.forceLocations[id]!.locRegion).toBe(R('a_front'));
  expect(result.state.forceAssignments[id]).toBe(POST('a_army'));
});

it('S25 tick-11: a refused landing never counts as a completed landing', () => {
  const { world, state } = fresh();
  const ctx = context(world, state);
  ctx.proposals.push({ proposal: 'landing', parent: B('a_army_1'), men: 1, region: R('a_front'), situation: toId('situation', 's25.landing'), option: null });
  expect(commandProposalsPhase(ctx, state).state).toBe(state);
  expect(ctx.telemetry!.mechanics['forces.landing_refused']!.fires).toBe(1);
  expect(ctx.telemetry!.mechanics['forces.landed_by_situation']).toEqual({ fires: 0, magnitude: 0 });
});

it('S25 tick-12: deep freeze protects nested State records and arrays', () => {
  const value = { nested: { field: 1 }, list: [{ field: 2 }] };
  deepFreeze(value);
  expect(Object.isFrozen(value)).toBe(true);
  expect(Object.isFrozen(value.nested)).toBe(true);
  expect(Object.isFrozen(value.list[0])).toBe(true);
  expect(() => value.list.push({ field: 3 })).toThrow(TypeError);
});

it('S25 tick-17: a historical service choice takes effect on its effective date', () => {
  const { world: base } = fresh();
  const world = indexSeatsWorld(indexWorld({ ...base.map.world,
    people: base.map.world.people.map(p => p.id === P('a_gen') ? { ...p, service: { government: null, toFaction: F('b'), toBloc: null, historicalOn: '1900-06-02', cites: [{ source: 'FIXTURE', at: null }] } } : p),
    rules: { ...base.map.world.rules, people: { ...base.rules.people, resignation: { ...base.rules.people.resignation, historicalDefaults: true } } },
  }), base.start);
  const state = createState(world, { seed: 17 });
  expect(serviceChoices(context(world, state, 0), state).personService?.[P('a_gen')]).toBeUndefined();
  const next = serviceChoices(context(world, state), state);
  expect(next.personService?.[P('a_gen')]).toMatchObject({ serviceChoice: 'resign', serviceDay: 1, serviceFaction: F('b') });
  expect(next.postStates[POST('a_army')]!.postHolder).toBeNull();
});

it('S25 tick-18: a saved draft becomes a morning choice on the following day', () => {
  const { state, post } = prepared();
  expect(state.planRecords[post]!.planStatus).toBe('choosing');
  expect(choosingPosts(state, 1)).toEqual([]);
  expect(choosingPosts(state, 2)).toEqual([post]);
});

it('S25 tick-15: an auxiliary axis holding where it stands does not open a moving axis', () => {
  const { world, state: saved, set, post } = prepared();
  const direct = set.draftCandidates.find(c => c.candMethod === 'direct')!;
  const holding = set.draftCandidates.find(c => c.candMethod === 'holding')!.candAxes[0]!;
  const idle = { ...holding, axisName: 'hold', axisPost: POST('a_reserve'), axisBlocks: [B('a_reserve_1')], axisStrength: 600,
    axisRoute: { ...holding.axisRoute, routeFrom: R('a_mid'), routeTo: R('a_mid') } };
  const approved = { ...direct, candAxes: [...direct.candAxes, idle] };
  const state = { ...saved, planRecords: { ...saved.planRecords,
    [post]: { ...saved.planRecords[post]!, planStatus: 'approved' as const, planApproved: approved, planChosen: approved.id } } };
  const next = operationsPhase(context(world, state), state);
  expect(Object.values(next.operationRecords)).toHaveLength(1);
  expect(Object.values(next.operationRecords)[0]!.opAxes.map(a => a.oaxName)).toEqual(['main']);
});

it('S25 tick-20: the first lobbying rung already pulls on his own bloc', () => {
  const { world: base } = fresh();
  const politics = base.map.world.rules.politics;
  const world = indexSeatsWorld(indexWorld({ ...base.map.world,
    vocabularies: { ...base.map.world.vocabularies, blocs: [{ id: 'fixture_bloc', name: 'bloc.fixture' }] },
    people: base.map.world.people.map(p => p.id === P('a_gen') ? { ...p, bloc: 'fixture_bloc' } : p),
    rules: { ...base.map.world.rules, politics: { ...politics,
      blocs: [{ id: 'fixture_bloc', faction: F('a'), voice: 1000, rest: 0, values: ['duty'], victory: 0, defeat: 0, cite: 'FIXTURE' }],
      ladder: { ...politics.ladder, lobbyingPerRung: -25, rival: 0, publicDefiance: 0 } } },
  }), base.start);
  const initial = createState(world, { seed: 17 });
  const state = { ...initial, personRungs: { [P('a_gen')]: 'lobbying' as const } };
  const next = politicsPhase(context(world, state, world.rules.people.verbs.weekDays), state);
  expect(next.blocSupport.fixture_bloc).toBe(-25);
});

it('S25 tick-21: a call may use the exact maximum enlistment term', () => {
  const { world: base, seat } = fresh();
  const world = indexSeatsWorld(indexWorld({ ...base.map.world, rules: { ...base.map.world.rules,
    recruitment: { ...base.map.world.rules.recruitment, raisingPostKinds: ['office'] } } }), base.start);
  const state = createState(world, { seed: 17 });
  for (const extra of [0, 1]) {
    expect(issueCall(context(world, state), state, seat, { cmd: 'call', to: POST('a_office'), regiments: 1,
      termDays: world.map.world.rules.recruitment.maxTermDays + extra, route: 'courier', bypass: true })).toBe(extra === 0 ? null : 'bad_call');
  }
});

it('S25 tick-22: a zero agency term is not recorded as a live mechanism', () => {
  const { world: base } = fresh();
  const world = indexSeatsWorld(indexWorld({ ...base.map.world, census: [{ region: R('b_front'), enslavedPopulation: 1, provenance: [] }],
    rules: { ...base.map.world.rules, selfEmancipation: { ...base.map.world.rules.selfEmancipation, linesFaction: F('a') } } }), base.start);
  const state = createState(world, { seed: 17 }), ctx = context(world, state);
  expect(regionsPhase(ctx, state)).toBe(state);
  expect(ctx.telemetry!.mechanics['regions.self_emancipation']).toEqual({ fires: 0, magnitude: 0 });
});

it('S25 tick-26: a singleton plan is chosen by the kernel and accepts no unsolicited seat choice', () => {
  const { world: base } = fresh();
  const world = indexSeatsWorld(indexWorld({ ...base.map.world, edges: base.map.world.edges.filter(e => e.id !== 'road:a_front:b_front') }), base.start);
  const { state: saved, set, post } = prepared(world);
  expect(set.draftCandidates).toHaveLength(1);
  const result = tick(world, { ...saved, stateDay: 1 }, [{ day: 2, seat: seatIdFor(P('a_gen')),
    command: { cmd: 'choose', request: planKey(post, 2), option: set.draftCandidates[0]!.id } }]);
  expect(result.rejections.map(r => r.reason)).toEqual(['no_such_request']);
});
