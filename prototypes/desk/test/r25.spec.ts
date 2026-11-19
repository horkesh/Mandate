import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='../../art-masters/R25';
const snapshot=JSON.parse(readFileSync('../../art-masters/R22/scene-snapshot.json','utf8'));
const sizes=[{width:3440,height:1440},{width:1920,height:1080}];
async function open(page:Page,query:string){
 await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));
 await page.goto(query);await page.evaluate(()=>document.fonts.ready);
 await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});
 await expect.poll(async()=>JSON.parse((await page.getByTestId('map-diagnostics').textContent())!).ready).toBe('ready');
}
async function measure(page:Page){
 const diagnostics=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
 const host=(await page.getByTestId('map-canvas-host').boundingBox())!;
 const html=await page.locator('.study-cartouche,.study-navigation,.study-caption,.map-cartouche,.map-tools,.table-report,.table-commander,.table-tray,.hq-caption,.map-mark').evaluateAll(nodes=>nodes.filter(n=>(n as HTMLElement).offsetWidth>0&&getComputedStyle(n).display!=='none').map(n=>{const b=n.getBoundingClientRect();return {id:n.className,text:n.textContent?.trim(),region:(n as HTMLElement).dataset.region,box:[b.x,b.y,b.right,b.bottom]};}));
 const hit=(a:number[],b:number[])=>a[0]!<b[2]!&&a[2]!>b[0]!&&a[1]!<b[3]!&&a[3]!>b[1]!;
 const captions=html.filter(x=>x.id==='hq-caption'),collisions:any[]=[];
 for(const a of captions){
  for(const b of html)if(a!==b&&hit(a.box,b.box))collisions.push([a.region,b.id]);
  const local=a.box.map((n,i)=>n-(i%2?host.y:host.x));
  for(const [kind,boxes] of Object.entries(diagnostics.labelObstacles) as [string,number[][]][])if(kind!=='overlays')for(const b of boxes)if(hit(local,b)){collisions.push([a.region,kind]);break;}
 }
 for(const l of diagnostics.renderedLabels){
  const b=l.bounds,box=[b.x+host.x,b.y+host.y,b.x+b.width+host.x,b.y+b.height+host.y];
  for(const a of html)if(hit(box,a.box))collisions.push([l.id,a.id]);
 }
 return {diagnostics,html,collisions};
}
test('R25 startup and layout preflight',async({page,request})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const query of ['/?study=1&look=A','/?study=1&look=A&detail=manassas','/?study=1&look=A&layout=table']){
  await open(page,query);const m=await measure(page),id=query.includes('manassas')?'close':query.includes('table')?'D':'A';
  writeFileSync(`${out}/preflight-${id}.json`,JSON.stringify(m,null,2));await page.screenshot({path:`${out}/preflight-${id}.png`});
  expect.soft(m.collisions).toEqual([]);expect(m.diagnostics.atlasSource).toBe('disk');expect(m.diagnostics.staticBakes).toBe(0);
  expect(m.diagnostics.rawTextureBytes).toBeLessThanOrEqual(96*1024*1024);
  const regions=await page.locator('.map-mark.headquarters').evaluateAll(ns=>[...new Set(ns.map(n=>(n as HTMLElement).dataset.region))]);
  expect.soft(m.html.filter(x=>x.id==='hq-caption').map(x=>x.region).sort()).toEqual(regions.sort());
 }
 for(const p of ['/map-data/union-1861-atlas/A-normal-0.png.recipe.json','/map-data/union-1861-atlas/../union-1861.json.recipe.json','/atlas-build.html'])expect((await request.get(p)).status()).toBe(404);
 expect(errors).toEqual([]);
});
test('R25 views, warm opens, and bounded pan sample',async({page})=>{
 test.setTimeout(180000);const records:any[]=[];const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const size of sizes){
  await page.setViewportSize(size);
  for(const [name,query] of [['hero','&detail=hero'],['A',''],['D','&layout=table'],['A-manassas','&detail=manassas'],['A-opening','&detail=theatre']] as const){
   await open(page,`/?study=1&look=A${query}`);const m=await measure(page);
   const opened=await page.evaluate(()=>performance.now());
   writeFileSync(`${out}/measure-${name}-${size.width}.json`,JSON.stringify({...m,opened},null,2));
   await page.screenshot({path:`${out}/${name==='hero'?'hero':'plate-'+name}-${size.width}x${size.height}.png`});
   expect.soft(m.collisions,`${name} ${size.width}`).toEqual([]);expect.soft(m.diagnostics.baseCoverage.inside).toBe(true);expect(m.diagnostics.atlasSource).toBe('disk');
   expect.soft(m.diagnostics.rawTextureBytes).toBeLessThanOrEqual(96*1024*1024);
   if(name==='A-manassas'){
    expect.soft(m.diagnostics.camera.z).toBeCloseTo(m.diagnostics.maximumZoom);
    await page.getByTestId('map-canvas-host').focus();await page.keyboard.press('+');
    await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
    const after=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);expect(after.camera.z).toBeCloseTo(m.diagnostics.maximumZoom);
   }
   let cadence:number[]=[];
   if(name==='A'&&size.width===3440){
    cadence=await page.getByTestId('map-canvas-host').evaluate(async el=>{const times:number[]=[];let previous=performance.now();for(let i=0;i<12;i++){await new Promise<void>(r=>requestAnimationFrame(()=>r()));const now=performance.now();times.push(now-previous);previous=now;el.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowRight':'ArrowLeft',bubbles:true}));}return times;});
   }
   const after=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);expect(after.staticBakes).toBe(0);records.push({name,size,before:m.diagnostics,after,opened,cadence});
  }
 }
 writeFileSync(`${out}/plate-measurements.json`,JSON.stringify({records,errors},null,2));expect(errors).toEqual([]);
});
test('R25 repeated playable opens stay below two seconds and keep mocks out',async({page})=>{
 const records:any[]=[];
 for(const size of sizes){await page.setViewportSize(size);for(let i=0;i<(process.env.DESK_STARTUP_PROFILE==='1'?1:4);i++){
  await open(page,'/');const m=await measure(page);const inspectionCompletedMs=await page.evaluate(()=>performance.now());
  const startup=JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-startup'))!);
  // Renderer timestamps include navigation, first canvas rendering and the last
  // synchronous React caption layout, without subsequent Playwright inspection.
  const elapsed=startup.lastOverlay;
  records.push({size,open:i+1,elapsed,inspectionCompletedMs,startup,atlasLoadMs:m.diagnostics.atlasLoadMs,staticBakes:m.diagnostics.staticBakes});
  expect.soft(m.diagnostics.studyControl).toBeNull();expect(m.diagnostics.staticBakes).toBe(0);expect(m.diagnostics.atlasSource).toBe('disk');
  expect(Number.isFinite(elapsed)).toBe(true);
  // First open is allowed to warm source compilation. Every later open is gated.
  if(records.length>1)expect.soft(elapsed).toBeLessThan(2000);
 }}
 writeFileSync(`${out}/warm-opens.json`,JSON.stringify(records,null,2));
});
test('R25 retained looks load from saved images',async({page})=>{
 await open(page,'/?study=1&look=A');
 for(const look of ['B','C','0','A']){
  await page.getByRole('combobox',{name:'Map look',exact:true}).selectOption(look);
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});
  expect(JSON.parse((await page.getByTestId('map-diagnostics').textContent())!).atlasSource).toBe('disk');
 }
});
