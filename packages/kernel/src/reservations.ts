import { strictCompare } from './compare.ts';
import type {
  CommandContext, DirectiveAlternative, DirectiveClause, DirectiveReservation, DirectiveTerms, Reason,
  Reservation, ReservationGap, ReservationGapDetails, ReservationGround, ReservationKnowledge, ReservationTreatment,
} from './directive.ts';

export function clausesOf(terms: DirectiveTerms): DirectiveClause[] {
  const clauses: DirectiveClause[] = [{ clauseId: 'course', clauseSubject: 'course' }];
  const ids = new Set(['course']);
  for (const clause of terms.clauses ?? []) {
    if (ids.has(clause.clauseId)) {
      if (clause.clauseId === 'course' && clause.clauseSubject === 'course') clauses[0] = clause;
      else throw new RangeError(`duplicate directive clause ${clause.clauseId}`);
    } else {
      clauses.push(clause);
      ids.add(clause.clauseId);
    }
  }
  return clauses.sort((a, b) => strictCompare(a.clauseId, b.clauseId));
}

function qualification<E>(
  clause: DirectiveClause,
  groundKind: ReservationGround['groundKind'],
  groundReference: string,
  treatment: ReservationTreatment,
  effect: E,
  provenance: string,
  knowledge: ReservationKnowledge,
): Reservation<E> {
  return { clause: clause.clauseId, subject: clause.clauseSubject, grounds: { groundKind, groundReference }, treatment, effect, reservationProvenance: provenance, knowledge };
}

export function readQualifications(
  terms: DirectiveTerms, context: CommandContext, reasons: readonly Reason[], clauses: readonly DirectiveClause[],
): { readonly reservations: DirectiveReservation[]; readonly gaps: ReservationGap[] } {
  const byId = new Map(clauses.map(c => [c.clauseId, c]));
  const course = byId.get('course')!;
  const reservations: DirectiveReservation[] = [];
  const gaps: ReservationGap[] = [];
  for (const reason of reasons) {
    if (reason.kind === 'values_offended') {
      const linked = (terms.valueClauseLinks ?? []).filter(([value]) => value === reason.value).flatMap(([, id]) => {
        const clause = byId.get(id);
        return clause === undefined ? [] : [clause];
      });
      for (const clause of new Set(linked.length > 0 ? linked : [course])) {
        reservations.push(qualification(clause, 'offended_value', reason.value, 'protest', 'statement', 'received_paper', 'inferred'));
      }
    } else if (reason.kind === 'departs_from_judgement') {
      reservations.push(qualification(course, 'course_judgment', reason.kind, 'protest', 'statement', 'planner_evaluation', 'inferred'));
    }
  }
  for (const input of context.qualifications ?? []) {
    const clause = byId.get(input.clause);
    if (clause === undefined || !input.reference) continue;
    if (input.evidence === 'resource_report') {
      if (clause.clauseObligation === 'not_required' || context.receivedDay === undefined ||
        !Number.isSafeInteger(input.reportedDay) || !Number.isSafeInteger(input.receivedDay) ||
        input.reportedDay < 0 || input.reportedDay > input.receivedDay || input.receivedDay > context.receivedDay) continue;
      const request = qualification(clause, input.evidence, input.reference, input.treatment, 'request' as const, input.reference, 'reported');
      reservations.push({
        ...request, grounds: { ...request.grounds, groundReportedDay: input.reportedDay, groundReceivedDay: input.receivedDay },
      });
    } else if (input.evidence === 'structural_condition' && input.stage && input.prerequisite && input.mechanism) {
      if (clause.clauseObligation !== 'not_required') gaps.push({
        ...qualification(clause, input.evidence, input.reference, input.treatment, 'gate' as const, input.reference, input.stateOfKnowledge ?? 'reported'),
        mechanism: input.mechanism, gapStage: input.stage, gapPrerequisite: input.prerequisite,
      });
    } else {
      const effect = input.treatment === 'protest' ? 'statement' : 'request';
      const knowledge = input.evidence === 'structural_condition' ? input.stateOfKnowledge ?? 'reported' : 'reported';
      reservations.push(qualification(clause, input.evidence, input.reference, input.treatment, effect, input.reference, knowledge));
    }
  }
  return { reservations, gaps };
}

export function amendmentOf(clause: DirectiveClause, candidate: DirectiveAlternative): Reservation<'statement'> | (Reservation<'offer'> & ReservationGapDetails) {
  if (candidate.authority === 'consent_required') return {
    ...qualification(clause, 'structural_condition', candidate.id, 'propose_amendment', 'offer' as const, candidate.id, 'inferred'),
    mechanism: candidate.mechanism, gapPrerequisite: 'received_acceptance', gapAcceptanceBy: candidate.acceptanceBy,
  };
  return qualification(clause, 'structural_condition', candidate.id, 'propose_amendment', 'statement', candidate.id, 'inferred');
}
