import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='../../art-masters/R26';
const opening=JSON.parse(readFileSync(`${out}/fixture-opening.json`,'utf8'));
const reply=JSON.parse(readFileSync(`${out}/fixture-reply.json`,'utf8'));
async function ready(page:Page){await page.evaluate(()=>document.fonts.ready);await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});}
async function frozen(page:Page,snapshot=opening){await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));await page.goto('/');await ready(page);}
async function report(page:Page){await page.locator('.tray-stack.inbox').click();await page.getByTestId('paper-link').filter({hasText:'Charles P. Stone'}).first().click();await expect(page.getByTestId('paper-on-map')).toBeVisible();await expect(page.getByTestId('paper-place')).toBeVisible();}
async function shot(page:Page,name:string,size:{width:number;height:number}){await ready(page);await page.screenshot({path:`${out}/${name}-${size.width}x${size.height}.png`});}
test('R26 opens directly on the full-screen playable table',async({page})=>{
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});
 const b=(await page.getByTestId('map-canvas-host').boundingBox())!;
 expect(b.width).toBe(1920);expect(b.height).toBe(1080);
 await expect(page.getByRole('button',{name:'Staff map',exact:true})).toHaveCount(0);
 await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('R26 paper, flag card and plan stay on the same map',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await frozen(page);
 const canvas=await page.getByTestId('map-canvas-host').locator('canvas').elementHandle();
 await report(page);await page.screenshot({path:`${out}/preflight-paper.png`});
 await expect(page.getByRole('dialog')).not.toBeVisible();await page.keyboard.press('Escape');await expect(page.getByTestId('paper-on-map')).toHaveCount(0);await expect(page.locator('.tray-stack.inbox')).toBeFocused();
 const mark=page.locator('.map-mark.headquarters[data-region="washington"]').first();await mark.click();await expect(page.getByTestId('holder-at-flag')).toBeVisible();await expect(page.getByTestId('holder-at-flag')).toContainText('Last report');await expect(page.getByTestId('holder-at-flag')).toContainText(/1861-03-0[678]/);await page.screenshot({path:`${out}/preflight-holder.png`});
 await page.getByRole('button',{name:'Close card',exact:true}).click();await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Plans & enemy',exact:true}).click();await expect(page.locator('.map-plan-sheet')).toBeVisible();await expect(page.getByRole('dialog')).not.toBeVisible();
 expect(await canvas?.evaluate(el=>el.isConnected)).toBe(true);await page.screenshot({path:`${out}/preflight-plan.png`});
 await page.getByRole('button',{name:'Close plan review'}).click();await page.keyboard.press('m');await expect(page.getByTestId('map-canvas-host')).toBeFocused();await page.keyboard.press('t');await expect(page.getByTestId('map-text-twin')).toBeVisible();await page.keyboard.press('t');
 const diagnostics=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);expect(diagnostics.studyControl).toBeNull();expect(diagnostics.staticBakes).toBe(0);expect(diagnostics.rawTextureBytes).toBeLessThan(96*1024*1024);expect(errors).toEqual([]);
 writeFileSync(`${out}/preflight-interactions.json`,JSON.stringify({errors,diagnostics},null,2));
});

test('R26 six Union views at both sizes',async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const measurements=[];
 for(const size of [{width:1920,height:1080},{width:3440,height:1440}]){
  await page.setViewportSize(size);await frozen(page);await shot(page,'opening',size);
  await report(page);await shot(page,'report',size);const paper=(await page.getByTestId('paper-on-map').boundingBox())!,pin=(await page.getByTestId('paper-place').boundingBox())!;
  expect(paper.x+paper.width).toBeLessThan(pin.x+10);await page.getByRole('button',{name:'Return to tray'}).click();
  await page.locator('.map-mark.headquarters[data-region="washington"]').first().click();await shot(page,'holder',size);await page.getByRole('button',{name:'Close card',exact:true}).click();
  await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Plans & enemy',exact:true}).click();await shot(page,'plan-review',size);await page.getByRole('button',{name:'Close plan review'}).click();
  await page.keyboard.press('b');await expect(page.getByRole('dialog')).toBeVisible();await shot(page,'org-board',size);await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.unroute('**/api/desk');await frozen(page,reply.snapshot);await shot(page,'after-days',size);
  const diagnostics=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);expect(diagnostics.studyControl).toBeNull();expect(diagnostics.staticBakes).toBe(0);expect(diagnostics.baseCoverage.inside).toBe(true);measurements.push({size,paper,pin,diagnostics});
  await page.unroute('**/api/desk');
 }
 writeFileSync(`${out}/view-measurements.json`,JSON.stringify({measurements,errors},null,2));expect(errors).toEqual([]);
});

