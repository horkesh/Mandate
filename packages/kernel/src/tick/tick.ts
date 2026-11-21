/**
 * The day tick (FOUNDATION section 10's fixed day order, as built in Phase 0):
 *
 *  0. Morning: the map and latency the seats were asked from, and the
 *     plan menus they were offered.
 *  1. Apply today's log entries, validated; orders, reviews and the word to go
 *     become messages in transit (the kernel computes their arrival). Rejections are reported.
 *  1b. Commanders' picks among the planner's candidates (lane 1.2).
 *  2. Deliver messages due today: relays, filters, arrivals, knowledge.
 *  2b. People apply what was proposed to them today: a bypassed relay's grievance (lane 1.1).
 *  2c. Plans: edits answered, goals drafted within the daily cap (lane 1.2).
 *  2d. Recruitment: levies muster into new blocks; enlistments that end disband (lane 1.7).
 *  3. Operations: approved plans executed axis by axis, support requests sent; then every march a day further (lane 1.4).
 *  3b. Combat: battles and occupation; losses, retreats, generals hit, control deltas (lane 1.3).
 *  4. Control and network changes, and the derived map (lane 0.4).
 *  4a. Stragglers rejoin, and stores on hand fall or refill, from today's supply trace (lanes 0.5, 1.3).
 *  4a'. Regions: the derived self-emancipation term proposes arrivals at the lines (lane 1.7).
 *  4b. Situations fire, surface, stay live, take history defaults (lane 0.7).
 *  4c. Proposals `command` owns: a neutral government closing or reopening (0058),
 *      or a government joining a side (0065). A post that joins a side this way has
 *      no goal until one is ordered: it holds where it stands (0072's hold goal retired, lane 1.2).
 *  4d. The weekly people step (lane 1.5).
 *  4e. Politics (lane 1.6): addresses and effects, drift and the ladder's pull, the press, the chambers and the ledger.
 *  5. Reports written on a cycle.
 *  6. Knowledge pruning.
 *  7. The day counter.
 *  8. The invariant barrier (lane 0.4).
 *
 * The tick is a pure function of (World, State, the day's log entries);
 * telemetry is passed in, never held.
 */
import type { BattleOrders } from '../combat/order-kinds.ts';
import { createDerivedMapCache, type DerivedMap, type DerivedMapCache } from '../control-index/derived.ts';
import type { PostId } from '../ids.ts';
import { pruneKnowledge } from '../knowledge/knowledge.ts';
import { entryProblems, type LogEntry } from '../log/log.ts';
import { createIdMint, sendMessages } from '../messages/transit.ts';
import type { State } from '../root-state.ts';
import type { OptionView } from '../seats/api.ts';
import { applyPeopleChanges, type PeopleChange } from '../people/people.ts';
import { morningGround } from '../seats/requests.ts';
import { createHeldPostCache, heldPost, sideOfPerson } from '../command/command.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { Telemetry } from '../telemetry.ts';
import { createViewCache, type ViewCache } from '../view/view.ts';
import { applyPlanChoices, choosingPosts, planKey, planOptions, plansPhase, PLANS_MECHANICS } from './plans.ts';
import { fire, type DecisionPoint, type MapEvent, type Price, type Proposal, type Rejection, type TickContext, type TickEvent } from './context.ts';
import { deliverBattleDispatches, deliverDue, deliverSituationOrders } from './deliver.ts';
import { createFreezeLedger, deepFreeze, type FreezeLedger } from './freeze.ts';
import { generateReports } from './generate.ts';
import { battleReports, BATTLE_REPORT_MECHANICS } from './battle-reports.ts';
import { commanderLossReports } from './commander-losses.ts';
import { combatPhase, commandProposalsPhase, storesPhase } from './forces.ts';
import { stateForcesPhase, renewalPhase } from './recruitment.ts';
import { mapBarrier, mapPhase } from './map.ts';
import { issueOrder } from './orders.ts';
import { decideCommand, delegateCommand, runSituations, SITUATION_MECHANICS } from './situations.ts';
import { operationsPhase, OPERATIONS_MECHANICS } from './operations.ts';
import { pruneOperations } from '../operations/operations.ts';
import { pruneBattles } from '../combat/records.ts';
import { pruneResponses } from '../proxy/responses.ts';
import { applyVerb, observerLetters, VERB_MECHANICS } from './verbs.ts';
import { isPeopleWeek, peopleWeek, serviceChoices, WEEK_MECHANICS } from './people-week.ts';
import { attentionLeft, refillAttention, spendAttention } from '../seats/attention.ts';
import { attentionPrice } from './attention.ts';
import { issueCall, recruitmentPhase, RECRUITMENT_MECHANICS } from './recruitment.ts';
import { regionsPhase, REGIONS_MECHANICS } from './regions.ts';
import { politicsPhase, POLITICS_MECHANICS } from './politics.ts';

