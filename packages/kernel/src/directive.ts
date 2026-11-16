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
}

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
  | { readonly kind: 'watched'; readonly source: string; readonly amount: Permille };

export type ReasonKind = Reason['kind'];

/** The terms of the willingness sum. */
export type ContributionTerm = 'values' | 'temperament' | 'regard' | 'deterrence' | 'capacity' | 'disposition' | 'grievances' | 'judgement';

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
