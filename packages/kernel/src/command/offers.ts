/** The governor retains his offer until the receiving command receives its troops (0126). */
import type { ForceBlockId, MessageId, PersonId, PostId, RegionId } from '../ids.ts';
import type { OrderResponse } from '../proxy/responses.ts';
import type { State } from '../root-state.ts';
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
