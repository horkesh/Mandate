import { expect, it } from 'vitest';
import { assignmentProblems } from '../src/world/assignments.ts';
import { fixtureMap, fixtureStart, P, POST, R } from './support/seats-fixture.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { toId } from '../src/ids.ts';
import type { State } from '../src/root-state.ts';
import type { AllocationInstrument } from '../src/world/allocation.ts';
import { allocationSelection } from '../src/command/allocation.ts';
import { issueAllocation, arriveAllocation, receiveAllocations, fulfilAllocation } from '../src/tick/allocation.ts';
import { ctxFor } from './support/tick-context.ts';
import { tick, TICK_MECHANICS } from '../src/tick/tick.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { enactMandate } from '../src/command/authority.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { availableAllocations, allocationFulfilments } from '../src/seats/allocation.ts';

const B = toId('forceBlock','a_army_1');
const Q = toId('message','call.q');
function fixture(scope: AllocationInstrument['scope'] = {kind:'cohort',calls:['q'],arm:'infantry',minTermDays:365}) {
  const base=fixtureMap(), start=fixtureStart();
  const paper: AllocationInstrument = {id:'send_q',source:'Fictional sending paper p.1',fromDate:'1900-06-01',
    kind:'request',issuer:P('a_sec'),issuerPost:POST('a_office'),mandate:'standing',
    from:POST('a_army'),to:POST('a_reserve'),destination:R('a_mid'),quantity:1,scope,words:'One long-service infantry regiment of call Q',
    letter:{namespace:'allocation',key:'send_q',revision:1}};
  const regiments=['x','y'].map((id,order)=>({id,order,state:'fiction',raisingDepartment:null,designation:id,arm:'infantry',scope:'regiment',side:'a',termDays:[1095],aliases:[],observations:[],path:{}}));
  const world=indexSeatsWorld(indexWorld({...base.world,regimentCatalogue:regiments,rules:{...base.world.rules,allocationInstruments:[paper]}}),start);
  let state=createState(world,{seed:17});
  const original=state.forceBlockStates[B]!.fbLots[0]!;
  const service={enlPost:paper.from,enlRaisedBy:P('a_gen'),enlCall:Q,enlCallId:'q',enlRegiments:1,enlMusterDay:0,enlEndsDay:1095};
  const generated={...original,lotId:'g',lotRegiment:null,lotGenerated:true,lotArm:'infantry',lotMen:600,lotService:service};
  const named={...generated,lotId:'x',lotRegiment:'x',lotGenerated:false,lotMen:400};
  state={...state,forceBlockStates:{...state.forceBlockStates,[B]:{...state.forceBlockStates[B]!,fbLots:[named,generated]}},
    neutralOffers:{[Q]:{offerCall:Q,offerCallId:'q',offerOwner:POST('a_office'),offerGovernor:P('a_sec'),offerIssuer:P('a_lead'),offerReceiver:paper.from,offerRegion:R('a_front'),offerBlocks:[B],offerReceived:[B],offerStatus:'received',offerResponse:{respOrder:Q,respPerson:P('a_sec'),respPost:POST('a_office'),respRole:'addressee',respKind:'call',respDay:0,respActual:'comply',respDeclared:'comply',respWillingness:1000,respTerms:[],respReasons:[],respStated:[],respConditions:[]},offerReceiptDays:{[B]:0}}}};
  const grant={mandateKey:'standing',mandateRevision:1,mandateIssuer:P('a_lead'),mandateIssuerPost:null,mandateHolder:paper.issuer,mandatePost:paper.issuerPost!,mandateParent:null,
    mandateActions:['assign'] as const,mandateRecipients:[POST('a_office')],mandateRegions:[R('a_front'),R('a_mid'),R('a_cap')],mandateModes:['land','rail'] as const,
    mandateCeiling:{ceilingPost:POST('a_office'),ceilingMen:null},mandateGuard:null,mandateExpires:null,mandateReports:[],mandateOnward:true,mandateRevoke:false};
  state=enactMandate(world.map,state,grant,toId('message','grant'),0,'fixture',['assign','onward']);
  return {world,state,paper,grant};
}
function receive(g: ReturnType<typeof fixture>, state=g.state, paper=g.paper) {
  const ctx=ctxFor(g.world,state,1,TICK_MECHANICS);
  expect(issueAllocation(ctx,state,seatIdFor(paper.issuer),{cmd:'allocation',paper:paper.id,route:'courier'})).toBeNull();
  const msg={...ctx.outbox[0]!,msgTo:state.postStates[paper.from]!.postHolder!};
  return {state:arriveAllocation(ctxFor(g.world,state,msg.msgArriveDay,TICK_MECHANICS),state,msg),msg};
}

