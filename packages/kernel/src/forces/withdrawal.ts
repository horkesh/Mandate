/** A sourced theatre exit, not a combat loss or an invented prisoner return. */
import { forceTotals } from './lots.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { ForceWithdrawal } from '../situations/types.ts';

/** The whole existing contingent must still be in the cited theatre, including detachments. */
export function withdrawalBlocks(state: State, w: ForceWithdrawal): readonly ForceBlockId[] {
  const root = state.forceBlockStates[w.block];
  if (root === undefined || root.fbSurrenderedDay !== null || forceTotals(root).fbStrength === 0) return [];
  const selected = new Set<ForceBlockId>([w.block]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [id, b] of Object.entries(state.forceBlockStates)) {
      if (b.fbParent !== null && selected.has(b.fbParent) && !selected.has(id as ForceBlockId)) {
        selected.add(id as ForceBlockId); changed = true;
      }
    }
  }
  for (const id of selected) {
    const loc = state.forceLocations[id];
    if (loc === undefined || loc.locAboard !== null || loc.locMarch !== null || !w.regions.includes(loc.locRegion)) return [];
  }
  return [...selected].sort(strictCompare);
}
