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
