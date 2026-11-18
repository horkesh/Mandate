import {GLYPH_KINDS,glyphSvg} from './map/furniture.ts';
import {planFurniture} from './map/furniture-plan.ts';
import type {MapGeometry} from './map/model.ts';
const kinds=GLYPH_KINDS.slice(0,12);
(window as any).buildFurniture=async()=>{
 const start=performance.now(),geometry=await fetch('/public/map-data/union-1861.json').then(r=>r.json()) as MapGeometry;
 const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=1536;const ctx=canvas.getContext('2d')!;
 for(let row=0;row<kinds.length;row++)for(let v=0;v<8;v++){
  const kind=kinds[row]!,svg=glyphSvg(kind,`${kind}-sheet-${v+1}`).replace('<svg ','<svg width="160" height="128" style="color:#513a29" ');
  const image=new Image();image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;await image.decode();ctx.drawImage(image,v*160,row*128,160,128);
 }
 const bands=planFurniture(geometry);
 return {bands,width:canvas.width,height:canvas.height,bytes:canvas.width*canvas.height*4,bakeMs:performance.now()-start,png:canvas.toDataURL('image/png').split(',')[1]};
};
