import type {Point} from './model.ts';
import type {GlyphKind} from './furniture.ts';
export type Box=[number,number,number,number];
export type CapitalRank='national'|'state'|'none';
/** Calendar convention, not a claim of control. NPS dates the move to 29 May;
 * the 20 May vote is distinct. Source and retrieved text: R36 capital-source-search.json. */
export function capitalRank(region:string,date:string,kind:GlyphKind):CapitalRank{
 if(region==='washington'||region===(date>='1861-05-29'?'richmond':'montgomery'))return 'national';
 return kind==='capital'?'state':'none';
}
// Conservative largest-city subset of the pack's urban hints. No county totals
// or unsupported city population estimates. Fort Sumter's urban flag is not a city.
const LARGE_CITIES=new Set(['baltimore','philadelphia','new_orleans','cincinnati','st_louis']);
export const wideTown=(region:string,_kind:GlyphKind,rank:CapitalRank)=>rank==='national'||LARGE_CITIES.has(region);
export const overlaps=(a:Box,b:Box)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
export const boxDistance=(p:Point,b:Box)=>Math.hypot(Math.max(b[0]-p[0],0,p[0]-b[2]),Math.max(b[1]-p[1],0,p[1]-b[3]));
/** Alternatives are land-safe, bounded, sorted by distance in the offline bake.
 * Only water (the first safe point) or a report can displace a place sign.
 * Other furniture, papers, fronts and arrows may hide it, never push it away. */
export function placeNearAnchor(anchor:Point,box:Box,options:Point[],reports:Box[],fixed:Box[],neighbours:Point[]):Point|null{
 const initial=options[0];if(!initial)return null;
 const translated=(p:Point):Box=>[box[0]+p[0]-anchor[0],box[1]+p[1]-anchor[1],box[2]+p[0]-anchor[0],box[3]+p[1]-anchor[1]];
 const choices=reports.some(b=>overlaps(b,translated(initial)))?options:[initial];
 for(const p of choices){
  const own=Math.hypot(p[0]-anchor[0],p[1]-anchor[1]);
  if(neighbours.some(n=>Math.hypot(p[0]-n[0],p[1]-n[1])<own))continue;
  const b=translated(p);if([...reports,...fixed].some(o=>overlaps(o,b)))continue;
  return p;
 }
 return null;
}
export function namePositions(point:Point,box:Box,width:number,height:number):Point[]{
 const [x,y]=point,gap=8;
 return [[box[2]+gap+width/2,y],[box[0]-gap-width/2,y],[x,box[1]-gap-height/2],[x,box[3]+gap+height/2],
  [box[2]+gap+width/2,box[1]+height/2],[box[0]-gap-width/2,box[1]+height/2],
  [box[2]+gap+width/2,box[3]-height/2],[box[0]-gap-width/2,box[3]-height/2]];
}
