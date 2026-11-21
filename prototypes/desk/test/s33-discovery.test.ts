import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {TurnSheet} from '../web/DeskViews.tsx';
const render=(data:any)=>renderToStaticMarkup(createElement(TurnSheet,{data,busy:false,run:()=>{},openPaper:()=>{},onDocket:()=>{},onPlans:()=>{},onHistory:()=>{}}));
function fixture(){
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
 // S35 separates the request boundary from event days: completed day 3 is
 // June 4, so the due day-4 proposal is dated June 5.
 Object.assign(data.morning,{requestDay:4});Object.assign(data.morning.view,{day:3});data.date='1900-06-04';
 if(data.morning.menu.menuKind!=='principal')throw Error('principal');
 const post=data.morning.menu.commandable[0]!.post;
 Object.assign(data.morning.menu,{atWarSince:1});
 Object.assign(data.morning.menu.doctrine,{offensives:[{post,objective:'salient_tip',day:4}]});
 return {data,post};
}
it('shows the proposed advance date and distinguishes ordering from a scheduled march',()=>{
 const {data}=fixture(),html=render(data);
 expect(html).toContain('Proposed advances');expect(html).toContain('1900-06-05');
 expect(html).toContain('This date proposes a goal; the commander still has to receive it and prepare a plan.');
 expect(html).toContain('Review a goal order');
});
it('does not disclose a future offensive or offer an offensive at peace',()=>{
 const {data}=fixture();Object.assign(data.morning,{requestDay:3});
 expect(render(data)).not.toContain('Proposed advances');
 Object.assign(data.morning,{requestDay:4});Object.assign(data.morning.menu,{atWarSince:null});
 expect(render(data)).not.toContain('Proposed advances');
});
it('keeps dispatched goals visible without offering to start their planning again',()=>{
 const {data,post}=fixture();Object.assign(data,{history:[{days:[],stopped:'week',submitted:[{line:`order ${post} take salient_tip review`,text:'own order'}]}]});
 const html=render(data);expect(html).toContain('Goal dispatched');expect(html).not.toContain('Review a goal order');
});
it('keeps an own queued goal distinct from dispatch and leaves a refused goal available',()=>{
 const {data,post}=fixture(),line=`order ${post} take salient_tip review`;
 Object.assign(data,{queue:[{line,text:'own order'}]});
 expect(render(data)).toContain('Goal in the out-tray');
 Object.assign(data,{queue:[],history:[{submitted:[{line,text:'own order'}],stopped:'week',days:[{refused:[{commandIndex:0,reason:'no_attention'}]}]}]});
 expect(render(data)).toContain('Review a goal order');expect(render(data)).not.toContain('Goal dispatched');
});
it('shows outstanding reviews and separate permission to go on the turn sheet',()=>{
 const {data,post}=fixture(),menu=data.morning.menu;
 Object.assign(menu,{reviews:[{post,holder:'n_bold',report:'submission',plan:{}}],awaiting:[post]});
 const html=render(data);expect(html).toContain('1 plan awaiting review');expect(html).toContain('1 command waiting for your word');
 expect(html).toContain('Open plans');
});
