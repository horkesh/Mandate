/**
 * Messages in transit (writer: `messages`; FOUNDATION section 10).
 *
 * An order or a report travels as a message from one person to the next. The
 * kernel computes its arrival day from the route and the map (`latency.ts`).
 * A message is immutable: a relay, a filter or a hold sends a new message, so
 * every hop is visible in the log of State and the hash.
 *
 * Message ids are content keys, not serial numbers: the day sent, the sender,
 * the recipient and what it is. So one extra report never renumbers the
 * others, and the courier stream keyed by a message's id (`latency.ts`) is
 * never shifted by an unrelated message (decision 0041).
 */
import { strictCompare } from '../compare.ts';
import { toId, type MessageId, type PersonId, type PostId } from '../ids.ts';
import type { ReportBody } from '../knowledge/report.ts';
import type { ReportTruth } from '../knowledge/truth.ts';
import type { EditSpec, PlanGoal } from '../plans/goal.ts';
import type { PlanNote } from '../plans/notes.ts';
import type { CounterKind } from '../audience/counters.ts';
import type { State } from '../root-state.ts';
import { rememberSentOrders } from '../knowledge/knowledge.ts';
import { sha256OfText } from '../serialize/sha256.ts';
import type { RouteKind } from './latency.ts';

/** One more person a message must pass after its current recipient. */
export interface Hop {
  readonly hopPerson: PersonId;
  /** The post he receives it in (null: the principal, who holds no post). */
  readonly hopPost: PostId | null;
  /** `relay`: he passes an order down his chain; `filter`: he may hold or cut a wire; `addressee`: it ends with him. */
  readonly hopRole: 'addressee' | 'filter' | 'relay' | 'carrier';
  /** Entrusted carrier's outbound leg. Absent on ordinary chain hops. */
  readonly hopCarriage?: 'courier' | 'ship';
}

/**
 * What an order carries (lane 1.2): a goal for the holder of a post, or the principal's answer to the plan he
 * submitted (approve it, send it back, edit its arrows), or his word to go. Each is a directive the holder receives.
 * Lane 1.4 adds support: a commander's request to another holder to put an axis of his plan in motion (FOUNDATION
 * section 5: a support request is a directive to that holder, who answers with his own compliance). It carries the goal
 * the axis serves.
 */
export const ORDER_KINDS = ['approve', 'call', 'edit', 'go', 'goal', 'send_back', 'support'] as const;
export type OrderKind = (typeof ORDER_KINDS)[number];

/** A call for regiments, as an order carries it (lane 1.7). */
export interface CallSpec {
  readonly callRegiments: number | null;
  readonly callTermDays: number | null;
  readonly callMen?: number | null;
  readonly callId?: string;
  readonly callArm?: string;
  readonly callReadiness?: boolean;
}

export interface OrderBody {
  readonly orderNotes?: readonly PlanNote[];
  readonly orderKind: OrderKind;
  readonly orderIssuer: PersonId;
  readonly orderTarget: PostId;
  /** The goal, for a `goal` order, and the goal an axis serves for a `support` request; null otherwise. */
  readonly orderGoal: PlanGoal | null;
  /** The arrow edit, for an `edit` order; null otherwise. */
  readonly orderEdit: EditSpec | null;
  /** The call, for a `call` order (lane 1.7); null otherwise. */
  readonly orderCall: CallSpec | null;
  /** Whether it was sent around the chain of posts that should relay it (0040). */
  readonly orderBypass: boolean;
  readonly orderIssuedDay: number;
}

/**
 * What a person verb carries (lane 1.5): a letter or telegram from the principal to one person, answered on arrival through
 * his compliance (the pack's order-to-value map). Never relayed: it goes straight to him. Fields a verb does not use are null.
 */
export const VERB_KINDS = ['appoint', 'audience', 'consult', 'inquire', 'observer', 'relieve', 'transfer'] as const;
export type VerbKind = (typeof VERB_KINDS)[number];

/** Value packet for an audience counter: kind, frame, boldness, reinforcement post, men. */
export type AudienceCounterPacket = readonly [CounterKind, string | null, number | null, string | null, number | null];

