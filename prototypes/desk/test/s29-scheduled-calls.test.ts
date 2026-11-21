import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {PrincipalMenu} from '@mandate/kernel/seat-api';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {TurnSheet} from '../web/DeskViews.tsx';

function render(queued=false){
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot(),menu=data.morning.menu as PrincipalMenu;
 Object.assign(menu.doctrine,{calls:[
  {id:'fixture_due',post:'n_brenmark_governor',day:1,regiments:2,men:1200,termDays:null,arm:'cavalry',issued:false},
  {id:'fixture_future',post:'n_brenmark_governor',day:2,regiments:3,termDays:90,issued:false},
  {id:'fixture_sent',post:'n_brenmark_governor',day:1,regiments:4,termDays:90,issued:true},
 ]});
 if(queued)Object.assign(data,{queue:[{line:'call n_brenmark_governor scheduled=fixture_due by=wire',text:'Recorded requisition'}]});
 return renderToStaticMarkup(createElement(TurnSheet,{data,busy:false,run:()=>{},signCall:async()=>{},openPaper:()=>{},onDocket:()=>{},onPlans:()=>{},onHistory:()=>{}}));
}
it('offers an eligible due requisition with its exact men, arm and open-ended term',()=>{
 const html=render();expect(html).toContain('Calls due');expect(html).toContain('1,200 men');expect(html).toContain('Cavalry');expect(html).toContain('For the war');
 expect(html).toContain('data-call-id="fixture_due"');
 expect(html).not.toContain('data-call-id="fixture_future"');expect(html).not.toContain('data-call-id="fixture_sent"');
});
it('does not offer to sign an already queued requisition a second time',()=>{
 const html=render(true);expect(html).toContain('Call in the out-tray');
 expect(html).toMatch(/disabled=""[^>]*>Call in the out-tray/);
});
