import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const people = ['buchanan_franklin', 'cooper_samuel', 'crittenden_george_b', 'ewell_richard_s', 'gorgas_josiah', 'holmes_theophilus_h', 'johnston_albert_s', 'johnston_joseph_e', 'lee_robert_e', 'longstreet_james', 'loring_william_w', 'magruder_john_b', 'pemberton_john_c', 'smith_edmund_k', 'stuart_james_e_b'];
const person = (id: string) => ids.toId('person', id);
const union = ids.toId('faction', 'union');
const other = ids.toId('faction', 'confederate');

describe('the resignation data on the R49 base', () => {
  it('starts the fifteen in US service and carries fourteen verified resignation dates', () => {
    const { world, setup } = seatsWorld('union-1861');
    const state = phase0.createState(world, setup);
    for (const id of people) {
      expect(phase0.sideOfPerson(world.map, state, person(id))).toBe(union);
      expect(phase0.blocOfPerson(world.map, state, person(id))).toBe('army');
      expect(Object.keys(state.personRanks[person(id)] ?? {}).length).toBeGreaterThan(0);
    }
    expect(people.filter(id => world.map.world.people.find(p => p.id === id)?.service?.historicalOn != null)).toHaveLength(14);
    // Navy Register 1863: the inherited 22 April entry is a dismissal, so it is not authored as a voluntary act.
    expect(world.map.world.people.find(p => p.id === 'buchanan_franklin')?.service).toBeUndefined();
  });

  it('brings J. E. Johnston to the other service by July in the at-war driver', () => {
    const { world, setup } = seatsWorld('union-1861');
    let state = phase0.createState(world, { ...setup, atWar: true });
    // Artificial prerequisite, explicitly not a history event: lane 1.11's Virginia notice is absent on this base.
    // After that lane merges, remove this injection and atWar, and drive the notice in the history run instead.
    state = phase0.changeDepartmentSide(world.map, state, ids.toId('department', 'st_virginia'), other).state;
    const seat = createRuleSeat();
    const run = phase0.playDays(world, state, () => seat, 118, { freeze: true });
    const johnston = person('johnston_joseph_e');
    expect(phase0.sideOfPerson(world.map, run.state, johnston)).toBe(other);
    expect(phase0.blocOfPerson(world.map, run.state, johnston)).toBe('confederate');
    expect(run.state.personService?.[johnston]?.serviceDay).toBe(48);
    for (const id of ['thomas_george_h', 'farragut_david_g', 'scott_winfield']) expect(phase0.sideOfPerson(world.map, run.state, person(id))).toBe(union);
  });
});
