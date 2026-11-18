import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R39/',import.meta.url));
const server=await createServer({root,configFile:false,server:{host:'127.0.0.1',port:5275,strictPort:true},logLevel:'error'});await server.listen();
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5275/contrast-proof.html');await page.waitForFunction(()=>typeof (window as any).contrastProof==='function');await page.evaluate(()=>document.fonts.ready);
 const onlyBand=process.env.R39_PROOF_BAND;const suffix=onlyBand?`-${onlyBand}`:'';
 const {png,records}=await page.evaluate(b=>(window as any).contrastProof(b),onlyBand);
 writeFileSync(`${out}/contrast-controlled${suffix}.json`,JSON.stringify({method:'Native shipped subtiles versus same-ground/same-wash raster references. P90 changed-pixel luminance ratio. References use current fresh ink; intentionally aged marks retain fading and collision priority.',records},null,2));
 writeFileSync(`${out}/contrast-controlled${suffix}.png`,Buffer.from(png,'base64'));
 const failures=records.flatMap((r:any)=>r.signs.filter((s:any)=>!s.passesRail||!s.passesPriority).map((s:any)=>({band:r.band,palette:r.palette,paint:r.paint,depth:r.depth,id:s.id,contrast:s.coreP90,rail:r.references.rail.coreP90,upper:Math.min(...['name','report','front'].map(k=>r.references[k].coreP90))})));
 writeFileSync(`${out}/contrast-failures${suffix}.json`,JSON.stringify(failures,null,2));console.log(JSON.stringify({conditions:records.length,signs:records.reduce((n:number,r:any)=>n+r.signs.length,0),failures:failures.length,examples:failures.slice(0,5)}));
 if(failures.length)process.exitCode=1;
}finally{await browser.close();await server.close();}
