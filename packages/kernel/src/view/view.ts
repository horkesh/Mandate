/**
 * `viewFor(world, state, seat)`: what one seat may see (FOUNDATION section 8;
 * decision 0015 generalises M2's per-faction view to seats). Derived, never
 * saved.
 *
 * Stable references (decision 0035): State is copy-on-write, so an unchanged
 * record keeps its identity from one day to the next. A `ViewCache`, held by
 * the caller and never part of State, maps each record to the view object
 * built from it last time, so unchanged reports, report lists, beliefs and
 * goals come back as the very same objects and an interface can skip
 * re-rendering them. Every view object is frozen: a seat cannot edit what it
 * was shown.
 */
import type { EdgeId, FactionId, PersonId, RegionId, SeatId } from '../ids.ts';
import { latestEnemyClaims, latestObstructionClaims, latestWorksClaims, perceived } from '../knowledge/beliefs.ts';
import { knowledgeOf, reportsForView, type KnowledgeCache, type OpeningReportCache, type KnownReport, type SeatKnowledge } from '../knowledge/knowledge.ts';
import type { PlanRecord } from '../plans/plans.ts';
import type { State } from '../root-state.ts';
import { seatOf } from '../seats/seats.ts';
import { attentionLeft } from '../seats/attention.ts';
import { perceptionBias, valuesOf } from '../people/traits.ts';
import { trueOf } from '../people/people.ts';
import { capitalOf } from '../command/capitals.ts';
import { mainBody } from '../seats/posts.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { WorldIndex } from '../world/index.ts';
import { createFreezeLedger, type FreezeLedger } from '../tick/freeze.ts';
import { claimedControlView } from './claimed-control.ts';
import { controlEvidence } from '../knowledge/control-beliefs.ts';
import { nextPeopleChange, peopleProjection, seatIdentity, type PeopleProjection } from './people.ts';
import type { ReportClaim } from '../knowledge/report.ts';
import { promiseProjection } from './promises.ts';
import { politicsProjection } from './politics.ts';
import {attentionBudget, audienceProjection, congressProjection} from './desk.ts';
import type { Candidate } from '../seats/api.ts';
import { isProposalBasis } from '../situations/types.ts';
import type { BeliefView, ClaimView, GoalView, ObstructionView, ReportView, SeatView, SituationView, WorksView } from './types.ts';

export interface ViewCache {
  readonly desk: Map<SeatId, {world:SeatsWorld; day:number; budget:State['seatAttention'][SeatId]|undefined; chambers:State['chamberStates']; messages:State['messagesInTransit']; reports:readonly ReportView[]; situations:readonly SituationView[]; projection:Pick<SeatView,'attentionBudget'|'congress'|'audiences'|'politics'|'promises'>}>;
  /** Request graphs already deeply frozen by this caller; shared view children need no second walk. */
  readonly requestFreeze: FreezeLedger;
  /** The available roster follows received papers and posts, never hidden command or service truth. */
  readonly candidates: Map<FactionId, { readonly world: SeatsWorld; readonly reports: readonly ReportView[]; readonly posts: SeatView['posts']; readonly calendar: string | null; readonly candidates: readonly Candidate[] }>;
  readonly knowledge: KnowledgeCache;
  readonly openings: OpeningReportCache;
  readonly reports: WeakMap<KnownReport, ReportView>;
  readonly lists: WeakMap<SeatKnowledge, readonly ReportView[]>;
  /** Beliefs depend on what he holds and on how he reads it, so both are in the key (review F4). */
  readonly beliefs: Map<SeatId, { readonly knowledge: SeatKnowledge; readonly perception: number; readonly beliefs: Readonly<Record<RegionId, BeliefView>> }>;
  /** What he has been told of works and obstructions depends only on what he holds. */
  readonly ground: Map<SeatId, { readonly knowledge: SeatKnowledge; readonly works: Readonly<Record<RegionId, WorksView>>; readonly obstructions: Readonly<Record<EdgeId, ObstructionView>> }>;
  readonly control: WeakMap<WorldIndex, WeakMap<SeatKnowledge, ReturnType<typeof claimedControlView>>>;
  readonly goals: WeakMap<PlanRecord, GoalView>;
  readonly views: Map<SeatId, SeatView>;
  readonly situations: Map<SeatId, { readonly states: State['situationStates']; readonly views: readonly SituationView[] }>;
  readonly people: Map<SeatId, { readonly world: SeatsWorld; readonly reports: readonly ReportView[]; readonly standing: State['personStanding']; readonly day: number; readonly nextChange: number | null; readonly calendar: string | null; readonly person: PersonId; readonly faction: SeatView['faction']; readonly projection: PeopleProjection }>;
}

