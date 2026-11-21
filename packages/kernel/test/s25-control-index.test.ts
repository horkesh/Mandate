import { expect, it } from 'vitest';
import { controlThresholds } from '../src/control/control.ts';
import { holdingFromShares, rankShares } from '../src/control-index/control-index.ts';
import { mapSignature } from '../src/control-index/derived.ts';
import { fresh } from './support/s25-fixture.ts';
import { F, R } from './support/seats-fixture.ts';

it('S25 control-index-01: an explicit zero report is no control, not a below-threshold holding', () => {
  expect(rankShares({ [R('a_front')]: { [F('a')]: 0 } }, R('a_front'))).toEqual([]);
  expect(holdingFromShares(R('a_front'), { [F('a')]: 0 }, 250)).toMatchObject({ holder: null, reason: 'no_control', tracedBy: [] });
});

it('S25 control-index-02: the cache signature crosses a band on the threshold itself', () => {
  const { world, state } = fresh();
  const threshold = controlThresholds(world.map)[0]!;
  const signature = (share: number) => mapSignature(world.map, { month: 6, control: { ...state.regionControl, [R('a_front')]: { a: share, b: 700 } } });
  expect(signature(threshold - 1)).not.toBe(signature(threshold));
  expect(signature(threshold)).toBe(signature(threshold + 1));
});

it('S25 control-index-05: a side traces ground at the exact control threshold', () => {
  expect(holdingFromShares(R('a_front'), { [F('a')]: 250, [F('b')]: 500 }, 250)).toMatchObject({ holder: F('b'), tracedBy: [F('a'), F('b')] });
});
