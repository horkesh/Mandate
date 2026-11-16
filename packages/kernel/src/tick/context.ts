/**
 * What one day's tick carries between its phases, and the typed records it
 * returns beside the new State: rejections, events with their terms,
 * proposals for owners that do not exist yet, prices and decision points.
 * None of this is State; it is the tick's report (hard rule 6), rebuilt
 * identically on replay.
 */
import type { ControlChange, ControlDelta, ThresholdCrossing } from '../control/control.ts';
import type { ContestRecord, Retreat } from '../combat/contest.ts';
import type { StoresCrossing } from '../forces/stores.ts';
import type { InfrastructureChange, InfrastructureDelta } from '../infrastructure/infrastructure.ts';
import type { FactionId, MessageId, PersonId, PostId, RegionId, SeatId, SituationId } from '../ids.ts';
import type { Cut } from '../supply/supply.ts';
import type { ReportBody } from '../knowledge/report.ts';
import { templateFor } from '../knowledge/templates.ts';
import type { BiasTerm, ReportTruth } from '../knowledge/truth.ts';
import { routeLatency, type LatencyMap, type RouteKind } from '../messages/latency.ts';
import { mintMessageId, type IdMint, type Hop, type TransitMessage } from '../messages/transit.ts';
import type { State } from '../root-state.ts';
import { recordFire, type Telemetry } from '../telemetry.ts';
import { heldPost, sideOfPerson, type SideChange } from '../command/command.ts';
import { filterPostOf, whereIsPerson } from '../seats/posts.ts';
import type { SeatsWorld } from '../seats/world.ts';

export type RejectionReason =
  | 'bad_goal'
  | 'bad_review'
  | 'bad_selection'
  | 'no_plan'
  | 'not_delegable'
  | 'not_the_decider'
  | 'situation_not_open'
  | 'duplicate_choice'
  | 'malformed'
  | 'no_such_request'
  | 'not_a_principal'
  | 'not_an_option'
  | 'not_field_post'
  | 'not_raising_post'
  | 'bad_call'
  | 'other_side'
  | 'route_unavailable'
  | 'unknown_post'
  | 'unknown_seat'
  | 'vacant_post'
  | 'wrong_day';

export interface Rejection {
  readonly day: number;
  readonly seat: SeatId;
  /** Index of the command among the day's log entries; -1 for an order a situation option issued. */
  readonly entry: number;
  readonly reason: RejectionReason;
}

/** Something a mechanism decided, with its terms: the explanation trail (hard rule 6). */
export interface TickEvent {
  readonly event: 'conflict' | 'filtered' | 'objected' | 'relayed' | 'seat_defaulted';
  readonly person: PersonId;
  readonly post: PostId | null;
  /** The order or report it concerns (null for a defaulted seat choice). */
  readonly message: MessageId | null;
  readonly terms: readonly BiasTerm[];
}

/** A typed delta for an owner that Phase 0 does not build yet (the people core, politics, regions). Counted, not applied. */
export type Proposal =
  | { readonly proposal: 'grievance'; readonly person: PersonId; readonly cause: 'bypassed'; readonly order: MessageId }
  | {
      readonly proposal: 'effect';
      readonly owner: string;
      readonly field: string;
      readonly subject: string | null;
      readonly delta: number;
      readonly reason: string;
      readonly side: FactionId | null;
      /** The situation, and the option (null: its inaction or a notice), it comes from. */
      readonly situation: SituationId;
      readonly option: string | null;
      /** A notice's effects, or a decision's option, inaction or locked cost (0069: a self-governing government is moved only by a notice). */
      readonly origin: 'notice' | 'decision';
    };

export interface Price {
  readonly seat: SeatId;
  readonly attention: number;
  readonly why: 'special-messenger';
}

