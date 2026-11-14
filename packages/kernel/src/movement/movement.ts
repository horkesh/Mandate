/**
 * Movement (FOUNDATION section 10): the only writer of where a force block
 * stands (0050: "a block's region by `movement`").
 *
 * A block stands in a region, or is aboard a naval block (troops stand in a
 * river or sea region only aboard a ship, 0050). A block aboard moves with its
 * ship and has no march of its own.
 */
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import type { ScenarioStart } from '../world/scenario.ts';

/** Where one block is. Immutable: `movement` replaces it whole. */
export interface ForceLocation {
  /** The region it stands in (a ship's region, for a block aboard). */
  readonly locRegion: RegionId;
  /** The naval block carrying it, or null. */
  readonly locAboard: ForceBlockId | null;
  /** The day it reached this region (0 at setup). */
  readonly locSinceDay: number;
}

export type LocationTable = Readonly<Record<ForceBlockId, ForceLocation>>;

export class MovementError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid movement:\n- ${problems.join('\n- ')}`);
    this.name = 'MovementError';
  }
}

/**
 * Where each block stands at a scenario start, copied once into State (0050).
 * Checks every block's region exists, that an off-map box is not stood in by
 * land troops, that a block aboard names a block in the same region that is
 * not itself aboard, and that non-naval troops on water are aboard.
 */
export function initialLocations(map: WorldIndex, start: ScenarioStart): LocationTable {
  const naval = new Set(map.world.vocabularies.arms.filter((a) => a.naval).map((a) => a.id));
  const byId = new Map(start.forceBlocks.map((b) => [b.id, b]));
  const problems: string[] = [];
  const out: Record<ForceBlockId, ForceLocation> = {};
  for (const b of [...start.forceBlocks].sort((x, y) => strictCompare(x.id, y.id))) {
    const region = map.regions.get(b.region);
    if (region === undefined) {
      problems.push(`force block ${b.id}: region ${b.region} is not in the World`);
      continue;
    }
    if (b.aboard !== null) {
      const ship = byId.get(b.aboard);
      if (ship === undefined) problems.push(`force block ${b.id}: aboard ${b.aboard}, which is not a force block`);
      else {
        if (!naval.has(ship.arm)) problems.push(`force block ${b.id}: aboard ${b.aboard}, which is not naval`);
        if (ship.region !== b.region) problems.push(`force block ${b.id}: aboard ${b.aboard}, which stands in ${ship.region}, not ${b.region}`);
        if (ship.aboard !== null) problems.push(`force block ${b.id}: aboard ${b.aboard}, which is itself aboard another`);
      }
    } else if ((region.kind === 'river' || region.kind === 'sea') && !naval.has(b.arm)) {
      problems.push(`force block ${b.id}: troops stand in ${b.region} (${region.kind}) only aboard a ship`);
    }
    out[b.id] = { locRegion: b.region, locAboard: b.aboard, locSinceDay: 0 };
  }
  if (problems.length > 0) throw new MovementError(problems);
  return out;
}

/** Where a block is. Throws on an unknown block. */
export function locationOf(state: State, id: ForceBlockId): ForceLocation {
  const l = state.forceLocations[id];
  if (l === undefined) throw new MovementError([`unknown force block ${id}`]);
  return l;
}

/** The blocks standing in a region (aboard ships there included), in id order. */
export function blocksIn(state: State, region: RegionId): ForceBlockId[] {
  return (Object.keys(state.forceLocations) as ForceBlockId[]).filter((id) => state.forceLocations[id]!.locRegion === region).sort(strictCompare);
}
