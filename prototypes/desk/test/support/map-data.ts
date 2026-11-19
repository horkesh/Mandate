import {existsSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {it} from 'vitest';

/** Missing optional geography skips only its integration checks, never a bad build. */
export function mapTest(files: string[], name: string, run: () => void | Promise<void>) {
  const missing = files.filter(file => !existsSync(`public/map-data/${file}`));
  it.skipIf(missing.length > 0)(missing.length ? `${name} [requires ${missing.join(', ')}; run npm run map:setup]` : name, run);
}

export function evidenceDirectory() {
  const dir = process.env.DESK_EVIDENCE_REQUEST
    ? resolve('../../art-masters', process.env.DESK_EVIDENCE_REQUEST)
    : resolve('node_modules/.cache/desk-test-evidence');
  mkdirSync(dir, {recursive: true});
  return dir;
}
