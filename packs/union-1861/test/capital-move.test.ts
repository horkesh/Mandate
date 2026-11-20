import { describe, expect, it } from 'vitest';
import { ids, phase0, encodeSave, decodeSave } from '@mandate/kernel';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { whereIsPerson } from '../../../packages/kernel/src/seats/posts.ts';

describe('the sourced Confederate capital move', () => {
  it('stays at Montgomery on and after 29 May while Virginia has not seceded', () => {
    const { world, setup } = seatsWorld('union-1861');
    const faction = ids.toId('faction', 'confederate');
    const principal = ids.toId('person', 'davis_jefferson');
    let state = { ...phase0.createState(world, setup), stateDay: 84 };
    expect(state.situationFlags.virginia_seceded).toBeUndefined();
    for (let day = 85; day <= 86; day++) {
      const result = phase0.tick(world, state, [], { freeze: true });
      expect(result.day).toBe(day);
      expect(result.state.factionCapitals[faction]).toBe(ids.toId('region', 'montgomery'));
      expect(whereIsPerson(world, result.state, principal)).toBe(ids.toId('region', 'montgomery'));
      expect(result.mapEvents.some((e) => e.event === 'capital_moved')).toBe(false);
      state = result.state;
    }
  });

  it('with Virginia seceded, stays at Montgomery on 28 May, moves on 29 May, and fires once after save and resume', () => {
    const { world, setup, worldHash } = seatsWorld('union-1861');
    const faction = ids.toId('faction', 'confederate');
    const principal = ids.toId('person', 'davis_jefferson');
    const capital = ids.toId('region', 'richmond');
    // Supply only the prerequisite the unmerged history lane will set; exercise all three boundary days.
    const start = phase0.createState(world, setup);
    const before = phase0.tick(world, { ...start, stateDay: 83, situationFlags: { ...start.situationFlags, virginia_seceded: 44 } }, [], { freeze: true }).state;
    expect(whereIsPerson(world, before, principal)).toBe(ids.toId('region', 'montgomery'));
    const on = phase0.tick(world, before, [], { freeze: true });
    expect(on.state.factionCapitals[faction]).toBe(capital);
    expect(on.mapEvents.filter((e) => e.event === 'capital_moved')).toEqual([{ event: 'capital_moved', faction, region: capital }]);
    expect(whereIsPerson(world, on.state, principal)).toBe(capital);
    const resumed = decodeSave(encodeSave({ worldHash, state: on.state }), { expectedWorldHash: worldHash }).state as unknown as phase0.State;
    const after = phase0.tick(world, resumed, [], { freeze: true });
    expect(after.state.factionCapitals[faction]).toBe(capital);
    expect(after.mapEvents.some((e) => e.event === 'capital_moved')).toBe(false);
  });
});
