import { expect, it } from 'vitest';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { pendingRequests } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { report } from './support/s25-fixture.ts';
import { F, indexedFixture, P, POST } from './support/seats-fixture.ts';

function fixture(destination: boolean) {
  const base=indexedFixture();
  const map=indexWorld({...base.map.world,
    people:base.map.world.people.map(p=>p.id!==P('a_spy')?p:{...p,faction:F('b'),
      ...(destination?{service:{government:null,toFaction:F('a'),toBloc:null,historicalOn:'1900-06-02',cites:[{source:'FIXTURE',at:'p1'}]}}:{})}),
    rules:{...base.map.world.rules,ruleSeats:{...base.map.world.rules.ruleSeats,
      principals:base.map.world.rules.ruleSeats.principals.map(r=>r.faction!==F('a')?r:{...r,
        appointments:[{post:POST('a_office'),person:P('a_spy'),onDate:'1900-06-03',source:'FIXTURE p1: service in this office evidenced by this date'}]})}},
  });
  return indexSeatsWorld(map,{...base.start,posts:base.start.posts.map(p=>({...p,
    ...(p.id===POST('a_office')?{holder:null}:{}),
    ...(p.intelligenceChief===P('a_spy')?{intelligenceChief:null}:{})}))});
}

it('accepts a dated office appointment after a declared service change, but offers it only after received eligibility',()=>{
  const world=fixture(true), seat=seatIdFor(P('a_lead'));
  const start={...createState(world,{seed:17}),stateDay:10};
  const offered=(state:typeof start)=>{
    const menu=pendingRequests(world,state).find(r=>r.requestSeat===seat)!.menu;
    if(menu.menuKind!=='principal')throw Error('principal required');
    return menu.historicalAppointments??[];
  };
  expect(offered(start)).toEqual([]);
  const hidden={...start,personService:{...start.personService,[P('a_spy')]:{serviceFaction:F('a'),serviceBloc:null,serviceChoice:'resign' as const,serviceDay:1}}};
  expect(offered(hidden)).toEqual([]);
  const paper=report('s90.service',{reportType:'wire-dispatch',reportSubtype:null,reportAuthor:P('a_spy'),
    reportAuthorPost:null,reportSubjectKind:'person',reportSubjectId:P('a_spy'),reportDay:2,
    reportClaims:[{claimKind:'service-choice',claimRegion:null,claimValue:1,claimToken:'resign',claimConfidence:1000}]},3);
  const received=deliverReport(hidden,seat,paper,NO_TRUTH);
  expect(offered(received)).toContainEqual(expect.objectContaining({post:POST('a_office'),person:P('a_spy')}));
});

it('still rejects a dated appointment of a person with neither opening affiliation nor a declared route to that side',()=>{
  expect(()=>fixture(false)).toThrow('an own-side person');
});
