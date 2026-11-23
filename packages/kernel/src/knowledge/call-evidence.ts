import { strictCompare } from '../compare.ts';
import type { DirectiveTerms, QualificationInput, ReservationSubject } from '../directive.ts';
import type { MessageId, PersonId } from '../ids.ts';
import type { TransitMessage } from '../messages/transit.ts';
import type { State } from '../root-state.ts';
import { seatIdFor } from '../seats/seats.ts';
import { daysFromCivil, parseIsoDate } from '../world/calendar.ts';
import { clausesOf } from '../reservations.ts';
import { deliverReport, knowledgeOf } from './knowledge.ts';
import type { CallInformation, StateConditionRecord } from './evidence-types.ts';

const SUBJECT: Readonly<Record<CallInformation['detail'], ReservationSubject>> = {
  purpose_detail: 'purpose', muster_receiver: 'muster', rejection_return_support: 'muster',
};

/** File exactly the original that has reached its addressee; no question or reply is stored here. */
export function receiveCallInformation(state: State, msg: TransitMessage, day: number): State {
  const order = msg.msgOrder;
  const information = order?.orderCall?.callProfile?.information;
  if (order?.orderKind !== 'call' || msg.msgRole !== 'addressee' || information === undefined || information.length === 0) return state;
  const seat = seatIdFor(msg.msgTo);
  const held = knowledgeOf(state, seat);
  if (held.knownReports.some(r => r.id === msg.msgOrigin)) return state;
  return deliverReport(state, seat, {
    id: msg.msgOrigin, knownReceivedDay: day, knownRoute: msg.msgRoute, knownVia: msg.msgVia,
    knownBody: {
      reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: order.orderIssuer,
      reportAuthorPost: null, reportSubjectKind: 'order', reportSubjectId: msg.msgOrigin,
      reportDay: order.orderIssuedDay, reportHour: null, reportClaims: [], reportAdvice: null, reportAnswers: null,
      reportCallInformation: [...information].sort((a,b) => strictCompare(a.detail,b.detail)),
      reportCallCites: order.orderCall!.callProfile!.callProvenance.map(c => [c.source,c.page] as const),
    },
  }, { truthTerms: [], truthTrimmed: [] });
}

/** Knowledge files a dated record only with its named actor in his own office. Never inferred received later. */
export function fileStateConditions(start: State, records: readonly StateConditionRecord[], calendar: string, day: number): State {
  let state = start;
  for (const record of [...records].sort((a,b) => strictCompare(a.recordId,b.recordId))) {
    const stamp = daysFromCivil(parseIsoDate(record.recordDate)) - daysFromCivil(parseIsoDate(calendar));
    if (stamp !== day || state.postStates[record.recordPost]?.postHolder !== record.recordActor || record.recordCondition.conditionCites.length === 0) continue;
    const seat = seatIdFor(record.recordActor);
    if (state.seatAssignments[seat] === undefined) continue;
    const id = `m.state-condition.${record.recordActor}.${record.recordId}` as MessageId;
    if (knowledgeOf(state,seat).knownReports.some(r => r.id === id)) continue;
    state = deliverReport(state, seat, {
      id, knownReceivedDay: day, knownRoute: 'in-person', knownVia: [],
      knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: record.recordActor,
        reportAuthorPost: record.recordPost, reportSubjectKind: 'post', reportSubjectId: record.recordPost,
        reportClaims: [], reportDay: day, reportHour: null, reportAdvice: null, reportAnswers: null,
        reportStateCondition: record.recordCondition },
    }, { truthTerms: [], truthTrimmed: [] });
  }
  return state;
}

/** One pure adapter reads the actor's received evidence and binds it to this undertaking's clauses. */
export function callQualifications(state: State, actor: PersonId, request: MessageId, issuedDay: number, terms: DirectiveTerms, readDay = state.stateDay): QualificationInput[] {
  const clauses = clausesOf(terms);
  const inputs: QualificationInput[] = [];
  for (const paper of knowledgeOf(state, seatIdFor(actor)).knownReports) {
    const body = paper.knownBody;
    if (paper.knownReceivedDay > readDay || body.reportDay > paper.knownReceivedDay) continue;
    if (body.reportSubjectKind === 'order' && body.reportSubjectId === request && body.reportAnswers === null) {
      for (const detail of body.reportCallInformation ?? []) {
        const clause = clauses.find(c => c.clauseSubject === SUBJECT[detail.detail]);
        if (detail.value !== null || clause === undefined || clause.clauseObligation === 'not_required') continue;
        inputs.push({ clause: clause.clauseId, evidence: 'information_request', fact: detail.detail, reference: `${paper.id}:${detail.detail}`, treatment: 'clarify' });
      }
    }
    const condition = body.reportStateCondition;
    // A later answer is never read back into this call. Own-state records predate its dispatch.
    if (condition === undefined || body.reportAnswers !== null || body.reportAuthor !== actor || body.reportAuthorPost === null ||
      body.reportSubjectKind !== 'post' || body.reportSubjectId !== body.reportAuthorPost ||
      body.reportDay >= issuedDay || condition.conditionCites.length === 0) continue;
    const clause = clauses.find(c => c.clauseSubject === condition.conditionSubject && c.clauseObligation !== 'not_required');
    if (clause === undefined) continue;
    const reference = `${paper.id}:${condition.conditionFact}`;
    if (condition.conditionKind === 'resource_limit') inputs.push({ clause: clause.clauseId, evidence: 'resource_report', fact: condition.conditionFact, reference, reportedDay: body.reportDay, receivedDay: paper.knownReceivedDay, treatment: 'request_support' });
    else inputs.push({ clause: clause.clauseId, evidence: 'structural_condition', fact: condition.conditionFact, reference, treatment: 'protest', stateOfKnowledge: 'reported' });
  }
  return inputs.sort((a,b) => strictCompare(a.reference,b.reference) || strictCompare(a.clause,b.clause));
}