/** Something the shell may end a turn on (FOUNDATION section 9). */
export interface DecisionPoint {
  readonly point: 'objection' | 'objective-reached' | 'order-conflict' | 'situation-lapsed' | 'situation-options' | 'situation-resurfaced' | 'situation-surfaced';
  readonly seat: SeatId;
  /** The report it rests on, if any. */
  readonly report: MessageId | null;
  /** The situation it concerns, if any. */
  readonly situation: SituationId | null;
}

/** What the map phases changed or found (lane 0.4). Truth, for the run report and tests; the player learns of it only through reports. */
export type MapEvent =
  | { readonly event: 'control_changed'; readonly change: ControlChange }
  | { readonly event: 'threshold_crossed'; readonly crossing: ThresholdCrossing }
  /** The network's condition changed (lane 0.5): an edge or depot damaged or repaired, an edge obstructed or cleared. */
  | { readonly event: 'network_changed'; readonly change: InfrastructureChange }
  /** A block's stores crossed the low threshold (lane 0.5). The decision point is the garrison's report of it, not this. */
  | { readonly event: 'stores_crossed'; readonly crossing: StoresCrossing }
  /** A contest or occupation in a region today, with each side's men (lane 0.5). */
  | { readonly event: 'contest'; readonly record: ContestRecord }
  /** A side falling back from a contested region, or unable to (lane 0.5). */
  | { readonly event: 'retreat'; readonly retreat: Retreat }
  /** A neutral government closed or reopened its territory (0055, 0058), by a situation's proposal. */
  | { readonly event: 'government_changed'; readonly department: string; readonly change: 'closed' | 'reopened' | 'unchanged' }
  /** A government joined a side (0065), by a situation's proposal, with what that cut loose. Never a closing. */
  | { readonly event: 'side_changed'; readonly change: SideChange }
  /** A proposal its owner refused, with the reason (a situation naming what cannot be). */
  | { readonly event: 'proposal_refused'; readonly owner: string; readonly reason: string; readonly why: string }
  /** A pocket closed (regions newly cut off), relieved (a path reaches them again) or lost (no longer traced: overrun or abandoned). The cut is yesterday's for a lost pocket. */
  | { readonly event: 'pocket_closed' | 'pocket_relieved' | 'pocket_lost'; readonly faction: FactionId; readonly pocket: string; readonly regions: readonly RegionId[]; readonly cut: Cut | null };

export interface TickContext {
  readonly world: SeatsWorld;
  /** Latency on the morning's map: courier days from the edges, the wire of whoever holds each region (0052). */
  readonly latency: LatencyMap;
  readonly day: number;
  readonly seed: number;
  readonly mint: IdMint;
  readonly telemetry: Telemetry | undefined;
  readonly outbox: TransitMessage[];
  readonly rejections: Rejection[];
  readonly events: TickEvent[];
  readonly proposals: Proposal[];
  readonly prices: Price[];
  readonly decisionPoints: DecisionPoint[];
  /** Control changes proposed today, for `control` to apply (combat, occupation: lane 0.5). */
  readonly controlDeltas: ControlDelta[];
  /** Network changes proposed today, for `infrastructure` to apply (combat, raids, repair, operations, situations: lane 0.5). */
  readonly infrastructureDeltas: InfrastructureDelta[];
  readonly mapEvents: MapEvent[];
}

export function fire(ctx: TickContext, mechanic: string, change = 1): void {
  recordFire(ctx.telemetry, mechanic, change);
}

/** Where a person is: his post's headquarters, or his faction's seat region for a principal without a post. */
export function whereIs(ctx: TickContext, state: State, person: PersonId): RegionId {
  return whereIsPerson(ctx.world, state, person);
}

/** A person's side today (0065: his post's while he holds one); every man who sends or receives in the seats layer has one. */
export function sideOf(ctx: TickContext, state: State, person: PersonId): FactionId {
  const f = sideOfPerson(ctx.world.map, state, person);
  if (f === null) throw new RangeError(`${person} has no side`);
  return f;
}

