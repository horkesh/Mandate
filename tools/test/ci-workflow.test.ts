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

  it('excludes both git-fixture files only in the no-git lane, keeping the ordinary gate full', () => {
    const env: NodeJS.ProcessEnv = { ...process.env };
    delete env.CI;
    delete env.MANDATE_NO_GIT;
    const exclusions = (environment: NodeJS.ProcessEnv) => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e',
        "console.log(JSON.stringify((await import('./vitest.config.ts')).default.test.exclude))"],
      { cwd: new URL('../../', import.meta.url), env: environment, encoding: 'utf8' });
      expect(result.status, result.stderr).toBe(0);
      return JSON.parse(result.stdout) as string[];
    };
    expect(exclusions({ ...env, MANDATE_NO_GIT: '1' })).toEqual([
      'tools/test/staged-check.test.ts', 'tools/test/lfs-git.test.ts',
    ]);
    expect(exclusions(env)).toEqual([]);
    expect(exclusions({ ...env, MANDATE_NO_GIT: '0' })).toEqual([]);
  });

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

  it('runs the stopwatch files serially after the parallel suite, only on Linux (0115)', () => {
    const suite = all.check!.slice(all.check!.indexOf('- id: test'), all.check!.indexOf('- id: timing'));
    const timing = all.check!.slice(all.check!.indexOf('- id: timing'), all.check!.indexOf('- id: no_skips'));
    expect(suite).not.toContain('MANDATE_TIMING');
    expect(timing).toContain("matrix.os == 'ubuntu-24.04'");
    expect(timing).toContain("MANDATE_TIMING: '1'");
    expect(timing).toContain('--no-file-parallelism');
    for (const file of ['packages/cli/test/done-check.test.ts', 'packages/cli/test/planner.test.ts', 'packages/kernel/test/map-performance.test.ts']) expect(timing).toContain(file);
    expect(timing).not.toContain('continue-on-error');
    expect(all.check!.indexOf('- id: test')).toBeLessThan(all.check!.indexOf('- id: timing'));
    expect(all.check).toContain('wall-clock budget tests | $TIMING');
  });

  it('proves on the Linux job that the timed tests ran: it fails when any test is skipped (lane 1.14, from 0086)', () => {
    const step = all.check!.slice(all.check!.indexOf('- id: no_skips'), all.check!.indexOf('- id: boundary'));
    expect(step).toMatch(/matrix\.os == 'ubuntu-24\.04'/);
    // It reads the report the test step writes, on the same job, after it.
    expect(step).toContain('run: npx tsx tools/no-skips.ts runs/ci/timing.json');
    expect(all.check!.indexOf('- id: timing')).toBeLessThan(all.check!.indexOf('- id: no_skips'));
    expect(all.check).toContain('--outputFile.json=runs/ci/timing.json');
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
    expect(all.check).toMatch(/npm run run:done-check -- --label ci-determinism/);
    expect(all.determinism).toMatch(/needs: check/);
    expect(all.determinism).toMatch(/compare-runs\.ts ci-results\/determinism-ubuntu-24\.04 ci-results\/determinism-windows-2025/);
  });

  it('makes only the Windows done-check budget advisory and puts its timings in the job summary (0117)', () => {
    const step = all.check!.slice(all.check!.indexOf('- id: done_check'), all.check!.indexOf('- id: upload'));
    expect(step).toContain("${{ matrix.os == 'windows-2025' && '--budget-advisory' || '' }}");
    expect(step).toContain('npm run run:done-check -- --label ci-determinism');
    expect(step).not.toContain('continue-on-error');
    expect(workflow.match(/--budget-advisory/g)).toHaveLength(1);
    expect(step).toContain('tee -a "$GITHUB_STEP_SUMMARY"');
    expect(step).toContain('shell: bash');
    expect(step).toContain('set -o pipefail');
    expect(step).toContain('exit "$status"');
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
