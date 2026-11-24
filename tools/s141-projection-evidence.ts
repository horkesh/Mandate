/** Audit the two changed menu dependency closures; preserve every other projection permission. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { filesUnder } from './rules/common.ts';
import { projectionFindings } from './rules/projection-truth.ts';

const base='5c4a9d83', evidence='docs/audit/s141-evidence/kernel-projection.json';
const tracked=new Set(execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split(/\r?\n/));
const paths=['packages','prototypes/desk'].flatMap(p=>filesUnder(process.cwd(),p)).filter(p=>/\.[cm]?[jt]sx?$/.test(p)&&!/(?:\/tests?\/|\.test\.|\.d\.ts$)/.test(p));
const sources=(before:boolean)=>paths.filter(p=>!before||tracked.has(p)).map(path=>({path,code:(before?execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8',maxBuffer:16*1024*1024}):readFileSync(path,'utf8')).replaceAll('\r\n','\n')}));
const before=projectionFindings(sources(true),[]),after=projectionFindings(sources(false),[]);
const path='tools/rules/projection-derivations.json';
const permissions=JSON.parse(readFileSync(path,'utf8'));
const stale=projectionFindings(sources(false),permissions);
const unchanged=after.filter(a=>!['principalMenu','pendingRequests'].some(s=>a.path==='packages/kernel/src/seats/requests.ts'&&a.detail.startsWith(`${s} reaches `)));
for(const actual of unchanged)assert.deepEqual(actual,before.find(b=>b.path===actual.path&&b.detail.split(' reaches ')[0]===actual.detail.split(' reaches ')[0]));
for(const actual of stale)assert(actual.path==='packages/kernel/src/seats/requests.ts'&&['principalMenu','pendingRequests'].some(s=>actual.detail.startsWith(`${s} reaches `)));
const rows=after.filter(a=>a.path==='packages/kernel/src/seats/requests.ts'&&['principalMenu','pendingRequests'].some(s=>a.detail.startsWith(`${s} reaches `))).map(actual=>{
  const symbol=actual.detail.split(' reaches ')[0]!;
  assert(actual.path==='packages/kernel/src/seats/requests.ts'&&['principalMenu','pendingRequests'].includes(symbol));
  const old=before.find(b=>b.path===actual.path&&b.detail.startsWith(`${symbol} reaches `))!;
  if(symbol==='principalMenu')assert.equal(actual.detail,old.detail,'principal protected reader identities must not expand');
  else {
    const extra=actual.detail.split(' reaches ')[1]!.split('; ').filter(r=>!old.detail.includes(r));
    assert.deepEqual(extra,['packages/kernel/src/seats/allocation.ts:allocationFulfilments (postStates)']);
  }
  const row=permissions.find((r:{path:string;symbol:string})=>r.path===actual.path&&r.symbol===symbol);assert(row);
  row.hash=actual.hash;
  if(!row.reason.includes(' S141:'))row.reason+=' S141: only the receiving sender may fulfil his own received allocation request; actual own holder, holdings, reservations and received authority judge the local option. Principal allocation readiness reads authored terms and own correspondence, with no new protected reader.';
  if(!row.citation.includes(evidence))row.citation+=`; ${evidence}; notes/sprint-S141-allocation.md; CODEX S141 item 1 (0131)`;
  return {symbol,before:old,after:actual};
});
assert.equal(rows.length,2);
mkdirSync('docs/audit/s141-evidence',{recursive:true});
writeFileSync(evidence,JSON.stringify({base,rows,unchangedRoots:unchanged.length,checks:['principal protected-reader identities unchanged','only own received-request holder added to commander menu','all other projection roots byte-equivalent closures','fictional hidden holder/side test and received authority tests']},null,2)+'\n');
writeFileSync(path,JSON.stringify(permissions,null,2)+'\n');
assert.deepEqual(projectionFindings(sources(false),permissions),[]);
console.log(JSON.stringify({updated:rows.map(r=>r.symbol),unchangedRoots:unchanged.length}));
