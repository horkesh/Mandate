import { refreshGoalForces } from '../plans/plans.ts';
import { allCommandedBlocks } from '../command/command.ts';
import { putOffer } from '../command/offers.ts';
import { orderOfferJoins } from '../movement/join.ts';
import { allocationPaper, forceAssignmentFor, reserveUndeterminedRetention, retentionReservations } from '../command/force-requests.ts';
import type { RetentionShortfalls } from '../command/force-requests.ts';
import { serviceReceipt } from '../command/service-receipt.ts';
import { allocationAuthority, allocationSelection, governorUndertaking, lotDeferredAllocation, outstandingAllocation, priorAllocations, putAllocation, type AllocationReason, type AllocationRecord } from '../command/allocation.ts';
import { regroupAssignments } from '../command/organisation.ts';
import { authorityFamily, commitAuthority, mandateAt } from '../command/authority.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, PersonId, PostId, SeatId } from '../ids.ts';
import { toId } from '../ids.ts';
import type { AllocationCommand } from '../log/commands.ts';
import type { TransitMessage } from '../messages/transit.ts';
import { endJoins, orderAllocationJoins } from '../movement/join.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { answerOrder, verbDirective } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import { availableAllocations } from '../seats/allocation.ts';
import { forceRetention } from '../seats/force-requests.ts';
import type { EdgeLeg } from '../supply/supply.ts';
import { canonicalHash } from '../serialize/hash.ts';
import { letterKey } from '../world/letters.ts';
import type { AllocationInstrument } from '../world/allocation.ts';
import { acknowledge, answerBody, dispatchOrder } from './orders.ts';
import { reportQualificationOf, type ReportBody } from '../knowledge/report.ts';
import { oversightOf, sendReport, whereIs, type RejectionReason, type TickContext } from './context.ts';
import { repartition } from './organisation.ts';

function governorRequestAnswer(state:State, paper:string, governor:PersonId) {
  const link=forceAssignmentFor(state,paper);
  if(link?.answer.fansPerson!==governor)return undefined;
  return {asker:link.answer.fansIssuer,response:state.orderResponses[responseKey(link.request.freqId,governor)]};
}

function allocatedLots(state:State,row:AllocationRecord,blocks:readonly ForceBlockId[]):string[] {
  const selected=new Set(row.allocLots);
  return [...new Set(blocks.flatMap(b=>row.allocBlockLots?.[b]??state.forceBlockStates[b]?.fbLots.filter(l=>selected.has(l.lotId)).map(l=>l.lotId)??[]))];
}

function lostAllocationLots(state:State,row:AllocationRecord,lostBlocks:readonly ForceBlockId[]):string[] {
  const lost=new Set(allocatedLots(state,row,lostBlocks));
  const alreadyLost=new Set(row.allocLostLots??[]);
  if(lostBlocks.some(b=>row.allocBlockLots?.[b]===undefined&&state.forceBlockStates[b]===undefined)) {
    // Old records may name a removed block only in their flat list. Reconcile known IDs without assigning a count per container.
    const knownLive=new Set(Object.values(state.forceBlockStates).flatMap(b=>b.fbLots.map(l=>l.lotId)));
    for(const lot of row.allocLots)if(!knownLive.has(lot)&&!alreadyLost.has(lot))lost.add(lot);
  }
  return [...lost].filter(id=>!alreadyLost.has(id));
}

