import { describe, expect, it } from 'vitest';
import { orderJoins } from '../src/movement/join.ts';
import type { State } from '../src/root-state.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { tick, TICK_MECHANICS } from '../src/tick/tick.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import { B, block, forcesStart, forcesWorld, P, PER, person, post } from './support/forces-fixture.ts';
import { depot, edge, F, FIXTURE_COMBAT_RULES, R, region } from './support/map-fixture.ts';
import { worldOf } from './support/tick-context.ts';

/**
 * A block ordered to join its post marches to the post's seat by movement's own routes, and waits with a typed reason
 * when no route reaches it (lane 1.12; `movement/join.ts`, the lead's Fix 1):
 *
 *   a1 ==rail== a2 --road-- a3          island (a's, reached only by water from a3)
 */
const base = forcesWorld({
  regions: ['a1', 'a2', 'a3', 'island', 'b1'].map((r) => region(r)),
  edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line', days: 3 }), edge('a2', 'a3'), edge('a3', 'island', { type: 'sea' })],
  depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
  people: [person('a_lead', 'a'), person('a_gen', 'a'), person('a_isle', 'a'), person('b_lead', 'b')],
});
const map = indexWorld({ ...base, rules: { ...base.rules, combat: FIXTURE_COMBAT_RULES } });
const world = worldOf(map, {
  ...forcesStart(
    { a1: { a: 1000 }, a2: { a: 1000 }, a3: { a: 1000 }, island: { a: 1000 }, b1: { b: 1000 } },
    [post('a_army', { department: 'a_war', holder: PER('a_gen'), region: R('a3') }), post('a_isle', { department: 'a_war', holder: PER('a_isle'), region: R('island') })],
    [block('a_levy', { department: 'a_war', region: 'a1', strength: 1000, post: P('a_army') })],
  ),
  factions: [
    { faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true },
    { faction: F('b'), principal: PER('b_lead'), capital: R('b1'), playable: true },
  ],
});

function playFor(state: State, days: number) {
  const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
  let s = state;
  const legs: string[] = [];
  for (let i = 0; i < days; i++) {
    s = tick(world, s, [], { telemetry }).state;
    const m = s.forceLocations[B('a_levy')]?.locMarch;
    if (m !== null && m !== undefined && !legs.includes(m.marchEdge)) legs.push(m.marchEdge);
  }
  return { state: s, telemetry, legs };
}

describe('a block ordered to join its post (lane 1.12)', () => {
  it('marches to the post’s seat by rail and road, and the order ends there (movement.joined)', () => {
    const s0 = orderJoins(createState(world, { seed: 1 }), [B('a_levy')], P('a_army'), R('a3'), 0);
    const { state, telemetry, legs } = playFor(s0, 10);
    expect(state.forceLocations[B('a_levy')]!.locRegion).toBe(R('a3'));
    expect(state.forceJoins[B('a_levy')]).toBeUndefined();
    // By rail first (the quickest way the side traces); the one-day road leg is started and crossed within a day.
    expect(legs[0]).toBe('rail:a1:a2:a_line');
    expect(telemetry.mechanics['movement.joined']!.fires).toBe(1);
    expect(telemetry.mechanics['movement.join_blocked']!.fires).toBe(0);
  });

  it('waits, typed no_route, when no route reaches the seat (an island), and is tried again each day', () => {
    const assigned = { ...createState(world, { seed: 1 }), forceAssignments: { ...createState(world, { seed: 1 }).forceAssignments, [B('a_levy')]: P('a_isle') } };
    const s0 = orderJoins(assigned, [B('a_levy')], P('a_isle'), R('island'), 0);
    const { state, telemetry } = playFor(s0, 3);
    expect(state.forceLocations[B('a_levy')]!.locRegion).not.toBe(R('island'));
    expect(state.forceJoins[B('a_levy')]).toMatchObject({ joinPost: P('a_isle'), joinBlocked: 'no_route' });
    // Re-checked each day: once at the shore it can go no further.
    expect(telemetry.mechanics['movement.join_blocked']!.fires).toBeGreaterThanOrEqual(1);
  });

  it('ends when the block is no longer the post’s (transferred again)', () => {
    let s0 = orderJoins(createState(world, { seed: 1 }), [B('a_levy')], P('a_army'), R('a3'), 0);
    s0 = { ...s0, forceAssignments: { ...s0.forceAssignments, [B('a_levy')]: P('a_isle') } };
    const { state } = playFor(s0, 1);
    expect(state.forceJoins[B('a_levy')]).toBeUndefined();
    expect(state.forceLocations[B('a_levy')]!.locRegion).toBe(R('a1'));
  });
});
