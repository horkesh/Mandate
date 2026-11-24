/** Verify a hash-neutral optimisation against the one retained S150 capture, without a new capture. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const stage=process.argv[2]!, out='C:/Pyrrhic/sprint-allocate/runs/s150';
assert(['before','after'].includes(stage));
assert(!existsSync(`${out}/optimisation-${stage}.json`),'verification is bounded, never overwrite');
const kernel=await import(pathToFileURL(`${process.cwd()}/packages/kernel/src/index.ts`).href);
const {seatsWorld}=await import(pathToFileURL(`${process.cwd()}/packages/cli/src/seats-world.ts`).href);
const {createRuleSeat}=await import(pathToFileURL(`${process.cwd()}/packages/rule-seats/src/index.ts`).href);
const {world,worldHash,setup}=seatsWorld('union-1861');
const summary=JSON.parse(readFileSync(`${out}/measurement/summary.json`,'utf8'));
assert.equal(worldHash,summary.worldHash);
const saved=kernel.decodeSave(readFileSync(`${out}/measurement/save-60.json`,'utf8'),{expectedWorldHash:worldHash});
let run;
if(stage==='before') {
  const seat=createRuleSeat();
  run=kernel.phase0.playDays(world,saved.state,()=>seat,88,{freeze:true,deepChecks:true,onDay:(r:{day:number;rejections:unknown[];state:unknown})=>{
    assert.equal(r.rejections.length,0);
    assert.equal(kernel.canonicalHash(r.state),summary.turns.find((t:{turn:number})=>t.turn===r.day).hash,`retained capture mismatch day${r.day}`);
  }});
  const log=[...saved.log,...run.log];
  assert.equal(log.length,summary.logEntries);
  writeFileSync(`${out}/optimisation-original-log.json`,JSON.stringify(log,null,2)+'\n');
} else {
  const log=JSON.parse(readFileSync(`${out}/optimisation-original-log.json`,'utf8'));
  run=kernel.phase0.replay(world,kernel.phase0.createState(world,setup),log,148,{freeze:true,deepChecks:true,onDay:(r:{day:number;rejections:unknown[];state:unknown})=>{
    assert.equal(r.rejections.length,0);
    assert.equal(kernel.canonicalHash(r.state),summary.turns.find((t:{turn:number})=>t.turn===r.day).hash,`optimised replay mismatch day${r.day}`);
  }});
}
const finalHash=kernel.canonicalHash(run.state);
assert.equal(finalHash,summary.finalHash);
writeFileSync(`${out}/optimisation-${stage}.json`,JSON.stringify({stage,cwd:process.cwd(),worldHash,days:stage==='before'?88:148,
  firstDay:stage==='before'?61:1,lastDay:148,rejections:0,finalHash,allDailyHashesMatch:true,freeze:true,deepChecks:true},null,2)+'\n');
console.log(JSON.stringify({stage,finalHash,allDailyHashesMatch:true}));
