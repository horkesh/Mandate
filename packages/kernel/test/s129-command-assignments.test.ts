import { expect, it } from 'vitest';
import { fixtureMap, fixtureStart, F, P, POST, R } from './support/seats-fixture.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, TICK_MECHANICS } from '../src/tick/tick.ts';
import { issueMandate } from '../src/tick/mandates.ts';
import { ctxFor } from './support/tick-context.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { mandateAt } from '../src/command/authority.ts';
import type { MandatePaper } from '../src/world/mandates.ts';
import { heldPost, relieveHolder, appointHolder } from '../src/command/command.ts';
import { availableMandatePapers } from '../src/seats/local-actions.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import { canReceiveCommand, receiveCommand, commandIntake } from '../src/command/command-assignment.ts';
import { enactMandate } from '../src/command/authority.ts';
import { toId } from '../src/ids.ts';
import { viewFor } from '../src/view/view.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { principalMenu, morningGround } from '../src/seats/requests.ts';
import { applyVerb } from '../src/tick/verbs.ts';
import { report } from './support/s25-fixture.ts';
import { indexedFixture } from './support/seats-fixture.ts';
import { hop, sendReport } from '../src/tick/context.ts';

function appointmentFixture(status: 'unknown' | 'vacant' | 'held' | 'absent') {
 const base=indexedFixture(), person=P('a_spy'), destination=POST('new_command');
 const map=indexWorld({...base.map.world,
  vocabularies:{...base.map.world.vocabularies,postKinds:base.map.world.vocabularies.postKinds.map(k=>k.id==='expedition'?{...k,creatable:'appoint' as const}:k)},
  rules:{...base.map.world.rules,ruleSeats:{...base.map.world.rules.ruleSeats,principals:base.map.world.rules.ruleSeats.principals.map(p=>p.faction===F('a')?{...p,appointments:[{post:destination,person,fromPost:null,fromDate:'1900-06-01',requiresDepartment:toId('department','a_war'),source:'Fictional dated appointment p.1'}]}:p)}}});
 const world=indexSeatsWorld(map,{...base.start,temporaryPosts:[{id:destination,name:'post.new',kind:'expedition',department:toId('department','a_war'),parent:POST('a_office'),holder:person,region:R('a_cap'),operation:'new_command'}]});
 const start={...createState(world,{seed:17}),stateDay:1};
 const state=status==='absent'?start:deliverReport(start,seatIdFor(P('a_lead')),report(`m.address.${status}`,{
  reportAuthor:status==='held'?P('a_bold'):P('a_lead'),reportSubjectKind:'post',reportSubjectId:destination,
  reportClaims:status==='unknown'?[]:[{claimKind:status==='held'?'verb-answered':'commander-lost',claimRegion:null,claimValue:1,claimToken:status==='held'?'appoint:new_command':'captured',claimConfidence:1000}],
 }),NO_TRUTH);
 return {world,state,destination,person};
}

it.each(['unknown','vacant','absent'] as const)('a declared command with %s holder information permits a due appointment without inventing receipt',status=>{
 const g=appointmentFixture(status),seat=seatIdFor(P('a_lead'));
 const picture=viewFor(g.world,g.state,seat);
 expect(picture.posts.find(p=>p.post===g.destination)?.status).toBe(status==='absent'?undefined:status);
 const menu=principalMenu(g.world,g.state,F('a'),morningGround(g.world,g.state,2));
 expect(menu.doctrine.appointments?.[0]).toMatchObject({ready:true,issued:false});
 const ctx=ctxFor(g.world,g.state,2,TICK_MECHANICS);
 expect(applyVerb(ctx,g.state,seat,{cmd:'appoint',post:g.destination,person:g.person,rank:null,route:'courier'}).reason).toBeNull();
 expect(ctx.outbox).toHaveLength(1);
 expect(g.state.postStates[g.destination]).toBeUndefined();
});

