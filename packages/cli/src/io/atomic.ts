/**
 * Atomic file writes (FOUNDATION section 11.2): write a temporary file in the
 * same folder, flush it to disk, then rename it over the target. A reader
 * sees the old file or the new one, never half of one, even if the process
 * dies mid-write. This is the only module in the CLI that writes files; a
 * test enforces that (`test/io-boundary.test.ts`).
 */
import { randomBytes } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, openSync, renameSync, rmSync, writeSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

/** Windows can briefly refuse a rename while another process (an indexer, an antivirus) holds the target. */
const RETRYABLE = new Set(['EPERM', 'EACCES', 'EBUSY']);
const RENAME_ATTEMPTS = 10;

export function writeFileAtomic(path: string, data: string): void {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const temp = join(dir, `.${basename(path)}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`);
  const fd = openSync(temp, 'wx');
  try {
    writeSync(fd, data, null, 'utf8');
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    renameWithRetry(temp, path);
  } catch (e) {
    rmSync(temp, { force: true });
    throw e;
  }
}

function renameWithRetry(from: string, to: string): void {
  for (let attempt = 1; ; attempt++) {
    try {
      renameSync(from, to);
      return;
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code ?? '';
      if (!RETRYABLE.has(code) || attempt >= RENAME_ATTEMPTS) throw e;
      sleep(attempt * 20);
    }
  }
}

function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Create a folder (and its parents) if missing. Lives here so every write to disk goes through this module. */
export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

/** Create a folder that must not exist yet; throws if it does. */
export function createFreshDir(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
  mkdirSync(path);
}
