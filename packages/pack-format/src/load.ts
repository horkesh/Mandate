/**
 * Loading a pack from its committed files: the manifest, PROVENANCE.json,
 * `data/` and the string tables, shape-checked and validated. This is the path
 * a game build or a mod loader takes; it needs no sources.
 */
import type { world as w } from '@mandate/kernel';
import { readJson, type PackFiles } from './generate.ts';
import { errorsOf, type Issue, IssueSink } from './issues.ts';
import { generatedStringsFile, MANIFEST_FILE, PROVENANCE_FILE, scenarioFile, stringsFile, WORLD_FILE } from './layout.ts';
import { ManifestSchema, ProvenanceFileSchema, ScenarioSchema, type StringTable, StringTableSchema, WorldSchema } from './schemas.ts';
import { readSituationLayer } from './situation-layer.ts';
import { type PackData, validatePack } from './validate.ts';

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
  const worldPack: PackData = { manifest, provenance, world, scenarios, strings };
  sink.add(validatePack(worldPack));
  if (errorsOf(sink.issues).length > 0) return { pack: null, issues: sink.issues };
  const layer = readSituationLayer(files, worldPack);
  sink.add(layer.issues);
  const pack: PackData = { ...worldPack, situations: layer.situations, gate: layer.gate };
  return { pack: errorsOf(sink.issues).length > 0 ? null : pack, issues: sink.issues };
}
