import { ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

/**
 * A situation's effect opens a temporary post the start declares (0040: "Appoint may create a temporary post"; lane
 * 1.11, the lead's ruling): `command` applies the proposal, once. On the testbed's fiction.
 */
const POST = (id: string) => ids.toId('post', id);
const spec = (over: Partial<phase0.TemporaryPostSpec> = {}): phase0.TemporaryPostSpec => ({
  id: POST('n_sound_expedition'),
  name: 'post.n_sound_expedition.name',
  kind: 'expedition',
  department: ids.toId('department', 'n_war'),
  parent: POST('n_war_office'),
  holder: null,
  seat: ids.toId('region', 'n_naval_base'),
  operation: 'sound_raid',
  ...over,
});
const propose = (subject: string): phase0.CommandProposal => ({ owner: 'command', field: phase0.TEMPORARY_POST_FIELD, subject, delta: 1, side: null, origin: 'decision' });

describe('a temporary post opened by a situation (lane 1.11)', () => {
  const { world, setup } = seatsWorld('testbed');
  const start = phase0.createState(world, setup);

  it('opens the declared post once, as the start declares it; a second proposal changes nothing', () => {
    const first = phase0.applyCommandProposals(world.map, start, [propose('n_sound_expedition')], 1, [spec()]);
    expect(first.applied).toEqual([{ field: phase0.TEMPORARY_POST_FIELD, subject: 'n_sound_expedition', change: 'opened' }]);
    expect(first.state.postStates[POST('n_sound_expedition')]).toMatchObject({ postKind: 'expedition', postParent: 'n_war_office', postOperation: 'sound_raid', postHolder: null });
    const again = phase0.applyCommandProposals(world.map, first.state, [propose('n_sound_expedition')], 2, [spec()]);
    expect(again.applied.map((a) => a.change)).toEqual(['unchanged']);
    expect(again.state).toBe(first.state);
  });

  it('refuses, with a reason, a post the start does not declare, and one whose holder already holds a post', () => {
    expect(phase0.applyCommandProposals(world.map, start, [propose('n_unknown')], 1, [spec()]).refused.map((r) => r.reason)).toEqual(['invalid']);
    const busy = phase0.applyCommandProposals(world.map, start, [propose('n_sound_expedition')], 1, [spec({ holder: ids.toId('person', 'n_fighter') })]);
    expect(busy.refused.map((r) => r.reason)).toEqual(['invalid']);
    expect(busy.state.postStates[POST('n_sound_expedition')]).toBeUndefined();
  });
});
