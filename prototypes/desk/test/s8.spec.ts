import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {DeskAdapter} from '../server/adapter.ts';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import type {DeskSnapshot} from '../web/adapter.ts';
const out=resolve(process.env.S8_EVIDENCE??'../../../ByOrderOfThePresident/art-masters/S8');
const scene=JSON.parse(readFileSync(`${out}/union-1861-scene.json`,'utf8')) as DeskSnapshot;
const visitor=JSON.parse(readFileSync(`${out}/union-1861-fixture.json`,'utf8')).visitor as string;
const hash=(value:Buffer)=>createHash('sha256').update(value).digest('hex');
async function ready(page:Page){await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:25000});await page.evaluate(()=>document.fonts.ready);}
async function capture(page:Page,name:string,source='union-1861-scene.json'){
 if(process.env.S8_CAPTURE==='0')return;
 const file=`${out}/${name}.png`,size=page.viewportSize()!;
 if(process.env.S8_REUSE_WIDE==='1'&&name.endsWith('3440x1440')&&['org-board','audience'].some(prefix=>name===`${prefix}-3440x1440`)&&existsSync(file))return;
 await page.screenshot({path:file});
 writeFileSync(`${file}.recipe.json`,JSON.stringify({request:'S8',asset:file,date:'2026-11-20',tool:'Playwright Chromium',mode:'Native browser capture',prompt:null,plan:'No image service',client:'Codex',model:'No image model',requestedSize:`${size.width}x${size.height}`,actualSize:`${size.width}x${size.height}`,references:[{path:`${out}/${source}`,sha256:hash(readFileSync(`${out}/${source}`))}],humanEdits:[],postProcess:[],sha256:hash(readFileSync(file)),notes:'Actual seat fixture. No likeness. No historical or behavioural outcome inferred by the UI.'},null,2));
}
async function open(page:Page,name:string){await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name,exact:true}).click();}
async function audience(page:Page){await open(page,'Org board');await page.locator(`[data-post="${visitor}"]>.org-post`).click();await page.getByRole('button',{name:'Request an audience',exact:true}).click();}
async function returnAudience(page:Page){await page.keyboard.press('Escape');await expect(page.getByTestId('person-card')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByTestId('org-board')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(page.getByTestId('desk')).not.toHaveAttribute('inert');}

test('S8 audience keyboard return diagnosis',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.goto('/');await ready(page);await audience(page);
 const states=[];
 for(let i=0;i<3;i++){
  await page.keyboard.press('Escape');
  states.push(await page.evaluate(()=>({heading:document.querySelector('dialog #panel-title')?.textContent,open:document.querySelector('dialog')?.hasAttribute('open'),inert:document.querySelector('[data-testid=desk]')?.hasAttribute('inert'),focus:document.activeElement?.outerHTML.slice(0,180)})));
 }
 writeFileSync(`${out}/return-diagnosis.json`,JSON.stringify(states,null,2));
 await expect(page.locator('dialog[open]')).toHaveCount(0);
 await expect(page.getByTestId('desk')).not.toHaveAttribute('inert');
 await open(page,'Plans & enemy');await expect(page.locator('.map-plan-sheet')).toBeVisible();
});

test('S8 preflight checks the actual server, assets, source boundary and selectors',async({page,request})=>{
 const response=await request.get('/api/desk');expect(response.ok()).toBe(true);
 expect((await request.get('/art/app/chrome/ledger-closed.png')).ok()).toBe(true);
 expect((await request.get('/api/desk',{headers:{Origin:'http://127.0.0.1:5274'}})).status()).toBe(403);
 expect((await request.get('/server/adapter.ts')).status()).toBe(404);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});await page.goto('/');await ready(page);
 await open(page,'Ledger');await expect(page.getByTestId('accountability-ledger')).toBeVisible();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Attention',exact:true}).click();await expect(page.locator('.price-table')).toBeVisible();
 expect(errors).toEqual([]);
 writeFileSync(`${out}/smoke.json`,JSON.stringify({server:true,assets:true,wrongOriginRejected:true,serverSourceDenied:true,errors},null,2));
});

