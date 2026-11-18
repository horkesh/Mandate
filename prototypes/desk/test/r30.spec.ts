import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R30';
const prior='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R29';
const fixture=(name:string)=>JSON.parse(readFileSync(`${prior}/fixture-${name}.json`,'utf8'));
const recovered=['washington','southern_maryland','eastern_shore','peninsula','fort_monroe','norfolk','southside_tidewater'];
async function ready(page:Page){await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});await page.evaluate(()=>document.fonts.ready);}
async function open(page:Page,name='war'){
 await page.unroute('**/api/desk');const value=fixture(name);
 await page.route('**/api/desk',r=>r.fulfill({json:value.snapshot??value}));await page.goto('/');await ready(page);
}
async function data(page:Page){return JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-control'))!);}
async function legend(page:Page){
 const card=page.getByTestId('control-legend');await expect(card).toBeVisible();await expect(card).toBeInViewport();
 expect(await card.locator('li').allTextContents()).toEqual(['Union','Enemy','Neutral government','Contested','Single report','Old report']);
 for(const swatch of await card.locator('.claim-swatch').all()){const b=(await swatch.boundingBox())!;expect(b.width).toBeGreaterThan(25);expect(b.height).toBeLessThan(18);}
 const boxes=await page.evaluate(()=>{
  const b=(s:string)=>{const r=document.querySelector(s)!.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];};
  return {card:b('.control-legend'),others:['.map-cartouche','.map-tools','.table-run','.map-header','.map-scale'].map(b)};
 });
 writeFileSync(`${out}/latest-legend-boxes.json`,JSON.stringify(boxes,null,2));
 for(const b of boxes.others)expect(boxes.card[0]!<b[2]!&&boxes.card[2]!>b[0]!&&boxes.card[1]!<b[3]!&&boxes.card[3]!>b[1]!).toBe(false);
 return boxes;
}
test('R30 preflight shows every previously bare Eastern claim and a clear six-entry legend',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1920,height:1080});await open(page);
 const control=await data(page),d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
 for(const id of recovered)expect(control.paint.find((p:any)=>p.id===id)?.area,id).toBe(true);
 expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);
 // The canvas fills the screen: (0,0) is map ground, not a neutral cursor park.
 await page.mouse.move(0,0);await expect(page.getByTestId('control-hover')).toBeVisible();
 await page.locator('.table-calendar').hover();await expect(page.getByTestId('control-hover')).toBeHidden();
 const boxes=await legend(page);await page.screenshot({path:`${out}/preflight.png`});
 writeFileSync(`${out}/preflight.json`,JSON.stringify({control,d,boxes,errors},null,2));expect(errors).toEqual([]);
});
test('R30 captures the requested real views at both sizes and retains no-report hover',async({page})=>{
 const records:any[]=process.env.DESK_R30_REUSE_ULTRAWIDE==='1'?JSON.parse(readFileSync(`${out}/views.json`,'utf8')).records:[];const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){
  if(process.env.DESK_R30_REUSE_ULTRAWIDE==='1'&&size.width===3440)continue;
  await page.setViewportSize(size);
  for(const [name,input] of [['opening-peace','peace'],['opening-war','war'],['fit','war'],['virginia','reply']]){
   await open(page,input);
   if(name==='fit'){await page.getByRole('button',{name:'Fit the map',exact:true}).click();await ready(page);}
   if(name==='virginia'){await page.getByRole('button',{name:'Show Virginia',exact:true}).click();await ready(page);for(let i=0;i<3;i++){await page.getByRole('button',{name:'Zoom in',exact:true}).click();await ready(page);}}
   await page.locator('.table-calendar').hover();await expect(page.getByTestId('control-hover')).toBeHidden();
   const control=await data(page),d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
   expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);
   if(name==='fit')expect(control.paint.some((p:any)=>p.colour===0xd32238&&p.area)).toBe(true);
   const boxes=await legend(page);
   const file=`${name}-${size.width}x${size.height}.png`;await page.screenshot({path:`${out}/${file}`});
   records.push({name,input,size,file,control,camera:d.camera,frame:d.frame,renderedLabels:d.renderedLabels,boxes,startup:JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-startup'))!)});
   writeFileSync(`${out}/views.json`,JSON.stringify({records,errors},null,2));
  }
 }
 writeFileSync(`${out}/views.json`,JSON.stringify({records,errors},null,2));expect(errors).toEqual([]);
});
test('R30 gives claimed and unreported regions their correct hover and text at both sizes',async({page})=>{
 const records=[];
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){
  await page.setViewportSize(size);await open(page);
  const c=await data(page),host=(await page.getByTestId('map-canvas-host').boundingBox())!;
  for(const id of ['washington','eastern_shore','chesapeake_upper']){
   const p=c.points.find((r:any)=>r.id===id).point;
   await page.mouse.move(host.x+p[0],host.y+p[1]);
   const note=page.getByTestId('control-hover');await expect(note).toBeVisible();
   if(id==='chesapeake_upper')await expect(note).toContainText(/no report/i);else await expect(note).toContainText('Union holds');
   records.push({name:'hover',id,size,text:await note.textContent()});
  }
  await page.getByRole('button',{name:/Read the map as text/}).click();
  await expect(page.getByTestId('map-text-twin')).toContainText('no report received.');
  await expect(page.getByTestId('map-text-twin')).toContainText('Cameron');
 }
 writeFileSync(`${out}/hover.json`,JSON.stringify(records,null,2));
});
test('R30 measures a matched R29-pigment fit view without a product test flag',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 await page.route('**/web/map/control.ts*',async route=>{
  const response=await route.fetch();let body=await response.text();
  writeFileSync(`${out}/compiled-control-before-intercept.txt`,body);
  for(const [key,value] of [['friendly','0x2465b4'],['enemy','0xbd342f'],['neutral','0xc59324']]){
   const regex=new RegExp(`${key}:\\s*(?:0x[\\da-f]+|\\d+)`,'i');expect(body).toMatch(regex);body=body.replace(regex,`${key}: ${value}`);
  }
  const start=body.indexOf('function controlOpacity('),end=body.indexOf('\n}',start);
  expect(start).toBeGreaterThan(-1);expect(end).toBeGreaterThan(start);
  body=body.slice(0,start)+'function controlOpacity(belief, today) {\n return markState(today, belief.asOfDay).opacity * (belief.mark === "ink" ? .44 : .32);'+body.slice(end);
  await route.fulfill({response,body});
 });
 await open(page);await page.getByRole('button',{name:'Fit the map',exact:true}).click();await ready(page);await page.locator('.table-calendar').hover();await expect(page.getByTestId('control-hover')).toBeHidden();
 const control=await data(page);expect(control.paint.some((p:any)=>p.colour===0xbd342f)).toBe(true);
 await page.screenshot({path:`${out}/fit-r29-pigment-1920x1080.png`});
 writeFileSync(`${out}/pigment-baseline.json`,JSON.stringify({control,note:'R29 pigment and opacity reconstructed by test-only module interception on the identical R30 geometry, camera, paper and relief. Not an original R29 whole-scene capture.'},null,2));
});
test('R30 keeps the legend usable with enlarged type and high contrast',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({scale:200,contrast:true})));
 for(const size of [{width:1920,height:1080},{width:3440,height:1440}]){
  await page.setViewportSize(size);await open(page);
  await legend(page);
  const card=page.getByTestId('control-legend');
  const metrics=await card.evaluate(el=>({overflow:el.scrollWidth>el.clientWidth,fontSize:parseFloat(getComputedStyle(el).fontSize),background:getComputedStyle(el).backgroundColor,colour:getComputedStyle(el).color}));
  expect(metrics.overflow).toBe(false);expect(metrics.fontSize).toBe(30);expect(metrics.background).toBe('rgb(255, 255, 255)');
  await page.screenshot({path:`${out}/legend-large-${size.width}x${size.height}.png`});
 }
});
test('R30 checks repeated warm opens against the existing two-second target',async({page})=>{
 const records=[];
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}])for(let pass=0;pass<3;pass++){
  await page.setViewportSize(size);await open(page);
  const startup=JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-startup'))!);
  records.push({size,pass,startup});writeFileSync(`${out}/warm-opens.json`,JSON.stringify(records,null,2));
  if(pass>0)expect(startup.firstRender).toBeLessThan(2000);
 }
});
