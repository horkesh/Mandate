/** Audit the two changed menu dependency closures; preserve every other projection permission. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { filesUnder } from './rules/common.ts';
import { projectionFindings } from './rules/projection-truth.ts';

const base='91a816bd', evidence='docs/audit/s147-evidence/projection.json';
const tracked=new Set(execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split(/\r?\n/));
const paths=['packages','prototypes/desk'].flatMap(p=>filesUnder(process.cwd(),p)).filter(p=>/\.[cm]?[jt]sx?$/.test(p)&&!/(?:\/tests?\/|\.test\.|\.d\.ts$)/.test(p));
const sources=(before:boolean)=>paths.filter(p=>!before||tracked.has(p)).map(path=>({path,code:(before?execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8',maxBuffer:16*1024*1024}):readFileSync(path,'utf8')).replaceAll('\r\n','\n')}));
const before=projectionFindings(sources(true),[]),after=projectionFindings(sources(false),[]);
const path='tools/rules/projection-derivations.json';
const permissions=JSON.parse(readFileSync(path,'utf8'));
const stale=projectionFindings(sources(false),permissions);
const unchanged=after.filter(a=>!['pendingRequests'].some(s=>a.path==='packages/kernel/src/seats/requests.ts'&&a.detail.startsWith(`${s} reaches `)));
for(const actual of unchanged)assert.deepEqual(actual,before.find(b=>b.path===actual.path&&b.detail.split(' reaches ')[0]===actual.detail.split(' reaches ')[0]));
for(const actual of stale)assert(actual.path==='packages/kernel/src/seats/requests.ts'&&['pendingRequests'].some(s=>actual.detail.startsWith(`${s} reaches `)));
const rows=after.filter(a=>a.path==='packages/kernel/src/seats/requests.ts'&&['pendingRequests'].some(s=>a.detail.startsWith(`${s} reaches `))).map(actual=>{
  const symbol=actual.detail.split(' reaches ')[0]!;
  assert(actual.path==='packages/kernel/src/seats/requests.ts'&&['pendingRequests'].includes(symbol));
  const old=before.find(b=>b.path===actual.path&&b.detail.startsWith(`${symbol} reaches `))!;
  if(symbol==='principalMenu')assert.equal(actual.detail,old.detail,'principal protected reader identities must not expand');
  else {
    const extra=actual.detail.split(' reaches ')[1]!.split('; ').filter(r=>!old.detail.includes(r));
    assert.deepEqual(extra,['packages/kernel/src/command/allocation.ts:allocationAuthority (postStates)','packages/kernel/src/seats/force-requests.ts:forceOptions (postStates)']);
  }
  const row=permissions.find((r:{path:string;symbol:string})=>r.path===actual.path&&r.symbol===symbol);assert(row);
  row.hash=actual.hash;
  if(!row.reason.includes(' S147:'))row.reason+=' S147: forceOptions reads the acting holder and his immediate superior in his own institutional chain; answers come only from the actor received request packet. Own actual holdings and received mission/planner picture establish needs; remote answers are not knowledge before their report. No global friendly inventory or hidden enemy truth is a request input. allocationAuthority additionally revalidates the actor own governor root or the named mission/requester behind his received allocation; this permits no arbitrary peer command. Actual authority is revalidated by execution.';
  if(!row.citation.includes(evidence))row.citation+=`; ${evidence}; notes/sprint-S147-receipt-requests.md; CODEX S147; accepted0133 in C:/Pyrrhic/ByOrderOfThePresident/docs/decisions/`;
  return {symbol,before:old,after:actual};
});
assert.equal(rows.length,1);
mkdirSync('docs/audit/s147-evidence',{recursive:true});
writeFileSync(evidence,JSON.stringify({base,rows,unchangedRoots:unchanged.length,checks:['all seven other protected-reader roots unchanged','own institutional holder/chain and received-allocation mission/root revalidation only','all other projection roots byte-equivalent closures','fictional hidden enemy perturbation, received knowledge, holder/side and authority counterexamples']},null,2)+'\n');
writeFileSync(path,JSON.stringify(permissions,null,2)+'\n');
assert.deepEqual(projectionFindings(sources(false),permissions),[]);
console.log(JSON.stringify({updated:rows.map(r=>r.symbol),unchangedRoots:unchanged.length}));
