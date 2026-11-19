import {deskApi} from '../adapter.ts';
import type {BakedAtlas} from './atlas.ts';
import type {Look} from './skins.ts';
export interface AtlasManifest {
 version:1;revision:string;geometrySha256:string;
 variants:Record<string,{bakeMs:number;bytes:number;paths:number;reusedFromRevision?:string;bands:{file:string;sha256:string;width:number;height:number;box:[number,number,number,number];scale:number;minZoom:number}[]}>;
}
export function atlasVariant(look:Look,contrast:boolean,lamp:boolean,study:boolean){return `${look}-${contrast?'contrast':lamp?'lamp':'normal'}${look==='A'&&study?'-study':''}`;}
const manifests=new Map<string,Promise<AtlasManifest>>();
/** Images are decoded in parallel. No cartographic drawing occurs in the desk. */
export async function loadAtlas(pack:string,look:Look,contrast:boolean,lamp:boolean,study:boolean):Promise<BakedAtlas>{
 const started=performance.now();
 if(!manifests.has(pack))manifests.set(pack,deskApi.atlasManifest(pack));
 const manifest=await manifests.get(pack)!;
 const variant=manifest.variants[atlasVariant(look,contrast,lamp,study)];
 if(!variant)throw Error('Map atlas variant is missing; rebuild the map atlas.');
 const bands=await Promise.all(variant.bands.map(async b=>{
  const canvas=new Image();canvas.decoding='async';canvas.src=`/map-data/${pack}-atlas/${b.file}?v=${b.sha256.slice(0,16)}`;await canvas.decode();
  if(canvas.naturalWidth!==b.width||canvas.naturalHeight!==b.height)throw Error('Map atlas dimensions do not match its manifest.');
  return {canvas,box:b.box,scale:b.scale,minZoom:b.minZoom};
 }));
 return {bands,bakeMs:variant.bakeMs,bytes:variant.bytes,paths:variant.paths,loadMs:performance.now()-started,source:'disk'};
}
