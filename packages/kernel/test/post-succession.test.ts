import { describe, expect, it } from 'vitest';
import { applyCommandProposals, type CommandProposal } from '../src/command/command.ts';
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

  it('does not appoint someone unable to serve', () => {
    const state = { ...initial, personStatus: { ...initial.personStatus, [PER('a_gen2')]: { statusKind: 'captured' as const, statusDay: 2 } } };
    const result = apply(proposal, state);
    expect(result.state).toBe(state);
    expect(result.refused[0]?.reason).toBe('invalid');
  });
});
