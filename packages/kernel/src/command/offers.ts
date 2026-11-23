/** The governor retains his offer until the receiving command receives its troops (0126). */
import type { ForceBlockId, MessageId, PersonId, PostId, RegionId } from '../ids.ts';
import type { OrderResponse } from '../proxy/responses.ts';
import type { State } from '../root-state.ts';
import type { LotGroup } from '../forces/regroup.ts';

/** A whole-lot split preserves the original administrative receipt for each descendant. */
export function partitionOfferReceipts(state: State, before: State, sources: readonly ForceBlockId[], groups: readonly LotGroup[]): State {
 let next=state;
 for(const offer of Object.values(before.neutralOffers??{})) {
  if(!offer.offerBlocks.some(b=>sources.includes(b)))continue;
  const descendants=(blocks:readonly ForceBlockId[])=>[...new Set(blocks.flatMap(b=>sources.includes(b)?groups.filter(g=>before.forceBlockStates[b]!.fbLots.some(l=>g.lots.includes(l.lotId))).map(g=>g.block):[b]))];
  const days={...offer.offerReceiptDays};for(const b of sources)delete days[b];
  for(const g of groups) {
   const receipts=sources.filter(b=>offer.offerReceiptDays[b]!==undefined && before.forceBlockStates[b]!.fbLots.some(l=>g.lots.includes(l.lotId))).map(b=>offer.offerReceiptDays[b]!);
   if(receipts.length>0)days[g.block]=Math.max(...receipts);
  }
  next=putOffer(next,{...offer,offerBlocks:descendants(offer.offerBlocks),offerReceived:descendants(offer.offerReceived),offerReceiptDays:days});
 }
 return next;
}
export interface NeutralOffer {
 readonly offerCall: MessageId;
 readonly offerCallId: string;
 readonly offerOwner: PostId;
 readonly offerGovernor: PersonId;
 readonly offerIssuer: PersonId;
 readonly offerReceiver: PostId;
 readonly offerRegion: RegionId;
 readonly offerBlocks: readonly ForceBlockId[];
 readonly offerReceived: readonly ForceBlockId[];
 readonly offerStatus: 'offered' | 'received' | 'recalled';
 readonly offerResponse: OrderResponse;
 readonly offerReceiptDays: Readonly<Record<ForceBlockId, number>>;
}
export function putOffer(state: State, offer: NeutralOffer): State {
 return {...state, neutralOffers:{...state.neutralOffers,[offer.offerCall]:offer}};
}
export function pendingOffer(state: State, block: ForceBlockId): NeutralOffer | undefined {
 return Object.values(state.neutralOffers ?? {}).find(o=>o.offerBlocks.includes(block) && !o.offerReceived.includes(block));
}
