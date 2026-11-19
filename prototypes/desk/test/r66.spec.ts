import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import type {DeskSnapshot} from '../web/adapter.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
const out=fileURLToPath(new URL('../../../art-masters/R66/',import.meta.url));
const scene=JSON.parse(readFileSync(`${out}/scene.json`,'utf8')) as DeskSnapshot;
const visitor=JSON.parse(readFileSync(`${out}/fixture.json`,'utf8')).visitor as string;
async function ready(page:Page){await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});await page.evaluate(()=>document.fonts.ready);}
async function board(page:Page){await page.getByRole('button',{name:'Org board',exact:true}).click();await expect(page.getByTestId('org-board')).toBeVisible();}
async function audience(page:Page){await page.locator(`[data-post="${visitor}"]>.org-post`).click();await page.getByRole('button',{name:'Request an audience',exact:true}).click();await expect(page.getByTestId('audience-scene')).toBeVisible();}
async function capture(page:Page,name:string){
 if(process.env.R66_REUSE_1920==='1'&&name==='audience-1920x1080'&&existsSync(`${out}/${name}.png`))return;
 const path=`${out}/${name}.png`;await page.screenshot({path});
 const size=page.viewportSize()!;
 writeFileSync(`${path}.recipe.json`,JSON.stringify({asset:path,request:'R66',date:'2026-11-19',tool:'Playwright Chromium',mode:'Native browser capture',plan:'No image service used',client:'Codex',model:'No image model',prompt:null,references:[{path:`${out}/scene.json`,sha256:createHash('sha256').update(readFileSync(`${out}/scene.json`)).digest('hex')}],requestedSize:`${size.width}x${size.height}`,actualSize:`${size.width}x${size.height}`,humanEdits:[],postProcess:[],provenanceMarks:'Browser capture; no generated or removed provenance marks',sha256:createHash('sha256').update(readFileSync(path)).digest('hex'),notes:'Real Union seat snapshot after one held-goal turn. No likeness. Missing audience projection is stated on screen.'},null,2));
}
test('R66 smoke checks startup, scene selectors and keyboard return before captures',async({page})=>{
 const errors:string[]=[],writes:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());});
 await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.setViewportSize({width:1920,height:1080});await page.goto('/');await ready(page);await board(page);await audience(page);
 await expect(page.locator('dialog[open]')).toHaveAttribute('data-kind','audience');
 await expect(page.getByTestId('visitor-name-card')).toContainText('No likeness on file');
 await expect(page.getByTestId('audience-scene').locator('img,svg,canvas')).toHaveCount(0);
 await expect(page.getByTestId('desk')).toHaveAttribute('inert','');
 await page.keyboard.press('Escape');await expect(page.getByTestId('person-card')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.getByTestId('org-board')).toBeVisible();await page.keyboard.press('Escape');
 await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(page.getByRole('button',{name:'Org board',exact:true})).toBeFocused();
 expect(errors).toEqual([]);expect(writes).toEqual([]);
 writeFileSync(`${out}/smoke.json`,JSON.stringify({errors,writes,returnFocus:true},null,2));
});
test('R66 selector diagnosis isolates audience controls without capture cost',async({page})=>{
 await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.goto('/');await ready(page);await board(page);await audience(page);
 const byLabel=await page.getByLabel('Add an answer',{exact:true}).count(),byRole=await page.getByRole('combobox',{name:'Add an answer',exact:true}).count();
 const labels=await page.locator('.audience-answers label').allTextContents();
 writeFileSync(`${out}/selector-diagnosis.json`,JSON.stringify({byLabel,byRole,labels},null,2));
 expect(byRole).toBe(1);
 await page.getByRole('combobox',{name:'Add an answer',exact:true}).selectOption('reinforce');
 await expect(page.getByRole('spinbutton',{name:'Men to request',exact:true})).toBeVisible();
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R66 native board and audience ${size.width}`,async({page})=>{
 await page.setViewportSize(size);await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.goto('/');await ready(page);await board(page);
 const tag=`${size.width}x${size.height}`;
 expect((await page.getByRole('dialog').boundingBox())!.width).toBe(1400);
 expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await capture(page,`org-board-${tag}`);await audience(page);
 const card=page.getByTestId('visitor-name-card'),box=(await card.boundingBox())!;expect(box.height).toBeGreaterThan(size.width===3440?700:550);
 expect(box.width/box.height).toBeCloseTo(.75,2);
 expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await capture(page,`audience-${tag}`);
 await page.getByRole('combobox',{name:'Add an answer',exact:true}).selectOption('reinforce');await page.getByLabel('Men to request',{exact:true}).fill('300');
 const source=page.getByRole('combobox',{name:'Reinforcements from',exact:true});await source.selectOption({index:1});
 await expect(page.getByRole('button',{name:'Sign to out-tray',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Remove this answer',exact:true}).click();await expect(page.getByLabel('Men to request',{exact:true})).toHaveCount(0);
 await page.evaluate(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({scale:200,contrast:true})));
 await page.goto('/');await ready(page);await board(page);expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);await capture(page,`org-board-200-contrast-${tag}`);await audience(page);
 expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);await capture(page,`audience-200-contrast-${tag}`);
 await page.getByRole('combobox',{name:'Add an answer',exact:true}).focus();await page.keyboard.press('b');await expect(page.getByTestId('audience-scene')).toBeVisible();
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R66 portrait proportion and affected audience captures ${size.width}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize(size);await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.goto('/');await ready(page);await board(page);await audience(page);
 const tag=`${size.width}x${size.height}`,box=(await page.getByTestId('visitor-name-card').boundingBox())!;
 expect(box.width/box.height).toBeCloseTo(.75,2);expect(box.height).toBe(size.width===3440?720:560);
 await capture(page,`audience-${tag}`);
 await page.evaluate(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({scale:200,contrast:true})));
 await page.goto('/');await ready(page);await board(page);await audience(page);
 expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await capture(page,`audience-200-contrast-${tag}`);
 await page.getByRole('combobox',{name:'Add an answer',exact:true}).focus();await page.keyboard.press('Tab');
 await expect(page.getByRole('button',{name:'Sign to out-tray',exact:true})).toBeFocused();
 expect(errors).toEqual([]);
 writeFileSync(`${out}/portrait-${tag}.json`,JSON.stringify({size,card:box,errors,scale200NoHorizontalOverflow:true,signReachableByKeyboard:true},null,2));
});
test('R66 signs exactly one audience through the existing adapter and keeps read-only navigation free',async({page})=>{
 const adapter=new DeskAdapter(new ConsoleGame({pack:'union-1861',atWar:true})),opening=adapter.snapshot();
 const gameDay=opening.morning.requestDay,commands:string[]=[];
 await page.route('**/api/desk',r=>r.fulfill({json:adapter.snapshot()}));
 await page.route('**/api/command',async r=>{const body=r.request().postDataJSON();commands.push(body.line);await r.fulfill({json:adapter.execute(body.line,body.day)});});
 await page.goto('/');await ready(page);await board(page);await audience(page);expect(commands).toEqual([]);
 await page.getByRole('combobox',{name:'Add an answer',exact:true}).selectOption('threaten');
 await page.getByRole('button',{name:'Sign to out-tray',exact:true}).click();
 await expect(page.getByText('An audience request for this post is waiting in the out-tray.',{exact:true})).toBeVisible();
 expect(commands).toEqual([`audience ${visitor} threaten`]);expect(adapter.snapshot().morning.requestDay).toBe(gameDay);expect(adapter.snapshot().queue).toHaveLength(1);
 await expect(page.getByRole('button',{name:'Sign to out-tray',exact:true})).toBeDisabled();
 writeFileSync(`${out}/command.json`,JSON.stringify({commands,dayUnchanged:true,queued:adapter.snapshot().queue},null,2));
});
test('R66 source papers return to the audience with its unsigned answers intact',async({page})=>{
 const fixture=structuredClone(scene),menu=fixture.morning.menu;
 if(menu.menuKind!=='principal')throw Error('principal');
 const holder=menu.commandable.find(p=>p.post===visitor)!.holder;
 const report={...fixture.morning.view.reports[0]!,id:'r66.source',author:holder,authorPost:visitor,day:fixture.morning.view.day,receivedDay:fixture.morning.view.day,type:'advice',subjectKind:'post',subjectId:visitor,claims:[],advice:{recommends:'hold',reasons:[{kind:'lacks_resources',weight:999}],confidence:700}} as any;
 Object.assign(fixture.morning.view,{reports:[...fixture.morning.view.reports,report]});Object.assign(fixture.paperText,{'r66.source':'recommends hold'});
 await page.route('**/api/desk',r=>r.fulfill({json:fixture}));await page.goto('/');await ready(page);await board(page);await audience(page);
 await expect(page.locator('.audience-reasons>li')).toHaveCount(1);
 await page.getByRole('combobox',{name:'Add an answer',exact:true}).selectOption('vindicate');
 await page.locator('[data-source-paper="r66.source"]').click();await expect(page.getByTestId('paper')).toBeVisible();
 await expect(page.locator('.return-paper')).toHaveText('Back');await page.locator('.return-paper').click();await expect(page.getByTestId('audience-scene')).toBeVisible();
 await expect(page.locator('.audience-counter')).toContainText('Vindicate him publicly');
 await expect(page.getByTestId('audience-scene')).not.toContainText('999');
 writeFileSync(`${out}/source-navigation.json`,JSON.stringify({syntheticReceivedPaper:true,source:'r66.source',unsignedAnswerRetained:true}));
});
