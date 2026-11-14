import { describe, expect, it } from 'vitest';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { allocateInPriorityOrder, deriveSupply, edgeLeg, INTACT_NETWORK, type NetworkConditions } from '../src/supply/supply.ts';
import { controlTable, D, depot, E, edge, F, fort, I, lineMap, mapIndex, R, region } from './support/map-fixture.ts';

const map = lineMap();
const control = controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 300, b: 550 }, b2: { b: 1000 }, b1: { b: 1000 } });
const JUNE = 6;

function supplyOf(table = control, month = JUNE, network: NetworkConditions = INTACT_NETWORK, m = map) {
  return deriveSupply(m, buildControlIndex(m, table), month, network);
}

describe('origins: sources, and depots their paths reach', () => {
  it('feeds a forward depot from a source and caps it at the feed', () => {
    const a = supplyOf().factions.get(F('a'))!;
    expect(a.origins).toEqual([
      { depot: 'a_fwd', kind: 'depot', region: 'a2', capacityMilli: 2000, terms: [{ kind: 'base', capacityMilli: 2000 }, { kind: 'feed', source: 'a_src', daysPermille: 1000, capacityMilli: 4000 }] },
      { depot: 'a_src', kind: 'source', region: 'a1', capacityMilli: 5000, terms: [{ kind: 'base', capacityMilli: 5000 }] },
    ]);
  });

  it('counts days from the nearest origin, and names the bottleneck', () => {
    const a = supplyOf().factions.get(F('a'))!;
    const mid = a.paths.get(R('mid'))!;
    expect(mid.origin).toBe('a_fwd');
    expect(mid.daysPermille).toBe(2000);
    expect(mid.capacityMilli).toBe(2000);
    expect(mid.bottleneck).toEqual({ kind: 'origin', id: 'a_fwd' });
    const b = supplyOf().factions.get(F('b'))!.paths.get(R('mid'))!;
    expect(b.daysPermille).toBe(3000);
    expect(b.capacityMilli).toBe(3000);
    expect(b.bottleneck).toEqual({ kind: 'edge', id: 'road:b2:mid' });
    expect(b.lines).toEqual(['b_line']);
    expect(b.legs.map((l) => `${l.from}>${l.to}`)).toEqual(['b1>b2', 'b2>mid']);
  });

  it('loses a depot whose feed is cut, and scales a damaged depot', () => {
    const cutFeed = supplyOf(control, JUNE, { ...INTACT_NETWORK, edgeCondition: { [E('rail:a1:a2:a_line')]: 0 } }).factions.get(F('a'))!;
    expect(cutFeed.origins.map((o) => o.depot)).toEqual(['a_src']);
    const damaged = supplyOf(control, JUNE, { ...INTACT_NETWORK, depotCondition: { [D('a_src')]: 400 } }).factions.get(F('a'))!;
    expect(damaged.origins.find((o) => o.depot === 'a_src')!.capacityMilli).toBe(2000);
  });

  it('draws on a source only in a region the faction traces', () => {
    const lost = supplyOf(controlTable({ a1: { b: 1000 }, a2: { a: 1000 } })).factions.get(F('a'))!;
    expect(lost.origins).toEqual([]);
    expect(lost.pockets).toEqual([{ id: 'pocket:a:a2', faction: 'a', regions: ['a2'], cut: { why: 'no_origin', region: null, edge: null, by: null } }]);
  });
});

