/**
 * What one day's tick carries between its phases, and the typed records it
 * returns beside the new State: rejections, events with their terms,
 * proposals for owners that do not exist yet, prices and decision points.
 * None of this is State; it is the tick's report (hard rule 6), rebuilt
 * identically on replay.
 */
import type { ControlChange, ControlDelta, ThresholdCrossing } from '../control/control.ts';
import type { FactionId, MessageId, PersonId, PostId, RegionId, SeatId, SituationId } from '../ids.ts';
import type { Cut } from '../supply/supply.ts';
import type { ReportBody } from '../knowledge/report.ts';
import { templateFor } from '../knowledge/templates.ts';
import type { BiasTerm, ReportTruth } from '../knowledge/truth.ts';
import { routeLatency, type RouteKind } from '../messages/latency.ts';
import { mintMessageId, type IdMint, type Hop, type TransitMessage } from '../messages/transit.ts';
import type { State } from '../root-state.ts';
import { recordFire, type Telemetry } from '../telemetry.ts';
import type { IndexedWorld } from '../standin/world.ts';

export type RejectionReason =
  | 'bad_goal'
  | 'bad_selection'
  | 'not_delegable'
  | 'not_the_decider'
  | 'situation_not_open'
  | 'duplicate_choice'
  | 'malformed'
  | 'no_such_request'
  | 'not_a_principal'
  | 'not_an_option'
  | 'not_field_post'
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
  /** A pocket closed (regions newly cut off), relieved (a path reaches them again) or lost (no longer traced: overrun or abandoned). The cut is yesterday's for a lost pocket. */
  | { readonly event: 'pocket_closed' | 'pocket_relieved' | 'pocket_lost'; readonly faction: FactionId; readonly pocket: string; readonly regions: readonly RegionId[]; readonly cut: Cut | null };

export interface TickContext {
  readonly world: IndexedWorld;
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
  readonly mapEvents: MapEvent[];
}

export function fire(ctx: TickContext, mechanic: string, change = 1): void {
  recordFire(ctx.telemetry, mechanic, change);
}

/** Where a person is: his post's headquarters, or his faction's seat region for a principal without a post. */
export function whereIs(ctx: TickContext, state: State, person: PersonId): RegionId {
  const post = ctx.world.postOf(person);
  if (post === null) return ctx.world.faction(ctx.world.person(person).faction).seatRegion;
  const hq = state.headquarters[post.id];
  if (hq === undefined) throw new RangeError(`post ${post.id} has no headquarters`);
  return hq.hqRegion;
}

/** The route a message by `route` really takes (a wire sent off the wire goes by courier). No dice drawn. */
export function takenRoute(ctx: TickContext, route: RouteKind, sender: PersonId, from: RegionId, to: RegionId): RouteKind {
  if (route !== 'wire' || from === to) return route;
  const l = routeLatency(ctx.world, ctx.world.rules.latency, route, from, to, ctx.world.person(sender).faction, null);
  return l.ok && l.latency.parts.some((p) => p.part === 'wire') ? 'wire' : 'courier';
}

/** Arrival of one hop by `route`, sent by `sender`, and the route actually taken (a wire sent off his side's wire goes by courier). */
export function hop(ctx: TickContext, route: RouteKind, sender: PersonId, from: RegionId, to: RegionId, id: MessageId, extraDays = 0): { readonly arrive: number; readonly route: RouteKind } {
  const l = routeLatency(ctx.world, ctx.world.rules.latency, route, from, to, ctx.world.person(sender).faction, { seed: ctx.seed, message: id });
  if (!l.ok) throw new RangeError(`route ${route} is not available from ${from} to ${to}`);
  const weather = l.latency.parts.find((p) => p.part === 'weather');
  if (weather) fire(ctx, 'messages.courier_delay', weather.days);
  return { arrive: ctx.day + l.latency.days + extraDays, route: takenRoute(ctx, route, sender, from, to) };
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
): void {
  const { world } = ctx;
  const from = report.body.reportAuthor;
  const fromRegion = report.fromRegion ?? whereIs(ctx, state, from);
  const route = report.route ?? templateFor(world.rules.templates, report.body.reportType, report.body.reportSubtype).templateRoute;
  const faction = world.faction(world.person(report.to).faction);
  const filter = world.postIds.map((id) => world.post(id)).find((p) => p.faction === faction.id && p.kind === 'filter' && p.holder !== null && p.holder !== from);
  const toPost = world.postOf(report.to)?.id ?? null;
  const addressee: Hop = { hopPerson: report.to, hopPost: toPost, hopRole: 'addressee' };
  // Only a report that really goes by wire meets the filter; one sent off the wire rides past it.
  const throughFilter = filter !== undefined && report.to === faction.principal && takenRoute(ctx, route, from, fromRegion, whereIs(ctx, state, report.to)) === 'wire';
  const first: Hop = throughFilter ? { hopPerson: filter.holder!, hopPost: filter.id, hopRole: 'filter' } : addressee;
  const id = mintMessageId(ctx.mint, ctx.day, from, first.hopPerson, report.tag);
  const leg = hop(ctx, route, from, fromRegion, whereIs(ctx, state, first.hopPerson), id);
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
}
