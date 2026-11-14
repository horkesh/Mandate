/**
 * Reading a v2 pack folder from disk for `@mandate/pack-format` (which reads
 * no files itself). Writes go through `io/packs.ts`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PackFiles } from '@mandate/pack-format';

export const PACKS_ROOT = fileURLToPath(new URL('../../../packs/', import.meta.url));

export function packRoot(packId: string): string {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(packId)) throw new Error(`"${packId}" is not a pack id (lowercase letters, digits and -)`);
  return join(PACKS_ROOT, packId);
}

/** Pack folders that hold a v2 manifest. */
export function v2Packs(): string[] {
  return readdirSync(PACKS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(PACKS_ROOT, d.name, 'pack.json')))
    .map((d) => d.name)
    .sort();
}

export function packFilesAt(root: string): PackFiles {
  return {
    read(path: string): string | undefined {
      const full = join(root, ...path.split('/'));
      return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
    },
    folders(path: string): string[] {
      const full = join(root, ...path.split('/'));
      if (!existsSync(full)) return [];
      return readdirSync(full, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
    },
  };
}

/** Every file under a pack's folder `dir`, by pack-relative path. */
export function filesUnder(root: string, dir: string): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (rel: string) => {
    const full = join(root, ...rel.split('/'));
    if (!existsSync(full)) return;
    for (const entry of readdirSync(full, { withFileTypes: true })) {
      const child = `${rel}/${entry.name}`;
      if (entry.isDirectory()) walk(child);
      else out.set(child, readFileSync(join(full, entry.name), 'utf8'));
    }
  };
  walk(dir);
  return out;
}
