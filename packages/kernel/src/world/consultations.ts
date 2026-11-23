/** Course-addressed consultation questions (0120.2). Data describes questions, never historical answers. */
import type { PersonId, PostId, SituationId } from '../ids.ts';
import type { LetterIdentity } from './letters.ts';

export interface ConsultationCourse {
  readonly id: string;
  readonly honours: readonly string[];
  readonly opposes: readonly string[];
  /** The resources an assessment must account for. Missing amounts stay unknown. */
  readonly resources: readonly string[];
  readonly assumesPossible: boolean;
}

export interface ConsultationRound {
  readonly letter: LetterIdentity;
  readonly subject: SituationId;
  /** Rule-seat scheduling only. A human may ask an offered question earlier or later. */
  readonly fromDate: string;
  readonly question: string;
  readonly kind: 'policy' | 'feasibility';
  readonly courses: readonly ConsultationCourse[];
  /** Courses an adviser may propose in answering; not additional questions attributed to the principal. */
  readonly alternatives?: readonly ConsultationCourse[];
  readonly advisers: readonly { readonly person: PersonId; readonly post: PostId }[];
  readonly source: string;
}

/** A report's attributed assessment input, not a statement of simulation truth. */
export interface CourseEvidence {
  readonly evidenceCourse: string;
  readonly evidenceResource: string;
  readonly evidenceNeeded: number | null;
  readonly evidenceAvailable: number | null;
  /** Absolute simulation days. Null is unknown, including an unspecified deadline. */
  readonly evidenceReadyBy: number | null;
  readonly evidenceNeededBy: number | null;
}

export interface CourseAssessment {
  readonly assessmentStatus: 'feasible' | 'infeasible' | 'unknown';
  readonly assessmentRequirements: readonly (CourseEvidence & { readonly assessmentPaper: string | null })[];
}

export interface ConsultationAdvice {
  readonly consultationRound: LetterIdentity;
  readonly consultationSubject: SituationId;
  readonly consultationAnswers: readonly {
    readonly answerCourse: string;
    readonly answerPosition: 'favour' | 'against' | 'undetermined';
    readonly answerTerms: readonly (readonly [term: string, amount: number])[];
    readonly answerFeasibility?: CourseAssessment;
  }[];
}