test('R26 live days reveal every report in order and finish in the tray',async({browser,request})=>{
 test.setTimeout(90000);
 const warmup=JSON.parse(readFileSync(`${out}/fixture-warmup.json`,'utf8'));
 for(const {line} of warmup){const snapshot=await(await request.get('/api/desk')).json();expect((await(await request.post('/api/command',{data:{line,day:snapshot.morning.requestDay}})).json()).ok).toBe(true);}
 for(const line of JSON.parse(readFileSync(`${out}/fixture-weekCommands.json`,'utf8'))){const snapshot=await(await request.get('/api/desk')).json();expect((await(await request.post('/api/command',{data:{line,day:snapshot.morning.requestDay}})).json()).ok).toBe(true);}
 const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:`${out}/recording`,size:{width:960,height:540}}});
 const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await ready(page);
 await page.evaluate(()=>{const w=window as any;w.received=[];new MutationObserver(()=>{const n=document.querySelector<HTMLElement>('[data-testid="arrival-mark"]');if(n&&w.received.at(-1)?.id!==n.dataset.report)w.received.push({id:n.dataset.report,region:n.dataset.region,text:n.textContent,at:performance.now()});}).observe(document.body,{subtree:true,childList:true});});
 await page.locator('.table-run').click();await page.getByRole('button',{name:'Send orders & run days',exact:true}).click();await expect(page.getByTestId('turn-playback')).toBeVisible();await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(page.getByRole('button',{name:'To the next morning',exact:true})).toBeVisible({timeout:65000});
 const observed=await page.evaluate(()=>(window as any).received),snapshot=await(await request.get('/api/desk')).json(),turn=snapshot.history.at(-1),expected=turn.days.flatMap((d:any)=>d.reports.map((r:any)=>r.id));
 expect(observed.map((r:any)=>r.id)).toEqual(expected);
 await page.getByRole('button',{name:'To the next morning',exact:true}).click();await ready(page);await expect(page.locator('.tray-stack.inbox')).toContainText(String(snapshot.morning.view.reports.length));
 writeFileSync(`${out}/live-week.json`,JSON.stringify({errors,start:opening.date,end:snapshot.date,observed,expected,turn,after:snapshot},null,2));
 const video=page.video()!;await context.close();await video.saveAs(`${out}/days-run.webm`);expect(errors).toEqual([]);
});

