import {useState} from 'react';
import type {CounterKind, ReportView, SeatRequest} from '@mandate/kernel/seat-api';
import {audienceCommand, audienceRecord, buildOrgBoard} from './people.ts';
import type {CounterDraft, PostCard} from './people.ts';
import {presenter} from './presentation.ts';
import {S} from './strings.ts';
import './people.css';
import {PriceNote} from './DeskViews.tsx';
import {commandPrice,outOfAttention} from './business.ts';

type Common={request:SeatRequest;strings:Readonly<Record<string,string>>};
type PaperOpener={openPaper:(report:ReportView)=>void};
export function OrgBoard({request,strings,openPost,openPaper,dateOf,onPersonnel}:Common&{openPost:(post:string)=>void;openPaper?:(r:ReportView)=>void;dateOf?:(day:number)=>string;onPersonnel?:()=>void}) {
  const {nodes}=buildOrgBoard(request),{name}=presenter(strings);
  const [query,setQuery]=useState(''),[vacant,setVacant]=useState(false);
  const filtering=query.trim()!==''||vacant;
  const matches=nodes.filter(n=>(!vacant||n.status==='vacant')&&`${name(n.post,'post')} ${n.holder?name(n.holder,'person'):''}`.toLowerCase().includes(query.trim().toLowerCase()));
  function branch(node:PostCard,parents:readonly string[]=[]):React.ReactNode {
    if(parents.includes(node.post))return null;
    const children=nodes.filter(n=>n.parent===node.post);
    return <li key={node.post} data-post={node.post} className="org-branch">
      <button className={`org-post ${node.status}`} onClick={()=>openPost(node.post)}>
        <span className="org-pin" aria-hidden="true"/>
        <strong>{name(node.post,'post')}</strong>
        <span>{node.status==='vacant'?S.boardVacant:node.holder?name(node.holder,'person'):S.boardUnknown}</span>
      </button>
      {!filtering&&children.length>0&&<ul>{children.map(n=>branch(n,[...parents,node.post]))}</ul>}
    </li>;
  }
  const placed=nodes.filter(n=>n.placed&&(n.parent===null||!nodes.some(p=>p.post===n.parent))),unplaced=nodes.filter(n=>!n.placed);
  return <section className="org-board" data-testid="org-board">
    {onPersonnel&&<button onClick={onPersonnel}>{S.personnelTitle}</button>}
    <AudienceCorrespondence request={request} strings={strings} openPaper={openPaper} openPost={openPost} dateOf={dateOf}/>
    <div className="org-caption"><p>{S.boardNote}</p><small>{S.boardCount(nodes.length)}</small></div>
    <div className="board-search"><label>{S.boardFilter}<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><button aria-pressed={vacant} onClick={()=>setVacant(v=>!v)}>{S.boardVacancies}</button></div>
    {nodes.length===0&&<p>{S.boardEmpty}</p>}
    {filtering?<><p>{S.boardMatches(matches.length)}</p>{!matches.length&&<p>{S.boardNoMatches}</p>}<ul className="board-results">{matches.map(n=>branch(n))}</ul></>:<><ul className="org-roots">{placed.map(n=>branch(n))}</ul>
    {unplaced.length>0&&<section className="org-unplaced"><h3>{S.boardUnplaced}</h3><ul>{unplaced.map(n=>branch(n))}</ul></section>}</>}
  </section>;
}

