import {mapTest} from './support/map-data.ts';
import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {glyphPaths,GLYPH_KINDS,glyphSvg} from '../web/map/furniture.ts';

it('R35 varies composition across eight seeded versions, with filled ink washes',()=>{
 for(const kind of GLYPH_KINDS){
  const versions=Array.from({length:8},(_,v)=>glyphPaths(kind,`${kind}-sheet-${v+1}`));
  expect(new Set(versions.map(paths=>paths.map(p=>p.length).join(','))).size,kind).toBeGreaterThanOrEqual(4);
  expect(glyphSvg(kind,`${kind}-sheet-1`)).toContain('fill=');
 }
});
it('R35 never constructs geographic strokes in the frame loop',()=>{
 const code=readFileSync(new URL('../web/map/renderer.ts',import.meta.url),'utf8');
 expect(code).not.toContain('glyphPaths');
 expect(code).toContain('loadFurnitureAtlas');
 expect(code).toContain('furnitureSprites');
});
it('R35 keeps the compass and scale in a paper margin',()=>{
 const css=readFileSync(new URL('../web/map/map.css',import.meta.url),'utf8');
 expect(css).toContain('/* R35 margin furniture */');
 expect(css).toContain('right:32px!important');
});
mapTest(['union-1861-signs/manifest.json'], 'R35 bakes all three requested mountain bands at wide zoom',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/map-data/union-1861-signs/manifest.json',import.meta.url),'utf8'));
 for(const name of ['Blue Ridge','Alleghenies','southern Appalachians'])expect(manifest.bands[0].signs.some((s:any)=>s.ridgeBand===name),name).toBe(true);
});
