import type {ReportView} from '@mandate/kernel/seat-api';
import type {DeskDay,DeskSnapshot,DeskTurn} from './adapter.ts';
export function reportPlace(report:ReportView){return report.claims.find(c=>c.region)?.region??(report.subjectKind==='region'?report.subjectId:'');}
export interface DayFrame {day:DeskDay;report?:ReportView;phase:'mark'|'land'|'date'}
/** Preserve the console's order within a delivery day; never reorder by knowledge age. */
export function dayFrames(turn:DeskTurn):DayFrame[]{
 return [...turn.days].sort((a,b)=>a.day-b.day).flatMap<DayFrame>(day=>day.reports.length?day.reports.flatMap<DayFrame>(report=>[{day,report,phase:'mark'},{day,report,phase:'land'}]):[{day,phase:'date'}]);
}
/** Only delivered reports and their beliefs become visible during playback. */
export function playbackSnapshot(before:DeskSnapshot,after:DeskSnapshot,frames:DayFrame[],index:number):DeskSnapshot{
 const delivered=frames.slice(0,index+1).filter(f=>f.phase==='land').map(f=>f.report!);
 const reports=[...before.morning.view.reports,...delivered.filter(r=>!before.morning.view.reports.some(p=>p.id===r.id))];
 const ids=new Set(reports.map(r=>r.id));
 const view={...before.morning.view,reports,
  enemyBeliefs:{...before.morning.view.enemyBeliefs,...Object.fromEntries(Object.entries(after.morning.view.enemyBeliefs).filter(([,b])=>ids.has(b.source)))},
  worksBeliefs:{...before.morning.view.worksBeliefs,...Object.fromEntries(Object.entries(after.morning.view.worksBeliefs).filter(([,b])=>ids.has(b.source)))}};
 return {...before,date:frames[index]?.day.date??before.date,paperText:after.paperText,morning:{...before.morning,requestDay:frames[index]?.day.day??before.morning.requestDay,view}};
}