/** Every mechanic the seats layer counts (FOUNDATION section 11.5). */
export const SEATS_MECHANICS = [
  'commands.rejected',
  'knowledge.pruned_age',
  'knowledge.pruned_superseded',
  'messages.courier_delay',
  'messages.mail_delay',
  'messages.delivered',
  'messages.sent',
  'messages.special_messenger',
  'orders.responses_pruned',
  'orders.bypassed',
  'orders.conflict',
  'orders.obeyed',
  'orders.relay_held',
  'orders.relay_objected',
  'orders.relayed',
  'orders.returned',
  'reports.filtered',
  'reports.trimmed',
  'seats.choices',
  'seats.battle_orders',
  'seats.defaulted',
  // Lane 1.5: attention, the people verbs, the weekly people step.
  'seats.attention_refilled',
  'seats.attention_refused',
  'seats.attention_spent',
  ...VERB_MECHANICS,
  ...WEEK_MECHANICS,
  ...OPERATIONS_MECHANICS,
  ...BATTLE_REPORT_MECHANICS,
  ...PLANS_MECHANICS,
  ...RECRUITMENT_MECHANICS,
  ...REGIONS_MECHANICS,
  ...POLITICS_MECHANICS,
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
  /** A view cache kept by the caller across days, for the plans phase's views of the commanders it drafts for. */
  readonly viewCache?: ViewCache;
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

export function tick(world: SeatsWorld, start: State, entries: readonly LogEntry[], options: TickOptions = {}): TickResult {
  const ledger = options.freezeLedger ?? createFreezeLedger();
  const freeze = options.freeze === true ? <T>(s: T): T => deepFreeze(s, ledger) : <T>(s: T): T => s;
  const day = start.stateDay + 1;
  let state = freeze(start);
  // The morning's ground: the map and latency the seats were asked from (0052: menus first, from the morning's State).
  const ground = morningGround(world, state, day);
  // Commanders' battle orders for today (lane 1.12): read by the battle model, never kept in State.
  const battleOrders = new Map<PostId, BattleOrders>();
  const ctx: TickContext = {
    world,
    postHolders: createHeldPostCache(),
    latency: ground.latency,
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
    infrastructureDeltas: [],
    mapEvents: [],
    battleOrders,
  };

  // Observe each phase's holder/status transitions, rather than only the day's opening holders. This also catches
  // a commander appointed in deliveries and lost in operations or combat that same day, and later capture routes.
  const applyPhase = (next: State): State => {
    if (next.postStates !== state.postStates || next.personStatus !== state.personStatus) commanderLossReports(ctx, state, next);
    return freeze(next);
  };

  // 0. The morning's plan menus, exactly as `pendingRequests` built them for the seats.
  const menus = new Map<PostId, readonly OptionView[]>();
  for (const post of choosingPosts(state, day)) {
    const options = planOptions(state, post, day);
    if (options !== null && options.length > 1) menus.set(post, options);
  }

  // 0b. Attention refills weekly to its cap, with no carry-over (lane 1.5; 0025, 0040).
  const refill = refillAttention(state, world.rules.people.attention, day);
  state = applyPhase(refill.state);
  if (refill.refilled.length > 0) fire(ctx, 'seats.attention_refilled', refill.refilled.length);

  // 1. Today's commands, in log order. A principal's command is priced from the pack's table and refused if his week's
  // attention cannot pay for it (lane 1.5).
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
    const cost = attentionPrice(world, state, c);
    const left = attentionLeft(state, entry.seat);
    if (cost > 0 && left !== null && left < cost) {
      fire(ctx, 'seats.attention_refused');
      return reject('no_attention');
    }
    const pay = () => {
      if (cost > 0 && left !== null) {
        state = spendAttention(state, entry.seat, cost);
        fire(ctx, 'seats.attention_spent', cost);
      }
    };
    if (c.cmd === 'call') {
      const reason = issueCall(ctx, state, entry.seat, c);
      if (reason !== null) reject(reason);
      else pay();
      return;
    }
    if (c.cmd === 'order' || c.cmd === 'review' || c.cmd === 'go') {
      const reason = issueOrder(ctx, state, entry.seat, c);
      if (reason !== null) reject(reason);
      else pay();
      return;
    }
    if (c.cmd === 'appoint' || c.cmd === 'relieve' || c.cmd === 'transfer' || c.cmd === 'inquire' || c.cmd === 'consult' || c.cmd === 'audience' || c.cmd === 'observer' || c.cmd === 'promise' || c.cmd === 'pressure' || c.cmd === 'address') {
      const result = applyVerb(ctx, state, entry.seat, c);
      state = applyPhase(result.state);
      if (result.reason !== null) reject(result.reason);
      else pay();
      return;
    }
    if (c.cmd === 'decide' || c.cmd === 'delegate') {
      const result = c.cmd === 'decide' ? decideCommand(ctx, state, entry.seat, c) : delegateCommand(ctx, state, entry.seat, c);
      state = applyPhase(result.state);
      if (result.reason !== null) reject(result.reason);
      else pay();
      return;
    }
    if (c.cmd === 'battle') {
      // A commander's battle orders (lane 1.12): only the holder of the post sends them, once a day; the battle reads them.
      // Never from a seat the player drives (hard rule 1, 0016): the player is the principal and moves no division, even
      // if a setting ever lets him sit in a commander's seat. A player seat is one whose driver is `human`.
      if (state.seatAssignments[entry.seat]!.seatDriver === 'human') return reject('player_seat');
      if (heldPost(state, state.seatAssignments[entry.seat]!.seatPerson) !== c.post) return reject('not_the_decider');
      if (battleOrders.has(c.post)) return reject('duplicate_choice');
      battleOrders.set(c.post, { commit: c.commit, night: c.night, cutOff: c.cutOff, pursue: c.pursue });
      fire(ctx, 'seats.battle_orders');
      return;
    }
    const post = heldPost(state, state.seatAssignments[entry.seat]!.seatPerson);
    if (post === null || c.request !== planKey(post, day) || !menus.has(post)) return reject('no_such_request');
    if (choices.has(post)) return reject('duplicate_choice');
    if (!menus.get(post)!.some((o) => o.optionId === c.option)) return reject('not_an_option');
    choices.set(post, c.option);
    fire(ctx, 'seats.choices');
  });

  // 1b. Commanders' picks among their candidates: each goes ahead or is submitted for review (lane 1.2).
  state = applyPhase(applyPlanChoices(ctx, state, menus, choices));
  state = applyPhase(sendMessages(state, ctx.outbox.splice(0)));

  // 2. Deliveries.
  state = applyPhase(deliverDue(ctx, state));

  // 2b. People apply the changes proposed to them so far today (lane 1.1): a bypassed relay holds a grievance.
  state = applyPhase(applyPeopleChanges(state, peopleChangesFrom(world, state, ctx.proposals), day, world.rules.people, world.map.world.vocabularies.ranks));

  // 2c. Plans: edits that arrived are answered, then goals awaiting a plan are drafted within the daily cap (lane 1.2).
  state = applyPhase(plansPhase(ctx, state, options.viewCache ?? createViewCache()));
  state = applyPhase(sendMessages(state, ctx.outbox.splice(0)));

  // 2d. Recruitment (lane 1.7): levies due muster into new blocks, enlistments that end disband; one proposal per block.
  state = applyPhase(recruitmentPhase(ctx, state));

  // 3. Operations: approved plans executed axis by axis (lane 1.4), then every march a day further.
  state = applyPhase(operationsPhase(ctx, state));

  // 3b. Combat (lane 1.3; only with a map): battles and occupation. Each owner applies its proposals now; control deltas wait for 4.
  const fought = combatPhase(ctx, state);
  state = applyPhase(fought.state);

  // 4. Control changes and the derived map.
  const mapped = mapPhase(ctx, state, options.mapCache ?? createDerivedMapCache());
  state = applyPhase(mapped.state);

  // 4a. Stragglers rejoin, then stores on hand fall or refill, from today's supply trace (lanes 0.5, 1.3; only with a map).
  state = applyPhase(storesPhase(ctx, state, mapped.derived, new Set(fought.result?.inBattle ?? [])));

  // 4a'. Regions (lane 1.7): the derived self-emancipation term, on its cadence, proposes who reached the lines.
  state = applyPhase(regionsPhase(ctx, state));

  // 4a''. Settle battle-phase wires written during operations. Travel and filtering still use the delivery owner;
  // surrender reports retain their normal dispatch phase. Situations can now read news actually received today.
  state = applyPhase(deliverBattleDispatches(ctx, state));

  // 4b. Situations, after the map so a cause sees today's control: fire on their causes, surface on what the seat
  // knows, stay live, take history defaults (lane 0.7).
  const situationOutboxStart = ctx.outbox.length;
  state = applyPhase(runSituations(ctx, state));
  // An option can issue a zero-day dispatch after phase 2. Settle its due hops today too: the wire's
  // stated latency must not acquire an implicit overnight wait merely from the phase that sent it.
  state = applyPhase(deliverSituationOrders(ctx, state, situationOutboxStart));

  // 4c. The proposals `command` owns: a neutral government closing or reopening (0055, 0058).
  const proposed = commandProposalsPhase(ctx, state);
  state = applyPhase(proposed.state);
  state = applyPhase(stateForcesPhase(ctx, state));
  state = applyPhase(renewalPhase(ctx, state));
  const dayMap = proposed.derived ?? mapped.derived;

  // 4d. The weekly people step (lane 1.5): grievances fade, promises due break, the ladder and rivals, seat initiatives.
  state = freeze(serviceChoices(ctx, state));
  state = freeze(sendMessages(state, ctx.outbox.splice(0)));
  if (isPeopleWeek(ctx)) {
    state = applyPhase(peopleWeek(ctx, state));
    state = applyPhase(sendMessages(state, ctx.outbox.splice(0)));
  }

  // 4e. Politics (lane 1.6): today's addresses and effects, the week's drift and the ladder's pull, the press's front
  // pages, then the chambers by the calendar and the ledger they meet.
  state = applyPhase(politicsPhase(ctx, state));
  state = applyPhase(sendMessages(state, ctx.outbox.splice(0)));

  // 5. Reports on their cycles.
  battleReports(ctx, state, start.regionControl);
  generateReports(ctx, state);
  // Observer letters on their cadence (lane 1.5).
  state = applyPhase(observerLetters(ctx, state));
  state = applyPhase(sendMessages(state, ctx.outbox.splice(0)));

  // 6. Pruning.
  const pruned = pruneKnowledge(state, world.rules.templates, day, world.map.world.rules.supplyControlPermille);
  if (pruned.counts.byAge > 0) fire(ctx, 'knowledge.pruned_age', pruned.counts.byAge);
  if (pruned.counts.bySupersession > 0) fire(ctx, 'knowledge.pruned_superseded', pruned.counts.bySupersession);
  // Lane 1.4: ended operations, closed battles and answered orders are kept the pack's days, as knowledge is.
  const keep = world.map.world.rules.pruning;
  let kept = pruneOperations(pruned.state, day, keep.operationDays);
  const battles = pruneBattles(kept, day, keep.battleDays);
  if (battles.pruned > 0) fire(ctx, 'combat.records_pruned', battles.pruned);
  const responses = pruneResponses(battles.state, day, keep.responseDays);
  if (responses.pruned > 0) fire(ctx, 'orders.responses_pruned', responses.pruned);
  kept = responses.state;

  // 7. The day.
  state = applyPhase(advanceDay(kept, day));

  // 8. The invariant barrier.
  mapBarrier(ctx, state, dayMap, options.deepChecks === true);

  return { state, day, rejections: ctx.rejections, events: ctx.events, proposals: ctx.proposals, prices: ctx.prices, decisionPoints: ctx.decisionPoints, mapEvents: ctx.mapEvents, map: dayMap };
}

/**
 * The people changes in today's proposals: a bypassed relay's grievance, of the pack's weight, against the order's issuer
 * (0040). Proposals for owners not built yet (`effect`) are left for them.
 */
function peopleChangesFrom(world: SeatsWorld, state: State, proposals: readonly Proposal[]): PeopleChange[] {
  const out: PeopleChange[] = [];
  for (const p of proposals) {
    if (p.proposal !== 'grievance') continue;
    // Only a principal issues orders (review F3), so the man who went around him is his side's principal.
    const side = sideOfPerson(world.map, state, p.person);
    const issuer = side !== null && world.factionIds.includes(side) ? world.faction(side).principal : null;
    out.push({ change: 'grievance', person: p.person, kind: p.cause, weight: world.rules.people.grievances.bypassedWeight, against: issuer, cause: p.order });
  }
  return out;
}

/** The only writer of the day counter. */
function advanceDay(state: State, day: number): State {
  return { ...state, stateDay: day };
}
