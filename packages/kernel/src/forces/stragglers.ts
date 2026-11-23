import { forceTotals } from './lots.ts';
/**
 * Stragglers rejoin (FOUNDATION section 10's stragglers row, owned by `forces`; the combat note's P8). Missing men are
 * mostly absent, not dead (Fox; Lee's army in September 1862): each day a block in supply and out of battle takes back
 * the pack's share of its stragglers, at least one man while any are out, so a routed army returns over weeks.
 */
import { strictCompare } from '../compare.ts';
import type { ForceBlockId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { SupplyResult } from '../supply/supply.ts';
import type { WorldIndex } from '../world/index.ts';
import { applyForces, factionOfBlock, type ForceChange, type ForceDelta } from './forces.ts';

/** One day's return for every block with stragglers, standing in a region its side supplies, not in battle today, not surrendered. */
export function stragglersStep(map: WorldIndex, state: State, supply: SupplyResult, inBattle: ReadonlySet<ForceBlockId>): { readonly state: State; readonly changes: readonly ForceChange[] } {
  const rate = map.world.rules.combat.straggleReturnPermille;
  const deltas: ForceDelta[] = [];
  if (rate === 0) return { state, changes: [] };
  for (const block of (Object.keys(state.forceBlockStates) as ForceBlockId[]).sort(strictCompare)) {
    const b = state.forceBlockStates[block]!;
    if (forceTotals(b, map.forceTotalsCache).fbStragglers === 0 || forceTotals(b, map.forceTotalsCache).fbStrength === null || b.fbSurrenderedDay !== null || inBattle.has(block)) continue;
    const loc = state.forceLocations[block];
    const faction = factionOfBlock(map, state, block);
    if (loc === undefined || faction === null || supply.factions.get(faction)?.paths.has(loc.locRegion) !== true) continue;
    const men = Math.min(forceTotals(b, map.forceTotalsCache).fbStragglers, Math.max(1, Math.trunc((forceTotals(b, map.forceTotalsCache).fbStragglers * rate) / 1000)));
    deltas.push({ change: 'stragglers_returned', block, men, cause: 'attrition' });
  }
  return applyForces(state, deltas);
}