export function createViewCache(): ViewCache {
  return { desk: new Map(), requestFreeze: createFreezeLedger(), candidates: new Map(), knowledge: new WeakMap(), openings: new WeakMap(), reports: new WeakMap(), lists: new WeakMap(), beliefs: new Map(), ground: new Map(), control: new WeakMap(), goals: new WeakMap(), views: new Map(), situations: new Map(), people: new Map() };
}

function freeze<T extends object>(o: T): T {
  return Object.freeze(o);
}

/** Build once, then freeze: absent battle fields need no temporary objects on ordinary claims. */
function claimView(c: ReportClaim): ClaimView {
  if (c.claimBattle === undefined && c.claimBattleDays === undefined && c.claimCommander === undefined) return freeze({
    kind: c.claimKind, region: c.claimRegion, value: c.claimValue, token: c.claimToken, confidence: c.claimConfidence,
  });
  return freeze({
    kind: c.claimKind, region: c.claimRegion, value: c.claimValue, token: c.claimToken, confidence: c.claimConfidence,
    ...(c.claimBattle === undefined ? {} : { battle: c.claimBattle }),
    ...(c.claimBattleDays === undefined ? {} : { battleDays: freeze([...c.claimBattleDays]) }),
    ...(c.claimCommander === undefined ? {} : { commander: c.claimCommander }),
  });
}

function reportView(r: KnownReport, world: SeatsWorld): ReportView {
  const b = r.knownBody;
  const notice = b.reportSubjectKind === 'situation'
    ? world.situations.find(s => s.id === b.reportSubjectId && s.kind === 'notice'
      && s.report?.reportType === b.reportType && s.report.subtype === b.reportSubtype)
    : undefined;
  return freeze({
    id: r.id,
    ...(notice === undefined ? {} : { text: notice.text }),
    ...(b.reportNotes === undefined ? {} : { notes: freeze(b.reportNotes.map(n => freeze({ ...n, accountMark: freeze({ ...n.accountMark, markVia: freeze([...n.accountMark.markVia]) }), accountReasons: freeze(n.accountReasons.map(s => freeze({ ...s }))) }))) }),
    type: b.reportType,
    subtype: b.reportSubtype,
    author: b.reportAuthor,
    authorPost: b.reportAuthorPost,
    subjectKind: b.reportSubjectKind,
    subjectId: b.reportSubjectId,
    claims: freeze(b.reportClaims.map(claimView)),
    reportedControl: freeze([...controlEvidence([r], world.map.world.rules.supplyControlPermille)].map(([region, { holder, contested }]) => freeze({ region, holder, contested }))),
    ...(r.knownPublicOpening === true ? { openingControl: true as const } : {}),
    day: b.reportDay,
    hour: b.reportHour,
    advice:
      b.reportAdvice === null
        ? null
        : freeze({
            recommends: b.reportAdvice.adviceRecommends,
            reasons: freeze(b.reportAdvice.adviceReasons.map((s) => freeze({ kind: s.reasonKind, weight: s.reasonWeight }))),
            confidence: b.reportAdvice.adviceConfidence,
          }),
    answers: b.reportAnswers,
    receivedDay: r.knownReceivedDay,
    route: r.knownRoute,
    via: freeze([...r.knownVia]),
  });
}

function goalView(r: PlanRecord): GoalView {
  const g = r.planGoal;
  return freeze({
    posture: g.goalPosture,
    objective: g.goalObjective,
    risk: g.goalRisk,
    deadlineDays: g.goalDeadlineDays,
    permissions: freeze({ rail: g.goalRail, river: g.goalRiver, sea: g.goalSea, neutral: g.goalNeutral }),
    committed: freeze([...g.goalCommitted]),
    awaitWord: g.goalAwaitWord,
    approveAsDrafted: g.goalApproveAsDrafted,
    issuer: r.planIssuer,
    viaChain: r.planViaChain,
    setDay: r.planSetDay,
    status: r.planStatus,
  });
}

