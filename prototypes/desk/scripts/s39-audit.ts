/** Read the retained public desk record only. This script never runs a game. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {deskDate} from '../web/plan-business.ts';
import type {DeskSnapshot} from '../web/adapter.ts';
const root=resolve('../../art-masters/S39');
const sha=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const summary=[];
for(const profile of ['advance','training']){
 const source=`${root}/${profile}/last-turn-reply.json`,data=JSON.parse(readFileSync(source,'utf8')).snapshot as DeskSnapshot;
 const commands=readFileSync(`${root}/${profile}/commands.jsonl`,'utf8').trim().split(/\r?\n/).map(s=>JSON.parse(s));
 const days=data.history.flatMap(t=>t.days),reports=[...new Map([...days.flatMap(d=>d.reports),...data.morning.view.reports].map(r=>[r.id,r])).values()];
 if(data.date!=='1861-07-31'||data.morning.view.day!==148||days.length!==148||days.some((d,i)=>d.day!==i+1)||days.at(-1)?.date!=='1861-07-31')throw Error(`${profile}: incomplete July`);
 if(commands.filter(c=>/^end(?: |$)/.test(c.line)).length!==data.history.length)throw Error(`${profile}: command/turn mismatch`);
 const arrivals=reports.filter(r=>r.claims.some(c=>c.kind==='arrived'&&c.region==='richmond')).map(r=>({id:r.id,author:r.author,written:deskDate(data,r.day),received:deskDate(data,r.receivedDay)}));
 const fieldDispatches=reports.filter(r=>r.claims.some(c=>['battle-phase','battle-result'].includes(c.kind)&&['richmond','manassas'].includes(c.region??''))).map(r=>({id:r.id,author:r.author,written:deskDate(data,r.day),received:deskDate(data,r.receivedDay),hour:r.hour,claims:r.claims.filter(c=>['battle-phase','battle-result'].includes(c.kind))}));
 const acts=data.history.flatMap(t=>(t.submitted??[]).map((q,index)=>({morning:deskDate(data,t.days[0]!.day-1),executionDay:t.days[0]!.date,line:q.line,text:q.text,refused:t.days.flatMap(d=>d.refused).filter(r=>r.commandIndex===index).map(r=>r.reason)})));
 const result={profile,source,sourceSha256:sha(source),firstMorning:'1861-03-05',finalMorning:data.date,completedDay:data.morning.view.day,days:days.length,turns:data.history.length,commands:commands.length,queueErrors:commands.filter(c=>!c.ok),dispatchRefusals:days.flatMap(d=>d.refused.map(r=>({date:d.date,...r}))),arrivals,fieldDispatches,acts};
 writeFileSync(`${root}/${profile}/public-observation-audit.json`,JSON.stringify(result,null,2)+'\n');
 summary.push({...result,acts:undefined,source:source.replaceAll('\\','/')});
}
writeFileSync(`${root}/public-observation-summary.json`,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary.map(s=>({profile:s.profile,days:s.days,turns:s.turns,commands:s.commands,queueErrors:s.queueErrors.length,dispatchRefusals:s.dispatchRefusals.length,RichmondArrivals:s.arrivals.length,fieldDispatches:s.fieldDispatches.length})),null,2));
