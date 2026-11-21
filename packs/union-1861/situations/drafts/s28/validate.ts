/** S28 authoring bench. No pack writes and no review/signature creation. */
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { IntlMessageFormat } from 'intl-messageformat';
import { loadPack, type PackFiles, type PackData, type Issue } from '@mandate/pack-format';
import { packFilesAt } from '../../../../../packages/cli/src/pack-files.ts';
import { SituationSchema, validateSituations } from '../../../../../packages/pack-format/src/situations.ts';
import { checkGate, localeStrings, RegisterSchema } from '../../../../../packages/pack-format/src/gate.ts';
import { policyRows } from '../../../../../packages/pack-format/src/situation-layer.ts';
import { IssueSink } from '../../../../../packages/pack-format/src/issues.ts';
import { ProvenanceFileSchema, StringTableSchema } from '../../../../../packages/pack-format/src/schemas.ts';
import { context as previous, gate as previousGate, live } from '../s13/validate.ts';

const folder = new URL('./', import.meta.url);
const json = (name: string) => JSON.parse(readFileSync(new URL(name, folder), 'utf8'));
export interface DraftEntry {
  id: string; faction: string; subject: string; gateTopic: string; facet: string;
  receipt: string; optionEvidence: Record<string, { source: string; at: string }[]>;
  acts: Record<string, string>; needs: string[]; expectedBlockers: string[];
  sourceLimits: string; inferences: string[];
}
export const index = json('index.json') as { items: DraftEntry[] };
const sources = ProvenanceFileSchema.parse(json('sources.json'));
const strings = StringTableSchema.parse(json('strings.json'));
const topics = RegisterSchema.parse(json('topics.json'));
const en = [...previous.strings.get('en')!, { file: 'situations/drafts/s28/strings.json', table: strings }];
export const context: PackData = { ...previous, provenance: { ...previous.provenance, sources: [...previous.provenance.sources, ...sources.sources] }, strings: new Map([...previous.strings, ['en', en]]) };
export const gate = { ...previousGate, register: { topics: [...previousGate.register.topics, ...topics.topics] } };
const oldKeys = new Set(en.slice(0, -1).flatMap((t) => Object.keys(t.table)));
for (const [key, value] of Object.entries(strings)) {
  if (oldKeys.has(key)) throw new Error(`S28 overwrites an earlier string: ${key}`);
  new IntlMessageFormat(value, 'en');
}
for (const [name, keys] of [['source', context.provenance.sources.map((s) => s.key)], ['topic', gate.register.topics.map((t) => t.id)]] as const) {
  if (new Set(keys).size !== keys.length) throw new Error(`Duplicate ${name}`);
}
export { live };
export const rawDraft = (id: string) => json(`${id}.json`);
export function validateDraft(raw: unknown) {
  const parsed = SituationSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.issues, warnings: [] as Issue[] };
  const def = parsed.data;
  if (def.gateReview !== null) return { errors: [{ message: 'Every S28 draft must remain unsigned' }], warnings: [] as Issue[] };
  const item = { file: `situations/${def.id}.json`, def };
  const sink = new IssueSink();
  policyRows([item], context, gate, sink);
  const issues = [...validateSituations([item], context), ...sink.issues, ...checkGate([item], gate, localeStrings(context.strings), context.provenance)];
  // All errors survive, including unsigned, held-topic and missing-cost errors.
  return { errors: issues.filter((i) => i.severity === 'error'), warnings: issues.filter((i) => i.severity === 'warning') };
}

/** A read-only in-memory promotion probe through the real loader. Never signs. */
export function loadDraft(raw: unknown) {
  const def = SituationSchema.parse(raw);
  const base = packFilesAt(fileURLToPath(new URL('../../../', folder)));
  const name = `${def.id}.json`;
  const overlay = new Map([
    ['PROVENANCE.json', JSON.stringify(context.provenance)],
    ['strings/en.json', JSON.stringify(Object.assign({}, ...en.filter((t) => !t.file.startsWith('data/')).map((t) => t.table)))],
    ['gate/register.json', JSON.stringify(gate.register)],
    ['gate/classes.json', JSON.stringify(gate.classes)],
    [`situations/${name}`, JSON.stringify(raw)],
  ]);
  const files: PackFiles = {
    read: (path) => overlay.get(path) ?? base.read(path),
    files: (path) => path === 'situations' ? [...base.files(path), name] : base.files(path),
    folders: (path) => base.folders(path),
  };
  return loadPack(files);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = index.items.map((entry) => {
    const raw = rawDraft(entry.id);
    const validated = validateDraft(raw);
    const loaded = loadDraft(raw);
    return { id: entry.id, expectedBlockers: entry.expectedBlockers, ...validated, loadAccepted: loaded.pack !== null, loadErrors: loaded.issues.filter((i) => i.severity === 'error') };
  });
  const kinds = (errors: object[]) => JSON.stringify([...new Set(errors.map((e) => 'kind' in e && typeof e.kind === 'string' ? e.kind : 'schema-error'))].sort());
  const unexpected = results.filter((r) => kinds(r.errors) !== JSON.stringify([...r.expectedBlockers].sort()) || kinds(r.loadErrors) !== JSON.stringify([...r.expectedBlockers].sort()));
  console.log(JSON.stringify({ drafts: results.length, unexpected: unexpected.length, results }, null, 2));
  if (unexpected.length) process.exitCode = 1;
}
