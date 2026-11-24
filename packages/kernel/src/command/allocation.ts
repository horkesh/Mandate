import { allocationPaper, forceAssignmentFor } from './force-requests.ts';
import type { RetentionShortfalls } from './force-requests.ts';
/** Command owns received allocation undertakings; force and movement truths stay with their owners. */
import { activeMandate, authorityBlocks, inSubtree, mandateAt, mayCommit } from './authority.ts';
import { commandedBlocks, factionOfPost } from './command.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, PersonId, PostId } from '../ids.ts';
import type { RegimentLot } from '../forces/lots.ts';
import type { ReportedAvailableLot } from '../knowledge/report.ts';
import { responseKey } from '../proxy/responses.ts';
import type { State } from '../root-state.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { AllocationInstrument, AllocationScope } from '../world/allocation.ts';
import { sameLetterFamily } from '../world/letters.ts';

export type AllocationReason = 'named_absent' | 'scope_unavailable' | 'offer_unreceived' | 'reserved' |
  'committed' | 'in_transit' | 'elsewhere' | 'discharged' | 'authority_unavailable' | 'refused' | 'deferred' | 'superseded' |
  'retain_for_own_mission' | 'retention_comparison_undetermined';
export interface AllocationRecord {
  readonly allocOrder: MessageId;
  readonly allocPaper: string;
  readonly allocDay: number;
  readonly allocSender: PersonId;
  readonly allocStrongest: boolean;
  readonly allocLots: readonly string[];
  readonly allocBlocks: readonly ForceBlockId[];
  /** Exact reserved lot IDs by journey container, retained after departure or removal. */
  readonly allocBlockLots?: Readonly<Record<ForceBlockId, readonly string[]>>;
  readonly allocLostLots?: readonly string[];
  readonly allocReceived: readonly ForceBlockId[];
  readonly allocShortfall: number;
  readonly allocRetention?: RetentionShortfalls;
  /** A complying paper found no eligible lot at receipt, after passing paper-level authority. */
  readonly allocWaitForLots?: true;
  /** Lot identities that became eligible after this complying order deferred. */
  readonly allocReadyLots?: readonly string[];
  readonly allocReasons: readonly AllocationReason[];
  readonly allocStatus: 'pending' | 'received' | 'shortfall' | 'refused' | 'deferred' | 'superseded';
}
export function putAllocation(state: State, row: AllocationRecord): State {
  return {...state,allocationRecords:{...state.allocationRecords,[row.allocOrder]:row}};
}

function lotAvailabilityReason(reason: string | null): boolean {
  return reason==='named_absent' || reason==='scope_unavailable' || reason==='offer_unreceived' || reason==='reserved' ||
    reason==='committed' || reason==='in_transit' || reason==='elsewhere' || reason==='discharged';
}

/** A legacy deferral could report candidate exclusions under a paper the holder accepted. */
export function legacyLotDeferral(state: State, row: AllocationRecord, reasons: readonly (string | null)[] = row.allocReasons): boolean {
  if(!reasons.length || !reasons.every(r=>r==='authority_unavailable'||lotAvailabilityReason(r)))return false;
  if(row.allocWaitForLots===true)return true;
  if(row.allocStatus!=='deferred'||row.allocLots.length!==0)return false;
  const answer=state.orderResponses[responseKey(row.allocOrder,row.allocSender)];
  return answer?.respKind==='allocation' && answer.respRole==='addressee' && answer.respDay===row.allocDay &&
    ['exceed','comply','comply_with_reservations'].includes(answer.respActual) && answer.respConditions.length===0 &&
    answer.respUndertaking?.clauses.includes('destination')===true && answer.respUndertaking.clauses.includes('detail');
}

export function lotDeferredAllocation(state: State, row: AllocationRecord): boolean {
  return row.allocStatus==='deferred' && row.allocStrongest && row.allocLots.length===0 &&
    (row.allocWaitForLots===true || legacyLotDeferral(state,row));
}

