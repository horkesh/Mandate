/** Derived desk records. Public legislature, own attention and correspondence only. No private audience preview. */
import {strictCompare} from '../compare.ts';
import type {PersonId, SeatId} from '../ids.ts';
import type {State} from '../root-state.ts';
import type {SeatsWorld} from '../seats/world.ts';
import type {AttentionBudgetView, AudienceView, CongressView, ReportView, SituationView} from './types.ts';
import {daysFromCivil,parseIsoDate} from '../world/calendar.ts';

export function attentionBudget(world:SeatsWorld,state:State,seat:SeatId):AttentionBudgetView|null {
 const own=state.seatAttention[seat];
 if(own===undefined)return null;
 const rules=world.rules.people.attention;
 return Object.freeze({allowance:rules.cap,spent:rules.cap-own.attnLeft,left:own.attnLeft,refilledDay:own.attnRefilledDay,nextRefillDay:own.attnRefilledDay+rules.refillDays});
}
export function congressProjection(world:SeatsWorld,state:State,person:PersonId,reports:readonly ReportView[],situations:readonly SituationView[]):CongressView {
 const faction=world.start.factions.find(f=>f.principal===person)?.faction;
 if(faction===undefined)return EMPTY_CONGRESS;
 const rules=world.map.world.rules.politics;
 const today=state.calendarStart===null?null:daysFromCivil(parseIsoDate(state.calendarStart))+state.stateDay;
 const chambers=rules.chambers.filter(c=>c.faction===faction).map(c=>{
  // A chamber's published sitting and call are public facts (0040), not a hidden political assessment.
  const current=state.chamberStates[c.id];
  const published=today===null?undefined:[...(c.composition??[])].filter(t=>daysFromCivil(parseIsoDate(t.on))<=today).sort((a,b)=>strictCompare(a.on,b.on)).at(-1);
  const composition=published===undefined?null:Object.freeze({on:published.on,groups:Object.freeze(published.groups.map(g=>Object.freeze({...g}))),cite:published.cite});
  return Object.freeze({id:c.id,name:c.name,status:current?.chamState??'adjourned',session:current?.chamSession??null,opens:current?.chamOpens??null,closes:current?.chamCloses??null,composition});
 });
 const ids=new Set(chambers.map(c=>c.id));
 const sessions=rules.sessions.filter(s=>s.chambers.some(c=>ids.has(c))).map(s=>Object.freeze({id:s.id,chambers:Object.freeze(s.chambers.filter(c=>ids.has(c))),callable:s.callable,opens:s.opens,closes:s.closes,afterCallDays:s.afterCallDays,sitsDays:s.sitsDays}));
 const received=reports.filter(r=>r.day<=state.stateDay&&r.receivedDay<=state.stateDay);
 // A known, taken option is an act; the effects of an unchosen option are never evidence.
 const events=world.situations.flatMap(def=>{
  const record=state.situationStates[def.id];
  const own=def.faction===faction&&situations.some(s=>s.id===def.id)&&record?.sitDecidedBy==='principal'&&record.sitDecidedDay!==null&&record.sitDecidedDay<=state.stateDay;
  const source=def.kind==='notice'?received.find(r=>r.subjectKind==='situation'&&r.subjectId===def.id&&r.type===def.report?.reportType&&r.subtype===def.report.subtype):undefined;
  if(!own&&source===undefined)return [];
  const selected=own?def.options.filter(o=>record.sitChosen.includes(o.id)):[];
  const effects=source?def.effects: selected.length?selected.flatMap(o=>[...o.effects,...o.lockedCosts]):def.inaction?.effects??[];
  return effects.flatMap(e=>'propose' in e&&e.propose.owner==='politics'?[{p:e.propose,day:source?.day??record!.sitDecidedDay!,situation:def.id,option:source?null:selected.find(o=>o.effects.includes(e)||o.lockedCosts.includes(e))?.id??null,source:source?.id??null}]:[]);
 }).sort((a,b)=>a.day-b.day||strictCompare(a.situation,b.situation));
 const origin=state.calendarStart===null?null:daysFromCivil(parseIsoDate(state.calendarStart));
 const dayOf=(date:string)=>origin===null?null:daysFromCivil(parseIsoDate(date))-origin;
 const intervals=sessions.flatMap(s=>!s.callable&&s.opens!==null&&s.closes!==null&&origin!==null?[{opens:dayOf(s.opens)!,closes:dayOf(s.closes)!}]:[]);
 // An actual public call is a public record; regular dates alone never imply that a special session was called.
 for(const c of chambers)if(c.opens!==null&&c.closes!==null&&c.session!==null&&sessions.some(s=>s.id===c.session&&s.callable))intervals.push({opens:c.opens,closes:c.closes});
 const ledger:CongressView['ledger'][number][]=[];
 for(const event of events){
  const p=event.p;
  if(p.side!==faction)continue;
  if(p.field==='ledger-act'&&p.subject!==null&&!ledger.some(e=>e.act===p.subject&&e.answeredDay===null)){
   const met=intervals.filter(i=>i.closes>=event.day&&i.opens<=state.stateDay).map(i=>Math.max(event.day,i.opens));
   ledger.push({act:p.subject,day:event.day,situation:event.situation,option:event.option,metDay:met.length?Math.min(...met):null,answeredDay:null,source:event.source});
  }else if(p.field==='ledger-answer'){
   for(let i=0;i<ledger.length;i++){const e=ledger[i]!;if((p.subject===null||p.subject===e.act)&&e.metDay!==null&&e.metDay<=event.day&&e.answeredDay===null)ledger[i]={...e,answeredDay:event.day};}
  }
 }
 ledger.sort((a,b)=>a.day-b.day||strictCompare(a.act,b.act));
 return Object.freeze({chambers:Object.freeze(chambers),sessions:Object.freeze(sessions),ledger:Object.freeze(ledger.map(e=>Object.freeze(e)))});
}
const EMPTY_CONGRESS:CongressView=Object.freeze({chambers:Object.freeze([]),sessions:Object.freeze([]),ledger:Object.freeze([])});
export function audienceProjection(state:State,person:PersonId,reports:readonly ReportView[]):readonly AudienceView[] {
 const out:AudienceView[]=[];
 for(const m of state.messagesInTransit){
  const v=m.msgVerb;
  if(v?.verbKind!=='audience'||v.verbIssuer!==person||m.msgFrom!==person||v.verbIssuedDay>state.stateDay)continue;
  out.push(Object.freeze({id:m.msgOrigin,status:'granted',person:m.msgTo,post:v.verbPost,day:v.verbIssuedDay,source:null,answers:null,declared:null,
   counters:Object.freeze((v.verbCounters??[]).map(([kind,value,boldness,from,men])=>Object.freeze({kind,value,boldness,from,men})))}));
 }
 for(const r of reports){
  if(r.day>state.stateDay||r.receivedDay>state.stateDay)continue;
  const asked=r.claims.some(c=>c.kind==='audience-request'&&c.value===1);
  const answer=r.claims.find(c=>c.kind==='verb-answered'&&c.token?.startsWith('audience:'));
  if(!asked&&answer===undefined)continue;
  out.push(Object.freeze({id:r.id,status:asked?'requested':answer!.value===1?'filed':'declined',person:r.author,post:r.authorPost,day:r.day,source:r.id,answers:r.answers,counters:Object.freeze([]),declared:answer?.token?.slice('audience:'.length)??null}));
 }
 return Object.freeze(out.sort((a,b)=>a.day-b.day||strictCompare(a.id,b.id)));
}
