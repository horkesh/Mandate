/**
 * The day tick for the seats layer (FOUNDATION section 10's fixed day order,
 * the phases lane 0.6 owns, with stand-ins marked):
 *
 *  0. Morning: the standing-goal menus the seats were offered.
 *  1. Apply today's log entries, validated; orders become messages in transit
 *     (the kernel computes their arrival). Rejections are reported.
 *  2. Deliver messages due today: relays, filters, arrivals, knowledge.
 *  3. STAND-IN operations and movement: standing-goal steps.
 *  4. Control changes and the derived map (lane 0.4; only with a map).
 *  5. Reports written on a cycle.
 *  6. Knowledge pruning.
 *  7. The day counter.
 *  8. The invariant barrier (lane 0.4).
 *
 * Lanes 0.5 and 0.7 insert movement, combat and situations between 2 and 4. The tick is a pure function of (World, State, the day's
 * log entries); telemetry is passed in, never held.
 */
import { createDerivedMapCache, type DerivedMap, type DerivedMapCache } from '../control-index/derived.ts';
import type { PostId } from '../ids.ts';
import { pruneKnowledge } from '../knowledge/knowledge.ts';
import { entryProblems, type LogEntry } from '../log/log.ts';
import { createIdMint, sendMessages } from '../messages/transit.ts';
import type { State } from '../root-state.ts';
import type { OptionView } from '../seats/api.ts';
import { standingKey, standingOptions } from '../seats/requests.ts';
import type { IndexedWorld } from '../standin/world.ts';
import type { Telemetry } from '../telemetry.ts';
import { fire, type DecisionPoint, type MapEvent, type Price, type Proposal, type Rejection, type TickContext, type TickEvent } from './context.ts';
import { deliverDue } from './deliver.ts';
import { createFreezeLedger, deepFreeze, type FreezeLedger } from './freeze.ts';
import { generateReports } from './generate.ts';
import { mapBarrier, mapPhase } from './map.ts';
import { issueOrder } from './orders.ts';
import { decideCommand, delegateCommand, runSituations, SITUATION_MECHANICS } from './situations.ts';
import { applyStanding } from './standing.ts';

/** Every mechanic the seats layer counts (FOUNDATION section 11.5). */
export const SEATS_MECHANICS = [
  'commands.rejected',
  'knowledge.pruned_age',
  'knowledge.pruned_superseded',
  'messages.courier_delay',
  'messages.delivered',
  'messages.sent',
  'messages.special_messenger',
  'orders.bypassed',
  'orders.conflict',
  'orders.obeyed',
  'orders.relay_held',
  'orders.relay_objected',
  'orders.relayed',
  'reports.filtered',
  'reports.trimmed',
  'seats.choices',
  'seats.defaulted',
  'standin.advance',
  'standin.goal_reached',
] as const;

/** Every mechanic the tick counts: the seats layer's and the situations phase's. Runners declare these. */
export const TICK_MECHANICS: readonly string[] = Object.freeze([...SEATS_MECHANICS, ...SITUATION_MECHANICS]);

export interface TickOptions {
  readonly telemetry?: Telemetry;
  /** Deep-freeze State after every phase (tests and determinism runs): any in-place write then throws. */
  readonly freeze?: boolean;
  /** Objects already frozen all the way down, kept by the caller across days so unchanged State is not walked again. */
  readonly freezeLedger?: FreezeLedger;
  /** The derived map's cache, kept by the caller across days so it is rebuilt only when something it reads changes. */
  readonly mapCache?: DerivedMapCache;
  /** Also compare the derived map with a fresh derivation at the invariant barrier (tests and determinism runs). */
  readonly deepChecks?: boolean;
}

export interface TickResult {
  readonly state: State;
  readonly day: number;
  readonly rejections: readonly Rejection[];
  readonly events: readonly TickEvent[];
  readonly proposals: readonly Proposal[];
  readonly prices: readonly Price[];
  readonly decisionPoints: readonly DecisionPoint[];
  readonly mapEvents: readonly MapEvent[];
  /** The day's derived map (fronts, pockets, supply), or null without a map. Derived, never saved. */
  readonly map: DerivedMap | null;
}

