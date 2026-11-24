import { expect, it } from 'vitest';
import { reportedCommandHoldings } from '../src/command/allocation.ts';
import { assignmentPacket, type ForceNeed } from '../src/command/force-requests.ts';
import { enactMandate } from '../src/command/authority.ts';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { reportProblems } from '../src/knowledge/report.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { setGoal } from '../src/plans/plans.ts';
import { responseKey } from '../src/proxy/responses.ts';
import type { State } from '../src/root-state.ts';
import { localOptions } from '../src/seats/local-actions.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { allocationPassage, arriveAllocation, receiveAllocations } from '../src/tick/allocation.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { reportGovernorHoldings } from '../src/tick/force-requests.ts';
import { executeLocal } from '../src/tick/mandates.ts';
import { dispatchOrder } from '../src/tick/orders.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, TICK_MECHANICS } from '../src/tick/tick.ts';
import type { AllocationInstrument } from '../src/world/allocation.ts';
import { indexWorld } from '../src/world/index.ts';
import type { MandateGrant, MandatePaper } from '../src/world/mandates.ts';
import { fixtureMap, fixtureStart, P, POST, R } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';

const requester=P('a_gen'), recipient=POST('a_army'), destination=R('a_front');
const holder=P('a_bold'), sender=POST('a_reserve'), home=R('a_mid');
const principal=P('a_lead'), superior=P('a_sec'), office=POST('a_office');
const requested=toId('message','fictional-request'), mission=toId('message','fictional-mission');
const held=toId('forceBlock','a_reserve_1'), arriving=toId('forceBlock','a_army_1');
const goal={goalObjective:R('b_front'),goalPosture:'take' as const,goalRisk:500,goalDeadlineDays:20,
  goalRail:false,goalRiver:false,goalSea:false,goalNeutral:false,goalCommitted:[],goalAwaitWord:false,goalApproveAsDrafted:false};
const need:ForceNeed={needOrigin:'commander_choice',needMission:mission,needPost:recipient,needPerson:requester,needTask:'take',
  needScope:{kind:'cohort',arm:'infantry',minTermDays:1},needQuantity:1,needShortfall:null,needEstablishment:null,
  needReason:'unknown_enemy_bootstrap',needDestination:destination,needGoal:goal,needEvidence:'fixture evidence'};
const truth={truthTerms:[],truthTrimmed:[]};
const grant:MandateGrant={mandateKey:'fixture-assign',mandateRevision:1,mandateIssuer:principal,mandateIssuerPost:null,
  mandateHolder:superior,mandatePost:office,mandateParent:null,mandateActions:['assign'],mandateRecipients:[office],
  mandateRegions:[home,destination],mandateModes:['land','rail'],mandateCeiling:{ceilingPost:office,ceilingMen:null},
  mandateGuard:null,mandateExpires:null,mandateReports:[],mandateOnward:false,mandateRevoke:false};

function fixture(governor=false,mandates?:readonly MandatePaper[]) {
  const map=fixtureMap({persons:{a_bold:{boldness:'high',candour:'average',regard:'high',values:['duty','reputation']}}});
  const start=fixtureStart();
  const world=indexSeatsWorld(indexWorld({...map.world,vocabularies:{...map.world.vocabularies,
    postKinds:[...map.world.vocabularies.postKinds,{id:'raising_office',name:'kind.raising_office',creatable:'start_only',temporary:false,role:null}]},
    rules:{...map.world.rules,mandates,recruitment:{...map.world.rules.recruitment,raisingPostKinds:['raising_office']}}}),{
    ...start,posts:start.posts.map(p=>p.id===sender&&governor?{...p,kind:'raising_office'}:p),
  });
  let state=setGoal(createState(world,{seed:17}),recipient,{id:mission,issuer:superior,goal,viaChain:true,issuedDay:0,response:'fixture'},0);
  const withService=(block:typeof held,arm='infantry')=>{
    const force=state.forceBlockStates[block]!;
    return {...force,fbLots:force.fbLots.map(lot=>({...lot,lotArm:arm,lotService:{enlPost:sender,enlRaisedBy:holder,
      enlCall:toId('message','fixture-call'),enlCallId:'fixture-call',enlRegiments:1,enlMusterDay:0,enlEndsDay:365}}))};
  };
  state={...state,forceAssignments:{...state.forceAssignments,[arriving]:office},
    forceBlockStates:{...state.forceBlockStates,[held]:withService(held),[arriving]:withService(arriving)},
    personRegard:{...state.personRegard,[holder]:{[superior]:1000,[principal]:1000}}};
  return {world,state};
}

