import { expect, it } from 'vitest';
import { fixtureMap, fixtureStart, P, POST, R } from './support/seats-fixture.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { toId } from '../src/ids.ts';
import { enactMandate } from '../src/command/authority.ts';
import { factionOfPost } from '../src/command/command.ts';
import { localOptions } from '../src/seats/local-actions.ts';
import { fulfilAllocation, receiveAllocations } from '../src/tick/allocation.ts';
import { approve, choose, setGoal } from '../src/plans/plans.ts';
import { ctxFor } from './support/tick-context.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { operationsPhase } from '../src/tick/operations.ts';
import type { State } from '../src/root-state.ts';

const B=toId('forceBlock','a_army_1');
const mission=toId('message','mission');
function fixture() {
  const map=fixtureMap(), start=fixtureStart();
  const world=indexSeatsWorld(indexWorld({...map.world,vocabularies:{...map.world.vocabularies,postKinds:map.world.vocabularies.postKinds.map(k=>k.id==='office'?{...k,role:'office' as const}:k)},rules:{...map.world.rules,
    serviceStations:[{id:'station',source:'Fictional station order p.1',region:R('a_mid'),post:POST('a_reserve'),mandate:'local',kind:'station' as const}],
  }}),start);
  let state=createState(world,{seed:17});
  const grant={mandateKey:'local',mandateRevision:1,mandateIssuer:P('a_lead'),mandateIssuerPost:null,mandateHolder:P('a_bold'),mandatePost:POST('a_reserve'),mandateParent:null,
    mandateActions:['hold','take','assign'] as const,mandateRecipients:[POST('a_reserve')],mandateRegions:[R('a_mid'),R('a_front')],mandateModes:['land'] as const,
    mandateCeiling:{ceilingPost:POST('a_reserve'),ceilingMen:null},mandateGuard:null,mandateExpires:null,mandateReports:[],mandateOnward:true,mandateRevoke:false};
  state=enactMandate(world.map,state,grant,toId('message','grant'),0,'fixture',['hold','take','assign','onward']);
  const lot=state.forceBlockStates[B]!.fbLots[0]!;
  state={...state,forceBlockStates:{...state.forceBlockStates,[B]:{...state.forceBlockStates[B]!,fbLots:[{...lot,lotService:{enlPost:POST('a_army'),enlRaisedBy:P('a_gen'),enlCall:toId('message','call'),enlCallId:'q',enlRegiments:1,enlMusterDay:0,enlEndsDay:365}}]}},
    forceAssignments:{...state.forceAssignments,[B]:POST('a_office')},
    forceLocations:{...state.forceLocations,[B]:{...state.forceLocations[B]!,locRegion:R('a_mid')}},
    forceJoins:{[B]:{joinPost:POST('a_army'),joinRegion:R('a_mid'),joinSinceDay:0,joinBlocked:null,
      joinService:{serviceOrder:toId('message','send'),servicePurpose:'service' as const}}}};
  return {world,state,grant};
}
function receipt(g:ReturnType<typeof fixture>, state=g.state) {return receiveAllocations(ctxFor(g.world,state,1,TICK_MECHANICS),state);}
it('E01/E02: lawful station receipt respects explicit destination and transit',()=>{
  const g=fixture();
  expect(receipt(g).forceAssignments[B]).toBe(POST('a_reserve'));
  for(const terms of [{servicePurpose:'transit' as const},{serviceReceiver:POST('a_army')}]) {
    const state={...g.state,forceJoins:{[B]:{...g.state.forceJoins[B]!,joinService:{...g.state.forceJoins[B]!.joinService!,...terms}}}};
    expect(receipt(g,state).forceAssignments[B]).toBe(POST('a_office'));
  }
});
it('E03/E04: unopened or missing post records a gap and preserves ownership',()=>{
  const g=fixture();
  for(const state of [{...g.state,authorityByPost:{}},{...g.state,postStates:Object.fromEntries(Object.entries(g.state.postStates).filter(([id])=>id!=='a_reserve'))}]) {
    const done=receipt(g,state);
    expect(done.forceAssignments[B]).toBe(POST('a_office'));
    expect(Object.values(done.serviceReceipts??{})).toContainEqual(expect.objectContaining({receiptStatus:'gap'}));
  }
});
it('F01: accepted empty mission can ask without a phantom block; unreceived mission cannot',()=>{
 const g=fixture();
 let state:State={...g.state,forceAssignments:{...g.state.forceAssignments,[B]:POST('a_office')}};
 const goal={goalObjective:R('b_front'),goalPosture:'take' as const,goalRisk:500,goalDeadlineDays:20,goalRail:false,goalRiver:false,goalSea:false,goalNeutral:false,goalCommitted:[],goalAwaitWord:false,goalApproveAsDrafted:false};
 expect(localOptions(g.world,state,P('a_gen'),1).filter(o=>o.kind==='force-request')).toHaveLength(0);
 state=setGoal(state,POST('a_army'),{id:mission,issuer:P('a_sec'),goal,viaChain:true,issuedDay:0,response:'fixture'},0);
 expect(localOptions(g.world,state,P('a_gen'),1).filter(o=>o.kind==='force-request')).toHaveLength(1);
});

import { assignmentPacket } from '../src/command/force-requests.ts';
import { forceAnswer } from '../src/seats/force-requests.ts';
import { executeLocal } from '../src/tick/mandates.ts';
import { deliverReport, knowledgeOf } from '../src/knowledge/knowledge.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { allocationSelection } from '../src/command/allocation.ts';
import { arriveAllocation } from '../src/tick/allocation.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { tick } from '../src/tick/tick.ts';
import { generateReports } from '../src/tick/generate.ts';
import { allocationPaper } from '../src/command/force-requests.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { F } from './support/seats-fixture.ts';

function requesting() {
 const g=fixture();
 let state:State={...g.state,forceJoins:{},forceAssignments:{...g.state.forceAssignments,[B]:POST('a_office')},
  forceLocations:{...g.state.forceLocations,[B]:{...g.state.forceLocations[B]!,locRegion:R('a_cap')}}};
 const goal={goalObjective:R('b_front'),goalPosture:'take' as const,goalRisk:500,goalDeadlineDays:20,goalRail:false,goalRiver:false,goalSea:false,goalNeutral:false,goalCommitted:[],goalAwaitWord:false,goalApproveAsDrafted:false};
 state=setGoal(state,POST('a_army'),{id:mission,issuer:P('a_sec'),goal,viaChain:true,issuedDay:0,response:'fixture'},0);
 const grant={...g.grant,mandateActions:['assign'] as const,mandatePost:POST('a_office'),mandateKey:'superior',mandateHolder:P('a_sec'),mandateRecipients:[POST('a_office')],mandateRegions:[R('a_cap'),R('a_mid'),R('a_front'),R('b_front')],mandateCeiling:{ceilingPost:POST('a_office'),ceilingMen:null}};
 state=enactMandate(g.world.map,state,grant,toId('message','superior'),0,'fixture',['hold','take','assign','onward']);
 return {...g,state};
}
function ask(g:ReturnType<typeof requesting>,state=g.state) {
 const option=localOptions(g.world,state,P('a_gen'),1).find(o=>o.kind==='force-request')!;
 expect(option).toBeDefined();
 const ctx=ctxFor(g.world,state,1,TICK_MECHANICS);
 const next=executeLocal(ctx,state,P('a_gen'),option);
 expect(next.reason).toBeNull();
 const message=ctx.outbox.find(m=>m.msgReport?.reportForceNeed)!;
 const delivered=deliverReport(next.state,seatIdFor(P('a_sec')),{id:message.id,knownBody:message.msgReport!,knownReceivedDay:2,knownRoute:'courier',knownVia:[]},{truthTerms:[],truthTrimmed:[]});
 return {state:delivered,message,option};
}

it('S150 capture observes batched force request and answer receipts once without changing delivered State',()=>{
 const g=requesting(), a=ask(g), id=toId('message','capture-answer');
 const {reportForceNeed:_,reportForceRequest:__,...requestBody}=a.message.msgReport!;
 const answer={...a.message,id,msgOrigin:id,msgFrom:P('a_sec'),msgTo:P('a_gen'),msgToPost:POST('a_army'),
   msgReport:{...requestBody,reportAuthor:P('a_sec'),reportAuthorPost:POST('a_office'),reportAnswers:a.message.id,reportClaims:[]}};
 const messages=[{...a.message,msgArriveDay:2},{...answer,msgArriveDay:2}];
 const start={...a.state,knowledgeBySeat:g.state.knowledgeBySeat};
 const ctx={...ctxFor(g.world,start,2,TICK_MECHANICS),requestReceipts:[] as (typeof a.message)[]};
 const actual=deliverDue(ctx,sendMessages(start,messages));
 const expected=messages.reduce((state,msg)=>deliverReport(state,seatIdFor(msg.msgTo),{id:msg.msgOrigin,
   knownBody:msg.msgReport!,knownReceivedDay:2,knownRoute:msg.msgRoute,knownVia:msg.msgVia},
   msg.msgTruth??{truthTerms:[],truthTrimmed:[]}),start);
 expect(canonicalHash(actual)).toBe(canonicalHash(expected));
 expect(ctx.requestReceipts.map(m=>m.id).sort()).toEqual(messages.map(m=>m.id).sort());
});

const donorPost=POST('a_reserve'), donorPerson=P('a_bold'), superiorPost=POST('a_office'), superiorPerson=P('a_sec');

function subordinateNeed(peer=false) {
 const g=requesting(), block=g.state.forceBlockStates[B]!;
 const state:State={...g.state,forceAssignments:{...g.state.forceAssignments,[B]:donorPost},
  forceLocations:{...g.state.forceLocations,[B]:{...g.state.forceLocations[B]!,locRegion:R('a_mid')}}};
 const a=ask(g,state);
 const reportCtx=ctxFor(g.world,state,1,TICK_MECHANICS);
 generateReports(reportCtx,state);
 const strength=reportCtx.outbox.find(m=>m.msgTo===superiorPerson&&m.msgReport?.reportType==='strength-return'&&m.msgReport.reportAuthorPost===donorPost)!;
 expect(strength).toBeDefined();
 const result=deliverReport(a.state,seatIdFor(superiorPerson),{id:strength.id,knownBody:strength.msgReport!,knownReceivedDay:2,knownRoute:'courier',knownVia:[]},{truthTerms:[],truthTrimmed:[]});
 return {...g,request:a.message,returnReport:strength,state:peer?{...result,postStates:{...result.postStates,[donorPost]:{...result.postStates[donorPost]!,postParent:null}}}:result};
}

