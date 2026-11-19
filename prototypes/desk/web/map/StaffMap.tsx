import { presenter } from '../presentation.ts';
import { placeMarks, placeCaptions, groupHeadquarters } from './placement.ts';
import { MERIDIAN_LABELS } from './graticule.ts';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { OptionView, SeatRequest } from '@mandate/kernel/seat-api';
import { deskApi } from '../adapter.ts';
import type { DeskReply, DeskSnapshot } from '../adapter.ts';
import { buildMapModel, editLine, markState, regionStep, reportDate } from './model.ts';
import type { MapEditKind, MapGeometry, MapMark, MapPlan, Point } from './model.ts';
import { StaffRenderer } from './renderer.ts';
import type { PencilRoute } from './renderer.ts';
import type { StudyMarks } from './renderer.ts';
import { LOOKS, LOOK_NAMES, readLook } from './skins.ts';
import { STUDY } from './study-strings.ts';
import { M } from './strings.ts';
import {glyphSvg} from './furniture.ts';
import {claimWords,controlColour,reportControlWords} from './control.ts';
import {CONTROL_PALETTES,CONTROL_PALETTE_IDS,readControlPalette} from './control-palettes.ts';
import { isTyping, SettingsContext } from '../settings.ts';
import { S } from '../strings.ts';
import hq from './icons/hq-army.svg?raw';
import enemy from './icons/enemy-point.svg?raw';
import works from './icons/entrenchment.svg?raw';
import battle from './icons/battle.svg?raw';
import pocket from './icons/pocket-ring.svg?raw';
import point from './icons/key-point.svg?raw';
import support from './icons/support-request.svg?raw';
import edit from './icons/edit-number.svg?raw';
import './map.css';

export interface PencilMark { number: number; line: string; post: string; axis: string; kind: MapEditKind; region?: string; plan: OptionView; day: number; author: string }
export interface Handle { axis: string; kind: 'objective' | 'waypoints'; region: string }

const glyphs: Record<MapMark['kind'], string> = { headquarters:hq, enemy, works, battle, pocket, situation:point, operation:point, goal:point };
const labels: Record<MapMark['kind'], string> = { headquarters:M.headquarters,enemy:M.enemy,works:M.works,battle:M.battle,pocket:M.pocket,situation:M.situation,operation:M.operation,goal:M.goal };
const cache = new Map<string,Promise<MapGeometry>>();
const EMPTY_MARKS: PencilMark[]=[];
const EMPTY_HANDLES: Handle[]=[];
const pencilNotebook=new Map<string,PencilMark[]>();
function loadGeometry(pack: string) { if(!cache.has(pack))cache.set(pack,deskApi.runtimeGeometry(pack));return cache.get(pack)!; }

