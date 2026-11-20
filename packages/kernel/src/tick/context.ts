/**
 * What one day's tick carries between its phases, and the typed records it
 * returns beside the new State: rejections, events with their terms,
 * proposals for owners that do not exist yet, prices and decision points.
 * None of this is State; it is the tick's report (hard rule 6), rebuilt
 * identically on replay.
 */
import type { BattleOrders } from '../combat/order-kinds.ts';
import type { ControlChange, ControlDelta, ThresholdCrossing } from '../control/control.ts';
import type { FoughtDay, OccupationRecord, RetreatRecord } from '../combat/battle.ts';
import type { StoresCrossing } from '../forces/stores.ts';
import type { InfrastructureChange, InfrastructureDelta } from '../infrastructure/infrastructure.ts';
import type { FactionId, ForceBlockId, MessageId, PersonId, PostId, RegionId, SeatId, SituationId } from '../ids.ts';
import type { Cut } from '../supply/supply.ts';
import type { ReportBody } from '../knowledge/report.ts';
import { templateFor } from '../knowledge/templates.ts';
import type { BiasTerm, ReportTruth } from '../knowledge/truth.ts';
import { routeLatency, type LatencyMap, type RouteKind } from '../messages/latency.ts';
import { mintMessageId, type IdMint, type Hop, type TransitMessage } from '../messages/transit.ts';
import type { State } from '../root-state.ts';
import type { StateForces } from '../situations/types.ts';
import { recordFire, type Telemetry } from '../telemetry.ts';
import { heldPost, sideOfPerson, type SideChange } from '../command/command.ts';
import { filterPostOf, whereIsPerson } from '../seats/posts.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { TurnStopPoint } from '../seats/turn-stops.ts';

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
  // Lane 1.12 (hard rule 1, 0016): a battle order from a seat the player drives. The player never moves a division.
  | 'player_seat'
  | 'route_unavailable'
  | 'unknown_post'
  | 'unknown_seat'
  | 'vacant_post'
  | 'wrong_day'
  // Lane 1.5: the people verbs and attention.
  | 'already_promised'
  | 'bad_counters'
  | 'no_attention'
  | 'person_holds_post'
  | 'post_held'
  | 'too_soon'
  | 'unknown_bloc'
  | 'unknown_person'
  | 'unknown_rank'
  | 'unknown_region';

export interface Rejection {
  readonly day: number;
  readonly seat: SeatId;
  /** Index of the command among the day's log entries; -1 for an order a situation option issued. */
  readonly entry: number;
  readonly reason: RejectionReason;
}

/** Something a mechanism decided, with its terms: the explanation trail (hard rule 6). */
export interface TickEvent {
  readonly event: 'service_choice' | 'audience' | 'conflict' | 'filtered' | 'initiative' | 'objected' | 'policy' | 'policy_unpaid' | 'relayed' | 'seat_defaulted';
  readonly person: PersonId;
  readonly post: PostId | null;
  /** The order or report it concerns (null for a defaulted seat choice). */
  readonly message: MessageId | null;
  readonly terms: readonly BiasTerm[];
}

/** A typed delta for an owner that Phase 0 does not build yet (the people core, politics, regions). Counted, not applied. */
export type Proposal =
  /** Lane 1.5: the principal addressed a bloc; blocs are `politics`' (lane 1.6), which applies nothing until it exists. */
  | { readonly proposal: 'address'; readonly bloc: string; readonly by: PersonId; readonly side: FactionId | null }
  | { readonly proposal: 'grievance'; readonly person: PersonId; readonly cause: 'bypassed'; readonly order: MessageId }
  /** Lane 1.11: a situation's landing, for `forces`' detachment path (lane 1.4b), applied in phase 4c beside `command`'s proposals. */
  | { readonly proposal: 'landing'; readonly parent: ForceBlockId; readonly men: number; readonly region: RegionId; readonly situation: SituationId; readonly option: string | null }
  | {
      readonly proposal: 'effect';
      readonly owner: string;
      readonly field: string;
      readonly subject: string | null;
      readonly delta: number;
      readonly reason: string;
      readonly side: FactionId | null;
      readonly succession?: { readonly from: PersonId; readonly to: PersonId };
      readonly stateForces?: StateForces;
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
  readonly point: TurnStopPoint;
  readonly seat: SeatId;
  /** The report it rests on, if any. */
  readonly report: MessageId | null;
  /** The situation it concerns, if any. */
  readonly situation: SituationId | null;
}