it('A01: named identity cannot be replaced by a generated lot',()=>{
  const g=fixture({kind:'named',regiments:['x']});
  expect(allocationSelection(g.world,g.state,g.paper,1).lots).toEqual(['x']);
  expect(allocationSelection(g.world,g.state,{...g.paper,scope:{kind:'named',regiments:['y']}},1)).toMatchObject({lots:[],shortfall:1,reasons:['named_absent']});
});
it('A02/A03: a received cohort can select generated lineage, never another call or short service',()=>{
  const g=fixture();
  expect(allocationSelection(g.world,g.state,g.paper,1).lots).toEqual(['g']);
  for(const scope of [{...g.paper.scope,kind:'cohort' as const,calls:['r'],arm:'infantry',minTermDays:365},{kind:'cohort' as const,calls:['q'],arm:'infantry',minTermDays:2000}])
    expect(allocationSelection(g.world,g.state,{...g.paper,scope},1)).toMatchObject({lots:[],shortfall:1});
  expect(g.state.forceJoins).toEqual({});
  const sent=ctxFor(g.world,g.state,1,TICK_MECHANICS);
  issueAllocation(sent,g.state,seatIdFor(g.paper.issuer),{cmd:'allocation',paper:g.paper.id,route:'courier'});
  expect(g.state.forceAssignments[B]).toBe(g.paper.from);
  expect(g.state.allocationRecords).toBeUndefined();
});
it('a read long-service cohort need not invent a call identity or an arm the words do not name',()=>{
  const g=fixture();
  const paper={...g.paper,scope:{kind:'cohort' as const,minTermDays:91}};
  expect(allocationSelection(g.world,g.state,paper,1).lots).toEqual(['g']);
  expect(assignmentProblems({...g.world.map.world,rules:{...g.world.map.world.rules,allocationInstruments:[paper]}},g.world.start)).toEqual([]);
});
it('A04: issue and rank cannot replace a received authority',()=>{
  const g=fixture(), state={...g.state,authorityByPost:{}};
  const ctx=ctxFor(g.world,state,1,TICK_MECHANICS);
  expect(issueAllocation(ctx,state,seatIdFor(g.paper.issuer),{cmd:'allocation',paper:g.paper.id,route:'courier'})).toBe('bad_selection');
  const sent=receive(g);
  const refused=arriveAllocation(ctxFor(g.world,state,sent.msg.msgArriveDay,TICK_MECHANICS),state,sent.msg);
  expect(refused.allocationRecords?.[sent.msg.msgOrigin]).toMatchObject({allocReasons:['authority_unavailable'],allocLots:[]});
});
it('A06: receipt reserves the selected lot against a competing request; splitting conserves all lot values',()=>{
  const g=fixture(), r=receive(g);
  expect(r.state.allocationRecords?.[r.msg.msgOrigin]?.allocLots).toEqual(['g']);
  expect(allocationSelection(g.world,r.state,{...g.paper,id:'another'},2)).toMatchObject({lots:['x'],reasons:['reserved']});
  expect(Object.values(r.state.forceBlockStates).flatMap(b=>b.fbLots).filter(l=>['x','g'].includes(l.lotId)).sort((a,b)=>a.lotId<b.lotId?-1:1))
    .toEqual([...g.state.forceBlockStates[B]!.fbLots].sort((a,b)=>a.lotId<b.lotId?-1:1));
});
it('A07/A08: no generated selection before offered receipt or after recall',()=>{
  const g=fixture();
  for(const status of ['offered','recalled'] as const) {
    const state={...g.state,neutralOffers:{[Q]:{...g.state.neutralOffers![Q]!,offerStatus:status,offerReceived:[]}}};
    expect(allocationSelection(g.world,state,g.paper,1)).toMatchObject({lots:['x']});
    const onlyGenerated={...state,forceBlockStates:{...state.forceBlockStates,[B]:{...state.forceBlockStates[B]!,fbLots:state.forceBlockStates[B]!.fbLots.filter(l=>l.lotGenerated)}}};
    expect(allocationSelection(g.world,onlyGenerated,g.paper,1)).toMatchObject({lots:[],reasons:['offer_unreceived']});
  }
});
it('receives at the actual destination only, retaining identity, quantities and save/resume',()=>{
  const g=fixture(), r=receive(g);
  const record=r.state.allocationRecords![r.msg.msgOrigin]!, block=record.allocBlocks[0]!;
  expect(block).not.toBe(B);
  expect(r.state.forceAssignments[block]).toBe(g.paper.from);
  const ctx=ctxFor(g.world,r.state,3,TICK_MECHANICS);
  expect(receiveAllocations(ctx,r.state).forceAssignments[block]).toBe(g.paper.from);
  const arrived={...r.state,forceLocations:{...r.state.forceLocations,[block]:{...r.state.forceLocations[block]!,locRegion:R('a_mid')}}};
  const done=receiveAllocations(ctx,arrived);
  expect(done.forceAssignments[block]).toBe(g.paper.to);
  expect(done.forceBlockStates[block]!.fbLots[0]!.lotId).toBe('g');
  const saved=encodeSave({worldHash:canonicalHash('fixture'),state:done});
  expect(decodeSave(saved).state).toEqual(done);
});
it('logs a causal allocation command through ordinary frozen ticks and real roads',()=>{
  const g=fixture();
  let state=tick(g.world,g.state,[{day:1,seat:seatIdFor(g.paper.issuer),command:{cmd:'allocation',paper:g.paper.id,route:'courier'}}],{freeze:true,deepChecks:true}).state;
  for(let n=0;n<20 && !Object.values(state.allocationRecords??{}).some(r=>r.allocReceived.length>0);n++) state=tick(g.world,state,[],{freeze:true,deepChecks:true}).state;
  expect(Object.values(state.allocationRecords??{})).toContainEqual(expect.objectContaining({allocReceived:expect.any(Array),allocStatus:'received'}));
});
it('A05: selection uses strength and stable lot ties independently of display names and state origin',()=>{
  const g=fixture(), block=g.state.forceBlockStates[B]!;
  const state:State={...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...block,fbName:'renamed',fbLots:block.fbLots.map(l=>({...l,lotMen:600}))}}};
  expect(allocationSelection(g.world,state,g.paper,1).lots).toEqual(['g']);
  expect(allocationSelection(g.world,{...state,forceBlockStates:{...state.forceBlockStates,[B]:{...state.forceBlockStates[B]!,fbLots:[...state.forceBlockStates[B]!.fbLots].reverse()}}},g.paper,1).lots).toEqual(['g']);
  const rename=<T,>(v:T):T=>JSON.parse(JSON.stringify(v).replaceAll('a_','c_').replaceAll('"g"','"h"').replaceAll('"x"','"z"').replaceAll('"y"','"u"').replaceAll('"q"','"r"').replaceAll('call.q','call.r').replaceAll('send_q','send_r')) as T;
  const world=indexSeatsWorld(indexWorld(rename(g.world.map.world)),rename(g.world.start));
  const changed=allocationSelection(world,rename(state),rename(g.paper),1);
  expect(changed.lots).toEqual(['h']);
  expect(changed.shortfall).toBe(allocationSelection(g.world,state,g.paper,1).shortfall);
});
it('A09: an unreceived revision changes nothing; only an accepted same-family receipt releases the earlier reservation',()=>{
  const g=fixture(), old=receive(g);
  const newer={...g.paper,id:'revised',to:POST('a_army'),destination:R('a_front'),letter:{...g.paper.letter,revision:2}};
  const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,allocationInstruments:[g.paper,newer]}}),g.world.start);
  const unreceived={...g,world,paper:newer};
  expect(old.state.forceJoins).not.toEqual({});
  const received=receive(unreceived,old.state,newer);
  expect(received.state.allocationRecords![old.msg.msgOrigin]!.allocStatus).toBe('superseded');
  expect(received.state.allocationRecords![received.msg.msgOrigin]!.allocLots).toEqual(['g']);
  const late={...old.msg,msgOrigin:toId('message','late.copy')};
  const obsolete=arriveAllocation(ctxFor(world,received.state,3,TICK_MECHANICS),received.state,late);
  expect(obsolete.allocationRecords![late.msgOrigin]!.allocReasons).toEqual(['superseded']);
});
it('an unmet received request can be fulfilled later by its sender without reissuing or cloning',()=>{
  const g=fixture({kind:'named',regiments:['x']});
  const absent:State={...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...g.state.forceBlockStates[B]!,fbLots:g.state.forceBlockStates[B]!.fbLots.filter(l=>l.lotGenerated)}}};
  const r=receive(g,absent);
  expect(r.state.allocationRecords![r.msg.msgOrigin]!.allocShortfall).toBe(1);
  expect(allocationFulfilments(g.world,r.state,P('a_gen'),3)).toEqual([]);
  const available:State={...r.state,forceBlockStates:g.state.forceBlockStates};
  expect(allocationFulfilments(g.world,available,P('a_gen'),3)).toHaveLength(1);
  expect(allocationFulfilments(g.world,available,P('a_bold'),3)).toHaveLength(0);
  const fulfilled=fulfilAllocation(ctxFor(g.world,available,3,TICK_MECHANICS),available,r.msg.msgOrigin);
  expect(fulfilled.allocationRecords![r.msg.msgOrigin]).toMatchObject({allocLots:['x'],allocShortfall:0});
  expect(fulfilAllocation(ctxFor(g.world,fulfilled,4,TICK_MECHANICS),fulfilled,r.msg.msgOrigin)).toBe(fulfilled);
});
it('principal dispatch readiness cannot learn hidden source holders, sides or enemy strength',()=>{
  const g=fixture(),p={...g.paper,issuer:P('a_lead'),issuerPost:null,mandate:null};
  const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,allocationInstruments:[p]}}),g.world.start);
  const hidden:State={...g.state,postStates:{...g.state.postStates,[p.from]:{...g.state.postStates[p.from]!,postHolder:null}},departmentFactions:{...g.state.departmentFactions,[toId('department','a_war')]:null}};
  expect(availableAllocations(world,hidden,p.issuer,1)).toEqual(availableAllocations(world,g.state,p.issuer,1));
});
it('an allocation prerequisite is a retained correlated report witness at its own issuer',()=>{
  const g=fixture();
  const second:AllocationInstrument={...g.paper,id:'remainder',quantity:'all',letter:{...g.paper.letter,key:'remainder'},requiresPapers:[{
    kind:'report',author:P('a_gen'),authorPost:g.paper.from,subjectKind:'post',subjectId:g.paper.from,reportType:'wire-dispatch',reportSubtype:null,
    answers:g.paper.letter,claims:[{kind:'allocation-shortfall',region:null,token:g.paper.id,min:0,max:0}],
  }]};
  const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,allocationInstruments:[g.paper,second]}}),g.world.start);
  expect(availableAllocations(world,g.state,g.paper.issuer,1).some(p=>p.id===second.id)).toBe(false);
  let state=tick(world,g.state,[{day:1,seat:seatIdFor(g.paper.issuer),command:{cmd:'allocation',paper:g.paper.id,route:'courier'}}],{freeze:true,deepChecks:true}).state;
  for(let n=0;n<10;n++)state=tick(world,state,[],{freeze:true,deepChecks:true}).state;
  expect(availableAllocations(world,state,g.paper.issuer,state.stateDay+1).some(p=>p.id===second.id)).toBe(true);
  expect(availableAllocations(world,state,g.paper.issuer,state.stateDay+1).some(p=>p.id===g.paper.id)).toBe(false);
});

it('rejects a state-only allocation scope instead of interpreting it as an unlimited sweep', () => {
  const base = fixtureMap().world;
  const world = { ...base, rules: { ...base.rules, allocationInstruments: [{
    id: 'bad_scope', source: 'Fictional paper p.1', fromDate: '1900-06-01',
    issuer: P('a_sec'), issuerPost: POST('a_office'), mandate: 'standing',
    from: POST('a_army'), to: POST('a_reserve'), destination: R('a_mid'),
    scope: { state: 'fictional_state' }, quantity: 'all', words: 'all men of a state',
    kind: 'request', letter: { namespace: 'allocation', key: 'bad_scope', revision: 1 },
  }] } };
  expect(assignmentProblems(world as unknown as import('../src/world/world.ts').World, fixtureStart()).some(p => p.includes('allocationInstruments.bad_scope'))).toBe(true);
});
