#!/usr/bin/env node
/**
 * The pre-commit check, on exactly what is being committed (tooling batch;
 * lane 0.1's finding 4: the old hook ran `npm run check` on the working tree,
 * so a commit made beside unstaged edits, or needing an untracked file, was
 * never checked on its own).
 *
 * Two cases:
 * - the working tree equals the index (no unstaged edits, no untracked files
 *   that are not ignored): run the check in place, as before;
 * - otherwise: write the exact index to a private snapshot in the temp folder,
 *   give it node_modules, run the check there, and delete the snapshot. The
 *   working tree is never touched, so there is nothing to restore and nothing
 *   that can be lost. (Stashing with `--keep-index` was rejected: the stash
 *   stack is shared by every worktree and session here, and a restore can fail
 *   half way.)
 *
 * The snapshot's node_modules is a real folder of links to the real
 * node_modules, except the workspace packages, whose links point at the
 * snapshot's own copies; otherwise tests would import the working tree's
 * unstaged packages and test the wrong code. Links are junctions on Windows
 * (no privilege needed) and symlinks elsewhere. Cleanup unlinks every link
 * anywhere in the snapshot before deleting anything and refuses to delete a folder that still holds
 * one, so a failure can leave a temp folder behind but never delete
 * node_modules (a junction once wiped AWWV's main checkout; docs/LANES.md).
 *
 * `git commit -a` and `git commit <paths>` build a temporary index: the hook
 * inherits `GIT_INDEX_FILE`, so `git checkout-index` and `git diff` below see
 * that index, which is exactly the commit. The check itself runs without any
 * `GIT_*` variable, since the snapshot is not a repository.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, rmdirSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export const SNAPSHOT_PREFIX = 'mandate-staged-';
export const DEFAULT_COMMAND = 'npm run --silent check';

const git = (root: string, args: readonly string[]): string => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

/** Whether the working tree equals the index: no unstaged edits to tracked files, no untracked files that are not ignored. */
export function treeEqualsIndex(root: string): boolean {
  const diff = spawnSync('git', ['diff', '--quiet'], { cwd: root, encoding: 'utf8' });
  if (diff.status !== 0 && diff.status !== 1) throw new Error(`git diff failed: ${diff.stderr}`);
  if (diff.status === 1) return false;
  return git(root, ['ls-files', '--others', '--exclude-standard']).trim() === '';
}

/** Write the index, exactly, under `dest` (no `.git`). */
export function writeSnapshot(root: string, dest: string): void {
  // `--prefix` wants forward slashes and a trailing one, also on Windows.
  git(root, ['checkout-index', '--all', '--force', `--prefix=${dest.split(sep).join('/')}/`]);
}

function link(target: string, path: string): void {
  symlinkSync(target, path, process.platform === 'win32' ? 'junction' : 'dir');
}

/** The workspace package folders in a tree, by package name (`@mandate/kernel` to `packages/kernel`). */
export function workspacePackages(tree: string): Map<string, string> {
  const manifest = JSON.parse(readFileSync(join(tree, 'package.json'), 'utf8')) as { workspaces?: string[] };
  const folders: string[] = [];
  for (const pattern of manifest.workspaces ?? []) {
    if (pattern.endsWith('/*')) {
      const parent = join(tree, pattern.slice(0, -2));
      if (!existsSync(parent)) continue;
      for (const entry of readdirSync(parent, { withFileTypes: true })) if (entry.isDirectory()) folders.push(join(parent, entry.name));
    } else if (!pattern.includes('*')) {
      folders.push(join(tree, pattern));
    } else {
      throw new Error(`workspace pattern "${pattern}" is not supported by tools/staged-check.ts`);
    }
  }
  const out = new Map<string, string>();
  for (const folder of folders.sort()) {
    const file = join(folder, 'package.json');
    if (existsSync(file)) out.set((JSON.parse(readFileSync(file, 'utf8')) as { name: string }).name, folder);
  }
  return out;
}

/**
 * Give the snapshot a node_modules: links to every real top-level entry (and
 * to the children of each scope), except the workspace packages, which link
 * to the snapshot's own folders. Returns every link made, for cleanup.
 */
