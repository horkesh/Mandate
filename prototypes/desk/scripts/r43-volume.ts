/** Bounded real-console run; only the adapter's visible envelope is retained. */
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {weeklyPapers,senderGroup} from '../web/intray.ts';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL('../../../art-masters/R43/',import.meta.url));mkdirSync(out,{recursive:true});
const desk=new DeskAdapter(new ConsoleGame({pack:'union-1861',atWar:true}));
const samples:{day:number;weekCount:number;trayCount:number}[]=[];
let best=desk.snapshot(),bestCount=-1;
while(desk.snapshot().morning.view.day<77){
  const result=desk.execute('end');if(!result.ok||!result.turn?.days.length)throw Error('Console did not advance');
  const data=result.snapshot,day=data.morning.view.day;
  const count=data.morning.view.reports.filter(r=>r.receivedDay>=Math.max(1,day-6)&&r.receivedDay<=day).length;
  samples.push({day,weekCount:count,trayCount:data.morning.view.reports.length});
  if(count>bestCount){bestCount=count;best=data;}
}
const summary=weeklyPapers(best);
writeFileSync(`${out}/busiest-snapshot.json`,JSON.stringify(best));
writeFileSync(`${out}/volume.json`,JSON.stringify({horizon:'Eleven completed at-war weeks, days 1?77; silent human principal; seven-day receipt windows',lastDay:desk.snapshot().morning.view.day,samples,
  selectedDay:best.morning.view.day,weekReceipts:bestCount,inTray:best.morning.view.reports.length,
  summaryPapers:summary.coveredPapers,summaryLines:summary.lines.length,pressMainStories:0,
  weeklySummaryAcceptance:'Partial: ReportView carries no press story payload; press entries are source links only',
  sections:Object.fromEntries(Object.keys({control:0,battles:0,plans:0,press:0}).map(k=>[k,summary.lines.filter(l=>l.section===k).length])),
  senderCounts:Object.fromEntries(['commanders','departments','press','cabinet','others'].map(k=>[k,best.morning.view.reports.filter(r=>senderGroup(r,best)===k).length]))},null,2));
console.log(JSON.stringify({selectedDay:best.morning.view.day,weekReceipts:bestCount,inTray:best.morning.view.reports.length,summaryPapers:summary.coveredPapers,summaryLines:summary.lines.length}));
