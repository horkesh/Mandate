import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { expect, it } from 'vitest';
import { fresh } from './support/s25-fixture.ts';
import type { ForceBlockId } from '../src/ids.ts';
import { factionOfBlock } from '../src/forces/forces.ts';
import { operationsPhase } from '../src/tick/operations.ts';
import { receiveOffers, recallOffer } from '../src/tick/offers.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { entryProblems } from '../src/log/log.ts';
import { F, P, POST, R } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { issueCall, recruitmentPhase } from '../src/tick/recruitment.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { senderFor } from '../src/seats/sender.ts';
import { tick, TICK_MECHANICS } from '../src/tick/tick.ts';
import type { CallCommand } from '../src/log/commands.ts';
import type { State } from '../src/root-state.ts';
import { enactMandate, mandateAt, mayCommit } from '../src/command/authority.ts';
import { appointHolder, relieveHolder } from '../src/command/command.ts';
import { answerEntries, replay } from '../src/log/session.ts';
import { scriptedSeats } from './support/test-seats.ts';
import { toId } from '../src/ids.ts';
import { pendingRequests } from '../src/seats/requests.ts';
import { localOptions } from '../src/seats/local-actions.ts';
import { executeLocal } from '../src/tick/mandates.ts';

const assignment = {
 id:'fixture_onward', source:'Fictional onward order, p.2', fromDate:'1900-06-01',
 issuer:P('a_gen'), from:POST('a_army'), to:POST('a_reserve'), destination:R('a_mid'),
 mandate:'fixture_command', call:'office_levy', regiment:'fixture_regiment',
};

function fixture(onward = false) {
 const {world:base,seat}=fresh();
 const raw={...base.map.world,people:base.map.world.people.map(p=>p.id===P('b_gen')?{...p,faction:null}:p),departments:base.map.world.departments.map(d=>d.id==='b_war'?{...d,faction:null}:d),rules:{...base.map.world.rules,recruitment:{...base.map.world.rules.recruitment,raisingPostKinds:['army']},ruleSeats:{...base.map.world.rules.ruleSeats,principals:base.map.world.rules.ruleSeats.principals.map(p=>p.faction===F('a')?{...p,calls:[{id:'office_levy',address:'office' as const,post:POST('b_army'),regiments:1,termDays:90,fromDate:'1900-06-01',source:'fictional office paper',offer:{region:R('a_front'),receiver:POST('a_army')}}]}:p)}}};
 const world=indexSeatsWorld(indexWorld(onward ? {...raw,rules:{...raw.rules,onwardAssignments:[assignment]}} : raw),
  onward ? {...base.start,posts:base.start.posts.map(p=>p.id===assignment.to?{...p,parent:assignment.from}:p)} : base.start);
 return {world,state:createState(world,{seed:17}),seat};
}
const call:CallCommand={cmd:'call',to:POST('b_army'),regiments:1,termDays:90,route:'courier',bypass:false,callId:'office_levy',address:'office'};
it('delivers an office call to the current holder without disclosing him to its issuer; keeps call identity through lots',()=>{
 const {world,state,seat}=fixture();
 expect(senderFor(world,state,seat)!.holder(call.to)).toBeNull();
 const ctx=ctxFor(world,state,1,TICK_MECHANICS);
 expect(issueCall(ctx,state,seat,call)).toBeNull();
 const letter=ctx.outbox[0]!;expect(letter.msgOfficeAddress).toBe(true);
 const receipt=ctxFor(world,state,letter.msgArriveDay,TICK_MECHANICS);
 const received=deliverDue(receipt,sendMessages(state,[letter]));
 const response=Object.values(received.orderResponses).find(r=>r.respCallId==='office_levy')!;
 expect(response.respPerson).toBe(P('b_gen'));
 const levy=Object.values(received.postLevies)[0]!;expect(levy.levyCallId).toBe('office_levy');
 const raised=recruitmentPhase(ctxFor(world,received,levy.levyMusterDay,TICK_MECHANICS),received);
 const block=Object.keys(raised.forceBlockStates).find(b=>b.startsWith('raised.'))! as ForceBlockId;
 expect(raised.forceAssignments[block]).toBe(POST('b_army'));
 expect(raised.forceBlockStates[block]!.fbLots.every(l=>l.lotService?.enlCallId==='office_levy')).toBe(true);
 expect(raised.neutralOffers?.[letter.msgOrigin]).toMatchObject({offerOwner:POST('b_army'),offerReceiver:POST('a_army'),offerRegion:R('a_front'),offerBlocks:[block],offerStatus:'offered'});
});
it('leaves a holder-addressed call on the received-holder gate',()=>{
 const {world,state,seat}=fixture();const {address,...holderCall}=call;
 expect(issueCall(ctxFor(world,state,1,TICK_MECHANICS),state,seat,holderCall)).toBe('unknown_post');
});
it('rejects office addressing for a call that has no office instrument',()=>{
 const {world,state,seat}=fixture();
 expect(issueCall(ctxFor(world,state,1,TICK_MECHANICS),state,seat,{...call,callId:'unread'})).toBe('bad_call');
});


