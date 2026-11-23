import { expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { createState } from '../../../packages/kernel/src/tick/setup.ts';
import { applyCommandProposals, sideOfPerson } from '../../../packages/kernel/src/command/command.ts';
import { toId } from '../../../packages/kernel/src/ids.ts';
import { tick } from '../../../packages/kernel/src/tick/tick.ts';

const { world, setup } = seatsWorld('union-1861');
const id = toId('person', 'anderson_richard_h');
it('S82 preserves S80 unknown opening service and judgments, distinct from Robert Anderson', () => {
  const person = world.map.world.people.find(p => p.id === id)!;
  expect(person).toBeDefined();
  expect(person.faction).toBeNull(); expect(person.kind).toBe('unknown_kind'); expect(person.unknowns).toContain('kind');
  expect(person.born).toBe('1821-10-07'); expect(person.died).toBe('1879-06-26');
  expect(person.service).toBeUndefined(); expect(person.ranks).toEqual([]);
  expect(Object.values(person.centres).every(c => c.direction === null)).toBe(true);
  expect(Object.values(person.temperament).every(c => c.direction === null)).toBe(true);
  expect(person.regard.direction).toBeNull(); expect(person.values).toEqual([]); expect(person.traits).toEqual([]);
  expect(world.map.world.people.find(p => p.id === 'anderson_robert')).toBeDefined();
});
it('S82 declares only the dated local Charleston succession and changes no strength or service record', () => {
  const notice = world.situations.find(s => s.id === 'charleston_anderson_command')!;
  expect(notice).toBeDefined(); expect(notice.earliest).toBe('1861-05-27');
  const state = createState(world, setup);
  const proposal = notice.effects.find(e => 'propose' in e)!;
  if (!('propose' in proposal)) throw Error('succession proposal missing');
  const changed = applyCommandProposals(world.map, state, [{ ...proposal.propose, origin: 'notice' }], 83);
  expect(changed.refused).toEqual([]);
  expect(changed.state.postStates[toId('post','cs_cmd_charleston')]!.postHolder).toBe(id);
  expect(changed.state.forceBlockStates).toBe(state.forceBlockStates);
  expect(changed.state.forceAssignments).toBe(state.forceAssignments);
  expect(changed.state.personService).toBe(state.personService);
  expect(changed.state.personRanks).toBe(state.personRanks);
  expect(sideOfPerson(world.map, changed.state, id)).toBe('confederate');
  const before = tick(world, { ...state, stateDay: 81 }, [], { freeze: true }).state;
  expect(before.postStates[toId('post','cs_cmd_charleston')]!.postHolder).toBe('beauregard_pierre_g_t');
  const onDate = tick(world, before, [], { freeze: true }).state;
  expect(onDate.postStates[toId('post','cs_cmd_charleston')]!.postHolder).toBe(id);
});