function directSubordinate(g:ReturnType<typeof subordinateNeed>,state=g.state) {
 const ctx=ctxFor(g.world,state,3,TICK_MECHANICS);
 const option=localOptions(g.world,state,superiorPerson,3).find(o=>o.kind==='force-answer')!;
 const done=executeLocal(ctx,state,superiorPerson,option);
 expect(done.reason).toBeNull();
 const letter=ctx.outbox.find(m=>m.msgOrder?.orderKind==='allocation');
 return {letter,state:done.state,report:ctx.outbox.find(m=>m.msgReport?.reportAnswers===g.request.id),answer:done.state.forceRequests?.[g.request.id]?.freqAnswers.at(-1)};
}

function acceptSubordinate(g:ReturnType<typeof subordinateNeed>, ordered=directSubordinate(g)) {
 const msg=ordered.letter!;
 expect(msg?.msgTo).toBe(donorPerson);
 const ctx=ctxFor(g.world,ordered.state,msg.msgArriveDay,TICK_MECHANICS);
 return deliverDue(ctx,sendMessages(ordered.state,[msg]));
}

function ownDefence(g:ReturnType<typeof requesting>,state:State,person:Parameters<typeof seatIdFor>[0],post:typeof donorPost,objective:ReturnType<typeof R>,opposition?:number):State {
 const request=Object.values(state.forceRequests??{})[0]!, need=request.freqNeed;
 const goal={...need.needGoal,goalPurpose:undefined,goalPosture:'hold' as const,goalObjective:objective,goalCommitted:[B]};
 const defending=setGoal(state,post,{id:toId('message','local-defence'),issuer:superiorPerson,goal,viaChain:true,issuedDay:0,response:'fixture'},0);
 if(opposition===undefined)return defending;
 return deliverReport(defending,seatIdFor(person),{id:toId('message','full-defence-estimate'),knownReceivedDay:0,knownRoute:'courier',knownVia:[],knownBody:{reportType:'enemy-estimate',reportSubtype:null,reportAuthor:person,reportAuthorPost:post,reportSubjectKind:'region',reportSubjectId:objective,reportDay:0,reportHour:null,reportAdvice:null,reportAnswers:null,
  reportClaims:g.world.regionIds.map(region=>({claimKind:'enemy-strength',claimRegion:region,claimValue:region===objective?opposition:0,claimToken:null,claimConfidence:1000}))}},{truthTerms:[],truthTrimmed:[]});
}

it.each([[1000,0,400],[2000,400,1400]] as const)('0135 a subordinate keeps a lot when opposition %s causes a new or deeper shortfall', (opposition,keep,send)=>{
 const g=subordinateNeed(), state=ownDefence(g,g.state,donorPerson,donorPost,R('a_mid'),opposition);
 const ordered=directSubordinate(g,state), accepted=acceptSubordinate(g,ordered);
 expect(accepted.allocationRecords?.[ordered.letter!.msgOrigin]).toMatchObject({allocStatus:'refused',allocReasons:['retain_for_own_mission'],allocRetention:[keep,send],allocLots:[]});
 expect(accepted.forceAssignments[B]).toBe(donorPost);
});

it('0135 a subordinate sends a determined surplus despite a lower force ratio',()=>{
 const g=subordinateNeed(), state=ownDefence(g,g.state,donorPerson,donorPost,R('a_mid'),450);
 const ordered=directSubordinate(g,state), accepted=acceptSubordinate(g,ordered);
 expect(accepted.allocationRecords?.[ordered.letter!.msgOrigin]).toMatchObject({allocStatus:'pending',allocRetention:[0,0],allocReceived:[]});
 expect(accepted.forceJoins[B]?.joinAllocation).toBe(ordered.letter!.msgOrigin);
});

const undeterminedReservation=expect.objectContaining({knowledge:'unknown',effect:'statement',grounds:{groundKind:'course_judgment',groundReference:'retention_comparison_undetermined'}});

it('0135 a complying holder sends with an undetermined reservation stated to issuer and requester',()=>{
 const g=subordinateNeed(), state=ownDefence(g,g.state,donorPerson,donorPost,R('a_mid'));
 const ordered=directSubordinate(g,state), order=ordered.letter!;
 const accepted=acceptSubordinate(g,ordered);
 expect(accepted.allocationRecords?.[order.msgOrigin]).toMatchObject({allocStatus:'pending',allocRetention:[null,null],allocReceived:[]});
 const response=accepted.orderResponses[responseKey(order.msgOrigin,donorPerson)];
 expect(response?.respActual).toBe('comply');
 expect(response?.respDeclaredReservations).toContainEqual(undeterminedReservation);
 const heard=deliverDue(ctxFor(g.world,accepted,order.msgArriveDay+10,TICK_MECHANICS),accepted);
 for(const [person,answers] of [[superiorPerson,order.msgOrigin],[P('a_gen'),g.request.id]] as const) {
  const advice=knowledgeOf(heard,seatIdFor(person)).knownReports.find(r=>r.knownBody.reportAnswers===answers&&r.knownBody.reportQualification?.statedReservations.some(q=>q.grounds.groundReference==='retention_comparison_undetermined'));
  expect(advice?.knownBody.reportAuthor).toBe(donorPerson);
  expect(advice?.knownBody.reportQualification?.statedReservations).toContainEqual(undeterminedReservation);
 }
 expect(accepted.forceAssignments[B]).toBe(donorPost);
});

it('0135 a holder’s own typed compliance objection still prevents sending',()=>{
 const g=subordinateNeed(), state=ownDefence(g,g.state,donorPerson,donorPost,R('a_mid'));
 const objecting={...state,personTrue:{...state.personTrue,[donorPerson]:{...state.personTrue[donorPerson]!,trueCandour:1000}},
   personRegard:{...state.personRegard,[donorPerson]:{[superiorPerson]:-1000}}};
 const ordered=directSubordinate(g,objecting), accepted=acceptSubordinate(g,ordered), order=ordered.letter!.msgOrigin;
 expect(accepted.orderResponses[responseKey(order,donorPerson)]).toMatchObject({respActual:'object',respReasons:expect.arrayContaining([{kind:'distrusts_leader'}])});
 expect(accepted.allocationRecords?.[order]).toMatchObject({allocStatus:'refused',allocReasons:['refused'],allocLots:[]});
 expect(accepted.forceJoins[B]).toBeUndefined();
});

it('0135 a superior’s own direct grant follows the same retention rule',()=>{
 const g=requesting(), request=ask(g), state=ownDefence(g,request.state,superiorPerson,superiorPost,R('a_cap'),0);
 const result=directSubordinate({...g,request:request.message,returnReport:request.message,state});
 expect(result.answer).toMatchObject({fansAction:'grant',fansRetention:[0,0]});
 expect(result.answer?.fansReasons).not.toContain('retain_for_own_mission');
 expect(result.letter?.msgTo).toBe(superiorPerson);
 const letter=result.letter!, sent=deliverDue(ctxFor(g.world,result.state,letter.msgArriveDay,TICK_MECHANICS),sendMessages(result.state,[letter]));
 expect(sent.allocationRecords?.[letter.msgOrigin]).toMatchObject({allocStatus:'pending',allocRetention:[0,0],allocBlocks:[B]});
 expect(sent.forceJoins[B]?.joinAllocation).toBe(letter.msgOrigin);
});

function directGrant(quantity:number) {
 const g=requesting(), a=ask(g), id=a.message.id, row=a.state.forceRequests![id]!, need={...row.freqNeed,needQuantity:quantity};
 const superior=seatIdFor(superiorPerson), knowledge=a.state.knowledgeBySeat[superior]!;
 const state={...a.state,forceRequests:{...a.state.forceRequests,[id]:{...row,freqNeed:need}},knowledgeBySeat:{...a.state.knowledgeBySeat,
  [superior]:{...knowledge,knownReports:knowledge.knownReports.map(r=>r.knownBody.reportForceRequest===id?{...r,knownBody:{...r.knownBody,reportForceNeed:need}}:r)}}};
 const ordered=directSubordinate({...g,request:a.message,returnReport:a.message,state});
 expect(ordered.answer?.fansAction).toBe(quantity===1?'grant':'partial');
 return {...g,request:a.message,ordered,state:ordered.state};
}

it('0135 a direct grant checks the actual sending against a new need at self-paper receipt',()=>{
 const g=directGrant(1), letter=g.ordered.letter!;
 const changed=ownDefence(g,g.state,superiorPerson,superiorPost,R('a_cap'),450);
 const sent=deliverDue(ctxFor(g.world,changed,letter.msgArriveDay,TICK_MECHANICS),sendMessages(changed,[letter]));
 expect(sent.allocationRecords?.[letter.msgOrigin]).toMatchObject({allocStatus:'refused',allocReasons:['retain_for_own_mission'],allocLots:[]});
 expect(sent.forceJoins[B]).toBeUndefined();
});

