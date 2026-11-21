/** S43 read-only observer. No kernel/pack writes or State injection. */
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ConsoleGame, type TurnResult} from '../../../packages/cli/src/console/game.ts';
import {ConsoleSession} from '../../../packages/cli/src/console/session.ts';
import type {phase0} from '@mandate/kernel';
const out=new URL('../../../runs/s43/',import.meta.url);
const save=(name:string,data:unknown)=>writeFileSync(new URL(name,out),JSON.stringify(data,null,2)+'\n');
const commandsPath=new URL('../../audit/s41-evidence/advance-commands.json',import.meta.url);
const commands=JSON.parse(readFileSync(commandsPath,'utf8'));
const daily:any[]=[], papers=new Map(), transcript:any[]=[], issued:any[]=[];
let preflight=process.argv.includes('--preflight');
class Observer extends ConsoleGame {
 override turn(commands:readonly phase0.SeatCommand[],limit=this.world.map.world.rules.turns.maxDays):TurnResult {
  const days:TurnResult['days'][number][]=[];
  for(let i=0;i<limit;i++) {
   // Existing driver, existing tick and existing rules. Split only to observe
   // end-of-day truth. Every later day receives the original silent queue.
   const r=super.turn(i===0?commands:[],1); days.push(...r.days);
   const s=this.state;
   daily.push({day:s.stateDay,date:this.dateOf(s.stateDay),hash:this.hash(),
    forceBlockStates:s.forceBlockStates,forceLocations:s.forceLocations,
    forceAssignments:s.forceAssignments,forceEnlistments:s.forceEnlistments,
    postStates:s.postStates,departmentFactions:s.departmentFactions,
    regionControl:s.regionControl,regionFortification:s.regionFortification,
    operationRecords:s.operationRecords,battleRecords:s.battleRecords,
    planRecords:s.planRecords,orderResponses:s.orderResponses,
    infraEdgeCondition:s.infraEdgeCondition,infraDepotCondition:s.infraDepotCondition});
   for(const d of r.days) for(const p of d.reports) papers.set(p.id,p);
   if(r.stopped!=='week') return {days,stopped:r.stopped};
  }
  return {days,stopped:'week'};
 }
}
mkdirSync(out,{recursive:true});
const game=new Observer({pack:'union-1861'}), session=new ConsoleSession(game);
const control=new ConsoleGame({pack:'union-1861'}), controlSession=new ConsoleSession(control);
controlSession.start();
const initialHash=game.hash();
save('world-context.json',{worldHash:game.worldHash,start:game.world.start,map:game.world.map.world});
transcript.push({line:null,day:0,lines:session.start()});
for(const [i,c] of commands.entries()) {
 const before=game.state.stateDay,from=game.log.length;
 const reply=session.handle(c.line);
 controlSession.handle(c.line);
 if(game.hash()!==control.hash())throw Error(`Observer changed State at command ${i}`);
 transcript.push({i,line:c.line,before,after:game.state.stateDay,lines:reply.lines});
 issued.push(...game.log.slice(from));
 if(preflight&&game.state.stateDay>=14)break;
}
save(preflight?'preflight-transcript.json':'transcript.json',transcript);
if(preflight) {
 save('preflight.json',{day:game.state.stateDay,hash:game.hash(),firstMorning:game.dateOfRequest(1),
  workspaceKernel:import.meta.resolve('@mandate/kernel'),commands:transcript.length-1});
 console.log(JSON.stringify({preflight:true,day:game.state.stateDay}));
} else {
 save('daily-private.json',daily);save('public-papers.json',[...papers.values()]);save('issued-entries.json',issued);
 save('summary.json',{source:commandsPath.pathname,sourceSha256:createHash('sha256').update(readFileSync(commandsPath)).digest('hex'),
  commandCount:commands.length,turns:commands.filter((c:any)=>c.line.startsWith('end ')).length,
  initialHash,finalHash:game.hash(),day:game.state.stateDay,worldHash:game.worldHash,observerControlEveryCommand:true,
  refusalWordSearch:transcript.flatMap(t=>t.lines.filter((x:string)=>/refused|cannot|invalid/i.test(x)).map((x:string)=>({i:t.i,text:x}))),
  battles:daily.flatMap(d=>Object.entries(d.battleRecords).filter(([_,b]:any)=>b.battleRegion==='richmond').map(([id,b])=>({day:d.day,id,record:b}))) });
 console.log(JSON.stringify({commands:commands.length,days:daily.length,finalHash:game.hash(),papers:papers.size}));
}
