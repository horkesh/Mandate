import { expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../../../packages/kernel/src/knowledge/truth.ts';
import { report } from '../../../packages/kernel/test/support/s25-fixture.ts';

const P = (s: string) => ids.toId('post', s);
const { world, setup } = seatsWorld('union-1861');
const rules = createRuleSeat();
const initial = phase0.createState(world, setup);
const request = phase0.pendingRequests(world, initial).find(r => r.menu.menuKind === 'principal')!;
if (request.menu.menuKind !== 'principal') throw Error('principal required');
const menu = request.menu;
const route = [{ route: 'courier' as const, typicalDays: 1, price: 0 }];
const commandable = (post: string, raising: boolean, men: number | null) => ({
  post: P(post), holder: ids.toId('person', 'lincoln_abraham'), relays: [], routes: route, raising, men, inTransit: [],
});

it('keeps independent named transfers when a later concentration becomes available, without sweeping statewide batches', () => {
  const doctrine = { ...menu.doctrine, calls: [], appointments: [], offensives: [], inquireEveryDays: 0,
    concentrateAt: P('cs_cmd_manassas'), concentrateLevies: false,
    concentrationTransfers: [
      { from: P('st_va_harpers_ferry'), to: P('cs_cmd_harpers_ferry') },
      { from: P('st_va_potomac'), to: P('cs_cmd_manassas') },
    ],
  };
  const answer = rules.respond({ ...request, requestDay: 140, menu: { ...menu, atWarSince: 0, doctrine, situations: [], reviews: [], awaiting: [],
    vacancies: [], historicalAppointments: [], commandable: [
      commandable('st_va_harpers_ferry', false, null), commandable('st_va_potomac', false, 0),
      commandable('st_gov_new_york', true, 38000), commandable('cs_cmd_charleston', false, 3000),
    ] } });
  expect(answer).toMatchObject({ answerKind: 'commands', commands: [
    { cmd: 'transfer', from: 'st_va_harpers_ferry', to: 'cs_cmd_harpers_ferry', force: 'blocks', amount: 999 },
    { cmd: 'transfer', from: 'st_va_potomac', to: 'cs_cmd_manassas', force: 'blocks', amount: 999 },
  ] });
});

it('does not send a second transfer while the named dispatch is in transit', () => {
  const doctrine = { ...menu.doctrine, calls: [], appointments: [], offensives: [], inquireEveryDays: 0,
    concentrateAt: P('cs_cmd_manassas'), concentrateLevies: false,
    concentrationTransfers: [{ from: P('st_va_potomac'), to: P('cs_cmd_manassas') }],
  };
  const answer = rules.respond({ ...request, requestDay: 140, menu: { ...menu, atWarSince: 0, doctrine, situations: [], reviews: [], awaiting: [],
    vacancies: [], historicalAppointments: [], commandable: [{ ...commandable('st_va_potomac', false, null), inTransit: ['transfer'] }] } });
  expect(answer).toMatchObject({ answerKind: 'commands', commands: [] });
});

it('S77 requests actual raised lots from sourced states while keeping unallocated levies and harbour garrisons separate', () => {
  const rows = world.map.world.rules.ruleSeats.principals.flatMap(r => r.concentrations ?? []);
  expect(rows.every(r => 'receiveLevies' in r && r.receiveLevies === false)).toBe(true);
  expect(rows.flatMap(r => r.fromPosts)).not.toContain('cs_cmd_charleston');
  expect(rows.flatMap(r => r.fromPosts)).not.toContain('us_dc_militia');
  expect(rows.find(r => r.post === 'cs_cmd_harpers_ferry')?.fromPosts).toEqual(['st_va_harpers_ferry','st_gov_alabama','st_gov_georgia','st_gov_mississippi','st_gov_virginia']);
  expect(rows.find(r => r.post === 'cs_cmd_manassas')?.fromPosts).toEqual(['st_va_potomac','st_gov_alabama','st_gov_louisiana','st_gov_mississippi','st_gov_south_carolina','st_gov_virginia']);
});

it('projects both independent inclusions from received command papers without waiting for hidden execution', () => {
  const seat = phase0.seatIdFor(ids.toId('person', 'davis_jefferson'));
  let state = { ...initial, stateDay: 140 };
  const paper = (id: string, post: string, author: string, subject = post) => report(id, {
    reportAuthor: ids.toId('person', author), reportAuthorPost: P(post), reportSubjectKind: subject === 'virginia_military_convention' ? 'situation' : 'post',
    reportSubjectId: subject, reportDay: 100,
  }, 101);
  state = deliverReport(state, seat, paper('s64.convention', 'cs_secretary_war', 'walker_leroy_p', 'virginia_military_convention'), NO_TRUTH);
  state = deliverReport(state, seat, paper('s64.johnston', 'cs_cmd_harpers_ferry', 'johnston_joseph_e'), NO_TRUTH);
  state = deliverReport(state, seat, paper('s64.beauregard', 'cs_cmd_manassas', 'beauregard_pierre_g_t'), NO_TRUTH);
  const projected = (s: typeof state) => {
    const m = phase0.pendingRequests(world, s).find(r => r.requestSeat === seat)!.menu;
    if (m.menuKind !== 'principal') throw Error('principal required');
    return m.doctrine;
  };
  expect(projected(state)).toMatchObject({ concentrateAt: 'cs_cmd_manassas', concentrateLevies: false,
    concentrationTransfers: [
      { from: 'st_gov_alabama', to: 'cs_cmd_manassas' },
      { from: 'st_gov_georgia', to: 'cs_cmd_harpers_ferry' },
      { from: 'st_gov_louisiana', to: 'cs_cmd_manassas' },
      { from: 'st_gov_mississippi', to: 'cs_cmd_manassas' },
      { from: 'st_gov_north_carolina', to: 'cs_cmd_manassas' },
      { from: 'st_gov_south_carolina', to: 'cs_cmd_manassas' },
      { from: 'st_gov_virginia', to: 'cs_cmd_manassas' },
      { from: 'st_va_harpers_ferry', to: 'cs_cmd_harpers_ferry' },
      { from: 'st_va_potomac', to: 'cs_cmd_manassas' },
    ],
  });
  expect(projected({ ...state, postStates: { ...state.postStates, [P('cs_cmd_manassas')]: {
    ...state.postStates[P('cs_cmd_charleston')]!, postHolder: null,
  } } }).concentrationTransfers).toEqual(projected(state).concentrationTransfers);
  expect(projected(state).namedConcentrationDonors).toEqual(['st_gov_tennessee']);
  expect(projected(initial).concentrationTransfers).toBeUndefined();
});
