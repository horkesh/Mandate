import { describe, expect, it } from 'vitest';
import { createDerivedMapCache } from '../src/control-index/derived.ts';
import { applyInfrastructure, edgeConditionOf, InfrastructureError, initialInfrastructure, networkOf } from '../src/infrastructure/infrastructure.ts';
import { createIdMint } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { networkConditions } from '../src/supply/supply.ts';
import { createTelemetry } from '../src/telemetry.ts';
import type { TickContext } from '../src/tick/context.ts';
import { MAP_MECHANICS, mapPhase } from '../src/tick/map.ts';
import { createState } from '../src/tick/setup.ts';
import type { ScenarioStart } from '../src/world/scenario.ts';
import { ctxFor as ctxIn, worldOf } from './support/tick-context.ts';
import { forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { D, depot, E, edge, F, fort, I, R, region } from './support/map-fixture.ts';

const MAP = forcesIndex({
  regions: ['a1', 'a2', 'mid', 'b2', 'b1'].map((r) => region(r)).concat([region('w', 'river')]),
  edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line' }), edge('a2', 'mid', { days: 2 }), edge('mid', 'b2', { days: 2 }), edge('b2', 'b1', { type: 'rail', line: 'b_line' }), edge('a2', 'w', { type: 'river' }), edge('b2', 'w', { type: 'river' })],
  depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
  installations: [fort('b_fort', 'b2', ['river:b2:w'])],
});
const CONTROL = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 600 }, b2: { b: 1000 }, b1: { b: 1000 } };
const RAIL = E('rail:a1:a2:a_line');

function startWith(extra: Partial<ScenarioStart>): ScenarioStart {
  return forcesStart(CONTROL, [], [], extra);
}


function ctxFor(state: State, day: number): TickContext {
  return ctxIn(worldOf(MAP, startWith({})), state, day, MAP_MECHANICS);
}

describe('infrastructure: the network as State, copied once from the start (0050)', () => {
  it('keeps only what is not intact, and reads back as the supply derivation\'s network', () => {
    const start = startWith({
      edgeConditions: [
        { edge: RAIL, conditionPermille: 400 },
        { edge: E('road:a2:mid'), conditionPermille: 1000 },
      ],
      depotConditions: [{ depot: D('b_src'), conditionPermille: 0 }],
      obstructions: [{ edge: E('river:b2:w'), by: I('b_fort'), provenance: [] }],
    });
    const net = initialInfrastructure(MAP, start);
    expect(net.edges).toEqual({ [RAIL]: 400 });
    expect(net.depots).toEqual({ b_src: 0 });
    expect(net.obstructions).toEqual([{ obsEdge: 'river:b2:w', obsBy: 'b_fort' }]);
    const state = createState(worldOf(MAP, start), { seed: 1 });
    // The same network the start describes; the intact edge it lists is simply absent.
    expect(networkOf(state)).toEqual(networkConditions({ ...start, edgeConditions: [{ edge: RAIL, conditionPermille: 400 }] }));
    expect(networkOf(state)).toEqual({ edgeCondition: { [RAIL]: 400 }, depotCondition: { b_src: 0 }, obstructions: [{ edge: 'river:b2:w', by: 'b_fort' }] });
    expect(edgeConditionOf(MAP, state, RAIL)).toBe(400);
    expect(edgeConditionOf(MAP, state, E('road:a2:mid'))).toBe(1000);
  });

  it('refuses a broken start, listing every problem (positive controls)', () => {
    const bad = startWith({
      edgeConditions: [{ edge: E('road:nowhere'), conditionPermille: 1200 }],
      depotConditions: [{ depot: D('ghost'), conditionPermille: 10 }],
      obstructions: [
        { edge: RAIL, by: null, provenance: [] },
        { edge: E('river:a2:w'), by: I('ghost_fort'), provenance: [] },
      ],
    });
    try {
      initialInfrastructure(MAP, bad);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(InfrastructureError);
      expect((e as InfrastructureError).problems).toEqual([
        'edge road:nowhere is not in the World',
        'edge road:nowhere: condition must be a whole permille 0..1000, got 1200',
        'depot ghost is not in the World',
        `obstruction on ${RAIL}, which is a rail edge, not water`,
        'obstruction on river:a2:w: installation ghost_fort is not in the World',
      ]);
    }
  });
});

