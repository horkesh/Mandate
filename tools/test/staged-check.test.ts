import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { linksUnder, removeSnapshot, SNAPSHOT_PREFIX, stagedCheck, treeEqualsIndex, workspacePackages } from '../staged-check.ts';

/**
 * The pre-commit check runs on exactly what is being committed. Each case
 * builds a throwaway git repository whose `check.js` stands in for
 * `npm run check`, and shows what the old hook (the check on the working tree)
 * would have said against what the commit really is.
 */
const made: string[] = [];
afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

const GOOD = {
  'value.txt': 'good\n',
  'extra.txt': 'needed\n',
  'packages/lib/package.json': JSON.stringify({ name: '@w/lib', main: 'index.js' }),
  'packages/lib/index.js': "module.exports = 'v1';\n",
};

/** The stand-in check: reads the tree it runs in, and records where that was. */
const CHECK_JS = `
const fs = require('node:fs');
const path = require('node:path');
const problems = [];
if (fs.readFileSync(path.join(__dirname, 'value.txt'), 'utf8').trim() !== 'good') problems.push('value.txt is not good');
if (!fs.existsSync(path.join(__dirname, 'extra.txt'))) problems.push('extra.txt is missing');
if (require('dep') !== 'dep-ok') problems.push('dep did not resolve');
if (require('@w/lib') !== 'v1') problems.push('@w/lib is ' + require('@w/lib'));
if (process.env.GIT_INDEX_FILE !== undefined) problems.push('GIT_INDEX_FILE leaked into the check');
fs.writeFileSync(process.env.RAN_IN, __dirname);
if (problems.length > 0) { console.error(problems.join('; ')); process.exit(1); }
`;

interface Repo {
  readonly root: string;
  readonly tmp: string;
  readonly ranIn: string;
  write(path: string, text: string): void;
  git(...args: string[]): string;
}

function makeRepo(): Repo {
  const base = mkdtempSync(join(tmpdir(), 'mandate-hook-test-'));
  made.push(base);
  const root = join(base, 'repo');
  const tmp = join(base, 'tmp');
  mkdirSync(root);
  mkdirSync(tmp);
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  const git = (...args: string[]) => {
    if(process.env.MANDATE_NO_GIT === '1')throw Error('git is disabled for this run');
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  };
  git('init', '-q');
  write('.gitignore', 'node_modules/\n');
  write('package.json', JSON.stringify({ name: 'throwaway', private: true, workspaces: ['packages/*'] }));
  write('check.js', CHECK_JS);
  for (const [path, text] of Object.entries(GOOD)) write(path, text);
  // Dependencies as npm leaves them: a plain package, and the workspace package linked in by a junction.
  write('node_modules/dep/index.js', "module.exports = 'dep-ok';\n");
  write('node_modules/dep/SENTINEL.txt', 'still here\n');
  mkdirSync(join(root, 'node_modules', '@w'), { recursive: true });
  symlinkSync(join(root, 'packages', 'lib'), join(root, 'node_modules', '@w', 'lib'), process.platform === 'win32' ? 'junction' : 'dir');
  git('add', '-A');
  return { root, tmp, ranIn: join(base, 'ran-in.txt'), write, git };
}

const run = (repo: Repo) => stagedCheck({ root: repo.root, command: 'node check.js', env: { RAN_IN: repo.ranIn }, tmp: repo.tmp, log: () => {} });
const leftovers = (repo: Repo) => readdirSync(repo.tmp);

describe.skipIf(process.env.MANDATE_NO_GIT === '1')('the working tree and the index', () => {
  it('knows when they are equal, and when an unstaged edit or an untracked file makes them differ', () => {
    const repo = makeRepo();
    expect(treeEqualsIndex(repo.root)).toBe(true);
    repo.write('value.txt', 'edited\n');
    expect(treeEqualsIndex(repo.root)).toBe(false);
    repo.git('add', 'value.txt');
    expect(treeEqualsIndex(repo.root)).toBe(true);
    repo.write('new.txt', 'untracked\n');
    expect(treeEqualsIndex(repo.root)).toBe(false);
    repo.write('.gitignore', 'node_modules/\nnew.txt\n');
    repo.git('add', '.gitignore');
    expect(treeEqualsIndex(repo.root)).toBe(true);
  });
});

