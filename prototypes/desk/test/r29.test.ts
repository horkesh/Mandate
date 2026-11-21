import {expect,it} from 'vitest';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {buildMapModel} from '../web/map/model.ts';
import type {MapGeometry} from '../web/map/model.ts';
import {dayFrames,playbackSnapshot} from '../web/table.ts';
import {presenter} from '../web/presentation.ts';
import {claimWords,controlOpacity,CONTROL_COLOURS,sharedFront,contactMark} from '../web/map/control.ts';
import {dispatchLog} from '../../../packages/cli/src/desk/dispatches.ts';
import {deskStrings} from '../../../packages/cli/src/pack-text.ts';

const geometry:MapGeometry={version:1,pack:'testbed',schematic:true,base:[],regions:[]};
const belief=(report:string,holder='north')=>({shares:{north:holder==='north'?800:100,south:holder==='north'?100:800},holder,contested:false,asOfDay:2,mark:'pencil',sources:[{report,author:'staff',authorPost:'n_war_office',asOfDay:2}]});
it('R29 carries the supplied control and fronts without estimating missing regions',()=>{
 const request=structuredClone(new ConsoleGame({pack:'testbed'}).morning());
 Object.assign(request.view,{controlBeliefs:{w_valley:belief('one')},claimedFronts:[{edge:'edge',own:'w_valley',faces:'salient_tip',faction:'north',enemy:'south',asOfDay:2,mark:'pencil'}]});
 const model=buildMapModel(request,geometry) as any;
 expect(model.control).toEqual(request.view.controlBeliefs);
 expect(model.fronts).toEqual(request.view.claimedFronts);
 expect(model.absent).not.toContain('claimed-control');
 expect(model.absent).not.toContain('fronts');
});
it('R29 uses real faction names in the dated control description',()=>{
 const name=presenter({'faction.north':'Northern government','person.staff.name':'The staff'}).name;
 expect(claimWords('The valley',belief('opening') as any,name,d=>`day ${d}`)).toContain('Northern government holds');
});
it('R29 confirmation and age change the wash, while shared borders remain geometry',()=>{
 const b=belief('opening') as any;
 expect(controlOpacity({...b,mark:'ink'},2)).toBeGreaterThan(controlOpacity(b,2));
 expect(controlOpacity(b,40)).toBeLessThan(controlOpacity(b,2));
 expect(CONTROL_COLOURS.correction).not.toBe(CONTROL_COLOURS.enemy);
 const a=[[[[0,0],[1,0],[1,1],[0,1],[0,0]]]],c=[[[[1,0],[2,0],[2,1],[1,1],[1,0]]]];
 expect(sharedFront(a as any,c as any)).toEqual([[[1,0],[1,1]]]);
 expect(contactMark(a as any,[.5,.5],[2,.5]).map(p=>p[0])).toEqual([1,1]);
});
it('R29 gives a contradicting observer report a violet correction cue while retaining both sources',()=>{
 const request=structuredClone(new ConsoleGame({pack:'testbed'}).morning());
 const report={id:'first',author:'a',authorPost:null,day:1,receivedDay:1,type:'enemy-estimate',subtype:null,subjectKind:'region',subjectId:'w_valley',claims:[{kind:'enemy-strength',region:'w_valley',value:2000,token:null,confidence:900}],hour:null,advice:null,answers:null,route:'courier',via:[]};
 (request.view as any).reports=[report,{...report,id:'observer',author:'b',day:2,type:'observer-letter',claims:[{...report.claims[0],value:1000}]}];
 const g={...geometry,regions:[{id:'w_valley',name:'Valley',kind:'land',point:[1,1],shape:null,label:{anchor:null,spine:[],size:null,minZoom:null}}]} as MapGeometry;
 const model=buildMapModel(request,g);
 expect(model.marks).toHaveLength(2);expect((model.marks.find(m=>m.source==='observer') as any).corrects).toEqual(['first:0']);
});
it('R29 playback reveals a new control belief and front only once its reports land',()=>{
 const desk=new DeskAdapter(new ConsoleGame({pack:'testbed'})),before=desk.snapshot(),after=structuredClone(before);
 const paper={...before.morning.view.reports[0]!,id:'new-control',day:2,receivedDay:2,claims:[]};
 Object.assign(before.morning.view,{controlBeliefs:{w_valley:belief('opening')},claimedFronts:[]});
 Object.assign(after.morning.view,{reports:[...before.morning.view.reports,paper],controlBeliefs:{w_valley:belief('new-control','south'),salient_tip:belief('opening')},claimedFronts:[{edge:'edge',own:'salient_tip',faces:'w_valley',faction:'north',enemy:'south',asOfDay:2,mark:'pencil'}]});
 // The opening report was already received, including any source retained on an older belief.
 (before.morning.view as any).reports.push({...paper,id:'opening',day:0});
 const frames=dayFrames({days:[{day:2,date:'1861-03-08',reports:[paper],refused:[],points:[]}],stopped:'week'} as any);
 const during=playbackSnapshot(before,after,frames,0).morning.view as any;
 expect(during.controlBeliefs.w_valley.holder).toBe('north');expect(during.claimedFronts).toEqual([]);
 const landed=playbackSnapshot(before,after,frames,1).morning.view as any;
 expect(landed.controlBeliefs.w_valley.holder).toBe('south');expect(landed.claimedFronts).toHaveLength(1);
});
it('R29 projects an intermediate received claim in the server without changing the console',()=>{
 const game=new ConsoleGame({pack:'testbed'}),before=game.hash(),method=(game as any).controlFromReports;
 expect(typeof method).toBe('function');if(!method)return;
 const request=game.morning(),base=request.view.reports[0];expect(base).toBeDefined();
 const report={...base,id:'reported-change',day:2,receivedDay:2,claims:[{kind:'control',region:'w_valley',token:'north',value:600,confidence:1000},{kind:'control',region:'w_valley',token:'south',value:400,confidence:1000}]};
 const projected=method.call(game,[...request.view.reports,report]);
 expect(projected.controlBeliefs.w_valley.shares).toEqual({north:600,south:400});
 expect(projected.controlBeliefs.w_valley.contested).toBe(true);expect(game.hash()).toBe(before);
});
it('R29 approves only submitted orders, forgets cancellation, and keeps sessions separate',()=>{
 const desk=new DeskAdapter(new ConsoleGame({pack:'testbed'}));desk.execute('order n_army_west take salient_tip review');desk.execute('end');
 desk.execute('approve n_army_west');expect(desk.snapshot().approvedPlans??[]).toEqual([]);
 desk.execute('cancel 1');expect(desk.snapshot().approvedPlans??[]).toEqual([]);
 desk.execute('approve n_army_west');desk.execute('end');expect(desk.snapshot().approvedPlans).toHaveLength(1);
 for(let i=0;i<20;i++)desk.execute('order n_army_west hold');
 const result=desk.execute('end');expect(result.turn!.days.flatMap(d=>d.refused).some(r=>r.reason==='no_attention')).toBe(true);
 expect(desk.snapshot().approvedPlans).toHaveLength(0);
 expect(new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot().approvedPlans??[]).toEqual([]);
});
it('R29 names the faction and government in control dispatches and keeps the opening readable',()=>{
 const game=new ConsoleGame({pack:'testbed'}),view=game.morning().view;
 const t=deskStrings(game.strings,game.locale);
 expect(dispatchLog(view,0,t)[0]).toContain('opening country report');expect(dispatchLog(view,0,t)[0]!.length).toBeLessThan(400);
 const source=view.reports[0]!;const paper={...source,openingControl:undefined,reportedControl:[{region:'w_valley',holder:'north',contested:false}],day:1,claims:[{kind:'control',token:'north',region:'w_valley',value:650,confidence:1000},{kind:'control-government',token:'border',region:'w_valley',value:1,confidence:1000}]} as any;
 const text=dispatchLog({reports:[paper]},0,t)[0]!;expect(text).not.toMatch(/650|‰/);expect(text).toContain('neutral government border');
});

it('R32 hides share figures in hover text while naming holder and contested ground',()=>{
 const name=presenter({'faction.north':'Northern government','person.staff.name':'The staff'}).name;
 const b={...belief('opening'),contested:true} as any;
 const text=claimWords('The valley',b,name,d=>`day ${d}`);
 expect(text).toContain('Northern government holds');
 expect(text).toContain('Contested ground');
 expect(text).not.toMatch(/800|100|‰|permille/);
});

it('R32 preserves opening ink in server playback reconstruction',()=>{
 const game=new ConsoleGame({pack:'testbed'}),view=game.morning().view;
 expect(Object.values(view.controlBeliefs).every(b=>b.mark==='ink')).toBe(true);
 expect(game.controlFromReports(view.reports)).toEqual({controlBeliefs:view.controlBeliefs,claimedFronts:view.claimedFronts});
});
