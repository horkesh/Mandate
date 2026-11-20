import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import type {ReportView} from '@mandate/kernel/seat-api';
const out=fileURLToPath(new URL('../../../runs/r54/browser/',import.meta.url));
mkdirSync(out,{recursive:true});
function fixture(){
  const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
  const report=(id:string,type:string,hour:number|null,claims:unknown[])=>({id,type,day:7,receivedDay:8,hour,
    author:'n_editor',authorPost:null,subtype:null,subjectKind:'person',subjectId:'n_editor',claims,route:'mail',via:[],advice:null,answers:null}) as unknown as ReportView;
  const claims=[{kind:'battle-result',region:'w_valley',token:'lost',value:42,confidence:500,battle:'one',commander:'n_fighter'},
    {kind:'battle-result',region:'salient_tip',token:'won',value:0,confidence:0,battle:'two',commander:'n_fighter'}];
  const phase=(token:string)=>[{kind:'battle-phase',region:'w_valley',token,value:1,confidence:600,battle:'one'}];
  Object.assign(data.morning.view,{day:10,reports:[report('m.dawn','wire-dispatch',6,phase('dawn')),
    report('m.evening','wire-dispatch',20,phase('evening')),report('m.paper','press',null,claims)]});
  return data;
}
for(const width of [1920,3440])test(`R54 weekly stories open their printed paper at ${width}`,async({page})=>{
  const data=fixture(),errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:width===3440?1440:1080});
  await page.route('**/api/desk',r=>r.fulfill({json:data}));
  await page.goto('/test/r54-fixture.html');
  const summary=page.getByTestId('weekly-summary');await expect(summary).toBeVisible();
  await expect(summary.locator('[data-source-paper="m.paper"]')).toHaveCount(2);
  await expect(summary.locator('[data-source-paper="m.evening"]')).toHaveCount(1);
  await expect(summary.locator('[data-source-paper="m.dawn"]')).toHaveCount(0);
  await expect(summary).toContainText('Defeat reported at');await expect(summary).toContainText('Victory reported at');
  await page.screenshot({path:`${out}/weekly-${width}.png`});
  await summary.locator('[data-source-paper="m.paper"]').first().click();
  const paper=page.getByTestId('paper');await expect(paper).toBeVisible();
  await expect(paper).toContainText('42 killed, wounded and missing');
  await expect(paper).toContainText('No casualty figures have arrived.');
  await expect(paper).not.toContainText('about person');await expect(paper).not.toContainText('press.headline');
  await page.screenshot({path:`${out}/paper-${width}.png`});
  await page.getByRole('button',{name:"Return to the week's papers",exact:true}).click();
  await expect(summary).toBeVisible();expect(errors).toEqual([]);
});
