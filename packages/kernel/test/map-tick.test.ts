import { describe, expect, it } from 'vitest';
import { createDerivedMapCache } from '../src/control-index/derived.ts';
import { InvariantError } from '../src/invariants/map.ts';
import { playDays, replay } from '../src/log/session.ts';
import { createIdMint } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { indexWorld } from '../src/standin/world.ts';
import { createTelemetry } from '../src/telemetry.ts';
import type { TickContext } from '../src/tick/context.ts';
import { MAP_MECHANICS, mapBarrier, mapPhase, monthOf } from '../src/tick/map.ts';
import { createState } from '../src/tick/setup.ts';
import { SEATS_MECHANICS, tick } from '../src/tick/tick.ts';
import { commsFixture } from './support/comms-fixture.ts';
import { F, lineMap, R, startWith } from './support/map-fixture.ts';
import { scriptedSeats } from './support/test-seats.ts';

const START = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 300, b: 550 }, b2: { b: 1000 }, b1: { b: 1000 } };
// The comms fixture's factions are a and b too; its map is separate (the seam lane 0.5 closes).
const world = indexWorld(commsFixture(), lineMap());

function ctxFor(state: State, day: number, telemetry = createTelemetry([...SEATS_MECHANICS, ...MAP_MECHANICS])): TickContext {
  return { world, day, seed: state.gameSeed, mint: createIdMint(state), telemetry, outbox: [], rejections: [], events: [], proposals: [], prices: [], decisionPoints: [], controlDeltas: [], mapEvents: [] };
}

describe('setup with a map (0050: control is copied from the start once)', () => {
  it('sets control and the calendar from the start', () => {
    const state = createState(world, { seed: 1, start: startWith(START, '1900-03-15') });
    expect(state.regionControl).toEqual({ a1: { a: 1000 }, a2: { a: 1000 }, b1: { b: 1000 }, b2: { b: 1000 }, mid: { a: 300, b: 550 } });
    expect(state.calendarStart).toBe('1900-03-15');
    expect(monthOf(state, 0)).toBe(3);
    expect(monthOf(state, 17)).toBe(4);
  });

  it('requires a start exactly when the World has a map, and a real date (positive controls)', () => {
    expect(() => createState(world, { seed: 1 })).toThrow('exactly when the World has a map');
    expect(() => createState(indexWorld(commsFixture()), { seed: 1, start: startWith(START) })).toThrow('exactly when the World has a map');
    expect(() => createState(world, { seed: 1, start: startWith(START, '1900-02-30') })).toThrow('not an ISO date');
    const plain = createState(indexWorld(commsFixture()), { seed: 1 });
    expect(plain.regionControl).toEqual({});
    expect(plain.calendarStart).toBeNull();
    expect([plain.regionGovernments, plain.closedGovernments]).toEqual([{}, {}]);
  });

  it('copies each region’s government from the start, in region order, with no government closed (0058)', () => {
    const state = createState(world, { seed: 1, start: startWith(START, '1900-03-15', { mid: 'unknown', b1: 'b_gov', a1: 'a_gov' }) });
    expect(state.regionGovernments).toEqual({ a1: 'a_gov', b1: 'b_gov', mid: 'unknown' });
    expect(Object.keys(state.regionGovernments)).toEqual(['a1', 'b1', 'mid']);
    expect(state.closedGovernments).toEqual({});
  });
});