function offered(onward = false) {
 const {world,state,seat}=fixture(onward);const ctx=ctxFor(world,state,1,TICK_MECHANICS);
 expect(issueCall(ctx,state,seat,call)).toBeNull();const letter=ctx.outbox[0]!;
 const received=deliverDue(ctxFor(world,state,letter.msgArriveDay,TICK_MECHANICS),sendMessages(state,[letter]));
 const levy=Object.values(received.postLevies)[0]!;
 const raised=recruitmentPhase(ctxFor(world,received,levy.levyMusterDay,TICK_MECHANICS),received);
 const block=raised.neutralOffers![letter.msgOrigin]!.offerBlocks[0]!;
 return {world,state:{...raised,stateDay:levy.levyMusterDay},block,id:letter.msgOrigin};
}
it.each([false,true])('keeps governor authority until receipt even with unknown men (%s)',unknown=>{
 const g=offered();let state=unknown?{...g.state,forceBlockStates:{...g.state.forceBlockStates,[g.block]:{...g.state.forceBlockStates[g.block]!,fbLots:g.state.forceBlockStates[g.block]!.fbLots.map(l=>({...l,lotMen:null,lotStrength:{strengthKind:'unknown' as const,strengthSource:null,strengthDate:null}}))}}}:g.state;let arrived=false;
 for(let day=state.stateDay+1;day<=state.stateDay+12;day++) {
  const next=operationsPhase(ctxFor(g.world,state,day,TICK_MECHANICS),state);
  if(next.neutralOffers![g.id]!.offerStatus==='received') {state=next;arrived=true;break;}
  expect(next.forceAssignments[g.block]).toBe(POST('b_army'));
  expect(factionOfBlock(g.world.map,next,g.block)).toBeNull();state=next;
 }
 expect(arrived).toBe(true);
 expect(state.forceAssignments[g.block]).toBe(POST('a_army'));
 expect(factionOfBlock(g.world.map,state,g.block)).toBe(F('a'));
 expect(state.forceLocations[g.block]!.locRegion).toBe(R('a_front'));
 expect(state.neutralOffers![g.id]!.offerResponse.respCallId).toBe('office_levy');
 expect(receiveOffers(ctxFor(g.world,state,99,TICK_MECHANICS),state)).toBe(state);
 expect(recallOffer(ctxFor(g.world,state,99,TICK_MECHANICS),state,seatIdFor(P('b_gen')),g.id).reason).toBe('bad_selection');
});
it('a logged governor recall before receipt returns the offer; another seat cannot recall it',()=>{
 const g=offered();const ctx=ctxFor(g.world,g.state,g.state.stateDay+1,TICK_MECHANICS);
 const seat=seatIdFor(P('b_gen'));
 expect(entryProblems({day:ctx.day,seat,command:{cmd:'recall_offer',offer:g.id}},0)).toEqual([]);
 expect(recallOffer(ctx,g.state,seatIdFor(P('a_lead')),g.id).reason).toBe('bad_selection');
 const recalled=recallOffer(ctx,JSON.parse(JSON.stringify(g.state)),seat,g.id);
 expect(recalled.reason).toBeNull();expect(recalled.state.neutralOffers![g.id]!.offerStatus).toBe('recalled');
 expect(recalled.state.forceJoins[g.block]!.joinRegion).toBe(R('b_front'));
 expect(receiveOffers(ctx,recalled.state).forceAssignments[g.block]).toBe(POST('b_army'));
});
it('a government joining a side does not donate its still-unreceived offer; vacant receiver waits',()=>{
 const g=offered();const next={...g.state,departmentFactions:{...g.state.departmentFactions,b_war:F('a')}};
 expect(factionOfBlock(g.world.map,next,g.block)).toBeNull();
 const there={...next,forceLocations:{...next.forceLocations,[g.block]:{...next.forceLocations[g.block]!,locRegion:R('a_front')}},postStates:{...next.postStates,[POST('a_army')]:{...next.postStates[POST('a_army')]!,postHolder:null}}};
 expect(receiveOffers(ctxFor(g.world,there,90,TICK_MECHANICS),there)).toBe(there);
});