it.each(['receipt','release','mixed exclusions','legacy authority-only receipt'] as const)('a complying order stays outstanding and can be fulfilled on eligible lot %s',change=>{
  const {world,state:initial}=fixture();
  const paper:AllocationInstrument={id:'fixture-send',source:'Fictional sending order',fromDate:'1900-06-01',kind:'assignment',
    issuer:superior,issuerPost:office,mandate:grant.mandateKey,from:sender,to:recipient,destination,recipient:holder,
    scope:need.needScope,quantity:1,words:'Send one regiment',letter:{namespace:'force-choice',key:'fixture-send',revision:1},
    modes:grant.mandateModes,subordinateOrder:true};
  const answer={fansDay:0,fansPerson:superior,fansPost:office,fansAction:'order_subordinate' as const,
    fansReasons:[],fansScore:[null,null,null] as const,fansAssignment:assignmentPacket(paper)};
  const mixed=change==='mixed exclusions';
  const legacyAuthority=change==='legacy authority-only receipt';
  const preOrder:State={...initial,forceRequests:{[requested]:{freqId:requested,freqNeed:need,freqDay:0,freqTo:office,freqAnswers:[answer]}},
    ...(mixed?{forceAssignments:{...initial.forceAssignments,[arriving]:sender},
      forceLocations:{...initial.forceLocations,[arriving]:{...initial.forceLocations[arriving]!,locRegion:R('a_cap')}}}:{}),
    ...(legacyAuthority?{forceLocations:{...initial.forceLocations,[held]:{...initial.forceLocations[held]!,locRegion:R('a_cap')}}}:{}),
    forceJoins:legacyAuthority?{}:{[held]:{joinPost:sender,joinRegion:home,joinSinceDay:0,joinBlocked:null,
      ...(change==='receipt'?{joinService:{serviceOrder:toId('message','unready'),servicePurpose:'transit' as const}}:{})}}};
  const state=enactMandate(world.map,preOrder,grant,toId('message','fixture-grant'),0,'comply',['assign']);
  const dispatch=ctxFor(world,state,0,TICK_MECHANICS);
  dispatchOrder(dispatch,state,seatIdFor(superior),superior,sender,'courier',false,{orderKind:'allocation',orderAllocation:paper.id,
    orderLetter:paper.letter,orderGoal:null,orderEdit:null,orderCall:null});
  const order=dispatch.outbox.find(m=>m.msgOrder?.orderKind==='allocation')!;
  const receipt=ctxFor(world,state,order.msgArriveDay,TICK_MECHANICS), accepted=arriveAllocation(receipt,state,order);
  const {allocWaitForLots:_,...archived}=accepted.allocationRecords![order.msgOrigin]!;
  const deferred:State=legacyAuthority?{...accepted,allocationRecords:{[order.msgOrigin]:archived}}:accepted;
  expect(deferred.allocationRecords?.[order.msgOrigin]).toMatchObject({allocStatus:'deferred',allocLots:[]});
  if(mixed)expect(deferred.allocationRecords?.[order.msgOrigin]?.allocReasons).toEqual(['authority_unavailable','in_transit']);
  if(legacyAuthority)expect(archived.allocReasons).toEqual(['authority_unavailable']);
  const reply=deferred.orderResponses[responseKey(order.msgOrigin,holder)]!;
  expect(['comply','comply_with_reservations','exceed']).toContain(reply.respActual);
  const notice=receipt.outbox.find(m=>m.msgTo===requester&&m.msgReport?.reportAnswers===requested)!;
  expect(notice.msgReport!.reportClaims.map(c=>c.claimToken)).toContain('force:subordinate_deferred');
  const heard=deliverReport(deferred,seatIdFor(requester),{id:notice.id,knownBody:notice.msgReport!,knownReceivedDay:order.msgArriveDay,
    knownRoute:'courier',knownVia:[]},truth);
  const legacy=deliverReport(deferred,seatIdFor(requester),{id:notice.id,knownBody:{...notice.msgReport!,reportClaims:
    notice.msgReport!.reportClaims.map(c=>c.claimToken==='force:subordinate_deferred'?{...c,claimToken:'force:subordinate_declined'}:c)},
    knownReceivedDay:order.msgArriveDay,knownRoute:'courier',knownVia:[]},truth);
  const day=order.msgArriveDay+1;
  const refused={...legacy,allocationRecords:{[order.msgOrigin]:{...archived,allocStatus:'refused' as const}}};
  if(legacyAuthority)expect(localOptions(world,refused,requester,day).some(o=>o.kind==='force-request')).toBe(true);
  expect(localOptions(world,heard,holder,day).some(o=>o.kind==='allocation-fulfil')).toBe(false);
  expect(localOptions(world,heard,requester,day).some(o=>o.kind==='force-request')).toBe(false);
  expect(localOptions(world,legacy,requester,day).some(o=>o.kind==='force-request')).toBe(false);
  let before={...legacy,stateDay:order.msgArriveDay};
  if(change==='receipt'||legacyAuthority) {
    const unchanged=tick(world,before,[],{deepChecks:true}).state;
    expect(localOptions(world,unchanged,holder,day+1).some(o=>o.kind==='allocation-fulfil')).toBe(false);
    before=enactMandate(world.map,before,{...grant,mandateKey:'station',mandateHolder:holder,mandatePost:sender},
      toId('message','fixture-station-grant'),0,'comply',['assign']);
    before={...before,forceLocations:{...before.forceLocations,[arriving]:{...before.forceLocations[arriving]!,locRegion:home}},
      forceJoins:{...before.forceJoins,[arriving]:{joinPost:office,joinRegion:home,joinSinceDay:0,joinBlocked:null,
        joinService:{serviceOrder:toId('message','received-reinforcement'),servicePurpose:'service',serviceReceiver:sender}}}};
  }
  const changed=tick(world,before,[],{deepChecks:true}).state;
  if(legacyAuthority) {
    const afterRefusal=tick(world,{...before,allocationRecords:refused.allocationRecords},[],{deepChecks:true}).state;
    expect(localOptions(world,afterRefusal,holder,day+1).some(o=>o.kind==='allocation-fulfil')).toBe(false);
  }
  const resumed=decodeSave(encodeSave({worldHash:canonicalHash('fiction'),state:changed})).state as unknown as State;
  const option=localOptions(world,resumed,holder,day+1).find(o=>o.kind==='allocation-fulfil');
  expect(option).toBeDefined();
  const fulfil=ctxFor(world,resumed,day+1,TICK_MECHANICS), sent=executeLocal(fulfil,resumed,holder,option!).state;
  const selected=change==='receipt'||legacyAuthority?arriving:held;
  expect(sent.allocationRecords?.[order.msgOrigin]).toMatchObject({allocStatus:'pending',allocBlocks:[selected]});
  expect(sent.orderResponses[responseKey(order.msgOrigin,holder)]).toMatchObject({respDay:reply.respDay,respActual:reply.respActual});
  expect(localOptions(world,sent,holder,day+2).some(o=>o.kind==='allocation-fulfil')).toBe(false);
  expect(localOptions(world,sent,requester,day+2).some(o=>o.kind==='force-request')).toBe(false);
  const localArrival={...sent,forceLocations:{...sent.forceLocations,[selected]:{...sent.forceLocations[selected]!,locRegion:destination}}};
  const delivered=receiveAllocations(ctxFor(world,localArrival,day+2,TICK_MECHANICS),localArrival);
  expect(delivered.forceAssignments[selected]).toBe(recipient);
  expect(delivered.allocationRecords?.[order.msgOrigin]?.allocStatus).toBe('received');
});

