import {test,expect,type Page} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {rest} from './support/s29-controls.ts';
import {S} from '../web/strings.ts';
const out=resolve('../../art-masters/S47/verify');
async function capture(page:Page,name:string,source:string){
 mkdirSync(out,{recursive:true});await page.evaluate(()=>document.fonts.ready);
 const file=`${out}/${name}.png`;await page.screenshot({path:file});
 writeFileSync(`${file}.recipe.json`,JSON.stringify({request:'S47',tool:'Prototype headless Playwright harness',mode:'Unedited rendered desk capture',source,requestedSize:page.viewportSize(),actualSize:page.viewportSize(),humanEdits:[],postProcess:[],sha256:createHash('sha256').update(readFileSync(file)).digest('hex')},null,2));
}
async function book(page:Page,name:string){await rest(page);await page.getByRole('navigation',{name:S.deskObjects}).getByRole('button',{name,exact:true}).click();}

test('live cabinet consultation retains its received decision and queues only the selected adviser',async({page})=>{
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await page.getByRole('button',{name:S.run,exact:true}).click();await page.getByLabel(S.turnDays).selectOption('1');
 await page.getByRole('button',{name:S.sendRun,exact:true}).click();await page.getByRole('button',{name:S.nextMorning,exact:true}).click();
 await page.getByRole('button',{name:S.stopDocket,exact:true}).click();
 const pickens=page.locator('.situation').filter({has:page.getByRole('heading',{name:'Fort Pickens',exact:true})});
 const recipients=pickens.getByRole('group',{name:S.consultRecipients});
 await recipients.getByRole('checkbox',{name:'Secretary of State',exact:true}).check();
 await pickens.getByRole('button',{name:S.consult,exact:true}).click();
 await expect(recipients.getByRole('checkbox',{name:'Secretary of State',exact:true})).toHaveCount(0);
 await expect(recipients.getByRole('checkbox',{name:'Secretary of the Treasury',exact:true})).toBeVisible();
 await expect(page.locator('.table-calendar time')).toHaveText('1861-03-06');
 await capture(page,'consultation-selected-3440','Live received Pickens consultation; only the selected adviser queued.');
 await rest(page);await page.getByRole('button',{name:'Out-tray 1',exact:true}).click();
 await expect(page.locator('.order-list p')).toContainText('Ask in writing: Fort Pickens');
 await expect(page.locator('.order-list p')).toContainText('Secretary of State');
 await expect(page.locator('.order-list p')).not.toContainText('Secretary of the Treasury');
});

test('live patronage draft uses a received person and remains readable at 200 percent',async({page})=>{
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await book(page,S.board);await page.getByLabel(S.boardFilter).fill('Cameron');
 await page.getByRole('button',{name:'Secretary of War',exact:false}).click();
 await page.getByRole('button',{name:S.counterLabels.promise_advancement,exact:true}).click();
 await expect(page.getByLabel(S.chooseKnownPerson)).toHaveValue('cameron_simon');
 await expect(page.getByLabel(S.command, {exact:true})).toHaveValue('promise \u2039Simon Cameron\u203a');
 await expect(page.getByLabel(S.choosePerson,{exact:true})).toHaveCount(0);
 await page.setViewportSize({width:1920,height:1080});
 await capture(page,'patronage-person-1920','Live received person draft; no promise sent by verification.');
 await book(page,S.help);await page.getByRole('slider',{name:S.textSize,exact:true}).fill('200');
 await book(page,S.orders);await page.getByLabel(S.chooseVerb).selectOption('pressure');
 await page.getByLabel(S.chooseKnownPerson).selectOption('cameron_simon');
 await expect(page.getByLabel(S.command,{exact:true})).toHaveValue('pressure \u2039Simon Cameron\u203a');
 const overflow=await page.locator('dialog[open] .panel-body').evaluate(el=>el.scrollWidth-el.clientWidth);
 expect(overflow).toBeLessThanOrEqual(2);await capture(page,'patronage-person-1920-200','Live received person editor at 200 percent; draft only.');
});

test('retained July receipt renders its received recommendation at both sizes with no game writes',async({page})=>{
 const source=resolve('../../art-masters/S47/politics/last-turn-reply.json');
 const data=JSON.parse(readFileSync(source,'utf8')).snapshot;expect(data.date).toBe('1861-07-31');
 let posts=0;const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/desk',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)}));
 await page.route('**/api/command',route=>{posts++;return route.abort();});
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await page.getByRole('button',{name:'In-tray',exact:false}).click();await page.getByLabel(S.traySender).selectOption('cabinet');
 await page.getByTestId('paper-link').filter({hasText:'Salmon P. Chase'}).filter({hasText:'Secretary of the Treasury'}).click();
 const paper=page.getByTestId('paper');await expect(paper).toContainText('Recommends: Ask for 400,000 men and $400 million, and defend the spring');
 await expect(paper).not.toContainText('Not supplied');await expect(paper).not.toContainText('ask_war_footing');
 for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){await page.setViewportSize(size);await capture(page,`received-chase-${size.width}`,`Read-only presentation replay of completed political run: ${source}`);}
 await book(page,S.ledger);await page.getByRole('button',{name:S.ledgerCongress,exact:true}).first().click();
 await expect(page.getByTestId('congress-sheet')).toContainText('1861-07-07');
 expect(posts).toBe(0);expect(errors).toEqual([]);
 writeFileSync(`${out}/public-replay.json`,JSON.stringify({source,sourceSha256:createHash('sha256').update(readFileSync(source)).digest('hex'),posts,errors,mode:'Public presentation replay only; no State loaded or new game played'},null,2));
});

test('keeps the docket header reachable while scrolling a long political decision list',async({page})=>{
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30000});
 await page.getByRole('button',{name:S.run,exact:true}).click();await page.getByLabel(S.turnDays).selectOption('1');
 await page.getByRole('button',{name:S.sendRun,exact:true}).click();await page.getByRole('button',{name:S.nextMorning,exact:true}).click();
 await page.getByRole('button',{name:S.stopDocket,exact:true}).click();
 for(const size of [{width:1920,height:1080},{width:3440,height:1440}]){
  await page.setViewportSize(size);await page.locator('dialog[open]').evaluate(el=>el.scrollTop=el.scrollHeight);
  await expect(page.locator('dialog[open] > .panel-header')).toBeInViewport();
  await expect(page.locator('dialog[open] > .panel-header button.close')).toBeInViewport();
  await capture(page,`docket-scroll-${size.width}`,'Live headless long docket, scrolled to its final consultation controls.');
 }
});
