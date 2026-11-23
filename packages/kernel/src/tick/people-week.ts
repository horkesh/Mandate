/**
 * The weekly people step (lane 1.5; FOUNDATION section 10's phase 7, "people's politics and seat initiatives"; 0040).
 * Every `weekDays` days: grievances fade (`people`); promises that fell due unkept break (`people`); each man moves a rung
 * on the ladder and rivals emerge (`ladder`); and seat initiatives are weighed through the same compliance machinery as
 * orders, reaching the principal only as a memorandum by the report routes (`seats` keeps their cooldowns).
 */
import { strictCompare } from '../compare.ts';
import { resolveDirective } from '../compliance.ts';
import { departmentSide, heldPost, relieveHolder, sideOfPerson } from '../command/command.ts';
import { blocOfPerson, resignationChoice } from '../people/resignation.ts';
import { dateOfDay, formatIsoDate } from '../world/calendar.ts';
import { whereIsPerson } from '../seats/posts.ts';
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

export const WEEK_MECHANICS = ['ladder.moved', 'ladder.rival', 'people.grievances_faded', 'people.promise_broken', 'seats.initiative', 'people.resigned', 'people.stayed'] as const;

/** Historical departures fall on their effective date; unscripted choices are offered on the people week. */
export function serviceChoices(ctx: TickContext, start: State): State {
  const map = ctx.world.map;
  const rules = map.world.rules.people;
  const today = formatIsoDate(dateOfDay(ctx.world.start.startDate, ctx.day));
  let state = start;
  for (const record of [...map.world.people].sort((a, b) => strictCompare(a.id, b.id))) {
    const p = record.id;
    const row = record.service;
    if (row === undefined || state.personService?.[p] !== undefined || state.personStatus[p]?.statusKind !== 'serving') continue;
    const from = sideOfPerson(map, state, p);
    if (from === null || from === row.toFaction) continue;
    const historical = rules.resignation.historicalDefaults && row.historicalOn !== null;
    if (historical) {
      if (today < row.historicalOn! || (row.government !== null && departmentSide(state, row.government) !== row.toFaction)) continue;
    } else if (!isPeopleWeek(ctx) || row.government === null || departmentSide(state, row.government) !== row.toFaction) continue;
    const answer = resignationChoice(map, state, p);
    const choice = historical ? 'resign' : answer.choice;
    const terms = historical ? [...answer.terms, term('service_term', ctx.day, { person: p, rule: 'historical_date' })] : answer.terms;
    const post = heldPost(state, p);
    const origin = whereIsPerson(ctx.world, state, p);
    // His own letter, sent from where he was serving, reaches both principals by the existing report routes.
    for (const side of [...new Set([from, ...(choice === 'resign' ? [row.toFaction] : [])])].sort(strictCompare)) {
      if (!ctx.world.factionIds.includes(side)) continue;
      sendReport(ctx, state, {
        body: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: p, reportAuthorPost: post,
          reportSubjectKind: 'person', reportSubjectId: p,
          reportClaims: [{ claimKind: 'service-choice', claimToken: choice, claimRegion: null, claimValue: 1, claimConfidence: 1000 }],
          reportDay: ctx.day, reportHour: null, reportAdvice: null, reportAnswers: null },
        truth: { truthTerms: terms, truthTrimmed: [] }, to: ctx.world.faction(side).principal,
        tag: `service.${p}.${side}`, fromRegion: origin,
      });
    }
    if (choice === 'resign' && post !== null) state = relieveHolder(state, post);
    state = applyPeopleChanges(state, [{ change: 'service', person: p, service: {
      serviceFaction: choice === 'resign' ? row.toFaction : from,
      serviceBloc: choice === 'resign' ? row.toBloc : blocOfPerson(map, state, p), serviceChoice: choice, serviceDay: ctx.day,
    } }], ctx.day, rules, map.world.vocabularies.ranks);
    fire(ctx, choice === 'resign' ? 'people.resigned' : 'people.stayed');
    ctx.events.push({ event: 'service_choice', person: p, post, message: null, terms });
  }
  return state;
}

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
      if (principal !== null && start.personStatus[p]?.statusKind === 'serving') sendReport(ctx, start, {
        body: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: p, reportAuthorPost: heldPost(start, p),
          reportSubjectKind: 'person', reportSubjectId: p, reportDay: ctx.day, reportHour: null, reportAdvice: null, reportAnswers: null,
          reportClaims: [{ claimKind: 'promise-broken', claimRegion: null, claimToken: promise.promiseKind, claimValue: promise.promiseDue, claimConfidence: 1000 }] },
        truth: { truthTerms: [], truthTrimmed: [] }, to: principal, tag: `promise.expired.${p}.${promise.promiseKind}.${promise.promiseDue}`,
      });
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
      // Share the willingness terms and candour, but let this pack rule govern admission and the stated answer.
      const answer = resolveDirective(profileOf(world, state, p, principal), { boldness: initiative.boldness, honours: initiative.honours, offends: initiative.offends, required: 0 }, contextFor(world, state, p), { ...rules.compliance, complyAt: rules.verbs.initiativeAt });
      if (answer.willingness < rules.verbs.initiativeAt) continue;
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
          reportAdvice: { adviceRecommends: initiative.recommends, adviceReasons: answer.statedReasons.map((r) => ({ reasonKind: r.kind, reasonWeight: 1000 })), adviceConfidence: ctx.world.map.world.rules.reportConfidence.initiativeAdvice },
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
