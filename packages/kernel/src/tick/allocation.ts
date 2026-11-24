import { allocationAuthority, allocationSelection, outstandingAllocation, priorAllocations, putAllocation, type AllocationRecord } from '../command/allocation.ts';
import { regroupAssignments } from '../command/organisation.ts';
import { commitAuthority, mandateAt } from '../command/authority.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, SeatId } from '../ids.ts';
import { toId } from '../ids.ts';
import type { AllocationCommand } from '../log/commands.ts';
import type { TransitMessage } from '../messages/transit.ts';
import { endJoins, orderAllocationJoins } from '../movement/join.ts';
import { recordResponse, responseOf } from '../proxy/responses.ts';
import { answerOrder, verbDirective } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import { availableAllocations } from '../seats/allocation.ts';
import type { EdgeLeg } from '../supply/supply.ts';
import { canonicalHash } from '../serialize/hash.ts';
import { letterKey } from '../world/letters.ts';
import { acknowledge, answerBody, dispatchOrder } from './orders.ts';
import { oversightOf, sendReport, whereIs, type RejectionReason, type TickContext } from './context.ts';
import { repartition } from './organisation.ts';

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
  const p=ctx.world.map.world.rules.allocationInstruments?.find(p=>p.id===msg.msgOrder?.orderAllocation);
  if(!p || msg.msgOrder?.orderIssuer!==p.issuer || msg.msgToPost!==p.from || msg.msgOrder.orderLetter===undefined ||
    letterKey(msg.msgOrder.orderLetter)!==letterKey(p.letter))return start;
  if(start.allocationRecords?.[msg.msgOrigin])return start;
  const base:AllocationRecord={allocOrder:msg.msgOrigin,allocPaper:p.id,allocDay:ctx.day,allocSender:msg.msgTo,allocStrongest:true,allocLots:[],allocBlocks:[],allocReceived:[],allocShortfall:p.quantity==='all'?(p.scope.kind==='named'?p.scope.regiments.length:0):p.quantity,allocReasons:[],allocStatus:'refused'};
  if(p.recipient!==undefined && p.recipient!==msg.msgTo || !allocationAuthority(ctx.world,start,p,ctx.day)) {
    acknowledge(ctx,start,msg,'authority_unavailable',false);
    return putAllocation(start,{...base,allocReasons:['authority_unavailable']});
  }
  const answer=answerOrder(ctx.world,start,msg.msgTo,p.issuer,verbDirective(ctx.world.rules.people,'transfer'),{oversight:oversightOf(ctx,start,msg.msgTo,p.issuer).value});
  let state=recordResponse(start,responseOf(answer,{order:msg.msgOrigin,person:msg.msgTo,post:p.from,role:'addressee',day:ctx.day,kind:'allocation'}));
  const prior=priorAllocations(ctx.world,state,p);
  const obsolete=prior.some(r=>ctx.world.map.world.rules.allocationInstruments!.find(x=>x.id===r.allocPaper)!.letter.revision>=p.letter.revision && r.allocStatus!=='refused');
  const accepted=!obsolete && answer.undertaking!==null && answer.actual!=='reinterpret' && answer.conditions.length===0 &&
    ['destination','detail'].every(c=>answer.undertaking!.clauses.includes(c));
  acknowledge(ctx,state,msg,answer.declared,accepted,answer);
  if(!accepted)return putAllocation(state,{...base,allocReasons:[obsolete?'superseded':'refused']});
  for(const old of prior.filter(r=>r.allocStatus==='pending')) {
    state=endJoins(state,old.allocBlocks.filter(b=>state.forceJoins[b]?.joinAllocation===old.allocOrder));
    state=putAllocation(state,{...old,allocStatus:'superseded',allocReasons:['superseded']});
  }
  state=putAllocation(state,{...base,allocStatus:'shortfall',allocStrongest:['exceed','comply','comply_with_reservations'].includes(answer.actual)});
  return fulfilAllocation(ctx,state,msg.msgOrigin);
}

