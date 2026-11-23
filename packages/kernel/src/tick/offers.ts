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

export function recallOffer(ctx: TickContext, state: State, seat: SeatId, id: MessageId): { state: State; reason: RejectionReason | null } {
 const offer = state.neutralOffers?.[id];
 const actor = state.seatAssignments[seat]?.seatPerson;
 // Before muster the undertaking is still the governor's levy in hand.
 if (offer === undefined) {
  const levy = state.postLevies[id];
  if (levy?.levyOfferRegion !== undefined && levy.levyOfferReceiver !== undefined && levy.levyCallId !== undefined && levy.levyOfferResponse !== undefined && actor === levy.levyGovernor && state.postStates[levy.levyPost]?.postHolder === actor) {
   const next = cancelPendingLevy(state,id);
   return {state:putOffer(next,{offerCall:id,offerCallId:levy.levyCallId,offerOwner:levy.levyPost,offerGovernor:levy.levyGovernor,offerIssuer:levy.levyIssuer,offerReceiver:levy.levyOfferReceiver,offerRegion:levy.levyOfferRegion,offerBlocks:[],offerReceived:[],offerStatus:'recalled',offerResponse:levy.levyOfferResponse,offerReceiptDays:{}}),reason:null};
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
  const receiver=state.postStates[offer.offerReceiver];
  const side=sideOfPerson(ctx.world.map,state,offer.offerIssuer);
  if (receiver?.postHolder==null || side===null || postFaction(ctx.world,state,offer.offerReceiver)!==side) continue;
  const blocks=offer.offerBlocks.filter(b=>!offer.offerReceived.includes(b) && state.forceAssignments[b]===offer.offerOwner && state.forceBlockStates[b]?.fbSurrenderedDay===null && state.forceLocations[b]?.locRegion===offer.offerRegion && state.forceLocations[b]?.locMarch===null && state.forceLocations[b]?.locAboard===null);
  if (blocks.length===0) continue;
  state=receiveOfferedBlocks(state,blocks,receiver.postDepartment);
  state=regroupAssignments(state,[],blocks.map(block=>({block,post:offer.offerReceiver})));
  state=endJoins(state,blocks);
  const received=[...offer.offerReceived,...blocks];
  state=putOffer(state,{...offer,offerReceived:received,offerStatus:received.length===offer.offerBlocks.length?'received':'offered',offerReceiptDays:{...offer.offerReceiptDays,...Object.fromEntries(blocks.map(b=>[b,ctx.day]))}});
  sendReport(ctx,state,{body:answerBody(receiver.postHolder,offer.offerReceiver,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,reportRequisition:offer.offerCallId,answers:offer.offerCall,about:offer.offerOwner,reportClaims:[{claimKind:'arrived',claimRegion:offer.offerRegion,claimValue:blocks.length,claimToken:'offer_received',claimConfidence:1000}]}),truth:{truthTerms:[],truthTrimmed:[]},to:offer.offerIssuer,tag:`offer-received.${offer.offerCallId}`});
 }
 return commandIntake(ctx.world,state,ctx.day);
}