test('R26 keyboard, books and type scaling remain usable over the table',async({page})=>{
 const commands:string[]=[];await page.route('**/api/command',async r=>{commands.push(r.request().postDataJSON().line);await r.fulfill({json:{ok:true,snapshot:opening}});});
 await frozen(page);
 for(const [key,title] of [['b','Org board'],['l','Ledger'],['g','File'],['d','Docket'],['?','Key card']]){
  await page.keyboard.press(key!);await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('#panel-title')).toHaveText(title!);await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 }
 await page.keyboard.press('Space');await expect(page.getByTestId('paper-on-map')).toBeVisible();await page.keyboard.press('i');await expect(page.getByRole('textbox',{name:'Console command',exact:true})).toBeVisible();
 await page.getByRole('textbox',{name:'Console command',exact:true}).focus();await page.keyboard.type('m');await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Tab');await page.keyboard.press('Escape');await expect(page.getByTestId('paper-on-map')).toBeVisible();await page.keyboard.press('f');await expect(page.getByTestId('paper-on-map')).toHaveCount(0);
 await page.locator('.tray-stack.inbox').click();const links=page.getByTestId('paper-link');await links.first().focus();await page.keyboard.press('j');await expect(links.nth(1)).toBeFocused();await page.keyboard.press('k');await expect(links.first()).toBeFocused();await page.keyboard.press('Enter');await expect(page.getByTestId('paper-on-map')).toBeVisible();await page.keyboard.press('Escape');
 await page.keyboard.press('m');await expect(page.getByTestId('map-canvas-host')).toBeFocused();const initial=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!).camera;
 for(const key of ['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','+','-','0']){await page.keyboard.press(key);await ready(page);}
 const after=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!).camera;expect(after.z).toBeCloseTo(initial.z);
 await page.keyboard.press('Control+g');await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Tab');await page.keyboard.press('Escape');
 await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Plans & enemy',exact:true}).click();await page.keyboard.press('a');await expect.poll(()=>commands.at(-1)).toBe('approve us_dc_militia');await page.keyboard.press('n');await expect.poll(()=>commands.at(-1)).toBe('sendback us_dc_militia');await page.keyboard.press('Escape');await expect(page.locator('.map-plan-sheet')).toHaveCount(0);
 await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Write an order',exact:true}).click();await page.getByRole('textbox',{name:'Console command',exact:true}).fill('inquire us_general_in_chief');await page.keyboard.press('Tab');await page.keyboard.press('s');expect(commands.at(-1)).toBe('inquire us_general_in_chief');await page.keyboard.press('Escape');
 await page.keyboard.press('Control+Enter');await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Control+Enter');await expect.poll(()=>commands.at(-1)).toBe('end');await page.keyboard.press('Escape');
 const measurements=[];
 for(const size of [{width:1920,height:1080},{width:3440,height:1440}])for(const scale of [80,200]){
  await page.setViewportSize(size);await page.evaluate(scale=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({scale,contrast:true,speed:'instant'})),scale);await page.reload();await ready(page);await report(page);
  const box=(await page.getByTestId('paper-on-map').boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(size.width);expect(box.y+box.height).toBeLessThanOrEqual(size.height);const dimensions=await page.getByTestId('paper-on-map').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client+1);
  await page.screenshot({path:`${out}/type-${scale}-${size.width}x${size.height}.png`});measurements.push({size,scale,box,dimensions});await page.keyboard.press('Escape');
 }
 writeFileSync(`${out}/keyboard-scaling.json`,JSON.stringify({commands,measurements},null,2));
});

test('R26 comparison captions stay near their signs and D title uses a free corner',async({page})=>{
 await page.route('**/api/desk',r=>r.fulfill({json:opening}));await page.goto('/?study=1&look=A&layout=table');await ready(page);
 const caption=page.locator('.hq-caption[data-region="washington"]');await expect(caption).toBeVisible();
 const b=(await caption.boundingBox())!,mark=(await page.locator('.map-mark.headquarters[data-region="washington"]').first().boundingBox())!,title=(await page.locator('.study-cartouche').boundingBox())!;
 const cx=mark.x+mark.width/2,cy=mark.y+mark.height/2,distance=Math.hypot(Math.max(b.x-cx,0,cx-b.x-b.width),Math.max(b.y-cy,0,cy-b.y-b.height));expect(distance).toBeLessThan(190);expect(title.x).toBeGreaterThan(1400);expect(title.y).toBeLessThan(180);
 const papers=await page.locator('.table-report,.table-commander').evaluateAll(ns=>ns.map(n=>{const b=n.getBoundingClientRect();return [b.x,b.y,b.right,b.bottom];}));for(const p of papers)expect(title.x<p[2]!&&title.x+title.width>p[0]!&&title.y<p[3]!&&title.y+title.height>p[1]!).toBe(false);
 await page.screenshot({path:`${out}/D-corner-and-caption.png`});writeFileSync(`${out}/caption-placement.json`,JSON.stringify({b,mark,title,distance,papers},null,2));
});

