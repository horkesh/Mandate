import { describe, expect, it } from 'vitest';
import {
  applyScheduledChanges,
  appointHolder,
  chainBelow,
  CommandError,
  commandedBlocks,
  createTemporaryPost,
  createHeldPostCache,
  dissolveOperation,
  factionOfPost,
  heldPost,
  initialCommand,
  initialDepartmentSides,
  relieveHolder,
  transferForce,
  unpostedPeopleOnSide,
  sideOfPerson,
} from '../src/command/command.ts';
import { applyForces, factionOfBlock, ForcesError, initialForces, sumStrength } from '../src/forces/forces.ts';
import { blocksIn, initialLocations, MovementError } from '../src/movement/movement.ts';
import type { State } from '../src/root-state.ts';
import type { PostId } from '../src/ids.ts';
import { createState, emptyState } from '../src/tick/setup.ts';
import type { WorldIndex } from '../src/world/index.ts';
import type { ScenarioStart } from '../src/world/scenario.ts';
import { worldOf } from './support/tick-context.ts';
import { B, block, DEP, forcesIndex, forcesStart, P, PER, post, person } from './support/forces-fixture.ts';
import { depot, edge, F, R, region } from './support/map-fixture.ts';

const MAP = forcesIndex({
  regions: ['a1', 'a2', 'mid', 'b2', 'b1'].map((r) => region(r)).concat([region('w', 'river')]),
  edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line' }), edge('a2', 'mid', { days: 2 }), edge('mid', 'b2', { days: 2 }), edge('b2', 'b1', { type: 'rail', line: 'b_line' }), edge('a2', 'w', { type: 'river' }), edge('b2', 'w', { type: 'river' })],
  depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
});

const CONTROL = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 300, b: 550 }, b2: { b: 1000 }, b1: { b: 1000 } };

const POSTS = [
  post('a_office', { kind: 'office', department: 'a_war', holder: PER('a_lead'), region: R('a1') }),
  post('a_army', { department: 'a_war', parent: P('a_office'), holder: PER('a_gen'), region: R('a2') }),
  post('a_army2', { department: 'a_war', parent: P('a_office'), holder: PER('a_gen2'), region: R('a1') }),
  post('a_corps', { kind: 'corps', department: 'a_war', parent: P('a_army'), holder: PER('a_corps'), region: R('a2') }),
  post('b_army', { department: 'b_war', holder: PER('b_gen'), region: R('b2') }),
];

const BLOCKS = [
  block('a_1', { department: 'a_war', post: P('a_army'), region: 'a2', strength: 5000 }),
  block('a_2', { department: 'a_war', post: P('a_army'), region: 'a2', strength: 3000 }),
  block('a_3', { department: 'a_war', post: P('a_army'), region: 'a2', strength: null }),
  block('a_2_guard', { kind: 'detachment', parent: B('a_2'), department: 'a_war', post: P('a_army'), region: 'a1', strength: 200 }),
  block('a_c1', { department: 'a_war', post: P('a_corps'), region: 'a2', strength: 4000 }),
  block('a_ship', { department: 'a_war', post: P('a_army'), region: 'w', arm: 'naval', strength: 300 }),
  block('a_marines', { department: 'a_war', post: P('a_army'), region: 'w', aboard: B('a_ship'), strength: 150, storesDays: null }),
  block('b_1', { department: 'b_war', post: P('b_army'), region: 'b2', strength: 6000 }),
];

const START = forcesStart(CONTROL, POSTS, BLOCKS);

function stateFrom(map: WorldIndex, start: ScenarioStart): State {
  const command = initialCommand(map, start);
  return { ...emptyState(), departmentFactions: initialDepartmentSides(map), forceBlockStates: initialForces(map, start), forceLocations: initialLocations(map, start), postStates: command.posts, forceAssignments: command.assignments };
}

const S = stateFrom(MAP, START);

