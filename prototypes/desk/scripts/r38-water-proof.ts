import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {mapProjection} from '../web/map/projection.ts';
const root=fileURLToPath(new URL('../',import.meta.url)),out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R38/',import.meta.url));
const geometry=JSON.parse(readFileSync(`${root}/public/map-data/union-1861-atlas/geometry.json`,'utf8'));
const projection=mapProjection(false),checks:any[]=[];
const distance=(p:number[],a:number[],b:number[])=>{const dx=b[0]!-a[0]!,dy=b[1]!-a[1]!,t=Math.max(0,Math.min(1,((p[0]!-a[0]!)*dx+(p[1]!-a[1]!)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]!-a[0]!-t*dx,p[1]!-a[1]!-t*dy);};
for(const width of [1920,3440])for(const record of JSON.parse(readFileSync(`${out}/views-${width}.json`,'utf8')).records){
 const d=record.diagnostics,screen=(point:number[])=>{const p=projection(point as [number,number])!;return [p[0]*d.camera.z+d.camera.x,p[1]*d.camera.z+d.camera.y];};
 for(const label of d.renderedLabels){
  const sea=geometry.regions.find((r:any)=>r.id===label.id&&r.kind==='sea');
  if(sea){
   const candidate=d.waterLabelCandidates.find((c:any)=>c.id===sea.id),point=screen(sea.point),error=Math.hypot(candidate.position[0]-point[0]!,candidate.position[1]-point[1]!);
   if(error>1e-6)throw Error(`${sea.id}: displaced from own water`);
   checks.push({view:record.name,width,id:sea.id,kind:'sea',sourceWaterPoint:sea.point,screenError:error,text:label.text,ownWaterAnchor:true});
  }else if(label.id.startsWith('river-')){
   const name=label.id.slice(6),b=label.bounds,centre=[b.x+b.width/2,b.y+b.height/2];let nearest=Infinity;
   for(const r of geometry.cartography.rivers.filter((r:any)=>r.name===name))for(const coords of r.shape.type==='LineString'?[r.shape.coordinates]:r.shape.coordinates){const line=coords.map(screen);for(let i=1;i<line.length;i++)nearest=Math.min(nearest,distance(centre,line[i-1],line[i]));}
   if(nearest>12.1)throw Error(`${name}: label left its own mapped river (${nearest})`);
   checks.push({view:record.name,width,id:label.id,kind:'river',ownRiver:name,nearestOwnRiverPixels:nearest});
  }
 }
}
writeFileSync(`${out}/water-label-check.json`,JSON.stringify({checks,pass:true,limits:'Sea labels are tied to their unchanged named source water point; river labels are measured against their own source lines. No claim that each full text rectangle fits inside narrow water is made.'},null,2));
console.log(`${checks.length} visible water names verified against their own named water.`);
