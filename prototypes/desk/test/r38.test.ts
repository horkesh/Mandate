import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {readControlPalette} from '../web/map/control-palettes.ts';
import {glyphSvg,glyphDesign} from '../web/map/furniture.ts';
it('R38 defaults to research while retaining an explicit strong comparison',()=>{
 expect(readControlPalette('')).toBe('research');
 expect(readControlPalette('?palette=unknown')).toBe('research');
 expect(readControlPalette('?palette=strong')).toBe('strong');
});
it('R38 geographic ink shares manuscript brown with quiet transparent fills',()=>{
 for(const kind of ['capital','town','woods','mountain'] as const){
  const svg=glyphSvg(kind,`${kind}-sheet-1`);
  expect(svg).toContain('#68472f');
  expect(svg).not.toContain('currentColor');
  expect(svg).not.toMatch(/#fff|#ead9b3|filter=|shadow/i);
  for(const f of glyphDesign(kind,`${kind}-sheet-1`).fills)expect(f.opacity).toBeLessThanOrEqual(.18);
 }
});
it('R38 composes the baked geographic subtiles below live washes without per-pan paths',()=>{
 const code=readFileSync(new URL('../web/map/renderer.ts',import.meta.url),'utf8');
 expect(code).toContain('this.world.addChild(this.tiles,this.furniture,this.washes,this.arrows)');
 expect(code).not.toContain('this.content.addChild(this.world,this.furniture,this.labels)');
 expect(code).not.toContain('glyphPaths');
 expect(code).toContain("alphaMode:'premultiply-alpha-on-upload'");
});
it('R38 water names do not use the land-label displacement search',()=>{
 const code=readFileSync(new URL('../web/map/renderer.ts',import.meta.url),'utf8');
 expect(code).toContain("r.kind!=='sea'&&ring<=");
 expect(code).toContain("r.id==='delaware_bay'");
});

it('R38 preserves non-geographic ornaments byte-for-byte',()=>{
 for(const kind of ['compass','scale','cartouche'] as const){
  expect(glyphSvg(kind,`${kind}-sheet-1`)).toBe(readFileSync(new URL(`../public/map-signs/${kind}-1.svg`,import.meta.url),'utf8').trim());
 }
});
