import { describe, expect, it } from 'vitest';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { createDerivedMapCache, deriveMap, mapSignature } from '../src/control-index/derived.ts';
import { controlInvariants, derivedInvariants } from '../src/invariants/map.ts';
import { deriveSupply, INTACT_NETWORK } from '../src/supply/supply.ts';
import { F, R } from './support/map-fixture.ts';
import { unionSizeControl, unionSizeMap } from './support/union-size-map.ts';

/**
 * The tick budget (FOUNDATION section 9): a headless 1,460-day campaign under
 * a minute, so a whole day tick costs under about 40 ms. The map's share of
 * that budget, stated here and checked on a graph the size of the Union map:
 *
 * - a full rebuild of the derived map (control index and supply for both
 *   sides), which happens only when a holder, a threshold band, the month or
 *   the network changes: under 15 ms;
 * - a day with nothing to rebuild (signature, cache hit, control invariants):
 *   under 2 ms;
 * - a year of days with control still and the month turning: under 1.5 s in all.
 *
 * Bounds are medians and are set several times above the reference machine's
 * figures (printed below), so a slow CI runner does not flake; a regression of
 * an order of magnitude still fails.
 */
// Measured on the reference machine (lane 0.4, 2026-11-14): rebuild 2.6 ms, quiet day 0.29 ms, year 110 ms.
const BUDGET = { rebuildMs: 15, quietDayMs: 2, yearMs: 1500 };

function median(samples: number[]): number {
  const s = [...samples].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
}

function time(f: () => unknown, runs: number): number {
  f();
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t = performance.now();
    f();
    samples.push(performance.now() - t);
  }
  return median(samples);
}

describe('the map inside its tick budget (Union-map size: 250 regions, about 900 edges)', () => {
  const map = unionSizeMap();
  const control = unionSizeControl();

  it('is the size of the Union map, with fronts, contested regions and a pocket', () => {
    expect(map.regions.size).toBe(250);
    expect(map.edges.size).toBeGreaterThanOrEqual(880);
    const derived = deriveMap(map, { control, month: 1 });
    expect(derived.index.contested.length).toBe(10);
    expect(derived.index.fronts.get(F('a'))!.length).toBeGreaterThan(0);
    expect(derived.supply.factions.get(F('b'))!.pockets.map((p) => p.regions.length)).toEqual([8]);
    expect(derived.supply.factions.get(F('a'))!.pockets.map((p) => p.regions)).toEqual([[R('g04_4')]]);
    expect(controlInvariants(map, control)).toEqual([]);
    expect(derivedInvariants(map, control, 1, INTACT_NETWORK, derived)).toEqual([]);
  });

  it('rebuilds, idles and runs a year within budget', () => {
    const rebuild = time(() => deriveSupply(map, buildControlIndex(map, control), 1, INTACT_NETWORK), 15);
    const index = time(() => buildControlIndex(map, control), 15);
    const cache = createDerivedMapCache();
    deriveMap(map, { control, month: 1 }, cache);
    const quiet = time(() => {
      deriveMap(map, { control, month: 1 }, cache);
      controlInvariants(map, control);
    }, 50);
    const signature = time(() => mapSignature(map, { control, month: 1 }), 50);
    const yearCache = createDerivedMapCache();
    const t = performance.now();
    for (let day = 0; day < 365; day++) {
      deriveMap(map, { control: day === 200 ? unionSizeControl(1) : control, month: 1 + Math.floor(day / 31) % 12 }, yearCache);
      controlInvariants(map, control);
    }
    const year = performance.now() - t;
    const deep = time(() => derivedInvariants(map, control, 1, INTACT_NETWORK, cache.entry!), 5);
    console.log(
      `map budget on this machine: rebuild ${rebuild.toFixed(2)} ms (index ${index.toFixed(2)} ms), quiet day ${quiet.toFixed(3)} ms (signature ${signature.toFixed(3)} ms), ` +
        `year ${year.toFixed(0)} ms with ${yearCache.recomputes} rebuilds, deep invariants ${deep.toFixed(2)} ms (tests only)`,
    );
    expect(rebuild).toBeLessThan(BUDGET.rebuildMs);
    expect(quiet).toBeLessThan(BUDGET.quietDayMs);
    expect(year).toBeLessThan(BUDGET.yearMs);
    // A year with control still except one shift rebuilds once per month turn, once for the shift and once back.
    expect(yearCache.recomputes).toBeLessThanOrEqual(15);
  });
});
