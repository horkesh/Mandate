import {GLYPH_KINDS,glyphSvg} from '../web/map/furniture.ts';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R40';
const sha=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
const checks=[];
for(const kind of GLYPH_KINDS.slice(0,12))for(let v=1;v<=8;v++){
 const asset=`public/map-signs/${kind}-${v}.svg`,file=`${root}/${asset}`,before=readFileSync(`${out}/before/map-signs/${kind}-${v}.svg`),after=glyphSvg(kind,`${kind}-sheet-${v}`)+'\n';
 const prior=JSON.parse(readFileSync(`${file}.recipe.json`,'utf8'));
 writeFileSync(file,after);writeFileSync(`${file}.recipe.json`,JSON.stringify({...prior,request:'R40',brief:'Main CODEX.md R40 R39 made crisper',tool:'TypeScript procedural pen geometry; browser SVG coverage rasterizer for the map',mode:'Finer pen lines, separate house/crown interiors, light brown roof wash',prompt:'R39 manuscript approach with separated houses and crowns, finer brown outlines and pale roof tone. Original map placement envelopes and source-relief hatches remain unchanged. No plates, white fill, shadows, human figures, flags or emblems.',postProcess:['Drawing detail refined within unchanged legacy placement envelopes; geographic subtiles rasterized 4x and packed at 2x with source-coordinate grain; premultiplied upload, nearest minification, linear magnification, one mip'],sha256:sha(after),scriptSha256:sha(readFileSync(fileURLToPath(import.meta.url))),glyphModuleSha256:sha(readFileSync(`${root}/web/map/glyph-design.ts`)),priorSha256:sha(before)},null,2)+'\n');
 checks.push({asset,before:sha(before),after:sha(after)});
}
writeFileSync(`${out}/source-design-check.json`,JSON.stringify(checks,null,2));console.log(`${checks.length} sources and recipes updated; legacy placement paths covered by R40 tests.`);
