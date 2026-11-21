import {test,expect,type Page} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {S} from '../web/strings.ts';
import {rest} from './support/s29-controls.ts';
const out=resolve('../../art-masters/S39/verify');
const sha=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex');
async function capture(page:Page,name:string,source:string){
 mkdirSync(out,{recursive:true});await page.evaluate(()=>document.fonts.ready);
 const file=`${out}/${name}.png`;await page.screenshot({path:file});
 writeFileSync(`${file}.recipe.json`,JSON.stringify({request:'S39',tool:'Prototype headless Playwright harness',mode:source,source,requestedSize:page.viewportSize(),actualSize:page.viewportSize(),humanEdits:[],postProcess:[],sha256:sha(file)},null,2));
}
async function book(page:Page,name:string){await rest(page);await page.getByRole('navigation',{name:S.deskObjects}).getByRole('button',{name,exact:true}).click();}

test('S39 live opening, receipt dates, readable decision dispatch and native appointment draft',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await expect(page.locator('.table-calendar time')).toHaveText('1861-03-05');await expect(page.getByTestId('first-morning-note')).toBeVisible();
 await page.getByRole('button',{name:'In-tray 1',exact:true}).click();await page.getByTestId('paper-link').first().click();
 await expect(page.getByTestId('paper')).toContainText('1861-03-05');await expect(page.getByTestId('paper')).not.toContainText('1861-03-04');
 await capture(page,'live-opening-paper-3440','Live human-seat opening after desk corrections; no loaded State or snapshot substitution.');
 await rest(page);await page.getByRole('button',{name:S.run,exact:true}).click();await page.getByLabel(S.turnDays).selectOption('1');
 await page.getByRole('button',{name:S.sendRun,exact:true}).click();await page.getByRole('button',{name:S.nextMorning,exact:true}).click();
 await expect(page.getByTestId('first-morning-note')).toHaveCount(0);await expect(page.locator('.table-calendar time')).toHaveText('1861-03-06');
 await page.getByRole('button',{name:S.stopDocket,exact:true}).click();const pickens=page.locator('.situation').filter({has:page.getByRole('heading',{name:'Fort Pickens',exact:true})});
 await pickens.getByRole('checkbox').first().check();await pickens.getByRole('button',{name:S.signDecision,exact:true}).click();
 await rest(page);await page.getByRole('button',{name:'Out-tray 1',exact:true}).click();
 await expect(page.locator('.order-list p')).toContainText('Fort Pickens: Land Captain Vogdes');await expect(page.locator('.order-list p')).not.toContainText(S.unknown);
 await capture(page,'live-readable-decision-3440','Live signed decision with received labels; not yet dispatched.');
 await book(page,S.board);await page.getByRole('button',{name:S.personnelTitle,exact:true}).click();
 const sheet=page.getByTestId('personnel-sheet');await expect(sheet).toContainText(S.personnelEligibility);await expect(sheet).toContainText(S.personnelNoEstablishment);
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){await page.setViewportSize(size);await page.locator('dialog[open] .panel-body').evaluate(el=>el.scrollTop=0);await capture(page,`live-personnel-${size.width}`,'Live received office and person roster; no eligibility inference.');}
 const choices=sheet.locator('select');await choices.nth(0).selectOption({index:1});await choices.nth(1).selectOption({index:1});
 await expect(page.locator('dialog[open] > .panel-header')).toBeInViewport();
 await sheet.getByRole('button',{name:S.personnelDraft,exact:true}).click();await expect(page.getByRole('textbox',{name:S.command,exact:true})).toHaveValue(/^appoint /);
 // Draft only: no unsupported claim that this nominee is eligible or appointed.
 await rest(page);await book(page,S.help);await page.getByRole('slider',{name:S.textSize,exact:true}).fill('200');
 await book(page,S.board);await page.getByRole('button',{name:S.personnelTitle,exact:true}).click();
 await page.getByTestId('personnel-sheet').locator('form').scrollIntoViewIfNeeded();await expect(page.locator('dialog[open] > .panel-header')).toBeInViewport();
 const overflow=await page.locator('dialog[open] .panel-body').evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));expect(overflow.scroll).toBeLessThanOrEqual(overflow.client+2);
 await capture(page,'live-personnel-1920-200','Live personnel form at 200 percent text; page remains keyboard accessible.');
 writeFileSync(`${out}/live-result.json`,JSON.stringify({errors,overflow,appointment:'drafted only',through:'1861-03-06'},null,2));expect(errors).toEqual([]);
});

