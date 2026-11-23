/** Whole-lot partitioning (0108). No identity, quantity or service is recreated. */
import { strictCompare } from '../compare.ts';
import type { ForceBlockId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { ForcesError, type ForceBlockState } from './forces.ts';
import type { RegimentLot } from './lots.ts';

export interface LotGroup {
  readonly block: ForceBlockId;
  readonly lots: readonly string[];
  readonly name: string;
}

/** Integer floors and stable destination-id remainders, separately for each source. */
export function integerShares(total: number, weights: readonly number[], ids: readonly string[]): number[] {
  const sum=weights.reduce((a,b)=>a+b,0);
  const out=weights.map(w=>sum===0?0:Math.trunc(total*w/sum));
  let left=total-out.reduce((a,b)=>a+b,0);
  for(const i of ids.map((id,i)=>({id,i})).sort((a,b)=>strictCompare(a.id,b.id)).map(x=>x.i)) {
    if(left>0&&weights[i]!>0){out[i]=out[i]!+1;left--;}
  }
  if(left!==0) throw new ForcesError(['quantity has no receiving lot']);
  return out;
}

/** All source lots occur exactly once. Caller validates colocated movement and local authority. */
export function regroupForces(state: State, sources: readonly ForceBlockId[], groups: readonly LotGroup[]): State {
  if(sources.length===0||new Set(sources).size!==sources.length||new Set(groups.map(g=>g.block)).size!==groups.length) throw new ForcesError(['invalid partition']);
  const entries=new Map<string,{lot:RegimentLot;source:ForceBlockId}>();
  for(const id of sources){
    const b=state.forceBlockStates[id];
    if(b===undefined||b.fbKind!=='block'||b.fbSurrenderedDay!==null) throw new ForcesError(['unavailable source']);
    for(const lot of b.fbLots){if(entries.has(lot.lotId))throw new ForcesError(['duplicate lot']);entries.set(lot.lotId,{lot,source:id});}
  }
  const used=new Set<string>();
  for(const g of groups){
    if(g.lots.length===0||(!sources.includes(g.block)&&state.forceBlockStates[g.block]!==undefined))throw new ForcesError(['invalid destination']);
    for(const id of g.lots){if(!entries.has(id)||used.has(id))throw new ForcesError(['duplicate or foreign lot']);used.add(id);}
    const records=g.lots.map(id=>state.forceBlockStates[entries.get(id)!.source]!);
    if(records.some(b=>b.fbArm!==records[0]!.fbArm||b.fbDepartment!==records[0]!.fbDepartment))throw new ForcesError(['incompatible forces']);
  }
  if(sources.some(source=>Object.values(state.forceBlockStates).some(child=>child.fbParent===source)&&!groups.some(g=>g.block===source)))throw new ForcesError(['a detached regiment must rejoin before its parent can be replaced']);
  if(used.size!==entries.size)throw new ForcesError(['partition omits lots']);
  // Native stores are per-person milli-days. Conserve ration quantities, not the sum of durations.
  const stores=groups.map(()=>0), unknown=groups.map(()=>false), noncombatants=groups.map(()=>0);
  const durations:(number|null)[][]=groups.map(()=>[]);
  for(const source of sources){
    const b=state.forceBlockStates[source]!;
    const known=b.fbLots.every(l=>l.lotMen!==null);
    const men=groups.map(g=>g.lots.reduce((n,id)=>{const x=entries.get(id)!;return n+(x.source===source?(x.lot.lotMen??0):0);},0));
    const weights=known&&men.reduce((n,w)=>n+w,0)>0?men:groups.map(g=>g.lots.filter(id=>entries.get(id)!.source===source).length);
    const civilians=integerShares(b.fbNonCombatants,weights,groups.map(g=>g.block));
    for(let i=0;i<groups.length;i++){
      noncombatants[i]=noncombatants[i]!+civilians[i]!;
      if(!groups[i]!.lots.some(id=>entries.get(id)!.source===source))continue;
      durations[i]!.push(b.fbStoresMilli);
      if(!known||b.fbStoresMilli===null)unknown[i]=true;
      else stores[i]=stores[i]!+b.fbStoresMilli*(men[i]!+civilians[i]!);
      if(!Number.isSafeInteger(stores[i]))throw new ForcesError(['ration quantity exceeds the integer range']);
    }
  }
  const blocks:Record<ForceBlockId,ForceBlockState>={...state.forceBlockStates};
  for(const source of sources)delete blocks[source];
  groups.forEach((g,i)=>{
    const lots=g.lots.map(id=>entries.get(id)!.lot);
    const originals=[...new Set(g.lots.map(id=>entries.get(id)!.source))].map(id=>state.forceBlockStates[id]!);
    const weight=(b:ForceBlockState)=>Math.max(1,lots.filter(l=>b.fbLots.includes(l)).reduce((n,l)=>n+(l.lotMen??0),0));
    const blend=(field:'fbMorale'|'fbExperience'|'fbEquipment')=>Math.trunc(originals.reduce((n,b)=>n+b[field]*weight(b),0)/originals.reduce((n,b)=>n+weight(b),0));
    const need=lots.reduce((n,l)=>n+(l.lotMen??0),0)+noncombatants[i]!;
    const common=durations[i]!.every(d=>d===durations[i]![0])?durations[i]![0]!:null;
    const rationAmount=stores[i]??0;
    if(!unknown[i]&&need>0&&rationAmount%need!==0)throw new ForcesError(['ration balance is not exactly representable in milli-days']);
    const duration=unknown[i]||need===0?common:Math.trunc(rationAmount/need);
    blocks[g.block]={...originals[0]!,fbName:g.name,fbLots:lots,fbStoresMilli:duration,fbNonCombatants:noncombatants[i]!,fbMorale:blend('fbMorale'),fbExperience:blend('fbExperience'),fbEquipment:blend('fbEquipment')};
  });
  return {...state,forceBlockStates:blocks};
}
