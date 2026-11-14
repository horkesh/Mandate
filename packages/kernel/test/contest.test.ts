import { describe, expect, it } from 'vitest';
import { contest, presenceByRegion } from '../src/combat/contest.ts';
import { CONTROL_CAUSES } from '../src/control/control.ts';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { createDerivedMapCache } from '../src/control-index/derived.ts';
import type { ForceBlockId } from '../src/ids.ts';
import { createIdMint } from '../src/messages/transit.ts';
import type { MarchGround } from '../src/movement/march.ts';
import type { State } from '../src/root-state.ts';
import { indexWorld as indexComms } from '../src/standin/world.ts';
import { INTACT_NETWORK } from '../src/supply/supply.ts';
import { createTelemetry } from '../src/telemetry.ts';
import type { TickContext } from '../src/tick/context.ts';
import { contestPhase } from '../src/tick/forces.ts';
import { MAP_MECHANICS, mapPhase } from '../src/tick/map.ts';
import { createState } from '../src/tick/setup.ts';
import type { ForceBlockStart } from '../src/world/scenario.ts';
import { commsFixture } from './support/comms-fixture.ts';
import { B, block, forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { depot, edge, F, R, region } from './support/map-fixture.ts';

/**
 *   a1 (a's source) ==rail== a2 --road-- mid --road-- b2 ==rail== b1 (b's source)
 *                                         |
 *                                         n (neutral: nobody controls it)
 */
const MAP = forcesIndex({
  regions: ['a1', 'a2', 'mid', 'b2', 'b1', 'n'].map((r) => region(r)),
  edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line' }), edge('a2', 'mid'), edge('mid', 'b2'), edge('b2', 'b1', { type: 'rail', line: 'b_line' }), edge('mid', 'n')],
  depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
});
const WORLD = indexComms(commsFixture(), MAP);

function stateWith(control: Readonly<Record<string, Readonly<Record<string, number>>>>, blocks: readonly ForceBlockStart[]): State {
  return createState(WORLD, { seed: 1, start: forcesStart(control, [], blocks) });
}

const ground = (s: State): MarchGround => ({ map: MAP, index: buildControlIndex(MAP, s.regionControl), network: INTACT_NETWORK, month: 6 });

function ctxFor(state: State, day: number): TickContext {
  return { world: WORLD, day, seed: state.gameSeed, mint: createIdMint(state), telemetry: createTelemetry([...MAP_MECHANICS]), outbox: [], rejections: [], events: [], proposals: [], prices: [], decisionPoints: [], controlDeltas: [], infrastructureDeltas: [], mapEvents: [] };
}

const BASE = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 300, b: 550 }, b2: { b: 1000 }, b1: { b: 1000 } };

describe('occupation: a side alone in held ground gains it day by day', () => {
  it('proposes control for the side present, cause occupation; no troops, no change (positive control)', () => {
    const s = stateWith(BASE, [block('a_1', { department: 'a_war', region: 'mid', strength: 3000 })]);
    const r = contest(ground(s), s);
    expect(r.records).toEqual([{ region: 'mid', kind: 'occupation', sides: [{ faction: 'a', men: 3000, blocks: ['a_1'], unknown: [] }], gainer: 'a', deltaPermille: 100 }]);
    expect(r.deltas).toEqual([{ region: R('mid'), faction: F('a'), deltaPermille: 100, cause: 'occupation' }]);
    expect(contest(ground(stateWith(BASE, [])), stateWith(BASE, [])).deltas).toEqual([]);
  });

  it('takes nothing on neutral ground: passing through a neutral government\'s land is not taking it (0055)', () => {
    const s = stateWith(BASE, [block('a_1', { department: 'a_war', region: 'n' })]);
    expect(contest(ground(s), s).deltas).toEqual([]);
  });

  it('ignores ships, troops aboard and blocks on a leg; counts an unknown strength as none, and says so', () => {
    const s = stateWith(BASE, [block('a_1', { department: 'a_war', region: 'mid', strength: null }), block('b_1', { department: 'b_war', region: 'mid', strength: 10 })]);
    const sides = presenceByRegion(ground(s), s).get(R('mid'))!;
    expect(sides.map((p) => `${p.faction}:${p.men}:${p.unknown.join(',')}`)).toEqual(['b:10:', 'a:0:a_1']);
  });
});

