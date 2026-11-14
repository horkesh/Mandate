import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { canonicalHash } from '@mandate/kernel';
import { afterAll, describe, expect, it } from 'vitest';
import { writeFileAtomic } from '../src/io/atomic.ts';
import { createRunDir, isInsideRuns, RUNS_ROOT, writeRunFile } from '../src/io/runs.ts';
import { readSaveFile, writeSaveFile } from '../src/io/saves.ts';
import { REPO_ROOT, repoPath, stripCommentsAndStrings, tsFiles } from '../../kernel/test/support/source.ts';

const scratch = mkdtempSync(join(tmpdir(), 'mandate-io-'));
const madeRuns: string[] = [];
afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
  for (const dir of madeRuns) rmSync(dir, { recursive: true, force: true });
});

describe('atomic writes', () => {
  it('writes a new file and replaces an existing one, leaving no temporary files', () => {
    const path = join(scratch, 'nested', 'out.json');
    writeFileAtomic(path, 'first');
    writeFileAtomic(path, 'second');
    expect(readFileSync(path, 'utf8')).toBe('second');
    expect(readdirSync(join(scratch, 'nested'))).toEqual(['out.json']);
  });

  it('round-trips a versioned save through disk', () => {
    const worldHash = canonicalHash({ w: 1 });
    const path = writeSaveFile(join(scratch, 'game.save.json'), { worldHash, state: { day: 3 } });
    expect(readSaveFile(path, worldHash).state).toEqual({ day: 3 });
  });
});

describe('runs/ (FOUNDATION 11.8)', () => {
  it('is the ignored folder at the repository root', () => {
    expect(relative(REPO_ROOT, RUNS_ROOT).replace(/[\\/]+$/, '')).toBe('runs');
    expect(readFileSync(join(REPO_ROOT, '.gitignore'), 'utf8').split(/\r?\n/)).toContain('runs/');
  });

  it('gives each run a fresh folder and refuses writes outside runs/', () => {
    const a = createRunDir('io-test');
    const b = createRunDir('io-test');
    madeRuns.push(a, b);
    expect(a).not.toBe(b);
    expect(isInsideRuns(a)).toBe(true);
    expect(existsSync(writeRunFile(a, 'x.txt', 'ok'))).toBe(true);
    expect(() => writeRunFile(a, '../../../package.json', 'no')).toThrow('outside runs/');
    expect(() => writeRunFile(join(REPO_ROOT, 'packages'), 'x.txt', 'no')).toThrow('outside runs/');
    expect(isInsideRuns(RUNS_ROOT)).toBe(false);
    expect(() => createRunDir('../escape')).toThrow('simple name');
  });
});

describe('only src/io writes to disk', () => {
  it('no other CLI module calls a file-writing API', () => {
    const WRITES = /\b(writeFile|writeFileSync|appendFile|appendFileSync|createWriteStream|mkdir|mkdirSync|rename|renameSync|rm|rmSync|unlink|unlinkSync|copyFile|copyFileSync|cp|cpSync|truncate|truncateSync|openSync|writeSync)\s*\(/;
    const offenders = tsFiles(join(REPO_ROOT, 'packages', 'cli', 'src'))
      .filter((f) => !repoPath(f).startsWith('packages/cli/src/io/'))
      .filter((f) => WRITES.test(stripCommentsAndStrings(readFileSync(f, 'utf8'))))
      .map(repoPath);
    expect(offenders).toEqual([]);
  });
});