function reportSubordinateOutcome(ctx:TickContext,state:State,paper:AllocationInstrument,row:AllocationRecord,author:PersonId,received:boolean,authorPost=received?paper.to:paper.from):void {
  if(paper.subordinateOrder!==true)return;
  const link=forceAssignmentFor(state,paper.id);
  if(link===undefined)return;
  const {freqId,freqNeed}=link.request;
  const quantity=received?allocatedLots(state,row,row.allocReceived).length:0;
  const deferred=lotDeferredAllocation(state,row);
  const reportClaims=[{claimKind:received?'arrived' as const:'allocation-selected' as const,claimRegion:paper.destination,claimValue:quantity,
    claimToken:received?'force:subordinate_received':deferred?'force:subordinate_deferred':'force:subordinate_declined',claimConfidence:1000},
    ...row.allocReasons.map(reason=>({claimKind:'allocation-shortfall' as const,claimRegion:paper.destination,claimValue:row.allocShortfall,claimToken:reason,claimConfidence:1000}))];
  const report=(answers:MessageId,about:PostId)=>answerBody(author,authorPost,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers,about,reportClaims});
  sendReport(ctx,state,{body:report(freqId,paper.to),truth:{truthTerms:[],truthTrimmed:[]},to:freqNeed.needPerson,
    tag:deferred?`subordinate-deferred.${freqId}`:`subordinate-result.${freqId}`});
  if(!received&&author!==paper.issuer)sendReport(ctx,state,{body:report(row.allocOrder,paper.from),truth:{truthTerms:[],truthTrimmed:[]},to:paper.issuer,tag:`subordinate-answer.${row.allocOrder}`});
}

function reportSendingReservation(ctx:TickContext,state:State,paper:AllocationInstrument,row:AllocationRecord,qualification:Pick<ReportBody,'reportQualification'>):void {
  const request=forceAssignmentFor(state,paper.id)?.request;
  if(request===undefined)return;
  sendReport(ctx,state,{body:answerBody(row.allocSender,paper.from,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,
    answers:request.freqId,about:paper.to,...qualification,
    reportClaims:[{claimKind:'allocation-selected',claimRegion:paper.destination,claimValue:row.allocLots.length,
      claimToken:paper.subordinateOrder===true?'force:subordinate_sending':'force:grant_sending',claimConfidence:1000}]}),
    truth:{truthTerms:[],truthTrimmed:[]},to:request.freqNeed.needPerson,
    tag:paper.subordinateOrder===true?`subordinate-reservation.${request.freqId}`:`direct-reservation.${request.freqId}`});
}

function directRequestOf(state:State,paper:AllocationInstrument) {
  return paper.issuerPost===paper.from&&paper.voluntary!==true?forceAssignmentFor(state,paper.id)?.request:undefined;
}

function reportDirectRetention(ctx:TickContext,state:State,paper:AllocationInstrument,row:AllocationRecord):void {
  const request=directRequestOf(state,paper);
  if(request===undefined)return;
  sendReport(ctx,state,{body:answerBody(row.allocSender,paper.from,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,
    answers:request.freqId,about:paper.to,reportClaims:[{claimKind:'allocation-selected',claimRegion:paper.destination,claimValue:0,claimToken:'force:grant_retained',claimConfidence:1000},
      {claimKind:'allocation-shortfall',claimRegion:paper.destination,
      claimValue:row.allocShortfall,claimToken:'retain_for_own_mission',claimConfidence:1000}]}),
    truth:{truthTerms:[],truthTrimmed:[]},to:request.freqNeed.needPerson,tag:`direct-retention.${request.freqId}`});
}

function allocationRecord(day:number,paper:AllocationInstrument,order:MessageId,sender:PersonId):AllocationRecord {
  const shortfall=paper.quantity==='all'?(paper.scope.kind==='named'?paper.scope.regiments.length:0):paper.quantity;
  return {allocOrder:order,allocPaper:paper.id,allocDay:day,allocSender:sender,allocStrongest:true,
    allocLots:[],allocBlocks:[],allocReceived:[],allocShortfall:shortfall,allocReasons:[],allocStatus:'refused'};
}

export function returnSubordinateAllocation(ctx:TickContext,state:State,msg:TransitMessage,reason:'authority_unavailable'|'refused'):State {
  if(msg.msgOrder?.orderKind!=='allocation'||state.allocationRecords?.[msg.msgOrigin]!==undefined)return state;
  const paper=allocationPaper(ctx.world,state,msg.msgOrder.orderAllocation??'');
  if(paper?.subordinateOrder!==true||paper.recipient===undefined||paper.issuerPost===null)return state;
  return putAllocation(state,{...allocationRecord(ctx.day,paper,msg.msgOrigin,paper.recipient),allocReasons:[reason]});
}