it('rejects altered terms on the sourced office instrument',()=>{
 const {world,state,seat}=fixture();
 expect(issueCall(ctxFor(world,state,1,TICK_MECHANICS),state,seat,{...call,regiments:99})).toBe('bad_call');
});

it('saves offers, their original reservations and pending journeys; migration from schema4 invents none',()=>{
 const g=offered();const encoded=encodeSave({worldHash:canonicalHash('fixture'),state:g.state,log:[{day:1,seat:'seat:b_gen',command:{cmd:'recall_offer',offer:g.id}}]});
 const decoded=decodeSave(encoded);expect(decoded.schemaVersion).toBe(6);
 expect(decoded.state).toEqual(g.state);
 const old=JSON.parse(encodeSave({worldHash:canonicalHash('fixture'),state:fixture().state,log:[]}));old.schemaVersion=4;
 const migrated=decodeSave(JSON.stringify(old));expect(migrated.state).toEqual(old.state);expect(migrated.logHash).toBe(old.logHash);
 expect((migrated.state as object)).not.toHaveProperty('neutralOffers');
});

it('allows the undertaking to be recalled while it is still a pending levy, before muster',()=>{
 const {world,state,seat}=fixture();const ctx=ctxFor(world,state,1,TICK_MECHANICS);
 expect(issueCall(ctx,state,seat,call)).toBeNull();const letter=ctx.outbox[0]!;
 const received=deliverDue(ctxFor(world,state,letter.msgArriveDay,TICK_MECHANICS),sendMessages(state,[letter]));
 const recalled=recallOffer(ctxFor(world,received,letter.msgArriveDay,TICK_MECHANICS),received,seatIdFor(P('b_gen')),letter.msgOrigin);
 expect(recalled.reason).toBeNull();
 expect(Object.values(recalled.state.postLevies)).toHaveLength(0);
 const later=recruitmentPhase(ctxFor(world,recalled.state,99,TICK_MECHANICS),recalled.state);
 expect(Object.keys(later.forceBlockStates).some(k=>k.startsWith('raised.'))).toBe(false);
 expect(later.neutralOffers![letter.msgOrigin]!.offerStatus).toBe('recalled');
});

