import { phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld, v2Map } from '../src/seats-world.ts';

/**
 * Each part of a start is copied into State once at setup (0050), and the exit review found two that were dropped
 * (S4, 0072): fortification, owned by `regions`, and ranks, owned by `people`. On the real packs, from disk.
 */
describe('the start\'s fortification and ranks arrive in State (0050, 0072)', () => {
  it('the testbed\'s four fortification rows arrive, each at its level', () => {
    const map = v2Map('testbed')!;
    expect(map.start.fortification.map((f) => `${f.region}:${f.levelPermille}`).sort()).toEqual(['island_fort:800', 'mere_crossing:600', 'n_capital:400', 'salient_base:300']);
    const { world, setup } = seatsWorld('testbed');
    const state = phase0.createState(world, setup);
    expect(state.regionFortification).toEqual({ island_fort: 800, mere_crossing: 600, n_capital: 400, salient_base: 300 });
    expect(Object.keys(state.regionFortification)).toEqual(['island_fort', 'mere_crossing', 'n_capital', 'salient_base']);
  });

  it('every person with a rank by the start date carries it, with its date; nobody else does', () => {
    for (const pack of ['testbed', 'union-1861']) {
      const { world, setup } = seatsWorld(pack);
      const state = phase0.createState(world, setup);
      const expected = world.map.world.people.flatMap((p) => {
        const held = phase0.rankOn(p.ranks, world.start.startDate);
        return held === null ? [] : [[p.id, held] as const];
      });
      expect(Object.entries(state.personRanks), pack).toEqual([...expected].sort(([a], [b]) => (a < b ? -1 : 1)));
      expect(Object.keys(state.personRanks).length, pack).toBeGreaterThan(0);
    }
  });
});