for(const size of [{width:3440,height:1440},{width:1920,height:1080}])test(`S8 native views ${size.width}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize(size);await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.goto('/');await ready(page);
 const tag=`${size.width}x${size.height}`;
 await expect(page.getByTestId('stop-slip')).toBeVisible();await capture(page,`turn-stop-${tag}`);
 await page.getByRole('button',{name:'Attention',exact:true}).click();await capture(page,`attention-${tag}`);await page.keyboard.press('Escape');
 await open(page,'Ledger');await capture(page,`accountability-${tag}`);
 await page.getByRole('button',{name:'Figures received',exact:true}).click();await capture(page,`ledger-returns-${tag}`);await page.keyboard.press('Escape');
 await open(page,'Org board');await capture(page,`org-board-${tag}`);await page.keyboard.press('Escape');
 await audience(page);await capture(page,`audience-${tag}`);await returnAudience(page);
 await open(page,'Plans & enemy');await expect(page.locator('.map-plan-sheet')).toBeVisible();await capture(page,`plan-review-${tag}`);
 const returns=JSON.parse(readFileSync(`${out}/union-1861-returns-scene.json`,'utf8'));
 await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:returns}));await page.goto('/');await ready(page);
 await open(page,'Ledger');await page.getByRole('button',{name:'Figures received',exact:true}).click();await expect(page.locator('.return-entry')).not.toHaveCount(0);await capture(page,`ledger-figures-${tag}`,'union-1861-returns-scene.json');
 expect(errors).toEqual([]);
});

for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`S8 keyboard signs one send-back payload and the ledger preserves dispatched slips ${size.width}`,async({page})=>{
 const game=new ConsoleGame({pack:'testbed',atWar:true}),desk=new DeskAdapter(game),commands:string[]=[];
 desk.execute('order n_army_west take salient_tip review');desk.execute('end');
 await page.setViewportSize(size);
 await page.route('**/api/desk',r=>r.fulfill({json:desk.snapshot()}));
 await page.route('**/api/command',r=>{const {line,day}=r.request().postDataJSON();commands.push(line);return r.fulfill({json:desk.execute(line,day)});});
 await page.goto('/');await ready(page);await open(page,'Plans & enemy');
 await page.getByRole('combobox',{name:'Region for the pencil mark',exact:true}).selectOption('salient_base');
 await page.getByRole('button',{name:'Mark objective',exact:true}).click();await expect(page.locator('.pencil-list li')).toHaveCount(1);
 await page.getByRole('spinbutton',{name:'Days to request in a wait note',exact:true}).fill('3');await page.getByRole('button',{name:'Add a wait note',exact:true}).click();
 await expect(page.locator('.wait-notes')).toContainText('3 days');
 await capture(page,`plan-marks-${size.width}x${size.height}`,'testbed-scene.json');
 await page.getByRole('button',{name:'Send back with notes',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('.map-review-message')).toContainText('out-tray');
 expect(desk.snapshot().queue.map(q=>q.line)).toEqual(['sendback n_army_west focus:main:salient_base wait:main:3']);
 expect(commands.filter(c=>c.startsWith('edit '))).toEqual([]);
 await page.keyboard.press('Escape');await page.keyboard.press('Control+Enter');await page.keyboard.press('Control+Enter');
 await expect(page.getByRole('button',{name:'To the next morning',exact:true})).toBeVisible();await page.getByRole('button',{name:'To the next morning',exact:true}).click();
 await page.keyboard.press('l');await expect(page.getByTestId('accountability-ledger')).toContainText('Dispatched; outcome not inferred');
 expect(desk.snapshot().history.at(-1)?.submitted?.[0]?.line).toBe('sendback n_army_west focus:main:salient_base wait:main:3');
 writeFileSync(`${out}/commands.json`,JSON.stringify({commands,hash:game.hash(),submitted:desk.snapshot().history.map(t=>t.submitted)},null,2));
});

test('S8 1280 by 800 reflow keeps the enlarged plan controls reachable',async({page})=>{
 await page.setViewportSize({width:1280,height:800});await page.route('**/api/desk',r=>r.fulfill({json:scene}));
 await page.addInitScript(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({scale:200,contrast:true,muted:true})));
 await page.goto('/');await expect(page.getByRole('navigation',{name:'Desk objects'})).toBeVisible();await open(page,'Plans & enemy');
 const sheet=page.locator('.map-plan-sheet');await expect(sheet).toBeVisible();
 expect(await sheet.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await page.getByRole('button',{name:'Send back with notes',exact:true}).scrollIntoViewIfNeeded();await expect(page.getByRole('button',{name:'Send back with notes',exact:true})).toBeInViewport();
 await capture(page,'plan-200-contrast-1280x800');
});

for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`S8 pausable turn playback ${size.width}`,async({page})=>{
 const before=JSON.parse(readFileSync(`${out}/union-1861-playback-before.json`,'utf8'));
 const reply=JSON.parse(readFileSync(`${out}/union-1861-playback-reply.json`,'utf8'));
 await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({speed:'slow',muted:true})));
 await page.route('**/api/desk',r=>r.fulfill({json:before}));await page.route('**/api/command',r=>r.fulfill({json:reply}));await page.goto('/');await ready(page);
 await page.getByRole('button',{name:'Let the days run',exact:true}).click();await capture(page,`turn-sheet-${size.width}x${size.height}`,'union-1861-playback-before.json');
 await page.getByRole('button',{name:'Send orders & run days',exact:true}).click();await page.getByRole('button',{name:'Pause playback',exact:true}).click();
 await page.keyboard.press('b');await expect(page.locator('dialog[open]')).toHaveCount(0);
 await expect(page.getByTestId('turn-playback')).toContainText('Playback paused');await capture(page,`turn-playback-${size.width}x${size.height}`,'union-1861-playback-reply.json');
 await page.getByRole('button',{name:'Skip to the stop',exact:true}).click();await expect(page.getByRole('button',{name:'To the next morning',exact:true})).toBeVisible();
});

for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`S8 keyboard and 200 percent contrast reflow preserve each new view ${size.width}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize(size);await page.route('**/api/desk',r=>r.fulfill({json:scene}));
 await page.addInitScript(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({scale:200,contrast:true,muted:true,speed:'instant'})));
 await page.goto('/');await ready(page);
 for(const key of ['l','b']){
  await page.keyboard.press(key);const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  await capture(page,`${key==='l'?'ledger':'board'}-200-contrast-${size.width}x${size.height}`);await page.keyboard.press('Escape');
 }
 await audience(page);expect(await page.locator('dialog[open]').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await capture(page,`audience-200-contrast-${size.width}x${size.height}`);
 await page.getByRole('combobox',{name:'Add an answer',exact:true}).focus();await page.keyboard.press('b');await expect(page.getByTestId('audience-scene')).toBeVisible();
 expect(errors).toEqual([]);
});

