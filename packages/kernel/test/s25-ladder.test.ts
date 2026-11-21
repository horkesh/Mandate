import { expect, it } from 'vitest';
import { rungIndex, targetRung, weeklyLadder } from '../src/ladder/ladder.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { LADDER_RUNGS, type LadderRung } from '../src/people/verb-rules.ts';
import { fresh } from './support/s25-fixture.ts';
import { P } from './support/seats-fixture.ts';

function discontentAt(rung: LadderRung, standing: number) {
  const { world, state } = fresh();
  const rules = { ...world.rules.people, shadow: { ...world.rules.people.shadow, regardUnknown: 0 } };
  const load = rules.verbs.ladder.thresholds[rungIndex(rung) - 1]!;
  const next = applyPeopleChanges(state, [
    { change: 'grievance', person: P('a_gen'), kind: 'passed_over', weight: load, against: null, cause: null },
    { change: 'standing', person: P('a_gen'), delta: standing - state.personStanding[P('a_gen')]! },
  ], 1, rules, world.map.world.vocabularies.ranks);
  return { rules, state: next };
}

it('S25 ladder-01: exact discontent thresholds reach their rung', () => {
  const { rules, state } = discontentAt(LADDER_RUNGS[1]!, 1000);
  expect(targetRung(rules, state, P('a_gen'), null)).toBe(LADDER_RUNGS[1]);
});

it('S25 ladder-03: exact public standing permits public defiance', () => {
  const { world } = fresh();
  const { rules, state } = discontentAt('public_defiance', world.rules.people.verbs.ladder.publicStanding);
  expect(targetRung(rules, state, P('a_gen'), null)).toBe('public_defiance');
});

it('S25 ladder-05: a lobbyist at the rival-standing threshold becomes a rival', () => {
  const { world } = fresh();
  const { rules, state: prepared } = discontentAt('lobbying', world.rules.people.verbs.ladder.rivalStanding);
  const state = { ...prepared, personRungs: { [P('a_gen')]: 'lobbying' as const } };
  const result = weeklyLadder(rules, state, [P('a_gen')], () => null, 8);
  expect(result.state.personRivals[P('a_gen')]).toBe(8);
  expect(result.events.some(e => e.event === 'rival')).toBe(true);
});
