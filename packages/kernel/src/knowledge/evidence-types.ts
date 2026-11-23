import type { PersonId, PostId } from '../ids.ts';

/** A typed detail of the issuer's original. Null is explicitly unprovided, never a known value. */
export interface CallInformation {
  readonly detail: 'purpose_detail' | 'muster_receiver' | 'rejection_return_support';
  readonly value: string | null;
}

/** A qualitative condition, not a numeric resource balance or an assertion of unwillingness. */
export type StateCondition = {
  readonly conditionKind: 'resource_limit';
  readonly conditionSubject: 'muster' | 'support' | 'arms_equipment';
  readonly conditionFact: 'camp_finance_limited' | 'resource_unavailable';
  readonly conditionCites: readonly (readonly [source: string, page: number])[];
} | {
  readonly conditionKind: 'structural_condition';
  readonly conditionSubject: 'authority' | 'organisation';
  readonly conditionFact: 'external_order_authority_absent' | 'organisation_incomplete';
  readonly conditionCites: readonly (readonly [source: string, page: number])[];
};

/** Own-state record, not a historical reply or an issuer term. No row IDs, score or desired response. */
export interface StateConditionRecord {
  readonly recordId: string;
  readonly recordActor: PersonId;
  readonly recordPost: PostId;
  readonly recordDate: string;
  readonly recordCondition: StateCondition;
}
