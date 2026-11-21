import type {DeskSnapshot} from './adapter.ts';
export function availableCalls(data:DeskSnapshot){
 const menu=data.morning.menu;
 return menu.menuKind==='principal'?menu.doctrine.calls.filter(c=>c.id&&!c.issued&&c.day<=data.morning.requestDay&&(menu.atWarSince!==null||c.atPeace===true)&&menu.raising.some(p=>p.post===c.post)):[];
}
/** Calendar arithmetic from the public morning, with no World or hidden clock. */
export function deskDate(data:DeskSnapshot,day:number):string {
 const date=new Date(`${data.date}T12:00:00Z`);
 if(!Number.isFinite(date.valueOf()))return String(day);
 date.setUTCDate(date.getUTCDate()+day-data.morning.view.day);
 return date.toISOString().slice(0,10);
}
/** Own slips prove a dispatch, never delivery or compliance. */
export function ownGoalStatus(data:DeskSnapshot,post:string,objective:string):'queued'|'dispatched'|null {
 const matches=(line:string)=>{
  const words=line.trim().split(/\s+/);
  return words[0]==='order'&&words[1]===post&&words[2]==='take'&&words[3]===objective;
 };
 if(data.queue.some(q=>matches(q.line)))return 'queued';
 for(const turn of [...data.history].reverse()){
  for(const [index,q] of [...(turn.submitted??[])].entries()){
   if(!matches(q.line))continue;
   if(!turn.days.some(d=>d.refused.some(r=>r.commandIndex===index)))return 'dispatched';
  }
 }
 return null;
}
