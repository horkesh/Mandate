import { expect, it } from 'vitest';
import { previewAudience, type CounterTerms } from '../src/audience/audience.ts';
import { postObserver } from '../src/command/observers.ts';
import { fresh } from './support/s25-fixture.ts';
import { P, POST } from './support/seats-fixture.ts';

const counter = (kind: CounterTerms['kind'], over: Partial<CounterTerms> = {}): CounterTerms => ({ kind, value: null, boldness: null, from: null, men: null, ...over });

it('S25 audience-01/03: an audience accepts its exact counter limit and maximum adjustment', () => {
  const { world, state } = fresh();
  const counters = [counter('adjust', { boldness: 1000 }), counter('vindicate'), counter('threaten')];
  expect(world.rules.people.verbs.audience.maxCounters).toBe(3);
  const result = previewAudience(world, state, P('a_lead'), POST('a_army'), counters, 1, 'hold');
  expect(typeof result).not.toBe('string');
  if (typeof result === 'string') throw Error(result);
  expect(result.problems).toEqual([]);
  const tooMany = previewAudience(world, state, P('a_lead'), POST('a_army'), [...counters, counter('promise_advancement')], 1, 'hold');
  if (typeof tooMany === 'string') throw Error(tooMany);
  expect(tooMany.problems).toContain('an audience allows at most 3 counters');
  expect(state.personGrievances[P('a_gen')]).toBeUndefined();
});

it('S25 audience-04: withdrawing an existing overseer names the observer to recall', () => {
  const { world, state } = fresh();
  const held = postObserver(state, P('a_spy'), POST('a_army'), P('a_lead'), 0);
  const result = previewAudience(world, held, P('a_lead'), POST('a_army'), [counter('withdraw_overseer')], 1, 'hold');
  if (typeof result === 'string') throw Error(result);
  expect(result.problems).toEqual([]);
  expect(result.recall).toEqual([P('a_spy')]);
  expect(held.observerPostings[P('a_spy')]).toBeDefined();
});
