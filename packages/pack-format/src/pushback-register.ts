/** Observational calibration data; never part of World or State. */
import { z } from 'zod';
import { isoDate } from './schemas.ts';

const text = z.string().min(1);
export const PushbackMatchSchema = z.strictObject({
  kind: text,
  callId: text.nullable().optional(),
  regiments: z.number().int().min(0).nullable().optional(),
  termDays: z.number().int().min(1).nullable().optional(),
  subject: text.optional(),
  objective: text.optional(),
  posture: z.enum(['hold', 'take', 'relieve']).optional(),
  post: text.optional(),
  to: text.optional(),
  actual: text.optional(),
  advice: text.optional(),
  round: text.optional(),
  course: text.optional(),
  feasibility: z.enum(['feasible', 'infeasible', 'unknown']).optional(),
  purpose: z.literal('attack_or_demonstrate').optional(),
  target: text.optional(),
  letters: z.array(z.strictObject({ namespace: text, key: text, revision: z.number().int().min(1) })).min(1).max(3).optional(),
  detentionEvidence: z.enum(['course_challenge', 'actual_deferral']).optional(),
  /** 0118: subject and compatible effect of the qualification, apart from the rung. */
  qualification: z.array(z.strictObject({
    groundKind: z.enum(['offended_value','course_judgment','structural_condition','resource_report','information_request']).optional(),
    groundFact: z.enum(['purpose_detail','muster_receiver','rejection_return_support','camp_finance_limited','resource_unavailable','external_order_authority_absent','organisation_incomplete']).optional(),
    subject: z.enum(['purpose', 'service_term', 'appointments', 'organisation', 'authority', 'muster', 'destination', 'arms_equipment', 'transport', 'support', 'timing', 'course']),
    effects: z.array(z.enum(['statement', 'request', 'gate', 'offer'])).min(1),
  })).min(1).optional(),
}).refine(m => (m.callId !== undefined && m.callId !== null) || (m.termDays !== undefined && (m.regiments !== undefined || m.post !== undefined)) || m.subject !== undefined || (m.objective !== undefined && m.posture !== undefined) || (m.post !== undefined && m.to !== undefined) || (m.purpose !== undefined && m.target !== undefined && m.letters !== undefined && m.detentionEvidence !== undefined), 'a bounded matter needs a call, subject, goal, authored detention duty or transfer pair')
  .refine(m => m.actual !== undefined || m.advice !== undefined || m.detentionEvidence !== undefined, 'a matcher must name the actual act or advice required')
  .refine(m => (m.purpose === undefined && m.target === undefined && m.letters === undefined && m.detentionEvidence === undefined) ||
    (m.purpose !== undefined && m.target !== undefined && m.letters !== undefined && m.detentionEvidence !== undefined), 'a detention matcher needs its purpose, target, authored letters and performance evidence');
export const PushbackGapSchema = z.strictObject({ mechanism: text, location: text, reason: text });
export const PushbackRowSchema = z.strictObject({
  id: text, side: text, actor: text, role: text, band: text, matter: text, act: text,
  cite: text,
  status: z.enum(['eligible', 'excluded', 'qualified_source']),
  /** Unmodified columns of the accepted research register, including exclusions. */
  source: z.record(z.string(), z.string()).optional(),
  match: PushbackMatchSchema.optional(),
  gap: PushbackGapSchema.optional(),
}).refine(r => r.status !== 'eligible' || (r.match !== undefined) !== (r.gap !== undefined), 'an eligible row needs exactly one matcher or documented representation gap');
export const PushbackRegisterSchema = z.strictObject({
  side: text, through: isoDate, cite: text, rows: z.array(PushbackRowSchema).min(1),
}).superRefine((r, ctx) => {
  const ids = new Set<string>();
  r.rows.forEach((row, i) => {
    if (ids.has(row.id)) ctx.addIssue({ code: 'custom', path: ['rows', i, 'id'], message: 'duplicate named act' });
    if (row.side !== r.side) ctx.addIssue({ code: 'custom', path: ['rows', i, 'side'], message: 'row side differs from register' });
    ids.add(row.id);
  });
});
export type PushbackRegister = z.output<typeof PushbackRegisterSchema>;
export type PushbackRow = PushbackRegister['rows'][number];
