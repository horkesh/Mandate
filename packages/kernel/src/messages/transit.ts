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
import type { GoalSpec } from '../plans/goal.ts';
import type { State } from '../root-state.ts';
import { sha256OfText } from '../serialize/sha256.ts';
import type { RouteKind } from './latency.ts';

/** One more person a message must pass after its current recipient. */
export interface Hop {
  readonly hopPerson: PersonId;
  /** The post he receives it in (null: the principal, who holds no post). */
  readonly hopPost: PostId | null;
  /** `relay`: he passes an order down his chain; `filter`: he may hold or cut a wire; `addressee`: it ends with him. */
  readonly hopRole: 'addressee' | 'filter' | 'relay';
}

export interface OrderBody {
  readonly orderIssuer: PersonId;
  readonly orderTarget: PostId;
  readonly orderGoal: GoalSpec;
  /** Whether it was sent around the chain of posts that should relay it (0040). */
  readonly orderBypass: boolean;
  readonly orderIssuedDay: number;
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
  readonly msgRole: 'addressee' | 'filter' | 'relay';
  readonly msgRoute: RouteKind;
  readonly msgSentDay: number;
  readonly msgArriveDay: number;
  /** Posts it has already passed (relays, filters), in order. Visible to the recipient. */
  readonly msgVia: readonly PostId[];
  /** Who it still must reach after the recipient. */
  readonly msgPending: readonly Hop[];
  readonly msgOrder: OrderBody | null;
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
    if ((m.msgOrder === null) === (m.msgReport === null)) throw new RangeError(`message ${m.id} must carry exactly one of an order and a report`);
  }
  return { ...state, messagesInTransit: [...state.messagesInTransit, ...messages].sort(byArrival) };
}

/** Take every message due on or before `day` out of transit, in (arrival day, id) order. */
export function takeDue(state: State, day: number): { readonly state: State; readonly due: readonly TransitMessage[] } {
  const due = state.messagesInTransit.filter((m) => m.msgArriveDay <= day);
  if (due.length === 0) return { state, due };
  return { state: { ...state, messagesInTransit: state.messagesInTransit.filter((m) => m.msgArriveDay > day) }, due };
}
