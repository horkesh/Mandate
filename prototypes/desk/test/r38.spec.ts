import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {boxDistance,wideTown} from '../web/map/furniture-placement.ts';
const out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R38/',import.meta.url));
const scene=JSON.parse(readFileSync(`${out}/../R32/opening-snapshot.json`,'utf8'));
const host=(page:Page)=>page.getByTestId('map-canvas-host');
async function ready(page:Page){await expect(host(page)).toHaveAttribute('data-ready','ready',{timeout:20000});await page.evaluate(async()=>{await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));});await expect(host(page)).toHaveAttribute('data-ready','ready');}
async function open(page:Page,palette='',signs='on',snapshot=scene){await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));await page.goto(`/?palette=${palette}&signs=${signs}`);await ready(page);}
const diag=async(page:Page)=>JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
async function view(page:Page,name:string){
 if(name==='fit')await page.getByRole('button',{name:'Fit the map',exact:true}).click();
 if(name==='virginia'){await page.getByRole('button',{name:'Show Virginia',exact:true}).click();for(let i=0;i<3;i++){await page.getByRole('button',{name:'Zoom in',exact:true}).click();await ready(page);}}
 await ready(page);await page.locator('.table-calendar').hover();
}
function overlap(a:number[],b:number[]){return a[0]!<b[2]!&&a[2]!>b[0]!&&a[1]!<b[3]!&&a[3]!>b[1]!;}
function check(d:any,name:string){

 expect(d.furniture.layerOrder).toEqual(['base','geographic-signs','claims','operations']);expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);expect(d.furniture.source).toBe('baked');
 for(let i=0;i<d.furniture.drawn.length;i++){
  const s=d.furniture.drawn[i];
  for(const other of d.furniture.drawn.slice(i+1))expect(overlap(s.box,other.box),`${s.id} covers ${other.id}`).toBe(false);
  for(const label of d.renderedLabels){const b=label.bounds;expect(overlap(s.box,[b.x,b.y,b.x+b.width,b.y+b.height]),`${s.id} covers ${label.id}`).toBe(false);}
  for(const b of [...d.labelObstacles.live,...d.labelObstacles.overlays])expect(overlap(s.box,b),`${s.id} covers live mark or paper`).toBe(false);
  if(s.id.startsWith('town:')){
   expect(s.nameBox,`${s.id} has its adjacent name`).toBeDefined();
   expect(s.nameGap).toBeLessThan(Math.max(s.box[2]-s.box[0],s.box[3]-s.box[1])/2+12);
   const zoom={wide:3.029,theatre:11.949,close:16.966}[d.furniture.scale as 'wide'|'theatre'|'close'];
   expect(s.pointDistance).toBeLessThanOrEqual(88*d.camera.z/zoom+.01);
   for(const label of d.renderedLabels.filter((l:any)=>l.id!==s.id.slice(5)&&!l.id.startsWith('river-'))){const b=label.bounds;expect(boxDistance(s.point,[b.x-3,b.y-3,b.x+b.width+3,b.y+b.height+3])+.01,`${s.id} nearer ${label.id} than its own name`).toBeGreaterThanOrEqual(s.nameGap);}
   if(name==='fit')expect(wideTown(s.id.slice(5),s.kind,s.rank),s.id).toBe(true);
  }
 }
 if(name==='virginia')expect(d.renderedLabels.some((l:any)=>l.id==='delaware_bay'),'Delaware Bay label on its own water').toBe(true);
 if(name==='virginia')for(const id of ['town:washington','town:richmond'])expect(d.furniture.drawn.some((s:any)=>s.id===id),`${id} visible with its name`).toBe(true);
 if(name==='fit'){
  expect(d.furniture.drawn.filter((s:any)=>s.kind==='capital').map((s:any)=>s.id).sort()).toEqual(['town:montgomery','town:washington']);
  expect(d.furniture.drawn.filter((s:any)=>s.kind==='mountain').length).toBeGreaterThan(10);
 }
}
test('R38 preflight checks placement before the matrix',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});const results=[],errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const name of (process.env.R38_WATER_ONLY?['virginia']:['virginia','fit','opening'])){
  await open(page);await view(page,name);const d=await diag(page);results.push({name,diagnostics:d});
  await page.screenshot({path:`${out}/preflight-${name}.png`});writeFileSync(`${out}/preflight.json`,JSON.stringify({results,errors},null,2));if(!process.env.R38_DIAG_ONLY)check(d,name);
 }
 expect(errors).toEqual([]);
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R38 matrix ${size.width}`,async({page})=>{
 await page.setViewportSize(size);const records:any[]=[],errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));let writes=0;page.on('request',r=>{if(r.method()!=='GET')writes++;});
 for(const palette of ['research'])for(const name of ['fit','virginia']){
  await open(page,palette);await view(page,name);const d=await diag(page),file=`${name}-${palette}-on-${size.width}x${size.height}.png`;
  await page.screenshot({path:`${out}/${file}`});records.push({name,palette,signs:'on',size,file,diagnostics:d});writeFileSync(`${out}/views-${size.width}.json`,JSON.stringify({records,errors,writes},null,2));check(d,name);
  expect(await host(page).getAttribute('data-control')).toBeNull();
 }
 expect(errors).toEqual([]);expect(writes).toBe(0);
});
test('R38 matched frame timings',async({page})=>{
 await page.setViewportSize({width:3440,height:1440});const samples=[];
 for(const palette of ['research'])for(const signs of ['off','on']){
  await open(page,palette,signs);const initial=await diag(page),cadence:number[]=[];
  for(let i=0;i<18;i++){const start=performance.now();await page.getByRole('button',{name:i%2?'Pan west':'Pan east',exact:true}).click();await ready(page);cadence.push(performance.now()-start);}
  const end=await diag(page);if(signs==='on')check(end,'opening');
  samples.push({palette,signs,atlasLoadMs:initial.atlasLoadMs,storedBaseBakeMs:initial.bakeMs,signBakeMs:initial.furniture.bakeMs,newStaticBakes:end.staticBakes,rawTextureBytes:end.rawTextureBytes,renderer:end.renderer,rendererWorkMs:end.frameTimes.slice(initial.frameTimes.length),automationStepMs:cadence});
  writeFileSync(`${out}/timings-raw.json`,JSON.stringify(samples,null,2));
 }
});
test('R38 preserves later report and front priority',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});const later=JSON.parse(readFileSync(`${out}/../R32/day75-snapshot.json`,'utf8'));
 await open(page,'research','on',later);await view(page,'virginia');const d=await diag(page);writeFileSync(`${out}/priority-real-day75.json`,JSON.stringify(d,null,2));
 expect(d.control.fronts).toBeGreaterThan(0);
 // Reports/fronts can suppress geography; Washington visibility is required in
 // the opening Virginia view, not at the expense of a later reported front.
 check(d,'later');await page.screenshot({path:`${out}/priority-real-day75.png`});
});

test('R38 wash pixel proof uses the same camera with and without claims',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});const records:any[]=[];
 const prior=process.env.R38_REUSE_PROBE?JSON.parse(readFileSync(`${out}/pixel-probe.json`,'utf8')).records:[];
 for(const claims of ['received','none'])for(const signs of ['on','off']){
  if(process.env.R38_REUSE_PROBE&&!(claims==='received'&&signs==='on')){records.push(prior.find((r:any)=>r.claims===claims&&r.signs===signs));continue;}
  const snapshot=structuredClone(scene);
  if(claims==='none'){snapshot.morning.view.controlBeliefs={};snapshot.morning.view.claimedFronts=[];}
  await open(page,'research',signs,snapshot);await view(page,'virginia');const d=await diag(page);
  expect(d.staticBakes).toBe(0);expect(d.furniture.layerOrder).toEqual(['base','geographic-signs','claims','operations']);
  const file=`probe-${claims}-${signs}.png`;await page.screenshot({path:`${out}/${file}`});records.push({claims,signs,file,diagnostics:d});
 }
 writeFileSync(`${out}/pixel-probe-cameras.json`,JSON.stringify(records.map(r=>({claims:r.claims,signs:r.signs,file:r.file,camera:r.diagnostics.camera})),null,2));
 expect(records.every(r=>JSON.stringify(r.diagnostics.camera)===JSON.stringify(records[0]!.diagnostics.camera))).toBe(true);
 writeFileSync(`${out}/pixel-probe.json`,JSON.stringify({purpose:'Diagnostic only: remove received claims in two copies; selected comparison captures use the unchanged real snapshot.',records},null,2));
});