describe('the map phase: control changes through the writer, pockets reported', () => {
  it('applies proposed deltas, reports changes, crossings and a pocket closing, then its opening', () => {
    const start = createState(world, { seed: 1, start: startWith(START, '1900-06-01') });
    const telemetry = createTelemetry([...SEATS_MECHANICS, ...MAP_MECHANICS]);
    const cache = createDerivedMapCache();
    // b takes a2 outright: a's mid is then cut off from both its origins.
    const ctx = ctxFor(start, 1, telemetry);
    ctx.controlDeltas.push({ region: R('a2'), faction: F('b'), deltaPermille: 1000, cause: 'occupation' });
    const { state, derived } = mapPhase(ctx, start, cache);
    expect(state.regionControl[R('a2')]).toEqual({ b: 1000 });
    expect(ctx.mapEvents.map((e) => e.event)).toEqual(['control_changed', 'threshold_crossed', 'threshold_crossed', 'threshold_crossed', 'threshold_crossed', 'pocket_closed']);
    const closed = ctx.mapEvents.find((e) => e.event === 'pocket_closed')!;
    expect(closed).toEqual({ event: 'pocket_closed', faction: 'a', pocket: 'pocket:a:mid', regions: ['mid'], cut: { why: 'not_traced', region: 'a2', edge: null, by: null } });
    expect(derived!.supply.factions.get(F('a'))!.pockets.map((p) => p.id)).toEqual(['pocket:a:mid']);
    expect(telemetry.mechanics['map.pocket_closed']!.fires).toBe(1);
    expect(telemetry.mechanics['control.threshold_crossed']!.fires).toBe(4);

    // a takes it back: the pocket is relieved.
    const ctx2 = ctxFor(state, 2, telemetry);
    ctx2.controlDeltas.push({ region: R('a2'), faction: F('a'), deltaPermille: 1000, cause: 'occupation' });
    mapPhase(ctx2, state, cache);
    expect(ctx2.mapEvents.filter((e) => e.event === 'pocket_relieved' || e.event === 'pocket_lost')).toEqual([{ event: 'pocket_relieved', faction: 'a', pocket: 'pocket:a:mid', regions: ['mid'], cut: null }]);
    expect(telemetry.mechanics['map.pocket_relieved']!.fires).toBe(1);
  });

  it('reports an overrun pocket as lost, never as relieved (review S2)', () => {
    // a's garrison in mid is cut off (b holds a2); then b overruns mid itself.
    const start = createState(world, { seed: 1, start: startWith({ ...START, a2: { b: 1000 }, mid: { a: 600, b: 300 } }, '1900-06-01') });
    const telemetry = createTelemetry([...SEATS_MECHANICS, ...MAP_MECHANICS]);
    const cache = createDerivedMapCache();
    const ctx = ctxFor(start, 1, telemetry);
    ctx.controlDeltas.push({ region: R('mid'), faction: F('b'), deltaPermille: 700, cause: 'combat' });
    const { derived } = mapPhase(ctx, start, cache);
    expect(derived!.index.holdings.get(R('mid'))!.tracedBy).toEqual(['b']);
    expect(ctx.mapEvents.filter((e) => e.event === 'pocket_relieved' || e.event === 'pocket_lost')).toEqual([
      { event: 'pocket_lost', faction: 'a', pocket: 'pocket:a:mid', regions: ['mid'], cut: { why: 'not_traced', region: 'a2', edge: null, by: null } },
    ]);
    expect(telemetry.mechanics['map.pocket_lost']!.fires).toBe(1);
    expect(telemetry.mechanics['map.pocket_relieved']!.fires).toBe(0);
  });

  it('refuses control deltas in a game with no map', () => {
    const plainWorld = indexWorld(commsFixture());
    const plain = createState(plainWorld, { seed: 1 });
    const ctx: TickContext = { ...ctxFor(plain, 1), world: plainWorld };
    ctx.controlDeltas.push({ region: R('a2'), faction: F('b'), deltaPermille: 10, cause: 'combat' });
    expect(() => mapPhase(ctx, plain, createDerivedMapCache())).toThrow('no map');
  });

  it('the barrier throws on corrupted control with every typed failure (positive control)', () => {
    const start = createState(world, { seed: 1, start: startWith(START) });
    const corrupt = { ...start, regionControl: { ...start.regionControl, [R('mid')]: { a: 600, b: 550 } } } as State;
    try {
      mapBarrier(ctxFor(corrupt, 1), corrupt, null, false);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(InvariantError);
      expect((e as InvariantError).failures.map((f) => `${f.kind}:${f.region}`)).toEqual(['control_over_1000:mid']);
    }
    expect(() => tick(world, corrupt, [])).toThrow(InvariantError);
  });
});

describe('whole games with a map', () => {
  it('play, replay and hash identically, with the derived map rebuilt only when the month changes', () => {
    const start = createState(world, { seed: 7, start: startWith(START, '1900-01-20') });
    const telemetry = createTelemetry([...SEATS_MECHANICS, ...MAP_MECHANICS]);
    const run = playDays(world, start, scriptedSeats(), 60, { freeze: true, deepChecks: true, telemetry });
    // Day 1 builds it (January); February and March each rebuild it once.
    expect(telemetry.mechanics['map.recomputed']!.fires).toBe(3);
    const replayed = replay(world, start, run.log, 60, { freeze: true, deepChecks: true });
    expect(replayed.hashes).toEqual(run.hashes);
    expect(canonicalHash(replayed.state)).toBe(canonicalHash(run.state));
    expect(run.state.regionControl).toBe(start.regionControl);
  });

  it('report the day map in the tick result, derived and never in State', () => {
    const start = createState(world, { seed: 7, start: startWith(START, '1900-06-01') });
    const r = tick(world, start, []);
    expect(r.map!.index.contactEdges.map((c) => c.edge)).toEqual(['road:a2:mid']);
    expect(Object.keys(r.state)).not.toContain('map');
    expect(tick(indexWorld(commsFixture()), createState(indexWorld(commsFixture()), { seed: 1 }), []).map).toBeNull();
  });
});
