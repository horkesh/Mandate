import type {PrincipalMenu,SeatRequest} from '@mandate/kernel/seat-api';
import type {DeskSnapshot} from './adapter.ts';
import {S} from './strings.ts';
import {presenter} from './presentation.ts';
import type {ReportView} from '@mandate/kernel/seat-api';

export interface Price {min:number;max:number}
export function outOfAttention(left:number|null,price:Price|null){return left!==null&&price!==null&&price.min>left;}
/** Display only prices explicitly supplied by the principal menu. */
export function commandPrice(line:string,menu:PrincipalMenu):Price|null {
 const words=line.trim().split(/\s+/),verb=words[0]??'';
 if(!verb)return null;
 const key=({approve:'review_approve',sendback:'review_send_back',edit:'review_edit',call:'order'} as Record<string,string>)[verb]??verb;
 const extra=words.includes('by=special-messenger')?menu.attention.specialMessenger:0;
 if(verb==='decide'){
  if(words.length===2)return {min:0,max:0};
  const prices=[menu.attention.costs.decide_staff,menu.attention.costs.decide_overrule];
  if(prices.some(p=>p===undefined))return null;
  return {min:Math.min(...prices as number[]),max:Math.max(...prices as number[])};
 }
 const price=menu.attention.costs[key];
 return price===undefined?null:{min:price+extra,max:price+extra};
}
export function priceLabel(price:Price|null):string {
 return price===null?S.priceMissing:price.max===0?S.free:price.min===price.max?S.priceAmount(price.min):S.priceRange(price.min,price.max);
}
export function received(request:SeatRequest){return request.view.reports.filter(r=>r.day<=request.view.day&&r.receivedDay<=request.view.day);}
export function ledgerRows(data:DeskSnapshot){
 // Only the shell's own acts and received situation statuses. No Congress inference.
 return data.history.flatMap((turn,index)=>(turn.submitted??[]).map((order,occurrence)=>({
  id:`${index}:${occurrence}`,line:order.line,text:order.text,date:turn.days[0]?.date??S.unknown,
  refusal:turn.days[0]?.refused.find(r=>r.commandIndex===occurrence)?.reason??null,
  turn:index+1,
 })));
}

/** Resolve only the received decision whose identifier is on the principal's own slip. */
export function slipText(request:SeatRequest,strings:Readonly<Record<string,string>>,line:string,fallback:string):string {
 const words=line.trim().split(/\s+/),verb=words[0],{text}=presenter(strings);
 if(!['decide','delegate','consult'].includes(verb??''))return fallback;
 const situation=request.view.situations.find(s=>s.id===words[1]);
 if(!situation)return fallback;
 const title=strings[situation.title]??S.unknown;
 if(verb==='decide'){
  const labels=words.slice(2).map(id=>situation.options.find(o=>o.id===id)).map(o=>o?strings[o.label]??S.unknown:S.unknown);
  return `${title}: ${labels.length?labels.join('; '):S.takeCourse}`;
 }
 const {name}=presenter(strings);
 return verb==='delegate'?`${S.referDecision}: ${title} — ${name(words[2]??'','post')}`:`${S.consult}: ${title} — ${words.slice(2).map(p=>name(p,'post')).join(', ')}`;
}

export function refusalText(reason:string,strings:Readonly<Record<string,string>>):string {
 return strings[`console.refusal.${reason}`]??strings['console.refusal.unavailable']??S.refusalUnavailable;
}

export function subjectName(request:SeatRequest,strings:Readonly<Record<string,string>>,id:string,kind?:string|number):string {
 const known=kind==='situation'?request.view.situations.find(s=>s.id===id):undefined;
 return known?strings[known.title]??S.unknown:presenter(strings).name(id,kind);
}

/** The held archive, bounded by receipt and writing dates even during playback. */
export function recordPapers(data:DeskSnapshot):ReportView[]{
 const reports=[...data.history.flatMap(t=>t.days.flatMap(d=>d.reports)),...data.morning.view.reports];
 return [...new Map(reports.filter(r=>r.day<=data.morning.view.day&&r.receivedDay<=data.morning.view.day).map(r=>[r.id,r])).values()]
  .sort((a,b)=>a.receivedDay-b.receivedDay||a.day-b.day||(a.id<b.id?-1:a.id>b.id?1:0));
}
export interface OperationRecord {
 post:string; reports:ReportView[]; orders:ReturnType<typeof ledgerRows>;
 plans:NonNullable<DeskSnapshot['approvedPlans']>[number][];
}
/** Own orders select the command; only received claims describe its progress. */
export function operationRecords(data:DeskSnapshot):OperationRecord[]{
 const orders=ledgerRows(data).filter(o=>/^(order|approve|edit|sendback|go|call|transfer|inquire|audience|appoint|relieve) /.test(o.line)),posts=new Set(orders.map(o=>o.line.trim().split(/\s+/)[1]!));
 const menu=data.morning.menu;
 if(menu.menuKind==='principal')for(const p of [...menu.reviews.map(r=>r.post),...menu.awaiting])posts.add(p);
 const reports=recordPapers(data);
 for(const r of reports)if(r.subjectKind==='post'&&r.claims.some(c=>c.kind==='plan-submitted'))posts.add(r.subjectId);
 return [...posts].sort().map(post=>({post,orders:orders.filter(o=>o.line.trim().split(/\s+/)[1]===post),
  reports:reports.filter(r=>((r.subjectKind==='post'&&r.subjectId===post)||(r.subjectKind!=='post'&&r.authorPost===post))&&r.claims.some(c=>['position','goal-status','operation','arrived','order-obeyed','order-objected','plan-submitted','plan-answer','verb-answered','call-answer','support-answer','battle-phase','battle-result','own-losses','casualties','missing','captured'].includes(c.kind))),
  plans:(data.approvedPlans??[]).filter(p=>p.post===post),
 }));
}