describe('caller-owned holder lookups', () => {
  it('enumerates an immutable post table once for every person and side query', () => {
    let scans = 0;
    const state = { ...S, postStates: new Proxy(S.postStates, { ownKeys: target => { scans++; return Reflect.ownKeys(target); } }) };
    const cache = createHeldPostCache();
    for (let i = 0; i < 3; i++) for (const person of MAP.world.people) {
      expect(heldPost(state, person.id, cache)).toBe(heldPost(S, person.id));
      expect(sideOfPerson(MAP, state, person.id, cache)).toBe(sideOfPerson(MAP, S, person.id));
    }
    expect(scans).toBe(1);
  });

  it('keeps duplicate ordering, own properties and old-State reads after relief or appointment', () => {
    const holder = PER('a_gen');
    const posts = Object.assign(Object.create({ [P('a_inherited')]: S.postStates[P('a_army')]! }), {
      [P('z_post')]: S.postStates[P('a_army')]!, [P('a_post')]: S.postStates[P('a_army')]!,
    });
    const state = { ...S, postStates: posts };
    const cache = createHeldPostCache();
    expect(heldPost(state, holder, cache)).toBe('a_post');
    const next = relieveHolder(state, P('a_post'));
    expect(heldPost(next, holder, cache)).toBe('z_post');
    const empty = relieveHolder(next, P('z_post'));
    expect(heldPost(empty, holder, cache)).toBeNull();
    const appointed = appointHolder(MAP, empty, P('a_post'), holder);
    expect(heldPost(appointed, holder, cache)).toBe('a_post');
    expect(heldPost(state, holder, cache)).toBe('a_post');
    expect(heldPost(next, holder, cache)).toBe('z_post');
    expect(heldPost(state, PER('b_lead'), cache)).toBeNull();
  });

  it('reads department sides and service choices freshly even when the holder table is unchanged', () => {
    const cache = createHeldPostCache();
    const person = PER('a_gen');
    const changed = { ...S, departmentFactions: { ...S.departmentFactions, [DEP('a_war')]: F('b') } };
    const resigned = { ...changed, personService: { [person]: { serviceFaction: F('a'), serviceBloc: null, serviceChoice: 'resign' as const, serviceDay: 1 } } };
    for (const state of [S, changed, resigned, S]) {
      expect(sideOfPerson(MAP, state, person, cache)).toBe(sideOfPerson(MAP, state, person));
    }
  });
});

describe('unposted people on a side', () => {
  it('matches individual side and post lookups, reading the post table once for the whole roster', () => {
    const map = forcesIndex({ regions: [region('a1')], edges: [], people: [person('spare', 'a'), person('stayed', 'a'), person('resigned', 'a'), person('neutral', null), person('a_gen', 'a')] });
    const state: State = { ...S, personService: {
      [PER('resigned')]: { serviceFaction: F('b'), serviceBloc: null, serviceChoice: 'resign', serviceDay: 1 },
      [PER('stayed')]: { serviceFaction: F('b'), serviceBloc: null, serviceChoice: 'stay', serviceDay: 1 },
    } };
    const expected = (faction: ReturnType<typeof F> | null) => map.world.people.filter(p => sideOfPerson(map, state, p.id) === faction && heldPost(state, p.id) === null);
    let scans = 0;
    const counted: State = { ...state, postStates: new Proxy(state.postStates, { ownKeys: target => { scans++; return Reflect.ownKeys(target); } }) };
    for (const faction of [F('a'), F('b'), null]) {
      scans = 0;
      expect(unpostedPeopleOnSide(map, counted, faction)).toEqual(expected(faction));
      expect(scans).toBe(1);
    }
    expect(unpostedPeopleOnSide(map, state, F('a')).map(p => p.id)).toEqual(['spare', 'stayed']);
    expect(unpostedPeopleOnSide(map, state, F('b')).map(p => p.id)).toEqual(['resigned']);
  });

  it('ignores inherited posts and recomputes after a relief without changing older States', () => {
    const inherited = { [P('inherited')]: { ...S.postStates[P('a_army')]!, postHolder: PER('b_lead') } };
    const state = { ...S, postStates: Object.assign(Object.create(inherited), S.postStates) };
    const next = relieveHolder(state, P('a_army'));
    expect(unpostedPeopleOnSide(MAP, state, F('b')).some(p => p.id === PER('b_lead'))).toBe(true);
    expect(unpostedPeopleOnSide(MAP, state, F('a')).some(p => p.id === PER('a_gen'))).toBe(false);
    expect(unpostedPeopleOnSide(MAP, next, F('a')).some(p => p.id === PER('a_gen'))).toBe(true);
    expect(unpostedPeopleOnSide(MAP, state, F('a')).some(p => p.id === PER('a_gen'))).toBe(false);
  });
});

