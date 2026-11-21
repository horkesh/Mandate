import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const { world, setup } = seatsWorld('union-1861');
const person = (id: string) => ids.toId('person', id);
const post = (id: string) => ids.toId('post', id);
const lincoln = phase0.seatIdFor(person('lincoln_abraham'));
function at(day: number, driver: 'rules' | 'human' | 'ai' = 'rules') {
  const start = phase0.createState(world, { ...setup, drivers: { lincoln_abraham: driver } });
  const state = { ...start, stateDay: day - 1, situationFlags: { war_begun_union: 41 } };
  const request = phase0.pendingRequests(world, state).find(r => r.requestSeat === lincoln)!;
  return { state, request };
}

describe('S1 dated Union department appointments', () => {
  it.each([
    ['patterson_robert', 'us_dept_pennsylvania', '1861-04-27', 53, 'philadelphia'],
    ['mcdowell_irvin', 'us_dept_northeastern_virginia', '1861-05-28', 84, 'northern_virginia'],
  ] as const)('offers %s on the sourced effective date, then opens the declared command through an appointment', (who, where, date, day, region) => {
    const row = world.map.world.rules.ruleSeats.principals.find(r => r.faction === 'union')!.appointments!.find(a => a.post === where);
    expect(row).toMatchObject({ person: person(who), onDate: date });
    const { state, request } = at(day);
    expect(state.postStates[post(where)]).toBeUndefined();
    expect(request.menu).toHaveProperty('historicalAppointments', expect.arrayContaining([expect.objectContaining({ person: person(who), post: post(where) })]));
    const answer = createRuleSeat().respond(request);
    if (answer.answerKind !== 'commands') throw Error('expected commands');
    const command = answer.commands.find(c => c.cmd === 'appoint' && c.person === who)!;
    expect(command).toMatchObject({ cmd: 'appoint', post: post(where), person: person(who) });
    const result = phase0.tick(world, state, [{ day, seat: lincoln, command }], { freeze: true });
    expect(result.rejections).toEqual([]);
    expect(result.state.postStates[post(where)]).toMatchObject({ postHolder: person(who), postSeat: ids.toId('region', region) });
    expect(Object.keys(result.state.forceBlockStates)).toEqual(Object.keys(state.forceBlockStates));
  });

  it('reserves future appointees from generic vacancies without appointing them before their date', () => {
    const { request } = at(43);
    if (request.menu.menuKind !== 'principal') throw Error('expected principal menu');
    expect(request.menu).toHaveProperty('historicalAppointees', expect.arrayContaining([person('patterson_robert'), person('mcdowell_irvin')]));
    // Deliberately offer a vacancy and exactly one eligible man. This fixture tests selection;
    // it does not claim this department was vacant on that historical morning.
    const candidate = request.menu.candidates.find(c => c.person === person('patterson_robert'))!;
    expect(candidate).toBeDefined();
    const menu = { ...request.menu, raising: [], commandable: [], historicalAppointments: [], situations: [], reviews: [], awaiting: [],
      doctrine: { ...request.menu.doctrine, calls: [], offensives: [], appointments: [], concentrateAt: null },
      candidates: [candidate], vacancies: [{ post: post('us_dept_pacific'), arm: 'land' as const, appointing: false, routes: [{ route: 'courier' as const, typicalDays: 0, price: 0 }] }],
    };
    const appointments = (reserved: readonly ReturnType<typeof person>[]) => {
      const answer = createRuleSeat().respond({ ...request, menu: { ...menu, historicalAppointees: reserved } });
      if (answer.answerKind !== 'commands') throw Error('expected commands');
      return answer.commands.filter(c => c.cmd === 'appoint' && c.person === candidate.person);
    };
    expect(appointments([candidate.person])).toEqual([]);
    expect(appointments([])).toEqual([expect.objectContaining({ cmd: 'appoint', person: candidate.person, post: post('us_dept_pacific') })]);
  });

  it.each(['human', 'ai'] as const)('gives %s no future historical reservation or automatic appointment offer', driver => {
    const { request } = at(53, driver);
    expect(request.menu).not.toHaveProperty('historicalAppointments');
    expect(request.menu).not.toHaveProperty('historicalAppointees');
  });
});