/** A request across departments may seek the governor's own undertaking under 0124 and 0126. */
export function governorUndertaking(world:SeatsWorld, paper:AllocationInstrument):boolean {
  if(paper.voluntary===true)return true;
  if(paper.kind!=='request')return false;
  const posts=[...world.start.posts,...world.start.temporaryPosts];
  const owner=posts.find(p=>p.id===paper.from), recipient=posts.find(p=>p.id===paper.to);
  return owner!==undefined && recipient!==undefined && owner.department!==recipient.department &&
    world.map.world.rules.recruitment.raisingPostKinds.includes(owner.kind);
}

export function allocationAuthority(world: SeatsWorld, state: State, paper: AllocationInstrument, day: number, blocks: readonly ForceBlockId[] = [], ownOrder?: MessageId, selectedLots?:ReadonlySet<string>): boolean {
  const ownRequest=forceAssignmentFor(state,paper.id)?.request;
  if(ownRequest && (state.planRecords[ownRequest.freqNeed.needPost]?.planOrder!==ownRequest.freqNeed.needMission || state.postStates[ownRequest.freqNeed.needPost]?.postHolder!==ownRequest.freqNeed.needPerson))return false;
  if(paper.subordinateOrder===true && (paper.issuerPost===null || paper.issuerPost===paper.from || paper.from===paper.to || paper.scope.kind!=='cohort' ||
    world.map.world.rules.recruitment.raisingPostKinds.includes(state.postStates[paper.from]?.postKind??'') ||
    blocks.some(b=>state.forceAssignments[b]!==paper.from)))return false;
  const side=factionOfPost(world.map,state,paper.from);
  if(governorUndertaking(world,paper)) {
    const owner=state.postStates[paper.from], toSide=factionOfPost(world.map,state,paper.to);
    if(owner===undefined || toSide===null || side!==null && side!==toSide ||
      !blocks.every(b=>state.forceAssignments[b]===paper.from&&state.forceBlockStates[b]?.fbDepartment===owner.postDepartment))return false;
    if(paper.voluntary===true)return owner.postHolder===paper.issuer && paper.issuerPost===paper.from &&
      world.map.world.rules.recruitment.raisingPostKinds.includes(owner.postKind);
    if(paper.issuerPost===null)return world.start.factions.some(f=>f.principal===paper.issuer && f.faction===toSide);
    const authority=mandateAt(state,paper.issuerPost,paper.mandate!);
    if(!authority || !activeMandate(world.map,state,authority,day) || factionOfPost(world.map,state,paper.issuerPost)!==toSide)return false;
    const grant=authority.authorityGrant;
    return grant.mandateHolder===paper.issuer && grant.mandateActions.includes('assign') &&
      inSubtree(state,paper.to,paper.issuerPost) && grant.mandateRecipients.some(r=>inSubtree(state,paper.to,r)) &&
      grant.mandateRegions.includes(paper.destination) && (paper.modes??['land']).every(m=>grant.mandateModes.includes(m));
  }
  if (side===null || factionOfPost(world.map,state,paper.to)!==side) return false;
  if (paper.issuerPost===null) return world.start.factions.some(f=>f.principal===paper.issuer && f.faction===side);
  const authority=mandateAt(state,paper.issuerPost,paper.mandate!);
  if (!authority || !activeMandate(world.map,state,authority,day)) return false;
  const g=authority.authorityGrant;
  return g.mandateHolder===paper.issuer && g.mandateActions.includes('assign') &&
    inSubtree(state,paper.from,paper.issuerPost) && inSubtree(state,paper.to,paper.issuerPost) &&
    [paper.from,paper.to].every(p=>g.mandateRecipients.some(r=>inSubtree(state,p,r))) &&
    g.mandateRegions.includes(paper.destination) && blocks.every(b=>g.mandateRegions.includes(state.forceLocations[b]!.locRegion)) &&
    (blocks.length===0 || mayCommit(world.map,state,authority,paper.from,blocks,ownOrder??true,selectedLots));
}
export function scopeMatches(lot: RegimentLot, paper: AllocationInstrument): boolean {
  return reportedScopeMatches(reportedLot(lot),paper.scope);
}
function reportedLot(lot:RegimentLot):ReportedAvailableLot {
  const service=lot.lotService;
  return {availRegiment:lot.lotGenerated?null:lot.lotRegiment,availArm:lot.lotArm,
    availCall:service?.enlCallId??null,availEndsDay:service?.enlEndsDay??null,
    availTermDays:service===null || service.enlTermUnknown?null:service.enlEndsDay===null?'indefinite':service.enlEndsDay-service.enlMusterDay};
}
export function reportedScopeMatches(lot:ReportedAvailableLot, scope:AllocationScope):boolean {
  if(scope.calls!==undefined && (lot.availCall===null || !scope.calls.includes(lot.availCall)))return false;
  if(scope.kind==='named')return lot.availRegiment!==null && scope.regiments.includes(lot.availRegiment);
  return (scope.arm===undefined || scope.arm===lot.availArm) &&
    (lot.availTermDays==='indefinite' || lot.availTermDays!==null && lot.availTermDays>=scope.minTermDays);
}

