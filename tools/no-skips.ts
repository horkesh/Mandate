/**
 * No test may be skipped on CI's Linux job (lane 1.14, from 0086's consequence): the wall-clock budget tests run there
 * only behind `MANDATE_TIMING=1`, and a test that checks only the workflow's text cannot tell whether they ran. Moving
 * the flag to another step, or breaking the gate in `packages/kernel/test/support/timing.ts`, would skip them and leave
 * the job green. This reads the job's own vitest report and fails when any test was skipped or left to do, naming each.
 *
 *   npx tsx tools/no-skips.ts runs/ci/vitest.json
 *
 * It also names the timing tests it expects to have run and passed, so the proof is positive as well as negative.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** The parts of vitest's JSON report this reads (its jest-compatible shape). */
export interface VitestReport {
  readonly numTotalTests: number;
  readonly numPendingTests: number;
  readonly numTodoTests: number;
  readonly testResults: readonly { readonly name: string; readonly assertionResults: readonly { readonly fullName: string; readonly status: string }[] }[];
}

/** The stopwatch tests 0086 put behind the flag: each must have run and passed where the flag is set. */
export const TIMED_TESTS: readonly { readonly file: string; readonly title: string }[] = [
  { file: 'packages/kernel/test/map-performance.test.ts', title: 'rebuilds, idles and runs a year within budget' },
  { file: 'packages/cli/test/planner.test.ts', title: 'drafts on the testbed in well under 10 ms' },
  { file: 'packages/cli/test/done-check.test.ts', title: 'stays inside the tick budget on this machine' },
];

/** What is wrong with a report on a job that must skip nothing. Empty when every test ran. */
export function skipProblems(report: VitestReport): string[] {
  const problems: string[] = [];
  const skipped = report.testResults.flatMap((f) => f.assertionResults.filter((a) => a.status !== 'passed' && a.status !== 'failed').map((a) => `${f.name.split('\\').join('/')}: ${a.fullName} (${a.status})`));
  if (report.numPendingTests + report.numTodoTests > 0 || skipped.length > 0) {
    problems.push(`${report.numPendingTests} tests skipped and ${report.numTodoTests} left to do, where none may be (is MANDATE_TIMING=1 set on this step?)`);
    problems.push(...skipped);
  }
  for (const t of TIMED_TESTS) {
    const file = report.testResults.find((f) => f.name.split('\\').join('/').endsWith(t.file));
    const ran = file?.assertionResults.find((a) => a.fullName.includes(t.title));
    if (ran === undefined) problems.push(`the timing test "${t.title}" (${t.file}) is not in the report`);
    else if (ran.status !== 'passed') problems.push(`the timing test "${t.title}" (${t.file}) did not pass: ${ran.status}`);
  }
  if (report.numTotalTests === 0) problems.push('the report holds no tests');
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (path === undefined) throw new Error('usage: tsx tools/no-skips.ts <vitest.json>');
  const report = JSON.parse(readFileSync(path, 'utf8')) as VitestReport;
  const problems = skipProblems(report);
  if (problems.length > 0) {
    console.error(`no-skips: ${problems.length} problems\n${problems.map((p) => `  ${p}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`no-skips: all ${report.numTotalTests} tests ran, the ${TIMED_TESTS.length} timing tests among them`);
}
