import { expect, it } from 'vitest';
import { applyPolitics } from '../src/politics/politics.ts';
import { fresh } from './support/s25-fixture.ts';
import { F } from './support/seats-fixture.ts';

it('S25 politics-04: calling a session after its dated opening starts it tomorrow, never retroactively', () => {
  const { world, state } = fresh();
  const rules = { ...world.map.world.rules.politics,
    chambers: [{ id: 'fixture_chamber', faction: F('a'), name: 'chamber.fixture', cite: 'FIXTURE' }],
    sessions: [{ id: 'fixture_session', chambers: ['fixture_chamber'], callable: true, opens: '1900-06-02', closes: '1900-06-30', afterCallDays: null, sitsDays: null, cite: 'FIXTURE' }],
  };
  const result = applyPolitics(rules, { ...state, stateDay: 9 }, [{ change: 'call', session: 'fixture_session' }], 10);
  expect(result.state.chamberStates.fixture_chamber).toMatchObject({ chamState: 'called', chamOpens: 11 });
  expect(result.events.some(e => e.polEvent === 'opened')).toBe(false);
});
