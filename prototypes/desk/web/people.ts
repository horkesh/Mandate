import type {CommandablePost, CounterKind, ReportView, SeatRequest} from '@mandate/kernel/seat-api';

export interface PostCard {
  post:string; parent:string|null; placed:boolean; holder:string|null;
  status:'held'|'vacant'|'unknown'; commandable:CommandablePost|null;
  reports:readonly ReportView[]; vacantSince:number|null;
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
  const nodes=new Map<string,PostCard>();
  const ensure=(post:string)=>{
    let node=nodes.get(post);
    if(!node){node={post,parent:null,placed:false,holder:null,status:'unknown',commandable:null,reports:[],vacantSince:null};nodes.set(post,node);}
    return node;
  };
  if(request.view.post){const own=ensure(request.view.post);Object.assign(own,{holder:request.view.person,status:'held',placed:true});}
  if(request.menu.menuKind==='principal'){
    for(const command of request.menu.commandable){
      // Relays are the exposed command chain, excluding the principal and target.
      const chain=[...(request.view.post?[request.view.post]:[]),...command.relays,command.post];
      for(let i=0;i<chain.length;i++){
        const node=ensure(chain[i]!);node.parent=i>0?chain[i-1]!:null;node.placed=true;
      }
      Object.assign(ensure(command.post),{holder:command.holder,status:'held',commandable:command});
    }
    for(const raising of request.menu.raising)Object.assign(ensure(raising.post),{holder:raising.holder,status:'held'});
    for(const vacancy of request.menu.vacancies)Object.assign(ensure(vacancy.post),{holder:null,status:'vacant',commandable:null});
  }
  for(const node of nodes.values()){
    node.reports=postReports(request,node.post,node.holder);
    // This is the date of a received loss report, not a guessed appointment date.
    if(node.status==='vacant')node.vacantSince=[...node.reports].reverse().find(r=>r.claims.some(c=>c.kind==='commander-lost'))?.day??null;
  }
  return {nodes:[...nodes.values()].sort((a,b)=>a.post<b.post?-1:a.post>b.post?1:0)};
}
export function audienceRecord(request:SeatRequest,post:string) {
  const commandable=request.menu.menuKind==='principal'?request.menu.commandable.find(p=>p.post===post)??null:null;
  const holder=commandable?.holder??null;
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
