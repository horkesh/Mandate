import { test, expect } from '@playwright/test';
import { writtenDate } from '../web/dates.ts';
import type { Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { buildMapModel, reportDate } from '../web/map/model.ts';
const evidence='../../art-masters/R19';
const mode=process.env.DESK_AT_WAR==='1'?'war':'peace';
const snake=/\b[a-z0-9]+(?:_[a-z0-9]+)+\b/g;
async function clean(page:Page,label:string){
  const text=await page.locator('body').innerText();
  const accessible=await page.locator('body').ariaSnapshot();
  const names=await page.locator('[aria-label]:visible,[title]:visible').evaluateAll(nodes=>nodes.flatMap(n=>[n.getAttribute('aria-label')??'',n.getAttribute('title')??'']));
  expect([...text.matchAll(snake),...names.join('\n').matchAll(snake),...accessible.matchAll(snake)].map(m=>m[0]),label).toEqual([]);
}
async function open(page:Page,name:string){await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name,exact:true}).click();}
async function close(page:Page){await page.getByRole('dialog').getByRole('button',{name:'Put down',exact:true}).click();}
test('opening names and a map without a plan',async({page})=>{
  await page.goto('/');await expect(page.getByTestId('desk')).toBeVisible();
  await open(page,'Org board');await clean(page,'board');await close(page);
  await open(page,'Staff map');await expect(page.getByTestId('map-canvas-host').last()).toHaveAttribute('data-ready','ready');
  await expect(page.locator('dialog .map-plan-sheet')).toHaveCount(0);
  for(const size of [{width:1920,height:1080},{width:3440,height:1440}]){
    await page.setViewportSize(size);await expect(page.getByTestId('map-canvas-host').last()).toHaveAttribute('data-ready','ready');
    const map=await page.locator('dialog .staff-map').boundingBox(),sheet=await page.locator('dialog .plan-map-layout').boundingBox();
    expect(Math.abs(map!.width-sheet!.width)).toBeLessThan(2);
  }
});
test('Union names before and after a week, with report placement and attribution',async({page,request})=>{
  test.skip(process.env.DESK_SMOKE==='1','opening gate only');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  let snapshot=await(await request.get('/api/desk')).json();
  expect(snapshot.morning.menu.atWarSince!==null).toBe(mode==='war');
  const stages=[];
  for(const stage of ['before','after']){
    await page.goto('/');await expect(page.getByTestId('desk')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
    await clean(page,`${stage}:desk`);
    for(const name of ['Org board','In-tray','Plans & enemy','Ledger','Daybook','Write an order','Key card','Find a region or person']){
      await open(page,name);await clean(page,`${stage}:${name}`);
      if(name==='Org board')for(let i=0;i<await page.locator('.person-tile').count();i++){
        await page.locator('.person-tile').nth(i).click();await clean(page,`${stage}:person ${i}`);
        await page.getByRole('dialog').getByRole('button',{name:'Back',exact:true}).click();
      }
      if(name==='In-tray')for(let i=0;i<await page.getByTestId('paper-link').count();i++){
        await page.getByTestId('paper-link').nth(i).click();await clean(page,`${stage}:paper ${i}`);
        await page.getByRole('dialog').getByRole('button',{name:'Back',exact:true}).click();
      }
      await close(page);
    }
    await open(page,'Staff map');const map=page.locator('dialog .staff-map'),host=map.getByTestId('map-canvas-host');
    await expect(host).toHaveAttribute('data-ready','ready');await clean(page,`${stage}:map`);
    await expect(page.locator('dialog .map-plan-sheet')).toHaveCount(0);
    await page.screenshot({path:`${evidence}/map-${mode}-${stage}-1920x1080.png`});
    const geometry=await(await request.get('/map-data/union-1861.json')).json();
    const model=buildMapModel(snapshot.morning,geometry),markDescriptions=[];
    for(const kind of ['headquarters','enemy','works']){
      const marks=map.locator(`.map-mark.${kind}`);
      if(stage==='after'&&mode==='war'&&kind!=='works')expect(model.marks.filter(m=>m.kind===kind).length,kind).toBeGreaterThan(0);
      for(let i=0;i<await marks.count();i++){
        const mark=marks.nth(i),description=await mark.getAttribute('aria-label');expect(description).toMatch(/\d{4}-\d{2}-\d{2}/);
        await mark.hover({timeout:5000});await expect(map.locator('.map-note')).toHaveText(description!);
        await mark.focus();await expect(map.locator('.map-note')).toHaveText(description!);markDescriptions.push(description);
      }
    }
    await map.getByRole('button',{name:/Read the map as text/}).click();
    const twin=map.getByTestId('map-text-twin');await expect(twin).toBeVisible();await clean(page,`${stage}:text record`);
    for(const description of markDescriptions)await expect(twin).toContainText(description!);
    for(const mark of model.marks){
      const author=snapshot.strings[`person.${mark.author}.name`]??snapshot.strings[mark.author]??'Not supplied';
      await expect(twin).toContainText(author);await expect(twin).toContainText(writtenDate(reportDate(snapshot.morning.requestDay,snapshot.date,mark.day)));
    }
    await page.screenshot({path:`${evidence}/text-${mode}-${stage}-1920x1080.png`});
    const missing=await page.evaluate(async()=>{const path='/web/presentation.ts';return (await import(path)).missingNameKeys();});
    stages.push({stage,requestDay:snapshot.morning.requestDay,reports:snapshot.morning.view.reports,model,markDescriptions,missing});
    await close(page);
    if(stage==='before'){
      await open(page,'Let the days run');await page.getByRole('button',{name:'Send orders & run days',exact:true}).click();
      await expect(page.getByTestId('turn-playback')).toBeVisible();await page.getByRole('button',{name:'To the next morning',exact:true}).click();
      snapshot=await(await request.get('/api/desk')).json();expect(snapshot.history.at(-1).days).toHaveLength(7);expect(snapshot.morning.requestDay).toBe(stages[0]!.requestDay+7);
      writeFileSync(`${evidence}/week-${mode}-snapshot.json`,JSON.stringify(snapshot,null,2));
    }
  }
  expect(errors).toEqual([]);writeFileSync(`${evidence}/week-${mode}-browser.json`,JSON.stringify({mode,stages,errors},null,2));
});


// Reuse the retained real week to verify a correction without another simulation run.
test('retained week signs are reachable by hover and keyboard',async({page})=>{
  test.skip(process.env.DESK_RETAINED_WEEK!=='1','targeted retained evidence');
  const {readFileSync}=await import('node:fs');
  let snapshot=JSON.parse(readFileSync(`${evidence}/initial-war.json`,'utf8'));
  await page.route('**/api/desk',route=>route.fulfill({json:snapshot}));
  await page.goto('/');await open(page,'Staff map');const map=page.locator('dialog .staff-map');
  await expect(map.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
  await page.screenshot({path:`${evidence}/map-war-before-final-1920x1080.png`});
  snapshot=JSON.parse(readFileSync(`${evidence}/week-war-snapshot.json`,'utf8'));
  await page.reload();await open(page,'Staff map');await expect(map.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
  const marks=map.locator('.map-mark');expect(await marks.count()).toBeGreaterThan(0);
  for(const mark of await marks.all()){
    const description=await mark.getAttribute('aria-label');await mark.hover({timeout:5000});
    await expect(map.locator('.map-note')).toHaveText(description!);await mark.focus();
    await expect(map.locator('.map-note')).toHaveText(description!);
  }
  await clean(page,'retained week map');
  await page.screenshot({path:`${evidence}/map-war-after-final-1920x1080.png`});
  await page.keyboard.press('Control+g');await page.getByRole('textbox',{name:'Find a region or person',exact:true}).fill('Panama');
  await page.locator('.find-results button').first().click();
  const distant=page.locator('dialog .map-mark[data-region="panama"]');
  await expect(distant).toBeVisible();await distant.hover({timeout:5000});await distant.focus();
  await expect(page.locator('dialog .map-note')).toContainText(snapshot.strings['person.montgomery_john_b.name']);
  await clean(page,'Panama report');
  await page.screenshot({path:`${evidence}/map-panama-final-1920x1080.png`});
  const path='/web/presentation.ts';const missing=await page.evaluate(async(path)=>(await import(path)).missingNameKeys(),path);
  writeFileSync(`${evidence}/retained-final-names.json`,JSON.stringify({missing,visibleAfterFind:await marks.count(),panama:true},null,2));
});

test('displayed order names preserve the queued console identifiers',async({page,request})=>{
  test.skip(process.env.DESK_SMOKE==='1','opening gate only');
  const snapshot=await(await request.get('/api/desk')).json();
  const post=snapshot.morning.menu.commandable[0].post;
  await page.goto('/');await open(page,'Org board');await page.locator('.person-tile').first().click();
  await page.getByRole('button',{name:'Ask for a report',exact:true}).click();
  await clean(page,'generated command');
  const command=page.getByRole('textbox',{name:'Console command',exact:true});
  expect(await command.inputValue()).not.toMatch(snake);
  // An ordinary text edit preserves the displayed name token and underlying ID.
  await command.fill((await command.inputValue())+' ');
  await page.getByRole('button',{name:'Sign to out-tray',exact:true}).click();
  const queued=await(await request.get('/api/desk')).json();expect(queued.queue.at(-1).line.trim()).toBe(`inquire ${post}`);
  await page.getByRole('dialog').getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Back',exact:true}).click();await close(page);
  await open(page,'Out-tray');await clean(page,'queued command');await page.getByRole('button',{name:'Recall',exact:true}).click();
  expect((await(await request.get('/api/desk')).json()).queue).toHaveLength(0);
});

test('a supplied plan opens its column with names at both sheet sizes',async({page})=>{
  test.skip(process.env.DESK_SMOKE==='1','opening gate only');
  const {readFileSync}=await import('node:fs');
  const snapshot=JSON.parse(readFileSync(`${evidence}/plan-fixture.json`,'utf8'));
  await page.route('**/api/desk',route=>route.fulfill({json:snapshot}));
  for(const size of [{width:3440,height:1440},{width:1920,height:1080}]){
    await page.setViewportSize(size);await page.goto('/');await open(page,'Plans & enemy');
    await expect(page.locator('dialog .map-plan-sheet')).toBeVisible();
    await expect(page.locator('dialog').getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
    await clean(page,'plan sheet');
    await page.screenshot({path:`${evidence}/plan-names-${size.width}x${size.height}.png`});
    await page.getByRole('button',{name:'Mark an edit',exact:true}).click();await clean(page,'plan edit');
    const path='/web/presentation.ts';const missing=await page.evaluate(async(path)=>(await import(path)).missingNameKeys(),path);
    writeFileSync(`${evidence}/plan-missing-keys.json`,JSON.stringify({missing},null,2));
  }
});

test('a located works claim retains its supplied author and date',async({page})=>{
  const {readFileSync}=await import('node:fs');
  const snapshot=JSON.parse(readFileSync(`${evidence}/week-war-snapshot.json`,'utf8'));
  // This is a presenter fixture, not a report claimed to have arrived in the week.
  const source=snapshot.morning.view.reports.find((r:any)=>r.author==='anderson_robert');
  source.claims.push({kind:'works',region:'charleston',value:2,token:null,confidence:1000});
  await page.route('**/api/desk',route=>route.fulfill({json:snapshot}));
  await page.goto('/');await open(page,'Staff map');const map=page.locator('dialog .staff-map');
  await expect(map.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
  const works=map.locator('.map-mark.works');await expect(works).toHaveCount(1);
  const description=await works.getAttribute('aria-label');
  expect(description).toContain(snapshot.strings['person.anderson_robert.name']);
  expect(description).toContain(writtenDate(reportDate(snapshot.morning.requestDay,snapshot.date,source.day)));
  await works.hover({timeout:5000});await expect(map.locator('.map-note')).toHaveText(description!);
  await works.focus();await expect(map.locator('.map-note')).toHaveText(description!);
  await map.getByRole('button',{name:/Read the map as text/}).click();await expect(map.getByTestId('map-text-twin')).toContainText(description!);
  await clean(page,'works fixture');
  writeFileSync(`${evidence}/works-fixture-result.json`,JSON.stringify({syntheticClaim:true,source:source.id,description},null,2));
});
