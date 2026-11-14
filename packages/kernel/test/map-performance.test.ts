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
 * that budget, stated here and checked on a graph at least the size of the
 * Union draft:
 *
 * - a full rebuild of the derived map (control index and supply for both
 *   sides), which happens only when a holder, a threshold band, the month or
 *   the network changes: under 25 ms, so a rebuild day still fits the 40 ms
 *   tick with room for the rest of it;
 * - a day with nothing to rebuild (signature, cache hit, control invariants):
 *   under 2 ms;
 * - a year of days with control still and the month turning: under 1.5 s in all.
 *
 * The bounds come from the design budget, not from any one machine. They are
 * medians, measured while Vitest runs the other test files in parallel.
 * Measured at review (lane 0.4, 2026-11-14, on the 250-region graph before it
 * grew to 270): rebuild 2.6 ms on the reference machine, 5.3 ms on CI Linux,
 * 8.2 ms on CI Windows (3x under the bound); quiet day 0.29, 0.39 and 0.74 ms;
 * year 110, 191 and 328 ms. A tenfold regression still fails.
 */
const BUDGET = { rebuildMs: 25, quietDayMs: 2, yearMs: 1500 };

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

describe('the map inside its tick budget (at least the Union draft: 263 regions, 931 edges)', () => {
  const map = unionSizeMap();
  const control = unionSizeControl();

  it('is at least the size of the Union draft, with fronts, contested regions and a pocket', () => {
    expect(map.regions.size).toBeGreaterThanOrEqual(263);
    expect(map.edges.size).toBeGreaterThanOrEqual(931);
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
