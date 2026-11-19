/**
 * Stores on hand (FOUNDATION section 4; decisions 0040, 0054): each day a
 * force block eats a day of its stores, and supply refills what its line
 * delivers. Part of `forces`, the only writer of stores; supply proposes, by
 * the allocation, and this applies.
 *
 * The model, stated so it can be checked:
 * - **Need.** A block of `s` men and `n` non-combatants needs
 *   `(s + n) / menPerCapacityUnit` of the pack's capacity scale a day, in
 *   milli-units, truncated (decision 0002). A block of no men needs nothing.
 * - **Demand.** Its daily need, and as much again while its stores are below
 *   the cap, so a block with a line refills a day a day.
 * - **Priority.** Demands are served in order of stores on hand, fewest first,
 *   then block id (`allocateInPriorityOrder`: each takes what its path's origin
 *   and edges still have, never maximum flow).
 * - **Change.** Delivered milli-units become milli-days (`delivered / need`
 *   days), less the day eaten, never past the cap. With no path (a pocket, or
 *   ground its side does not trace) nothing is delivered and stores fall a day.
 * - **Not modelled yet** (stated, not hidden): ships, and troops aboard on the
 *   water, live on their own stores without eating them until sea deliveries
 *   exist (Phase 1 operations); a neutral government's troops (no side) neither
 *   eat nor draw; an unknown strength or stores value stays unknown.
 *
 * Crossing the low-stores threshold is a truth event. The decision point belongs
 * to the garrison's or the staff's report of it, never to the event (0054).
 */
import { strictCompare } from '../compare.ts';
import type { FactionId, ForceBlockId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { allocateInPriorityOrder, type SupplyAllocation, type SupplyDemand, type SupplyResult } from '../supply/supply.ts';
import type { WorldIndex } from '../world/index.ts';
import type { StoresRules } from '../world/world.ts';
import { applyForces, factionOfBlock, STORES_MILLI, type ForceChange, type ForceDelta } from './forces.ts';

/** A block's stores crossing the low threshold, either way (truth, for reports to tell). */
export interface StoresCrossing {
  readonly block: ForceBlockId;
  readonly faction: FactionId;
  readonly region: RegionId;
  readonly direction: 'down' | 'up';
  readonly beforeMilli: number;
  readonly afterMilli: number;
  /** The block's stores began as a pack norm's, not a source's (lane 1.4). */
  readonly assumed: boolean;
}

export interface StoresResult {
  readonly state: State;
  readonly changes: readonly ForceChange[];
  readonly allocations: readonly SupplyAllocation[];
  readonly crossings: readonly StoresCrossing[];
}

/** A block's daily need in milli-units of the capacity scale; 0 when it has no men or its strength is unknown. */
export function dailyNeedMilli(rules: StoresRules, state: State, block: ForceBlockId): number {
  const b = state.forceBlockStates[block]!;
  if (b.fbStrength === null) return 0;
  return Math.trunc(((b.fbStrength + b.fbNonCombatants) * 1000) / rules.menPerCapacityUnit);
}

/** One day of eating and refilling for every block with a side, standing on land, with known strength and stores. */
export function storesStep(map: WorldIndex, state: State, supply: SupplyResult): StoresResult {
  // The pack's design parameters (`WorldRules.stores`), never kernel defaults.
  const rules = map.world.rules.stores;
  const cap = rules.capDays * STORES_MILLI;
  const low = rules.lowDays * STORES_MILLI;
  type Eater = { block: ForceBlockId; faction: FactionId; region: RegionId; need: number; stores: number };
  const eaters: Eater[] = [];
  for (const block of (Object.keys(state.forceBlockStates) as ForceBlockId[]).sort(strictCompare)) {
    const b = state.forceBlockStates[block]!;
    const loc = state.forceLocations[block];
    if (b.fbStoresMilli === null || loc === undefined) continue;
    const kind = map.regions.get(loc.locRegion)!.kind;
    // STAND-IN(owner: 1B, ships' stores; 0064; labelled by lane 1.4): ships and troops afloat neither eat nor draw stores.
    if (kind === 'river' || kind === 'sea' || kind === 'off_map') continue;
    const faction = factionOfBlock(map, state, block);
    if (faction === null) continue;
    const need = dailyNeedMilli(rules, state, block);
    if (need === 0) continue;
    eaters.push({ block, faction, region: loc.locRegion, need, stores: b.fbStoresMilli });
  }
  eaters.sort((x, y) => x.stores - y.stores || strictCompare(x.block, y.block));
  const demands: SupplyDemand[] = eaters.map((e) => ({ faction: e.faction, region: e.region, amountMilli: e.stores < cap ? e.need * 2 : e.need, label: e.block }));
  const allocations = allocateInPriorityOrder(supply, demands);
  const deltas: ForceDelta[] = [];
  const crossings: StoresCrossing[] = [];
  allocations.forEach((a, i) => {
    const e = eaters[i]!;
    const deliveredDays = Math.trunc((a.deliveredMilli * STORES_MILLI) / e.need);
    const after = Math.max(0, Math.min(Math.max(cap, e.stores), e.stores + deliveredDays - STORES_MILLI));
    if (after !== e.stores) deltas.push({ change: 'stores', block: e.block, milli: after - e.stores, cause: after < e.stores ? 'consumption' : 'supply' });
    if (e.stores >= low && after < low) crossings.push({ block: e.block, faction: e.faction, region: e.region, direction: 'down', beforeMilli: e.stores, afterMilli: after, assumed: state.forceBlockStates[e.block]!.fbStoresAssumed });
    if (e.stores < low && after >= low) crossings.push({ block: e.block, faction: e.faction, region: e.region, direction: 'up', beforeMilli: e.stores, afterMilli: after, assumed: state.forceBlockStates[e.block]!.fbStoresAssumed });
  });
  deltas.sort((x, y) => strictCompare(x.block, y.block));
  crossings.sort((x, y) => strictCompare(x.block, y.block));
  const applied = applyForces(state, deltas);
  return { state: applied.state, changes: applied.changes, allocations, crossings };
}
