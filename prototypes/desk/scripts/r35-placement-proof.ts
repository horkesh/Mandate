import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {mapProjection} from '../web/map/projection.ts';
import type {FurnitureManifest} from '../web/map/furniture-atlas.ts';
const root=fileURLToPath(new URL('../',import.meta.url)),out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R35/',import.meta.url));
const manifest=JSON.parse(readFileSync(`${root}/public/map-data/union-1861-signs/manifest.json`,'utf8')) as FurnitureManifest,projection=mapProjection(false);
const records=manifest.bands.flatMap(b=>b.signs.filter(s=>!['bridge','ferry'].includes(s.kind)).map(s=>{
 const [w,n,e,t]=s.box,ring=[];
 for(let i=0;i<4;i++)for(let j=0;j<=16;j++){
  const f=j/16,point:[number,number]=i===0?[w+(e-w)*f,n]:i===1?[e,n+(t-n)*f]:i===2?[e-(e-w)*f,t]:[w,t-(t-n)*f];ring.push(projection.invert!(point));
 }
 ring.push(ring[0]);return {band:b.name,id:s.id,kind:s.kind,ring,source:s.source};
}));
writeFileSync(`${out}/land-footprint-rings.json`,JSON.stringify(records));console.log(`${records.length} inverse-projected footprint rings`);
