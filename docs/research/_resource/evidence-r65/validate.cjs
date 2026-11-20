// Read-only exercise of the inherited apply's actual judgment loop, with rs16 opted in in memory.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../../..');
const evidence = __dirname;
const resource = path.join(root, 'docs/research/_resource');
const csvlib = { exports: {} };
vm.runInNewContext(fs.readFileSync(path.join(resource, 'tools/csvlib.js'), 'utf8'), { exports: csvlib.exports });
const { parse, serialise } = csvlib.exports;
const read = (name) => parse(fs.readFileSync(path.join(evidence, name), 'utf8').replace(/\r\n/g, '\n'));
const records = (table) => table.slice(1).map(r => Object.fromEntries(table[0].map((h,i) => [h,r[i]])));
const base = read('phase1-resignation-people.csv');
const header = Array.from(base[0]);
const input = records(base);
for (const row of records(read('phase1-situations-people.csv'))) {
  if (['houston_samuel','clark_edward'].includes(row.id)) input.push(row);
}
const byId = new Map(input.map(r => [r.id, r]));
assert.equal(byId.size, input.length);
const data = parse(fs.readFileSync(path.join(resource,'rs16.csv'),'utf8'));
assert.deepEqual(Array.from(data[0]), ['person','cell','decision','proposed_direction','citations','basis','prior_value']);
assert(data.every(r => r.length === 7));
assert.equal(data.length - 1, 82);
const rows = records(data);
assert.equal(new Set(rows.map(r=>r.person)).size,17);
assert.equal(new Set(rows.map(r=>r.person+'|'+r.cell)).size,82);
const ids = JSON.parse(fs.readFileSync(path.join(evidence,'target-ids.json'),'utf8'));
for (const id of [...ids,'houston_samuel','clark_edward']) {
  for (const v of ['native_state','state_autonomy','union','duty']) assert(rows.some(r=>r.person===id && r.cell==='value:'+v));
}
const allowedNew = new Set(['LEE-JAN1861-DOC','ASJ-PORTER-1861-DOC','HOUSTON-AUSTIN-1860-DOC','HOUSTON-LEGIS-1861-DOC','CLARK-CONVENTION-1860-DOC']);
const counts = { KEEP:0, CHANGE:0, HOLD:0 };
for (const row of rows) {
  counts[row.decision]++;
  assert(row.basis.includes('[I]'));
  assert(!Object.values(row).some(v=>v.includes(';')));
  const value = row.cell.split(':')[1];
  const prior = value ? byId.get(row.person).values.split(';').find(s=>s.startsWith(value+':')) || '' : byId.get(row.person)[row.cell];
  assert.equal(row.prior_value,prior);
  if (row.decision === 'HOLD') { assert.equal(row.proposed_direction,''); assert.equal(row.citations,''); continue; }
  assert.equal(row.proposed_direction,value);
  assert.equal(row.decision,prior ? 'KEEP':'CHANGE');
  assert(/p[p]?\d/.test(row.citations));
  const date = row.citations.match(/dated (\d{4}(?:-\d{2}-\d{2})?)$/)?.[1];
  assert(date && (date.length===4 ? date<='1860' : date<'1861-03-05'));
  const key = row.citations.match(/^NEW:([^ ]+)/)?.[1];
  assert(key ? allowedNew.has(key) : row.citations.startsWith('OR I-1 '));
}
assert.deepEqual(counts,{KEEP:2,CHANGE:7,HOLD:73});
let apply = fs.readFileSync(path.join(resource,'tools/apply.js'),'utf8').split('// ---------------------------------------------------------------- blocs')[0];
const enumerator = 'for (const k of [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14])';
assert(apply.includes(enumerator));
apply = apply.replace(enumerator,'for (const k of [16])');
let writeAttempts = 0;
const fakeFs = {
  readFileSync(file) {
    const f = String(file).replace(/\\/g,'/');
    if (f.endsWith('packs/union-1861/source/world/people.csv')) return serialise([header,...input.map(r=>header.map(h=>r[h]||''))]);
    assert(f.endsWith('docs/research/_resource/rs16.csv'));
    return fs.readFileSync(path.join(resource,'rs16.csv'),'utf8');
  },
  existsSync(file) { return String(file).endsWith('rs16.csv'); },
  writeFileSync() { writeAttempts++; throw Error('Pack writes forbidden'); }
};
const sandbox = { process:{env:{PACK_ROOT:root},argv:['node','apply.js','--dry']},require(name){
  if(name==='fs') return fakeFs;
  assert.equal(name,'./csvlib.js'); return csvlib.exports;
}};
vm.runInNewContext(apply+'\nresult={people,H,held,log};',sandbox);
assert.equal(writeAttempts,0);
const after = records(sandbox.result.people);
const mutated = [];
for (const row of after) {
  const before = byId.get(row.id);
  for (const field of header) {
    if ((before[field]||'') !== (row[field]||'')) {
      assert.equal(field,'values');
      assert(rows.some(r=>r.person===row.id));
      mutated.push({person:row.id,field,before:before[field],after:row[field]});
    }
  }
}
assert.equal(mutated.length,6); // J. E. Johnston's prior duty is removed as well as the five positive-value people.
assert(!after.find(r=>r.id==='lee_robert_e').values.split(';').some(s=>s.startsWith('duty:')));
assert.equal(after.find(r=>r.id==='houston_samuel').regard_others,byId.get('houston_samuel').regard_others);
assert.equal(sandbox.result.held.length,73);
const report={pass:true,rows:82,people:17,counts,inMemoryOptInOnly:true,packWriteAttempts:writeAttempts,mutated,applyMessages:Array.from(sandbox.result.log)};
fs.writeFileSync(path.join(evidence,'research-checks.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pass:true,rows:82,people:17,counts,inMemoryChangedPeople:mutated.length,packWriteAttempts:writeAttempts}));
