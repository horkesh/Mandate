import { describe, expect, it } from 'vitest';
import {
  appointHolder,
  applyCommandProposals,
  applyScheduledChanges,
  changeDepartmentSide,
  closeGovernment,
  DEPARTMENT_SIDE_FIELD,
  departmentSide,
  factionOfPost,
  GOVERNMENT_CLOSED_FIELD,
  initialDepartmentSides,
  neutralGroundOf,
  relieveHolder,
  sideOfPerson,
  type CommandProposal,
} from '../src/command/command.ts';
import { factionOfBlock } from '../src/forces/forces.ts';
import { toId, type DepartmentId, type FactionId } from '../src/ids.ts';
import type { State } from '../src/root-state.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import type { SituationDef } from '../src/situations/types.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, type TickResult } from '../src/tick/tick.ts';
import { indexWorld } from '../src/world/index.ts';
import { playDays } from '../src/log/session.ts';
import { setGoal } from '../src/plans/plans.ts';
import { goalOf } from '../src/tick/orders.ts';
import { pendingRequests } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { order, scriptedSeats } from './support/test-seats.ts';
import { block, DEP, forcesIndex, forcesStart, forcesWorld, P, PER, person, post } from './support/forces-fixture.ts';
import { depot, edge, F, R, region } from './support/map-fixture.ts';

/**
 * A department's side is State (0065). The departments, by the fixture's convention (the prefix names the side):
 * a_war and a_state are a's, b_war is b's, neutral_gov is a government of no side.
 *
 *   a1 (a's source) --road-- a2 --road-- n1 (neutral_gov's land) --road-- b1 (b's)
 *
 * Posts: a_office (a_war) above a_state_militia (a_state), which commands a_1, a block of a_war, and has a_gen2,
 * a man of a with no post, for its intelligence chief. n_top (neutral_gov) above n_guard, held by n_officer, a man of
 * no side, who commands the guard n_guard_1.
 */
const MAP = forcesIndex({
  regions: ['a1', 'a2', 'n1', 'b1'].map((r) => region(r)),
  edges: [edge('a1', 'a2'), edge('a2', 'n1'), edge('n1', 'b1')],
  depots: [depot('a_src', 'a1')],
  departments: ['a_war', 'a_state', 'b_war', 'neutral_gov'],
  people: [...['a_lead', 'a_gen', 'a_gen2', 'a_corps', 'a_spare'].map((p) => person(p, 'a')), ...['b_lead', 'b_gen'].map((p) => person(p, 'b')), ...['n_gov', 'n_officer', 'n_spare'].map((p) => person(p, null))],
});
const NEUTRAL: DepartmentId = DEP('neutral_gov');
const A_STATE: DepartmentId = DEP('a_state');
const POSTS = [
  post('a_office', { kind: 'office', department: 'a_war', holder: PER('a_gen'), region: R('a1') }),
  post('a_state_militia', { department: 'a_state', parent: P('a_office'), holder: PER('a_corps'), intelligenceChief: PER('a_gen2'), region: R('a2') }),
  post('a_state_office', { kind: 'office', department: 'a_state', region: R('a2'), departmentChanges: [{ on: '1900-07-01', department: DEP('a_war'), parent: null, provenance: [] }] }),
  post('n_top', { kind: 'office', department: 'neutral_gov', holder: PER('n_gov'), region: R('n1') }),
  post('n_guard', { department: 'neutral_gov', parent: P('n_top'), holder: PER('n_officer'), region: R('n1') }),
];
const BLOCKS = [block('a_1', { department: 'a_war', region: 'a2', post: P('a_state_militia') }), block('n_guard_1', { department: 'neutral_gov', region: 'n1', post: P('n_guard'), strength: 800 })];
const START = {
  ...forcesStart({ a1: { a: 1000 }, a2: { a: 1000 }, b1: { b: 1000 } }, POSTS, BLOCKS, {
    governments: [
      { region: R('a1'), department: DEP('a_war'), provenance: [] },
      { region: R('n1'), department: NEUTRAL, provenance: [] },
    ],
  }),
  factions: [{ faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true }],
};
const WORLD = indexSeatsWorld(MAP, START);
const S0 = createState(WORLD, { seed: 1 });

