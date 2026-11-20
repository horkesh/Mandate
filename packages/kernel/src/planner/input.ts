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
 * - **From people State** (lane 1.1): his own traits through `traitsOf` and his drawn competence (his own nature drives his
 *   planning); of a partner holder, only what he can know: his regard for him and the holder's public standing (the
 *   lead's ruling on review S2). **From the World**: the map and the pack's rules.
 */
import { commandedBlocks, postIdsOf } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import type { DerivedMap } from '../control-index/derived.ts';
import { blockIds, factionOfBlock, isNaval } from '../forces/forces.ts';
import type { EdgeId, FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import type { PlanGoal } from '../plans/goal.ts';
import type { State } from '../root-state.ts';
import { headquartersOf, postFaction } from '../seats/posts.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { NetworkConditions } from '../supply/supply.ts';
import { regardOf, trueOf } from '../people/people.ts';
import { traitsOf } from '../people/traits.ts';
import type { SeatView } from '../view/types.ts';
import type { PlannerInput } from './context.ts';
import { profileOf } from './profile.ts';
import type { PlannerForce, PlannerPost } from './types.ts';

/**
 * The network as the planner may read it: the derived map's, with no obstructions (those come from his view). A second
 * line of defence only: the route never reads `network.obstructions` (it uses `passageBar` and the view's obstructions),
 * so nothing should rely on this strip to keep a boom he was not told of out of his plans (review N3).
 */
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
      arm: fb.fbArm,
      strength: fb.fbStrength ?? 0,
      storesDays: Math.trunc((fb.fbStoresMilli ?? 0) / 1000),
      storesAssumed: fb.fbStoresAssumed,
      aboard: loc.locAboard,
    });
  }
  return out;
}

/**
 * The cooperation `drafter` expects of `holder` (lane 0.9 finding 7), signed permille, from what he can know (0062:
 * beliefs, never truth; FOUNDATION section 6: temperament is hidden): his own regard for the holder (`regardUnknown`
 * with no history) and the holder's public standing about the pack's pivot, each weighted by a pack rule. The holder's
 * real answer is his own compliance's, when the `cooperating_axis` request reaches him.
 */
export function expectedCooperation(world: SeatsWorld, state: State, drafter: PersonId, holder: PersonId): number {
  const rules = world.map.world.rules.planner;
  const regard = regardOf(world.rules.people, state, drafter, holder);
  const standing = state.personStanding[holder] ?? rules.partnerStandingPivot;
  const expected = Math.trunc((regard * rules.partnerRegardWeight) / 1000) + Math.trunc(((standing - rules.partnerStandingPivot) * rules.partnerStandingWeight) / 1000);
  return Math.max(-1000, Math.min(1000, expected)) + 0;
}

/** His side's posts, in id order, with the cooperation `drafter` expects of each holder (0 for a vacant post or his own). */
export function sidePosts(world: SeatsWorld, state: State, faction: FactionId, drafter: PersonId): PlannerPost[] {
  return postIdsOf(state)
    .filter((id) => postFaction(world, state, id) === faction)
    .map((id) => {
      const p = state.postStates[id]!;
      const holder = p.postHolder;
      const willing = holder === null || holder === drafter ? 0 : expectedCooperation(world, state, drafter, holder);
      return {
        id,
        holder,
        parent: p.postParent,
        region: commandedBlocks(state, id).length > 0 ? headquartersOf(world, state, id) : null,
        seat: p.postSeat,
        holderWillingness: willing + 0,
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
  const person = traitsOf(world, state, holder);
  const people = world.rules.people;
  const { beliefs, works, obstructions } = viewGround(view);
  return {
    ground: { map: world.map, index: derived.index, network: plannerNetwork(network), month },
    supply,
    faction,
    beliefs,
    works,
    obstructions,
    forces: sideForces(world, state, faction),
    posts: sidePosts(world, state, faction, holder),
    post,
    profile: profileOf({ ...person, competence: trueOf(state, holder).trueCompetence }, people.traits, world.map.world.rules.planner.weights),
    goal,
    rules: world.map.world.rules.planner,
    assaultMargin: people.traits.assaultMargin,
    reinforceShare: { timid: people.compliance.reinforceShareTimid, bold: people.compliance.reinforceShareBold },
    day,
    bombardment: world.map.world.rules.combat.bombardment,
  };
}
