import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R35/',import.meta.url));
const scene=JSON.parse(readFileSync(`${out}/../R32/opening-snapshot.json`,'utf8'));
const host=(page:Page)=>page.getByTestId('map-canvas-host');
async function ready(page:Page){await expect(host(page)).toHaveAttribute('data-ready','ready',{timeout:20000});await page.evaluate(async()=>{await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));});await expect(host(page)).toHaveAttribute('data-ready','ready');}
async function open(page:Page,palette='strong',signs='on',snapshot=scene){await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));await page.goto(`/?palette=${palette}&signs=${signs}`);await ready(page);}
const diag=async(page:Page)=>JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
async function view(page:Page,name:string){
 if(name==='fit')await page.getByRole('button',{name:'Fit the map',exact:true}).click();
 if(name==='virginia'){await page.getByRole('button',{name:'Show Virginia',exact:true}).click();for(let i=0;i<3;i++)await page.getByRole('button',{name:'Zoom in',exact:true}).click();}
 await ready(page);await page.locator('.table-calendar').hover();
}
function overlaps(a:number[],b:number[]){return a[0]!<b[2]!&&a[2]!>b[0]!&&a[1]!<b[3]!&&a[3]!>b[1]!;}
function check(d:any){
 expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);expect(d.furniture.source).toBe('baked');
 for(let i=0;i<d.furniture.drawn.length;i++){
  const s=d.furniture.drawn[i];
  for(const other of d.furniture.drawn.slice(i+1))expect(overlaps(s.box,other.box),`${s.id} covers ${other.id}`).toBe(false);
  for(const label of d.renderedLabels){const b=label.bounds;expect(overlaps(s.box,[b.x,b.y,b.x+b.width,b.y+b.height]),`${s.id} covers ${label.id}`).toBe(false);}
  for(const b of [...d.labelObstacles.live,...d.labelObstacles.overlays])expect(overlaps(s.box,b),`${s.id} covers live mark or paper`).toBe(false);
 }
}
test('R35 preflight checks three scenes before the capture matrix',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));let writes=0;page.on('request',r=>{if(r.method()!=='GET')writes++;});
 await page.setViewportSize({width:1920,height:1080});await open(page);const results=[];
 for(const name of ['opening','fit','virginia']){
  await view(page,name);const d=await diag(page);check(d);expect(d.furniture.drawn.length).toBeGreaterThan(0);
  if(name==='fit')expect(d.furniture.drawn.filter((s:any)=>s.kind==='mountain').length).toBeGreaterThan(4);
  const origin=await host(page).boundingBox(),margin=await page.locator('.map-scale').boundingBox();expect(margin!.x).toBeGreaterThan(1700);
  for(const selector of ['.table-paper','.table-books','.control-legend','.map-cartouche','.table-run'])for(const box of await page.locator(selector).all()){
   const b=await box.boundingBox();if(b)expect(overlaps([margin!.x,margin!.y,margin!.x+margin!.width,margin!.y+margin!.height],[b.x,b.y,b.x+b.width,b.y+b.height]),selector).toBe(false);
  }
  await page.screenshot({path:`${out}/preflight-${name}.png`});results.push({name,d,margin,origin});
 }
 expect(writes).toBe(0);expect(errors).toEqual([]);writeFileSync(`${out}/preflight.json`,JSON.stringify({results,writes,errors},null,2));
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R35 matrix ${size.width}`,async({page})=>{
 const refresh=process.env.R35_ON_ONLY==='1';
 await page.setViewportSize(size);const records:any[]=refresh?JSON.parse(readFileSync(`${out}/views-${size.width}.json`,'utf8')).records.filter((r:any)=>r.signs==='off'):[];const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const palette of ['strong','research'])for(const name of ['fit','opening','virginia']){
  let before:any=refresh?records.find(r=>r.name===name&&r.palette===palette).diagnostics:undefined;
  for(const signs of refresh?['on']:['off','on']){
   await open(page,palette,signs);await view(page,name);const d=await diag(page);check(d);
   expect(await host(page).getAttribute('data-control')).toBeNull();
   if(signs==='off'){expect(d.furniture.drawn).toEqual([]);before=d;}else{expect(d.camera).toEqual(before.camera);expect(d.control).toEqual(before.control);expect(d.furniture.drawn.length).toBeGreaterThan(0);}
   const file=`${name}-${palette}-${signs}-${size.width}x${size.height}.png`;await page.screenshot({path:`${out}/${file}`});
   records.push({name,palette,signs,size,file,diagnostics:d});writeFileSync(`${out}/views-${size.width}.json`,JSON.stringify({records,errors},null,2));
  }
 }
 expect(errors).toEqual([]);
});
test('R35 timings compare baked signs and no signs on the same real scene',async({page})=>{
 await page.setViewportSize({width:3440,height:1440});const samples=[];
 for(const palette of ['strong','research'])for(const signs of ['off','on']){
  await open(page,palette,signs);await view(page,'opening');const initial=await diag(page),cadence:number[]=[];
  for(let i=0;i<18;i++){const start=performance.now();await page.getByRole('button',{name:i%2?'Pan west':'Pan east',exact:true}).click();await ready(page);cadence.push(performance.now()-start);}
  const end=await diag(page);check(end);
  samples.push({palette,signs,atlasLoadMs:initial.atlasLoadMs,storedBaseBakeMs:initial.bakeMs,signBakeMs:initial.furniture.bakeMs,newStaticBakes:end.staticBakes,rawTextureBytes:end.rawTextureBytes,renderer:end.renderer,rendererWorkMs:end.frameTimes.slice(initial.frameTimes.length),automationStepMs:cadence});
  writeFileSync(`${out}/timings-raw.json`,JSON.stringify(samples,null,2));
 }
});
test('R35 steady pan stays within 40 ms of renderer work',async({page})=>{
 await page.setViewportSize({width:3440,height:1440});await open(page);await view(page,'opening');const initial=await diag(page);
 for(let i=0;i<8;i++){await page.getByRole('button',{name:i%2?'Pan west':'Pan east',exact:true}).click();await ready(page);}
 const end=await diag(page),samples=end.frameTimes.slice(initial.frameTimes.length).sort((a:number,b:number)=>a-b),median=samples[Math.floor(samples.length/2)];
 writeFileSync(`${out}/pan-gate.json`,JSON.stringify({samples,median,profile:end.frameProfile},null,2));expect(median).toBeLessThanOrEqual(40);
});
test('R35 report and front priority uses the retained real day-75 view',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});const saved=JSON.parse(readFileSync(`${out}/../R32/day75-snapshot.json`,'utf8'));
 await open(page,'research','on',saved);await view(page,'virginia');const d=await diag(page);check(d);expect(d.control.fronts).toBeGreaterThan(0);
 await page.screenshot({path:`${out}/priority-real-day75.png`});writeFileSync(`${out}/priority-real-day75.json`,JSON.stringify(d,null,2));
});
test('R35 caches invalidate for palette, zoom and newly received view',async({page,request})=>{
 await page.setViewportSize({width:1920,height:1080});await open(page);const first=await diag(page);
 await page.getByRole('button',{name:'Pan east',exact:true}).click();await ready(page);const pan=await diag(page);expect(pan.control.rebuilds).toBe(first.control.rebuilds);
 await page.getByRole('combobox',{name:'Map look',exact:true}).selectOption('A:research');await ready(page);const palette=await diag(page);expect(palette.control.rebuilds).toBeGreaterThan(pan.control.rebuilds);
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();await ready(page);const zoom=await diag(page);expect(zoom.control.rebuilds).toBeGreaterThan(palette.control.rebuilds);
 const later=JSON.parse(readFileSync(`${out}/../R32/day75-snapshot.json`,'utf8'));
 // Regression fixture: replace the current morning through the normal reply
 // boundary with a retained real later view. No invented report or live game.
 await page.route('**/api/command',r=>r.fulfill({json:{ok:true,snapshot:later}}));
 await page.getByRole('button',{name:'Write an order',exact:true}).click();await page.getByRole('textbox',{name:'Console command',exact:true}).fill('help');
 await page.getByRole('button',{name:'Sign to out-tray',exact:true}).click();await page.keyboard.press('Escape');await ready(page);const received=await diag(page);
 expect(received.control.rebuilds).toBeGreaterThan(zoom.control.rebuilds);expect(received.control.paint.find((p:any)=>p.id==='washington').colour).toBe(0xc33830);
 const served=[];for(const [url,status] of [['/map-data/union-1861-signs/manifest.json',200],['/map-data/union-1861-signs/geographic.png',200],['/map-data/union-1861-signs/geographic.png.recipe.json',404],['/map-data/union-1861-signs/unknown.png',404]] as const){const r=await request.get(url);expect(r.status(),url).toBe(status);served.push({url,status:r.status()});}
 writeFileSync(`${out}/cache-invalidation.json`,JSON.stringify({first:first.control.rebuilds,pan:pan.control.rebuilds,palette:palette.control.rebuilds,zoom:zoom.control.rebuilds,received:received.control.rebuilds,served},null,2));
});
test('R35 glyph sheet rasterizes',async({page})=>{
 const svg=readFileSync(`${out}/glyph-sheet.svg`,'utf8');await page.setViewportSize({width:2000,height:2140});await page.setContent(svg);await page.screenshot({path:`${out}/glyph-sheet.png`});
});
