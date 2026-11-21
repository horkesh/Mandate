// Same defaults as run-done-check.ts, with outputs confined to S32's write scope.
import { mkdirSync, writeFileSync } from 'node:fs';
import { runDoneCheck } from '../../../../packages/cli/src/done-check.ts';
import { measureDrafting } from '../../../../packages/cli/src/drafting-measure.ts';
import { workspaceLinkProblems } from '../../../../tools/workspace-links.ts';
const problems = workspaceLinkProblems(process.cwd());
if (problems.length) throw new Error(problems.join('\n'));
if (process.argv.includes('--preflight')) { console.log('workspace links: PASS'); process.exit(0); }
const out = new URL('./validation-raw/', import.meta.url);
mkdirSync(out, { recursive: true });
const started = performance.now();
const result = runDoneCheck({ onChecked(summary, saves) {
  writeFileSync(new URL(`done-${summary.pack}.json`, out), JSON.stringify(summary, null, 2));
  for (const [day, value] of saves) writeFileSync(new URL(`save-${summary.pack}-${day}.json`, out), value);
}});
const drafting = measureDrafting('union-1861');
writeFileSync(new URL('done-result.json', out), JSON.stringify({ elapsedSeconds: (performance.now()-started)/1000, ...result, drafting }, null, 2));
for (const c of result.criteria) console.log(`${c.problems.length ? 'FAIL' : 'PASS'} ${c.milestone}/${c.id}\n${c.problems.join('\n')}`);
process.exit(result.passed ? 0 : 1);