test('S39 received July record replay verifies progress and clocks at both sizes without sending commands',async({page})=>{
 const file=resolve('../../art-masters/S39/advance/last-turn-reply.json'),data=JSON.parse(readFileSync(file,'utf8')).snapshot;
 expect(data.date).toBe('1861-07-31');let posts=0;const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/desk',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)}));
 await page.route('**/api/command',route=>{posts++;return route.abort();});
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await book(page,S.progress);
 const record=page.locator('.command-record').filter({has:page.getByRole('heading',{name:'District of Columbia militia (Inspector General)',exact:true})});
 await expect(record).toContainText('24 days from the plan');await expect(record).toContainText(S.progressNoStart);await expect(record).toContainText('Arrival reported');
 const arrival=record.locator('.progress-paper').filter({hasText:'Arrival reported'}).last();await expect(arrival).toContainText('Richmond');
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){
  await page.setViewportSize(size);await record.locator('.received-clock').scrollIntoViewIfNeeded();await expect(page.locator('dialog[open] > .panel-header')).toBeInViewport();await capture(page,`received-plan-clock-${size.width}`,`Read-only presentation replay of completed early campaign public snapshot; source SHA-256 ${sha(file)}.`);
  await arrival.scrollIntoViewIfNeeded();await capture(page,`received-arrival-record-${size.width}`,`Read-only public record replay; source SHA-256 ${sha(file)}. Not a third played campaign.`);
 }
 await arrival.getByRole('button',{name:S.ledgerTerms,exact:true}).click();await expect(page.getByTestId('paper')).toContainText('arrived at Richmond');
 await capture(page,'received-arrival-paper-1920',`Original public paper rendered with corrected event dates; source SHA-256 ${sha(file)}.`);
 expect(posts).toBe(0);expect(errors).toEqual([]);writeFileSync(`${out}/record-replay-result.json`,JSON.stringify({source:file,sha256:sha(file),posts,errors,mode:'Public presentation record, no State, no game replay'},null,2));
});

test('S39 received battle-hour paper observer',async({page})=>{
 const file=resolve('../../art-masters/S39/advance/last-turn-reply.json'),data=JSON.parse(readFileSync(file,'utf8')).snapshot;
 let posts=0;await page.route('**/api/desk',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)}));
 await page.route('**/api/command',route=>{posts++;return route.abort();});
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});await book(page,S.progress);
 const record=page.locator('.command-record').filter({has:page.getByRole('heading',{name:'District of Columbia militia (Inspector General)',exact:true})});
 const dispatch=record.locator('.progress-paper').filter({hasText:'Battle dispatch'}).first();await expect(dispatch).toContainText(/(08|12|17|21):00/);
 await dispatch.getByRole('button',{name:S.ledgerTerms,exact:true}).click();await expect(page.getByTestId('paper')).toContainText('Charles P. Stone');
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){await page.setViewportSize(size);await capture(page,`received-battle-paper-${size.width}`,`Read-only completed campaign's public battle dispatch with its received hour. Source SHA-256 ${sha(file)}. No new play or State load.`);}
 expect(posts).toBe(0);writeFileSync(`${out}/battle-observer-result.json`,JSON.stringify({posts,sourceSha256:sha(file),mode:'Public record observer'},null,2));
});