/** What the map phases changed or found (lane 0.4). Truth, for the run report and tests; the player learns of it only through reports. */
export type MapEvent =
  | { readonly event: 'capital_moved'; readonly faction: FactionId; readonly region: RegionId }
  | { readonly event: 'post_succeeded'; readonly post: PostId; readonly from: PersonId; readonly to: PersonId; readonly reason: 'institutional-succession'; readonly cause: string | null }
  | { readonly event: 'control_changed'; readonly change: ControlChange }
  | { readonly event: 'threshold_crossed'; readonly crossing: ThresholdCrossing }
  /** The network's condition changed (lane 0.5): an edge or depot damaged or repaired, an edge obstructed or cleared. */
  | { readonly event: 'network_changed'; readonly change: InfrastructureChange }
  /** A block's stores crossed the low threshold (lane 0.5). The decision point is the garrison's report of it, not this. */
  | { readonly event: 'stores_crossed'; readonly crossing: StoresCrossing }
  /** A side alone occupying ground it marched into, with its men (0064). */
  | { readonly event: 'occupation'; readonly record: OccupationRecord }
  /** A battle-day fought in a region today, with its whole record (lane 1.3). */
  | { readonly event: 'battle'; readonly fought: FoughtDay }
  /** A battle closed with no fighting today: nobody attacked, a side was gone, or its days ran out. */
  | { readonly event: 'battle_closed'; readonly battle: string; readonly lastDay: number }
  /** A side leaving a battle tonight for its retreat region (lane 1.3; 0019). */
  | { readonly event: 'retreat'; readonly retreat: RetreatRecord }
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
  /** Commanders' battle orders for today, by post (lane 1.12): given in phase 1, read by the battle model. Absent: none. */
  readonly battleOrders?: Map<PostId, BattleOrders>;
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

/**
 * The side a message travels on: its sender's, or, for a sender on no side (a neutral government's officer answering a
 * requisition, lane 1.11), its recipient's, since he sends it toward that side's lines.
 */
function travelSide(ctx: TickContext, state: State, sender: PersonId, recipient: PersonId | null): FactionId {
  const own = sideOfPerson(ctx.world.map, state, sender);
  if (own !== null || recipient === null) return own ?? sideOf(ctx, state, sender);
  return sideOf(ctx, state, recipient);
}

/** One typed term of a man's oversight (hard rule 6): the pack's base, his distance, the wire, and the clamp. */
export interface OversightTerm {
  readonly ovKind: 'base' | 'distance' | 'wire' | 'floor' | 'ceiling';
  readonly ovValue: number;
}

/**
 * How closely the issuer watches `person` (lane 1.4, replacing lane 1.1's constant), with its terms, which sum to it: the
 * pack's base, less `oversightPerCourierDay` for each courier day between them (`distance`), plus `oversightWired` when
 * a message between them goes by telegraph, quicker than a courier (`wire`), clamped to `oversightMin`..1000 (`floor`, `ceiling`). A man the
 * issuer cannot reach by courier is watched at the floor. Pure: no dice, the morning's latency. Lane 1.5's observer adds
 * its own term on top, at its own call site.
 */
