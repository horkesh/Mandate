import {GLYPH_KINDS,glyphSvg} from '../web/map/furniture.ts';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R34/',import.meta.url));
const folder=`${root}/public/map-signs`;mkdirSync(folder,{recursive:true});
const sha=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex');
const reference={title:'Military map of south-eastern Virginia, A. Lindenkohl, 1864 (LOC 99448891)',sourceUrl:'https://commons.wikimedia.org/wiki/File:Military-map-of-south-eastern-virginia-Lindenkohl_(99448891).png',catalogue:'https://lccn.loc.gov/99448891',path:'sources/coast-survey-1864-reference.png',sha256:sha(`${out}/sources/coast-survey-1864-reference.png`),rights:'Public-domain United States map published in 1864; Commons PD-US-expired statement saved in source-commons-ref.json',use:'Non-figural buildings, sparse geographic symbols and restrained rulework only. No tracing, sampled pixels, roads or later military positions copied.'};
const recipes=[];
for(const kind of GLYPH_KINDS)for(let variant=1;variant<=4;variant++){
 const asset=`${kind}-${variant}.svg`;writeFileSync(`${folder}/${asset}`,glyphSvg(kind,`${kind}-sheet-${variant}`)+'\n');
 const recipe={asset:`public/map-signs/${asset}`,request:'R34',brief:'Main CODEX.md R34, geographic furniture',date:'2026-11-18',plan:'Previously confirmed ChatGPT Pro 100; no image service used',client:'Codex command-line session; client version not queried',model:'Code-assisted procedural SVG; no image model',apiKeyUnset:!process.env.OPENAI_API_KEY,tool:'TypeScript glyphPaths',mode:'Original seeded point strokes',prompt:'Plain manuscript geographic signs using Union Coast Survey conventions, with no figures, seals, flags or game-art references',references:[reference],requestedSize:'80 x 64 SVG units',actualSize:'80 x 64 SVG viewBox',variantsMade:4,variantChosen:variant,seedKey:`${kind}-sheet-${variant}`,runtimeSeed:'Each geographic feature id gives a further unique deterministic variant',humanEdits:[],postProcess:[],provenanceMarks:'No raster model or embedded provenance marks created or removed',sha256:sha(`${folder}/${asset}`),scriptSha256:sha(fileURLToPath(import.meta.url)),glyphModuleSha256:sha(`${root}/web/map/furniture.ts`)};
 writeFileSync(`${folder}/${asset}.recipe.json`,JSON.stringify(recipe,null,2)+'\n');recipes.push(recipe);
}
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
let sheet='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1180" viewBox="0 0 1600 1180"><rect width="1600" height="1180" fill="#eee2c8"/><text x="40" y="45" font-family="serif" font-size="27" fill="#513a29">Geographic signs for the staff map</text>';
GLYPH_KINDS.forEach((kind,i)=>{
 const x=35+i%3*520,y=80+Math.floor(i/3)*215;
 sheet+=`<g transform="translate(${x} ${y})" color="#513a29"><path d="M0 0H490" stroke="#9b8660"/><text x="12" y="34" font-family="serif" font-size="23" fill="currentColor">${esc(kind)}</text>`;
 for(let v=1;v<=4;v++)sheet+=`<g transform="translate(${10+(v-1)*120} 62)">${glyphSvg(kind,`${kind}-sheet-${v}`).replace('<svg ','<svg x="0" y="0" width="112" height="90" ')}</g>`;
 sheet+='</g>';
});
sheet+='</svg>';writeFileSync(`${out}/glyph-sheet.svg`,sheet);
copyFileSync(`${root}/web/map/woodlands.json`,`${out}/woodlands.json`);
writeFileSync(`${out}/glyph-inventory.json`,JSON.stringify({reference,assets:recipes.map(r=>({asset:r.asset,sha256:r.sha256})),svgSheetSha256:sha(`${out}/glyph-sheet.svg`)},null,2));
console.log(JSON.stringify({assets:recipes.length,recipes:recipes.length,sheet:'glyph-sheet.svg'}));