function same<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/** What `seat` may see the morning after `state.stateDay`. Pass a cache to get stable references for unchanged data. */
export function viewFor(world: SeatsWorld, state: State, seat: SeatId, cache: ViewCache = createViewCache()): SeatView {
  const person = world.person(seatOf(state, seat).seatPerson);
  const knowledge = knowledgeOf(state, seat, cache.knowledge, cache.openings);

  let reports = cache.lists.get(knowledge);
  if (reports === undefined) {
    reports = freeze(
      reportsForView(knowledge).map((r) => {
        let v = cache.reports.get(r);
        if (v === undefined) {
          v = reportView(r, world);
          cache.reports.set(r, v);
        }
        return v;
      }),
    );
    cache.lists.set(knowledge, reports);
  }

  let beliefs = cache.beliefs.get(seat);
  const bias = perceptionBias(world.rules.traits, { id: person.id, boldness: trueOf(state, person.id).trueBoldness, values: valuesOf(world.map, person.id) }).permille;
  if (beliefs === undefined || beliefs.knowledge !== knowledge || beliefs.perception !== bias) {
    const out: Record<RegionId, BeliefView> = {};
    for (const [region, { report, value }] of latestEnemyClaims(knowledge)) {
      out[region] = freeze({ value: perceived(value, bias), asOfDay: report.knownBody.reportDay, source: report.id });
    }
    beliefs = { knowledge, perception: bias, beliefs: freeze(out) };
    cache.beliefs.set(seat, beliefs);
  }

  let ground = cache.ground.get(seat);
  if (ground === undefined || ground.knowledge !== knowledge) {
    const works: Record<RegionId, WorksView> = {};
    for (const [region, { report, value }] of latestWorksClaims(knowledge)) works[region] = freeze({ value, asOfDay: report.knownBody.reportDay, source: report.id });
    const obstructions: Record<EdgeId, ObstructionView> = {};
    for (const [edge, { report, closed, by }] of latestObstructionClaims(knowledge)) obstructions[edge] = freeze({ closed, by, asOfDay: report.knownBody.reportDay, source: report.id });
    ground = { knowledge, works: freeze(works), obstructions: freeze(obstructions) };
    cache.ground.set(seat, ground);
  }

  let controlOnMap = cache.control.get(world.map);
  if (controlOnMap === undefined) {
    controlOnMap = new WeakMap();
    cache.control.set(world.map, controlOnMap);
  }
  let control = controlOnMap.get(knowledge);
  if (control === undefined) {
    control = claimedControlView(world.map, reportsForView(knowledge));
    controlOnMap.set(knowledge, control);
  }

  const { post, faction } = seatIdentity(world, person.id, reports, state.stateDay, state.calendarStart);
  let goal: GoalView | null = null;
  const record = post === null ? undefined : state.planRecords[post];
  if (record !== undefined) {
    goal = cache.goals.get(record) ?? null;
    if (goal === null) {
      goal = goalView(record);
      cache.goals.set(record, goal);
    }
  }

  // A principal knows his capital; a field holder knows his own main body's position.
  // Office placement comes from the public establishment, never the hidden post table.
  const principalSide = world.start.factions.find(f => f.principal === person.id)?.faction;
  const openingPost = world.start.posts.find(p => p.id === post) ?? world.start.temporaryPosts.find(p => p.id === post);
  const office = openingPost !== undefined && world.roleOf(openingPost.kind) === 'office';
  const body = post === null || office ? null : mainBody(state, post, world.map.forceTotalsCache, world.map);
  const region = principalSide !== undefined ? capitalOf(state, principalSide)
    : office && faction !== null ? capitalOf(state, faction)
    : body !== null ? state.forceLocations[body]!.locRegion
    : world.start.posts.find(p => p.id === post)?.region ?? world.start.temporaryPosts.find(p => p.id === post)?.region
      ?? (faction === null ? null : state.factionCapitals[faction]);
  if (region === null || region === undefined) throw new RangeError(`${person.id} holds no post and has no side's capital to stand in`);
  const situations = situationViews(world, state, seat, person.id, cache);
  // Lane 1.13: his own week's attention (0025), which he always knows; null for a seat that keeps none.
  const attention = attentionLeft(state, seat);
  let people = cache.people.get(seat);
  if (people === undefined || people.world !== world || people.reports !== reports || people.standing !== state.personStanding || people.person !== person.id || people.faction !== faction || people.calendar !== state.calendarStart || state.stateDay < people.day || (people.nextChange !== null && state.stateDay >= people.nextChange)) {
    // The projection decides own-side membership from opening data and received evidence (R76).
    // Reports currently carry no standing figure for a man believed foreign or neutral.
    const standingFor = (id: PersonId) => state.personStanding[id] ?? null;
    const projection = peopleProjection(world, person.id, faction, reports, standingFor, state.stateDay, state.calendarStart);
    people = { world, reports, standing: state.personStanding, day: state.stateDay, nextChange: nextPeopleChange(world, reports, state.stateDay, state.calendarStart), calendar: state.calendarStart, person: person.id, faction, projection };
    cache.people.set(seat, people);
  }
  const previous = cache.views.get(seat);
  let desk=cache.desk.get(seat);
  if(desk===undefined||desk.world!==world||desk.day!==state.stateDay||desk.budget!==state.seatAttention[seat]||desk.chambers!==state.chamberStates||desk.messages!==state.messagesInTransit||desk.reports!==reports||desk.situations!==situations){
    const principal=world.start.factions.some(f=>f.principal===person.id);
    const projection={promises:principal?promiseProjection(person.id,state.stateDay,reports):Object.freeze([]),politics:politicsProjection(world,person.id,state.stateDay,reports,faction),attentionBudget:attentionBudget(world,state,seat),congress:congressProjection(world,state,person.id,reports,situations),audiences:principal?audienceProjection(state,person.id,reports):Object.freeze([])};
    desk={world,day:state.stateDay,budget:state.seatAttention[seat],chambers:state.chamberStates,messages:state.messagesInTransit,reports,situations,projection};
    cache.desk.set(seat,desk);
  }
  if (
    previous !== undefined &&
    previous.day === state.stateDay &&
    previous.attention === attention &&
    previous.attentionBudget === desk.projection.attentionBudget &&
    previous.congress === desk.projection.congress &&
    previous.politics === desk.projection.politics &&
    previous.promises === desk.projection.promises &&
    previous.audiences === desk.projection.audiences &&
    previous.posts === people.projection.posts &&
    previous.people === people.projection.people &&
    previous.faction === faction &&
    previous.post === post &&
    previous.region === region &&
    previous.goal === goal &&
    previous.enemyBeliefs === beliefs.beliefs &&
    previous.worksBeliefs === ground.works &&
    previous.obstructionBeliefs === ground.obstructions &&
    previous.controlBeliefs === control.controlBeliefs &&
    previous.situations === situations &&
    same(previous.reports, reports)
  ) {
    return previous;
  }
  const view: SeatView = freeze({
    day: state.stateDay,
    seat,
    person: person.id,
    faction,
    post,
    region,
    goal,
    reports,
    enemyBeliefs: beliefs.beliefs,
    worksBeliefs: ground.works,
    obstructionBeliefs: ground.obstructions,
    ...control,
    situations,
    attention,
    ...desk.projection,
    ...people.projection,
  });
  cache.views.set(seat, view);
  return view;
}