/** A superior forwards a failed order only after its return or relay objection reaches him. */
export function reportSubordinateReturn(ctx:TickContext,state:State,msg:TransitMessage):void {
  const body=msg.msgReport;
  if(body?.reportAnswers==null||!body.reportClaims.some(c=>c.claimKind==='order-returned'||c.claimKind==='order-objected'))return;
  const row=state.allocationRecords?.[body.reportAnswers];
  if(row?.allocStatus!=='refused')return;
  const paper=allocationPaper(ctx.world,state,row.allocPaper);
  if(paper?.subordinateOrder===true&&paper.issuer===msg.msgTo&&paper.issuerPost!==null) {
    reportSubordinateOutcome(ctx,state,paper,row,paper.issuer,false,paper.issuerPost);
  }
}

export function issueAllocation(ctx: TickContext, state: State, seat: SeatId, cmd: AllocationCommand): RejectionReason|null {
  const person=state.seatAssignments[seat]?.seatPerson;
  if(person===undefined)return 'unknown_seat';
  const p=availableAllocations(ctx.world,state,person,ctx.day).find(p=>p.id===cmd.paper);
  if(!p || !allocationAuthority(ctx.world,state,p,ctx.day))return 'bad_selection';
  if([...state.messagesInTransit,...ctx.outbox].some(m=>m.msgOrder?.orderLetter && letterKey(m.msgOrder.orderLetter)===letterKey(p.letter)))return 'duplicate_choice';
  dispatchOrder(ctx,state,seat,person,p.from,cmd.route,false,{orderKind:'allocation',orderAllocation:p.id,
    orderLetter:p.letter,orderGoal:null,orderEdit:null,orderCall:null},p.from,p.recipient===undefined);
  return null;
}
export function arriveAllocation(ctx: TickContext, start: State, msg: TransitMessage): State {
  const p=allocationPaper(ctx.world,start,msg.msgOrder?.orderAllocation??'');
  if(!p || msg.msgOrder?.orderIssuer!==p.issuer || msg.msgToPost!==p.from || msg.msgOrder.orderLetter===undefined ||
    letterKey(msg.msgOrder.orderLetter)!==letterKey(p.letter))return start;
  if(start.allocationRecords?.[msg.msgOrigin])return start;
  const base=allocationRecord(ctx.day,p,msg.msgOrigin,msg.msgTo);
  const decline=(state:State,reasons:readonly AllocationReason[],status:AllocationRecord['allocStatus']='refused',retention?:RetentionShortfalls,strongest?:boolean)=>{
    const row={...base,allocReasons:reasons,allocStatus:status,...(retention===undefined?{}:{allocRetention:retention}),
      ...(strongest===undefined?{}:{allocStrongest:strongest}),...(strongest===true?{allocWaitForLots:true as const}:{})};
    reportSubordinateOutcome(ctx,state,p,row,msg.msgTo,false);
    if(retention!==undefined)reportDirectRetention(ctx,state,p,row);
    return putAllocation(state,row);
  };
  if(p.recipient!==undefined && p.recipient!==msg.msgTo || !allocationAuthority(ctx.world,start,p,ctx.day)) {
    acknowledge(ctx,start,msg,'authority_unavailable',false);
    return decline(start,['authority_unavailable']);
  }
  // A governor's own sending order carries an undertaking already made to the requesting authority.
  const answer=p.voluntary===true?undefined:answerOrder(ctx.world,start,msg.msgTo,p.issuer,verbDirective(ctx.world.rules.people,'transfer'),{oversight:oversightOf(ctx,start,msg.msgTo,p.issuer).value});
  const response=answer===undefined?governorRequestAnswer(start,p.id,msg.msgTo)?.response:
    responseOf(answer,{order:msg.msgOrigin,person:msg.msgTo,post:p.from,role:'addressee',day:ctx.day,kind:'allocation'});
  if(response===undefined) {
    acknowledge(ctx,start,msg,'authority_unavailable',false);
    return decline(start,['authority_unavailable']);
  }
  let state=start;
  const prior=priorAllocations(ctx.world,state,p);
  const obsolete=prior.some(r=>allocationPaper(ctx.world,state,r.allocPaper)!.letter.revision>=p.letter.revision && r.allocStatus!=='refused' &&
    (r.allocStatus!=='deferred'||lotDeferredAllocation(state,r)));
  const deferred=!obsolete && (p.subordinateOrder===true||governorUndertaking(ctx.world,p)) && (response.respActual==='slow_walk' || response.respConditions.length>0);
  const accepted=!obsolete && !deferred && response.respUndertaking!=null && response.respActual!=='reinterpret' && response.respConditions.length===0 &&
    ['destination','detail'].every(c=>response.respUndertaking!.clauses.includes(c));
  const strongest=['exceed','comply','comply_with_reservations'].includes(response.respActual);
  const direct=directRequestOf(state,p)!==undefined;
  const selection=accepted&&(p.subordinateOrder===true||direct)?allocationSelection(ctx.world,state,p,ctx.day,strongest,[],true):undefined;
  const retention=selection?.lots.length?forceRetention(ctx.world,state,msg.msgTo,p.from,selection.lots,ctx.day):undefined;
  const keeps=retention?.reason==='retain_for_own_mission';
  const noLots=p.subordinateOrder===true&&selection!==undefined&&!selection.lots.length;
  const qualified=answer!==undefined&&retention?.reason==='retention_comparison_undetermined'?reserveUndeterminedRetention(answer):answer;
  if(qualified!==undefined)state=recordResponse(state,qualified===answer?response:
    responseOf(qualified,{order:msg.msgOrigin,person:msg.msgTo,post:p.from,role:'addressee',day:ctx.day,kind:'allocation'}));
  acknowledge(ctx,state,msg,response.respDeclared,accepted&&!keeps&&!noLots,qualified);
  if(deferred)return decline(state,['deferred'],'deferred');
  if(!accepted)return decline(state,[obsolete?'superseded':'refused']);
  if(keeps)return decline(state,['retain_for_own_mission'],'refused',retention.shortfalls);
  for(const old of prior.filter(r=>r.allocStatus==='pending'||lotDeferredAllocation(state,r))) {
    state=endJoins(state,old.allocBlocks.filter(b=>state.forceJoins[b]?.joinAllocation===old.allocOrder));
    const superseded:AllocationRecord={...old,allocStatus:'superseded',allocReasons:['superseded']};
    state=putAllocation(state,superseded);
    if(lotDeferredAllocation(state,old)) {
      const supersededPaper=allocationPaper(ctx.world,state,old.allocPaper)!;
      reportSubordinateOutcome(ctx,state,supersededPaper,superseded,old.allocSender,false);
    }
  }
  if(noLots)return decline(state,selection.reasons,'deferred',undefined,strongest);
  const initial:AllocationRecord={...base,allocStatus:'shortfall',allocStrongest:strongest,...(retention===undefined?{}:{allocRetention:retention.shortfalls})};
  state=putAllocation(state,initial);
  if(selection!==undefined) {
    state=startSelectedLots(ctx,state,p,initial,selection);
    const sent=state.allocationRecords?.[initial.allocOrder];
    if(sent?.allocStatus==='pending'&&qualified!==undefined&&qualified!==answer)reportSendingReservation(ctx,state,p,sent,reportQualificationOf(qualified));
    return state;
  }
  return fulfilAllocation(ctx,state,msg.msgOrigin);
}

