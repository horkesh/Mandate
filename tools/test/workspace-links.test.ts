import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { nodeResolves, workspaceLinkProblems, workspacePackages } from '../workspace-links.ts';

/**
 * `@mandate/*` must resolve to the checkout under test (hard rule 7). A worktree whose node_modules has no
 * `@mandate` links resolves to the main checkout's packages, and its cli, rule-seats and pack-format tests then
 * run against the wrong kernel (lane 0.8's finding). This fails in such a worktree; fix it by linking the four
 * packages into `node_modules/@mandate` (a junction on Windows), or run `npm install`.
 */
const root = fileURLToPath(new URL('../../', import.meta.url));

/** A checkout in a temporary folder: packages with names, and optionally node_modules/@mandate links to them. */
function checkout(parent: string, name: string, linked: boolean): string {
  const dir = join(parent, name);
  for (const pkg of ['kernel', 'cli']) {
    mkdirSync(join(dir, 'packages', pkg), { recursive: true });
    writeFileSync(join(dir, 'packages', pkg, 'package.json'), JSON.stringify({ name: `@mandate/${pkg}` }));
  }
  mkdirSync(join(dir, 'node_modules', '@mandate'), { recursive: true });
  if (linked) for (const pkg of ['kernel', 'cli']) symlinkSync(join(dir, 'packages', pkg), join(dir, 'node_modules', '@mandate', pkg), 'junction');
  return dir;
}

describe('workspace packages resolve to this checkout', () => {
  it('every @mandate package resolves under the repository root under test', () => {
    expect(workspacePackages(root).map((p) => p.name)).toEqual(['@mandate/cli', '@mandate/kernel', '@mandate/pack-format', '@mandate/rule-seats']);
    expect(workspaceLinkProblems(root)).toEqual([]);
  });

  it('positive control: a worktree with no @mandate links resolves to the checkout above it, and fails', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'mandate-links-'));
    try {
      const main = checkout(tmp, 'main', true);
      expect(workspaceLinkProblems(main)).toEqual([]);
      // A worktree nested under main, as the app makes them (.claude/worktrees/<name>), with its own node_modules but no links.
      const worktree = checkout(join(main, '.claude', 'worktrees'), 'lane', false);
      const problems = workspaceLinkProblems(worktree);
      expect(problems).toHaveLength(2);
      expect(problems[0]).toContain('@mandate/cli resolves to');
      expect(problems[0]).toContain('another checkout');
      expect(nodeResolves(worktree, '@mandate/kernel')).toContain(join('main', 'packages', 'kernel'));
      // Linking its own packages fixes it.
      const fixed = checkout(join(main, '.claude', 'worktrees'), 'fixed', true);
      expect(workspaceLinkProblems(fixed)).toEqual([]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('positive control: a package linked to another root, or to none, fails', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'mandate-links-'));
    try {
      const other = checkout(tmp, 'other', true);
      const here = checkout(tmp, 'here', true);
      rmSync(join(here, 'node_modules', '@mandate', 'kernel'), { recursive: true });
      symlinkSync(join(other, 'packages', 'kernel'), join(here, 'node_modules', '@mandate', 'kernel'), 'junction');
      expect(workspaceLinkProblems(here)).toEqual([expect.stringContaining('@mandate/kernel resolves to')]);
      rmSync(join(here, 'node_modules', '@mandate', 'cli'), { recursive: true });
      expect(workspaceLinkProblems(here).join('\n')).not.toContain('@mandate/cli resolves to');
      expect(nodeResolves(here, '@mandate/nothing')).toBeNull();
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
