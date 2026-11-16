/**
 * A drafting request's input, built at the request (0062: `draft(world, derived, view, request)`).
 *
 * The boundary, stated so it can be checked (lane 0.9 finding 11):
 * - **From his view** (`SeatView`): the enemy he believes stands in each region, the works and the obstructions he has
 *   been told of. Nothing about the enemy or the ground is read from truth: not enemy blocks, not `regionFortification`,
 *   not `infraObstructions`.
 * - **From the derived map**: his side's control index (who holds what) and supply (where his trains reach), and the
 *   network the derivation read (edge condition, neutral ground); the obstructions in it are dropped, so the planner
 *   cannot plan on a boom he has not been told of.
 * - **From his own side's State**: its force blocks (`forces`, `movement`, `command`) and its posts.
 * - **From the World**: the map and the pack's rules; his traits through the seats layer (`seats/world.ts`, which lane
 *   1.1 re-points to the people State).
 */
import { commandedBlocks, postIdsOf } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import type { DerivedMap } from '../control-index/derived.ts';
import { blockIds, factionOfBlock, isNaval } from '../forces/forces.ts';
import type { EdgeId, FactionId, ForceBlockId, PostId, RegionId } from '../ids.ts';
import type { PlanGoal } from '../plans/goal.ts';
import type { State } from '../root-state.ts';
import { headquartersOf, postFaction } from '../seats/posts.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { NetworkConditions } from '../supply/supply.ts';
import type { SeatView } from '../view/types.ts';
import type { PlannerInput } from './context.ts';
import { profileOf } from './profile.ts';
import type { PlannerForce, PlannerPost } from './types.ts';

/** The network as the planner may read it: the derived map's, with no obstructions (those come from his view). */
export function plannerNetwork(network: NetworkConditions): NetworkConditions {
  return network.obstructions.length === 0 ? network : { ...network, obstructions: [] };
}

/** His side's force blocks, in id order. An unknown strength counts as none, unknown stores as no days. */
export function sideForces(world: SeatsWorld, state: State, faction: FactionId): PlannerForce[] {
  const out: PlannerForce[] = [];
  for (const id of blockIds(state)) {
    if (factionOfBlock(world.map, state, id) !== faction) continue;
    const post = state.forceAssignments[id] ?? null;
    const loc = state.forceLocations[id];
    if (post === null || loc === undefined) continue;
    const fb = state.forceBlockStates[id]!;
    out.push({
      id,
      post,
      region: loc.locRegion,
      kind: fb.fbKind === 'detachment' ? 'detachment' : 'block',
      naval: isNaval(world.map, state, id),
      strength: fb.fbStrength ?? 0,
      storesDays: Math.trunc((fb.fbStoresMilli ?? 0) / 1000),
      aboard: loc.locAboard,
    });
  }
  return out;
}

/** His side's posts, in id order, with their holders' regard and values (for a partner's willingness). */
export function sidePosts(world: SeatsWorld, state: State, faction: FactionId): PlannerPost[] {
  return postIdsOf(state)
    .filter((id) => postFaction(world, state, id) === faction)
    .map((id) => {
      const p = state.postStates[id]!;
      const holder = p.postHolder === null ? null : world.person(p.postHolder);
      return {
        id,
        holder: p.postHolder,
        parent: p.postParent,
        region: commandedBlocks(state, id).length > 0 ? headquartersOf(world, state, id) : null,
        holderRegard: holder?.regard ?? 0,
        holderValues: holder === null ? [] : [...holder.values],
      };
    });
}

/** What the commander's view says of the enemy and the ground, as the planner reads it. */
export function viewGround(view: SeatView): { readonly beliefs: Map<RegionId, number>; readonly works: Map<RegionId, number>; readonly obstructions: Map<EdgeId, RegionId | null> } {
  const beliefs = new Map<RegionId, number>();
  for (const r of (Object.keys(view.enemyBeliefs) as RegionId[]).sort(strictCompare)) beliefs.set(r, view.enemyBeliefs[r]!.value);
  const works = new Map<RegionId, number>();
  for (const r of (Object.keys(view.worksBeliefs) as RegionId[]).sort(strictCompare)) works.set(r, view.worksBeliefs[r]!.value);
  const obstructions = new Map<EdgeId, RegionId | null>();
  for (const e of (Object.keys(view.obstructionBeliefs) as EdgeId[]).sort(strictCompare)) {
    const b = view.obstructionBeliefs[e]!;
    if (b.closed) obstructions.set(e, b.by);
  }
  return { beliefs, works, obstructions };
}

/** The input for drafting `goal` for `post`, whose holder's view is `view`, on the morning's derived map. */
export function plannerInputFor(world: SeatsWorld, state: State, derived: DerivedMap, network: NetworkConditions, month: number, view: SeatView, post: PostId, goal: PlanGoal, day: number): PlannerInput {
  const faction = postFaction(world, state, post);
  if (faction === null) throw new RangeError(`post ${post} has no side to plan for`);
  const supply = derived.supply.factions.get(faction);
  if (supply === undefined) throw new RangeError(`the derived map has no supply for ${faction}`);
  const holder = state.postStates[post]!.postHolder;
  if (holder === null) throw new RangeError(`post ${post} is vacant: nobody to plan`);
  const person = world.person(holder);
  const { beliefs, works, obstructions } = viewGround(view);
  return {
    ground: { map: world.map, index: derived.index, network: plannerNetwork(network), month },
    supply,
    faction,
    beliefs,
    works,
    obstructions,
    forces: sideForces(world, state, faction),
    posts: sidePosts(world, state, faction),
    post,
    profile: profileOf(person, world.rules.traits, world.map.world.rules.planner.weights),
    goal,
    rules: world.map.world.rules.planner,
    day,
  };
}
