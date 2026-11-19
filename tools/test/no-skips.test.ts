import { describe, expect, it } from 'vitest';
import { skipProblems, TIMED_TESTS, type VitestReport } from '../no-skips.ts';

/**
 * CI's Linux job proves the timing gate is open (lane 1.14, from 0086): it fails when any test is skipped, and names the
 * stopwatch tests it expects to have run. A report shaped as vitest's JSON writes it.
 */
const passed = (fullName: string) => ({ fullName, status: 'passed' });
const report = (over: Partial<VitestReport> = {}): VitestReport => ({
  numTotalTests: 4,
  numPendingTests: 0,
  numTodoTests: 0,
  testResults: [
    ...TIMED_TESTS.map((t) => ({ name: `/ci/repo/${t.file}`, assertionResults: [passed(`a suite ${t.title} (wall clock)`)] })),
    { name: '/ci/repo/packages/kernel/test/rng.test.ts', assertionResults: [passed('streams')] },
  ],
  ...over,
});

describe('no test skipped where the timing gate is open', () => {
  it('passes a report in which every test ran, the timing tests among them', () => {
    expect(skipProblems(report())).toEqual([]);
  });

  it('fails when the flag is off: the timing tests are skipped, and each is named', () => {
    const off = report({ numPendingTests: TIMED_TESTS.length, testResults: report().testResults.map((f) => ({ ...f, assertionResults: f.assertionResults.map((a) => (a.fullName.includes('wall clock') ? { ...a, status: 'skipped' } : a)) })) });
    const problems = skipProblems(off);
    expect(problems[0]).toContain(`${TIMED_TESTS.length} tests skipped`);
    expect(problems.join('\n')).toContain(`the timing test "${TIMED_TESTS[0]!.title}" (${TIMED_TESTS[0]!.file}) did not pass: skipped`);
  });

  it('fails a todo, a timing test that is gone, and an empty report', () => {
    expect(skipProblems(report({ numTodoTests: 1 })).join('\n')).toContain('1 left to do');
    expect(skipProblems(report({ testResults: report().testResults.slice(1) })).join('\n')).toContain('is not in the report');
    expect(skipProblems(report({ numTotalTests: 0 })).join('\n')).toContain('holds no tests');
  });
});
