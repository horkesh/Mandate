import type {ReactNode} from 'react';
import type {ReportView} from '@mandate/kernel/seat-api';
import type {DeskSnapshot} from './adapter.ts';
import {clearFilters,dateOfPaper,filterPapers,paperPlaces,weeklyPapers} from './intray.ts';
import type {TrayFilters,SenderGroup,SummarySection} from './intray.ts';
import {presenter} from './presentation.ts';
import {S} from './strings.ts';
import './intray.css';

export function InTray({data,papers,read,filters,setFilters,openSummary,children}:{
  data:DeskSnapshot;papers:readonly ReportView[];read:ReadonlySet<string>;filters:TrayFilters;
  setFilters:(value:TrayFilters)=>void;openSummary:()=>void;children:(papers:readonly ReportView[])=>ReactNode;
}) {
  const {name}=presenter(data.strings),shown=filterPapers(data,papers,filters,read);
  const places=[...new Set(papers.flatMap(r=>paperPlaces(r,data)))].sort((a,b)=>name(a,'region').localeCompare(name(b,'region')));
  return <section className="intray" aria-label={S.inbox}>
    <button className="weekly-paper paper-link" data-testid="weekly-link" onClick={openSummary}><strong>{S.weeklyTitle}</strong><span>{S.weeklyNote}</span></button>
    <div className="tray-filters">
      <label>{S.traySender}<select aria-label={S.traySender} value={filters.sender} onChange={e=>setFilters({...filters,sender:e.target.value as SenderGroup})}>
        {Object.entries(S.senders).map(([id,label])=><option key={id} value={id}>{label}</option>)}
      </select></label>
      <label>{S.trayPlace}<select aria-label={S.trayPlace} value={filters.place} onChange={e=>setFilters({...filters,place:e.target.value})}>
        <option value="">{S.trayAllPlaces}</option>{places.map(id=><option key={id} value={id}>{name(id,'region')}</option>)}
      </select></label>
      <label className="unread-filter"><input type="checkbox" checked={filters.unread} onChange={e=>setFilters({...filters,unread:e.target.checked})}/>{S.trayUnread}</label>
      <button onClick={()=>setFilters({...clearFilters})}>{S.trayClear}</button>
    </div>
    <p className="tray-count" role="status">{S.trayCount(shown.length,papers.length)}</p>
    {shown.length?children(shown):<p className="empty">{S.trayEmpty}</p>}
  </section>;
}
export function WeeklyPaper({data,openPaper}:{data:DeskSnapshot;openPaper:(paper:ReportView)=>void}) {
  const summary=weeklyPapers(data);
  return <article className="paper stock-letter weekly-summary" data-testid="weekly-summary">
    <header className="paper-header"><h2>{S.weeklyTitle}</h2><p>{dateOfPaper(data,summary.from)} — {dateOfPaper(data,summary.through)}</p></header>
    <p>{S.weeklyNote}</p><p>{S.weeklyCount(summary.coveredPapers)}</p>
    {(Object.keys(S.weeklySections) as SummarySection[]).map(section=>{
      const lines=summary.lines.filter(line=>line.section===section);
      return lines.length>0&&<section key={section}><h3>{S.weeklySections[section]}</h3><ul>{lines.map((line,index)=><li key={`${line.paper.id}:${index}`}>
        <button className="summary-source" onClick={()=>openPaper(line.paper)} data-source-paper={line.paper.id}><span>{line.text}</span><small>{line.source}, <time>{line.date}</time></small></button>
      </li>)}</ul></section>;
    })}
    {!summary.lines.length&&<p>{S.weeklyEmpty}</p>}
  </article>;
}
