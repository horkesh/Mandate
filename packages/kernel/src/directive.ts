import type { ValueId } from './people.ts';
import type { Permille } from './permille.ts';

/**
 * The terms of a directive as the proxy reads them (P2). A directive is a
 * contract of intent, not a move order: the engine never lets the leader
 * command units directly (decision 0001).
 *
 * M0 slice: intent is reduced to a boldness level plus the values it honours
 * or offends. M1 adds intent kinds, constraints, priority and deadline.
 */
export interface DirectiveTerms {
  /** Stable local clause IDs for the received revision. Plain terms have an implicit course clause. */
  readonly clauses?: readonly DirectiveClause[];
  /** A specific clause bears a value cost. Without a link the cost applies only to the whole course. */
  readonly valueClauseLinks?: readonly (readonly [value: ValueId, clause: string])[];
  /** 0..1000: how bold the directive is (0 = hold at all costs, 1000 = all-out offensive). */
  readonly boldness: Permille;
  /** Values this directive serves. A pack derives these from the directive's intent. */
  readonly honours: readonly ValueId[];
  /** Values this directive violates. */
  readonly offends: readonly ValueId[];
  /** 0..1000: resources the task needs, on the same scale as `CommandContext.available`. */
  readonly required: Permille;
  /**
   * 0..1000: the boldness of his own best plan for this goal, on the same scale (lane 1.1; lane 0.9 finding 2). When
   * given, the temperament term reads the directive against it, not against his temperament on an absolute scale, so a
   * bold man never finds his own favourite plan too timid. Absent for a plain goal.
   */
  readonly ownBest?: Permille;
  /**
   * 0..1000: how far an edited plan departs from his own judgement (the planner's edit distance: his best candidate's
   * score minus the edited plan's). Adds the `judgement` term (FOUNDATION section 5: the further an edit departs, the
   * likelier reservations, a slow walk, a reinterpretation or an objection). Absent for an order that is not an edit.
   */
  readonly departure?: Permille;
  /** Support the plan asks of other posts (a fleet, a neighbouring army): each becomes an "if supported" condition unless promised. */
  readonly support?: readonly SupportNeed[];
  /** Practices this order runs against (lane 1.5b; the map's `clashes`): a holder who keeps one reads it as a clash. */
  readonly clashes?: readonly string[];
}

export type ReservationSubject = 'purpose' | 'service_term' | 'appointments' | 'organisation' | 'authority' | 'muster' | 'destination' | 'arms_equipment' | 'transport' | 'support' | 'timing' | 'course';
export type ReservationKnowledge = 'observed' | 'reported' | 'inferred' | 'unknown';
export type ReservationTreatment = 'protest' | 'clarify' | 'request_support' | 'propose_amendment';

/** A clause refers to a paper, not a balance of materiel or a piece of execution state. */
export interface DirectiveClause {
  readonly clauseId: string;
  readonly clauseSubject: ReservationSubject;
  readonly clauseWording?: string;
  readonly clauseObligation?: 'required' | 'as_practicable' | 'not_required' | 'unspecified';
  readonly clauseProvenance?: readonly (readonly [source: string, page: number])[];
}

export interface ReservationGround {
  readonly groundKind: 'offended_value' | 'course_judgment' | 'structural_condition' | 'resource_report' | 'information_request';
  /** Held value, reason, event, report or information sought, according to groundKind. */
  readonly groundReference: string;
  readonly groundReportedDay?: number;
  readonly groundReceivedDay?: number;
}

/** Actor-side evidence explicitly tied to the request; adapters supply information the actor actually received. */
export type QualificationInput =
  | { readonly clause: string; readonly evidence: 'information_request'; readonly reference: string; readonly treatment: 'clarify' }
  | { readonly clause: string; readonly evidence: 'structural_condition'; readonly reference: string; readonly treatment: 'protest' | 'request_support'; readonly stateOfKnowledge?: 'observed' | 'reported' | 'inferred'; readonly prerequisite?: string; readonly stage?: string; readonly mechanism?: string }
  | { readonly clause: string; readonly evidence: 'resource_report'; readonly reference: string; readonly reportedDay: number; readonly receivedDay: number; readonly treatment: 'request_support' };