it('a received held post blocks readiness and refuses another appointment',()=>{
 const g=appointmentFixture('held'),seat=seatIdFor(P('a_lead'));
 expect(viewFor(g.world,g.state,seat).posts.find(p=>p.post===g.destination)).toMatchObject({status:'held',holder:P('a_bold')});
 expect(principalMenu(g.world,g.state,F('a'),morningGround(g.world,g.state,2)).doctrine.appointments?.[0]?.ready).toBe(false);
 const ctx=ctxFor(g.world,g.state,2,TICK_MECHANICS);
 expect(applyVerb(ctx,g.state,seat,{cmd:'appoint',post:g.destination,person:g.person,rank:null,route:'courier'}).reason).toBe('post_held');
 expect(ctx.outbox).toEqual([]);
});

it('an unreported holder cannot change readiness, and refuses the appointment on receipt',()=>{
 const g=appointmentFixture('unknown'),seat=seatIdFor(P('a_lead'));
 const state={...g.state,postStates:{...g.state.postStates,
  [POST('a_reserve')]:{...g.state.postStates[POST('a_reserve')]!,postHolder:null},
  [g.destination]:{...g.state.postStates[POST('a_reserve')]!,postHolder:P('a_bold')},
 }};
 const menu=(s:typeof g.state)=>principalMenu(g.world,s,F('a'),morningGround(g.world,s,2)).doctrine.appointments;
 expect(menu(state)).toEqual(menu(g.state));
 const ctx=ctxFor(g.world,state,2,TICK_MECHANICS);
 expect(applyVerb(ctx,state,seat,{cmd:'appoint',post:g.destination,person:g.person,rank:null,route:'courier'}).reason).toBeNull();
 const receipt=ctxFor(g.world,state,ctx.outbox[0]!.msgArriveDay,TICK_MECHANICS);
 const answered=deliverDue(receipt,sendMessages(state,ctx.outbox));
 expect(answered.postStates[g.destination]?.postHolder).toBe(P('a_bold'));
 const claims=[...knowledgeOf(answered,seat).knownReports.flatMap(r=>r.knownBody.reportClaims),...answered.messagesInTransit.flatMap(m=>m.msgReport?.reportClaims??[])];
 expect(claims).toContainEqual(expect.objectContaining({claimKind:'appointment-refused',claimToken:'post_held',claimValue:0}));
});

function fixture() {
 const base=fixtureMap(), start=fixtureStart();
 const paper:MandatePaper={id:'received_command',fromDate:'1900-06-01',source:'Fictional command assignment p.1',
  assignment:{},grant:{mandateKey:'new_command',mandateRevision:1,mandateIssuer:P('a_lead'),mandateIssuerPost:null,
   mandateHolder:P('a_spy'),mandatePost:POST('new_command'),mandateParent:null,mandateActions:['hold','assign'],
   mandateRecipients:[POST('new_command')],mandateRegions:[R('a_cap'),R('a_mid'),R('a_front')],mandateModes:['land'],
   mandateCeiling:{ceilingPost:POST('new_command'),ceilingMen:null},mandateGuard:null,mandateExpires:null,
   mandateReports:[],mandateOnward:true,mandateRevoke:false}};
 const world=indexSeatsWorld(indexWorld({...base.world,vocabularies:{...base.world.vocabularies,postKinds:[...base.world.vocabularies.postKinds,{id:'assigned_command',name:'kind.assigned',creatable:'appoint',temporary:true,role:null}]},rules:{...base.world.rules,mandates:[paper]}}),
  {...start,temporaryPosts:[...start.temporaryPosts,{...start.posts.find(p=>p.id===POST('a_reserve'))!,id:POST('new_command'),holder:P('a_spy'),kind:'assigned_command',parent:POST('a_office'),operation:'new_command'}]});
 return {world,state:createState(world,{seed:17}),paper};
}
it('opens no command on sending; received and answered assignment opens it with its standing mandate',()=>{
 const g=fixture(),ctx=ctxFor(g.world,g.state,1,TICK_MECHANICS);
 expect(issueMandate(ctx,g.state,seatIdFor(P('a_lead')),{cmd:'mandate',paper:g.paper.id,route:'courier'})).toBeNull();
 expect(g.state.postStates[POST('new_command')]).toBeUndefined();
 let state=sendMessages(g.state,ctx.outbox);
 for(let n=0;n<9 && state.postStates[POST('new_command')]===undefined;n++)state=tick(g.world,state,[],{freeze:true,deepChecks:true}).state;
 expect(state.postStates[POST('new_command')]?.postHolder).toBe(P('a_spy'));
 expect(mandateAt(state,POST('new_command'),'new_command')).toMatchObject({authorityStatus:'active'});
 expect(Object.values(state.orderResponses)).toContainEqual(expect.objectContaining({respKind:'mandate',respPerson:P('a_spy'),respRole:'addressee'}));
 expect(knowledgeOf(state,seatIdFor(P('a_spy'))).knownReports.some(r=>r.knownBody.reportClaims.some(c=>c.claimKind==='command-assigned'))).toBe(true);
});

