/** Presentation vocabulary only: every political statement comes from the view. */
import type {ReportView,SeatRequest} from '@mandate/kernel/seat-api';
import type {Point} from './model.ts';
import {markState} from './model.ts';
import {M} from './strings.ts';
import {CONTROL_PALETTES} from './control-palettes.ts';
import type {ControlPalette} from './control-palettes.ts';

export const CONTROL_COLOURS=CONTROL_PALETTES.strong.colours;
export type ControlBelief=SeatRequest['view']['controlBeliefs'][keyof SeatRequest['view']['controlBeliefs']];
/** R34: fixed display categories; never interpolate a reported share. */
export function controlStrength(belief:ControlBelief):'held'|'firm'{
 return belief.neutralGovernment||Math.max(0,...Object.values(belief.shares))>=800?'firm':'held';
}
export function controlColour(faction:string|null,own:string|null,neutral=false,palette:ControlPalette='strong'){const c=CONTROL_PALETTES[palette].colours;return neutral?c.neutral:faction===own?c.friendly:c.enemy;}
export function controlOpacity(belief:ControlBelief,today:number,palette:ControlPalette='strong'){return markState(today,belief.asOfDay).opacity*(belief.mark==='ink'?.72:.60)*CONTROL_PALETTES[palette].middle;}
export function claimWords(region:string,belief:ControlBelief|undefined,name:(id:string,kind?:string)=>string,date:(day:number)=>string){
 if(!belief)return `${region}: ${M.noControlReport}`;
 const holding=belief.holder?`${name(belief.holder,'faction')} holds this ground`:belief.neutralGovernment?'Neutral government':'No holder reported';
 const authors=[...new Set(belief.sources.map(s=>name(s.author,'person')))];
 return `${region}: ${holding}.${belief.contested?' Contested ground.':''} ${authors.join('; ')}, as of ${date(belief.asOfDay)}. ${belief.mark==='ink'?'In ink':'In pencil'}.`;
}
/** Qualitative control in a paper's own snapshot, also used without map geometry. */
export function reportControlWords(report:ReportView,name:(id:string,kind?:string)=>string):string[]{
 return (report.reportedControl??[]).map(c=>`${c.holder?`${name(c.holder,'faction')} holds ${name(c.region,'region')}`:`No holder reported at ${name(c.region,'region')}`}${c.contested?'; contested ground':''}`);
}
/** Retain actual coincident border runs. No adjacency or movement is inferred. */
export function sharedFront(a:readonly Point[][][],b:readonly Point[][][]):Point[][]{
 const key=(p:Point)=>`${Math.round(p[0]*100)},${Math.round(p[1]*100)}`;
 const edges=new Set<string>();
 for(const polygon of b)for(const ring of polygon)for(let i=1;i<ring.length;i++){const u=key(ring[i-1]!),v=key(ring[i]!);edges.add(u<v?`${u}:${v}`:`${v}:${u}`);}
 const lines:Point[][]=[];
 for(const polygon of a)for(const ring of polygon){let line:Point[]=[];for(let i=1;i<ring.length;i++){
  const u=key(ring[i-1]!),v=key(ring[i]!);
  if(edges.has(u<v?`${u}:${v}`:`${v}:${u}`)){if(!line.length)line.push(ring[i-1]!);line.push(ring[i]!);}
  else if(line.length){lines.push(line);line=[];}
 }if(line.length)lines.push(line);}
 return lines;
}
/** Where cartography has no shared area edge (a fort or imperfect county dissolve),
 * place a short staff mark at the own region's boundary towards the reported enemy.
 * It describes the authored contact, not a surveyed line between the two areas. */
export function contactMark(rings:readonly Point[][][],own:Point,enemy:Point):Point[]{
 const dx=enemy[0]-own[0],dy=enemy[1]-own[1],len=Math.hypot(dx,dy);if(!len)return [];
 let contact:Point=[(own[0]+enemy[0])/2,(own[1]+enemy[1])/2],best=Infinity;
 for(const polygon of rings)for(const ring of polygon)for(let i=1;i<ring.length;i++){
  const a=ring[i-1]!,b=ring[i]!,ex=b[0]-a[0],ey=b[1]-a[1],den=dx*ey-dy*ex;if(Math.abs(den)<1e-8)continue;
  const t=((a[0]-own[0])*ey-(a[1]-own[1])*ex)/den,u=((a[0]-own[0])*dy-(a[1]-own[1])*dx)/den;
  if(t>0&&t<1&&u>=0&&u<=1&&t<best){best=t;contact=[own[0]+dx*t,own[1]+dy*t];}
 }
 const span=Math.min(len*.15,2.2),nx=-dy/len*span,ny=dx/len*span;
 return [[contact[0]-nx,contact[1]-ny],[contact[0]+nx,contact[1]+ny]];
}
