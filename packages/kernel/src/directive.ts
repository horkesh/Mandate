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
}

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
  | { readonly kind: 'holds_grievance'; readonly grievance: string; readonly weight: number };

export type ReasonKind = Reason['kind'];

/** One term of the willingness sum, kept so every number is explainable (CLAUDE.md rule 6). */
export interface Contribution {
  readonly term: 'values' | 'temperament' | 'regard' | 'deterrence' | 'capacity' | 'disposition' | 'grievances';
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
}
