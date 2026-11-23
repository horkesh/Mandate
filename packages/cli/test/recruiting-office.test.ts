import { enlistmentsOf } from '../../kernel/src/forces/enlistment.ts';
import { forceTotals } from '../../kernel/src/forces/lots.ts';
import { expect, it } from 'vitest';
import { ids, phase0, world as w } from '@mandate/kernel';
import { seatsWorld } from '../src/seats-world.ts';

it('a fictional recruiting office can answer three arm requests concurrently without inventing their unread strength', () => {
  const loaded = seatsWorld('testbed');
  const office = ids.toId('post', 'n_brenmark_governor');
  // Contract fixture: the known duty-valuing fictional holder staffs a recruiting office.
  // No historical person's values or ordinary history thresholds are changed to obtain compliance.
  const raw = loaded.world.map.world;
  const map = w.indexWorld({ ...raw, vocabularies: { ...raw.vocabularies, postKinds: [...raw.vocabularies.postKinds,
    { id: 'recruiting_fixture', name: 'post_kind.recruiting_fixture', creatable: 'start_only', temporary: false, role: null },
  ] }, rules: { ...raw.rules, recruitment: { ...raw.rules.recruitment, raisingPostKinds: [...raw.rules.recruitment.raisingPostKinds, 'recruiting_fixture'] } } });
  const world = phase0.indexSeatsWorld(map, { ...loaded.world.start, posts: loaded.world.start.posts.map(p => p.id === office ? { ...p, kind: 'recruiting_fixture' } : p) }, { situations: [] });
  let state = phase0.createState(world, loaded.setup);
  const seat = phase0.seatIdFor(ids.toId('person', 'n_leader'));
  const arms = ['infantry', 'cavalry', 'artillery'];
  const result = phase0.tick(world, state, arms.map((arm, i) => ({ day: 1, seat, command: {
    cmd: 'call' as const, to: office, regiments: i === 0 ? 8 : 1, men: null, arm, termDays: 1095,
    route: 'courier' as const, bypass: false, callId: `office_quota_${i}`,
  } })), { freeze: true });
  expect(result.rejections).toEqual([]); state = result.state;
  for (let day = 2; day <= 20; day++) state = phase0.tick(world, state, [], { freeze: true }).state;
  const entries = Object.entries(enlistmentsOf(state)).filter(([, e]) => e.enlCallId?.startsWith('office_quota_'));
  expect(entries).toHaveLength(3);
  expect(new Set(entries.map(([id]) => id)).size).toBe(3);
  expect(entries.map(([id]) => state.forceBlockStates[ids.toId('forceBlock', id)]!.fbArm).sort()).toEqual([...arms].sort());
  for (const [id, e] of entries) {
    const askedRegiments = e.enlCallId === 'office_quota_0' ? 8 : 1;
    expect(e).toMatchObject({ enlPost: office, enlRegiments: askedRegiments });
    expect(e.enlEndsDay! - e.enlMusterDay).toBe(1095);
    expect(forceTotals(state.forceBlockStates[ids.toId('forceBlock', id)]!).fbStrength).toBeNull();
    expect(state.forceAssignments[ids.toId('forceBlock', id)]).toBe(office);
  }
  expect(state.postLevies).toEqual({});
});
