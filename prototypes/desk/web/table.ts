import type {ReportView} from '@mandate/kernel/seat-api';
import type {DeskDay,DeskSnapshot,DeskTurn} from './adapter.ts';
/** These links are candidates in the last delivery day, not invented point-to-report IDs. */
export function stopEntries(turn:DeskTurn):{reason:string;papers:ReportView[]}[]{
 if(turn.stopped==='week')return [{reason:'week',papers:[]}];
 const reports=turn.days.at(-1)?.reports??[];
 return turn.stopped.map(reason=>({reason,papers:reports.filter(r=>{
  const has=(...kinds:string[])=>r.claims.some(c=>kinds.includes(c.kind));
  switch(reason){
   case 'battle-report':return has('battle-phase','battle-result','casualties','own-losses');
   case 'objection':return has('order-objected')||r.claims.some(c=>['plan-answer','verb-answered'].includes(c.kind)&&/object|refus/.test(c.token??''));
   case 'plan-review':return has('plan-submitted');
   case 'pocket-closed':return has('pocket');
   case 'objective-reached':return has('arrived','goal-status');
   case 'order-conflict':return has('order-returned','order-objected');
   default:return reason.startsWith('situation-')&&r.subjectKind==='situation';
  }
 })}));
}
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
 const controlBeliefs={...before.morning.view.controlBeliefs,...Object.fromEntries(Object.entries(after.morning.view.controlBeliefs??{}).filter(([,b])=>b.sources.every(s=>ids.has(s.report))))};
 // A final front is visible only when both endpoint beliefs have arrived.
 // Retain an earlier segment while its own pair is still the earlier pair.
 const same=(region:string,table:typeof controlBeliefs)=>JSON.stringify(controlBeliefs[region as keyof typeof controlBeliefs])===JSON.stringify(table?.[region as keyof typeof controlBeliefs]);
 const claimedFronts=[...(before.morning.view.claimedFronts??[]).filter(f=>same(f.own,before.morning.view.controlBeliefs)&&same(f.faces,before.morning.view.controlBeliefs)),...(after.morning.view.claimedFronts??[]).filter(f=>same(f.own,after.morning.view.controlBeliefs)&&same(f.faces,after.morning.view.controlBeliefs))];
 const uniqueFronts=[...new Map(claimedFronts.map(f=>[`${f.faction}:${f.edge}`,f])).values()];
 const update=[...delivered].reverse().map(r=>after.history.map(t=>t.controlUpdates?.[r.id]).find(Boolean)).find(Boolean);
 const view={...before.morning.view,reports,
  controlBeliefs:update?.controlBeliefs??controlBeliefs,claimedFronts:update?.claimedFronts??uniqueFronts,
  enemyBeliefs:{...before.morning.view.enemyBeliefs,...Object.fromEntries(Object.entries(after.morning.view.enemyBeliefs).filter(([,b])=>ids.has(b.source)))},
  worksBeliefs:{...before.morning.view.worksBeliefs,...Object.fromEntries(Object.entries(after.morning.view.worksBeliefs).filter(([,b])=>ids.has(b.source)))}};
 return {...before,date:frames[index]?.day.date??before.date,paperText:after.paperText,approvedPlans:after.approvedPlans,morning:{...before.morning,requestDay:frames[index]?.day.day??before.morning.requestDay,view}};
}
