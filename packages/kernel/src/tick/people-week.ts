/**
 * The weekly people step (lane 1.5; FOUNDATION section 10's phase 7, "people's politics and seat initiatives"; 0040).
 * Every `weekDays` days: grievances fade (`people`); promises that fell due unkept break (`people`); each man moves a rung
 * on the ladder and rivals emerge (`ladder`); and seat initiatives are weighed through the same compliance machinery as
 * orders, reaching the principal only as a memorandum by the report routes (`seats` keeps their cooldowns).
 */
import { strictCompare } from '../compare.ts';
import { resolveDirective } from '../compliance.ts';
import { heldPost, sideOfPerson } from '../command/command.ts';
import type { ComplianceRung } from '../directive.ts';
import type { PersonId } from '../ids.ts';
import { rungIndex, rungOf, weeklyLadder } from '../ladder/ladder.ts';
import { applyPeopleChanges, type PeopleChange } from '../people/people.ts';
import { contextFor, profileOf } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import { markInitiative } from '../seats/attention.ts';
import { seatIdFor } from '../seats/seats.ts';
import { term } from '../knowledge/truth.ts';
import { fire, sendReport, type TickContext } from './context.ts';

export const WEEK_MECHANICS = ['ladder.moved', 'ladder.rival', 'people.grievances_faded', 'people.promise_broken', 'seats.initiative'] as const;

const TAKES: ReadonlySet<ComplianceRung> = new Set(['exceed', 'comply']);

/** Whether today is a weekly people step. */
export function isPeopleWeek(ctx: TickContext): boolean {
  return ctx.day % ctx.world.map.world.rules.people.verbs.weekDays === 0;
}

export function peopleWeek(ctx: TickContext, start: State): State {
  const world = ctx.world;
  const rules = world.map.world.rules.people;
  const vocab = world.map.world.vocabularies.ranks;
  const principalOf = (p: PersonId): PersonId | null => {
    const side = sideOfPerson(world.map, start, p);
    return side !== null && world.factionIds.includes(side) ? world.faction(side).principal : null;
  };
  // 1. Grievances fade, and promises that fell due unkept break.
  const changes: PeopleChange[] = [];
  for (const p of Object.keys(start.personGrievances).sort(strictCompare) as PersonId[]) {
    changes.push({ change: 'decay_grievances', person: p, divisor: rules.verbs.ladder.decayDivisor });
    fire(ctx, 'people.grievances_faded');
  }
  for (const p of Object.keys(start.personPromises).sort(strictCompare) as PersonId[]) {
    for (const promise of start.personPromises[p]!) {
      if (promise.promiseDue > ctx.day) continue;
      const principal = principalOf(p);
      changes.push({ change: 'promise_settled', person: p, kind: promise.promiseKind });
      changes.push({ change: 'grievance', person: p, kind: 'promise_broken', weight: rules.verbs.promise.brokenWeight, against: principal, cause: promise.promiseKind });
      if (principal !== null && principal !== p) changes.push({ change: 'regard', person: p, toward: principal, delta: rules.verbs.promise.brokenRegard });
      fire(ctx, 'people.promise_broken');
    }
  }
  let state = applyPeopleChanges(start, changes, ctx.day, rules, vocab);

  // 2. The ladder and rivals.
  const ladder = weeklyLadder(rules, state, world.personIds, principalOf, ctx.day);
  state = ladder.state;
  for (const e of ladder.events) fire(ctx, e.event === 'rival' ? 'ladder.rival' : 'ladder.moved');

  // 3. Seat initiatives: a man takes one if he would comply with it of his own will (his values and temperament, his
  // regard for his principal, his grievances and rung), and its cooldown has run; his memorandum goes by the report routes.
  for (const p of [...world.personIds].sort(strictCompare)) {
    const principal = principalOf(p);
    if (principal === null || principal === p) continue;
    if (state.personStatus[p]?.statusKind !== 'serving') continue;
    const kind = world.map.world.people.find((x) => x.id === p)?.kind;
    const seat = seatIdFor(p);
    for (const initiative of rules.verbs.initiatives) {
      if (kind === undefined || !initiative.kinds.includes(kind)) continue;
      if (rungIndex(rungOf(state, p)) < rungIndex(initiative.fromRung)) continue;
      const last = state.seatInitiatives[seat]?.[initiative.id];
      if (last !== undefined && ctx.day - last < initiative.cooldownDays) continue;
      const answer = resolveDirective(profileOf(world, state, p, principal), { boldness: initiative.boldness, honours: initiative.honours, offends: initiative.offends, required: 0 }, contextFor(world, state, p), rules.compliance);
      if (!TAKES.has(answer.actual)) continue;
      state = markInitiative(state, seat, initiative.id, ctx.day);
      fire(ctx, 'seats.initiative');
      ctx.events.push({ event: 'initiative', person: p, post: heldPost(state, p), message: null, terms: answer.contributions.map((k) => term('relay_term', k.amount, { person: p, rule: k.term })) });
      sendReport(ctx, state, {
        body: {
          reportType: 'advice',
          reportSubtype: 'memorandum',
          reportAuthor: p,
          reportAuthorPost: heldPost(state, p),
          reportSubjectKind: 'person',
          reportSubjectId: p,
          reportClaims: [],
          reportDay: ctx.day,
          reportHour: null,
          reportAdvice: { adviceRecommends: initiative.recommends, adviceReasons: answer.statedReasons.map((r) => ({ reasonKind: r.kind, reasonWeight: 1000 })), adviceConfidence: 700 },
          reportAnswers: null,
        },
        truth: { truthTerms: answer.contributions.map((k) => term('relay_term', k.amount, { person: p, rule: k.term })), truthTrimmed: [] },
        to: principal,
        tag: `initiative.${initiative.id}.${p}`,
      });
    }
  }
  return state;
}