/** Record a new sending opportunity on a material holding change. The choice is made through the normal seat log. */
export function recordAllocationAvailability(ctx:TickContext,before:State,after:State):State {
  if(before.forceAssignments===after.forceAssignments && before.forceJoins===after.forceJoins &&
    before.forceBlockStates===after.forceBlockStates && before.forceLocations===after.forceLocations &&
    before.operationRecords===after.operationRecords && before.planRecords===after.planRecords &&
    before.neutralOffers===after.neutralOffers && before.allocationRecords===after.allocationRecords) return after;
  let state=after;
  for(const row of Object.values(after.allocationRecords??{})) {
    if(!lotDeferredAllocation(after,row))continue;
    const paper=outstandingAllocation(ctx.world,after,row);
    if(paper===undefined || after.postStates[paper.from]?.postHolder!==row.allocSender)continue;
    const eligible=allocationSelection(ctx.world,after,paper,ctx.day,row.allocStrongest,row.allocLots,true).eligibleLots;
    if(!eligible.length)continue;
    const original=before.allocationRecords?.[row.allocOrder];
    // A mandate revision alone cannot turn old, uncommitted holdings into a receipt or release.
    const prior=original===undefined?[]:allocationSelection(ctx.world,before,paper,ctx.day,row.allocStrongest,row.allocLots,true).availableHoldings;
    const newLots=eligible.filter(id=>!prior.includes(id)&&!row.allocReadyLots?.includes(id));
    if(newLots.length)state=putAllocation(state,{...row,allocWaitForLots:true,allocReadyLots:[...row.allocReadyLots??[],...newLots].sort(strictCompare)});
  }
  return state;
}

