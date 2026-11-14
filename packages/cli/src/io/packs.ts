/**
 * Writing generated pack files: `packs/<id>/data/` and the published schemas.
 * Each file is written atomically; files the generator no longer produces are
 * removed, so `data/` holds exactly the generator's output.
 */
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { writeFileAtomic } from './atomic.ts';

/** Write changed outputs and delete stale extras. Paths are relative to `root`, with forward slashes. */
export function writeGenerated(root: string, write: ReadonlyMap<string, string>, remove: readonly string[]): void {
  for (const path of [...write.keys(), ...remove]) {
    if (path.split('/').some((seg) => seg === '..' || seg === '') || path.includes('\\')) throw new Error(`refusing to write outside the folder: "${path}"`);
  }
  for (const [path, text] of write) writeFileAtomic(join(root, ...path.split('/')), text);
  for (const path of remove) rmSync(join(root, ...path.split('/')), { force: true });
}
