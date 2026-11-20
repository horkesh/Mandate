import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';

for(const size of [{width:1920,height:1080},{width:3440,height:1440}]) test(`held marks travel as notes at ${size.width}`,async({page})=>{
  const game=new ConsoleGame({pack:'testbed'}),desk=new DeskAdapter(game);
  for(const line of ['order n_army_west take salient_tip review','end'])expect(desk.execute(line).ok).toBe(true);
  const opening=desk.snapshot();
  expect(opening.morning.menu.menuKind==='principal'&&opening.morning.menu.reviews.length).toBeGreaterThan(0);
  const commands:string[]=[],errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize(size);
  await page.route('**/api/desk',r=>r.fulfill({json:desk.snapshot()}));
  await page.route('**/api/command',r=>{
    const {line,day}=r.request().postDataJSON();commands.push(line);
    return r.fulfill({json:desk.execute(line,day)});
  });
  // Explicit schematic geometry for this interaction test; no geographic asset is created or changed.
  const geometry={version:1,pack:'testbed',schematic:true,regions:['n_west_front','w_valley','salient_base','salient_tip'].map((id,i)=>({id,name:id,kind:'land',point:[-2+i*.1,52],shape:null,label:{anchor:null,spine:[],size:null,minZoom:null}})),base:[]};
  await page.route('**/map-data/**',r=>r.request().url().endsWith('geometry.json')?r.fulfill({json:geometry}):r.fulfill({status:404,body:'{}'}));
  await page.goto('/');
  await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Plans & enemy',exact:true}).click();
  await expect(page.locator('.map-plan-sheet')).toBeVisible();
  const select=page.getByLabel('Region for the pencil mark');
  await expect(select.locator('option[value="salient_base"]')).toHaveCount(1);
  await select.selectOption('salient_base');await page.getByRole('button',{name:'Mark objective',exact:true}).click();
  await expect(page.locator('.pencil-list li')).toHaveCount(1);
  await select.selectOption('w_valley');await page.getByRole('button',{name:'Mark waypoint',exact:true}).click();
  await expect(page.locator('.pencil-list li')).toHaveCount(2);
  await page.getByRole('button',{name:'Send back with notes',exact:true}).click();
  await expect(page.locator('.map-review-message')).toContainText('notes are in the out-tray');
  await expect(page.locator('.pencil-list li')).toHaveCount(0);
  const queued=desk.snapshot().queue;
  expect(queued.map(q=>q.line)).toEqual(['sendback n_army_west focus:main:salient_base via:main:w_valley']);
  expect(commands.filter(c=>c.startsWith('edit '))).toEqual([]);
  const out='../../runs/r56/browser';mkdirSync(out,{recursive:true});
  await page.screenshot({path:`${out}/sent-${size.width}.png`});
  expect(desk.execute('end').ok).toBe(true);
  const command=game.log.find(e=>e.command.cmd==='review')!.command;
  expect(command).toMatchObject({notes:[{markKind:'focus'},{markKind:'via'}]});
  expect(errors).toEqual([]);
  writeFileSync(`${out}/evidence-${size.width}.json`,JSON.stringify({size,commands,queued,command,errors,geometry:'explicit schematic fixture'},null,2));
});
