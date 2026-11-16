import { describe, expect, it } from 'vitest';
import type { MessageId, PostId } from '../src/ids.ts';
import type { ReportClaim } from '../src/knowledge/report.ts';
import type { TransitMessage } from '../src/messages/transit.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import type { LogEntry } from '../src/log/log.ts';
import type { Command, EditTerms, GoalTerms, OrderCommand, ReviewCommand } from '../src/log/commands.ts';
import { playDays } from '../src/log/session.ts';
import { setGoal } from '../src/plans/plans.ts';
import type { State } from '../src/root-state.ts';
import { pendingRequests, reviewsFor } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import type { SeatsWorld } from '../src/seats/world.ts';
import { createTelemetry, type Telemetry } from '../src/telemetry.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, TICK_MECHANICS, type TickResult } from '../src/tick/tick.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { goalOf } from '../src/tick/orders.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexedFixture, P, POST, R } from './support/seats-fixture.ts';
import { goalTerms, scriptedSeats } from './support/test-seats.ts';

/**
 * The plan cycle (lane 1.2; FOUNDATION sections 5 and 9): a goal arrives and is drafted on its day, within the daily
 * cap; the commander's seat picks a candidate the next morning; the pick goes ahead, or goes to the issuer for review,
 * who approves it, sends it back or edits its arrows; an edit is answered through compliance; an operation held for
 * the principal's word goes on his "go". Until lane 1.4, an approved plan marches through the stand-in path.
 */
const lead = seatIdFor(P('a_lead'));
const RESERVE: PostId = POST('a_reserve');
const strong = () => indexedFixture({ posts: { a_reserve: { strength: 2000 } } });
const take = (over: Partial<GoalTerms> = {}): OrderCommand => ({ cmd: 'order', to: RESERVE, goal: goalTerms('take', 'b_mid', over), route: 'special-messenger', bypass: true });
const review = (action: 'approve' | 'send_back' | 'edit', edit: EditTerms | null = null): ReviewCommand => ({ cmd: 'review', to: RESERVE, action, edit, route: 'special-messenger', bypass: true });

/** Play day by day; `script(day, state)` gives the principal's commands for each morning. */
function play(world: SeatsWorld, days: number, script: (day: number, state: State) => readonly Command[], start?: State): { state: State; results: TickResult[]; telemetry: Telemetry } {
  const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
  let state = start ?? createState(world, { seed: 7 });
  const results: TickResult[] = [];
  for (let d = state.stateDay + 1; results.length < days; d++) {
    const entries: LogEntry[] = script(d, state).map((command) => ({ day: d, seat: lead, command }));
    const r = tick(world, state, entries, { freeze: true, telemetry });
    expect(r.rejections, `day ${d}`).toEqual([]);
    results.push(r);
    state = r.state;
  }
  return { state, results, telemetry };
}
const fired = (t: Telemetry, m: string) => t.mechanics[m]!.fires;
/** The first day a condition on the day's State holds. */
const firstDay = (results: readonly TickResult[], f: (s: State) => boolean) => results.find((r) => f(r.state))?.day ?? null;

