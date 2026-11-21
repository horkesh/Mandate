import { describe, expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { F, P, POST, R, indexedFixture } from './support/seats-fixture.ts';

function fixture(side = 'a', declared = true, raises = true) {
  const base = indexedFixture();
  const map = indexWorld({ ...base.map.world, rules: { ...base.map.world.rules,
    recruitment: { ...base.map.world.rules.recruitment, raisingPostKinds: raises ? [...new Set([...base.map.world.rules.recruitment.raisingPostKinds, 'expedition'])] : base.map.world.rules.recruitment.raisingPostKinds },
    ruleSeats: { ...base.map.world.rules.ruleSeats, principals: base.map.world.rules.ruleSeats.principals.map(r => ({ ...r, calls: r.faction === F('a') ? [{ id: 'new_quota', post: POST('new_recruiting'), regiments: 1, men: null, arm: 'infantry', termDays: 30, fromDate: '1900-06-02', source: 'fixture raising order' }] : [] })) },
  } });
  return indexSeatsWorld(map, { ...base.start, temporaryPosts: declared ? [{ id: POST('new_recruiting'), name: 'post.new_recruiting', kind: 'expedition', department: toId('department', `${side}_war`), parent: null, holder: null, region: R(`${side}_cap`), operation: 'recruiting' }] : [] });
}

describe('a declared recruiting post is a guarded future call target', () => {
  it('accepts own-side raising doctrine but refuses a runtime call before the post exists', () => {
    const world = fixture();
    const state = createState(world, { seed: 1 });
    expect(state.postStates[POST('new_recruiting')]).toBeUndefined();
    const r = tick(world, state, [{ day: 1, seat: seatIdFor(P('a_lead')), command: { cmd: 'call', to: POST('new_recruiting'), regiments: 1, men: null, termDays: 30, route: 'courier', bypass: false } }]);
    expect(r.rejections.map(r => r.reason)).toEqual(['unknown_post']);
    expect(r.state.postStates[POST('new_recruiting')]).toBeUndefined();
  });
  it('rejects another side rather than treating any declaration as permission', () => expect(() => fixture('b')).toThrow(/calls.*belongs to another side/));
  it('rejects an undeclared post', () => expect(() => fixture('a', false)).toThrow(/not a declared post/));
  it('rejects a declared kind that cannot raise regiments', () => expect(() => fixture('a', true, false)).toThrow(/does not raise regiments/));
});
