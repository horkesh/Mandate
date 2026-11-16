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
const take = (objective: string): GoalTerms => ({ ...DEFAULTS, objective: region(objective), posture: 'take', committed: [], neutral: true });
const menu: PrincipalMenu = {
  menuKind: 'principal',
  situations: [],
  faction: ids.toId('faction', 'a'),
  objective: region('r9'),
  atWarSince: 0,
  commandable: [
    { post: post('far'), holder: ids.toId('person', 'x'), relays: [post('office')], routes: [{ route: 'courier', typicalDays: 6, price: 0 }, { route: 'special-messenger', typicalDays: 3, price: 1 }] },
    { post: post('near'), holder: ids.toId('person', 'y'), relays: [post('office')], routes: [{ route: 'courier', typicalDays: 2, price: 0 }, { route: 'wire', typicalDays: 0, price: 0 }] },
  ],
  reviews: [],
  awaiting: [],
  goalDefaults: DEFAULTS,
};
const memo = (receivedDay: number, about: string): ReportView => ({
  id: ids.toId('message', `m.${receivedDay}.memo`),
  type: 'advice',
  subtype: 'memorandum',
  author: ids.toId('person', 'sec'),
  authorPost: post('office'),
  subjectKind: 'post',
  subjectId: about,
  claims: [{ kind: 'order-objected', region: region('r5'), value: 1, token: 'withheld', confidence: 1000 }],
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

describe('a principal', () => {
  it('opens with the army reached soonest, by the quickest free route, with a goal to take the objective on the pack’s terms', () => {
    expect(principalOrders(menu, [], 1)).toEqual([{ cmd: 'order', to: post('near'), goal: take('r9'), route: 'wire', bypass: false }]);
    expect(principalOrders(menu, [], 2)).toEqual([]);
  });

  it('goes around an office that objected yesterday, by special messenger, once', () => {
    expect(principalOrders(menu, [memo(4, 'far')], 5)).toEqual([{ cmd: 'order', to: post('far'), goal: take('r5'), route: 'special-messenger', bypass: true }]);
    expect(principalOrders(menu, [memo(4, 'far')], 6)).toEqual([]);
    expect(principalOrders(menu, [memo(4, 'far')], 5, { openingDay: 1, goAroundObjections: false, crossNeutral: true })).toEqual([]);
  });

  it('approves every plan before him as drafted, and gives the word to every operation awaiting it, even at peace', () => {
    const review = { post: post('far'), holder: ids.toId('person', 'x'), report: 'm.3.plan', plan: option('direct:x', 400) };
    const before = { ...menu, atWarSince: null, reviews: [review], awaiting: [post('near')] };
    expect(principalOrders(before, [], 9)).toEqual([
      { cmd: 'review', to: post('far'), action: 'approve', edit: null, route: 'courier', bypass: false },
      { cmd: 'go', to: post('near'), route: 'wire', bypass: false },
    ]);
  });

  it('keeps the peace until his side is at war: no goal at peace, the opening goal the day it is war (0064)', () => {
    expect(principalOrders({ ...menu, atWarSince: null }, [], 1)).toEqual([]);
    expect(principalOrders({ ...menu, atWarSince: null }, [memo(0, 'far')], 1)).toEqual([]);
    expect(principalOrders({ ...menu, atWarSince: 0 }, [], 1)).toHaveLength(1);
    // The war begins on day 40: he opens on day 41, not before and not again.
    expect(principalOrders({ ...menu, atWarSince: 40 }, [], 40)).toEqual([]);
    expect(principalOrders({ ...menu, atWarSince: 40 }, [], 41)).toHaveLength(1);
    expect(principalOrders({ ...menu, atWarSince: 40 }, [], 42)).toEqual([]);
  });

  it('orders nothing without an objective', () => {
    expect(principalOrders({ ...menu, objective: null }, [], 1)).toEqual([]);
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
});