describe('a goal is drafted on request, and the commander picks (lane 1.2)', () => {
  it('drafts on the day the goal arrives, saves the draft set, and his pick goes ahead as drafted the next morning', () => {
    const { state, results, telemetry } = play(strong(), 8, (d) => (d === 1 ? [take()] : []));
    const record = state.planRecords[RESERVE]!;
    // The draft set is saved on the request day (a later call would see a changed map), with the goal's terms.
    expect(record.planDraft!.draftDay).toBe(record.planSetDay);
    expect(record.planDraft!.draftCandidates.length).toBeGreaterThanOrEqual(2);
    expect(record.planGoal).toMatchObject({ goalObjective: R('b_mid'), goalPosture: 'take', goalApproveAsDrafted: true });
    // His pick (unanswered here, so the best, by default) goes ahead the morning after: an operation opens to execute it (lane 1.4).
    const approved = firstDay(results, (s) => s.planRecords[RESERVE]?.planStatus === 'approved')!;
    expect(approved).toBe(record.planSetDay + 1);
    expect(record.planChosen).toBe(record.planDraft!.draftCandidates[0]!.id);
    const op = Object.values(results[approved - 1]!.state.operationRecords).find((o) => o.opPost === RESERVE)!;
    expect(op).toMatchObject({ opObjective: R('b_mid'), opStartDay: approved, opPlan: record.planChosen, opOrder: record.planOrder });
    expect([fired(telemetry, 'plans.goal_set'), fired(telemetry, 'plans.drafted'), fired(telemetry, 'plans.chosen'), fired(telemetry, 'plans.went_ahead')]).toEqual([1, 1, 1, 1]);
    expect(fired(telemetry, 'seats.defaulted')).toBe(1);
  });

  it('asks to review: his pick goes to the issuer by dispatch, who approves it; it waits for his word, then goes', () => {
    const world = strong();
    const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
    const days: TickResult[] = [];
    const out = playDays(world, createState(world, { seed: 7 }), scriptedSeats({ a: { 1: [take({ approveAsDrafted: false, awaitWord: true })] } }), 20, { freeze: true, telemetry, onDay: (r) => days.push(r) });
    expect(days.flatMap((r) => r.rejections)).toEqual([]);
    const statuses = [...new Set(days.map((r) => r.state.planRecords[RESERVE]?.planStatus ?? 'none'))];
    // It arrives the day it is sent and is drafted that day, so neither `none` nor `drafting` ends a day: chosen, reviewed, approved to wait for the word, released.
    expect(statuses).toEqual(['choosing', 'review', 'ready', 'approved']);
    // His dispatch names the plan he chose for the order it answers.
    const submitted = out.state.planRecords[RESERVE]!.planSubmitted!;
    expect(days.flatMap((r) => knowledgeOf(r.state, lead).knownReports).find((k) => k.id === submitted)!.knownBody.reportClaims[0]).toMatchObject({ claimKind: 'plan-submitted', claimRegion: R('b_mid') });
    expect([fired(telemetry, 'plans.submitted'), fired(telemetry, 'plans.approved'), fired(telemetry, 'plans.released'), fired(telemetry, 'plans.went_ahead')]).toEqual([1, 1, 1, 0]);
    expect(out.state.planRecords[RESERVE]!.planStatus).toBe('approved');
  });

  it('keeps a plan off his menu while an office’s objection to his answer is on its way back to him (0040: he believes it went on)', () => {
    // A plan before him for review, as the day ends.
    const { results } = play(strong(), 12, (d) => (d === 1 ? [take({ approveAsDrafted: false })] : []));
    const listed = results.find((r) => reviewsFor(r.state, P('a_lead')).length > 0)?.state;
    expect(listed, 'a review is before him').toBeDefined();
    expect(reviewsFor(listed!, P('a_lead')).map((r) => r.post)).toEqual([RESERVE]);
    // An office withheld his answer: its memorandum objecting, about this post, is on its way to him.
    const memo = (over: { to?: string; pending?: boolean; subject?: string; claim?: string; withheld?: string } = {}): TransitMessage => ({
      id: 'm.test.memo' as MessageId,
      msgOrigin: 'm.test.memo' as MessageId,
      msgFrom: P('a_sec'),
      msgTo: P(over.to ?? 'a_lead'),
      msgToPost: null,
      msgRole: over.to === undefined ? 'addressee' : 'filter',
      msgRoute: 'courier',
      msgSentDay: listed!.stateDay,
      msgArriveDay: listed!.stateDay + 2,
      msgVia: [],
      msgPending: over.pending === true ? [{ hopPerson: P('a_lead'), hopPost: null, hopRole: 'addressee' }] : [],
      msgOrder: null,
      msgVerb: null,
      msgReport: {
        reportType: 'advice',
        reportSubtype: 'memorandum',
        reportAuthor: P('a_sec'),
        reportAuthorPost: null,
        reportSubjectKind: 'post',
        reportSubjectId: over.subject ?? RESERVE,
        reportClaims: [{ claimKind: (over.claim ?? 'order-objected') as ReportClaim['claimKind'], claimRegion: R('b_mid'), claimValue: 1, claimToken: over.withheld ?? 'approve', claimConfidence: 1000 }],
        reportDay: listed!.stateDay,
        reportHour: null,
        reportAdvice: null,
        reportAnswers: 'm.test.approve' as MessageId,
      },
      msgTruth: null,
    });
    const withMemo = (m: TransitMessage): State => ({ ...listed!, messagesInTransit: [...listed!.messagesInTransit, m] });
    expect(reviewsFor(withMemo(memo()), P('a_lead'))).toEqual([]);
    // Still on its way through a filter, with him further down the line: still in play.
    expect(reviewsFor(withMemo(memo({ to: 'a_sec', pending: true })), P('a_lead'))).toEqual([]);
    // Positive controls: a memorandum about another post, or one that objects to nothing, leaves the plan before him.
    expect(reviewsFor(withMemo(memo({ subject: 'a_army' })), P('a_lead')).map((r) => r.post)).toEqual([RESERVE]);
    expect(reviewsFor(withMemo(memo({ claim: 'plan-answer' })), P('a_lead')).map((r) => r.post)).toEqual([RESERVE]);
    // An objection to an earlier goal of his, still travelling, never hides the answer he owes (review N2).
    expect(reviewsFor(withMemo(memo({ withheld: 'goal' })), P('a_lead')).map((r) => r.post)).toEqual([RESERVE]);
    for (const kind of ['edit', 'send_back']) expect(reviewsFor(withMemo(memo({ withheld: kind })), P('a_lead')), kind).toEqual([]);
    // Once it has reached him (out of transit), the plan is before him again, to answer around the office.
    expect(reviewsFor(listed!, P('a_lead')).map((r) => r.post)).toEqual([RESERVE]);
  });

  it('sends the plan back, and he drafts it again on the map as it is when he gets it', () => {
    let sentBack = false;
    const { state, telemetry } = play(strong(), 20, (d, s) => {
      const menu = pendingRequests(strong(), s).find((r) => r.requestSeat === lead)!.menu;
      const reviews = menu.menuKind === 'principal' ? menu.reviews : [];
      if (d === 1) return [take({ approveAsDrafted: false })];
      if (reviews.length === 0) return [];
      if (!sentBack) {
        sentBack = true;
        return [review('send_back')];
      }
      return [review('approve')];
    });
    expect([fired(telemetry, 'plans.sent_back'), fired(telemetry, 'plans.drafted'), fired(telemetry, 'plans.submitted'), fired(telemetry, 'plans.approved')]).toEqual([1, 2, 2, 1]);
    expect(state.planRecords[RESERVE]!.planStatus).toBe('approved');
    expect(state.planRecords[RESERVE]!.planDraft!.draftDay).toBeGreaterThan(state.planRecords[RESERVE]!.planSetDay);
  });

  it('defers drafts past the day’s cap, oldest goal first (0062: the cap is a pack rule)', () => {
    const base = strong();
    const world: SeatsWorld = { ...base, map: indexWorld({ ...base.map.world, rules: { ...base.map.world.rules, planner: { ...base.map.world.rules.planner, dailyDraftCap: 1 } } }) };
    let state = createState(world, { seed: 7 });
    state = setGoal(state, POST('a_army'), { id: 'm.0.army' as never, issuer: P('a_lead'), goal: goalOf(goalTerms('take', 'b_front')), viaChain: true, issuedDay: 0, response: 'm.0.army|a_gen' }, 0);
    state = setGoal(state, RESERVE, { id: 'm.0.reserve' as never, issuer: P('a_lead'), goal: goalOf(goalTerms('take', 'b_mid')), viaChain: true, issuedDay: 0, response: 'm.0.reserve|a_bold' }, 0);
    const { results, telemetry } = play(world, 2, () => [], state);
    // Day 1: one draft (by post id, both goals being as old), the other waits; day 2: the other.
    expect(results[0]!.state.planRecords[POST('a_army')]!.planStatus).toBe('choosing');
    expect(results[0]!.state.planRecords[RESERVE]!.planStatus).toBe('drafting');
    expect(results[1]!.state.planRecords[RESERVE]!.planDraft!.draftDay).toBe(2);
    expect([fired(telemetry, 'plans.drafted'), fired(telemetry, 'plans.draft_deferred')]).toEqual([2, 1]);
  });

  it('counts the cap per side: one side’s requests never defer the other’s (the lead’s ruling on review S1)', () => {
    const base = strong();
    const world: SeatsWorld = { ...base, map: indexWorld({ ...base.map.world, rules: { ...base.map.world.rules, planner: { ...base.map.world.rules.planner, dailyDraftCap: 1 } } }) };
    let state = createState(world, { seed: 7 });
    // Side a asks for two plans; side b for one, as old but last by post id. Shared, b's would wait behind a's two.
    state = setGoal(state, POST('a_army'), { id: 'm.0.army' as never, issuer: P('a_lead'), goal: goalOf(goalTerms('take', 'b_front')), viaChain: true, issuedDay: 0, response: 'm.0.army|a_gen' }, 0);
    state = setGoal(state, RESERVE, { id: 'm.0.reserve' as never, issuer: P('a_lead'), goal: goalOf(goalTerms('take', 'b_mid')), viaChain: true, issuedDay: 0, response: 'm.0.reserve|a_bold' }, 0);
    state = setGoal(state, POST('b_army'), { id: 'm.0.b' as never, issuer: P('b_lead'), goal: goalOf(goalTerms('take', 'a_front')), viaChain: true, issuedDay: 0, response: 'm.0.b|b_gen' }, 0);
    const { results, telemetry } = play(world, 1, () => [], state);
    // Day 1: side b drafts its one plan however many side a asked for; side a drafts one and defers the other.
    expect(results[0]!.state.planRecords[POST('b_army')]!.planStatus).not.toBe('drafting');
    expect(results[0]!.state.planRecords[POST('a_army')]!.planStatus).not.toBe('drafting');
    expect(results[0]!.state.planRecords[RESERVE]!.planStatus).toBe('drafting');
    expect([fired(telemetry, 'plans.drafted'), fired(telemetry, 'plans.draft_deferred')]).toEqual([2, 1]);
  });
});

