/** Movement's half of a conserved whole-lot partition. */
import type { ForceBlockId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { LotGroup } from '../forces/regroup.ts';
import { MovementError } from './movement.ts';

export function regroupLocations(state: State, sources: readonly ForceBlockId[], groups: readonly LotGroup[]): State {
  const first=state.forceLocations[sources[0]!];
  if(first===undefined || first.locMarch!==null || first.locAboard!==null || sources.some(id=>{
    const l=state.forceLocations[id];
    return l===undefined || l.locRegion!==first.locRegion || l.locMarch!==null || l.locAboard!==null || state.forceJoins[id]!==undefined;
  })) throw new MovementError(['regrouping requires stationary colocated forces with no pending join']);
  const locations={...state.forceLocations};
  for(const id of sources)delete locations[id];
  for(const g of groups)locations[g.block]={...first};
  return {...state,forceLocations:locations};
}
