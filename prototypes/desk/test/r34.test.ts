import {expect,it} from 'vitest';
import {controlStrength} from '../web/map/control.ts';
import {glyphPaths,GLYPH_KINDS,furnitureScale} from '../web/map/furniture.ts';
import {readFileSync} from 'node:fs';

it('R34 exposes only two fixed wash categories, independent of the exact share',()=>{
 const b=(n:number)=>({holder:'us',shares:{us:n},neutralGovernment:false} as any);
 for(const n of [1,400,799])expect(controlStrength(b(n))).toBe('held');
 for(const n of [800,913,1000])expect(controlStrength(b(n))).toBe('firm');
 const source=readFileSync(new URL('../web/map/renderer.ts',import.meta.url),'utf8');
 expect(source).not.toContain('dataset.control=');expect(source).not.toContain('/1000');
});
it('R34 seeded glyphs reproduce, vary by place and contain only finite strokes',()=>{
 for(const kind of GLYPH_KINDS){
  const a=glyphPaths(kind,'washington');expect(a).toEqual(glyphPaths(kind,'washington'));
  expect(a).not.toEqual(glyphPaths(kind,'richmond'));
  expect(a.length).toBeGreaterThan(0);expect(a.flat(2).every(Number.isFinite)).toBe(true);
 }
});
it('R34 semantic density keeps stations and small towns for close views',()=>{
 expect(furnitureScale(1)).toBe('wide');expect(furnitureScale(5)).toBe('theatre');expect(furnitureScale(12)).toBe('close');
});
it('R34 geography has unique feature seeds, sources and finite anchors',()=>{
 const data=JSON.parse(readFileSync(new URL('../web/map/furniture-data.json',import.meta.url),'utf8'));
 expect(new Set(data.signs.map((s:any)=>s.id)).size).toBe(data.signs.length);
 expect(data.signs.every((s:any)=>s.point.length===2&&s.point.every(Number.isFinite)&&s.source)).toBe(true);
 expect(data.stationCount).toBe(0);expect(data.signs.some((s:any)=>s.kind==='station')).toBe(false);
 expect(data.signs.some((s:any)=>s.id.startsWith('graph-crossing:160:'))).toBe(false);
});
it('R34 fixture and area scripts resolve paths from their files with an optional main override',()=>{
 for(const file of ['r29-fixture.ts','r30-areas.py']){
  const source=readFileSync(new URL(`../scripts/${file}`,import.meta.url),'utf8');
  expect(source).not.toMatch(/[A-Za-z]:[\\/]/);expect(source).toContain('MANDATE_MAIN');
 }
});
