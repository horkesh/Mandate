import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { phase0, ids } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { ConsoleSession } from '../../../packages/cli/src/console/session.ts';

it('S128 exposes four sourced questions and promotes exactly the ten M1 rows to binding matchers', () => {
  const { world, setup } = seatsWorld('union-1861');
  const state = phase0.createState(world, setup);
  const request = phase0.pendingRequests(world, state).find(r => r.requestSeat === phase0.seatIdFor(world.faction(ids.toId('faction','union')).principal))!;
  expect(request.menu.menuKind).toBe('principal');
  if (request.menu.menuKind !== 'principal') return;
  const questions = request.menu.consultations!;
  expect(questions.map(q => q.letter.key)).toEqual(['sumter_0305','sumter_0312','sumter_0315','sumter_0329']);
  expect(questions.map(q => q.day)).toEqual([0,7,10,24]);
  const opening = createRuleSeat().respond(request);
  expect(opening.answerKind).toBe('commands');
  if (opening.answerKind !== 'commands') return;
  expect(opening.commands.filter(c => c.cmd === 'consult' && c.round !== undefined)).toHaveLength(1);
  const desk = new ConsoleSession(new ConsoleGame({pack:'union-1861'}));
  expect(desk.start().join('\n')).toContain(questions[0]!.question);
  const key = 'us_consultations.sumter_0305.1';
  expect(desk.handle(`consult sumter_garrison us_general_in_chief round=${key}`).lines.join('\n')).toContain(key);
  const rows = JSON.parse(readFileSync(new URL('../pushback-union.json',import.meta.url),'utf8')).rows;
  const wanted = ['U01','U02','U03a','U03b','U03c','U03d','U03e','U04','U05','U42'];
  for (const id of wanted) {
    const row = rows.find((r: {id:string}) => r.id === id);
    expect(row.gap).toBeUndefined();expect(row.match.kind).toBe('verb:consult');expect(row.match.course).toBeTruthy();
    if (id !== 'U02') expect(row.match.round).toBeTruthy();
  }
  // No invented exact question/date is attached to Scott's undated two-fort memorandum.
  expect(rows.find((r: {id:string}) => r.id === 'U02').match.round).toBeUndefined();
});

it('S132 offers the opening consultation and standing authority on the same principal turn', () => {
  const { world, setup } = seatsWorld('union-1861');
  const state = phase0.createState(world, setup);
  expect(state.personStances).toEqual({});
  const seat = phase0.seatIdFor(world.faction(ids.toId('faction', 'union')).principal);
  const request = phase0.pendingRequests(world, state).find(r => r.requestSeat === seat)!;
  const answer = createRuleSeat().respond(request);
  expect(answer).toMatchObject({ answerKind: 'commands' });
  if (answer.answerKind !== 'commands') return;
  expect(answer.commands).toEqual(expect.arrayContaining([
    expect.objectContaining({ cmd: 'mandate', paper: 's123_scott_1841' }),
    expect.objectContaining({ cmd: 'consult', round: expect.objectContaining({ key: 'sumter_0305' }) }),
  ]));
});
