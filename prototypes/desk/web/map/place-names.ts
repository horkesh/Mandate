import catalogue from './furniture-r35.json';
import {furnitureScale} from './furniture.ts';
import type {GlyphKind} from './furniture.ts';
import {capitalRank,wideTown} from './furniture-placement.ts';

/** R41 retains the existing place-name hierarchy without loading sign images.
 * Points and names come from runtime geometry, not displaced sign footprints. */
export function placeNameHints(pack:string,date:string,zoom:number){
 if(pack!==catalogue.pack)return [];
 const band=furnitureScale(zoom);
 return catalogue.signs.filter(s=>s.id.startsWith('town:')).map(s=>({
  id:s.id.slice(5),kind:s.kind as GlyphKind,rank:capitalRank(s.id.slice(5),date,s.kind as GlyphKind),
 })).filter(s=>band==='wide'?wideTown(s.id,s.kind,s.rank):band==='close'||s.kind!=='hamlet')
 .sort((a,b)=>(a.rank==='national'?0:a.rank==='state'?1:2)-(b.rank==='national'?0:b.rank==='state'?1:2)||(a.id<b.id?-1:1));
}
