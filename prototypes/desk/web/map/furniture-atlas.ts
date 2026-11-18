import type {FurnitureManifest} from './furniture-plan.ts';
import {deskApi} from '../adapter.ts';
export type {FurnitureManifest,BakedSign} from './furniture-plan.ts';
export async function loadFurnitureAtlas(pack:string){
 if(pack!=='union-1861')return null;
 const manifest=await deskApi.furnitureManifest(pack);
 const image=new Image();image.decoding='async';image.src=`/map-data/${pack}-signs/${manifest.file}?v=${manifest.sha256.slice(0,16)}`;await image.decode();
 if(image.naturalWidth!==manifest.width||image.naturalHeight!==manifest.height)throw Error('Sign atlas dimensions differ.');
 return {manifest,image};
}
