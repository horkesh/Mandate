import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=`${root}/public/map-data/union-1861-signs`,sha=(b:string|Buffer)=>createHash('sha256').update(b).digest('hex');
const inputs=['web/map/furniture.ts','web/map/glyph-design.ts','web/map/geographic-material.ts','web/map/furniture-plan.ts','web/map/furniture-placement.ts','web/map/furniture-r35.json','web/map/woodlands.json','web/map/projection.ts','web/furniture-build.ts','scripts/bake-furniture.ts','public/map-data/union-1861.json'];
export async function ensureFurnitureAtlas(force=false){
 const references=inputs.map(path=>({path,sha256:sha(readFileSync(`${root}/${path}`))})),revision=sha(JSON.stringify(references));
 if(!force&&existsSync(`${out}/manifest.json`)){
  const old=JSON.parse(readFileSync(`${out}/manifest.json`,'utf8'));
  if(old.revision===revision&&existsSync(`${out}/${old.file}`)&&sha(readFileSync(`${out}/${old.file}`))===old.sha256){console.log('Geographic sign atlas current.');return;}
 }
 const server=await createServer({root,configFile:false,server:{host:'127.0.0.1',port:5275,strictPort:true},logLevel:'error'});await server.listen();
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:5275/furniture-build.html');await page.waitForFunction(()=>typeof (window as any).buildFurniture==='function');
  const {png,...result}=await page.evaluate(()=>(window as any).buildFurniture());
  mkdirSync(out,{recursive:true});const pixels=Buffer.from(png,'base64'),file='geographic.png';writeFileSync(`${out}/${file}`,pixels);
  const manifest={version:1,revision,file,sha256:sha(pixels),...result};
  writeFileSync(`${out}/${file}.recipe.json`,JSON.stringify({asset:`public/map-data/union-1861-signs/${file}`,request:'R39',date:'2026-11-18',tool:'Chromium SVG rasterizer + Canvas2D',mode:'Static per-band geographic subtiles, manuscript brown and transparent premultiplied-alpha composition below live claims',plan:'Previously confirmed ChatGPT Pro 100; no image service',client:'Codex',model:'Procedural SVG, no image model',apiKeyUnset:!process.env.OPENAI_API_KEY,prompt:'R39 concentrated brown ink with legible transparent roof/crown washes and source-relief flank hatching and map-coordinate grain on unchanged R36 designs and placements. No figures, flags, seals or game art.',requestedSize:'1280 wide, tightly packed 80x64 subtiles',actualSize:`${result.width}x${result.height}`,references,humanEdits:[],postProcess:['Bake native SVG strokes with source-map grain into static band subtiles; preserve every R36 placement and alternative; upload with alpha premultiplication'],provenanceMarks:'None created or removed',sha256:manifest.sha256},null,2));
  writeFileSync(`${out}/manifest.json`,JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({bakeMs:result.bakeMs,bytes:result.bytes,bands:result.bands.map((b:any)=>({name:b.name,signs:b.signs.length,rejected:b.rejected.length}))}));
 }finally{await browser.close();await server.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await ensureFurnitureAtlas(process.argv.includes('--force'));
