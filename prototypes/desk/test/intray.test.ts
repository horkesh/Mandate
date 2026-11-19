import {expect, it} from 'vitest';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import * as tray from '../web/intray.ts';
import type {ReportView} from '@mandate/kernel/seat-api';

const snapshot = () => new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
function report(id:string, day:number, extra:Record<string,unknown>={}):ReportView {
  return {id, day, receivedDay:day, author:'writer', authorPost:null, type:'wire-dispatch', subtype:null,
    subjectKind:'region', subjectId:'w_valley', claims:[], hour:null, advice:null, answers:null, route:'wire', via:[], ...extra} as unknown as ReportView;
}
it('filters by visible sender, all named places and read status, without altering papers',()=>{
  const data=snapshot(); Object.assign(data.morning.view,{day:10,reports:[report('a',8,{authorPost:'east'}),report('b',9,{type:'press'}),report('c',10,{authorPost:'war'})]});
  Object.assign(data,{strings:{'post.east.name':'Army of the East','post.war.name':'Secretary of War','region.w_valley.name':'Valley','region.salient_tip.name':'Salient'}});
  Object.assign(data,{paperText:{a:'Report at salient_tip',b:'News from w_valley'}});
  const before=JSON.stringify(data),read=new Set(['a']);
  expect(tray.filterPapers(data, data.morning.view.reports, {sender:'press',place:'w_valley',unread:true},read).map(r=>r.id)).toEqual(['b']);
  expect(tray.filterPapers(data, data.morning.view.reports, {sender:'all',place:'salient_tip',unread:false},read).map(r=>r.id)).toEqual(['a']);
  expect(tray.senderGroup(data.morning.view.reports[2]!,data)).toBe('cabinet');
  expect(tray.filterPapers(data,data.morning.view.reports,{sender:'all',place:'',unread:false},read)).toHaveLength(3);
  expect(JSON.stringify(data)).toBe(before);
});
it('summarizes only received papers, qualitative changes, reported battles, waiting plans and press',()=>{
  const data=snapshot();
  const holding=(holder:string, contested=false)=>[{region:'w_valley',holder,contested}] as any;
  const reports=[report('opening',0,{openingControl:true,reportedControl:holding('north')}),
    report('unchanged',5,{reportedControl:holding('north')}),report('change',8,{reportedControl:holding('south'),claims:[{kind:'control',region:'w_valley',value:977,token:'south',confidence:1000}]}),
    report('battle',9,{claims:[{kind:'battle-result',region:'w_valley',value:1,token:'won',confidence:1000}]}),
    report('press',10,{type:'press',claims:[{kind:'battle-result',region:'w_valley',token:'lost',value:0,confidence:0,battle:'battle.one'}]}),report('waiting',1), report('future',11,{type:'press'}),report('late',8,{type:'press',receivedDay:11}), report('old',2,{type:'press'})];
  Object.assign(data.morning.view,{day:10,reports});
  if(data.morning.menu.menuKind!=='principal')throw Error('principal required');
  Object.assign(data.morning.menu,{reviews:[{post:'east',holder:'writer',report:'waiting',plan:{axes:[]}}]});
  Object.assign(data,{strings:{...data.strings,'region.w_valley.name':'Valley'}});
  const before=JSON.stringify(data),summary=tray.weeklyPapers(data);
  expect(summary.lines.map(l=>l.paper.id).sort()).toEqual(['battle','change','press','waiting']);
  expect(summary.lines.find(l=>l.paper.id==='change')!.text).not.toMatch(/977|‰|share|control 9/);
  expect(summary.lines.find(l=>l.paper.id==='press')!.text).toBe('Defeat reported at Valley');
  expect(summary.coveredPapers).toBe(4);expect(JSON.stringify(data)).toBe(before);
  expect(summary.lines.every(l=>l.source&&l.date)).toBe(true);
  Object.assign(data.morning.menu,{reviews:[]});
  expect(tray.weeklyPapers(data).lines.some(l=>l.paper.id==='waiting')).toBe(false);
});
it('keeps conflicting claims attributed and omits plans whose paper is absent',()=>{
 const data=snapshot();Object.assign(data.morning.view,{day:10,reports:[report('a',8,{reportedControl:[{region:'w_valley',holder:'north',contested:false}]}),report('b',9,{author:'other',reportedControl:[{region:'w_valley',holder:null,contested:true}]})]});
 if(data.morning.menu.menuKind==='principal')Object.assign(data.morning.menu,{reviews:[{report:'not-held',post:'east'}]});
 const lines=tray.weeklyPapers(data).lines;expect(lines).toHaveLength(1);expect(lines[0]!.paper.id).toBe('b');expect(lines[0]!.text).toContain('contested');
});
it('lists each press story from claims and groups phase dispatches by battle identity',()=>{
  const data=snapshot();
  Object.assign(data,{strings:{...data.strings,'region.w_valley.name':'Valley','person.writer.name':'A. Writer',
    'press.headline.won':'Victory reported at {region}', 'press.headline.lost':'Defeat reported at {region}',
    'press.commander':'The paper names {commander} as commander.', 'press.losses.first':'The first returns list {losses} killed, wounded and missing.',
    'press.no_figures':'No casualty figures have arrived.'}});
  const battleClaim=(battle:string,token:string,kind='battle-phase')=>({kind,region:'w_valley',value:1,token,confidence:600,battle,commander:'writer'});
  const reports=[report('dawn',8,{claims:[battleClaim('battle.one','dawn')],hour:6}),
    report('evening',8,{claims:[battleClaim('battle.one','evening')],hour:20}),
    report('other-battle',9,{claims:[battleClaim('battle.two','dawn')],hour:6}),
    report('paper',10,{type:'press',claims:[{...battleClaim('battle.one','won','battle-result'),value:42,confidence:500},
      {...battleClaim('battle.two','lost','battle-result'),value:0,confidence:0}]})];
  Object.assign(data.morning.view,{day:10,reports});
  const summary=tray.weeklyPapers(data);
  expect(summary.lines.filter(l=>l.section==='battles').map(l=>l.paper.id)).toEqual(['evening','other-battle']);
  const stories=summary.lines.filter(l=>l.section==='press');
  expect(stories.map(l=>l.text)).toEqual(['Victory reported at Valley','Defeat reported at Valley']);
  expect(stories.every(l=>l.paper.id==='paper'&&l.source.includes('A. Writer')&&l.date)).toBe(true);
});
