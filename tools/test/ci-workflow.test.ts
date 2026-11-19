import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * Rules that matter become checks (CLAUDE.md rule 7): CI must run every part
 * of `npm run check` (the pre-commit hook), on Linux and Windows, compare the
 * two machines' hashes, and report the outcome of every step it has.
 */
const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> };

/** The text of each job under `jobs:`, keyed by job id. */
function jobs(text: string): Record<string, string> {
  const body = text.slice(text.indexOf('\njobs:\n'));
  const out: Record<string, string> = {};
  const heads = [...body.matchAll(/^ {2}([a-z][a-z0-9_-]*):\s*$/gm)];
  heads.forEach((m, i) => {
    out[m[1]!] = body.slice(m.index, heads[i + 1]?.index ?? body.length);
  });
  return out;
}

describe('the CI workflow', () => {
  const all = jobs(workflow);

  it('refuses any MANDATE_NO_GIT setting in CI before test exclusion can hide a file', () => {
    const env: NodeJS.ProcessEnv = { ...process.env, CI: 'true' };
    delete env.MANDATE_NO_GIT;
    const load = (environment: NodeJS.ProcessEnv) => spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', "await import('./vitest.config.ts')"], { cwd: new URL('../../', import.meta.url), env: environment, encoding: 'utf8' });
    expect(load(env).status).toBe(0);
    for (const value of ['', '0', '1']) {
      const result = load({ ...env, MANDATE_NO_GIT: value });
      expect(result.status, `CI value ${JSON.stringify(value)}`).not.toBe(0);
      expect(result.stderr).toContain('MANDATE_NO_GIT must be unset in CI');
    }
  });

  it('runs every part of npm run check as its own step', () => {
    const parts = pkg.scripts.check!.split('&&').map((s) => s.trim().replace(/^npm run /, ''));
    expect(parts.length).toBeGreaterThan(2);
    for (const part of parts) {
      expect(all.check, part).toMatch(new RegExp(`run: npm run ${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'm'));
    }
  });

  it('runs the wall-clock budget tests on the Linux job (lane 1.0t: the pre-commit hook leaves them off)', () => {
    expect(all.check).toMatch(/MANDATE_TIMING: \$\{\{ matrix\.os == 'ubuntu-24\.04' && '1' \|\| '' \}\}/);
    expect(all.check).toContain('wall-clock budget tests');
  });

  it('runs on pinned Linux and Windows images, never a moving -latest label', () => {
    expect(all.check).toMatch(/os: \[ubuntu-24\.04, windows-2025\]/);
    expect(workflow).not.toMatch(/-latest\b/);
  });

  it('compares both machines’ determinism summaries', () => {
    // M2's headless runner retired with M2 (lane 1.13): CI no longer runs it.
    expect(all.check).not.toMatch(/run:headless/);
    // The seats layer's run hashes every day, replays its log and resumes from a save (lane 0.6).
    expect(all.check).toMatch(/run: npm run run:seats -- testbed \d+ --resume-at \d+ --label ci-determinism/);
    // The Phase 0 done check (lane 0.8) hashes every day on both packs and writes the summaries the comparison reads.
    expect(all.check).toMatch(/run: npm run run:done-check -- --label ci-determinism/);
    expect(all.determinism).toMatch(/needs: check/);
    expect(all.determinism).toMatch(/compare-runs\.ts ci-results\/determinism-ubuntu-24\.04 ci-results\/determinism-windows-2025/);
  });

  it('fetches no LFS objects on any checkout, and refuses art pushed into plain git (lane 0.7l)', () => {
    // Every CI download of an LFS object counts against the owner's bandwidth (docs/design/ASSETS.md 0.7).
    const checkouts = [...workflow.matchAll(/uses: actions\/checkout@\S+\n((?: {8}.*\n)*)/g)];
    expect(checkouts.length).toBeGreaterThan(1);
    for (const m of checkouts) expect(m[1], 'a checkout step').toMatch(/^ {8}with:\n(?: {10}#.*\n)* {10}lfs: false$/m);
    expect(workflow).not.toMatch(/lfs: true/);
    expect(workflow).not.toMatch(/git lfs (pull|fetch|checkout)/);
    // Every commit pushed, not only the tip (the review of lane 0.7l): a --no-verify commit later deleted still leaves its
    // blob in public history. So the check job fetches the whole history.
    expect(all.check).toMatch(/run: npx tsx tools\/lfs-check\.ts --history HEAD/);
    expect(all.check).toMatch(/uses: actions\/checkout@\S+\n {8}with:\n(?: {10}.*\n)* {10}fetch-depth: 0\n/);
  });

  it('reports the outcome of every step that has an id (honest CI)', () => {
    for (const [name, job] of Object.entries(all)) {
      const ids = [...job.matchAll(/- id: ([a-z_]+)/g)].map((m) => m[1]!);
      expect(ids.length, name).toBeGreaterThan(0);
      const summary = job.slice(job.indexOf('name: Steps that ran'));
      expect(summary, name).toMatch(/if: \$\{\{ always\(\) \}\}/);
      for (const id of ids) expect(summary, `${name}: step ${id}`).toContain(`steps.${id}.outcome`);
    }
  });

  it('gives every step except the summary an id, so none can run unreported', () => {
    for (const [name, job] of Object.entries(all)) {
      const steps = job.split(/\n {6}- /).slice(1);
      const unnamed = steps.filter((s) => !s.startsWith('id: ') && !s.startsWith('name: Steps that ran'));
      expect(unnamed, name).toEqual([]);
    }
  });
});
