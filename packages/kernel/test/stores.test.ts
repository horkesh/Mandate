import { describe, expect, it } from 'vitest';
import { createDerivedMapCache, deriveMap } from '../src/control-index/derived.ts';
import { dailyNeedMilli, storesStep } from '../src/forces/stores.ts';
import { networkOf } from '../src/infrastructure/infrastructure.ts';
import { createIdMint } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { createTelemetry } from '../src/telemetry.ts';
import type { TickContext } from '../src/tick/context.ts';
import { storesPhase } from '../src/tick/forces.ts';
import { MAP_MECHANICS, mapPhase } from '../src/tick/map.ts';
import { createState } from '../src/tick/setup.ts';
import { ctxFor as ctxIn, worldOf } from './support/tick-context.ts';
import { B, block, forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { depot, E, edge, F, region } from './support/map-fixture.ts';

/**
 *   a1 (a's source) ==rail== a2 --road (capacity 1)-- mid --road-- b2 ==rail== b1 (b's source)
 *                             ~~river~~ w ~~river~~
 */
const MAP = forcesIndex({
  regions: ['a1', 'a2', 'mid', 'b2', 'b1'].map((r) => region(r)).concat([region('w', 'river')]),
  edges: [
    edge('a1', 'a2', { type: 'rail', line: 'a_line', capacity: 5 }),
    edge('a2', 'mid', { days: 2, capacity: 1 }),
    edge('mid', 'b2', { days: 2 }),
    edge('b2', 'b1', { type: 'rail', line: 'b_line' }),
    edge('a2', 'w', { type: 'river' }),
    edge('b2', 'w', { type: 'river' }),
  ],
  depots: [depot('a_src', 'a1', 'source', 5), depot('b_src', 'b1')],
});
const CONTROL = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 600 }, b2: { b: 1000 }, b1: { b: 1000 } };
const RAIL = E('rail:a1:a2:a_line');
const BLOCKS = [
  block('line', { department: 'a_war', region: 'a2', strength: 10000, storesDays: 5 }),
  block('forward', { department: 'a_war', region: 'mid', strength: 10000, storesDays: 8 }),
  block('forward2', { department: 'a_war', region: 'mid', strength: 10000, storesDays: 6 }),
  block('ship', { department: 'a_war', region: 'w', arm: 'naval', strength: 400, storesDays: 20 }),
  block('ghost', { department: 'a_war', region: 'a2', strength: null, storesDays: 10 }),
  block('unknown_stores', { department: 'a_war', region: 'a2', strength: 500, storesDays: null }),
  block('neutral', { department: 'neutral_gov', region: 'a2', strength: 500, storesDays: 10 }),
];
const START = forcesStart(CONTROL, [], BLOCKS);

function ctxFor(state: State, day: number): TickContext {
  return ctxIn(worldOf(MAP, START), state, day, MAP_MECHANICS);
}

const supplyOf = (s: State, month = 6) => deriveMap(MAP, { control: s.regionControl, month, network: networkOf(s) }).supply;
const stores = (s: State, id: string) => s.forceBlockStates[B(id)]!.fbStoresMilli;

describe('stores on hand: eaten daily, refilled by supply (FOUNDATION section 4)', () => {
  const s0 = createState(worldOf(MAP, START), { seed: 1 });

  it('needs men over the capacity unit, a day at a time', () => {
    expect(dailyNeedMilli(MAP.world.rules.stores, s0, B('line'))).toBe(500);
    expect(dailyNeedMilli(MAP.world.rules.stores, s0, B('ghost'))).toBe(0);
  });

  it('a block on a line refills a day a day toward the cap', () => {
    const r = storesStep(MAP, s0, supplyOf(s0));
    expect(stores(r.state, 'line')).toBe(6000);
    expect(r.changes.find((c) => c.block === 'line')).toMatchObject({ before: 5000, after: 6000, cause: 'supply' });
  });

  it('serves the hungriest first on a narrow line: the one with fewer days gets the road\'s single unit', () => {
    // mid's road carries 1000 milli-units a day; each forward block asks 1000 (500 need, doubled to refill).
    const r = storesStep(MAP, s0, supplyOf(s0));
    expect(r.allocations.filter((a) => a.demand.region === 'mid').map((a) => `${a.demand.label}:${a.deliveredMilli}`)).toEqual(['forward2:1000', 'forward:0']);
    expect(stores(r.state, 'forward2')).toBe(7000);
    expect(stores(r.state, 'forward')).toBe(7000);
  });

  it('leaves alone what it does not model: ships afloat, unknown values, a neutral government\'s troops', () => {
    const r = storesStep(MAP, s0, supplyOf(s0));
    for (const id of ['ship', 'ghost', 'unknown_stores', 'neutral']) expect(r.state.forceBlockStates[B(id)], id).toBe(s0.forceBlockStates[B(id)]);
  });
});

describe('stores falling in a pocket, and refilling when it is relieved', () => {
  it('a garrison cut off eats a day a day and crosses the low threshold; relief refills it (positive control: on its line it refills)', () => {
    const cache = createDerivedMapCache();
    let state = createState(worldOf(MAP, START), { seed: 1 });
    // Day 1: raiders cut the rail; a2 and mid are a pocket from today.
    const cut = ctxFor(state, 1);
    cut.infrastructureDeltas.push({ change: 'edge', edge: RAIL, deltaPermille: -1000, cause: 'raids' });
    let mapped = mapPhase(cut, state, cache);
    state = storesPhase(cut, mapped.state, mapped.derived);
    expect(cut.mapEvents.map((e) => e.event)).toEqual(['network_changed', 'pocket_closed']);
    expect(stores(state, 'line')).toBe(4000);
    expect(cut.telemetry!.mechanics['forces.stores_fell']!.fires).toBeGreaterThan(0);

    // forward has 8 days: after day 1 it has 7; day 2 takes it under the threshold of 7.
    const day2 = ctxFor(state, 2);
    mapped = mapPhase(day2, state, cache);
    state = storesPhase(day2, mapped.state, mapped.derived);
    expect(stores(state, 'forward')).toBe(6000);
    const crossed = day2.mapEvents.filter((e) => e.event === 'stores_crossed');
    expect(crossed.map((e) => (e.event === 'stores_crossed' ? `${e.crossing.block}:${e.crossing.direction}` : ''))).toEqual(['forward:down']);
    expect(day2.telemetry!.mechanics['forces.stores_low']!.fires).toBe(1);

    // Day 3: the line is repaired; the pocket is relieved and the line block refills.
    const day3 = ctxFor(state, 3);
    day3.infrastructureDeltas.push({ change: 'edge', edge: RAIL, deltaPermille: 1000, cause: 'repair' });
    mapped = mapPhase(day3, state, cache);
    state = storesPhase(day3, mapped.state, mapped.derived);
    expect(day3.mapEvents.map((e) => e.event)).toContain('pocket_relieved');
    expect(stores(state, 'line')).toBe(4000);
  });
});