describe('setup: forces, locations and command copied once from the start (0050)', () => {
  it('copies blocks with strength, stores in milli-days and unknowns kept unknown', () => {
    expect(S.forceBlockStates[B('a_1')]).toEqual({ fbName: 'block.a_1.name', fbKind: 'block', fbParent: null, fbDepartment: 'a_war', fbArm: 'infantry', fbStrength: 5000, fbNonCombatants: 0, fbStoresMilli: 10000, fbStoresAssumed: false, fbMorale: 600, fbExperience: 400, fbEquipment: 600, fbStragglers: 0, fbRoutedDay: null, fbSurrenderedDay: null });
    expect(S.forceBlockStates[B('a_3')]!.fbStrength).toBeNull();
    expect(S.forceBlockStates[B('a_marines')]!.fbStoresMilli).toBeNull();
    expect(S.forceBlockStates[B('a_2_guard')]!.fbParent).toBe('a_2');
    expect(sumStrength(S, [B('a_1'), B('a_3')])).toEqual({ men: 5000, unknown: ['a_3'] });
  });

  it('copies locations, with troops aboard a ship on the water', () => {
    expect(S.forceLocations[B('a_marines')]).toEqual({ locRegion: 'w', locAboard: 'a_ship', locSinceDay: 0, locMarch: null });
    expect(blocksIn(S, R('a2'))).toEqual(['a_1', 'a_2', 'a_3', 'a_c1']);
  });

  it('copies posts with holders, chain and seat, and who commands each block', () => {
    expect(S.postStates[P('a_corps')]).toMatchObject({ postKind: 'corps', postParent: 'a_army', postHolder: 'a_corps', postSeat: 'a2', postOperation: null });
    expect(heldPost(S, PER('a_gen'))).toBe('a_army');
    expect(heldPost(S, PER('b_lead'))).toBeNull();
    expect(commandedBlocks(S, P('a_corps'))).toEqual(['a_c1']);
    expect(chainBelow(S, null, P('a_corps'))).toEqual(['a_office', 'a_army', 'a_corps']);
    expect(factionOfPost(MAP, S, P('b_army'))).toBe('b');
    expect(factionOfBlock(MAP, S, B('a_ship'))).toBe('a');
  });

  it('finds holders independently of insertion order, including duplicate holders and inherited posts', () => {
    const holder = PER('a_gen');
    const inherited = { [P('a_0')]: S.postStates[P('a_army')]! };
    const posts = Object.create(inherited) as Record<string, State['postStates'][PostId]>;
    posts.z_post = S.postStates[P('a_army')]!;
    posts.a_post = S.postStates[P('a_army')]!;
    const state = { ...S, postStates: posts };
    expect(heldPost(state, holder)).toBe('a_post');
    expect(heldPost(state, PER('b_lead'))).toBeNull();
    const next = { ...state, postStates: { ...posts, a_post: { ...posts.a_post!, postHolder: null } } };
    expect(heldPost(next, holder)).toBe('z_post');
    expect(heldPost(state, holder)).toBe('a_post');
  });

  it('runs through createState, from the start the seats World was indexed with', () => {
    const state = createState(worldOf(MAP, START), { seed: 1 });
    expect(Object.keys(state.forceBlockStates)).toHaveLength(BLOCKS.length);
    expect(state.forceAssignments[B('b_1')]).toBe('b_army');
    expect(state.postStates).toEqual(S.postStates);
  });

  it('refuses a start that breaks the format, listing every problem (positive controls)', () => {
    const bad = forcesStart(
      CONTROL,
      [...POSTS, post('loop_1', { department: 'a_war', parent: P('loop_2') }), post('loop_2', { department: 'a_war', parent: P('loop_1') })],
      BLOCKS,
    );
    expect(() => initialCommand(MAP, bad)).toThrow(/loop_1: its chain loops at loop_1[\s\S]*loop_2: its chain loops at loop_2/);
    const twice = forcesStart(CONTROL, [...POSTS, post('a_other', { department: 'a_war', holder: PER('a_gen') })], BLOCKS);
    expect(() => initialCommand(MAP, twice)).toThrow('a_gen already holds');
    const crossSide = forcesStart(CONTROL, POSTS, [block('b_x', { department: 'b_war', post: P('a_army'), region: 'b2' })]);
    expect(() => initialCommand(MAP, crossSide)).toThrow(CommandError);
    expect(() => initialForces(MAP, forcesStart(CONTROL, [], [block('x', { department: 'nowhere', region: 'a1' })]))).toThrow(ForcesError);
    expect(() => initialForces(MAP, forcesStart(CONTROL, [], [block('x', { department: 'a_war', region: 'a1', kind: 'detachment' })]))).toThrow('needs a parent block');
    expect(() => initialLocations(MAP, forcesStart(CONTROL, [], [block('x', { department: 'a_war', region: 'w' })]))).toThrow('only aboard a ship');
    expect(() => initialLocations(MAP, forcesStart(CONTROL, [], [block('s', { department: 'a_war', region: 'a1' }), block('x', { department: 'a_war', region: 'a1', aboard: B('s') })]))).toThrow(MovementError);
    const otherSideChange = forcesStart(CONTROL, [post('p', { department: 'a_war', departmentChanges: [{ on: '1900-07-01', department: DEP('b_war'), parent: null, provenance: [] }] })], []);
    expect(() => initialCommand(MAP, otherSideChange)).toThrow('may not move it to another side');
  });
});

