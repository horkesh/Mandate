import { describe, expect, it } from 'vitest';
import { buildControlIndex, rankShares, traces, wireOwnerOf } from '../src/control-index/control-index.ts';
import { controlTable, edge, F, lineMap, mapIndex, R, region } from './support/map-fixture.ts';

const map = lineMap();
// a1 - a2 - mid - b2 - b1, with mid contested (a 300, b 550: b holds, both trace).
const control = controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 300, b: 550 }, b2: { b: 1000 }, b1: { b: 1000 } });

describe('holdings (0019: 250 permille to trace)', () => {
  const index = buildControlIndex(map, control);

  it('names each region holder with its reason, and every faction that traces it', () => {
    expect(index.holdings.get(R('mid'))).toEqual({ region: 'mid', holder: 'b', reason: 'held', tracedBy: ['a', 'b'] });
    expect(index.holdings.get(R('a1'))!.holder).toBe('a');
    expect(index.holdings.get(R('w'))).toEqual({ region: 'w', holder: null, reason: 'open_water', tracedBy: [] });
    expect(index.contested).toEqual(['mid']);
    expect(index.traced.get(F('a'))).toEqual(['a1', 'a2', 'mid']);
    expect(traces(index, F('a'), R('mid'))).toBe(true);
    expect(traces(index, F('a'), R('b2'))).toBe(false);
    expect(rankShares(control, R('mid'))).toEqual([{ faction: 'b', permille: 550 }, { faction: 'a', permille: 300 }]);
  });

  it('holds nobody below the threshold, on a tie, or with no control', () => {
    const t = buildControlIndex(map, controlTable({ a1: { a: 249 }, a2: { a: 400, b: 400 } }));
    expect(t.holdings.get(R('a1'))).toEqual({ region: 'a1', holder: null, reason: 'below_threshold', tracedBy: [] });
    expect(t.holdings.get(R('a2'))).toEqual({ region: 'a2', holder: null, reason: 'tied', tracedBy: ['a', 'b'] });
    expect(t.holdings.get(R('mid'))!.reason).toBe('no_control');
    // The threshold is the pack's: at 249 the same share would trace.
    const lower = buildControlIndex(mapIndex({ regions: [region('x')], edges: [], supplyControlPermille: 249 }), controlTable({ x: { a: 249 } }));
    expect(lower.holdings.get(R('x'))!.holder).toBe('a');
  });

  it('gives each region its holder as wire owner (0052), and none at sea', () => {
    expect(wireOwnerOf(index, R('mid'))).toEqual({ region: 'mid', owner: 'b', reason: 'held' });
    expect(wireOwnerOf(index, R('w'))).toEqual({ region: 'w', owner: null, reason: 'open_water' });
    expect(() => wireOwnerOf(index, R('nowhere'))).toThrow('unknown region id');
  });
});

describe('contact edges and fronts (0013: teeth facing the enemy)', () => {
  const index = buildControlIndex(map, control);

  it('finds contact edges between different holders, never across open water', () => {
    expect(index.contactEdges).toEqual([{ edge: 'road:a2:mid', a: 'a2', b: 'mid', holderA: 'a', holderB: 'b' }]);
  });

  it('draws one segment per side, each facing the other', () => {
    expect(index.fronts.get(F('a'))).toEqual([
      { id: 'front:a:a2', faction: 'a', regions: ['a2'], segments: [{ faction: 'a', edge: 'road:a2:mid', own: 'a2', faces: 'mid', enemy: 'b' }], enemies: ['b'] },
    ]);
    expect(index.fronts.get(F('b'))![0]!.segments).toEqual([{ faction: 'b', edge: 'road:a2:mid', own: 'mid', faces: 'a2', enemy: 'a' }]);
  });

  it('joins segments whose own ends touch, or whose faced ends are one enemy region', () => {
    // A ladder: two parallel chains with rungs; a holds the top chain, b the bottom.
    //   t1 - t2 - t3      (a)
    //   |    |    |
    //   u1 - u2 - u3      (b)
    const ladder = mapIndex({
      regions: ['t1', 't2', 't3', 'u1', 'u2', 'u3'].map((r) => region(r)),
      edges: [edge('t1', 't2'), edge('t2', 't3'), edge('u1', 'u2'), edge('u2', 'u3'), edge('t1', 'u1'), edge('t2', 'u2'), edge('t3', 'u3')],
    });
    const joined = buildControlIndex(ladder, controlTable({ t1: { a: 1000 }, t2: { a: 1000 }, t3: { a: 1000 }, u1: { b: 1000 }, u2: { b: 1000 }, u3: { b: 1000 } }));
    expect(joined.fronts.get(F('a'))!.map((l) => l.regions)).toEqual([['t1', 't2', 't3']]);
    // b takes t2, a salient into a's line: t1 and t3 do not touch, but both face t2, so it stays one line.
    const salient = buildControlIndex(ladder, controlTable({ t1: { a: 1000 }, t2: { b: 1000 }, t3: { a: 1000 }, u1: { b: 1000 }, u2: { b: 1000 }, u3: { b: 1000 } }));
    expect(salient.fronts.get(F('a'))!.map((l) => [l.id, l.regions])).toEqual([['front:a:t1', ['t1', 't3']]]);
  });

  it('keeps two contacts apart when neither side links them', () => {
    //  p1 - pm - p2   (a; pm is behind the lines)
    //  |         |
    //  q1 - qm - q2   (b; qm is behind the lines)
    // p1 and p2 do not touch, nor q1 and q2: two separate lines.
    const two = mapIndex({
      regions: ['p1', 'pm', 'p2', 'q1', 'qm', 'q2'].map((r) => region(r)),
      edges: [edge('p1', 'pm'), edge('pm', 'p2'), edge('q1', 'qm'), edge('qm', 'q2'), edge('p1', 'q1'), edge('p2', 'q2')],
    });
    const index = buildControlIndex(two, controlTable({ p1: { a: 1000 }, pm: { a: 1000 }, p2: { a: 1000 }, q1: { b: 1000 }, qm: { b: 1000 }, q2: { b: 1000 } }));
    expect(index.fronts.get(F('a'))!.map((l) => l.id)).toEqual(['front:a:p1', 'front:a:p2']);
    expect(index.fronts.get(F('b'))!.map((l) => l.id)).toEqual(['front:b:q1', 'front:b:q2']);
  });
});

describe('components', () => {
  it('groups the regions a faction traces, contested ones included', () => {
    const index = buildControlIndex(map, control);
    expect(index.components.get(F('a'))).toEqual([{ id: 'component:a:a1', faction: 'a', regions: ['a1', 'a2', 'mid'] }]);
    expect(index.components.get(F('b'))).toEqual([{ id: 'component:b:b1', faction: 'b', regions: ['b1', 'b2', 'mid'] }]);
    const cut = buildControlIndex(map, controlTable({ a1: { a: 1000 }, a2: { b: 1000 }, mid: { a: 1000 } }));
    expect(cut.components.get(F('a'))!.map((c) => c.regions)).toEqual([['a1'], ['mid']]);
  });

  it('is the same for the same table whatever its insertion order', () => {
    const shuffled = controlTable({ b1: { b: 1000 }, mid: { b: 550, a: 300 }, a1: { a: 1000 }, b2: { b: 1000 }, a2: { a: 1000 } });
    expect(JSON.stringify([...buildControlIndex(map, shuffled).holdings])).toBe(JSON.stringify([...buildControlIndex(map, control).holdings]));
  });
});
