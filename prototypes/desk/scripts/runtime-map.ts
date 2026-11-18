import {mapProjection} from '../web/map/projection.ts';
import type {MapGeometry} from '../web/map/model.ts';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {geoAlbers,geoMercator} from 'd3-geo';
import {roughRings} from '../web/map/atlas.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
const sha=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex');
/** Display inputs only; all geographic anchors and hit/label paths stay exact. */
export function compactGeometry(g:MapGeometry):MapGeometry{
 const projection=g.schematic?geoMercator().center([-1.4,52]).scale(20000).translate([0,0]):mapProjection(false);
 const regionAngles:Record<string,number>={};
 for(const r of g.regions)if(r.kind==='land'&&r.shape){
  const pts=roughRings(r.shape,projection).flat(2);let angle=0;
  if(pts.length){const cx=pts.reduce((n,p)=>n+p[0],0)/pts.length,cy=pts.reduce((n,p)=>n+p[1],0)/pts.length;let xx=0,yy=0,xy=0;for(const p of pts){xx+=(p[0]-cx)**2;yy+=(p[1]-cy)**2;xy+=(p[0]-cx)*(p[1]-cy);}angle=Math.max(-.65,Math.min(.65,.5*Math.atan2(2*xy,xx-yy)));}
  regionAngles[r.id]=angle;
 }
 return {...g,regionAngles,base:[],atlasDetail:{sourceTolerance:g.cartography?.lod?.sourceTolerance,countyDate:g.cartography?.lod?.countyDate,counties:g.cartography?.lod?.counties.length??0,stations:g.cartography?.lod?.stations.length??0,reliefRows:g.cartography?.relief.some(r=>r.contour!==undefined)??false},cartography:g.cartography?{rivers:g.cartography.rivers,rail:[],relief:[],sources:g.cartography.sources}:undefined};
}
export function ensureRuntimeMaps(packs=['union-1861','testbed']){
 const scriptSha256=sha([readFileSync(fileURLToPath(import.meta.url)),readFileSync(`${root}/web/map/atlas.ts`),readFileSync(`${root}/web/map/projection.ts`),readFileSync(`${root}/web/map/skins.ts`)].map(v=>sha(v)).join(':'));
 for(const pack of packs){
  if(!['union-1861','testbed'].includes(pack))throw Error('Unknown map');
  const source=`${root}/public/map-data/${pack}.json`,out=`${root}/public/map-data/${pack}-atlas/geometry.json`,data=readFileSync(source),sourceHash=sha(data);
  if(existsSync(out)&&existsSync(`${out}.recipe.json`)){
   const recipe=JSON.parse(readFileSync(`${out}.recipe.json`,'utf8'));
   if(recipe.sourceSha256===sourceHash&&recipe.scriptSha256===scriptSha256&&recipe.sha256===sha(readFileSync(out)))continue;
  }
  const value=compactGeometry(JSON.parse(data.toString())),text=JSON.stringify(value);mkdirSync(`${root}/public/map-data/${pack}-atlas`,{recursive:true});writeFileSync(out,text);
  writeFileSync(`${out}.recipe.json`,JSON.stringify({request:'R26',tool:'scripts/runtime-map.ts',mode:'Lossless display projection of static build data',source,sourceSha256:sourceHash,scriptSha256,sha256:sha(text),regionsAndRiversPreserved:true,sourceBytes:data.length,runtimeBytes:Buffer.byteLength(text),omitted:'Static relief, rail, base and fine county paths already present in saved atlas images; metadata counts retained.',precomputed:'Region label principal-axis angles, with the renderer original algorithm and projection.'},null,2));
  console.log(`${pack}: display geometry ${Buffer.byteLength(text)} bytes, source ${data.length} bytes`);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)ensureRuntimeMaps();
