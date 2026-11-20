import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {AttentionSheet,AccountabilityLedger,TurnSheet} from '../web/DeskViews.tsx';
import {OrgBoard} from '../web/People.tsx';

it('renders own spending and a dated refill instead of the old missing projection',()=>{
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
 Object.assign(data,{strings:{...data.strings,recorded_act:'Recorded act'}});
 const html=renderToStaticMarkup(createElement(AttentionSheet,{data,dateOf:(n:number)=>`date ${n}`}));
 expect(html).toContain('Spent this week: 0');expect(html).toContain(`Next refill: date ${data.morning.view.attentionBudget!.nextRefillDay}`);
 expect(html).not.toContain('next refill date are not available');
});
it('renders public sessions and only the seat-projected Congress entries with source controls',()=>{
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
 Object.assign(data.morning.view,{congress:{chambers:[{id:'house',name:'house',status:'sitting',session:'regular',opens:1,closes:9}],sessions:[{id:'regular',chambers:['house'],callable:false,opens:'1900-06-02',closes:'1900-06-10',afterCallDays:null,sitsDays:null}],ledger:[{act:'recorded_act',day:2,situation:'act',option:'take',metDay:2,answeredDay:null,source:'paper-act'}]},reports:[{id:'paper-act',author:'clerk'}]});
 const html=renderToStaticMarkup(createElement(AccountabilityLedger,{data,openPaper:()=>{},dateOf:(n:number)=>`date ${n}`,tab:'congress',setTab:()=>{}}));
 expect(html).toContain('Accountable act');expect(html).toContain('1900-06-02');expect(html).toContain('data-source-paper="paper-act"');
 expect(html).toContain('No answer recorded');expect(html).not.toContain('Congressional accountability record is not available');
});
it('renders the driver’s actual enabled and disabled stop choices',()=>{
 const game=new ConsoleGame({pack:'testbed'});game.setTurnStops(['objection']);
 const data=new DeskAdapter(game).snapshot();
 const html=renderToStaticMarkup(createElement(TurnSheet,{data,busy:false,run:()=>{},openPaper:()=>{},onDocket:()=>{},onPlans:()=>{},onHistory:()=>{},setStops:async()=>{}}));
 expect(html).toContain('type="checkbox"');expect(html).toContain('Stop on: An objection reached the desk.');
 expect(html).not.toContain('Individual stop settings are not available');
});
it('shows granted audiences separately from answers without assuming that a visitor replied',()=>{
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
 Object.assign(data.morning.view,{audiences:[{id:'invitation',status:'granted',person:'n_organiser',post:'n_army_east',day:1,source:null,answers:null,counters:[],declared:null}]});
 const html=renderToStaticMarkup(createElement(OrgBoard,{request:data.morning,strings:data.strings,openPost:()=>{}}));
 expect(html).toContain('Audience requested by you');expect(html).toContain('No reply has been received');
 expect(html).not.toContain('Audience held');
});
it('updates only driver settings, and rejects stale, closed or invalid setting changes',()=>{
 const game=new ConsoleGame({pack:'testbed'}),desk=new DeskAdapter(game),hash=game.hash();
 expect(desk.setStops(['objection'],1).ok).toBe(true);
 expect(desk.snapshot().morning.turnStops?.points.filter(p=>p.enabled).map(p=>p.point)).toEqual(['objection']);
 expect(desk.setStops(['plan-review'],0).ok).toBe(false);
 expect(desk.setStops(['invented'],1).ok).toBe(false);
 expect(game.hash()).toBe(hash);expect(game.log).toEqual([]);expect(desk.snapshot().queue).toEqual([]);
 desk.execute('quit');expect(desk.setStops([],1).ok).toBe(false);
});
it('does not open a replacement holder as the person named in an earlier audience',()=>{
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
 Object.assign(data.morning.view,{audiences:[{id:'old-invitation',status:'granted',person:'former-holder',post:'n_army_east',day:1,source:null,answers:null,counters:[],declared:null}]});
 const html=renderToStaticMarkup(createElement(OrgBoard,{request:data.morning,strings:data.strings,openPost:()=>{}}));
 expect(html).not.toContain('Open person’s page');
});
it('renders a supplied public composition with its group names, counts and citation',()=>{
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
 Object.assign(data,{strings:{...data.strings,'chamber.fixture':'Assembly','party.fixture':'Civic League'}});
 Object.assign(data.morning.view,{congress:{chambers:[{id:'assembly',name:'chamber.fixture',status:'sitting',session:null,opens:null,closes:null,composition:{on:'1900-06-01',groups:[{name:'party.fixture',seats:7}],cite:'Fictional register, p. 1'}}],sessions:[],ledger:[]}});
 const html=renderToStaticMarkup(createElement(AccountabilityLedger,{data,openPaper:()=>{},dateOf:(n:number)=>`day ${n}`,tab:'congress',setTab:()=>{}}));
 expect(html).toContain('Assembly');expect(html).toContain('Civic League');expect(html).toContain('<dd>7</dd>');expect(html).toContain('Fictional register, p. 1');
 expect(html).not.toContain('No published membership figures');
});