it('an assignment to an unopened command travels to its named person, not the future headquarters',()=>{
 const g=fixture(),ctx=ctxFor(g.world,g.state,1,TICK_MECHANICS);
 expect(issueMandate(ctx,g.state,seatIdFor(P('a_lead')),{cmd:'mandate',paper:g.paper.id,route:'courier'})).toBeNull();
 // Both people are at a_cap; the declared future command is at a_mid.
 expect(ctx.outbox[0]!.msgArriveDay).toBe(ctx.day);
 const sent=ctx.outbox[0]!;
 const previousHop=hop(ctxFor(g.world,g.state,1,TICK_MECHANICS),g.state,'courier',P('a_lead'),R('a_cap'),R('a_cap'),sent.id);
 expect({arrive:sent.msgArriveDay,route:sent.msgRoute}).toEqual(previousHop);
});

function neutralAssignmentFixture(){
 const g=fixture(),issuer=P('a_sec');
 const paper={...g.paper,grant:{...g.paper.grant,mandateIssuer:issuer,mandateIssuerPost:POST('a_office')}};
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,
  people:g.world.map.world.people.map(p=>p.id===issuer?{...p,faction:null}:p),
  departments:g.world.map.world.departments.map(d=>d.id==='a_war'?{...d,faction:null}:d),
  rules:{...g.world.map.world.rules,mandates:[paper],recruitment:{...g.world.map.world.rules.recruitment,raisingPostKinds:['office']}},
 }),{...g.world.start,posts:g.world.start.posts.map(p=>({...p,intelligenceChief:null}))});
 const state=createState(world,{seed:17}),ctx=ctxFor(world,state,1,TICK_MECHANICS);
 return {world,state,ctx,paper,issuer};
}
it('a neutral raising office can send its command assignment using the named recipient transport fallback',()=>{
 const {world,state,ctx,paper,issuer}=neutralAssignmentFixture();
 expect(issueMandate(ctx,state,seatIdFor(issuer),{cmd:'mandate',paper:paper.id,route:'courier'})).toBeNull();
 expect(ctx.outbox).toHaveLength(1);
 expect(ctx.outbox[0]).toMatchObject({msgFrom:issuer,msgTo:P('a_spy'),msgToPost:POST('new_command')});
 expect(state.postStates[POST('new_command')]).toBeUndefined();
});

it('a command-assignment refusal can report to its neutral issuer without inventing a faction filter',()=>{
 const {state,ctx,issuer}=neutralAssignmentFixture();
 const body=report('neutral_refusal',{reportAuthor:P('a_spy'),reportSubjectKind:'post',reportSubjectId:POST('new_command')}).knownBody;
 sendReport(ctx,state,{body,truth:NO_TRUTH,to:issuer,tag:'neutral_refusal'});
 expect(ctx.outbox).toHaveLength(1);
 expect(ctx.outbox[0]).toMatchObject({msgTo:issuer,msgToPost:POST('a_office'),msgRole:'addressee',msgPending:[]});
 expect(state.departmentFactions[toId('department','a_war')]).toBeNull();
});

it('refuses to open for a non-serving recipient and never displaces an unrelated holder',()=>{
 const g=fixture();
 const inactive={...g.state,personStatus:{...g.state.personStatus,[P('a_spy')]:{statusKind:'captured' as const,statusDay:0}}};
 expect(canReceiveCommand(g.world,inactive,g.paper)).toBe(false);
 const occupied=appointHolder(g.world.map,relieveHolder(g.state,POST('a_reserve')),POST('a_reserve'),P('a_spy'));
 expect(heldPost(occupied,P('a_spy'))).toBe(POST('a_reserve'));
 expect(canReceiveCommand(g.world,occupied,g.paper)).toBe(false);
});