describe.skipIf(process.env.MANDATE_NO_GIT === '1')('the check on exactly what is being committed', () => {
  it('runs in place when the working tree equals the index', () => {
    const repo = makeRepo();
    const result = run(repo);
    expect(result).toMatchObject({ mode: 'in-place', status: 0, snapshot: null });
    expect(readFileSync(repo.ranIn, 'utf8')).toBe(repo.root);
  });

  it('passes a good staged tree beside an unstaged edit that would break the working tree', () => {
    const repo = makeRepo();
    repo.write('value.txt', 'broken by an unfinished edit\n');
    const result = run(repo);
    expect(result).toMatchObject({ mode: 'snapshot', status: 0 });
    expect(readFileSync(repo.ranIn, 'utf8')).not.toBe(repo.root);
  });

  it('fails a bad staged tree that a working-tree fix would hide (the old hook would pass it)', () => {
    const repo = makeRepo();
    repo.write('value.txt', 'bad\n');
    repo.git('add', 'value.txt');
    repo.write('value.txt', 'good\n');
    // The working tree, run in place, passes: this is what the old hook saw.
    expect(execFileSync('node', ['check.js'], { cwd: repo.root, env: { ...process.env, RAN_IN: repo.ranIn } }).length).toBe(0);
    const result = run(repo);
    expect(result.mode).toBe('snapshot');
    expect(result.status).not.toBe(0);
  });

  it('fails a staged tree that needs a file nobody staged (an untracked file)', () => {
    const repo = makeRepo();
    repo.git('rm', '-q', '--cached', 'extra.txt');
    // extra.txt stays on disk, untracked, so the working tree still passes.
    expect(existsSync(join(repo.root, 'extra.txt'))).toBe(true);
    const result = run(repo);
    expect(result.mode).toBe('snapshot');
    expect(result.status).not.toBe(0);
  });

  it('points the workspace packages at the snapshot, not at the unstaged working tree', () => {
    const repo = makeRepo();
    repo.write('packages/lib/index.js', "module.exports = 'v2 (unstaged)';\n");
    // check.js demands v1: it passes only if @w/lib resolves to the staged copy.
    expect(run(repo)).toMatchObject({ mode: 'snapshot', status: 0 });
    // And the reverse: v2 staged, v1 in the working tree, fails.
    repo.git('add', 'packages/lib/index.js');
    repo.write('packages/lib/index.js', "module.exports = 'v1';\n");
    expect(run(repo).status).not.toBe(0);
  });

  it('never carries the hook’s GIT_* variables into the check', () => {
    const repo = makeRepo();
    repo.write('value.txt', 'unstaged\n');
    const before = process.env.GIT_INDEX_FILE;
    process.env.GIT_INDEX_FILE = join(repo.root, '.git', 'index');
    try {
      // check.js fails if GIT_INDEX_FILE is set in the check's environment.
      expect(run(repo)).toMatchObject({ mode: 'snapshot', status: 0 });
    } finally {
      if (before === undefined) delete process.env.GIT_INDEX_FILE;
      else process.env.GIT_INDEX_FILE = before;
    }
  });
});

describe('cleaning up is safe', () => {
  it.skipIf(process.env.MANDATE_NO_GIT === '1')('removes the snapshot after a pass and after a fail, and leaves the real node_modules and the working tree alone', () => {
    const repo = makeRepo();
    repo.write('value.txt', 'unstaged\n');
    expect(run(repo).status).toBe(0);
    expect(leftovers(repo)).toEqual([]);
    repo.write('value.txt', 'bad\n');
    repo.git('add', 'value.txt');
    repo.write('value.txt', 'unstaged again\n');
    expect(run(repo).status).not.toBe(0);
    expect(leftovers(repo)).toEqual([]);
    expect(readFileSync(join(repo.root, 'node_modules', 'dep', 'SENTINEL.txt'), 'utf8')).toBe('still here\n');
    expect(readFileSync(join(repo.root, 'packages', 'lib', 'index.js'), 'utf8')).toBe("module.exports = 'v1';\n");
    expect(readFileSync(join(repo.root, 'value.txt'), 'utf8')).toBe('unstaged again\n');
  });

  it('refuses to delete a folder that is not a snapshot directly inside the temp folder (positive control)', () => {
    const repo = makeRepo();
    expect(() => removeSnapshot(repo.root, repo.tmp)).toThrow('refusing to delete');
    expect(() => removeSnapshot(repo.tmp, repo.tmp)).toThrow('refusing to delete');
    const wrongName = join(repo.tmp, 'something-else');
    mkdirSync(wrongName);
    expect(() => removeSnapshot(wrongName, repo.tmp)).toThrow('refusing to delete');
    const nested = join(repo.tmp, `${SNAPSHOT_PREFIX}outer`, `${SNAPSHOT_PREFIX}inner`);
    mkdirSync(nested, { recursive: true });
    expect(() => removeSnapshot(nested, repo.tmp)).toThrow('refusing to delete');
    expect(existsSync(wrongName)).toBe(true);
  });

  it('unlinks links first, so a link’s target is never touched', () => {
    const repo = makeRepo();
    const dest = join(repo.tmp, `${SNAPSHOT_PREFIX}manual`);
    mkdirSync(join(dest, 'node_modules'), { recursive: true });
    symlinkSync(join(repo.root, 'node_modules', 'dep'), join(dest, 'node_modules', 'dep'), process.platform === 'win32' ? 'junction' : 'dir');
    removeSnapshot(dest, repo.tmp);
    expect(existsSync(dest)).toBe(false);
    expect(readFileSync(join(repo.root, 'node_modules', 'dep', 'SENTINEL.txt'), 'utf8')).toBe('still here\n');
  });
});

