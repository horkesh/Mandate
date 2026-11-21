import { expect, it } from 'vitest';
import { controlInvariants } from '../src/invariants/map.ts';
import { fresh } from './support/s25-fixture.ts';
import { R } from './support/seats-fixture.ts';

it('S25 state-support-01: an explicit zero share has its sparse-table diagnosis, not an invalid-permille diagnosis', () => {
  const { world, state } = fresh();
  const failures = controlInvariants(world.map, { ...state.regionControl, [R('a_front')]: { a: 0 } });
  expect(failures.map(f => f.kind)).toEqual(['control_zero_share']);
});

it('S25 state-support-05: full control is a valid invariant boundary', () => {
  const { world, state } = fresh();
  expect(controlInvariants(world.map, state.regionControl)).toEqual([]);
});
