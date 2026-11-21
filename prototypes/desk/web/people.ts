import type {CommandablePost, CounterKind, ReportView, SeatRequest} from '@mandate/kernel/seat-api';

export interface PostCard {
  post:string; parent:string|null; placed:boolean; holder:string|null;
  status:'held'|'vacant'|'unknown'; commandable:CommandablePost|null;
  reports:readonly ReportView[]; vacantSince:number|null; asOfDay:number;
  source:string|null;
}
export interface CounterDraft {kind:CounterKind; value?:string; boldness?:number; from?:string; men?:number}
/** Both presenters take the seat boundary itself, never the server snapshot or game. */
export function receivedReports(request:SeatRequest):ReportView[] {
  return request.view.reports.filter(r=>r.receivedDay<=request.view.day&&r.day<=request.view.day);
}
export function postReports(request:SeatRequest,post:string,holder:string|null):ReportView[] {
  return receivedReports(request).filter(r=>r.authorPost===post||(r.subjectKind==='post'&&r.subjectId===post)||(holder!==null&&r.subjectKind==='person'&&r.subjectId===holder));
}
export function buildOrgBoard(request:SeatRequest):{nodes:PostCard[]} {
  const menu=request.menu.menuKind==='principal'?request.menu:null;
  return {nodes:request.view.posts.map(p=>({post:p.post,parent:p.parent,placed:p.placementKnown,holder:p.holder,status:p.status,vacantSince:p.vacantSince,asOfDay:p.asOfDay,source:p.source,
    commandable:menu?.commandable.find(c=>c.post===p.post&&c.holder===p.holder)??null,reports:postReports(request,p.post,p.holder)}))};
}
export function audienceRecord(request:SeatRequest,post:string) {
  const holder=request.view.posts.find(p=>p.post===post)?.holder??null;
  const commandable=request.menu.menuKind==='principal'?request.menu.commandable.find(p=>p.post===post&&p.holder===holder)??null:null;
  // An earlier holder's words cannot become the present visitor's case.
  const reports=holder===null?[]:receivedReports(request).filter(r=>r.author===holder&&r.authorPost===post);
  const reasons=reports.flatMap(r=>(r.advice?.reasons??[]).map(reason=>({kind:reason.kind,source:r.id,author:r.author,day:r.day})));
  return {holder,commandable,reports,reasons};
}
const word=(s:string|undefined)=>s!==undefined&&/^[a-zA-Z0-9_.-]+$/.test(s);
export function audienceCommand(post:string,counters:readonly CounterDraft[]):string {
  if(!word(post))throw Error('Invalid post');
  const seen=new Set<CounterKind>();
  const tokens=counters.map(c=>{
    if(seen.has(c.kind))throw Error('Repeated counter');seen.add(c.kind);
    switch(c.kind){
      case 'frame':if(!word(c.value))throw Error('A value is required');return `frame:${c.value}`;
      case 'adjust':if(!Number.isInteger(c.boldness)||c.boldness!<0||c.boldness!>1000)throw Error('Boldness must be 0–1000');return `adjust:${c.boldness}`;
      case 'reinforce':if(!word(c.from)||c.from===post||!Number.isSafeInteger(c.men)||c.men!<=0)throw Error('A source and positive strength are required');return `reinforce:${c.from}:${c.men}`;
      case 'promise_advancement':case 'withdraw_overseer':case 'ease_pressure':case 'vindicate':case 'threaten':return c.kind;
      default:throw Error('Unknown counter');
    }
  });
  return ['audience',post,...tokens].join(' ');
}