/** The proposal a situation's effect pushes: a government joining `side` (+), or closing (+) / reopening (-). */
const joins = (side: FactionId | null, subject: string = NEUTRAL, delta = 1): CommandProposal => ({ owner: 'command', field: DEPARTMENT_SIDE_FIELD, subject, delta, side, origin: 'notice' });
const closes = (delta = 1, subject: string = NEUTRAL): CommandProposal => ({ owner: 'command', field: GOVERNMENT_CLOSED_FIELD, subject, delta, side: null, origin: 'notice' });

describe('a department\'s side is State, copied from the World at the start (0065)', () => {
  it('copies every department\'s side, in id order', () => {
    expect(S0.departmentFactions).toEqual({ a_state: 'a', a_war: 'a', b_war: 'b', neutral_gov: null });
    expect(Object.keys(S0.departmentFactions)).toEqual(['a_state', 'a_war', 'b_war', 'neutral_gov']);
    expect(departmentSide(S0, NEUTRAL)).toBeNull();
    expect(() => departmentSide(S0, DEP('ghost'))).toThrow('not in the World');
  });

  it('refuses a department whose faction is not in the World, or listed twice (positive controls)', () => {
    const world = forcesWorld({ regions: [region('a1')], edges: [], depots: [], departments: ['a_war'] });
    const bad = indexWorld({ ...world, departments: [...world.departments, { ...world.departments[0]!, id: DEP('c_war'), faction: F('c') }, world.departments[0]!] });
    expect(() => initialDepartmentSides(bad)).toThrow(/department a_war is listed twice[\s\S]*department c_war: faction c is not in the World/);
    expect(() => initialDepartmentSides(indexWorld(world))).not.toThrow();
  });
});

