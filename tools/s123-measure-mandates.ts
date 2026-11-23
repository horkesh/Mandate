/** One retained S123 data measurement; compare with S119, never refit the run. */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRuleSeat } from '../packages/rule-seats/src/index.ts';
import { phase0Run } from '../packages/cli/src/phase0-run.ts';
import { seatsWorld } from '../packages/cli/src/seats-world.ts';
import { historyPack } from '../packages/cli/src/done-check.ts';
import { observeRun, checkpointsScore, operationScore, unknownStrengthScore } from '../packages/cli/src/history-run.ts';
import { coverageScore } from '../packages/cli/src/pushback-coverage.ts';
import { gateFailures, REFERENCE_RUNS } from '../packages/cli/src/liveness-gate.ts';
import type { State } from '../packages/kernel/src/root-state.ts';
import type { Seat } from '../packages/kernel/src/seats/api.ts';

const smoke = process.argv.includes('--smoke');
const out = `runs/s123/${smoke?'data-smoke':process.argv.includes('--corrected')?'measurement-corrected':'measurement'}`;
mkdirSync(out,{recursive:true});
const put = (name:string,value:unknown) => writeFileSync(`${out}/${name}.json`,JSON.stringify(value,null,2)+'\n');
const {world} = seatsWorld('union-1861');
const checkpoints = JSON.parse(readFileSync('packs/union-1861/checkpoints.json','utf8'));
const observer = observeRun(checkpoints,world.start.startDate);
const dispatches: unknown[] = [], receipts: unknown[] = [], choices: unknown[] = [], rejected: unknown[] = [];
const authorities = new Map<string,unknown>();
const baseSeat=createRuleSeat();
let continuous=true, final:State|undefined;
const seat:Seat={driver:'rules',respond(request) {
  const answer=baseSeat.respond(request);
  if (continuous && (request.menu.menuKind==='local-action' || answer.answerKind==='commands' && answer.commands.some(c => c.cmd==='mandate'))) {
    choices.push({day:request.requestDay,seat:request.requestSeat,person:request.view.person,request:request.requestKey,menu:request.menu,answer});
  }
  return answer;
}};
let summary:ReturnType<typeof phase0Run>;
try {
summary=phase0Run({pack:'union-1861',days:smoke?2:148,hash:'daily',seats:()=>seat,replay:!smoke,
  ...(smoke?{}:{resumeAtDay:60,onSave:(text:string,day:number)=>writeFileSync(`${out}/save-${day}.json`,text)}),
  onTick(w,r) {
    observer.onTick(w,r); final=r.state;
    put('last-day',{day:r.day,rejections:r.rejections,grants:Object.keys(r.state.authorityByPost??{})});
    dispatches.push(...(r.requestDispatches??[])); receipts.push(...(r.requestReceipts??[])); rejected.push(...r.rejections);
    for (const [post,rows] of Object.entries(r.state.authorityByPost??{})) for (const row of rows) {
      const key=`${post}:${row.authorityGrant.mandateKey}:${row.authorityRevisionSeen}`;
      if (!authorities.has(key)) authorities.set(key,{post,...row});
    }
    if (r.day===(smoke?2:148)) continuous=false;
  }});
} catch (error) {
  put('partial',{lastCompletedDay:final?.stateDay??null,error:String(error),dispatches,receipts,choices,rejected,authorities:[...authorities.values()]});
  put('partial-state',final??null);
  throw error;
}
put('summary',summary);put('dispatches',dispatches);put('receipts',receipts);put('choices',choices);put('rejections',rejected);
put('authority', [...authorities.values()]);put('final-state',final);
if (!smoke) {
  const obs=observer.observations();
  const coverage=coverageScore(historyPack('union-1861')?.pushbackRegisters??[],obs.pushbackActs??[],world.start.startDate,obs.lastDay,summary.daily);
  put('coverage',coverage);
  const scores={checkpoints:checkpointsScore(checkpoints,obs,world.start.startDate,false),operation:operationScore(obs),
    unknownStrength:unknownStrengthScore([{name:'union-1861',battles:obs.battles}]),pushback:{problems:coverage.problems}};
  put('scores',scores);
  put('observations',{...obs,battles:[...obs.battles],operations:[...obs.operations],snapshots:[...obs.snapshots],notHeld:[...obs.notHeld]});
  const reference=REFERENCE_RUNS.find(r=>r.kind==='full'&&r.pack==='union-1861')!;
  put('gates',gateFailures(reference,summary.liveness));
  const baseline=JSON.parse(readFileSync('C:/Pyrrhic/sprint-july/runs/s119/references/coverage.json','utf8'));
  put('rows',coverage.rows.map(row=>({before:baseline.rows.find((b:{id:string;side:string})=>b.id===row.id&&b.side===row.side),after:row})));
  assert.equal(coverage.rows.length,33);
  assert(summary.replay?.matches);assert(summary.resume?.matches);assert(summary.resume?.savedLogReplays);
}
assert.equal(summary.rejections,0);
console.log(JSON.stringify({days:summary.finalDay,rejections:summary.rejections,grants:[...authorities.keys()],choices:choices.length,
  finalHash:summary.finalHash,replay:summary.replay,resume:summary.resume}));
