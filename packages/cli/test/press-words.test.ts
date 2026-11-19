import { expect, it } from 'vitest';
import type { ReportView, SeatView } from '@mandate/kernel/seat-api';
import { dispatchLog } from '../src/desk/dispatches.ts';

it('renders a press headline, commander and the figures actually printed from pack strings', () => {
  const report = { id:'m.page', type:'press', subtype:null, author:'editor', authorPost:null,
    subjectKind:'person', subjectId:'editor', claims:[{kind:'battle-result',region:'valley',token:'lost',value:42,confidence:500,battle:'battle.one',commander:'general'}],
    day:7,hour:null,receivedDay:9,route:'mail',via:[],advice:null,answers:null } as unknown as ReportView;
  const strings:Record<string,string>={'press.headline.lost':'Defeat reported at {region}', 'region.valley.name':'Green Valley',
    'person.general.name':'General Reed','press.commander':'The paper names {commander} as commander.',
    'press.losses.first':'The first returns list {losses} killed, wounded and missing.', 'press.no_figures':'No casualty figures have arrived.'};
  const render=(r:ReportView)=>dispatchLog({reports:[r]} as unknown as SeatView,0,k=>strings[k]??k).join('\n');
  expect(render(report)).toContain('Defeat reported at Green Valley');
  expect(render(report)).toContain('The paper names General Reed as commander.');
  expect(render(report)).toContain('The first returns list 42 killed, wounded and missing.');
  const absent={...report,claims:report.claims.map(c=>({...c,value:999,confidence:0}))};
  expect(render(absent)).toContain('No casualty figures have arrived.');
  expect(render(absent)).not.toContain('999');
});
