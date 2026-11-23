import { indexWorld } from '../src/world/index.ts';
import { describe, expect, it } from 'vitest';
import { sideOfPerson, applyCommandProposals, type CommandProposal } from '../src/command/command.ts';
import { createState } from '../src/tick/setup.ts';
import { forcesIndex, forcesStart, P, PER, post } from './support/forces-fixture.ts';
import { region, R } from './support/map-fixture.ts';
import { worldOf } from './support/tick-context.ts';

const map = forcesIndex({ regions: [region('a1')], edges: [], depots: [] });
const start = forcesStart({}, [post('office', { department: 'a_war', holder: PER('a_gen'), region: R('a1') })], []);
const initial = createState(worldOf(map, start), { seed: 1 });
const proposal = {
  owner: 'command', field: 'post_succession', subject: 'office', delta: 1, side: null,
  reason: 'convention-succession', origin: 'notice', succession: { from: PER('a_gen'), to: PER('a_gen2') },
} as const;
const apply = (p: unknown, state = initial) => applyCommandProposals(map, state, [p as CommandProposal], 11);

describe('institutional succession to an occupied post', () => {
  it('replaces the named incumbent, preserves both statuses, and explains the change', () => {
    const result = apply(proposal);
    expect(result.refused).toEqual([]);
    expect(result.state.postStates[P('office')]!.postHolder).toBe(PER('a_gen2'));
    expect(result.state.personStatus).toBe(initial.personStatus);
    expect(result.applied).toContainEqual({ field: 'post_succession', subject: 'office', change: 'succeeded', from: 'a_gen', to: 'a_gen2', reason: 'institutional-succession', cause: 'convention-succession' });
    expect(apply(proposal, result.state).state).toBe(result.state);
  });

  it.each([
    [{ origin: 'decision' }, 'notice_required'],
    [{ subject: 'missing' }, 'invalid'],
    [{ succession: { from: PER('a_corps'), to: PER('a_gen2') } }, 'incumbent_changed'],
    [{ succession: { from: PER('a_gen'), to: PER('b_gen') } }, 'invalid'],
    [{ delta: -1 }, 'invalid'],
    [{ succession: undefined }, 'invalid'],
  ])('refuses an invalid or stale succession atomically: %j', (patch, reason) => {
    const result = apply({ ...proposal, ...patch });
    expect(result.state).toBe(initial);
    expect(result.applied).toEqual([]);
    expect(result.refused[0]?.reason).toBe(reason);
  });

  it('allows a neutral civilian to enter a state command by its institutional notice', () => {
    const parts = { ...map.world, departments: map.world.departments.map(d => d.id === 'a_war' ? { ...d, faction: null, kind: 'state_test' } : d),
      vocabularies: { ...map.world.vocabularies, departmentKinds: [...map.world.vocabularies.departmentKinds, { id: 'state_test', name: 'state_test.name', government: true, selfGoverning: false }] },
      people: map.world.people.map(p => p.id === 'a_gen2' ? { ...p, faction: null } : p) };
    const index = indexWorld(parts);
    const result = applyCommandProposals(index, initial, [proposal], 11);
    expect(result.refused).toEqual([]);
    expect(result.state.postStates[P('office')]!.postHolder).toBe('a_gen2');
    expect(result.state.personService).toBe(initial.personService);
    expect(sideOfPerson(index, result.state, PER('a_gen2'))).toBe(initial.departmentFactions[initial.postStates[P('office')]!.postDepartment]);
  });
  it('does not appoint someone unable to serve', () => {
    const state = { ...initial, personStatus: { ...initial.personStatus, [PER('a_gen2')]: { statusKind: 'captured' as const, statusDay: 2 } } };
    const result = apply(proposal, state);
    expect(result.state).toBe(state);
    expect(result.refused[0]?.reason).toBe('invalid');
  });
  it('S82 a sourced institutional command establishes an unknown unposted successor through the post alone', () => {
    const parts = { ...map.world, people: map.world.people.map(p => p.id === 'a_gen2' ? { ...p, faction: null, unknowns: ['faction'] } : p) };
    const index = indexWorld(parts);
    const result = applyCommandProposals(index, initial, [proposal], 11);
    expect(result.refused).toEqual([]);
    expect(result.state.postStates[P('office')]!.postHolder).toBe('a_gen2');
    expect(result.state.personService).toBe(initial.personService);
    expect(result.state.personRanks).toBe(initial.personRanks);
    expect(index.world.people.find(p => p.id === 'a_gen2')!.faction).toBeNull();
    expect(sideOfPerson(index, result.state, PER('a_gen2'))).toBe('a');
    const chosen = { ...initial, personService: { ...initial.personService, [PER('a_gen2')]: { serviceFaction: 'b', serviceBloc: null, serviceChoice: 'resign', serviceDay: 2 } } };
    expect(applyCommandProposals(index, chosen as typeof initial, [proposal], 11).refused[0]?.reason).toBe('invalid');
  });
});
