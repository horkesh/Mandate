import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { playDays, replay } from '../src/log/session.ts';
import type { TransitMessage } from '../src/messages/transit.ts';
import type { PlanCandidate } from '../src/planner/types.ts';
import { PLAN_STATUSES, type PlanRecord } from '../src/plans/plans.ts';
import { responseKey } from '../src/proxy/responses.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import type { State } from '../src/root-state.ts';
import { arriveOrder, goalOf } from '../src/tick/orders.ts';
import { operationsPhase } from '../src/tick/operations.ts';
import { createState } from '../src/tick/setup.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { F, P, POST, R, indexedFixture } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';
import { goalTerms, order, scriptedSeats } from './support/test-seats.ts';

const post = POST('a_reserve');
const world = indexedFixture({ posts: { a_reserve: { strength: 2000 } } });
const goal = goalOf(goalTerms('take', 'b_mid'));
const candidate: PlanCandidate = {
  id: 's51.plan', candMethod: 'direct', candVariant: 'fixture', candRequests: [], candConditions: [], candTerms: [],
  candScore: 0, candPerceived: 0, candRatio: 1000,
  candAxes: [{ axisName: 'main', axisPost: post, axisMode: 'land', axisBlocks: [toId('forceBlock', 'a_reserve_1')], axisStrength: 2000,
    axisRoute: { routeFrom: R('a_mid'), routeTo: R('b_mid'), routeLegs: [], routeCost: 0, routeDays: 3000 },
    axisPhases: [{ phaseKind: 'concentrate', phaseStart: 0, phaseDays: 19000, phaseRegion: R('a_mid') }],
    axisArrival: 0, axisOutOfSupply: 0, axisStoresDays: 10, axisStoresAssumed: false }],
};
function planned(status: PlanRecord['planStatus'] = 'approved'): State {
  const record: PlanRecord = {
    planGoal: goal, planIssuer: P('a_lead'), planViaChain: true, planSetDay: 119, planIssuedDay: 119,
    planOrder: toId('message', 's51.original'), planResponse: 's51.original|a_bold', planStatus: status,
    planDraft: { draftCommander: P('a_bold'), draftPost: post, draftFaction: F('a'), draftDay: 119,
      draftCandidates: [candidate], draftRejected: [], draftSearches: 0, draftGenerated: 1, draftDeduplicated: 0 },
    planChosen: candidate.id, planApproved: status === 'approved' || status === 'ready' ? candidate : null,
    planSubmitted: toId('message', 's51.submission'), planCounters: [], planPending: null,
  };
  return { ...createState(world, { seed: 7 }), planRecords: { [post]: record } };
}
function letter(bypass: boolean): TransitMessage {
  const id = toId('message', `s51.repeat.${bypass}`);
  return {
    id, msgOrigin: id, msgFrom: P(bypass ? 'a_lead' : 'a_sec'), msgTo: P('a_bold'), msgToPost: post,
    msgRole: 'addressee', msgRoute: 'wire', msgSentDay: 135, msgArriveDay: 136,
    msgVia: bypass ? [] : [POST('a_office')], msgPending: [],
    msgOrder: { orderKind: 'goal', orderGoal: structuredClone(goal), orderEdit: null, orderCall: null,
      orderIssuer: P('a_lead'), orderTarget: post, orderBypass: bypass, orderIssuedDay: 133 },
    msgVerb: null, msgReport: null, msgTruth: null,
  };
}
function context(state: State, day: number) { return ctxFor(world, state, day, TICK_MECHANICS); }

