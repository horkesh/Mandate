import { forceTotals } from '../../../packages/kernel/src/forces/lots.ts';
import { ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
const loaded = seatsWorld('union-1861');
const start = phase0.createState(loaded.world, loaded.setup);
const texas = Object.keys(start.forceBlockStates).filter(id => id.startsWith('fb_us_texas_')).map(id => ids.toId('forceBlock', id));
describe('S92 Texas starting return and sourced theatre exit', () => {
  it('counts the February return once, without a second aggregate combatant', () => {
    expect(start.forceBlockStates[ids.toId('forceBlock', 'fb_us_texas_troops')]).toBeUndefined();
    expect(texas.reduce((n,id) => n + (forceTotals(start.forceBlockStates[id]!).fbStrength ?? 0), 0)).toBe(2445);
  });
  it('requires the February terms and the original contingent still in Texas for every completion', () => {
    const notices = loaded.world.situations.filter(s => s.id.startsWith('texas_exit_'));
    expect(notices).toHaveLength(5);
    for (const s of notices) {
      expect(s.earliest).toBe('1861-05-09');
      expect(s.event).toEqual({ all: [{ dayAtLeast: 65 }, { fired: 'texas_evacuation_terms' }, { withdrawableForce: expect.any(Object) }] });
      const ctx = { state: start, day: 100, situation: s.id, knowledge: { knownReports: [] }, since: null };
      expect(phase0.holds(s.event, ctx)).toBe(false);
      const terms = phase0.fireSituation(start, ids.toId('situation', 'texas_evacuation_terms'), 1, 'notice', []);
      expect(phase0.holds(s.event, { ...ctx, state: terms, day: 1 })).toBe(false);
      expect(phase0.holds(s.event, { ...ctx, state: terms, day: 64 })).toBe(false);
      expect(phase0.holds(s.event, { ...ctx, state: terms, day: 65 })).toBe(true);
    }
  });
});
