import {GLYPH_KINDS,glyphSvg} from '../web/map/furniture.ts';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R39/',import.meta.url));
const sha=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
const shapes=(s:string)=>[...s.matchAll(/(?: d| cx| cy| r)="([^"]*)"/g)].map(m=>m[0]);
const checks=[];mkdirSync(`${out}/before-svg`,{recursive:true});
for(const kind of GLYPH_KINDS.slice(0,12))for(let v=1;v<=8;v++){
 const asset=`public/map-signs/${kind}-${v}.svg`,file=`${root}/${asset}`,before=readFileSync(existsSync(`${out}/before-svg/${kind}-${v}.svg`)?`${out}/before-svg/${kind}-${v}.svg`:file,'utf8'),after=glyphSvg(kind,`${kind}-sheet-${v}`)+'\n';
 if(kind!=='mountain'&&JSON.stringify(shapes(before))!==JSON.stringify(shapes(after)))throw Error(`R36 shape changed: ${asset}`);
 writeFileSync(`${out}/before-svg/${kind}-${v}.svg`,before);
 const prior=JSON.parse(readFileSync(`${file}.recipe.json`,'utf8'));
 writeFileSync(file,after);writeFileSync(`${file}.recipe.json`,JSON.stringify({...prior,request:'R39',brief:'Main CODEX.md R39 legibility, hierarchy and source-relief flank hatching',tool:'TypeScript glyphDesign; original deterministic pen geometry retained',mode:'Concentrated brown manuscript ink, stronger capital outlines, translucent roof/crown tone',prompt:'R36 geographic compositions with stronger brown ink under both washes, transparent interiors and legible roof/crown tone. Source relief hachures join wide hills to existing elevation data. No paper-white fills, badges, shadows, figures, flags, emblems or game-art reference.',postProcess:['Material only; R36 footprint and placement geometry retained; mountain generic flank strokes replaced at bake by spatially thinned original relief hachures'],sha256:sha(after),scriptSha256:sha(readFileSync(fileURLToPath(import.meta.url))),glyphModuleSha256:sha(readFileSync(`${root}/web/map/glyph-design.ts`)),priorSha256:sha(before)},null,2)+'\n');
 checks.push({asset,shapesUnchanged:kind!=='mountain',mountainFlanksFromSourceRelief:kind==='mountain',before:sha(before),after:sha(after)});
}
writeFileSync(`${out}/source-design-check.json`,JSON.stringify(checks,null,2));console.log(`${checks.length} geographic sources: town geometry preserved, source-relief hill flanks, recipes updated.`);