describe('forces: the only writer of strength and stores', () => {
  it('applies typed changes, clamps at zero, keeps unknowns unknown, and returns the same State for nothing', () => {
    const { state, changes } = applyForces(S, [
      { change: 'strength', block: B('a_1'), men: -6000, cause: 'combat' },
      { change: 'stores', block: B('a_2'), milli: -2500, cause: 'consumption' },
      { change: 'stores', block: B('a_marines'), milli: 5000, cause: 'supply' },
    ]);
    expect(state.forceBlockStates[B('a_1')]!.fbStrength).toBe(0);
    expect(state.forceBlockStates[B('a_2')]!.fbStoresMilli).toBe(7500);
    expect(state.forceBlockStates[B('a_marines')]!.fbStoresMilli).toBeNull();
    expect(changes.map((c) => `${c.block}:${c.before}>${c.after}:${c.cause}`)).toEqual(['a_1:5000>0:combat', 'a_2:10000>7500:consumption']);
    expect(state.forceBlockStates[B('b_1')]).toBe(S.forceBlockStates[B('b_1')]);
    expect(applyForces(S, [{ change: 'strength', block: B('a_1'), men: 0, cause: 'combat' }]).state).toBe(S);
    expect(() => applyForces(S, [{ change: 'strength', block: B('nope'), men: 1, cause: 'combat' }])).toThrow('unknown force block');
    expect(() => applyForces(S, [{ change: 'stores', block: B('a_1'), milli: 0.5, cause: 'supply' }])).toThrow('whole number');
  });
});

describe('command: transfers name a force, never blocks one by one (0033)', () => {
  it('a number of blocks: the sender gives his weakest first, unknown strengths last; a detachment standing elsewhere stays (0081)', () => {
    // Known strengths ascending: the marines (150), the ship (300), a_2 (3000), a_1 (5000); a_3 (unknown) last.
    const two = transferForce(MAP, S, P('a_army'), P('a_army2'), { force: 'blocks', count: 2 }, 'weakest_first');
    expect(two.rule).toBe('weakest_first');
    expect(two.moved).toEqual(['a_marines', 'a_ship']);
    expect(two.state.postStates).toBe(S.postStates);
    const three = transferForce(MAP, S, P('a_army'), P('a_army2'), { force: 'blocks', count: 3 }, 'weakest_first');
    // a_2's guard stands at a1, away from a_2 at a2: a force in the field is not its parent's to give away (lane 1.4c).
    expect(three.moved).toEqual(['a_2', 'a_marines', 'a_ship']);
    expect(commandedBlocks(three.state, P('a_army2'))).toEqual(['a_2', 'a_marines', 'a_ship']);
    expect(commandedBlocks(three.state, P('a_army'))).toContain('a_2_guard');
    expect(three.menSent).toBe(3450);
    const all = transferForce(MAP, S, P('a_army'), P('a_army2'), { force: 'blocks', count: 9 }, 'weakest_first');
    expect(all.moved.at(-1)).toBe('a_ship');
    // Every block goes; the guard standing apart from its parent stays with the post (0081).
    expect(commandedBlocks(all.state, P('a_army'))).toEqual(['a_2_guard']);
  });

  it('a strength in men: whole blocks, weakest first, until the men are reached', () => {
    const r = transferForce(MAP, S, P('a_army'), P('a_army2'), { force: 'men', men: 3000 }, 'weakest_first');
    // The guard stands apart from a_2, so it stays (0081); the men sent are every man that went.
    expect(r.moved).toEqual(['a_2', 'a_marines', 'a_ship']);
    expect(r.menSent).toBe(3450);
  });

  it('a corps moves as a bundle with its commander; its blocks stay under it', () => {
    const r = transferForce(MAP, S, P('a_army'), P('a_army2'), { force: 'corps', corps: P('a_corps') }, 'weakest_first');
    expect(r.rule).toBe('corps_as_bundle');
    expect(r.state.postStates[P('a_corps')]!.postParent).toBe('a_army2');
    expect(r.state.postStates[P('a_corps')]!.postHolder).toBe('a_corps');
    expect(commandedBlocks(r.state, P('a_corps'))).toEqual(['a_c1']);
    expect(r.state.forceAssignments).toBe(S.forceAssignments);
  });

  it('refuses another side, a corps not under the sender, a loop, and empty counts (positive controls)', () => {
    expect(() => transferForce(MAP, S, P('a_army'), P('b_army'), { force: 'blocks', count: 1 }, 'weakest_first')).toThrow('different sides');
    expect(() => transferForce(MAP, S, P('a_army2'), P('a_army'), { force: 'corps', corps: P('a_corps') }, 'weakest_first')).toThrow('not under a_army2');
    expect(() => transferForce(MAP, S, P('a_office'), P('a_corps'), { force: 'corps', corps: P('a_army') }, 'weakest_first')).toThrow('would loop');
    expect(() => transferForce(MAP, S, P('a_army'), P('a_army2'), { force: 'blocks', count: 0 }, 'weakest_first')).toThrow('at least one');
  });
});

