import { describe, expect, it } from 'vitest';
import { licenceAllowed, licenceProblems } from '../licences.ts';

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
