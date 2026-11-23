/** Immutable research catalogue. Dates are observations, never recruitment triggers (0108). */
import type { DepartmentId } from '../ids.ts';

export interface RegimentObservation {
  readonly observationId: string;
  readonly observedOn: string;
  readonly observationKind: string;
  readonly command: string;
  readonly division: string;
  readonly brigade: string;
  readonly source: string;
  readonly pages: string;
  readonly evidence: Readonly<Record<string, string>>;
}

export interface RegimentRecord {
  readonly id: string;
  readonly order: number;
  readonly state: string;
  readonly raisingDepartment: DepartmentId | null;
  readonly designation: string;
  readonly arm: string;
  readonly scope: string;
  readonly side: string;
  /** Model day equivalents of explicit sourced terms, empty when unknown. */
  readonly termDays: readonly number[];
  /** An expressly sourced war contract, distinct from an unestablished term. */
  readonly warTerm?: boolean;
  /** Read linkage to a specific requisition. It identifies a lot already raised by that call and does not establish a separate service term. */
  readonly identityCall?: string;
  readonly aliases: readonly string[];
  readonly observations: readonly RegimentObservation[];
  readonly path: Readonly<Record<string, string>>;
}
