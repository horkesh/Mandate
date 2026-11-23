import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Criterion, DoneCheckResult, DoneRun } from '../src/done-check.ts';
import type { Phase0Summary } from '../src/phase0-run.ts';

// Exercise the CLI itself without running another campaign. Only the expensive
// runner and output files are replaced; the budget scorer and exit call are real.
const planted = vi.hoisted(() => ({ result: undefined as DoneCheckResult | undefined }));
vi.mock('../src/done-check.ts', async (original) => ({
  ...await original<typeof import('../src/done-check.ts')>(),
  runDoneCheck: () => planted.result!,
}));
vi.mock('../src/io/runs.ts', () => ({ createRunDir: vi.fn(() => 'planted-report'), writeRunFile: vi.fn() }));

import { budgetProblems } from '../src/done-check.ts';
import { writeRunFile } from '../src/io/runs.ts';

const phase0 = ['behaviour', 'hash', 'resume', 'liveness', 'section-ten', 'budget'] as const;
const phase1A = ['checkpoints', 'operation', 'pushback', 'unknown-strength', 'stand-ins', 'lever-sweep'] as const;
const argv = process.argv;

afterEach(() => {
  process.argv = argv;
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

async function run(args: string[], failure?: Criterion['id'], slow = true) {
  const timing = { unit: 'ms' as const, days: 120, median: slow ? 80 : 20, p95: slow ? 320 : 40, max: slow ? 400 : 60 };
  const timed = { timing } as Phase0Summary;
  const budget = budgetProblems({ name: 'planted timing', timed });
  const criteria: Criterion[] = [...phase0, ...phase1A].map((id) => ({
    id, milestone: phase0.includes(id as typeof phase0[number]) ? 'phase0' : '1A', text: `criterion ${id}`,
    problems: id === 'budget' ? budget : id === failure ? [`planted ${id} failure`] : [],
    evidence: id === 'budget' ? [`median ${timing.median} ms; p95 ${timing.p95} ms`] : [],
  }));
  planted.result = {
    criteria, runs: [{ name: 'planted timing', timed } as DoneRun], history: [],
    passed: criteria.filter((c) => c.milestone === 'phase0').every((c) => c.problems.length === 0),
    passed1A: criteria.every((c) => c.problems.length === 0),
  };
  process.argv = [process.execPath, 'run-done-check.ts', '--no-drafting', ...args];
  const exitSignal = new Error('CLI exit');
  const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw exitSignal; });
  const output = vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.resetModules();
  await expect(import('../src/run-done-check.ts')).rejects.toBe(exitSignal);
  return { exit: exit.mock.calls[0]![0], output: output.mock.calls.flat().join('\n'), criteria };
}

describe('done-check CLI budget policy (0117)', () => {
  it('keeps a planted slow budget binding by default', async () => {
    const result = await run([]);
    expect(result.exit).toBe(1);
    expect(result.output).toContain('FAIL  [budget]');
    expect(result.output).toContain('over the 40 ms budget');
    expect(result.output).not.toContain('advisory');
  });

  it.each([{ args: [] }, { args: ['--milestone', '1a'] }])('reports the same slow budget in full but exits zero with --budget-advisory $args', async ({ args }) => {
    const result = await run(['--budget-advisory', ...args]);
    expect(result.exit).toBe(0);
    expect(result.output).toContain('FAIL  [budget]');
    expect(result.output).toContain('median 80 ms; p95 320 ms');
    expect(result.output).toContain('median 80.0 ms a day, over the 40 ms budget');
    expect(result.output).toContain('p95 320.0 ms a day, over 4 times the budget');
    expect(result.output).toContain('median 80.00 ms, p95 320.00 ms, max 400.00 ms over 120 days');
    expect(result.output).toContain('advisory');
    expect(writeRunFile).toHaveBeenCalledWith('planted-report', 'criteria.json', `${JSON.stringify(result.criteria, null, 2)}\n`);
  });

  it.each(phase0.filter((id) => id !== 'budget'))('still exits one for a %s failure with an advisory slow budget', async (id) => {
    const result = await run(['--budget-advisory'], id);
    expect(result.exit).toBe(1);
    expect(result.output).toContain(`FAIL  [${id}]`);
  });

  it.each(phase1A)('still binds 1A %s under --milestone 1a with an advisory slow budget', async (id) => {
    const result = await run(['--budget-advisory', '--milestone', '1a'], id);
    expect(result.exit).toBe(1);
    expect(result.output).toContain(`FAIL  [${id}]`);
  });

  it('keeps 1A failures nonbinding without --milestone 1a', async () => {
    expect((await run(['--budget-advisory'], 'checkpoints')).exit).toBe(0);
  });

  it.each([[], ['--budget-advisory']])('exits zero for a passing budget %j', async (...args) => {
    const result = await run(args, undefined, false);
    expect(result.exit).toBe(0);
    expect(result.output).toContain('PASS  [budget]');
  });
});