it('0135 rechecks a new mission before a later direct fulfilment can send the second lot',()=>{
 const g=directGrant(2), letter=g.ordered.letter!;
 const first=deliverDue(ctxFor(g.world,g.state,letter.msgArriveDay,TICK_MECHANICS),sendMessages(g.state,[letter]));
 const order=first.allocationRecords![letter.msgOrigin]!;
 expect(order).toMatchObject({allocStatus:'pending',allocShortfall:1,allocBlocks:[B]});
 const arrived={...first,forceLocations:{...first.forceLocations,[B]:{...first.forceLocations[B]!,locRegion:R('a_front')}}};
 const received=receiveAllocations(ctxFor(g.world,arrived,letter.msgArriveDay+1,TICK_MECHANICS),arrived);
 expect(received.allocationRecords?.[letter.msgOrigin]).toMatchObject({allocStatus:'shortfall',allocReceived:[B],allocShortfall:1});
 const reserve=toId('forceBlock','a_reserve_1'), holder=received.forceBlockStates[reserve]!, service=received.forceBlockStates[B]!.fbLots[0]!.lotService;
 const available={...received,forceAssignments:{...received.forceAssignments,[reserve]:superiorPost},forceBlockStates:{...received.forceBlockStates,
  [reserve]:{...holder,fbLots:holder.fbLots.map(l=>({...l,lotService:service}))}}};
 const changed=ownDefence(g,available,superiorPerson,superiorPost,R('a_cap'),450);
 const sent=fulfilAllocation(ctxFor(g.world,changed,letter.msgArriveDay+2,TICK_MECHANICS),changed,letter.msgOrigin);
 expect(sent.allocationRecords?.[letter.msgOrigin]).toMatchObject({allocStatus:'refused',allocReasons:['retain_for_own_mission'],allocLots:order.allocLots,allocReceived:[B]});
 expect(sent.forceJoins[reserve]).toBeUndefined();
 expect(localOptions(g.world,sent,superiorPerson,letter.msgArriveDay+3).some(o=>o.kind==='allocation-fulfil')).toBe(false);

 const unknown=ownDefence(g,available,superiorPerson,superiorPost,R('a_cap'));
 const before=unknown.orderResponses[responseKey(letter.msgOrigin,superiorPerson)]!;
 const ctx=ctxFor(g.world,unknown,letter.msgArriveDay+2,TICK_MECHANICS);
 const complies=fulfilAllocation(ctx,unknown,letter.msgOrigin);
 expect(complies.allocationRecords?.[letter.msgOrigin]).toMatchObject({allocStatus:'pending',allocRetention:[null,null],allocReceived:[B]});
 expect(complies.forceJoins[reserve]?.joinAllocation).toBe(letter.msgOrigin);
 const after=complies.orderResponses[responseKey(letter.msgOrigin,superiorPerson)]!;
 expect(after).toMatchObject({respDay:before.respDay,respActual:before.respActual,respTerms:before.respTerms,respUndertaking:before.respUndertaking});
 expect(after.respDeclaredReservations).toContainEqual(undeterminedReservation);
 expect(ctx.outbox.find(m=>m.msgTo===P('a_gen')&&m.msgReport?.reportAnswers===g.request.id)?.msgReport?.reportQualification?.statedReservations).toContainEqual(undeterminedReservation);
});

it('0135 a successor cannot keep troops for the predecessor’s unreceived mission',()=>{
 const g=subordinateNeed(), state=ownDefence(g,g.state,donorPerson,donorPost,R('a_mid'),1000), mission=state.planRecords[donorPost]!;
 const prior=P('a_gen'), answer=answerOrder(g.world,state,prior,superiorPerson,goalDirective(g.world.rules.people,mission.planGoal));
 const predecessor=recordResponse(state,responseOf(answer,{order:mission.planOrder,person:prior,post:donorPost,role:'addressee',day:0,kind:'goal'}));
 const successor={...predecessor,planRecords:{...predecessor.planRecords,[donorPost]:{...mission,planResponse:responseKey(mission.planOrder,prior)}}};
 const sent=directSubordinate(g,successor), accepted=acceptSubordinate(g,sent);
 expect(accepted.allocationRecords?.[sent.letter!.msgOrigin]?.allocStatus).toBe('pending');
 expect(accepted.forceJoins[B]).toBeDefined();
});

it('0135 embarked infantry do not make the sole landed regiment surplus',()=>{
 const g=subordinateNeed(), embarked=toId('forceBlock','a_reserve_1'), carrier=toId('forceBlock','fixture_transport');
 const block=g.state.forceBlockStates[embarked]!, location=g.state.forceLocations[embarked]!;
 const state:State={...g.state,forceBlockStates:{...g.state.forceBlockStates,[carrier]:{...block,fbArm:'naval',fbLots:block.fbLots.map(l=>({...l,lotId:l.lotId+'.carrier',lotArm:'naval'}))}},
  forceAssignments:{...g.state.forceAssignments,[carrier]:donorPost},forceLocations:{...g.state.forceLocations,[embarked]:{...location,locAboard:carrier},[carrier]:location}};
 const defended=ownDefence(g,state,donorPerson,donorPost,R('a_mid'),450), sent=directSubordinate(g,defended), accepted=acceptSubordinate(g,sent);
 expect(accepted.allocationRecords?.[sent.letter!.msgOrigin]).toMatchObject({allocStatus:'refused',allocReasons:['retain_for_own_mission'],allocRetention:[0,450]});
 expect(accepted.forceJoins[B]).toBeUndefined();
});

function twoLotOrder(grouped:boolean,limit?:'ceiling'|'guard') {
 const g=subordinateNeed(), reserve=toId('forceBlock','a_reserve_1'), block=g.state.forceBlockStates[B]!, lot={...block.fbLots[0]!,lotMen:600};
 const other={...lot,lotId:`${lot.lotId}.second`};
 const id=g.request.id, request=g.state.forceRequests![id]!, need={...request.freqNeed,needQuantity:2};
 const seat=seatIdFor(superiorPerson), knowledge=g.state.knowledgeBySeat[seat]!;
 let state:State={...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...block,fbLots:grouped?[lot,other]:[lot]},
   ...(grouped?{}:{[reserve]:{...g.state.forceBlockStates[reserve]!,fbLots:[other]}})},
  forceRequests:{...g.state.forceRequests,[id]:{...request,freqNeed:need}},knowledgeBySeat:{...g.state.knowledgeBySeat,[seat]:{...knowledge,
   knownReports:knowledge.knownReports.map(r=>r.knownBody.reportForceRequest===id?{...r,knownBody:{...r.knownBody,reportForceNeed:need}}:r)}}};
 if(limit!==undefined) {
  const grant=state.authorityByPost![superiorPost]![0]!.authorityGrant;
  state=enactMandate(g.world.map,state,{...grant,mandateRevision:grant.mandateRevision+1,
   ...(limit==='ceiling'?{mandateCeiling:{ceilingPost:superiorPost,ceilingMen:1000}}:{mandateGuard:600})},toId('message','limited-sending'),0,'fixture',['assign','onward']);
 }
 return {...g,state};
}

it('0134 sends through a subordinate’s received order when the superior holds no lot',()=>{
 const g=subordinateNeed(), ordered=directSubordinate(g);
 expect(ordered.answer).toMatchObject({fansAction:'order_subordinate',fansTo:donorPost,fansEvidence:g.returnReport.id});
 expect(ordered.state.forceAssignments[B]).toBe(donorPost);
 expect(ordered.state.allocationRecords?.[ordered.letter!.msgOrigin]).toBeUndefined();
 const accepted=acceptSubordinate(g,ordered);
 expect(accepted.orderResponses[responseKey(ordered.letter!.msgOrigin,donorPerson)]?.respPerson).toBe(donorPerson);
 expect(accepted.allocationRecords?.[ordered.letter!.msgOrigin]).toMatchObject({allocStatus:'pending',allocLots:[g.state.forceBlockStates[B]!.fbLots[0]!.lotId],allocReceived:[]});
});

it('0134 a deliberate retention refusal becomes terminal only on reported outcome and material new evidence',()=>{
 const g=subordinateNeed(), objective=R('a_mid'), need=g.request.msgReport!.reportForceNeed!;
 expect(need.needQuantity).toBe(1);
 const state=ownDefence(g,g.state,donorPerson,donorPost,objective,1000);
 const ordered=directSubordinate(g,state), order=ordered.letter!;
 const ctx={...ctxFor(g.world,ordered.state,order.msgArriveDay,TICK_MECHANICS),requestDispatches:[] as (typeof order)[]};
 const accepted=deliverDue(ctx,sendMessages(ordered.state,[order]));
 expect(accepted.allocationRecords?.[order.msgOrigin]).toMatchObject({allocStatus:'refused',allocReasons:['retain_for_own_mission'],allocLots:[]});
 expect(accepted.forceJoins[B]).toBeUndefined();
 expect(accepted.forceAssignments[B]).toBe(donorPost);
 const terminal=ctx.requestDispatches.find(m=>m.msgReport?.reportClaims.some(c=>c.claimToken==='force:subordinate_declined'))!;
 const heard=deliverDue(ctxFor(g.world,accepted,order.msgArriveDay+10,TICK_MECHANICS),accepted);
 const issuerNotice=knowledgeOf(heard,seatIdFor(superiorPerson)).knownReports.find(r=>r.knownBody.reportClaims.some(c=>c.claimToken==='retain_for_own_mission'));
 expect(issuerNotice?.knownBody).toMatchObject({reportAuthor:donorPerson,reportAuthorPost:donorPost,reportAnswers:order.msgOrigin});
 const recipient=seatIdFor(P('a_gen')), receivedDay=order.msgArriveDay+1;
 const known=deliverReport(accepted,recipient,{id:terminal.id,knownBody:terminal.msgReport!,knownReceivedDay:receivedDay,knownRoute:'courier',knownVia:[]},{truthTerms:[],truthTrimmed:[]});
 const freshEstimate={id:toId('message','new-requester-estimate'),knownReceivedDay:receivedDay,knownRoute:'courier' as const,knownVia:[],knownBody:{reportType:'enemy-estimate' as const,reportSubtype:null,reportAuthor:P('a_spy'),reportAuthorPost:POST('a_army'),reportSubjectKind:'region' as const,reportSubjectId:R('b_front'),reportDay:receivedDay,reportHour:null,reportAdvice:null,reportAnswers:null,
  reportClaims:[R('a_cap'),R('a_mid'),R('a_front'),R('b_front'),R('b_mid'),R('b_cap')].map(r=>({claimKind:'enemy-strength' as const,claimRegion:r,claimValue:r===R('b_front')?5000:0,claimToken:null,claimConfidence:1000}))}};
 expect(localOptions(g.world,known,P('a_gen'),receivedDay+1).some(o=>o.kind==='force-request')).toBe(false);
 const undisclosed=deliverReport(accepted,recipient,freshEstimate,{truthTerms:[],truthTrimmed:[]});
 expect(localOptions(g.world,undisclosed,P('a_gen'),receivedDay+1).some(o=>o.kind==='force-request')).toBe(false);
 const changed=deliverReport(known,recipient,freshEstimate,{truthTerms:[],truthTrimmed:[]});
 expect(localOptions(g.world,changed,P('a_gen'),receivedDay+1).find(o=>o.kind==='force-request')?.need.needReason).toBe('lacks_resources');
});

