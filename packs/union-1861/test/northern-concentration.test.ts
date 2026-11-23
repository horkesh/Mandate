import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../../../packages/kernel/src/knowledge/truth.ts';
import { report } from '../../../packages/kernel/test/support/s25-fixture.ts';

const P = (s: string) => ids.toId('post', s);
const CS = ids.toId('faction', 'confederate');
const VA = ids.toId('department', 'st_virginia');
const rules = createRuleSeat();
function menu(ready: boolean, day: number) {
  const { world, setup } = seatsWorld('union-1861');
  const start = phase0.createState(world, setup);
  let state: typeof start = { ...start, stateDay: day - 1, situationFlags: { ...start.situationFlags, war_begun_confederate: 38 }, departmentFactions: { ...start.departmentFactions, [VA]: ready ? CS : null } };
  if (ready) state = deliverReport(state, phase0.seatIdFor(world.faction(CS).principal), report('m.fixture.convention', {
    reportAuthor: ids.toId('person', 'walker_leroy_p'), reportAuthorPost: P('cs_secretary_war'), reportSubjectKind: 'situation',
    reportSubjectId: 'virginia_military_convention', reportDay: 52,
  }, 53), NO_TRUTH);
  if (day >= 83) {
    // S82: the May 27 institutional succession has actually happened and its
    // ordinary notice has reached Davis before the May 31 appointment.
    state = { ...state, postStates: { ...state.postStates, [P('cs_cmd_charleston')]: { ...state.postStates[P('cs_cmd_charleston')]!, postHolder: ids.toId('person','anderson_richard_h') } } };
    state = deliverReport(state, phase0.seatIdFor(world.faction(CS).principal), report('m.fixture.charleston', {
      reportAuthor: ids.toId('person','walker_leroy_p'), reportAuthorPost: P('cs_secretary_war'), reportSubjectKind: 'situation',
      reportSubjectId: 'charleston_anderson_command', reportDay: 83,
    }, 84), NO_TRUTH);
  }
  const request = phase0.pendingRequests(world, state).find(r => r.menu.menuKind === 'principal' && r.menu.faction === CS)!;
  if (request.menu.menuKind !== 'principal') throw new Error('principal menu required');
  return { world, state, request, doctrine: request.menu.doctrine };
}
describe('northern Virginia concentration follows sourced commands and Virginia’s side', () => {
  it('S42: changing the unreceived live Virginia side cannot make a dated appointment ready', () => {
    const before = menu(false, 87);
    const hidden = { ...before.state, departmentFactions: { ...before.state.departmentFactions, [VA]: CS } };
    const request = phase0.pendingRequests(before.world, hidden).find(r => r.menu.menuKind === 'principal' && r.menu.faction === CS)!;
    expect(request.menu).toMatchObject({ doctrine: { appointments: before.doctrine.appointments } });
  });
  it('S42: the convention paper is dated and caused, with an ordinary ministry route', () => {
    const { world, setup } = seatsWorld('union-1861');
    const notice = world.situations.find(s => s.id === 'virginia_military_convention');
    expect(notice).toMatchObject({ earliest: '1861-04-26', event: { all: [{ dayAtLeast: 52 }, { flag: 'virginia_seceded' }] },
      report: { authors: ['cs_secretary_war'], reportType: 'wire-dispatch', subtype: null } });
    const start = { ...phase0.createState(world, setup), stateDay: 51 };
    const absent = phase0.tick(world, start, [], { freeze: true });
    expect(absent.state.messagesInTransit.some(m => m.msgReport?.reportSubjectId === notice!.id)).toBe(false);
    const caused = phase0.tick(world, { ...start, situationFlags: { virginia_seceded: 48 } }, [], { freeze: true });
    expect(caused.state.messagesInTransit).toContainEqual(expect.objectContaining({ msgReport: expect.objectContaining({ reportSubjectId: notice!.id, reportDay: 52 }) }));
  });
  it('does not establish commands or change concentration before the cause or assignment date', () => {
    for (const [joined, day] of [[false, 88], [true, 86]] as const) {
      const m = menu(joined, day);
      expect(m.doctrine.concentrateAt).toBe(P('cs_cmd_charleston'));
      expect(m.doctrine.appointments?.find(a => a.post === P('cs_cmd_manassas'))?.ready).toBe(false);
    }
  });
  it('issues Beauregard’s 31 May assignment but keeps Johnston ineligible while he still holds a Union post', () => {
    const m = menu(true, 87);
    expect(m.doctrine.appointments).toContainEqual(expect.objectContaining({ post: P('cs_cmd_manassas'), person: 'beauregard_pierre_g_t', from: null, ready: true }));
    expect(m.doctrine.appointments).toContainEqual(expect.objectContaining({ post: P('cs_cmd_harpers_ferry'), ready: false }));
    const answer = rules.respond(m.request);
    expect(answer).toMatchObject({ answerKind: 'commands', commands: expect.arrayContaining([expect.objectContaining({ cmd: 'appoint', post: P('cs_cmd_manassas'), person: 'beauregard_pierre_g_t' })]) });
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
    expect(result.state.postStates[P('cs_cmd_charleston')]!.postHolder).toBe('anderson_richard_h');
    let next = phase0.pendingRequests(m.world, result.state).find(r => r.menu.menuKind === 'principal' && r.menu.faction === CS)!;
    // Execution is private until the appointment reply returns to the principal.
    expect(next.menu).toMatchObject({ doctrine: { concentrateAt: 'cs_cmd_charleston' } });
    for (let i = 0; i < 20 && !next.view.posts.some(p => p.post === P('cs_cmd_manassas') && p.status === 'held'); i++) {
      result = phase0.tick(m.world, result.state, [], { freeze: true });
      next = phase0.pendingRequests(m.world, result.state).find(r => r.menu.menuKind === 'principal' && r.menu.faction === CS)!;
    }
    expect(next.menu).toMatchObject({ doctrine: { concentrateAt: 'cs_cmd_manassas', concentrateFrom: ['st_va_potomac','st_gov_alabama','st_gov_louisiana','st_gov_mississippi','st_gov_south_carolina','st_gov_virginia'], concentrateLevies: false } });
  });
});