it('executes a governor recall from the ordinary log with freeze and invariant checks',()=>{
 const g=offered();const seat=seatIdFor(P('b_gen'));
 const command={day:g.state.stateDay+1,seat,command:{cmd:'recall_offer' as const,offer:g.id}};
 const result=tick(g.world,g.state,[command],{freeze:true,deepChecks:true});
 expect(result.rejections).toEqual([]);expect(result.state.neutralOffers![g.id]!.offerStatus).toBe('recalled');
});
it('keeps a holder-addressed known governor envelope unchanged',()=>{
 const {world,state,seat}=fixture();const ctx=ctxFor(world,state,1,TICK_MECHANICS);
 expect(issueCall(ctx,state,seat,{cmd:'call',to:POST('a_army'),regiments:1,termDays:90,route:'courier',bypass:true})).toBeNull();
 expect(ctx.outbox[0]!.msgTo).toBe(P('a_gen'));expect(ctx.outbox[0]!.msgOfficeAddress).toBeUndefined();
});

function onwardFixture(allowed = true) {
 const g=offered(true);
 let state=g.state;
 for (let d=0; d<12 && state.neutralOffers![g.id]!.offerStatus!=='received'; d++) {
  state=tick(g.world,state,[],{freeze:true,deepChecks:true}).state;
 }
 expect(state.neutralOffers![g.id]!.offerStatus).toBe('received');
 const block=state.forceBlockStates[g.block]!;
 state={...state,forceBlockStates:{...state.forceBlockStates,[g.block]:{...block,fbLots:block.fbLots.map(l=>({...l,lotRegiment:'fixture_regiment',lotGenerated:false}))}}};
 const grant={
  mandateKey:assignment.mandate,mandateRevision:1,mandateIssuer:P('a_lead'),mandateIssuerPost:null,
  mandateHolder:assignment.issuer,mandatePost:assignment.from,mandateParent:null,mandateActions:['assign'] as const,
  mandateRecipients:[assignment.from],mandateRegions:allowed ? [R('a_front'),R('a_mid')] : [R('a_front')],
  mandateModes:['land','rail'] as const,mandateCeiling:{ceilingPost:assignment.from,ceilingMen:null},
  mandateGuard:null,mandateExpires:null,mandateReports:[],mandateOnward:true,mandateRevoke:false,
 };
 state=enactMandate(g.world.map,state,grant,toId('message','fixture.mandate'),state.stateDay,'fixture-response',['assign','onward']);
 const day=state.stateDay+1, seat=seatIdFor(assignment.issuer);
 return {...g,state,grant,entry:{day,seat,command:{cmd:'choose' as const,request:`local:${assignment.from}:${day}`,option:`assignment:${assignment.id}`}}};
}

it('keeps a received regiment at rendezvous when its onward order has not been issued',()=>{
 const g=onwardFixture();
 const request=pendingRequests(g.world,g.state).find(r=>r.requestKey===g.entry.command.request);
 expect(request?.menu).toMatchObject({menuKind:'local-action',options:[{optionId:g.entry.command.option}]});
 const state=tick(g.world,g.state,[],{freeze:true,deepChecks:true}).state;
 expect(state.forceLocations[g.block]!.locRegion).toBe(R('a_front'));
 expect(state.forceAssignments[g.block]).toBe(assignment.from);
 expect(state.forceJoins[g.block]).toBeUndefined();
});

it('refuses the logged selection outside the issuer’s received territorial authority',()=>{
 const g=onwardFixture(false);
 const result=tick(g.world,g.state,[g.entry],{freeze:true,deepChecks:true});
 expect(result.rejections).toHaveLength(1);
 expect(result.requestDispatches?.some(m=>m.msgOrder?.orderKind==='assignment')).toBeFalsy();
 expect(result.state.forceAssignments[g.block]).toBe(assignment.from);
});

