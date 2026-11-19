/** Evidence masks only; no map, claim or atlas is changed. */
import {readFileSync,writeFileSync} from 'node:fs';
import {mapProjection} from '../web/map/projection.ts';
import {roughRings} from '../web/map/atlas.ts';
import type {GeoShape,MapGeometry,Point} from '../web/map/model.ts';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R33';
const full=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8')) as MapGeometry;
const display=JSON.parse(readFileSync('public/map-data/union-1861-atlas/geometry.json','utf8')) as MapGeometry;
const views=JSON.parse(readFileSync(`${out}/views-1920.json`,'utf8')).records;
const projection=mapProjection(false);
const lines=(shape:GeoShape):Point[][]=>shape.type==='LineString'?[shape.coordinates as Point[]]:shape.type==='MultiLineString'?shape.coordinates as Point[][]:[];
const result=[];
for(const name of ['fit','opening','virginia']){
 const a=views.find((v:any)=>v.name===name&&v.palette==='strong'),b=views.find((v:any)=>v.name===name&&v.palette==='research');
 if(JSON.stringify(a.camera)!==JSON.stringify(b.camera))throw Error('Unmatched cameras');
 const screen=([x,y]:Point):Point=>[x*a.camera.z+a.camera.x,y*a.camera.z+a.camera.y];
 const project=(p:Point)=>screen(projection(p) as Point);
 const regions=display.regions.flatMap(r=>{
  const paint=a.control.paint.find((p:any)=>p.id===r.id&&p.area&&p.strength===1);
  if(!r.shape||!paint)return [];
  const category=paint.colour===0x084bd6?'Union':paint.colour===0xd32238?'Enemy':paint.colour===0xf7c52f?'Neutral':null;
  if(!category)return [];
  return [{id:r.id,category,rings:roughRings(r.shape,projection).map(p=>p.map(r=>r.map(screen)))}];
 });
 const relief=(full.cartography?.relief??[]).flatMap((r,i)=>{
  if(i%5||r.strength<.25)return [];
  const a=project(r.a),b=project(r.b);
  return a[0]>0&&a[0]<1920&&a[1]>0&&a[1]<1080?[[a,b]]:[];
 });
 const strokes=(shapes:GeoShape[])=>shapes.flatMap(s=>lines(s).flatMap(line=>{
  const points=line.map(project);
  return points.some(p=>p[0]>-10&&p[0]<1930&&p[1]>-10&&p[1]<1090)?[points]:[];
 }));
 const exclude=[...a.exclude,...b.exclude,...[...a.diagnostics.renderedLabels,...b.diagnostics.renderedLabels].map((r:any)=>[r.bounds.x-3,r.bounds.y-3,r.bounds.x+r.bounds.width+3,r.bounds.y+r.bounds.height+3])];
 result.push({name,regions,relief,riverLines:strokes((full.cartography?.rivers??[]).map(r=>r.shape)),railLines:strokes(full.cartography?.rail??[]),exclude});
}
writeFileSync(`${out}/measurement-masks.json`,JSON.stringify(result));
console.log(JSON.stringify(result.map(v=>({view:v.name,areas:v.regions.length,reliefSegments:v.relief.length})),null,2));
