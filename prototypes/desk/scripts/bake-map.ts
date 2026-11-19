/** Deterministic static images beside ignored geometry. No game is started. */
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import type {AtlasManifest} from '../web/map/atlas-disk.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
const digest=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
const inputs=['web/map/atlas.ts','web/map/projection.ts','web/map/manuscript.ts','web/map/skins.ts','web/map/study-data.ts','web/atlas-build.ts','scripts/bake-map.ts'];
export function atlasRevision(pack:string){return digest([readFileSync(`${root}/public/map-data/${pack}.json`),...inputs.map(p=>readFileSync(`${root}/${p}`))].map(v=>digest(v)).join(':'));}
export async function ensureMapAtlases(packs=['union-1861','testbed'],force=false,preflight=false,onlyLook?:string){
 for(const pack of packs)if(!['union-1861','testbed'].includes(pack))throw Error('Unknown map pack');
 if(onlyLook&&!['A','B','C','0'].includes(onlyLook))throw Error('Unknown look');
 const pending=packs.filter(pack=>{
  const file=`${root}/public/map-data/${pack}-atlas/manifest.json`;
  if(force||!existsSync(file))return true;
  const m=JSON.parse(readFileSync(file,'utf8')) as AtlasManifest;
  return m.revision!==atlasRevision(pack)||Object.values(m.variants).some(v=>v.bands.some(b=>!existsSync(`${root}/public/map-data/${pack}-atlas/${b.file}`)||digest(readFileSync(`${root}/public/map-data/${pack}-atlas/${b.file}`))!==b.sha256));
 });
 if(!pending.length){console.log('Map atlases current; loading saved images.');return;}
 const server=await createServer({root,configFile:false,server:{host:'127.0.0.1',port:5275,strictPort:true},logLevel:'error'});
 await server.listen();const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:5275/atlas-build.html');
  await page.waitForFunction(()=>typeof (window as any).buildAtlas==='function');
  for(const pack of pending){
   const data=readFileSync(`${root}/public/map-data/${pack}.json`);
   const out=`${root}/public/map-data/${pack}-atlas`;mkdirSync(out,{recursive:true});
   const manifest:AtlasManifest={version:1,revision:atlasRevision(pack),geometrySha256:digest(data),variants:{}};
   // Explicit targeted correction: the caller has established that other looks
   // are unaffected. Keep their images and record the exact reused revision.
   if(onlyLook&&existsSync(`${out}/manifest.json`)){
    const prior=JSON.parse(readFileSync(`${out}/manifest.json`,'utf8')) as AtlasManifest;
    if(prior.geometrySha256!==manifest.geometrySha256)throw Error('Geometry changed; a full map bake is required.');
    for(const [key,value] of Object.entries(prior.variants))if(!key.startsWith(`${onlyLook}-`))manifest.variants[key]={...value,reusedFromRevision:prior.revision};
   }
   // Parallel rendering would compete for memory and change the timing evidence.
   for(const look of ['A','B','C','0'])for(const appearance of ['normal','lamp','contrast'])for(const study of look==='A'?[false,true]:[false]){
    if(onlyLook&&look!==onlyLook)continue;
    if(preflight&&(look!=='A'||appearance!=='normal'||study))continue;
    const result=await page.evaluate(async({pack,look,appearance,study})=>(window as any).buildAtlas(pack,look,appearance==='contrast',appearance==='lamp',study),{pack,look,appearance,study});
    const bands=result.bands.map((b:any,i:number)=>{
     const {png,...spec}=b,file=`${result.variant}-${i}.png`,pixels=Buffer.from(png,'base64');writeFileSync(`${out}/${file}`,pixels);
     const sha256=digest(pixels);
     writeFileSync(`${out}/${file}.recipe.json`,JSON.stringify({asset:`prototypes/desk/public/map-data/${pack}-atlas/${file}`,request:'R26',date:'2026-11-18',tool:'Headless Chromium Canvas2D',mode:'static map build',plan:'ChatGPT Pro 100, prior owner confirmation; no image model',client:'Codex',model:'No image model',apiKeyUnset:!process.env.OPENAI_API_KEY,prompt:'Seeded manuscript cartography; CODEX R26',references:[{path:`prototypes/desk/public/map-data/${pack}.json`,sha256:manifest.geometrySha256,sourceRecipe:`prototypes/desk/public/map-data/${pack}.json.recipe.json`}],requestedSize:`${b.width}x${b.height}`,actualSize:`${b.width}x${b.height}`,sha256,humanEdits:[],postProcess:[],provenanceMarks:'Procedural raster; none generated or removed',revision:manifest.revision,illustrative:study,variant:result.variant},null,2));
     return {...spec,file,sha256};
    });
    manifest.variants[result.variant]={bands,bakeMs:result.bakeMs,bytes:result.bytes,paths:result.paths};
    console.log(`${pack} ${result.variant}: ${result.bakeMs.toFixed(1)} ms, ${result.bytes} bytes`);
   }
   // Publish the manifest last; interrupted builds are never treated as current.
   writeFileSync(`${out}/${preflight?'preflight':'manifest'}.json`,JSON.stringify(manifest,null,2));
  }
 }finally{await browser.close();await server.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await ensureMapAtlases(process.argv.includes('--pack')?[process.argv[process.argv.indexOf('--pack')+1]!]:undefined,process.argv.includes('--force'),process.argv.includes('--preflight'),process.argv.includes('--look')?process.argv[process.argv.indexOf('--look')+1]:undefined);
