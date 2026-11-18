/** A separate, read-only plate route. Mocks never enter a SeatRequest or command. */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DeskSnapshot } from '../adapter.ts';
import { deskApi } from '../adapter.ts';
import { presenter } from '../presentation.ts';
import { StaffMap } from './StaffMap.tsx';
import type { StudyMarks } from './renderer.ts';
import { reportDate } from './model.ts';
import { STUDY } from './study-strings.ts';
import './study.css';
import {studyWashes} from './study-data.ts';

const illustration:StudyMarks={
  washes:studyWashes,
  enemySide:[-77.1,38.2],
  front:[[-78.02,39.15],[-77.72,39.08],[-77.39,38.93],[-77.12,38.75],[-76.96,38.51]],
  draft:[[-77.02,38.86],[-77.42,38.68],[-77.67,38.2],[-77.57,37.75]],
  revision:[[-77.49,38.44],[-77.67,38.33],[-77.85,38.37],[-77.76,38.39]],
  estimate:{point:[-77.43,38.84],text:STUDY.estimate},
  draftLabel:{point:[-78.7,37.65],text:STUDY.draft},
};
export function MapStudy(){
  const query=new URLSearchParams(window.location.search),table=query.get('layout')==='table';
  const [snapshot,setSnapshot]=useState<DeskSnapshot|null>(null),[error,setError]=useState('');
  const [framing,setFraming]=useState<'eastern'|'manassas'|'hero'|'theatre'>(query.get('detail')==='theatre'?'theatre':query.get('detail')==='hero'?'hero':query.get('detail')==='manassas'?'manassas':'eastern');
  const main=useRef<HTMLElement>(null);
  const [flag,setFlag]=useState<[number,number]|null>(null);
  useEffect(()=>{deskApi.snapshot().then(setSnapshot).catch(e=>setError(String(e)));},[]);
  useEffect(()=>{
    if(!table||!main.current||!snapshot)return;
    const update=()=>{
      const node=main.current?.querySelector('.map-mark[data-region="fort_monroe"]');if(!node)return;
      const b=node.getBoundingClientRect(),next:[number,number]=[b.x+b.width/2,b.y+b.height/2];
      setFlag(old=>old&&Math.abs(old[0]-next[0])<1&&Math.abs(old[1]-next[1])<1?old:next);
    };
    const observer=new MutationObserver(update);observer.observe(main.current,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});update();return()=>observer.disconnect();
  },[table,snapshot]);
  const study=useMemo(()=>snapshot?{
    ...illustration,
    estimate:{...illustration.estimate,text:`Enemy near Centreville?\n${presenter(snapshot.strings).name('stone_charles_p','person')}, ${snapshot.date} (illustrative)`},
    draftLabel:{...illustration.draftLabel,text:`Proposed advance\n${presenter(snapshot.strings).name('scott_winfield','person')}, ${snapshot.date} (illustrative)`},
  }:undefined,[snapshot]);
  if(!snapshot)return <p role="status">{error||'Loading the map…'}</p>;
  const {name}=presenter(snapshot.strings);
  const report=[...snapshot.morning.view.reports].sort((a,b)=>b.day-a.day).find(r=>r.claims.some(c=>c.region==='fort_monroe'&&c.kind==='position')&&!r.claims.some(c=>c.kind==='verb-answered'))??snapshot.morning.view.reports[0];
  const post=report?snapshot.morning.menu.menuKind==='principal'?snapshot.morning.menu.commandable.find(p=>p.post===report.subjectId):undefined:undefined;
  return <main ref={main} className={`map-study ${table?'map-table':''}`} data-testid="map-study" data-framing={framing}>
    <StaffMap request={snapshot.morning} pack={snapshot.pack} date={snapshot.date} strings={snapshot.strings} study={study} framing={framing}/>
    <header className="study-cartouche"><h1>{framing==='theatre'?STUDY.theatreTitle:STUDY.title}</h1><p>{STUDY.compiled}</p><time>{snapshot.date}</time></header>
    <div className="study-caption"><p>{STUDY.illustrative}</p><p>{STUDY.keyboard}</p></div>
    <nav className="study-navigation" aria-label="Map study views"><button onClick={()=>setFraming(f=>f==='eastern'?'manassas':'eastern')}>{framing==='eastern'?STUDY.junction:STUDY.eastern}</button><a href="/">{STUDY.desk}</a></nav>
    {table&&<>
      <div className="table-light" aria-hidden="true"/>
      <aside className="table-tray"><img src="/art/app/chrome/tray-in.png" alt=""/><span>{STUDY.tray}</span><div className="tray-paper"><p>{snapshot.date}</p><p>{name(report?.author??'','person')}</p></div></aside>
      {report&&<article className="table-report"><span className="report-pin" aria-hidden="true"/><h2>{STUDY.report}</h2><p className="report-byline">{name(report.author,'person')}<br/>{reportDate(snapshot.morning.requestDay,snapshot.date,report.day)}</p><div className="report-rule"/><p>{presenter(snapshot.strings).text(snapshot.paperText[report.id]??'')}</p><p className="hand">{name(report.author,'person')}</p><p className="report-location">{name('fort_monroe','region')}</p></article>}
      {flag&&<svg className="table-report-leader" aria-hidden="true"><path d={`M ${window.innerWidth*.22} ${window.innerHeight*.72} Q ${window.innerWidth*.48} ${window.innerHeight*.94} ${flag[0]} ${flag[1]}`}/><circle cx={flag[0]} cy={flag[1]} r="25"/></svg>}
      <aside className="table-commander" style={flag?{left:Math.min(window.innerWidth-365,flag[0]+65),top:Math.max(180,Math.min(window.innerHeight-330,flag[1]-95)),right:'auto',bottom:'auto'}:undefined}><h2>{name(post?.holder??report?.author??'','person')}</h2><p>{name(post?.post??'','post')}</p><p>{report&&reportDate(snapshot.morning.requestDay,snapshot.date,report.day)}</p><a href="/?study=1&look=A">{STUDY.report}</a></aside>
      <span className="table-mock-label">{STUDY.mockTitle}</span>
    </>}
  </main>;
}
