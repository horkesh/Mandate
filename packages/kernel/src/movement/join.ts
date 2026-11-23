/**
 * A block's order to join its post at the post's seat (lane 1.12; the lead's ruling, Fix 1: "a transfer concentrates").
 * Part of `movement`, the only writer of location and of these orders.
 *
 * A transfer between posts (0033) hands blocks to the receiving post; it also orders each block to join that post where
 * it sits: the post's home region in pack data (`postSeat`, the start's `region`), such as Washington for the post
 * commanding Washington's defences. This is an order to join, not a plan: no assault and no planner. Each day the
 * operations phase starts each joining block's next leg by movement's own routes (the quickest legs the side may take,
 * so by rail where the side traces the line), until the block stands at the seat. The order ends there, or when the
 * block is no longer the post's (transferred again, released), surrenders, is gone, or enters one of the post's
 * operations, which then moves it. A block that finds no route waits, re-checked each day, with the typed reason.
 */
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';

/** Why a joining block is not on its way today; null while it can march. */
export type JoinBar = 'no_route';

export interface ForceJoin {
  readonly joinOffer?: MessageId;
  readonly joinPost: PostId;
  readonly joinRegion: RegionId;
  readonly joinSinceDay: number;
  /** Why it waits (hard rule 6): set the day it finds no route, cleared when it marches again. */
  readonly joinBlocked: JoinBar | null;
}

export type JoinTable = Readonly<Record<ForceBlockId, ForceJoin>>;

/** Order blocks to join `post` at `region` from `day` (replacing any order they had). */
export function orderJoins(state: State, blocks: readonly ForceBlockId[], post: PostId, region: RegionId, day: number): State {
  if (blocks.length === 0) return state;
  const next: Record<ForceBlockId, ForceJoin> = { ...state.forceJoins };
  for (const b of [...blocks].sort(strictCompare)) next[b] = { joinPost: post, joinRegion: region, joinSinceDay: day, joinBlocked: null };
  return { ...state, forceJoins: next };
}

/** End the join orders of `blocks` (arrived, or no longer joining). */
export function endJoins(state: State, blocks: readonly ForceBlockId[]): State {
  const drop = blocks.filter((b) => state.forceJoins[b] !== undefined);
  if (drop.length === 0) return state;
  const next: Record<ForceBlockId, ForceJoin> = { ...state.forceJoins };
  for (const b of drop) delete next[b];
  return { ...state, forceJoins: next };
}

/** Record why each of `blocks` waits today (or that it marches again, with null). */
export function markJoins(state: State, blocks: readonly ForceBlockId[], bar: JoinBar | null): State {
  const change = blocks.filter((b) => state.forceJoins[b] !== undefined && state.forceJoins[b]!.joinBlocked !== bar);
  if (change.length === 0) return state;
  const next: Record<ForceBlockId, ForceJoin> = { ...state.forceJoins };
  for (const b of change) next[b] = { ...next[b]!, joinBlocked: bar };
  return { ...state, forceJoins: next };
}

/** The destination is the call's, while the join post remains the governor's. */
export function orderOfferJoins(state: State, blocks: readonly ForceBlockId[], owner: PostId, region: RegionId, day: number, offer: MessageId): State {
 const next = orderJoins(state,blocks,owner,region,day);
 const joins = {...next.forceJoins};
 for (const b of blocks) joins[b] = {...joins[b]!,joinOffer:offer};
 return {...next,forceJoins:joins};
}
