import { z } from 'zod';
import { callValueLinkProblems } from '../../kernel/src/recruitment/rules.ts';

const conditionCites = z.array(z.tuple([z.string().min(1), z.number().int().min(1)])).min(1);
export const StateConditionSchema = z.discriminatedUnion('conditionKind', [
  z.strictObject({ conditionKind: z.literal('resource_limit'), conditionSubject: z.enum(['muster','support','arms_equipment']),
    conditionFact: z.enum(['camp_finance_limited','resource_unavailable']), conditionCites }),
  z.strictObject({ conditionKind: z.literal('structural_condition'), conditionSubject: z.enum(['authority','organisation']),
    conditionFact: z.enum(['external_order_authority_absent','organisation_incomplete']), conditionCites }),
]);

/** Issuer clauses, recorded without executing a contract or inventing available capacity. */
export const CallProfileSchema = z.strictObject({
  information: z.array(z.strictObject({
    detail: z.enum(['purpose_detail', 'muster_receiver', 'rejection_return_support']),
    value: z.string().min(1).nullable(),
  })).max(3).optional(),
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  sourceProfile: z.string().min(1),
  honours: z.array(z.string().min(1)), offends: z.array(z.string().min(1)),
  valueClauseLinks: z.array(z.strictObject({
    linkValue: z.string().min(1), linkClause: z.string().min(1),
    linkCites: z.array(z.tuple([z.string().min(1), z.number().int().min(1)])).min(1),
    linkRationale: z.string().min(1),
  })).optional(),
  callProvenance: z.array(z.strictObject({ source: z.string().min(1), page: z.number().int().min(1) })).min(1),
  conditions: z.array(z.strictObject({
    kind: z.enum(['service_term', 'organisation', 'appointments', 'arms_equipment', 'destination', 'other_conditions', 'purpose', 'authority']),
    clauseText: z.string().min(1),
  })),
  materialDemand: z.array(z.strictObject({
    resource: z.enum(['arms', 'equipment', 'horses', 'clothing', 'transport', 'subsistence']),
    obligation: z.enum(['required', 'as_practicable', 'not_required', 'unspecified']),
    provider: z.enum(['state', 'national', 'either', 'volunteer', 'unspecified']),
    quantity: z.number().int().min(0).nullable(), demandText: z.string().min(1),
  })),
  rationale: z.string().min(1), limits: z.string().min(1),
}).superRefine((profile, ctx) => {
  for (const message of callValueLinkProblems(profile)) ctx.addIssue({ code: 'custom', path: ['valueClauseLinks'], message });
});
