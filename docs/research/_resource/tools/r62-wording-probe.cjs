// Execute the research tools in memory; intercept every proposed filesystem write.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const base = 'docs/research/_resource/';
const original = (p) => execFileSync('git', ['show', `HEAD:${p}`], { encoding: 'utf8' });
// This old research base predates R50's CommonJS package marker. Load its
// unchanged CSV helper explicitly, without changing package configuration.
const csvExports = {};
vm.runInNewContext(fs.readFileSync(`${base}tools/csvlib.js`, 'utf8'), { exports: csvExports });
function execute(name, before) {
  const file = path.resolve(base, 'tools', name);
  const requireHere = createRequire(file);
  const writes = new Map();
  const read = (p, ...args) => before && String(p).replaceAll('\\', '/').endsWith('/rs8.csv')
    ? original(`${base}rs8.csv`) : fs.readFileSync(p, ...args);
  const fakeFs = {
    readFileSync: read, existsSync: fs.existsSync,
    writeFileSync: (p, text) => { assert(!writes.has(p)); writes.set(p, text); },
  };
  vm.runInNewContext(before ? original(`${base}tools/${name}`) : fs.readFileSync(file, 'utf8'), {
    require: (key) => key === 'fs' ? fakeFs : key === './csvlib.js' ? csvExports : requireHere(key),
    console: { log() {} },
    process: { argv: ['node', file], env: {
      PACK_ROOT: process.cwd(), HELD_OUT_CELLS: 'held-cells', HELD_OUT_BLOCS: 'held-blocs',
    } },
  }, { filename: file });
  return writes;
}
const { parse } = csvExports;
const prior = execute('apply.js', true);
const after = execute('apply.js', false);
assert.deepEqual([...after.keys()], [...prior.keys()]);
let changed = [];
for (const [p, text] of after) {
  if (!p.endsWith('people.csv')) { assert.equal(text, prior.get(p)); continue; }
  const a = parse(prior.get(p)), b = parse(text);
  assert.equal(a.length, b.length);
  assert.deepEqual(a[0], b[0]);
  for (let row = 1; row < a.length; row++) for (let col = 0; col < a[0].length; col++) {
    if (a[row][col] !== b[row][col]) {
      changed.push(`${b[row][0]}/${a[0][col]}`);
      assert.equal(b[row][0], 'buchanan_franklin');
      assert(['notes', 'bloc_cites'].includes(a[0][col]));
    }
  }
  const buchanan = b.find((r) => r[0] === 'buchanan_franklin');
  assert.match(buchanan[b[0].indexOf('notes')], /was dismissed on 1861-04-22 \(NavyReg1863-RESIGN p112 Dismissals entry\)/);
  assert(!buchanan[b[0].indexOf('notes')].includes('and resigned on 1861-04-22'));
}
assert.deepEqual(changed.sort(), ['buchanan_franklin/bloc_cites', 'buchanan_franklin/notes']);
const registryBefore = [...execute('addsources.js', true).values()];
const registryAfter = [...execute('addsources.js', false).values()];
assert.equal(registryBefore.length, 1);
assert.equal(registryAfter.length, 1);
const a = JSON.parse(registryBefore[0]), b = JSON.parse(registryAfter[0]);
const entry = b.sources.find((s) => s.key === 'NavyReg1863-RESIGN');
assert.match(entry.title, /resignations and dismissals/);
assert.match(entry.copyUsed, /Dismissals p\. 112/);
const oldEntry = a.sources.find((s) => s.key === entry.key);
entry.title = oldEntry.title; entry.copyUsed = oldEntry.copyUsed;
assert.deepEqual(b, a);
console.log(JSON.stringify({ result: 'PASS', physical_tool_writes: 0, changed_apply_cells: changed, other_apply_outputs_equal: true, registry_changes: ['NavyReg1863-RESIGN/title', 'NavyReg1863-RESIGN/copyUsed'] }));
