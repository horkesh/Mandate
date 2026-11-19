/**
 * The vocabulary of a commander's battle orders (lane 1.12), kept import-light: the command a seat sends names these,
 * and the view layer reaches commands, so nothing here may reach State (`test/boundary.test.ts`). The mechanics that
 * apply an order are `combat/orders.ts`.
 */
import { COMMITS, type Commit } from './rules.ts';

/** The morning after the other side withdrew or routed: none, follow or press (P6.3). */
export const PURSUITS = ['none', 'follow', 'press'] as const;
export type Pursuit = (typeof PURSUITS)[number];

/** Night (P6.2): stay or withdraw. */
export const NIGHT_CHOICES = ['stay', 'withdraw'] as const;
export type NightChoice = (typeof NIGHT_CHOICES)[number];

/** With no legal retreat (P8): break out or surrender. */
export const CUT_OFF_CHOICES = ['break_out', 'surrender'] as const;
export type CutOffChoice = (typeof CUT_OFF_CHOICES)[number];

/** "Leave it to him": the trait rule decides at that point. */
export const JUDGE = 'judge';
export type Judge = typeof JUDGE;

export interface BattleOrders {
  readonly commit: Commit | Judge;
  readonly night: NightChoice | Judge;
  readonly cutOff: CutOffChoice | Judge;
  readonly pursue: Pursuit | Judge;
}

/** No orders: every point to his judgement. */
export const ALL_JUDGE: BattleOrders = Object.freeze({ commit: JUDGE, night: JUDGE, cutOff: JUDGE, pursue: JUDGE });

/** The legal answers at each point, `judge` first. */
export const BATTLE_ORDER_OPTIONS = {
  commit: [JUDGE, ...COMMITS],
  night: [JUDGE, ...NIGHT_CHOICES],
  cutOff: [JUDGE, ...CUT_OFF_CHOICES],
  pursue: [JUDGE, ...PURSUITS],
} as const;

/** What is wrong with a set of orders: each field must be a legal answer at its point. */
export function battleOrdersProblems(o: { readonly [K in keyof BattleOrders]: unknown }): string[] {
  const problems: string[] = [];
  for (const key of ['commit', 'night', 'cutOff', 'pursue'] as const) {
    if (!(BATTLE_ORDER_OPTIONS[key] as readonly unknown[]).includes(o[key])) problems.push(`battle.${key} must be one of ${BATTLE_ORDER_OPTIONS[key].join(', ')}`);
  }
  return problems;
}