it('0134 cannot order a peer or use a return that reached a different seat',()=>{
 const peer=subordinateNeed(true);
 expect(factionOfPost(peer.world.map,peer.state,donorPost)).toBe(F('a'));
 expect(directSubordinate(peer).letter).toBeUndefined();
 const g=subordinateNeed(), k=seatIdFor(superiorPerson), other=seatIdFor(P('a_lead'));
 const state={...g.state,knowledgeBySeat:{...g.state.knowledgeBySeat,[other]:g.state.knowledgeBySeat[k]!,
  [k]:{...g.state.knowledgeBySeat[k]!,knownReports:g.state.knowledgeBySeat[k]!.knownReports.filter(r=>r.id!==g.returnReport.id)}}};
 expect(directSubordinate(g,state).letter).toBeUndefined();
});

it('0134 returns an order when the reported holding office falls vacant before delivery',()=>{
 const g=subordinateNeed(), ordered=directSubordinate(g), letter=ordered.letter!;
 const state={...ordered.state,postStates:{...ordered.state.postStates,[donorPost]:{...ordered.state.postStates[donorPost]!,postHolder:null}}};
 const ctx={...ctxFor(g.world,state,letter.msgArriveDay,TICK_MECHANICS),requestDispatches:[] as (typeof letter)[]};
 const returned=deliverDue(ctx,sendMessages(state,[letter]));
 expect(returned.allocationRecords?.[letter.msgOrigin]).toMatchObject({allocStatus:'refused',allocReasons:['authority_unavailable'],allocLots:[]});
 expect(returned.orderResponses[responseKey(letter.msgOrigin,donorPerson)]).toBeUndefined();
 expect(returned.forceAssignments[B]).toBe(donorPost);
 const courier=returned.messagesInTransit.find(m=>m.msgReport?.reportClaims.some(c=>c.claimKind==='order-returned'))!;
 expect(courier.msgTo).toBe(superiorPerson);
 expect(ctx.requestDispatches.some(m=>m.msgReport?.reportClaims.some(c=>c.claimToken==='force:subordinate_declined'))).toBe(false);
 const receipt={...ctxFor(g.world,returned,courier.msgArriveDay,TICK_MECHANICS),requestDispatches:[] as (typeof letter)[]};
 deliverDue(receipt,returned);
 expect(receipt.requestDispatches.find(m=>m.msgReport?.reportClaims.some(c=>c.claimToken==='force:subordinate_declined'))?.msgSentDay).toBe(courier.msgArriveDay);
});

it.each(['ceiling','guard'] as const)('0134 observes the combined mandate %s while granting a lawful partial cohort',limit=>{
 const g=twoLotOrder(false,limit), ordered=directSubordinate(g), state=acceptSubordinate(g,ordered), id=ordered.letter!.msgOrigin;
 const row=state.allocationRecords![id]!;
 expect(row).toMatchObject({allocStatus:'pending',allocShortfall:1,allocReasons:['authority_unavailable']});
 expect(row.allocLots).toHaveLength(1);
 expect(row.allocBlocks).toHaveLength(1);
 expect(state.authorityByPost![superiorPost]!.some(a=>a.authorityUses.some(u=>u.useOrder===id&&u.useBlocks.length===1))).toBe(true);
 const block=row.allocBlocks[0]!, arrived={...state,forceLocations:{...state.forceLocations,[block]:{...state.forceLocations[block]!,locRegion:R('a_front')}}};
 const received=receiveAllocations(ctxFor(g.world,arrived,ordered.letter!.msgArriveDay+1,TICK_MECHANICS),arrived);
 expect(received.allocationRecords?.[id]).toMatchObject({allocStatus:'received',allocReceived:[block],allocShortfall:1});
});

it('0134 counts the split portion of a block against the mandate ceiling',()=>{
 const g=twoLotOrder(true,'ceiling'), ordered=directSubordinate(g), state=acceptSubordinate(g,ordered), id=ordered.letter!.msgOrigin;
 const row=state.allocationRecords![id]!;
 expect(row).toMatchObject({allocStatus:'pending',allocShortfall:1});
 const block=row.allocBlocks[0]!;
 expect(block).not.toBe(B);
 expect(state.forceBlockStates[block]?.fbLots).toHaveLength(1);
 expect(state.forceBlockStates[B]?.fbLots).toHaveLength(1);
});

it('0134 rechecks the combined force at receipt when a mandate tightens during the journey',()=>{
 const g=twoLotOrder(false), ordered=directSubordinate(g), marching=acceptSubordinate(g,ordered), letter=ordered.letter!, id=letter.msgOrigin;
 const row=marching.allocationRecords![id]!;
 expect(row.allocBlocks).toHaveLength(2);
 const day=letter.msgArriveDay+1, grant=marching.authorityByPost![superiorPost]![0]!.authorityGrant;
 const limited=enactMandate(g.world.map,marching,{...grant,mandateRevision:grant.mandateRevision+1,mandateCeiling:{ceilingPost:superiorPost,ceilingMen:1000}},
  toId('message','limited-in-transit'),day,'fixture',['assign','onward']);
 const forceLocations={...limited.forceLocations};
 for(const block of row.allocBlocks)forceLocations[block]={...forceLocations[block]!,locRegion:R('a_front')};
 const arrived={...limited,forceLocations};
 const received=receiveAllocations(ctxFor(g.world,arrived,day,TICK_MECHANICS),arrived);
 expect(received.allocationRecords?.[id]).toMatchObject({allocStatus:'received',allocShortfall:1});
 expect(received.allocationRecords?.[id]?.allocReceived).toHaveLength(1);
 expect(row.allocBlocks.map(b=>received.forceAssignments[b])).toContain(donorPost);
});

it('0134 reports two selected regiments sharing a container and counts both if it disappears',()=>{
 const g=twoLotOrder(true), ordered=directSubordinate(g), state=acceptSubordinate(g,ordered), letter=ordered.letter!, id=letter.msgOrigin;
 expect(state.allocationRecords?.[id]?.allocLots).toHaveLength(2);
 expect(state.allocationRecords?.[id]?.allocBlocks).toEqual([B]);
 const day=letter.msgArriveDay+1;
 const arrived={...state,forceLocations:{...state.forceLocations,[B]:{...state.forceLocations[B]!,locRegion:R('a_front')}}};
 const receipt={...ctxFor(g.world,arrived,day,TICK_MECHANICS),requestDispatches:[] as (typeof letter)[]};
 receiveAllocations(receipt,arrived);
 expect(receipt.requestDispatches.flatMap(m=>m.msgReport?.reportClaims??[])).toContainEqual(expect.objectContaining({claimToken:'force:subordinate_received',claimValue:2}));
 const forceBlockStates={...state.forceBlockStates}, forceAssignments={...state.forceAssignments}, forceLocations={...state.forceLocations};
 delete forceBlockStates[B]; delete forceAssignments[B]; delete forceLocations[B];
 const lost={...state,forceBlockStates,forceAssignments,forceLocations};
 const lostCtx={...ctxFor(g.world,lost,day,TICK_MECHANICS),requestDispatches:[] as (typeof letter)[]};
 const closed=receiveAllocations(lostCtx,lost);
 expect(closed.allocationRecords?.[id]).toMatchObject({allocStatus:'shortfall',allocShortfall:2,allocReceived:[]});
 expect(lostCtx.requestDispatches.flatMap(m=>m.msgReport?.reportClaims??[])).toContainEqual(expect.objectContaining({claimToken:'discharged',claimValue:2}));
});

it('0134 sends the reported holder only cohort, quantity and destination before lot choice',()=>{
 const g=subordinateNeed(), ordered=directSubordinate(g);
 const paper=allocationPaper(g.world,ordered.state,ordered.letter?.msgOrder?.orderAllocation??'');
 expect(paper).toMatchObject({from:donorPost,to:POST('a_army'),quantity:1,scope:{kind:'cohort',arm:'infantry',minTermDays:1}});
 const lot=g.state.forceBlockStates[B]!.fbLots[0]!.lotId;
 expect(JSON.stringify(ordered.letter)).not.toContain(lot);
 expect(JSON.stringify(paper)).not.toContain(lot);
 expect(JSON.stringify(ordered.answer?.fansAssignment)).not.toContain(lot);
});

it('0134 completes a subordinate’s order only at receiving-command receipt',()=>{
 const g=subordinateNeed(), ordered=directSubordinate(g), accepted=acceptSubordinate(g,ordered), id=ordered.letter!.msgOrigin;
 const startDay=ordered.letter!.msgArriveDay;
 expect(receiveAllocations(ctxFor(g.world,accepted,startDay+1,TICK_MECHANICS),accepted).allocationRecords?.[id]?.allocStatus).toBe('pending');
 let received=accepted;
 let marched=false;
 for(let day=startDay+1;day<=startDay+20 && received.allocationRecords?.[id]?.allocStatus==='pending';day++) {
  expect(received.forceAssignments[B]).toBe(donorPost);
  received=operationsPhase(ctxFor(g.world,received,day,TICK_MECHANICS),received);
  marched ||= received.forceLocations[B]?.locMarch!=null;
 }
 expect(marched).toBe(true);
 expect(received.forceAssignments[B]).toBe(POST('a_army'));
 expect(received.forceLocations[B]?.locRegion).toBe(R('a_front'));
 expect(received.allocationRecords?.[id]).toMatchObject({allocStatus:'received',allocReceived:[B]});
});

