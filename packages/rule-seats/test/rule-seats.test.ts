import { readFileSync } from 'node:fs';
import { ids, phase0, world as w } from '@mandate/kernel';
import type { GoalTerms, OptionView, PlanMenu, PrincipalMenu, ReportView, SeatRequest, SeatView } from '@mandate/kernel/seat-api';
import { describe, expect, it } from 'vitest';
import { chooseDelegated, choosePlan, createRuleSeat, principalOrders } from '../src/index.ts';

const post = (s: string) => ids.toId('post', s);
const region = (s: string) => ids.toId('region', s);
const option = (id: string, score: number): OptionView => ({ optionId: id, method: id.split(':')[0]!, variant: 'v', score, terms: [], axes: [], requests: [], conditions: [], perceivedEnemy: 0, ratio: 10000 });
const plans = (options: OptionView[]): PlanMenu => ({
  menuKind: 'plan-selection',
  post: post('p1'),
  goal: {
    posture: 'take',
    objective: region('r9'),
    risk: 500,
    deadlineDays: 20,
    permissions: { rail: true, river: false, sea: false, neutral: false },
    committed: [],
    awaitWord: false,
    approveAsDrafted: true,
    issuer: ids.toId('person', 'lead'),
    viaChain: true,
    setDay: 1,
    status: 'choosing',
  },
  options,
});
const DEFAULTS = { risk: 500, deadlineDays: 20, rail: true, river: false, sea: false, neutral: false, awaitWord: false, approveAsDrafted: true };
const take = (objective: string, neutral = false): GoalTerms => ({ ...DEFAULTS, objective: region(objective), posture: 'take', committed: [], neutral });
const person = (s: string) => ids.toId('person', s);
const COSTS = { order: 1, review_edit: 1, review_approve: 0, review_send_back: 0, go: 0, decide_staff: 0, decide_overrule: 1, delegate: 0, appoint: 1, relieve: 1, transfer: 1, inquire: 0, consult: 1, audience: 1, observer: 1, promise: 1, pressure: 1, address: 1 };
const army = (id: string, days: number, over: Partial<PrincipalMenu['commandable'][number]> = {}): PrincipalMenu['commandable'][number] => ({
  post: post(id),
  holder: person(`${id}_holder`),
  relays: [post('office')],
  routes: [{ route: 'courier', typicalDays: days, price: 0 }, { route: 'special-messenger', typicalDays: 1, price: 1 }],
  men: 1000,
  raising: false,
  inTransit: [],
  ...over,
});
/** A principal at war since day 0, with two armies and an empty doctrine: he orders nothing of his own until a row says so. */
const menu: PrincipalMenu = {
  menuKind: 'principal',
  situations: [],
  faction: ids.toId('faction', 'a'),
  atWarSince: 0,
  doctrine: { crossNeutral: false, concentrateAt: null, calls: [], offensives: [], inquireEveryDays: 7, appointKinds: { land: ['general'], naval: ['naval_officer'] } },
  raising: [],
  vacancies: [],
  candidates: [],
  attention: { left: 12, costs: COSTS, specialMessenger: 1 },
  commandable: [army('far', 6), army('near', 2)],
  reviews: [],
  awaiting: [],
  goalDefaults: DEFAULTS,
};
const doctrine = (over: Partial<PrincipalMenu['doctrine']>): PrincipalMenu => ({ ...menu, doctrine: { ...menu.doctrine, ...over } });
/** Days that are not his doctrine's inquiry days, so tests of the other jobs see only their own commands. */
const quiet = (orders: readonly { cmd: string }[]) => orders.filter((o) => o.cmd !== 'inquire');
const memo = (receivedDay: number, about: string): ReportView => ({
  id: ids.toId('message', `m.${receivedDay}.memo`),
  type: 'advice',
  subtype: 'memorandum',
  author: ids.toId('person', 'sec'),
  authorPost: post('office'),
  subjectKind: 'post',
  subjectId: about,
  claims: [{ kind: 'order-objected', region: region('r5'), value: 1, token: 'goal', confidence: 1000 }],
  day: receivedDay,
  hour: null,
  advice: { recommends: 'withdraw-order', reasons: [{ kind: 'too_rash', weight: 800 }], confidence: 800 },
  answers: ids.toId('message', 'm.1.order'),
  receivedDay,
  route: 'courier',
  via: [],
});

