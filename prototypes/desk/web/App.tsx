import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { CommandablePost, OptionView, PrincipalMenu, ReportView, SituationView } from '@mandate/kernel/seat-api';
import { deskApi } from './adapter.ts';
import type { DeskReply, DeskSnapshot, DeskTurn } from './adapter.ts';
import { isTyping, SettingsContext, useSettings } from './settings.ts';
import { Find } from './Find.tsx';
import { Modal } from './Modal.tsx';
import { MapReview } from './map/StaffMap.tsx';
import { M } from './map/strings.ts';
import { presenter } from './presentation.ts';
import {InTray,WeeklyPaper} from './InTray.tsx';
import {clearFilters} from './intray.ts';
import type {TrayFilters} from './intray.ts';
import { S, VERBS } from './strings.ts';
import {pressStories} from './press.ts';
import {AudienceScene, OrgBoard, PostDetails} from './People.tsx';
import type {CounterDraft} from './people.ts';
import type { Panel } from './strings.ts';
import {dayFrames,playbackSnapshot,reportPlace} from './table.ts';
import type {Point} from './map/model.ts';
import './table.css';

type Sheet = { panel: Panel; paper?: ReportView; person?: CommandablePost; post?:string; audience?:string; summary?:boolean };
const art = (name: string) => `/art/app/chrome/${name}.png`;
const objects: Partial<Record<Panel, string>> = {
  calendar: 'calendar-block', inbox: 'tray-in', outbox: 'tray-out', board: 'board-frame',
  ledger: 'ledger-closed', file: 'file-drawer', daybook: 'daybook', docket: 'docket-spike',
};
const sounds: Partial<Record<Panel, string>> = { inbox: 'paper-draw', outbox: 'paper-draw', board: 'pin', ledger: 'ledger-open', file: 'drawer', daybook: 'ledger-open', calendar: 'calendar-page', orders: 'paper-clip', run: 'clock-day' };

