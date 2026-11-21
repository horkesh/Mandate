import { expect, it } from 'vitest';
import { goalProblems, sameGoal } from '../src/plans/goal.ts';
import { noteRulesProblems } from '../src/plans/note-rules.ts';
import { noteProblems } from '../src/plans/notes.ts';
import { goalOf } from '../src/tick/orders.ts';
import { fresh } from './support/s25-fixture.ts';
import { goalTerms } from './support/test-seats.ts';

it('S25 plans-01: risk zero is legal and a negative risk is rejected', () => {
  expect(goalProblems(goalOf(goalTerms('hold', null, { risk: 0 })))).toEqual([]);
  expect(goalProblems(goalOf(goalTerms('hold', null, { risk: -1 })))).toContain('risk must be a permille');
});

it('S25 plans-02: note rules accept every stated lower bound', () => {
  const { world } = fresh();
  expect(noteRulesProblems({ ...world.map.world.rules.plans.notes, maxMarks: 1, maxWaypoints: 1, maxWaitDays: 0, scoreWeight: 0 })).toEqual([]);
});

it('S25 plans-03: a wait note may ask for zero whole days', () => {
  const note = { markKind: 'wait', markAxis: 'main', markRegion: null, markVia: [], markDays: 0 };
  expect(noteProblems(note)).toEqual([]);
  expect(noteProblems({ ...note, markDays: -1 })).not.toEqual([]);
});

it('S25 plans-05: river permission is part of goal identity', () => {
  const a = goalOf(goalTerms('take', 'b_front', { river: true }));
  expect(sameGoal(a, { ...a })).toBe(true);
  expect(sameGoal(a, { ...a, goalRiver: false })).toBe(false);
});
