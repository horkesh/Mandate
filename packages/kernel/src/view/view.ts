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
import type { PersonId, RegionId, SeatId } from '../ids.ts';
import { latestEnemyClaims, perceived } from '../knowledge/beliefs.ts';
import { knowledgeOf, type KnownReport, type SeatKnowledge } from '../knowledge/knowledge.ts';
import type { StandingGoal } from '../plans/goal.ts';
import type { State } from '../root-state.ts';
import { seatOf } from '../seats/seats.ts';
import { perceptionBias } from '../standin/traits.ts';
import { heldPost, sideOfPerson } from '../command/command.ts';
import { whereIsPerson } from '../seats/posts.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { BeliefView, GoalView, ReportView, SeatView, SituationView } from './types.ts';

export interface ViewCache {
  readonly reports: WeakMap<KnownReport, ReportView>;
  readonly lists: WeakMap<SeatKnowledge, readonly ReportView[]>;
  /** Beliefs depend on what he holds and on how he reads it, so both are in the key (review F4). */
  readonly beliefs: Map<SeatId, { readonly knowledge: SeatKnowledge; readonly perception: number; readonly beliefs: Readonly<Record<RegionId, BeliefView>> }>;
  readonly goals: WeakMap<StandingGoal, GoalView>;
  readonly views: Map<SeatId, SeatView>;
  readonly situations: Map<SeatId, { readonly states: State['situationStates']; readonly views: readonly SituationView[] }>;
}

export function createViewCache(): ViewCache {
  return { reports: new WeakMap(), lists: new WeakMap(), beliefs: new Map(), goals: new WeakMap(), views: new Map(), situations: new Map() };
}

function freeze<T extends object>(o: T): T {
  return Object.freeze(o);
}

function reportView(r: KnownReport): ReportView {
  const b = r.knownBody;
  return freeze({
    id: r.id,
    type: b.reportType,
    subtype: b.reportSubtype,
    author: b.reportAuthor,
    authorPost: b.reportAuthorPost,
    subjectKind: b.reportSubjectKind,
    subjectId: b.reportSubjectId,
    claims: freeze(
      b.reportClaims.map((c) => freeze({ kind: c.claimKind, region: c.claimRegion, value: c.claimValue, token: c.claimToken, confidence: c.claimConfidence })),
    ),
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

function goalView(g: StandingGoal): GoalView {
  return freeze({
    kind: g.standingSpec.goalSpecKind,
    region: g.standingSpec.goalSpecRegion,
    issuer: g.standingIssuer,
    viaChain: g.standingViaChain,
    setDay: g.standingSetDay,
  });
}

function same<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/** What `seat` may see the morning after `state.stateDay`. Pass a cache to get stable references for unchanged data. */
export function viewFor(world: SeatsWorld, state: State, seat: SeatId, cache: ViewCache = createViewCache()): SeatView {
  const person = world.person(seatOf(state, seat).seatPerson);
  const post = heldPost(state, person.id);
  const knowledge = knowledgeOf(state, seat);

  let reports = cache.lists.get(knowledge);
  if (reports === undefined) {
    reports = freeze(
      knowledge.knownReports.map((r) => {
        let v = cache.reports.get(r);
        if (v === undefined) {
          v = reportView(r);
          cache.reports.set(r, v);
        }
        return v;
      }),
    );
    cache.lists.set(knowledge, reports);
  }

  let beliefs = cache.beliefs.get(seat);
  const bias = perceptionBias(world.rules.traits, person).permille;
  if (beliefs === undefined || beliefs.knowledge !== knowledge || beliefs.perception !== bias) {
    const out: Record<RegionId, BeliefView> = {};
    for (const [region, { report, value }] of latestEnemyClaims(knowledge)) {
      out[region] = freeze({ value: perceived(value, bias), asOfDay: report.knownBody.reportDay, source: report.id });
    }
    beliefs = { knowledge, perception: bias, beliefs: freeze(out) };
    cache.beliefs.set(seat, beliefs);
  }

  let goal: GoalView | null = null;
  const standing = post === null ? undefined : state.standingGoals[post];
  if (standing !== undefined) {
    goal = cache.goals.get(standing) ?? null;
    if (goal === null) {
      goal = goalView(standing);
      cache.goals.set(standing, goal);
    }
  }

  const region = whereIsPerson(world, state, person.id);
  const situations = situationViews(world, state, seat, person.id, cache);
  // His side today: his post's while he holds one (0065), so it can change in play.
  const faction = sideOfPerson(world.map, state, person.id);
  const previous = cache.views.get(seat);
  if (
    previous !== undefined &&
    previous.day === state.stateDay &&
    previous.faction === faction &&
    previous.region === region &&
    previous.goal === goal &&
    previous.enemyBeliefs === beliefs.beliefs &&
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
    situations,
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
            .map((o) => freeze({ id: o.id, label: o.label, proposedBy: o.proposedBy === 'inaction' ? 'inaction' : freeze([...o.proposedBy]), group: o.group })),
        ),
        chosen: freeze([...r.sitChosen]),
        delegatedTo: r.sitDelegate,
        staffAuthor: r.sitStaffAuthor,
      }),
    );
  }
  const views = freeze(out);
  cache.situations.set(seat, { states: state.situationStates, views });
  return views;
}