function holdingAvailability(state:State, day:number, governor:boolean) {
  const reserved=new Set(Object.values(state.allocationRecords??{}).filter(r=>r.allocStatus==='pending').flatMap(r=>r.allocBlocks.filter(b=>!r.allocReceived.includes(b)).flatMap(b=>state.forceBlockStates[b]?.fbLots.map(l=>l.lotId)??[])));
  const operations=Object.values(state.operationRecords);
  const active=new Set(operations.filter(op=>op.opEndDay===null).flatMap(op=>op.opAxes.flatMap(a=>a.oaxBlocks)));
  const drafted=new Set(Object.entries(state.planRecords).flatMap(([post,plan])=>{
    // The approved draft remains on file after its operation ends. Its alternatives no longer reserve lots.
    const completed=plan.planStatus==='approved' && plan.planApproved!==null && operations.some(op=>op.opEndDay!==null &&
      op.opPost===post && op.opOrder===plan.planOrder && op.opPlan===plan.planApproved!.id &&
      (op.opPurpose===undefined || op.opDraftDay===undefined || op.opDraftDay===plan.planDraft?.draftDay));
    return completed?[]:plan.planDraft?.draftCandidates.flatMap(c=>c.candAxes.flatMap(a=>a.axisBlocks))??[];
  }));
  const parents=new Set(Object.values(state.forceBlockStates).map(b=>b.fbParent));
  const received=new Set(Object.values(state.neutralOffers??{}).flatMap(o=>o.offerReceived));
  return (block:ForceBlockId,lot:RegimentLot):AllocationReason | undefined=>{
    const loc=state.forceLocations[block], force=state.forceBlockStates[block]!;
    const offer=lot.lotService && state.neutralOffers?.[lot.lotService.enlCall];
    if(lot.lotMen===0 || force.fbSurrenderedDay!==null || lot.lotService?.enlEndsDay!=null && day>=lot.lotService.enlEndsDay)return 'discharged';
    if(offer && !offer.offerReceived.includes(block) &&
      (lot.lotGenerated && (!governor || offer.offerStatus!=='recalled') || governor && offer.offerStatus==='offered' && offer.offerBlocks.includes(block)))return 'offer_unreceived';
    if(lot.lotGenerated && !offer && !governor && !received.has(block))return 'offer_unreceived';
    if(reserved.has(lot.lotId))return 'reserved';
    if(active.has(block) || drafted.has(block) || parents.has(block))return 'committed';
    if(!loc || loc.locMarch!==null || loc.locAboard!==null || state.forceJoins[block]!==undefined)return 'in_transit';
    return undefined;
  };
}

/** A governor's report describes his own held lots and their immediately known restrictions at authorship. */
export function governorHoldings(state:State, post:PostId, day:number):ReportedAvailableLot[] {
  const reason=holdingAvailability(state,day,true);
  return commandedBlocks(state,post).flatMap(block=>{
    const force=state.forceBlockStates[block];
    if(force?.fbKind!=='block' || force.fbDepartment!==state.postStates[post]?.postDepartment)return [];
    return force.fbLots.filter(l=>(l.lotService!==null || l.lotRegiment!==null) && reason(block,l)===undefined).map(reportedLot);
  });
}

/** A return records the holder's joined holdings. His own compliance and retention can still withhold them. */
export function reportedCommandHoldings(state:State,post:PostId,blocks:readonly ForceBlockId[],day:number):ReportedAvailableLot[] {
  return blocks.flatMap(block=>{
    const force=state.forceBlockStates[block], location=state.forceLocations[block];
    if(state.forceAssignments[block]!==post || force?.fbKind!=='block' || force.fbSurrenderedDay!==null ||
      !location || location.locMarch!==null || location.locAboard!==null || state.forceJoins[block]!==undefined)return [];
    return force.fbLots.filter(l=>l.lotMen!==0 && l.lotService!==null && (l.lotService.enlEndsDay===null || l.lotService.enlEndsDay>day)).map(reportedLot);
  });
}

