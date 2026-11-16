import { readFileSync } from 'node:fs';
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

  it('proves on the Linux job that the timed tests ran: it fails when any test is skipped (lane 1.14, from 0086)', () => {
    const step = all.check!.slice(all.check!.indexOf('- id: no_skips'), all.check!.indexOf('- id: boundary'));
    expect(step).toMatch(/matrix\.os == 'ubuntu-24\.04'/);
    // It reads the report the test step writes, on the same job, after it.
    expect(step).toContain('run: npx tsx tools/no-skips.ts runs/ci/vitest.json');
    expect(all.check!.indexOf('- id: test')).toBeLessThan(all.check!.indexOf('- id: no_skips'));
    expect(all.check).toContain('--outputFile.json=runs/ci/vitest.json');
  });

  it('runs on pinned Linux and Windows images, never a moving -latest label', () => {
    expect(all.check).toMatch(/os: \[ubuntu-24\.04, windows-2025\]/);
    expect(workflow).not.toMatch(/-latest\b/);
  });

  it('compares both machines’ determinism summaries', () => {
    expect(all.check).toMatch(/run: npm run run:headless -- testbed/);
    // The seats layer's run hashes every day, replays its log and resumes from a save (lane 0.6).
    expect(all.check).toMatch(/run: npm run run:seats -- testbed \d+ --resume-at \d+ --label ci-determinism/);
    // The Phase 0 done check (lane 0.8) hashes every day on both packs and writes the summaries the comparison reads.
    expect(all.check).toMatch(/run: npm run run:done-check -- --label ci-determinism/);
    expect(all.determinism).toMatch(/needs: check/);
    expect(all.determinism).toMatch(/compare-runs\.ts ci-results\/determinism-ubuntu-24\.04 ci-results\/determinism-windows-2025/);
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