it('0134 keeps one outstanding request for the mission, task and scope while the order travels',()=>{
 const g=subordinateNeed(), ordered=directSubordinate(g);
 expect(ordered.answer?.fansAction).toBe('order_subordinate');
 const known=deliverReport(ordered.state,seatIdFor(P('a_gen')),{id:ordered.report!.id,knownBody:ordered.report!.msgReport!,knownReceivedDay:4,knownRoute:'courier',knownVia:[]},{truthTerms:[],truthTrimmed:[]});
 for(const day of [5,6,7])expect(localOptions(g.world,known,P('a_gen'),day).filter(o=>o.kind==='force-request')).toEqual([]);
 expect(Object.keys(known.forceRequests??{})).toHaveLength(1);
 const transit=sendMessages({...known,stateDay:4},[ordered.letter!]);
 const resumed=decodeSave(encodeSave({worldHash:canonicalHash('fiction'),state:transit})).state as unknown as State;
 const through=Math.max(5,ordered.letter!.msgArriveDay);
 const played=replay(g.world,transit,[],through), restored=replay(g.world,resumed,[],through);
 expect(restored.hashes).toEqual(played.hashes);
 expect(restored.state.allocationRecords?.[ordered.letter!.msgOrigin]).toBeDefined();
 expect(Object.keys(restored.state.forceRequests??{})).toHaveLength(1);
});

it('0134 orders one regiment when the request’s shortfall is undetermined',()=>{
 const g=subordinateNeed(), order=directSubordinate(g);
 expect(g.request.msgReport?.reportForceNeed).toMatchObject({needShortfall:null,needQuantity:1,needReason:'unknown_enemy_bootstrap'});
 expect(allocationPaper(g.world,order.state,order.letter?.msgOrder?.orderAllocation??'')?.quantity).toBe(1);
});
it('E05: exact territorial default versus overlap or partial coarse region',()=>{
 const g=fixture();
 const station=g.world.map.world.rules.serviceStations![0]!;
 const at=(rows:typeof g.world.map.world.rules.serviceStations)=>({...g,world:indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,serviceStations:rows}}),g.world.start)});
 const territorial={...station,kind:'territory' as const};
 expect(receipt(at([territorial])).forceAssignments[B]).toBe(POST('a_reserve'));
 for(const rows of [[territorial,{...territorial,id:'overlap'}],[{...territorial,partial:true}]]) {
  const done=receipt(at(rows));expect(done.forceAssignments[B]).toBe(POST('a_office'));
  expect(Object.values(done.serviceReceipts!)[0]?.receiptReason).toBe('ambiguous_territory');
 }
});
it('E08/E09: a received service root permits receipt; state and special duty stay protected',()=>{
 const g=fixture();
 expect(receipt(g).forceAssignments[B]).toBe(POST('a_reserve'));
 const otherDepartment=toId('department','b_war');
 const state={...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...g.state.forceBlockStates[B]!,fbDepartment:otherDepartment}}};
 expect(Object.values(receipt(g,state).serviceReceipts!)[0]?.receiptReason).toBe('missing_post');
 expect(receipt(g,{...g.state,forceAssignments:{...g.state.forceAssignments,[B]:POST('a_army')}}).forceAssignments[B]).toBe(POST('a_army'));
});
it('F02/F08: request quantity uses the existing planner shortfall, never donor abundance or hidden truth',()=>{
 const g=requesting(), a=ask(g);
 expect(a.option.kind==='force-request'&&a.option.need.needQuantity).toBe(1);
 const donor=g.state.forceBlockStates[B]!;
 const richer={...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...donor,fbLots:[...donor.fbLots,...donor.fbLots.map(l=>({...l,lotId:l.lotId+'.more'}))]}}};
 expect(ask(g,richer).option).toEqual(a.option);
});
it('F03/F04: different call and unreceived generated lineage cannot answer a cohort',()=>{
 const g=requesting(), need=(ask(g).option as Extract<ReturnType<typeof localOptions>[number],{kind:'force-request'}>).need;
 const scoped={...need,needScope:{kind:'cohort' as const,calls:['q'],arm:'infantry',minTermDays:1}};
 const yes=forceAnswer(g.world,g.state,P('a_sec'),POST('a_office'),scoped,mission,3);
 expect(yes.selection?.lots).toHaveLength(1);
 const b=g.state.forceBlockStates[B]!;
 for(const lots of [b.fbLots.map(l=>({...l,lotService:{...l.lotService!,enlCallId:'r'}})),b.fbLots.map(l=>({...l,lotGenerated:true}))]) {
  expect(forceAnswer(g.world,{...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...b,fbLots:lots}}},P('a_sec'),POST('a_office'),scoped,mission,3).selection).toBeNull();
 }
});
it('F05/F06: grants are separate choices; commitment and cross-chain authority restrict them',()=>{
 const g=requesting(), a=ask(g);
 const need=a.message.msgReport!.reportForceNeed!;
 expect(forceAnswer(g.world,a.state,P('a_sec'),POST('a_office'),need,a.message.id,3).selection?.lots).toHaveLength(1);
 const noAuthority={...a.state,authorityByPost:{}};
 expect(forceAnswer(g.world,noAuthority,P('a_sec'),POST('a_office'),need,a.message.id,3).reasons).toContain('authority_unavailable');
 const outside={...a.state,postStates:{...a.state.postStates,[need.needPost]:{...a.state.postStates[need.needPost]!,postParent:POST('b_office')}}};
 expect(forceAnswer(g.world,outside,P('a_sec'),POST('a_office'),need,a.message.id,3).reasons).toContain('authority_unavailable');
});
it('F09: one outstanding request survives an unchanged daily boundary without a new ID',()=>{
 const g=requesting(), a=ask(g);
 expect(localOptions(g.world,a.state,P('a_gen'),4).filter(o=>o.kind==='force-request')).toEqual([]);
 expect(Object.values(a.state.forceRequests!)).toHaveLength(1);
});
it('F10: a fulfilled unknown-enemy bootstrap stops; unrelated roster information cannot restart it',()=>{
 const g=requesting();
 const state={...g.state,forceAssignments:{...g.state.forceAssignments,[B]:POST('a_army')}};
 expect(localOptions(g.world,state,P('a_gen'),3).filter(o=>o.kind==='force-request')).toEqual([]);
});
it('F11: an actual lot reserved by a pending assignment cannot be spent twice',()=>{
 const g=requesting(), need=ask(g).message.msgReport!.reportForceNeed!;
 const j=forceAnswer(g.world,g.state,P('a_sec'),POST('a_office'),need,mission,3);
 expect(j.selection?.lots).toHaveLength(1);
 const row={allocOrder:mission,allocPaper:j.paper.id,allocDay:2,allocSender:P('a_sec'),allocStrongest:true,allocLots:j.selection!.lots,allocBlocks:[B],allocReceived:[],allocShortfall:0,allocReasons:[],allocStatus:'pending' as const};
 const reserved={...g.state,allocationRecords:{[mission]:row}};
 expect(allocationSelection(g.world,reserved,j.paper,3).lots).toEqual([]);
});
it('F14: expiry before receipt must release the selected reservation and never transfer an expired lot',()=>{
 const g=requesting(), a=ask(g), ctx=ctxFor(g.world,a.state,3,TICK_MECHANICS);
 const option=localOptions(g.world,a.state,P('a_sec'),3).find(o=>o.kind==='force-answer')!;
 const answered=executeLocal(ctx,a.state,P('a_sec'),option).state;
 const order=ctx.outbox.find(m=>m.msgOrder?.orderKind==='allocation')!;
 expect(order).toBeDefined();
 let dispatched=arriveAllocation(ctxFor(g.world,answered,4,TICK_MECHANICS),answered,order);
 const record=Object.values(dispatched.allocationRecords!)[0]!;
 expect(record.allocBlocks).toHaveLength(1);
 const block=record.allocBlocks[0]!, b=dispatched.forceBlockStates[block]!;
 dispatched={...dispatched,forceBlockStates:{...dispatched.forceBlockStates,[block]:{...b,fbLots:b.fbLots.map(l=>({...l,lotService:{...l.lotService!,enlEndsDay:5}}))}},forceLocations:{...dispatched.forceLocations,[block]:{...dispatched.forceLocations[block]!,locRegion:R('a_front')}}};
 const end=receiveAllocations(ctxFor(g.world,dispatched,6,TICK_MECHANICS),dispatched);
 expect(end.forceAssignments[block]).toBe(POST('a_office'));
 expect(end.forceJoins[block]).toBeUndefined();
 expect(Object.values(end.allocationRecords!)[0]?.allocReasons).toContain('discharged');
});
it('H01: receipt is one event and identical through save/resume',()=>{
 const g=fixture(), done=receipt(g);
 const resumed=decodeSave(encodeSave({worldHash:canonicalHash('fiction'),state:g.state})).state as unknown as State;
 expect(canonicalHash(receipt(g,resumed))).toBe(canonicalHash(done));
 expect(receipt(g,done)).toEqual(done);
 expect(Object.values(done.serviceReceipts!)).toHaveLength(1);
});

