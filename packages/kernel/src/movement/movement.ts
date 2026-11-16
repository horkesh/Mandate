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
import type { MarchLeg } from './march.ts';
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
  /** The leg it is on, or null when it stands still (`march.ts`). */
  readonly locMarch: MarchLeg | null;
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
    out[b.id] = { locRegion: b.region, locAboard: b.aboard, locSinceDay: 0, locMarch: null };
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

/** Where recruitment proposes a new block stand: its muster region, from the day it musters (lane 1.7). */
export interface MusterPlacement {
  readonly block: ForceBlockId;
  readonly region: RegionId;
  readonly day: number;
}

/**
 * Place new blocks and take disbanded ones off the map (lane 1.7): recruitment's one proposal, `movement`'s part of it.
 * A placed block must be new here, standing still on land; a removed block must be here. Blocks aboard a removed ship
 * stay where it was, no longer aboard.
 */
export function placeAndRemove(map: WorldIndex, state: State, placements: readonly MusterPlacement[], removals: readonly ForceBlockId[]): State {
  if (placements.length === 0 && removals.length === 0) return state;
  const next: Record<ForceBlockId, ForceLocation> = { ...state.forceLocations };
  const problems: string[] = [];
  for (const p of placements) {
    const region = map.regions.get(p.region);
    if (Object.prototype.hasOwnProperty.call(next, p.block)) problems.push(`force block ${p.block} is already placed`);
    else if (region === undefined || (region.kind !== 'land' && region.kind !== 'key_point')) problems.push(`force block ${p.block}: muster region ${p.region} is not land`);
    else next[p.block] = { locRegion: p.region, locAboard: null, locSinceDay: p.day, locMarch: null };
  }
  for (const id of [...removals].sort(strictCompare)) {
    if (!Object.prototype.hasOwnProperty.call(next, id)) problems.push(`force block ${id} is not placed`);
    delete next[id];
    for (const other of (Object.keys(next) as ForceBlockId[]).sort(strictCompare)) {
      if (next[other]!.locAboard === id) next[other] = { ...next[other]!, locAboard: null };
    }
  }
  if (problems.length > 0) throw new MovementError(problems);
  return { ...state, forceLocations: next };
}