for (const bypass of [false, true]) {
  it.each(PLAN_STATUSES)('reaffirmation preserves the entire %s plan (bypass=' + bypass + ')', status => {
    const state = planned(status);
    const msg = letter(bypass);
    const ctx = context(state, 136);
    const next = arriveOrder(ctx, state, msg);
    expect(next.planRecords[post]).toBe(state.planRecords[post]);
    expect(next.orderResponses[responseKey(msg.msgOrigin, msg.msgTo)]).toMatchObject({ respDay: 136, respRole: 'addressee', respKind: 'goal' });
    expect(ctx.outbox.some(m => m.msgReport?.reportAnswers === msg.msgOrigin && m.msgReport.reportClaims.some(c => c.claimKind === 'order-obeyed' && c.claimValue === 1))).toBe(true);
    expect(ctx.telemetry!.mechanics['plans.goal_set']!.fires).toBe(0);
  });
  it('keeps the assembling operation and its original clock (bypass=' + bypass + ')', () => {
    const state = planned();
    const opened = operationsPhase(context(state, 120), state);
    const original = Object.values(opened.operationRecords)[0]!;
    expect(original.opAxes[0]!.oaxUntil).toBe(139);
    const received = arriveOrder(context(opened, 136), opened, letter(bypass));
    const next = operationsPhase(context(received, 136), received);
    expect(Object.values(next.operationRecords)).toEqual([original]);
  });
  it('still replaces a changed goal and supersedes its operation (bypass=' + bypass + ')', () => {
    const state = planned();
    const opened = operationsPhase(context(state, 120), state);
    const msg = letter(bypass);
    const changed = { ...msg, msgOrder: { ...msg.msgOrder!, orderGoal: { ...goal, goalRisk: 600 } } };
    const received = arriveOrder(context(opened, 136), opened, changed);
    expect(received.planRecords[post]).toMatchObject({ planStatus: 'drafting', planApproved: null, planOrder: msg.msgOrigin });
    const next = operationsPhase(context(received, 136), received);
    expect(Object.values(next.operationRecords)[0]).toMatchObject({ opEndDay: 136, opOutcome: 'superseded' });
  });
}

it('does not treat the same goal from a different issuer as a reaffirmation', () => {
  const state = planned();
  const msg = letter(false);
  const next = arriveOrder(context(state, 136), state, { ...msg, msgOrder: { ...msg.msgOrder!, orderIssuer: P('a_sec') } });
  expect(next.planRecords[post]).toMatchObject({ planOrder: msg.msgOrigin, planIssuer: P('a_sec'), planStatus: 'drafting' });
});

it('does not reopen a finished operation after reaffirmation', () => {
  const state = planned();
  const opened = operationsPhase(context(state, 120), state);
  const [id, op] = Object.entries(opened.operationRecords)[0]!;
  const finished = { ...opened, operationRecords: { [id]: { ...op, opEndDay: 130, opOutcome: 'objective_reached' as const } } };
  const received = arriveOrder(context(finished, 136), finished, letter(true));
  expect(operationsPhase(context(received, 136), received).operationRecords).toEqual({
    ...finished.operationRecords,
    [id]: { ...finished.operationRecords[id]!, opTasks: op.opTasks!.map(t => ({ ...t,
      otaskEndReason: 'operation_ended', otaskEndedDay: 136 })) },
  });
});

it.each([false, true])('reaffirms through actual routing, save/load and logged replay (bypass=%s)', bypass => {
  const start = createState(world, { seed: 7 });
  // A hold remains held; the repeated letter has a new identity without replacing the goal's original identity.
  const command = order('a_reserve', 'hold', null, 'special-messenger', bypass);
  const seats = scriptedSeats({ a: { 1: [command], 8: [command] } });
  const first = playDays(world, start, seats, 7, { freeze: true });
  const loaded = decodeSave(encodeSave({ worldHash: canonicalHash(world.map.world), state: first.state, log: first.log })).state as unknown as State;
  const original = first.state.planRecords[post]!;
  expect(original).toBeDefined();
  const tail = playDays(world, loaded, seats, 8, { freeze: true });
  expect(tail.state.planRecords[post]).toEqual(original);
  expect(Object.values(tail.state.orderResponses).filter(r => r.respPerson === P('a_bold') && r.respKind === 'goal')).toHaveLength(2);
  const full = playDays(world, start, seats, 15, { freeze: true });
  expect(tail.hashes).toEqual(full.hashes.slice(7));
  expect(replay(world, start, [...first.log, ...tail.log], 15, { freeze: true }).hashes).toEqual(full.hashes);
});
