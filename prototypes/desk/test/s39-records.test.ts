import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {deskDate} from '../web/plan-business.ts';
import * as business from '../web/business.ts';
import * as views from '../web/DeskViews.tsx';
import * as people from '../web/People.tsx';
import {Situation,OrderSheet} from '../web/App.tsx';
import {stopEntries,playbackSnapshot,dayFrames} from '../web/table.ts';
import {presenter} from '../web/presentation.ts';
import {S} from '../web/strings.ts';

const fixture=()=>new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
const render=(component:any,props:any)=>renderToStaticMarkup(createElement(component,props));
function paper(id:string,day:number,claims:any[],extra:any={}){return {id,type:'wire-dispatch',subtype:null,author:'n_bold',authorPost:'n_army_west',subjectKind:'post',subjectId:'n_army_west',day,receivedDay:day,hour:null,route:'wire',via:[],answers:null,advice:null,claims:claims.map(c=>({region:null,value:1,token:null,confidence:1000,...c})),...extra} as any;}

it('anchors received event dates to the completed day, keeping the first actionable morning unchanged',()=>{
 const data=fixture();expect(data.morning.view.day).toBe(0);expect(data.morning.requestDay).toBe(1);
 expect(deskDate(data,0)).toBe(data.date);
 Object.assign(data,{date:'1861-04-02'});Object.assign(data.morning,{requestDay:2});Object.assign(data.morning.view,{day:1});
 expect(deskDate(data,0)).toBe('1861-04-01');expect(deskDate(data,1)).toBe('1861-04-02');expect(deskDate(data,4)).toBe('1861-04-05');
});
it('keeps playback calendar anchors on the displayed completed tick without delivering the marked paper early',()=>{
 const before=fixture(),after=fixture(),r=paper('land',1,[{kind:'position'}]);
 const turn:any={days:[{day:1,date:'1861-04-02',reports:[r],refused:[],points:[]}],stopped:'week'};
 const frames=dayFrames(turn),marked=playbackSnapshot(before,after,frames,0),landed=playbackSnapshot(before,after,frames,1);
 expect(marked.morning.view.day).toBe(1);expect(marked.morning.view.reports.some(p=>p.id===r.id)).toBe(false);
 expect(landed.morning.view.reports.some(p=>p.id===r.id)).toBe(true);expect(deskDate(landed,1)).toBe('1861-04-02');
});
it('preserves a signed decision’s received title and selected labels through dispatch',()=>{
 const desk=new DeskAdapter(new ConsoleGame({pack:'union-1861'}));desk.execute('end 1');
 const data=desk.snapshot(),menu=data.morning.menu;if(menu.menuKind!=='principal')throw Error('principal');
 const choice=menu.situations.find(c=>c.options.length>0)!;
 expect(choice).toBeDefined();const s=data.morning.view.situations.find(s=>s.id===choice.situation)!,option=s.options.find(o=>o.id===choice.options[0]!.optionId)!;
 desk.execute(`decide ${s.id} ${option.id}`);
 const expectedTitle=data.strings[s.title]!,expectedLabel=data.strings[option.label]!;
 expect(desk.snapshot().queue[0]!.text).toContain(expectedTitle);expect(desk.snapshot().queue[0]!.text).toContain(expectedLabel);
 desk.execute('end 1');expect(desk.snapshot().history.at(-1)!.submitted![0]!.text).toContain(expectedLabel);
});
it('does not use undisclosed string-table situations to explain a command',()=>{
 expect((business as any).slipText).toBeTypeOf('function');
 const data=fixture();Object.assign(data,{strings:{...data.strings,'situation.secret_case.title':'Undelivered secret'}});
 expect((business as any).slipText(data.morning,data.strings,'decide secret_case option','own recorded act')).toBe('own recorded act');
});
it('renders received reason vocabulary and singular regiments without changing policy labels',()=>{
 const p=presenter({});expect(p.text('values_offended, has_standing')).toBe('The order offends a value, He has standing to resist');
 expect(S.callRegiments(1)).toBe('1 regiment');
 expect(p.text('call 1 regiments for 90 days')).toBe('call 1 regiment for 90 days');
 expect(p.text('comply_with_reservations; shielded_by_standing; values_honoured')).toBe('comply with reservations; He has standing to resist; The order honours a value');
});
it('makes due calls discoverable at rest without showing future or peace-time requisitions',()=>{
 expect((views as any).CallsBadge).toBeTypeOf('function');
 const data=fixture(),menu=data.morning.menu;if(menu.menuKind!=='principal')throw Error('principal');
 const post=menu.raising[0]!.post;Object.assign(data.morning,{requestDay:4});
 Object.assign(menu,{atWarSince:1,doctrine:{...menu.doctrine,calls:[{id:'due',post,day:4,regiments:1,termDays:90,issued:false},{id:'future',post,day:5,regiments:2,termDays:90,issued:false}]}});
 expect(render((views as any).CallsBadge,{data})).toContain('1 call available');
 Object.assign(menu,{atWarSince:null});expect(render((views as any).CallsBadge,{data})).toBe('');
});
it('names a received situation subject without disclosing an undelivered authored title',()=>{
 expect((business as any).subjectName).toBeTypeOf('function');
 const data=fixture(),strings={...data.strings,'known.title':'A received notice','situation.secret.title':'A hidden notice'};
 Object.assign(data.morning.view,{situations:[{id:'known',title:'known.title'}]});
 expect((business as any).subjectName(data.morning,strings,'known','situation')).toBe('A received notice');
 expect((business as any).subjectName(data.morning,strings,'secret','situation')).not.toBe('A hidden notice');
});
it('explains dispatch on the first morning and leaves after a turn has been observed',()=>{
 expect((views as any).FirstMorningNote).toBeTypeOf('function');
 const data=fixture();
 expect(render((views as any).FirstMorningNote,{data})).toContain('Signed orders wait in the out-tray');
 Object.assign(data,{history:[{days:[],stopped:'week'}]});
 expect(render((views as any).FirstMorningNote,{data})).toBe('');
});
it('takes a player from manual call grammar to the supplied requisitions without inventing terms',()=>{
 const data=fixture(),menu=data.morning.menu;if(menu.menuKind!=='principal')throw Error('principal');
 const html=render(OrderSheet,{menu,line:'call',t:(s:string)=>s,setLine:()=>{},help:[],execute:async()=>{},busy:false,display:(s:string)=>s,commandDisplay:(s:string)=>s,commandInput:(s:string)=>s,onCalls:()=>{}});
 expect(html).toContain('Review calls due');expect(html).toContain('Dated calls include the supplied quantities and terms.');
});
it('links a call refusal to its objection stop and excludes routine holding papers from an arrival stop',()=>{
 const objection=paper('call-refusal',1,[{kind:'call-answer',token:'refuse',value:0}]),holding=paper('holding',1,[{kind:'goal-status',token:'holding'}]),arrived=paper('arrived',1,[{kind:'arrived',region:'salient_tip'}]);
 const turn:any={days:[{day:1,reports:[holding,objection,arrived]}],stopped:['objection','objective-reached','objection']};
 expect(stopEntries(turn)).toEqual([{reason:'objection',papers:[objection]},{reason:'objective-reached',papers:[arrived]}]);
});
it('shows a typed dispatch refusal in supplied player wording on the stop slip',()=>{
 const data=fixture(),turn:any={days:[{day:1,date:'1861-04-02',reports:[],points:[],refused:[{commandIndex:0,reason:'no_attention',command:{}}]}],stopped:'week',submitted:[{line:'inquire n_army_west',text:'Ask the western command for a report'}]};
 const html=render(views.StopSlip,{turn,strings:data.strings,openPaper:()=>{},onDocket:()=>{},onPlans:()=>{},onHistory:()=>{}});
 expect(html).toContain(data.strings['console.refusal.no_attention']);expect(html).toContain('Ask the western command for a report');expect(html).not.toContain('no_attention');
});
it('explains an open decision with no currently offered answer without inventing its availability date',()=>{
 const data=fixture(),menu=data.morning.menu;if(menu.menuKind!=='principal')throw Error('principal');
 const situation:any={id:'waiting',kind:'decision',title:'A decision',text:'Its received body',status:'open',surfacedDay:0,options:[],chosen:[],delegatedTo:null,staffAuthor:null};
 Object.assign(menu,{situations:[{situation:'waiting',options:[],delegableTo:[]}]});
 const html=render(Situation,{situation,menu,t:(s:string)=>s,execute:async()=>{},order:()=>{},busy:false});
 expect(html).toContain('No answer is offered in the current papers.');expect(html).not.toContain('available tomorrow');
});
it('shows appointment context from the received roster, independent of hidden eligibility and seniority',()=>{
 expect((people as any).PersonnelSheet).toBeTypeOf('function');
 const data=fixture();Object.assign(data.morning.view,{posts:[{post:'known_vacancy',parent:null,placementKnown:true,holder:null,status:'vacant',vacantSince:1,source:null,asOfDay:1,observerReports:[]}],people:[{person:'known_person',standing:100,stances:[],assessments:[]}]});
 const strings={'post.known_vacancy.name':'Received command','person.known_person.name':'Officer on file','person.secret_person.name':'Undisclosed officer'};
 const props={request:data.morning,strings,order:()=>{},openPaper:()=>{},dateOf:(d:number)=>`date ${d}`};
 const a=render((people as any).PersonnelSheet,props);
 Object.assign(data.morning.menu,{candidates:[{person:'secret_person',kind:'secret_kind',seniority:999}]});
 expect(render((people as any).PersonnelSheet,props)).toBe(a);
 expect(a).toContain('Officer on file');expect(a).toContain('Received command');expect(a).not.toContain('Undisclosed officer');expect(a).not.toContain('999');
 expect(a).toContain('Eligibility is checked when the appointment is delivered.');
 expect(a).toContain('No proposal to establish a new command is in the received record.');
});
it('collects received operation papers with their actual authors and filters undelivered and future-written rows',()=>{
 expect((business as any).operationRecords).toBeTypeOf('function');
 const data=fixture();Object.assign(data.morning.view,{day:4,reports:[paper('old-holder',2,[{kind:'goal-status',token:'advancing',region:'salient_tip'}]),paper('not-received',2,[{kind:'operation',token:'assaulting'}],{receivedDay:5}),paper('future-written',5,[{kind:'arrived'}],{receivedDay:4})]});
 Object.assign(data,{history:[{submitted:[{line:'order n_army_west take salient_tip review',text:'Own goal'}],days:[],stopped:'week'}]});
 const records=(business as any).operationRecords(data);
 expect(records).toHaveLength(1);expect(records[0].reports.map((r:any)=>r.id)).toEqual(['old-holder']);expect(records[0].reports[0].author).toBe('n_bold');
});
it('presents the supplied plan clock without turning an approval or operation flag into a start date',()=>{
 expect((views as any).OperationsSheet).toBeTypeOf('function');
 const data=fixture();Object.assign(data.morning.view,{day:4,reports:[paper('stage',3,[{kind:'operation',token:'battle',value:1}])]});
 Object.assign(data,{history:[{submitted:[{line:'order n_army_west take salient_tip review',text:'Own goal'}],days:[],stopped:'week'}],approvedPlans:[{post:'n_army_west',holder:'n_bold',source:'plan',day:2,plan:{axes:[{name:'main',arrival:3500,regions:['salient_base','salient_tip']}],method:'supply_line',variant:'depot_steps',requests:[],conditions:[]}}]});
 const html=render((views as any).OperationsSheet,{data,openPaper:()=>{},dateOf:(d:number)=>`date ${d}`});
 expect(html).toContain('4 days from the plan');expect(html).toContain('No operation start date is given in the received record.');expect(html).toContain('data-source-paper="stage"');
 expect(html).not.toContain('1 day remaining');expect(html).not.toContain('Start date: date 2');
});
it('keeps a received declaration separate from an observed arrival and names a missing acknowledgement honestly',()=>{
 expect((views as any).OperationsSheet).toBeTypeOf('function');
 const data=fixture();Object.assign(data.morning.view,{day:4,reports:[paper('declared',2,[{kind:'order-obeyed',token:'approve'}])]});
 Object.assign(data,{history:[{submitted:[{line:'order n_army_west take salient_tip review',text:'Own goal'}],days:[],stopped:'week'}]});
 const html=render((views as any).OperationsSheet,{data,openPaper:()=>{},dateOf:(d:number)=>`date ${d}`});
 expect(html).toContain('Declared answer');expect(html).not.toContain('Arrival reported');
 Object.assign(data.morning.view,{reports:[]});
 expect(render((views as any).OperationsSheet,{data,openPaper:()=>{},dateOf:(d:number)=>`date ${d}`})).toContain('No reply to this command is in the received record.');
});
it('keeps a region-subject battle dispatch under its received author post and shows its hour',()=>{
 const data=fixture(),r=paper('dawn',3,[{kind:'battle-phase',region:'salient_tip',token:'dawn',value:1}],{subjectKind:'region',subjectId:'salient_tip',hour:8});
 Object.assign(data.morning.view,{day:4,reports:[r]});Object.assign(data,{history:[{submitted:[{line:'order n_army_west take salient_tip',text:'Own goal'}],days:[],stopped:'week'}]});
 const html=render((views as any).OperationsSheet,{data,openPaper:()=>{},dateOf:(d:number)=>`date ${d}`});
 expect(html).toContain('data-source-paper="dawn"');expect(html).toContain('08:00');expect(html).toContain('Battle dispatch');
});
