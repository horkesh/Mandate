import {test,expect,type Page} from '@playwright/test';
import {appendFileSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import type {DeskReply,DeskSnapshot} from '../web/adapter.ts';
import {S} from '../web/strings.ts';
import {M} from '../web/map/strings.ts';
import {rest} from './support/s29-controls.ts';
const out=resolve(process.env.S33_OUTPUT??'../../../ByOrderOfThePresident/art-masters/S33');
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const save=(name:string,value:unknown)=>writeFileSync(`${out}/${name}`,JSON.stringify(value,null,2));
async function capture(page:Page,name:string,data:DeskSnapshot){
 save(`${name}.json`,data);await page.evaluate(()=>document.fonts.ready);const file=`${out}/${name}.png`;await page.screenshot({path:file});
 save(`${name}.png.recipe.json`,{request:'S33',asset:file,date:'2026-11-21',tool:'Playwright Chromium',mode:'Headless native capture',prompt:null,plan:'No image service',client:'Codex',model:'No image model',requestedSize:page.viewportSize(),actualSize:page.viewportSize(),references:[{path:`${out}/${name}.json`,sha256:hash(`${out}/${name}.json`)}],humanEdits:[],postProcess:[],sha256:hash(file),notes:'Actual human-seat desk; no State load, mocked routes, likeness or slogan.'});
}
test('S33 startup preflight',async({page,request})=>{
 mkdirSync(out,{recursive:true});const d=await(await request.get('/api/desk')).json();expect(d.date).toBe('1861-03-06');
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await page.getByRole('navigation',{name:S.deskObjects}).getByRole('button',{name:S.orders,exact:true}).click();
 await expect(page.getByRole('textbox',{name:S.command,exact:true})).toBeVisible();await rest(page);
 await page.getByRole('button',{name:S.run,exact:true}).click();await expect(page.getByLabel(S.turnDays)).toHaveValue('7');
 await expect(page.getByTestId('advance-agenda')).toHaveCount(0);
 expect((await request.get('/server/adapter.ts')).status()).toBe(404);
});
test('S33 press the advance through goal, arrow edit and approval',async({page,request})=>{
 const discovery=process.env.S33_DISCOVERY==='1';
 let data=await(await request.get('/api/desk')).json() as DeskSnapshot;
 mkdirSync(out,{recursive:true});writeFileSync(`${out}/commands.jsonl`,'');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:3440,height:1440});await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 async function act(button:()=>Promise<unknown>){
  const pending=page.waitForResponse(r=>r.url().endsWith('/api/command')&&r.request().method()==='POST',{timeout:60000});await button();const response=await pending,result=await response.json() as DeskReply;
  appendFileSync(`${out}/commands.jsonl`,JSON.stringify({day:data.morning.requestDay,line:response.request().postDataJSON().line,ok:result.ok,message:result.message})+'\n');
  expect(result.ok,result.message).toBe(true);data=result.snapshot;save('progress.json',{day:data.morning.requestDay,date:data.date,errors});return result;
 }
 async function book(name:string){await rest(page);await page.getByRole('navigation',{name:S.deskObjects}).getByRole('button',{name,exact:true}).click();}
 async function sign(line:string){await book(S.orders);await page.getByRole('textbox',{name:S.command,exact:true}).fill(line);const r=await act(()=>page.getByRole('button',{name:S.sign,exact:true}).click());await rest(page);if(r.turn)await page.getByRole('button',{name:S.nextMorning,exact:true}).click();return r;}
 // Re-enter the unchanged S29 human prefix through the visible order sheet, never a saved State.
 const prefixPath=resolve(discovery?'../../../ByOrderOfThePresident/art-masters/S33/press-advance/commands.jsonl':'../../../ByOrderOfThePresident/art-masters/S29/completed-history/resume-prefix.jsonl');
 const commands=readFileSync(prefixPath,'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l));
 let count=0;
 for(const entry of commands){if(entry.day>=133)break;expect(data.morning.requestDay).toBe(entry.day);await sign(entry.line);count++;}
 expect(data.morning.requestDay).toBe(133);save('prefix.json',{commands:count,day:133,source:prefixPath,sha256:hash(prefixPath)});
 await capture(page,'advance-morning',data);
 if(discovery){
  await page.getByRole('button',{name:S.run,exact:true}).click();
  await expect(page.getByTestId('advance-agenda')).toContainText('1861-07-16');
  for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){await page.setViewportSize(size);await capture(page,`advance-agenda-${size.width}`,data);}
  await page.getByRole('button',{name:S.reviewGoalOrder,exact:true}).click();
  const goal=await act(()=>page.getByRole('button',{name:S.sign,exact:true}).click());
  expect(goal.snapshot.queue.at(-1)?.line).toBe('order us_dc_militia take manassas review');await rest(page);await page.setViewportSize({width:3440,height:1440});
 }else await sign('order us_dc_militia take manassas review');
 const seen=new Set<string>();let edited=false,approved=false;
 while(data.morning.requestDay<=148){
  const day=data.morning.requestDay,menu=data.morning.menu;if(menu.menuKind!=='principal')throw Error('principal');
  for(const r of data.morning.view.reports.filter(r=>r.type==='advice'&&r.subtype==='memorandum'&&r.subjectId==='us_dc_militia'&&r.answers&&!seen.has(r.id))){
   seen.add(r.id);const kind=r.claims.find(c=>c.kind==='order-objected')?.token;
   if(kind==='goal'||kind==='order')await sign('order us_dc_militia take manassas review by=wire bypass');
  }
  if(menu.reviews.some(r=>r.post==='us_dc_militia')&&!edited){
   if(discovery){
    await expect(page.locator('#plan-pending-count')).toContainText('1 plan awaiting review');
    await capture(page,`review-badge-${day}`,data);
    await page.getByRole('button',{name:S.run,exact:true}).click();await expect(page.getByTestId('pending-plans')).toContainText('1 plan awaiting review');
    await page.getByRole('button',{name:S.openPlans,exact:true}).click();
   }
   await book(S.plans);await expect(page.locator('.map-plan-sheet')).toBeVisible();
   await capture(page,`review-${day}`,data);
   const review=menu.reviews.find(r=>r.post==='us_dc_militia')!,axis=review.plan.axes.find(a=>a.regions.length>2)!;
   if(discovery){
    await expect(page.locator('.map-plan-sheet')).toContainText(M.plannedArrival(Math.ceil(axis.arrival/1000)));
    await expect(page.locator('.map-plan-sheet')).toContainText(M.approvalMeaning);
    await page.getByLabel(M.deliveryRoute,{exact:true}).selectOption('wire');await page.getByLabel(M.bypass,{exact:true}).check();
    for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){await page.setViewportSize(size);await page.locator('.map-plan-sheet').evaluate(e=>e.scrollTop=0);await capture(page,`review-delivery-${day}-${size.width}`,data);await page.locator('.axis-sheet').first().scrollIntoViewIfNeeded();await capture(page,`review-timing-${day}-${size.width}`,data);}
    await page.setViewportSize({width:3440,height:1440});
   }
   await page.getByLabel(M.chooseAxis,{exact:true}).selectOption(axis.name);await page.getByLabel(M.chooseRegion,{exact:true}).selectOption(axis.regions[1]!);
   await act(()=>page.getByRole('button',{name:M.markWaypoint,exact:true}).click());await expect(page.locator('.pencil-list li')).toHaveCount(1);await capture(page,`arrow-${day}`,data);
   await act(()=>page.getByRole('button',{name:M.order,exact:true}).click());
   await act(()=>page.getByRole('button',{name:S.approve,exact:true}).click());edited=true;approved=true;
   // Review route defaults traverse Scott. Keep terms, but use the lawful order sheet to bypass his already received objection.
   const slips=data.queue.filter(q=>/^(edit|approve) /.test(q.line));
   if(discovery)expect(slips.map(q=>q.line)).toEqual(['edit us_dc_militia waypoints axis=main via=northern_virginia by=wire bypass','approve us_dc_militia by=wire bypass']);
   else{for(let i=0;i<slips.length;i++)await sign(`cancel ${data.queue.length}`);for(const q of slips)await sign(`${q.line} by=wire bypass`);}
  }
  for(const c of menu.doctrine.calls.filter(c=>c.id&&!c.issued&&c.day<=day))await sign(`call ${c.post} scheduled=${c.id}`);
  for(const post of menu.awaiting)await sign(`go ${post} by=wire bypass`);
  await rest(page);await page.getByRole('button',{name:S.run,exact:true}).click();await page.getByLabel(S.turnDays).selectOption('1');
  const result=await act(()=>page.getByRole('button',{name:S.sendRun,exact:true}).click());await page.getByRole('button',{name:S.nextMorning,exact:true}).click();
  expect(result.turn!.days.flatMap(d=>d.refused)).toEqual([]);
  save(`morning-${data.morning.requestDay}.json`,data);
  const battles=result.turn!.days.flatMap(d=>d.reports).filter(r=>r.claims.some(c=>c.region==='manassas'&&['battle-phase','battle-result'].includes(c.kind)));
  if(battles.length){await book(S.daybook);for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){await page.setViewportSize(size);await capture(page,`battle-${day}-${size.width}`,data);}await page.setViewportSize({width:3440,height:1440});}
 }
 save('final.json',data);const reports=data.history.flatMap(t=>t.days.flatMap(d=>d.reports));const battle=reports.filter(r=>r.claims.some(c=>c.region==='manassas'&&['battle-phase','battle-result'].includes(c.kind)));
 save('result.json',{throughDay:148,edited,approved,errors,battle});
 expect(edited).toBe(true);expect(approved).toBe(true);expect(errors).toEqual([]);expect(battle.length,'Manassas dispatch reaches this human desk by 31 July').toBeGreaterThan(0);
 if(discovery){const previous=JSON.parse(readFileSync(resolve('../../../ByOrderOfThePresident/art-masters/S33/press-advance/final.json'),'utf8'));expect(data.morning).toEqual(previous.morning);expect(data.history).toEqual(previous.history);expect(data.queue).toEqual(previous.queue);save('equivalence.json',{morning:true,history:true,queue:true,reference:'press-advance/final.json',sha256:hash(resolve('../../../ByOrderOfThePresident/art-masters/S33/press-advance/final.json'))});}
});