describe('command: holders, temporary posts and scheduled changes (0040)', () => {
  it('a man holds one post; relieving empties it', () => {
    expect(() => appointHolder(MAP, S, P('a_army2'), PER('a_gen'))).toThrow('already holds a_army');
    const free = relieveHolder(S, P('a_army2'));
    expect(() => appointHolder(MAP, free, P('a_army'), PER('a_gen2'))).toThrow('relieve him first');
    expect(() => appointHolder(MAP, S, P('b_army'), PER('a_gen2'))).toThrow("not on b_army's side");
    const relieved = relieveHolder(free, P('a_army'));
    expect(relieved.postStates[P('a_army')]!.postHolder).toBeNull();
    const appointed = appointHolder(MAP, relieved, P('a_army'), PER('a_gen2'), true);
    expect(appointed.postStates[P('a_army')]).toMatchObject({ postHolder: 'a_gen2', postActing: true });
  });

  it('a temporary post dissolves with its operation: its blocks go to its parent, posts under it move up', () => {
    let s = createTemporaryPost(MAP, S, { id: P('a_exp'), name: 'post.a_exp.name', kind: 'expedition', department: DEP('a_war'), parent: P('a_army'), holder: null, seat: R('a2'), operation: 'op1' });
    s = transferForce(MAP, s, P('a_army'), P('a_exp'), { force: 'blocks', count: 1 }, 'weakest_first').state;
    s = transferForce(MAP, s, P('a_army'), P('a_exp'), { force: 'corps', corps: P('a_corps') }, 'weakest_first').state;
    expect(commandedBlocks(s, P('a_exp'))).toEqual(['a_marines']);
    const { state, dissolved } = dissolveOperation(s, 'op1');
    expect(dissolved).toEqual(['a_exp']);
    expect(state.postStates[P('a_exp')]).toBeUndefined();
    expect(state.forceAssignments[B('a_marines')]).toBe('a_army');
    expect(state.postStates[P('a_corps')]!.postParent).toBe('a_army');
    expect(dissolveOperation(state, 'op1').state).toBe(state);
  });

  it('refuses a temporary post of a kind that is not temporary, or that exists only at a start (positive controls)', () => {
    const spec = { id: P('x'), name: 'post.x.name', department: DEP('a_war'), parent: null, holder: null, seat: null, operation: 'op' };
    expect(() => createTemporaryPost(MAP, S, { ...spec, kind: 'corps' })).toThrow('not a temporary post');
    expect(() => createTemporaryPost(MAP, S, { ...spec, kind: 'expedition', parent: P('b_army') })).toThrow('another side');
  });

  it('applies a scheduled department change on its date and not before', () => {
    const start = forcesStart(CONTROL, [post('a_office', { department: 'a_war' }), post('flotilla', { department: 'a_war', parent: P('a_office'), departmentChanges: [{ on: '1900-07-01', department: DEP('a_war'), parent: null, provenance: [] }] })], []);
    const s = stateFrom(MAP, start);
    expect(applyScheduledChanges(s, '1900-06-30').state).toBe(s);
    const { state, changed } = applyScheduledChanges(s, '1900-07-01');
    expect(changed).toEqual(['flotilla']);
    expect(state.postStates[P('flotilla')]).toMatchObject({ postParent: null, postScheduled: [] });
  });
});
