import { expect, it } from 'vitest';
import { phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

it('Scott’s containment doctrine sends a hold through the ordinary order path, never a take of Winchester', () => {
  const { world, setup } = seatsWorld('union-1861');
  const initial = phase0.createState(world, setup);
  const state = { ...initial, stateDay: 111, situationFlags: { ...initial.situationFlags, war_begun_union: 38 } };
  const request = phase0.pendingRequests(world, state).find(r => r.menu.menuKind === 'principal' && r.menu.faction === 'union')!;
  if (request.menu.menuKind !== 'principal') throw Error('principal required');
  const row = request.menu.doctrine.offensives.find(o => o.post === 'us_dept_pennsylvania');
  expect(row).toMatchObject({ day: 112, objective: 'lower_valley', posture: 'hold' });
  // Give the policy an available command and attention; the history run checks actual establishment and delivery.
  const available = { ...request, menu: { ...request.menu, attention: { ...request.menu.attention, left: 10000 }, commandable: [{ ...request.menu.commandable[0]!, post: 'us_dept_pennsylvania' as never }] } };
  const answer = createRuleSeat().respond(available);
  expect(answer).toMatchObject({ answerKind: 'commands', commands: expect.arrayContaining([
    expect.objectContaining({ cmd: 'order', to: 'us_dept_pennsylvania', goal: expect.objectContaining({ objective: 'lower_valley', posture: 'hold' }) }),
  ]) });
  const rows = world.map.world.rules.ruleSeats.principals.find(p => p.faction === 'union')!.offensives.filter(o => o.post === 'us_dept_pennsylvania' && o.issuer === undefined);
  expect(rows).toHaveLength(2);
  expect(rows[1]).toMatchObject({ objective: 'harpers_ferry', fromDate: '1861-07-23', posture: 'hold' });
});
