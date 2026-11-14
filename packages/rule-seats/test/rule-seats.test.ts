import { readFileSync } from 'node:fs';
import { ids, phase0, type ScenarioData } from '@mandate/kernel';
import type { OptionView, PrincipalMenu, ReportView, SeatRequest, SeatView, StandingMenu } from '@mandate/kernel/seat-api';
import { describe, expect, it } from 'vitest';
import { chooseDelegated, chooseStep, createRuleSeat, principalOrders } from '../src/index.ts';

const post = (s: string) => ids.toId('post', s);
const region = (s: string) => ids.toId('region', s);
const option = (id: string, score: number): OptionView => ({ optionId: id, kind: id === 'hold' ? 'hold' : 'advance', region: id === 'hold' ? null : region(id.slice(8)), score, perceivedEnemy: 0, ownStrength: 1 });
const standing = (options: OptionView[]): StandingMenu => ({ menuKind: 'standing-goal', post: post('p1'), goal: { kind: 'advance', region: region('r9'), issuer: null, viaChain: true, setDay: 1 }, options });
const menu: PrincipalMenu = {
  menuKind: 'principal',
  situations: [],
  faction: ids.toId('faction', 'a'),
  objective: region('r9'),
  commandable: [
    { post: post('far'), holder: ids.toId('person', 'x'), relays: [post('office')], routes: [{ route: 'courier', typicalDays: 6, price: 0 }, { route: 'special-messenger', typicalDays: 3, price: 1 }] },
    { post: post('near'), holder: ids.toId('person', 'y'), relays: [post('office')], routes: [{ route: 'courier', typicalDays: 2, price: 0 }, { route: 'wire', typicalDays: 0, price: 0 }] },
  ],
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

describe('a commander with a standing goal', () => {
  it('takes the option the kernel scored highest, ties to the lower id', () => {
    expect(chooseStep(standing([option('hold', 1250), option('advance:r2', 1400)])).optionId).toBe('advance:r2');
    expect(chooseStep(standing([option('hold', 1250), option('advance:r2', 1250)])).optionId).toBe('advance:r2');
    expect(chooseStep(standing([option('advance:r3', 2000), option('advance:r2', 2000)])).optionId).toBe('advance:r2');
    expect(() => chooseStep(standing([]))).toThrow('offers no option');
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
  it('opens with the army reached soonest, by the quickest free route', () => {
    expect(principalOrders(menu, [], 1)).toEqual([{ cmd: 'order', to: post('near'), goal: 'advance', region: region('r9'), route: 'wire', bypass: false }]);
    expect(principalOrders(menu, [], 2)).toEqual([]);
  });

  it('goes around an office that objected yesterday, by special messenger, once', () => {
    expect(principalOrders(menu, [memo(4, 'far')], 5)).toEqual([{ cmd: 'order', to: post('far'), goal: 'advance', region: region('r5'), route: 'special-messenger', bypass: true }]);
    expect(principalOrders(menu, [memo(4, 'far')], 6)).toEqual([]);
    expect(principalOrders(menu, [memo(4, 'far')], 5, { openingDay: 1, goAroundObjections: false })).toEqual([]);
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
  const data = JSON.parse(readFileSync(new URL('../../../packs/testbed/scenario.json', import.meta.url), 'utf8')) as ScenarioData;
  const world = phase0.indexWorld(phase0.commsWorldFromScenario(data));
  const seat = createRuleSeat();

  it('orders each side’s opening advance, and every command it sends is accepted', () => {
    const rejected: unknown[] = [];
    const { state, log } = phase0.playDays(world, phase0.createState(world, { seed: data.seed }), () => seat, 60, { freeze: true, onDay: (r) => rejected.push(...r.rejections) });
    expect(rejected).toEqual([]);
    const opening = log.filter((e) => e.day === 1 && e.command.cmd === 'order');
    expect(opening.map((e) => e.seat).sort()).toEqual(['seat:n_leader', 'seat:s_leader']);
    // Each side's chosen army now works to the objective, or has reached it.
    const advancing = Object.values(state.standingGoals).filter((g) => g.standingIssuer !== null);
    expect(advancing.length).toBe(2);
  });
});
