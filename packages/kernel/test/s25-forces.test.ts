import { expect, it } from 'vitest';
import { applyDetachments, detachmentProblems } from '../src/forces/detachments.ts';
import { applyMusters } from '../src/forces/enlistment.ts';
import { initialForces } from '../src/forces/forces.ts';
import { dailyNeedMilli, storesStep } from '../src/forces/stores.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { toId } from '../src/ids.ts';
import { createState } from '../src/tick/setup.ts';
import { fresh } from './support/s25-fixture.ts';
import { B, DEP, block, forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { P, POST } from './support/seats-fixture.ts';
import { depot, region } from './support/map-fixture.ts';
import { worldOf } from './support/tick-context.ts';

it('S25 forces-01: the minimum one-man detachment conserves strength', () => {
  const { state } = fresh();
  const delta = { change: 'detach' as const, parent: B('a_army_1'), detachment: B('s25.detachment'), men: 1, name: 'force.detachment', cause: 'command' as const };
  expect(detachmentProblems(state, delta)).toEqual([]);
  const next = applyDetachments(state, [delta]).state;
  expect(next.forceBlockStates[delta.detachment]!.fbStrength).toBe(1);
  expect(next.forceBlockStates[delta.parent]!.fbStrength).toBe(state.forceBlockStates[delta.parent]!.fbStrength! - 1);
});

it('S25 forces-02/03: both creation paths accept zero strength while rejecting a negative strength', () => {
  const { world, state } = fresh();
  const start = { ...world.start, forceBlocks: world.start.forceBlocks.map(b => b.id === B('a_army_1') ? { ...b, strength: 0 } : b) };
  expect(initialForces(world.map, start)[B('a_army_1')]!.fbStrength).toBe(0);
  const create = { block: B('s25.new'), name: 'force.new', department: DEP('a_war'), arm: world.map.world.vocabularies.arms[0]!.id,
    strength: 0, storesDays: 0, enlistment: { enlPost: POST('a_army'), enlRaisedBy: P('a_gen'), enlCall: toId('message', 's25.muster'), enlRegiments: 1, enlMusterDay: 1, enlEndsDay: 91 } };
  expect(applyMusters(world.map, state, [{ change: 'create', create, cause: 'recruitment' }]).state.forceBlockStates[create.block]!.fbStrength).toBe(0);
  expect(() => applyMusters(world.map, state, [{ change: 'create', create: { ...create, strength: -1 }, cause: 'recruitment' }])).toThrow(/strength/);
});

it('S25 forces-04: blocks at their stores cap ask only for daily consumption, preserving the next block supply', () => {
  const map = forcesIndex({ regions: [region('a1')], edges: [], depots: [depot('a_src', 'a1', 'source', 2)] });
  const cap = map.world.rules.stores.capDays;
  const men = map.world.rules.stores.menPerCapacityUnit;
  const start = forcesStart({ a1: { a: 1000 } }, [], ['a_first', 'a_second'].map(id => block(id, { region: 'a1', department: 'a_war', strength: men, storesDays: cap })));
  const state = createState(worldOf(map, start), { seed: 17 });
  const result = storesStep(map, state, deriveMap(map, { control: state.regionControl, month: 6 }).supply);
  const need = dailyNeedMilli(map.world.rules.stores, state, B('a_first'));
  expect(result.allocations.map(a => a.demand.amountMilli)).toEqual([need, need]);
  expect(result.allocations.map(a => a.deliveredMilli)).toEqual([need, need]);
  expect(result.state.forceBlockStates[B('a_second')]!.fbStoresMilli).toBe(cap * 1000);
});
