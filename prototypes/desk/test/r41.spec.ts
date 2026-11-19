import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL('../../../../ByOrderOfThePresident/art-masters/R41/',import.meta.url));
const scene=JSON.parse(readFileSync(`${out}/../R32/opening-snapshot.json`,'utf8'));
const host=(page:Page)=>page.getByTestId('map-canvas-host');
async function ready(page:Page){
 await expect(host(page)).toHaveAttribute('data-ready','ready',{timeout:20000});
 await page.evaluate(async()=>{await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));});
 await expect(host(page)).toHaveAttribute('data-ready','ready');
}
async function open(page:Page,query='',snapshot=scene){await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));await page.goto(`/${query}`);await ready(page);}
const diag=async(page:Page)=>JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
async function view(page:Page,name:string){
 if(name==='fit')await page.getByRole('button',{name:'Fit the map',exact:true}).click();
 if(name==='virginia'){await page.getByRole('button',{name:'Show Virginia',exact:true}).click();for(let i=0;i<3;i++){await page.getByRole('button',{name:'Zoom in',exact:true}).click();await ready(page);}}
 await ready(page);await page.locator('.table-calendar').hover();
}
function overlaps(a:number[],b:number[]){return a[0]!<b[2]!&&a[2]!>b[0]!&&a[1]!<b[3]!&&a[3]!>b[1]!;}
function checkOff(d:any){
 expect(d.furniture.enabled).toBe(false);expect(d.furniture.bytes).toBe(0);expect(d.furniture.drawn).toEqual([]);expect(d.furniture.hidden).toEqual([]);
 expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);expect(d.atlasSource).toBe('disk');expect(d.palette).toBe('research');
 // The comparison route's estimate/draft captions are operational ink, not
 // geographic names; they can meet their own operational anchor strokes.
 for(const label of d.renderedLabels.filter((l:any)=>!['estimate','draft'].includes(l.id))){const b=label.bounds,box=[b.x,b.y,b.x+b.width,b.y+b.height];
  for(const obstacle of [...d.labelObstacles.live,...d.labelObstacles.overlays])expect(overlaps(box,obstacle),`${label.id} covers a live mark or paper`).toBe(false);
 }
}
test('R41 preflight defaults to the straight map without fetching sign assets',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});const requests:string[]=[],errors:string[]=[];
 page.on('request',r=>{if(r.url().includes('union-1861-signs/'))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await open(page);const d=await diag(page);
 await page.screenshot({path:`${out}/${process.env.R41_RUN??'preflight'}-opening.png`});
 writeFileSync(`${out}/${process.env.R41_RUN??'preflight'}.json`,JSON.stringify({diagnostics:d,requests,errors},null,2));
 checkOff(d);expect(requests).toEqual([]);expect(errors).toEqual([]);
 await expect(page.locator('.map-scale .north-rose svg')).toHaveCount(1);await expect(page.locator('.map-scale .decorated-bar svg')).toHaveCount(1);
 await expect(page.locator('.map-scale b')).toContainText('miles');
 expect(await page.getByRole('combobox',{name:'Map look'}).locator('option').allTextContents()).not.toEqual(expect.arrayContaining([expect.stringMatching(/pictorial|signs/i)]));
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R41 name preflight ${size.width}`,async({page})=>{
 await page.setViewportSize(size);const results:any[]=[];
 for(const name of ['opening','fit','virginia']){
  await open(page);await view(page,name);const d=await diag(page);
  const prior=size.width===1920&&name==='opening'
   ?JSON.parse(readFileSync(`${out}/../R40/preflight.json`,'utf8')).results.find((r:any)=>r.name===name).diagnostics
   :JSON.parse(readFileSync(`${out}/../${name==='opening'?'R36':'R40'}/views-${size.width}.json`,'utf8')).records.find((r:any)=>r.name===name&&r.palette==='research').diagnostics;
  const towns=prior.furniture.drawn.filter((s:any)=>s.id.startsWith('town:')).map((s:any)=>s.id.slice(5));
  const missing=towns.filter((id:string)=>!d.renderedLabels.some((l:any)=>l.id===id));
  const gaps=prior.furniture.drawn.filter((s:any)=>s.id.startsWith('town:')).map((s:any)=>{
   const label=d.renderedLabels.find((l:any)=>l.id===s.id.slice(5));if(!label)return {id:s.id,gap:Infinity,oldGap:0};
   const b=label.bounds,[x,y]=s.anchor,old=s.nameBox;
   return {id:s.id,gap:Math.hypot(Math.max(b.x-x,0,x-b.x-b.width),Math.max(b.y-y,0,y-b.y-b.height)),oldGap:Math.hypot(Math.max(old[0]-x,0,x-old[2]),Math.max(old[1]-y,0,y-old[3]))};
  });
  results.push({name,towns,missing,gaps,diagnostics:d});writeFileSync(`${out}/name-preflight-${size.width}.json`,JSON.stringify(results,null,2));
  checkOff(d);expect(d.camera).toEqual(prior.camera);
  for(const g of gaps)expect(g.gap,g.id).toBeLessThanOrEqual(g.oldGap+.01);
  if(process.env.R41_REFRESH_CAPTURES){const old=JSON.parse(readFileSync(`${out}/views-${size.width}.json`,'utf8')),record=old.records.find((r:any)=>r.name===name);
   if(JSON.stringify(record.diagnostics.renderedLabels)!==JSON.stringify(d.renderedLabels)){
    const file=record.file;await page.screenshot({path:`${out}/${file}`});record.diagnostics=d;
    writeFileSync(`${out}/views-${size.width}.json`,JSON.stringify(old,null,2));
   }
  }
 }
 expect(results.flatMap(r=>r.missing.map((id:string)=>`${r.name}:${id}`))).toEqual([]);
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R41 delivery captures ${size.width}`,async({page})=>{
 await page.setViewportSize(size);const records:any[]=[],requests:string[]=[],errors:string[]=[],writes:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('union-1861-signs/'))requests.push(r.url());if(r.method()!=='GET')writes.push(r.method()+' '+r.url());});
 const proven=JSON.parse(readFileSync(`${out}/name-preflight-${size.width}.json`,'utf8'));
 for(const name of ['opening','fit','virginia']){
  await open(page);await view(page,name);const d=await diag(page),file=`${name}-research-off-${size.width}x${size.height}.png`;
  checkOff(d);const prior=proven.find((r:any)=>r.name===name);
  expect(d.camera).toEqual(prior.diagnostics.camera);expect(d.renderedLabels).toEqual(prior.diagnostics.renderedLabels);
  for(const water of d.waterLabelCandidates.filter((l:any)=>l.visible))expect(water.position,water.id).toEqual(water.source);
  await expect(page.locator('.map-scale .north-rose svg')).toHaveCount(1);await expect(page.locator('.map-scale .decorated-bar svg')).toHaveCount(1);
  await page.screenshot({path:`${out}/${file}`});records.push({name,size,file,diagnostics:d});
  writeFileSync(`${out}/views-${size.width}.json`,JSON.stringify({records,requests,errors,writes},null,2));
 }
 expect(requests).toEqual([]);expect(errors).toEqual([]);expect(writes).toEqual([]);
});
test('R41 sign experiment requires the exact URL opt-in and is absent from look options',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});const records:any[]=[];let requests:string[]=[];
 page.on('request',r=>{if(r.url().includes('union-1861-signs/'))requests.push(r.url());});
 for(const query of ['?signs=off','?signs=unknown','?signs=on']){
  requests=[];await open(page,query);const d=await diag(page);
  records.push({query,requests:[...requests],diagnostics:d});writeFileSync(`${out}/opt-in.json`,JSON.stringify(records,null,2));
  if(query==='?signs=on'){
   expect(d.furniture.enabled).toBe(true);expect(d.furniture.bytes).toBeGreaterThan(0);expect(d.furniture.drawn.length).toBeGreaterThan(0);
   expect(requests.some(r=>r.includes('manifest.json'))).toBe(true);expect(requests.some(r=>r.includes('geographic.png'))).toBe(true);
   const old=JSON.parse(readFileSync(`${out}/../R40/preflight.json`,'utf8')).results.find((r:any)=>r.name==='opening').diagnostics;
   expect(d.furniture.drawn).toEqual(old.furniture.drawn);
  }else{checkOff(d);expect(requests).toEqual([]);}
 }
 await open(page);requests=[];
 const selector=page.getByRole('combobox',{name:'Map look'}),options=await selector.locator('option').allTextContents();
 expect(options).toHaveLength(8);expect(options.every(o=>!/signs|pictorial/i.test(o))).toBe(true);
 await selector.selectOption('B:research');await ready(page);let d=await diag(page);checkOff(d);
 await selector.selectOption('A:research');await ready(page);d=await diag(page);checkOff(d);expect(requests).toEqual([]);
 writeFileSync(`${out}/selector.json`,JSON.stringify({options,requests,diagnostics:d},null,2));
});
test('R41 preserves real report front and name priority',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});const saved=JSON.parse(readFileSync(`${out}/../R32/day75-snapshot.json`,'utf8'));
 await open(page,'',saved);await view(page,'virginia');const d=await diag(page);checkOff(d);expect(d.control.fronts).toBeGreaterThan(0);
 const reports=await page.locator('.map-mark').evaluateAll(elements=>elements.map(e=>({region:e.getAttribute('data-region'),source:e.getAttribute('data-report'),name:e.getAttribute('aria-label'),style:e.getAttribute('style')})));
 expect(reports.length).toBeGreaterThan(0);expect(reports.every(r=>r.name&&r.source)).toBe(true);
 await page.screenshot({path:`${out}/priority-real-day75.png`});writeFileSync(`${out}/priority-real-day75.json`,JSON.stringify({diagnostics:d,reports},null,2));
});
test('R41 comparison-route arrow priority',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 await open(page,'?study=1&look=A&layout=table');const study=await diag(page);
 writeFileSync(`${out}/priority-illustrative-arrows.json`,JSON.stringify({scope:'Isolated labelled comparison route only; no live commands or invented reports',diagnostics:study},null,2));
 checkOff(study);expect(study.noteAnchor).not.toBeNull();expect(study.labelObstacles.live.length).toBeGreaterThan(0);
});
test('R41 frame timings with signs off',async({page})=>{
 await page.setViewportSize({width:3440,height:1440});await open(page);const initial=await diag(page),cadence:number[]=[];
 const runtime=await page.evaluate(()=>{const c=document.createElement('canvas'),gl=c.getContext('webgl'),ext=gl?.getExtension('WEBGL_debug_renderer_info');return {userAgent:navigator.userAgent,renderer:gl&&ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null};});
 for(let i=0;i<18;i++){const start=performance.now();await page.getByRole('button',{name:i%2?'Pan west':'Pan east',exact:true}).click();await ready(page);cadence.push(performance.now()-start);}
 const end=await diag(page);checkOff(end);
 const work=end.frameTimes.slice(initial.frameTimes.length);
 expect(work.length).toBeGreaterThanOrEqual(18);
 writeFileSync(`${out}/timings-raw.json`,JSON.stringify({runtime,panSteps:18,atlasLoadMs:initial.atlasLoadMs,storedBaseBakeMs:initial.bakeMs,newStaticBakes:end.staticBakes,rawTextureBytes:end.rawTextureBytes,signTextureBytes:end.furniture.bytes,rendererWorkMs:work,automationStepMs:cadence,frameProfile:end.frameProfile},null,2));
});
