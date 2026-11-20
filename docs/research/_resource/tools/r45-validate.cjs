// Read-only harness for the inherited CommonJS readers in this ESM repository.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const dir = __dirname;
const resource = path.dirname(dir);
const csv = { exports: {} };
vm.runInNewContext(fs.readFileSync(path.join(dir, 'csvlib.js'), 'utf8'), {exports:csv.exports});
let total=0;
const totals={KEEP:0,CHANGE:0,HOLD:0};
const seen=new Set();
for(let n=10;n<=14;n++) {
  const text=fs.readFileSync(path.join(resource,`rs${n}.csv`),'utf8');
  assert(!text.startsWith('\uFEFF'));
  assert(!text.includes(';'));
  const rows=csv.exports.parse(text);
  assert.equal(rows[0].join(','),'person,cell,decision,proposed_direction,citations,basis,prior_value');
  const batch=fs.readFileSync(path.join(resource,'briefs',`batch${n}.md`),'utf8').split(/\r?\n/).filter(l=>l.includes(' | ')&&!l.startsWith('person ')).map(l=>l.split(' | ').map(s=>s.trim()));
  assert.equal(rows.length-1,batch.length);
  for(let i=1;i<rows.length;i++) {
    const row=rows[i]; assert.equal(row.length,7);
    const [person,cell,decision,direction,citations,basis,prior]=row;
    assert.equal(person,batch[i-1][0]); assert.equal(cell,batch[i-1][1]); assert.equal(prior,batch[i-1][3]);
    const id=person+'/'+cell; assert(!seen.has(id)); seen.add(id);
    assert(Object.hasOwn(totals,decision)); totals[decision]++;
    assert(basis.length>30);
    if(decision!=='HOLD') {assert(direction);assert(citations);assert(basis.includes('[I]'));}
    else {assert.equal(direction,'');assert.equal(citations,'');}
    total++;
  }
}
assert.equal(total,130);
console.log('R45 CSV validation PASS',JSON.stringify({total,...totals}));
const readonlyFs={readFileSync:fs.readFileSync,existsSync:fs.existsSync};
const dryProcess={argv:['node','apply.js','--dry'],env:{...process.env,PACK_ROOT:path.resolve(resource,'../../..')},exit(code){assert.equal(code,0);throw new Error('R45_DRY_DONE');}};
try {
  vm.runInNewContext(fs.readFileSync(path.join(dir,'apply.js'),'utf8'),{
    require(name){if(name==='fs')return readonlyFs;if(name==='./csvlib.js')return csv.exports;throw new Error('unexpected require '+name);},
    process:dryProcess,console,
  },{filename:'inherited-apply.js'});
} catch(e) {if(e.message!=='R45_DRY_DONE')throw e;}
console.log('Inherited apply dry-run PASS, filesystem writes unavailable in harness');
