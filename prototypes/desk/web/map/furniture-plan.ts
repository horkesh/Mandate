/** Build-only placement. Does not import or inspect reports, claims or holders. */
import {geoPath} from 'd3-geo';
import type {GeoPermissibleObjects} from 'd3-geo';
import {mapProjection} from './projection.ts';
import {glyphPaths,glyphVariant} from './furniture.ts';
import type {Furniture,GlyphKind} from './furniture.ts';
import type {MapGeometry,Point} from './model.ts';
import data from './furniture-r35.json';
import woodlands from './woodlands.json';
export type Box=[number,number,number,number];
export type BakedSign={id:string;kind:GlyphKind;variant:number;point:Point;box:Box;factor:number;ridgeBand?:string;source:string;anchor:Point};
export type FurnitureManifest={version:1;revision:string;file:string;sha256:string;width:number;height:number;bytes:number;bakeMs:number;bands:{name:string;signs:BakedSign[];rejected:{id:string;reason:string}[]}[]};
const overlap=(a:Box,b:Box)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
export function planFurniture(geometry:MapGeometry){
 if(geometry.pack!==data.pack)return [];
 const projection=mapProjection(false),path=geoPath(projection),ctx=document.createElement('canvas').getContext('2d')!;
 const land=geometry.base.filter(b=>b.kind==='land').map(b=>new Path2D(path(b.shape as GeoPermissibleObjects)??''));
 const lakes=geometry.base.filter(b=>b.kind==='lake').map(b=>new Path2D(path(b.shape as GeoPermissibleObjects)??''));
 const candidates=[...data.signs] as Furniture[];
 for(const f of woodlands.features)for(let i=0;i<7;i++){
  const [w,s,e,n]=f.extent as Box;
  candidates.push({id:`woodland:${f.id}:${i}`,kind:f.kind as 'woods'|'marsh',name:f.name,point:[w+(e-w)*(.18+i%3*.3),s+(n-s)*(.2+Math.floor(i/3)*.3)],source:f.sources[0]!.url,size:f.kind==='woods'?.65:.8});
 }
 // Rasterize geography once. Full-path point queries at every sample made the
 // first bake needlessly slow. The two-pixel safety margin is conservative.
 const anchors=candidates.map(s=>projection(s.point) as Point),maskScale=8;
 const mx=Math.floor(Math.min(...anchors.map(p=>p[0]))-80),my=Math.floor(Math.min(...anchors.map(p=>p[1]))-80);
 const width=Math.ceil((Math.max(...anchors.map(p=>p[0]))+80-mx)*maskScale),height=Math.ceil((Math.max(...anchors.map(p=>p[1]))+80-my)*maskScale);
 const mask=document.createElement('canvas');mask.width=width;mask.height=height;
 const mc=mask.getContext('2d',{willReadFrequently:true})!;mc.setTransform(maskScale,0,0,maskScale,-mx*maskScale,-my*maskScale);mc.fillStyle='#fff';
 for(const p of land)mc.fill(p,'evenodd');mc.globalCompositeOperation='destination-out';for(const p of lakes)mc.fill(p,'evenodd');
 const pixels=mc.getImageData(0,0,width,height).data;
 const landFootprint=(box:Box)=>{
  const x0=Math.floor((box[0]-mx)*maskScale)-2,y0=Math.floor((box[1]-my)*maskScale)-2,x1=Math.ceil((box[2]-mx)*maskScale)+2,y1=Math.ceil((box[3]-my)*maskScale)+2;
  if(x0<0||y0<0||x1>=width||y1>=height)return false;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(pixels[(y*width+x)*4+3]!==255)return false;
  return true;
 };
 const priority=(s:Furniture)=>s.kind==='mountain'?0:s.kind==='capital'?1:['woods','marsh'].includes(s.kind)?2:['fort','earthwork'].includes(s.kind)?3:4;
 // Interleave ridge chains from north to south so one chain cannot occupy all
 // the collision slots before its parallel neighbour is considered.
 const ridgeOrder=new Map<string,number>();
 for(const [i,name] of ['Blue Ridge','Alleghenies','southern Appalachians'].entries())candidates.filter(s=>s.ridgeBand===name).sort((a,b)=>b.point[1]-a.point[1]).forEach((s,j)=>ridgeOrder.set(s.id,j*3+i));
 candidates.sort((a,b)=>priority(a)-priority(b)||((ridgeOrder.get(a.id)??0)-(ridgeOrder.get(b.id)??0))||(a.id<b.id?-1:1));
 return [{name:'wide',zoom:3.029},{name:'theatre',zoom:11.949},{name:'close',zoom:16.966}].map(({name,zoom})=>{
  const signs:BakedSign[]=[],rejected:{id:string;reason:string}[]=[];
  for(const s of candidates){
   const wide=['mountain','capital','woods','marsh'].includes(s.kind);
   if(name==='wide'&&!wide||name!=='wide'&&s.kind==='mountain'||name!=='close'&&['station','hamlet'].includes(s.kind))continue;
   const variant=glyphVariant(s.id),paths=glyphPaths(s.kind,`${s.kind}-sheet-${variant+1}`),pts=paths.flat();
   const factor=(s.size??1)*2.15*(s.kind==='capital'&&name==='wide'?.72:1)/zoom;
   const anchor=projection(s.point) as Point;
   const bounds:Box=[Math.min(...pts.map(p=>p[0]))-2,Math.min(...pts.map(p=>p[1]))-2,Math.max(...pts.map(p=>p[0]))+2,Math.max(...pts.map(p=>p[1]))+2];
   // Buildings are emblems near an authored anchor. Coastal ones may sit on
   // its landward side, at most one sign width away; never move a report.
   const offsets:Point[]=['hamlet','town','city','capital'].includes(s.kind)?[[0,0],[-27,0],[27,0],[0,-24],[0,24],[-24,-20],[24,-20]]:[[0,0]];
   let chosen:BakedSign|undefined;
   for(const [dx,dy] of offsets){
    const point:Point=[anchor[0]+dx*factor,anchor[1]+dy*factor];
    const box:Box=[point[0]+bounds[0]*factor,point[1]+bounds[1]*factor,point[0]+bounds[2]*factor,point[1]+bounds[3]*factor];
    if(signs.some(p=>overlap(p.box,box)))continue;
    if(!['bridge','ferry'].includes(s.kind)){
     if(!landFootprint(box))continue;
    }
    chosen={id:s.id,kind:s.kind,variant,point,box,factor,ridgeBand:s.ridgeBand,source:s.source,anchor};break;
   }
   if(chosen)signs.push(chosen);else rejected.push({id:s.id,reason:'Land footprint or collision; no unsourced relocation'});
  }
  return {name,signs,rejected};
 });
}