describe('a situation moves a government of no side to a side (0065)', () => {
  const close: SituationDef = {
    id: toId('situation', 'ordinance'),
    kind: 'decision',
    faction: F('a'),
    title: 'situation.ordinance.title',
    text: 'situation.ordinance.text',
    earliest: '1900-06-01',
    event: { dayAtLeast: 2 },
    knowledge: null,
    railroad: 'test fixture',
    chain: null,
    subjects: [],
    options: [
      {
        id: 'join',
        label: 'situation.ordinance.option.join',
        displayKey: 1,
        proposedBy: [PER('a_gen')],
        group: null,
        appearsWhen: null,
        expiresWhen: null,
        waitsOn: null,
        effects: [{ propose: { owner: 'command', field: DEPARTMENT_SIDE_FIELD, subject: 'neutral_gov', delta: 1, reason: 'ordinance', side: F('a') } }],
        lockedCosts: [],
        orders: [], calls: [],
        honours: [],
        watched: false,
        gate: null,
      },
    ],
    inaction: { text: 'situation.ordinance.inaction', effects: [] },
    historicalDefault: { options: ['join'] },
    staffLine: { authors: [P('a_office')], recommends: ['join'], reasons: [], confidence: 600 },
    delegableTo: [],
    resurfaceOn: [],
    effects: [],
    report: null,
    gate: { none: 'test fixture' },
    gateReview: null,
    citations: [],
  };

  it('end to end through the tick: on day 2 its land stops being neutral ground, its posts and guard serve a, control does not move', () => {
    const world = indexSeatsWorld(MAP, START, { situations: [close] });
    let state = createState(world, { seed: 1 });
    expect(neutralGroundOf(MAP, state)).toEqual({ n1: 'open' });
    expect([factionOfPost(MAP, state, P('n_guard')), factionOfBlock(MAP, state, toId('forceBlock', 'n_guard_1'))]).toEqual([null, null]);
    const events: string[] = [];
    for (let i = 0; i < 4; i++) {
      const r = tick(world, state, [], { freeze: true, deepChecks: true });
      for (const e of r.mapEvents) {
        if (e.event === 'side_changed') events.push(`${r.day}:${e.change.department}:${e.change.from ?? 'none'}->${e.change.to}`);
        if (e.event === 'government_changed') events.push(`${r.day}:closing:${e.department}`);
      }
      state = r.state;
    }
    expect(events).toEqual(['2:neutral_gov:none->a']);
    expect(state.situationStates[close.id]).toMatchObject({ sitStatus: 'decided', sitChosen: ['join'] });
    expect(state.departmentFactions).toEqual({ ...S0.departmentFactions, neutral_gov: 'a' });
    expect(neutralGroundOf(MAP, state)).toEqual({});
    expect([factionOfPost(MAP, state, P('n_top')), factionOfPost(MAP, state, P('n_guard')), factionOfBlock(MAP, state, toId('forceBlock', 'n_guard_1'))]).toEqual(['a', 'a', 'a']);
    // Control is control's (0054): n1 is still no one's, and the region is still the government's.
    expect(state.regionControl[R('n1')]).toBeUndefined();
    expect(state.regionGovernments[R('n1')]).toBe('neutral_gov');
    // The control: with no situation, nothing changes side and n1 stays neutral ground.
    let plain = createState(WORLD, { seed: 1 });
    for (let i = 0; i < 4; i++) plain = tick(WORLD, plain, []).state;
    expect(plain.departmentFactions).toEqual(S0.departmentFactions);
    expect(neutralGroundOf(MAP, plain)).toEqual({ n1: 'open' });
  });

  it('its guard post becomes commandable with no goal, holding where it stands, and an order to it is carried out, not crashed on (exit review S1; lane 1.2)', () => {
    const world = indexSeatsWorld(MAP, START, { situations: [close] });
    const lead = seatIdFor(PER('a_lead'));
    const days: TickResult[] = [];
    const out = playDays(world, createState(world, { seed: 1 }), scriptedSeats({ a: { 4: [order('n_guard', 'advance', 'a2', 'courier')] } }), 14, { freeze: true, onDay: (r) => days.push(r) });
    // Day 1: neutral, not commandable. Day 2: it joins a, with no goal (0072's hold goal is retired): nothing moves it.
    expect(days[1]!.state.planRecords[P('n_guard')]).toBeUndefined();
    expect(days[1]!.state.standingGoals[P('n_guard')]).toBeUndefined();
    const menu = pendingRequests(world, days[2]!.state).find((r) => r.requestSeat === lead)!.menu;
    expect(menu.menuKind === 'principal' && menu.commandable.map((c) => c.post)).toContain('n_guard');
    // The order sent on day 4 arrives and is obeyed; its plan is drafted, goes ahead as drafted, marches on a2 and, there, holds it.
    expect(days.flatMap((r) => r.rejections)).toEqual([]);
    const record = out.state.planRecords[P('n_guard')]!;
    expect(record).toMatchObject({ planIssuer: 'a_lead', planStatus: 'approved' });
    expect(record.planGoal).toMatchObject({ goalObjective: R('a2'), goalPosture: 'take' });
    const advancing = days.map((r) => r.state.standingGoals[P('n_guard')]).find((g) => g?.standingSpec.goalSpecKind === 'advance');
    expect(advancing).toMatchObject({ standingSpec: { goalSpecKind: 'advance', goalSpecRegion: R('a2') }, standingIssuer: 'a_lead' });
    expect(out.state.standingGoals[P('n_guard')]!.standingSpec).toEqual({ goalSpecKind: 'hold', goalSpecRegion: R('a2') });
    expect(days.flatMap((r) => r.events).filter((e) => e.event === 'objected')).toEqual([]);
    expect(out.state.forceLocations[toId('forceBlock', 'n_guard_1')]!.locRegion).toBe('a2');
  });

  it('an order reaching a post with no goal is obeyed, never a throw (exit review S1)', () => {
    const goal = goalOf(order('n_guard', 'advance', 'a2').goal);
    const set = setGoal(S0, P('n_guard'), { id: toId('message', 'm.test'), issuer: PER('a_lead'), goal, viaChain: true, issuedDay: 2, response: 'm.test|n_officer' }, 3);
    expect(set.planRecords[P('n_guard')]).toMatchObject({ planStatus: 'drafting', planSetDay: 3, planOrder: 'm.test' });
  });

  it('reports the change and what it cut loose; a government already on that side is unchanged', () => {
    const r = applyCommandProposals(MAP, S0, [joins(F('a')), joins(F('a'))], 3);
    expect(r.refused.map((x) => x.why)).toEqual([]);
    expect(r.applied).toEqual([
      { field: DEPARTMENT_SIDE_FIELD, subject: 'neutral_gov', change: 'joined', side: { department: 'neutral_gov', from: null, to: 'a', closingLifted: null, postsCut: [], blocksUnassigned: [], chiefsCleared: [] } },
      { field: DEPARTMENT_SIDE_FIELD, subject: 'neutral_gov', change: 'unchanged', side: null },
    ]);
    expect(r.state.postStates).toBe(S0.postStates);
    expect(r.state.forceAssignments).toBe(S0.forceAssignments);
  });
});