export function linkNodeModules(root: string, dest: string): string[] {
  const real = join(root, 'node_modules');
  if (!existsSync(real)) throw new Error('node_modules is missing; run npm install first');
  const own = workspacePackages(dest);
  const links: string[] = [];
  const modules = join(dest, 'node_modules');
  mkdirSync(modules);
  const put = (relativeName: string, target: string): void => {
    const path = join(modules, ...relativeName.split('/'));
    mkdirSync(dirname(path), { recursive: true });
    link(target, path);
    links.push(path);
  };
  for (const entry of readdirSync(real, { withFileTypes: true })) {
    const source = join(real, entry.name);
    if (entry.name.startsWith('@')) {
      for (const child of readdirSync(source, { withFileTypes: true })) {
        if (!own.has(`${entry.name}/${child.name}`)) put(`${entry.name}/${child.name}`, join(source, child.name));
      }
    } else if (own.has(entry.name)) {
      continue;
    } else if (entry.isFile()) {
      copyFileSync(source, join(modules, entry.name));
    } else {
      put(entry.name, source);
    }
  }
  for (const [name, folder] of own) put(name, folder);
  return links;
}

/**
 * Every link (symlink or junction) anywhere under `dir`, at any depth. It lists
 * a link and never enters it, so it cannot walk into a real node_modules.
 */
export function linksUnder(dir: string): string[] {
  const found: string[] = [];
  const walk = (folder: string): void => {
    for (const entry of readdirSync(folder)) {
      const path = join(folder, entry);
      const info = lstatSync(path);
      if (info.isSymbolicLink()) found.push(path);
      else if (info.isDirectory()) walk(path);
    }
  };
  if (existsSync(dir)) walk(dir);
  return found;
}

/**
 * Remove the snapshot: unlink every link anywhere in it first, and delete
 * nothing if one remains. Throws if it cannot. (A junction placed deeper than
 * the hook itself puts one is unlinked too, so cleanup never relies on how a
 * given Node's `rmSync` treats junctions.)
 */
export function removeSnapshot(dest: string, tmp: string = tmpdir()): void {
  const inside = relative(resolve(tmp), resolve(dest));
  if (inside === '' || inside.startsWith('..') || basename(dest).indexOf(SNAPSHOT_PREFIX) !== 0 || dirname(resolve(dest)) !== resolve(tmp)) {
    throw new Error(`refusing to delete ${dest}: it is not a snapshot folder directly inside ${tmp}`);
  }
  for (const path of linksUnder(dest)) {
    try {
      unlinkSync(path);
    } catch {
      rmdirSync(path);
    }
  }
  const left = linksUnder(dest);
  if (left.length > 0) throw new Error(`not deleting ${dest}: links remain (${left.join(', ')})`);
  rmSync(dest, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
/** The environment for the check: the caller's, without any GIT_* variable (the snapshot is not a repository). */
function cleanEnv(extra: Readonly<Record<string, string>>): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [k, v] of Object.entries(process.env)) if (!/^GIT_/i.test(k) && v !== undefined) env[k] = v;
  return { ...env, ...extra };
}

function run(command: string, cwd: string, extraEnv: Readonly<Record<string, string>>): number {
  const r = spawnSync(command, { cwd, stdio: 'inherit', shell: true, env: cleanEnv(extraEnv) });
  return r.status ?? 1;
}

/**
 * Run `command` on exactly what is being committed. Returns how it ran and its exit status.
 * `tmp` is where a snapshot goes; `log` receives the one-line account of what was done.
 */
export interface StagedCheckOptions {
  readonly root: string;
  readonly command?: string;
  readonly env?: Readonly<Record<string, string>>;
  readonly tmp?: string;
  readonly log?: (line: string) => void;
}

export interface StagedCheckResult {
  readonly mode: 'in-place' | 'snapshot';
  readonly status: number;
  /** The snapshot folder that was used (already removed), or null when the check ran in place. */
  readonly snapshot: string | null;
}

export function stagedCheck({ root, command = DEFAULT_COMMAND, env = {}, tmp = tmpdir(), log = (line: string) => console.error(line) }: StagedCheckOptions): StagedCheckResult {
  if (treeEqualsIndex(root)) {
    log('pre-commit: the working tree equals the index; checking it in place.');
    return { mode: 'in-place', status: run(command, root, env), snapshot: null };
  }
  log('pre-commit: there are unstaged or untracked changes; checking the exact staged tree in a snapshot (the working tree is not touched).');
  const dest = mkdtempSync(join(tmp, SNAPSHOT_PREFIX));
  let status = 1;
  try {
    writeSnapshot(root, dest);
    linkNodeModules(root, dest);
    status = run(command, dest, env);
  } finally {
    try {
      removeSnapshot(dest, tmp);
    } catch (e) {
      log(`pre-commit: could not remove the snapshot ${dest}: ${(e as Error).message}`);
    }
  }
  return { mode: 'snapshot', status, snapshot: dest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  process.exit(stagedCheck({ root }).status);
}
