import type { WorldIndex } from '../world/index.ts';
import { forceTotals, type ForceTotalsCache } from '../forces/lots.ts';
/**
 * Posts as the seats layer reads them (Derived): pure reads of `command`'s and
 * `forces`' State and the World's post-kind roles. Lane 0.5 moved holders,
 * chains and strengths from the stand-in comms World into State; these keep
 * the seats layer's questions in one place.
 *
 * - A **field post** commands at least one force block directly and is not an institutional office: it has a
 *   standing goal, reports on the enemy and its strength, and its headquarters
 *   moves with its blocks.
 * - A **filter post** is one whose kind has the `filter` role (0058); its
 *   holder stands between the wire and his principal (0032).
 * - An **office** is an explicitly declared institutional office, or any other non-field post with a holder: its holder gives his word on
 *   the returns that reach him.
 * - An institutional office's **headquarters** follows its government's seat; a neutral office retains its declared seat.
 *   A field post's headquarters is where its strongest directly commanded block
 *   stands (by known men, ties by block id), or its seat when it commands none,
 *   or its side's capital when it has no seat.
 */
import { strictCompare } from '../compare.ts';
import { capitalOf } from '../command/capitals.ts';
import { sideOfPerson, chainBelow, allCommandedBlocks, commandedBlocks, factionOfPost, heldPost, postIdsOf, postStateOf, type HeldPostCache } from '../command/command.ts';
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

/** Whether a non-office post commands at least one force block directly. */
export function isFieldPost(world: SeatsWorld, state: State, post: PostId): boolean {
  return postRole(world, state, post) !== 'office' && allCommandedBlocks(world.map, state, post).length > 0;
}

/** One assignment enumeration; only declared formation ancestors count as field commands. */
function commandingPosts(world:SeatsWorld,state:State):Set<PostId|null>{
  const commanding=new Set(Object.values(state.forceAssignments));
  const templates=world.map.world.organisationTemplates??[];
  const formations=new Set(templates.flatMap(t=>t.posts.map(p=>p.id)));
  const armies=new Set(templates.map(t=>t.army));
  for(const assigned of [...commanding]){
    if(assigned===null||!formations.has(assigned))continue;
    const seen=new Set<PostId>();let post:PostId|null=assigned;
    while(post!==null&&!seen.has(post)){
      seen.add(post);commanding.add(post);if(armies.has(post))break;
      post=postStateOf(state,post).postParent;
    }
  }
  return commanding;
}

/** Field posts with a holder on a side, in id order: the commanders the seats layer asks and hears from. */
export function fieldPosts(world: SeatsWorld, state: State): PostId[] {
  const commanding = commandingPosts(world,state);
  return postIdsOf(state).filter((id) => state.postStates[id]!.postHolder !== null && commanding.has(id) && postRole(world, state, id) !== 'office' && postFaction(world, state, id) !== null);
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
export function commandStrength(state: State, post: PostId, cache?: ForceTotalsCache): { readonly men: number; readonly blocks: readonly ForceBlockId[] } {
  const blocks = subtree(state, post).flatMap((p) => commandedBlocks(state, p)).sort(strictCompare);
  let men = 0;
  for (const b of blocks) men += forceTotals(state.forceBlockStates[b]!, cache).fbStrength ?? 0;
  return { men, blocks };
}

/** The post's strongest joined block (by known men, ties by id), or null when none has joined (0110). */
export function mainBody(state: State, post: PostId, cache?: ForceTotalsCache, map?: WorldIndex): ForceBlockId | null {
  let best: ForceBlockId | null = null;
  let bestMen = -1;
  for (const b of map===undefined?commandedBlocks(state,post):allCommandedBlocks(map,state,post)) {
    if (state.forceJoins[b] !== undefined) continue; // 0110: assigned reinforcements have not joined.
    const men = forceTotals(state.forceBlockStates[b]!, cache).fbStrength ?? 0;
    if (men > bestMen) {
      best = b;
      bestMen = men;
    }
  }
  return best;
}

/** Where a post's headquarters is today. */
export function headquartersOf(world: SeatsWorld, state: State, post: PostId): RegionId {
  const faction = postFaction(world, state, post);
  if (faction !== null && world.factionIds.includes(faction) && state.postStates[post]?.postHolder === world.faction(faction).principal) return capitalOf(state, faction);
  // Institutional offices stay with their government even when they own distant forces.
  if (postRole(world, state, post) === 'office') {
    if (faction !== null && world.factionIds.includes(faction)) return capitalOf(state, faction);
    const seat = postStateOf(state, post).postSeat;
    if (seat !== null) return seat;
    throw new RangeError(`office ${post} has no government's seat`);
  }
  const body = mainBody(state, post, world.map.forceTotalsCache, world.map);
  if (body !== null) return state.forceLocations[body]!.locRegion;
  const p = postStateOf(state, post);
  if (p.postSeat !== null) return p.postSeat;
  if (faction !== null && world.factionIds.includes(faction)) return capitalOf(state, faction);
  throw new RangeError(`post ${post} has no blocks, no seat and no side's capital to stand in`);
}

/** Where a person is: his post's headquarters, or his side's capital for a man without a post (a principal). */
export function whereIsPerson(world: SeatsWorld, state: State, person: PersonId, cache?: HeldPostCache): RegionId {
  const principalSide = world.factionIds.find((f) => world.faction(f).principal === person);
  if (principalSide !== undefined) return capitalOf(state, principalSide);
  const post = heldPost(state, person, cache);
  if (post !== null) return headquartersOf(world, state, post);
  const faction = sideOfPerson(world.map, state, person, cache);
  if (faction === null || !world.factionIds.includes(faction)) throw new RangeError(`${person} holds no post and has no side's capital to stand in`);
  return capitalOf(state, faction);
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
  const commanding = commandingPosts(world,state);
  return postIdsOf(state).filter((id) => {
    const p = state.postStates[id]!;
    if (p.postHolder === null || (commanding.has(id) && postRole(world, state, id) !== 'office')) return false;
    const faction = postFaction(world, state, id);
    if (faction === null || !world.factionIds.includes(faction)) return false;
    if (world.faction(faction).principal === p.postHolder) return false;
    return postRole(world, state, id) !== 'filter';
  });
}
