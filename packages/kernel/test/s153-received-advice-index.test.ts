import { expect, it } from 'vitest';
import { peopleProjection } from '../src/view/people.ts';
import { viewFor } from '../src/view/view.ts';
import type { ReportView } from '../src/view/types.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { fresh, report } from './support/s25-fixture.ts';
import { F, P, R } from './support/seats-fixture.ts';
import { toId } from '../src/ids.ts';

function fixture() {
 const g=fresh();
 const received=deliverReport({...g.state,stateDay:2},g.seat,report('consult',{
  reportType:'advice',reportSubtype:'requested',reportAuthor:P('a_gen'),
  reportClaims:[{claimKind:'verb-answered',claimRegion:R('a_front'),claimToken:'consult:fixture',claimValue:1,claimConfidence:1000}],
  reportAdvice:{adviceRecommends:'wait',adviceConfidence:700,adviceReasons:[]},
 }),NO_TRUTH);
 return {...g,advice:viewFor(g.world,received,g.seat).reports.find(r=>r.id===toId('message','consult'))!};
}

it('S153 round2: each received advice witness is read independently of the roster size',()=>{
 const {world,advice}=fixture();let reads=0;
 const watched:ReportView={...advice,get author(){reads++;return advice.author;}};
 const project=(reports:readonly ReportView[])=>peopleProjection(world,P('a_lead'),F('a'),reports,()=>null,2,'1900-06-01');
 const first=project([watched]), baseline=reads;reads=0;
 const extra:ReportView={...advice,id:toId('message','foreign-return'),author:P('b_gen'),type:'wire-dispatch',advice:null,claims:[]};
 const second=project([watched,extra]);
 expect(second.people).toHaveLength(first.people.length+1);
 expect(reads).toBe(baseline);
 expect(second.people.find(p=>p.person===P('a_gen'))!.stances).toEqual(first.people.find(p=>p.person===P('a_gen'))!.stances);
});

it('S153 round2: advice indexes keep chronological ties, future receipts and self-assessment exclusions',()=>{
 const {world,advice}=fixture();
 const a={...advice,id:toId('message','a')}, z={...advice,id:toId('message','z')};
 const assessment={...advice,id:toId('message','assessment'),author:P('a_sec'),subjectKind:'person' as const,subjectId:P('a_gen'),subtype:'memorandum',claims:[]};
 const self={...assessment,id:toId('message','self'),author:P('a_gen')};
 const future={...a,id:toId('message','future'),receivedDay:3};
 const unstamped={...a,id:toId('message','unstamped'),claims:[]};
 const p=peopleProjection(world,P('a_lead'),F('a'),[z,assessment,self,future,a,unstamped],()=>null,2,'1900-06-01').people.find(p=>p.person===P('a_gen'))!;
 expect(p.stances.map(s=>s.source)).toEqual([a.id,z.id]);
 expect(p.assessments).toEqual([assessment.id]);
 const later=peopleProjection(world,P('a_lead'),F('a'),[future],()=>null,3,'1900-06-01').people.find(p=>p.person===P('a_gen'))!;
 expect(later.stances.map(s=>s.source)).toEqual([future.id]);
});
