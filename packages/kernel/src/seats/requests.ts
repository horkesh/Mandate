/**
 * Which seats must answer, and the kernel's menu for each (Derived).
 *
 * A standing-goal menu offers only options the kernel judges consistent with
 * the commander's state (FOUNDATION section 8): he will not be offered an
 * advance into an enemy he believes too strong for his demand. When exactly
 * one option is consistent there is nothing to choose: no request is made and
 * the tick applies it. A principal is asked every day for orders.
 *
 * The steps offered are the first legs of every quickest route from his
 * headquarters toward his goal, over the typed edges his marching group may use
 * (lane 0.5, `movement/march.ts`). A group on a leg decides nothing until it
 * arrives.
 *
 * STAND-IN: the consistency judgement (force ratio against demand) stands in
 * for lane 0.9's planner candidates and plan selection.
 */
import { strictCompare } from '../compare.ts';
import { commandedBlocks, heldPost } from '../command/command.ts';
import { buildControlIndex } from '../control-index/control-index.ts';
import { isNaval } from '../forces/forces.ts';
import type { FactionId, ForceBlockId, PostId, RegionId } from '../ids.ts';
import { latestEnemyClaims, perceived } from '../knowledge/beliefs.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import { ORDER_ROUTES, routeLatency, type LatencyMap } from '../messages/latency.ts';
import { marchSteps, type MarchGround } from '../movement/march.ts';
import type { State } from '../root-state.ts';
import type { SituationDef } from '../situations/types.ts';
import { demandRatio, perceptionBias } from '../standin/traits.ts';
import { deepFreeze } from '../tick/freeze.ts';
import { passageOf } from '../tick/passage.ts';
import { createViewCache, viewFor, type ViewCache } from '../view/view.ts';
import { dateOfDay } from '../world/calendar.ts';
import type { CommandablePost, DelegatedMenu, OptionView, PrincipalMenu, RouteOption, SeatRequest, SituationChoice, StandingMenu } from './api.ts';
import { fieldPosts, headquartersOf, postFaction, relayChain } from './posts.ts';
import { seatIdFor } from './seats.ts';
import { latencyMapFor, type SeatsWorld } from './world.ts';

/** What a day's menus are judged on: the march ground and the latency of the morning's map. */
export interface MorningGround {
  readonly march: MarchGround;
  readonly latency: LatencyMap;
}

/** The ground for the morning of `day`, from the State the seats are asked from. */
export function morningGround(world: SeatsWorld, state: State, day: number): MorningGround {
  const index = buildControlIndex(world.map, state.regionControl);
  if (state.calendarStart === null) throw new RangeError('the seats layer needs a calendar (a scenario start)');
  return { march: { map: world.map, index, network: passageOf(world.map, state), month: dateOfDay(state.calendarStart, day).month }, latency: latencyMapFor(world, index) };
}

/**
 * A post's marching group: its blocks (not detachments) standing at its
 * headquarters, not aboard a ship. Ships march as a naval group when every
 * such block is a ship; otherwise the land blocks march. `marching` when any
 * of them is on a leg.
 */
export function marchingGroup(world: SeatsWorld, state: State, post: PostId): { readonly from: RegionId; readonly blocks: readonly ForceBlockId[]; readonly naval: boolean; readonly marching: boolean } {
  const from = headquartersOf(world, state, post);
  const here = commandedBlocks(state, post).filter((b) => {
    const loc = state.forceLocations[b]!;
    return state.forceBlockStates[b]!.fbKind === 'block' && loc.locRegion === from && loc.locAboard === null;
  });
  const marching = commandedBlocks(state, post).some((b) => state.forceLocations[b]!.locMarch !== null);
  const naval = here.length > 0 && here.every((b) => isNaval(world.map, state, b));
  const blocks = naval ? here : here.filter((b) => !isNaval(world.map, state, b));
  return { from, blocks: [...blocks].sort(strictCompare), naval, marching };
}

/**
 * The options for a field post's standing goal today, or null when it has
 * nothing to decide (holding, on a leg, already there, or no way there).
 */
export function standingOptions(world: SeatsWorld, state: State, post: PostId, ground: MorningGround): readonly OptionView[] | null {
  const goal = state.standingGoals[post];
  const holder = state.postStates[post]?.postHolder ?? null;
  if (goal === undefined || holder === null || goal.standingSpec.goalSpecKind !== 'advance') return null;
  const target = goal.standingSpec.goalSpecRegion;
  const side = postFaction(world, state, post);
  if (target === null || side === null) return null;
  const group = marchingGroup(world, state, post);
  if (group.marching || group.blocks.length === 0 || group.from === target) return null;
  let men = 0;
  for (const b of group.blocks) men += state.forceBlockStates[b]!.fbStrength ?? 0;
  const person = world.person(holder);
  const claims = latestEnemyClaims(knowledgeOf(state, seatIdFor(person.id)));
  const bias = perceptionBias(world.rules.traits, person).permille;
  const demand = demandRatio(world.rules.traits, person);
  // A score cap so an empty region does not dwarf every other term: the pack's (`WorldRules.standing.scoreCap`).
  const cap = world.map.world.rules.standing.scoreCap;
  const advances: OptionView[] = [];
  const seen = new Set<RegionId>();
  for (const step of marchSteps(ground.march, group.from, target, side, group.naval)) {
    const region = step.leg.to;
    if (seen.has(region)) continue;
    seen.add(region);
    const claim = claims.get(region);
    const enemy = claim === undefined ? 0 : perceived(claim.value, bias);
    // His margin over what he demands, permille: 1000 means exactly enough.
    const margin = enemy === 0 ? cap : Math.min(cap, Math.trunc((men * 1_000_000) / (enemy * demand)));
    if (margin >= 1000) advances.push({ optionId: `advance:${region}`, kind: 'advance', region, score: margin, perceivedEnemy: enemy, ownStrength: men });
  }
  const holdScore = Math.trunc((1000 + world.rules.traits.holdBand) / 2);
  const hold: OptionView = { optionId: 'hold', kind: 'hold', region: null, score: holdScore, perceivedEnemy: 0, ownStrength: men };
  if (advances.length === 0) return [hold];
  // Within the hold band, holding is as consistent with him as moving: the seat chooses.
  if (advances.every((a) => a.score < world.rules.traits.holdBand)) return [...advances, hold];
  return advances;
}

