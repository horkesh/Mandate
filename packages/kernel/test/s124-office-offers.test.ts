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

function fixture() {
 const {world:base,seat}=fresh();
 const raw={...base.map.world,people:base.map.world.people.map(p=>p.id===P('b_gen')?{...p,faction:null}:p),departments:base.map.world.departments.map(d=>d.id==='b_war'?{...d,faction:null}:d),rules:{...base.map.world.rules,recruitment:{...base.map.world.rules.recruitment,raisingPostKinds:['army']},ruleSeats:{...base.map.world.rules.ruleSeats,principals:base.map.world.rules.ruleSeats.principals.map(p=>p.faction===F('a')?{...p,calls:[{id:'office_levy',address:'office' as const,post:POST('b_army'),regiments:1,termDays:90,fromDate:'1900-06-01',source:'fictional office paper',offer:{region:R('a_front'),receiver:POST('a_army')}}]}:p)}}};
 const world=indexSeatsWorld(indexWorld(raw),base.start);
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


function offered() {
 const {world,state,seat}=fixture();const ctx=ctxFor(world,state,1,TICK_MECHANICS);
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
