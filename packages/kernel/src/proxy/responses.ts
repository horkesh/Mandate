/**
 * Responses to orders as State, owned by `proxy` (FOUNDATION section 10: "responses to orders (declared and actual
 * rungs, reasons) | proxy | message arrival; computed by `compliance` and `reading`, which are pure and write nothing").
 *
 * Each response is a man's answer to one order as it reached him: as a relaying link (0040) or as its addressee. It
 * keeps both rungs, the willingness with its terms, the true reasons and the reasons he stated, and the conditions his
 * action waits on. `plans` holds only a reference (the key) to a response to a goal, a plan or an edit (0073).
 *
 * The truth here (actual rung, true reasons) is never shown to a principal: the view layer reads only what the man's
 * report said (`knowledge`), as with the truth behind reports (0052).
 */
import type { ComplianceRung, ContributionTerm, DirectiveResponse, Reason, ResponseCondition } from '../directive.ts';
import type { MessageId, PersonId, PostId } from '../ids.ts';
import type { State } from '../root-state.ts';

/** One term of his willingness (hard rule 6), named apart from compliance's own record so the State's keys stay unique. */
export interface ResponseTerm {
  readonly respTermName: ContributionTerm;
  readonly respTermAmount: number;
}

export interface OrderResponse {
  /** The order, by its origin id (the same through every hop). */
  readonly respOrder: MessageId;
  readonly respPerson: PersonId;
  readonly respPost: PostId | null;
  /** He relayed it (0040) or it was addressed to him. */
  readonly respRole: 'relay' | 'addressee';
  /** What he answered: the order's kind (a goal, a call, an edit, ...) or the verb's (`verb:audience`); lane 1.11's `callReceived` reads it. */
  readonly respKind: string;
  readonly respDay: number;
  readonly respActual: ComplianceRung;
  readonly respDeclared: ComplianceRung;
  readonly respWillingness: number;
  readonly respTerms: readonly ResponseTerm[];
  readonly respReasons: readonly Reason[];
  readonly respStated: readonly Reason[];
  readonly respConditions: readonly ResponseCondition[];
}

/**
 * Whether a response is a governor's answer to a call (lane 1.12): its addressee's, to an order whose id names the call
 * and his post (`dispatchOrder` tags a call `call.<post>`).
 */
export function isCallAnswer(r: OrderResponse): boolean {
  return r.respRole === 'addressee' && r.respPost !== null && r.respOrder.endsWith(`.call.${r.respPost}`);
}

/** The key of a man's response to an order: one per order per man. */
export function responseKey(order: MessageId, person: PersonId): string {
  return `${order}|${person}`;
}

/** A response as State, from compliance's answer. */
export function responseOf(
  answer: DirectiveResponse,
  at: { readonly order: MessageId; readonly person: PersonId; readonly post: PostId | null; readonly role: 'relay' | 'addressee'; readonly day: number; readonly kind: string },
): OrderResponse {
  return {
    respOrder: at.order,
    respPerson: at.person,
    respPost: at.post,
    respRole: at.role,
    respKind: at.kind,
    respDay: at.day,
    respActual: answer.actual,
    respDeclared: answer.declared,
    respWillingness: answer.willingness,
    respTerms: answer.contributions.map((c) => ({ respTermName: c.term, respTermAmount: c.amount })),
    respReasons: answer.reasons,
    respStated: answer.statedReasons,
    respConditions: answer.conditions,
  };
}

/** The only writer of responses: record (or replace) a man's response to an order. */
export function recordResponse(state: State, response: OrderResponse): State {
  return { ...state, orderResponses: { ...state.orderResponses, [responseKey(response.respOrder, response.respPerson)]: response } };
}

/**
 * Prune responses older than `keepDays` (lane 1.4; the pack's `pruning.responseDays`), as knowledge prunes: `orderResponses`
 * grows with every hop of every order. A response a plan, an operation or a levy still names is kept, whatever its age,
 * and so is each post holder's first answer to a call (lane 1.11).
 */
export function pruneResponses(state: State, day: number, keepDays: number): { readonly state: State; readonly pruned: number } {
  const named = new Set<string>();
  for (const r of Object.values(state.planRecords)) {
    named.add(r.planResponse);
    for (const c of r.planCounters) if (c.counterResponse !== null) named.add(c.counterResponse);
  }
  for (const o of Object.values(state.operationRecords)) for (const q of o.opRequests) if (q.oreqResponse !== null) named.add(q.oreqResponse);
  // Lane 1.7: a levy names the governor's answer to the call that raised it.
  for (const l of Object.values(state.postLevies)) named.add(l.levyResponse);
  // Lane 1.11: a post holder's first answer to a call is kept, since the `callReceived` condition dates a government's
  // act from the call's arrival (at most one per post).
  const firstCall: Record<string, string> = {};
  for (const k of Object.keys(state.orderResponses)) {
    const r = state.orderResponses[k]!;
    if (r.respKind !== 'call' || r.respRole !== 'addressee' || r.respPost === null) continue;
    const held = firstCall[r.respPost];
    const prior = held === undefined ? undefined : state.orderResponses[held]!;
    if (prior === undefined || r.respDay < prior.respDay || (r.respDay === prior.respDay && k < held!)) firstCall[r.respPost] = k;
  }
  for (const k of Object.values(firstCall)) named.add(k);
  // Keep every governor's call answer too: doctrine uses it to avoid duplicate calls (lane 1.12).
  const drop = Object.keys(state.orderResponses).filter((k) => day - state.orderResponses[k]!.respDay > keepDays && !named.has(k) && !isCallAnswer(state.orderResponses[k]!));
  if (drop.length === 0) return { state, pruned: 0 };
  const next: Record<string, OrderResponse> = { ...state.orderResponses };
  for (const k of drop) delete next[k];
  return { state: { ...state, orderResponses: next }, pruned: drop.length };
}