/**
 * The day a faction went to war (0064), or null at peace. The pack names, per faction, the situation chain flag that
 * puts it at war (its value is the day it was set), or none for war from day 1 (0). Public knowledge, like the map:
 * a faction's war is never a secret from its own seat.
 */
export function warSince(world: SeatsWorld, state: State, faction: FactionId): number | null {
  const row = world.map.world.rules.ruleSeats.warFlags.find((r) => r.faction === faction);
  if (row === undefined) throw new RangeError(`the pack states no war flag for faction ${faction} (rules.ruleSeats.warFlags)`);
  if (row.flag === null) return 0;
  return state.situationFlags[row.flag] ?? null;
}

export function principalMenu(world: SeatsWorld, state: State, faction: FactionId, ground: MorningGround): PrincipalMenu {
  const f = world.faction(faction);
  const commandable: CommandablePost[] = [];
  for (const id of fieldPosts(world, state)) {
    if (postFaction(world, state, id) !== faction) continue;
    const p = state.postStates[id]!;
    // Typical days to the post's seat in pack data, or where it stood at the start of play, or else his own side's capital:
    // the principal is not told where it is today (exit review P2).
    const to = p.postSeat ?? world.startHeadquarters(id) ?? f.seatRegion;
    const routes: RouteOption[] = [];
    for (const route of ORDER_ROUTES) {
      const l = routeLatency(ground.latency, world.rules.latency, route, f.seatRegion, to, faction, null);
      if (l.ok) routes.push({ route, typicalDays: l.latency.days, price: route === 'special-messenger' ? world.rules.latency.specialMessengerPrice : 0 });
    }
    commandable.push({ post: id, holder: p.postHolder!, relays: relayChain(state, f.principal, id).slice(0, -1), routes });
  }
  const situations: SituationChoice[] = [];
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (def.faction !== faction || r === undefined || r.sitStatus !== 'open' || r.sitSurfacedDay === null || r.sitDelegate !== null) continue;
    situations.push(situationChoice(def, r.sitOpenOptions, def.delegableTo, null));
  }
  return { menuKind: 'principal', faction, objective: f.objective, atWarSince: warSince(world, state, faction), commandable, situations };
}

/**
 * A situation's open options as a menu. For a delegate, each carries how far
 * it honours his values (0040: he decides by his values); the set is the
 * principal's set exactly (gate B7).
 */
export function situationChoice(def: SituationDef, open: readonly string[], delegableTo: readonly PostId[], values: readonly string[] | null): SituationChoice {
  return {
    situation: def.id,
    options: def.options
      .filter((o) => open.includes(o.id))
      .map((o) => ({
        optionId: o.id,
        group: o.group,
        score: values === null || o.honours.length === 0 ? 0 : Math.trunc((1000 * o.honours.filter((h) => values.includes(h)).length) / o.honours.length),
      })),
    delegableTo,
  };
}

/**
 * The requests for the morning of day `state.stateDay + 1`, in seat order:
 * every principal, every delegate holding a situation, and every commander
 * with more than one consistent option.
 */
export function pendingRequests(world: SeatsWorld, state: State, cache: ViewCache = createViewCache()): SeatRequest[] {
  const day = state.stateDay + 1;
  const ground = morningGround(world, state, day);
  const out: SeatRequest[] = [];
  for (const faction of world.factionIds) {
    const seat = seatIdFor(world.faction(faction).principal);
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `principal:${faction}:${day}`, view: viewFor(world, state, seat, cache), menu: principalMenu(world, state, faction, ground) }));
  }
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (r === undefined || r.sitStatus !== 'open' || r.sitDelegate === null) continue;
    const seat = seatIdFor(r.sitDelegate);
    const menu: DelegatedMenu = { menuKind: 'delegated-situation', choice: situationChoice(def, r.sitOpenOptions, [], world.person(r.sitDelegate).values) };
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `delegated:${def.id}:${day}`, view: viewFor(world, state, seat, cache), menu }));
  }
  for (const post of fieldPosts(world, state)) {
    const options = standingOptions(world, state, post, ground);
    if (options === null || options.length < 2) continue;
    const holder = state.postStates[post]!.postHolder!;
    const seat = seatIdFor(holder);
    const view = viewFor(world, state, seat, cache);
    const menu: StandingMenu = { menuKind: 'standing-goal', post, goal: view.goal!, options };
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: standingKey(post, day), view, menu }));
  }
  return out.sort((a, b) => (a.requestSeat < b.requestSeat ? -1 : a.requestSeat > b.requestSeat ? 1 : a.requestKey < b.requestKey ? -1 : 1));
}

export function standingKey(post: PostId, day: number): string {
  return `standing:${post}:${day}`;
}

/** The post a seat's person holds, if any (a request's holder). */
export function postOfSeatPerson(state: State, person: Parameters<typeof heldPost>[1]): PostId | null {
  return heldPost(state, person);
}

/** Requests are handed to code outside the kernel: freeze them all the way down so no seat can edit what it was given. */
function freezeDeep<T>(value: T): T {
  return deepFreeze(value);
}