/** The route a message by `route` really takes (a wire sent off the wire goes by courier). No dice drawn. */
export function takenRoute(ctx: TickContext, state: State, route: RouteKind, sender: PersonId, from: RegionId, to: RegionId): RouteKind {
  if (route !== 'wire' || from === to) return route;
  const l = routeLatency(ctx.latency, ctx.world.rules.latency, route, from, to, sideOf(ctx, state, sender), null);
  return l.ok && l.latency.parts.some((p) => p.part === 'wire') ? 'wire' : 'courier';
}

/** Arrival of one hop by `route`, sent by `sender`, and the route actually taken (a wire sent off his side's wire goes by courier). */
export function hop(ctx: TickContext, state: State, route: RouteKind, sender: PersonId, from: RegionId, to: RegionId, id: MessageId, extraDays = 0): { readonly arrive: number; readonly route: RouteKind } {
  const l = routeLatency(ctx.latency, ctx.world.rules.latency, route, from, to, sideOf(ctx, state, sender), { seed: ctx.seed, message: id });
  if (!l.ok) throw new RangeError(`route ${route} is not available from ${from} to ${to}`);
  const weather = l.latency.parts.find((p) => p.part === 'weather');
  if (weather) fire(ctx, 'messages.courier_delay', weather.days);
  return { arrive: ctx.day + l.latency.days + extraDays, route: takenRoute(ctx, state, route, sender, from, to) };
}

/**
 * Write a report and put it on its way: its route from the template, off the
 * wire by courier, and through the faction's filter post when it is a wire
 * bound for the principal and the filter post is held (decision 0032).
 */
export function sendReport(
  ctx: TickContext,
  state: State,
  report: {
    readonly body: ReportBody;
    readonly truth: ReportTruth;
    readonly to: PersonId;
    readonly tag: string;
    readonly route?: RouteKind;
    /** Where it is written, if not where its author is posted (an intelligence chief writes at the headquarters he serves). */
    readonly fromRegion?: RegionId;
  },
): MessageId {
  const { world } = ctx;
  const from = report.body.reportAuthor;
  const fromRegion = report.fromRegion ?? whereIs(ctx, state, from);
  const route = report.route ?? templateFor(world.rules.templates, report.body.reportType, report.body.reportSubtype).templateRoute;
  const faction = world.faction(sideOf(ctx, state, report.to));
  const filterId = filterPostOf(world, state, faction.id);
  const filterHolder = filterId === null ? null : state.postStates[filterId]!.postHolder;
  const filter = filterId !== null && filterHolder !== null && filterHolder !== from ? { id: filterId, holder: filterHolder } : undefined;
  const toPost = heldPost(state, report.to);
  const addressee: Hop = { hopPerson: report.to, hopPost: toPost, hopRole: 'addressee' };
  // Only a report that really goes by wire meets the filter; one sent off the wire rides past it.
  const throughFilter = filter !== undefined && report.to === faction.principal && takenRoute(ctx, state, route, from, fromRegion, whereIs(ctx, state, report.to)) === 'wire';
  const first: Hop = throughFilter ? { hopPerson: filter.holder, hopPost: filter.id, hopRole: 'filter' } : addressee;
  const id = mintMessageId(ctx.mint, ctx.day, from, first.hopPerson, report.tag);
  const leg = hop(ctx, state, route, from, fromRegion, whereIs(ctx, state, first.hopPerson), id);
  ctx.outbox.push({
    id,
    msgOrigin: id,
    msgFrom: from,
    msgTo: first.hopPerson,
    msgToPost: first.hopPost,
    msgRole: first.hopRole,
    msgRoute: throughFilter ? 'wire' : leg.route,
    msgSentDay: ctx.day,
    msgArriveDay: leg.arrive,
    msgVia: [],
    msgPending: throughFilter ? [addressee] : [],
    msgOrder: null,
    msgReport: report.body,
    msgTruth: report.truth,
  });
  fire(ctx, 'messages.sent');
  return id;
}
