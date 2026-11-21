// S25 test driver. Mutations exist only in Vite's input; src/ is never written.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseSync } from 'rolldown/utils';

const root = resolve(import.meta.dirname, '../../../..');
const out = resolve(root, 'runs/s25');
mkdirSync(out, { recursive: true });
const hash = s => createHash('sha256').update(s).digest('hex');
const src = 'packages/kernel/src/';
const test = 'packages/kernel/test/';
const groups = [
  ['knowledge', ['knowledge/'], ['seats-log', 'seats-orders', 'claimed-control', 'control-reports', 'opening-pack']],
  ['view', ['view/'], ['seat-people', 'press-view', 'claimed-control', 'seats-orders']],
  ['seats', ['seats/'], ['seats-orders', 'seats-log', 'believed-posts', 'people-verbs', 'principal-menu']],
  ['tick-orders', ['tick/orders.ts'], ['seats-orders', 'plans', 'sendback-notes', 'believed-posts']],
  ['tick-verbs', ['tick/verbs.ts'], ['people-verbs', 'seat-people', 'resignation']],
  ['combat', ['combat/'], ['combat', 'bombard']],
  ['people', ['people/'], ['people', 'people-verbs', 'resignation']],
  ['command', ['command/'], ['forces-command', 'capitals', 'post-succession', 'department-sides', 'governments']],
  ['control', ['control/'], ['control']],
  ['control-index', ['control-index/'], ['control-index', 'map-derived']],
  ['forces', ['forces/'], ['stores', 'detachments', 'combat', 'forces-command']],
  ['infrastructure', ['infrastructure/'], ['infrastructure']],
  ['movement', ['movement/'], ['march', 'join', 'operations']],
  ['supply', ['supply/'], ['supply']],
  ['messages', ['messages/'], ['seats-orders', 'seats-log']],
  ['plans', ['plans/'], ['plans', 'sendback-notes']],
  ['planner', ['planner/'], ['plans', 'operations']],
  ['operations', ['operations/'], ['operations']],
  ['politics', ['politics/'], ['politics', 'press-view']],
  ['regions', ['regions/'], ['governments', 'men-regions-scan']],
  ['situations', ['situations/'], ['situations', 'war-flags', 'gate-wiring']],
  ['reading', ['reading/'], ['people', 'compliance', 'seats-orders']],
  ['audience', ['audience/'], ['people-verbs', 'plans']],
  ['proxy', ['proxy/'], ['people', 'seats-orders']],
  ['ladder', ['ladder/'], ['people', 'people-verbs']],
  ['recruitment', ['recruitment/'], ['people-verbs', 'opening-pack']],
  ['serialize', ['serialize/'], ['serialize', 'save']],
  ['world', ['world/'], ['world', 'calendar']],
  ['log', ['log/'], ['seats-log', 'lexer']],
  ['tick', ['tick/'], ['map-tick', 'people-verbs', 'seats-orders', 'operations', 'situations']],
  ['primitives', ['compare.ts', 'heap.ts', 'permille.ts', 'rng.ts', 'ids.ts', 'compliance.ts', 'directive.ts'], ['rng', 'ids', 'compliance', 'map-derived', 'supply']],
  ['state-support', ['invariants/', 'telemetry.ts', 'phase0.ts', 'root-state.ts', 'ownership.ts', 'people.ts', 'seat-api.ts', 'index.ts'], ['telemetry', 'state-data', 'start-copies', 'map-tick']],
];
function files(dir) {
  return readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(`${dir}${e.name}/`) : [`${dir}${e.name}`]).sort();
}
const all = files(src).filter(f => f.endsWith('.ts'));
const invert = new Map([['>', '>='], ['>=', '>'], ['<', '<='], ['<=', '<'], ['&&', '||'], ['===', '!=='], ['!==', '==='], ['+', '-'], ['-', '+']]);
function candidates(file) {
  const code = readFileSync(resolve(root, file), 'utf8');
  const parsed = parseSync(file, code, { lang: 'ts' });
  if (parsed.errors.length) throw Error(JSON.stringify(parsed.errors));
  const found = [];
  function visit(n) {
    if (n.type === 'BinaryExpression' || n.type === 'LogicalExpression') {
      const op = n.operator;
      const before = code.slice(n.start, n.end);
      if (invert.has(op) && before.length <= 150 && !before.includes('\n') && !before.includes('\r')) {
        const p = code.indexOf(op, n.left.end);
        // Skip string concatenation and sort comparators: changing those is usually a trivial kill.
        if (!['+', '-'].includes(op) || (!(n.left.type === 'Literal' && typeof n.left.value === 'string') && !(n.right.type === 'Literal' && typeof n.right.value === 'string') && !/Compare|\.id|\.sort|\.length/.test(before))) {
          found.push({ file, start: p, before: op, after: invert.get(op), line: code.slice(0, p).split('\n').length, expression: before, kind: ['>', '>=', '<', '<='].includes(op) ? 'boundary' : ['+', '-'].includes(op) ? 'term' : 'comparison', sourceHash: hash(code) });
        }
      }
    }
    for (const value of Object.values(n)) {
      if (value && typeof value === 'object' && typeof value.type === 'string') visit(value);
      else if (Array.isArray(value)) for (const child of value) if (child && typeof child === 'object' && typeof child.type === 'string') visit(child);
    }
  }
  visit(parsed.program);
  return found;
}
const manifestPath = resolve(out, 'manifest.json');
const command = process.argv[2] ?? 'list';
if (command === 'list') {
  const used = new Set();
  const manifest = [];
  for (const [group, prefixes, names] of groups) {
    const selected = all.filter(f => prefixes.some(p => f.slice(src.length).startsWith(p)) && !used.has(f));
    selected.forEach(f => used.add(f));
    const byFile = selected.map(file => ({ file, choices: candidates(file) })).filter(x => x.choices.length);
    const count = Math.max(byFile.length, manifest.length < 7 || group === 'primitives' ? 10 : 5);
    const mutants = [];
    // Spread operators across files and each file's beginning, middle and end.
    for (let round = 0; mutants.length < count && round < count; round++) {
      for (const f of byFile) {
        const boundaries = f.choices.filter(c => c.kind === 'boundary');
        const others = f.choices.filter(c => c.kind !== 'boundary');
        const pool = round % 2 === 0 && boundaries.length ? boundaries : others.length ? others : boundaries;
        const index = Math.floor((round / count) * pool.length);
        const choice = pool[Math.min(index, pool.length - 1)];
        if (choice && !mutants.some(c => c.file === choice.file && c.start === choice.start)) mutants.push({ ...choice, id: `${group}-${String(mutants.length + 1).padStart(2, '0')}` });
        if (mutants.length >= count) break;
      }
    }
    manifest.push({ group, files: selected, tests: names.map(n => `${test}${n}.test.ts`).filter(f => existsSync(resolve(root, f))), mutants });
  }
  const explicit = [
    ['view', 'view/view.ts', 'value: perceived(value, bias)', 'value: Object.values(state.reportTruth[report.id]?.truthTerms ?? []).find(t => t.termRegion === region && t.termKind === \'observed\')?.termValue ?? perceived(value, bias)', 'truth instead of a received belief'],
    ['tick-orders', 'tick/orders.ts', 'if (!goal.goalCommitted.every((b) => commands.includes(b)))', 'if (false)', 'remove committed-block ownership guard'],
    ['tick-verbs', 'tick/verbs.ts', "if (assignment === undefined) return null;", 'if (false) return null;', 'remove unknown-seat guard'],
  ];
  for (const [group, path, before, after, expression] of explicit) {
    const file = src + path;
    const code = readFileSync(resolve(root, file), 'utf8');
    const start = code.indexOf(before);
    if (start < 0 || code.indexOf(before, start + 1) >= 0) throw Error(`ambiguous explicit mutation: ${expression}`);
    const g = manifest.find(g => g.group === group);
    g.mutants.push({ id: `${group}-explicit`, file, start, before, after, expression, line: code.slice(0, start).split('\n').length, kind: 'explicit', sourceHash: hash(code) });
  }
  // Edit preview is imported by its dedicated send-back suite, not the daily tick suites.
  for (const g of manifest) for (const m of g.mutants) if (m.file.endsWith('/tick/edit-preview.ts')) m.tests = [...g.tests, `${test}sendback-notes.test.ts`];
  writeFileSync(manifestPath, JSON.stringify({ base: '39c279cefc3e836e9a7f6a39acbb6772393a16ab', groups: manifest, unassigned: all.filter(f => !used.has(f)) }, null, 2));
  console.log(manifest.map(g => `${g.group}: ${g.mutants.length} mutations, ${g.files.length} files, ${g.tests.length} suites`).join('\n'));
  process.exit(0);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const filter = process.argv[3];
const stage = process.argv[4] ?? 'before';
const configPath = resolve(out, 'vitest.mutation.config.mjs');
writeFileSync(configPath, `import base from '../../vitest.config.ts';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const selected = process.env.S25_MUTANT ? JSON.parse(readFileSync(process.env.S25_MUTANT, 'utf8')) : null;
export default { ...base, plugins: [{ name: 's25-mutation', enforce: 'pre', transform(code, id) {
  if (!selected || id.split('?')[0].replaceAll('\\\\', '/') !== resolve(selected.file).replaceAll('\\\\', '/')) return;
  if (code.slice(selected.start, selected.start + selected.before.length) !== selected.before) throw Error('S25 mutation anchor mismatch');
  writeFileSync(process.env.S25_APPLIED, JSON.stringify({id, mutant: selected.id}));
  return {code: code.slice(0, selected.start) + selected.after + code.slice(selected.start + selected.before.length), map: null};
} }], test: { ...base.test, maxWorkers: 2, fsModuleCache: false } };
`);
const results = [];
const chosen = manifest.groups.filter(g => !filter || g.group === filter || g.mutants.some(m => m.id === filter));
for (const g of chosen) {
  const additions = stage === 'after' ? [`${test}s25-${g.group}.test.ts`].filter(f => existsSync(resolve(root, f))) : [];
  const jobs = command === 'baseline' ? [null] : g.mutants.filter(m => (!filter || filter === g.group || filter === m.id) && (command !== 'survivors' || (existsSync(resolve(out, `before-${m.id}.verdict.json`)) && JSON.parse(readFileSync(resolve(out, `before-${m.id}.verdict.json`), 'utf8')).verdict === 'survived')));
  for (const mutant of jobs) {
    const id = mutant?.id ?? g.group;
    const prefix = resolve(out, `${stage}-${id}`);
    if (mutant && existsSync(`${prefix}.verdict.json`)) {
      const previous = JSON.parse(readFileSync(`${prefix}.verdict.json`, 'utf8'));
      if (previous.verdict !== 'invalid') { results.push(previous); console.log(`${id}: reused ${previous.verdict}`); continue; }
    }
    for (const suffix of ['.result.json', '.applied.json']) if (existsSync(`${prefix}${suffix}`)) unlinkSync(`${prefix}${suffix}`);
    const selectedPath = `${prefix}.mutation.json`;
    if (mutant) {
      if (hash(readFileSync(resolve(root, mutant.file), 'utf8')) !== mutant.sourceHash) throw Error(`Source changed: ${mutant.file}`);
      writeFileSync(selectedPath, JSON.stringify(mutant));
    }
    const started = Date.now();
    const suites = mutant && stage === 'after' && additions.length ? additions : [...(mutant?.tests ?? g.tests), ...additions];
    const result = spawnSync(process.execPath, [resolve(root, 'node_modules/vitest/vitest.mjs'), 'run', '--config', configPath, '--reporter=json', `--outputFile=${prefix}.result.json`, ...suites], {
      cwd: root, encoding: 'utf8', timeout: 180_000, maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, MANDATE_NO_GIT: '1', S25_MUTANT: mutant ? selectedPath : '', S25_APPLIED: `${prefix}.applied.json` },
    });
    writeFileSync(`${prefix}.log`, (result.stdout ?? '') + (result.stderr ?? ''));
    writeFileSync(`${prefix}.exit`, String(result.status));
    const report = existsSync(`${prefix}.result.json`) ? JSON.parse(readFileSync(`${prefix}.result.json`, 'utf8')) : null;
    const applied = !mutant || existsSync(`${prefix}.applied.json`);
    const failures = report?.testResults.flatMap(s => s.assertionResults.filter(a => a.status === 'failed').map(a => ({ suite: relative(root, s.name).replaceAll('\\', '/'), test: a.fullName, messages: a.failureMessages }))) ?? [];
    const verdict = !applied || result.error || !report || (result.status !== 0 && failures.length === 0) ? 'invalid' : result.status === 0 ? (mutant ? 'survived' : 'passed') : 'killed';
    const row = { group: g.group, id, stage, verdict, exit: result.status, applied, passed: report?.numPassedTests, failed: report?.numFailedTests, failures, seconds: (Date.now() - started) / 1000, log: relative(root, `${prefix}.log`) };
    writeFileSync(`${prefix}.verdict.json`, JSON.stringify(row, null, 2));
    results.push(row);
    writeFileSync(resolve(out, `${stage}-${filter ?? 'all'}-summary.json`), JSON.stringify(results, null, 2));
    console.log(`${id}: ${verdict}; ${row.passed} passed / ${row.failed} failed; ${row.seconds}s`);
    if (verdict === 'invalid' || (!mutant && verdict !== 'passed')) process.exit(1);
  }
}
