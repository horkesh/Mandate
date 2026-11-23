import { z } from 'zod';

/** Issuer clauses, recorded without executing a contract or inventing available capacity. */
export const CallProfileSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  sourceProfile: z.string().min(1),
  honours: z.array(z.string().min(1)), offends: z.array(z.string().min(1)),
  callProvenance: z.array(z.strictObject({ source: z.string().min(1), page: z.number().int().min(1) })).min(1),
  conditions: z.array(z.strictObject({
    kind: z.enum(['service_term', 'organisation', 'appointments', 'arms_equipment', 'destination', 'other_conditions']),
    clauseText: z.string().min(1),
  })),
  materialDemand: z.array(z.strictObject({
    resource: z.enum(['arms', 'equipment', 'horses', 'clothing', 'transport', 'subsistence']),
    obligation: z.enum(['required', 'as_practicable', 'not_required', 'unspecified']),
    provider: z.enum(['state', 'national', 'either', 'volunteer', 'unspecified']),
    quantity: z.number().int().min(0).nullable(), demandText: z.string().min(1),
  })),
  rationale: z.string().min(1), limits: z.string().min(1),
});
