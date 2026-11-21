import { expect, it } from 'vitest';
import { deriveMap } from '../src/control-index/derived.ts';
import { controlTable, depot, edge, F, mapIndex, R, region } from './support/map-fixture.ts';
import { fresh } from './support/s25-fixture.ts';

it('S25 supply-02: equally good supply paths choose the smaller source id before the edge id', () => {
  const map = mapIndex({ regions: ['a1', 'b1', 'mid'].map(id => region(id)),
    edges: [edge('a1', 'mid'), edge('b1', 'mid')],
    depots: [depot('z_source', 'a1'), depot('a_source', 'b1')] });
  const control = controlTable({ a1: { a: 1000 }, b1: { a: 1000 }, mid: { a: 1000 } });
  expect(deriveMap(map, { control, month: 6 }).supply.factions.get(F('a'))!.paths.get(R('mid'))!.origin).toBe('a_source');
});

it('S25 supply-03: January is a valid supply month, while month zero is rejected', () => {
  const { world, state } = fresh();
  expect(() => deriveMap(world.map, { control: state.regionControl, month: 1 })).not.toThrow();
  expect(() => deriveMap(world.map, { control: state.regionControl, month: 0 })).toThrow(/month/);
});