it('answers the logged order and transfers command only when the receiving commander receives the regiment',()=>{
 const g=onwardFixture();
 expect(entryProblems(g.entry,0)).toEqual([]);
 const issued=tick(g.world,g.state,[g.entry],{freeze:true,deepChecks:true});
 expect(issued.rejections).toEqual([]);
 const dispatch=issued.requestDispatches?.find(m=>m.msgOrder?.orderKind==='assignment');
 expect(dispatch).toMatchObject({msgTo:P('a_bold'),msgToPost:assignment.to,msgOrder:{orderIssuer:assignment.issuer}});
 let state=issued.state;
 expect(state.forceAssignments[g.block]).toBe(assignment.from);
 for (let d=0; d<15 && state.forceAssignments[g.block]!==assignment.to; d++) {
  if (state.forceLocations[g.block]!.locRegion!==assignment.destination) expect(state.forceAssignments[g.block]).toBe(assignment.from);
  state=tick(g.world,state,[],{freeze:true,deepChecks:true}).state;
 }
 expect(state.forceAssignments[g.block]).toBe(assignment.to);
 expect(state.forceLocations[g.block]!.locRegion).toBe(assignment.destination);
 expect(Object.values(state.orderResponses)).toContainEqual(expect.objectContaining({respOrder:dispatch!.msgOrigin,respKind:'assignment',respPerson:P('a_bold'),respRole:'addressee'}));
});

it('records an ordinary refusal when the issuer loses his mandate while the letter is in transit',()=>{
 const g=onwardFixture();
 const issued=tick(g.world,g.state,[g.entry],{freeze:true,deepChecks:true});
 const dispatch=issued.requestDispatches?.find(m=>m.msgOrder?.orderKind==='assignment')!;
 expect(dispatch.msgArriveDay).toBeGreaterThan(issued.state.stateDay);
 const revoked=enactMandate(g.world.map,issued.state,{...g.grant,mandateRevision:2,mandateRevoke:true},
  toId('message','fixture.revoked'),issued.state.stateDay,'revocation-answer',[]);
 const until=dispatch.msgArriveDay+2;
 const resumed=replay(g.world,revoked,[g.entry],until,{freeze:true,deepChecks:true});
 const response=Object.values(resumed.state.orderResponses).find(r=>r.respOrder===dispatch.msgOrigin);
 expect(response).toMatchObject({respKind:'assignment',respRole:'addressee',respActual:'refuse',respInstitutionalRefusal:'authority_unavailable'});
 expect(resumed.state.forceAssignments[g.block]).toBe(assignment.from);
 expect(resumed.state.forceJoins[g.block]).toBeUndefined();
 const encoded=encodeSave({worldHash:canonicalHash('fixture'),state:resumed.state,log:[g.entry]});
 expect(decodeSave(encoded)).toMatchObject({state:{orderResponses:resumed.state.orderResponses},log:[g.entry]});
});

it('uses the shared commitment while the order is in transit and while the regiment travels',()=>{
 const g=onwardFixture();
 let state=tick(g.world,g.state,[g.entry],{freeze:true,deepChecks:true}).state;
 const available=()=>mayCommit(g.world.map,state,mandateAt(state,assignment.from,assignment.mandate)!,assignment.from,[g.block]);
 expect(available()).toBe(false);
 for (let d=0;d<10 && state.forceJoins[g.block]?.joinAssignment===undefined;d++) {
  state=tick(g.world,state,[],{freeze:true,deepChecks:true}).state;
 }
 expect(state.forceJoins[g.block]?.joinAssignment).toBeDefined();
 expect(available()).toBe(false);
});

it('withholds troop receipt if the commander who answered is replaced before arrival',()=>{
 const g=onwardFixture();
 let state=tick(g.world,g.state,[g.entry],{freeze:true,deepChecks:true}).state;
 for (let d=0;d<10 && state.forceJoins[g.block]?.joinAssignment===undefined;d++) {
  state=tick(g.world,state,[],{freeze:true,deepChecks:true}).state;
 }
 const pending=state.forceJoins[g.block]?.joinAssignment;
 expect(pending).toMatchObject({assignmentRecipient:P('a_bold')});
 expect(state.forceAssignments[g.block]).toBe(assignment.from);
 const later=state.stateDay+10;
 const resumed=decodeSave(encodeSave({worldHash:canonicalHash('fixture'),state,log:[g.entry]})).state as unknown as State;
 expect(replay(g.world,resumed,[g.entry],later).hashes).toEqual(replay(g.world,state,[g.entry],later).hashes);
 state=appointHolder(g.world.map,relieveHolder(state,assignment.to),assignment.to,P('a_spy'));
 const replaced=replay(g.world,state,[g.entry],later,{freeze:true,deepChecks:true}).state;
 expect(replaced.forceAssignments[g.block]).toBe(assignment.from);
 expect(replaced.forceJoins[g.block]).toBeUndefined();
});

