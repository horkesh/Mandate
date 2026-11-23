/** Generated advice reads only this person's values, course stances and papers actually received. */
import { strictCompare } from '../compare.ts';
import type { PersonId } from '../ids.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import type { State } from '../root-state.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { ConsultationAdvice, ConsultationRound, CourseAssessment } from '../world/consultations.ts';
import { traitsOf } from './traits.ts';

export function generateCourseAdvice(world: SeatsWorld, state: State, person: PersonId, round: ConsultationRound, day: number): ConsultationAdvice {
  const values = traitsOf(world, state, person).values;
  const papers = knowledgeOf(state, seatIdFor(person)).knownReports.filter(r => r.knownReceivedDay <= day && r.knownBody.reportDay <= day &&
    r.knownBody.reportSubjectKind === 'situation' && r.knownBody.reportSubjectId === round.subject)
    .sort((a, b) => b.knownBody.reportDay - a.knownBody.reportDay || b.knownReceivedDay - a.knownReceivedDay || strictCompare(b.id, a.id));
  const score = (list: readonly string[]) => list.length === 0 ? 0 : Math.trunc(1000 * list.filter(v => values.includes(v)).length / list.length);
  return { consultationRound: round.letter, consultationSubject: round.subject, consultationAnswers: [...round.courses, ...(round.alternatives ?? [])].sort((a, b) => strictCompare(a.id, b.id)).map(course => {
    const requirements = [...course.resources].sort(strictCompare).map(resource => {
      const paper = papers.find(p => p.knownBody.reportCourseEvidence?.some(e => e.evidenceCourse === course.id && e.evidenceResource === resource));
      const e = paper?.knownBody.reportCourseEvidence?.find(e => e.evidenceCourse === course.id && e.evidenceResource === resource);
      return { evidenceCourse: course.id, evidenceResource: resource, evidenceNeeded: e?.evidenceNeeded ?? null, evidenceAvailable: e?.evidenceAvailable ?? null,
        evidenceReadyBy: e?.evidenceReadyBy ?? null, evidenceNeededBy: e?.evidenceNeededBy ?? null, assessmentPaper: paper?.id ?? null };
    });
    const insufficient = requirements.some(r => (r.evidenceNeeded !== null && r.evidenceAvailable !== null && r.evidenceAvailable < r.evidenceNeeded) ||
      (r.evidenceReadyBy !== null && r.evidenceNeededBy !== null && r.evidenceReadyBy > r.evidenceNeededBy));
    const unknown = requirements.length === 0 || requirements.some(r => r.evidenceNeeded === null || r.evidenceAvailable === null || r.evidenceReadyBy === null || r.evidenceNeededBy === null);
    const feasibility: CourseAssessment = { assessmentStatus: insufficient ? 'infeasible' : unknown ? 'unknown' : 'feasible', assessmentRequirements: requirements };
    const favour = score(course.honours), against = score(course.opposes);
    // People appends stances in command-log order, including multiple answers on the same day.
    const previous = (state.personStances[person] ?? []).filter(s => s.stanceSubject === `${round.subject}:${course.id}` && s.stanceDay <= day).at(-1);
    const contributions: [string, number][] = [['honoured_values', favour], ['opposed_values', -against]];
    let position: 'favour' | 'against' | 'undetermined' = favour > against ? 'favour' : against > favour ? 'against' :
      previous?.stanceRecommends === 'favour' || previous?.stanceRecommends === 'against' ? previous.stanceRecommends : 'undetermined';
    if (favour === against && previous !== undefined) contributions.push(['prior_course_stance', previous.stanceRecommends === 'favour' ? 1 : previous.stanceRecommends === 'against' ? -1 : 0]);
    if (!course.assumesPossible && feasibility.assessmentStatus === 'infeasible') { position = 'against'; contributions.push(['received_shortfall', -1]); }
    return { answerCourse: course.id, answerPosition: position, answerTerms: contributions, ...(round.kind === 'feasibility' || course.resources.length > 0 ? { answerFeasibility: feasibility } : {}) };
  }) };
}