it.each(['declared','conveyed','empty','missing','forged','missing with no lot','missing with objection'] as const)('a governor sending paper uses the received principal request with %s modes',kind=>{
  const missing=kind.startsWith('missing');
  const principalRoot:MandatePaper={id:'principals-declared-grant',source:'Fictional office instrument',fromDate:'1900-06-01',
    grant:{...grant,mandateHolder:kind==='conveyed'?superior:principal,mandateModes:kind==='empty'?[]:['rail','river']}};
  const {world,state:initial}=fixture(true,missing?undefined:[principalRoot]);
  let state:State={...initial,postStates:{...initial.postStates,[office]:{...initial.postStates[office]!,postHolder:principal}},
    forceAssignments:{...initial.forceAssignments,[arriving]:POST('a_filter')},
    personRegard:{...initial.personRegard,[principal]:{[requester]:1000}},
    forceRequests:{[requested]:{freqId:requested,freqNeed:need,freqDay:0,freqTo:office,freqAnswers:[]}}};
  // The holder's own grant declares a different mode. Only the received asking authority counts.
  state=enactMandate(world.map,state,{...grant,mandateKey:'holder-assignment',mandatePost:sender,mandateHolder:holder,
    mandateModes:['land']},toId('message','holders-own-grant'),0,'comply',['assign']);
  if(!missing&&kind!=='conveyed')state=enactMandate(world.map,state,principalRoot.grant,toId('message',principalRoot.id),0,'comply',['assign']);
  state=deliverReport(state,seatIdFor(principal),{id:requested,knownReceivedDay:1,knownRoute:'courier',knownVia:[],
    knownBody:{reportType:'wire-dispatch',reportSubtype:null,reportAuthor:requester,reportAuthorPost:recipient,reportSubjectKind:'post',
      reportSubjectId:recipient,reportDay:1,reportHour:null,reportAdvice:null,reportAnswers:mission,reportClaims:[],
      reportForceNeed:need,reportForceRequest:requested}},truth);
  const returns=ctxFor(world,state,0,TICK_MECHANICS);
  reportGovernorHoldings(returns,state,sender,'strength-return');
  const holdings=returns.outbox.find(m=>m.msgReport?.reportGovernorLots!==undefined)!;
  state=deliverReport(state,seatIdFor(principal),{id:holdings.id,knownBody:holdings.msgReport!,knownReceivedDay:1,knownRoute:'courier',knownVia:[]},truth);
  const asking=ctxFor(world,state,2,TICK_MECHANICS), ask=localOptions(world,state,principal,2).find(o=>o.kind==='force-answer')!;
  const asked=executeLocal(asking,state,principal,ask).state;
  const sent=asking.outbox.find(m=>m.msgTo===holder&&m.msgReport?.reportForceRequest===requested)!;
  const authority=[`root-modes.${principal}`,['rail','river']];
  expect(sent.msgReport!.reportForceModeAuthority).toEqual(missing||kind==='empty'?null:authority);
  expect(reportProblems(sent.msgReport!)).toEqual([]);
  const received=kind==='forged'?{...sent,msgReport:{...sent.msgReport!,reportForceModeAuthority:[toId('message',principalRoot.id),['sea']] as const}}:sent;
  // A governor cannot discover later permissions in the asking office's unreceived State.
  const revised=enactMandate(world.map,asked,{...principalRoot.grant,mandateRevision:2,mandateModes:['sea']},
    toId('message','later-revision'),sent.msgArriveDay,'comply',['assign']);
  state=deliverDue(ctxFor(world,revised,sent.msgArriveDay,TICK_MECHANICS),sendMessages(revised,[received]));
  if(kind==='missing with no lot')state={...state,forceAssignments:{...state.forceAssignments,[held]:POST('a_filter')}};
  if(kind==='missing with objection')state={...state,personRegard:{...state.personRegard,[holder]:{[principal]:-1000}},
    personGrievances:{...state.personGrievances,[holder]:[{grievanceKind:'stripped',grievanceWeight:1000,grievanceAgainst:principal,
      grievanceSinceDay:0,grievanceDay:0,grievanceCause:null}]}};
  const day=sent.msgArriveDay+1;
  const ctx=ctxFor(world,state,day,TICK_MECHANICS), option=localOptions(world,state,holder,day).find(o=>o.kind==='force-answer')!;
  const answered=executeLocal(ctx,state,holder,option).state, answer=answered.forceRequests?.[requested]?.freqAnswers.at(-1);
  const order=ctx.outbox.find(m=>m.msgOrder?.orderKind==='allocation');
  if(kind!=='declared'&&kind!=='conveyed') {
    const action=kind==='missing with objection'?'refuse':kind==='missing with no lot'?'no_eligible_force':'defer';
    expect(answer).toMatchObject({fansAction:action,fansReasons:expect.arrayContaining(['modes_unavailable'])});
    expect(answer?.fansAssignment).toBeUndefined();
    expect(order).toBeUndefined();
    expect(ctx.outbox.find(m=>m.msgTo===requester)?.msgReport?.reportClaims.some(c=>c.claimToken==='modes_unavailable')).toBe(true);
    return;
  }
  expect(answer).toMatchObject({fansAction:'offer',fansIssuer:principal,fansModeAuthority:authority});
  expect(answer?.fansAssignment?.[9]).toEqual(['rail','river']);
  expect(answer?.fansAssignment?.[1]).toBe(holder);
  const delivery=ctxFor(world,answered,order!.msgArriveDay,TICK_MECHANICS), sending=arriveAllocation(delivery,answered,order!);
  expect(sending.forceAssignments[held]).toBe(sender);
  const allows=allocationPassage(delivery,sending,held,order!.msgOrigin)!;
  const leg={from:home,to:destination} as Parameters<typeof allows>[0];
  expect(allows({...leg,type:'rail'})).toBe(true);
  expect(allows({...leg,type:'river'})).toBe(true);
  expect(allows({...leg,type:'road'})).toBe(false);
});

