/** Certify 0137's immutable root declarations without changing protected readers. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { filesUnder } from './rules/common.ts';
import { projectionFindings } from './rules/projection-truth.ts';

const baseline='d2ccca82',file='tools/rules/projection-derivations.json';
const permissions=JSON.parse(execFileSync('git',['show',`${baseline}:${file}`],{encoding:'utf8'}));
const sources=['packages','prototypes/desk'].flatMap(p=>filesUnder(process.cwd(),p))
  .filter(p=>/\.[cm]?[jt]sx?$/.test(p)&&!/(?:\/tests?\/|\.test\.|\.d\.ts$)/.test(p))
  .map(path=>({path,code:readFileSync(path,'utf8').replaceAll('\r\n','\n')}));
const changed=new Set(['packages/kernel/src/command/force-requests.ts','packages/kernel/src/seats/force-requests.ts']);
const beforeSources=sources.filter(s=>s.path!=='packages/kernel/src/command/root-modes.ts').map(s=>changed.has(s.path)?
  {...s,code:execFileSync('git',['show',`${baseline}:${s.path}`],{encoding:'utf8'}).replaceAll('\r\n','\n')}:s);
assert.deepEqual(projectionFindings(beforeSources,permissions),[]);
const before=projectionFindings(beforeSources,[]),after=projectionFindings(sources,[]);
const updates=[];
for(const row of permissions) {
  const find=(rows:typeof before)=>rows.find(r=>r.path===row.path&&r.detail.startsWith(`${row.symbol} reaches `));
  const a=find(after),b=find(before);
  if(a?.hash===b?.hash)continue;
  assert(a&&b);
  assert.equal(a.detail,b.detail,'protected reader identities must remain exact');
  assert.equal(row.symbol,'pendingRequests');
  updates.push({symbol:row.symbol,before:b,after:a});
  row.hash=a.hash;
  row.reason+=' S155/0137: root movement modes derive only from immutable declared grants issued by that principal; read paper modes bind. Received request stamps still gate governor choices. No new protected truth reader.';
  row.citation+='; docs/audit/s155-evidence/decisions/0137-the-root-holds-what-it-grants.md; docs/audit/s155-evidence/projection.json';
}
assert.equal(updates.length,1);
assert.deepEqual(projectionFindings(sources,permissions),[]);
mkdirSync('docs/audit/s155-evidence',{recursive:true});
writeFileSync('docs/audit/s155-evidence/projection.json',JSON.stringify({baseline,updates,allProtectedReaderIdentitiesUnchanged:true,scannerUnchanged:true},null,2)+'\n');
writeFileSync(file,JSON.stringify(permissions,null,2)+'\n');
console.log(JSON.stringify({updates:updates.map(r=>r.symbol),findings:0}));
