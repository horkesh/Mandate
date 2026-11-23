import { forceTotals } from '../forces/lots.ts';
/**
 * Which seats must answer, and the kernel's menu for each (Derived).
 *
 * A commander whose goal has been drafted picks one of the planner's candidates (lane 1.2; FOUNDATION section 8: a
 * choice among options the kernel has already judged), the morning after the draft set was saved. When there is only
 * one candidate there is nothing to choose: no request is made and the tick applies it. A principal is asked every day
 * for orders, and is shown the plans submitted to him that have reached him.
 */
import { strictCompare } from '../compare.ts';
import { heldPost } from '../command/command.ts';
import { commanderView, mayAttackToday, presenceByRegion, sideCommand } from '../combat/battle.ts';
import { believedRatio, commitAtDawn, cutOffChoice, pursuitChoice, standAtNight } from '../combat/decide.ts';
import { BATTLE_ORDER_OPTIONS } from '../combat/order-kinds.ts';
import { openBattleIn } from '../combat/records.ts';
import { buildControlIndex } from '../control-index/control-index.ts';
import { factionOfBlock, isNaval } from '../forces/forces.ts';
import type { DepartmentId, FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import { ORDER_ROUTES, routeLatency, type LatencyMap } from '../messages/latency.ts';
import { mintMessageId } from '../messages/transit.ts';
import type { MarchGround } from '../movement/march.ts';
import { candidateOf, postsInStatus } from '../plans/plans.ts';
import { termsOfGoal } from '../plans/goal.ts';
import { isCallAnswer } from '../proxy/responses.ts';
import { knowledgeOf, paperReadiness, unansweredAppointments } from '../knowledge/knowledge.ts';
import { capitalOf } from '../command/capitals.ts';
import type { State } from '../root-state.ts';
import type { SituationDef } from '../situations/types.ts';
import { valuesOf } from '../people/traits.ts';
import { deepFreeze } from '../tick/freeze.ts';
import { passageOf } from '../tick/passage.ts';
import { choosingMenus, optionView, planKey } from '../tick/plans.ts';
import { createViewCache, viewFor, type ViewCache } from '../view/view.ts';
import { dateOfDay, daysFromCivil, formatIsoDate, parseIsoDate } from '../world/calendar.ts';
import { authoredGoal, letterDependencies, orderedLetters } from '../world/doctrine.ts';
import { letterKey } from '../world/letters.ts';
import type { PaperSelector } from '../world/paper-selectors.ts';
import type { BattleMenu, Candidate, CommandablePost, DelegatedMenu, DoctrineView, PlanMenu, RaisingPost, Vacancy, PlanReview, PrincipalMenu, ProposalOffer, RouteOption, SeatRequest, SituationChoice } from './api.ts';
import { seatIdFor } from './seats.ts';
import { attentionLeft } from './attention.ts';
import { latencyMapFor, type SeatsWorld } from './world.ts';
import type { SeatView } from '../view/types.ts';
import { answersGoal, authoredAnswer, latestSentGoal, receivedAuthoredGo, receivedCandidates, receivedConditionalGoal, receivedStrength, receivedPlanPapers, receivedProposalPapers, receivedDepartmentSides, receivedPostSide } from './received.ts';

/** What a day's menus are judged on: the march ground and the latency of the morning's map. */
export interface MorningGround {
  readonly march: MarchGround;
  readonly latency: LatencyMap;
}

/** The ground for the morning of `day`, from the State the seats are asked from. */
export function morningGround(world: SeatsWorld, state: State, day: number): MorningGround {
  const index = buildControlIndex(world.map, state.regionControl);
  if (state.calendarStart === null) throw new RangeError('the seats layer needs a calendar (a scenario start)');
  return { march: { map: world.map, index, network: passageOf(world.map, state), month: dateOfDay(state.calendarStart, day).month }, latency: latencyMapFor(world, index, day) };
}

/**
 * The plans submitted to a principal that wait for his review: his commanders' dispatches that have reached him, for
 * plans still under review, in post order (FOUNDATION section 5: approve, send back, or edit the arrows).
 */
export function reviewsFor(state: State, principal: PersonId): PlanReview[] {
  return receivedPlanPapers(state, principal).filter(r => !answerInTransit(state,principal,r.knownBody.reportPlan!.paperPost,['approve','edit','send_back'])).map(r => ({
    post: r.knownBody.reportPlan!.paperPost, holder: r.knownBody.reportAuthor, report: r.id,
    ...(r.knownBody.reportLetter === undefined ? {} : { authoredPaper: r.id }),
    plan: optionView(r.knownBody.reportPlan!.paperChosen, false),
    ...(r.knownBody.reportNotes === undefined ? {} : { notes: r.knownBody.reportNotes }),
  }));
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

/** Orders and verbs the principal knows he sent, grouped once by their target. */
function transitByPost(state: State, principal: PersonId): ReadonlyMap<PostId, ReadonlySet<string>> {
  const kinds = new Map<PostId, Set<string>>();
  const add = (post: PostId, kind: string) => {
    let row = kinds.get(post);
    if (row === undefined) {
      row = new Set();
      kinds.set(post, row);
    }
    row.add(kind);
  };
  for (const a of unansweredAppointments(state, principal)) add(a.appointmentPost, 'appoint');
  for (const m of state.messagesInTransit) {
    const order = m.msgOrder;
    if (order !== null && order.orderIssuer === principal) add(order.orderTarget, order.orderKind === 'goal' ? 'order' : order.orderKind);
    const verb = m.msgVerb;
    if (verb !== null && verb.verbIssuer === principal && verb.verbPost !== null) add(verb.verbPost, verb.verbKind);
  }
  return kinds;
}

/** Index correspondence IDs by the day carried in the minted appointment ID. */
function appointmentDispatchesByDay(state: State, principal: PersonId): ReadonlyMap<number, readonly string[]> {
  const lettersByDay = new Map<number, string[]>();
  const addLetter = (letterId: string | null | undefined) => {
    if (!letterId?.startsWith('m.')) return;
    const endOfDay = letterId.indexOf('.', 2);
    if (endOfDay === -1) return;
    const day = Number(letterId.slice(2, endOfDay));
    if (!Number.isSafeInteger(day)) return;
    const dayLetters = lettersByDay.get(day);
    if (dayLetters === undefined) lettersByDay.set(day, [letterId]);
    else dayLetters.push(letterId);
  };
  for (const message of state.messagesInTransit) {
    addLetter(message.id);
    if (message.msgTo === principal) addLetter(message.msgReport?.reportAnswers);
  }
  for (const response of Object.values(state.orderResponses)) addLetter(response.respOrder);
  for (const known of knowledgeOf(state, seatIdFor(principal)).knownReports) addLetter(known.knownBody.reportAnswers);
  return lettersByDay;
}

/** The pack's doctrine for a faction's principal, its offensives' dates as days of the run (day 0 is the start's date). */
function doctrineView(world: SeatsWorld, state: State, faction: FactionId, receivedView: SeatView, sides: ReadonlyMap<DepartmentId, FactionId | null>, proposals: readonly ProposalOffer[]): DoctrineView {
  const row = world.map.world.rules.ruleSeats.principals.find((r) => r.faction === faction);
  // No row: no doctrine (he answers his commanders and orders nothing of his own; a pack states one for every faction).
  if (row === undefined) return { crossNeutral: false, concentrateAt: null, calls: [], offensives: [], inquireEveryDays: 0, appointKinds: { land: [], naval: [] } };
  if (state.calendarStart === null) throw new RangeError('the seats layer needs a calendar (a scenario start)');
  const start = daysFromCivil(parseIsoDate(state.calendarStart));
  const due = (date: string, department: DepartmentId) => state.stateDay + 1 >= daysFromCivil(parseIsoDate(date)) - start && sides.get(department) === faction;
  const knowledge = knowledgeOf(state, seatIdFor(world.faction(faction).principal));
  const paperChecks: NonNullable<DoctrineView['paperReadiness']>[number][] = [];
  const requires = (selectors: readonly PaperSelector[] | undefined, action: string) => {
    if (selectors === undefined) return true;
    const results = paperReadiness(selectors, knowledge, state.stateDay, world.rules.templates);
    paperChecks.push({ action, results });
    return results.every(r => r.status === 'received');
  };
  const concentrations = [...(row.concentrations ?? [])].filter(c => requires(c.requiresPapers, c.id ?? c.post) &&
    due(c.fromDate, c.requiresDepartment) && receivedPostSide(world, receivedView, sides, c.post) === faction)
    .sort((a, b) => strictCompare(b.fromDate, a.fromDate) || strictCompare(a.post, b.post));
  const concentration = concentrations[0];
  const transfers = new Map<PostId, PostId>();
  const sent = knowledge.knownSentOrders ?? [];
  const dispatched = new Set(knowledge.knownDoctrineDispatches?.map(d => letterKey(d.dispatchLetter)));
  for (const c of concentrations) for (const from of c.fromPosts) if (!transfers.has(from)) transfers.set(from, c.post);
  return {
    crossNeutral: row.crossNeutral,
    concentrateAt: concentration?.post ?? row.concentrateAt,
    ...(concentration === undefined ? {} : { concentrateFrom: concentration.fromPosts,
      concentrateLevies: concentration.receiveLevies ?? true,
      concentrationTransfers: [...transfers].sort(([a], [b]) => strictCompare(a, b)).map(([from, to]) => ({ from, to })),
    }),
    calls: row.calls.map((c) => ({ ...(c.termsId === undefined ? {} : { termsId: c.termsId }), post: c.post, regiments: c.regiments, termDays: c.termDays, day: daysFromCivil(parseIsoDate(c.fromDate)) - start,
      ...(c.men === undefined ? {} : { men: c.men }), ...(c.atPeace === undefined ? {} : { atPeace: c.atPeace }),
      ...(c.arm === undefined ? {} : { arm: c.arm }),
      ...(c.readiness === undefined ? {} : { readiness: c.readiness }),
      ...(c.requiresPapers === undefined ? {} : { ready: requires(c.requiresPapers, c.id!) }),
      ...(c.id === undefined ? {} : { id: c.id, issued: state.messagesInTransit.some(m => m.msgOrder !== null && m.msgOrder.orderCall?.callId === c.id && m.msgOrder.orderIssuer === world.faction(faction).principal) || Object.values(state.orderResponses).some(r => r.respCallId === c.id && r.respPost === c.post) }),
    })),
    offensives: [...row.offensives.filter(o => o.letter === undefined), ...orderedLetters(row.offensives)].map((o) => {
      const day = daysFromCivil(parseIsoDate(o.fromDate)) - start;
      const entry = { post: o.post, objective: o.objective, day, ...(o.id === undefined ? {} : { id: o.id }),
        ...(o.posture === undefined ? {} : { posture: o.posture }), ...(o.discretion === undefined ? {} : { discretion: o.discretion }) };
      const heard = o.requiresNotice === undefined || receivedView.reports.some(r => r.subjectKind === 'situation' && r.subjectId === o.requiresNotice && r.day <= state.stateDay && r.receivedDay <= state.stateDay);
      if (o.letter !== undefined) {
        const key = letterKey(o.letter);
        const issued = dispatched.has(key);
        const papers = issued || requires(o.requiresPapers, key);
        return { ...entry, letter: o.letter, ready: heard && papers && letterDependencies(o).every(d => dispatched.has(letterKey(d))), issued };
      }
      if (o.requiresNotice === undefined && o.id === undefined && o.requiresPapers === undefined) return entry;
      // The principal remembers his own dispatch, never the addressee's private plan or operation.
      // A later personal order to the same command supersedes this automatic doctrine as well.
      const papers = requires(o.requiresPapers, o.id ?? o.post);
      return { ...entry, ready: heard && papers,
        issued: sent.some(s => s.sentPost === o.post && s.sentKind === 'goal' && s.sentDay >= day) };
    }),
    ...(row.proposalAnswers === undefined ? {} : { proposalAnswers: row.proposalAnswers.flatMap(a => {
      if (!requires(a.requiresPapers, a.id)) return [];
      const proposal = proposals.find(p => p.post === a.post && sent.some(s => answersGoal(s, p.order) && s.sentDoctrine === a.answers));
      if (proposal === undefined) return [];
      return [{ ...a, day: daysFromCivil(parseIsoDate(a.fromDate)) - start, paper: proposal.paper, ordered: proposal.ordered }];
    }) }),
    ...(paperChecks.length === 0 ? {} : { paperReadiness: paperChecks }),
    inquireEveryDays: row.inquireEveryDays,
    appointKinds: { land: [...row.appointKinds.land], naval: [...row.appointKinds.naval] },
  };
}

export function principalMenu(world: SeatsWorld, state: State, faction: FactionId, ground: MorningGround, cache?: ViewCache, picture?: SeatView): PrincipalMenu {
  const f = world.faction(faction);
  const receivedView = picture ?? viewFor(world,state,seatIdFor(f.principal),cache);
  const sides = receivedDepartmentSides(world, receivedView);
  const knownPosts = new Map(receivedView.posts.map(p => [p.post, p]));
  // Only public declared structure for a post already named in this seat's establishment or correspondence.
  const today = formatIsoDate(dateOfDay(world.start.startDate, receivedView.day));
  const readStructure = (id: PostId) => {
    const opening = world.start.posts.find(p => p.id === id);
    const declared = opening ?? world.start.temporaryPosts.find(p => p.id === id);
    if (declared === undefined) return undefined;
    const schedule = opening?.departmentChanges.filter(c => c.on <= today).sort((a,b) => strictCompare(a.on,b.on)).at(-1);
    return { ...declared, department: schedule?.department ?? declared.department };
  };
  const structures = new Map<PostId, ReturnType<typeof readStructure>>();
  const structure = (id: PostId) => {
    if (!structures.has(id)) structures.set(id, readStructure(id));
    return structures.get(id);
  };
  const side = (id: PostId) => {
    const p = structure(id);
    return p === undefined ? null : sides.get(p.department) ?? null;
  };
  const templates = world.map.world.organisationTemplates ?? [];
  const forms = new Set(templates.flatMap(t => t.posts.map(p => p.id)));
  const armies = new Set(templates.map(t => t.army));
  const blocksByPost = new Map<PostId, ForceBlockId[]>();
  // Resolve each assigned post’s received formation chain once.
  const chains = new Map<PostId, PostId[]>();
  for (const id of Object.keys(state.forceAssignments) as ForceBlockId[]) {
    const assigned = state.forceAssignments[id];
    if (assigned == null) continue;
    let chain = chains.get(assigned);
    if (chain === undefined) {
      chain = [assigned];
      const seen = new Set(chain);
      let post = assigned;
      while (forms.has(post)) {
        const parent = knownPosts.get(post)?.parent;
        if (parent == null || seen.has(parent)) break;
        seen.add(parent);
        if (forms.has(parent) || armies.has(parent)) chain.push(parent);
        post = parent;
      }
      chains.set(assigned, chain);
    }
    for (const post of chain) {
      const list = blocksByPost.get(post);
      if (list === undefined) blocksByPost.set(post, [id]);
      else list.push(id);
    }
  }
  const institutional = (id: PostId) => world.roleOf(structure(id)?.kind ?? '') === 'office';
  // A held opening command does not disappear when its garrison is secretly captured.
  const field = (id: PostId) => !institutional(id) && (blocksByPost.has(id) ||
    (knownPosts.get(id)?.status === 'held' && (world.start.forceBlocks.some(b => b.post === id) || armies.has(id))));
  const transit = transitByPost(state, f.principal);
  const relays = (id: PostId): PostId[] => {
    const up: PostId[] = [];
    for (let parent = knownPosts.get(id)?.parent; parent != null && parent !== receivedView.post && !up.includes(parent); parent = knownPosts.get(parent)?.parent) up.push(parent);
    return up.reverse();
  };
  // Typical days to a post's seat in pack data, or where it stood at the start of play, or else his own side's capital:
  // the principal is not told where it is today (exit review P2).
  const routesTo = (id: PostId): RouteOption[] => {
    const p = structure(id);
    const capital = capitalOf(state, faction);
    const to = institutional(id) ? capital : p?.region ?? world.start.temporaryPosts.find(p => p.id === id)?.region ?? world.startHeadquarters(id) ?? capital;
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
    const p = structure(id);
    if (p === undefined) return false;
    const dept = world.map.world.departments.find((d) => d.id === p.department);
    return raisingKinds.has(p.kind) && p.region !== null && !selfGoverning.has(dept?.kind ?? '');
  };
  // The posts as he believes them (0052; lane 1.12): a field post whose commander a battle took stays on his menu, with
  // the man he lost, until the report of it reaches him; an order he sends it meanwhile comes back undelivered.
  const ownPosts = receivedView.posts.filter(p => side(p.post) === faction).map(p => p.post).sort(strictCompare);
  const commandable: CommandablePost[] = ownPosts.filter(id => knownPosts.get(id)!.status === 'held' && knownPosts.get(id)!.holder !== null && field(id))
    .map(id => ({ post: id, holder: knownPosts.get(id)!.holder!, relays: relays(id), routes: routesTo(id), ...receivedStrength(state, f.principal, id), raising: raisesRegiments(id), inTransit: [...(transit.get(id) ?? [])].sort(strictCompare) }));
  let callsAnswered: ReadonlySet<PostId | null> | undefined;
  const calledOn = (id: PostId) => {
    if (transit.get(id)?.has('call')) return true;
    callsAnswered ??= new Set(Object.values(state.orderResponses).filter(isCallAnswer).map(r => r.respPost));
    return callsAnswered.has(id);
  };
  const raising: RaisingPost[] = receivedView.posts.filter(p => p.status === 'held' && p.holder !== null && (side(p.post) === faction || side(p.post) === null) && raisesRegiments(p.post))
    .map(p => ({ post: p.post, holder: p.holder!, routes: routesTo(p.post), called: calledOn(p.post) }));
  // Only received vacancies in commands held at the opening; unknown holders and unreceived losses stay unchanged.
  const heldAtStart = new Set(world.start.posts.filter(p => p.holder !== null).map(p => p.id));
  const vacancies: Vacancy[] = ownPosts.filter(id => !forms.has(id) && knownPosts.get(id)!.status === 'vacant' && heldAtStart.has(id) && field(id))
    .map(id => {
      const vacancyBlocks = blocksByPost.get(id) ?? [];
      if (!armies.has(id)) vacancyBlocks.sort(strictCompare);
      const naval = vacancyBlocks.length > 0 && vacancyBlocks.every(b => isNaval(world.map, state, b));
      return { post: id, arm: naval ? 'naval' : 'land', routes: routesTo(id), appointing: transit.get(id)?.has('appoint') === true };
    });
  const previousCandidates = cache?.candidates.get(faction);
  let candidates: readonly Candidate[];
  if (previousCandidates !== undefined && previousCandidates.world === world && previousCandidates.posts === receivedView.posts && previousCandidates.reports === receivedView.reports && previousCandidates.calendar === state.calendarStart) {
    candidates = previousCandidates.candidates;
  } else {
    candidates = receivedCandidates(world, state, f.principal, faction, null, receivedView);
    if (cache !== undefined) {
      // Prove the whole graph frozen before retaining it for another request.
      candidates = freezeDeep(candidates, cache);
      cache.candidates.set(faction, { world, posts: receivedView.posts, reports: receivedView.reports, calendar: state.calendarStart, candidates });
    }
  }
  const historicalAppointees: PersonId[] = [];
  const historicalAppointments: NonNullable<PrincipalMenu['historicalAppointments']>[number][] = [];
  const history = state.seatAssignments[seatIdFor(f.principal)]?.seatDriver === 'rules';
  if (history) {
    const today = formatIsoDate(dateOfDay(state.calendarStart!, state.stateDay + 1));
    const rows = world.map.world.rules.ruleSeats.principals.find((r) => r.faction === faction)?.appointments ?? [];
    // An effective date makes an unsent letter due. Attention can defer sending, but a refusal is final.
    // Read only the identity of the principal's own sent letter, not its private answer or willingness.
    let dispatches: ReturnType<typeof appointmentDispatchesByDay> | undefined;
    const issued = (post: PostId, person: PersonId): boolean => {
      dispatches ??= appointmentDispatchesByDay(state, f.principal);
      for (const [day, dayLetters] of dispatches) {
        const expected = mintMessageId(new Set(), day, f.principal, person, `verb.appoint.${post}`);
        const prefix = `${expected}.`;
        if (dayLetters.some(letter => letter === expected || letter.startsWith(prefix))) return true;
      }
      return false;
    };
    const unsent = rows.filter(a => 'onDate' in a && !issued(a.post, a.person));
    historicalAppointees.push(...new Set(unsent.map(a => a.person)));
    historicalAppointees.sort(strictCompare);
    for (const a of [...unsent].sort((a, b) => strictCompare(a.post, b.post) || strictCompare(a.person, b.person))) {
      if (!('onDate' in a) || a.onDate > today || !candidates.some((p) => p.person === a.person) || transit.get(a.post)?.has('appoint')) continue;
      const template = world.start.temporaryPosts.find(p => p.id === a.post);
      const kind = world.map.world.vocabularies.postKinds.find(k => k.id === template?.kind);
      const mayEstablish = template !== undefined && !knownPosts.has(a.post) && sides.get(template.department) === faction && kind?.creatable === 'appoint' && kind.temporary && (template.parent === null || (knownPosts.has(template.parent) && side(template.parent) === faction));
      if (!mayEstablish && (knownPosts.get(a.post)?.status !== 'vacant' || side(a.post) !== faction)) continue;
      // The letter goes to the man, not to a post that does not exist yet (the appoint verb's own route).
      const to = capitalOf(state, faction);
      const routes = ORDER_ROUTES.flatMap((route): RouteOption[] => {
        const l = routeLatency(ground.latency, world.rules.latency, route, to, to, faction, null);
        return l.ok ? [{ route, typicalDays: l.latency.days, price: route === 'special-messenger' ? world.rules.latency.specialMessengerPrice : 0 }] : [];
      });
      historicalAppointments.push({ post: a.post, person: a.person, routes });
    }
  }
  const situations: SituationChoice[] = [];
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (def.faction !== faction || r === undefined || r.sitStatus !== 'open' || r.sitSurfacedDay === null || r.sitDelegate !== null) continue;
    const proposers = new Set(def.options.filter((o) => r.sitOpenOptions.includes(o.id)).flatMap((o) => Array.isArray(o.proposedBy) ? o.proposedBy : []));
    const consultPosts = ownPosts.filter((post) => {
      const holder = knownPosts.get(post)!.holder;
      if (holder === null || holder === f.principal || !proposers.has(holder)) return false;
      // Only the identity of his own sent letter is read, never its actual response or an adviser's private stance.
      const tag = `verb.consult.${def.id}.${post}`;
      const sentTo = (id: string | null | undefined, person: PersonId): boolean => {
        if (id === null || id === undefined) return false;
        const issuedDay = Number(id.split('.')[1]);
        if (!Number.isSafeInteger(issuedDay)) return false;
        const expected = mintMessageId(new Set(), issuedDay, f.principal, person, tag);
        return id === expected || id.startsWith(`${expected}.`);
      };
      if (state.messagesInTransit.some((m) => (m.msgVerb?.verbIssuer === f.principal && m.msgVerb.verbKind === 'consult' && m.msgVerb.verbSubject === def.id && m.msgVerb.verbPost === post) || (m.msgTo === f.principal && sentTo(m.msgReport?.reportAnswers, m.msgReport?.reportAuthor ?? m.msgFrom)))) return false;
      if (Object.values(state.orderResponses).some((a) => a.respKind === 'verb:consult' && a.respPost === post && sentTo(a.respOrder, a.respPerson))) return false;
      return !knowledgeOf(state, seatIdFor(f.principal)).knownReports.some((k) => sentTo(k.knownBody.reportAnswers, k.knownBody.reportAuthor));
    });
    situations.push({ ...situationChoice(def, r.sitOpenOptions, def.delegableTo, null), consultPosts });
  }
  const d = world.map.world.rules.plans.goalDefaults;
  const knowledge = knowledgeOf(state, seatIdFor(f.principal));
  const sentOrders = knowledge.knownSentOrders ?? [];
  const conditional = new Map(commandable.flatMap(c => {
    if (!sentOrders.some(o => o.sentPost === c.post && o.sentGoal?.goalDiscretion !== undefined)) return [];
    const terms = receivedConditionalGoal(state, f.principal, c.post, c.holder);
    return terms === undefined ? [] : [[c.post, terms] as const];
  }));
  const authoredPosts = new Set(sentOrders.filter(o => o.sentKind === 'goal' && o.sentLetter !== undefined).map(o => o.sentPost));
  const awaiting = [...postsInStatus(state, 'ready').filter(p => !conditional.has(p) && !authoredPosts.has(p) &&
    state.planRecords[p]!.planIssuer === f.principal && !answerInTransit(state, f.principal, p, ['go'])),
    ...commandable.filter(c => authoredPosts.has(c.post) && !conditional.has(c.post) && receivedAuthoredGo(state, f.principal, c.post, c.holder) !== undefined).map(c => c.post),
    ...[...conditional].filter(([, g]) => g.ready).map(([p]) => p),
  ].sort(strictCompare);
  const proposals = receivedProposalPapers(state, f.principal).flatMap(paper => {
    const body = paper.knownBody;
    const post = body.reportAuthorPost!;
    if (!commandable.some(c => c.post === post && c.holder === body.reportAuthor)) return [];
    const dispatch = authoredAnswer(knowledge, paper);
    const doctrine = dispatch === undefined ? undefined : world.map.world.rules.ruleSeats.principals.find(r => r.faction === faction);
    const authored = doctrine?.offensives.find(o => o.letter !== undefined && letterKey(o.letter) === letterKey(dispatch!.dispatchLetter) && o.post === post);
    const legacy = body.reportLetter === undefined ? latestSentGoal(sentOrders, knowledge.knownReports, post)?.sentGoal : undefined;
    const ordered = authored !== undefined ? authoredGoal(authored, d, doctrine!.crossNeutral) : legacy === undefined ? undefined : termsOfGoal(legacy);
    if (ordered === undefined) return [];
    return [{
      paper: paper.id, order: body.reportAnswers!, post, author: body.reportAuthor,
      ordered, goal: termsOfGoal(body.reportProposal!.goal), reasons: body.reportProposal!.reasons,
    }];
  });
  const doctrine = doctrineView(world, state, faction, receivedView, sides, proposals);
  const appointments = world.map.world.rules.ruleSeats.principals.find(r => r.faction === faction)?.appointments;
  const receivedPosts = receivedView.posts;
  const appointmentView = appointments?.filter(a => 'fromDate' in a).map(a => ({
    post: a.post, person: a.person, from: a.fromPost,
    ready: state.stateDay + 1 >= daysFromCivil(parseIsoDate(a.fromDate)) - daysFromCivil(parseIsoDate(state.calendarStart!)) && sides.get(a.requiresDepartment) === faction && receivedCandidates(world,state,f.principal,faction,a.fromPost,receivedView).some(p=>p.person===a.person) && !receivedPosts.some(p=>p.post===a.post),
    issued: state.messagesInTransit.some(m => m.msgVerb?.verbKind === 'appoint' && m.msgVerb.verbIssuer === f.principal && m.msgVerb.verbPost === a.post) || Object.values(state.orderResponses).some(r => r.respKind === 'verb:appoint' && r.respPost === a.post && r.respPerson === a.person),
    routes: routesTo(a.fromPost ?? a.post),
  }));
  return {
    menuKind: 'principal',
    faction,
    politicalBlocs: receivedView.politics?.blocs ?? [],
    atWarSince: warSince(world, state, faction),
    doctrine: appointmentView === undefined ? doctrine : { ...doctrine, appointments: appointmentView },
    ...(history ? { historicalAppointments, historicalAppointees } : {}),
    raising,
    vacancies,
    candidates,
    attention: { left: attentionLeft(state, seatIdFor(f.principal)), costs: world.map.world.rules.people.attention.costs, specialMessenger: world.rules.latency.specialMessengerPrice },
    commandable,
    situations,
    reviews: reviewsFor(state, f.principal),
    ...(proposals.length === 0 ? {} : { proposals }),
    awaiting,
    goalDefaults: { risk: d.risk, deadlineDays: d.deadlineDays, rail: d.rail, river: d.river, sea: d.sea, neutral: d.neutral, awaitWord: d.awaitWord, approveAsDrafted: d.approveAsDrafted },
    sentGoals: sentOrders.flatMap(s => {
      const g = s.sentGoal;
      if (s.sentKind !== 'goal' || s.sentDay > state.stateDay || g === undefined) return [];
      return [{ post: s.sentPost, message: s.sentMessage, goal: termsOfGoal(g),
        ...(s.sentDoctrine === undefined ? {} : { doctrine: s.sentDoctrine }),
        ...(s.sentLetter === undefined ? {} : { letter: s.sentLetter }),
        ...(s.sentProposal === undefined ? {} : { proposalReply: true as const }),
      }];
    }),
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
      const men = blocks.reduce((n, b) => n + (forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength ?? 0), 0);
      return { faction, blocks, men, pressing: [...(s?.pressing ?? []), ...arriving], unknown: [] as ForceBlockId[], arriving: arriving.length > 0 };
    });
    // Only where a battle can be fought today: one is open, a side is marching in, or a side may attack.
    const open = openBattleIn(state, region);
    if (open === null && !sides.some((s) => s.arriving || mayAttackToday(rules, state, s, day))) continue;
    sides.forEach((side, i) => {
      const command = sideCommand(state, side.blocks, world.map.forceTotalsCache);
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
    const view = viewFor(world,state,seat,cache);
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `principal:${faction}:${day}`, view, menu: principalMenu(world, state, faction, ground, cache, view) }, cache));
  }
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (r === undefined || r.sitStatus !== 'open' || r.sitDelegate === null) continue;
    const seat = seatIdFor(r.sitDelegate);
    const menu: DelegatedMenu = { menuKind: 'delegated-situation', choice: situationChoice(def, r.sitOpenOptions, [], valuesOf(world.map, r.sitDelegate)) };
    out.push(freezeDeep({ requestDay: day, requestSeat: seat, requestKey: `delegated:${def.id}:${day}`, view: viewFor(world, state, seat, cache), menu }, cache));
  }
  // 0052: the kernel supplies consistent choices to the commander himself, never to his principal.
  for (const { post, holder, options } of choosingMenus(state, day)) {
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
