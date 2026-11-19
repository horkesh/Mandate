/** Pure presentation of this seat's received papers. No history, truth or storage. */
import type {ReportView} from '@mandate/kernel/seat-api';
import type {DeskSnapshot} from './adapter.ts';
import {presenter} from './presentation.ts';
import {S} from './strings.ts';

export type SenderGroup = 'all'|'commanders'|'departments'|'press'|'cabinet'|'others';
export interface TrayFilters {sender:SenderGroup;place:string;unread:boolean}
export const clearFilters:TrayFilters = {sender:'all',place:'',unread:false};
export function dateOfPaper(data:DeskSnapshot,day:number):string {
  const date = new Date(data.date+'T12:00:00Z');
  if(!Number.isFinite(date.valueOf()))return `${S.day} ${day}`;
  date.setUTCDate(date.getUTCDate()+day-data.morning.requestDay);
  return date.toISOString().slice(0,10);
}
/** Filing categories of the supplied post title, not inferred offices. */
export function senderGroup(report:ReportView,data:DeskSnapshot):SenderGroup {
  if(report.type==='press')return 'press';
  const title=report.authorPost?presenter(data.strings).name(report.authorPost,'post'):'';
  if(/\b(secretary|president|attorney general|postmaster general|cabinet)\b/i.test(title))return 'cabinet';
  if(/\bdepartment\b/i.test(title))return 'departments';
  if(data.morning.menu.menuKind==='principal'&&data.morning.menu.commandable.some(p=>p.post===report.authorPost))return 'commanders';
  return 'others';
}
export function paperPlaces(report:ReportView,data:DeskSnapshot):string[] {
  const places=new Set<string>(report.claims.flatMap(c=>c.region?[c.region]:[]));
  if(report.subjectKind==='region')places.add(report.subjectId);
  const tokens=new Set((data.paperText[report.id]??'').match(/\b[a-z0-9]+(?:_[a-z0-9]+)*\b/g)??[]);
  for(const key of Object.keys(data.strings)){
    const match=/^region\.(.+)\.name$/.exec(key);
    if(match&&tokens.has(match[1]!))places.add(match[1]!);
  }
  return [...places].sort();
}
export function filterPapers(data:DeskSnapshot,papers:readonly ReportView[],filters:TrayFilters,read:ReadonlySet<string>) {
  return papers.filter(r=>(filters.sender==='all'||senderGroup(r,data)===filters.sender)
    &&(!filters.place||paperPlaces(r,data).includes(filters.place))&&(!filters.unread||!read.has(r.id)));
}
export type SummarySection = keyof typeof S.weeklySections;
export interface SummaryLine {paper:ReportView;text:string;source:string;date:string;section:SummarySection}
export function weeklyPapers(data:DeskSnapshot) {
  const through=data.morning.view.day,from=Math.max(0,through-6),{name,text}=presenter(data.strings);
  const reports=data.morning.view.reports.filter(r=>r.day<=through&&r.receivedDay<=through);
  const lines:SummaryLine[]=[];
  const add=(section:SummarySection,paper:ReportView,words:string)=>lines.push({section,paper,text:words,
    source:`${name(paper.author,'person')}, ${name(paper.authorPost??paper.author,paper.authorPost?'post':'person')}`,date:dateOfPaper(data,paper.day)});
  const holdings=new Map<string,string>();
  for(const r of [...reports].sort((a,b)=>a.day-b.day||(a.hour??0)-(b.hour??0)||a.receivedDay-b.receivedDay||a.id.localeCompare(b.id))){
    for(const c of r.reportedControl??[]){
      const current=JSON.stringify([c.holder,c.contested]),previous=holdings.get(c.region);
      if(!r.openingControl&&r.receivedDay>=from&&previous!==undefined&&previous!==current&&(c.contested||c.holder))
        add('control',r,c.contested?S.weeklyContested(name(c.region,'region')):S.weeklyHeld(name(c.region,'region'),name(c.holder!,'faction')));
      holdings.set(c.region,current);
    }
    if(r.receivedDay<from)continue;
    if(r.claims.some(c=>c.kind==='battle-result'||c.kind==='battle-phase')){
      const places=[...new Set(r.claims.filter(c=>c.kind==='battle-result'||c.kind==='battle-phase').flatMap(c=>c.region?[name(c.region,'region')]:[]))];
      add('battles',r,text(data.paperText[r.id]??'').split('; ')[0]||(places.length?S.weeklyBattle(places.join(', ')):S.claims['battle-result']!));
    }
    if(r.type==='press'){
      // ReportView has no press story body. The console envelope ("about
      // person ...") cannot supply one. R43's main-stories requirement is
      // blocked here; retain only an attributed link to the received paper.
      add('press',r,S.genres.press!);
    }
  }
  if(data.morning.menu.menuKind==='principal')for(const review of data.morning.menu.reviews){
    const paper=reports.find(r=>r.id===review.report);
    if(paper)add('plans',paper,S.weeklyPlan(name(review.post,'post')));
  }
  return {lines,from,through,coveredPapers:new Set(lines.map(l=>l.paper.id)).size};
}