it('F12/F13: losing one pending container preserves and receives the other independently',()=>{
 const g=requesting(), need=ask(g).message.msgReport!.reportForceNeed!;
 const j=forceAnswer(g.world,g.state,P('a_sec'),POST('a_office'),need,mission,3);
 const absent=toId('forceBlock','disbanded');
 const paper={...j.paper,quantity:2};
 const row={allocOrder:mission,allocPaper:paper.id,allocDay:2,allocSender:P('a_sec'),allocStrongest:true,allocLots:[g.state.forceBlockStates[B]!.fbLots[0]!.lotId,'gone'],allocBlocks:[B,absent],allocReceived:[],allocShortfall:0,allocReasons:[],allocStatus:'pending' as const};
 const state:State={...g.state,forceRequests:{[mission]:{freqId:mission,freqNeed:need,freqDay:1,freqTo:POST('a_office'),freqAnswers:[{fansDay:2,fansPerson:P('a_sec'),fansPost:POST('a_office'),fansAction:'partial',fansReasons:[],fansScore:[null,null,null],fansAssignment:assignmentPacket(paper)}]}},allocationRecords:{[mission]:row},forceJoins:{[B]:{joinPost:POST('a_office'),joinRegion:R('a_front'),joinSinceDay:2,joinBlocked:null,joinAllocation:mission}},forceLocations:{...g.state.forceLocations,[B]:{...g.state.forceLocations[B]!,locRegion:R('a_front')}}};
 const done=receiveAllocations(ctxFor(g.world,state,3,TICK_MECHANICS),state);
 expect(done.forceAssignments[B]).toBe(POST('a_army'));
 expect(done.allocationRecords![mission]?.allocReceived).toEqual([B]);
 expect(done.allocationRecords![mission]?.allocShortfall).toBe(1);
});
it('F08 known: whole regiments are the planner shortfall divided by the existing establishment',()=>{
 const g=requesting();
 const state=deliverReport(g.state,seatIdFor(P('a_gen')),{id:toId('message','received-estimate'),knownReceivedDay:0,knownRoute:'courier',knownVia:[],knownBody:{reportType:'enemy-estimate',reportSubtype:null,reportAuthor:P('a_spy'),reportAuthorPost:POST('a_army'),reportSubjectKind:'region',reportSubjectId:R('b_front'),reportDay:0,reportHour:null,reportAdvice:null,reportAnswers:null,
 reportClaims:[R('a_cap'),R('a_mid'),R('a_front'),R('b_front'),R('b_mid'),R('b_cap')].map(r=>({claimKind:'enemy-strength',claimRegion:r,claimValue:r===R('b_front')?5000:0,claimToken:null,claimConfidence:1000}))}},{truthTerms:[],truthTrimmed:[]});
 const o=ask(g,state).option;
 expect(o.kind).toBe('force-request');
 if(o.kind!=='force-request')throw new Error('need');
 expect(o.need.needReason).toBe('lacks_resources');
 const shortfall=o.need.needShortfall, establishment=o.need.needEstablishment;
 expect(shortfall).not.toBeNull();expect(establishment).not.toBeNull();
 expect(o.need.needQuantity).toBe(Math.ceil((shortfall??0)/(establishment??1)));
 expect(o.need.needQuantity).toBeGreaterThan(1);
});

it('F07: an independent governor answers a received request; refusal cannot release his actual lot',()=>{
 const g=requesting(), a=ask(g), need=a.message.msgReport!.reportForceNeed!;
 const governor=POST('a_reserve');
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,recruitment:{...g.world.map.world.rules.recruitment,raisingPostKinds:['army']}}}),g.world.start);
 const donor=toId('forceBlock','a_reserve_1'), b=a.state.forceBlockStates[donor]!;
 const state:State={...a.state,forceBlockStates:{...a.state.forceBlockStates,[donor]:{...b,fbLots:b.fbLots.map(l=>({...l,lotService:{enlPost:governor,enlRaisedBy:P('a_bold'),enlCall:toId('message','volunteer-call'),enlCallId:'q',enlRegiments:1,enlMusterDay:0,enlEndsDay:365}}))}}};
 const j=forceAnswer(world,state,P('a_bold'),governor,need,a.message.id,3);
 expect(j.selection?.lots).toHaveLength(1);
 expect(j.paper.voluntary).toBe(true);
 expect(state.forceAssignments[donor]).toBe(governor);
});

import { playDays, replay } from '../src/log/session.ts';
import { scriptedSeats } from './support/test-seats.ts';
it('H01/H03: own request, separate answer, real journey, receipt and replan survive frozen replay',()=>{
 const g=requesting();
 const m=g.state.planRecords[POST('a_army')]!;
 const state={...g.state,planRecords:{...g.state.planRecords,[POST('a_army')]:{...m,planIssuer:P('a_lead')}},personTrue:{...g.state.personTrue,[P('a_gen')]:{...g.state.personTrue[P('a_gen')]!,trueBoldness:800}}};
 const receipts:State[]=[], log=playDays(g.world,state,scriptedSeats(),40,{freeze:true,deepChecks:true,onDay(r){expect(r.rejections).toEqual([]);if(Object.values(r.state.allocationRecords??{}).some(a=>a.allocReceived.length))receipts.push(r.state);}});
 expect(Object.values(log.state.forceRequests??{}).some(r=>r.freqAnswers.some(a=>a.fansAction==='grant'))).toBe(true);
 expect(receipts.length).toBeGreaterThan(0);
 expect(log.state.forceAssignments[B]).toBe(POST('a_army'));
 expect(log.state.forceBlockStates[B]?.fbLots[0]?.lotId).toBe(g.state.forceBlockStates[B]!.fbLots[0]!.lotId);
 expect(replay(g.world,state,log.log,40).hashes).toEqual(log.hashes);
 expect(Object.values(log.state.battleRecords).length).toBeGreaterThan(0);
});

it('F05 committed: a live guard commitment prevents a support grant',()=>{
 const g=requesting(), need=ask(g).message.msgReport!.reportForceNeed!;
 const free=forceAnswer(g.world,g.state,P('a_sec'),POST('a_office'),need,mission,3);
 expect(free.selection?.lots).toHaveLength(1);
 const guard=setGoal(g.state,POST('a_office'),{id:toId('message','guard'),issuer:P('a_lead'),goal:{...need.needGoal,goalPurpose:undefined,goalPosture:'hold',goalObjective:R('a_cap'),goalCommitted:[B]},viaChain:true,issuedDay:0,response:'fixture'},0);
 const drafted=tick(g.world,guard,[]).state;
 expect(drafted.planRecords[POST('a_office')]?.planDraft).not.toBeNull();
 const retained=forceAnswer(g.world,drafted,P('a_sec'),POST('a_office'),need,mission,3);
 expect(retained.selection).toBeNull();
 expect(retained.reasons).toContain('committed');
});

it('S150 trace: a completed approved operation releases its saved draft’s allocation lock',()=>{
 const g=requesting(), need=ask(g).message.msgReport!.reportForceNeed!;
 const office=POST('a_office'), guard=toId('message','completed-guard');
 const {paper}=forceAnswer(g.world,g.state,P('a_sec'),office,need,mission,3);
 const goal={...need.needGoal,goalPurpose:undefined,goalPosture:'hold' as const,goalObjective:R('a_cap'),goalCommitted:[B]};
 const drafting=setGoal(g.state,office,{id:guard,issuer:P('a_lead'),goal,viaChain:true,issuedDay:0,response:'fixture'},0);
 const choosing=tick(g.world,drafting,[]).state;
 const candidate=choosing.planRecords[office]!.planDraft!.draftCandidates.find(c=>c.candMethod!=='holding')!;
 expect(candidate).toBeDefined();
 const review=choose(choosing,office,candidate.id).state, approved=approve(review,office);
 const reviewed=review.planRecords[office]!;
 const ready=approve({...review,planRecords:{...review.planRecords,[office]:{...reviewed,planGoal:{...reviewed.planGoal,goalAwaitWord:true}}}},office);
 let running=operationsPhase(ctxFor(g.world,approved,2,TICK_MECHANICS),approved);
 expect(Object.values(running.operationRecords).some(o=>o.opOrder===guard&&o.opEndDay===null)).toBe(true);
 for(const retained of [choosing,review,ready,approved,running]) {
  expect(allocationSelection(g.world,retained,paper,3)).toMatchObject({lots:[],reasons:['committed']});
 }
 for(let day=3;day<=12;day++)running=operationsPhase(ctxFor(g.world,running,day,TICK_MECHANICS),running);
 expect(running.planRecords[office]).toMatchObject({planStatus:'approved',planDraft:choosing.planRecords[office]!.planDraft});
 expect(Object.values(running.operationRecords).some(o=>o.opOrder===guard&&o.opEndDay!==null)).toBe(true);
 expect(allocationSelection(g.world,running,paper,13).lots).toHaveLength(1);
});
it('F07 refusal: a refusing governor issues no release and reports his refusal',()=>{
 const g=requesting(), a=ask(g);
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,recruitment:{...g.world.map.world.rules.recruitment,raisingPostKinds:['office']}}}),g.world.start);
 const refusing={...a.state,personGrievances:{...a.state.personGrievances,[P('a_sec')]:[{grievanceKind:'stripped',grievanceWeight:1000,grievanceAgainst:P('a_gen'),grievanceSinceDay:0,grievanceDay:0,grievanceCause:null}]},personRegard:{...a.state.personRegard,[P('a_sec')]:{[P('a_gen')]:-1000}}};
 const ctx=ctxFor(world,refusing,3,TICK_MECHANICS), option=localOptions(world,refusing,P('a_sec'),3).find(o=>o.kind==='force-answer')!;
 const done=executeLocal(ctx,refusing,P('a_sec'),option).state;
 expect(Object.values(done.forceRequests!)[0]?.freqAnswers[0]?.fansAction).toBe('refuse');
 expect(done.forceAssignments[B]).toBe(POST('a_office'));
 expect(ctx.outbox.some(m=>m.msgOrder?.orderKind==='allocation')).toBe(false);
});
it('E01 specified station wins over an unrelated local station and never falls through its own gap',()=>{
 const g=fixture(), original=g.world.map.world.rules.serviceStations![0]!;
 const terms={...g.state.forceJoins[B]!.joinService!,serviceStation:original.id};
 const state={...g.state,forceJoins:{[B]:{...g.state.forceJoins[B]!,joinService:terms}}};
 const other={...original,id:'other',post:POST('a_army')};
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,serviceStations:[original,other]}}),g.world.start);
 expect(receipt({...g,world},state).forceAssignments[B]).toBe(POST('a_reserve'));
 expect(receipt({...g,world},{...state,authorityByPost:{}}).forceAssignments[B]).toBe(POST('a_office'));
});