export function App() {
  const [data, setData] = useState<DeskSnapshot | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [stack, setStack] = useState<Sheet[]>([]);
  const [line, setLine] = useState('');
  const [audienceDrafts,setAudienceDrafts]=useState<Record<string,CounterDraft[]>>({});
  const [preview, setPreview] = useState<DeskReply['preview']>();
  const [busy, setBusy] = useState(false);
  const [filed, setFiled] = useState<Set<string>>(new Set());
  const [read, setRead] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [trayFilters,setTrayFilters]=useState<TrayFilters>({...clearFilters});
  const [settings, setSettings] = useSettings();
  const { muted, plain, speed } = settings;
  const [destination, setDestination] = useState('');
  const [playback, setPlayback] = useState<{ turn: DeskTurn; index: number } | null>(null);
  const [heldMap, setHeldMap] = useState<DeskSnapshot | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const room = useRef<HTMLDivElement>(null);
  const [paperPoint,setPaperPoint]=useState<Point|null>(null);
  const locate=useCallback((p:Point|null)=>setPaperPoint(old=>old&&p&&Math.abs(old[0]-p[0])<.5&&Math.abs(old[1]-p[1])<.5?old:p),[]);
  const ambient = useRef<HTMLAudioElement | null>(null);
  const effects = useRef<Set<HTMLAudioElement>>(new Set());
  const lock = useRef(false);
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)')).current;

  const load = useCallback(() => { setError(''); deskApi.snapshot().then(setData).catch(() => setError(S.connection)); }, []);
  useEffect(load, [load]);
  const sound = useCallback((name: string) => {
    if (muted) return;
    const audio = new Audio(`/art/app/sound/${name}-v1.wav`);
    audio.volume = .45; effects.current.add(audio);
    audio.onended = () => effects.current.delete(audio);
    void audio.play().catch(() => effects.current.delete(audio));
  }, [muted]);
  useEffect(() => {
    if (muted) {
      ambient.current?.pause();
      for (const audio of effects.current) audio.pause();
      effects.current.clear();
    } else {
      ambient.current ??= new Audio('/art/app/sound/room-tone.wav');
      ambient.current.loop = true; ambient.current.volume = .12;
      void ambient.current.play().catch(() => {});
    }
    return () => ambient.current?.pause();
  }, [muted]);
  const frames=playback?dayFrames(playback.turn):[];
  const frame=playback?frames[playback.index]:undefined;
  useEffect(() => {
    if (!playback || playback.index >= frames.length - 1) return;
    if (reduced.matches || speed === 'instant') { setPlayback(p => p && ({ ...p, index: frames.length - 1 })); return; }
    const timer = window.setTimeout(() => {
      setPlayback(p => p && ({ ...p, index: Math.min(p.index + 1, frames.length - 1) })); sound('calendar-page');
    }, frame?.phase==='mark'?(speed==='slow'?1800:1000):150);
    return () => window.clearTimeout(timer);
  }, [playback, speed, reduced, sound]);

  const open = useCallback((panel: Panel) => {
    if(panel==='map'){setStack([]);requestAnimationFrame(()=>document.querySelector<HTMLElement>('.pixi-map')?.focus());return;}
    opener.current = document.activeElement as HTMLElement;
    setStack([{ panel }]); setNotice(''); setError(''); setPreview(undefined);
    sound(sounds[panel] ?? 'paper-draw');
  }, [sound]);
  const paper = useCallback((report: ReportView) => {
    setRead(previous => new Set(previous).add(report.id));
    setStack(previous=>[...(previous.at(-1)?.panel==='inbox'&&!previous.at(-1)?.paper?previous:[{panel:'inbox' as const}]),{panel:'inbox',paper:report}]); sound(report.route === 'wire' ? 'sounder-wire' : 'paper-draw');
  }, [sound]);
  const back = useCallback(() => {
    setStack(previous => previous.slice(0, -1)); setError(''); setNotice(''); sound('paper-down');
    // Papers can go back while the already-returned days continue to play.
    requestAnimationFrame(()=>{const target=opener.current?.isConnected?opener.current:document.querySelector<HTMLElement>('.tray-stack.inbox');target?.focus();});
  }, [sound]);

  useEffect(() => {
    if(stack.at(-1)?.paper||stack.at(-1)?.summary)requestAnimationFrame(()=>document.querySelector<HTMLElement>('.return-paper')?.focus());
    if (stack.at(-1)?.panel === 'map') document.querySelector<HTMLElement>('dialog[open] .pixi-map')?.focus();
    if (stack.at(-1)?.panel === 'find') document.querySelector<HTMLInputElement>('dialog[open] .panel-body input')?.focus();
  }, [stack]);

  const skipDays = () => setPlayback(p => p && ({ ...p, index: dayFrames(p.turn).length - 1 }));
  const nextUnread = () => {
    const next = data?.morning.view.reports.find(r => !read.has(r.id) && !filed.has(r.id));
    if (next) { if (!stack.length) opener.current = document.activeElement as HTMLElement; setStack([{ panel: 'inbox' }]); paper(next); }
    else open('inbox');
  };
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || isTyping(event.target) || event.altKey || event.metaKey || event.repeat) return;
      const key = event.key.toLowerCase();
      if (event.ctrlKey) {
        if (key === 'g') { event.preventDefault(); open('find'); }
        else if (key === 'enter') {
          event.preventDefault();
          const send = document.querySelector<HTMLButtonElement>('dialog[open] [data-hotkey="run"]');
          if (send && !send.disabled) send.click(); else if (!playback) open('run');
        }
        return;
      }
      if (event.code === 'Space') { event.preventDefault(); if (playback) skipDays(); else nextUnread(); return; }
      if(key==='escape'&&(stack.at(-1)?.paper||stack.at(-1)?.summary||stack.at(-1)?.panel==='plans')){event.preventDefault();back();return;}
      if (key === '?') { event.preventDefault(); open('help'); return; }
      if (['arrowup', 'arrowdown', 'k', 'j'].includes(key)) {
        const dialog = document.querySelector('dialog[open]');
        const links = [...(dialog?.querySelectorAll<HTMLButtonElement>('[data-testid="paper-link"]') ?? [])];
        if (links.length) {
          event.preventDefault(); const index = links.indexOf(document.activeElement as HTMLButtonElement);
          links[Math.max(0, Math.min(links.length - 1, index + (['arrowup','k'].includes(key) ? -1 : 1)))]?.focus();
        }
        return;
      }
      const action = document.querySelector('.table-paper')??document.querySelector('.map-plan-sheet')??document.querySelector('dialog[open]');
      const context = (event.target instanceof Element ? event.target.closest('.situation') : null) ?? action;
      const button = ["f","r","i","a","n","s"].includes(key) ? context?.querySelector<HTMLButtonElement>(`[data-hotkey="${key}"]:not(:disabled)`) : null;
      if (button) { event.preventDefault(); button.click(); return; }
      const panels: Record<string, Panel> = { d: 'docket', b: 'board', l: 'ledger', m: 'map', g: 'file' };
      if (panels[key]) { event.preventDefault(); open(panels[key]); }
    };
    window.addEventListener('keydown', keyboard); return () => window.removeEventListener('keydown', keyboard);
  });

  async function execute(command: string): Promise<DeskReply | undefined> {
    if (!data || lock.current || data.closed || playback) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const result = await deskApi.command(command, data.morning.requestDay);
      setData(result.snapshot);
      if (!result.ok) { setError(result.message ?? S.error); return result; }
      if (result.preview) { setPreview(result.preview); setNotice(S.previewReady); sound('paper-draw'); }
      else if (result.turn) {
        setHeldMap(data);
        setPlayback({ turn: result.turn, index: reduced.matches || speed === 'instant' ? dayFrames(result.turn).length - 1 : 0 });
        setStack([]); sound('clock-day');
      } else {
        const word = command.trim().split(/\s+/)[0];
        const looks: Record<string, Panel> = { inbox: 'inbox', posts: 'board', situations: 'docket', plans: 'plans', enemy: 'plans', queue: 'outbox', help: 'help' };
        if (word && looks[word]) setStack(previous => [...previous, { panel: looks[word]! }]);
        else if (word !== 'quit') { setNotice(word === 'cancel' ? S.recalled : S.queued); sound(word === 'cancel' ? 'paper-down' : 'pen-sign'); }
      }
      return result;
    } catch { setError(S.connection); }
    finally { lock.current = false; setBusy(false); }
  }

  if (!data) return <main className="opening"><p className="eyebrow">{S.title}</p><h1>{error || S.loading}</h1>{error && <button onClick={load}>{S.retry}</button>}</main>;
  const menu = data.morning.menu as PrincipalMenu;
  const tableData=playback&&heldMap?playbackSnapshot(heldMap,data,frames,playback.index):data;
  const reports = tableData.morning.view.reports;
  const active = data.morning.view.situations.filter(s => s.status === 'open' || s.status === 'waiting');
  const { name: t, text: display } = presenter(data.strings);
  const current = stack.at(-1);
  const date = frame?.day.date ?? data.date;
  const planOpen=!!current&&['plans','map'].includes(current.panel)&&menu.reviews.length>0&&!current.paper;
  const onTable=!!current?.paper||!!current?.summary||planOpen;
  const modalDepth=onTable?0:stack.length;
  const order = (text: string) => { if(!stack.length)opener.current=document.activeElement as HTMLElement;setLine(text); setPreview(undefined); setNotice(''); setStack(previous => [...previous, { panel: 'orders' }]); };
  const audience=(post:string)=>{setStack(previous=>[...previous,{panel:'board',audience:post}]);setNotice('');setError('');sound('door-audience');};
  const sourcePaper=(report:ReportView)=>{setRead(previous=>new Set(previous).add(report.id));setStack(previous=>[...previous,{panel:'inbox',paper:report}]);sound('paper-draw');};
  const count = (id: Panel) => id === 'inbox' ? reports.filter(r => !read.has(r.id)).length : id === 'outbox' ? data.queue.length : id === 'docket' ? active.length : null;
  const paperList = (items: readonly ReportView[]) => items.length ? <div className="paper-list">{[...items].reverse().map(r => <button data-testid="paper-link" className={`paper-link ${read.has(r.id) ? 'read' : ''}`} key={r.id} onClick={() => paper(r)}>
    <span className="eyebrow">{S.genres[r.type] ?? r.type}<span>{S.day} {r.receivedDay}</span></span><strong>{t(r.author, 'person')}</strong><span>{t(r.subjectId, r.subjectKind)}</span><span className="route-line">{r.route}, {S.written} {r.day}{r.hour !== null ? `, ${r.hour}:00` : ''}</span>
  </button>)}</div> : <p className="empty">{S.noPapers}</p>;

  function content(): ReactNode {
    if (!current) return null;
    if(current.summary)return <WeeklyPaper data={tableData} openPaper={paper}/>;
    if (current.paper) return <><Paper report={current.paper} text={data!.paperText[current.paper.id] ?? ''} t={t} dateOf={day => dateForReport(data!, day)} plain={plain} display={display} />
      <div className="actions"><button data-hotkey="f" onClick={() => { setFiled(previous => new Set(previous).add(current.paper!.id)); sound('stamp'); back(); }}>{S.filePaper}</button>
        {current.paper.authorPost && <button data-hotkey="i" onClick={() => order(`inquire ${current.paper!.authorPost}`)}>{S.ask}</button>}</div></>;
    if(current.audience){const key=`${data!.morning.requestKey}:${menu.commandable.find(p=>p.post===current.audience)?.holder??''}:${current.audience}`;return <AudienceScene key={key} request={data!.morning} strings={data!.strings} post={current.audience} busy={busy||!!playback||data!.closed} queue={data!.queue} execute={execute} openPaper={sourcePaper} draft={audienceDrafts[key]??[]} setDraft={value=>setAudienceDrafts(old=>({...old,[key]:value}))}/>;}
    if(current.post||current.person)return <PostDetails key={current.post??current.person!.post} request={data!.morning} strings={data!.strings} post={current.post??current.person!.post} order={order} openAudience={audience} openPaper={sourcePaper}/>;
    switch (current.panel) {
      case 'find': return <Find data={data!} region={id => { setDestination(id); open('map'); }} person={person => setStack(previous => [...previous, { panel: 'board', person }])}/>;
      case 'calendar': return <div className="calendar-sheet"><p className="large-date">{date}</p><p>{S.day} {data!.morning.requestDay}</p><p>{menu.atWarSince === null ? S.atPeace : S.atWar}</p></div>;
      case 'attention': return <><h3>{data!.morning.view.attention ?? S.unknown} {S.remaining}</h3><p>{S.attentionNote}</p></>;
      case 'inbox': return <InTray data={tableData} papers={reports.filter(r=>!filed.has(r.id))} read={read} filters={trayFilters} setFilters={setTrayFilters} openSummary={()=>setStack(previous=>[...previous,{panel:'inbox',summary:true}])}>{paperList}</InTray>;
      case 'file': return <><label className="search">{S.search}<input value={query} onChange={e => setQuery(e.target.value)} /></label>{paperList(reports.filter(r => filed.has(r.id) && `${t(r.author, 'person')} ${t(r.subjectId, r.subjectKind)} ${dateForReport(data!, r.day)} ${r.day}`.toLowerCase().includes(query.toLowerCase())))}</>;
      case 'outbox': return <><p className="margin-note">{S.outboxNote}</p>{data!.queue.length ? <ol className="order-list">{data!.queue.map((q, i) => <li key={`${i}:${q.line}`}><p>{display(q.text)}</p><code>{display(q.line)}</code><button disabled={busy} onClick={() => void execute(`cancel ${i + 1}`)}>{S.cancel}</button></li>)}</ol> : <p className="empty">{S.noQueue}</p>}<button onClick={() => order('')}>{S.orders}</button></>;
      case 'board': return <OrgBoard request={data!.morning} strings={data!.strings} openPost={post=>{setStack(previous=>[...previous,{panel:'board',post}]);sound('pin');}}/>;
      case 'docket': return <><p className="margin-note">{S.docketNote}</p>{active.length ? active.map(s => <Situation key={s.id} situation={s} menu={menu} t={t} execute={execute} order={order} busy={busy} />) : <p className="empty">{S.noSituations}</p>}</>;
      case 'plans': if(menu.reviews.length)return <MapReview destination={destination} data={data!} execute={execute} busy={busy} textEdit={order}/>;
        return <><button className="primary" onClick={() => setStack(previous => [...previous, { panel: 'map' }])}>{M.review}</button><h3>{S.submitted}</h3>{menu.reviews.length ? menu.reviews.map(r => <section className="plan-card" key={r.post}><p className="eyebrow">{t(r.holder, 'person')}, {t(r.post, 'post')}</p><Plan plan={r.plan} t={t} display={display} /><div className="actions">
        <button disabled={busy} onClick={() => void execute(`approve ${r.post}`)}>{S.approve}</button><button disabled={busy} onClick={() => void execute(`sendback ${r.post}`)}>{S.sendback}</button><button onClick={() => order(`edit ${r.post} timing days=3`)}>{S.edit}</button></div></section>) : <p>{S.noPlans}</p>}
        {menu.awaiting.map(post => <p key={post}>{t(post, 'post')}, {S.awaiting} <button disabled={busy} onClick={() => void execute(`go ${post}`)}>{S.go}</button></p>)}<Enemy data={data!} t={t} /></>;
      case 'map': return <MapReview destination={destination} data={data!} execute={execute} busy={busy} textEdit={order}/>;
      case 'orders': return <><OrderSheet menu={menu} t={t} line={line} setLine={value => { setLine(value); setPreview(undefined); }} help={data!.help} execute={execute} busy={busy} display={display} commandDisplay={presenter(data!.strings).commandDisplay} commandInput={presenter(data!.strings).commandInput} />
        {preview && <section className="preview"><h3>{S.asSubmitted}</h3>{menu.reviews.find(r => r.post === line.split(/\s+/)[1]) && <Plan plan={menu.reviews.find(r => r.post === line.split(/\s+/)[1])!.plan} t={t} display={display} />}<h3>{S.asEdited}</h3><p>{S.previewNote}</p>{preview.ok ? <Plan plan={preview.plan} t={t} display={display} /> : <p role="alert">{display(preview.reason)}</p>}</section>}</>;
      case 'ledger': return <><p className="margin-note">{S.ledgerNote}</p>{paperList(reports.filter(r => ['strength-return', 'casualty-return', 'effective-strength', 'enemy-estimate'].includes(r.type)))}</>;
      case 'daybook': return <><p className="margin-note">{S.readOnly}</p>{data!.history.length ? data!.history.map((turn, i) => <section className="day-record" key={i}><h3>{S.turn} {i + 1}</h3>{turn.days.map(day => <section key={day.day}><h4>{day.date}, {S.day} {day.day}</h4>{day.refused.map((r, n) => <p className="refusal" key={n}>{S.refused}: {display(JSON.stringify(r.command))}, {display(r.reason)}</p>)}{paperList(day.reports)}{day.points.length > 0 && <p>{S.stopped}: {display(day.points.join(', '))}</p>}</section>)}</section>) : <p className="empty">{S.noDays}</p>}</>;
      case 'run': {
        const lastTurn = data!.history.at(-1);
        return <><p className="margin-note">{S.runNote}</p>{lastTurn && <p className="stop-slip">{S.stopped}: {lastTurn.stopped === 'week' ? S.week : display(lastTurn.stopped.join(', '))}</p>}<h3>{data!.queue.length} {S.signedCount}</h3>{data!.queue.map((q, i) => <p key={i}>{display(q.text)}</p>)}<button data-hotkey="run" className="primary" disabled={busy} onClick={() => void execute('end')}>{S.sendRun}</button></>;
      }
      case 'help': return <><p>{S.typingNote}</p><table className="key-card"><tbody>{S.keys.map(([key, action]) => <tr key={key}><th scope="row"><kbd>{key}</kbd></th><td>{action}</td></tr>)}</tbody></table>
        <button onClick={() => open('find')}>{S.find}</button><button onClick={nextUnread}>{S.nextUnread}</button>
        <div className="settings"><label className="scale-setting">{S.textSize} <output>{settings.scale}%</output><input type="range" aria-label={S.textSize} min="80" max="200" step="1" value={settings.scale} onChange={e => setSettings(old => ({ ...old, scale: Number(e.target.value) }))}/></label>
        <label className="scale-setting">{S.mapTextSize} <output>{settings.mapScale}%</output><input type="range" aria-label={S.mapTextSize} min="80" max="200" step="1" value={settings.mapScale} onChange={e => setSettings(old => ({ ...old, mapScale: Number(e.target.value) }))}/></label>
        {(['contrast', 'lamp', 'plain'] as const).map(key => <label key={key}><input type="checkbox" checked={settings[key]} onChange={e => setSettings(old => ({ ...old, [key]: e.target.checked }))}/>{S[key]}</label>)}
        <label>{S.motion}<select value={speed} onChange={e => setSettings(old => ({ ...old, speed: e.target.value }))}><option value="brisk">{S.brisk}</option><option value="slow">{S.slow}</option><option value="instant">{S.instant}</option></select></label></div><p>{S.helpNote}</p><ul className="grammar">{data!.help.map((text, i) => <li key={i}>{display(text)}</li>)}</ul><button onClick={() => void execute('quit')}>{S.quit}</button></>;
    }
  }

  return <SettingsContext.Provider value={settings}><div className={`app table-app ${current?.audience?'audience-open':''} ${plain ? 'plain' : ''} ${settings.scale > 140 ? 'large-type' : ''} ${settings.contrast ? 'high-contrast' : ''} ${settings.lamp ? 'evening-lamp' : ''}`} style={{ '--text-scale': settings.scale / 100 } as CSSProperties}>
    <div ref={room} data-testid="desk" className="desk-shell table-shell" inert={modalDepth>0}>
      <main className="playable-table" aria-label={S.subtitle}>
        <MapReview data={tableData} destination={destination} execute={execute} busy={busy} textEdit={order} table reviewOpen={planOpen} mapProps={{
          focusPaper:current?.paper?{id:current.paper.id,region:reportPlace(current.paper)}:undefined,
          arrival:frame?.phase==='mark'&&frame.report?{id:frame.report.id,region:reportPlace(frame.report),text:`${t(frame.report.author,'person')}, ${dateForReport(data,frame.report.day)}`} : undefined,
          onLocate:locate,
          holderCard:mark=>{const person=menu.commandable.find(p=>p.post===mark.post),report=reports.find(r=>r.id===mark.source);return <><h2>{t(person?.holder??mark.author,'person')}</h2><p>{t(mark.post??'', 'post')}</p><h3>{S.lastReport}</h3><time>{dateForReport(data,mark.day)}</time><p>{display(report?data.paperText[report.id]??'':S.unknown)}</p><div className="actions">{person&&<><button onClick={()=>{opener.current=document.activeElement as HTMLElement;setStack([{panel:'board',person}]);}}>{S.personPage}</button><button onClick={()=>order(`order ${person.post} hold`)}>{S.orders}</button></>}</div></>;}
        }}/>
        <div className="table-calendar"><button onClick={()=>open('calendar')} aria-label={S.calendar}><time>{date}</time><small>{menu.atWarSince===null?S.atPeace:S.atWar}</small></button><button onClick={()=>open('attention')} aria-label={S.attention}><span>{S.attention}</span><strong>{tableData.morning.view.attention??S.unknown}</strong></button></div>
        <div className="table-trays">{(['inbox','outbox'] as const).map(id=><button key={id} className={`tray-stack ${id}`} onClick={()=>open(id)} aria-label={`${S[id]} ${count(id)}`}><img src={art(objects[id]!)} alt=""/><span>{S[id]} <b>{count(id)}</b></span><small>{id==='inbox'?S.freshCount:S.signedCount}</small></button>)}</div>
        <nav className="table-books" aria-label={S.deskObjects}>{(['board','ledger','file','daybook','plans','orders','help'] as const).map(id=><button key={id} onClick={()=>open(id)}>{objects[id]&&<img src={art(objects[id]!)} alt=""/>}<span>{S[id]}</span></button>)}<button aria-pressed={!muted} onClick={()=>setSettings(old=>({...old,muted:!old.muted}))}>{muted?S.soundOn:S.mute}</button></nav>
        <section className="table-docket" aria-label={S.docket}><button onClick={()=>open('docket')}>{S.docket} {active.length}</button><div>{active.length?active.map(s=><button className="docket-card" key={s.id} onClick={()=>open('docket')}><strong>{t(s.title)}</strong><small>{S.beforeSince} {s.surfacedDay}</small></button>):<span>{S.noDocket}</span>}</div></section>
        {!playback&&<button className="table-run" onClick={()=>open('run')}>{S.run}</button>}
        {playback&&<section className="table-playback" data-testid="turn-playback" aria-live="polite"><time>{date}</time><p>{frame?.report?`${t(frame.report.author,'person')}, ${S.genres[frame.report.type]??S.paper}`:S.noReports}</p>{frame?.day.refused.map((r,i)=><p className="refusal" key={i}>{S.refused}: {display(r.reason)}</p>)}
          {playback.index===frames.length-1?<><p>{S.stopped}: {playback.turn.stopped==='week'?S.week:display(playback.turn.stopped.join(', '))}</p><button onClick={()=>{setPlayback(null);setHeldMap(null);}}>{S.nextMorning}</button></>:<><button onClick={skipDays}>{S.skipDays}</button><button onClick={()=>setPlayback(p=>{if(!p)return p;const next=frames.findIndex((f,i)=>i>p.index&&f.day.day!==frames[p.index]?.day.day);return {...p,index:next<0?frames.length-1:next};})}>{S.nextDay}</button></>}
        </section>}
        {(current?.paper||current?.summary)&&<section className="table-paper" data-testid="paper-on-map" role="region" aria-label={S.paper} style={paperPoint?{left:Math.max(24,Math.min(window.innerWidth-Math.min(680*settings.scale/100,window.innerWidth*.43)-24,paperPoint[0]-Math.min(680*settings.scale/100,window.innerWidth*.43)-45)),top:Math.max(150,Math.min(window.innerHeight-650,paperPoint[1]-220))}:undefined} onKeyDown={e=>{if(e.key==='Escape'&&!isTyping(e.target)){e.preventDefault();e.stopPropagation();back();}}}><button autoFocus className="return-paper" onClick={back}>{stack.at(-2)?.panel==='board'?S.back:S.returnPaper}</button>{content()}</section>}
        {planOpen&&<button className="close-review" onClick={back}>{S.closeReview}</button>}
      </main>
      {data.closed&&<div className="ended" role="status">{S.ended}</div>}
    </div>
    <Modal depth={modalDepth} title={current?.audience?S.audienceTitle:current?.post?t(current.post,'post'):current?.person?t(current.person.holder,'person'):current?S[current.panel]:''} back={back} opener={opener.current} reading={false} kind={current?.audience?'audience':current?.panel}>
      <div className="feedback" aria-live="polite">{notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{display(error)}</p>}{data.closed&&<p>{S.ended}</p>}</div>{!onTable&&content()}
    </Modal>
  </div></SettingsContext.Provider>;

}