export interface VerbBody {
  /** The expected host at an observer's destination (distinct from the observer receiving the commission). */
  readonly verbHost?: PersonId;
  /** Counters carried by an audience request; absent on other verbs. */
  readonly verbCounters?: readonly AudienceCounterPacket[];
  readonly verbKind: VerbKind;
  readonly verbIssuer: PersonId;
  /** The post it concerns: the post to fill, to relieve, to send from, to report on, to watch. */
  readonly verbPost: PostId | null;
  /** A second post: a transfer's destination, a relieved man's quiet department, or an appointee's expected old post. */
  readonly verbTo: PostId | null;
  /** A relief's mode; a transfer's force kind (blocks or men). */
  readonly verbMode: string | null;
  readonly verbAmount: number | null;
  /** A rank an appointment confers, from the pack's vocabulary. */
  readonly verbRank: string | null;
  /** The situation a consultation asks about; the region an inquiry asks about. */
  readonly verbSubject: string | null;
  readonly verbIssuedDay: number;
}

export interface TransitMessage {
  readonly id: MessageId;
  /** The first message of this chain of hops: an order's id and a report's id, which every later hop keeps. */
  readonly msgOrigin: MessageId;
  readonly msgFrom: PersonId;
  readonly msgTo: PersonId;
  /** The post the recipient receives it in, if any. */
  readonly msgToPost: PostId | null;
  /** `relay` / `filter` / `addressee`: what the recipient does with it. */
  readonly msgRole: 'addressee' | 'filter' | 'relay' | 'carrier';
  /** The current entrusted carrier's outbound leg and delivery instructions. */
  readonly msgCarriage?: 'courier' | 'ship';
  readonly msgDeliveryTerms?: { readonly deliveryBoldness: number; readonly deliveryHonours: readonly string[]; readonly deliveryOffends: readonly string[] };
  readonly msgRoute: RouteKind;
  readonly msgSentDay: number;
  readonly msgArriveDay: number;
  /** Posts it has already passed (relays, filters), in order. Visible to the recipient. */
  readonly msgVia: readonly PostId[];
  /** Who it still must reach after the recipient. */
  readonly msgPending: readonly Hop[];
  readonly msgOrder: OrderBody | null;
  /** A person verb (lane 1.5); null for an order or a report. */
  readonly msgVerb: VerbBody | null;
  readonly msgReport: ReportBody | null;
  /** The truth behind the report it carries (null for orders). Never shown to a seat. */
  readonly msgTruth: ReportTruth | null;
}

/** Message ids minted during one tick, so two messages with the same content key get distinct ids. */
export type IdMint = Set<string>;

export function createIdMint(state: State): IdMint {
  return new Set(state.messagesInTransit.map((m) => m.id));
}

/**
 * A content-keyed message id: `m.<day>.<from>.<to>.<tag>`, with `.2`, `.3` ...
 * if the same key was already used this day. Long keys are shortened to the
 * day and 64 bits of their SHA-256 (review N3: 32 bits made a same-day
 * collision, and so a minting-order-dependent suffix, merely unlikely).
 */
export function mintMessageId(mint: IdMint, day: number, from: PersonId, to: PersonId, tag: string): MessageId {
  let base = `m.${day}.${from}.${to}.${tag}`;
  if (base.length > 110) base = `m.${day}.${sha256OfText(base).slice(0, 16)}`;
  let id = base;
  for (let n = 2; mint.has(id); n++) id = `${base}.${n}`;
  mint.add(id);
  return toId('message', id);
}

function byArrival(a: TransitMessage, b: TransitMessage): number {
  return a.msgArriveDay - b.msgArriveDay || strictCompare(a.id, b.id);
}

/** Put messages in transit. They join in (arrival day, id) order. */
export function sendMessages(state: State, messages: readonly TransitMessage[]): State {
  if (messages.length === 0) return state;
  for (const m of messages) {
    if (m.msgArriveDay < m.msgSentDay) throw new RangeError(`message ${m.id} arrives before it is sent`);
    if ([m.msgOrder, m.msgVerb, m.msgReport].filter((x) => x !== null).length !== 1) throw new RangeError(`message ${m.id} must carry exactly one of an order, a verb and a report`);
  }
  const remembered = rememberSentOrders(state, messages);
  return { ...remembered, messagesInTransit: [...remembered.messagesInTransit, ...messages].sort(byArrival) };
}

/** Take every message due on or before `day` out of transit, in (arrival day, id) order. */
export function takeDue(state: State, day: number): { readonly state: State; readonly due: readonly TransitMessage[] } {
  const due = state.messagesInTransit.filter((m) => m.msgArriveDay <= day);
  if (due.length === 0) return { state, due };
  return { state: { ...state, messagesInTransit: state.messagesInTransit.filter((m) => m.msgArriveDay > day) }, due };
}
