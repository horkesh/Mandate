/** Offline proof of the single authorised positive-band recenter; never runs the sim. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { gateFailures, REFERENCE_RUNS } from '../packages/cli/src/liveness-gate.ts';

const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const raw='runs/s155/measurement',out='docs/audit/s155-evidence';
const summary=read(`${raw}/summary.json`),baseline=read('runs/s152/measurement/summary.json');
assert.equal(baseline.finalHash,'d4c187e2a6eeabe19e9aa8f6c625654d37a9c4ebf62ca8557f5c614e12f2b164');
assert.equal(summary.rejections,0);
assert(summary.replay.matches&&summary.resume.matches&&summary.resume.savedLogReplays);
assert.deepEqual(read(`${raw}/new-zeros.json`),[]);
const before=read(`${raw}/all-bands.json`);
const reference=REFERENCE_RUNS.find(r=>r.kind==='full'&&r.pack==='union-1861')!;
const final=before.map((r:{mechanic:string})=>({...r,band:reference.bands[r.mechanic]}));
const changes=final.filter((r:unknown,i:number)=>JSON.stringify(r)!==JSON.stringify(before[i]));
assert.equal(changes.length,1);
assert.equal(changes[0].mechanic,'operations.ended');
assert.equal(changes[0].band.minFires,5);assert.equal(changes[0].band.maxFires,22);
const oldState=read('runs/s152/measurement/final-state.json'),state=read(`${raw}/final-state.json`);
const added=Object.entries(state.operationRecords).filter(([id])=>oldState.operationRecords[id]===undefined);
assert.equal(added.length,1);
assert.equal(added[0]![0],'op:cs_cmd_manassas:114');
const operation=added[0]![1] as {opEndDay:number;opOutcome:string};
assert.equal(operation.opEndDay,117);assert.equal(operation.opOutcome,'objective_reached');
const failures=gateFailures(reference,summary.liveness);
const oldFailures=read('runs/s152/measurement/gate-failures.json');
assert(failures.every(f=>oldFailures.some((b:{mechanic:string;problem:string})=>b.mechanic===f.mechanic&&b.problem===f.problem)));
assert.equal(failures.length,25);
const put=(name:string,data:unknown)=>writeFileSync(`${out}/${name}.json`,JSON.stringify(data,null,2)+'\n');
put('all-bands-final',final);put('gate-failures-final',failures);
put('band-recentre',{method:'offline rescore of retained capture; no new simulation',before:before.find((r:{mechanic:string})=>r.mechanic==='operations.ended'),
  after:changes[0],addedOperation:added[0],failuresBefore:read(`${raw}/gate-failures.json`).length,failuresAfter:failures.length,
  other163BandsUnchanged:true,noNewZero:true,authority:'CODEX standing rule: a moved positive band is recentred to around the observed value with its named cause'});
console.log(JSON.stringify({bands:final.length,changed:changes.map((r:{mechanic:string})=>r.mechanic),newZeros:0,failures:failures.length}));