export interface TableMapProps {
 focusPaper?:{id:string;region:string}; arrival?:{id:string;region:string;text:string};
 onLocate?:(point:Point|null)=>void; holderCard?:(mark:MapMark)=>ReactNode;
}
export function StaffMap({ request, pack, date, strings, destination="", reviewPost=null, marks=EMPTY_MARKS, onMark, handles=EMPTY_HANDLES, study, framing, focusPaper, arrival,onLocate,holderCard,approved=[],comparisonControl }: {
  request: SeatRequest; pack: string; date: string; strings: Readonly<Record<string,string>>;
  destination?: string; reviewPost?: string | null; marks?: PencilMark[]; onMark?: (axis: string, kind: MapEditKind, region?: string) => void; handles?: Handle[];
  study?: StudyMarks; framing?: 'eastern'|'manassas'|'hero'|'theatre';
  approved?:readonly MapPlan[];
  /** Isolated comparison route only, never installed in a playable request. */
  comparisonControl?:Pick<SeatRequest['view'],'controlBeliefs'|'claimedFronts'>;
}&TableMapProps) {
  const appearance=useContext(SettingsContext);
  const [rawGeometry,setGeometry]=useState<MapGeometry|null>(null);
  const nameSignature=JSON.stringify(strings);
  const geometry=useMemo(()=>rawGeometry?{...rawGeometry,regions:rawGeometry.regions.map(r=>({...r,name:presenter(strings).name(r.id,'region')}))}:null,[rawGeometry,nameSignature]);
  const [failed,setFailed]=useState(false),[text,setText]=useState(false),[tick,setTick]=useState(0);
  const [place,setPlace]=useState(''),[active,setActive]=useState<string|null>(null);
  const [candidates,setCandidates]=useState<Record<string,string>>({});
  const [selectedHQ,setSelectedHQ]=useState<string|null>(null);
  const [look,setLook]=useState(()=>readLook(window.location.search));
  const [palette,setPalette]=useState(()=>readControlPalette(window.location.search));
  const colours=CONTROL_PALETTES[palette].colours;
  const signs=new URLSearchParams(window.location.search).get('signs')==='on';
  const host=useRef<HTMLDivElement>(null),engine=useRef<StaffRenderer|null>(null);
  const twin=useRef<HTMLDivElement>(null),previousText=useRef(false);
  const {name:t,text:display}=presenter(strings);
  const dateOf=(day:number)=>reportDate(request.requestDay,date,day);
  const describeControl=(region:string)=>claimWords(t(region,'region'),(comparisonControl?.controlBeliefs??request.view.controlBeliefs)?.[region as keyof typeof request.view.controlBeliefs],t,dateOf);
  const model=useMemo(()=>{
    if(!geometry)return null;const result=buildMapModel(request,geometry);
    if(comparisonControl){result.control=comparisonControl.controlBeliefs;result.fronts=comparisonControl.claimedFronts;}
    result.plans.push(...approved.filter(p=>!result.plans.some(r=>r.post===p.post)));
    for(const plan of result.plans)if(approved.some(p=>p.post===plan.post&&p.source===plan.source))plan.approved=true;
    for(const m of result.marks)m.caption=t(m.kind==='headquarters'&&request.menu.menuKind==='principal'?request.menu.commandable.find(p=>p.post===m.post)?.holder??m.author:m.author,'person');
    return result;
  },[request,geometry,comparisonControl,JSON.stringify(approved)]);
  useEffect(()=>{let alive=true;setGeometry(null);setFailed(false);loadGeometry(pack).then(g=>{if(alive)setGeometry(g);}).catch(()=>{if(alive)setFailed(true);});return()=>{alive=false;};},[pack]);
  useEffect(()=>{if(text)twin.current?.focus();else if(previousText.current)host.current?.focus();previousText.current=text;},[text]);
  useEffect(()=>{
    if(!geometry || !host.current)return;
    const renderer=new StaffRenderer(host.current,geometry,()=>flushSync(()=>setTick(n=>n+1)));engine.current=renderer;
    renderer.setAppearance(appearance);
    renderer.setLook(look);renderer.setPalette(palette);renderer.setStudy(study??null);
    void renderer.init(!study&&!framing).then(()=>{if(framing==='hero')renderer.fitGeographic([-78.35,38.15,-76.72,39.4]);if(framing==='eastern')renderer.fitGeographic([-79.2,36.65,-75.35,39.65]);if(framing==='manassas'){renderer.closestManassas();}}).catch(error=>{console.error(error);setFailed(true);});
    return()=>{renderer.destroy();engine.current=null;};
  },[geometry]);
  useEffect(()=>{
    if(!model)return;
    const pencil:PencilRoute[]=marks.map(m=>({number:m.number,post:m.post,axis:m.axis,regions:m.plan.axes.find(a=>a.name===m.axis)?.regions??[],strike:m.kind==='remove_axis'}));
    engine.current?.setData(model,pencil,reviewPost);
  },[model,marks,reviewPost,tick===0]);
  useEffect(()=>{engine.current?.setAppearance(appearance);},[appearance,tick===0]);
  useEffect(()=>{engine.current?.setLook(look);},[look,tick===0]);
  useEffect(()=>{engine.current?.setPalette(palette);},[palette,tick===0]);
  useEffect(()=>{engine.current?.setCalendar(date);},[date,tick===0]);
  useEffect(()=>{if(!engine.current?.ready)return;if(framing==='hero')engine.current.fitGeographic([-78.35,38.15,-76.72,39.4]);if(framing==='eastern')engine.current.fitGeographic([-79.2,36.65,-75.35,39.65]);if(framing==='manassas')engine.current.closestManassas();},[framing]);
  const visited=useRef('');
  useEffect(()=>{if(destination&&engine.current?.ready&&visited.current!==destination){visited.current=destination;engine.current.focusRegion(destination);}},[destination,tick]);
  const revealed=useRef('');
  const focus=focusPaper??arrival;
  useEffect(()=>{if(focus?.region&&engine.current?.ready&&revealed.current!==focus.id){revealed.current=focus.id;engine.current.revealRegion(focus.region,!window.matchMedia('(prefers-reduced-motion: reduce)').matches);}},[focus?.id,tick]);
  useEffect(()=>{onLocate?.(focusPaper?.region?engine.current?.screen(focusPaper.region)??null:null);},[focusPaper?.id,tick]);
  const regions=geometry?.regions.filter(r=>r.point && !['off_map','sea','river'].includes(r.kind)).sort((a,b)=>a.name<b.name?-1:1)??[];
  const screen=(id:string):Point|null=>engine.current?.ready?engine.current.screen(id):null;
  const visible=(p:Point|null)=>!!p && !!host.current && p[0]>18 && p[0]<host.current.clientWidth-18 && p[1]>18 && p[1]<host.current.clientHeight-18;
  const position=(p:Point|null):CSSProperties=>({left:p?.[0]??-999,top:p?.[1]??-999});
  const act=(fn:(renderer:StaffRenderer)=>void)=>{const renderer=engine.current;if(renderer?.ready)fn(renderer);};
  const key=(e:KeyboardEvent)=>{
    if(isTyping(e.target)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='Escape'&&selectedHQ){e.preventDefault();e.stopPropagation();setSelectedHQ(null);host.current?.focus();return;}
    if(e.key.toLowerCase()==='v'){e.preventDefault();e.stopPropagation();setLook(old=>LOOKS[(LOOKS.indexOf(old)+1)%LOOKS.length]!);return;}
    if(e.key.toLowerCase()==='t'){e.preventDefault();e.stopPropagation();setText(v=>!v);return;}
    if(e.target!==host.current)return;
    const name:Record<string,string>={w:M.north,a:M.west,s:M.south,d:M.east,ArrowUp:M.north,ArrowLeft:M.west,ArrowDown:M.south,ArrowRight:M.east,'+':M.zoomIn,'=':M.zoomIn,'-':M.zoomOut,'0':M.fit};
    const label=name[e.key]??name[e.key.toLowerCase()];
    if(label){e.preventDefault();e.stopPropagation();const buttons=host.current?.closest('.staff-map')?.querySelectorAll<HTMLButtonElement>('.map-tools button');[...(buttons??[])].find(b=>(b.getAttribute('aria-label')??b.textContent)===label)?.click();}
  };
  const handleKey=(e:KeyboardEvent<HTMLButtonElement>,handle:Handle)=>{
    const id=`${display(handle.axis)}:${handle.kind}`,current=candidates[id]??handle.region;
    if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(e.key)) {
      e.preventDefault();e.stopPropagation();const next=regionStep(regions,current,['ArrowUp','ArrowLeft'].includes(e.key)?-1:1);
      setCandidates(old=>({...old,[id]:next}));setPlace(next);act(r=>r.focusRegion(next,Math.max(2,r.camera.z/r.camera.fit)));
    } else if(e.key==='Enter') {e.preventDefault();onMark?.(handle.axis,handle.kind,current);setCandidates(old=>({...old,[id]:handle.region}));}
  };
  const drag=(event:ReactPointerEvent<HTMLButtonElement>,handle:Handle)=>{
    if(!onMark||event.button!==0)return;event.preventDefault();event.stopPropagation();event.currentTarget.focus();
    const button=event.currentTarget,id=`${display(handle.axis)}:${handle.kind}`;button.setPointerCapture(event.pointerId);
    let target:string|null=null;
    const move=(e:PointerEvent)=>{const rect=host.current!.getBoundingClientRect();target=engine.current?.pick(e.clientX-rect.left,e.clientY-rect.top)?.id??null;if(target)setCandidates(old=>({...old,[id]:target!}));};
    const finish=()=>{button.removeEventListener('pointermove',move);button.removeEventListener('pointerup',finish);button.removeEventListener('pointercancel',cancel);if(target)onMark(handle.axis,handle.kind,target);setCandidates(old=>({...old,[id]:handle.region}));};
    const cancel=()=>{button.removeEventListener('pointermove',move);button.removeEventListener('pointerup',finish);button.removeEventListener('pointercancel',cancel);setCandidates(old=>({...old,[id]:handle.region}));};
    button.addEventListener('pointermove',move);button.addEventListener('pointerup',finish,{once:true});button.addEventListener('pointercancel',cancel,{once:true});
  };
  const sourceLabel=(id:string)=>{const report=request.view.reports.find(r=>r.id===id);return report?S.genres[report.type]??S.paper:S.unknown;};
  const describe=(m:MapMark)=>`${labels[m.kind]}: ${m.kind==='headquarters'?t(m.post??m.region,m.post?'post':'region'):t(m.region,'region')}${m.value!==null?` (${m.value})`:''}. ${t(m.author,'person')}, ${dateOf(m.day)}. ${M.source}: ${sourceLabel(m.source)}.`;
  const routes= model?.plans.filter(p=>!reviewPost||p.post===reviewPost)??[];
  const placed=placeMarks(model?.marks??[],screen,host.current?.clientWidth??0,host.current?.clientHeight??0);
  const groups=groupHeadquarters(placed);
  const captions=placeCaptions(groups,host.current?.clientWidth??0,host.current?.clientHeight??0,[...(engine.current?.captionReservations??[]),...placed.map(({point:[x,y]})=>[x-20,y-20,x+20,y+20] as [number,number,number,number])]);
  const selected=placed.find(p=>p.mark.id===selectedHQ),paperPoint=focusPaper?.region?screen(focusPaper.region):null,arrivalPoint=arrival?.region?screen(arrival.region):null;
  const scaleBar=engine.current?.ready?engine.current.scaleBar():null;
  const degreeTicks=engine.current?.ready&&look==='A'?engine.current.degreeTicks():[];
  const frame=engine.current?.ready?engine.current.frameScreen():null;
  const frameStyle:CSSProperties|undefined=frame?{left:frame[0],top:frame[1],width:frame[2]-frame[0],height:frame[3]-frame[1]}:undefined;
  const overlayStyle:CSSProperties|undefined=frame?{clipPath:`inset(${frame[1]}px ${Math.max(0,(host.current?.clientWidth??0)-frame[2])}px ${Math.max(0,(host.current?.clientHeight??0)-frame[3])}px ${frame[0]}px)`}:undefined;

  return <section className={`staff-map ${reviewPost?'review-map':''} ${study?'comparison-map':''}`} data-look={look} data-palette={palette} style={{'--correction-colour':`#${colours.correction.toString(16).padStart(6,'0')}`} as CSSProperties} aria-label={M.title} onKeyDown={key} data-testid="staff-map">
    <header className="map-header"><span className="map-date">{date}</span><button aria-pressed={text} onClick={()=>setText(v=>!v)}>{text?M.mapView:M.textTwin} <kbd>T</kbd></button></header>
    <div className="map-tools" aria-label={M.map}>
      <button aria-label={M.zoomOut} onClick={()=>act(r=>r.zoom(.8))}>−</button><button aria-label={M.zoomIn} onClick={()=>act(r=>r.zoom(1.25))}>+</button><button onClick={()=>act(r=>r.fit())}>{M.fit}</button>{reviewPost&&<button onClick={()=>act(r=>r.fitPlan())}>{M.fitPlan}</button>}
      <button aria-label={M.west} onClick={()=>act(r=>r.pan(100,0))}>{M.west}</button><button aria-label={M.north} onClick={()=>act(r=>r.pan(0,100))}>{M.north}</button><button aria-label={M.south} onClick={()=>act(r=>r.pan(0,-100))}>{M.south}</button><button aria-label={M.east} onClick={()=>act(r=>r.pan(-100,0))}>{M.east}</button>
      <label><span className="sr-only">{M.places}</span><select aria-label={M.places} value={place} onChange={e=>setPlace(e.target.value)}><option value="">{M.places}</option>{regions.map(r=><option key={r.id} value={r.id}>{t(r.id,'region')}</option>)}</select></label><button disabled={!place} onClick={()=>act(r=>r.focusRegion(place))}>{M.go}</button>
      {pack==='union-1861'&&<button onClick={()=>act(r=>r.focusRegion('culpeper_orange',5))}>{M.virginia}</button>}
      <label className="map-look"><span className="sr-only">Map look</span><select aria-label="Map look" value={palette==='strong'?look:`${look}:research`} onChange={e=>{const [id,p]=e.target.value.split(':');setLook(readLook(`?look=${id}`));setPalette(p==='research'?'research':'strong');}}>{CONTROL_PALETTE_IDS.map(p=><optgroup key={p} label={M.paletteNames[p]}>{LOOKS.map(id=><option key={id} title={LOOK_NAMES[id]} value={p==='strong'?id:`${id}:research`}>{M.lookNames[id]} ({M.paletteNames[p]})</option>)}</optgroup>)}</select></label>
    </div>
    <div className="map-drawing" hidden={text}>
      <div ref={host} className="pixi-map" tabIndex={0} aria-label={M.instructions} data-testid="map-canvas-host" />
      <div className="map-grain" aria-hidden="true" />
      {!geometry&&!failed&&<p className="map-message">{M.loading}</p>}
      {failed&&<p className="map-message" role="status">{M.missing}</p>}
      {geometry?.schematic&&<p className="schematic-note">{M.schematic}</p>}
      <div className="map-overlays" style={overlayStyle}>
        <svg className="correction-lines" aria-hidden="true">{placed.filter(p=>p.mark.corrects?.length).flatMap(p=>p.mark.corrects!.map(id=>{const earlier=placed.find(q=>q.mark.id===id);return earlier?<line key={`${p.mark.id}:${id}`} x1={earlier.point[0]-15} y1={earlier.point[1]+8} x2={earlier.point[0]+15} y2={earlier.point[1]-8}/>:null;}))}</svg>
        <svg className="mark-leaders" aria-hidden="true">{placed.filter(p=>p.point[0]!==p.anchor[0]||p.point[1]!==p.anchor[1]).map(p=><line key={p.mark.id} x1={p.anchor[0]} y1={p.anchor[1]} x2={p.point[0]} y2={p.point[1]}/>)}</svg>
        <svg className="caption-leaders" aria-hidden="true">{groups.filter(g=>(study||g.marks.some(m=>m.id===active))&&!g.marks.some(m=>m.id===selectedHQ)).map(g=>{const b=captions.get(g.mark.id);return b?<line key={g.mark.id} x1={g.anchor[0]} y1={g.anchor[1]} x2={Math.max(b[0],Math.min(b[2],g.anchor[0]))} y2={Math.max(b[1],Math.min(b[3],g.anchor[1]))}/>:null;})}</svg>
        {groups.filter(g=>(study||g.marks.some(m=>m.id===active))&&!g.marks.some(m=>m.id===selectedHQ)).map(g=>{const b=captions.get(g.mark.id);return b?<span key={g.mark.id} className="hq-caption" data-region={g.mark.region} style={{left:b[0],top:b[1],width:b[2]-b[0],height:b[3]-b[1],textAlign:b[2]<g.anchor[0]?'right':'left'}}>{g.marks.map(m=><span key={m.id}>{m.caption}<small>{dateOf(m.day)}</small></span>)}</span>:null;})}
        {placed.map(({mark,point:p})=>{const age=markState(request.requestDay,mark.day);return <button key={mark.id} data-report={mark.source} data-region={mark.region} className={`map-mark ${mark.sources>1?'ink':age.stage} ${mark.kind}`} style={{...position(p),'--mark-opacity':age.opacity,'--side-colour':`#${(mark.corrects?.length?colours.correction:controlColour(mark.kind==='enemy'?null:request.view.faction,request.view.faction,false,palette)).toString(16).padStart(6,'0')}`} as CSSProperties} aria-label={describe(mark)} onClick={()=>{if(mark.kind==='headquarters'&&holderCard)setSelectedHQ(mark.id);}} onPointerDown={e=>e.stopPropagation()} onFocus={()=>setActive(mark.id)} onBlur={()=>setActive(null)} onMouseEnter={()=>setActive(mark.id)} onMouseLeave={()=>setActive(null)}>
          <span aria-hidden="true" dangerouslySetInnerHTML={{__html:glyphs[mark.kind]}}/>{mark.kind!=='headquarters'&&<span className="mark-caption">{mark.caption}<small>{dateOf(mark.day)}</small></span>}
        </button>;})}
        {paperPoint&&<span className="paper-place" data-testid="paper-place" style={position(paperPoint)} aria-hidden="true"/>}
        {arrival&&<div key={arrival.id} data-report={arrival.id} data-testid="arrival-mark" data-region={arrival.region} className={`arrival-mark ${arrivalPoint?'located':'unlocated'}`} style={arrivalPoint?position(arrivalPoint):undefined}>{arrivalPoint&&<span aria-hidden="true">✎</span>}<p>{arrival.text}</p></div>}
        {selected&&holderCard&&<aside data-testid="holder-at-flag" className="holder-at-flag" style={{left:Math.max(20,Math.min((host.current?.clientWidth??0)-390,selected.point[0]+40)),top:Math.max(120,Math.min((host.current?.clientHeight??0)-420,selected.point[1]-60))}}><button className="card-close" onClick={()=>{setSelectedHQ(null);host.current?.closest('.staff-map')?.querySelector<HTMLElement>(`[data-report="${selected.mark.source}"]`)?.focus();}}>{S.closeCard}</button>{holderCard(selected.mark)}</aside>}
        {routes.flatMap(review=>review.plan.axes.filter(a=>a.regions.length>1).map((axis,i)=>{const p=screen(axis.regions[0]??'');return visible(p)?<span key={`${review.post}:${axis.name}`} className="axis-label" style={position(p)}>{M.axis} {display(axis.name)}<small>{t(review.holder,'person')}, {dateOf(review.day)}</small></span>:null;}))}
        {routes.flatMap(review=>review.plan.requests.map((request,i)=>{const post=request.split(':')[1];const hq=model?.marks.find(m=>m.kind==='headquarters'&&m.post===post);const p=hq?screen(hq.region):null;return visible(p)?<span className="support-label" key={`${review.post}:request:${i}`} style={position(p)}><span dangerouslySetInnerHTML={{__html:support}}/>{M.askedOf}: {t(post??request,'post')}</span>:null;}))}
        {handles.map(handle=>{const id=`${display(handle.axis)}:${handle.kind}`,candidate=candidates[id]??handle.region,p=screen(candidate);return visible(p)?<button data-testid={`handle-${handle.kind}-${handle.axis}`} key={id} className={`arrow-handle ${handle.kind}`} aria-label={`${handle.kind==='objective'?M.objectiveHandle:M.waypointHandle} ${display(handle.axis)}: ${geometry?.regions.find(r=>r.id===candidate)?.name??t(candidate,'region')}`} style={position(p)} onPointerDown={e=>drag(e,handle)} onKeyDown={e=>handleKey(e,handle)}><span aria-hidden="true">{handle.kind==='objective'?'◇':'○'}</span></button>:null;})}
        {marks.map(mark=>{const region=mark.region??routes.find(r=>r.post===mark.post)?.plan.axes.find(a=>a.name===mark.axis)?.regions.at(-1)??'';const p=screen(region.split(',').at(-1)!);return visible(p)?<span className="pencil-number" title={`${t(mark.author,'person')}, ${dateOf(mark.day)}: ${display(mark.line)}`} style={{...position(p),marginLeft:24+mark.number*16,marginTop:-22}} key={mark.number}><span dangerouslySetInnerHTML={{__html:edit}}/>{mark.number}</span>:null;})}
      </div>
      {look==='A'&&<svg className="map-degree-ticks" aria-hidden="true">{degreeTicks.map((t,i)=><g key={i}><line x1={t.x} y1={t.y} x2={t.x+(t.side==='left'?9:t.side==='right'?-9:0)} y2={t.y+(t.side==='top'?9:t.side==='bottom'?-9:0)}/><text x={t.x+(t.side==='left'?15:t.side==='right'?-15:0)} y={t.y+(t.side==='top'?23:t.side==='bottom'?-13:4)} textAnchor={t.side==='left'?'start':t.side==='right'?'end':'middle'}>{t.text}</text></g>)}</svg>}
      {look==='A'&&<><span className="map-meridian top">{MERIDIAN_LABELS.top}</span><span className="map-meridian bottom">{MERIDIAN_LABELS.bottom}</span></>}
      {look==='A'&&!study&&!comparisonControl&&<aside className={`map-cartouche${signs?' drawn-cartouche':''}`}>
        {signs&&<span className="cartouche-line" aria-hidden="true" dangerouslySetInnerHTML={{__html:glyphSvg('cartouche','map-title').replace('viewBox="-40 -32 80 64"','viewBox="-36 -24 72 48" preserveAspectRatio="none"')}}/>}
        <h3>{M.title}</h3><p>{STUDY.compiled}</p><time>{date}</time></aside>}
      {!study&&<aside className="control-legend" aria-label={M.controlLegend} data-testid="control-legend" style={{'--claim-blue':`#${colours.friendly.toString(16).padStart(6,'0')}`,'--claim-red':`#${colours.enemy.toString(16).padStart(6,'0')}`,'--claim-ochre':`#${colours.neutral.toString(16).padStart(6,'0')}`} as CSSProperties}>
        <ul>{(['union','enemy','neutral','contested','held','firm','single','old'] as const).map(kind=><li key={kind}><span className={`claim-swatch claim-${kind}`} aria-hidden="true">{kind==='contested'&&<svg viewBox="0 0 28 14"><path d="M0 0l14 14M10 0l14 14M20 0l8 8" stroke="var(--claim-blue)"/><path d="M0 14L14 0M10 14L24 0M20 14l8-8" stroke="var(--claim-red)"/></svg>}</span>{M.controlKey[kind]}</li>)}</ul><p className="wash-meaning">{M.washMeaning}</p>
      </aside>}
      {frame&&<div className="map-neatline" aria-hidden="true" style={frameStyle}/>}
      {active&&model&&<div className="map-note" role="status">{describe(model.marks.find(m=>m.id===active)!)}</div>}
      {!active&&engine.current?.hoveredRegion()&&<div className="map-note" data-testid="control-hover" role="status">{describeControl(engine.current.hoveredRegion()!.id)}</div>}
      <div className="map-scale drawn-scale" aria-hidden="true">
        <span className="north-rose" style={{transform:`rotate(${engine.current?.ready?engine.current.northAngle():0}deg)`}}><span dangerouslySetInnerHTML={{__html:glyphSvg('compass','map-north')}}/></span>
        {scaleBar?<><span className="decorated-bar" style={{width:scaleBar.pixels*1.6}} dangerouslySetInnerHTML={{__html:glyphSvg('scale','map-miles')}}/><b style={{width:scaleBar.pixels}}><span>0</span><span>{scaleBar.miles} {M.miles}</span></b></>:<><i/>{geometry?.schematic?'':M.miles}</>}
      </div>
    </div>
    {(text||failed)&&<div ref={twin} className="map-text" data-testid="map-text-twin" tabIndex={0}>
      {geometry&&<section><h3>{M.regionNames}</h3><ul>{geometry.regions.map(r=><li key={r.id}>{describeControl(r.id)}</li>)}</ul></section>}
      {model ? <><ul>{model.marks.map(m=><li key={m.id}>{describe(m)} {t(m.region,'region')}</li>)}</ul>{!model.marks.length&&<p>{M.noKnowledge}</p>}{model.plans.map(p=><section key={p.post}><h3>{t(p.holder,'person')}</h3><p>{M.written}: {dateOf(p.day)}. {M.source}: {sourceLabel(p.source)}</p>{p.plan.axes.map(a=><p key={a.name}>{M.axis} {display(a.name)}: {a.regions.map(id=>t(id,'region')).join(' → ')}</p>)}</section>)}<ul>{marks.map(m=><li key={m.number}>{m.number}. {display(m.line)}. {t(m.author,'person')}, {dateOf(m.day)}</li>)}</ul>{model.unplaced.length>0&&<details><summary>{M.unplaced}</summary><ul>{model.unplaced.map((u,i)=><li key={i}>{sourceLabel(u.source)}: {M.unplacedMessages[u.reason]}</li>)}</ul></details>}</> : <MapFallback request={request} date={date} strings={strings}/>}
    </div>}
    <footer className="map-footer"><span>{M.pencilLegend}</span><span>{M.inkLegend}</span><span className="map-age">{M.asOf} {date}</span></footer>
    <output hidden data-testid="map-diagnostics">{JSON.stringify(engine.current?.ready?engine.current.diagnostics():{ready:false})}</output>
  </section>;
}

