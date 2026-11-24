/** Command owns received allocation undertakings; force and movement truths stay with their owners. */
import { activeMandate, authorityBlocks, inSubtree, mandateAt, mayCommit } from './authority.ts';
import { factionOfPost } from './command.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, PersonId } from '../ids.ts';
import type { RegimentLot } from '../forces/lots.ts';
import type { State } from '../root-state.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { AllocationInstrument } from '../world/allocation.ts';
import { sameLetterFamily } from '../world/letters.ts';

export type AllocationReason = 'named_absent' | 'scope_unavailable' | 'offer_unreceived' | 'reserved' |
  'committed' | 'in_transit' | 'elsewhere' | 'discharged' | 'authority_unavailable' | 'refused' | 'superseded';
export interface AllocationRecord {
  readonly allocOrder: MessageId;
  readonly allocPaper: string;
  readonly allocDay: number;
  readonly allocSender: PersonId;
  readonly allocStrongest: boolean;
  readonly allocLots: readonly string[];
  readonly allocBlocks: readonly ForceBlockId[];
  readonly allocReceived: readonly ForceBlockId[];
  readonly allocShortfall: number;
  readonly allocReasons: readonly AllocationReason[];
  readonly allocStatus: 'pending' | 'received' | 'shortfall' | 'refused' | 'superseded';
}
export function putAllocation(state: State, row: AllocationRecord): State {
  return {...state,allocationRecords:{...state.allocationRecords,[row.allocOrder]:row}};
}
export function allocationAuthority(world: SeatsWorld, state: State, paper: AllocationInstrument, day: number, blocks: readonly ForceBlockId[] = [], ownOrder?: MessageId): boolean {
  const side=factionOfPost(world.map,state,paper.from);
  if (side===null || factionOfPost(world.map,state,paper.to)!==side) return false;
  if (paper.issuerPost===null) return world.start.factions.some(f=>f.principal===paper.issuer && f.faction===side);
  const authority=mandateAt(state,paper.issuerPost,paper.mandate!);
  if (!authority || !activeMandate(world.map,state,authority,day)) return false;
  const g=authority.authorityGrant;
  return g.mandateHolder===paper.issuer && g.mandateActions.includes('assign') &&
    inSubtree(state,paper.from,paper.issuerPost) && inSubtree(state,paper.to,paper.issuerPost) &&
    [paper.from,paper.to].every(p=>g.mandateRecipients.some(r=>inSubtree(state,p,r))) &&
    g.mandateRegions.includes(paper.destination) && blocks.every(b=>g.mandateRegions.includes(state.forceLocations[b]!.locRegion)) &&
    (blocks.length===0 || mayCommit(world.map,state,authority,paper.from,blocks,ownOrder??true));
}
export function scopeMatches(lot: RegimentLot, paper: AllocationInstrument): boolean {
  const s=paper.scope, service=lot.lotService;
  if(s.kind==='named') return !lot.lotGenerated && lot.lotRegiment!==null && s.regiments.includes(lot.lotRegiment) &&
    (s.calls===undefined || service?.enlCallId!==undefined && s.calls.includes(service.enlCallId));
  return service!==null && (s.calls===undefined || service.enlCallId!==undefined && s.calls.includes(service.enlCallId)) && (s.arm===undefined || lot.lotArm===s.arm) &&
    !service.enlTermUnknown && (service.enlEndsDay===null || service.enlEndsDay-service.enlMusterDay>=s.minTermDays);
}
export function allocationSelection(world: SeatsWorld, state: State, paper: AllocationInstrument, day: number, strongest=true, excluded:readonly string[]=[]) {
  const reasons=new Set<AllocationReason>();
  const reserved=new Set(Object.values(state.allocationRecords??{}).filter(r=>r.allocStatus==='pending').flatMap(r=>r.allocBlocks.filter(b=>!r.allocReceived.includes(b)).flatMap(b=>state.forceBlockStates[b]?.fbLots.map(l=>l.lotId)??[])));
  const active=new Set(Object.values(state.operationRecords).filter(op=>op.opEndDay===null).flatMap(op=>op.opAxes.flatMap(a=>a.oaxBlocks)));
  const drafted=new Set(Object.values(state.planRecords).flatMap(p=>p.planDraft?.draftCandidates.flatMap(c=>c.candAxes.flatMap(a=>a.axisBlocks))??[]));
  const candidates=authorityBlocks(state,paper.from).flatMap(block=>state.forceBlockStates[block]?.fbLots.map(lot=>({block,lot}))??[])
    .filter(({block,lot})=>{
      if(excluded.includes(lot.lotId) || !scopeMatches(lot,paper))return false;
      const loc=state.forceLocations[block], force=state.forceBlockStates[block]!;
      const offer=lot.lotService && state.neutralOffers?.[lot.lotService.enlCall];
      let reason:AllocationReason|undefined;
      if(lot.lotMen===0 || force.fbSurrenderedDay!==null || lot.lotService?.enlEndsDay!==null && lot.lotService?.enlEndsDay!==undefined && day>=lot.lotService.enlEndsDay) reason='discharged';
      else if(lot.lotGenerated && (!offer || !offer.offerReceived.includes(block))) reason='offer_unreceived';
      else if(reserved.has(lot.lotId))reason='reserved';
      else if(active.has(block) || drafted.has(block) || Object.values(state.forceBlockStates).some(b=>b.fbParent===block))reason='committed';
      else if(!loc || loc.locMarch!==null || loc.locAboard!==null || state.forceJoins[block]!==undefined)reason='in_transit';
      else if(paper.atRegion!==undefined && loc.locRegion!==paper.atRegion)reason='elsewhere';
      else if(!allocationAuthority(world,state,paper,day,[block]))reason='authority_unavailable';
      if(reason){reasons.add(reason);return false;} return force.fbKind==='block';
    }).sort((a,b)=>{
      const am=a.lot.lotMen,bm=b.lot.lotMen;
      return am===null||bm===null ? (am===bm?strictCompare(a.lot.lotId,b.lot.lotId):am===null?1:-1) :
        (strongest?bm-am:am-bm)||strictCompare(a.lot.lotId,b.lot.lotId);
    });
  const count=paper.quantity==='all'?candidates.length:paper.quantity;
  const selected=candidates.slice(0,count);
  const shortfall=paper.scope.kind==='named' && paper.quantity==='all' ? paper.scope.regiments.filter(id=>!selected.some(c=>c.lot.lotRegiment===id)).length : count-selected.length;
  if(selected.length===0 || shortfall>0) {
    if(paper.scope.kind==='named' && paper.scope.regiments.some(id=>!Object.values(state.forceBlockStates).some(b=>b.fbLots.some(l=>!l.lotGenerated&&l.lotRegiment===id))))reasons.add('named_absent');
    if(reasons.size===0)reasons.add('scope_unavailable');
  }
  return {lots:selected.map(c=>c.lot.lotId),blocks:[...new Set(selected.map(c=>c.block))],shortfall,reasons:[...reasons].sort(strictCompare)};
}
export function outstandingAllocation(world: SeatsWorld, state: State, row: AllocationRecord) {
  const p=world.map.world.rules.allocationInstruments?.find(p=>p.id===row.allocPaper);
  if(!p || row.allocStatus==='refused' || row.allocStatus==='superseded')return undefined;
  if(p.quantity!=='all')return row.allocLots.length>=p.quantity?undefined:{...p,quantity:p.quantity-row.allocLots.length};
  if(p.scope.kind==='named') {
    const sent=new Set(Object.values(state.forceBlockStates).flatMap(b=>b.fbLots.filter(l=>row.allocLots.includes(l.lotId)).map(l=>l.lotRegiment)));
    const regiments=p.scope.regiments.filter(id=>!sent.has(id));
    return regiments.length?{...p,scope:{...p.scope,regiments}}:undefined;
  }
  return p.continuing || row.allocLots.length===0?p:undefined;
}
export function priorAllocations(world: SeatsWorld, state: State, paper: AllocationInstrument) {
  return Object.values(state.allocationRecords??{}).filter(r=>{
    const p=world.map.world.rules.allocationInstruments?.find(p=>p.id===r.allocPaper);
    return p!==undefined && sameLetterFamily(p.letter,paper.letter);
  });
}
