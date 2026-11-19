import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {mapProjection} from '../web/map/projection.ts';
import {boxDistance,overlaps} from '../web/map/furniture-placement.ts';
import type {Box} from '../web/map/furniture-placement.ts';
import type {Point,MapGeometry} from '../web/map/model.ts';
import {buildMapModel} from '../web/map/model.ts';
import {placeMarks} from '../web/map/placement.ts';
import type {FurnitureManifest} from '../web/map/furniture-atlas.ts';
const root=fileURLToPath(new URL('../',import.meta.url)),out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R36/',import.meta.url));
const projection=mapProjection(false),manifest=JSON.parse(readFileSync(`${root}/public/map-data/union-1861-signs/manifest.json`,'utf8')) as FurnitureManifest;
const geometry=JSON.parse(readFileSync(`${root}/public/map-data/union-1861.json`,'utf8')) as MapGeometry;
function ring(box:Box){
 const [w,n,e,s]=box,points:Point[]=[];
 for(let side=0;side<4;side++)for(let j=0;j<=16;j++){
  const f=j/16,p:Point=side===0?[w+(e-w)*f,n]:side===1?[e,n+(s-n)*f]:side===2?[e-(e-w)*f,s]:[w,s-(s-n)*f];points.push(projection.invert!(p) as Point);
 }
 points.push(points[0]!);return points;
}
const footprints:any[]=manifest.bands.flatMap(b=>b.signs.filter(s=>!['bridge','ferry'].includes(s.kind)).map(s=>({id:s.id,band:b.name,scope:'baked',ring:ring(s.box),source:s.source})));
const records:any[]=[],failures:string[]=[];
for(const width of [1920,3440])for(const view of JSON.parse(readFileSync(`${out}/views-${width}.json`,'utf8')).records){
 const d=view.diagnostics,c=d.camera;
 for(const sign of d.furniture.drawn){
  if(!['bridge','ferry'].includes(sign.kind))footprints.push({id:sign.id,band:d.furniture.scale,scope:`${view.name}-${view.palette}-${width}`,ring:ring(sign.box.map((v:number,i:number)=>(v-(i%2?c.y:c.x))/c.z) as Box)});
  if(!sign.id.startsWith('town:'))continue;
  const id=sign.id.slice(5),region=geometry.regions.find(r=>r.id===id)!;
  const source=projection(region.point!)!,anchor:Point=[source[0]*c.z+c.x,source[1]*c.z+c.y];
  const pointDistance=Math.hypot(sign.point[0]-anchor[0],sign.point[1]-anchor[1]);
  if(Math.abs(pointDistance-sign.pointDistance)>.001)failures.push(`${sign.id}: source point mismatch`);
  if(Math.abs(pointDistance-sign.waterDistance)>.01)failures.push(`${sign.id}: opening displaced beyond minimum water clearance without a report`);
  const own=d.renderedLabels.find((l:any)=>l.id===id),box=own?[own.bounds.x-3,own.bounds.y-3,own.bounds.x+own.bounds.width+3,own.bounds.y+own.bounds.height+3] as Box:null;
  const nearest=d.renderedLabels.filter((l:any)=>l.id!==id&&!l.id.startsWith('river-')).map((l:any)=>({id:l.id,distance:boxDistance(sign.point,[l.bounds.x-3,l.bounds.y-3,l.bounds.x+l.bounds.width+3,l.bounds.y+l.bounds.height+3])})).sort((a:any,b:any)=>a.distance-b.distance)[0];
  if(!box||nearest&&nearest.distance+.01<sign.nameGap)failures.push(`${sign.id}: missing/detached own name`);
  records.push({view:view.name,palette:view.palette,width,id,rank:sign.rank,sourcePoint:region.point,sourceScreenPoint:anchor,signPoint:sign.point,pointDistancePx:pointDistance,minimumWaterDisplacementPx:sign.waterDistance,nameCentreDistancePx:sign.nameDistance,nameEdgeDistancePx:sign.nameGap,nearestOtherName:nearest,ownNameBox:box});
 }
}
const later=JSON.parse(readFileSync(`${out}/priority-real-day75.json`,'utf8'));
const snapshot=JSON.parse(readFileSync(`${out}/../R32/day75-snapshot.json`,'utf8'));
const model=buildMapModel(snapshot.morning,geometry),c=later.camera;
const marks=placeMarks(model.marks,id=>{const r=geometry.regions.find(r=>r.id===id);if(!r?.point)return null;const p=projection(r.point)!;return [p[0]*c.z+c.x,p[1]*c.z+c.y];},1920,1080);
for(const s of later.furniture.drawn)for(const m of marks){const [x,y]=m.point;if(overlaps(s.box,[x-24,y-24,x+24,y+24]))failures.push(`${s.id}: covers later report ${m.mark.id}`);}
if(!marks.length)failures.push('Later view must contain actual report markers');
writeFileSync(`${out}/land-footprint-rings.json`,JSON.stringify(footprints));
const result={method:'Source points independently reprojected from unchanged geometry. Distances are CSS pixels in the map canvas; name edge and centre distances are separate. Opening shifts must equal minimum water displacement. Later real report positions reconstructed through unchanged report placement. Entire inverse-projected sign boxes checked independently by land_check.py.',records,failures,summary:{townPlacements:records.length,centred:records.filter(r=>r.pointDistancePx<.01).length,maximumPointDistancePx:Math.max(...records.map(r=>r.pointDistancePx)),maximumNameCentreDistancePx:Math.max(...records.map(r=>r.nameCentreDistancePx)),laterReportMarkers:marks.length,footprints:footprints.length}};
writeFileSync(`${out}/placement-check.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({summary:result.summary,failures}));if(failures.length)process.exitCode=1;
