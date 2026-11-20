/**
 * Which seats must answer, and the kernel's menu for each (Derived).
 *
 * A commander whose goal has been drafted picks one of the planner's candidates (lane 1.2; FOUNDATION section 8: a
 * choice among options the kernel has already judged), the morning after the draft set was saved. When there is only
 * one candidate there is nothing to choose: no request is made and the tick applies it. A principal is asked every day
 * for orders, and is shown the plans submitted to him that have reached him.
 */
import { strictCompare } from '../compare.ts';
import { commandedBlocks, heldPost, unpostedPeopleOnSide } from '../command/command.ts';
import { commanderView, mayAttackToday, presenceByRegion, sideCommand } from '../combat/battle.ts';
import { believedRatio, commitAtDawn, cutOffChoice, pursuitChoice, standAtNight } from '../combat/decide.ts';
import { BATTLE_ORDER_OPTIONS } from '../combat/order-kinds.ts';
import { openBattleIn } from '../combat/records.ts';
import { buildControlIndex } from '../control-index/control-index.ts';
import { factionOfBlock, isNaval } from '../forces/forces.ts';
import type { FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import { ORDER_ROUTES, routeLatency, type LatencyMap } from '../messages/latency.ts';
import type { MarchGround } from '../movement/march.ts';
import { candidateOf, postsInStatus } from '../plans/plans.ts';
import { isCallAnswer } from '../proxy/responses.ts';
import { believedHolder, lossesInTransit, vacancyUnreported } from './believed.ts';
import { capitalOf } from '../command/capitals.ts';
import type { State } from '../root-state.ts';
import type { SituationDef } from '../situations/types.ts';
import { valuesOf } from '../people/traits.ts';
import { deepFreeze } from '../tick/freeze.ts';
import { passageOf } from '../tick/passage.ts';
import { choosingPosts, optionView, planKey, planOptions } from '../tick/plans.ts';
import { createViewCache, viewFor, type ViewCache } from '../view/view.ts';
import { dateOfDay, daysFromCivil, parseIsoDate } from '../world/calendar.ts';
import type { BattleMenu, Candidate, CommandablePost, DelegatedMenu, DoctrineView, PlanMenu, RaisingPost, Vacancy, PlanReview, PrincipalMenu, RouteOption, SeatRequest, SituationChoice } from './api.ts';
import { fieldPosts, headquartersOf, isFieldPost, postFaction, relayChain } from './posts.ts';
import { seatIdFor } from './seats.ts';
import { attentionLeft } from './attention.ts';
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
 * The plans submitted to a principal that wait for his review: his commanders' dispatches that have reached him, for
 * plans still under review, in post order (FOUNDATION section 5: approve, send back, or edit the arrows).
 */
export function reviewsFor(state: State, principal: PersonId): PlanReview[] {
  // His commander's dispatch has reached him once it is no longer on its way (his knowledge may since have pruned it,
  // superseded by a later answer to the same order; the plan still waits for him).
  const travelling = new Set(state.messagesInTransit.map((m) => m.msgOrigin));
  const out: PlanReview[] = [];
  for (const post of postsInStatus(state, 'review')) {
    const r = state.planRecords[post]!;
    const holder = state.postStates[post]?.postHolder ?? null;
    if (r.planIssuer !== principal || r.planSubmitted === null || travelling.has(r.planSubmitted) || holder === null || r.planChosen === null) continue;
    // He knows what he has already sent: a plan he has answered, the answer still on its way, is not before him again.
    if (answerInTransit(state, principal, post, ['approve', 'edit', 'send_back'])) continue;
    const account = state.knowledgeBySeat[seatIdFor(principal)]?.knownReports.find(k => k.id === r.planSubmitted)?.knownBody.reportNotes;
    out.push({ post, holder, report: r.planSubmitted, plan: optionView(candidateOf(r, r.planChosen)!, false), ...(account === undefined ? {} : { notes: account }) });
  }
  return out;
}

/**
 * Whether his answer to `post` is still in play: an order of these kinds from `principal` to `post` on its way (his own
 * orders, which he knows he sent), or an office's objection to such an order of his on its way back to him (0040: he
 * learns it was withheld only when the memorandum reaches him; until then he believes it went on). The memorandum's
 * claim names the kind of order withheld, so an objection to an earlier goal never hides an answer he still owes.
 */
function answerInTransit(state: State, principal: PersonId, post: PostId, kinds: readonly string[]): boolean {
  return state.messagesInTransit.some(
    (m) =>
      (m.msgOrder !== null && m.msgOrder.orderIssuer === principal && m.msgOrder.orderTarget === post && kinds.includes(m.msgOrder.orderKind)) ||
      (m.msgReport !== null &&
        m.msgReport.reportAnswers !== null &&
        (m.msgTo === principal || m.msgPending.some((h) => h.hopPerson === principal)) &&
        m.msgReport.reportSubjectKind === 'post' &&
        m.msgReport.reportSubjectId === post &&
        m.msgReport.reportClaims.some((c) => c.claimKind === 'order-objected' && c.claimToken !== null && kinds.includes(c.claimToken))),
  );
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

/** The kinds of a principal's orders and verbs to a post still on their way (lane 1.12: so a rule seat sends each once). */
function inTransitTo(state: State, principal: PersonId, post: PostId): string[] {
  const kinds = new Set<string>();
  for (const m of state.messagesInTransit) {
    if (m.msgOrder !== null && m.msgOrder.orderIssuer === principal && m.msgOrder.orderTarget === post) kinds.add(m.msgOrder.orderKind === 'goal' ? 'order' : m.msgOrder.orderKind);
    if (m.msgVerb !== null && m.msgVerb.verbIssuer === principal && m.msgVerb.verbPost === post) kinds.add(m.msgVerb.verbKind);
  }
  return [...kinds].sort(strictCompare);
}

/** Whether a principal has called on a raising post: a call on its way, or one its holder has answered (lane 1.12). */
function calledOn(state: State, principal: PersonId, post: PostId): boolean {
  if (inTransitTo(state, principal, post).includes('call')) return true;
  // His governor's answer, kept for good (`pruneResponses`). Only a principal calls, so any call to the post is his.
  return Object.values(state.orderResponses).some((r) => r.respPost === post && isCallAnswer(r));
}

/** The pack's doctrine for a faction's principal, its offensives' dates as days of the run (day 0 is the start's date). */
function doctrineView(world: SeatsWorld, state: State, faction: FactionId): DoctrineView {
  const row = world.map.world.rules.ruleSeats.principals.find((r) => r.faction === faction);
  // No row: no doctrine (he answers his commanders and orders nothing of his own; a pack states one for every faction).
  if (row === undefined) return { crossNeutral: false, concentrateAt: null, calls: [], offensives: [], inquireEveryDays: 0, appointKinds: { land: [], naval: [] } };
  if (state.calendarStart === null) throw new RangeError('the seats layer needs a calendar (a scenario start)');
  const start = daysFromCivil(parseIsoDate(state.calendarStart));
  return {
    crossNeutral: row.crossNeutral,
    concentrateAt: row.concentrateAt,
    calls: row.calls.map((c) => ({ post: c.post, regiments: c.regiments, termDays: c.termDays, day: daysFromCivil(parseIsoDate(c.fromDate)) - start })),
    offensives: row.offensives.map((o) => ({ post: o.post, objective: o.objective, day: daysFromCivil(parseIsoDate(o.fromDate)) - start })),
    inquireEveryDays: row.inquireEveryDays,
    appointKinds: { land: [...row.appointKinds.land], naval: [...row.appointKinds.naval] },
  };
}

export function principalMenu(world: SeatsWorld, state: State, faction: FactionId, ground: MorningGround, cache?: ViewCache): PrincipalMenu {
  const f = world.faction(faction);
  // Typical days to a post's seat in pack data, or where it stood at the start of play, or else his own side's capital:
  // the principal is not told where it is today (exit review P2).
  const routesTo = (id: PostId): RouteOption[] => {
    const p = state.postStates[id]!;
    const capital = capitalOf(state, faction);
    const to = p.postSeat ?? world.startHeadquarters(id) ?? capital;
    const routes: RouteOption[] = [];
    for (const route of ORDER_ROUTES) {
      const l = routeLatency(ground.latency, world.rules.latency, route, capital, to, faction, null);
      if (l.ok) routes.push({ route, typicalDays: l.latency.days, price: route === 'special-messenger' ? world.rules.latency.specialMessengerPrice : 0 });
    }
    return routes;
  };
  const raisingKinds = new Set(world.map.world.rules.recruitment.raisingPostKinds);
  const selfGoverning = new Set(world.map.world.vocabularies.departmentKinds.filter((k) => k.selfGoverning).map((k) => k.id as string));
  const raisesRegiments = (id: PostId): boolean => {
    const p = state.postStates[id]!;
    const dept = world.map.world.departments.find((d) => d.id === p.postDepartment);
    return raisingKinds.has(p.postKind) && p.postSeat !== null && !selfGoverning.has(dept?.kind ?? '');
  };
  // The posts as he believes them (0052; lane 1.12): a field post whose commander a battle took stays on his menu, with
  // the man he lost, until the report of it reaches him; an order he sends it meanwhile comes back undelivered.
  const ownPosts = (Object.keys(state.postStates).sort(strictCompare) as PostId[]).filter((id) => postFaction(world, state, id) === faction);
  const losses = lossesInTransit(state, f.principal);
  const unreported = new Set(losses.size === 0 ? [] : ownPosts.filter((id) => vacancyUnreported(state, f.principal, id, losses)));
  const commandable: CommandablePost[] = [];
  for (const id of [...new Set([...fieldPosts(world, state), ...unreported])].sort(strictCompare)) {
    if (postFaction(world, state, id) !== faction) continue;
    const holder = believedHolder(state, f.principal, id, losses)!;
    const men = commandedBlocks(state, id).reduce((n, b) => n + (state.forceBlockStates[b]!.fbStrength ?? 0), 0);
    commandable.push({ post: id, holder, relays: relayChain(state, f.principal, id).slice(0, -1), routes: routesTo(id), men, raising: raisesRegiments(id), inTransit: inTransitTo(state, f.principal, id) });
  }
  // Lane 1.12: what his doctrine reads. Posts that raise regiments, held; posts commanding troops that nobody holds; and
  // the men he may appoint to them, senior first.
  const raising: RaisingPost[] = ownPosts
    .filter((id) => state.postStates[id]!.postHolder !== null && raisesRegiments(id))
    .map((id) => ({ post: id, holder: state.postStates[id]!.postHolder!, routes: routesTo(id), called: calledOn(state, f.principal, id) }));
  // A vacancy is a post that had a holder when the scenario began and has lost him (to a wound, a capture, a relief), and
  // that he knows is vacant: a loss in battle only once its report has reached him. A post the scenario starts vacant is
  // the history's own choice: no doctrine fills it.
  const heldAtStart = new Set(world.start.posts.filter((p) => p.holder !== null).map((p) => p.id as PostId));
  const vacancies: Vacancy[] = ownPosts
    .filter((id) => state.postStates[id]!.postHolder === null && !unreported.has(id) && heldAtStart.has(id) && commandedBlocks(state, id).length > 0)
    .map((id) => ({ post: id, arm: commandedBlocks(state, id).every((b) => isNaval(world.map, state, b)) ? ('naval' as const) : ('land' as const), routes: routesTo(id), appointing: inTransitTo(state, f.principal, id).includes('appoint') }));
  const previousCandidates = cache?.candidates.get(faction);
  let candidates: readonly Candidate[];
  if (previousCandidates !== undefined && previousCandidates.world === world && previousCandidates.posts === state.postStates && previousCandidates.service === state.personService && previousCandidates.ranks === state.personRanks && previousCandidates.status === state.personStatus) {
    candidates = previousCandidates.candidates;
  } else {
    const rankIndex = new Map(world.map.world.vocabularies.ranks.map((r, i) => [r.id as string, i]));
    candidates = unpostedPeopleOnSide(world.map, state, faction)
      .filter((p) => p.id !== f.principal && (state.personStatus[p.id]?.statusKind ?? 'serving') === 'serving')
      .map((p) => ({ person: p.id, kind: p.kind as string, seniority: Math.max(-1, ...Object.values(state.personRanks[p.id] ?? {}).map((r) => rankIndex.get(r.rankTerm) ?? -1)) }))
      .sort((a, b) => b.seniority - a.seniority || strictCompare(a.person, b.person));
    if (cache !== undefined) {
      // Prove the whole graph frozen before retaining it for another request.
      candidates = freezeDeep(candidates, cache);
      cache.candidates.set(faction, { world, posts: state.postStates, service: state.personService, ranks: state.personRanks, status: state.personStatus, candidates });
    }
  }
  const situations: SituationChoice[] = [];
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (def.faction !== faction || r === undefined || r.sitStatus !== 'open' || r.sitSurfacedDay === null || r.sitDelegate !== null) continue;
    situations.push(situationChoice(def, r.sitOpenOptions, def.delegableTo, null));
  }
  const awaiting = postsInStatus(state, 'ready').filter((p) => state.planRecords[p]!.planIssuer === f.principal && !answerInTransit(state, f.principal, p, ['go']));
  const d = world.map.world.rules.plans.goalDefaults;
  return {
    menuKind: 'principal',
    faction,
    atWarSince: warSince(world, state, faction),
    doctrine: doctrineView(world, state, faction),
    raising,
    vacancies,
    candidates,
    attention: { left: attentionLeft(state, seatIdFor(f.principal)), costs: world.map.world.rules.people.attention.costs, specialMessenger: world.rules.latency.specialMessengerPrice },
    commandable,
    situations,
    reviews: reviewsFor(state, f.principal),
    awaiting,
    goalDefaults: { risk: d.risk, deadlineDays: d.deadlineDays, rail: d.rail, river: d.river, sea: d.sea, neutral: d.neutral, awaitWord: d.awaitWord, approveAsDrafted: d.approveAsDrafted },
  };
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
 * The morning's battle menus (lane 1.12). A battle can be fought today where two sides' land troops stand and one is
 * open or a side may attack, or where one side's troops stand and another's are marching in (a battle on arrival: its
 * commander orders it before he arrives). Neutral ground nobody holds is passed, never fought over. The holder of each
 * side's commanding post there, if he is serving, is asked for his orders; `judged` is his trait rule's choice on this
 * morning's numbers as he sees them.
 */
export function battleMenus(world: SeatsWorld, state: State, ground: MarchGround, day: number): { readonly menu: BattleMenu; readonly holder: PersonId }[] {
  const rules = world.map.world.rules.combat;
  const out: { menu: BattleMenu; holder: PersonId }[] = [];
  const standing = presenceByRegion(ground, state);
  // Land troops on a leg, by the region they march to and their side: they press there when they arrive.
  const marching = new Map<RegionId, Map<FactionId, ForceBlockId[]>>();
  for (const id of Object.keys(state.forceLocations).sort(strictCompare) as ForceBlockId[]) {
    const loc = state.forceLocations[id]!;
    if (loc.locMarch === null || loc.locAboard !== null || isNaval(world.map, state, id) || state.forceBlockStates[id]!.fbSurrenderedDay !== null) continue;
    const faction = factionOfBlock(world.map, state, id);
    if (faction === null) continue;
    const factionMarches = marching.get(loc.locMarch.marchTo) ?? new Map<FactionId, ForceBlockId[]>();
    marching.set(loc.locMarch.marchTo, factionMarches);
    factionMarches.set(faction, [...(factionMarches.get(faction) ?? []), id]);
  }
  for (const region of [...new Set([...standing.keys(), ...marching.keys()])].sort(strictCompare)) {
    if (Object.keys(state.regionControl[region] ?? {}).length === 0 && ground.network.neutralGround?.[region] !== undefined) continue;
    const here = standing.get(region) ?? [];
    const coming = marching.get(region) ?? new Map<FactionId, ForceBlockId[]>();
    const factions = [...new Set([...here.map((s) => s.faction), ...coming.keys()])].sort(strictCompare);
    if (factions.length < 2 || here.length === 0) continue;
    const sides = factions.slice(0, 2).map((faction) => {
      const s = here.find((x) => x.faction === faction);
      const arriving = coming.get(faction) ?? [];
      const blocks = [...(s?.blocks ?? []), ...arriving];
      const men = blocks.reduce((n, b) => n + (state.forceBlockStates[b]!.fbStrength ?? 0), 0);
      return { faction, blocks, men, pressing: [...(s?.pressing ?? []), ...arriving], unknown: [] as ForceBlockId[], arriving: arriving.length > 0 };
    });
    // Only where a battle can be fought today: one is open, a side is marching in, or a side may attack.
    const open = openBattleIn(state, region);
    if (open === null && !sides.some((s) => s.arriving || mayAttackToday(rules, state, s, day))) continue;
    sides.forEach((side, i) => {
      const command = sideCommand(state, side.blocks);
      if (command.post === null || command.person === null) return;
      const view = commanderView(world, state, command.person);
      const enemy = sides[1 - i]!.men;
      // Troops marching in press when they arrive (0064); standing troops by the battle model's own rule.
      const mayAttack = side.arriving || mayAttackToday(rules, state, side, day);
      out.push({
        holder: command.person,
        menu: {
          menuKind: 'battle',
          post: command.post,
          region,
          battle: open,
          believedRatio: believedRatio(view, side.men, enemy),
          mayAttack,
          judged: {
            commit: commitAtDawn(rules, view, mayAttack, side.men, enemy).choice,
            night: standAtNight(rules, view, side.men, enemy).choice,
            cutOff: cutOffChoice(rules, view, side.men, enemy).choice,
            pursue: pursuitChoice(rules, view, side.men, enemy).choice,
          },
          options: BATTLE_ORDER_OPTIONS,
        },
      });
    });
  }
  return out;
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
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `principal:${faction}:${day}`, view: viewFor(world, state, seat, cache), menu: principalMenu(world, state, faction, ground, cache) }, cache));
  }
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (r === undefined || r.sitStatus !== 'open' || r.sitDelegate === null) continue;
    const seat = seatIdFor(r.sitDelegate);
    const menu: DelegatedMenu = { menuKind: 'delegated-situation', choice: situationChoice(def, r.sitOpenOptions, [], valuesOf(world.map, r.sitDelegate)) };
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `delegated:${def.id}:${day}`, view: viewFor(world, state, seat, cache), menu }, cache));
  }
  for (const post of choosingPosts(state, day)) {
    const options = planOptions(state, post, day);
    if (options === null || options.length < 2) continue;
    const holder = state.postStates[post]!.postHolder!;
    const seat = seatIdFor(holder);
    const view = viewFor(world, state, seat, cache);
    const menu: PlanMenu = { menuKind: 'plan-selection', post, goal: view.goal!, options };
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: planKey(post, day), view, menu }, cache));
  }
  for (const { menu, holder } of battleMenus(world, state, ground.march, day)) {
    const seat = seatIdFor(holder);
    // Hard rule 1 (0016): the battle menu never reaches a seat the player drives; his battles are his traits' (`judge`).
    if (state.seatAssignments[seat]?.seatDriver === 'human') continue;
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `battle:${menu.post}:${day}`, view: viewFor(world, state, seat, cache), menu }, cache));
  }
  return out.sort((a, b) => (a.requestSeat < b.requestSeat ? -1 : a.requestSeat > b.requestSeat ? 1 : a.requestKey < b.requestKey ? -1 : 1));
}

/** The post a seat's person holds, if any (a request's holder). */
export function postOfSeatPerson(state: State, person: Parameters<typeof heldPost>[1]): PostId | null {
  return heldPost(state, person);
}

/** Requests are handed to code outside the kernel: freeze them all the way down so no seat can edit what it was given. */
function freezeDeep<T>(value: T, cache: ViewCache): T {
  return deepFreeze(value, cache.requestFreeze);
}
