/** Read-only kernel replay of recorded UI submissions; never loads or drives a desk. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {canonicalHash,phase0} from '@mandate/kernel';
import type {SeatCommand} from '@mandate/kernel/seat-api';
import {createRuleSeat} from '@mandate/rule-seats';
import {seatsWorld} from '../../../packages/cli/src/seats-world.ts';
import {parseLine} from '../../../packages/cli/src/desk/commands.ts';
const out=resolve('../../../ByOrderOfThePresident/art-masters/S33');
const {world,setup}=seatsWorld('union-1861'),rules=createRuleSeat();
const principal=world.start.factions.find(f=>f.playable)!.principal!;
const horizon=Number(process.env.S33_TRACE_DAYS??148);
if(!Number.isSafeInteger(horizon)||horizon<1||horizon>148)throw Error('Trace horizon must be 1–148 days');
for(const [label,path] of [['s29','../S29/completed-history/browser-commands.jsonl'],['s33','press-advance/commands.jsonl']] as const){
 const records=readFileSync(resolve(out,path),'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l) as {day:number;line:string;ok:boolean});
 const schedule=new Map<number,typeof records>();for(const r of records)schedule.set(r.day,[...(schedule.get(r.day)??[]),r]);
 const initial=phase0.createState(world,{...setup,drivers:{[principal]:'human'}}),days:unknown[]=[],rejections:unknown[]=[];
 const human:phase0.Seat={driver:'human',respond:request=>{
  const queue:SeatCommand[]=[];
  for(const r of schedule.get(request.requestDay)??[]){
   if(!r.ok)throw Error('Recorded unsuccessful UI command');
   if(/^(end|preview)\b/.test(r.line))continue; // shell scheduling and read-only preview, not kernel commands
   const parsed=parseLine(r.line,request);
   if(parsed.kind==='command')queue.push(parsed.command);
   else if(parsed.kind==='cancel')queue.splice(parsed.index-1,1);
   else if(parsed.kind==='error')throw Error(`${label} day ${r.day}: ${r.line}: ${parsed.message}`);
  }
  return {answerKind:'commands',commands:queue};
 }};
 const run=phase0.playDays(world,initial,id=>id===phase0.seatIdFor(principal)?human:rules,horizon,{freeze:false,deepChecks:false,hashEvery:horizon,onDay:r=>{
  rejections.push(...r.rejections);
  if(r.day>=133)days.push({day:r.day,plan:Object.entries(r.state.planRecords).find(([post])=>post==='us_dc_militia')?.[1],operations:Object.fromEntries(Object.entries(r.state.operationRecords).filter(([,o])=>o.opPost==='us_dc_militia')),responses:Object.fromEntries(Object.entries(r.state.orderResponses).filter(([,v])=>v.respPost==='us_dc_militia'&&v.respDay===r.day)),battles:r.state.battleRecords});
 }});
 let publicMorningMatches:boolean|null=null;
 if(horizon===148){
  const reference=label==='s29'?'../S29/completed-history/final-snapshot.json':'press-advance/final.json';
  const {turnStops,...expected}=JSON.parse(readFileSync(resolve(out,reference),'utf8')).morning;
  const actual=phase0.pendingRequests(world,run.state).find(r=>r.requestSeat===phase0.seatIdFor(principal));
  publicMorningMatches=canonicalHash(actual)===canonicalHash(expected);
  if(!publicMorningMatches)throw Error(`${label} kernel diagnostic does not reproduce the recorded public morning`);
 }
 writeFileSync(`${out}/${label}-kernel-replay-${horizon}.json`,JSON.stringify({source:path,publicMorningMatches,finalHash:canonicalHash(run.state),rejections,days},null,2));
 console.log(JSON.stringify({label,days:horizon,finalHash:canonicalHash(run.state),rejections:rejections.length,battles:Object.keys(run.state.battleRecords)}));
}
