import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const P = (s: string) => ids.toId('post', s);
const CS = ids.toId('faction', 'confederate');
const VA = ids.toId('department', 'st_virginia');
const rules = createRuleSeat();
function menu(ready: boolean, day: number) {
  const { world, setup } = seatsWorld('union-1861');
  const start = phase0.createState(world, setup);
  const state = { ...start, stateDay: day - 1, situationFlags: { ...start.situationFlags, war_begun_confederate: 38 }, departmentFactions: { ...start.departmentFactions, [VA]: ready ? CS : null } };
  const request = phase0.pendingRequests(world, state).find(r => r.menu.menuKind === 'principal' && r.menu.faction === CS)!;
  if (request.menu.menuKind !== 'principal') throw new Error('principal menu required');
  return { world, state, request, doctrine: request.menu.doctrine };
}
describe('northern Virginia concentration follows sourced commands and Virginia’s side', () => {
  it('does not establish commands or change concentration before the cause or assignment date', () => {
    for (const [joined, day] of [[false, 88], [true, 86]] as const) {
      const m = menu(joined, day);
      expect(m.doctrine.concentrateAt).toBe(P('cs_cmd_charleston'));
      expect(m.doctrine.appointments?.find(a => a.post === P('cs_cmd_manassas'))?.ready).toBe(false);
    }
  });
  it('issues Beauregard’s 31 May assignment but keeps Johnston ineligible while he still holds a Union post', () => {
    const m = menu(true, 87);
    expect(m.doctrine.appointments).toContainEqual(expect.objectContaining({ post: P('cs_cmd_manassas'), from: P('cs_cmd_charleston'), ready: true }));
    expect(m.doctrine.appointments).toContainEqual(expect.objectContaining({ post: P('cs_cmd_harpers_ferry'), ready: false }));
    const answer = rules.respond(m.request);
    expect(answer).toMatchObject({ answerKind: 'commands', commands: expect.arrayContaining([expect.objectContaining({ cmd: 'appoint', post: P('cs_cmd_manassas'), from: P('cs_cmd_charleston') })]) });
  });
  it('makes Johnston eligible on the sourced May 23 assumption only after his ordinary resignation', () => {
    const { world, setup } = seatsWorld('union-1861');
    const johnston = ids.toId('person', 'johnston_joseph_e');
    const initial = phase0.createState(world, setup);
    expect(phase0.sideOfPerson(world.map, initial, johnston)).toBe(ids.toId('faction', 'union'));
    const before = phase0.playDays(world, initial, () => rules, 77, { freeze: true }).state;
    expect(before.personService?.[johnston]).toMatchObject({ serviceChoice: 'resign', serviceFaction: CS, serviceDay: 48 });
    expect(before.postStates[P('cs_cmd_harpers_ferry')]).toBeUndefined();
    const early = phase0.pendingRequests(world, before).find(r => r.menu.menuKind === 'principal' && r.menu.faction === CS)!;
    expect(early.menu).toMatchObject({ doctrine: { appointments: expect.arrayContaining([expect.objectContaining({ post: P('cs_cmd_harpers_ferry'), ready: false })]) } });
    const eve = phase0.playDays(world, before, () => rules, 1, { freeze: true }).state;
    const request = phase0.pendingRequests(world, eve).find(r => r.menu.menuKind === 'principal' && r.menu.faction === CS)!;
    expect(request.menu).toMatchObject({ doctrine: { appointments: expect.arrayContaining([expect.objectContaining({ post: P('cs_cmd_harpers_ferry'), ready: true })]) } });
    const answer = rules.respond(request);
    if (answer.answerKind !== 'commands') throw Error('expected commands');
    const command = answer.commands.find(c => c.cmd === 'appoint' && c.post === P('cs_cmd_harpers_ferry'))!;
    expect(command).toMatchObject({ person: johnston });
    const arrived = phase0.tick(world, eve, [{ day: 79, seat: request.requestSeat, command }], { freeze: true });
    expect(arrived.rejections).toEqual([]);
    expect(arrived.state.postStates[P('cs_cmd_harpers_ferry')]?.postHolder).toBe(johnston);
    const withoutAppointment = phase0.tick(world, eve, [], { freeze: true });
    expect(Object.keys(arrived.state.forceBlockStates)).toEqual(Object.keys(withoutAppointment.state.forceBlockStates));
    const row = world.map.world.rules.ruleSeats.principals.find(r => r.faction === CS)!.appointments!.find(a => a.post === P('cs_cmd_harpers_ferry'))!;
    expect(row).toMatchObject({ fromDate: '1861-05-23' });
    expect(row.source).toContain('470');
  });
  it('opens the command only after delivery, then selects it for concentration', () => {
    const m = menu(true, 87);
    const answer = rules.respond(m.request);
    if (answer.answerKind !== 'commands') throw new Error('commands required');
    const command = answer.commands.find(c => c.cmd === 'appoint' && c.post === P('cs_cmd_manassas'))!;
    let result = phase0.tick(m.world, m.state, [{ day: 87, seat: m.request.requestSeat, command }], { freeze: true });
    expect(result.rejections).toEqual([]);
    for (let i = 0; i < 20 && result.state.postStates[P('cs_cmd_manassas')] === undefined; i++) result = phase0.tick(m.world, result.state, [], { freeze: true });
    expect(result.state.postStates[P('cs_cmd_manassas')]).toMatchObject({ postHolder: 'beauregard_pierre_g_t', postSeat: 'manassas' });
    expect(result.state.postStates[P('cs_cmd_charleston')]!.postHolder).toBeNull();
    const next = phase0.pendingRequests(m.world, result.state).find(r => r.menu.menuKind === 'principal' && r.menu.faction === CS)!;
    expect(next.menu).toMatchObject({ doctrine: { concentrateAt: 'cs_cmd_manassas', concentrateFrom: ['cs_cmd_charleston'] } });
  });
});
