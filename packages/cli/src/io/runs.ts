/**
 * Run output goes only to the ignored `runs/` folder at the repository root
 * (FOUNDATION section 11.8; docs/LANES.md). Each run gets its own fresh
 * folder, so two runs never share one, and nothing a runner writes can land
 * in a tracked file: `writeRunFile` refuses any path outside `runs/`.
 */
import { randomBytes } from 'node:crypto';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFreshDir, writeFileAtomic } from './atomic.ts';

export const RUNS_ROOT = fileURLToPath(new URL('../../../../runs/', import.meta.url));

/** Whether `path` lies inside `runs/` (not `runs/` itself). */
export function isInsideRuns(path: string): boolean {
  const rel = relative(RUNS_ROOT, resolve(path));
  return rel.length > 0 && !rel.startsWith('..') && !isAbsolute(rel);
}

function stamp(now: Date): string {
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}-${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}`;
}

/**
 * A new, empty folder `runs/<label>/<UTC time>-<pid>-<random>`. The random
 * part makes two runs started in the same second by the same process distinct.
 */
export function createRunDir(label: string, now: Date = new Date()): string {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(label)) throw new Error(`run label must be a simple name, got "${label}"`);
  const dir = join(RUNS_ROOT, label, `${stamp(now)}-${process.pid}-${randomBytes(3).toString('hex')}`);
  createFreshDir(dir);
  return dir;
}

/** Write `name` inside a run folder, atomically. Refuses anything outside `runs/`. */
export function writeRunFile(runDir: string, name: string, data: string): string {
  const path = resolve(runDir, name);
  if (!isInsideRuns(path)) throw new Error(`refusing to write outside runs/: ${path}`);
  writeFileAtomic(path, data);
  return path;
}