describe('arrow edits as counter-orders (0026), answered through compliance', () => {
  /** The reserve's plan, approved and marching by the morning of the returned State's next day. */
  const approved = (world: SeatsWorld) => play(world, 4, (d) => (d === 1 ? [take()] : []));

  it('answers an edit through compliance: a counter-order with its distance, his declared answer, and the truth behind it', () => {
    const world = strong();
    const start = approved(world).state;
    const timing: EditTerms = { kind: 'timing', axis: 'main', region: null, via: [], concentration: 0 };
    const { state, results, telemetry } = play(world, 8, (d) => (d === start.stateDay + 1 ? [review('edit', timing)] : []), start);
    const counter = state.planRecords[RESERVE]!.planCounters[0]!;
    expect(counter).toMatchObject({ counterSpec: { editKind: 'timing', editAxis: 'main', editConcentration: 0 }, counterInvalid: null });
    expect(counter.counterDistance).toBeGreaterThanOrEqual(0);
    // His response is `proxy`'s; the plan keeps its key. His answer reaches the principal as a report on the order.
    expect(counter.counterResponse).toBe(`${counter.counterOrder}|a_bold`);
    expect(state.orderResponses[counter.counterResponse!]).toMatchObject({ respOrder: counter.counterOrder, respPerson: 'a_bold', respRole: 'addressee' });
    const answer = results.flatMap((r) => knowledgeOf(r.state, lead).knownReports).find((k) => k.knownBody.reportAnswers === counter.counterOrder && k.knownBody.reportClaims[0]?.claimKind === 'plan-answer')!;
    expect(answer.knownBody.reportClaims[0]!.claimKind).toBe('plan-answer');
    // What he declares is a rung; why (his willingness, the rung he takes) is truth, never shown to the principal.
    expect(['exceed', 'comply', 'comply_with_reservations', 'slow_walk', 'reinterpret', 'object', 'refuse']).toContain(answer.knownBody.reportClaims[0]!.claimToken);
    // (The filter post the wire passes adds its own hold to the truth after his.)
    expect(state.reportTruth[answer.id]!.truthTerms[0]!.termKind).toBe('edit_distance');
    expect([fired(telemetry, 'plans.edit_received'), fired(telemetry, 'plans.edit_answered')]).toEqual([1, 1]);
  });

  it('refuses an edit no route can make: a validation failure with its reason, not a compliance outcome', () => {
    const world = strong();
    const start = approved(world).state;
    const remove: EditTerms = { kind: 'remove_axis', axis: 'main', region: null, via: [], concentration: null };
    const { state, telemetry } = play(world, 6, (d) => (d === start.stateDay + 1 ? [review('edit', remove)] : []), start);
    expect(state.planRecords[RESERVE]!.planCounters[0]).toMatchObject({ counterInvalid: 'a plan needs one axis', counterDistance: 0 });
    expect([fired(telemetry, 'plans.edit_invalid'), fired(telemetry, 'plans.edit_answered')]).toEqual([1, 0]);
    // The plan he executes is unchanged.
    expect(state.planRecords[RESERVE]!.planApproved!.id).toBe(start.planRecords[RESERVE]!.planApproved!.id);
  });

  it('refuses a review or a "go" for a plan not waiting for one, an edit outside the grammar, and a goal committing another post’s block', () => {
    const world = strong();
    const start = approved(world).state;
    const day = start.stateDay + 1;
    const r = tick(world, start, [
      { day, seat: lead, command: review('approve') },
      { day, seat: lead, command: { cmd: 'go', to: RESERVE, route: 'wire', bypass: false } },
      { day, seat: lead, command: { cmd: 'review', to: POST('a_army'), action: 'approve', edit: null, route: 'wire', bypass: false } },
      { day, seat: lead, command: review('edit', { kind: 'add_axis', axis: 'main', region: R('b_front'), via: [], concentration: null }) },
      { day, seat: lead, command: { cmd: 'order', to: RESERVE, goal: goalTerms('take', 'b_mid', { committed: ['a_army_1' as never] }), route: 'wire', bypass: false } },
    ]);
    expect(r.rejections.map((x) => x.reason)).toEqual(['no_plan', 'no_plan', 'no_plan', 'bad_review', 'bad_goal']);
  });
});
