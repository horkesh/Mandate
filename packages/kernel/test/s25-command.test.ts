import { expect, it } from 'vitest';
import { leviesDue, type Levy } from '../src/command/levies.ts';
import { postObserver, recallObserver } from '../src/command/observers.ts';
import { toId } from '../src/ids.ts';
import { fresh } from './support/s25-fixture.ts';
import { P, POST } from './support/seats-fixture.ts';

it('S25 command-03: a levy is due on its muster day, with no earlier muster', () => {
  const { state } = fresh();
  const levy: Levy = { levyPost: POST('a_army'), levyGovernor: P('a_gen'), levyIssuer: P('a_lead'),
    levyCall: toId('message', 's25.call'), levyRegiments: 1, levyMen: 100, levyTermDays: 90, levyMusterDay: 5, levyResponse: 's25.response' };
  const held = { ...state, postLevies: { [levy.levyCall]: levy } };
  expect(leviesDue(held, 4)).toEqual([]);
  expect(leviesDue(held, 5)).toEqual([levy.levyCall]);
});

it('S25 command-04: recall removes a posted observer and preserves unrelated posts and the original State', () => {
  const { state } = fresh();
  const held = postObserver(postObserver(state, P('a_spy'), POST('a_army'), P('a_lead'), 1), P('a_clerk'), POST('a_reserve'), P('a_lead'), 1);
  const next = recallObserver(held, P('a_spy'));
  expect(Object.keys(next.observerPostings)).toEqual([P('a_clerk')]);
  expect(held.observerPostings[P('a_spy')]).toBeDefined();
  expect(recallObserver(next, P('a_spy'))).toBe(next);
});