it.each(['wrong destination','no eligible lot','empty modes'] as const)('a direct grant uses the valid later authority when the first grant has %s',obstacle=>{
  const {world,state:initial}=fixture();
  let state:State={...initial,forceRequests:{[requested]:{freqId:requested,freqNeed:need,freqDay:0,freqTo:office,freqAnswers:[]}},
    forceLocations:{...initial.forceLocations,[arriving]:{...initial.forceLocations[arriving]!,locRegion:home}}};
  const blocked={...grant,mandateKey:'a-first',mandateModes:obstacle==='empty modes'?[]:grant.mandateModes,
    mandateRegions:obstacle==='wrong destination'?[home]:obstacle==='no eligible lot'?[destination]:grant.mandateRegions};
  const valid={...grant,mandateKey:'b-valid',mandateModes:['rail'] as const};
  for(const mandate of [valid,blocked])state=enactMandate(world.map,state,mandate,toId('message',mandate.mandateKey),0,'comply',['assign']);
  state=deliverReport(state,seatIdFor(superior),{id:requested,knownReceivedDay:1,knownRoute:'courier',knownVia:[],
    knownBody:{reportType:'wire-dispatch',reportSubtype:null,reportAuthor:requester,reportAuthorPost:recipient,reportSubjectKind:'post',
      reportSubjectId:recipient,reportDay:1,reportHour:null,reportAdvice:null,reportAnswers:mission,reportClaims:[],
      reportForceNeed:need,reportForceRequest:requested}},truth);
  const ctx=ctxFor(world,state,2,TICK_MECHANICS), option=localOptions(world,state,superior,2).find(o=>o.kind==='force-answer')!;
  const answered=executeLocal(ctx,state,superior,option), answer=answered.state.forceRequests?.[requested]?.freqAnswers[0];
  expect(answer?.fansAction).toBe('grant');
  expect(answer?.fansAssignment?.slice(8,10)).toEqual([valid.mandateKey,valid.mandateModes]);
  expect(ctx.outbox.some(m=>m.msgOrder?.orderKind==='allocation')).toBe(true);
});

