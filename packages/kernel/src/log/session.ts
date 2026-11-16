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
import type { SeatsWorld } from '../seats/world.ts';
import type { Telemetry } from '../telemetry.ts';
import { createDerivedMapCache } from '../control-index/derived.ts';
import { createFreezeLedger, deepFreeze } from '../tick/freeze.ts';
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
  /** Compare the derived map with a fresh derivation every day (tests and determinism runs). */
  readonly deepChecks?: boolean;
  /** Called before each day, with the day about to run (a runner's clock lives outside the kernel). */
  readonly beforeDay?: (day: number) => void;
  /** Called after each day with the tick's result (for reports and decision points). */
  readonly onDay?: (result: TickResult) => void;
  /**
   * The hash cadence (0044: normal play does not hash daily). Omitted, every day is hashed (tests and
   * determinism runs). A whole number `n` hashes only on days divisible by `n` and on the last day: the
   * checkpoints. State itself never depends on this; only the list of `hashes` does.
   */
  readonly hashEvery?: number;
}

/** Whether the day's hash is wanted: always without a cadence, else on a checkpoint or the last day. */
function hashDue(options: PlayOptions, day: number, last: boolean): boolean {
  const every = options.hashEvery;
  if (every === undefined) return true;
  if (!Number.isSafeInteger(every) || every < 1) throw new RangeError(`hashEvery must be a positive whole number, got ${every}`);
  return last || day % every === 0;
}

/** Whoever sits in each seat. Throws for a seat with nobody in it. */
export type SeatTable = (seat: SeatId) => Seat;

/** Turn one seat's answer into log entries. A seat that has nothing to order logs nothing. */
export function answerEntries(request: SeatRequest, seat: Seat): LogEntry[] {
  const answer = seat.respond(request);
  const day = request.requestDay;
  if (answer.answerKind === 'choose') return [{ day, seat: request.requestSeat, command: { cmd: 'choose', request: request.requestKey, option: answer.option } }];
  // Copied field by field, so a seat can smuggle nothing extra into the log.
  return answer.commands.map((c): LogEntry => {
    const seat = request.requestSeat;
    if (c.cmd === 'decide') return { day, seat, command: { cmd: 'decide', situation: c.situation, options: [...c.options] } };
    if (c.cmd === 'delegate') return { day, seat, command: { cmd: 'delegate', situation: c.situation, to: c.to } };
    if (c.cmd === 'go') return { day, seat, command: { cmd: 'go', to: c.to, route: c.route, bypass: c.bypass } };
    if (c.cmd === 'call') return { day, seat, command: { cmd: 'call', to: c.to, regiments: c.regiments, termDays: c.termDays, route: c.route, bypass: c.bypass } };
    if (c.cmd === 'review') {
      const e = c.edit;
      const edit = e === null ? null : { kind: e.kind, axis: e.axis, region: e.region, via: [...e.via], concentration: e.concentration };
      return { day, seat, command: { cmd: 'review', to: c.to, action: c.action, edit, route: c.route, bypass: c.bypass } };
    }
    const g = c.goal;
    const goal = {
      objective: g.objective,
      posture: g.posture,
      risk: g.risk,
      deadlineDays: g.deadlineDays,
      rail: g.rail,
      river: g.river,
      sea: g.sea,
      neutral: g.neutral,
      committed: [...g.committed],
      awaitWord: g.awaitWord,
      approveAsDrafted: g.approveAsDrafted,
    };
    return { day, seat, command: { cmd: 'order', to: c.to, goal, route: c.route, bypass: c.bypass } };
  });
}

/** Play `days` days from `start`, asking seats each morning. Returns the end State, the new log entries and a hash per day. */
export function playDays(
  world: SeatsWorld,
  start: State,
  seats: SeatTable,
  days: number,
  options: PlayOptions = {},
): { readonly state: State; readonly log: LogEntry[]; readonly hashes: DayHash[] } {
  const ledger = createFreezeLedger();
  const mapCache = createDerivedMapCache();
  let state = options.freeze === true ? deepFreeze(start, ledger) : start;
  const log: LogEntry[] = [];
  const hashes: DayHash[] = [];
  const cache = createViewCache();
  for (let i = 0; i < days; i++) {
    options.beforeDay?.(state.stateDay + 1);
    const entries = pendingRequests(world, state, cache).flatMap((r) => answerEntries(r, seats(r.requestSeat)));
    const result = tick(world, state, entries, { mapCache, ...(options.telemetry ? { telemetry: options.telemetry } : {}), ...(options.freeze ? { freeze: true, freezeLedger: ledger } : {}), ...(options.deepChecks ? { deepChecks: true } : {}) });
    options.onDay?.(result);
    state = result.state;
    log.push(...entries);
    if (hashDue(options, state.stateDay, i === days - 1)) hashes.push({ day: state.stateDay, hash: canonicalHash(state) });
  }
  return { state, log, hashes };
}

/**
 * Replay a log from `start` through `throughDay`, hashing every day. Seats are
 * never asked. A malformed log throws `LogError` before any day runs: the log
 * is the truth, so it must be well formed (review F5).
 */
export function replay(
  world: SeatsWorld,
  start: State,
  rawLog: readonly unknown[],
  throughDay: number,
  options: PlayOptions = {},
): { readonly state: State; readonly hashes: DayHash[] } {
  const log = checkedLog(rawLog);
  const ledger = createFreezeLedger();
  const mapCache = createDerivedMapCache();
  let state = options.freeze === true ? deepFreeze(start, ledger) : start;
  const hashes: DayHash[] = [];
  while (state.stateDay < throughDay) {
    options.beforeDay?.(state.stateDay + 1);
    const result = tick(world, state, entriesForDay(log, state.stateDay + 1), { mapCache, ...(options.telemetry ? { telemetry: options.telemetry } : {}), ...(options.freeze ? { freeze: true, freezeLedger: ledger } : {}), ...(options.deepChecks ? { deepChecks: true } : {}) });
    options.onDay?.(result);
    state = result.state;
    if (hashDue(options, state.stateDay, state.stateDay === throughDay)) hashes.push({ day: state.stateDay, hash: canonicalHash(state) });
  }
  return { state, hashes };
}