test('S8 ledger source returns to the same leaf and source control',async({page})=>{
 const returns=JSON.parse(readFileSync(`${out}/union-1861-returns-scene.json`,'utf8'));
 await page.setViewportSize({width:1920,height:1080});await page.route('**/api/desk',r=>r.fulfill({json:returns}));await page.goto('/');await expect(page.getByRole('navigation',{name:'Desk objects'})).toBeVisible();
 await open(page,'Ledger');await page.getByRole('button',{name:'Figures received',exact:true}).click();
 const source=page.locator('.return-entry button').first();await expect(source).toBeVisible();await source.click();
 await expect(page.getByTestId('paper')).toBeVisible();await expect(page.locator('.return-paper')).toHaveText('Back');
 await page.locator('.return-paper').click();await expect(page.getByRole('button',{name:'Figures received',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.return-entry button').first()).toBeFocused();
});

test('S8 exhausted attention leaves a free inquiry available',async({page})=>{
 const empty=structuredClone(scene);Object.assign(empty.morning.view,{attention:0});Object.assign(empty.morning.menu,{attention:{...(empty.morning.menu as any).attention,left:0}});
 await page.route('**/api/desk',r=>r.fulfill({json:empty}));await page.goto('/');await expect(page.getByRole('navigation',{name:'Desk objects'})).toBeVisible();await open(page,'Write an order');
 await page.getByRole('combobox',{name:'Begin with a verb',exact:true}).selectOption('order');await page.getByRole('combobox',{name:'Address to post',exact:true}).selectOption(visitor);
 await expect(page.getByTestId('action-price')).toContainText('Wait for a refill');await expect(page.getByRole('button',{name:'Sign to out-tray',exact:true})).toBeDisabled();
 await page.getByRole('combobox',{name:'Begin with a verb',exact:true}).selectOption('inquire');await expect(page.getByTestId('action-price')).toContainText('Free');await expect(page.getByRole('button',{name:'Sign to out-tray',exact:true})).toBeEnabled();
});