describe('a commander choosing among the planner’s candidates (lane 1.2)', () => {
  it('takes the candidate his scorer ranked highest, ties to the lower id', () => {
    expect(choosePlan(plans([option('holding:hold', 100), option('direct:x', 400)])).optionId).toBe('direct:x');
    expect(choosePlan(plans([option('pincer:x', 250), option('direct:x', 250)])).optionId).toBe('direct:x');
    expect(() => choosePlan(plans([]))).toThrow('offers no candidate');
  });
});

describe('a holder handed a situation (lane 0.7)', () => {
  it('takes the option that honours his values most, ties to the earlier in display order', () => {
    const choice = (scores: number[]) => ({
      menuKind: 'delegated-situation' as const,
      choice: { situation: ids.toId('situation', 's'), delegableTo: [], options: scores.map((score, i) => ({ optionId: `o${i}`, group: null, score })) },
    });
    expect(chooseDelegated(choice([0, 1000, 500]))).toEqual(['o1']);
    expect(chooseDelegated(choice([500, 500]))).toEqual(['o0']);
    expect(chooseDelegated(choice([]))).toEqual([]);
  });
});

describe('a principal doing his historical jobs by his pack doctrine (lane 1.12)', () => {
  it('gives each offensive goal on its day, by the quickest free route, on the pack’s terms and his neutral-ground policy', () => {
    const m = doctrine({ offensives: [{ post: post('far'), objective: region('r9'), day: 30 }] });
    expect(quiet(principalOrders(m, [], 29))).toEqual([]);
    expect(quiet(principalOrders(m, [], 30))).toEqual([{ cmd: 'order', to: post('far'), goal: take('r9'), route: 'courier', bypass: false }]);
    expect(quiet(principalOrders(m, [], 31))).toEqual([]);
    // A side that crosses neutral ground says so in every goal it gives.
    expect(quiet(principalOrders({ ...m, doctrine: { ...m.doctrine, crossNeutral: true } }, [], 30))).toEqual([{ cmd: 'order', to: post('far'), goal: take('r9', true), route: 'courier', bypass: false }]);
    // An offensive dated before the war opens the morning after it.
    const early = doctrine({ offensives: [{ post: post('near'), objective: region('r9'), day: 0 }] });
    expect(quiet(principalOrders({ ...early, atWarSince: 40 }, [], 41))).toHaveLength(1);
  });

  it('never orders an army anywhere the doctrine does not name: the capital’s garrison stays (he holds it)', () => {
    for (const day of [1, 2, 30, 90]) expect(quiet(principalOrders(menu, [], day))).toEqual([]);
  });

  it('keeps the peace until his side is at war (0064, 0066): nothing of his doctrine before the morning after', () => {
    const m = doctrine({ offensives: [{ post: post('near'), objective: region('r9'), day: 0 }], calls: [{ post: post('gov'), regiments: 2, termDays: 90, day: 0 }] });
    const raising = [{ post: post('gov'), holder: person('gov_holder'), routes: [{ route: 'courier' as const, typicalDays: 3, price: 0 }], called: false }];
    expect(principalOrders({ ...m, raising, atWarSince: null }, [], 5)).toEqual([]);
    expect(principalOrders({ ...m, raising, atWarSince: 40 }, [], 40)).toEqual([]);
    expect(quiet(principalOrders({ ...m, raising, atWarSince: 40 }, [], 41)).map((o) => o.cmd)).toEqual(['order', 'call']);
  });

  it('calls on each raising post his doctrine lists, once: never one already called, never one it does not list', () => {
    const raising = (called: boolean) => [
      { post: post('gov'), holder: person('gov_holder'), routes: [{ route: 'courier' as const, typicalDays: 3, price: 0 }], called },
      { post: post('other_gov'), holder: person('o'), routes: [{ route: 'courier' as const, typicalDays: 3, price: 0 }], called: false },
    ];
    const m = doctrine({ calls: [{ post: post('gov'), regiments: 2, termDays: 90, day: 3 }] });
    expect(quiet(principalOrders({ ...m, raising: raising(false) }, [], 3))).toEqual([{ cmd: 'call', to: post('gov'), regiments: 2, termDays: 90, route: 'courier', bypass: false }]);
    // Not before its date; and never twice, whoever made the first call (a situation's option included: one owner per levy).
    expect(quiet(principalOrders({ ...m, raising: raising(false) }, [], 2))).toEqual([]);
    expect(quiet(principalOrders({ ...m, raising: raising(true) }, [], 3))).toEqual([]);
  });

  it('distinguishes sourced repeat calls and permits only explicitly peaceful calls before war', () => {
    const raising = [{ post: post('gov'), holder: person('holder'), routes: [{ route: 'courier' as const, typicalDays: 3, price: 0 }], called: true }];
    const m = doctrine({ calls: [
      { id: 'first', post: post('gov'), regiments: 2, termDays: 365, day: 3, atPeace: true, issued: true },
      { id: 'second', post: post('gov'), regiments: 1, men: 500, termDays: 365, day: 5, atPeace: true, issued: false },
      { id: 'war_only', post: post('gov'), regiments: 3, termDays: 365, day: 5, issued: false },
    ] });
    const peace = { ...m, raising, atWarSince: null };
    expect(quiet(principalOrders(peace, [], 4))).toEqual([]);
    expect(quiet(principalOrders(peace, [], 5))).toEqual([
      { cmd: 'call', to: post('gov'), regiments: 1, men: 500, callId: 'second', termDays: 365, route: 'courier', bypass: false },
    ]);
    const issued = { ...peace, doctrine: { ...peace.doctrine, calls: peace.doctrine.calls.map(c => ({ ...c, issued: true })) } };
    expect(quiet(principalOrders(issued, [], 6))).toEqual([]);
  });

  it('concentrates what a governor raised at his doctrine’s post, once while the transfer is on its way', () => {
    const levy = army('gov', 3, { raising: true, men: 2000 });
    const m = { ...doctrine({ concentrateAt: post('near') }), commandable: [army('near', 2), levy] };
    expect(quiet(principalOrders(m, [], 3))).toEqual([{ cmd: 'transfer', from: post('gov'), to: post('near'), force: 'blocks', amount: 999, route: 'courier' }]);
    expect(quiet(principalOrders({ ...m, commandable: [army('near', 2), { ...levy, inTransit: ['transfer'] }] }, [], 3))).toEqual([]);
    // A governor with nothing raised, or no concentration post, sends nothing.
    expect(quiet(principalOrders({ ...m, commandable: [army('near', 2), { ...levy, men: 0 }] }, [], 3))).toEqual([]);
    expect(quiet(principalOrders({ ...m, doctrine: { ...m.doctrine, concentrateAt: null } }, [], 3))).toEqual([]);
  });

  it('fills a post the battle left vacant with the senior man of the right kind, once while the appointment is on its way', () => {
    const vacancy = (arm: 'land' | 'naval', appointing = false) => ({ post: post('army2'), arm, routes: [{ route: 'courier' as const, typicalDays: 2, price: 0 }], appointing });
    const candidates = [
      { person: person('commodore'), kind: 'naval_officer', seniority: 9 },
      { person: person('colonel'), kind: 'general', seniority: 5 },
      { person: person('lieutenant'), kind: 'general', seniority: 1 },
    ];
    expect(quiet(principalOrders({ ...menu, vacancies: [vacancy('land')], candidates }, [], 3))).toEqual([{ cmd: 'appoint', post: post('army2'), person: person('colonel'), rank: null, route: 'courier' }]);
    expect(quiet(principalOrders({ ...menu, vacancies: [vacancy('naval')], candidates }, [], 3))).toEqual([{ cmd: 'appoint', post: post('army2'), person: person('commodore'), rank: null, route: 'courier' }]);
    expect(quiet(principalOrders({ ...menu, vacancies: [vacancy('land', true)], candidates }, [], 3))).toEqual([]);
    // Two vacancies never take the same man.
    const two = [vacancy('land'), { ...vacancy('land'), post: post('army3') }];
    expect(quiet(principalOrders({ ...menu, vacancies: two, candidates }, [], 3)).map((o) => ('person' in o ? o.person : null))).toEqual([person('colonel'), person('lieutenant')]);
  });

  it('asks each of his armies where it stands on his doctrine’s cadence, no other post, never twice while one is on its way', () => {
    // His armies: the concentration post and each offensive's post. Another field post and a governor are not asked.
    const m = { ...doctrine({ concentrateAt: post('far'), offensives: [{ post: post('near'), objective: region('x'), day: 99 }] }), commandable: [army('far', 6), army('near', 2, { inTransit: ['inquire'] }), army('fort', 4), army('gov', 3, { raising: true, men: 0 })] };
    const asks = (day: number) => principalOrders(m, [], day).filter((o) => o.cmd === 'inquire');
    expect(asks(1)).toEqual([{ cmd: 'inquire', to: post('far'), subject: null, route: 'courier' }]);
    expect(asks(2)).toEqual([]);
    expect(asks(8)).toHaveLength(1);
    // With no army in his doctrine he asks nobody.
    expect(principalOrders({ ...menu, commandable: [army('fort', 4)] }, [], 1)).toEqual([]);
  });

  it('spends no more attention than he has: what he cannot pay today waits', () => {
    const raising = ['g1', 'g2', 'g3'].map((g) => ({ post: post(g), holder: person(g), routes: [{ route: 'courier' as const, typicalDays: 3, price: 0 }], called: false }));
    const m = { ...doctrine({ calls: raising.map((r) => ({ post: r.post, regiments: 1, termDays: 90, day: 0 })) }), raising, attention: { left: 2, costs: COSTS, specialMessenger: 1 } };
    expect(quiet(principalOrders(m, [], 3)).map((o) => ('to' in o ? o.to : null))).toEqual([post('g1'), post('g2')]);
    // Answers that cost nothing still go when he has nothing left.
    const review = { post: post('far'), holder: person('x'), report: 'm.3.plan', plan: option('direct:x', 400) };
    expect(quiet(principalOrders({ ...m, attention: { left: 0, costs: COSTS, specialMessenger: 1 }, reviews: [review] }, [], 3))).toEqual([{ cmd: 'review', to: post('far'), action: 'approve', edit: null, route: 'courier', bypass: false }]);
  });

  it('goes around an office that objected yesterday, by special messenger, to the objective it named, once', () => {
    expect(quiet(principalOrders(menu, [memo(4, 'far')], 5))).toEqual([{ cmd: 'order', to: post('far'), goal: take('r5'), route: 'special-messenger', bypass: true }]);
    expect(quiet(principalOrders(menu, [memo(4, 'far')], 6))).toEqual([]);
    expect(quiet(principalOrders(menu, [memo(4, 'far')], 5, { openingDay: 1, goAroundObjections: false }))).toEqual([]);
  });

  it('uses the wire for a bypass when it beats the messenger, including approvals and the word to go', () => {
    const wired = { ...menu, commandable: menu.commandable.map((c) => ({ ...c, routes: [...c.routes, { route: 'wire' as const, typicalDays: 0, price: 0 }] })) };
    expect(quiet(principalOrders(wired, [memo(4, 'far')], 5))).toEqual([{ cmd: 'order', to: post('far'), goal: take('r5'), route: 'wire', bypass: true }]);
    const review = { post: post('far'), holder: person('x'), report: 'm.3.plan', plan: option('direct:x', 400) };
    expect(quiet(principalOrders({ ...wired, reviews: [review], awaiting: [post('near')] }, [memo(4, 'far'), memo(4, 'near')], 5))).toEqual([
      { cmd: 'review', to: post('far'), action: 'approve', edit: null, route: 'wire', bypass: true },
      { cmd: 'go', to: post('near'), route: 'wire', bypass: true },
    ]);
  });

  it('approves every plan before him as drafted, and gives the word to every operation awaiting it, even at peace', () => {
    const review = { post: post('far'), holder: person('x'), report: 'm.3.plan', plan: option('direct:x', 400) };
    const before = { ...menu, atWarSince: null, reviews: [review], awaiting: [post('near')] };
    expect(principalOrders(before, [], 9)).toEqual([
      { cmd: 'review', to: post('far'), action: 'approve', edit: null, route: 'courier', bypass: false },
      { cmd: 'go', to: post('near'), route: 'courier', bypass: false },
    ]);
  });

  it('goes around an office that withheld his answer to a plan with the same answer, never a fresh goal (lane 1.2)', () => {
    const review = { post: post('far'), holder: person('x'), report: 'm.3.plan', plan: option('direct:x', 400) };
    const withheld = { ...menu, reviews: [review], awaiting: [post('near')] };
    expect(quiet(principalOrders(withheld, [memo(4, 'far'), memo(4, 'near')], 5))).toEqual([
      { cmd: 'review', to: post('far'), action: 'approve', edit: null, route: 'special-messenger', bypass: true },
      { cmd: 'go', to: post('near'), route: 'special-messenger', bypass: true },
    ]);
  });

  it('answers the same request the same way every time (no state, no dice)', () => {
    const seat = createRuleSeat();
    const view = { day: 0, reports: [] } as unknown as SeatView;
    const request: SeatRequest = { requestDay: 1, requestSeat: ids.toId('seat', 'seat:lead'), requestKey: 'principal:a:1', view, menu };
    expect(seat.respond(request)).toEqual(seat.respond(request));
    expect(Object.isFrozen(seat)).toBe(true);
  });
});
describe('rule seats run a whole side (the testbed, every seat on the rules model)', () => {
  // The testbed's generated v2 data (world format v2: lane 0.5 retired the M2 scenario adapter).
  const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../packs/testbed/data/${p}`, import.meta.url), 'utf8')) as unknown;
  const start = read('scenarios/opening.json') as w.ScenarioStart;
  const world = phase0.indexSeatsWorld(w.indexWorld(read('world.json') as w.World), start);
  const seat = createRuleSeat();

  it('orders each side’s opening goal, every command it sends is accepted, and each goal is planned and approved', () => {
    const rejected: unknown[] = [];
    const { state, log } = phase0.playDays(world, phase0.createState(world, { seed: start.seed }), () => seat, 60, { freeze: true, onDay: (r) => rejected.push(...r.rejections) });
    expect(rejected).toEqual([]);
    const opening = log.filter((e) => e.day === 1 && e.command.cmd === 'order');
    expect(opening.map((e) => e.seat).sort()).toEqual(['seat:n_leader', 'seat:s_leader']);
    // Each side's chosen army has a plan drafted by the kernel's planner, chosen by its commander's seat and approved.
    const records = Object.values(state.planRecords);
    expect(records.length).toBe(2);
    for (const r of records) {
      expect(r.planStatus).toBe('approved');
      expect(r.planDraft!.draftCandidates.length).toBeGreaterThan(0);
    }
  });

  it('reappoints a post that lost the holder the scenario gave it, the next morning, and fills no other post', () => {
    const s0 = phase0.createState(world, { seed: start.seed });
    const army = post('n_army_east');
    expect(s0.postStates[army]!.postHolder).not.toBeNull();
    // As the battle model leaves one: its general hit, the post vacant (the kernel test drives the hit itself).
    const vacated = { ...s0, postStates: { ...s0.postStates, [army]: { ...s0.postStates[army]!, postHolder: null } } };
    const { log } = phase0.playDays(world, vacated, () => seat, 2, { freeze: true });
    const appointments = log.filter((e) => e.command.cmd === 'appoint').map((e) => (e.command as { readonly post?: string }).post);
    expect(appointments).toEqual([army]);
    // Positive control: with the post held, nobody is appointed.
    expect(phase0.playDays(world, s0, () => seat, 2, { freeze: true }).log.filter((e) => e.command.cmd === 'appoint')).toEqual([]);
  });
});