/** A fresh local choice may fulfil an outstanding received request; it never retries the paper. */
export function fulfilAllocation(ctx: TickContext, start: State, order: MessageId): State {
  const old=start.allocationRecords?.[order];
  if(!old)return start;
  const p=outstandingAllocation(ctx.world,start,old);
  if(!p || start.postStates[p.from]?.postHolder!==old.allocSender || !allocationAuthority(ctx.world,start,p,ctx.day))return start;
  const subordinate=p.subordinateOrder===true;
  if(subordinate&&!old.allocReadyLots?.length)return start;
  const direct=directRequestOf(start,p)!==undefined;
  const selection=allocationSelection(ctx.world,start,p,ctx.day,old.allocStrongest,old.allocLots,subordinate||direct||p.voluntary===true,old.allocReadyLots);
  if(subordinate&&!selection.lots.length)return start;
  const retention=(subordinate||direct)&&selection.lots.length?forceRetention(ctx.world,start,old.allocSender,p.from,selection.lots,ctx.day):undefined;
  const {allocReadyLots:_,...undertaking}=old;
  const row=retention===undefined?undertaking:{...undertaking,allocRetention:retention.shortfalls};
  if(retention?.reason==='retain_for_own_mission') {
    const retained:AllocationRecord={...row,allocReasons:[retention.reason],allocStatus:old.allocStatus==='pending'?'pending':'refused'};
    if(subordinate)reportSubordinateOutcome(ctx,start,p,retained,old.allocSender,false);
    else reportDirectRetention(ctx,start,p,retained);
    return putAllocation(start,retained);
  }
  if(retention?.reason!=='retention_comparison_undetermined') {
    const sent=startSelectedLots(ctx,start,p,row,selection);
    const sending=sent.allocationRecords?.[order];
    if(subordinate&&sending?.allocStatus==='pending')reportSendingReservation(ctx,sent,p,sending,{});
    return sent;
  }
  const original=start.orderResponses[responseKey(order,old.allocSender)];
  if(original===undefined)return start;
  const qualified={...original,respReservations:retentionReservations(original.respReservations),
    respDeclaredReservations:retentionReservations(original.respDeclaredReservations)};
  const qualification=reportQualificationOf({declaredUndertaking:qualified.respDeclaredUndertaking??null,
    declaredReservations:qualified.respDeclaredReservations,declaredReservationGaps:qualified.respDeclaredReservationGaps??[]});
  const sent=startSelectedLots(ctx,start,p,row,selection,qualification);
  const sending=sent.allocationRecords?.[order];
  if(!sending||sending.allocLots.length===old.allocLots.length)return sent;
  reportSendingReservation(ctx,sent,p,sending,qualification);
  return recordResponse(sent,qualified);
}