export function allocationSelection(world: SeatsWorld, state: State, paper: AllocationInstrument, day: number, strongest=true, excluded:readonly string[]=[],direct=paper.subordinateOrder===true, included?:readonly string[]) {
  const reasons=new Set<AllocationReason>();
  const governor=governorUndertaking(world,paper);
  const mandated=!governor&&paper.issuerPost!==null;
  const availability=holdingAvailability(state,day,governor);
  const blocks=direct?commandedBlocks(state,paper.from):authorityBlocks(state,paper.from);
  const availableHoldings:string[]=[];
  const candidates=blocks.flatMap(block=>state.forceBlockStates[block]?.fbLots.map(lot=>({block,lot}))??[])
    .filter(({block,lot})=>{
      if(excluded.includes(lot.lotId) || included!==undefined&&!included.includes(lot.lotId) || !scopeMatches(lot,paper))return false;
      const reason=availability(block,lot) ?? (paper.atRegion!==undefined && state.forceLocations[block]!.locRegion!==paper.atRegion?'elsewhere':undefined);
      if(reason){reasons.add(reason);return false;}
      const isBlock=state.forceBlockStates[block]!.fbKind==='block';
      if(isBlock)availableHoldings.push(lot.lotId);
      if(!allocationAuthority(world,state,paper,day,[block],undefined,mandated?new Set([lot.lotId]):undefined)){
        reasons.add('authority_unavailable');
        return false;
      }
      return isBlock;
    }).sort((a,b)=>{
      const am=a.lot.lotMen,bm=b.lot.lotMen;
      return am===null||bm===null ? (am===bm?strictCompare(a.lot.lotId,b.lot.lotId):am===null?1:-1) :
        (strongest?bm-am:am-bm)||strictCompare(a.lot.lotId,b.lot.lotId);
    });
  const count=paper.quantity==='all'?candidates.length:paper.quantity;
  let selected=candidates.slice(0,count);
  if(mandated&&selected.length>1) {
    const permits=(rows:typeof selected)=>allocationAuthority(world,state,paper,day,[...new Set(rows.map(c=>c.block))],undefined,new Set(rows.map(c=>c.lot.lotId)));
    if(!permits(selected)) {
      selected=[];
      for(const candidate of candidates) {
        const proposed=[...selected,candidate];
        if(permits(proposed))selected=proposed;
        else reasons.add('authority_unavailable');
        if(selected.length===count)break;
      }
    }
  }
  const shortfall=paper.scope.kind==='named' && paper.quantity==='all' ? paper.scope.regiments.filter(id=>!selected.some(c=>c.lot.lotRegiment===id)).length : count-selected.length;
  if(selected.length===0 || shortfall>0) {
    if(paper.scope.kind==='named' && paper.scope.regiments.some(id=>!Object.values(state.forceBlockStates).some(b=>b.fbLots.some(l=>!l.lotGenerated&&l.lotRegiment===id))))reasons.add('named_absent');
    if(reasons.size===0)reasons.add('scope_unavailable');
  }
  return {lots:selected.map(c=>c.lot.lotId),blocks:[...new Set(selected.map(c=>c.block))],shortfall,reasons:[...reasons].sort(strictCompare),
    availableHoldings,eligibleLots:candidates.map(c=>c.lot.lotId)};
}
export function outstandingAllocation(world: SeatsWorld, state: State, row: AllocationRecord) {
  const p=allocationPaper(world,state,row.allocPaper);
  if(p?.subordinateOrder===true && lotDeferredAllocation(state,row))return p;
  if(!p || p.subordinateOrder===true || row.allocStatus==='refused' || row.allocStatus==='deferred' || row.allocStatus==='superseded' || row.allocReasons.includes('retain_for_own_mission'))return undefined;
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
    const p=allocationPaper(world,state,r.allocPaper);
    return p!==undefined && sameLetterFamily(p.letter,paper.letter);
  });
}