export interface Reservation<ReservationEffect> {
  readonly clause: string;
  readonly subject: ReservationSubject;
  readonly grounds: ReservationGround;
  readonly treatment: ReservationTreatment;
  readonly effect: ReservationEffect;
  readonly reservationProvenance: string;
  readonly knowledge: ReservationKnowledge;
}

export type DirectiveReservation = Reservation<'statement' | 'request'>;

export interface ReservationGapDetails {
  readonly mechanism: string;
  readonly gapStage?: string;
  readonly gapPrerequisite?: string;
  readonly gapAcceptanceBy?: string;
}

export type ReservationGap = Reservation<'gate' | 'offer'> & ReservationGapDetails;

export interface Undertaking {
  readonly undertakingKind: 'original' | 'alternative';
  /** Null only for pure readings not tied to a received dispatch. */
  readonly undertakingRequest: string | null;
  readonly undertakingRevision?: string;
  readonly clauses: readonly string[];
  readonly candidate?: string;
  readonly candidateWillingness?: number;
  readonly candidateContributions?: readonly (readonly [ContributionTerm, number])[];
  readonly candidateChanges?: readonly string[];
}

/** A concrete candidate already admitted by the execution owner's existing grammar. */
export type DirectiveAlternative = {
  readonly id: string;
  readonly terms: DirectiveTerms;
  readonly changedClauses: readonly string[];
  readonly qualifications?: readonly QualificationInput[];
} & ({ readonly authority: 'authorized' } | { readonly authority: 'consent_required'; readonly mechanism: string; readonly acceptanceBy: string });

/** Support a plan needs from another post (lane 0.9's `naval_support` and `cooperating_axis` requests). */
export interface SupportNeed {
  /** What kind of support (`naval`, `cooperating`): planner vocabulary, never a setting name. */
  readonly supportKind: string;
  /** The post asked, or null when none is named yet. */
  readonly supportFrom: string | null;
}

/**
 * A condition a response carries (lane 1.1; lane 0.9 finding 1): he will act, but only when it is met. A condition
 * qualifies the rung he gives; it never improves it.
 */
export type ResponseCondition =
  /** "Move when reinforced": his shortfall is past the share of the task a man of his boldness tolerates (lane 0.9 finding 8). */
  | { readonly kind: 'when_reinforced'; readonly shortfall: Permille }
  /** "If the navy supports": support the plan needs that has not been promised. */
  | { readonly kind: 'if_supported'; readonly supportKind: string; readonly from: string | null };

/** The circumstances the proxy is in when the directive arrives. */
export interface CommandContext {
  readonly receivedDay?: number;
  readonly qualifications?: readonly QualificationInput[];
  /** 0..1000: resources the proxy's post actually holds for this task (P1). */
  readonly available: Permille;
  /** 0..1000: how closely the leader is watching (inspectors, commissars, journalists, wires). */
  readonly oversight: Permille;
  /** 0..1000: how credible the leader's sanctions are, derived from their record (P7). */
  readonly leaderCredibility: Permille;
  /** Signed willingness adjustment from the proxy's insubordination-ladder rung (P5). Default 0. */
  readonly disposition?: number;
  /** Grievances the proxy holds against the principal (typed; each is answered by specific counters, P3). */
  readonly grievances?: readonly { readonly kind: string; readonly weight: number }[];
  /**
   * Values honouring which never helps (0074's cost-only values): honouring one adds nothing to willingness and gives no
   * reason; offending one still costs. From the pack's vocabulary.
   */
  readonly costOnly?: readonly ValueId[];
  /**
   * Oversight beyond the base (lane 1.5): an observer at his headquarters, pressure. Each adds to `oversight` as its own
   * typed term and a `watched` reason, so a replacement of the base stand-in keeps them (the lead's condition).
   */
  readonly oversightTerms?: readonly { readonly source: string; readonly amount: Permille }[];
  /** Support already promised to him, by kind: a need of a promised kind carries no condition. */
  readonly supportPromised?: readonly string[];
  /**
   * His own standing practices this order clashes with (lane 1.5b: a commander's own conduct, such as his practice toward
   * fugitives, which an order may run against). Each costs its weight as the practice term, with a practice_clash
   * reason. Absent when nothing clashes.
   */
  readonly practiceClashes?: readonly { readonly practice: string; readonly weight: number }[];
}