export function oversightOf(ctx: TickContext, state: State, person: PersonId, issuer: PersonId): { readonly value: number; readonly terms: readonly OversightTerm[] } {
  const rules = ctx.world.rules.people.context;
  const base: OversightTerm = { ovKind: 'base', ovValue: rules.oversight };
  const side = sideOfPerson(ctx.world.map, state, issuer);
  if (side === null || person === issuer) return { value: rules.oversight, terms: [base] };
  const from = whereIs(ctx, state, person);
  const to = whereIs(ctx, state, issuer);
  const courier = routeLatency(ctx.latency, ctx.world.rules.latency, 'courier', from, to, side, null);
  if (!courier.ok) return { value: rules.oversightMin, terms: [base, { ovKind: 'floor', ovValue: rules.oversightMin - rules.oversight }] };
  // On the wire: a message between them goes by telegraph, quicker than a courier (the wire route, 0026).
  const wire = routeLatency(ctx.latency, ctx.world.rules.latency, 'wire', from, to, side, null);
  const wired = wire.ok && wire.latency.parts.some((p) => p.part === 'wire');
  const terms: OversightTerm[] = [base, { ovKind: 'distance', ovValue: -courier.latency.days * rules.oversightPerCourierDay }];
  if (wired) terms.push({ ovKind: 'wire', ovValue: rules.oversightWired });
  const raw = terms.reduce((a, x) => a + x.ovValue, 0);
  const value = Math.max(rules.oversightMin, Math.min(1000, raw));
  if (value > raw) terms.push({ ovKind: 'floor', ovValue: value - raw });
  if (value < raw) terms.push({ ovKind: 'ceiling', ovValue: value - raw });
  return { value, terms };
}

/** The route a message by `route` really takes (a wire sent off the wire goes by courier). No dice drawn. */
export function takenRoute(ctx: TickContext, state: State, route: RouteKind, sender: PersonId, from: RegionId, to: RegionId, recipient: PersonId | null = null): RouteKind {
  if (route !== 'wire' || from === to) return route;
  const l = routeLatency(ctx.latency, ctx.world.rules.latency, route, from, to, travelSide(ctx, state, sender, recipient), null);
  return l.ok && l.latency.parts.some((p) => p.part === 'wire') ? 'wire' : 'courier';
}

/** Arrival of one hop by `route`, sent by `sender`, and the route actually taken (a wire sent off his side's wire goes by courier). */
export function hop(ctx: TickContext, state: State, route: RouteKind, sender: PersonId, from: RegionId, to: RegionId, id: MessageId, extraDays = 0, recipient: PersonId | null = null): { readonly arrive: number; readonly route: RouteKind } {
  const l = routeLatency(ctx.latency, ctx.world.rules.latency, route, from, to, travelSide(ctx, state, sender, recipient), { seed: ctx.seed, message: id });
  if (!l.ok) throw new RangeError(`route ${route} is not available from ${from} to ${to}`);
  const weather = l.latency.parts.find((p) => p.part === 'weather');
  // Lane 1.6: the mail (the press's front pages) is counted apart, so the courier count keeps watching orders and reports.
  if (weather) fire(ctx, route === 'mail' ? 'messages.mail_delay' : 'messages.courier_delay', weather.days);
  return { arrive: ctx.day + l.latency.days + extraDays, route: takenRoute(ctx, state, route, sender, from, to, recipient) };
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
  const throughFilter = filter !== undefined && report.to === faction.principal && takenRoute(ctx, state, route, from, fromRegion, whereIs(ctx, state, report.to), report.to) === 'wire';
  const first: Hop = throughFilter ? { hopPerson: filter.holder, hopPost: filter.id, hopRole: 'filter' } : addressee;
  const id = mintMessageId(ctx.mint, ctx.day, from, first.hopPerson, report.tag);
  const leg = hop(ctx, state, route, from, fromRegion, whereIs(ctx, state, first.hopPerson), id, 0, report.to);
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
    msgVerb: null,
    msgReport: report.body,
    msgTruth: report.truth,
  });
  fire(ctx, 'messages.sent');
  return id;
}
