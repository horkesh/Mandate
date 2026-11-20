/** S13's authoring bench. It never writes a pack or creates a review. */
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { IntlMessageFormat } from 'intl-messageformat';
import { loadPack, type PackData, type Issue } from '@mandate/pack-format';
import { packFilesAt } from '../../../../../packages/cli/src/pack-files.ts';
import { SituationSchema, validateSituations } from '../../../../../packages/pack-format/src/situations.ts';
import { checkGate, localeStrings, RegisterSchema } from '../../../../../packages/pack-format/src/gate.ts';
import { policyRows } from '../../../../../packages/pack-format/src/situation-layer.ts';
import { IssueSink } from '../../../../../packages/pack-format/src/issues.ts';
import { ProvenanceFileSchema, StringTableSchema } from '../../../../../packages/pack-format/src/schemas.ts';

const folder = new URL('./', import.meta.url);
const json = (name: string) => JSON.parse(readFileSync(new URL(name, folder), 'utf8'));
export interface DraftEntry {
  catalogue: string;
  id: string;
  stage: string;
  needs: string[];
  heldOptions: { id: string; reason: string }[];
  optionEvidence: Record<string, { source: string; at: string }[]>;
  cause: string;
  acts: Record<string, string>;
}
export const index = json('index.json') as { items: DraftEntry[] };
const loaded = loadPack(packFilesAt(fileURLToPath(new URL('../../../', folder))));
if (!loaded.pack) throw new Error(`The unchanged live pack failed: ${JSON.stringify(loaded.issues)}`);
export const live = loaded.pack;
const extraSources = ProvenanceFileSchema.parse(json('sources.json'));
const extraStrings = StringTableSchema.parse(json('strings.json'));
const extraTopics = RegisterSchema.parse(json('topics.json'));
const en = [...(live.strings.get('en') ?? []), { file: 'situations/drafts/s13/strings.json', table: extraStrings }];
export const context: PackData = {
  ...live,
  provenance: { ...live.provenance, sources: [...live.provenance.sources, ...extraSources.sources] },
  strings: new Map([...live.strings, ['en', en]]),
};
if (!live.gate) throw new Error('No live gate');
export const gate = { ...live.gate, register: { topics: [...live.gate.register.topics, ...extraTopics.topics] } };
if (new Set(context.provenance.sources.map((s) => s.key)).size !== context.provenance.sources.length) throw new Error('Duplicate source declaration');
if (new Set(gate.register.topics.map((t) => t.id)).size !== gate.register.topics.length) throw new Error('Duplicate topic declaration');
const liveKeys = new Set(en.slice(0, -1).flatMap((x) => Object.keys(x.table)));
for (const [key, value] of Object.entries(extraStrings)) {
  if (liveKeys.has(key)) throw new Error(`Draft overwrites a live string: ${key}`);
  new IntlMessageFormat(value, 'en');
}

export const rawDraft = (id: string) => json(`../${id}.json`);
// These are production review requirements, retained verbatim as blockers.
// No content, target, cost, source, placement-kind or wording failure is waived.
const pendingReview = new Set(['gate-unsigned', 'gate-held-topic', 'gate-wording-review']);
export function validateDraft(raw: unknown) {
  const parsed = SituationSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.issues, review: [] as Issue[], warnings: [] as Issue[] };
  const def = parsed.data;
  if (def.gateReview !== null) return { errors: [{ message: 'S13 drafts must be unsigned' }], review: [], warnings: [] };
  const file = `situations/drafts/${def.id}.json`;
  const item = { file, def };
  // The selected draft is the only S13 situation in this context. References
  // to live situations remain available; no second draft supplies a missing id.
  const semantic = validateSituations([item], context);
  const sink = new IssueSink();
  policyRows([item], context, gate, sink);
  const all = [...semantic, ...sink.issues, ...checkGate([item], gate, localeStrings(context.strings), context.provenance)];
  return {
    errors: all.filter((i) => i.severity === 'error' && !pendingReview.has(i.kind)),
    review: all.filter((i) => i.severity === 'error' && pendingReview.has(i.kind)),
    warnings: all.filter((i) => i.severity === 'warning'),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rows = index.items.map((entry) => ({ id: entry.id, ...validateDraft(rawDraft(entry.id)) }));
  console.log(JSON.stringify({ drafts: rows.length, errors: rows.reduce((n, r) => n + r.errors.length, 0), results: rows }, null, 2));
  if (rows.some((r) => r.errors.length)) process.exitCode = 1;
}
