/**
 * The Phase 0 done check (FOUNDATION section 12; lane 0.8), written to fresh folders in runs/.
 *
 *   npm run run:done-check [-- --label <name>] [--no-drafting]
 *
 * Runs the Union pack at war for 75 days (the labelled option, 0064) and the testbed for 120, each with a
 * hash every day, a replay, a mid-run save resumed, a repeat run and a timed run, then judges the six
 * criteria (`done-check.ts`). Each checked run's summary goes to its own folder under `runs/<label>/`, so CI
 * can compare Linux and Windows hashes with `tools/compare-runs.ts`. Also reports what a day of plan drafting
 * costs on the Union graph (the spike's `draft`, 27 commands), which is information for 0062's daily cap and
 * not a criterion. Exits 1 if any criterion has a problem.
 */
import { runDoneCheck } from './done-check.ts';
import { measureDrafting } from './drafting-measure.ts';
import { createRunDir, writeRunFile } from './io/runs.ts';

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const label = flag('label') ?? 'done-check';

const result = runDoneCheck({
  onChecked: (summary, saves) => {
    const dir = createRunDir(label);
    writeRunFile(dir, 'summary.json', `${JSON.stringify(summary, null, 2)}\n`);
    for (const [day, text] of saves) writeRunFile(dir, `save-day-${day}.json`, `${text}\n`);
  },
});

const lines: string[] = ['Phase 0 done check', ''];
for (const c of result.criteria) {
  lines.push(`${c.problems.length === 0 ? 'PASS' : 'FAIL'}  ${c.text}`);
  for (const e of c.evidence) lines.push(`        ${e}`);
  for (const p of c.problems) lines.push(`      ! ${p}`);
}
lines.push('', 'tick cost per day (requests, seats and tick; no hashing):');
for (const r of result.runs) {
  const t = r.timed.timing!;
  lines.push(`  ${r.name}: median ${t.median.toFixed(2)} ms, p95 ${t.p95.toFixed(2)} ms, max ${t.max.toFixed(2)} ms over ${t.days} days`);
}
if (!argv.includes('--no-drafting')) {
  const d = measureDrafting('union-1861');
  lines.push(
    '',
    `plan drafting on the Union graph (${d.posts} commands, ${d.posts - d.noLandForce} with a land force; the spike's draft, each asked to take the other side's capital):`,
    `  one day of all ${d.posts} drafts back to back: median ${d.day.median.toFixed(1)} ms, p95 ${d.day.p95.toFixed(1)} ms, worst ${d.day.worst.toFixed(1)} ms over ${d.day.days} days; slowest single draft ${d.slowestDraftMs.toFixed(1)} ms${d.sound ? '' : '; UNSOUND (a land command got no candidate, or a score is not the sum of its terms)'}`,
  );
  const dir = createRunDir(`${label}-drafting`);
  writeRunFile(dir, 'drafting.json', `${JSON.stringify(d, null, 2)}\n`);
}
console.log(lines.join('\n'));
process.exit(result.passed ? 0 : 1);
