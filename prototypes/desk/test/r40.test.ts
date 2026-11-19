import {expect,it} from 'vitest';
import {glyphSvg,glyphPaths,glyphDesign} from '../web/map/glyph-design.ts';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
it('R40 uses narrow separate drawing strokes and light roof/crown tone',()=>{
 for(const kind of ['city','town','capital','woods'] as const)for(let v=1;v<=8;v++){
  const svg=glyphSvg(kind,`${kind}-sheet-${v}`);
  const widths=[...svg.matchAll(/stroke-width="([\d.]+)"/g)].map(m=>Number(m[1]));
  expect(Math.max(...widths)).toBeLessThanOrEqual(kind==='capital'?1.25:1.05);
  const fills=[...svg.matchAll(/fill-opacity="([\d.]+)"/g)].map(m=>Number(m[1]));
  expect(Math.max(...fills)).toBeLessThanOrEqual(.15);
  expect(svg).not.toMatch(/#fff|shadow|filter=/i);
 }
});
it('R40 keeps R39 placement paths byte-identical',()=>{
 const before=JSON.parse(readFileSync(new URL('./r40-placement-hashes.json',import.meta.url),'utf8'));
 for(const [key,value] of Object.entries(before)){const [kind,v]=key.split(':');expect(createHash('sha256').update(JSON.stringify(glyphPaths(kind as any,`${kind}-sheet-${v}`))).digest('hex')).toBe(value);}
});
it('R40 leaves paper between neighbouring houses and crowns',()=>{
 for(const kind of ['hamlet','town','city','capital','woods'] as const)for(let v=1;v<=8;v++){
  const {islands}=glyphDesign(kind,`${kind}-sheet-${v}`,true);
  for(let i=0;i<islands.length;i++)for(const b of islands.slice(i+1)){
   const a=islands[i]!,gap=Math.max(b[0]![0]-a[1]![0],a[0]![0]-b[1]![0],b[0]![1]-a[1]![1],a[0]![1]-b[1]![1]);
   expect(gap,`${kind}-${v} islands ${i}`).toBeGreaterThan(1.1);
  }
 }
});