it('S129: isolates the identified received regiment from a mixed offer and preserves every lot and receipt',()=>{
 const g=onwardFixture();
 const original=g.state.forceBlockStates[g.block]!.fbLots[0]!;
 const other={...original,lotId:'unidentified_companion',lotRegiment:'generated_companion',lotGenerated:true};
 const state={...g.state,forceBlockStates:{...g.state.forceBlockStates,[g.block]:{...g.state.forceBlockStates[g.block]!,fbLots:[original,other]}}};
 const request=pendingRequests(g.world,state).find(r=>r.requestKey===g.entry.command.request);
 expect(request?.menu).toMatchObject({menuKind:'local-action',options:[{optionId:g.entry.command.option}]});
 const issued=tick(g.world,state,[g.entry],{freeze:true,deepChecks:true});
 expect(issued.rejections).toEqual([]);
 const dispatch=issued.requestDispatches!.find(m=>m.msgOrder?.orderKind==='assignment')!;
 const selected=dispatch.msgOrder!.orderAssignment!.block;
 expect(issued.state.forceBlockStates[selected]!.fbLots).toEqual([original]);
 expect(issued.state.forceBlockStates[g.block]!.fbLots).toEqual([other]);
 expect(issued.state.neutralOffers![g.id]!.offerReceived).toContain(selected);
 let final=issued.state;
 for(let n=0;n<15 && final.forceAssignments[selected]!==assignment.to;n++)final=tick(g.world,final,[],{freeze:true,deepChecks:true}).state;
 expect(final.forceAssignments[selected]).toBe(assignment.to);
 expect(final.forceBlockStates[selected]!.fbLots).toEqual([original]);
 expect(final.forceAssignments[g.block]).toBe(assignment.from);
});

it('S129: office-addressed onward paper waits for a holder and is answered by the command holder on receipt',()=>{
 const g=onwardFixture();
 const raw=g.world.map.world;
 const world=indexSeatsWorld(indexWorld({...raw,rules:{...raw.rules,onwardAssignments:[{...assignment,address:'office'}]}}),g.world.start);
 const vacant=relieveHolder(g.state,assignment.to);
 const issued=tick(world,vacant,[g.entry],{freeze:true,deepChecks:true});
 expect(issued.rejections).toEqual([]);
 const paper=issued.requestDispatches!.find(m=>m.msgOrder?.orderKind==='assignment')!;
 expect(paper.msgOfficeAddress).toBe(true);
 let state=issued.state;
 for(let n=0;n<5;n++)state=tick(world,state,[],{freeze:true,deepChecks:true}).state;
 expect(Object.values(state.orderResponses).some(r=>r.respOrder===paper.msgOrigin)).toBe(false);
 expect(state.forceAssignments[g.block]).toBe(assignment.from);
 state=appointHolder(world.map,state,assignment.to,P('a_bold'));
 for(let n=0;n<15 && state.forceAssignments[g.block]!==assignment.to;n++)state=tick(world,state,[],{freeze:true,deepChecks:true}).state;
 expect(state.forceAssignments[g.block]).toBe(assignment.to);
 expect(Object.values(state.orderResponses)).toContainEqual(expect.objectContaining({respOrder:paper.msgOrigin,respPerson:P('a_bold'),respKind:'assignment'}));
});

