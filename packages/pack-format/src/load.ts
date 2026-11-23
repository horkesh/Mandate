/**
 * Loading a pack from its committed files: the manifest, PROVENANCE.json,
 * `data/` and the string tables, shape-checked and validated. This is the path
 * a game build or a mod loader takes; it needs no sources.
 */
import type { world as w } from '@mandate/kernel';
import { readBannedSources, readEvidencePolicy, readWeakSources } from './banned-sources.ts';
import { CHECKPOINTS_FILE, CheckpointsSchema, validateCheckpoints } from './checkpoints.ts';
import { PushbackRegisterSchema, type PushbackRegister } from './pushback-register.ts';
import { readJson, type PackFiles } from './generate.ts';
import { errorsOf, type Issue, IssueSink } from './issues.ts';
import { generatedStringsFile, MANIFEST_FILE, PROVENANCE_FILE, scenarioFile, stringsFile, WORLD_FILE } from './layout.ts';
import { ManifestSchema, ProvenanceFileSchema, ScenarioSchema, type StringTable, StringTableSchema, WorldSchema } from './schemas.ts';
import { readSituationLayer } from './situation-layer.ts';
import { type PackData, validatePack } from './validate.ts';

/** Issue kinds of the citation policy (A6): errors that do not stop the gate's pass over the situations. */
const CITATION_POLICY_KINDS: ReadonlySet<string> = new Set(['banned-source-cited', 'weak-citations-only']);

export interface LoadResult {
  readonly pack: PackData | null;
  readonly issues: readonly Issue[];
}

export function loadPack(files: PackFiles): LoadResult {
  const sink = new IssueSink();
  const manifest = readJson(files, MANIFEST_FILE, ManifestSchema, sink);
  const provenance = readJson(files, PROVENANCE_FILE, ProvenanceFileSchema, sink);
  const world = readJson(files, WORLD_FILE, WorldSchema, sink);
  if (!manifest || !provenance || !world) return { pack: null, issues: sink.issues };
  const scenarios: w.ScenarioStart[] = [];
  for (const id of manifest.scenarios) {
    const s = readJson(files, scenarioFile(id), ScenarioSchema, sink);
    if (s) scenarios.push(s);
  }
  const strings = new Map<string, { file: string; table: StringTable }[]>();
  for (const locale of manifest.locales) {
    const tables: { file: string; table: StringTable }[] = [];
    const hand = readJson(files, stringsFile(locale), StringTableSchema, sink, locale === manifest.defaultLocale);
    if (hand) tables.push({ file: stringsFile(locale), table: hand });
    const generated = readJson(files, generatedStringsFile(locale), StringTableSchema, sink, false);
    if (generated) tables.push({ file: generatedStringsFile(locale), table: generated });
    if (tables.length > 0) strings.set(locale, tables);
  }
  if (errorsOf(sink.issues).length > 0) return { pack: null, issues: sink.issues };
  const worldPack: PackData = { manifest, provenance, world, scenarios, strings, bannedSources: readBannedSources(files), weakSources: readWeakSources(files), evidencePolicy: readEvidencePolicy(files) };
  sink.add(validatePack(worldPack));
  // A citation-policy error (a banned or weak-only citation) leaves the World structurally sound, so the gate's own pass still
  // runs beside it: every problem is reported, never only the first (0030).
  if (errorsOf(sink.issues).some((i) => !CITATION_POLICY_KINDS.has(i.kind))) return { pack: null, issues: sink.issues };
  const layer = readSituationLayer(files, worldPack);
  sink.add(layer.issues);
  // Lane 1.14: the done check's bands, optional, checked against the World they name.
  const checkpoints = readJson(files, CHECKPOINTS_FILE, CheckpointsSchema, sink, false);
  if (checkpoints !== null) validateCheckpoints(checkpoints, world, scenarios[0]?.startDate ?? null, sink);
  const pushbackRegisters: PushbackRegister[] = [];
  const registerIds = new Set<string>();
  for (const file of checkpoints?.pushbackRegisters ?? []) {
    const r = readJson(files, file, PushbackRegisterSchema, sink);
    if (r === null) continue;
    if (!world.factions.some(f => f.id === r.side)) sink.error('pushback-register', file, 'side', 'unknown issuing side');
    if (scenarios[0] !== undefined && r.through < scenarios[0].startDate) sink.error('pushback-register', file, 'through', 'horizon precedes scenario start');
    for (const row of r.rows) {
      const key = `${r.side}/${row.id}`;
      if (registerIds.has(key)) sink.error('pushback-register', file, row.id, 'duplicate named act across registers');
      registerIds.add(key);
      if (row.status === 'eligible' && row.gap === undefined && !world.people.some(p => p.id === row.actor)) sink.error('pushback-register', file, row.id, 'eligible actor is absent from World without a representation gap');
    }
    pushbackRegisters.push(r);
  }
  const pack: PackData = { ...worldPack, situations: layer.situations, gate: layer.gate, checkpoints, pushbackRegisters };
  return { pack: errorsOf(sink.issues).length > 0 ? null : pack, issues: sink.issues };
}
