import type {DeskSnapshot} from './adapter.ts';
/** Calendar arithmetic from the public morning, with no World or hidden clock. */
export function deskDate(data:DeskSnapshot,day:number):string {
 const date=new Date(`${data.date}T12:00:00Z`);
 date.setUTCDate(date.getUTCDate()+day-data.morning.requestDay);
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