describe('the holder\'s side follows his post while he holds it (0065, 0055)', () => {
  const joined = changeDepartmentSide(MAP, S0, NEUTRAL, F('a')).state;

  it('a man of no side in the government\'s post serves its new side; relieved, he has no side again', () => {
    expect(sideOfPerson(MAP, S0, PER('n_officer'))).toBeNull();
    expect(sideOfPerson(MAP, joined, PER('n_officer'))).toBe('a');
    expect(sideOfPerson(MAP, relieveHolder(joined, P('n_guard')), PER('n_officer'))).toBeNull();
    // A man with no post keeps his own side: he changes it only through situations or events (0055).
    expect([sideOfPerson(MAP, joined, PER('n_spare')), sideOfPerson(MAP, joined, PER('a_spare'))]).toEqual([null, 'a']);
  });

  it('appointments follow the post\'s side today: a man of a may now take it, a man of no side may not (positive controls)', () => {
    const vacant = relieveHolder(joined, P('n_guard'));
    expect(appointHolder(MAP, vacant, P('n_guard'), PER('a_spare')).postStates[P('n_guard')]!.postHolder).toBe('a_spare');
    expect(() => appointHolder(MAP, vacant, P('n_guard'), PER('n_spare'))).toThrow("n_spare is not on n_guard's side");
    // Before the change it was the other way round.
    const before = relieveHolder(S0, P('n_guard'));
    expect(() => appointHolder(MAP, before, P('n_guard'), PER('a_spare'))).toThrow("a_spare is not on n_guard's side");
    expect(appointHolder(MAP, before, P('n_guard'), PER('n_spare')).postStates[P('n_guard')]!.postHolder).toBe('n_spare');
  });

  it('the other side\'s man put in a post past command\'s guard keeps his own side (standing review S6)', () => {
    const turned: State = { ...joined, postStates: { ...joined.postStates, [P('n_guard')]: { ...joined.postStates[P('n_guard')]!, postHolder: PER('b_gen') } } };
    expect(sideOfPerson(MAP, turned, PER('b_gen'))).toBe('b');
  });
});