function startSelectedLots(ctx:TickContext,start:State,p:AllocationInstrument,old:AllocationRecord,selection:ReturnType<typeof allocationSelection>,qualification:Pick<ReportBody,'reportQualification'>={}):State {
  let state=start;
  const order=old.allocOrder;
  const voluntary=governorUndertaking(ctx.world,p);
  const offerIssuer=p.voluntary===true?state.postStates[p.to]?.postHolder:p.issuer;
  const prior=state.neutralOffers?.[order];
  const original=p.voluntary===true?governorRequestAnswer(state,p.id,old.allocSender):undefined;
  const response=p.voluntary===true?original?.response:state.orderResponses[responseKey(order,old.allocSender)]??prior?.offerResponse;
  if(voluntary && (offerIssuer==null || response===undefined))return state;
  const selected=new Set(selection.lots), blocks:ForceBlockId[]=[];
  const blockLots={...old.allocBlockLots};
  for(const id of selection.blocks) {
    const force=state.forceBlockStates[id]!, going=force.fbLots.filter(l=>selected.has(l.lotId));
    if(going.length===force.fbLots.length){blocks.push(id);blockLots[id]=going.map(l=>l.lotId);continue;}
    const split=toId('forceBlock',`${id}.allocation.${canonicalHash({paper:p.id,order,lots:selection.lots}).slice(0,16)}`);
    if(state.forceBlockStates[split]!==undefined)throw new RangeError('duplicate allocation partition');
    const owner=state.forceAssignments[id]!;
    state=repartition(state,[id],[{block:id,lots:force.fbLots.filter(l=>!selected.has(l.lotId)).map(l=>l.lotId),name:force.fbName},
      {block:split,lots:going.map(l=>l.lotId),name:force.fbName}],[owner,owner]);
    blocks.push(split);
    blockLots[split]=going.map(l=>l.lotId);
  }
  const allBlocks=[...old.allocBlocks,...blocks];
  const pending=allBlocks.filter(b=>!old.allocReceived.includes(b)&&state.forceBlockStates[b]!==undefined);
  if(blocks.length&&!allocationAuthority(ctx.world,state,p,ctx.day,pending,order)) {
    const row:AllocationRecord={...old,allocShortfall:selection.shortfall+selection.lots.length,allocReasons:['authority_unavailable'],
      allocStatus:p.subordinateOrder===true?'deferred':old.allocStatus};
    reportSubordinateOutcome(ctx,start,p,row,old.allocSender,false);
    return putAllocation(start,row);
  }
  // Joins reserve the actual containers. The request ledger retains the stable lots across partitions.
  if(voluntary && blocks.length) {
    state=putOffer(state,{offerCall:order,offerCallId:p.id,offerOwner:p.from,offerGovernor:old.allocSender,offerIssuer:offerIssuer!,offerReceiver:p.to,offerRegion:p.destination,
      ...(original?.asker===undefined?{}:{offerAsker:original.asker}),
      offerBlocks:[...prior?.offerBlocks??[],...blocks],offerReceived:prior?.offerReceived??[],offerStatus:'offered',offerResponse:response!,offerReceiptDays:prior?.offerReceiptDays??{}});
    state=orderOfferJoins(state,blocks,p.from,p.destination,ctx.day,order,true);
  }
  else for(const block of blocks)state=orderAllocationJoins(state,[block],state.forceAssignments[block]!,p.destination,ctx.day,order);
  if(!voluntary && p.issuerPost!==null && blocks.length)state=commitAuthority(state,mandateAt(state,p.issuerPost,p.mandate!)!,order,p.from,pending,true);
  const row:AllocationRecord={...old,allocLots:[...old.allocLots,...selection.lots],allocBlocks:allBlocks,allocReasons:selection.reasons,
    ...(blocks.length?{allocBlockLots:blockLots}:{}),allocShortfall:selection.shortfall,allocStatus:allBlocks.length>old.allocReceived.length?'pending':'shortfall'};
  state=putAllocation(state,row);
  sendReport(ctx,state,{body:answerBody(old.allocSender,p.from,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:order,about:p.from,
    ...qualification,
    reportClaims:[{claimKind:'allocation-selected',claimRegion:p.destination,claimValue:row.allocLots.length,claimToken:p.id,claimConfidence:1000},
      {claimKind:'allocation-shortfall',claimRegion:null,claimValue:selection.shortfall,claimToken:p.id,claimConfidence:1000}]}),truth:{truthTerms:[],truthTrimmed:[]},to:p.issuer,tag:`allocation.${p.id}`});
  return state;
}
export function allocationPassage(ctx: TickContext, state: State, block: ForceBlockId, order: string): ((leg:EdgeLeg)=>boolean)|null {
  const record=state.allocationRecords?.[order as MessageId];
  const p=allocationPaper(ctx.world,state,record?.allocPaper??'');
  const ready=(b:ForceBlockId)=>{
    const force=state.forceBlockStates[b];
    return force!==undefined && state.forceLocations[b]!==undefined && force.fbSurrenderedDay===null &&
      !force.fbLots.some(l=>l.lotMen===0 || l.lotService?.enlEndsDay!=null&&ctx.day>=l.lotService.enlEndsDay);
  };
  if(!p || record?.allocStatus!=='pending' || !ready(block) || !allocationAuthority(ctx.world,state,p,ctx.day,[block],record.allocOrder))return null;
  const authority=p.issuerPost===null||governorUndertaking(ctx.world,p)?undefined:mandateAt(state,p.issuerPost,p.mandate!);
  if(authority!==undefined && record.allocBlocks.length>1 && authorityFamily(state,authority).some(a=>
    a.authorityGrant.mandateCeiling?.ceilingMen!=null || a.authorityGrant.mandateGuard!==null)) {
    // A revoked or reduced limit cannot be bypassed by testing each member of the same journey in isolation.
    const batch=record.allocBlocks.filter(b=>!record.allocReceived.includes(b) && state.forceJoins[b]?.joinAllocation===record.allocOrder && ready(b) &&
      allocationAuthority(ctx.world,state,p,ctx.day,[b],record.allocOrder));
    if(batch.length>1&&!allocationAuthority(ctx.world,state,p,ctx.day,batch,record.allocOrder)) {
      const permitted:ForceBlockId[]=[];
      for(const b of batch)if(allocationAuthority(ctx.world,state,p,ctx.day,[...permitted,b],record.allocOrder))permitted.push(b);
      if(!permitted.includes(block))return null;
    }
  }
  const g=authority?.authorityGrant;
  return leg => (p.modes===undefined || p.modes.includes(leg.type==='road'?'land':leg.type)) &&
    (g===undefined || g.mandateModes.includes(leg.type==='road'?'land':leg.type) && g.mandateRegions.includes(leg.from) && g.mandateRegions.includes(leg.to));
}
export function receiveAllocations(ctx: TickContext, start: State): State {
  let state=start;
  for(const saved of Object.values(state.allocationRecords??{}).sort((a,b)=>strictCompare(a.allocOrder,b.allocOrder))) {
    let record=saved;
    if(record.allocStatus!=='pending')continue;
    const p=allocationPaper(ctx.world,state,record.allocPaper);
    if(!p)continue;
    if(governorUndertaking(ctx.world,p)) {
      const offer=state.neutralOffers?.[record.allocOrder];
      const gone=record.allocBlocks.filter(b=>!record.allocReceived.includes(b)&&(!state.forceBlockStates[b]||state.forceBlockStates[b]!.fbSurrenderedDay!==null||state.forceBlockStates[b]!.fbLots.some(l=>l.lotMen===0||l.lotService?.enlEndsDay!==null&&l.lotService?.enlEndsDay!==undefined&&ctx.day>=l.lotService.enlEndsDay)));
      if(gone.length) {
        const lost=lostAllocationLots(state,record,gone);
        state=endJoins(state,gone);
        record={...record,allocBlocks:record.allocBlocks.filter(b=>!gone.includes(b)),allocShortfall:record.allocShortfall+lost.length,
          allocLostLots:[...record.allocLostLots??[],...lost],allocReasons:[...new Set([...record.allocReasons,'discharged' as const])]};
        record={...record,allocStatus:record.allocBlocks.some(b=>!record.allocReceived.includes(b))?'pending':'shortfall'};
        state=putAllocation(state,record);
      }
      if(offer?.offerGap==='mission_changed')state=putAllocation(state,{...record,allocStatus:'superseded',allocReasons:['superseded']});
      else if(offer?.offerStatus==='recalled')state=putAllocation(state,{...record,allocReceived:offer.offerReceived,allocStatus:'refused',allocReasons:['refused']});
      else if(offer?.offerReceived.length) {
        state=putAllocation(state,{...record,allocReceived:offer.offerReceived,allocStatus:offer.offerReceived.length===record.allocBlocks.length?(record.allocShortfall>0?'shortfall':'received'):'pending'});
        if(offer.offerReceived.some(b=>!record.allocReceived.includes(b)))state=refreshGoalForces(state,p.to,allCommandedBlocks(ctx.world.map,state,p.to));
      }
      continue;
    }
    const invalid=record.allocBlocks.filter(b=>!record.allocReceived.includes(b) && (state.forceJoins[b]?.joinAllocation!==record.allocOrder || allocationPassage(ctx,state,b,record.allocOrder)===null));
    if(invalid.length) {
      const lost=lostAllocationLots(state,record,invalid);
      state=endJoins(state,invalid);
      const expired=invalid.some(b=>!state.forceBlockStates[b] || state.forceBlockStates[b]!.fbLots.some(l=>l.lotService?.enlEndsDay!==null&&l.lotService?.enlEndsDay!==undefined&&ctx.day>=l.lotService.enlEndsDay));
      record={...record,allocBlocks:record.allocBlocks.filter(b=>!invalid.includes(b)),allocShortfall:record.allocShortfall+lost.length,
        allocLostLots:[...record.allocLostLots??[],...lost],
        allocReasons:[...new Set([...record.allocReasons,expired?'discharged' as const:'authority_unavailable' as const])]};
      const more=record.allocBlocks.some(b=>!record.allocReceived.includes(b));
      const retained=record.allocReasons.includes('retain_for_own_mission');
      record={...record,allocStatus:more?'pending':retained?(record.allocReceived.length?'received':'refused'):'shortfall'};
      state=putAllocation(state,record);
      if(record.allocStatus!=='pending') {
        const receiver=state.postStates[p.to]?.postHolder;
        if(receiver!=null&&record.allocReceived.length>0)reportSubordinateOutcome(ctx,state,p,record,receiver,true);
        else reportSubordinateOutcome(ctx,state,p,record,record.allocSender,false);
        continue;
      }
    }
    const holder=state.postStates[p.to]?.postHolder;
    if(holder==null || whereIs(ctx,state,holder)!==p.destination)continue;
    const arrived=record.allocBlocks.filter(b=>!record.allocReceived.includes(b) && state.forceLocations[b]?.locRegion===p.destination && state.forceLocations[b]?.locMarch===null && state.forceLocations[b]?.locAboard===null);
    if(!arrived.length)continue;
    state=regroupAssignments(state,[],arrived.map(block=>({block,post:p.to})));
    state=endJoins(state,arrived);
    if(Object.values(state.forceRequests??{}).some(r=>r.freqAnswers.some(a=>a.fansAssignment?.[0]===p.id)))state=refreshGoalForces(state,p.to,allCommandedBlocks(ctx.world.map,state,p.to));
    const received=[...record.allocReceived,...arrived];
    const complete=received.length===record.allocBlocks.length;
    const outstanding=record.allocShortfall>0&&p.subordinateOrder!==true&&!record.allocReasons.includes('retain_for_own_mission');
    record={...record,allocReceived:received,allocStatus:complete?(outstanding?'shortfall':'received'):'pending'};
    state=putAllocation(state,record);
    if(complete)reportSubordinateOutcome(ctx,state,p,record,holder,true);
    sendReport(ctx,state,{body:answerBody(holder,p.to,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:record.allocOrder,about:p.to,
      reportClaims:[{claimKind:'arrived',claimRegion:p.destination,claimValue:allocatedLots(state,record,arrived).length,claimToken:`allocation_received:${p.id}`,claimConfidence:1000}]}),truth:{truthTerms:[],truthTrimmed:[]},to:p.issuer,tag:`allocation-received.${p.id}`});
  }
  for(const block of Object.keys(state.forceJoins).sort(strictCompare) as ForceBlockId[]) {
    const join=state.forceJoins[block]!, loc=state.forceLocations[block];
    if(join.joinService===undefined || !loc || loc.locRegion!==join.joinRegion)continue;
    state=serviceReceipt(ctx.world,state,block,join.joinService,ctx.day);
    const row=Object.values(state.serviceReceipts??{}).find(r=>r.receiptOrder===join.joinService!.serviceOrder&&r.receiptLots.some(id=>state.forceBlockStates[block]?.fbLots.some(l=>l.lotId===id)));
    if(row?.receiptStatus==='received')state=endJoins(state,[block]);
  }
  return state;
}
