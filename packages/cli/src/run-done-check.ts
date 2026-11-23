/**
 * The Phase 0 done check (FOUNDATION section 12; lane 0.8), and 1A's beside it (lane 1.14), written to fresh folders in runs/.
 *
 *   npm run run:done-check [-- --label <name>] [--no-drafting] [--milestone 1a] [--budget-advisory]
 *
 * Runs the Union pack for 148 days, 5 March to 31 July 1861, its war opened by each side's own decision (lane 1.11), and the testbed for 120, each with a
 * hash every day, a replay, a mid-run save resumed, a repeat run and a timed run, then judges the six
 * criteria (`done-check.ts`). Then 1A's: each pack with done-check bands (`checkpoints.json`) plays its history run to
 * its last checkpoint, timed and swept, and its six criteria are reported PASS or FAIL with their reasons. Phase 0's
 * criteria set the exit status; with `--milestone 1a`, 1A's do too. Each checked run's summary goes to its own folder under `runs/<label>/`, so CI
 * can compare Linux and Windows hashes with `tools/compare-runs.ts`. Also reports what a day of plan drafting
 * costs on the Union graph (the kernel planner's `draft` since lane 1.2, every held command with a block), which is
 * information for 0062's daily cap (a pack rule, `planner.dailyDraftCap`) and not a criterion. Exits 1 if any binding criterion has a problem.
 * `--budget-advisory` (0117, Windows CI) reports the budget in full but excludes it from the exit status. Local runs bind by default.
 */
import { runDoneCheck } from './done-check.ts';
import { measureDrafting } from './drafting-measure.ts';
import { createRunDir, writeRunFile } from './io/runs.ts';
import { coverageScore } from './pushback-coverage.ts';

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const label = flag('label') ?? 'done-check';
/** `--milestone 1a`: 1A's criteria set the exit status too (lane 1.14; the lead makes it CI's default when 1A is meant to pass). */
const milestone = flag('milestone');
if (milestone !== undefined && milestone !== '1a') throw new Error(`--milestone takes 1a, not ${milestone}`);
const require1A = milestone === '1a';
const budgetAdvisory = argv.includes('--budget-advisory');

const result = runDoneCheck({
  onChecked: (summary, saves) => {
    const dir = createRunDir(label);
    writeRunFile(dir, 'summary.json', `${JSON.stringify(summary, null, 2)}\n`);
    for (const [day, text] of saves) writeRunFile(dir, `save-day-${day}.json`, `${text}\n`);
  },
});

const lines: string[] = [];
const reportDir = createRunDir(`${label}-criteria`);
writeRunFile(reportDir, 'criteria.json', `${JSON.stringify(result.criteria, null, 2)}\n`);
for (const h of result.history) {
  if (h.checkpoints.pushbackRegisters === undefined) continue;
  const coverage = coverageScore(h.pushbackRegisters ?? [], h.observations.pushbackActs ?? [], h.startDate, h.observations.lastDay, h.summary.daily);
  writeRunFile(reportDir, `${h.pack}-pushback-coverage.json`, `${JSON.stringify(coverage, null, 2)}\n`);
}
const report = (title: string, milestone: 'phase0' | '1A') => {
  lines.push(title, '');
  for (const c of result.criteria.filter((x) => x.milestone === milestone)) {
    lines.push(`${c.problems.length === 0 ? 'PASS' : 'FAIL'}  [${c.id}] ${c.text}`);
    for (const e of c.evidence) lines.push(`        ${e}`);
    for (const p of c.problems) lines.push(`      ! ${p}`);
  }
  lines.push('');
};
report(`Phase 0 done check${budgetAdvisory ? ' (budget advisory: reported in full; excluded from exit status by --budget-advisory, 0117)' : ''}`, 'phase0');
report(`1A done check (lane 1.14's harness: measured and reported${require1A ? '; binding on this run (--milestone 1a)' : '; it does not set the exit status until the lead makes it binding'})`, '1A');
lines.push('tick cost per day (requests, seats and tick; no hashing):');
for (const r of [...result.runs, ...result.history]) {
  const t = r.timed.timing!;
  lines.push(`  ${r.name}: median ${t.median.toFixed(2)} ms, p95 ${t.p95.toFixed(2)} ms, max ${t.max.toFixed(2)} ms over ${t.days} days`);
}
if (!argv.includes('--no-drafting')) {
  const d = measureDrafting('union-1861');
  lines.push(
    '',
    `plan drafting on the Union graph (${d.posts} commands, ${d.posts - d.noLandForce} with a land force; the kernel planner's draft, each asked to take the other side's capital, neutral ground permitted):`,
    `  one day of all ${d.posts} drafts back to back: median ${d.day.median.toFixed(1)} ms, p95 ${d.day.p95.toFixed(1)} ms, worst ${d.day.worst.toFixed(1)} ms over ${d.day.days} days; slowest single draft ${d.slowestDraftMs.toFixed(1)} ms; a capped day (the pack's ${d.cappedDay.cap} slowest drafts for each of ${d.cappedDay.sides} sides, together) at worst ${d.cappedDay.worst.toFixed(1)} ms${d.sound ? '' : '; UNSOUND (a land command got no candidate, or a score is not the sum of its terms)'}`,
  );
  const dir = createRunDir(`${label}-drafting`);
  writeRunFile(dir, 'drafting.json', `${JSON.stringify(d, null, 2)}\n`);
}
console.log(lines.join('\n'));
const bindingCriteria = result.criteria.filter((c) => (require1A || c.milestone === 'phase0') && (!budgetAdvisory || c.id !== 'budget'));
process.exit(bindingCriteria.every((c) => c.problems.length === 0) ? 0 : 1);
