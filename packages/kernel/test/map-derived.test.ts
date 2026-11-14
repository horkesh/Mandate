import { describe, expect, it } from 'vitest';
import type { RegionControlTable } from '../src/control/control.ts';
import { createDerivedMapCache, deriveMap, mapSignature, type DerivedMap } from '../src/control-index/derived.ts';
import { controlInvariants, derivedInvariants, snapshot } from '../src/invariants/map.ts';
import { INTACT_NETWORK } from '../src/supply/supply.ts';
import { controlTable, E, F, lineMap, R } from './support/map-fixture.ts';

const map = lineMap();
const control = controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 300, b: 550 }, b2: { b: 1000 }, b1: { b: 1000 } });

describe('the derived map is rebuilt only when what it reads changes (FOUNDATION 9 and 10)', () => {
  it('keeps the cached derivation through share changes inside a band', () => {
    const cache = createDerivedMapCache();
    const first = deriveMap(map, { control, month: 6 }, cache);
    const nudged = controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 310, b: 540 }, b2: { b: 990 }, b1: { b: 1000 } });
    expect(deriveMap(map, { control: nudged, month: 6 }, cache)).toBe(first);
    expect(cache.recomputes).toBe(1);
  });

  it('rebuilds when a threshold is crossed, a holder changes with no threshold crossed, the month changes, or the network does', () => {
    const cache = createDerivedMapCache();
    deriveMap(map, { control, month: 6 }, cache);
    deriveMap(map, { control: controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 200, b: 550 }, b2: { b: 1000 }, b1: { b: 1000 } }), month: 6 }, cache);
    expect(cache.recomputes).toBe(2);
    // 300/550 to 550/300: both still trace, but the holder flips, so the front moves.
    const flipped = deriveMap(map, { control: controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 550, b: 300 }, b2: { b: 1000 }, b1: { b: 1000 } }), month: 6 }, cache);
    expect(cache.recomputes).toBe(3);
    expect(flipped.index.contactEdges.map((c) => c.edge)).toEqual(['road:b2:mid']);
    deriveMap(map, { control: controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 550, b: 300 }, b2: { b: 1000 }, b1: { b: 1000 } }), month: 7 }, cache);
    expect(cache.recomputes).toBe(4);
    deriveMap(map, { control: controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 550, b: 300 }, b2: { b: 1000 }, b1: { b: 1000 } }), month: 7, network: { ...INTACT_NETWORK, edgeCondition: { [E('road:a2:mid')]: 500 } } }, cache);
    expect(cache.recomputes).toBe(5);
  });

  it('a cached derivation equals a fresh one (rebuilding derived data changes nothing, AWWV M1)', () => {
    const cache = createDerivedMapCache();
    deriveMap(map, { control, month: 6 }, cache);
    const nudged = controlTable({ a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 320, b: 520 }, b2: { b: 1000 }, b1: { b: 1000 } });
    const cached = deriveMap(map, { control: nudged, month: 6 }, cache);
    expect(snapshot(cached.index)).toBe(snapshot(deriveMap(map, { control: nudged, month: 6 }).index));
    expect(snapshot(cached.supply)).toBe(snapshot(deriveMap(map, { control: nudged, month: 6 }).supply));
  });

  it('signs only regions that carry control, and the same table the same way', () => {
    expect(mapSignature(map, { control, month: 6 })).toBe(mapSignature(map, { control: controlTable({ b1: { b: 1000 }, mid: { b: 550, a: 300 }, a1: { a: 1000 }, a2: { a: 1000 }, b2: { b: 1000 } }), month: 6 }));
    expect(mapSignature(map, { control, month: 6 })).not.toContain('w:');
  });
});

describe('invariants (FOUNDATION 10, phase 10), each with a broken case', () => {
  it('passes sound control and a sound derived map', () => {
    expect(controlInvariants(map, control)).toEqual([]);
    expect(derivedInvariants(map, control, 6, INTACT_NETWORK, deriveMap(map, { control, month: 6 }))).toEqual([]);
  });

  it('types every control failure (positive control)', () => {
    const broken = {
      a2: { a: 0 },
      zz: { a: 10 },
      w: { a: 10 },
      mid: { b: 700, a: 400 },
      b1: { q: 10, b: 1.5 },
    } as unknown as RegionControlTable;
    const kinds = controlInvariants(map, broken).map((f) => `${f.kind}:${f.region ?? ''}`);
    expect(kinds).toEqual(expect.arrayContaining([
      'control_unsorted:',
      'control_zero_share:a2',
      'control_unknown_region:zz',
      'control_not_carried:w',
      'control_unsorted:mid',
      'control_over_1000:mid',
      'control_unknown_faction:b1',
      'control_bad_share:b1',
    ]));
  });

  it('catches a stale cache, a front drawn for one side only, a broken path and a supplied pocket (positive controls)', () => {
    const good = deriveMap(map, { control, month: 6 });
    // A derivation for other control, presented as this control's.
    const stale = deriveMap(map, { control: controlTable({ a1: { a: 1000 } }), month: 6 });
    expect(derivedInvariants(map, control, 6, INTACT_NETWORK, stale).map((f) => f.kind)).toContain('derived_stale');

    const oneSided: DerivedMap = { ...good, index: { ...good.index, fronts: new Map([[F('a'), good.index.fronts.get(F('a'))!], [F('b'), []]]) } };
    expect(derivedInvariants(map, control, 6, INTACT_NETWORK, oneSided).map((f) => f.kind)).toContain('front_not_mirrored');

    const b = good.supply.factions.get(F('b'))!;
    const midPath = b.paths.get(R('mid'))!;
    const wrongSum = new Map(b.paths).set(R('mid'), { ...midPath, daysPermille: midPath.daysPermille + 1 });
    const brokenLegs = new Map(b.paths).set(R('mid'), { ...midPath, legs: midPath.legs.slice(1) });
    const supplied = { ...b, pockets: [{ id: 'pocket:b:mid', faction: F('b'), regions: [R('mid')], cut: null }] };
    const withB = (fs: typeof b): DerivedMap => ({ ...good, supply: { ...good.supply, factions: new Map(good.supply.factions).set(F('b'), fs) } });
    expect(derivedInvariants(map, control, 6, INTACT_NETWORK, withB({ ...b, paths: wrongSum })).map((f) => f.kind)).toContain('path_sum');
    expect(derivedInvariants(map, control, 6, INTACT_NETWORK, withB({ ...b, paths: brokenLegs })).map((f) => f.kind)).toContain('path_broken');
    expect(derivedInvariants(map, control, 6, INTACT_NETWORK, withB(supplied)).map((f) => f.kind)).toContain('pocket_supplied');
  });
});
