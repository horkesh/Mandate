import {mapTest} from './support/map-data.ts';
import {expect,it} from 'vitest';
import {glyphSvg} from '../web/map/furniture.ts';
import {readFileSync} from 'node:fs';
it('R39 ink priority retains transparent interiors with R40 finer drawing weights',()=>{
 for(const kind of ['town','capital','woods'] as const){
  const svg=glyphSvg(kind,`${kind}-sheet-1`);
  const widths=[...svg.matchAll(/stroke-width="([\d.]+)"/g)].map(m=>Number(m[1]));
  expect(Math.min(...widths)).toBeGreaterThanOrEqual(.7);
  // R40 supersedes heavy R39 roofs; priority is established by the unchanged
  // controlled contrast target while drawing interiors retain a pale tone.
  expect(svg).toMatch(/fill-opacity="0.12"/);
  expect(svg).not.toMatch(/#fff|#ead9b3|filter=|shadow/i);
 }
 const widths=(kind:'capital'|'town')=>[...glyphSvg(kind,`${kind}-sheet-1`).matchAll(/stroke-width="([\d.]+)"/g)].map(m=>Number(m[1]));
 expect(Math.min(...widths('capital'))).toBeGreaterThan(Math.max(...widths('town')));
});
it('R39 wide hill bake takes flank hatching from the existing elevation geometry',()=>{
 const bake=readFileSync(new URL('../web/furniture-build.ts',import.meta.url),'utf8');
 expect(bake).toContain('ridgeHatches');
 expect(bake).toContain('geographicSvg');
});

mapTest(['union-1861.json', 'union-1861-signs/manifest.json'], 'R39 ridge flank endpoints remain sourced and density is bounded at fit',async()=>{
 const {ridgeHatches}=await import('../web/map/geographic-material.ts');
 const geometry=JSON.parse(readFileSync(new URL('../public/map-data/union-1861.json',import.meta.url),'utf8'));
 const manifest=JSON.parse(readFileSync(new URL('../public/map-data/union-1861-signs/manifest.json',import.meta.url),'utf8'));
 const {mapProjection}=await import('../web/map/projection.ts');const project=mapProjection(false);
 for(const sign of manifest.bands[0].signs.filter((s:any)=>s.kind==='mountain')){
  const hs=ridgeHatches(geometry,sign);expect(hs.length).toBeGreaterThan(10);expect(hs.length).toBeLessThan(200);
  const cells=new Set(hs.map(h=>`${Math.floor(h.a[0]/3)}:${Math.floor(h.a[1]/3)}`));expect(cells.size).toBe(hs.length);
  for(const h of hs){const source=geometry.cartography.relief[h.sourceIndex];for(const [local,original] of [[h.a,source.a],[h.b,source.b]] as const){const p=project(original)!;expect(local[0]*sign.factor+sign.point[0]).toBeCloseTo(p[0],8);expect(local[1]*sign.factor+sign.point[1]).toBeCloseTo(p[1],8);}}
 }
});
