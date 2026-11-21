import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {AudienceScene} from '../web/People.tsx';
import * as table from '../web/table.ts';
import {commandPrice,ledgerRows} from '../web/business.ts';
import {sendbackLine} from '../web/map/notes.ts';

it('shows the filed audience answer, with its author and source, without calling it a current case',()=>{
  const request=structuredClone(new ConsoleGame({pack:'testbed'}).morning());
  const menu=request.menu;if(menu.menuKind!=='principal')throw Error('principal');
  const post=menu.commandable[0]!;
  const report={id:'filed-audience',type:'advice',subtype:'requested',author:post.holder,authorPost:post.post,subjectKind:'post',subjectId:post.post,day:0,receivedDay:0,hour:null,route:'in-person',via:[],answers:'own-order',advice:{recommends:'slow_walk',confidence:1000,reasons:[]},claims:[{kind:'verb-answered',region:null,value:1,token:'audience:slow_walk',confidence:1000}]};
  Object.assign(request.view,{reports:[report]});
  const html=renderToStaticMarkup(createElement(AudienceScene,{request,strings:{slow_walk:'I will take the necessary time'},post:post.post,busy:false,queue:[],execute:async()=>{},openPaper:()=>{}}));
  expect(html).toContain('Filed audience answers');
  expect(html).toContain('I will take the necessary time');
  expect(html).toContain('filed-audience');
  expect(html).not.toContain('The current papers contain no account of this audience.');
});

it('keeps the shell’s submitted orders in the turn history after clearing the out-tray',()=>{
  const adapter=new DeskAdapter(new ConsoleGame({pack:'testbed'}));
  adapter.execute('inquire n_army_west');adapter.execute('inquire n_army_east');adapter.execute('cancel 2');
  adapter.execute('end');
  expect(adapter.snapshot().queue).toEqual([]);
  expect(adapter.snapshot().history[0]).toHaveProperty('submitted',[{line:'inquire n_army_west',text:expect.any(String)}]);
});

it('links stop slips only to relevant delivered papers and preserves the supplied stop reason',()=>{
  const report={id:'battle-paper',type:'wire-dispatch',claims:[{kind:'battle-phase'}]};
  const unrelated={id:'routine-return',type:'strength-return',claims:[]};
  const turn={days:[{day:1,date:'day 1',reports:[unrelated,report],refused:[],points:['battle-report']}],stopped:['battle-report']};
  const model=(table as any).stopEntries(turn);
  expect(model).toEqual([{reason:'battle-report',papers:[report]}]);
});

it('prices a special messenger from the console’s by= route spelling',()=>{
 const request=new ConsoleGame({pack:'testbed'}).morning(),menu=request.menu;
 if(menu.menuKind!=='principal')throw Error('principal');
 const base=menu.attention.costs.order!,extra=menu.attention.specialMessenger;
 expect(commandPrice('order n_army_west hold by=special-messenger',menu)).toEqual({min:base+extra,max:base+extra});
 expect(commandPrice('sendback n_army_west',menu)).toEqual({min:menu.attention.costs.review_send_back,max:menu.attention.costs.review_send_back});
});

it('keeps rejected duplicate occurrences apart in the accountability record',()=>{
 const adapter=new DeskAdapter(new ConsoleGame({pack:'testbed'})),snapshot=adapter.snapshot();
 const day={day:1,date:'day 1',reports:[],points:[],refused:[{command:{},commandIndex:1,reason:'no_attention'}]};
 Object.assign(snapshot,{history:[{days:[day],stopped:'week',submitted:[{line:'x',text:'First act'},{line:'x',text:'Second act'}]}]});
 expect(ledgerRows(snapshot).map(r=>r.refusal)).toEqual([null,'no_attention']);
});

it('sends a wait note with the spatial marks through the existing grammar',()=>{
 const plan={axes:[]} as any;
 expect((sendbackLine as any)('n_army_west',[],plan,[{axis:'main',days:3}])).toBe('sendback n_army_west wait:main:3');
 expect(()=>(sendbackLine as any)('n_army_west',[],plan,[{axis:'main',days:-1}])).toThrow();
});

it('the wait control enters the console log as a nonbinding review note',()=>{
 const game=new ConsoleGame({pack:'testbed'}),desk=new DeskAdapter(game);
 desk.execute('order n_army_west take salient_tip review');desk.execute('end');
 const menu=desk.snapshot().morning.menu;if(menu.menuKind!=='principal')throw Error('principal');
 const review=menu.reviews.find(r=>r.post==='n_army_west')!;
 expect(desk.execute(sendbackLine(review.post,[],review.plan,[{axis:'main',days:3}])).ok).toBe(true);
 desk.execute('end');
 expect(game.log.find(e=>e.command.cmd==='review')?.command).toMatchObject({cmd:'review',action:'send_back',notes:[{markKind:'wait',markAxis:'main',markDays:3}]});
});
