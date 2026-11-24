import { serviceReceiver } from '../command/service-receipt.ts';
/** A governor's voluntary offer travels under his post; national receipt is a later command event. */
import { cancelPendingLevy } from '../command/levies.ts';
import { putOffer } from '../command/offers.ts';
import { regroupAssignments } from '../command/organisation.ts';
import { sideOfPerson } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import { receiveOfferedBlocks } from '../forces/offers.ts';
import type { MessageId, SeatId } from '../ids.ts';
import { orderOfferJoins, endJoins } from '../movement/join.ts';
import type { State } from '../root-state.ts';
import { postFaction } from '../seats/posts.ts';
import { answerBody } from './orders.ts';
import { sendReport, type TickContext, type RejectionReason } from './context.ts';
import { commandIntake } from '../command/command-assignment.ts';
import { allocationPassage } from './allocation.ts';

export function recallOffer(ctx: TickContext, state: State, seat: SeatId, id: MessageId): { state: State; reason: RejectionReason | null } {
 const offer = state.neutralOffers?.[id];
 const actor = state.seatAssignments[seat]?.seatPerson;
 // Before muster the undertaking is still the governor's levy in hand.
 if (offer === undefined) {
  const levy = state.postLevies[id];
  if (levy?.levyOfferRegion !== undefined && levy.levyCallId !== undefined && levy.levyOfferResponse !== undefined && actor === levy.levyGovernor && state.postStates[levy.levyPost]?.postHolder === actor) {
   const next = cancelPendingLevy(state,id);
   return {state:putOffer(next,{offerCall:id,offerCallId:levy.levyCallId,offerOwner:levy.levyPost,offerGovernor:levy.levyGovernor,offerIssuer:levy.levyIssuer,...(levy.levyOfferReceiver===undefined?{}:{offerReceiver:levy.levyOfferReceiver}), ...(levy.levyOfferStation===undefined?{}:{offerStation:levy.levyOfferStation}),offerRegion:levy.levyOfferRegion,offerBlocks:[],offerReceived:[],offerStatus:'recalled',offerResponse:levy.levyOfferResponse,offerReceiptDays:{}}),reason:null};
  }
 }
 const home = offer === undefined ? null : state.postStates[offer.offerOwner]?.postSeat;
 if (offer === undefined || offer.offerStatus !== 'offered' || actor !== offer.offerGovernor || state.postStates[offer.offerOwner]?.postHolder !== actor || home == null) return {state,reason:'bad_selection'};
 const blocks = offer.offerBlocks.filter(b=>!offer.offerReceived.includes(b) && state.forceAssignments[b]===offer.offerOwner && state.forceLocations[b]!==undefined);
 let next = putOffer(state,{...offer,offerStatus:'recalled'});
 next = endJoins(next,blocks);
 next = orderOfferJoins(next,blocks,offer.offerOwner,home,ctx.day,id);
 return {state:next,reason:null};
}

/** Physical arrival, an extant receiving holder and its still-valid authority are all required. */
export function receiveOffers(ctx: TickContext, start: State): State {
 let state=start;
 for (const id of Object.keys(state.neutralOffers ?? {}).sort(strictCompare) as MessageId[]) {
  const offer=state.neutralOffers![id]!;
  if (offer.offerStatus!=='offered') continue;
  const request=Object.values(state.forceRequests??{}).find(r=>r.freqAnswers.some(a=>a.fansAssignment?.[0]===state.allocationRecords?.[offer.offerCall]?.allocPaper));
  if(request!==undefined && (state.planRecords[request.freqNeed.needPost]?.planOrder!==request.freqNeed.needMission || state.postStates[request.freqNeed.needPost]?.postHolder!==request.freqNeed.needPerson)) {
    state=endJoins(state,offer.offerBlocks.filter(b=>!offer.offerReceived.includes(b)));
    if(offer.offerGap!=='mission_changed')state=putOffer(state,{...offer,offerGap:'mission_changed'});
    continue;
  }
  const side=sideOfPerson(ctx.world.map,state,offer.offerIssuer);
  if(side===null)continue;
  const department=ctx.world.start.posts.find(p=>p.id===offer.offerReceiver)?.department ??
    ctx.world.start.temporaryPosts.find(p=>p.id===offer.offerReceiver)?.department ??
    Object.values(state.postStates).find(p=>p.postHolder===offer.offerIssuer)?.postDepartment;
  const resolved=offer.offerReceiver===undefined && department!==undefined ? serviceReceiver(ctx.world,state,offer.offerRegion,department,{...(offer.offerStation===undefined?{}:{serviceStation:offer.offerStation})},ctx.day):{post:offer.offerReceiver??null,reason:'missing_post'};
  const receiverPost=resolved.post, receiver=receiverPost===null?undefined:state.postStates[receiverPost];
  if (receiver?.postHolder==null || receiverPost===null || postFaction(ctx.world,state,receiverPost)!==side) {
    if(offer.offerReceiver===undefined && offer.offerGap!==resolved.reason)state=putOffer(state,{...offer,offerGap:resolved.reason});
    continue;
  }
  const allocation=state.allocationRecords?.[offer.offerCall];
  const blocks=offer.offerBlocks.filter(b=>!offer.offerReceived.includes(b) && state.forceAssignments[b]===offer.offerOwner && state.forceBlockStates[b]?.fbSurrenderedDay===null && !state.forceBlockStates[b]!.fbLots.some(l=>l.lotMen===0 || l.lotService?.enlEndsDay!==null&&l.lotService?.enlEndsDay!==undefined&&ctx.day>=l.lotService.enlEndsDay) && state.forceLocations[b]?.locRegion===offer.offerRegion && state.forceLocations[b]?.locMarch===null && state.forceLocations[b]?.locAboard===null && (allocation===undefined || state.forceJoins[b]?.joinOffer===id && allocationPassage(ctx,state,b,id)!==null));
  if (blocks.length===0) continue;
  state=receiveOfferedBlocks(state,blocks,receiver.postDepartment);
  state=regroupAssignments(state,[],blocks.map(block=>({block,post:receiverPost})));
  state=endJoins(state,blocks);
  const received=[...offer.offerReceived,...blocks];
  state=putOffer(state,{...offer,offerReceived:received,offerStatus:received.length===offer.offerBlocks.length?'received':'offered',offerReceiptDays:{...offer.offerReceiptDays,...Object.fromEntries(blocks.map(b=>[b,ctx.day]))}});
  const body=answerBody(receiver.postHolder,receiverPost,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,reportRequisition:offer.offerCallId,answers:offer.offerCall,about:offer.offerOwner,reportClaims:[{claimKind:'arrived',claimRegion:offer.offerRegion,claimValue:blocks.length,claimToken:'offer_received',claimConfidence:1000}]});
  for(const to of new Set([offer.offerIssuer,offer.offerAsker??offer.offerIssuer])) {
   sendReport(ctx,state,{body,truth:{truthTerms:[],truthTrimmed:[]},to,tag:`offer-received.${offer.offerCallId}`});
  }
 }
 return commandIntake(ctx.world,state,ctx.day);
}