it('0129: a separately received national assignment preserves the expressly retained state command',()=>{
 const g=fixture();
 const first=receiveCommand(g.world,g.state,g.paper);
 const second:MandatePaper={...g.paper,id:'second',assignment:{concurrentWith:[POST('new_command')]},grant:{...g.paper.grant,mandatePost:POST('second_command'),mandateKey:'second_command'}};
 const template={...g.world.start.temporaryPosts[0]!,id:POST('second_command'),holder:P('a_spy'),operation:'second_command'};
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,mandates:[g.paper,second]}}),{...g.world.start,temporaryPosts:[...g.world.start.temporaryPosts,template]});
 const received=receiveCommand(world,first,second);
 expect(received.postStates[POST('second_command')]?.postHolder).toBe(P('a_spy'));
 expect(received.postStates[POST('new_command')]?.postHolder).toBe(P('a_spy'));
});

it('assignment intake commands only national troops physically in its received territory, with no new lots',()=>{
 const g=fixture();
 const paper={...g.paper,assignment:{intake:[POST('a_army'),POST('a_reserve')]},grant:{...g.paper.grant,mandateRegions:[R('a_front')]}};
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,mandates:[paper]}}),g.world.start);
 const opened=receiveCommand(world,g.state,paper);
 const active=enactMandate(world.map,opened,paper.grant,toId('message','received'),1,'answer',['hold','assign','onward']);
 const result=commandIntake(world,active,1);
 expect(Object.values(result.forceAssignments).filter(p=>p===POST('new_command'))).toHaveLength(1);
 expect(result.forceBlockStates).toEqual(g.state.forceBlockStates);
 expect(Object.values(commandIntake(world,opened,1).forceAssignments)).not.toContain(POST('new_command'));
});

it('a recipient who changed service knows his own service when he accepts a command assignment',()=>{
 const g=fixture();
 const raw={...g.world.map.world,people:g.world.map.world.people.map(p=>p.id===P('a_spy')?{...p,faction:F('b'),service:{government:null,toFaction:F('a'),toBloc:null,historicalOn:null,cites:[]}}:p)};
 const world=indexSeatsWorld(indexWorld(raw),g.world.start);
 let state:typeof g.state={...g.state,personService:{...g.state.personService,[P('a_spy')]:{serviceFaction:F('a'),serviceBloc:null,serviceChoice:'resign' as const,serviceDay:0}}};
 const ctx=ctxFor(world,state,1,TICK_MECHANICS);
 expect(issueMandate(ctx,state,seatIdFor(P('a_lead')),{cmd:'mandate',paper:g.paper.id,route:'courier'})).toBeNull();
 state=sendMessages(state,ctx.outbox);
 for(let n=0;n<9 && state.postStates[POST('new_command')]===undefined;n++)state=tick(world,state,[],{freeze:true,deepChecks:true}).state;
 expect(state.postStates[POST('new_command')]?.postHolder).toBe(P('a_spy'));
 expect(viewFor(world,state,seatIdFor(P('a_spy'))).faction).toBe(F('a'));
});

it('an ineligible person receives an assignment and answers with an institutional refusal; no post or mandate is invented',()=>{
 const g=fixture(),ctx=ctxFor(g.world,g.state,1,TICK_MECHANICS);
 expect(issueMandate(ctx,g.state,seatIdFor(P('a_lead')),{cmd:'mandate',paper:g.paper.id,route:'courier'})).toBeNull();
 const occupied=appointHolder(g.world.map,relieveHolder(g.state,POST('a_reserve')),POST('a_reserve'),P('a_spy'));
 const receipt=ctxFor(g.world,occupied,ctx.outbox[0]!.msgArriveDay,TICK_MECHANICS);
 const state=deliverDue(receipt,sendMessages(occupied,ctx.outbox));
 expect(state.postStates[POST('new_command')]).toBeUndefined();
 expect(Object.values(state.orderResponses)).toContainEqual(expect.objectContaining({respKind:'mandate',respActual:'refuse',respInstitutionalRefusal:'authority_unavailable'}));
});
