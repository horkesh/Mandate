import { expect, it } from 'vitest';
import { strictCompare } from '../src/compare.ts';
import { ID_MAX_LENGTH, isWellFormedId, toId } from '../src/ids.ts';
import { MinHeap } from '../src/heap.ts';
import { answerOrder } from '../src/reading/orders.ts';
import { fresh } from './support/s25-fixture.ts';
import { P } from './support/seats-fixture.ts';

it('S25 primitives-01: strict ordering returns equality for equal strings', () => {
  expect(strictCompare('same', 'same')).toBe(0);
  expect(strictCompare('a', 'b')).toBe(-1);
  expect(strictCompare('b', 'a')).toBe(1);
});

it('S25 primitives-07: an explicit zero departure does not claim a disagreement with his judgement', () => {
  const { world, state } = fresh();
  const terms = { boldness: 500, honours: [], offends: [], required: 0, departure: 0 };
  expect(world.rules.people.compliance.departureReasonAt).toBeGreaterThan(0);
  expect(answerOrder(world, state, P('a_gen'), P('a_lead'), terms).reasons.some(r => r.kind === 'departs_from_judgement')).toBe(false);
  expect(answerOrder(world, state, P('a_gen'), P('a_lead'), { ...terms, departure: world.rules.people.compliance.departureReasonAt }).reasons.some(r => r.kind === 'departs_from_judgement')).toBe(true);
});

it('S25 primitives-08: a later smaller heap item bubbles above its parent', () => {
  const heap = new MinHeap<number>((a, b) => a < b);
  for (const n of [5, 1, 4, 2, 3, 1]) heap.push(n);
  const popped = [];
  while (heap.size > 0) popped.push(heap.pop());
  expect(popped).toEqual([1, 1, 2, 3, 4, 5]);
  expect(heap.pop()).toBeUndefined();
});

it('S25 primitives-04: an id at the maximum length is valid, and one byte longer is rejected', () => {
  const longest = 'a'.repeat(ID_MAX_LENGTH);
  expect(isWellFormedId(longest)).toBe(true);
  expect(toId('person', longest)).toBe(longest);
  expect(isWellFormedId(longest + 'a')).toBe(false);
});
