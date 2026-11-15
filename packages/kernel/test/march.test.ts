import { describe, expect, it } from 'vitest';
import { initialCommand } from '../src/command/command.ts';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { initialControl } from '../src/control/control.ts';
import { initialForces } from '../src/forces/forces.ts';
import { applyInfrastructure, networkOf } from '../src/infrastructure/infrastructure.ts';
import { advanceMarches, legsFrom, marchBar, marchSteps, startLeg, type MarchGround } from '../src/movement/march.ts';
import { initialLocations, MovementError } from '../src/movement/movement.ts';
import type { State } from '../src/root-state.ts';
import { deriveSupply, edgeLeg, INTACT_NETWORK, type NetworkConditions } from '../src/supply/supply.ts';
import { emptyState } from '../src/tick/setup.ts';
import type { ScenarioStart } from '../src/world/scenario.ts';
import { B, block, forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { D, E, edge, F, fort, R, region } from './support/map-fixture.ts';

/**
 *   a1 ==rail 1d== a2 --road 2d-- mid --road 2d-- b1
 *   a1 --road 3d (mud)-- a2
 *   a2 ==rail 1d== n1 (no side's) ==rail 1d== b1;  n1 --road-- a3 (a's, reached only through n1)
 *   a2 ~~river cap 1 (low water Aug-Oct)~~ w ~~river~~ b1 (b's fort commands it)
 *   b1 --road-- box (off the map)
 */
const MAP = forcesIndex({
  regions: ['a1', 'a2', 'mid', 'n1', 'a3', 'b1'].map((r) => region(r)).concat([region('w', 'river'), region('box', 'off_map')]),
  edges: [
    edge('a1', 'a2', { type: 'rail', days: 1, line: 'a_line' }),
    edge('a1', 'a2', { days: 3, seasons: [{ reason: 'mud', months: [1, 2, 3, 12], depthFeet: null }] }),
    edge('a2', 'mid', { days: 2 }),
    edge('mid', 'b1', { days: 2 }),
    edge('a2', 'n1', { type: 'rail', days: 1, line: 'n_line' }),
    edge('n1', 'b1', { type: 'rail', days: 1, line: 'n_line' }),
    edge('a2', 'w', { type: 'river', days: 1, capacity: 1, seasons: [{ reason: 'low_water', months: [8, 9, 10], depthFeet: null }] }),
    edge('w', 'b1', { type: 'river', days: 1, capacity: 3 }),
    edge('b1', 'box', { days: 1 }),
    edge('n1', 'a3', { days: 1 }),
  ],
  depots: [{ id: D('a_src'), region: R('a1'), kind: 'source', name: 'depot.a_src.name', capacity: 5, provenance: [] }],
  installations: [fort('b_fort', 'b1', ['river:b1:w'])],
});

const CONTROL = { a1: { a: 1000 }, a2: { a: 1000 }, a3: { a: 1000 }, mid: { a: 300, b: 300 }, b1: { b: 1000 } };
const BLOCKS = [
  block('foot', { department: 'a_war', region: 'a1' }),
  block('foot2', { department: 'a_war', region: 'a1' }),
  block('boat', { department: 'a_war', region: 'a2', arm: 'naval' }),
  block('riders', { department: 'a_war', region: 'a2', aboard: B('boat') }),
  block('b_boat', { department: 'b_war', region: 'b1', arm: 'naval' }),
];

function stateFor(start: ScenarioStart): State {
  const command = initialCommand(MAP, start);
  return { ...emptyState(), regionControl: initialControl(MAP, start), forceBlockStates: initialForces(MAP, start), forceLocations: initialLocations(MAP, start), postStates: command.posts, forceAssignments: command.assignments };
}

const S = stateFor(forcesStart(CONTROL, [], BLOCKS));

function ground(month: number, control = S.regionControl, network: NetworkConditions = INTACT_NETWORK): MarchGround {
  return { map: MAP, index: buildControlIndex(MAP, control), network, month };
}

const ROAD = E('road:a1:a2');
const RAIL = E('rail:a1:a2:a_line');
const leg = (g: MarchGround, id: string, from: string) => edgeLeg(MAP, MAP.edges.get(E(id))!, R(from), g.month, g.network);

/** March `blocks` along a leg starting on day 1; return the day they arrive (or null after 10 days). */
function arrivalDay(g: MarchGround, edgeId: string, from: string, blocks: readonly string[], naval = false): number | null {
  let s = startLeg(g, S, blocks.map(B), leg(g, edgeId, from), F('a'), naval, 1);
  for (let day = 1; day <= 10; day++) {
    const r = advanceMarches(s, day);
    s = r.state;
    if (r.arrivals.length > 0) return day;
  }
  return null;
}

describe('marching along a road and along rail (FOUNDATION section 4)', () => {
  it('takes the edge\'s days for a division: three by road, one by rail (crossed the day it starts)', () => {
    const june = ground(6);
    expect(arrivalDay(june, 'road:a1:a2', 'a1', ['foot', 'foot2'])).toBe(3);
    expect(arrivalDay(june, 'rail:a1:a2:a_line', 'a1', ['foot'])).toBe(1);
  });

  it('offers the quickest route\'s first leg toward a goal, the rail line while the side traces both ends', () => {
    const june = ground(6);
    expect(marchSteps(june, R('a1'), R('a2'), F('a'), false).map((s) => s.leg.edge)).toEqual([RAIL]);
    expect(marchSteps(june, R('a1'), R('a1'), F('a'), false)).toEqual([]);
  });

  it('refuses rail through ground the side does not trace; the road is then the way (positive control)', () => {
    const cut = ground(6, { ...S.regionControl, [R('a2')]: { [F('a')]: 100 } });
    expect(marchBar(cut, leg(cut, 'rail:a1:a2:a_line', 'a1'), F('a'), false)).toBe('rail_not_traced');
    expect(marchSteps(cut, R('a1'), R('a2'), F('a'), false).map((s) => s.leg.edge)).toEqual([ROAD]);
  });

  it('arrives at the leg\'s end with every block on it, and moves no one else', () => {
    const june = ground(6);
    const s = startLeg(june, S, [B('foot')], leg(june, 'road:a1:a2', 'a1'), F('a'), false, 1);
    expect(s.forceLocations[B('foot')]!.locMarch).toEqual({ marchEdge: ROAD, marchFrom: 'a1', marchTo: 'a2', marchNeedMilli: 3000, marchDoneMilli: 0, marchStartDay: 1 });
    let t = advanceMarches(s, 1).state;
    t = advanceMarches(t, 2).state;
    expect(t.forceLocations[B('foot')]!.locRegion).toBe('a1');
    const arrived = advanceMarches(t, 3);
    expect(arrived.arrivals).toEqual([{ block: 'foot', region: 'a2', edge: ROAD, carried: [] }]);
    expect(arrived.state.forceLocations[B('foot')]).toEqual({ locRegion: 'a2', locAboard: null, locSinceDay: 3, locMarch: null });
    expect(arrived.state.forceLocations[B('foot2')]).toBe(S.forceLocations[B('foot2')]);
    expect(advanceMarches(S, 1).state).toBe(S);
  });
});

describe('seasons (0029)', () => {
  it('mud lengthens the road by half: four and a half days, so it is crossed on the fifth', () => {
    const march = ground(3);
    expect(leg(march, 'road:a1:a2', 'a1').daysPermille).toBe(4500);
    expect(arrivalDay(march, 'road:a1:a2', 'a1', ['foot'])).toBe(5);
  });

  it('low water closes a small river to ships: open in June, closed in August (positive control)', () => {
    expect(marchBar(ground(6), leg(ground(6), 'river:a2:w', 'a2'), F('a'), true)).toBeNull();
    const august = ground(8);
    expect(leg(august, 'river:a2:w', 'a2').capacityMilli).toBe(500);
    expect(marchBar(august, leg(august, 'river:a2:w', 'a2'), F('a'), true)).toBe('edge_closed');
    expect(legsFrom(august, R('a2'), F('a'), true)).toEqual([]);
  });

  it('damage that cuts an edge closes it to every march', () => {
    const cut = ground(6, S.regionControl, { ...INTACT_NETWORK, edgeCondition: { [RAIL]: 0 } });
    expect(marchBar(cut, leg(cut, 'rail:a1:a2:a_line', 'a1'), F('a'), false)).toBe('edge_closed');
  });
});

describe('neutral passage (0055, 0058)', () => {
  const OPEN: NetworkConditions = { ...INTACT_NETWORK, neutralGround: { [R('n1')]: 'open' } };
  const CLOSED: NetworkConditions = { ...INTACT_NETWORK, neutralGround: { [R('n1')]: 'closed' } };

  it('an open neutral government passes either side\'s rail and supply', () => {
    const open = ground(6, S.regionControl, OPEN);
    expect(marchBar(open, leg(open, 'rail:a2:n1:n_line', 'a2'), F('a'), false)).toBeNull();
    expect(marchSteps(open, R('a2'), R('n1'), F('a'), false).map((s) => s.leg.edge)).toEqual([E('rail:a2:n1:n_line')]);
    // Rail on into b1 still needs b1 traced: a's way to b1 is the road through mid.
    expect(marchBar(open, leg(open, 'rail:b1:n1:n_line', 'n1'), F('a'), false)).toBe('rail_not_traced');
    const supply = deriveSupply(MAP, open.index, 6, OPEN).factions.get(F('a'))!;
    expect(supply.paths.get(R('a3'))!.legs.map((l) => l.to)).toEqual(['a2', 'n1', 'a3']);
    expect(supply.pockets).toEqual([]);
  });

  it('a closed government bars every march into it and cuts the line through it (positive control)', () => {
    const closed = ground(6, S.regionControl, CLOSED);
    expect(marchBar(closed, leg(closed, 'rail:a2:n1:n_line', 'a2'), F('a'), false)).toBe('closed_neutral');
    expect(marchBar(closed, leg(closed, 'road:a3:n1', 'a3'), F('a'), false)).toBe('closed_neutral');
    expect(marchSteps(closed, R('a2'), R('n1'), F('a'), false)).toEqual([]);
    const supply = deriveSupply(MAP, closed.index, 6, CLOSED).factions.get(F('a'))!;
    expect(supply.pockets.map((p) => p.regions)).toEqual([['a3']]);
  });

  it('ground whose government is unknown is not neutral: no passage for supply or rail, but troops may march in by road', () => {
    const unknown = ground(6);
    expect(marchBar(unknown, leg(unknown, 'rail:a2:n1:n_line', 'a2'), F('a'), false)).toBe('rail_not_traced');
    expect(marchBar(unknown, leg(unknown, 'road:a3:n1', 'a3'), F('a'), false)).toBeNull();
    expect(deriveSupply(MAP, unknown.index, 6).factions.get(F('a'))!.pockets.map((p) => p.regions)).toEqual([['a3']]);
  });
});
describe('ships, troops aboard and what each may use', () => {
  it('troops aboard arrive with their ship', () => {
    const june = ground(6);
    let s = startLeg(june, S, [B('boat')], leg(june, 'river:a2:w', 'a2'), F('a'), true, 1);
    const r = advanceMarches(s, 1);
    s = r.state;
    expect(r.arrivals).toEqual([{ block: 'boat', region: 'w', edge: E('river:a2:w'), carried: ['riders'] }]);
    expect(s.forceLocations[B('riders')]).toMatchObject({ locRegion: 'w', locAboard: 'boat', locSinceDay: 1 });
  });

  it('bars land troops from water, ships from roads, everyone from off the map, and the enemy\'s fort from a ship (positive controls)', () => {
    const june = ground(6);
    expect(marchBar(june, leg(june, 'river:a2:w', 'a2'), F('a'), false)).toBe('needs_ship');
    expect(marchBar(june, leg(june, 'road:a2:mid', 'a2'), F('a'), true)).toBe('not_water');
    expect(marchBar(june, leg(june, 'road:b1:box', 'b1'), F('b'), false)).toBe('off_map');
    const obstructed = ground(6, S.regionControl, { ...INTACT_NETWORK, obstructions: [{ edge: E('river:b1:w'), by: fort('b_fort', 'b1').id }] });
    expect(marchBar(obstructed, leg(obstructed, 'river:b1:w', 'w'), F('a'), true)).toBe('obstructed');
    expect(marchBar(obstructed, leg(obstructed, 'river:b1:w', 'b1'), F('b'), true)).toBeNull();
  });

  it('works no fort holds (a boom) close a water edge to every side; clearing them reopens it (lane 0.9 ask 3)', () => {
    const boom = applyInfrastructure(MAP, S, [{ change: 'obstruct', edge: E('river:a2:w'), by: null, cause: 'situations' }]).state;
    const shut = ground(6, S.regionControl, networkOf(boom));
    expect(marchBar(shut, leg(shut, 'river:a2:w', 'a2'), F('a'), true)).toBe('obstructed');
    expect(marchBar(shut, leg(shut, 'river:a2:w', 'w'), F('b'), true)).toBe('obstructed');
    // A relief clears them, deliberately or by force (cause `operations` or `combat`).
    const cleared = applyInfrastructure(MAP, boom, [{ change: 'clear', edge: E('river:a2:w'), cause: 'operations' }]).state;
    expect(cleared.infraObstructions).toEqual([]);
    const open = ground(6, S.regionControl, networkOf(cleared));
    expect(marchBar(open, leg(open, 'river:a2:w', 'a2'), F('a'), true)).toBeNull();
  });

  it('refuses a leg for a block not at its start, aboard a ship, or already marching (positive controls)', () => {
    const june = ground(6);
    const road = leg(june, 'road:a1:a2', 'a1');
    expect(() => startLeg(june, S, [B('boat')], road, F('a'), false, 1)).toThrow(MovementError);
    expect(() => startLeg(june, S, [B('riders')], leg(june, 'road:a2:mid', 'a2'), F('a'), false, 1)).toThrow('moves with its ship');
    const marching = startLeg(june, S, [B('foot')], road, F('a'), false, 1);
    expect(() => startLeg(june, marching, [B('foot')], road, F('a'), false, 1)).toThrow('already on a leg');
    expect(() => startLeg(june, S, [B('foot')], leg(june, 'river:a2:w', 'a2'), F('a'), false, 1)).toThrow('barred');
  });
});
