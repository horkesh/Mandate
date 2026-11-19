import { describe, expect, it } from 'vitest';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { createDerivedMapCache, deriveMap, mapSignature } from '../src/control-index/derived.ts';
import { controlInvariants, derivedInvariants } from '../src/invariants/map.ts';
import { toId } from '../src/ids.ts';
import { controlClaims } from '../src/knowledge/control-claims.ts';
import type { KnownReport } from '../src/knowledge/records.ts';
import { deriveSupply, INTACT_NETWORK } from '../src/supply/supply.ts';
import { claimedControlView } from '../src/view/claimed-control.ts';
import { F, R } from './support/map-fixture.ts';
import { TIMING } from './support/timing.ts';
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
 * medians, measured while Vitest runs the other test files in parallel. The
 * stopwatch test runs only with MANDATE_TIMING=1 (lane 1.0t: CI's Linux job
 * sets it; the pre-commit hook does not), so a loaded machine never fails a
 * commit on no change to the code.
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
  const opening: KnownReport = {
    id: toId('message', 'opening'), knownReceivedDay: 0, knownRoute: 'in-person', knownVia: [],
    knownBody: {
      reportType: 'informal', reportSubtype: 'cabinet-word', reportAuthor: toId('person', 'cartographer'), reportAuthorPost: null,
      reportSubjectKind: 'region', reportSubjectId: 'map', reportDay: 0, reportHour: null, reportAdvice: null, reportAnswers: null,
      reportClaims: [...map.regions.keys()].flatMap((r) => controlClaims(r, control[r]!, [F('a'), F('b')])),
    },
  };

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

  it('a year with control still rebuilds once per month turn, once for a shift and once back', () => {
    const yearCache = createDerivedMapCache();
    for (let day = 0; day < 365; day++) {
      deriveMap(map, { control: day === 200 ? unionSizeControl(1) : control, month: 1 + Math.floor(day / 31) % 12 }, yearCache);
    }
    expect(yearCache.recomputes).toBeLessThanOrEqual(15);
  });

  it('projects the same front segments as the control index on a full-size map', () => {
    const view = claimedControlView(map, [opening]);
    const index = buildControlIndex(map, control);
    const segments = [...index.fronts.values()].flatMap((lines) => lines.flatMap((l) => l.segments));
    expect(Object.keys(view.controlBeliefs)).toHaveLength(map.regions.size);
    expect(view.claimedFronts).toHaveLength(segments.length);
    expect(view.claimedFronts).toEqual(expect.arrayContaining(segments.map((segment) => ({ ...segment, mark: 'pencil', asOfDay: 0 }))));
  });

  it.runIf(TIMING)('rebuilds, idles and runs a year within budget (wall clock: MANDATE_TIMING=1)', () => {
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
    const claimed = time(() => claimedControlView(map, [opening]), 50);
    console.log(
      `map budget on this machine: rebuild ${rebuild.toFixed(2)} ms (index ${index.toFixed(2)} ms), quiet day ${quiet.toFixed(3)} ms (signature ${signature.toFixed(3)} ms), ` +
        `year ${year.toFixed(0)} ms with ${yearCache.recomputes} rebuilds, deep invariants ${deep.toFixed(2)} ms (tests only), seat control projection ${claimed.toFixed(2)} ms`,
    );
    expect(rebuild).toBeLessThan(BUDGET.rebuildMs);
    expect(quiet).toBeLessThan(BUDGET.quietDayMs);
    expect(year).toBeLessThan(BUDGET.yearMs);
    expect(claimed).toBeLessThan(BUDGET.rebuildMs);
  });
});