test('R26 short playback diagnostic isolates rendering and timer costs',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:`${out}/diagnostic-video`,size:{width:960,height:540}}});
 const page=await context.newPage();await page.route('**/api/desk',r=>r.fulfill({json:opening}));
 const turn={...reply.turn,days:[{...reply.turn.days.find((d:any)=>d.reports.length),reports:reply.turn.days.flatMap((d:any)=>d.reports).slice(0,3)}]};
 await page.route('**/api/command',r=>r.fulfill({json:{...reply,turn}}));await page.goto('/');await ready(page);
 await page.evaluate(()=>{const w=window as any;w.observed=[];w.began=performance.now();new MutationObserver(()=>{const n=document.querySelector<HTMLElement>('[data-testid="arrival-mark"]');if(n&&w.observed.at(-1)?.id!==n.dataset.report)w.observed.push({id:n.dataset.report,at:performance.now()});}).observe(document.body,{subtree:true,childList:true});});
 await page.locator('.table-run').click();await page.getByRole('button',{name:'Send orders & run days',exact:true}).click();
 await expect(page.getByRole('button',{name:'To the next morning',exact:true})).toBeVisible({timeout:20000});
 const evidence=await page.evaluate(()=>({observed:(window as any).observed,elapsed:performance.now()-(window as any).began,diagnostics:JSON.parse(document.querySelector('[data-testid="map-diagnostics"]')!.textContent!)}));
 writeFileSync(`${out}/short-playback-diagnostic.json`,JSON.stringify(evidence,null,2));await context.close();expect(evidence.observed).toHaveLength(3);
});

test('R26 final opening and holder captures, warm loading and an off-screen paper',async({page})=>{
 const first=JSON.parse(readFileSync(`${out}/fixture-firstMorning.json`,'utf8'));expect(first.date).toBe('1861-03-06');
 const measurements=[];
 for(const size of [{width:1920,height:1080},{width:3440,height:1440}]){
  await page.setViewportSize(size);await frozen(page,first);await shot(page,'opening',size);
  await page.unroute('**/api/desk');await frozen(page);await page.locator('.map-mark.headquarters[data-region="washington"]').first().click();await shot(page,'holder',size);await page.getByRole('button',{name:'Close card',exact:true}).click();
  await page.reload();await ready(page);const startup=JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-startup'))!);measurements.push({size,startup});expect.soft(startup.lastOverlay).toBeLessThan(2000);
  await page.unroute('**/api/desk');
 }
 await page.setViewportSize({width:1920,height:1080});await frozen(page,reply.snapshot);const before=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!).camera;
 await page.locator('.tray-stack.inbox').click();await page.getByTestId('paper-link').filter({hasText:'Thomas T. Fauntleroy'}).first().click();await expect(page.getByTestId('paper-place')).toBeInViewport();await ready(page);const after=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!).camera;expect(Math.abs(before.x-after.x)).toBeGreaterThan(100);
 await page.screenshot({path:`${out}/off-screen-paper.png`});await page.keyboard.press('Escape');await expect(page.locator('.tray-stack.inbox')).toBeFocused();
 writeFileSync(`${out}/warm-loading-and-navigation.json`,JSON.stringify({measurements,before,after},null,2));
});

test('R26 holder order restores card focus and Next day advances to the stop',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({speed:'slow'})));await frozen(page);
 await page.locator('.map-mark.headquarters[data-region="washington"]').first().click();const button=page.getByTestId('holder-at-flag').getByRole('button',{name:'Write an order',exact:true});await button.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect.soft(button).toBeFocused();
 await page.getByRole('button',{name:'Close card',exact:true}).click();
 const turn={...reply.turn,days:[{...reply.turn.days.find((d:any)=>d.reports.length),reports:reply.turn.days.flatMap((d:any)=>d.reports).slice(0,3)}]};
 await page.route('**/api/command',r=>r.fulfill({json:{...reply,turn}}));await page.locator('.table-run').click();await page.getByRole('button',{name:'Send orders & run days',exact:true}).click();await page.getByRole('button',{name:'Next day',exact:true}).click();await expect(page.getByRole('button',{name:'To the next morning',exact:true})).toBeVisible({timeout:1000});
});
