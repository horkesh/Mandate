/** Command alone records service receipt; appearing at a raising place is never arrival. */
import { activeMandate, currentMandates, mandateAt } from './authority.ts';
import { factionOfPost } from './command.ts';
import { pendingOffer } from './offers.ts';
import { regroupAssignments } from './organisation.ts';
import type { ForceBlockId, MessageId, PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { ServiceJourney } from '../movement/join.ts';
export type ServiceReceiptReason = 'explicit_receiver' | 'specified_station' | 'local_station' | 'territory_default_I' | 'missing_post' | 'unopened_post' | 'ambiguous_territory' | 'state_root' | 'offer_pending' | 'special_assignment' | 'expired';
export interface ServiceReceipt {
  readonly receiptKey: string;
  readonly receiptOrder: MessageId;
  readonly receiptLots: readonly string[];
  readonly receiptFrom: PostId | null;
  readonly receiptTo: PostId | null;
  readonly receiptRegion: RegionId;
  readonly srecDay: number;
  readonly receiptStatus: 'received' | 'gap';
  readonly receiptReason: ServiceReceiptReason;
}
export function putServiceReceipt(state:State, row:ServiceReceipt):State {
 return {...state,serviceReceipts:{...state.serviceReceipts,[row.receiptKey]:row}};
}
/** Resolve terms before custody changes. Explicit and specified addresses never fall through a gap. */
export function serviceReceiver(world:SeatsWorld,state:State,region:RegionId,department:State['forceBlockStates'][ForceBlockId]['fbDepartment'],terms:Pick<ServiceJourney,'serviceReceiver'|'serviceStation'>,day:number,navalArm?:string) {
 const stations=world.map.world.rules.serviceStations??[];
 let candidates=terms.serviceStation===undefined?stations.filter(s=>s.region===region&&s.kind==='station'):stations.filter(s=>s.id===terms.serviceStation&&s.region===region);
 // Opposing national departments can occupy the same model region; they are not an overlap in this service root.
 candidates=candidates.filter(s=>(state.postStates[s.post]?.postDepartment??world.start.temporaryPosts.find(p=>p.id===s.post)?.department)===department);
 let reason:ServiceReceiptReason=terms.serviceStation===undefined?'local_station':'specified_station';
 if(terms.serviceReceiver===undefined && terms.serviceStation===undefined && candidates.length===0){candidates=stations.filter(s=>s.region===region&&s.kind==='territory'&&(state.postStates[s.post]?.postDepartment??world.start.temporaryPosts.find(p=>p.id===s.post)?.department)===department);reason='territory_default_I';}
 if(terms.serviceReceiver===undefined && (candidates.length>1 || candidates.some(s=>s.partial)))return {post:null,reason:'ambiguous_territory' as const};
 const to=terms.serviceReceiver??candidates[0]?.post;
 if(to===undefined || !state.postStates[to])return {post:null,reason:'missing_post' as const};
 const post=state.postStates[to]!;
 const authority=terms.serviceReceiver===undefined?mandateAt(state,to,candidates[0]!.mandate):currentMandates(state,to).find(a=>activeMandate(world.map,state,a,day)&&a.authorityGrant.mandateRegions.includes(region));
 if(post.postHolder===null || !authority || !activeMandate(world.map,state,authority,day) || !authority.authorityGrant.mandateRegions.includes(region))return {post:null,reason:'unopened_post' as const};
 if(navalArm!==undefined && terms.serviceReceiver===undefined && (!candidates[0]?.arms?.includes(navalArm) || !authority.authorityGrant.mandateModes.includes('sea')))return {post:null,reason:'special_assignment' as const};
 return {post:to,reason:terms.serviceReceiver===undefined?reason:'explicit_receiver' as const};
}
export function serviceReceipt(world:SeatsWorld, state:State, block:ForceBlockId, terms:ServiceJourney, day:number):State {
 const force=state.forceBlockStates[block], loc=state.forceLocations[block];
 if(!force || !loc || loc.locMarch!==null || loc.locAboard!==null || terms.servicePurpose==='transit')return state;
 const key=`${terms.serviceOrder}|${force.fbLots.map(l=>l.lotId).sort().join('|')}`;
 if(state.serviceReceipts?.[key]?.receiptStatus==='received')return state;
 const from=state.forceAssignments[block]??null;
 const base={receiptKey:key,receiptOrder:terms.serviceOrder,receiptLots:force.fbLots.map(l=>l.lotId),receiptFrom:from,receiptTo:null,receiptRegion:loc.locRegion,srecDay:day,receiptStatus:'gap' as const};
 const gap=(reason:ServiceReceiptReason)=>{
   const old=state.serviceReceipts?.[key];
   return old?.receiptReason===reason?state:putServiceReceipt(state,{...base,receiptReason:reason});
 };
 if(force.fbSurrenderedDay!==null || force.fbLots.some(l=>l.lotMen===0 || l.lotService?.enlEndsDay!==null && l.lotService?.enlEndsDay!==undefined && day>=l.lotService.enlEndsDay))return gap('expired');
 if(pendingOffer(state,block))return gap('offer_pending');
 const resolved=serviceReceiver(world,state,loc.locRegion,force.fbDepartment,terms,day,world.map.world.vocabularies.arms.some(a=>a.id===force.fbArm&&a.naval)?force.fbArm:undefined);
 if(resolved.post===null)return gap(resolved.reason);
 const to=resolved.post, post=state.postStates[to]!;
 if(force.fbDepartment!==post.postDepartment || from!==null && factionOfPost(world.map,state,from)!==factionOfPost(world.map,state,to))return gap('state_root');
 if(terms.serviceReceiver===undefined && from!==null && !['office','filter'].includes(world.roleOf(state.postStates[from]?.postKind??'')??''))return gap('special_assignment');
 const next=regroupAssignments(state,[],[{block,post:to}]);
 return putServiceReceipt(next,{...base,receiptTo:to,receiptStatus:'received',receiptReason:resolved.reason});
}
