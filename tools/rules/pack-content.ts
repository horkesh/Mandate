import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gateContentHash, ManifestSchema, ProvenanceFileSchema, SituationSchema, StringTableSchema, stringsFile, generatedStringsFile, type LocaleStrings, type ProvenanceFile } from '@mandate/pack-format';
import { jsonAt, type JsonItem } from './common.ts';

export interface PackContent { strings: LocaleStrings; provenance: ProvenanceFile }
/** Match the loader's hand-written/generated merge order; include every declared locale. */
export function packContent(root: string, pack: string): PackContent {
  const directory = `packs/${pack}`;
  const manifest = ManifestSchema.parse(jsonAt(root, `${directory}/pack.json`));
  const provenance = ProvenanceFileSchema.parse(jsonAt(root, `${directory}/provenance.json`));
  const strings = new Map<string, ReadonlyMap<string, string>>();
  for (const locale of manifest.locales) {
    const table = new Map<string, string>();
    let present = false;
    for (const file of [stringsFile(locale), generatedStringsFile(locale)]) {
      const path = join(root, directory, file);
      if (!existsSync(path)) continue;
      present = true;
      for (const [key, text] of Object.entries(StringTableSchema.parse(JSON.parse(readFileSync(path, 'utf8'))))) table.set(key, text);
    }
    if (present) strings.set(locale, table);
  }
  return { strings, provenance };
}
export function withSituationContext(root: string, items: readonly JsonItem[]): JsonItem[] {
  const packs = new Map<string, PackContent>();
  return items.map(item => {
    const pack = item.path.split('/')[1]!;
    let content = packs.get(pack);
    if (content === undefined) { content = packContent(root, pack); packs.set(pack, content); }
    return { ...item, context: gateContentHash(SituationSchema.parse(item.value), content.strings, content.provenance) };
  });
}
