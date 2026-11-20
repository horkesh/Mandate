import { describe, expect, it } from 'vitest';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { P, POST, R, indexedFixture } from './support/seats-fixture.ts';
import { indexWorld } from '../src/world/index.ts';
import type { State } from '../src/root-state.ts';
import { pruneResponses } from '../src/proxy/responses.ts';
import { entryProblems } from '../src/log/log.ts';

function fixture() {
  const base = indexedFixture();
  const map = indexWorld({ ...base.map.world, vocabularies: { ...base.map.world.vocabularies, postKinds: [...base.map.world.vocabularies.postKinds, { id: 'expedition', name: 'post.expedition', role: null, temporary: true, creatable: 'appoint' as const }] } });
  return indexSeatsWorld(map, { ...base.start, temporaryPosts: [{ id: POST('a_new'), name: 'post.new', kind: 'expedition', department: base.start.posts[0]!.department, parent: POST('a_office'), holder: P('a_bold'), region: R('a_front'), operation: 'new_army' }] });
}
const order = { cmd: 'appoint' as const, post: POST('a_new'), person: P('a_bold'), from: POST('a_reserve'), rank: null, route: 'courier' as const };

describe('an appointment establishes a declared command', () => {
  it('travels before atomically moving its commander, leaving his old forces in their post', () => {
    const world = fixture();
    let state = createState(world, { seed: 1 });
    const first = tick(world, state, [{ day: 1, seat: seatIdFor(P('a_lead')), command: order }], { freeze: true });
    expect(first.rejections).toEqual([]);
    expect(first.state.postStates[POST('a_reserve')]!.postHolder).toBe(P('a_bold'));
    expect(first.state.postStates[POST('a_new')]).toBeUndefined();
    state = first.state;
    for (let day = 2; day <= 6; day++) state = tick(world, state, [], { freeze: true }).state;
    expect(state.postStates[POST('a_new')]!.postHolder).toBe(P('a_bold'));
    expect(state.postStates[POST('a_new')]!.postSeat).toBe(R('a_front'));
    expect(state.postStates[POST('a_reserve')]!.postHolder).toBeNull();
    expect(Object.values(state.forceAssignments)).toContain(POST('a_reserve'));
    expect(state.personGrievances[P('a_bold')] ?? []).toEqual([]);
    expect(Object.values(state.orderResponses)).toContainEqual(expect.objectContaining({ respPost: POST('a_new'), respKind: 'verb:appoint' }));
    const kept = pruneResponses(state, 100, 10).state;
    expect(Object.values(kept.orderResponses)).toContainEqual(expect.objectContaining({ respPost: POST('a_new'), respKind: 'verb:appoint' }));
    expect(entryProblems({day:1,seat:seatIdFor(P('a_lead')),command:{...order,from:null}},0)).not.toEqual([]);
  });
  it('rejects an undeclared destination, wrong source holder and cross-side assignment without releasing anyone', () => {
    const world = fixture(); const state = createState(world, { seed: 1 });
    for (const command of [{ ...order, post: POST('missing') }, { ...order, from: POST('a_army') }, { ...order, person: P('b_gen') }]) {
      const r = tick(world, state, [{ day: 1, seat: seatIdFor(P('a_lead')), command }]);
      expect(r.rejections).toHaveLength(1);
      expect(r.state.postStates).toEqual(state.postStates);
    }
  });
  it('does not release a commander if the destination fills while his letter travels', () => {
    const world = fixture(); const state = createState(world, { seed: 1 });
    const sent = tick(world, state, [{ day: 1, seat: seatIdFor(P('a_lead')), command: order }]);
    const other = { ...sent.state.postStates[POST('a_army')]!, postHolder: P('a_spy') };
    let changed: State = { ...sent.state, postStates: { ...sent.state.postStates, [POST('a_new')]: other } };
    for (let day = 2; day <= 6; day++) changed = tick(world, changed, []).state;
    expect(changed.postStates[POST('a_reserve')]!.postHolder).toBe(P('a_bold'));
    expect(changed.postStates[POST('a_new')]!.postHolder).toBe(P('a_spy'));
  });
  it('does not release a different source holder when that source changes in transit', () => {
    const world = fixture(); const start = createState(world, { seed: 1 });
    const sent = tick(world, start, [{ day: 1, seat: seatIdFor(P('a_lead')), command: order }]);
    let state: State = { ...sent.state, postStates: { ...sent.state.postStates, [POST('a_reserve')]: { ...sent.state.postStates[POST('a_reserve')]!, postHolder: P('a_spy') } } };
    for (let day=2; day<=6; day++) state=tick(world,state,[]).state;
    expect(state.postStates[POST('a_reserve')]!.postHolder).toBe(P('a_spy'));
    expect(state.postStates[POST('a_new')]).toBeUndefined();
  });
});