/**
 * The compliance ladder (P2), from best to worst for the leader.
 * `slow_walk` and `reinterpret` are covert: the proxy can declare compliance
 * while doing them.
 */
export const COMPLIANCE_RUNGS = [
  'exceed',
  'comply',
  'comply_with_reservations',
  'slow_walk',
  'reinterpret',
  'object',
  'refuse',
] as const;

export type ComplianceRung = (typeof COMPLIANCE_RUNGS)[number];

/** Typed reasons. The UI, AI and text layers all read these, never the raw score. */
export type Reason =
  | { readonly kind: 'values_honoured'; readonly value: ValueId }
  | { readonly kind: 'values_offended'; readonly value: ValueId }
  | { readonly kind: 'too_rash'; readonly gap: Permille }
  | { readonly kind: 'too_timid'; readonly gap: Permille }
  | { readonly kind: 'trusts_leader' }
  | { readonly kind: 'distrusts_leader' }
  | { readonly kind: 'fears_sanction' }
  | { readonly kind: 'shielded_by_standing' }
  | { readonly kind: 'lacks_resources'; readonly shortfall: Permille }
  | { readonly kind: 'holds_grievance'; readonly grievance: string; readonly weight: number }
  /** An edit departs from his own judgement by at least the reason threshold (lane 1.1). */
  | { readonly kind: 'departs_from_judgement'; readonly departure: Permille }
  /** He knows he is watched more closely than usual (lane 1.5): an observer at his headquarters, or pressure. */
  | { readonly kind: 'watched'; readonly source: string; readonly amount: Permille }
  /** The order runs against a practice of his own (lane 1.5b). */
  | { readonly kind: 'practice_clash'; readonly practice: string; readonly weight: number };

export type ReasonKind = Reason['kind'];

/** The terms of the willingness sum. */
export type ContributionTerm = 'values' | 'temperament' | 'regard' | 'deterrence' | 'capacity' | 'disposition' | 'grievances' | 'judgement' | 'practice';

/** One term of the willingness sum, kept so every number is explainable (CLAUDE.md rule 6). */
export interface Contribution {
  readonly term: ContributionTerm;
  readonly amount: number;
}

/** What the proxy proposes instead when it objects. */
export interface CounterProposal {
  readonly boldness: Permille;
  readonly required: Permille;
}

export interface DirectiveResponse {
  readonly clauses: readonly DirectiveClause[];
  readonly undertaking: Undertaking | null;
  readonly declaredUndertaking: Undertaking | null;
  readonly reservations: readonly DirectiveReservation[];
  readonly declaredReservations: readonly DirectiveReservation[];
  readonly reservationGaps: readonly ReservationGap[];
  readonly declaredReservationGaps: readonly ReservationGap[];
  /** What the proxy will actually do. */
  readonly actual: ComplianceRung;
  /** What the proxy tells the leader it will do (P4: every fact has an author). */
  readonly declared: ComplianceRung;
  /** Signed sum of contributions. Positive means willing. */
  readonly willingness: number;
  readonly contributions: readonly Contribution[];
  /** The true reasons. Ground truth: never shown to a principal. */
  readonly reasons: readonly Reason[];
  /** The reasons the proxy chooses to give. Candid proxies give all of them. */
  readonly statedReasons: readonly Reason[];
  readonly counterProposal: CounterProposal | null;
  /** What his action waits on ("move when reinforced", "if the navy supports"); empty when nothing (lane 1.1). */
  readonly conditions: readonly ResponseCondition[];
}