describe('seasons and condition (0029)', () => {
  const muddy = edge('x', 'y', { days: 2, capacity: 3, seasons: [{ reason: 'mud', months: [1, 2], depthFeet: null }] });
  const m = mapIndex({ regions: [region('x'), region('y')], edges: [muddy] });

  it('applies the pack effect in the months of the window, in permille units so nothing rounds away', () => {
    expect(edgeLeg(m, muddy, R('x'), 1, INTACT_NETWORK)).toMatchObject({ daysPermille: 3000, capacityMilli: 1800, effects: [{ kind: 'season', reason: 'mud', lengthPermille: 1500, capacityPermille: 600 }] });
    expect(edgeLeg(m, muddy, R('x'), 6, INTACT_NETWORK)).toMatchObject({ daysPermille: 2000, capacityMilli: 3000, effects: [] });
    const thin = edge('x', 'y', { days: 1, capacity: 1, seasons: [{ reason: 'low_water', months: [9], depthFeet: 2 }] });
    expect(edgeLeg(m, thin, R('x'), 9, INTACT_NETWORK)).toMatchObject({ daysPermille: 1300, capacityMilli: 500 });
  });

  it('reads the return length against the current', () => {
    const river = edge('x', 'y', { type: 'river', days: 1, daysBA: 3 });
    expect(edgeLeg(m, river, R('x'), 6, INTACT_NETWORK).daysPermille).toBe(1000);
    expect(edgeLeg(m, river, R('y'), 6, INTACT_NETWORK).daysPermille).toBe(3000);
  });

  it('scales capacity by condition and cuts at zero', () => {
    expect(edgeLeg(m, muddy, R('x'), 6, { ...INTACT_NETWORK, edgeCondition: { [muddy.id]: 600 } })).toMatchObject({ capacityMilli: 1800, effects: [{ kind: 'condition', conditionPermille: 600 }] });
    const cut = supplyOf(control, JUNE, { ...INTACT_NETWORK, edgeCondition: { [E('road:a2:mid')]: 0 } }).factions.get(F('a'))!;
    expect(cut.paths.has(R('mid'))).toBe(false);
    expect(cut.pockets).toEqual([{ id: 'pocket:a:mid', faction: 'a', regions: ['mid'], cut: { why: 'edge_cut', region: null, edge: 'road:a2:mid', by: null } }]);
  });
});

describe('passage: traced land, open water, never off the map', () => {
  it('passes open water (rivers are no one’s), and names a region not traced as the cut', () => {
    // a holds a1 and mid; b holds a2: a's way to mid by road is through a2.
    const s = supplyOf(controlTable({ a1: { a: 1000 }, a2: { b: 1000 }, mid: { a: 1000 }, b2: { a: 1000 } })).factions.get(F('a'))!;
    // b2 is reached from... nowhere: a's only source is a1, and a2 bars both the road and the river.
    expect(s.pockets.map((p) => [p.id, p.regions, p.cut?.why, p.cut?.region])).toEqual([['pocket:a:b2', ['b2', 'mid'], 'not_traced', 'a2']]);
  });

  it('crosses open water when the land route is barred', () => {
    // a holds a1, a2 and b2; b holds mid. a reaches b2 by the river through w.
    const s = supplyOf(controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { b: 1000 }, b2: { a: 1000 } })).factions.get(F('a'))!;
    expect(s.paths.get(R('b2'))!.legs.map((l) => l.edge)).toEqual(['river:a2:w', 'river:b2:w']);
  });

  it('never passes an off-map box', () => {
    const m = mapIndex({ regions: [region('x'), region('box', 'off_map'), region('y')], edges: [edge('x', 'box'), edge('box', 'y')], depots: [depot('src', 'x')] });
    const s = deriveSupply(m, buildControlIndex(m, controlTable({ x: { a: 1000 }, y: { a: 1000 } })), JUNE).factions.get(F('a'))!;
    expect(s.pockets[0]!.regions).toEqual(['y']);
  });
});

