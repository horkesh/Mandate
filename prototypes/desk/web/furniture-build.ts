/** Static per-band geographic subtiles. No claims, reports or dates enter this bake. */
import {ridgeHatches,geographicSvg} from './map/geographic-material.ts';
import {planFurniture} from './map/furniture-plan.ts';
import {noise} from './map/manuscript.ts';
import type {MapGeometry} from './map/model.ts';
(window as any).buildFurniture=async()=>{
 const start=performance.now(),geometry=await fetch('/public/map-data/union-1861.json').then(r=>r.json()) as MapGeometry;
 const bands=planFurniture(geometry),count=bands.reduce((n,b)=>n+b.signs.length,0);
 const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=Math.ceil(count/16)*64;
 const ctx=canvas.getContext('2d',{willReadFrequently:true})!;let index=0;
 for(const band of bands)for(const sign of band.signs){
  const x=index%16*80,y=Math.floor(index/16)*64;index++;sign.atlasFrame=[x,y,80,64];
  const hatches=ridgeHatches(geometry,sign);
  if(sign.kind==='mountain')Object.assign(sign,{reliefHatches:hatches.map(h=>h.sourceIndex)});
  const svg=geographicSvg(sign,band.name,hatches).replace('<svg ','<svg width="80" height="64" ');
  const image=new Image();image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;await image.decode();ctx.drawImage(image,x,y,80,64);
  const pixels=ctx.getImageData(x,y,80,64),d=pixels.data;
  // Same absolute-coordinate pressure/noise as manuscript ink; never camera seeded.
  for(let py=0;py<64;py++)for(let px=0;px<80;px++){
   const i=(py*80+px)*4,wx=sign.point[0]+(px-40)*sign.factor,wy=sign.point[1]+(py-32)*sign.factor;
   // Bound accumulated ink where roofs and pen strokes overlap; retain native edge coverage.
   d[i+3]=Math.min(d[i+3]!,255*(band.name==='close'?.65:.62))*(.67+.33*noise(wx*2+18,wy*2));
   if(!d[i+3])d[i]=d[i+1]=d[i+2]=0;
  }
  ctx.putImageData(pixels,x,y);
 }
 return {bands,width:canvas.width,height:canvas.height,bytes:canvas.width*canvas.height*4,bakeMs:performance.now()-start,png:canvas.toDataURL('image/png').split(',')[1]};
};