import { receiveOffers } from '../src/tick/offers.ts';
import { recallOffer } from '../src/tick/offers.ts';
import { receiveOfferedBlocks } from '../src/forces/offers.ts';
it('E06/E07: specified governor offers wait for that receiver, retain recall and record one real receipt',()=>{
 const g=fixture(), id=toId('message','offer');
 const response={respOrder:id,respPerson:P('a_gen'),respPost:POST('a_office'),respRole:'addressee' as const,respKind:'call' as const,respDay:0,respActual:'comply' as const,respDeclared:'comply' as const,respWillingness:1000,respTerms:[],respReasons:[],respStated:[],respConditions:[]};
 const state:State={...g.state,forceJoins:{},neutralOffers:{[id]:{offerCall:id,offerCallId:'q',offerOwner:POST('a_office'),offerGovernor:P('a_sec'),offerIssuer:P('a_lead'),offerReceiver:POST('a_reserve'),offerRegion:R('a_mid'),offerBlocks:[B],offerReceived:[],offerStatus:'offered',offerResponse:response,offerReceiptDays:{}}}};
 const ctx=ctxFor(g.world,state,1,TICK_MECHANICS);
 const received=receiveOffers(ctx,state);
 expect(received.forceAssignments[B]).toBe(POST('a_reserve'));
 expect(receiveOffers(ctx,received)).toBe(received);
 const recalled=recallOffer(ctx,state,seatIdFor(P('a_sec')),id).state;
 expect(receiveOffers(ctx,recalled).forceAssignments[B]).toBe(POST('a_office'));
 const vacant={...state,postStates:{...state.postStates,[POST('a_reserve')]:{...state.postStates[POST('a_reserve')]!,postHolder:null}}};
 expect(receiveOffers(ctx,vacant).forceAssignments[B]).toBe(POST('a_office'));
});
it('E08 transfer receipt: state bodies require the force owners actual national admission first',()=>{
 const g=fixture(), stateDepartment=toId('department','b_war');
 const state={...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...g.state.forceBlockStates[B]!,fbDepartment:stateDepartment}}};
 expect(receipt(g,state).forceAssignments[B]).toBe(POST('a_office'));
 const transferred=receiveOfferedBlocks(state,[B],g.state.postStates[POST('a_reserve')]!.postDepartment);
 expect(receipt(g,transferred).forceAssignments[B]).toBe(POST('a_reserve'));
});
it('E09 naval: local place does not seize a released ship without a naval receiving scope',()=>{
 const g=fixture(), b=g.state.forceBlockStates[B]!;
 const state={...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...b,fbArm:'naval',fbLots:b.fbLots.map(l=>({...l,lotArm:'naval'}))}}};
 expect(receipt(g,state).forceAssignments[B]).toBe(POST('a_office'));
});
it('E production path: a lawful offered arrival without an explicit receiver uses its station, never the raising place',()=>{
 const g=fixture(), id=toId('message','offer-local');
 const response={respOrder:id,respPerson:P('a_sec'),respPost:POST('a_office'),respRole:'addressee' as const,respKind:'call' as const,respDay:0,respActual:'comply' as const,respDeclared:'comply' as const,respWillingness:1000,respTerms:[],respReasons:[],respStated:[],respConditions:[]};
 const state:State={...g.state,neutralOffers:{[id]:{offerCall:id,offerCallId:'q',offerOwner:POST('a_office'),offerGovernor:P('a_sec'),offerIssuer:P('a_sec'),offerRegion:R('a_mid'),offerBlocks:[B],offerReceived:[],offerStatus:'offered',offerResponse:response,offerReceiptDays:{}}}};
 expect(receiveOffers(ctxFor(g.world,state,1,TICK_MECHANICS),state).forceAssignments[B]).toBe(POST('a_reserve'));
 const away={...state,forceLocations:{...state.forceLocations,[B]:{...state.forceLocations[B]!,locRegion:R('a_cap')}}};
 expect(receiveOffers(ctxFor(g.world,away,1,TICK_MECHANICS),away).forceAssignments[B]).toBe(POST('a_office'));
});

it('F02 hidden truth: an unreceived enemy change cannot change a request choice',()=>{
 const g=requesting(), a=ask(g), enemy=toId('forceBlock','b_army_1'), b=g.state.forceBlockStates[enemy]!;
 const state={...g.state,forceBlockStates:{...g.state.forceBlockStates,[enemy]:{...b,fbLots:b.fbLots.map(l=>({...l,lotMen:50000}))}}};
 expect(ask(g,state).option).toEqual(a.option);
});
it('F14 governor offer: an expired service lot cannot be nationally received before recruitment disbands it',()=>{
 const g=fixture(), id=toId('message','expiring-offer'), b=g.state.forceBlockStates[B]!;
 const response={respOrder:id,respPerson:P('a_sec'),respPost:POST('a_office'),respRole:'addressee' as const,respKind:'call' as const,respDay:0,respActual:'comply' as const,respDeclared:'comply' as const,respWillingness:1000,respTerms:[],respReasons:[],respStated:[],respConditions:[]};
 const state:State={...g.state,forceBlockStates:{...g.state.forceBlockStates,[B]:{...b,fbLots:b.fbLots.map(l=>({...l,lotService:{...l.lotService!,enlEndsDay:1}}))}},neutralOffers:{[id]:{offerCall:id,offerCallId:'q',offerOwner:POST('a_office'),offerGovernor:P('a_sec'),offerIssuer:P('a_lead'),offerReceiver:POST('a_reserve'),offerRegion:R('a_mid'),offerBlocks:[B],offerReceived:[],offerStatus:'offered',offerResponse:response,offerReceiptDays:{}}}};
 expect(receiveOffers(ctxFor(g.world,state,1,TICK_MECHANICS),state).forceAssignments[B]).toBe(POST('a_office'));
});

function governorChain(stamped=true) {
 const g=requesting(), a=ask(g), governor=POST('a_reserve'), donor=toId('forceBlock','a_reserve_1');
 const asker=P('a_sec'), beneficiary=P('a_gen');
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,people:g.world.map.world.people.map(p=>p.id===P('a_bold')?{...p,values:['duty','reputation'].map(value=>({value,cites:p.values[0]!.cites}))}:p),rules:{...g.world.map.world.rules,recruitment:{...g.world.map.world.rules.recruitment,raisingPostKinds:['army']}}}),g.world.start);
 const b=a.state.forceBlockStates[donor]!;
 const modeAuthority=[toId('message','superior'),['land']] as const;
 const upstream={fansDay:2,fansPerson:asker,fansPost:POST('a_office'),fansTo:governor,fansAction:'ask_governor' as const,fansReasons:[],fansScore:[null,null,null] as const,...(stamped?{fansModeAuthority:modeAuthority}:{})};
 let state:State={...a.state,forceRequests:{...a.state.forceRequests,[a.message.id]:{...a.state.forceRequests![a.message.id]!,freqAnswers:[upstream]}},forceBlockStates:{...a.state.forceBlockStates,[donor]:{...b,fbLots:b.fbLots.map(l=>({...l,lotGenerated:true,lotService:{enlPost:governor,enlRaisedBy:P('a_bold'),enlCall:toId('message','volunteer-call'),enlCallId:'q',enlRegiments:1,enlMusterDay:0,enlEndsDay:365}}))}}};
 state=deliverReport(state,seatIdFor(P('a_bold')),{id:toId('message','forwarded-force-request'),knownBody:{...a.message.msgReport!,reportAuthor:asker,reportAuthorPost:upstream.fansPost,reportAnswers:a.message.id,...(stamped?{reportForceModeAuthority:modeAuthority}:{})},knownReceivedDay:2,knownRoute:'courier',knownVia:[]},{truthTerms:[],truthTrimmed:[]});
 state={...state,personRegard:{...state.personRegard,[P('a_bold')]:{[asker]:1000}}};
 return {world,state,a,asker,beneficiary,donor,governor};
}
it('F07 governor chain: a voluntary offer carries the original answer and retains its original owner',()=>{
 const {world,state,a,asker,beneficiary,donor,governor}=governorChain();
 const ctx=ctxFor(world,state,3,TICK_MECHANICS), option=localOptions(world,state,P('a_bold'),3).find(o=>o.kind==='force-answer')!;
 const answered=executeLocal(ctx,state,P('a_bold'),option).state, order=ctx.outbox.find(m=>m.msgOrder?.orderKind==='allocation')!;
 const saved=decodeSave(encodeSave({worldHash:canonicalHash('fiction'),state:answered})).state as unknown as State;
 expect(saved.forceRequests?.[a.message.id]?.freqAnswers[1]).toMatchObject({fansAction:'offer',fansIssuer:asker});
 expect(answered.forceAssignments[donor]).toBe(governor);
 expect(order).toBeDefined();
 const original=saved.orderResponses[responseKey(a.message.id,P('a_bold'))]!;
 expect(original.respActual).toBe('comply_with_reservations');
 expect(original.respReservations).toHaveLength(1);
 expect(original.respTerms).toContainEqual({respTermName:'regard',respTermAmount:300});
 const retained=pruneResponses(saved,4,0).state;
 expect(retained.orderResponses[responseKey(a.message.id,P('a_bold'))]).toBe(original);
 const going=arriveAllocation(ctxFor(world,retained,4,TICK_MECHANICS),retained,order);
 expect(going.forceAssignments[donor]).toBe(governor);
 expect(going.forceJoins[donor]?.joinOffer).toBe(order.msgOrigin);
 expect(going.neutralOffers?.[order.msgOrigin]).toMatchObject({offerStatus:'offered',offerIssuer:beneficiary,offerAsker:asker,offerReceiver:POST('a_army')});
 expect(going.neutralOffers?.[order.msgOrigin]?.offerResponse).toBe(original);
 expect(going.neutralOffers?.[order.msgOrigin]?.offerResponse.respUndertaking?.undertakingRequest).toBe(a.message.id);
 expect(going.orderResponses[responseKey(order.msgOrigin,P('a_bold'))]).toBeUndefined();
 expect(going.allocationRecords?.[order.msgOrigin]?.allocStrongest).toBe(true);
 const arrived={...going,forceLocations:{...going.forceLocations,[donor]:{...going.forceLocations[donor]!,locRegion:R('a_front')}}};
 const receipt=ctxFor(world,arrived,5,TICK_MECHANICS), received=receiveOffers(receipt,arrived);
 expect(received.neutralOffers?.[order.msgOrigin]).toMatchObject({offerStatus:'received',offerAsker:asker});
 expect(received.forceAssignments[donor]).toBe(POST('a_army'));
 expect(receipt.outbox.some(m=>m.msgTo===asker&&m.msgReport?.reportAnswers===order.msgOrigin)).toBe(true);
});

it('F07 governor chain: an unstamped ask defers with modes_unavailable and sends no assignment',()=>{
 const {world,state,a,donor,governor}=governorChain(false);
 const ctx=ctxFor(world,state,3,TICK_MECHANICS), option=localOptions(world,state,P('a_bold'),3).find(o=>o.kind==='force-answer')!;
 const answered=executeLocal(ctx,state,P('a_bold'),option).state;
 expect(answered.forceRequests?.[a.message.id]?.freqAnswers[1]).toMatchObject({fansAction:'defer',fansReasons:expect.arrayContaining(['modes_unavailable'])});
 expect(ctx.outbox.filter(m=>m.msgOrder?.orderKind==='allocation')).toEqual([]);
 expect(answered.forceAssignments[donor]).toBe(governor);
 expect(answered.forceJoins[donor]).toBeUndefined();
});

