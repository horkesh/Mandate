import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { packStrings, seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const people = ['buchanan_franklin', 'cooper_samuel', 'crittenden_george_b', 'ewell_richard_s', 'gorgas_josiah', 'holmes_theophilus_h', 'johnston_albert_s', 'johnston_joseph_e', 'lee_robert_e', 'longstreet_james', 'loring_william_w', 'magruder_john_b', 'pemberton_john_c', 'smith_edmund_k', 'stuart_james_e_b'];
const person = (id: string) => ids.toId('person', id);
const union = ids.toId('faction', 'union');
const other = ids.toId('faction', 'confederate');

describe('the resignation data and ordinary history', () => {
  it('loads the approved bare notice without motive, effects or a gate signature', () => {
    const { world } = seatsWorld('union-1861');
    const notice = world.situations.find(s => s.id === 'officer_resignation');
    expect(notice).toBeDefined();
    expect(notice?.gate).toEqual({ none: "an officer's reported change of service only; no motive, no secession-cause claim, slavery policy, security order or protected-population effect" });
    expect(notice?.gateReview).toBeNull();
    expect(notice?.effects).toEqual([]);
    expect(packStrings('union-1861')['situation.officer_resignation.text']).toBe('The officer reports that he has resigned from United States service.');
  });
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

  it.each([
    ['holmes_theophilus_h', 'st_north_carolina', 'p539'],
    ['loring_william_w', 'st_florida', 'p642'],
  ])('ties %s to his appointment-state government', (id, government, page) => {
    const { world } = seatsWorld('union-1861');
    const service = world.map.world.people.find(p => p.id === id)?.service;
    expect(service?.government).toBe(ids.toId('department', government));
    expect(service?.cites.some(c => c.source === 'Heitman' && c.at?.includes(page))).toBe(true);
  });

  it('waits for real Virginia secession before J. E. Johnston changes service in the ordinary history', () => {
    const { world, setup } = seatsWorld('union-1861');
    const state = phase0.createState(world, setup);
    const virginia = ids.toId('department', 'st_virginia');
    const johnston = person('johnston_joseph_e');
    expect(phase0.departmentSide(state, virginia)).toBeNull();
    const seat = createRuleSeat();
    const before = phase0.playDays(world, state, () => seat, 45, { freeze: true });
    expect(phase0.departmentSide(before.state, virginia)).toBeNull();
    expect(before.state.personService?.[johnston]).toBeUndefined();
    const joins = phase0.playDays(world, before.state, () => seat, 1, { freeze: true });
    expect(phase0.departmentSide(joins.state, virginia)).toBe(other);
    expect(joins.state.personService?.[johnston]).toBeUndefined();
    const eve = phase0.playDays(world, joins.state, () => seat, 1, { freeze: true });
    expect(eve.state.personService?.[johnston]).toBeUndefined();
    const changes = phase0.playDays(world, eve.state, () => seat, 1, { freeze: true });
    expect(changes.state.personService?.[johnston]).toMatchObject({ serviceFaction: other, serviceChoice: 'resign', serviceDay: 48 });
    const run = phase0.playDays(world, changes.state, () => seat, 100, { freeze: true });
    expect(run.state.stateDay).toBe(148);
    expect(phase0.sideOfPerson(world.map, run.state, johnston)).toBe(other);
    expect(phase0.blocOfPerson(world.map, run.state, johnston)).toBe('confederate');
    expect(run.state.personService?.[johnston]?.serviceDay).toBe(48);
    for (const id of ['thomas_george_h', 'farragut_david_g', 'scott_winfield']) expect(phase0.sideOfPerson(world.map, run.state, person(id))).toBe(union);
  });
});
