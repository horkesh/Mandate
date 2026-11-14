/**
 * The testbed pack on disk, with in-memory edits, for the situation and gate
 * tests: each positive control changes one file and asserts the one check
 * that fires. The testbed's register is fictional (decision 0003; lane 0.7's
 * brief), so no setting term appears under `packages/`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PackFiles } from '../../src/index.ts';

export const TESTBED = fileURLToPath(new URL('../../../../packs/testbed/', import.meta.url));

/** Edits by pack-relative path: new text, or null to delete the file. */
export type Edits = Readonly<Record<string, string | null>>;

export function testbedFiles(edits: Edits = {}): PackFiles {
  const disk = (p: string) => join(TESTBED, ...p.split('/'));
  const inDir = (dir: string, kind: 'file' | 'dir') => {
    const full = disk(dir);
    const onDisk = existsSync(full) ? readdirSync(full, { withFileTypes: true }).filter((d) => (kind === 'file' ? d.isFile() : d.isDirectory())).map((d) => d.name) : [];
    const prefix = `${dir}/`;
    const names = new Set(onDisk);
    for (const [path, text] of Object.entries(edits)) {
      if (!path.startsWith(prefix)) continue;
      const rest = path.slice(prefix.length);
      const [head, ...tail] = rest.split('/');
      if (kind === 'file' && tail.length === 0) {
        if (text === null) names.delete(head!);
        else names.add(head!);
      }
      if (kind === 'dir' && tail.length > 0 && text !== null) names.add(head!);
    }
    return [...names].sort();
  };
  return {
    read: (p) => {
      if (Object.prototype.hasOwnProperty.call(edits, p)) return edits[p] ?? undefined;
      const full = disk(p);
      return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
    },
    folders: (p) => inDir(p, 'dir'),
    files: (p) => inDir(p, 'file'),
  };
}

export function readTestbed(path: string): string {
  return readFileSync(join(TESTBED, ...path.split('/')), 'utf8');
}

/** Edit one JSON file of the testbed. */
export function editJson(path: string, edit: (value: Record<string, any>) => void): Edits {
  const value = JSON.parse(readTestbed(path)) as Record<string, any>;
  edit(value);
  return { [path]: JSON.stringify(value) };
}