/** A nomination based on received identities, never the live eligible-candidate catalogue. */
export function PersonnelSheet({request,strings,order,openPaper,dateOf=(day)=>`${S.day} ${day}`} : Common&PaperOpener&{order:(line:string)=>void;dateOf?:(day:number)=>string}){
 const {name}=presenter(strings),vacancies=request.view.posts.filter(p=>p.status==='vacant');
 const people=request.view.people.filter(p=>p.person!==request.view.person);
 const [post,setPost]=useState(''),[person,setPerson]=useState('');
 const reports=request.view.reports.filter(r=>r.day<=request.view.day&&r.receivedDay<=request.view.day);
 const sourced=request.view.posts.flatMap(p=>{const source=reports.find(r=>r.id===p.source);return source?[{post:p,source}]:[];});
 return <section className="personnel-sheet" data-testid="personnel-sheet"><p>{S.personnelNote}</p><h3>{S.personnelKnownVacancies}</h3>
  {!vacancies.length?<p>{S.personnelNoVacancies}</p>:<ul>{vacancies.map(p=><li key={p.post}>{name(p.post,'post')}{p.vacantSince!==null&&<small>{S.boardVacantSince(dateOf(p.vacantSince))}</small>}</li>)}</ul>}
  <form onSubmit={e=>{e.preventDefault();if(vacancies.some(p=>p.post===post)&&people.some(p=>p.person===person))order(`appoint ${post} ${person}`);}}>
   <label>{S.personnelVacancy}<select required value={post} onChange={e=>setPost(e.target.value)}><option value="">{S.selection}</option>{vacancies.map(p=><option key={p.post} value={p.post}>{name(p.post,'post')}</option>)}</select></label>
   <label>{S.personnelNominee}<select required value={person} onChange={e=>setPerson(e.target.value)}><option value="">{S.selection}</option>{people.map(p=><option key={p.person} value={p.person}>{name(p.person,'person')}</option>)}</select></label>
   {!people.length&&<p>{S.personnelNoPeople}</p>}
   {person&&<p>{request.view.posts.filter(p=>p.holder===person).length?`${S.personnelHolding}: ${request.view.posts.filter(p=>p.holder===person).map(p=>name(p.post,'post')).join(', ')}`:S.personnelNoPost}</p>}
   <p>{S.personnelNoAssumption}</p><p>{S.personnelEligibility}</p><button disabled={!post||!person}>{S.personnelDraft}</button>
  </form>
  <h3>{S.personnelEstablishment}</h3><p>{S.personnelNoEstablishment}</p>
  {sourced.length>0&&<><h4>{S.personnelChanges}</h4><ul>{sourced.map(({post:p,source:r})=><li key={p.post}><strong>{name(p.post,'post')}</strong><p>{p.holder?name(p.holder,'person'):p.status==='vacant'?S.boardVacant:S.boardUnknown}</p><p>{dateOf(p.asOfDay)}</p><button data-source-paper={r.id} onClick={()=>openPaper(r)}>{name(r.author,'person')}: {S.boardOpenPaper}</button></li>)}</ul></>}
 </section>;
}

function Source({report,strings,openPaper}:PaperOpener&{report:ReportView;strings:Common['strings']}) {
  const {name}=presenter(strings);
  return <button className="people-source" data-source-paper={report.id} onClick={()=>openPaper(report)}>
    {name(report.author,'person')}, {S.day} {report.day} — {S.boardOpenPaper}
  </button>;
}

function PersonKnowledge({request,strings,person,post,openPaper}:Common&PaperOpener&{person:string|null;post:string}) {
  const known=request.view.people.find(p=>p.person===person),{text}=presenter(strings);
  const reports=request.view.reports.filter(r=>r.day<=request.view.day&&r.receivedDay<=request.view.day);
  const source=(id:string)=>reports.find(r=>r.id===id);
  const assessments=(known?.assessments??[]).flatMap(id=>{const r=source(id);return r?[r]:[];});
  const observers=request.view.posts.find(p=>p.post===post)?.observerReports??[];
  return <>
    <h4>{S.boardAssessment}</h4>{assessments.length?assessments.map(r=><div key={r.id}><p>{text(r.advice!.recommends)}</p><Source report={r} strings={strings} openPaper={openPaper}/></div>):<p>{S.boardAssessmentMissing}</p>}
    <h4>{S.boardStanding}</h4><p>{known?.standing==null?S.boardStandingMissing:S.boardStandingValue(known.standing)}</p>
    <h4>{S.boardStances}</h4>{known?.stances.length?<ul>{known.stances.map(s=>{const r=source(s.source);return <li key={s.source}>{text(s.recommends)}{r&&<Source report={r} strings={strings} openPaper={openPaper}/>}</li>;})}</ul>:<p>{S.boardStancesMissing}</p>}
    <h4>{S.boardObservers}</h4>{observers.length?observers.map(id=>{const r=source(id);return r?<Source key={id} report={r} strings={strings} openPaper={openPaper}/>:null;}):<p>{S.boardObserversMissing}</p>}
  </>;
}

