/** Static scenario cartography. Four cached bands; no bake on pan or zoom. */
import {geoPath} from 'd3-geo';
import type {GeoProjection,GeoPermissibleObjects} from 'd3-geo';
import type {GeoShape,MapGeometry,Point} from './model.ts';
import {PALETTES,roughLine} from './skins.ts';
import type {Look} from './skins.ts';
import {agePaper,grain,ink,paintWash,waterPigment} from './manuscript.ts';
type Box=[number,number,number,number];
type Path={path:Path2D;bounds:Box;kind:string;rank:number;lines:Point[][]};
export interface AtlasBand {canvas:HTMLCanvasElement|HTMLImageElement;box:Box;scale:number;minZoom:number}
export interface BakedAtlas {bands:AtlasBand[];bakeMs:number;bytes:number;paths:number;loadMs?:number;source?:'disk'|'build'}
export interface Wash {regions:string[];permille:number;contested?:boolean;side:'friendly'|'opposing'}
/** Higher-resolution rasters meet the lower band over a wide, smooth margin. */
export function featherBand(c:CanvasRenderingContext2D,width:number,height:number,margin=128){
 c.save();c.resetTransform();c.globalAlpha=1;c.globalCompositeOperation='destination-in';
 for(const [size,horizontal] of [[width,true],[height,false]] as const){
  const edge=Math.min(margin,size/4),g=c.createLinearGradient(0,0,horizontal?size:0,horizontal?0:size);
  for(let i=0;i<=16;i++){
   const t=i/16,alpha=t*t*t*(t*(t*6-15)+10);
   g.addColorStop(t*edge/size,`rgba(0,0,0,${alpha})`);
  }
  for(let i=16;i>=0;i--){
   const t=i/16,alpha=t*t*t*(t*(t*6-15)+10);
   g.addColorStop(1-t*edge/size,`rgba(0,0,0,${alpha})`);
  }
  c.fillStyle=g;c.fillRect(0,0,width,height);
 }
 c.restore();
}
const atlases=new Map<string,BakedAtlas>();
const intersects=(a:Box,b:Box)=>a[0]<=b[2]&&a[2]>=b[0]&&a[1]<=b[3]&&a[3]>=b[1];
export function geographicBounds(projection:GeoProjection,box:Box):Box{
 const points:Point[]=[];
 for(let i=0;i<=32;i++)for(const [x,y] of [[box[0]+(box[2]-box[0])*i/32,box[1]],[box[0]+(box[2]-box[0])*i/32,box[3]],[box[0],box[1]+(box[3]-box[1])*i/32],[box[2],box[1]+(box[3]-box[1])*i/32]])points.push(projection([x!,y!]) as Point);
 return [Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
}
export function roughRings(shape:GeoShape,projection:GeoProjection):Point[][][]{
 const polygons=shape.type==='Polygon'?[shape.coordinates]:shape.coordinates;
 return (polygons as Point[][][]).map(polygon=>polygon.map(ring=>{
  const dense:Point[]=[];
  for(let i=1;i<ring.length;i++){const a=projection(ring[i-1]!) as Point,b=projection(ring[i]!) as Point,n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.35));for(let j=0;j<n;j++)dense.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}
  if(dense.length)dense.push(dense[0]!);return roughLine(dense,.022);
 }));
}
function border(shape:GeoShape,projection:GeoProjection){const path=new Path2D();for(const polygon of roughRings(shape,projection))for(const ring of polygon){ring.forEach((p,i)=>i?path.lineTo(...p):path.moveTo(...p));path.closePath();}return path;}
function coordinates(shape:GeoShape,projection:GeoProjection):Point[][]{
 const c=shape.coordinates as any;
 const lines=shape.type==='LineString'?[c]:shape.type==='MultiLineString'||shape.type==='Polygon'?c:shape.type==='MultiPolygon'?c.flat():[];
 return lines.map((line:Point[])=>line.map(p=>projection(p) as Point));
}
/** Rounded display joins follow source vertices. They never replace hit geometry. */
function flowingPath(lines:Point[][],closed=false){
 const path=new Path2D();
 for(const source of lines){
  const line=closed&&source.length>2?source.slice(0,-1):source;if(line.length<2)continue;
  if(closed){const last=line.at(-1)!,first=line[0]!;path.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);for(let i=0;i<line.length;i++){const a=line[i]!,b=line[(i+1)%line.length]!;path.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}path.closePath();}
  else{path.moveTo(...line[0]!);for(let i=1;i<line.length-1;i++){const a=line[i]!,b=line[i+1]!;path.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}path.lineTo(...line.at(-1)!);}
 }return path;
}
export function bakeAtlas(geometry:MapGeometry,projection:GeoProjection,look:Look,contrast:boolean,lamp:boolean,washes:Wash[]=[]):BakedAtlas{
 const key=`${geometry.pack}:${geometry.cartography?.relief.length}:${geometry.cartography?.lod?.relief?.length}:${geometry.base.length}:${look}:${contrast}:${lamp}:${look==='A'?JSON.stringify(washes):''}`;
 const previous=atlases.get(key);if(previous)return previous;
 const started=performance.now(),palette=PALETTES[look],manuscript=look==='A'&&!contrast;
 const colour=(s:string)=>contrast?(s===palette.ink||s===palette.rail||s===palette.relief?'#111111':s===palette.water?'#e5e5e5':'#ffffff'):s;
 const path=geoPath(projection),make=(shape:GeoShape,kind:string,rank=0):Path=>{const b=path.bounds(shape as GeoPermissibleObjects);const lines=coordinates(shape,projection);return {path:manuscript?flowingPath(lines,shape.type.includes('Polygon')):new Path2D(path(shape as GeoPermissibleObjects)??''),bounds:[...b[0],...b[1]] as Box,kind,rank,lines};};
 const base=geometry.base.map(p=>make(p.shape,p.kind,p.rank));
 const lod=geometry.cartography?.lod;
 const fineBase=lod?.base.map(p=>make(p.shape,p.kind,p.rank))??base;
 const regions=geometry.regions.filter(r=>r.shape&&!['sea','river','off_map'].includes(r.kind)).map(r=>({id:r.id,...make(r.shape!,'region'),border:border(r.shape!,projection)}));
 const fineRegions=lod?geometry.regions.filter(r=>lod.regions[r.id]&&!['sea','river','off_map'].includes(r.kind)).map(r=>({id:r.id,...make(lod.regions[r.id]!,'region'),border:border(lod.regions[r.id]!,projection)})):regions;
 const states=lod?.states.map(s=>make(s.shape,'state'))??[];
 const counties=lod?.counties.map(s=>make(s.shape,'county'))??[];
 const rail=(geometry.cartography?.rail??[]).map(r=>make(r,'rail'));
 const rivers=(geometry.cartography?.rivers??[]).map(r=>({name:r.name,...make(r.shape,'river',r.rank??6)}));
 const rawRelief=geometry.cartography?.relief??[];
 const relief=rawRelief.map(r=>({a:projection(r.a) as Point,b:projection(r.b) as Point,strength:r.strength,contour:r.contour??0}));
 const specs:{box:Box;scale:number;minZoom:number}[]=geometry.schematic?[{box:[-120,-100,120,100],scale:4,minZoom:0}]:[
  {box:geometry.baseCoverage?.worldBounds??[-900,-350,1300,650],scale:1,minZoom:0},
  {box:geographicBounds(projection,[-104,24,-65,50]),scale:4,minZoom:1.5},
  {box:geographicBounds(projection,[-86.5,33.5,-72.5,43]),scale:16,minZoom:8},
  {box:geographicBounds(projection,[-78.25,38.15,-76.7,39.35]),scale:80,minZoom:100},
 ];
 const bands:AtlasBand[]=[];
 for(const spec of specs){
  const {box,scale,minZoom}=spec,detail=scale>=80?.25:1,close=minZoom>=8;
  const canvas=document.createElement('canvas');canvas.width=Math.ceil((box[2]-box[0])*scale);canvas.height=Math.ceil((box[3]-box[1])*scale);const c=canvas.getContext('2d',{willReadFrequently:manuscript})!;
  c.fillStyle=colour(geometry.schematic?palette.paper:palette.water);c.fillRect(0,0,canvas.width,canvas.height);
  c.setTransform(scale,0,0,scale,-box[0]*scale,-box[1]*scale);c.lineJoin='round';c.lineCap='round';
  const visible=(manuscript&&close?fineBase:base).filter(p=>intersects(p.bounds,box));
  const regionLayer=manuscript&&close?fineRegions:regions,coasts=visible.filter(p=>p.kind==='coast');
  const landMask=new Path2D();for(const land of visible.filter(p=>p.kind==='land'))landMask.addPath(land.path);
  if(manuscript)waterPigment(c,coasts.map(p=>p.path),box,scale);
  if(manuscript)for(const coast of coasts)for(const line of coast.lines)for(const side of [-1,1])for(let i=1;i<=9;i++){
    const offset=line.map((p,j)=>{const a=line[Math.max(0,j-1)]!,b=line[Math.min(line.length-1,j+1)]!,length=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [p[0]-(b[1]-a[1])/length*i*.075*detail*side,p[1]+(b[0]-a[0])/length*i*.075*detail*side] as Point;});
    c.strokeStyle=palette.river;c.globalAlpha=.37*(1-i/11);c.lineWidth=.016*detail;c.stroke(flowingPath([offset]));
  }
  if(look==='B'||(look==='A'&&!manuscript))for(const coast of coasts){
   const step=(look==='B'?.17:.13)*detail,thin=(look==='B'?.023:.018)*detail;
   for(let i=8;i>=1;i--){c.globalAlpha=(manuscript?.43:.85)*(1-i/11);c.strokeStyle=colour(palette.ink);c.lineWidth=i*step;c.stroke(coast.path);c.globalAlpha=1;c.strokeStyle=colour(palette.water);c.lineWidth=i*step-thin*2;c.stroke(coast.path);}
  }
  c.globalAlpha=1;
  for(const land of visible.filter(p=>p.kind==='land')){c.fillStyle=colour(manuscript?palette.paper:palette.quiet);c.fill(land.path,'evenodd');}
  if(manuscript){c.save();c.clip(landMask,'evenodd');}
  for(const r of regionLayer)if(intersects(r.bounds,box)){c.fillStyle=colour(lamp?'#dfcfad':palette.land);c.fill(r.path,'evenodd');}
  if(manuscript)c.restore();
  // Relief gets its own temporary raster so river corridors can erase only
  // hachures, never the paper. This canvas is not uploaded as a GPU texture.
  const rc=manuscript?document.createElement('canvas'):canvas;if(manuscript){rc.width=canvas.width;rc.height=canvas.height;}
  const h=manuscript?rc.getContext('2d')!:c;h.setTransform(scale,0,0,scale,-box[0]*scale,-box[1]*scale);h.lineCap='round';h.strokeStyle=colour(palette.relief);
  // All bands use the same continuous terrain; only stroke rendering changes.
  for(const mark of relief)if(mark.a[0]>box[0]&&mark.a[0]<box[2]&&mark.a[1]>box[1]&&mark.a[1]<box[3]){
   if(manuscript&&minZoom===8&&mark.contour%100!==0)continue;
   if(manuscript&&close&&mark.strength<.20)continue;
   if(manuscript&&scale===1&&grain(Math.round(mark.a[0]*1000),Math.round(mark.a[1]*1000))<.65)continue;
   const dx=mark.b[0]-mark.a[0],dy=mark.b[1]-mark.a[1];
   if(look==='C'){h.globalAlpha=.08+mark.strength*.15;h.lineWidth=.28+mark.strength*.24;h.beginPath();h.moveTo(...mark.a);h.lineTo(...mark.b);h.stroke();}
   else for(let part=0;part<3;part++){
    h.globalAlpha=manuscript?(close?.23+mark.strength*.3:.38+mark.strength*.42):.7+mark.strength*.25;h.lineWidth=(manuscript?(close?.018+mark.strength*.014:.027+mark.strength*.022):look==='B'?.048:.07)*(1-part*.28)*detail;
    h.beginPath();h.moveTo(mark.a[0]+dx*part/3,mark.a[1]+dy*part/3);h.quadraticCurveTo(mark.a[0]+dx*(part+.45)/3+.008,mark.a[1]+dy*(part+.45)/3,mark.a[0]+dx*(part+1)/3,mark.a[1]+dy*(part+1)/3);h.stroke();
   }
  }
  if(manuscript){
   h.globalAlpha=1;h.globalCompositeOperation='destination-out';h.lineWidth=.30*detail;for(const r of rivers)if(intersects(r.bounds,box))h.stroke(r.path);
   c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(rc,0,0);c.restore();rc.width=rc.height=1;
  }
  c.globalAlpha=1;
  if(manuscript){
   c.save();c.clip(landMask,'evenodd');
   for(const wash of washes)for(const id of wash.regions){const r=regionLayer.find(r=>r.id===id);if(r&&intersects(r.bounds,box))paintWash(c,r.border,r.bounds,wash.side==='friendly'?'#537f9b':'#b77545',Math.max(0,Math.min(1000,wash.permille))/1000,scale);}
   c.restore();
  }
  if(look==='C')for(const [i,r] of regionLayer.entries())if(intersects(r.bounds,box)){c.globalAlpha=.4;c.fillStyle=colour(['#ead5aa','#d6d5aa','#d0d9bb','#e6c9aa','#c6d6ca','#ddd1ae'][i%6]!);c.fill(r.path,'evenodd');}
  c.globalAlpha=1;
  for(const lake of visible.filter(p=>p.kind==='lake')){c.fillStyle=colour(palette.water);c.fill(lake.path,'evenodd');}
  for(const r of rivers)if(intersects(r.bounds,box)&&(r.rank<=8||close||['Potomac','Shenandoah','Rappahannock','York','James'].includes(r.name))){
   const major=['Potomac','Rappahannock','York','James'].includes(r.name),width=(major?.16:r.rank<=3?.15:r.rank<=6?.10:r.rank<=8?.075:.04)*detail;
   if(manuscript)for(const line of r.lines){
    // Natural Earth feature order is retained. The James main-stem feature
    // runs upstream in this source, so its taper is explicitly reversed.
    const reverse=r.name==='James'&&line[0]![0]>line.at(-1)![0];
    for(let i=1;i<line.length;i++){
     const t=reverse?1-i/line.length:i/line.length,w=width*(.24+.76*t),pts=[line[i-1]!,line[i]!];
     c.strokeStyle=palette.river;ink(c,pts,w,.8);
     if(major&&w*scale>1.5){c.lineWidth=w*.62;c.strokeStyle=grain(i,Math.round(line[i]![0]*1000),25)>.5?'#adc1b6':'#a1b9b1';c.globalAlpha=.9;c.beginPath();c.moveTo(...pts[0]!);c.lineTo(...pts[1]!);c.stroke();c.globalAlpha=1;}
    }
   }else{c.lineWidth=width;c.strokeStyle=colour(palette.river);c.stroke(r.path);}
  }
  for(const coast of coasts){c.strokeStyle=colour(manuscript?palette.river:palette.ink);c.lineWidth=(look==='B'?.045:manuscript?.035:.065)*detail;if(manuscript)for(const line of coast.lines)ink(c,line,c.lineWidth,.65);else c.stroke(coast.path);}
  if(manuscript){c.save();c.clip(landMask,'evenodd');}
  for(const r of regionLayer)if(intersects(r.bounds,box)){
   c.lineWidth=(manuscript?.026:palette.border)*detail;c.strokeStyle=colour(palette.ink);c.globalAlpha=manuscript?.34:look==='C'?.85:.55;
   c.setLineDash(manuscript?[.04*detail,.12*detail,.19*detail,.12*detail]:[]);c.stroke(r.border);
  }
  if(manuscript){
   c.globalAlpha=.28;c.setLineDash([.025*detail,.15*detail]);c.lineWidth=.045*detail;
   for(const s of states)if(intersects(s.bounds,box))c.stroke(s.path);
   if(close){c.globalAlpha=.16;c.lineWidth=.018*detail;c.setLineDash([.025*detail,.12*detail]);for(const county of counties)if(intersects(county.bounds,box))c.stroke(county.path);}
   c.restore();
  }
  c.setLineDash([]);c.globalAlpha=.86;
  for(const r of rail)if(intersects(r.bounds,box)){
   c.strokeStyle=colour(palette.rail);c.lineWidth=(manuscript?.044:look==='A'?.10:.065)*detail;
   if(manuscript)for(const line of r.lines)ink(c,line,c.lineWidth,.92);else c.stroke(r.path);
   if(scale>=4){c.lineCap='butt';c.lineWidth=(manuscript?.13:look==='A'?.23:.17)*detail;c.setLineDash([.014*detail,.20*detail]);c.stroke(r.path);c.lineCap='round';c.setLineDash([]);}
  }
  c.setLineDash([]);c.globalAlpha=1;
  for(const town of geometry.regions.filter(r=>r.kind==='key_point'&&r.point)){
   const p=projection(town.point!) as Point;if(p[0]<box[0]||p[0]>box[2]||p[1]<box[1]||p[1]>box[3])continue;
   const radius=(manuscript?.11:.15)*detail;c.fillStyle=colour(palette.land);c.strokeStyle=colour(palette.ink);c.lineWidth=.04*detail;c.beginPath();c.arc(...p,radius,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.arc(...p,.032*detail,0,Math.PI*2);c.fillStyle=colour(palette.ink);c.fill();
  }
  if(manuscript){
   // Faint geographic graticule. The frame's degree ticks are screen overlays.
   c.strokeStyle=palette.ink;c.lineWidth=.012*detail;c.globalAlpha=.11;c.setLineDash([.1*detail,.2*detail]);
   for(let lon=-160;lon<=0;lon+=close?.25:5){const pts:Point[]=[];for(let lat=-25;lat<=70;lat+=.5)pts.push(projection([lon,lat]) as Point);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
   for(let lat=-25;lat<=70;lat+=close?.25:5){c.beginPath();for(let lon=-165;lon<=-5;lon+=.5){const p=projection([lon,lat]) as Point;if(lon===-165)c.moveTo(...p);else c.lineTo(...p);}c.stroke();}
   c.setLineDash([]);c.globalAlpha=1;c.setTransform(1,0,0,1,0,0);agePaper(c,box,scale);
  }
  if(minZoom>0)featherBand(c,canvas.width,canvas.height);
  bands.push({canvas,box,scale,minZoom});
 }
 const result={bands,source:'build' as const,bakeMs:performance.now()-started,bytes:bands.reduce((n,b)=>n+b.canvas.width*b.canvas.height*4,0),paths:base.length+rail.length+regions.length};
 if(result.bytes>96*1024*1024)throw Error(`Static atlas exceeds 96 MiB: ${result.bytes}`);
 // One installed atlas is retained. Switching looks releases old CPU canvases;
 // the renderer destroys its old GPU textures before installing the next one.
 atlases.clear();atlases.set(key,result);return result;
}