export function tick(world: IndexedWorld, start: State, entries: readonly LogEntry[], options: TickOptions = {}): TickResult {
  const ledger = options.freezeLedger ?? createFreezeLedger();
  const freeze = options.freeze === true ? <T>(s: T): T => deepFreeze(s, ledger) : <T>(s: T): T => s;
  const day = start.stateDay + 1;
  let state = freeze(start);
  const ctx: TickContext = {
    world,
    day,
    seed: state.gameSeed,
    mint: createIdMint(state),
    telemetry: options.telemetry,
    outbox: [],
    rejections: [],
    events: [],
    proposals: [],
    prices: [],
    decisionPoints: [],
    controlDeltas: [],
    mapEvents: [],
  };

  // 0. The morning's menus, exactly as `pendingRequests` built them for the seats.
  const menus = new Map<PostId, readonly OptionView[]>();
  for (const post of world.postIds) {
    const options = standingOptions(world, state, post, day);
    if (options !== null) menus.set(post, options);
  }

  // 1. Today's commands, in log order.
  const choices = new Map<PostId, string>();
  entries.forEach((entry, index) => {
    const reject = (reason: Rejection['reason']) => {
      ctx.rejections.push({ day, seat: entry.seat, entry: index, reason });
      fire(ctx, 'commands.rejected');
    };
    // A malformed entry (wrong field types, an unknown goal or route) is refused before anything reads it.
    if (entryProblems(entry, index).length > 0) return reject('malformed');
    if (entry.day !== day) return reject('wrong_day');
    if (state.seatAssignments[entry.seat] === undefined) return reject('unknown_seat');
    const c = entry.command;
    if (c.cmd === 'order') {
      const reason = issueOrder(ctx, state, entry.seat, c);
      if (reason !== null) reject(reason);
      return;
    }
    if (c.cmd === 'decide' || c.cmd === 'delegate') {
      const result = c.cmd === 'decide' ? decideCommand(ctx, state, entry.seat, c) : delegateCommand(ctx, state, entry.seat, c);
      state = result.state;
      if (result.reason !== null) reject(result.reason);
      return;
    }
    const post = world.postOf(state.seatAssignments[entry.seat]!.seatPerson)?.id;
    if (post === undefined || c.request !== standingKey(post, day) || !menus.has(post)) return reject('no_such_request');
    if (choices.has(post)) return reject('duplicate_choice');
    if (!menus.get(post)!.some((o) => o.optionId === c.option)) return reject('not_an_option');
    choices.set(post, c.option);
    fire(ctx, 'seats.choices');
  });
  state = freeze(sendMessages(state, ctx.outbox.splice(0)));

  // 2. Deliveries.
  state = freeze(deliverDue(ctx, state));

  // 3. STAND-IN standing goals.
  state = freeze(applyStanding(ctx, state, menus, choices));

  // 4. Control changes and the derived map.
  const mapped = mapPhase(ctx, state, options.mapCache ?? createDerivedMapCache());
  state = freeze(mapped.state);

  // 4b. Situations, after the map so a cause sees today's control: fire on their causes, surface on what the seat
  // knows, stay live, take history defaults (lane 0.7).
  state = freeze(runSituations(ctx, state));

  // 5. Reports on their cycles. A commander whose only option was to hold is awaiting strength.
  const awaiting = new Set([...menus].filter(([, o]) => o.length === 1 && o[0]!.kind === 'hold').map(([p]) => p));
  generateReports(ctx, state, awaiting);
  state = freeze(sendMessages(state, ctx.outbox.splice(0)));

  // 6. Pruning.
  const pruned = pruneKnowledge(state, world.rules.templates, day);
  if (pruned.counts.byAge > 0) fire(ctx, 'knowledge.pruned_age', pruned.counts.byAge);
  if (pruned.counts.bySupersession > 0) fire(ctx, 'knowledge.pruned_superseded', pruned.counts.bySupersession);

  // 7. The day.
  state = freeze(advanceDay(pruned.state, day));

  // 8. The invariant barrier.
  mapBarrier(ctx, state, mapped.derived, options.deepChecks === true);

  return { state, day, rejections: ctx.rejections, events: ctx.events, proposals: ctx.proposals, prices: ctx.prices, decisionPoints: ctx.decisionPoints, mapEvents: ctx.mapEvents, map: mapped.derived };
}

/** The only writer of the day counter. */
function advanceDay(state: State, day: number): State {
  return { ...state, stateDay: day };
}
