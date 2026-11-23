/**
 * Published schemas (decision 0030: the pack format is the modding format).
 * JSON Schema documents generated from the Zod schemas, written to
 * `packages/pack-format/schemas/` by `npm run pack:schemas`; a test fails when
 * they are stale. They describe the files' input shape, so ids show their
 * pattern; references, licences and graph rules are the validator's
 * (`npm run pack:validate`).
 */
import { z } from 'zod';
import { CheckpointsSchema } from './checkpoints.ts';
import { PushbackRegisterSchema } from './pushback-register.ts';
import { formatGenerated } from './format.ts';
import { AnachronismsSchema, ChecklistSchema, ClassesSchema, ForbiddenSchema, RegisterSchema, ReleaseSchema, ReviewersSchema, SourcePolicySchema, TriggersSchema } from './gate.ts';
import { ManifestSchema, ProvenanceFileSchema, ScenarioHeaderSchema, ScenarioSchema, StringTableSchema, WorldSchema } from './schemas.ts';
import { SituationSchema } from './situations.ts';

export const PUBLISHED_SCHEMAS_DIR = 'packages/pack-format/schemas';

const SCHEMAS: readonly { readonly file: string; readonly title: string; readonly schema: z.ZodType }[] = [
  { file: 'pushback-register.schema.json', title: 'Mandate named pushback register (observational calibration)', schema: PushbackRegisterSchema },
  { file: 'pack.schema.json', title: 'Mandate pack manifest (pack.json), format 2', schema: ManifestSchema },
  { file: 'provenance.schema.json', title: 'Mandate pack sources and licences (PROVENANCE.json), format 2', schema: ProvenanceFileSchema },
  { file: 'strings.schema.json', title: 'Mandate pack string table (strings/<locale>.json): keys to ICU messages', schema: StringTableSchema },
  { file: 'scenario-header.schema.json', title: 'Mandate scenario header (source/scenarios/<id>/scenario.json)', schema: ScenarioHeaderSchema },
  { file: 'world.schema.json', title: 'Mandate generated World (data/world.json), format 2', schema: WorldSchema },
  { file: 'scenario.schema.json', title: 'Mandate generated scenario start (data/scenarios/<id>.json), format 2', schema: ScenarioSchema },
  // Lane 0.7: situations and the sensitive-history gate.
  { file: 'situation.schema.json', title: 'Mandate situation (situations/<id>.json)', schema: SituationSchema },
  { file: 'gate-register.schema.json', title: 'Mandate gate topic register (gate/register.json)', schema: RegisterSchema },
  { file: 'gate-classes.schema.json', title: 'Mandate gate topic classes (gate/classes.json)', schema: ClassesSchema },
  { file: 'gate-triggers.schema.json', title: 'Mandate gate trigger terms (gate/triggers.json)', schema: TriggersSchema },
  { file: 'gate-forbidden.schema.json', title: 'Mandate gate forbidden wording (gate/forbidden.json)', schema: ForbiddenSchema },
  { file: 'gate-anachronisms.schema.json', title: 'Mandate gate anachronisms (gate/anachronisms.json)', schema: AnachronismsSchema },
  { file: 'gate-source-policy.schema.json', title: 'Mandate gate source policy (gate/source-policy.json)', schema: SourcePolicySchema },
  { file: 'gate-checklist.schema.json', title: 'Mandate gate checklist versions (gate/checklist.json)', schema: ChecklistSchema },
  { file: 'gate-release.schema.json', title: 'Mandate gate release windows (gate/release.json)', schema: ReleaseSchema },
  { file: 'gate-reviewers.schema.json', title: 'Mandate gate reviewers a release accepts (gate/reviewers.json)', schema: ReviewersSchema },
  // Lane 1.14: the done check's bands.
  { file: 'checkpoints.schema.json', title: 'Mandate done-check bands (checkpoints.json): checkpoints, pushback and the victory measure', schema: CheckpointsSchema },
];

/** File name to JSON text, in a stable order. */
export function publishedSchemas(): Map<string, string> {
  const out = new Map<string, string>();
  for (const { file, title, schema } of SCHEMAS) {
    const json = z.toJSONSchema(schema, { io: 'input', target: 'draft-2020-12', unrepresentable: 'any' }) as Record<string, unknown>;
    out.set(file, formatGenerated(stripFloats({ ...json, title })));
  }
  return out;
}

/** JSON Schema bounds can be floats in principle; ours are integers, and canonical JSON insists. */
function stripFloats(v: unknown): unknown {
  if (typeof v === 'number') return Number.isInteger(v) ? v : String(v);
  if (Array.isArray(v)) return v.map(stripFloats);
  if (v !== null && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, stripFloats(x)]));
  return v;
}
