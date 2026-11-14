/**
 * Which seats must answer, and the kernel's menu for each (Derived).
 *
 * A standing-goal menu offers only options the kernel judges consistent with
 * the commander's state (FOUNDATION section 8): he will not be offered an
 * advance into an enemy he believes too strong for his demand. When exactly
 * one option is consistent there is nothing to choose: no request is made and
 * the tick applies it. A principal is asked every day for orders.
 *
 * STAND-IN: the consistency judgement (force ratio against demand) stands in
 * for lane 0.9's planner candidates and plan selection.
 */
import type { FactionId, PostId } from '../ids.ts';
import { latestEnemyClaims, perceived } from '../knowledge/beliefs.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import { ORDER_ROUTES, routeLatency } from '../messages/latency.ts';
import type { State } from '../root-state.ts';
import { demandRatio, perceptionBias } from '../standin/traits.ts';
import type { IndexedWorld } from '../standin/world.ts';
import { deepFreeze } from '../tick/freeze.ts';
import { createViewCache, viewFor, type ViewCache } from '../view/view.ts';
import type { SituationDef } from '../situations/types.ts';
import type { CommandablePost, DelegatedMenu, OptionView, PrincipalMenu, RouteOption, SeatRequest, SituationChoice, StandingMenu } from './api.ts';
import { seatIdFor } from './seats.ts';

/** A score cap so an empty region does not dwarf every other term. */
const SCORE_CAP = 4000;

/**
 * The options for a field post's standing goal today, or null when it has
 * nothing to decide (holding, still marching, or already there).
 */
export function standingOptions(world: IndexedWorld, state: State, post: PostId, day: number): readonly OptionView[] | null {
  const goal = state.standingGoals[post];
  const p = world.post(post);
  if (goal === undefined || p.holder === null || goal.standingSpec.goalSpecKind !== 'advance') return null;
  const target = goal.standingSpec.goalSpecRegion;
  const hq = state.headquarters[post];
  if (target === null || hq === undefined || hq.hqRegion === target) return null;
  if (day - hq.hqSinceDay < world.rules.marchDays && hq.hqSinceDay > 0) return null;
  const person = world.person(p.holder);
  const knowledge = knowledgeOf(state, seatIdFor(person.id));
  const claims = latestEnemyClaims(knowledge);
  const bias = perceptionBias(world.rules.traits, person).permille;
  const demand = demandRatio(world.rules.traits, person);
  const advances: OptionView[] = [];
  for (const step of world.nextSteps(hq.hqRegion, target)) {
    const claim = claims.get(step);
    const enemy = claim === undefined ? 0 : perceived(claim.value, bias);
    // His margin over what he demands, permille: 1000 means exactly enough.
    const margin = enemy === 0 ? SCORE_CAP : Math.min(SCORE_CAP, Math.trunc((p.strength * 1_000_000) / (enemy * demand)));
    if (margin >= 1000) advances.push({ optionId: `advance:${step}`, kind: 'advance', region: step, score: margin, perceivedEnemy: enemy, ownStrength: p.strength });
  }
  const holdScore = Math.trunc((1000 + world.rules.traits.holdBand) / 2);
  const hold: OptionView = { optionId: 'hold', kind: 'hold', region: null, score: holdScore, perceivedEnemy: 0, ownStrength: p.strength };
  if (advances.length === 0) return [hold];
  // Within the hold band, holding is as consistent with him as moving: the seat chooses.
  if (advances.every((a) => a.score < world.rules.traits.holdBand)) return [...advances, hold];
  return advances;
}

export function principalMenu(world: IndexedWorld, state: State, faction: FactionId): PrincipalMenu {
  const f = world.faction(faction);
  const commandable: CommandablePost[] = [];
  for (const id of world.postIds) {
    const p = world.post(id);
    if (p.faction !== faction || p.kind !== 'field' || p.holder === null) continue;
    // Typical days to the post's station in pack data: the principal is not told where it is today.
    const to = p.region;
    const routes: RouteOption[] = [];
    for (const route of ORDER_ROUTES) {
      const l = routeLatency(world, world.rules.latency, route, f.seatRegion, to, faction, null);
      if (l.ok) routes.push({ route, typicalDays: l.latency.days, price: route === 'special-messenger' ? world.rules.latency.specialMessengerPrice : 0 });
    }
    commandable.push({ post: id, holder: p.holder, relays: world.chainBelow(null, id).slice(0, -1), routes });
  }
  const situations: SituationChoice[] = [];
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (def.faction !== faction || r === undefined || r.sitStatus !== 'open' || r.sitSurfacedDay === null || r.sitDelegate !== null) continue;
    situations.push(situationChoice(def, r.sitOpenOptions, def.delegableTo, null));
  }
  return { menuKind: 'principal', faction, objective: f.objective, commandable, situations };
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
 * every principal, and every commander with more than one consistent option.
 */
export function pendingRequests(world: IndexedWorld, state: State, cache: ViewCache = createViewCache()): SeatRequest[] {
  const day = state.stateDay + 1;
  const out: SeatRequest[] = [];
  for (const faction of world.factionIds) {
    const seat = seatIdFor(world.faction(faction).principal);
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `principal:${faction}:${day}`, view: viewFor(world, state, seat, cache), menu: principalMenu(world, state, faction) }));
  }
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (r === undefined || r.sitStatus !== 'open' || r.sitDelegate === null) continue;
    const seat = seatIdFor(r.sitDelegate);
    const menu: DelegatedMenu = { menuKind: 'delegated-situation', choice: situationChoice(def, r.sitOpenOptions, [], world.person(r.sitDelegate).values) };
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `delegated:${def.id}:${day}`, view: viewFor(world, state, seat, cache), menu }));
  }
  for (const post of world.postIds) {
    const options = standingOptions(world, state, post, day);
    if (options === null || options.length < 2) continue;
    const holder = world.post(post).holder!;
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

/** Requests are handed to code outside the kernel: freeze them all the way down so no seat can edit what it was given. */
function freezeDeep<T>(value: T): T {
  return deepFreeze(value);
}
