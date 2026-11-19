import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R34/',import.meta.url));
const scene=JSON.parse(readFileSync(`${out}/../R32/opening-snapshot.json`,'utf8'));
const host=(page:Page)=>page.getByTestId('map-canvas-host');
async function ready(page:Page){await expect(host(page)).toHaveAttribute('data-ready','ready',{timeout:20000});await page.evaluate(async()=>{await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));});await expect(host(page)).toHaveAttribute('data-ready','ready');}
async function open(page:Page,palette='strong',signs='on',snapshot=scene){
 await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));await page.goto(`/?palette=${palette}&signs=${signs}`);await ready(page);
}
const diag=async(page:Page)=>JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
async function view(page:Page,name:string){
 if(name==='fit')await page.getByRole('button',{name:'Fit the map',exact:true}).click();
 if(name==='virginia'){await page.getByRole('button',{name:'Show Virginia',exact:true}).click();for(let i=0;i<3;i++)await page.getByRole('button',{name:'Zoom in',exact:true}).click();}
 await ready(page);await page.locator('.table-calendar').hover();
}
function overlaps(a:number[],b:number[]){return a[0]!<b[2]!&&a[2]!>b[0]!&&a[1]!<b[3]!&&a[3]!>b[1]!;}
function check(d:any){
 expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);
 for(const s of d.furniture.drawn){
  for(const label of d.renderedLabels){const b=label.bounds;expect(overlaps(s.box,[b.x,b.y,b.x+b.width,b.y+b.height]),`${s.id} covers ${label.id}`).toBe(false);}
  for(const b of [...d.labelObstacles.live,...d.labelObstacles.overlays])expect(overlaps(s.box,b),`${s.id} covers live mark or furniture`).toBe(false);
 }
 expect(d.control.paint.every((p:any)=>['held','firm'].includes(p.strength))).toBe(true);
}
test('R34 smoke: geography, legend, no numeric control DOM and no command',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));let writes=0;page.on('request',r=>{if(r.method()!=='GET')writes++;});
 await page.setViewportSize({width:1920,height:1080});await open(page);await view(page,'opening');
 const d=await diag(page);check(d);expect(d.furniture.drawn.length).toBeGreaterThan(3);
 expect(await host(page).getAttribute('data-control')).toBeNull();
 await expect(page.getByTestId('control-legend')).toContainText('Firmly held');
 await expect(page.getByTestId('control-legend')).toContainText('Held');
 expect(await page.locator('.drawn-cartouche').count()).toBe(1);
 await page.screenshot({path:`${out}/smoke.png`});
 expect(writes).toBe(0);expect(errors).toEqual([]);writeFileSync(`${out}/smoke.json`,JSON.stringify({d,writes,errors},null,2));
});
test('R34 wash is pixel-identical within each fixed share category',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});const records=[];
 for(const shares of [810,997,510,799]){
  const copy=structuredClone(scene);copy.morning.view.controlBeliefs.washington.shares={union:shares};
  await open(page,'strong','off',copy);await view(page,'opening');
  const d=await diag(page);const image=await page.locator('canvas').screenshot({path:`${out}/wash-proof-${shares}.png`});
  records.push({shares,image,paint:d.control.paint.find((p:any)=>p.id==='washington')});
 }
 writeFileSync(`${out}/wash-debug.json`,JSON.stringify(records.map(({image,...r})=>({...r,bytes:image.length})),null,2));
 expect(records[0]!.image.equals(records[1]!.image)).toBe(true);expect(records[2]!.image.equals(records[3]!.image)).toBe(true);
 expect(records[0]!.image.equals(records[2]!.image)).toBe(false);
 writeFileSync(`${out}/wash-categories.json`,JSON.stringify(records.map(({image,...r})=>({...r,bytes:image.length})),null,2));
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R34 matrix ${size.width}`,async({page})=>{
 await page.setViewportSize(size);const records:any[]=[];const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const palette of ['strong','research'])for(const name of ['fit','opening','virginia']){
  let before:any;
  for(const signs of ['off','on']){
   await open(page,palette,signs);await view(page,name);const d=await diag(page);check(d);
   expect(await host(page).getAttribute('data-control')).toBeNull();
   if(signs==='off'){expect(d.furniture.drawn).toEqual([]);before=d;}else{expect(d.camera).toEqual(before.camera);expect(d.control).toEqual(before.control);expect(d.furniture.drawn.length).toBeGreaterThan(0);}
   const file=`${name}-${palette}-${signs}-${size.width}x${size.height}.png`;await page.screenshot({path:`${out}/${file}`});
   records.push({name,palette,signs,size,file,diagnostics:d});writeFileSync(`${out}/views-${size.width}.json`,JSON.stringify({records,errors},null,2));
  }
 }
 expect(errors).toEqual([]);
});
test('R34 timings use cached atlases and bounded ultrawide pan samples',async({page})=>{
 await page.setViewportSize({width:3440,height:1440});const samples=[];
 for(const palette of ['strong','research'])for(const signs of ['off','on']){
  await open(page,palette,signs);await view(page,'opening');const initial=await diag(page);
  const cadence:number[]=[];
  for(let i=0;i<18;i++){
   const start=performance.now();await page.getByRole('button',{name:i%2?'Pan west':'Pan east',exact:true}).click();await ready(page);cadence.push(performance.now()-start);
  }
  const end=await diag(page);check(end);expect(end.staticBakes).toBe(0);
  samples.push({palette,signs,atlasLoadMs:initial.atlasLoadMs,storedBakeMs:initial.bakeMs,newStaticBakes:end.staticBakes,rawTextureBytes:end.rawTextureBytes,renderer:end.renderer,rendererWorkMs:end.frameTimes.slice(initial.frameTimes.length),automationStepMs:cadence});
 }
 writeFileSync(`${out}/timings-raw.json`,JSON.stringify(samples,null,2));
});
test('R34 glyph sheet rasterizes the delivered SVG',async({page})=>{
 const svg=readFileSync(`${out}/glyph-sheet.svg`,'utf8');await page.setViewportSize({width:1600,height:1180});
 await page.setContent(svg);await page.screenshot({path:`${out}/glyph-sheet.png`});
});
test('R34 reports and fronts keep priority over geographic furniture',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 const saved=JSON.parse(readFileSync(`${out}/../R32/day75-snapshot.json`,'utf8'));
 await open(page,'research','on',saved);await view(page,'virginia');const d=await diag(page);check(d);
 expect(d.control.fronts).toBeGreaterThan(0);
 const origin=await host(page).boundingBox();const buttons=await page.locator('.map-mark').all();
 for(const button of buttons){const box=await button.boundingBox();if(!box||!origin)continue;for(const s of d.furniture.drawn)expect(overlaps(s.box,[box.x-origin.x,box.y-origin.y,box.x+box.width-origin.x,box.y+box.height-origin.y])).toBe(false);}
 await page.screenshot({path:`${out}/priority-real-day75.png`});writeFileSync(`${out}/priority-real-day75.json`,JSON.stringify(d,null,2));
});
test('R34 illustrative arrows also keep priority on the comparison route',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await page.route('**/api/desk',r=>r.fulfill({json:scene}));
 await page.goto('/?study=1&look=A&palette=research&signs=on');await ready(page);const d=await diag(page);check(d);
 expect(d.labelObstacles.live.length).toBeGreaterThan(0);
 await page.screenshot({path:`${out}/priority-illustrative-arrows.png`});
 writeFileSync(`${out}/priority-illustrative-arrows.json`,JSON.stringify({illustrative:true,diagnostics:d},null,2));
});