function MapFallback({request,date,strings}:{request:SeatRequest;date:string;strings:Readonly<Record<string,string>>}) {
  const {name:t,text:display}=presenter(strings);
  return <><ul>{request.view.reports.map(r=><li key={r.id}>{t(r.author,'person')}, {reportDate(request.requestDay,date,r.day)}: {[...reportControlWords(r,t),...r.claims.filter(c=>c.kind!=='control').map(c=>`${c.kind==='enemy-strength'&&c.value===0?S.noEnemySeen:S.claims[c.kind]??display(c.kind)}${c.region?` at ${t(c.region,'region')}`:''}${c.value?`: ${display(String(c.value))}`:''}`)].join('; ')}</li>)}</ul>{request.menu.menuKind==='principal'&&request.menu.reviews.map(r=><section key={r.post}><h3>{t(r.holder,'person')}</h3>{r.plan.axes.map(a=><p key={a.name}>{display(a.name)}: {a.regions.map(id=>t(id,'region')).join(' → ')}</p>)}</section>)}</>;
}

export function MapReview({destination="",data,execute,busy,textEdit,table=false,reviewOpen=true,mapProps={}}:{destination?:string;data:DeskSnapshot;execute:(line:string)=>Promise<DeskReply|undefined>;busy:boolean;textEdit?:(line:string)=>void;table?:boolean;reviewOpen?:boolean;mapProps?:TableMapProps}) {
  const menu=data.morning.menu;
  const reviews=menu.menuKind==='principal'?menu.reviews:[];
  const approved=data.approvedPlans??[];
  const [post,setPost]=useState(reviews[0]?.post??'');
  const [marks,setMarksState]=useState<PencilMark[]>([]),[message,setMessage]=useState(''),[checking,setChecking]=useState(false);
  const [axis,setAxis]=useState(''),[region,setRegion]=useState('');
  const [geometry,setGeometry]=useState<MapGeometry|null>(null);
  const review=reviewOpen?(reviews.find(r=>r.post===post)??reviews[0]):undefined;
  const noteKey=`${data.pack}:${data.morning.requestKey}:${review?.post??''}`;
  const setMarks=(update:PencilMark[]|((old:PencilMark[])=>PencilMark[]))=>setMarksState(old=>{const next=typeof update==='function'?update(old):update;pencilNotebook.set(noteKey,next);return next;});
  const {name:t,text:display}=presenter(data.strings);
  const axisName=review?.plan.axes.find(a=>a.name===axis)?.name??review?.plan.axes[0]?.name??'';
  const lock=useRef(false);
  useEffect(()=>{loadGeometry(data.pack).then(setGeometry).catch(()=>{});},[data.pack]);
  useEffect(()=>{setMarksState(pencilNotebook.get(noteKey)??[]);setMessage('');},[noteKey]);
  const propose=useCallback(async(axis:string,kind:MapEditKind,region?:string)=>{
    if(!review||lock.current||busy)return;lock.current=true;setChecking(true);setMessage(M.previewing);
    try {
      const line=editLine(review.post,axis,kind,region);
      const result=await execute(line.replace(/^edit /,'preview '));
      if(!result?.ok || !result.preview?.ok){setMessage(result?.preview&&!result.preview.ok?result.preview.reason:result?.message??M.rejected);return;}
      const plan=result.preview.plan;
      setMarks(old=>[...old,{number:old.length+1,line,post:review.post,axis,kind,region,plan,day:data.morning.requestDay,author:data.morning.view.person}]);setMessage('');
    } finally {lock.current=false;setChecking(false);}
  },[review,execute,busy,data.morning.requestDay,data.morning.view.person,noteKey]);
  const send=async(notes:boolean)=>{
    if(!review||lock.current||busy)return;lock.current=true;setChecking(true);
    try {
      const commands=notes?[`sendback ${review.post}`]:marks.map(m=>m.line);
      let count=0;
      for(const line of commands){const result=await execute(line);if(!result?.ok){setMessage(result?.message??M.rejected);return;}count++;}
      setMessage(notes?M.sentback:M.queued);
      if(!notes)setMarks([]);
    }finally{lock.current=false;setChecking(false);}
  };
  const handles:Handle[]=review?.plan.axes.flatMap(a=>a.regions.length?[{axis:a.name,kind:'objective' as const,region:a.regions.at(-1)!},{axis:a.name,kind:'waypoints' as const,region:a.regions[Math.max(0,Math.floor((a.regions.length-1)/2))]!}]:[])??[];
  const paper=review?data.morning.view.reports.find(r=>r.id===review.report):undefined;
  return <div className={`plan-map-layout ${review?'has-plan':'map-only'} ${table?'table-map-layout':''}`}>
    {review&&<aside className="map-plan-sheet">
      {reviews.length>1&&<label>{M.plan}<select aria-label={M.plan} value={review?.post??''} onChange={e=>{setPost(e.target.value);setAxis('');}}>{reviews.map(r=><option key={r.post} value={r.post}>{t(r.holder,'person')}</option>)}</select></label>}
      {review?<><div className="plan-holder"><span className="likeness">{S.noLikeness}</span><div><h3>{t(review.holder,'person')}</h3><p className="plan-byline">{t(review.post,'post')}<br/>{paper&&reportDate(data.morning.requestDay,data.date,paper.day)}</p></div></div><p>{display(review.plan.method)} / {display(review.plan.variant)}</p>
        {review.plan.axes.map(a=><section className="axis-sheet" key={a.name}><h4>{M.axis} {display(a.name)}</h4><p>{a.regions.map(id=>t(id,'region')).join(' → ')}</p><p>{a.strength} {M.reportedMen}; {display(a.mode)}</p><p>{M.phase}: {display(a.phases.join(', '))}</p><button disabled={busy||checking} onClick={()=>void propose(a.name,'remove_axis')}>{M.strike} {display(a.name)}</button></section>)}
        {review.plan.requests.length>0&&<section><h4>{M.asks}</h4>{review.plan.requests.map(request=><p key={request}>{display(request)}</p>)}</section>}
        <fieldset disabled={busy||checking}><legend>{M.pencil}</legend><label>{M.chooseAxis}<select aria-label={M.chooseAxis} value={axisName} onChange={e=>setAxis(e.target.value)}>{review.plan.axes.map(a=><option key={a.name} value={a.name}>{display(a.name)}</option>)}</select></label>
          <label>{M.chooseRegion}<select aria-label={M.chooseRegion} value={region} onChange={e=>setRegion(e.target.value)}><option value="">{M.chooseRegion}</option>{geometry?.regions.filter(r=>r.point).map(r=><option key={r.id} value={r.id}>{t(r.id,'region')}</option>)}</select></label><div className="actions"><button disabled={!region} onClick={()=>void propose(axisName,'objective',region)}>{M.markObjective}</button><button disabled={!region} onClick={()=>void propose(axisName,'waypoints',region)}>{M.markWaypoint}</button></div>
        </fieldset>
        <p className="map-handle-note">{M.handles}</p><h4>{M.pencil}</h4>{marks.length?<ol className="pencil-list">{marks.map(m=><li key={m.number}>{m.kind==='objective'?M.objective:m.kind==='waypoints'?M.waypoint:M.strike}: {m.region?t(m.region,'region'):display(m.axis)}<code>{display(m.line)}</code></li>)}</ol>:<p>{M.noMarks}</p>}
        {marks.length>0&&<p className="map-handle-note">{M.separate}</p>}
        <div className="actions"><button className="primary" disabled={!marks.length||busy||checking} onClick={()=>void send(false)}>{M.order}</button><button data-hotkey="n" disabled={busy||checking} onClick={()=>void send(true)}>{M.sendback}</button><button disabled={!marks.length||checking} onClick={()=>setMarks([])}>{M.clear}</button><button data-hotkey="a" disabled={!!marks.length||busy||checking} onClick={()=>void execute(`approve ${review.post}`)}>{S.approve}</button>{textEdit&&<button disabled={busy||checking} onClick={()=>textEdit(`edit ${review.post} timing days=3`)}>{S.edit}</button>}</div><p className="map-handle-note">{M.notesLocal}</p>
      </>:<p>{M.noPlan}</p>}
      {message&&<p role="status" className="map-review-message">{display(message)}</p>}
    </aside>}
    <StaffMap {...mapProps} approved={approved} destination={destination} request={data.morning} pack={data.pack} date={data.date} strings={data.strings} reviewPost={review?.post??null} marks={review?marks:EMPTY_MARKS} onMark={(axis,kind,region)=>void propose(axis,kind,region)} handles={handles}/>
  </div>;
}
