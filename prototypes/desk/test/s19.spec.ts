import {test,expect,type Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const out=resolve('../../../ByOrderOfThePresident/art-masters/S19');
const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
async function ready(page:Page){await expect(page.getByRole('navigation',{name:'Desk objects'})).toBeVisible();await expect(page.locator('.pixi-map canvas')).toBeVisible({timeout:25000});await page.evaluate(()=>document.fonts.ready);}
async function open(page:Page,name:string){await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name,exact:true}).click();}
async function capture(page:Page,name:string,source:string){
 const file=`${out}/${name}.png`,size=page.viewportSize()!;
 await page.screenshot({path:file});
 writeFileSync(`${file}.recipe.json`,JSON.stringify({request:'S19',asset:file,date:'2026-11-20',tool:'Playwright Chromium',mode:'Native browser capture',prompt:null,plan:'No image service',client:'Codex',model:'No image model',requestedSize:`${size.width}x${size.height}`,actualSize:`${size.width}x${size.height}`,references:[{path:`${out}/${source}`,sha256:hash(readFileSync(`${out}/${source}`))}],humanEdits:[],postProcess:[],sha256:hash(readFileSync(file)),notes:'Seat-derived fixture. No likeness, invented speech or compliance prediction.'},null,2));
}
test('preflight: real server, four projections, stop endpoint and isolation',async({page,request})=>{
 const response=await request.get('/api/desk');expect(response.ok()).toBe(true);
 const data=await response.json();expect(data.morning.view.attentionBudget.nextRefillDay).toBeGreaterThan(0);expect(data.morning.view.congress.chambers).toHaveLength(2);expect(data.morning.view.audiences).toEqual([]);expect(data.morning.turnStops.points).toHaveLength(10);
 expect((await request.get('/art/app/chrome/ledger-closed.png')).ok()).toBe(true);
 expect((await request.get('/server/adapter.ts')).status()).toBe(404);
 expect((await request.post('/api/stops',{headers:{Origin:'http://127.0.0.1:5274'},data:{day:data.morning.requestDay,points:[]}})).status()).toBe(403);
 expect((await request.post('/api/stops',{data:{day:data.morning.requestDay,points:['invented']}})).ok()).toBe(true);
 expect((await (await request.post('/api/stops',{data:{day:data.morning.requestDay-1,points:[]}})).json()).ok).toBe(false);
 expect((await request.post('/api/stops',{data:{day:data.morning.requestDay,points:42}})).status()).toBe(400);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});await page.goto('/');await ready(page);
 await page.getByRole('button',{name:'Attention',exact:true}).click();await expect(page.getByTestId('attention-refill')).toContainText('Next refill:');await page.keyboard.press('Escape');
 await open(page,'Ledger');await page.getByRole('button',{name:'Account to Congress',exact:true}).first().click();await expect(page.getByTestId('congress-sheet')).toContainText('House of Representatives');await page.keyboard.press('Escape');
 await page.keyboard.press('Control+Enter');await expect(page.getByRole('checkbox')).toHaveCount(10);
 const objection=page.getByRole('checkbox',{name:'Stop on: An objection reached the desk.',exact:true});await objection.click();await expect(objection).not.toBeChecked();await expect(page.locator('.feedback [role=status]')).toContainText('Turn stops updated.');
 await page.reload();await expect(page.getByRole('navigation',{name:'Desk objects'})).toBeVisible();await page.keyboard.press('Control+Enter');await expect(page.getByRole('checkbox',{name:'Stop on: An objection reached the desk.',exact:true})).not.toBeChecked();await page.getByRole('button',{name:'Enable every stop',exact:true}).click();
 expect(errors).toEqual([]);writeFileSync(`${out}/preflight.json`,JSON.stringify({port:5291,wrongOriginRejected:true,serverSourceDenied:true,stopRefresh:true,errors},null,2));
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`native projections ${size.width}`,async({page})=>{
 const scene=JSON.parse(readFileSync(`${out}/union-scene.json`,'utf8'));
 await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.setViewportSize(size);await page.goto('/');await ready(page);
 const tag=`${size.width}x${size.height}`;
 await page.getByRole('button',{name:'Attention',exact:true}).click();await expect(page.getByTestId('attention-refill')).toContainText('Spent this week:');await capture(page,`attention-${tag}`,'union-scene.json');await page.keyboard.press('Escape');
 await open(page,'Ledger');await page.getByRole('button',{name:'Account to Congress',exact:true}).first().click();await expect(page.getByTestId('congress-sheet')).toContainText('Acts on record');await capture(page,`congress-${tag}`,'union-scene.json');await page.keyboard.press('Escape');
 await page.keyboard.press('Control+Enter');await capture(page,`turn-stops-${tag}`,'union-scene.json');await page.keyboard.press('Escape');
 const audience=JSON.parse(readFileSync(`${out}/audience-scene.json`,'utf8'));
 await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:audience}));await page.goto('/');await ready(page);await open(page,'Org board');
 await expect(page.getByTestId('audience-correspondence')).toContainText('Audience requested by you');await capture(page,`audience-correspondence-${tag}`,'audience-scene.json');
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`Congress reading and accessible controls ${size.width}`,async({page})=>{
 const scene=JSON.parse(readFileSync(`${out}/union-scene.json`,'utf8'));
 await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.setViewportSize(size);await page.goto('/');await ready(page);await open(page,'Ledger');await page.getByRole('button',{name:'Account to Congress',exact:true}).first().click();
 const sheet=page.getByTestId('congress-sheet');await expect(sheet).not.toContainText('Not supplied');await capture(page,`congress-${size.width}x${size.height}`,'union-scene.json');
 await sheet.getByRole('heading',{name:'Acts on record',exact:true}).scrollIntoViewIfNeeded();await expect(sheet).toContainText('Your recorded decision');await expect(sheet).toContainText('No answer recorded');await capture(page,`congress-acts-${size.width}x${size.height}`,'union-scene.json');
 await page.keyboard.press('Escape');
 await page.addInitScript(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({scale:200,contrast:true,muted:true})));
 await page.reload();await page.getByRole('navigation',{name:'Desk objects'}).waitFor();await page.keyboard.press('Control+Enter');
 const fieldset=page.locator('.stop-policy fieldset');expect(await fieldset.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 const last=page.getByRole('button',{name:'Enable every stop',exact:true});await last.scrollIntoViewIfNeeded();await expect(last).toBeInViewport();await capture(page,`stops-200-contrast-${size.width}x${size.height}`,'union-scene.json');
});
test('received audience source returns to the correspondence and its source control',async({page})=>{
 const scene=JSON.parse(readFileSync(`${out}/request-scene.json`,'utf8'));
 await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.setViewportSize({width:1920,height:1080});await page.goto('/');await ready(page);await open(page,'Org board');
 const source=page.locator('[data-source-paper="m.s19.fictional-request"]');await source.click();await expect(page.getByTestId('paper')).toContainText('A fictional request to see the principal.');await page.keyboard.press('Escape');await expect(page.getByTestId('audience-correspondence')).toBeVisible();await expect(source).toBeFocused();
 await capture(page,'audience-request-source-1920x1080','request-scene.json');
});