describe('cleanup unlinks links at any depth (review N2)', () => {
  const kind = process.platform === 'win32' ? 'junction' : 'dir';

  it('lists links anywhere in a tree and never enters one', () => {
    const repo = makeRepo();
    const dest = join(repo.tmp, `${SNAPSHOT_PREFIX}deep`);
    const target = join(repo.root, 'node_modules', 'dep');
    mkdirSync(join(dest, 'node_modules', '@s', 'p'), { recursive: true });
    mkdirSync(join(dest, 'packages', 'k'), { recursive: true });
    symlinkSync(target, join(dest, 'node_modules', 'top'), kind);
    symlinkSync(target, join(dest, 'node_modules', '@s', 'p', 'inner'), kind);
    symlinkSync(target, join(dest, 'packages', 'k', 'link'), kind);
    const found = linksUnder(dest).map((p) => p.slice(dest.length + 1).split(/[\\/]/).join('/')).sort();
    expect(found).toEqual(['node_modules/@s/p/inner', 'node_modules/top', 'packages/k/link']);
  });

  it('removes a snapshot with links at depth 0, 2 and outside node_modules, and leaves every target intact', () => {
    const repo = makeRepo();
    const dest = join(repo.tmp, `${SNAPSHOT_PREFIX}deep2`);
    const target = join(repo.root, 'node_modules', 'dep');
    mkdirSync(join(dest, 'node_modules', '@s', 'p'), { recursive: true });
    mkdirSync(join(dest, 'packages', 'k'), { recursive: true });
    writeFileSync(join(dest, 'packages', 'k', 'own.txt'), 'mine\n');
    symlinkSync(target, join(dest, 'node_modules', 'top'), kind);
    symlinkSync(target, join(dest, 'node_modules', '@s', 'p', 'inner'), kind);
    symlinkSync(target, join(dest, 'packages', 'k', 'link'), kind);
    removeSnapshot(dest, repo.tmp);
    expect(existsSync(dest)).toBe(false);
    expect(readFileSync(join(target, 'SENTINEL.txt'), 'utf8')).toBe('still here\n');
    expect(readFileSync(join(target, 'index.js'), 'utf8')).toBe("module.exports = 'dep-ok';\n");
  });
});

describe('the workspace packages of a tree', () => {
  it('lists them by name, and refuses a workspace pattern it does not understand', () => {
    const repo = makeRepo();
    expect([...workspacePackages(repo.root).keys()]).toEqual(['@w/lib']);
    repo.write('package.json', JSON.stringify({ name: 'throwaway', workspaces: ['pkgs/**'] }));
    expect(() => workspacePackages(repo.root)).toThrow('not supported');
  });
});

describe('the hook itself', () => {
  const hook = readFileSync(new URL('../../.githooks/pre-commit', import.meta.url), 'utf8');

  it('runs this script, and no longer the check on the working tree', () => {
    const commands = hook.split(/\r?\n/).filter((line) => line.trim() !== '' && !line.trim().startsWith('#'));
    expect(commands).toEqual(['set -e', 'exec node --import tsx tools/staged-check.ts']);
  });

  // A snapshot has no .git, so this one question about git's index is asked only where there is a repository: in place, and in CI.
  it.skipIf(process.env.MANDATE_NO_GIT === '1' || !existsSync(new URL('../../.git', import.meta.url)))('is executable in git (Linux and macOS skip a hook that is not; asked only where a repository exists)', () => {
    const mode = execFileSync('git', ['ls-files', '-s', '.githooks/pre-commit'], { cwd: new URL('../../', import.meta.url), encoding: 'utf8' }).split(' ')[0];
    expect(mode).toBe('100755');
  });
});