function dateForReport(data: DeskSnapshot, day: number): string {
  // Calendar derivation uses the exposed morning date and day, never kernel calendar/world.
  const morning = new Date(data.date + 'T12:00:00Z');
  if (!Number.isFinite(morning.valueOf())) return `${S.day} ${day}`;
  morning.setUTCDate(morning.getUTCDate() + day - data.morning.requestDay);
  return morning.toISOString().slice(0, 10);
}

export function Paper({ report: r, text, t, dateOf, plain, display }: { display: (text: string) => string; report: ReportView; text: string; t: (key: string, kind?: string | number) => string; dateOf: (day: number) => string; plain: boolean }) {
  const stock = r.type === 'press' ? 'newsprint' : r.type === 'wire-dispatch' ? 'telegraph' : ['strength-return', 'casualty-return', 'effective-strength'].includes(r.type) ? 'printed' : 'letter';
  const stories=pressStories(r,t);
  return <article data-testid="paper" className={`paper stock-${stock} ${plain ? 'typeset' : ''}`}>
    <header className={`paper-header ${stock === 'telegraph' || stock === 'newsprint' ? 'decorated-header' : ''}`}>
      {(stock === 'telegraph' || stock === 'newsprint') && <span aria-hidden="true" className={`document-decoration document-head ${stock === 'telegraph' ? 'telegraph-head' : 'press-head'}`} />}
      <span className="eyebrow">{S.genres[r.type] ?? r.type}{r.subtype ? `, ${display(r.subtype)}` : ''}</span><h3>{t(r.authorPost ?? r.author, r.authorPost ? 'post' : 'person')}</h3>
      {stock !== 'newsprint' && stock !== 'telegraph' && <div aria-hidden="true" className="rule document-decoration" />}
    </header>
    <dl className="paper-meta"><div><dt>{S.from}</dt><dd>{t(r.author, 'person')}</dd></div><div><dt>{S.written}</dt><dd>{dateOf(r.day)}{r.hour !== null ? `, ${String(r.hour).padStart(2, '0')}:00` : ''}</dd></div><div><dt>{S.route}</dt><dd>{r.route}{r.via.length ? `, ${S.via} ${r.via.map(id => t(id, 'post')).join(' → ')}` : ''}</dd></div><div><dt>{S.subject}</dt><dd>{r.subjectKind}, {t(r.subjectId, r.subjectKind)}</dd></div></dl>
    <div className="paper-copy">{r.type==='press' ? (stories.length?stories.map((story,i)=><section key={i}><h3>{story.headline}</h3><p>{story.body}</p></section>):<p>{t('press.empty')}</p>) : text.split('; ').map((paragraph, i) => <p key={i}>{display(paragraph)}</p>)}</div><footer><p className="signature">{t(r.author, 'person')}</p><span className="received-stamp">{S.stamp}<small>{dateOf(r.receivedDay)}, {r.route}</small></span></footer>
  </article>;
}