describe('obstructions', () => {
  // p --sea-- s --sea-- q, with a fort in r (land, beside q) commanding the s-q edge.
  const sq = edge('q', 's', { type: 'sea' });
  const m = mapIndex({
    regions: [region('p'), region('q'), region('r'), region('s', 'sea')],
    edges: [edge('p', 's', { type: 'sea' }), sq, edge('q', 'r')],
    depots: [depot('src', 'p')],
    installations: [fort('f', 'r', [sq.id])],
  });
  const network = (by: string | null): NetworkConditions => ({ ...INTACT_NETWORK, obstructions: [{ edge: sq.id, by: by === null ? null : I(by) }] });
  const qSupplied = (r: Record<string, number>, by: string | null) =>
    deriveSupply(m, buildControlIndex(m, controlTable({ p: { a: 1000 }, q: { a: 1000 }, r })), JUNE, network(by)).factions.get(F('a'))!;

  it('closes the edge to everyone but the holder of the works', () => {
    const enemyFort = qSupplied({ b: 1000 }, 'f');
    expect(enemyFort.pockets).toEqual([{ id: 'pocket:a:q', faction: 'a', regions: ['q'], cut: { why: 'obstructed', region: null, edge: 'sea:q:s', by: 'f' } }]);
    expect(qSupplied({ a: 1000 }, 'f').paths.has(R('q'))).toBe(true);
  });

  it('lets unmanned works pass, and works not modelled close the edge to all', () => {
    expect(qSupplied({}, 'f').paths.has(R('q'))).toBe(true);
    expect(qSupplied({ a: 1000 }, null).pockets[0]!.cut).toEqual({ why: 'obstructed', region: null, edge: 'sea:q:s', by: null });
  });
});

describe('allocation in priority order (FOUNDATION section 4: not maximum flow)', () => {
  it('serves demands in order, each taking what is left on its origin and edges', () => {
    const supply = supplyOf();
    const out = allocateInPriorityOrder(supply, [
      { faction: F('b'), region: R('mid'), amountMilli: 2500, label: 'first' },
      { faction: F('b'), region: R('b2'), amountMilli: 2000, label: 'second' },
      { faction: F('b'), region: R('mid'), amountMilli: 1000, label: 'third' },
      { faction: F('b'), region: R('a2'), amountMilli: 1000, label: 'unsupplied' },
    ]);
    expect(out.map((a) => [a.demand.label, a.deliveredMilli, a.limitedBy])).toEqual([
      ['first', 2500, null],
      ['second', 1500, { kind: 'edge', id: 'rail:b1:b2:b_line' }],
      ['third', 0, { kind: 'edge', id: 'rail:b1:b2:b_line' }],
      ['unsupplied', 0, { kind: 'unsupplied' }],
    ]);
  });

  it('gives the first demand everything when it alone fits, whatever comes after', () => {
    const first = allocateInPriorityOrder(supplyOf(), [{ faction: F('b'), region: R('mid'), amountMilli: 3000, label: 'x' }]);
    expect(first[0]!.deliveredMilli).toBe(3000);
  });
});

describe('tie-breaks beyond days and capacity are local (review N1)', () => {
  it('keeps the label that won where the paths met, even when another origin would tie at the end', () => {
    // oa and ob each reach m in 1 day; ob's road is wider, so ob wins at m. The
    // narrow m-y road then makes both 2 days at capacity 1 at y, where oa (the
    // smaller id) would win a global tie-break. ob is kept: days and capacity
    // are exact, the rest is decided where the paths first meet.
    const m = mapIndex({
      regions: ['ya', 'yb', 'm', 'y'].map((r) => region(r)),
      edges: [edge('ya', 'm', { capacity: 2 }), edge('yb', 'm', { capacity: 3 }), edge('m', 'y', { capacity: 1 })],
      depots: [depot('oa', 'ya'), depot('ob', 'yb')],
    });
    const control2 = controlTable({ ya: { a: 1000 }, yb: { a: 1000 }, m: { a: 1000 }, y: { a: 1000 } });
    const y = deriveSupply(m, buildControlIndex(m, control2), JUNE).factions.get(F('a'))!.paths.get(R('y'))!;
    expect([y.origin, y.daysPermille, y.capacityMilli]).toEqual(['ob', 2000, 1000]);
  });
});

describe('determinism', () => {
  it('derives the same supply twice, and refuses a month outside 1-12', () => {
    expect(JSON.stringify([...supplyOf().factions.get(F('b'))!.paths])).toBe(JSON.stringify([...supplyOf().factions.get(F('b'))!.paths]));
    expect(() => supplyOf(control, 13)).toThrow('month must be 1-12');
  });
});