it.each(['office_levy','unlinked_call'])('S129: the read call link (%s) survives muster, offer and national receipt without changing personnel',identityCall=>{
 const base=fixture();
 const record={id:'fixture_regiment',order:0,state:'fictional',raisingDepartment:base.state.postStates[POST('b_army')]!.postDepartment,
  designation:'Fictional linked regiment',arm:'infantry',scope:'regiment',side:'a',termDays:[],identityCall,aliases:[],observations:[],path:{source:'Fictional link p.1'}};
 const world=indexSeatsWorld(indexWorld({...base.world.map.world,regimentCatalogue:[record]}),base.world.start);
 const start=createState(world,{seed:17});const ctx=ctxFor(world,start,1,TICK_MECHANICS);
 expect(issueCall(ctx,start,base.seat,call)).toBeNull();const letter=ctx.outbox[0]!;
 const received=deliverDue(ctxFor(world,start,letter.msgArriveDay,TICK_MECHANICS),sendMessages(start,[letter]));
 const levy=Object.values(received.postLevies)[0]!;
 let state=recruitmentPhase(ctxFor(world,received,levy.levyMusterDay,TICK_MECHANICS),received);
 const block=state.neutralOffers![letter.msgOrigin]!.offerBlocks[0]!;
 const lots=state.forceBlockStates[block]!.fbLots;
 expect(lots.some(l=>l.lotRegiment==='fixture_regiment')).toBe(identityCall==='office_levy');
 for(let day=levy.levyMusterDay+1;day<levy.levyMusterDay+20 && state.neutralOffers![letter.msgOrigin]!.offerStatus!=='received';day++)state=operationsPhase(ctxFor(world,state,day,TICK_MECHANICS),state);
 expect(state.neutralOffers![letter.msgOrigin]!.offerStatus).toBe('received');
 expect(state.forceBlockStates[block]!.fbLots).toEqual(lots);
});

it('S129: a read named addressee permits dispatch without learning the live holder of an unopened-source address',()=>{
 const g=onwardFixture(),raw=g.world.map.world;
 const start={...g.world.start,posts:g.world.start.posts.filter(p=>p.id!==assignment.to),forceBlocks:g.world.start.forceBlocks.filter(b=>b.post!==assignment.to),
  temporaryPosts:[...g.world.start.temporaryPosts,{...g.world.start.posts.find(p=>p.id===assignment.to)!,operation:'fictional_address'}]};
 const world=indexSeatsWorld(indexWorld({...raw,rules:{...raw.rules,onwardAssignments:[{...assignment,recipient:P('a_bold')}]}}),start);
 const issued=tick(world,g.state,[g.entry],{freeze:true,deepChecks:true});
 expect(issued.rejections).toEqual([]);
 expect(issued.requestDispatches!.find(m=>m.msgOrder?.orderKind==='assignment')?.msgTo).toBe(P('a_bold'));
});

it('S129: a completed own hold releases its force commitment for a subsequent sourced onward order',()=>{
 const g=onwardFixture();
 const grant={...g.grant,mandateRevision:2,mandateActions:['hold','assign'] as const};
 let state=enactMandate(g.world.map,g.state,grant,toId('message','hold-grant'),g.state.stateDay,'answer',['hold','assign','onward']);
 const option=localOptions(g.world,state,assignment.issuer,state.stateDay+1).find(o=>o.kind==='goal' && o.target===assignment.from && o.candidate.candMethod==='direct')!;
 expect(option).toBeDefined();
 state=executeLocal(ctxFor(g.world,state,state.stateDay+1,TICK_MECHANICS),state,assignment.issuer,option).state;
 let ended=false;
 for(let n=0;n<32;n++) {
  const seat=scriptedSeats({});
  const entries=pendingRequests(g.world,state).filter(r=>r.menu.menuKind!=='local-action').flatMap(r=>answerEntries(r,seat(r.requestSeat)));
  state=tick(g.world,state,entries,{freeze:true,deepChecks:true}).state;
  if(Object.values(state.operationRecords).some(op=>op.opPost===assignment.from && op.opEndDay!==null)){ended=true;break;}
 }
 expect(ended).toBe(true);
 expect(localOptions(g.world,state,assignment.issuer,state.stateDay+1)).toContainEqual(expect.objectContaining({kind:'assignment',paper:assignment}));
});