export function Situation({ situation: s, menu, t, execute, order, busy }: { situation: SituationView; menu: PrincipalMenu; t: (key: string, kind?: string | number) => string; execute: (line: string) => Promise<unknown>; order: (line: string) => void; busy: boolean }) {
  const [referring, setReferring] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const choice = menu.situations.find(c => c.situation === s.id);
  return <section className="situation"><p className="eyebrow">{s.status}, {S.beforeSince} {s.surfacedDay}</p><h3>{t(s.title)}</h3><p>{t(s.text)}</p>{s.staffAbsence === 'no-adviser-on-record' && <p>{S.noStaffRecommendation}</p>}{s.staffAuthor && <p>{S.staff}: {t(s.staffAuthor, 'person')}</p>}
    <fieldset disabled={busy || !choice}><legend>{S.selection}</legend>{s.options.filter(o => choice?.options.some(c => c.optionId === o.id)).map(o => <label className="situation-option" key={o.id}><input type="checkbox" checked={selected.includes(o.id)} onChange={e => setSelected(old => e.target.checked ? [...old, o.id] : old.filter(id => id !== o.id))} /><span>{t(o.label)}<small>{o.proposedBy === 'inaction' ? S.takeCourse : Array.isArray(o.proposedBy) ? `${S.advisers}: ${o.proposedBy.map(id => t(id, 'person')).join(', ')}` : ''}</small></span></label>)}</fieldset>
    <div className="actions"><button disabled={busy || !choice || !selected.length} onClick={() => void execute(`decide ${s.id} ${selected.join(' ')}`)}>{S.signDecision}</button><button disabled={busy || !choice} onClick={() => void execute(`decide ${s.id}`)}>{S.takeCourse}</button><button disabled={!choice} onClick={() => order(`consult ${s.id} `)}>{S.consult}</button>{!!choice?.delegableTo.length && <button data-hotkey="r" onClick={() => setReferring(value => !value)}>{S.referDecision}</button>}{referring && choice?.delegableTo.map(post => <button disabled={busy} key={post} onClick={() => void execute(`delegate ${s.id} ${post}`)}>{S.refer} {t(post, 'post')}</button>)}</div>
  </section>;
}

