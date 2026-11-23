/** A strength request selects whole regiments by the sending commander's compliance. */
import { CommandError, commandedBlocks, factionOfPost, type TransferPick, type TransferResult } from '../command/command.ts';
import { regroupAssignments } from '../command/organisation.ts';
import { strictCompare } from '../compare.ts';
import { forceTotals } from '../forces/lots.ts';
import { toId, type ForceBlockId, type PostId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import { repartition } from './organisation.ts';

export function transferLots(map:WorldIndex,state:State,from:PostId,to:PostId,men:number,pick:TransferPick,day:number):TransferResult{
  if(from===to||factionOfPost(map,state,from)!==factionOfPost(map,state,to)||!Number.isSafeInteger(men)||men<1)throw new CommandError(['invalid regiment transfer']);
  const own=commandedBlocks(state,from).filter(id=>state.forceBlockStates[id]!.fbKind==='block'&&state.forceBlockStates[id]!.fbSurrenderedDay===null);
  const candidates=own.flatMap(block=>state.forceBlockStates[block]!.fbLots.map(lot=>({block,lot})))
    .filter(x=>{
      const count=x.lot.lotService?.enlRegiments;
      const counted=count!==undefined && count!==null && count>0;
      return x.lot.lotMen!==0 && (!map.world.organisationTemplates?.some(t=>t.army===to) || !map.world.rules.recruitment.raisingPostKinds.includes(state.postStates[from]!.postKind) || x.lot.lotRegiment!==null || counted);
    }).sort((a,b)=>{
      const am=a.lot.lotMen,bm=b.lot.lotMen;
      if(am===null||bm===null)return am===bm?strictCompare(a.lot.lotId,b.lot.lotId):am===null?1:-1;
      return (pick==='strongest_first'?bm-am:am-bm)||strictCompare(a.lot.lotId,b.lot.lotId);
    });
  const chosen=new Set<string>();let sent=0;
  for(const c of candidates){if(sent>=men)break;chosen.add(c.lot.lotId);sent+=c.lot.lotMen??0;}
  let next=state;const moved:ForceBlockId[]=[];
  for(const id of own){
    const b=next.forceBlockStates[id]!,going=b.fbLots.filter(l=>chosen.has(l.lotId));if(going.length===0)continue;
    if(going.length===b.fbLots.length){next=regroupAssignments(next,[],[{block:id,post:to}]);moved.push(id);continue;}
    const loc=next.forceLocations[id];
    // A regiment cannot split out of a marching container mid-leg. The sender waits for its stop.
    if(loc===undefined||loc.locMarch!==null||loc.locAboard!==null||next.forceJoins[id]!==undefined)continue;
    let n=1,det=toId('forceBlock',`${id}.transfer.${day}.${n}`);while(next.forceBlockStates[det]!==undefined)det=toId('forceBlock',`${id}.transfer.${day}.${++n}`);
    next=repartition(next,[id],[{block:id,lots:b.fbLots.filter(l=>!chosen.has(l.lotId)).map(l=>l.lotId),name:b.fbName},{block:det,lots:going.map(l=>l.lotId),name:b.fbName}],[from,to]);
    moved.push(det);
  }
  const following=commandedBlocks(state,from).filter(id=>{
    const b=state.forceBlockStates[id]!;
    return b.fbKind==='detachment'&&b.fbParent!==null&&moved.includes(b.fbParent)&&state.forceLocations[id]?.locRegion===state.forceLocations[b.fbParent]?.locRegion;
  });
  if(following.length>0){next=regroupAssignments(next,[],following.map(block=>({block,post:to})));moved.push(...following);moved.sort(strictCompare);}
  return {state:next,moved,menSent:moved.reduce((n,id)=>n+(forceTotals(next.forceBlockStates[id]!).fbStrength??0),0),rule:pick};
}
