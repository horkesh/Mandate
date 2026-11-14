/**
 * The derived map: the control index and supply together, recomputed only
 * when something they depend on changes in a way that matters (FOUNDATION
 * sections 9 and 10).
 *
 * The cache is held by the caller, never in State, so nothing derived can be
 * saved. Its key is a signature of what the derivation reads:
 * - for every region that carries control, each faction's band against the
 *   pack's thresholds (under 50, 50 to 249, 250 and over, to start) and the
 *   region's holder (a holder can change hands with no threshold crossed,
 *   600/400 becoming 400/600, and that moves a front);
 * - the month (seasons);
 * - the network's condition (edge and depot condition, obstructions).
 *
 * FOUNDATION section 10 suggests a version counter bumped by the writer. A
 * signature computed from State is used instead: it cannot drift from the
 * control it describes, needs no extra State field, and a resumed game
 * rebuilds it for free. Computing it is linear in regions and costs well
 * under a millisecond on the Union map (the performance test).
 */
import { strictCompare } from '../compare.ts';
import type { FactionId, RegionId } from '../ids.ts';
import { canonicalJson } from '../serialize/canonical.ts';
import type { WorldIndex } from '../world/index.ts';
import type { RegionControlTable } from '../control/control.ts';
import { controlThresholds } from '../control/control.ts';
import { deriveSupply, INTACT_NETWORK, type NetworkConditions, type SupplyResult } from '../supply/supply.ts';
import { buildControlIndex, holdingOf, type ControlIndex } from './control-index.ts';

export interface DerivedMap {
  readonly signature: string;
  readonly index: ControlIndex;
  readonly supply: SupplyResult;
}

/** A caller-held cache: the last derivation and how many times it was rebuilt. */
export interface DerivedMapCache {
  entry: DerivedMap | null;
  recomputes: number;
}

export function createDerivedMapCache(): DerivedMapCache {
  return { entry: null, recomputes: 0 };
}

export interface MapInputs {
  readonly control: RegionControlTable;
  readonly month: number;
  readonly network?: NetworkConditions;
}

/** The signature the cache is keyed on. Equal signatures give equal derived maps. */
export function mapSignature(map: WorldIndex, inputs: MapInputs): string {
  const thresholds = controlThresholds(map);
  const threshold = map.world.rules.supplyControlPermille;
  const factions = map.world.factions.map((f) => f.id).sort(strictCompare);
  const parts: string[] = [`m${inputs.month}`];
  for (const region of [...map.regions.keys()].sort(strictCompare) as RegionId[]) {
    const kind = map.regions.get(region)!.kind;
    if (kind !== 'land' && kind !== 'key_point') continue;
    const shares = inputs.control[region];
    if (shares === undefined) continue;
    const bands = factions.map((f: FactionId) => {
      const s = shares[f] ?? 0;
      return thresholds.filter((t) => s >= t).length;
    });
    parts.push(`${region}:${bands.join('')}:${holdingOf(map, inputs.control, region, threshold).holder ?? '-'}`);
  }
  parts.push(canonicalJson(inputs.network ?? INTACT_NETWORK));
  return parts.join('|');
}

/** The derived map for these inputs, from the cache when the signature is unchanged. */
export function deriveMap(map: WorldIndex, inputs: MapInputs, cache?: DerivedMapCache): DerivedMap {
  const signature = mapSignature(map, inputs);
  if (cache?.entry && cache.entry.signature === signature) return cache.entry;
  const index = buildControlIndex(map, inputs.control);
  const supply = deriveSupply(map, index, inputs.month, inputs.network ?? INTACT_NETWORK);
  const derived: DerivedMap = { signature, index, supply };
  if (cache) {
    cache.entry = derived;
    cache.recomputes += 1;
  }
  return derived;
}
