/** S139's bounded measurement. Headless, read-only baseline; no pack/band fitting or sweep. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalHash, type phase0 } from '@mandate/kernel';
import { runDoneCheck } from '../packages/cli/src/done-check.ts';
import { phase0Run } from '../packages/cli/src/phase0-run.ts';
import { seatsWorld } from '../packages/cli/src/seats-world.ts';
import { gateFailures, referenceRunFor } from '../packages/cli/src/liveness-gate.ts';

const baselineDir = process.argv[2];
if (!baselineDir) throw new Error('Supply the read-only S134 repair-capture directory.');
const out = 'docs/audit/s139-evidence';
mkdirSync(out, { recursive: true });
const write = (name: string, value: unknown, dir = out) => writeFileSync(join(dir, name), JSON.stringify(value, null, 2) + '\n');
const inventory = JSON.parse(readFileSync('docs/audit/s134-evidence/repair/raw-inventory.json', 'utf8')) as { path: string; bytes: number; sha256: string }[];
const receipts: unknown[] = [];
function baseline(name: string) {
  const path = join(baselineDir!, name);
  const bytes = readFileSync(path);
  const expected = inventory.find(r => r.path === `runs/s134/repair-capture/${name}`);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (!expected || expected.sha256 !== sha256 || expected.bytes !== bytes.length) throw new Error(`Unbound S134 input ${name}`);
  receipts.push({ path, bytes: bytes.length, sha256, boundBy: 'docs/audit/s134-evidence/repair/raw-inventory.json' });
  return JSON.parse(bytes.toString('utf8'));
}
const beforeSummary = baseline('union-1861-summary.json');
const beforeObservations = baseline('union-1861-observations.json');
if (seatsWorld('union-1861').worldHash !== beforeSummary.worldHash) throw new Error('Pack fingerprint differs from the accepted baseline.');
write('baseline-receipts.json', { baselineCommit: '5c4a9d835ac97f2f35e6b3122e235955a09c85a7', receipts,
  finalHash: beforeSummary.finalHash, worldHash: beforeSummary.worldHash, days: beforeSummary.finalDay });

if (process.argv.includes('--smoke')) {
  for (const pack of ['testbed', 'union-1861']) {
    const s = phase0Run({ pack, days: 1, replay: false });
    if (s.rejections !== 0 || s.finalDay !== 1) throw new Error(`Startup failed: ${pack}`);
  }
  console.log('Two-pack startup and exact S134 baseline receipts pass.');
  process.exit(0);
}

console.log('Starting the required done-check core with sweepSeeds=0; final sources are bound by input-fingerprints.json.');
const result = runDoneCheck({ sweepSeeds: 0, onChecked(summary, saves) {
  write(`${summary.pack}-checked-summary.json`, summary, 'runs/s139');
  for (const [day, text] of saves) writeFileSync(`runs/s139/${summary.pack}-save-${day}.json`, text + '\n');
  console.log(`Checked ${summary.pack}: ${summary.finalDay} days, ${summary.rejections} rejections, replay ${summary.replay?.matches}, resume ${summary.resume?.matches}.`);
} });
const union = result.runs.find(r => r.checked.pack === 'union-1861')!;
const history = result.history.find(r => r.pack === 'union-1861');
if (history === undefined || history.summary.finalHash !== union.checked.finalHash) throw new Error('Observed history differs from the checked reference.');
write('operation-history.json', [...history.observations.operations]);
const before = new Map<string, phase0.BattleRecord>(beforeObservations.battles);
const after = union.battles;
if (after === undefined) throw new Error('Required observed Union battle set is absent.');
const withoutAudit = (b: phase0.BattleRecord | undefined) => b === undefined ? null : { ...b, battleDays: b.battleDays.map(d => ({ ...d,
  bdaySides: d.bdaySides.map(({ bsideAttackBlocks: _set, ...s }) => ({ ...s, bsideDecisions: s.bsideDecisions.filter(t => !t.btermKind.startsWith('task_')) })) })) };
const changed = [...new Set([...before.keys(), ...after.keys()])].sort().flatMap(id => {
  const old = before.get(id), current = after.get(id);
  if (canonicalHash(old ?? null) === canonicalHash(current ?? null)) return [];
  return [{ id, resolutionChanged: canonicalHash(withoutAudit(old)) !== canonicalHash(withoutAudit(current)), before: old ?? null, after: current ?? null }];
});
const gates = result.runs.map(r => {
  const reference = referenceRunFor(r.checked.pack, r.checked.finalDay, r.checked.atWar);
  return { pack: r.checked.pack, failures: reference === undefined || reference === null ? [] : gateFailures(reference, r.checked.liveness) };
});
const newZeros = union.checked.liveness.filter(r => r.fires === 0 && beforeSummary.liveness.some((old: { mechanic: string; fires: number }) => old.mechanic === r.mechanic && old.fires > 0));
write('battle-comparison.json', { changedCount: changed.length, beforeCount: before.size, afterCount: after.size,
  worldHash: union.checked.worldHash, beforeFinalHash: beforeSummary.finalHash, afterFinalHash: union.checked.finalHash, changed });
write('validation.json', { passedPhase0: result.passed, passed1A: result.passed1A, sweepSeeds: 0, criteria: result.criteria,
  historyHash: history.summary.finalHash, historyTiming: history.timed.timing,
  gates, newUnionZeros: newZeros, runs: result.runs.map(r => ({ name: r.name, rejections: r.checked.rejections,
    checkedHash: r.checked.finalHash, repeatHash: r.repeat.finalHash, timedHash: r.timed.finalHash,
    replay: r.checked.replay, resume: r.checked.resume, timing: r.timed.timing })) });
const cell = (s: phase0.BattleSide) => `${s.bsideFaction}: [${s.bsideBlocks.join(', ')}]; attack [${(s.bsideAttackBlocks ?? []).join(', ')}]; ${s.bsidePresent} known, ${s.bsideUnknown.length} unknown; ${s.bsideCommit}; ${s.bsideResult}; K/W/M/C ${s.bsideKilled}/${s.bsideWounded}/${s.bsideMissing}/${s.bsideCaptured}`;
const lines = ['# S139: every changed battle', '', 'The JSON comparison retains both complete records, including every block, unknown, loss, decision and outcome. These are model observations, not historical returns.', '',
  `World ${union.checked.worldHash}; baseline ${beforeSummary.finalHash}; new ${union.checked.finalHash}.`, '',
  `${before.size} old battles, ${after.size} new battles; ${changed.length} changed records. Audit-only means the new task explanation/attack-set fields changed while all prior resolution fields stayed exact.`, ''];
for (const b of changed) {
  lines.push(`## ${b.id}`, '', b.resolutionChanged ? 'Resolution changed.' : 'Audit fields only.', '', '| Version | Day | Type | Attacker | Sides, exposed sets, offensive sets and outcome |', '| --- | --- | --- | --- | --- |');
  for (const [label, record] of [['Before', b.before], ['After', b.after]] as const) {
    if (record === null) lines.push(`| ${label} | absent | | | |`);
    else for (const day of record.battleDays) lines.push(`| ${label} | ${day.bdayDay} | ${day.bdayType} | ${day.bdayAttacker ?? 'mutual'} | ${day.bdaySides.map(cell).join('<br>')} |`);
  }
  lines.push('');
}
writeFileSync(join(out, 'battles.md'), lines.join('\n').trimEnd() + '\n');
console.log(JSON.stringify({ passedPhase0: result.passed, passed1A: result.passed1A, changedBattles: changed.length,
  changedResolutions: changed.filter(b => b.resolutionChanged).length, gates, newZeros: newZeros.map(r => r.mechanic), evidence: out }));
// Report actual Phase 0 failures; never widen a band or silently waive a new zero.
process.exitCode = result.passed ? 0 : 1;