it('S150 asks a governor only on the deciding seat’s received scoped return',()=>{
 const g=requesting(), a=ask(g), governor=POST('a_reserve'), donor=toId('forceBlock','a_reserve_1');
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,recruitment:{...g.world.map.world.rules.recruitment,raisingPostKinds:['army']}}}),g.world.start);
 const block=a.state.forceBlockStates[donor]!;
 const state:State={...a.state,authorityByPost:{},forceBlockStates:{...a.state.forceBlockStates,[donor]:{...block,fbLots:block.fbLots.map(l=>({...l,lotGenerated:true,lotService:{enlPost:governor,enlRaisedBy:P('a_bold'),enlCall:toId('message','volunteer-call'),enlCallId:'q',enlRegiments:1,enlMusterDay:1,enlEndsDay:365}}))}}};
 const reports=ctxFor(world,state,1,TICK_MECHANICS); generateReports(reports,state);
 const paper=reports.outbox.find(m=>m.msgReport?.reportAuthorPost===governor&&m.msgTo===P('a_sec')&&m.msgReport.reportGovernorLots!==undefined)!;
 expect(paper).toBeDefined();
 const received=(to:Parameters<typeof seatIdFor>[0],body=paper.msgReport!,day=2)=>deliverReport(state,seatIdFor(to),{id:paper.id,knownBody:body,knownReceivedDay:day,knownRoute:'courier',knownVia:[]},{truthTerms:[],truthTrimmed:[]});
 const decide=(start:State)=>{
  const ctx=ctxFor(world,start,3,TICK_MECHANICS), option=localOptions(world,start,P('a_sec'),3).find(o=>o.kind==='force-answer')!;
  const done=executeLocal(ctx,start,P('a_sec'),option).state;
  return {answer:done.forceRequests?.[a.message.id]?.freqAnswers[0],forwards:ctx.outbox.filter(m=>m.msgReport?.reportForceNeed)};
 };
 for(const withoutEvidence of [state,received(P('a_lead')),received(P('a_sec'),paper.msgReport!,3),received(P('a_sec'),{...paper.msgReport!,reportGovernorLots:undefined})]) {
  const result=decide(withoutEvidence);
  expect(result.answer?.fansReasons).toContain('governor_holdings_unknown');
  expect(result.forwards).toHaveLength(0);
 }
 const known=received(P('a_sec'));
 const wrongScope=received(P('a_sec'),{...paper.msgReport!,reportGovernorLots:paper.msgReport!.reportGovernorLots!.map(l=>({...l,availArm:'cavalry'}))});
 expect(decide(wrongScope).answer?.fansReasons).toContain('governor_scope_unavailable');
 const result=decide({...known,forceBlockStates:{...known.forceBlockStates,[donor]:{...block,fbLots:[]}}});
 expect(result.answer).toMatchObject({fansAction:'ask_governor',fansTo:governor,fansEvidence:paper.id});
 expect(result.forwards[0]?.msgTo).toBe(P('a_bold'));
});

import { pruneResponses, recordResponse, responseKey, responseOf } from '../src/proxy/responses.ts';
import { answerOrder, goalDirective } from '../src/reading/orders.ts';
it('capture regression: a successor cannot ask on the predecessors received mission or fabricate his own establishment',()=>{
 const g=requesting(), m=g.state.planRecords[POST('a_army')]!;
 const unknown=P('a_spy');
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,people:g.world.map.world.people.map(p=>p.id===unknown?{...p,faction:null,unknowns:[...p.unknowns,'faction']}:p)}),g.world.start);
 const answer=answerOrder(g.world,g.state,P('a_gen'),P('a_sec'),goalDirective(g.world.rules.people,m.planGoal));
 let state=recordResponse(g.state,responseOf(answer,{order:m.planOrder,person:P('a_gen'),post:POST('a_army'),role:'addressee',day:0,kind:'goal'}));
 state={...state,postStates:{...state.postStates,[POST('a_army')]:{...state.postStates[POST('a_army')]!,postHolder:unknown}},planRecords:{...state.planRecords,[POST('a_army')]:{...m,planResponse:`${m.planOrder}|a_gen`}},knowledgeBySeat:{...state.knowledgeBySeat,[seatIdFor(unknown)]:{knownReports:[]}}};
 expect(localOptions(world,state,unknown,1).filter(o=>o.kind==='force-request')).toEqual([]);
});

it('E09 paired release: a naval station with received naval scope receives only after the special assignment is released',()=>{
 const g=fixture(), station={...g.world.map.world.rules.serviceStations![0]!,arms:['naval']};
 const world=indexSeatsWorld(indexWorld({...g.world.map.world,rules:{...g.world.map.world.rules,serviceStations:[station]}}),g.world.start);
 let state=enactMandate(world.map,g.state,{...g.grant,mandateRevision:2,mandateModes:['land','sea']},toId('message','naval-scope'),0,'fixture',['hold','take','assign','onward']);
 const b=state.forceBlockStates[B]!;
 state={...state,forceBlockStates:{...state.forceBlockStates,[B]:{...b,fbArm:'naval',fbLots:b.fbLots.map(l=>({...l,lotArm:'naval'}))}},forceAssignments:{...state.forceAssignments,[B]:POST('a_army')}};
 expect(receipt({...g,world},state).forceAssignments[B]).toBe(POST('a_army'));
 const released={...state,forceAssignments:{...state.forceAssignments,[B]:POST('a_office')}};
 expect(receipt({...g,world},released).forceAssignments[B]).toBe(POST('a_reserve'));
});
it('F10 paired roster: unrelated larger paper does not restart a supportable task',()=>{
 const g=requesting(), own={...g.state,forceAssignments:{...g.state.forceAssignments,[B]:POST('a_army')}};
 const reported=deliverReport(own,seatIdFor(P('a_gen')),{id:toId('message','unrelated-roster'),knownReceivedDay:0,knownRoute:'courier',knownVia:[],knownBody:{reportType:'wire-dispatch',reportSubtype:null,reportAuthor:P('a_sec'),reportAuthorPost:POST('a_office'),reportSubjectKind:'post',reportSubjectId:POST('a_office'),reportDay:0,reportHour:null,reportAdvice:null,reportAnswers:null,reportClaims:[{claimKind:'effective-strength',claimRegion:R('a_cap'),claimToken:'unrelated-roster',claimValue:60000,claimConfidence:1000}]}},{truthTerms:[],truthTrimmed:[]});
 expect(localOptions(g.world,own,P('a_gen'),3).filter(o=>o.kind==='force-request')).toEqual([]);
 expect(localOptions(g.world,reported,P('a_gen'),3).filter(o=>o.kind==='force-request')).toEqual([]);
});

it('F12 paired tasks: delaying the second mission journey cannot delay the first received lot or make the second available',()=>{
 const g=requesting(), need=ask(g).message.msgReport!.reportForceNeed!, second=toId('message','second-mission'), D=toId('forceBlock','a_reserve_1');
 const p1=forceAnswer(g.world,g.state,P('a_sec'),POST('a_office'),need,mission,3).paper;
 const n2={...need,needMission:second,needPost:POST('a_reserve'),needPerson:P('a_bold'),needDestination:R('a_mid')};
 const p2={...p1,id:'second-assignment',to:n2.needPost,destination:n2.needDestination,letter:{...p1.letter,key:'second-assignment'}};
 const row=(id:typeof mission,paper:typeof p1,block:typeof B)=>({allocOrder:id,allocPaper:paper.id,allocDay:2,allocSender:P('a_sec'),allocStrongest:true,allocLots:[g.state.forceBlockStates[block]!.fbLots[0]!.lotId],allocBlocks:[block],allocReceived:[],allocShortfall:0,allocReasons:[],allocStatus:'pending' as const});
 const request=(id:typeof mission,n:typeof need,p:typeof p1)=>({freqId:id,freqNeed:n,freqDay:1,freqTo:POST('a_office'),freqAnswers:[{fansDay:2,fansPerson:P('a_sec'),fansPost:POST('a_office'),fansAction:'grant' as const,fansReasons:[],fansScore:[null,null,null] as const,fansAssignment:assignmentPacket(p)}]});
 let state=setGoal(g.state,n2.needPost,{id:second,issuer:P('a_sec'),goal:n2.needGoal,viaChain:true,issuedDay:0,response:'fixture'},0);
 state={...state,forceRequests:{[mission]:request(mission,need,p1),[second]:request(second,n2,p2)},allocationRecords:{[mission]:row(mission,p1,B),[second]:row(second,p2,D)},forceAssignments:{...state.forceAssignments,[D]:POST('a_office')},forceLocations:{...state.forceLocations,[B]:{...state.forceLocations[B]!,locRegion:R('a_front')},[D]:{...state.forceLocations[D]!,locRegion:R('a_mid')}},forceJoins:{[B]:{joinPost:POST('a_office'),joinRegion:R('a_front'),joinSinceDay:2,joinBlocked:null,joinAllocation:mission},[D]:{joinPost:POST('a_office'),joinRegion:R('a_mid'),joinSinceDay:2,joinBlocked:null,joinAllocation:second}}};
 const complete=receiveAllocations(ctxFor(g.world,state,3,TICK_MECHANICS),state);
 expect(complete.forceAssignments[B]).toBe(need.needPost);expect(complete.forceAssignments[D]).toBe(n2.needPost);
 const delayed={...state,forceLocations:{...state.forceLocations,[D]:{...state.forceLocations[D]!,locRegion:R('a_cap')}}};
 const partial=receiveAllocations(ctxFor(g.world,delayed,3,TICK_MECHANICS),delayed);
 expect(partial.forceAssignments[B]).toBe(need.needPost);expect(partial.forceJoins[B]).toBeUndefined();
 expect(partial.forceAssignments[D]).toBe(POST('a_office'));expect(partial.forceJoins[D]).toBeDefined();
});
