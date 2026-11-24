/** S153 bounded headless hash proofs and advisory CPU/timing measurements. */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Session } from 'node:inspector';
import { phase0Run, type Phase0Summary } from '../packages/cli/src/phase0-run.ts';

const [stage, mode = 'proof', baselineStage = 'merge'] = process.argv.slice(2);
assert(stage && /^[a-z0-9-]+$/.test(stage));
assert(['smoke', 'proof', 'timing', 'profile'].includes(mode));
const out = `runs/s153/${stage}-${mode}`;
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/${process.argv.includes('--remaining') ? 'remaining-started' : 'started'}.json`, JSON.stringify({ stage, mode, baselineStage, argv: process.argv }, null, 2) + '\n', { flag: 'wx' });
const put = (name: string, value: unknown) => writeFileSync(`${out}/${name}.json`, JSON.stringify(value, null, 2) + '\n');
const cases = mode === 'profile' || mode === 'smoke' ? [{ name: 'history', pack: 'union-1861', days: 148, atWar: false }] : [
  { name: 'history', pack: 'union-1861', days: 148, atWar: false },
  { name: 'war', pack: 'union-1861', days: 148, atWar: true },
  ...(mode === 'proof' ? [{ name: 'testbed', pack: 'testbed', days: 120, atWar: false }] : []),
];
const receipts: unknown[] = [];
for (const c of cases.filter(c => !process.argv.includes('--remaining') || c.name !== 'history')) {
  const session = mode === 'profile' ? new Session() : undefined;
  const post = (method: string) => new Promise<any>((resolve, reject) => session!.post(method, (err, result) => err ? reject(err) : resolve(result)));
  if (session) { session.connect(); await post('Profiler.enable'); await post('Profiler.start'); }
  const summary = phase0Run({ ...c, days: mode === 'smoke' ? 2 : c.days, hash: mode === 'proof' || mode === 'smoke' ? 'daily' : 'checkpoints', checks: mode === 'proof' || mode === 'smoke', replay: false, timings: mode === 'timing' || mode === 'profile' });
  if (session) { put(`${c.name}-cpu`, (await post('Profiler.stop')).profile); session.disconnect(); }
  put(c.name, summary);
  assert.equal(summary.rejections, 0, 'rejected command');
  if (mode === 'proof') {
    const establishesBaseline: boolean = stage === 'merge' && c.name !== 'history';
    const baseline: Phase0Summary = establishesBaseline ? summary : JSON.parse(readFileSync(stage === 'merge' ? 'docs/audit/s150-evidence/live-orders-capture/summary.json' : `runs/s153/${baselineStage}-proof/${c.name}.json`, 'utf8'));
    const differences = summary.turns.filter((r, i) => r.turn !== baseline.turns[i]?.turn || r.hash !== baseline.turns[i]?.hash);
    put(`${c.name}-comparison`, { days: summary.turns.length, establishesBaseline, differences, initialEqual: summary.initialHash === baseline.initialHash, worldEqual: summary.worldHash === baseline.worldHash });
    // The other two merge references establish the pre-optimisation baseline.
    if (stage !== 'merge') {
      assert.equal(differences.length, 0, `first divergence ${differences[0]?.turn}`);
      for (const key of ['initialHash', 'worldHash', 'daily', 'liveness', 'checkpoints', 'finalHash', 'logEntries', 'decisionPoints'] as const) assert.deepEqual(summary[key], baseline[key], key);
    }
  }
  receipts.push({ name: c.name, days: summary.finalDay, finalHash: summary.finalHash, timing: summary.timing });
  console.log(JSON.stringify(receipts.at(-1)));
}
put('receipt', receipts);
