/**
 * A governor's levy in hand, and the assignment of the blocks it musters (lane 1.7; FOUNDATION section 10: "standing
 * agreements and prior orders on a post", owned by `command`).
 *
 * A call the governor answered becomes a levy on his post: the regiments he will raise and the day they muster, as his
 * own compliance set them (`proxy` holds his response; the levy keeps its key). On the muster day recruitment's one
 * proposal makes the block, and `command`'s part of it is the block's post: the governor's. When the men's term ends
 * and the block disbands, `command` takes the assignment away.
 */
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, PersonId, PostId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { CommandError } from './command.ts';

/** A call answered and not yet mustered. Immutable: `command` replaces it whole. */
export interface Levy {
  /** The post whose holder raises it (a governor's). */
  readonly levyPost: PostId;
  readonly levyGovernor: PersonId;
  /** Who made the call. */
  readonly levyIssuer: PersonId;
  /** The call (the order's id). */
  readonly levyCall: MessageId;
  /** Regiments he will raise, after his compliance and the region's loyalty. */
  readonly levyRegiments: number;
  /** Men in them. */
  readonly levyMen: number;
  /** Days the men are enlisted for, from the muster. */
  readonly levyTermDays: number;
  /** The day they muster. */
  readonly levyMusterDay: number;
  /** His response to the call (`proxy`'s key). */
  readonly levyResponse: string;
}

/** Levies in hand, by the call's id. */
export type LevyTable = Readonly<Record<string, Levy>>;

/** A levy's key: the call it answers. */
export function levyKey(call: MessageId): string {
  return call;
}

/** Record a levy his answer to a call set (a call answers once: a second levy for the same call is refused). */
export function recordLevy(state: State, levy: Levy): State {
  const key = levyKey(levy.levyCall);
  if (Object.prototype.hasOwnProperty.call(state.postLevies, key)) throw new CommandError([`the call ${levy.levyCall} already has a levy`]);
  return { ...state, postLevies: { ...state.postLevies, [key]: levy } };
}

/** The levies that muster on or before `day`, by key. */
export function leviesDue(state: State, day: number): string[] {
  return Object.keys(state.postLevies)
    .filter((k) => state.postLevies[k]!.levyMusterDay <= day)
    .sort(strictCompare);
}

/** `command`'s part of a muster or a disbanding: levies mustered leave the post, new blocks join it, disbanded blocks leave it. */
export function musterAssignments(state: State, mustered: readonly string[], assign: readonly { readonly block: ForceBlockId; readonly post: PostId }[], unassign: readonly ForceBlockId[]): State {
  if (mustered.length === 0 && assign.length === 0 && unassign.length === 0) return state;
  const levies: Record<string, Levy> = { ...state.postLevies };
  const assignments: Record<ForceBlockId, PostId | null> = { ...state.forceAssignments };
  const problems: string[] = [];
  for (const k of mustered) {
    if (!Object.prototype.hasOwnProperty.call(levies, k)) problems.push(`no levy ${k}`);
    delete levies[k];
  }
  for (const a of assign) {
    if (Object.prototype.hasOwnProperty.call(assignments, a.block)) problems.push(`force block ${a.block} is already assigned`);
    if (state.postStates[a.post] === undefined) problems.push(`force block ${a.block}: post ${a.post} is not in State`);
    assignments[a.block] = a.post;
  }
  for (const b of unassign) {
    if (!Object.prototype.hasOwnProperty.call(assignments, b)) problems.push(`force block ${b} has no assignment`);
    delete assignments[b];
  }
  if (problems.length > 0) throw new CommandError(problems);
  return { ...state, postLevies: levies, forceAssignments: assignments };
}
