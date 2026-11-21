import {expect,it,vi,afterEach} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {MapReview} from '../web/map/StaffMap.tsx';
afterEach(()=>vi.unstubAllGlobals());
function sheet(){
 vi.stubGlobal('window',{location:{search:''}});
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot(),menu=data.morning.menu;
 if(menu.menuKind!=='principal')throw Error('principal');
 const p=menu.commandable[0]!;
 Object.assign(p,{relays:['n_chief']});
 Object.assign(menu,{reviews:[{post:p.post,holder:p.holder,report:'submission',plan:{method:'supply_line',variant:'depot_steps',axes:[{name:'main',regions:['salient_base','salient_tip'],strength:1000,mode:'land',phases:['march','depot_step'],arrival:2500}],requests:[],conditions:[]}}]});
 return renderToStaticMarkup(createElement(MapReview,{data,busy:false,execute:async()=>undefined}));
}
it('states the supplied plan duration without promising a calendar battle date',()=>{
 const html=sheet();
 expect(html).toContain('Planned arrival: 3 days from the plan’s start.');
});
it('distinguishes approval, awaiting word, dispatch and declared response from execution',()=>{
 const html=sheet();
 expect(html).toContain('Approval sends permission to execute this plan when the order reaches the commander.');
 expect(html).toContain('A goal marked “await” still requires your word to go.');
 expect(html).toContain('Signing leaves the order in the out-tray until you send the turn.');
 expect(html).toContain('The commander may object; a reply is evidence of his answer, not of a march or battle.');
});
it('renders the supplied depot method and phase as plain desk vocabulary',()=>{
 const html=sheet();expect(html).toContain('Advance by successive depots');expect(html).toContain('Establish a depot');
});
it('offers review delivery and explains the consequences of bypassing relays',()=>{
 const html=sheet();
 expect(html).toContain('Review delivery');expect(html).toContain('Delivery route');
 expect(html).toContain('Around the relaying offices');
 expect(html).toContain('Going around an office can cause grievance and conflicting orders.');
});