export function PostDetails({request,strings,post,openPaper,order,openAudience}:Common&PaperOpener&{post:string;order:(line:string)=>void;openAudience:(post:string)=>void}) {
  const node=buildOrgBoard(request).nodes.find(n=>n.post===post),{name,text}=presenter(strings);
  const [transferring,setTransferring]=useState(false),[target,setTarget]=useState(''),[amount,setAmount]=useState(''),[unit,setUnit]=useState('men');
  if(!node)return <p>{S.boardNoPost}</p>;
  const last=node.reports.at(-1),menu=request.menu.menuKind==='principal'?request.menu:null;
  return <section className="post-details" data-testid="person-card">
    <header className="post-person"><div className="post-name-card"><p>{S.noLikeness}</p><h3>{node.holder?name(node.holder,'person'):node.status==='vacant'?S.boardVacant:S.boardUnknown}</h3><p>{name(post,'post')}</p></div>
      <div><h3>{name(post,'post')}</h3>{node.parent&&<p>{S.through}: {name(node.parent,'post')}</p>}
        <p>{S.boardHolderAsOf(node.asOfDay)}</p>
        {node.source&&request.view.reports.find(r=>r.id===node.source)&&<><h4>{S.boardSource}</h4><Source report={request.view.reports.find(r=>r.id===node.source)!} strings={strings} openPaper={openPaper}/></>}
        {node.status==='vacant'&&<p className="vacancy-note">{node.vacantSince===null?S.boardVacant:S.boardVacantSince(`${S.day} ${node.vacantSince}`)}</p>}
        <PersonKnowledge request={request} strings={strings} person={node.holder} post={post} openPaper={openPaper}/>
        {node.commandable&&<><p>{S.through}: {node.commandable.relays.map(id=>name(id,'post')).join(' → ')||name(post,'post')}</p><ul>{node.commandable.routes.map(route=><li key={route.route}>{route.route}, {route.typicalDays} {S.typicalDays}, {route.price} {S.routePrice}</li>)}</ul></>}
      </div></header>
    <div className="actions">
      {node.commandable&&<><button data-attention-key="order" onClick={()=>order(`order ${post} hold`)}>{S.makeOrder}</button><button data-attention-key="inquire" data-hotkey="i" onClick={()=>order(`inquire ${post}`)}>{S.ask}</button><button data-attention-key="audience" onClick={()=>openAudience(post)}>{S.audience}</button><button data-attention-key="transfer" onClick={()=>setTransferring(v=>!v)}>{S.boardTransfer}</button><button data-attention-key="relieve" onClick={()=>order(`relieve ${post} outright`)}>{S.boardRelieve}</button></>}
      {node.holder&&node.holder!==request.view.person&&<><button onClick={()=>order(`promise ${node.holder}`)}>{S.counterLabels.promise_advancement}</button><button onClick={()=>order(`pressure ${node.holder}`)}>{S.peoplePressure}</button></>}
      {node.status==='vacant'&&menu?.vacancies.some(v=>v.post===post)&&<button onClick={()=>order(`appoint ${post} `)}>{S.boardAppointment}</button>}
    </div>
    {transferring&&menu&&<form className="post-transfer" onSubmit={e=>{e.preventDefault();order(`transfer ${post} ${target} ${unit} ${Number(amount)}`);}}>
      <label>{S.to}<select required value={target} onChange={e=>setTarget(e.target.value)}><option value="">{S.selection}</option>{menu.commandable.filter(p=>p.post!==post).map(p=><option key={p.post} value={p.post}>{name(p.holder,'person')}, {name(p.post,'post')}</option>)}</select></label>
      <label>{S.peopleForce}<select value={unit} onChange={e=>setUnit(e.target.value)}><option value="men">{S.audienceMen}</option><option value="blocks">{S.peopleBlocks}</option></select></label>
      <label>{S.peopleAmount}<input type="number" min="1" step="1" required value={amount} onChange={e=>setAmount(e.target.value)}/></label>
      <p>{S.peopleTransferNote}</p><button disabled={!target||!Number.isSafeInteger(Number(amount))||Number(amount)<=0}>{S.peopleDraftTransfer}</button>
    </form>}
    <section className="post-papers"><h3>{S.boardKnowledge}</h3>
      {last?<p>{S.boardLastHeard}: {name(last.author,'person')}, {S.day} {last.day}</p>:<p>{S.boardNoReports}</p>}
      {[...node.reports].reverse().map(report=><article key={report.id}>
        <Source report={report} strings={strings} openPaper={openPaper}/>
        {report.advice&&<><p>{S.recommends}: {text(report.advice.recommends)}</p><ol>{report.advice.reasons.map((reason,i)=><li key={i}>{(S.reasonLabels as Record<string,string>)[reason.kind]??text(reason.kind.replaceAll('_',' '))}</li>)}</ol></>}
      </article>)}
    </section>
  </section>;
}

