/**
 * STAND-IN: a post's headquarters region, until lane 0.5 builds forces and the
 * real `movement` (the only writer of location). A standing goal "advance"
 * moves the headquarters one region at a time, at most once every
 * `marchDays`, so that latency changes as a commander moves away from the
 * wire and his reports change with where he is. No divisions move here.
 */
import type { PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { IndexedWorld } from '../standin/world.ts';

export interface Headquarters {
  readonly hqRegion: RegionId;
  /** The day it arrived there (0 at setup). */
  readonly hqSinceDay: number;
}

export function initialHeadquarters(world: IndexedWorld): Readonly<Record<PostId, Headquarters>> {
  const out: Record<PostId, Headquarters> = {};
  for (const id of world.postIds) out[id] = { hqRegion: world.post(id).region, hqSinceDay: 0 };
  return out;
}

/** Where a post's headquarters is now. Throws for an unknown post. */
export function headquartersOf(state: State, post: PostId): RegionId {
  const hq = state.headquarters[post];
  if (hq === undefined) throw new RangeError(`unknown post id "${post}" in headquarters`);
  return hq.hqRegion;
}

export function moveHeadquarters(state: State, post: PostId, region: RegionId, day: number): State {
  if (state.headquarters[post] === undefined) throw new RangeError(`unknown post id "${post}" in headquarters`);
  return { ...state, headquarters: { ...state.headquarters, [post]: { hqRegion: region, hqSinceDay: day } } };
}