/** A fresh local choice may fulfil an outstanding received request; it never retries the paper. */
export function fulfilAllocation(ctx: TickContext, start: State, order: MessageId): State {
  const old=start.allocationRecords?.[order];
  if(!old)return start;
  const p=outstandingAllocation(ctx.world,start,old);
  if(!p || start.postStates[p.from]?.postHolder!==old.allocSender || !allocationAuthority(ctx.world,start,p,ctx.day))return start;
  let state=start;
  const selection=allocationSelection(ctx.world,state,p,ctx.day,old.allocStrongest,old.allocLots);
  const selected=new Set(selection.lots), blocks:ForceBlockId[]=[];
  for(const id of selection.blocks) {
    const force=state.forceBlockStates[id]!, going=force.fbLots.filter(l=>selected.has(l.lotId));
    if(going.length===force.fbLots.length){blocks.push(id);continue;}
    const split=toId('forceBlock',`${id}.allocation.${canonicalHash({paper:p.id,order,lots:selection.lots}).slice(0,16)}`);
    if(state.forceBlockStates[split]!==undefined)throw new RangeError('duplicate allocation partition');
    const owner=state.forceAssignments[id]!;
    state=repartition(state,[id],[{block:id,lots:force.fbLots.filter(l=>!selected.has(l.lotId)).map(l=>l.lotId),name:force.fbName},
      {block:split,lots:going.map(l=>l.lotId),name:force.fbName}],[owner,owner]);
    blocks.push(split);
  }
  // Joins reserve the actual containers. The request ledger retains the stable lots across partitions.
  for(const block of blocks)state=orderAllocationJoins(state,[block],state.forceAssignments[block]!,p.destination,ctx.day,order);
  const allBlocks=[...old.allocBlocks,...blocks];
  if(p.issuerPost!==null && blocks.length)state=commitAuthority(state,mandateAt(state,p.issuerPost,p.mandate!)!,order,p.from,allBlocks.filter(b=>!old.allocReceived.includes(b)),true);
  const row:AllocationRecord={...old,allocLots:[...old.allocLots,...selection.lots],allocBlocks:allBlocks,allocReasons:selection.reasons,
    allocShortfall:selection.shortfall,allocStatus:allBlocks.length>old.allocReceived.length?'pending':'shortfall'};
  state=putAllocation(state,row);
  sendReport(ctx,state,{body:answerBody(old.allocSender,p.from,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:order,about:p.from,
    reportClaims:[{claimKind:'allocation-selected',claimRegion:p.destination,claimValue:row.allocLots.length,claimToken:p.id,claimConfidence:1000},
      {claimKind:'allocation-shortfall',claimRegion:null,claimValue:selection.shortfall,claimToken:p.id,claimConfidence:1000}]}),truth:{truthTerms:[],truthTrimmed:[]},to:p.issuer,tag:`allocation.${p.id}`});
  return state;
}
export function allocationPassage(ctx: TickContext, state: State, block: ForceBlockId, order: string): ((leg:EdgeLeg)=>boolean)|null {
  const record=Object.values(state.allocationRecords??{}).find(r=>r.allocOrder===order);
  const p=ctx.world.map.world.rules.allocationInstruments?.find(p=>p.id===record?.allocPaper);
  if(!p || record?.allocStatus!=='pending' || !allocationAuthority(ctx.world,state,p,ctx.day,[block],record.allocOrder))return null;
  const g=p.issuerPost===null?undefined:mandateAt(state,p.issuerPost,p.mandate!)?.authorityGrant;
  return leg => (p.modes===undefined || p.modes.includes(leg.type==='road'?'land':leg.type)) &&
    (g===undefined || g.mandateModes.includes(leg.type==='road'?'land':leg.type) && g.mandateRegions.includes(leg.from) && g.mandateRegions.includes(leg.to));
}
export function receiveAllocations(ctx: TickContext, start: State): State {
  let state=start;
  for(const record of Object.values(state.allocationRecords??{}).sort((a,b)=>strictCompare(a.allocOrder,b.allocOrder))) {
    if(record.allocStatus!=='pending')continue;
    const p=ctx.world.map.world.rules.allocationInstruments?.find(p=>p.id===record.allocPaper);
    if(!p)continue;
    const invalid=record.allocBlocks.filter(b=>!record.allocReceived.includes(b) && (state.forceJoins[b]?.joinAllocation!==record.allocOrder || allocationPassage(ctx,state,b,record.allocOrder)===null));
    if(invalid.length) {
      state=endJoins(state,record.allocBlocks.filter(b=>!record.allocReceived.includes(b)));
      state=putAllocation(state,{...record,allocStatus:'shortfall',allocReasons:[...new Set([...record.allocReasons,'authority_unavailable' as const])]});
      continue;
    }
    const holder=state.postStates[p.to]?.postHolder;
    if(holder==null || whereIs(ctx,state,holder)!==p.destination)continue;
    const arrived=record.allocBlocks.filter(b=>!record.allocReceived.includes(b) && state.forceLocations[b]?.locRegion===p.destination && state.forceLocations[b]?.locMarch===null && state.forceLocations[b]?.locAboard===null);
    if(!arrived.length)continue;
    state=regroupAssignments(state,[],arrived.map(block=>({block,post:p.to})));
    state=endJoins(state,arrived);
    const received=[...record.allocReceived,...arrived];
    state=putAllocation(state,{...record,allocReceived:received,allocStatus:received.length===record.allocBlocks.length?'received':'pending'});
    sendReport(ctx,state,{body:answerBody(holder,p.to,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:record.allocOrder,about:p.to,
      reportClaims:[{claimKind:'arrived',claimRegion:p.destination,claimValue:arrived.length,claimToken:`allocation_received:${p.id}`,claimConfidence:1000}]}),truth:{truthTerms:[],truthTrimmed:[]},to:p.issuer,tag:`allocation-received.${p.id}`});
  }
  return state;
}