it.each(['direct','subordinate'] as const)('a %s sending with an empty assign mandate records the modes gap',kind=>{
  const {world,state:initial}=fixture();
  for(const modes of [['land'],[]] as const) {
    let state:State={...initial,forceRequests:{[requested]:{freqId:requested,freqNeed:need,freqDay:0,freqTo:office,freqAnswers:[]}},
      forceAssignments:{...initial.forceAssignments,[arriving]:kind==='direct'?office:POST('a_filter')},
      forceLocations:{...initial.forceLocations,[arriving]:{...initial.forceLocations[arriving]!,locRegion:home}}};
    state=enactMandate(world.map,state,{...grant,mandateModes:modes},toId('message','fixture-grant'),0,'comply',['assign']);
    state=deliverReport(state,seatIdFor(superior),{id:requested,knownReceivedDay:1,knownRoute:'courier',knownVia:[],
      knownBody:{reportType:'wire-dispatch',reportSubtype:null,reportAuthor:requester,reportAuthorPost:recipient,reportSubjectKind:'post',
        reportSubjectId:recipient,reportDay:1,reportHour:null,reportAdvice:null,reportAnswers:mission,reportClaims:[],
        reportForceNeed:need,reportForceRequest:requested}},truth);
    if(kind==='subordinate')state=deliverReport(state,seatIdFor(superior),{id:toId('message','subordinate-return'),knownReceivedDay:1,knownRoute:'courier',knownVia:[],
      knownBody:{reportType:'strength-return',reportSubtype:null,reportAuthor:holder,reportAuthorPost:sender,reportSubjectKind:'post',
        reportSubjectId:sender,reportDay:1,reportHour:null,reportAdvice:null,reportAnswers:null,reportClaims:[],
        reportCommandLots:reportedCommandHoldings(state,sender,[held],1)}},truth);
    const ctx=ctxFor(world,state,2,TICK_MECHANICS), option=localOptions(world,state,superior,2).find(o=>o.kind==='force-answer')!;
    const answered=executeLocal(ctx,state,superior,option), answer=answered.state.forceRequests?.[requested]?.freqAnswers[0];
    expect(answered.reason).toBeNull();
    const order=ctx.outbox.find(m=>m.msgOrder?.orderKind==='allocation');
    if(modes.length) {
      expect(answer?.fansAction).toBe(kind==='direct'?'grant':'order_subordinate');
      expect(answer?.fansAssignment?.[9]).toEqual(modes);
      expect(order).toBeDefined();
    } else {
      expect(answer).toMatchObject({fansAction:'defer',fansReasons:expect.arrayContaining(['modes_unavailable'])});
      expect(answer?.fansAssignment).toBeUndefined();
      expect(order).toBeUndefined();
    }
  }
});
