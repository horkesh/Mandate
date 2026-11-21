import { expect, it } from 'vitest';
import { filterDecision, pushbackOf } from '../src/reading/orders.ts';
import { traitsOf } from '../src/people/traits.ts';
import { indexWorld } from '../src/world/index.ts';
import { fresh } from './support/s25-fixture.ts';
import { P, POST } from './support/seats-fixture.ts';

it('S25 reading-03: a policy that offends no values reports no invented values terms', () => {
  const { world, state } = fresh();
  expect(pushbackOf(world, state, 'verb:inquire', [], P('a_lead'))).toEqual({ total: 0, terms: [], floor: null });
});

it('S25 reading-04: a practice clash is counted once, apart from the recipient willingness', () => {
  const { world: base, state } = fresh();
  const rules = base.map.world.rules.people;
  const map = indexWorld({ ...base.map.world,
    people: base.map.world.people.map(p => p.id === P('a_gen') ? { ...p, practices: [{ practice: 'fixture_practice', cites: [{ source: 'FIXTURE', at: null }] }] } : p),
    rules: { ...base.map.world.rules, people: { ...rules, verbs: { ...rules.verbs,
      orderValues: rules.verbs.orderValues.map(r => r.order === 'verb:inquire' ? { ...r, clashes: ['fixture_practice'] } : r) } } },
  });
  const world = { ...base, map };
  const pushback = pushbackOf(world, state, 'verb:inquire', [P('a_gen')], P('a_lead'));
  expect(pushback).toEqual({ total: rules.verbs.practiceWeight,
    terms: [{ source: 'practice', person: P('a_gen'), practice: 'fixture_practice', amount: rules.verbs.practiceWeight }], floor: null });
});

it('S25 reading-05: equal filter delays retain the first contributing pack value as their reason', () => {
  const { world, state } = fresh();
  const rules = { ...world.rules.people, filter: { ...world.rules.people.filter,
    holdFor: [{ value: 'duty', days: 2 }, { value: 'caution', days: 2 }] } };
  const holder = { ...traitsOf(world, state, P('a_clerk')), values: ['caution', 'duty'] };
  const result = filterDecision(rules, holder, POST('a_filter'));
  expect(result.holdDays).toBe(2);
  expect(result.terms.find(t => t.termKind === 'filter_hold')!.termRule).toBe('values:duty');
});