function Plan({ plan, t, display }: { display: (text: string) => string; plan: OptionView; t: (key: string, kind?: string | number) => string }) {
  return <div className="plan"><h4>{display(plan.method)} / {display(plan.variant)}</h4><p>{S.expectedEnemy}: {plan.perceivedEnemy}</p>{plan.axes.map(axis => <section key={axis.name}><h4>{S.axis} {display(axis.name)}, {t(axis.post, 'post')}</h4><p>{display(axis.mode)}, {axis.strength} {S.strength}</p><p className="plan-route">{axis.regions.map(id => t(id, 'region')).join(' → ')}</p><p>{S.arrives}: {Math.ceil(axis.arrival / 1000)}, {display(axis.phases.join(', '))}</p></section>)}{plan.requests.length > 0 && <p>{S.requests}: {display(plan.requests.join(', '))}</p>}{plan.conditions.length > 0 && <p>{S.conditions}: {display(plan.conditions.join(', '))}</p>}</div>;
}
function Enemy({ data, t }: { data: DeskSnapshot; t: (key: string, kind?: string | number) => string }) {
  const beliefs = Object.entries(data.morning.view.enemyBeliefs).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return <section className="enemy"><h3>{S.enemy}</h3>{beliefs.length ? <dl>{beliefs.map(([region, b]) => { const source = data.morning.view.reports.find(r => r.id === b.source); return <div key={region}><dt>{t(region, 'region')}</dt><dd>{b.value===0?S.noEnemySeen:b.value}, {S.aboutDay} {b.asOfDay}<small>{source ? `${t(source.author, 'person')}, ${dateForReport(data, source.day)}` : `${S.source}: ${S.unknown}`}</small></dd></div>; })}</dl> : <p>{S.noEnemy}</p>}</section>;
}

