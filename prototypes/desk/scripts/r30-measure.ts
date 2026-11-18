/** Raster measurement masks only; this script never writes game or map inputs. */
import {readFileSync,writeFileSync} from 'node:fs';
import {mapProjection} from '../web/map/projection.ts';
import {roughRings} from '../web/map/atlas.ts';
import type {MapGeometry} from '../web/map/model.ts';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R30';
const g=JSON.parse(readFileSync('public/map-data/union-1861-atlas/geometry.json','utf8')) as MapGeometry;
const views=JSON.parse(readFileSync(`${out}/views.json`,'utf8'));
const view=views.records.find((v:any)=>v.name==='fit'&&v.size.width===1920);
if(!view)throw Error('Complete the 1920 fit capture before measuring.');
const before=JSON.parse(readFileSync(`${out}/pigment-baseline.json`,'utf8')).control;
const current=view.control;
for(const p of current.points){const old=before.points.find((q:any)=>q.id===p.id);if(JSON.stringify(p.point)!==JSON.stringify(old?.point))throw Error(`Different cameras at ${p.id}`);}
const regions=g.regions.flatMap(r=>{
 const paint=current.paint.find((p:any)=>p.id===r.id&&p.area),prior=before.paint.find((p:any)=>p.id===r.id&&p.area);
 if(!r.shape||!paint||!prior||paint.strength<1)return [];
 const category=paint.colour===0x084bd6?'Union':paint.colour===0xd32238?'Enemy':paint.colour===0xf7c52f?'Neutral':null;
 if(!category)return [];
 const rings=roughRings(r.shape,mapProjection(false)).map(p=>p.map(r=>r.map(([x,y])=>[x*view.camera.z+view.camera.x,y*view.camera.z+view.camera.y])));
 return [{id:r.id,category,rings}];
});
writeFileSync(`${out}/pigment-masks.json`,JSON.stringify({size:view.size,regions,exclude:[...view.boxes.others,view.boxes.card,...view.renderedLabels.map((r:any)=>[r.bounds.x-2,r.bounds.y-2,r.bounds.x+r.bounds.width+2,r.bounds.y+r.bounds.height+2])]}));
console.log(JSON.stringify({regions:regions.length,camerasMatch:true,source:'Identical native 1920 fit cameras; opaque UI and name boxes excluded from eroded polygon masks.'}));
