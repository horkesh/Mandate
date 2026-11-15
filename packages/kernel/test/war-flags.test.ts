import { describe, expect, it } from 'vitest';
import { atWarWorld } from './support/war-flag-world.ts';
import { createState, WarFlagError, warFlagProblems } from '../src/tick/setup.ts';
import { warSince } from '../src/seats/requests.ts';
import { F, indexedFixture } from './support/seats-fixture.ts';

/** The rule-seat war flags (0064) are checked at setup, as control and governments are (0061). Each refusal has a control. */
const rows = (world: ReturnType<typeof indexedFixture>) => world.map.world.rules.ruleSeats.warFlags;

describe('war flags at setup', () => {
  it('accepts a row for every faction', () => {
    const world = indexedFixture();
    expect(warFlagProblems(world.map)).toEqual([]);
    expect(() => createState(world, { seed: 1 })).not.toThrow();
  });

  it('refuses a row for a faction the World lacks, a faction listed twice, and a faction with no row, naming each', () => {
    const base = indexedFixture();
    const [a] = rows(base);
    const unknown = atWarWorld(base, [...rows(base), { faction: F('zz'), flag: null }]);
    expect(warFlagProblems(unknown.map)).toEqual(['war flag row for zz, which is not a faction in the World']);
    const twice = atWarWorld(base, [...rows(base), a!]);
    expect(warFlagProblems(twice.map)).toEqual([`faction ${a!.faction} has more than one war flag row`]);
    const missing = atWarWorld(base, rows(base).slice(1));
    expect(warFlagProblems(missing.map)).toEqual([`faction ${a!.faction} has no war flag row`]);
    for (const bad of [unknown, twice, missing]) expect(() => createState(bad, { seed: 1 })).toThrow(WarFlagError);
  });

  it('reports every problem together', () => {
    const base = indexedFixture();
    const both = atWarWorld(base, [{ faction: F('zz'), flag: null }]);
    expect(warFlagProblems(both.map)).toHaveLength(3);
  });

  it('a named flag is peace until a situation sets it, and war from the day it was set; null is war from day 1', () => {
    const base = indexedFixture();
    const named = atWarWorld(base, rows(base).map((r) => ({ ...r, flag: 'war_begun' })));
    const state = createState(named, { seed: 1 });
    expect(warSince(named, state, F('a'))).toBeNull();
    expect(warSince(named, { ...state, situationFlags: { war_begun: 12 } }, F('a'))).toBe(12);
    expect(warSince(base, createState(base, { seed: 1 }), F('a'))).toBe(0);
    // The labelled option sets the pack's flags on day 0, and nothing for a null row.
    expect(warSince(named, createState(named, { seed: 1, atWar: true }), F('b'))).toBe(0);
    expect(createState(base, { seed: 1, atWar: true }).situationFlags).toEqual({});
  });
});
