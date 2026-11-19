/** Static per-band geographic subtiles. No claims, reports or dates enter this bake. */
import {ridgeHatches,geographicSvg} from './map/geographic-material.ts';
import {planFurniture} from './map/furniture-plan.ts';
import {noise} from './map/manuscript.ts';
import type {MapGeometry} from './map/model.ts';
(window as any).buildFurniture=async()=>{
 const start=performance.now(),geometry=await fetch('/public/map-data/union-1861.json').then(r=>r.json()) as MapGeometry;
 const bands=planFurniture(geometry),supersample=4,density=2;
 const tiles:{sign:typeof bands[number]['signs'][number];canvas:HTMLCanvasElement;order:number}[]=[];
 for(const band of bands)for(const sign of band.signs){
  const hatches=ridgeHatches(geometry,sign);
  if(sign.kind==='mountain')Object.assign(sign,{reliefHatches:hatches.map(h=>h.sourceIndex)});
  const svg=geographicSvg(sign,band.name,hatches).replace('<svg ',`<svg width="${80*supersample}" height="${64*supersample}" `);
  const image=new Image();image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;await image.decode();
  const high=document.createElement('canvas');high.width=80*supersample;high.height=64*supersample;
  const ctx=high.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,high.width,high.height),d=pixels.data;
  // Preserve edge/roof coverage rather than clipping most pixels onto one
  // plateau. R39 peak loads and world-coordinate grain remain unchanged.
  const peak=band.name==='close'?.65:.62;
  for(let py=0;py<high.height;py++)for(let px=0;px<high.width;px++){
   const i=(py*high.width+px)*4,wx=sign.point[0]+((px+.5)/supersample-40)*sign.factor,wy=sign.point[1]+((py+.5)/supersample-32)*sign.factor;
   d[i+3]=Math.min(1,d[i+3]!/(255*.96))*255*peak*(.67+.33*noise(wx*2+18,wy*2));
   if(!d[i+3])d[i]=d[i+1]=d[i+2]=0;
  }ctx.putImageData(pixels,0,0);
  const native=document.createElement('canvas');native.width=Math.ceil(80*density);native.height=Math.ceil(64*density);
  const nc=native.getContext('2d',{willReadFrequently:true})!;nc.imageSmoothingEnabled=true;nc.imageSmoothingQuality='high';nc.drawImage(high,0,0,80*density,64*density);
  const data=nc.getImageData(0,0,native.width,native.height);let l=native.width,t=native.height,r=0,b=0;
  for(let y=0;y<native.height;y++)for(let x=0;x<native.width;x++){const i=(y*native.width+x)*4;if(data.data[i+3]){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);}else data.data[i]=data.data[i+1]=data.data[i+2]=0;}
  nc.putImageData(data,0,0);
  // Two transparent texels protect filtering at every frame edge.
  l=Math.max(0,l-2);t=Math.max(0,t-2);r=Math.min(native.width,r+2);b=Math.min(native.height,b+2);
  sign.atlasTrim=[l,t,r-l,b-t];sign.texelDensity=density;
  const tile=document.createElement('canvas');tile.width=r-l;tile.height=b-t;tile.getContext('2d')!.drawImage(native,l,t,r-l,b-t,0,0,r-l,b-t);
  tiles.push({sign,canvas:tile,order:tiles.length});
 }
 // Height-sorted shelves keep denser ink within the unchanged 96 MiB cap.
 const sorted=[...tiles].sort((a,b)=>b.canvas.height-a.canvas.height||a.order-b.order);
 const pack=(width:number)=>{let x=0,y=0,row=0;const frames=[];for(const tile of sorted){const w=tile.canvas.width,h=tile.canvas.height;if(x+w>width){x=0;y+=row;row=0;}frames.push({tile,frame:[x,y,w,h] as [number,number,number,number]});x+=w;row=Math.max(row,h);}return {width,height:y+row,frames};};
 const packed=[768,1024,1280,1536,2048].map(pack).sort((a,b)=>a.width*a.height-b.width*b.height)[0]!;
 const canvas=document.createElement('canvas');canvas.width=packed.width;canvas.height=packed.height;const ctx=canvas.getContext('2d')!;
 for(const {tile,frame} of packed.frames){tile.sign.atlasFrame=frame;ctx.drawImage(tile.canvas,frame[0],frame[1]);}
 return {bands,width:canvas.width,height:canvas.height,bytes:canvas.width*canvas.height*4,bakeMs:performance.now()-start,texelDensity:density,supersample,png:canvas.toDataURL('image/png').split(',')[1]};
};
