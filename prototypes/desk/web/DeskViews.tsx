import {useState} from 'react';
import type {PrincipalMenu,ReportView} from '@mandate/kernel/seat-api';
import type {DeskSnapshot,DeskTurn} from './adapter.ts';
import {commandPrice,ledgerRows,priceLabel,received,outOfAttention,refusalText,slipText,operationRecords} from './business.ts';
import type {Price} from './business.ts';
import {presenter} from './presentation.ts';
import {stopEntries} from './table.ts';
import {S} from './strings.ts';
import {useDeskDate} from './desk-date.ts';
import './business.css';
import {deskDate,ownGoalStatus,availableCalls} from './plan-business.ts';
import {writtenDate} from './dates.ts';

export function AttentionTokens({left,price=null}:{left:number|null;price?:Price|null}){
 return <span className="attention-budget" data-testid="attention-budget">
  <span className="attention-coins" aria-hidden="true">{Array.from({length:Math.min(24,Math.max(0,left??0))},(_,i)=><i className={i<(price?.max??0)?'proposed':''} key={i}/>)}</span>
  <span>{left===null?S.attentionNoBudget:S.attentionAvailable(left)}</span>
  {price&&<span className="attention-price" role="status">{priceLabel(price)}</span>}
 </span>;
}
export function AttentionSheet({data,dateOf:givenDate}:{data:DeskSnapshot;dateOf?:(day:number)=>string}){
 const fallbackDate=useDeskDate(),dateOf=givenDate??fallbackDate;
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
  <header><h3>{S.stopped}</h3><time>{writtenDate(turn.days.at(-1)?.date??S.stopNoDay)}</time></header>
  {turn.days.flatMap(day=>day.refused.map((r,i)=><p className="refusal" key={`${day.day}:${i}`}>{S.refused}: {presenter(strings).text(turn.submitted?.find((_,index)=>index===r.commandIndex)?.text??S.orders)}. {refusalText(r.reason,strings)}</p>))}
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
export function TurnSheet({data,busy,run,openPaper,onDocket,onPlans,onHistory,setStops,signCall,onOrder}:{data:DeskSnapshot;busy:boolean;run:(days:number)=>void;openPaper:(r:ReportView)=>void;onDocket:()=>void;onPlans:()=>void;onHistory:()=>void;setStops?:(points:readonly string[])=>Promise<unknown>;signCall?:(line:string)=>Promise<unknown>;onOrder?:(line:string)=>void}){
 const lastTurn=data.history.at(-1),{text}=presenter(data.strings),menu=data.morning.menu;
  const maxDays=data.morning.turnStops?.maxDays??7;
  const [days,setDays]=useState(maxDays);
  const calls=availableCalls(data);
  const advances=menu.menuKind==='principal'&&menu.atWarSince!==null?menu.doctrine.offensives.filter(o=>o.day<=data.morning.requestDay):[];
  const {name}=presenter(data.strings);
 return <><p className="margin-note">{S.runNote}</p>
  {menu.menuKind==='principal'&&(menu.reviews.length>0||menu.awaiting.length>0)&&<section data-testid="pending-plans" aria-live="polite">
   {menu.reviews.length>0&&<p>{S.planReviewCount(menu.reviews.length)}</p>}
   {menu.awaiting.length>0&&<p>{S.planGoCount(menu.awaiting.length)}</p>}
   <button disabled={busy} onClick={onPlans}>{S.openPlans}</button>
  </section>}
  {menu.menuKind==='principal'&&advances.length>0&&<section className="advance-agenda" data-testid="advance-agenda"><h3>{S.proposedAdvances}</h3><p>{S.advanceDateNote}</p>
   {advances.map(o=>{const status=ownGoalStatus(data,o.post,o.objective),post=menu.commandable.find(p=>p.post===o.post);
    return <article key={`${o.post}:${o.day}:${o.objective}`}><h4>{name(o.post,'post')}</h4><p><time dateTime={deskDate(data,o.day)}>{writtenDate(deskDate(data,o.day))}</time>: {name(o.objective,'region')}</p>
     {status?<p role="status">{status==='queued'?S.goalQueued:S.goalDispatched}</p>:post?<button disabled={busy||!onOrder} onClick={()=>onOrder?.(`order ${o.post} take ${o.objective} review`)}>{S.reviewGoalOrder}</button>:<p>{S.advanceUnavailable}</p>}
    </article>;
   })}
  </section>}
  {lastTurn&&<StopSlip turn={lastTurn} strings={data.strings} openPaper={openPaper} onDocket={onDocket} onPlans={onPlans} onHistory={onHistory}/>}
  <h3>{data.queue.length} {S.signedCount}</h3>
  {data.queue.map((q,i)=><section key={i}><p>{text(slipText(data.morning,data.strings,q.line,q.text))}</p>{menu.menuKind==='principal'&&<PriceNote line={q.line} menu={menu}/>}</section>)}
  <label>{S.turnDays}<select disabled={busy} value={days} onChange={e=>setDays(Number(e.target.value))}>{Array.from({length:maxDays},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}</select></label><p>{S.turnDaysNote}</p>
  <button data-hotkey="run" data-attention-key="free" className="primary" disabled={busy} onClick={()=>run(days)}>{S.sendRun}</button>
  {calls.length>0&&<section className="scheduled-calls"><h3>{S.callsDue}</h3><p>{S.callsDueNote}</p>{calls.map(c=>{
    const line=`call ${c.post} scheduled=${c.id}`,queued=data.queue.some(q=>{const words=q.line.trim().split(/\s+/);return words[0]==='call'&&words[1]===c.post&&words.includes(`scheduled=${c.id}`);});
    return <article key={c.id} data-call-id={c.id}><h4>{name(c.post,'post')}</h4>
      <p>{c.readiness&&`${S.callReadiness}: `}{c.men!=null?S.callMen(c.men):c.regiments!=null?S.callRegiments(c.regiments):S.callUnknownStrength}{c.arm?`, ${S.callArms[c.arm]??name(c.arm)}`:''}. {c.termDays===null?S.callForWar:S.callTerm(c.termDays)}.</p>
      {menu.menuKind==='principal'&&<PriceNote line={line} menu={menu}/>}
      <button data-attention-key="order" disabled={busy||queued||!signCall||(menu.menuKind==='principal'&&outOfAttention(menu.attention.left,commandPrice(line,menu)))} onClick={()=>void signCall?.(line)}>{queued?S.callQueued:S.signCall}</button>
    </article>;
  })}</section>}
  <section className="stop-policy"><h3>{S.stopPolicy}</h3>{data.morning.turnStops?<><p>{S.stopLimit(data.morning.turnStops.maxDays)}</p><p>{S.stopSettingsNote}</p><fieldset disabled={busy||!setStops}><legend>{S.stopPolicy}</legend>{data.morning.turnStops.points.map(({point,enabled})=><label key={point}><input type="checkbox" checked={enabled} onChange={e=>{const next=data.morning.turnStops!.points.filter(p=>p.point===point?e.target.checked:p.enabled).map(p=>p.point);void setStops?.(next);}}/>{S.stopChoice(S.stopLabels[point]??S.stopUnknown)}</label>)}<button type="button" onClick={()=>void setStops?.(data.morning.turnStops!.points.map(p=>p.point))}>{S.stopAll}</button></fieldset></>:<><p>{S.stopPolicyNote}</p><p className="hand">{S.stopSettingsMissing}</p></>}</section>
 </>;
}

export function CallsBadge({data}:{data:DeskSnapshot}){
 const count=availableCalls(data).filter(c=>!data.queue.some(q=>{const words=q.line.trim().split(/\s+/);return words[0]==='call'&&words[1]===c.post&&words.includes(`scheduled=${c.id}`);})).length;
 return count?<small>{S.callsAvailable(count)}</small>:null;
}
export function FirstMorningNote({data}:{data:DeskSnapshot}){
 return data.history.length===0?<aside className="first-morning-note" data-testid="first-morning-note">{S.firstMorningNote}</aside>:null;
}

/** The principal's own correspondence, with no access to operation State. */
export function OperationsSheet({data,openPaper,dateOf=(day)=>writtenDate(deskDate(data,day))}:{data:DeskSnapshot;openPaper:(r:ReportView)=>void;dateOf?:(day:number)=>string}){
 const records=operationRecords(data),{name,text}=presenter(data.strings),menu=data.morning.menu;
 function claimWords(r:ReportView){return r.claims.flatMap(c=>{
  const place=c.region?` — ${name(c.region,'region')}`:'';
  if(c.kind==='operation')return [(c.token&&S.operationStages[c.token]||text(c.token??S.unknown))+place];
  if(['order-obeyed','plan-answer','verb-answered','support-answer'].includes(c.kind))return [`${S.progressDeclared}: ${text(c.token??S.unknown)}`];
  if(c.kind==='call-answer')return [`${S.progressCall}: ${text(c.token??S.unknown)}; ${c.token?.endsWith(':unknown_strength')?S.callUnknownStrength:S.callRegiments(c.value)}`];
  if(c.kind==='battle-phase')return [`${S.claims[c.kind]}: ${text(c.token??S.unknown)}${place}. ${c.value===1?S.battleReportedWell:S.battleReportedBadly}`];
  if(c.kind==='battle-result')return [`${S.claims[c.kind]}: ${text(c.token??S.unknown)}${place}${c.confidence>0?`; ${c.value}`:''}`];
  if(['own-losses','casualties','missing','captured'].includes(c.kind))return [`${S.claims[c.kind]}: ${c.value}${place}`];
  if(['arrived','position','goal-status','plan-submitted','order-objected'].includes(c.kind))return [`${S.claims[c.kind]??text(c.kind)}${c.kind==='goal-status'?`: ${text(c.token??S.unknown)}`:''}${place}`];
  return [];
 });}
 return <section className="operations-record" data-testid="operations-record"><p>{S.progressNote}</p>{!records.length&&<p>{S.progressNone}</p>}
  {records.map(record=>{
   const plan=menu.menuKind==='principal'?menu.reviews.find(r=>r.post===record.post)?.plan:undefined;
   const supplied=plan??record.plans.at(-1)?.plan;
   const milestones=record.reports.filter(r=>r.claims.some(c=>!['position','goal-status','enemy-strength','works','control','control-government'].includes(c.kind)));
   const latestStatus=[...record.reports].reverse().find(r=>r.claims.some(c=>c.kind==='position'||c.kind==='goal-status'));
   const papers=[...new Map([...milestones,...(latestStatus?[latestStatus]:[])].map(r=>[r.id,r])).values()].sort((a,b)=>b.receivedDay-a.receivedDay||b.day-a.day);
   return <article className="command-record" key={record.post}><h3>{name(record.post,'post')}</h3>
    {menu.menuKind==='principal'&&menu.awaiting.includes(record.post as typeof menu.awaiting[number])&&<p>{S.awaiting}</p>}
    {supplied&&<section className="received-clock"><h4>{S.progressPlanClock}</h4>{supplied.axes.map(a=><p key={a.name}>{text(a.name)}: {S.progressDuration(Math.ceil(a.arrival/1000))}</p>)}<p>{S.progressNoStart}</p><small>{S.progressClockNote}</small></section>}
    {record.orders.length>0&&<details><summary>{S.progressOwn} ({record.orders.length})</summary><p>{S.ledgerOwnNote}</p><ol>{record.orders.map(o=><li key={o.id}><time>{writtenDate(o.date)}</time><p>{text(slipText(data.morning,data.strings,o.line,o.text))}</p>{o.refusal&&<p className="refusal">{refusalText(o.refusal,data.strings)}</p>}</li>)}</ol></details>}
    <h4>{S.progressPapers}</h4>{!papers.length&&<p>{S.progressNoReplies}</p>}
    {papers.map(r=><section className="progress-paper" key={r.id}><strong>{name(r.author,'person')}</strong><p>{S.progressAsOf(`${dateOf(r.day)}${r.hour===null?'':`, ${String(r.hour).padStart(2,'0')}:00`}`,dateOf(r.receivedDay))}</p><small>{S.progressAge(Math.max(0,data.morning.view.day-r.day))}</small>
     {claimWords(r).map((line,i)=><p key={i}>{line}</p>)}{r.claims.some(c=>['order-obeyed','plan-answer','verb-answered','call-answer'].includes(c.kind))&&<small>{S.progressAnswerNote}</small>}
     {r.advice&&<><p>{S.recommends}: {text(r.advice.recommends)}</p><ul>{r.advice.reasons.map((reason,i)=><li key={i}>{text(reason.kind)}</li>)}</ul></>}
     <button data-source-paper={r.id} onClick={()=>openPaper(r)}>{S.ledgerTerms}</button>
    </section>)}
   </article>;
  })}
 </section>;
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
    <ol className="act-entries">{rows.map(row=><li key={row.id}><time>{writtenDate(row.date)}</time><p>{text(row.text)}</p><span className={row.refusal?'refusal':'record-status'}>{row.refusal?`${S.refused}: ${text(row.refusal)}`:S.ledgerSent}</span></li>)}</ol>
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
  {!congress.chambers.length&&<p>{S.congressNoChambers}</p>}{congress.chambers.map(c=><article key={c.id}><h4>{name(c.name)}</h4><p>{S.congressStates[c.status]}{c.opens!==null&&c.closes!==null?`, ${dateOf(c.opens)} — ${dateOf(c.closes)}`:''}</p>{c.composition?<><time>{writtenDate(c.composition.on)}</time><dl>{c.composition.groups.map(g=><div key={g.name}><dt>{name(g.name)}</dt><dd>{g.seats}</dd></div>)}</dl><small>{c.composition.cite}</small></>:<p className="hand">{S.congressCompositionMissing}</p>}</article>)}
  <h3>{S.congressSessions}</h3>{congress.sessions.map(s=><article key={s.id}><h4>{s.callable?S.congressCallable:S.congressRegular}</h4><p>{s.chambers.map(id=>name(congress.chambers.find(c=>c.id===id)?.name??id)).join(', ')}</p><p>{s.opens!==null?writtenDate(s.opens):(s.afterCallDays===null?S.unknown:S.congressAfterCall(s.afterCallDays))} — {s.closes!==null?writtenDate(s.closes):(s.sitsDays===null?S.unknown:S.congressSits(s.sitsDays))}</p></article>)}
  <h3>{S.congressActs}</h3>{!congress.ledger.length&&<p>{S.congressNoActs}</p>}{congress.ledger.map((e,i)=>{const source=data.morning.view.reports.find(r=>r.id===e.source),situation=data.morning.view.situations.find(s=>s.id===e.situation);return <article key={`${e.act}:${e.day}:${i}`}><h4>{Object.hasOwn(data.strings,e.act)?name(e.act):situation?name(situation.title):S.congressAct}</h4><time>{dateOf(e.day)}</time><p>{e.metDay===null?S.congressAway:`${S.congressMet}: ${dateOf(e.metDay)}`}</p><p>{e.answeredDay===null?S.congressNoAnswer:`${S.congressAnswered}: ${dateOf(e.answeredDay)}`}</p>{source?<button data-source-paper={source.id} onClick={()=>openPaper(source)}>{S.boardOpenPaper}: {name(source.author,'person')}</button>:<p className="hand">{S.congressOwn}</p>}</article>;})}
 </section>;
}
