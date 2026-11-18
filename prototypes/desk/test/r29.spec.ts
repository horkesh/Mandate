import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R29';
const fixture=(name:string)=>JSON.parse(readFileSync(`${out}/fixture-${name}.json`,'utf8'));
async function ready(page:Page){await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});}
async function frozen(page:Page,name:string,url='/'){
 await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:fixture(name)}));await page.goto(url);await ready(page);
}
test('R29 records warm map loading at both target sizes',async({page})=>{
 const records=[];
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}])for(let pass=0;pass<2;pass++){
  await page.setViewportSize(size);await frozen(page,'war');
  const host=page.getByTestId('map-canvas-host'),startup=JSON.parse((await host.getAttribute('data-startup'))!),d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
  records.push({size,pass,startup,atlasBytes:d.rawTextureBytes,staticBakes:d.staticBakes});
  expect(d.staticBakes).toBe(0);if(pass===1)expect(startup.firstRender).toBeLessThan(2000);
 }
 writeFileSync(`${out}/warm-opens.json`,JSON.stringify(records,null,2));
});
test('R29 preflight opens a real coloured Union map without rebaking',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await frozen(page,'war');
 const host=page.getByTestId('map-canvas-host');await expect.poll(async()=>JSON.parse((await host.getAttribute('data-control'))!).beliefs).toBeGreaterThan(100);
 const control=JSON.parse((await host.getAttribute('data-control'))!),d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
 expect(control.regions).toBeGreaterThan(5);expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);
 await page.screenshot({path:`${out}/preflight.png`});writeFileSync(`${out}/preflight.json`,JSON.stringify({control,d,errors},null,2));expect(errors).toEqual([]);
});
test('R29 requested views and contested comparison proof at both sizes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const records=[];
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){
  await page.setViewportSize(size);
  const reused=process.env.DESK_REUSE_ULTRAWIDE==='1'&&size.width===3440;
  for(const [name,input] of reused?[]:[['opening-peace','peace'],['opening-war','war'],['after-days','reply']] as const){
   const value=fixture(input);await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:value.snapshot??value}));await page.goto('/');await ready(page);
   await expect.poll(async()=>JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-control'))!).animating).toBe(0);
   await page.screenshot({path:`${out}/${name}-${size.width}x${size.height}.png`});
   const host=page.getByTestId('map-canvas-host');records.push({name,size,control:JSON.parse((await host.getAttribute('data-control'))!),startup:JSON.parse((await host.getAttribute('data-startup'))!)});
  }
  if(!reused){await page.getByRole('button',{name:'Show Virginia',exact:true}).click();await ready(page);for(let i=0;i<3;i++){await page.getByRole('button',{name:'Zoom in',exact:true}).click();await ready(page);}await page.screenshot({path:`${out}/virginia-${size.width}x${size.height}.png`});}
  else records.push({name:'four-real-Union-views',size,reusedFrom:'views-results.json; date expectation failed only after these captures, presentation unchanged for these states.'});
  await frozen(page,'proof','/?study=1&proof=control&look=A');
  await expect(page.getByText('Contested claim example; not part of this game.',{exact:true})).toBeVisible();
  const d=JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-control'))!),p=d.points.find((r:any)=>r.id==='northern_virginia');expect(p).toBeDefined();
  const host=await page.getByTestId('map-canvas-host').boundingBox();await page.mouse.move(host!.x+p.point[0],host!.y+p.point[1]);await expect(page.getByTestId('control-hover')).toContainText('Contested ground');
  await expect(page.getByTestId('control-hover')).toContainText('1861-03-06');await expect(page.getByTestId('control-hover')).toContainText('Cameron');
  await page.screenshot({path:`${out}/contested-hover-${size.width}x${size.height}.png`});
  records.push({name:'contested-hover',size,synthetic:true,hover:await page.getByTestId('control-hover').textContent()});
 }
 writeFileSync(`${out}/views.json`,JSON.stringify({records,errors},null,2));expect(errors).toEqual([]);
});
test('R29 close Virginia and readable contested hover correction',async({page})=>{
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){
  await page.setViewportSize(size);await page.route('**/api/desk',r=>r.fulfill({json:fixture('reply').snapshot}));await page.goto('/');await ready(page);
  await page.getByRole('button',{name:'Show Virginia',exact:true}).click();await ready(page);
  for(let i=0;i<3;i++){await page.getByRole('button',{name:'Zoom in',exact:true}).click();await ready(page);}
  await page.screenshot({path:`${out}/virginia-${size.width}x${size.height}.png`});
  await frozen(page,'proof','/?study=1&proof=control&look=A');
  const d=JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-control'))!),p=d.points.find((r:any)=>r.id==='northern_virginia');
  const host=(await page.getByTestId('map-canvas-host').boundingBox())!;await page.mouse.move(host.x+p.point[0],host.y+p.point[1]);
  const note=page.getByTestId('control-hover');await expect(note).toContainText('Contested ground');await expect(note).toBeInViewport();
  const box=(await note.boundingBox())!,tools=(await page.locator('.map-tools').boundingBox())!;expect(box.y+box.height).toBeLessThan(tools.y);
  await page.screenshot({path:`${out}/contested-hover-${size.width}x${size.height}.png`});await page.unroute('**/api/desk');
 }
});
test('R29 honours reduced motion and gives every control claim a text equivalent',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await frozen(page,'war');
 const host=page.getByTestId('map-canvas-host');expect(JSON.parse((await host.getAttribute('data-control'))!).animating).toBe(0);
 await page.getByRole('button',{name:/Read the map as text/}).click();await expect(page.getByTestId('map-text-twin')).toContainText('as of 1861-03-05');await expect(page.getByTestId('map-text-twin')).toContainText('Cameron');
 await expect(page.getByTestId('map-text-twin').locator('li').first()).toContainText(/holds|government|holder/);
});
test('R29 records a real run of days with newly received signs drawing on',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:`${out}/recording`,size:{width:960,height:540}}});
 const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const reply=fixture('recordingReply');
 await page.route('**/api/desk',r=>r.fulfill({json:fixture('recordingQueued')}));await page.route('**/api/command',r=>r.fulfill({json:reply}));
 await page.goto('/');await ready(page);
 await page.evaluate(()=>{(window as any).seen=[];new MutationObserver(()=>{const n=document.querySelector<HTMLElement>('[data-testid="arrival-mark"]');if(n&&(window as any).seen.at(-1)?.id!==n.dataset.report)(window as any).seen.push({id:n.dataset.report,region:n.dataset.region,at:performance.now()});}).observe(document.body,{childList:true,subtree:true});});
 await page.locator('.table-run').click();await page.getByRole('button',{name:'Send orders & run days',exact:true}).click();
 await expect(page.getByRole('button',{name:'To the next morning',exact:true})).toBeVisible({timeout:50000});
 const seen=await page.evaluate(()=>(window as any).seen),expected=reply.turn.days.flatMap((d:any)=>d.reports.map((r:any)=>r.id));expect(seen.map((x:any)=>x.id)).toEqual(expected);
 await page.getByRole('button',{name:'To the next morning',exact:true}).click();await ready(page);
 writeFileSync(`${out}/recording.json`,JSON.stringify({seen,expected,errors,source:'Replay of retained, unmodified real ConsoleGame turn; no synthetic reports.'},null,2));const video=page.video()!;await context.close();await video.saveAs(`${out}/days-run.webm`);expect(errors).toEqual([]);
});
