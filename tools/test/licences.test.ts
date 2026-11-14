import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { checkLockfiles, findLockfiles, licenceAllowed, licenceProblems } from '../licences.ts';

const REPO = fileURLToPath(new URL('../../', import.meta.url));

describe('every lockfile in the repository is checked', () => {
  it('finds the workspace lockfile and the map prototype lockfile, and nothing under node_modules', () => {
    const found = findLockfiles(REPO);
    expect(found).toContain('package-lock.json');
    expect(found).toContain('prototypes/map-tripwire/package-lock.json');
    expect(found.filter((f) => f.includes('node_modules') || f.startsWith('.'))).toEqual([]);
  });

  it('checks the prototype lockfile: its packages are counted and pass', () => {
    const report = checkLockfiles(REPO).find((r) => r.file === 'prototypes/map-tripwire/package-lock.json');
    expect(report?.unreadable).toBeUndefined();
    expect(report?.checked).toBeGreaterThan(10);
    expect(report?.problems).toEqual([]);
  });

  const scratch = mkdtempSync(join(tmpdir(), 'mandate-licences-'));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));
  const lock = (deps: Record<string, { license?: string; dev?: boolean }>) =>
    JSON.stringify({ lockfileVersion: 3, packages: { '': {}, ...Object.fromEntries(Object.entries(deps).map(([k, v]) => [`node_modules/${k}`, v])) } });
  const put = (rel: string, text: string) => {
    mkdirSync(join(scratch, rel, '..'), { recursive: true });
    writeFileSync(join(scratch, rel), text);
  };

  it('reports a bad licence in a nested prototype lockfile, skipping node_modules and dot-folders (positive control)', () => {
    put('package-lock.json', lock({ ok: { license: 'MIT', dev: true } }));
    put('prototypes/spike/package-lock.json', lock({ copyleft: { license: 'GPL-3.0', dev: true } }));
    put('prototypes/spike/node_modules/dep/package-lock.json', lock({ ignored: { license: 'GPL-3.0' } }));
    put('.claude/worktrees/other/package-lock.json', lock({ ignored: { license: 'GPL-3.0' } }));
    expect(findLockfiles(scratch)).toEqual(['package-lock.json', 'prototypes/spike/package-lock.json']);
    const bad = checkLockfiles(scratch).flatMap((r) => r.problems.map((p) => `${r.file}: ${p.path}`));
    expect(bad).toEqual(['prototypes/spike/package-lock.json: node_modules/copyleft']);
  });
});

describe('dependency licence check (decision 0035)', () => {
  it('allows permissive licences and SPDX expressions built from them', () => {
    for (const ok of ['MIT', 'Apache-2.0', 'ISC', '(MIT OR CC0-1.0)', 'MIT AND BSD-3-Clause', 'Apache-2.0 WITH LLVM-exception', '(MIT OR GPL-3.0)']) {
      expect(licenceAllowed(ok, false), ok).toBe(true);
    }
  });

  it('fails GPL, AGPL, LGPL, unknown and malformed licences', () => {
    for (const bad of ['GPL-3.0', 'GPL-2.0-only', 'AGPL-3.0', 'LGPL-2.1', 'SSPL-1.0', 'UNLICENSED', 'SEE LICENSE IN LICENSE.md', 'MIT AND GPL-3.0', '(MIT', '']) {
      expect(licenceAllowed(bad, true), bad).toBe(false);
    }
  });

  it('allows MPL-2.0 for development tools only', () => {
    expect(licenceAllowed('MPL-2.0', true)).toBe(true);
    expect(licenceAllowed('MPL-2.0', false)).toBe(false);
  });

  it('reports problems across a lockfile, skipping our own workspace links', () => {
    const problems = licenceProblems({
      '': {},
      'node_modules/ok': { license: 'MIT', dev: true },
      'node_modules/@mandate/kernel': { link: true },
      'node_modules/copyleft': { license: 'GPL-3.0', dev: true },
      'node_modules/a/node_modules/nested': { dev: true },
      'node_modules/css-tool': { license: 'MPL-2.0' },
    });
    expect(problems.map((p) => `${p.path}: ${p.reason}`)).toEqual([
      'node_modules/a/node_modules/nested: no licence recorded',
      'node_modules/copyleft: not on the allow-list',
      'node_modules/css-tool: allowed for development tools only, and this is a runtime dependency',
    ]);
  });
});
