/**
 * Posts as the seats layer reads them (Derived): pure reads of `command`'s and
 * `forces`' State and the World's post-kind roles. Lane 0.5 moved holders,
 * chains and strengths from the stand-in comms World into State; these keep
 * the seats layer's questions in one place.
 *
 * - A **field post** commands at least one force block directly: it has a
 *   standing goal, reports on the enemy and its strength, and its headquarters
 *   moves with its blocks.
 * - A **filter post** is one whose kind has the `filter` role (0058); its
 *   holder stands between the wire and his principal (0032).
 * - An **office** is any other post with a holder: its holder gives his word on
 *   the returns that reach him.
 * - A post's **headquarters** is where its strongest directly commanded block
 *   stands (by known men, ties by block id), or its seat when it commands none,
 *   or its side's capital when it has no seat.
 */
import { strictCompare } from '../compare.ts';
import { chainBelow, commandedBlocks, factionOfPost, heldPost, postIdsOf, postStateOf } from '../command/command.ts';
import type { FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { PostKindRole } from '../world/world.ts';
import type { SeatsWorld } from './world.ts';

/** A post's side, through its department; null for a neutral government's post. */
export function postFaction(world: SeatsWorld, state: State, post: PostId): FactionId | null {
  return factionOfPost(world.map, state, post);
}

/** A post's role, from its kind's (0058). */
export function postRole(world: SeatsWorld, state: State, post: PostId): PostKindRole | null {
  return world.roleOf(postStateOf(state, post).postKind);
}

/** Whether a post commands at least one force block directly. */
export function isFieldPost(state: State, post: PostId): boolean {
  return commandedBlocks(state, post).length > 0;
}

/** Field posts with a holder on a side, in id order: the commanders the seats layer asks and hears from. */
export function fieldPosts(world: SeatsWorld, state: State): PostId[] {
  return postIdsOf(state).filter((id) => state.postStates[id]!.postHolder !== null && isFieldPost(state, id) && postFaction(world, state, id) !== null);
}

/** Every post below `post` in the chain, and `post` itself. */
function subtree(state: State, post: PostId): PostId[] {
  const out: PostId[] = [post];
  for (let i = 0; i < out.length; i++) {
    for (const id of postIdsOf(state)) if (state.postStates[id]!.postParent === out[i] && !out.includes(id)) out.push(id);
  }
  return out;
}

/** The men a post commands, directly and through every post below it (known strengths only), and the blocks behind the figure. */
export function commandStrength(state: State, post: PostId): { readonly men: number; readonly blocks: readonly ForceBlockId[] } {
  const blocks = subtree(state, post).flatMap((p) => commandedBlocks(state, p)).sort(strictCompare);
  let men = 0;
  for (const b of blocks) men += state.forceBlockStates[b]!.fbStrength ?? 0;
  return { men, blocks };
}

/** The post's strongest directly commanded block (by known men, ties by id), or null when it commands none. */
export function mainBody(state: State, post: PostId): ForceBlockId | null {
  let best: ForceBlockId | null = null;
  let bestMen = -1;
  for (const b of commandedBlocks(state, post)) {
    const men = state.forceBlockStates[b]!.fbStrength ?? 0;
    if (men > bestMen) {
      best = b;
      bestMen = men;
    }
  }
  return best;
}

/** Where a post's headquarters is today. */
export function headquartersOf(world: SeatsWorld, state: State, post: PostId): RegionId {
  const body = mainBody(state, post);
  if (body !== null) return state.forceLocations[body]!.locRegion;
  const p = postStateOf(state, post);
  if (p.postSeat !== null) return p.postSeat;
  const faction = postFaction(world, state, post);
  if (faction !== null && world.factionIds.includes(faction)) return world.faction(faction).seatRegion;
  throw new RangeError(`post ${post} has no blocks, no seat and no side's capital to stand in`);
}

/** Where a person is: his post's headquarters, or his side's capital for a man without a post (a principal). */
export function whereIsPerson(world: SeatsWorld, state: State, person: PersonId): RegionId {
  const post = heldPost(state, person);
  if (post !== null) return headquartersOf(world, state, post);
  const faction = world.person(person).faction;
  if (faction === null || !world.factionIds.includes(faction)) throw new RangeError(`${person} holds no post and has no side's capital to stand in`);
  return world.faction(faction).seatRegion;
}

/** The posts an order from `principal` passes on its way to `target`: the chain below the post he holds (or below the top). */
export function relayChain(state: State, principal: PersonId, target: PostId): PostId[] {
  const top = heldPost(state, principal);
  const chain = chainBelow(state, top, target);
  return chain;
}

/** The filter post standing between the wire and `faction`'s principal: held, of the filter role, on that side; null if none. */
export function filterPostOf(world: SeatsWorld, state: State, faction: FactionId): PostId | null {
  for (const id of postIdsOf(state)) {
    if (state.postStates[id]!.postHolder === null) continue;
    if (postRole(world, state, id) === 'filter' && postFaction(world, state, id) === faction) return id;
  }
  return null;
}

/** Offices: held posts on a side that are neither field nor filter posts, and whose holder is not the principal. */
export function offices(world: SeatsWorld, state: State): PostId[] {
  return postIdsOf(state).filter((id) => {
    const p = state.postStates[id]!;
    if (p.postHolder === null || isFieldPost(state, id)) return false;
    const faction = postFaction(world, state, id);
    if (faction === null || !world.factionIds.includes(faction)) return false;
    if (world.faction(faction).principal === p.postHolder) return false;
    return postRole(world, state, id) !== 'filter';
  });
}
