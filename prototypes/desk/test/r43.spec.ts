import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import type {DeskSnapshot} from '../web/adapter.ts';
import {filterPapers,weeklyPapers,paperPlaces} from '../web/intray.ts';
const out=fileURLToPath(new URL('../../../art-masters/R43/',import.meta.url));
const scene=JSON.parse(readFileSync(`${out}/busiest-snapshot.json`,'utf8')) as DeskSnapshot;
async function ready(page:Page){await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});await page.evaluate(()=>document.fonts.ready);}
async function inbox(page:Page){await page.locator('button.tray-stack.inbox').click();await expect(page.getByRole('dialog')).toBeVisible();}
test('R43 startup uses the main checkout straight map and research palette',async({page})=>{
 const signRequests:string[]=[],errors:string[]=[];page.on('request',r=>{if(r.url().includes('-signs/'))signRequests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});await page.goto('/');await ready(page);
 const d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
 expect(d.palette).toBe('research');expect(d.furniture.enabled).toBe(false);expect(d.furniture.bytes).toBe(0);expect(d.staticBakes).toBe(0);expect(d.atlasSource).toBe('disk');
 expect(signRequests).toEqual([]);expect(errors).toEqual([]);await inbox(page);await expect(page.getByLabel('Sender',{exact:true})).toBeVisible();
 await page.screenshot({path:`${out}/startup-main.png`});writeFileSync(`${out}/startup.json`,JSON.stringify({diagnostics:d,signRequests,errors},null,2));
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R43 corrected summary and enlarged controls ${size.width}`,async({page})=>{
 await page.setViewportSize(size);await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.goto('/');await ready(page);await inbox(page);
 await page.getByTestId('weekly-link').click();const summary=page.getByTestId('weekly-summary');await expect(summary).toBeVisible();
 await expect(summary).not.toContainText('about person');await expect(summary).toContainText('dawn at Washington');
 await page.screenshot({path:`${out}/intray-summary-${size.width}x${size.height}.png`});
 await summary.locator('[data-source-paper]').first().click();await expect(page.getByTestId('paper')).toBeVisible();
 await page.getByRole('button',{name:'Return to tray',exact:true}).click();await expect(summary).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.getByTestId('weekly-link')).toBeVisible();
 await page.evaluate(()=>localStorage.setItem('presidential-desk-presentation',JSON.stringify({scale:200,contrast:true})));
 await page.goto('/');await ready(page);await inbox(page);
 const sender=page.getByLabel('Sender',{exact:true});await sender.focus();await page.keyboard.press('d');await expect(sender).toBeFocused();
 expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await page.screenshot({path:`${out}/intray-200-contrast-${size.width}x${size.height}.png`});
 await page.getByTestId('weekly-link').click();await expect(summary).toBeVisible();
 expect(await page.getByTestId('paper-on-map').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await page.screenshot({path:`${out}/summary-200-contrast-${size.width}x${size.height}.png`});
});
for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R43 in-tray at volume ${size.width}`,async({page})=>{
 await page.setViewportSize(size);const writes:string[]=[],errors:string[]=[];
 page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/desk',r=>r.fulfill({json:scene}));const tag=`${size.width}x${size.height}`;
 // The retained R41 App is a temporary local module used only for before captures.
 if(existsSync(fileURLToPath(new URL('../web/.r43-before.tsx',import.meta.url)))){
  await page.route('**/web/App.tsx*',async r=>{const response=await r.fetch({url:r.request().url().replace('App.tsx','.r43-before.tsx')});await r.fulfill({response});});
  await page.goto('/');await ready(page);await inbox(page);await page.screenshot({path:`${out}/intray-before-${tag}.png`});await page.unroute('**/web/App.tsx*');
 }
 await page.goto('/');await ready(page);await inbox(page);
 const links=page.getByTestId('paper-link');await expect(links).toHaveCount(scene.morning.view.reports.length);
 await page.screenshot({path:`${out}/intray-after-${tag}.png`});
 await page.getByLabel('Sender',{exact:true}).selectOption('press');await page.getByLabel('Unread only').check();
 const press=filterPapers(scene,scene.morning.view.reports,{sender:'press',place:'',unread:true},new Set());await expect(links).toHaveCount(press.length);
 await page.screenshot({path:`${out}/intray-filter-${tag}.png`});
 const place=press.flatMap(p=>paperPlaces(p,scene))[0];if(place){await page.getByLabel('Place named').selectOption(place);await expect(links).toHaveCount(press.filter(p=>paperPlaces(p,scene).includes(place)).length);}
 await links.first().click();await expect(page.getByTestId('paper')).toBeVisible();await page.getByRole('button',{name:'Return to tray',exact:true}).click();
 await expect(page.getByLabel('Unread only')).toBeChecked();await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 await expect(page.getByLabel('Sender',{exact:true})).toHaveValue('all');await expect(page.getByLabel('Place named')).toHaveValue('');await expect(page.getByLabel('Unread only')).not.toBeChecked();
 await expect(links).toHaveCount(scene.morning.view.reports.length);
 await page.getByTestId('weekly-link').click();const summary=page.getByTestId('weekly-summary');await expect(summary).toBeVisible();
 const expected=weeklyPapers(scene);await expect(summary.locator('[data-source-paper]')).toHaveCount(expected.lines.length);await expect(summary).not.toContainText('‰');
 for(const line of expected.lines){expect(scene.morning.view.reports.some(r=>r.id===line.paper.id)).toBe(true);}
 await page.screenshot({path:`${out}/intray-summary-${tag}.png`});
 const first=summary.locator('[data-source-paper]').first();const source=await first.getAttribute('data-source-paper');await first.click();await expect(page.getByTestId('paper')).toBeVisible();
 await page.getByRole('button',{name:'Return to tray',exact:true}).click();await expect(summary).toBeVisible();
 await page.getByRole('button',{name:'Return to tray',exact:true}).click();await expect(page.getByTestId('weekly-link')).toBeVisible();
 expect(errors).toEqual([]);expect(writes).toEqual([]);
 writeFileSync(`${out}/intray-${tag}.json`,JSON.stringify({inTray:scene.morning.view.reports.length,press:press.length,summaryPapers:expected.coveredPapers,summaryLines:expected.lines.length,sourceOpened:source,writes,errors},null,2));
});
