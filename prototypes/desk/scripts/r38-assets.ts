import {GLYPH_KINDS,glyphSvg} from '../web/map/furniture.ts';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R38/',import.meta.url));
const sha=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
const shapes=(s:string)=>[...s.matchAll(/(?: d| cx| cy| r)="([^"]*)"/g)].map(m=>m[0]);
const checks=[];mkdirSync(`${out}/before-svg`,{recursive:true});
for(const kind of GLYPH_KINDS.slice(0,12))for(let v=1;v<=8;v++){
 const asset=`public/map-signs/${kind}-${v}.svg`,file=`${root}/${asset}`,before=readFileSync(file,'utf8'),after=glyphSvg(kind,`${kind}-sheet-${v}`)+'\n';
 if(JSON.stringify(shapes(before))!==JSON.stringify(shapes(after)))throw Error(`R36 shape changed: ${asset}`);
 writeFileSync(`${out}/before-svg/${kind}-${v}.svg`,before);
 const prior=JSON.parse(readFileSync(`${file}.recipe.json`,'utf8'));
 writeFileSync(file,after);writeFileSync(`${file}.recipe.json`,JSON.stringify({...prior,request:'R38',brief:'Main CODEX.md R38 ranks 1-3 material trial',tool:'TypeScript glyphDesign; original deterministic pen geometry retained',mode:'Brown manuscript ink, fine outlines and transparent quiet roof/crown washes',prompt:'Unchanged R36 geographic designs in manuscript brown; transparent interiors, quiet ink fills, fine outlines. No paper-white fills, badges, shadows, figures, flags, emblems or game-art reference.',postProcess:['Material only; all path and circle coordinates verified against R36 source SVG'],sha256:sha(after),scriptSha256:sha(readFileSync(fileURLToPath(import.meta.url))),glyphModuleSha256:sha(readFileSync(`${root}/web/map/glyph-design.ts`)),priorSha256:sha(before)},null,2)+'\n');
 checks.push({asset,shapesUnchanged:true,before:sha(before),after:sha(after)});
}
writeFileSync(`${out}/source-design-check.json`,JSON.stringify(checks,null,2));console.log(`${checks.length} geographic sources: geometry unchanged, recipes updated.`);