/**
 * The situations that have reached this seat: those of his faction once
 * surfaced, if he is its principal, and any handed to him. Built from the
 * situation's record and its text keys; the historical default is never read.
 */
function situationViews(world: SeatsWorld, state: State, seat: SeatId, person: PersonId, cache: ViewCache): readonly SituationView[] {
  const cached = cache.situations.get(seat);
  if (cached !== undefined && cached.states === state.situationStates) return cached.views;
  const out: SituationView[] = [];
  for (const def of world.situations) {
    const r = state.situationStates[def.id];
    if (r === undefined || r.sitSurfacedDay === null) continue;
    if (world.faction(def.faction).principal !== person && r.sitDelegate !== person) continue;
    out.push(
      freeze({
        id: def.id,
        kind: def.kind,
        title: def.title,
        text: def.text,
        status: r.sitStatus,
        surfacedDay: r.sitSurfacedDay,
        options: freeze(
          def.options
            .filter((o) => r.sitOpenOptions.includes(o.id))
            .map((o) => freeze({ id: o.id, label: o.label, proposedBy: isProposalBasis(o.proposedBy) ? freeze({ ...o.proposedBy, cites: freeze(o.proposedBy.cites.map(c => freeze({ ...c }))) }) : o.proposedBy === 'inaction' ? 'inaction' : freeze([...o.proposedBy]), group: o.group })),
        ),
        chosen: freeze([...r.sitChosen]),
        delegatedTo: r.sitDelegate,
        staffAuthor: def.staffLine === null ? null : r.sitStaffAuthor,
        ...(def.staffAbsence === undefined ? {} : { staffAbsence: def.staffAbsence.none }),
      }),
    );
  }
  const views = freeze(out);
  cache.situations.set(seat, { states: state.situationStates, views });
  return views;
}
