import { writeFileSync } from 'node:fs';
import { phase0Run } from '../../../packages/cli/src/phase0-run.ts';
import { observeRun, pushbackCount } from '../../../packages/cli/src/history-run.ts';
import { historyPack } from '../../../packages/cli/src/done-check.ts';

const h = historyPack('union-1861')!;
const days = process.argv.includes('--startup') ? 1 : 148;
const seeds = days === 1 ? [h.seed] : Array.from({length:8},(_,i)=>h.seed+i);
for (const seed of seeds) {
 const observer = observeRun(h.checkpoints,h.startDate);
 const responses:any[]=[];
 const seen=new Set<string>();
 const holders:any[]=[];
 let allEdits=0, noteEdits=0, allNotes=0;
 const summary=phase0Run({pack:'union-1861',seed,days,checks:false,replay:false,hash:'daily',onTick(world,r){
  observer.onTick(world,r);
  if ([8,11,42,73,84,148].includes(r.day)) holders.push({day:r.day,posts:Object.fromEntries(Object.entries(r.state.postStates).filter(([k])=>/adjutant|secretary_state|private|nicolay|postmaster|blair|general_in_chief|west/.test(k)))});
  for (const [key,response] of Object.entries(r.state.orderResponses)) {
   if (response.respDay!==r.day || response.respRole!=='addressee') continue;
   const dedup=`${key}|${response.respActual}`;
   if (seen.has(dedup)) continue;
   seen.add(dedup);
   const plan=response.respPost===null?undefined:r.state.planRecords[response.respPost];
   const noteBearingEdit=response.respKind==='edit' && (plan?.planNotes?.length??0)>0;
   if (response.respKind==='edit') allEdits++;
   if (noteBearingEdit) noteEdits++;
   if (response.respNote!==undefined) allNotes++;
   if (!['comply_with_reservations','slow_walk'].includes(response.respActual)) continue;
   if (response.respTerms.reduce((n,t)=>n+t.respTermAmount,0)!==response.respWillingness) throw Error('terms do not sum');
   const person=world.map.world.people.find(p=>p.id===response.respPerson);
   responses.push({key,...response,personName:person?.name, noteBearingEdit,
    plan:plan===undefined?null:{goal:plan.planGoal,issued:plan.planIssuedDay,notes:plan.planNotes??[],counters:plan.planCounters.filter(c=>c.counterResponse===key)}});
  }
 }});
 const obs=observer.observations();
 const counts=h.checkpoints.pushback.map(p=>({id:p.id,n:pushbackCount(p,obs,summary.daily,h.startDate),min:p.min,max:p.max}));
 for (const [id,rung] of [['reservations','comply_with_reservations'],['slow_walks','slow_walk']]) {
  if (responses.filter(r=>r.respActual===rung).length!==counts.find(c=>c.id===id)!.n) throw Error('observer mismatch');
 }
 writeFileSync(`runs/s37/seed-${seed}${days===1?'-startup':''}.json`,JSON.stringify({seed,days,counts,allEdits,noteEdits,allNotes,responses,holders,summary},null,2)+'\n');
 console.log(JSON.stringify({seed,days,counts,allEdits,noteEdits,allNotes}));
}
