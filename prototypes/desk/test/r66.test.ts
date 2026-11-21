import {expect, it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {parseLine} from '../../../packages/cli/src/desk/commands.ts';
import type {SeatRequest, ReportView} from '@mandate/kernel/seat-api';
import {buildOrgBoard, audienceRecord, audienceCommand} from '../web/people.ts';
import {OrgBoard, AudienceScene} from '../web/People.tsx';

function fixture(): SeatRequest {
  const request=structuredClone(new ConsoleGame({pack:'testbed'}).morning());
  Object.assign(request.view,{day:10,post:'president',person:'principal',reports:[]});
  Object.assign(request.menu,{commandable:[{post:'army',holder:'believed',relays:['war','department'],routes:[],men:100,raising:false,inTransit:[]}],raising:[],vacancies:[{post:'lost',arm:'land',routes:[],appointing:false}],reviews:[]});
  Object.assign(request.view,{people:[],posts:[
    {post:'army',parent:'department',holder:'believed',status:'held',placementKnown:true},
    {post:'department',parent:'war',holder:null,status:'unknown',placementKnown:true},
    {post:'lost',parent:null,holder:null,status:'vacant',placementKnown:false},
    {post:'president',parent:null,holder:'principal',status:'held',placementKnown:true},
    {post:'war',parent:'president',holder:null,status:'unknown',placementKnown:true},
  ].map(p=>({...p,vacantSince:null,source:null,asOfDay:0,observerReports:[]}))});
  for(const key of ['state','world','log','audienceOutcome'])Object.defineProperty(request,key,{get(){throw Error(`Truth read: ${key}`);}});
  return request;
}
function report(id:string,extra:object={}):ReportView {
  return {id,author:'believed',authorPost:'army',type:'advice',subtype:'memorandum',subjectKind:'post',subjectId:'army',day:8,receivedDay:9,hour:null,route:'courier',via:[],claims:[],answers:null,advice:{recommends:'hold',confidence:700,reasons:[{kind:'lacks_resources',weight:999}]},...extra} as unknown as ReportView;
}
it('nests the supplied catalogue and distinguishes vacancy from an unknown holder',()=>{
  const request=fixture(),model=buildOrgBoard(request);
  expect(model.nodes.map(n=>[n.post,n.parent,n.holder,n.status])).toEqual([
    ['army','department','believed','held'],['department','war',null,'unknown'],['lost',null,null,'vacant'],['president',null,'principal','held'],['war','president',null,'unknown']]);
  expect(model.nodes.find(n=>n.post==='lost')!.placed).toBe(false);
  Object.assign(request.menu,{commandable:[]});
  expect(buildOrgBoard(request).nodes.some(n=>n.holder==='believed')).toBe(true);
});
it('audience case uses only the current believed holder’s received reasons with source papers',()=>{
  const request=fixture();Object.assign(request.view,{reports:[report('received'),report('late',{receivedDay:11}),report('future',{day:11}),report('other',{author:'secret'})]});
  const model=audienceRecord(request,'army');
  expect(model.reasons).toEqual([{kind:'lacks_resources',source:'received',author:'believed',day:8}]);
  expect(model.reports.map(r=>r.id)).toEqual(['received']);
  expect(model).not.toHaveProperty('actual');expect(model).not.toHaveProperty('standing');
  Object.assign(request.menu,{commandable:[{post:'army',holder:'replacement',relays:[],routes:[]}]});
  Object.assign(request.view,{posts:request.view.posts.map(p=>p.post==='army'?{...p,holder:'replacement'}:p)});
  expect(audienceRecord(request,'army').reasons).toEqual([]);
});
it('opening and rendering both views neither writes nor reads decoy truth fields',()=>{
  const request=fixture();Object.assign(request.view,{reports:[report('received')]});
  const before=JSON.stringify({view:request.view,menu:request.menu});
  const common={request,strings:{'person.believed.name':'Known holder','post.army.name':'Known army'},openPost:()=>{},openPaper:()=>{},order:()=>{},openAudience:()=>{}};
  const board=renderToStaticMarkup(createElement(OrgBoard,common));
  const audience=renderToStaticMarkup(createElement(AudienceScene,{...common,post:'army',busy:false,queue:[],execute:async()=>undefined}));
  expect(board).toContain('Known holder');expect(board).toContain('Vacant');
  expect(audience).toContain('Known holder');expect(audience).toContain('lacks resources');
  expect(audience).not.toMatch(/999|secret|<img|<svg|actual|trait/);
  expect(JSON.stringify({view:request.view,menu:request.menu})).toBe(before);
});
it('serializes all eight existing counters and rejects incomplete or injected fields',()=>{
  expect(audienceCommand('army',[])).toBe('audience army');
  expect(audienceCommand('army',[{kind:'frame',value:'union'},{kind:'adjust',boldness:400},{kind:'reinforce',from:'west',men:500},...(['promise_advancement','withdraw_overseer','ease_pressure','vindicate','threaten'] as const).map(kind=>({kind}))])).toBe('audience army frame:union adjust:400 reinforce:west:500 promise_advancement withdraw_overseer ease_pressure vindicate threaten');
  expect(()=>audienceCommand('army',[{kind:'reinforce',from:'west',men:0}])).toThrow();
  expect(()=>audienceCommand('army',[{kind:'frame',value:'union threaten'}])).toThrow();
  expect(()=>audienceCommand('army',[{kind:'adjust',boldness:1001}])).toThrow();
});
it('the audience’s generated answers parse as the console’s typed verb without a new action',()=>{
  const request=fixture();
  for(const draft of [{kind:'frame',value:'union'},{kind:'adjust',boldness:400},{kind:'reinforce',from:'west',men:500},...(['promise_advancement','withdraw_overseer','ease_pressure','vindicate','threaten'] as const).map(kind=>({kind}))] as const){
    const input=parseLine(audienceCommand('army',[draft]),request,key => key);
    expect(input.kind).toBe('command');
    if(input.kind!=='command'||input.command.cmd!=='audience')throw Error('Expected audience');
    expect(input.command.to).toBe('army');expect(input.command.counters).toHaveLength(1);expect(input.command.counters[0]!.kind).toBe(draft.kind);
  }
});
