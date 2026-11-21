import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const { world, setup } = seatsWorld('union-1861');
const person = (id: string) => ids.toId('person', id);
const post = (id: string) => ids.toId('post', id);
const lincoln = phase0.seatIdFor(person('lincoln_abraham'));
const department = post('us_dept_virginia');
const fort = post('us_fort_monroe');
const request = (state: phase0.State) => phase0.pendingRequests(world, state).find((r) => r.requestSeat === lincoln)!;

describe('R89: Butler’s superior command, with Dimick’s garrison retained', () => {
  it('uses the sourced effective date and an ordinary accepted appointment, with no earlier command', () => {
    const start = phase0.createState(world, setup);
    // Scott's order is 18 May (Butler Correspondence I, pp. 94–95). His 24 May report dates arrival to
    // Wednesday morning (ibid. p. 104; OR I-2 p. 648), 22 May. R89 uses that effective date at daily granularity [I].
    const row = world.map.world.rules.ruleSeats.principals.find((r) => r.faction === 'union')!.appointments?.filter(a => a.post === department);
    expect(row).toEqual([expect.objectContaining({ post: department, person: person('butler_benjamin_f'), onDate: '1861-05-22' })]);
    expect(row![0]!.source).toContain('94-95');
    expect(row![0]!.source).toContain('648');
    const on21May = { ...start, stateDay: 76, situationFlags: { war_begun_union: 41 } };
    const early = request(on21May).menu;
    if (early.menuKind !== 'principal') throw Error('expected principal menu');
    expect(early.historicalAppointments?.some(a => a.post === department)).toBe(false);
    expect(on21May.postStates[department]).toBeUndefined();
    const on22May = { ...on21May, stateDay: 77 };
    const answer = createRuleSeat().respond(request(on22May));
    if (answer.answerKind !== 'commands') throw Error('expected principal commands');
    const appointments = answer.commands.filter((c) => c.cmd === 'appoint' && c.post === department);
    expect(appointments).toEqual([{ cmd: 'appoint', post: department, person: person('butler_benjamin_f'), rank: null, route: 'courier' }]);
    const result = phase0.tick(world, on22May, appointments.map((command) => ({ day: 78, seat: lincoln, command })), { freeze: true });
    expect(result.rejections).toEqual([]);
    expect(result.state.postStates[department]?.postHolder).toBe(person('butler_benjamin_f'));
    expect(result.state.postStates[fort]).toEqual(start.postStates[fort]);
    expect(result.state.postStates[fort]!.postHolder).toBe(person('dimick_justin'));
    const next = request(result.state);
    if (next.menu.menuKind !== 'principal') throw Error('expected principal menu');
    expect(next.menu.historicalAppointments?.some(a => a.post === department)).toBe(false);
  });

  it('offers no automatic appointment to a human or AI principal, and no notice creates the command', () => {
    for (const driver of ['human', 'ai'] as const) {
      const start = phase0.createState(world, { ...setup, drivers: { lincoln_abraham: driver } });
      const due = { ...start, stateDay: 77, situationFlags: { war_begun_union: 41 } };
      expect(request(due).menu).not.toHaveProperty('historicalAppointments');
      const result = phase0.tick(world, due, [], { freeze: true });
      expect(result.state.postStates[department]).toBeUndefined();
      expect(result.state.postStates[fort]!.postHolder).toBe(person('dimick_justin'));
    }
    expect(existsSync(new URL('../situations/butler_at_fort_monroe.json', import.meta.url))).toBe(false);
    expect(world.situations.some((s) => s.id === 'butler_at_fort_monroe')).toBe(false);
    const strings = JSON.parse(readFileSync(new URL('../strings/en.json', import.meta.url), 'utf8'));
    expect(strings['situation.butler_at_fort_monroe.text']).toBeUndefined();
  });
});
