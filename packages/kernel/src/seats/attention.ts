/**
 * The president's attention (lane 1.5; 0025, 0040; FOUNDATION section 5), owned by `seats`: a weekly budget each
 * principal's seat spends on the verbs that reach into the war, priced by the pack's cost table (`rules.people.attention`)
 * and refilled to its cap every `refillDays`, with no carry-over. Command validation spends it; a command the budget
 * cannot pay for is refused (`no_attention`), and the refusal is logged like any other.
 *
 * Seat initiatives' cooldowns (0040) are `seats` State too: each seat's initiatives, each with the day it last fired.
 */
import { strictCompare } from '../compare.ts';
import type { SeatId } from '../ids.ts';
import type { AttentionKey, AttentionRules } from '../people/verb-rules.ts';
import type { State } from '../root-state.ts';

export interface AttentionState {
  /** Attention left this week. */
  readonly attnLeft: number;
  /** The day of the last refill (0 at setup). */
  readonly attnRefilledDay: number;
}

/** Every principal's seat starts the game with a full budget. */
export function initialAttention(rules: AttentionRules, principalSeats: readonly SeatId[]): Record<SeatId, AttentionState> {
  const out: Record<SeatId, AttentionState> = {};
  for (const seat of [...principalSeats].sort(strictCompare)) out[seat] = { attnLeft: rules.cap, attnRefilledDay: 0 };
  return out;
}

/** What a verb costs, from the pack's table. */
export function attentionCost(rules: AttentionRules, key: AttentionKey): number {
  return rules.costs[key];
}

/** Attention a seat has left; null for a seat with no budget (a commander, a holder: only principals spend attention). */
export function attentionLeft(state: State, seat: SeatId): number | null {
  return state.seatAttention[seat]?.attnLeft ?? null;
}

/** Spend `amount` from a seat's budget; the State unchanged for a seat with no budget or a zero amount. Throws if it cannot pay (check first). */
export function spendAttention(state: State, seat: SeatId, amount: number): State {
  const a = state.seatAttention[seat];
  if (a === undefined || amount === 0) return state;
  if (a.attnLeft < amount) throw new RangeError(`${seat} has ${a.attnLeft} attention, not ${amount}`);
  return { ...state, seatAttention: { ...state.seatAttention, [seat]: { ...a, attnLeft: a.attnLeft - amount } } };
}

/** Refill every budget whose week has run out, to the cap (no carry-over). Returns the seats refilled. */
export function refillAttention(state: State, rules: AttentionRules, day: number): { readonly state: State; readonly refilled: readonly SeatId[] } {
  const due = (Object.keys(state.seatAttention) as SeatId[]).sort(strictCompare).filter((s) => day - state.seatAttention[s]!.attnRefilledDay >= rules.refillDays);
  if (due.length === 0) return { state, refilled: [] };
  const next: Record<SeatId, AttentionState> = { ...state.seatAttention };
  for (const s of due) next[s] = { attnLeft: rules.cap, attnRefilledDay: day };
  return { state: { ...state, seatAttention: next }, refilled: due };
}

/** An initiative fired today: its cooldown starts. */
export function markInitiative(state: State, seat: SeatId, initiative: string, day: number): State {
  return { ...state, seatInitiatives: { ...state.seatInitiatives, [seat]: { ...(state.seatInitiatives[seat] ?? {}), [initiative]: day } } };
}
