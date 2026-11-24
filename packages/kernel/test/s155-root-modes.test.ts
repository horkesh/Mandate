import { expect, it } from 'vitest';
import { allocationPaper } from '../src/command/force-requests.ts';
import { governorRequestAuthority } from '../src/seats/force-requests.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import type { AllocationInstrument } from '../src/world/allocation.ts';
import type { MandatePaper } from '../src/world/mandates.ts';
import type { ForceNeed } from '../src/knowledge/force-need.ts';
import { fixtureMap, fixtureStart, P, POST, R } from './support/seats-fixture.ts';

const principal=P('a_lead'), office=POST('a_office'), army=POST('a_army');
const grant:MandatePaper={id:'fictional-root-grant',fromDate:'1900-06-01',source:'Fictional grant, p.1',
  grant:{mandateKey:'fictional-command',mandateRevision:1,mandateIssuer:principal,mandateIssuerPost:null,
    mandateHolder:P('a_sec'),mandatePost:office,mandateParent:null,mandateActions:['assign'],mandateRecipients:[office],
    mandateRegions:[R('a_cap'),R('a_front')],mandateModes:['rail','river'],mandateCeiling:null,mandateGuard:null,
    mandateExpires:null,mandateReports:[],mandateOnward:false,mandateRevoke:false}};
const paper:AllocationInstrument={id:'fictional-sending',source:'Fictional order, p.2',fromDate:'1900-06-01',kind:'request',
  issuer:principal,issuerPost:null,mandate:null,from:POST('a_reserve'),to:army,destination:R('a_front'),
  letter:{namespace:'fictional',key:'sending',revision:1},scope:{kind:'cohort',arm:'infantry',minTermDays:1},
  words:'Send a regiment',quantity:1};
function fixture(papers:readonly MandatePaper[],sending:AllocationInstrument=paper) {
  const map=fixtureMap(),start=fixtureStart();
  const world=indexSeatsWorld(indexWorld({...map.world,rules:{...map.world.rules,mandates:papers,allocationInstruments:[sending]}}),start);
  const state=createState(world,{seed:17});
  return {world,state};
}

it('a root conveys the union of its declared grants to its request without receiving a self-grant',()=>{
  const second={...grant,id:'fictional-second-grant',grant:{...grant.grant,mandateKey:'second',mandateModes:['sea','rail'] as const}};
  const other={...grant,id:'fictional-other-root',grant:{...grant.grant,mandateIssuer:P('b_lead'),mandateKey:'other',mandateModes:['land'] as const}};
  const revoked={...grant,id:'fictional-revocation',grant:{...grant.grant,mandateRevision:2,mandateModes:['land'] as const,mandateRevoke:true}};
  const {world,state}=fixture([second,other,revoked,grant]);
  const need={needPost:army,needDestination:R('a_front')} as ForceNeed;
  expect(governorRequestAuthority(world,state,principal,office,need,1)?.[1]).toEqual(['rail','river','sea']);
  expect(allocationPaper(world,state,paper.id)?.modes).toEqual(['rail','river','sea']);
  expect(world.map.world.rules.allocationInstruments![0]).toEqual(paper);
});

it.each(['request','assignment'] as const)('a root %s honours the read restriction and does not broaden it',kind=>{
  const restricted={...paper,kind,words:'Send by river only',modes:['river'] as const};
  const {world,state}=fixture([grant],restricted);
  expect(allocationPaper(world,state,paper.id)?.modes).toEqual(['river']);
});

it('a root with no grants has no modes for a request or an order',()=>{
  const {world,state}=fixture([]);
  const need={needPost:army,needDestination:R('a_front')} as ForceNeed;
  expect(governorRequestAuthority(world,state,principal,office,need,1)).toBeUndefined();
  expect(allocationPaper(world,state,paper.id)?.modes).toEqual([]);
});

it('a subordinate paper gains no root modes from grants it issues',()=>{
  const subordinate={...paper,issuer:P('a_sec'),issuerPost:office,mandate:grant.grant.mandateKey};
  const {world,state}=fixture([grant],subordinate);
  expect(allocationPaper(world,state,paper.id)).toEqual(subordinate);
});
