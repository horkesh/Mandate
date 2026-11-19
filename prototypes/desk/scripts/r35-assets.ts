import {GLYPH_KINDS,glyphSvg} from '../web/map/furniture.ts';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R35/',import.meta.url));
const folder=`${root}/public/map-signs`;mkdirSync(folder,{recursive:true});
const sha=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex');
const reference={title:'A. Lindenkohl, Military map of south-eastern Virginia, 1864, LOC 99448891',sourceUrl:'https://commons.wikimedia.org/wiki/File:Military-map-of-south-eastern-virginia-Lindenkohl_(99448891).png',catalogue:'https://lccn.loc.gov/99448891',path:'../R34/sources/coast-survey-1864-reference.png',sha256:sha(`${out}/../R34/sources/coast-survey-1864-reference.png`),rights:'Public domain by publication date; R34 source-commons-ref.json retains the PD-US-expired statement',use:'R34 reference reused for non-figural geographic pen conventions only; no tracing, copied pixels, military positions or roads.'};
const recipes=[];
for(const kind of GLYPH_KINDS)for(let variant=1;variant<=8;variant++){
 const asset=`${kind}-${variant}.svg`,key=`${kind}-sheet-${variant}`;writeFileSync(`${folder}/${asset}`,glyphSvg(kind,key)+'\n');
 const recipe={asset:`public/map-signs/${asset}`,request:'R35',brief:'Main CODEX.md R35; eight varied manuscript compositions',date:'2026-11-18',plan:'Previously confirmed ChatGPT Pro 100; no image service',client:'Codex; client version not exposed',model:'Procedural SVG, no image model',apiKeyUnset:!process.env.OPENAI_API_KEY,tool:'TypeScript glyphDesign',mode:'Seeded composition, pen pressure and wash polygons',prompt:'Geographic signs in manuscript ink, shaded roofs and grey-green woodland wash, open joins and pooled ends. No red, people, flags, seals or game-art references.',references:[reference],requestedSize:'80 x 64 SVG units',actualSize:'80 x 64 SVG viewBox',variantsMade:8,variantChosen:variant,seedKey:key,runtimeSeed:'Stable feature-id hash selects a baked composition',humanEdits:[],postProcess:[],provenanceMarks:'No model metadata created or removed',sha256:sha(`${folder}/${asset}`),scriptSha256:sha(fileURLToPath(import.meta.url)),glyphModuleSha256:sha(`${root}/web/map/glyph-design.ts`)};
 writeFileSync(`${folder}/${asset}.recipe.json`,JSON.stringify(recipe,null,2)+'\n');recipes.push(recipe);
}
let sheet='<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2140" viewBox="0 0 2000 2140"><rect width="2000" height="2140" fill="#eee2c8"/><text x="35" y="45" font-family="serif" font-size="30" fill="#513a29">Geographic signs for the staff map</text>';
GLYPH_KINDS.forEach((kind,i)=>{
 const y=75+i*136;sheet+=`<path d="M30 ${y}H1970" stroke="#b6a483"/><text x="35" y="${y+63}" font-family="serif" font-size="22" fill="#513a29">${kind}</text>`;
 for(let v=1;v<=8;v++)sheet+=`<g transform="translate(${170+(v-1)*223} ${y+8})" color="#513a29">${glyphSvg(kind,`${kind}-sheet-${v}`).replace('<svg ','<svg width="200" height="118" ')}<text x="96" y="122" font-family="serif" font-size="14" fill="#6b5b45">${v}</text></g>`;
});sheet+='</svg>';writeFileSync(`${out}/glyph-sheet.svg`,sheet);
writeFileSync(`${out}/glyph-inventory.json`,JSON.stringify({reference,assets:recipes.map(r=>({asset:r.asset,sha256:r.sha256})),svgSheetSha256:sha(`${out}/glyph-sheet.svg`)},null,2));
console.log(JSON.stringify({assets:recipes.length,recipes:recipes.length,sheet:'glyph-sheet.svg'}));
