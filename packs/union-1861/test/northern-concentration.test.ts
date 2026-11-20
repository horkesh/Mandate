import { describe, expect, it } from 'vitest';
import { ids, phase0, world as w } from '@mandate/kernel';
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
  it('makes Johnston eligible on 15 May after a fixture supplies his missing service change', () => {
    const base=seatsWorld('union-1861');
    // Integration control only: represent the prerequisite supplied by the separate resignation owner.
    const map=w.indexWorld({ ...base.world.map.world, people:base.world.map.world.people.map(p=>p.id==='johnston_joseph_e'?{...p,faction:CS}:p) });
    const world=phase0.indexSeatsWorld(map,{...base.world.start,posts:base.world.start.posts.map(p=>p.id==='us_war_quartermaster_general'?{...p,holder:null}:p)},{situations:base.world.situations});
    const start=phase0.createState(world,base.setup);
    const state={...start,stateDay:70,situationFlags:{...start.situationFlags,war_begun_confederate:38},departmentFactions:{...start.departmentFactions,[VA]:CS}};
    const request=phase0.pendingRequests(world,state).find(r=>r.menu.menuKind==='principal' && r.menu.faction===CS)!;
    expect(request.menu).toMatchObject({doctrine:{appointments:expect.arrayContaining([expect.objectContaining({post:'cs_cmd_harpers_ferry',ready:true})])}});
    const answer=rules.respond(request);
    expect(answer).toMatchObject({answerKind:'commands',commands:expect.arrayContaining([expect.objectContaining({cmd:'appoint',post:'cs_cmd_harpers_ferry',person:'johnston_joseph_e'})])});
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
