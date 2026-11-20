import {useState} from 'react';
import type {PrincipalMenu,ReportView} from '@mandate/kernel/seat-api';
import type {DeskSnapshot,DeskTurn} from './adapter.ts';
import {commandPrice,ledgerRows,priceLabel,received} from './business.ts';
import type {Price} from './business.ts';
import {presenter} from './presentation.ts';
import {stopEntries} from './table.ts';
import {S} from './strings.ts';
import './business.css';

export function AttentionTokens({left,price=null}:{left:number|null;price?:Price|null}){
 return <span className="attention-budget" data-testid="attention-budget">
  <span className="attention-coins" aria-hidden="true">{Array.from({length:Math.min(24,Math.max(0,left??0))},(_,i)=><i className={i<(price?.max??0)?'proposed':''} key={i}/>)}</span>
  <span>{left===null?S.attentionNoBudget:S.attentionAvailable(left)}</span>
  {price&&<span className="attention-price" role="status">{priceLabel(price)}</span>}
 </span>;
}
export function AttentionSheet({data,dateOf=(day)=>`${S.day} ${day}`}:{data:DeskSnapshot;dateOf?:(day:number)=>string}){
 const menu=data.morning.menu;
 const [hover,setHover]=useState<Price|null>(null);
 if(menu.menuKind!=='principal')return <p>{S.priceMissing}</p>;
 const prices=data.queue.map(q=>commandPrice(q.line,menu));
 const sum=prices.every(p=>p!==null)?{min:prices.reduce((s,p)=>s+p!.min,0),max:prices.reduce((s,p)=>s+p!.max,0)}:null;
 return <section className="attention-sheet">
  <AttentionTokens left={menu.attention.left} price={hover}/>
  {data.morning.view.attentionBudget?<div className="attention-refill" data-testid="attention-refill"><p>{S.attentionSpent(data.morning.view.attentionBudget.spent)}</p><p>{S.attentionAllowance(data.morning.view.attentionBudget.allowance)}</p><p>{S.attentionRefill(dateOf(data.morning.view.attentionBudget.nextRefillDay))}</p><small>{S.attentionNoCarry}</small></div>:<p className="hand">{data.morning.view.attentionBudget===null?S.attentionNoBudget:S.attentionRefillMissing}</p>}
  <section className="queued-price"><h3>{S.attentionQueue}</h3><strong>{priceLabel(sum)}</strong><p>{S.attentionQueueNote}</p>
   <ul>{data.queue.map((q,i)=><li key={i}>{presenter(data.strings).text(q.text)} <span>{priceLabel(prices[i]??null)}</span></li>)}</ul>
  </section>
  <h3>{S.attentionPrices}</h3><p>{S.attentionEstimate}</p>
  <dl className="price-table">{Object.entries(menu.attention.costs).map(([key,cost])=><div key={key}>
   <dt><button onFocus={()=>setHover({min:cost,max:cost})} onBlur={()=>setHover(null)} onMouseEnter={()=>setHover({min:cost,max:cost})} onMouseLeave={()=>setHover(null)}>{S.actionLabels[key]??S.priceMissing}</button></dt>
   <dd>{priceLabel({min:cost,max:cost})}</dd>
  </div>)}</dl>
 </section>;
}
export function PriceNote({line,menu}:{line:string;menu:PrincipalMenu}){
 const price=commandPrice(line,menu),insufficient=menu.attention.left!==null&&price!==null&&price.min>menu.attention.left;
 return <p className={`action-price ${insufficient?'insufficient':''}`} data-testid="action-price">{priceLabel(price)}{insufficient&&<span>{S.attentionAfterRefill}</span>}</p>;
}
export function StopSlip({turn,strings,openPaper,onDocket,onPlans,onClose,onHistory}:{turn:DeskTurn;strings:DeskSnapshot['strings'];openPaper:(r:ReportView)=>void;onDocket:()=>void;onPlans:()=>void;onClose?:()=>void;onHistory:()=>void}){
 const {name}=presenter(strings);
 return <section className="business-stop" data-testid="stop-slip" aria-label={S.stopped}>
  <header><h3>{S.stopped}</h3><time>{turn.days.at(-1)?.date??S.stopNoDay}</time></header>
  <ul>{stopEntries(turn).map(({reason,papers})=><li key={reason}>
   <p>{S.stopLabels[reason]??S.stopUnknown}</p>
   {papers.length?<ul>{papers.map(r=><li key={r.id}><button onClick={()=>openPaper(r)}>{S.stopPaper}: {name(r.author,'person')} — {S.genres[r.type]??S.paper}</button></li>)}</ul>:<small>{S.stopNoPaper}</small>}
  </li>)}</ul>
  <div className="actions">{turn.stopped!=='week'&&turn.stopped.some(p=>p.startsWith('situation-'))&&<button onClick={onDocket}>{S.stopDocket}</button>}
   {turn.stopped!=='week'&&turn.stopped.includes('plan-review')&&<button onClick={onPlans}>{S.stopPlans}</button>}
   <button onClick={onHistory}>{S.stopHistory}</button>{onClose&&<button onClick={onClose}>{S.stopReturn}</button>}
  </div>
 </section>;
}
export function TurnSheet({data,busy,run,openPaper,onDocket,onPlans,onHistory,setStops}:{data:DeskSnapshot;busy:boolean;run:(days:number)=>void;openPaper:(r:ReportView)=>void;onDocket:()=>void;onPlans:()=>void;onHistory:()=>void;setStops?:(points:readonly string[])=>Promise<unknown>}){
 const lastTurn=data.history.at(-1),{text}=presenter(data.strings),menu=data.morning.menu;
  const maxDays=data.morning.turnStops?.maxDays??7;
  const [days,setDays]=useState(maxDays);
 return <><p className="margin-note">{S.runNote}</p>
  {lastTurn&&<StopSlip turn={lastTurn} strings={data.strings} openPaper={openPaper} onDocket={onDocket} onPlans={onPlans} onHistory={onHistory}/>}
  <h3>{data.queue.length} {S.signedCount}</h3>
  {data.queue.map((q,i)=><section key={i}><p>{text(q.text)}</p>{menu.menuKind==='principal'&&<PriceNote line={q.line} menu={menu}/>}</section>)}
  <label>{S.turnDays}<select disabled={busy} value={days} onChange={e=>setDays(Number(e.target.value))}>{Array.from({length:maxDays},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}</select></label><p>{S.turnDaysNote}</p>
  <button data-hotkey="run" data-attention-key="free" className="primary" disabled={busy} onClick={()=>run(days)}>{S.sendRun}</button>
  <section className="stop-policy"><h3>{S.stopPolicy}</h3>{data.morning.turnStops?<><p>{S.stopLimit(data.morning.turnStops.maxDays)}</p><p>{S.stopSettingsNote}</p><fieldset disabled={busy||!setStops}><legend>{S.stopPolicy}</legend>{data.morning.turnStops.points.map(({point,enabled})=><label key={point}><input type="checkbox" checked={enabled} onChange={e=>{const next=data.morning.turnStops!.points.filter(p=>p.point===point?e.target.checked:p.enabled).map(p=>p.point);void setStops?.(next);}}/>{S.stopChoice(S.stopLabels[point]??S.stopUnknown)}</label>)}<button type="button" onClick={()=>void setStops?.(data.morning.turnStops!.points.map(p=>p.point))}>{S.stopAll}</button></fieldset></>:<><p>{S.stopPolicyNote}</p><p className="hand">{S.stopSettingsMissing}</p></>}</section>
 </>;
}
const returnTypes=['strength-return','effective-strength','casualty-return','enemy-estimate'];
const figureKinds=new Set(['present-for-duty','present-and-absent','effective-strength','enemy-strength','own-losses','casualties','missing','captured']);
export function AccountabilityLedger({data,openPaper,dateOf,tab,setTab}:{data:DeskSnapshot;openPaper:(r:ReportView)=>void;dateOf:(day:number)=>string;tab:string;setTab:(tab:string)=>void}){
 const {name,text}=presenter(data.strings);
 const rows=ledgerRows(data),papers=received(data.morning);
 const decisions=data.morning.view.situations.filter(s=>!['open','waiting'].includes(s.status)||s.delegatedTo!==null);
 return <section className="accountability-ledger" data-testid="accountability-ledger">
  <nav className="ledger-tabs" aria-label={S.ledgerTitle}>
   {[["acts",S.ledgerTitle],["returns",S.ledgerReturns],["congress",S.ledgerCongress]].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id!)}>{label}</button>)}
  </nav>
  {tab==='acts'?<div className="ledger-spread">
   <section className="ledger-leaf"><h3>{S.ledgerOrders}</h3><p className="hand">{S.ledgerOwnNote}</p>
    {!rows.length&&<p>{S.ledgerNoOrders}</p>}{data.history.some(t=>!t.submitted)&&<p>{S.ledgerBefore}</p>}
    <ol className="act-entries">{rows.map(row=><li key={row.id}><time>{row.date}</time><p>{text(row.text)}</p><span className={row.refusal?'refusal':'record-status'}>{row.refusal?`${S.refused}: ${text(row.refusal)}`:S.ledgerSent}</span></li>)}</ol>
   </section>
   <section className="ledger-leaf"><h3>{S.ledgerSituations}</h3>
    {!decisions.length&&<p>{S.ledgerNoDecisions}</p>}{decisions.map(s=><article className="decision-entry" key={s.id}>
     <h4>{name(s.title)}</h4><p>{S.ledgerStatuses[s.status]}{s.delegatedTo?`, ${S.ledgerReferred} ${name(s.delegatedTo,'person')}`:''}</p>
     <small>{S.ledgerFirstSeen}: {dateOf(s.surfacedDay)}</small>
     {s.chosen.length>0&&<p>{S.ledgerChosen}: {s.chosen.map(id=>name(s.options.find(o=>o.id===id)?.label??id)).join('; ')}</p>}
     {papers.filter(r=>r.subjectKind==='situation'&&r.subjectId===s.id).map(r=><button data-source-paper={r.id} key={r.id} onClick={()=>openPaper(r)}>{S.boardOpenPaper}: {name(r.author,'person')}</button>)}
    </article>)}
    <button onClick={()=>setTab('congress')}>{S.ledgerCongress}</button>
   </section>
  </div>:tab==='congress'?<CongressLeaf data={data} dateOf={dateOf} openPaper={openPaper}/>:<section className="ledger-returns"><h3>{S.ledgerReturns}</h3>
   {!papers.some(r=>returnTypes.includes(r.type))&&<p>{S.ledgerNoReturns}</p>}
   {papers.filter(r=>returnTypes.includes(r.type)).map(r=><article key={r.id} className="return-entry"><header><h4>{S.genres[r.type]}</h4><p>{name(r.author,'person')}, {dateOf(r.day)}<br/>{name(r.subjectId,r.subjectKind)}</p></header>
    {r.claims.some(c=>figureKinds.has(c.kind))?<table><thead><tr><th>{S.ledgerMeasure}</th><th>{S.ledgerFigure}</th></tr></thead><tbody>{r.claims.filter(c=>figureKinds.has(c.kind)).map((c,i)=><tr key={i}><th scope="row">{S.claims[c.kind]??text(c.kind.replaceAll('-',' '))}{c.token?`, ${text(c.token)}`:''}</th><td>{c.value}</td></tr>)}</tbody></table>:<p>{S.ledgerNoFigures}</p>}
    <button data-source-paper={r.id} onClick={()=>openPaper(r)}>{S.ledgerTerms}</button>
   </article>)}
  </section>}
 </section>;
}
function CongressLeaf({data,dateOf,openPaper}:{data:DeskSnapshot;dateOf:(day:number)=>string;openPaper:(r:ReportView)=>void}){
 const congress=data.morning.view.congress,{name,text}=presenter(data.strings);
 if(!congress)return <p>{S.ledgerCongressMissing}</p>;
 return <section className="congress-sheet" data-testid="congress-sheet"><h3>{S.congressChambers}</h3>
  {!congress.chambers.length&&<p>{S.congressNoChambers}</p>}{congress.chambers.map(c=><article key={c.id}><h4>{name(c.name)}</h4><p>{S.congressStates[c.status]}{c.opens!==null&&c.closes!==null?`, ${dateOf(c.opens)} — ${dateOf(c.closes)}`:''}</p>{c.composition?<><time>{c.composition.on}</time><dl>{c.composition.groups.map(g=><div key={g.name}><dt>{name(g.name)}</dt><dd>{g.seats}</dd></div>)}</dl><small>{c.composition.cite}</small></>:<p className="hand">{S.congressCompositionMissing}</p>}</article>)}
  <h3>{S.congressSessions}</h3>{congress.sessions.map(s=><article key={s.id}><h4>{s.callable?S.congressCallable:S.congressRegular}</h4><p>{s.chambers.map(id=>name(congress.chambers.find(c=>c.id===id)?.name??id)).join(', ')}</p><p>{s.opens??(s.afterCallDays===null?S.unknown:S.congressAfterCall(s.afterCallDays))} — {s.closes??(s.sitsDays===null?S.unknown:S.congressSits(s.sitsDays))}</p></article>)}
  <h3>{S.congressActs}</h3>{!congress.ledger.length&&<p>{S.congressNoActs}</p>}{congress.ledger.map((e,i)=>{const source=data.morning.view.reports.find(r=>r.id===e.source),situation=data.morning.view.situations.find(s=>s.id===e.situation);return <article key={`${e.act}:${e.day}:${i}`}><h4>{Object.hasOwn(data.strings,e.act)?name(e.act):situation?name(situation.title):S.congressAct}</h4><time>{dateOf(e.day)}</time><p>{e.metDay===null?S.congressAway:`${S.congressMet}: ${dateOf(e.metDay)}`}</p><p>{e.answeredDay===null?S.congressNoAnswer:`${S.congressAnswered}: ${dateOf(e.answeredDay)}`}</p>{source?<button data-source-paper={source.id} onClick={()=>openPaper(source)}>{S.boardOpenPaper}: {name(source.author,'person')}</button>:<p className="hand">{S.congressOwn}</p>}</article>;})}
 </section>;
}
