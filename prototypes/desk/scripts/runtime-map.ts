import {mapProjection} from '../web/map/projection.ts';
import type {MapGeometry,GeoShape} from '../web/map/model.ts';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {geoAlbers,geoMercator} from 'd3-geo';
import {roughRings} from '../web/map/atlas.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
const sha=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex');
/** Display inputs only; all geographic anchors and hit/label paths stay exact. */
export function compactGeometry(g:MapGeometry,areas:Record<string,GeoShape>={}):MapGeometry{
 // R30 repairs absent cartography only, never existing areas or political claims.
 g={...g,regions:g.regions.map(r=>r.shape||!areas[r.id]?r:{...r,shape:areas[r.id]!})};
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
  const areaFile=`${root}/public/map-data/${pack}-claim-areas.json`,areaData=existsSync(areaFile)?readFileSync(areaFile):null,areaSha256=areaData?sha(areaData):null;
  if(existsSync(out)&&existsSync(`${out}.recipe.json`)){
   const recipe=JSON.parse(readFileSync(`${out}.recipe.json`,'utf8'));
   if(recipe.sourceSha256===sourceHash&&recipe.scriptSha256===scriptSha256&&(recipe.areaSha256??null)===areaSha256&&recipe.sha256===sha(readFileSync(out)))continue;
  }
  const value=compactGeometry(JSON.parse(data.toString()),areaData?JSON.parse(areaData.toString()):{}),text=JSON.stringify(value);mkdirSync(`${root}/public/map-data/${pack}-atlas`,{recursive:true});writeFileSync(out,text);
  writeFileSync(`${out}.recipe.json`,JSON.stringify({request:areaData?'R30':'R26',date:'2026-11-18',brief:'CODEX.md R30; compact display geometry',plan:'ChatGPT Pro 100, prior owner confirmation; no image service',client:'Codex command-line session',model:'No image model',apiKeyUnset:!process.env.OPENAI_API_KEY,prompt:null,requestedSize:'Geographic display vector',actualSize:Buffer.byteLength(text),variantsMade:1,variantChosen:1,humanEdits:[],postProcess:['omit already-baked static paths','precompute label angles','restore only missing areas from dated supplement'],provenanceMarks:'Geographic data; no provenance marks generated or removed',references:[{path:source,sha256:sourceHash,sourceRecipe:`${source}.recipe.json`},...(areaData?[{path:areaFile,sha256:areaSha256,sourceRecipe:`${areaFile}.recipe.json`}]:[])],tool:'scripts/runtime-map.ts',mode:'Lossless display projection with exact missing-area supplement where available',source,sourceSha256:sourceHash,scriptSha256,sha256:sha(text),areaFile:areaData?areaFile:null,areaSha256,existingRegionsAndRiversPreserved:true,restoredAreas:areaData?Object.keys(JSON.parse(areaData.toString())):[],sourceBytes:data.length,runtimeBytes:Buffer.byteLength(text),omitted:'Static relief, rail, base and fine county paths already present in saved atlas images; metadata counts retained.',precomputed:'Region label principal-axis angles, with the renderer original algorithm and projection.'},null,2));
  console.log(`${pack}: display geometry ${Buffer.byteLength(text)} bytes, source ${data.length} bytes`);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)ensureRuntimeMaps();
