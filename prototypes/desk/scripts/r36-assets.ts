import {glyphSvg} from '../web/map/furniture.ts';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const sha=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(let v=1;v<=8;v++){
 const asset=`public/map-signs/mountain-${v}.svg`,target=`${root}/${asset}`;
 const prior=JSON.parse(readFileSync(`${target}.recipe.json`,'utf8'));
 writeFileSync(target,glyphSvg('mountain',`mountain-sheet-${v}`)+'\n');
 writeFileSync(`${target}.recipe.json`,JSON.stringify({...prior,request:'R36',brief:'Main CODEX.md R36: fine brown hill bands along R35 ridges',tool:'TypeScript glyphDesign; original deterministic pen strokes',prompt:'Small open hills in brown ink, more numerous within each ridge group, with fine hatching on one flank. No filled triangles, figures, flags, seals or game art.',sha256:sha(target),scriptSha256:sha(fileURLToPath(import.meta.url)),glyphModuleSha256:sha(`${root}/web/map/glyph-design.ts`)},null,2)+'\n');
}
console.log('Eight mountain SVGs and their recipes refreshed; other glyph assets reused.');
