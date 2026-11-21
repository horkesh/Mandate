import { expect, it } from 'vitest';
import { believedRatio, RATIO_CAP, type CommanderView } from '../src/combat/decide.ts';
import { pruneBattles, type BattleRecord } from '../src/combat/records.ts';
import { fresh } from './support/s25-fixture.ts';
import { F, P, POST, R } from './support/seats-fixture.ts';

it('S25 combat-03: zero men on both sides gives a finite zero believed ratio', () => {
  const commander: CommanderView = { person: P('a_gen'), boldness: 500, competence: 500, nerve: 500, perceptionPermille: 1000, demandPermille: 1000 };
  expect(believedRatio(commander, 0, 0)).toBe(0);
  expect(believedRatio(commander, 1, 0)).toBe(RATIO_CAP);
});

it('S25 combat-05: a closed battle stays through its retention limit, while open battles stay indefinitely', () => {
  const { state } = fresh();
  const closed: BattleRecord = { battleRegion: R('a_front'), battleStartDay: 1, battleEndDay: 2,
    battleFactions: [F('a'), F('b')], battleCauses: [POST('a_army')], battleDays: [] };
  const held = { ...state, battleRecords: { closed, open: { ...closed, battleEndDay: null } } };
  const atLimit = pruneBattles(held, 12, 10);
  expect(atLimit.pruned).toBe(0);
  expect(atLimit.state.battleRecords.closed).toEqual(closed);
  const expired = pruneBattles(atLimit.state, 13, 10);
  expect(expired.pruned).toBe(1);
  expect(Object.keys(expired.state.battleRecords)).toEqual(['open']);
});