function OrderSheet({ menu, t, line, setLine, help, execute, busy, display, commandDisplay, commandInput }: { commandDisplay: (line: string) => string; commandInput: (value: string, original: string) => string; display: (text: string) => string; menu: PrincipalMenu; t: (key: string, kind?: string | number) => string; line: string; setLine: (line: string) => void; help: readonly string[]; execute: (line: string) => Promise<unknown>; busy: boolean }) {
  const verb = line.trim().split(/\s+/)[0] ?? '';
  const post = line.trim().split(/\s+/)[1] ?? '';
  const who = menu.commandable.find(p => p.post === post);
  const isEdit = verb === 'edit' || verb === 'preview';
  return <form className="order-sheet" onSubmit={e => { e.preventDefault(); void execute(line); }}><p className="margin-note">{S.commandHelp}</p><div className="form-grid"><label>{S.chooseVerb}<select value={VERBS.includes(verb as typeof VERBS[number]) ? verb : ''} onChange={e => setLine(`${e.target.value} ${post}`)}><option value="">{S.otherOrders}</option>{VERBS.map(word => <option key={word}>{word}</option>)}</select></label><label>{S.choosePerson}<select value={post} onChange={e => { const parts = line.trim().split(/\s+/); parts[1] = e.target.value; setLine(parts.join(' ')); }}><option value="">{S.selection}</option>{menu.commandable.map(p => <option key={p.post} value={p.post}>{t(p.holder)}, {t(p.post)}</option>)}</select></label></div>
    {who && <p className="route-line">{S.through}: {who.relays.map(id => t(id, 'post')).join(' → ') || t(who.post, 'post')}<br />{who.routes.map(r => `${r.route}: ${r.typicalDays} ${S.typicalDays}, ${r.price} ${S.routePrice}`).join(' / ')}</p>}
    <label className="command-label">{S.command}<textarea aria-label={S.command} rows={3} spellCheck={false} value={commandDisplay(line)} onChange={e => setLine(commandInput(e.target.value, line))} /></label>
    <div className="grammar-hint">{help.filter(text => text.trim().startsWith(verb + ' ') || (isEdit && text.includes('<objective|waypoints|timing'))).map((text, i) => <p key={i}>{display(text)}</p>)}</div><div className="actions"><button data-hotkey="s" type="submit" className="primary" disabled={busy || !line.trim()}>{S.sign}</button>{isEdit && <button type="button" disabled={busy} onClick={() => void execute(line.replace(/^(edit|preview)\b/, 'preview'))}>{S.preview}</button>}</div>
  </form>;
}