describe('a side to another: nothing command holds crosses sides (0065)', () => {
  const r = changeDepartmentSide(MAP, S0, A_STATE, F('b'));

  it('its posts serve b and their holder with them; a post above on a\'s side lets go, a\'s block and a\'s chief leave it', () => {
    expect(r.change).toEqual({ department: 'a_state', from: 'a', to: 'b', closingLifted: null, postsCut: ['a_state_militia'], blocksUnassigned: ['a_1'], chiefsCleared: ['a_state_militia'] });
    const m = r.state.postStates[P('a_state_militia')]!;
    expect([m.postParent, m.postIntelChief, m.postHolder]).toEqual([null, null, 'a_corps']);
    expect(r.state.forceAssignments[toId('forceBlock', 'a_1')]).toBeNull();
    expect([factionOfPost(MAP, r.state, P('a_state_militia')), sideOfPerson(MAP, r.state, PER('a_corps')), factionOfBlock(MAP, r.state, toId('forceBlock', 'a_1'))]).toEqual(['b', 'b', 'a']);
    // Control does not move: a2 is still a's.
    expect(r.state.regionControl).toBe(S0.regionControl);
  });

  it('a scheduled change to a department now on another side is dropped, not applied (0050: never a change of side)', () => {
    const due = applyScheduledChanges(r.state, '1900-07-01');
    expect(due.changed).toEqual([]);
    expect(due.dropped).toEqual([{ post: 'a_state_office', department: 'a_war' }]);
    expect(due.state.postStates[P('a_state_office')]).toMatchObject({ postDepartment: 'a_state', postScheduled: [] });
    // The control: unchanged sides apply it.
    expect(applyScheduledChanges(S0, '1900-07-01')).toMatchObject({ changed: ['a_state_office'], dropped: [] });
  });
});

describe('a closing and a change of side stay distinct (0058, 0065)', () => {
  it('a closing leaves the side alone; a change of side lifts the closing and is its own event', () => {
    const closed = applyCommandProposals(MAP, S0, [closes()], 2);
    expect(closed.applied).toEqual([{ field: GOVERNMENT_CLOSED_FIELD, subject: 'neutral_gov', change: 'closed' }]);
    expect(closed.state.departmentFactions).toBe(S0.departmentFactions);
    expect(neutralGroundOf(MAP, closed.state)).toEqual({ n1: 'closed' });

    const joined = applyCommandProposals(MAP, closed.state, [joins(F('a'))], 5);
    expect(joined.applied).toMatchObject([{ field: DEPARTMENT_SIDE_FIELD, change: 'joined', side: { closingLifted: 2 } }]);
    expect(joined.state.closedGovernments).toEqual({});
    expect(neutralGroundOf(MAP, joined.state)).toEqual({});

    // Once on a side it is no longer neutral: a closing is refused, and so is a reopening.
    const after = applyCommandProposals(MAP, joined.state, [closes(1), closes(-1)], 6);
    expect(after.applied).toEqual([]);
    expect(after.refused.map((x) => x.why)).toEqual(['department neutral_gov belongs to a side; only a neutral government closes its territory', 'department neutral_gov belongs to a side; only a neutral government closes its territory']);
  });

  it('refuses a change of side naming no side, a side not in the World, a delta not above 0, or a department that is not a government (positive controls)', () => {
    const notGov = indexWorld({ ...MAP.world, vocabularies: { ...MAP.world.vocabularies, departmentKinds: [{ id: 'government', name: 'kind.government', government: false, selfGoverning: false }] } });
    const r = applyCommandProposals(MAP, S0, [joins(null), joins(F('c')), joins(F('a'), NEUTRAL, 0), joins(F('a'), NEUTRAL, -1), joins(F('a'), 'ghost'), { ...joins(F('a')), subject: null }], 1);
    expect(r.applied).toEqual([]);
    expect(r.state).toBe(S0);
    expect(r.refused.map((x) => x.why)).toEqual([
      'a change of side for neutral_gov names no side to join',
      'faction c is not in the World',
      'a change of side for neutral_gov joins the side it names, with a delta above 0; no proposal takes a side away',
      'a change of side for neutral_gov joins the side it names, with a delta above 0; no proposal takes a side away',
      'department ghost is not in the World; only a government changes side',
      'command owns no field "department_side" with subject none',
    ]);
    expect(applyCommandProposals(notGov, S0, [joins(F('a'))], 1).refused.map((x) => x.why)).toEqual(['department neutral_gov is not a government; only a government changes side']);
    expect(() => changeDepartmentSide(notGov, S0, NEUTRAL, F('a'))).toThrow('is not a government');
    // The control: the same proposal on a government applies.
    expect(applyCommandProposals(MAP, S0, [joins(F('a'))], 1).applied).toHaveLength(1);
    expect(() => closeGovernment(MAP, S0, NEUTRAL, 1)).not.toThrow();
  });
});
