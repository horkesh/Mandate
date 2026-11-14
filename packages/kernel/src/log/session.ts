/**
 * Playing days with seats, and replaying them from the log (decision 0015).
 *
 * `playDays` is the loop a shell runs: build the morning's requests, ask each
 * seat, append the answers to the log, tick, hash. `replay` runs the same
 * tick over a log and never asks a seat, so a game replays exactly whatever
 * drove its seats (rules, a model, a human). Both hash every day.
 *
 * Seats are passed in; the kernel never constructs one (rule seats live in
 * their own package, FOUNDATION section 8).
 */
import type { SeatId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { Seat, SeatRequest } from '../seats/api.ts';
import { pendingRequests } from '../seats/requests.ts';
import { canonicalHash } from '../serialize/hash.ts';
import type { IndexedWorld } from '../standin/world.ts';
import type { Telemetry } from '../telemetry.ts';
import { deepFreeze } from '../tick/freeze.ts';
import { tick, type TickResult } from '../tick/tick.ts';
import { createViewCache } from '../view/view.ts';
import { checkedLog, entriesForDay, type LogEntry } from './log.ts';

export interface DayHash {
  readonly day: number;
  readonly hash: string;
}

export interface PlayOptions {
  readonly telemetry?: Telemetry;
  readonly freeze?: boolean;
  /** Called after each day with the tick's result (for reports and decision points). */
  readonly onDay?: (result: TickResult) => void;
}

/** Whoever sits in each seat. Throws for a seat with nobody in it. */
export type SeatTable = (seat: SeatId) => Seat;

/** Turn one seat's answer into log entries. A seat that has nothing to order logs nothing. */
export function answerEntries(request: SeatRequest, seat: Seat): LogEntry[] {
  const answer = seat.respond(request);
  const day = request.requestDay;
  if (answer.answerKind === 'choose') return [{ day, seat: request.requestSeat, command: { cmd: 'choose', request: request.requestKey, option: answer.option } }];
  return answer.commands.map((c) => ({
    day,
    seat: request.requestSeat,
    command: { cmd: 'order', to: c.to, goal: c.goal, region: c.region, route: c.route, bypass: c.bypass },
  }));
}

/** Play `days` days from `start`, asking seats each morning. Returns the end State, the new log entries and a hash per day. */
export function playDays(
  world: IndexedWorld,
  start: State,
  seats: SeatTable,
  days: number,
  options: PlayOptions = {},
): { readonly state: State; readonly log: LogEntry[]; readonly hashes: DayHash[] } {
  let state = options.freeze === true ? deepFreeze(start) : start;
  const log: LogEntry[] = [];
  const hashes: DayHash[] = [];
  const cache = createViewCache();
  for (let i = 0; i < days; i++) {
    const entries = pendingRequests(world, state, cache).flatMap((r) => answerEntries(r, seats(r.requestSeat)));
    const result = tick(world, state, entries, { ...(options.telemetry ? { telemetry: options.telemetry } : {}), ...(options.freeze ? { freeze: true } : {}) });
    options.onDay?.(result);
    state = result.state;
    log.push(...entries);
    hashes.push({ day: state.stateDay, hash: canonicalHash(state) });
  }
  return { state, log, hashes };
}

/**
 * Replay a log from `start` through `throughDay`, hashing every day. Seats are
 * never asked. A malformed log throws `LogError` before any day runs: the log
 * is the truth, so it must be well formed (review F5).
 */
export function replay(
  world: IndexedWorld,
  start: State,
  rawLog: readonly unknown[],
  throughDay: number,
  options: PlayOptions = {},
): { readonly state: State; readonly hashes: DayHash[] } {
  const log = checkedLog(rawLog);
  let state = options.freeze === true ? deepFreeze(start) : start;
  const hashes: DayHash[] = [];
  while (state.stateDay < throughDay) {
    const result = tick(world, state, entriesForDay(log, state.stateDay + 1), { ...(options.telemetry ? { telemetry: options.telemetry } : {}), ...(options.freeze ? { freeze: true } : {}) });
    options.onDay?.(result);
    state = result.state;
    hashes.push({ day: state.stateDay, hash: canonicalHash(state) });
  }
  return { state, hashes };
}