describe('infrastructure: the only writer of the network', () => {
  const base = createState(worldOf(MAP, startWith({})), { seed: 1 });

  it('damages and repairs edges and depots within 0..1000, intact stored as absent', () => {
    const hit = applyInfrastructure(MAP, base, [
      { change: 'edge', edge: RAIL, deltaPermille: -700, cause: 'raids' },
      { change: 'depot', depot: D('a_src'), deltaPermille: -2000, cause: 'combat' },
    ]);
    expect(hit.state.infraEdgeCondition).toEqual({ [RAIL]: 300 });
    expect(hit.state.infraDepotCondition).toEqual({ a_src: 0 });
    expect(hit.changes.map((c) => `${c.change}:${c.target}:${c.before}>${c.after}:${c.cause}`)).toEqual([`edge:${RAIL}:1000>300:raids`, 'depot:a_src:1000>0:combat']);
    const mended = applyInfrastructure(MAP, hit.state, [{ change: 'edge', edge: RAIL, deltaPermille: 900, cause: 'repair' }]);
    expect(mended.state.infraEdgeCondition).toEqual({});
    expect(mended.state.infraDepotCondition).toBe(hit.state.infraDepotCondition);
  });

  it('obstructs and clears water edges; no change returns the same State', () => {
    const o = applyInfrastructure(MAP, base, [{ change: 'obstruct', edge: E('river:b2:w'), by: I('b_fort'), cause: 'operations' }]);
    expect(o.state.infraObstructions).toEqual([{ obsEdge: 'river:b2:w', obsBy: 'b_fort' }]);
    expect(applyInfrastructure(MAP, o.state, [{ change: 'obstruct', edge: E('river:b2:w'), by: null, cause: 'situations' }]).state).toBe(o.state);
    const c = applyInfrastructure(MAP, o.state, [{ change: 'clear', edge: E('river:b2:w'), cause: 'combat' }]);
    expect(c.state.infraObstructions).toEqual([]);
    expect(applyInfrastructure(MAP, base, [{ change: 'edge', edge: RAIL, deltaPermille: 50, cause: 'repair' }]).state).toBe(base);
  });

  it('refuses what cannot be (positive controls)', () => {
    expect(() => applyInfrastructure(MAP, base, [{ change: 'obstruct', edge: RAIL, by: null, cause: 'operations' }])).toThrow('not water');
    expect(() => applyInfrastructure(MAP, base, [{ change: 'edge', edge: E('road:nowhere'), deltaPermille: -1, cause: 'raids' }])).toThrow('not in the World');
    expect(() => applyInfrastructure(MAP, base, [{ change: 'depot', depot: D('a_src'), deltaPermille: 1.5, cause: 'repair' }])).toThrow('whole permille');
  });
});

describe('the tick reads the network from State (lane 0.4 seam closed)', () => {
  it('a cut proposed today closes a pocket the same day; a repair relieves it', () => {
    const cache = createDerivedMapCache();
    const start = createState(worldOf(MAP, startWith({})), { seed: 1 });
    // Control: nothing changes the map without the cut.
    const quiet = ctxFor(start, 1);
    const unchanged = mapPhase(quiet, start, cache);
    expect(unchanged.derived!.supply.factions.get(F('a'))!.pockets).toEqual([]);
    expect(quiet.mapEvents).toEqual([]);

    const cutCtx = ctxFor(start, 1);
    cutCtx.infrastructureDeltas.push({ change: 'edge', edge: RAIL, deltaPermille: -1000, cause: 'raids' });
    const cut = mapPhase(cutCtx, start, cache);
    expect(cut.state.infraEdgeCondition).toEqual({ [RAIL]: 0 });
    expect(cutCtx.mapEvents.map((e) => e.event)).toEqual(['network_changed', 'pocket_closed']);
    const pocket = cut.derived!.supply.factions.get(F('a'))!.pockets[0]!;
    expect(pocket.regions).toEqual([R('a2'), R('mid')]);
    expect(pocket.cut).toMatchObject({ why: 'edge_cut', edge: RAIL });
    expect(cutCtx.telemetry!.mechanics['infrastructure.changed']!.fires).toBe(1);

    const mendCtx = ctxFor(cut.state, 2);
    mendCtx.infrastructureDeltas.push({ change: 'edge', edge: RAIL, deltaPermille: 1000, cause: 'repair' });
    const mended = mapPhase(mendCtx, cut.state, cache);
    expect(mendCtx.mapEvents.map((e) => e.event)).toEqual(['network_changed', 'pocket_relieved']);
    expect(mended.derived!.supply.factions.get(F('a'))!.pockets).toEqual([]);
  });
});