export function AudienceScene({request,strings,post,busy,queue,execute,openPaper,draft,setDraft}:Common&PaperOpener&{post:string;busy:boolean;queue:readonly {line:string}[];execute:(line:string)=>Promise<unknown>;draft?:readonly CounterDraft[];setDraft?:(value:CounterDraft[])=>void}) {
  const record=audienceRecord(request,post),{name,text}=presenter(strings);
  const [localDraft,setLocalDraft]=useState<CounterDraft[]>([]);
  const counters=draft??localDraft;
  const setCounters=(change:(old:readonly CounterDraft[])=>CounterDraft[])=>{const next=change(counters);if(setDraft)setDraft(next);else setLocalDraft(next);};
  const menu=request.menu.menuKind==='principal'?request.menu:null;
  const hasPlan=menu?.reviews.some(r=>r.post===post)||record.reports.some(r=>r.claims.some(c=>c.kind==='goal-status'||c.kind==='plan-submitted'||c.kind==='plan-answer'));
  const signed=queue.some(q=>q.line.trim().split(/\s+/)[0]==='audience'&&q.line.trim().split(/\s+/)[1]===post);
  const filed=record.reports.filter(r=>r.claims.some(c=>c.kind==='verb-answered'&&c.token?.startsWith('audience:')));
  let command='';try{command=audienceCommand(post,counters);}catch{ /* Incomplete drafts are not commands. */ }
  const patch=(index:number,value:Partial<CounterDraft>)=>setCounters(old=>old.map((c,i)=>i===index?{...c,...value}:c));
  return <section className="audience-layout" data-testid="audience-scene">
    <section className="audience-case"><h3>{S.audienceCase}</h3><h4>{S.audienceRecord}</h4><p className="hand">{S.audiencePrior}</p>
      <AudienceCorrespondence request={request} strings={strings} openPaper={openPaper} post={post}/>
      {record.reasons.length?<ol className="audience-reasons">{record.reasons.map((reason,i)=>{
        const report=record.reports.find(r=>r.id===reason.source)!;
        return <li key={`${reason.source}:${i}`}><p>{(S.reasonLabels as Record<string,string>)[reason.kind]??text(reason.kind.replaceAll('_',' '))}</p><Source report={report} strings={strings} openPaper={openPaper}/></li>;
      })}</ol>:<p>{S.audienceNoReasons}</p>}
      {filed.length>0&&<section className="filed-audiences"><h4>{S.audienceFiled}</h4>{filed.map(r=><article key={r.id}><p>{S.audienceHeld}</p><h4>{S.audienceDeclared}</h4><blockquote>{text(r.advice?.recommends??r.claims.find(c=>c.token?.startsWith('audience:'))!.token!.slice('audience:'.length))}</blockquote><Source report={r} strings={strings} openPaper={openPaper}/></article>)}</section>}
    </section>
    <div className="audience-visitor"><div className="visitor-name-card" data-testid="visitor-name-card"><p>{S.noLikeness}</p><h3>{record.holder?name(record.holder,'person'):S.boardUnknown}</h3><p>{name(post,'post')}</p></div>
      <section className="audience-assessment"><PersonKnowledge request={request} strings={strings} person={record.holder} post={post} openPaper={openPaper}/></section>
    </div>
    <section className="audience-answers"><h3>{S.audienceAnswers}</h3><p className="audience-attention">{S.attention}: {request.view.attention??S.unknown}<br/>{S.audienceCost(menu?.attention.costs.audience??S.unknown)}</p>
      <p>{S.audienceQueue}</p>{!hasPlan&&<p className="hand">{S.audienceNoPlan}</p>}
      {menu&&<PriceNote line={`audience ${post}`} menu={menu}/>}
      <form onSubmit={e=>{e.preventDefault();if(command&&!signed)void execute(command);}}>
        <fieldset disabled={busy||signed||!record.commandable}>
          {counters.length===0&&<p>{S.audienceNone}</p>}
          {counters.map((counter,i)=><section className="audience-counter" key={counter.kind}><h4>{S.counterLabels[counter.kind]}</h4>
            {counter.kind==='frame'&&<label>{S.audienceValue}<input required value={counter.value??''} onChange={e=>patch(i,{value:e.target.value})}/></label>}
            {counter.kind==='adjust'&&<label>{S.audienceBoldness}<input required type="number" min="0" max="1000" step="1" value={counter.boldness??''} onChange={e=>patch(i,{boldness:e.target.value===''?undefined:Number(e.target.value)})}/></label>}
            {counter.kind==='reinforce'&&<><label>{S.audienceFrom}<select required value={counter.from??''} onChange={e=>patch(i,{from:e.target.value})}><option value="">{S.selection}</option>{menu?.commandable.filter(p=>p.post!==post).map(p=><option key={p.post} value={p.post}>{name(p.holder,'person')}, {name(p.post,'post')}</option>)}</select></label><label>{S.audienceMen}<input required type="number" min="1" step="1" value={counter.men??''} onChange={e=>patch(i,{men:e.target.value===''?undefined:Number(e.target.value)})}/></label></>}
            <button type="button" onClick={()=>setCounters(old=>old.filter((_,j)=>j!==i))}>{S.audienceRemove}</button>
          </section>)}
          <label>{S.audienceCounter}<select value="" onChange={e=>{if(e.target.value)setCounters(old=>[...old,{kind:e.target.value as CounterKind}]);}}><option value="">{S.selection}</option>{(Object.keys(S.counterLabels) as CounterKind[]).filter(kind=>!counters.some(c=>c.kind===kind)).map(kind=><option key={kind} value={kind}>{S.counterLabels[kind]}</option>)}</select></label>
          <p className="hand">{S.audienceCheck}</p>{!command&&<p role="status">{S.audienceIncomplete}</p>}
          <button className="primary" data-attention-key="audience" data-hotkey="s" disabled={!command||!record.commandable||!!menu&&outOfAttention(menu.attention.left,commandPrice(command,menu))}>{S.sign}</button>
        </fieldset>
      </form>
      {signed&&<p role="status">{S.audienceSigned}</p>}{!record.commandable&&<p>{S.audienceUnavailable}</p>}
      {!filed.length&&<p className="audience-missing">{S.audienceMissing}</p>}
    </section>
  </section>;
}
function AudienceCorrespondence({request,strings,openPaper,openPost,post,dateOf=(day)=>`${S.day} ${day}`} : Common & {openPaper?:(r:ReportView)=>void;openPost?:(post:string)=>void;post?:string;dateOf?:(day:number)=>string}){
 const entries=(request.view.audiences??[]).filter(a=>post===undefined||a.post===post),{name,text}=presenter(strings);
 return <section className="audience-correspondence" data-testid="audience-correspondence">
  <h3>{S.audienceAppointments}</h3>
  {!entries.length&&<p>{S.audienceNoAppointments}</p>}
  <ul>{entries.map(a=>{
   const source=request.view.reports.find(r=>r.id===a.source);
   const currentHolder=request.view.posts.some(p=>p.post===a.post&&p.holder===a.person);
   return <li key={a.id}>
    <h4>{name(a.person,'person')}</h4>
    <p>{S.audienceStatus[a.status]}, {dateOf(a.day)}</p>
    {a.post&&<p>{name(a.post,'post')}</p>}
    {a.status==='granted'&&<p>{S.audienceAwaitingReply}</p>}
    {a.declared&&<p>{text(a.declared)}</p>}
    {a.counters.length>0&&<p>{a.counters.map(c=>S.counterLabels[c.kind]).join(', ')}</p>}
    {source&&openPaper&&<button data-source-paper={source.id} onClick={()=>openPaper(source)}>{S.boardOpenPaper}: {name(source.author,'person')}</button>}
    {a.post&&openPost&&currentHolder&&<button onClick={()=>openPost(a.post!)}>{S.personPage}</button>}
   </li>;
  })}</ul>
 </section>;
}
