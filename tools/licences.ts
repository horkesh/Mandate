/**
 * Dependency licences (decision 0035): every installed package's licence must
 * be on the allow-list. GPL, AGPL, LGPL, missing and unknown licences fail.
 * MPL-2.0 (file-level copyleft) is allowed only for development tools, which
 * never ship in the game.
 *
 * Reads every `package-lock.json` in the repository (lockfile v3 records each
 * package's licence), so it covers self-contained prototypes outside the npm
 * workspaces, and platform packages not installed on this machine.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Permissive licences, allowed for any dependency. SPDX ids. */
export const ALLOWED: readonly string[] = [
  '0BSD',
  'Apache-2.0',
  'BlueOak-1.0.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'CC0-1.0',
  'ISC',
  'MIT',
  'Unlicense',
  'Zlib',
];

/** Allowed only for development dependencies (never bundled into the game). */
export const ALLOWED_DEV_ONLY: readonly string[] = ['MPL-2.0'];

export interface LockEntry {
  readonly license?: unknown;
  readonly dev?: boolean;
  readonly link?: boolean;
}

export interface LicenceProblem {
  readonly path: string;
  readonly licence: string;
  readonly reason: string;
}

/**
 * Whether an SPDX expression is acceptable: `A OR B` needs one side allowed,
 * `A AND B` needs both; `X WITH exception` is judged by `X`; parentheses group.
 */
export function licenceAllowed(expression: string, dev: boolean): boolean {
  const allowed = (id: string) => ALLOWED.includes(id) || (dev && ALLOWED_DEV_ONLY.includes(id));
  const tokens = expression.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/).filter(Boolean);
  let pos = 0;
  const parseOr = (): boolean => {
    let result = parseAnd();
    while (tokens[pos] === 'OR') {
      pos++;
      const right = parseAnd();
      result = result || right;
    }
    return result;
  };
  const parseAnd = (): boolean => {
    let result = parseAtom();
    while (tokens[pos] === 'AND') {
      pos++;
      const right = parseAtom();
      result = result && right;
    }
    return result;
  };
  const parseAtom = (): boolean => {
    const token = tokens[pos++];
    if (token === undefined) throw new Error(`incomplete licence expression "${expression}"`);
    if (token === '(') {
      const inner = parseOr();
      if (tokens[pos++] !== ')') throw new Error(`unbalanced licence expression "${expression}"`);
      return inner;
    }
    if (tokens[pos] === 'WITH') pos += 2;
    return allowed(token.replace(/\+$/, ''));
  };
  try {
    const result = parseOr();
    return pos === tokens.length && result;
  } catch {
    return false;
  }
}

/**
 * Every `package-lock.json` under `root`, repo-relative with forward slashes,
 * sorted: the workspace's own and each self-contained prototype's. Skips
 * `node_modules`, `runs` and dot-folders (`.git`, and `.claude`, which holds
 * other sessions' worktrees).
 */
export function findLockfiles(root: string, dir = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'runs' || entry.name.startsWith('.')) continue;
      out.push(...findLockfiles(root, rel));
    } else if (entry.name === 'package-lock.json') {
      out.push(rel);
    }
  }
  return out.sort();
}

export interface LockfileReport {
  readonly file: string;
  readonly checked: number;
  readonly problems: readonly LicenceProblem[];
  /** Set when the file is not a usable lockfile v3. */
  readonly unreadable?: string;
}

/** Check every lockfile under `root`. */
export function checkLockfiles(root: string): LockfileReport[] {
  return findLockfiles(root).map((file) => {
    const lock = JSON.parse(readFileSync(join(root, file), 'utf8')) as { lockfileVersion?: number; packages?: Record<string, LockEntry> };
    if (lock.lockfileVersion !== 3 || !lock.packages) return { file, checked: 0, problems: [], unreadable: 'not lockfile v3' };
    const checked = Object.entries(lock.packages).filter(([path, e]) => path.includes('node_modules/') && !e.link).length;
    return { file, checked, problems: licenceProblems(lock.packages) };
  });
}

/** Problems across a lockfile's `packages` map. Workspace links (our own packages) are skipped. */
export function licenceProblems(packages: Readonly<Record<string, LockEntry>>): LicenceProblem[] {
  const problems: LicenceProblem[] = [];
  for (const path of Object.keys(packages).sort()) {
    if (!path.includes('node_modules/')) continue;
    const entry = packages[path]!;
    if (entry.link) continue;
    const licence = typeof entry.license === 'string' ? entry.license : '';
    if (licence === '') {
      problems.push({ path, licence: '(none)', reason: 'no licence recorded' });
    } else if (!licenceAllowed(licence, entry.dev === true)) {
      const devOnly = ALLOWED_DEV_ONLY.some((id) => licence.includes(id)) && entry.dev !== true;
      problems.push({ path, licence, reason: devOnly ? 'allowed for development tools only, and this is a runtime dependency' : 'not on the allow-list' });
    }
  }
  return problems;
}
