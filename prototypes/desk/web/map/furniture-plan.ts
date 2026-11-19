/** Build-only placement. Does not import or inspect reports, claims or holders. */
import {geoPath} from 'd3-geo';
import type {GeoPermissibleObjects} from 'd3-geo';
import {mapProjection} from './projection.ts';
import {glyphPaths,glyphVariant} from './furniture.ts';
import type {Furniture,GlyphKind} from './furniture.ts';
import type {MapGeometry,Point} from './model.ts';
import data from './furniture-r35.json';
import woodlands from './woodlands.json';
import {wideTown,capitalRank} from './furniture-placement.ts';
export type Box=[number,number,number,number];
export type BakedSign={id:string;kind:GlyphKind;variant:number;point:Point;box:Box;factor:number;ridgeBand?:string;source:string;anchor:Point;atlasFrame?:Box;atlasTrim?:Box;texelDensity?:number;alternatives?:Point[];stateAlternatives?:Point[]};
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
 // Summed water mask makes bounded alternative-position checks constant time.
 const water=new Uint32Array((width+1)*(height+1)),stride=width+1;
 for(let y=0;y<height;y++){let row=0;for(let x=0;x<width;x++){row+=pixels[(y*width+x)*4+3]===255?0:1;water[(y+1)*stride+x+1]=water[y*stride+x+1]!+row;}}
 const landFootprint=(box:Box)=>{
  const x0=Math.floor((box[0]-mx)*maskScale)-2,y0=Math.floor((box[1]-my)*maskScale)-2,x1=Math.ceil((box[2]-mx)*maskScale)+2,y1=Math.ceil((box[3]-my)*maskScale)+2;
  if(x0<0||y0<0||x1>=width||y1>=height)return false;
  return (water[(y1+1)*stride+x1+1]!-water[y0*stride+x1+1]!-water[(y1+1)*stride+x0]!+water[y0*stride+x0]!)===0;
 };
 const priority=(s:Furniture)=>['town:washington','town:montgomery','town:richmond'].includes(s.id)?0:s.kind==='capital'?1:['city','town','hamlet'].includes(s.kind)?2:s.kind==='mountain'?3:['woods','marsh'].includes(s.kind)?4:5;
 // Interleave ridge chains from north to south so one chain cannot occupy all
 // the collision slots before its parallel neighbour is considered.
 const ridgeOrder=new Map<string,number>();
 for(const [i,name] of ['Blue Ridge','Alleghenies','southern Appalachians'].entries())candidates.filter(s=>s.ridgeBand===name).sort((a,b)=>b.point[1]-a.point[1]).forEach((s,j)=>ridgeOrder.set(s.id,j*3+i));
 candidates.sort((a,b)=>priority(a)-priority(b)||((ridgeOrder.get(a.id)??0)-(ridgeOrder.get(b.id)??0))||(a.id<b.id?-1:1));
 return [{name:'wide',zoom:3.029},{name:'theatre',zoom:11.949},{name:'close',zoom:16.966}].map(({name,zoom})=>{
  const signs:BakedSign[]=[],rejected:{id:string;reason:string}[]=[];
  for(const s of candidates){
   const wide=['mountain','capital','city','woods','marsh'].includes(s.kind);
   if(name==='wide'&&!wide||name!=='wide'&&s.kind==='mountain'||name!=='close'&&['station','hamlet'].includes(s.kind))continue;
   const variant=glyphVariant(s.id),paths=glyphPaths(s.kind,`${s.kind}-sheet-${variant+1}`),pts=paths.flat();
   const town=['hamlet','town','city','capital'].includes(s.kind);
   // Capital texture is sized for the national rank; state rank scales it down
   // at runtime. Small coastal emblems need less relocation than R35's rings.
   const size=s.kind==='capital'?(name==='wide'?.55:.72):s.kind==='city'?(name==='wide'?.56:.72):s.kind==='mountain'?.48:town?.65:1;
   const factor=(s.size??1)*2.15*size/zoom;
   const anchor=projection(s.point) as Point;
   const bounds:Box=[Math.min(...pts.map(p=>p[0]))-2,Math.min(...pts.map(p=>p[1]))-2,Math.max(...pts.map(p=>p[0]))+2,Math.max(...pts.map(p=>p[1]))+2];
   // Keep every town on its own point. Search only for water clearance here;
   // reports may select a later land-safe alternative at runtime. Never move
   // a town merely to avoid another geographic sign.
   const offsets:Point[]=[[0,0]];
   if(town)for(let radius=4;radius<=88;radius+=4)for(let i=0;i<16;i++)offsets.push([Math.cos(i*Math.PI/8)*radius/zoom,Math.sin(i*Math.PI/8)*radius/zoom]);
   const alternatives:Point[]=[],stateAlternatives:Point[]=[];
   let chosen:BakedSign|undefined;
   for(const [dx,dy] of offsets){
    const point:Point=[anchor[0]+dx,anchor[1]+dy];
    const box:Box=[point[0]+bounds[0]*factor,point[1]+bounds[1]*factor,point[0]+bounds[2]*factor,point[1]+bounds[3]*factor];
    if(s.kind==='capital'&&landFootprint(box.map((v,i)=>point[i%2]!+(v-point[i%2]!)*.64) as Box))stateAlternatives.push(point);
    if(!town&&signs.some(p=>overlap(p.box,box)))continue;
    if(!['bridge','ferry'].includes(s.kind)){
     if(!landFootprint(box))continue;
    }
    if(town){
     const distance=Math.hypot(dx,dy);
     if(candidates.some(n=>n.id!==s.id&&['hamlet','town','city','capital'].includes(n.kind)&&(name!=='wide'||['town:washington','town:montgomery','town:richmond'].includes(n.id)||wideTown(n.id.slice(5),n.kind,capitalRank(n.id.slice(5),'1861-03-06',n.kind)))&&(()=>{const p=projection(n.point)!;return Math.hypot(point[0]-p[0],point[1]-p[1])<distance;})()))continue;
     alternatives.push(point);
    }
    if(!chosen)chosen={id:s.id,kind:s.kind,variant,point,box,factor,ridgeBand:s.ridgeBand,source:s.source,anchor};
    if(!town)break;
   }
   if(chosen){if(town)chosen.alternatives=alternatives;if(s.kind==='capital')chosen.stateAlternatives=stateAlternatives;signs.push(chosen);}else rejected.push({id:s.id,reason:'Land footprint or collision; no unsourced relocation'});
  }
  return {name,signs,rejected};
 });
}
