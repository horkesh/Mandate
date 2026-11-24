import {test,expect,type Page} from '@playwright/test';
import {appendFileSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import type {DeskReply,DeskSnapshot} from '../web/adapter.ts';
import type {PrincipalMenu} from '@mandate/kernel/seat-api';
import {S} from '../web/strings.ts';
import {M} from '../web/map/strings.ts';
import {rest} from './support/s29-controls.ts';
const out=resolve(process.env.S29_OUTPUT??'../../../ByOrderOfThePresident/art-masters/S29');
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const save=(name:string,value:unknown)=>writeFileSync(`${out}/${name}`,JSON.stringify(value,null,2));
const historical=new Map((JSON.parse(readFileSync(`${out}/history-choices.json`,'utf8')) as {id:string;historicalDefault?:{options?:string[]}}[]).map(s=>[s.id,s.historicalDefault?.options??[]]));
async function book(page:Page,name:string){await rest(page);await page.getByRole('navigation',{name:S.deskObjects}).getByRole('button',{name,exact:true}).click();}
async function capture(page:Page,name:string,data:DeskSnapshot){
 const source=`snapshots/${name}.json`;save(source,data);
 const file=`${out}/${name}.png`,size=page.viewportSize()!;await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:file});
 save(`${name}.png.recipe.json`,{request:'S29',asset:file,date:'2026-11-21',tool:'Playwright Chromium',mode:'Headless native browser capture',prompt:null,plan:'No image service',client:'Codex',model:'No image model',requestedSize:`${size.width}x${size.height}`,actualSize:`${size.width}x${size.height}`,references:[{path:`${out}/${source}`,sha256:hash(`${out}/${source}`)}],humanEdits:[],postProcess:[],sha256:hash(file),notes:'Actual Union human-seat desk. No route mocking, real browser, likeness or invented report.'});
}
test('S29 startup guard before the historical desk playthrough',async({page,request})=>{
 const data=await(await request.get('/api/desk')).json();expect(data.date).toBe('1861-03-06');expect(data.morning.menu.atWarSince).toBeNull();
 expect((await request.get('/server/adapter.ts')).status()).toBe(404);
 expect((await request.post('/api/command',{headers:{Origin:'http://127.0.0.1:5274'},data:{line:'end',day:1}})).status()).toBe(403);
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await page.getByRole('button',{name:S.run,exact:true}).click();await expect(page.getByLabel(S.turnDays)).toHaveValue('7');
 await expect(page.getByRole('button',{name:S.sendRun,exact:true})).toBeVisible();
});
test('S29 Union history through 31 July, with weekly desks and received evidence',async({page,request})=>{
 mkdirSync(`${out}/snapshots`,{recursive:true});
 const resume=process.env.S29_RESUME==='1';
 const focusedPlan=process.env.S29_FOCUSED_PLAN==='1';
 const errors:string[]=[],journal:unknown[]=resume?JSON.parse(readFileSync(`${out}/journal.json`,'utf8')):[],weeks:unknown[]=resume?JSON.parse(readFileSync(`${out}/weeks.json`,'utf8')):[];page.on('pageerror',e=>errors.push(e.message));
 if(!resume)writeFileSync(`${out}/browser-commands.jsonl`,'');
 let replaying=resume;
 if(resume)writeFileSync(`${out}/replay-commands.jsonl`,'');
 let data=await(await request.get('/api/desk')).json() as DeskSnapshot;
 const expectedCalls=(data.morning.menu as PrincipalMenu).doctrine.calls.filter(c=>c.id).map(c=>c.id);
 await page.setViewportSize({width:3440,height:1440});await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 async function act(button:()=>Promise<unknown>):Promise<DeskReply>{
  const pending=page.waitForResponse(r=>r.url().endsWith('/api/command')&&r.request().method()==='POST',{timeout:60000});
  await button();const response=await pending,result=await response.json() as DeskReply;
  appendFileSync(`${out}/${replaying?'replay-commands':'browser-commands'}.jsonl`,JSON.stringify({day:data.morning.requestDay,line:response.request().postDataJSON().line,ok:result.ok,message:result.message})+'\n');
  expect(result.ok,result.message).toBe(true);data=result.snapshot;return result;
 }
 async function sign(line:string){await book(page,S.orders);await page.getByRole('textbox',{name:S.command,exact:true}).fill(line);const result=await act(()=>page.getByRole('button',{name:S.sign,exact:true}).click());await rest(page);return result;}
 async function bypassLastReview(){
  const slip=data.queue.at(-1);if(!slip)throw Error('Expected a signed review slip');
  await sign(`cancel ${data.queue.length}`);
  await sign(`${slip.line} by=wire bypass`);
 }
 const handledObjections=new Set<string>(),goals=new Map<string,string>(),sentGoals=new Set<string>();
 let marked=false,sentBack=false,audience=false,lastReports=new Set<string>(),week=0,pendingResume=false;
 if(resume){
  const prefix=readFileSync(`${out}/resume-prefix.jsonl`,'utf8').trim().split(/\r?\n/).map(line=>JSON.parse(line) as {day:number;line:string;ok:boolean});
  for(const entry of prefix){
   expect(data.morning.requestDay).toBe(entry.day);expect(entry.ok).toBe(true);
   const result=await sign(entry.line);
   if(result.turn)await page.getByRole('button',{name:S.nextMorning,exact:true}).click();
   if(entry.line.startsWith('order ')){const words=entry.line.split(/\s+/);sentGoals.add(words[1]!);goals.set(words[1]!,words[3]!);}
   marked ||= entry.line.startsWith('edit ');sentBack ||= entry.line.startsWith('sendback ');audience ||= entry.line.startsWith('audience ');
  }
  const manifestPath=`${out}/resume-manifest.json`;
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8')) as {checkpoint:string;expectedQueue:string[]};
  const checkpoint=JSON.parse(readFileSync(`${out}/${manifest.checkpoint}`,'utf8')) as DeskSnapshot;
  expect(data.morning).toEqual(checkpoint.morning);expect(data.history).toEqual(checkpoint.history);
  expect(data.queue.map(q=>q.line)).toEqual(manifest.expectedQueue);
  save('prefix-replay-check.json',{commands:prefix.length,requestDay:data.morning.requestDay,morningEqual:true,historyEqual:true,queue:data.queue,reusedWeeks:weeks.length});
  week=weeks.length;const previous=JSON.parse(readFileSync(`${out}/snapshots/week-${String(week).padStart(2,'0')}-3440x1440.json`,'utf8')) as DeskSnapshot;
  lastReports=new Set(previous.morning.view.reports.map(r=>r.id));
  for(const r of data.morning.view.reports)if(r.type==='advice'&&r.subtype==='memorandum')handledObjections.add(r.id);
  replaying=false;pendingResume=data.queue.length>0;
 }
 const targets=[...Array.from({length:21},(_,i)=>6+i*7),148];
 while(data.morning.requestDay<=148){
  const menu=data.morning.menu as PrincipalMenu,day=data.morning.requestDay;
  let budget=menu.attention.left??1000;
  const spend=(key:string)=>{const cost=menu.attention.costs[key]??0;if(cost>budget)return false;budget-=cost;return true;};
  const actions:string[]=pendingResume?data.queue.map(q=>q.line):[];
  if(!pendingResume){
  for(const choice of menu.situations){
   const view=data.morning.view.situations.find(s=>s.id===choice.situation)!;
   const wanted=(historical.get(choice.situation)??[]).filter(id=>!view.chosen.includes(id));
   if(!wanted.length||!wanted.every(id=>choice.options.some(o=>o.optionId===id)))continue;
   await rest(page);await page.locator('.table-docket > button').click();
   const section=page.locator('.situation').filter({has:page.getByRole('heading',{name:data.strings[view.title],exact:true})});
   for(const id of wanted){const index=view.options.filter(o=>choice.options.some(c=>c.optionId===o.id)).findIndex(o=>o.id===id);await section.getByRole('checkbox').nth(index).check();}
   await capture(page,`decision-${day}-${choice.situation}`,data);
   await act(()=>section.getByRole('button',{name:S.signDecision,exact:true}).click());actions.push(`decide ${choice.situation} ${wanted.join(' ')}`);await rest(page);
  }
  // The history driver's own published requisitions, through the new desk control.
  for(const call of menu.doctrine.calls){
   if(!call.id||call.issued||call.day>day||(menu.atWarSince===null&&!call.atPeace)||!menu.raising.some(c=>c.post===call.post)||!spend('order'))continue;
   await rest(page);await page.getByRole('button',{name:S.run,exact:true}).click();
   const card=page.locator(`[data-call-id="${call.id}"]`);await expect(card).toBeVisible();
   await capture(page,`call-${day}-${call.id}`,data);
   await act(()=>card.getByRole('button',{name:S.signCall,exact:true}).click());await expect(card.getByRole('button',{name:S.callQueued,exact:true})).toBeDisabled();actions.push(`scheduled call ${call.id}`);await rest(page);
  }
  if(menu.atWarSince!==null){
   for(const c of menu.commandable){
    if(!c.raising||c.men===null||c.men===0||c.post===menu.doctrine.concentrateAt||c.inTransit.includes('transfer')||!menu.doctrine.concentrateAt||!spend('transfer'))continue;
    await sign(`transfer ${c.post} ${menu.doctrine.concentrateAt} blocks 999`);actions.push(`transfer ${c.post} to ${menu.doctrine.concentrateAt}`);
   }
   for(const o of menu.doctrine.offensives){
    if(o.purpose!==undefined||o.day>day||sentGoals.has(o.post)||!menu.commandable.some(c=>c.post===o.post)||!spend('order'))continue;
    await sign(`order ${o.post} take ${o.objective} review`);sentGoals.add(o.post);goals.set(o.post,o.objective);actions.push(`goal ${o.post} to ${o.objective}, review required`);
   }
   for(const r of menu.reviews){
    await book(page,S.plans);
    const select=page.getByLabel(M.plan,{exact:true});if(await select.isVisible())await select.selectOption(r.post);
    await expect(page.locator('.map-plan-sheet')).toBeVisible();
    if(!marked&&(!focusedPlan||sentBack)&&r.plan.axes.some(a=>a.regions.length>1)&&spend('review_edit')){
     const axis=r.plan.axes.find(a=>a.regions.length>1)!;
     await page.getByLabel(M.chooseAxis,{exact:true}).selectOption(axis.name);
     await page.getByLabel(M.chooseRegion,{exact:true}).selectOption(axis.regions[1]!);
     await act(()=>page.getByRole('button',{name:M.markWaypoint,exact:true}).click());
     await expect(page.locator('.pencil-list li')).toHaveCount(1);await capture(page,`plan-pencil-${day}`,data);
     await act(()=>page.getByRole('button',{name:M.order,exact:true}).click());
     if(focusedPlan)await bypassLastReview();
     marked=true;actions.push(`ordered waypoint edit to ${r.post}${focusedPlan?', direct wire after the received relay objection':''}`);
    }else if(!sentBack){
     await page.getByLabel(M.waitDays,{exact:true}).fill('0');await page.getByRole('button',{name:M.waitNote,exact:true}).click();
     await capture(page,`plan-notes-${day}`,data);
     await act(()=>page.getByRole('button',{name:data.strings['plan.note.send']??M.sendback,exact:true}).click());
     if(focusedPlan)await bypassLastReview();
     sentBack=true;actions.push(`send back ${r.post}, wait 0 note${focusedPlan?', direct wire after the received relay objection':''}`);
    }else{await act(()=>page.getByRole('button',{name:S.approve,exact:true}).click());actions.push(`approve ${r.post}`);}
    await rest(page);
    if(!audience&&spend('audience')){
     await book(page,S.board);await page.getByLabel(S.boardFilter).fill(r.post==='us_dc_militia'?'District':data.strings[`post.${r.post}.name`]??r.post);
     const post=page.locator(`[data-post="${r.post}"] > button`);await post.click();await page.getByRole('button',{name:S.audience,exact:true}).click();
     await expect(page.getByTestId('audience-scene')).toBeVisible();await capture(page,`audience-request-${day}`,data);
     await act(()=>page.getByRole('button',{name:S.sign,exact:true}).click());audience=true;actions.push(`audience ${r.post}`);await rest(page);
    }
   }
   for(const post of menu.awaiting){await sign(`go ${post}`);actions.push(`go ${post}`);}
   for(const memo of data.morning.view.reports.filter(r=>r.type==='advice'&&r.subtype==='memorandum'&&r.answers!==null&&!handledObjections.has(r.id))){
    handledObjections.add(memo.id);const target=menu.commandable.find(c=>c.post===memo.subjectId),goal=goals.get(memo.subjectId);
    if(!goal||!target?.relays.length||!spend('order'))continue;
    if(focusedPlan){
     const kind=memo.claims.find(c=>c.kind==='order-objected')?.token;
     const word=kind==='edit'?'edit':kind==='send_back'?'sendback':kind==='approve'?'approve':'order';
     if(word!=='order'&&!menu.reviews.some(r=>r.post===target.post))continue;
     const prior=[...data.history].reverse().flatMap(t=>[...(t.submitted??[])].reverse()).find(q=>q.line.split(/\s+/)[0]===word&&q.line.split(/\s+/)[1]===target.post);
     if(!prior)throw Error('No received-order counterpart in the desk’s own dispatched record');
     const line=prior.line.split(/\s+/).filter(t=>t!=='bypass'&&!t.startsWith('by=')).join(' ');
     await sign(`${line} by=wire bypass`);actions.push(`repeat withheld ${word} around relay: ${target.post}`);
    }else{await sign(`order ${target.post} take ${goal} review bypass`);actions.push(`repeat withheld goal around relay: ${target.post}`);}
   }
  }
  }
  const target=targets[week]!,future=menu.doctrine.calls.filter(c=>!c.issued&&c.day>day).map(c=>c.day).concat(menu.doctrine.offensives.filter(o=>!sentGoals.has(o.post)&&o.day>day).map(o=>o.day));
  const limit=Math.max(1,Math.min(focusedPlan&&sentGoals.size>0&&(!sentBack||!marked)?1:7,target-day+1,...future.map(d=>d-day)));
  await rest(page);await page.getByRole('button',{name:S.run,exact:true}).click();await page.getByLabel(S.turnDays).selectOption(String(limit));
  const result=await act(()=>page.getByRole('button',{name:S.sendRun,exact:true}).click());
  await page.getByRole('button',{name:S.nextMorning,exact:true}).click();
  const delivered=result.turn!.days.flatMap(d=>d.reports),refused=result.turn!.days.flatMap(d=>d.refused);
  journal.push({fromDay:day,toDay:data.morning.requestDay-1,date:data.date,actions,days:result.turn!.days,stopped:result.turn!.stopped,refused});
  pendingResume=false;
  save('progress.json',{day:data.morning.requestDay,date:data.date,week,marked,sentBack,audience,errors});save('journal.json',journal);
  if(data.morning.requestDay-1===target){
   await rest(page);const newPapers=data.morning.view.reports.filter(r=>!lastReports.has(r.id));lastReports=new Set(data.morning.view.reports.map(r=>r.id));
   for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){await page.setViewportSize(size);await capture(page,`week-${String(week+1).padStart(2,'0')}-${size.width}x${size.height}`,data);}
   await page.setViewportSize({width:3440,height:1440});await page.locator('.tray-stack.inbox').click();await page.getByTestId('weekly-link').click();
   await capture(page,`week-${String(week+1).padStart(2,'0')}-papers`,data);await rest(page);
   weeks.push({week:week+1,throughDay:target,nextMorning:data.date,newPapers:newPapers.map(r=>({id:r.id,type:r.type,day:r.day,receivedDay:r.receivedDay,subject:r.subjectId,claims:r.claims})),situations:data.morning.view.situations,menu:data.morning.menu,queue:data.queue});save('weeks.json',weeks);week++;
  }
  if(delivered.some(r=>r.claims.some(c=>c.kind==='battle-phase'||c.kind==='battle-result'))){await book(page,S.daybook);await capture(page,`battle-daybook-${data.morning.requestDay-1}`,data);await rest(page);}
 }
 save('final-snapshot.json',data);save('playthrough-result.json',{throughDay:data.morning.requestDay-1,weeks:weeks.length,turns:journal.length,marked,sentBack,audience,errors});
 expect(data.morning.requestDay).toBe(149);expect(weeks).toHaveLength(22);expect(errors).toEqual([]);
 const finalCalls=(data.morning.menu as PrincipalMenu).doctrine.calls.filter(c=>c.id);
 expect(finalCalls.map(c=>c.id)).toEqual(expectedCalls);
 expect(finalCalls.every(c=>c.issued===true),'Every authored identified call must actually be issued').toBe(true);
 const reports=data.history.flatMap(t=>t.days.flatMap(d=>d.reports));
 expect.soft(marked,'Exercise the arrow edit').toBe(true);
 expect.soft(sentBack,'Exercise notes with a send-back').toBe(true);
 expect.soft(audience,'Exercise the audience').toBe(true);
 expect.soft(reports.some(r=>r.claims.some(c=>c.region==='manassas'&&['battle-phase','battle-result'].includes(c.kind))),'A Manassas battle dispatch must actually reach the desk').toBe(true);
 expect.soft(reports.some(r=>(r.notes?.length??0)>0),'A received plan must account for the notes').toBe(true);
 // Keep missing events as failed acceptance criteria, with all received evidence retained.
});