describe('the contest: the stronger side gains in proportion to its margin', () => {
  it('two to one gains half the contest rate, cause combat; a tie changes nothing', () => {
    const s = stateWith(BASE, [block('a_1', { department: 'a_war', region: 'mid', strength: 10000 }), block('b_1', { department: 'b_war', region: 'mid', strength: 5000 })]);
    expect(contest(ground(s), s).deltas).toEqual([{ region: R('mid'), faction: F('a'), deltaPermille: 100, cause: 'combat' }]);
    const tie = stateWith(BASE, [block('a_1', { department: 'a_war', region: 'mid', strength: 5000 }), block('b_1', { department: 'b_war', region: 'mid', strength: 5000 })]);
    const t = contest(ground(tie), tie);
    expect(t.deltas).toEqual([]);
    expect(t.records[0]).toMatchObject({ kind: 'contest', gainer: null, deltaPermille: 0 });
  });

  it('every proposer is a listed control cause', () => {
    expect([...CONTROL_CAUSES].sort()).toEqual(['combat', 'occupation']);
  });
});

describe('retreat below the pack\'s threshold (0019)', () => {
  it('falls back to the neighbour where the side holds most, and stays put with nowhere to go (positive control)', () => {
    const blocks = [block('a_1', { department: 'a_war', region: 'mid', strength: 10000 }), block('b_1', { department: 'b_war', region: 'mid', strength: 5000 })];
    const s = stateWith({ ...BASE, mid: { a: 900, b: 60 } }, blocks);
    const r = contest(ground(s), s);
    // a gains 100: 900 + 100 + 60 passes 1000, so b gives 60 and holds nothing: under the retreat threshold of 50.
    expect(r.retreats).toEqual([{ faction: 'b', from: 'mid', to: 'b2', edge: 'road:b2:mid', blocks: ['b_1'], sharePermille: 0 }]);
    const nowhere = stateWith({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 900, b: 60 }, b2: { a: 1000 }, b1: { b: 1000 } }, blocks);
    expect(contest(ground(nowhere), nowhere).retreats).toEqual([{ faction: 'b', from: 'mid', to: null, edge: null, blocks: ['b_1'], sharePermille: 0 }]);
  });

  it('the tick applies the retreat by movement and the control by control', () => {
    const s = stateWith({ ...BASE, mid: { a: 900, b: 60 } }, [block('a_1', { department: 'a_war', region: 'mid', strength: 10000 }), block('b_1', { department: 'b_war', region: 'mid', strength: 5000 })]);
    const ctx = ctxFor(s, 1);
    const after = contestPhase(ctx, s).state;
    expect(after.forceLocations[B('b_1')]).toEqual({ locRegion: 'b2', locAboard: null, locSinceDay: 1, locMarch: null });
    expect(after.regionControl).toBe(s.regionControl);
    const mapped = mapPhase(ctx, after, createDerivedMapCache());
    expect(mapped.state.regionControl[R('mid')]).toEqual({ a: 1000 });
    // b's share falls past the retreat threshold (50); a's rise to 1000 crosses nothing it had not passed.
    expect(ctx.mapEvents.map((e) => e.event)).toEqual(['contest', 'retreat', 'control_changed', 'threshold_crossed']);
    expect(ctx.telemetry!.mechanics['combat.retreat']!.fires).toBe(1);
  });
});

describe('a pocket forming when a force cuts a line, and lifting when it is relieved', () => {
  it('a raid occupies b2 until b no longer traces it, cutting mid off; relief wins it back and the pocket lifts', () => {
    const cache = createDerivedMapCache();
    let state = stateWith({ ...BASE, mid: { b: 1000 } }, [block('a_raid', { department: 'a_war', region: 'b2', strength: 2000 })]);
    const events: string[] = [];
    const day = (d: number) => {
      const ctx = ctxFor(state, d);
      state = contestPhase(ctx, state).state;
      state = mapPhase(ctx, state, cache).state;
      for (const e of ctx.mapEvents) if (e.event === 'pocket_closed' || e.event === 'pocket_relieved' || e.event === 'pocket_lost') events.push(`${d}:${e.faction}:${e.event}`);
    };
    // Each day a takes 100 from b in b2; b traces b2 while it holds 250. Day 8 takes b to 200.
    for (let d = 1; d <= 8; d++) day(d);
    expect(state.regionControl[R('b2')]).toEqual({ a: 800, b: 200 });
    // Day 3: the raiders trace b2 (300) with no line of their own to it: their own pocket. Day 8: b's line to mid is cut.
    expect(events).toEqual(['3:a:pocket_closed', '8:b:pocket_closed']);
    // Relief: b's force arrives in b2, five to one; it wins the ground back.
    const relief: ForceBlockId = B('b_relief');
    state = { ...state, forceBlockStates: { ...state.forceBlockStates, [relief]: { ...state.forceBlockStates[B('a_raid')]!, fbDepartment: 'b_war' as never, fbStrength: 10000 } }, forceLocations: { ...state.forceLocations, [relief]: { locRegion: R('b2'), locAboard: null, locSinceDay: 8, locMarch: null } } };
    day(9);
    expect(state.regionControl[R('b2')]).toEqual({ a: 640, b: 360 });
    expect(events).toEqual(['3:a:pocket_closed', '8:b:pocket_closed', '9:b:pocket_relieved']);
  });
});
