import { describe, expect, it } from 'vitest';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import { dispatchLatency as routeLatency } from '../src/messages/ship.ts';
import { sendMessages } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld, latencyMapFor } from '../src/seats/world.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { dispatchOrder } from '../src/tick/orders.ts';
import { createState } from '../src/tick/setup.ts';
import { deepFreeze } from '../src/tick/freeze.ts';
import { indexWorld } from '../src/world/index.ts';
import { edge } from './support/map-fixture.ts';
import { fixtureMap, fixtureStart, P, POST, R, F } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';
import { SEATS_MECHANICS } from '../src/tick/tick.ts';
import { morningGround } from '../src/seats/requests.ts';
import { shipLatencyMap } from '../src/messages/ship.ts';
import { latencyProblems } from '../src/messages/latency.ts';
import { sendReport } from '../src/tick/context.ts';
import { replay } from '../src/log/session.ts';

const lead = seatIdFor(P('a_lead'));
function worldFor(boldness: 'average' | 'low' = 'average') {
  const map = fixtureMap({ persons: { a_sec: { boldness, candour: 'low', values: [], regard: boldness === 'low' ? 'average' : 'above' } } });
  const dispatch = { to: POST('a_army'), carriers: [{ post: POST('a_office'), route: 'ship' as const }],
    terms: { boldness: 500, honours: [], offends: [] }, source: 'TB-DESIGN: entrusted dispatch' };
  return indexSeatsWorld(indexWorld({ ...map.world,
    edges: [...map.world.edges, edge('a_cap', 'a_front', { type: 'sea', days: 4, daysBA: 7 })],
    rules: { ...map.world.rules, latency: { ...map.world.rules.latency, dispatches: [dispatch] } },
  }), fixtureStart());
}
function sent(world: ReturnType<typeof worldFor>) {
  const state = createState(world, { seed: 2 });
  const ctx = ctxFor(world, state, 1, SEATS_MECHANICS);
  const id = dispatchOrder(ctx, state, lead, P('a_lead'), POST('a_army'), 'courier', true,
    { orderKind: 'goal', orderGoal: { goalPosture: 'hold', goalObjective: null, goalRisk: 500, goalDeadlineDays: 30,
      goalRail: false, goalRiver: false, goalSea: false, goalNeutral: false, goalCommitted: [], goalAwaitWord: false, goalApproveAsDrafted: false },
      orderEdit: null, orderCall: null });
  return { state: sendMessages(state, ctx.outbox.splice(0)), id };
}
describe('S53 entrusted dispatch carriers', () => {
  it('hands a sealed order to a staff holder, then travels by ship before the addressee answers', () => {
    const world = worldFor();
    const start = sent(world);
    expect(start.state.messagesInTransit[0]?.msgRole).toBe('carrier');
    const ctx = ctxFor(world, start.state, 1, SEATS_MECHANICS);
    const underway = deliverDue(ctx, deepFreeze(start.state));
    const ship = underway.messagesInTransit.find(m => m.msgOrigin === start.id)!;
    expect(ship.msgRoute).toBe('ship');
    expect(ship.msgArriveDay).toBe(5);
    expect(ship.msgVia).toEqual([POST('a_office')]);
    expect(Object.values(underway.orderResponses).map(r => r.respRole)).toEqual(['carrier']);
    expect(underway.planRecords[POST('a_army')]).toBeUndefined();
    expect(ctx.telemetry!.mechanics['orders.relay_held']!.fires).toBe(0);
    const arrived = deliverDue(ctxFor(world, underway, 5, SEATS_MECHANICS), underway);
    expect(Object.values(arrived.orderResponses).some(r => r.respOrder === start.id && r.respRole === 'addressee')).toBe(true);
  });
  it('adds a carrier compliance hold apart from the four journey days and preserves it across save/resume', () => {
    const world = worldFor('low');
    const { state, id } = sent(world);
    const ctx = ctxFor(world, state, 1, SEATS_MECHANICS);
    const underway = deliverDue(ctx, state);
    const response = Object.values(underway.orderResponses).find(r => r.respRole === 'carrier')!;
    expect(response.respActual).toBe('slow_walk');
    const hold = world.rules.people.relay.slowWalkHoldDays;
    expect(underway.messagesInTransit.find(m => m.msgOrigin === id)!.msgArriveDay).toBe(5 + hold);
    expect(ctx.telemetry!.mechanics['orders.relay_held']).toEqual({ fires: 1, magnitude: hold });
    const restored = decodeSave(encodeSave({ worldHash: canonicalHash(world.map.world), state: underway })).state as unknown as State;
    const resume = (s: State) => deliverDue(ctxFor(world, s, 5 + hold, SEATS_MECHANICS), deepFreeze(s));
    expect(canonicalHash(resume(restored))).toBe(canonicalHash(resume(underway)));
    expect(canonicalHash(deliverDue(ctxFor(world, state, 1, SEATS_MECHANICS), state))).toBe(canonicalHash(underway));
  });
  it('does not silently skip a carrier who lost his post', () => {
    const world = worldFor();
    const { state, id } = sent(world);
    const changed = { ...state, postStates: { ...state.postStates, [POST('a_office')]: { ...state.postStates[POST('a_office')]!, postHolder: null } } };
    const next = deliverDue(ctxFor(world, changed, 1, SEATS_MECHANICS), changed);
    expect(next.messagesInTransit.some(m => m.msgOrigin === id)).toBe(false);
    expect(Object.values(next.orderResponses).some(r => r.respRole === 'addressee')).toBe(false);
    expect(knowledgeOf(next, lead).knownReports.some(r => r.knownBody.reportClaims.some(c => c.claimKind === 'order-returned'))).toBe(true);
  });
  it('uses directional water days and refuses a ship route over roads', () => {
    const world = worldFor();
    const state = createState(world, { seed: 2 });
    const map = ctxFor(world, state, 1).latency;
    expect(routeLatency(map, world.rules.latency, 'ship', R('a_cap'), R('a_front'), F('a'), null)).toMatchObject({ ok: true, latency: { days: 4 } });
    expect(routeLatency(map, world.rules.latency, 'ship', R('a_front'), R('a_cap'), F('a'), null)).toMatchObject({ ok: true, latency: { days: 7 } });
    expect(routeLatency(map, world.rules.latency, 'ship', R('a_cap'), R('a_mid'), F('a'), null)).toEqual({ ok: false, reason: 'route_unavailable' });
  });
  it('a candid carrier can decline delivery without changing the order or reaching the addressee', () => {
    const original = worldFor('low');
    const map = fixtureMap({ persons: { a_sec: { boldness: 'low', candour: 'high', regard: 'low', values: [] } } });
    const world = indexSeatsWorld(indexWorld({ ...map.world, edges: original.map.world.edges,
      rules: { ...map.world.rules, latency: original.rules.latency } }), fixtureStart());
    const { state, id } = sent(world);
    const ctx = ctxFor(world, state, 1, SEATS_MECHANICS);
    const next = deliverDue(ctx, state);
    expect(Object.values(next.orderResponses).find(r => r.respRole === 'carrier')!.respActual).toBe('object');
    expect(next.messagesInTransit.some(m => m.msgOrigin === id)).toBe(false);
    expect(ctx.telemetry!.mechanics['orders.relay_held']!.fires).toBe(0);
    expect(knowledgeOf(next, lead).knownReports.some(r => r.knownBody.reportClaims.some(c => c.claimToken === 'carrier_declined'))).toBe(true);
  });
  it('carries a report as sealed paper, without delivering it to the carrier or firing incoming-filter counters', () => {
    const world = worldFor();
    const start = createState(world, { seed: 2 });
    const ctx = ctxFor(world, start, 1, SEATS_MECHANICS);
    const id = sendReport(ctx, start, { to: P('a_gen'), route: 'courier', tag: 'test.carried',
      body: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: P('a_lead'), reportAuthorPost: null,
        reportSubjectKind: 'post', reportSubjectId: 'a_army', reportClaims: [], reportDay: 1, reportHour: null, reportAdvice: null, reportAnswers: null },
      truth: { truthTerms: [], truthTrimmed: [] } });
    const underway = deliverDue(ctx, sendMessages(start, ctx.outbox.splice(0)));
    expect(knowledgeOf(underway, seatIdFor(P('a_sec'))).knownReports.some(r => r.id === id)).toBe(false);
    expect(knowledgeOf(underway, seatIdFor(P('a_gen'))).knownReports.some(r => r.id === id)).toBe(false);
    const arrived = deliverDue(ctxFor(world, underway, 5, SEATS_MECHANICS), underway);
    expect(knowledgeOf(arrived, seatIdFor(P('a_gen'))).knownReports.find(r => r.id === id)!.knownRoute).toBe('ship');
    expect(ctx.telemetry!.mechanics['reports.filtered']!.fires).toBe(0);
    expect(ctx.telemetry!.mechanics['reports.trimmed']!.fires).toBe(0);
    const restored = decodeSave(encodeSave({ worldHash: canonicalHash(world.map.world), state: underway })).state as unknown as State;
    expect(canonicalHash(replay(world, restored, [], 8).state)).toBe(canonicalHash(replay(world, underway, [], 8).state));
  });
  it('returns an order when the entrusted ship has no water route, rather than substituting a road', () => {
    const original = worldFor();
    const world = indexSeatsWorld(fixtureMap(), { ...fixtureStart() });
    const configured = { ...world, rules: { ...world.rules, latency: original.rules.latency } };
    const { state, id } = sent(configured);
    const ctx = ctxFor(configured, state, 1, SEATS_MECHANICS);
    const next = deliverDue(ctx, state);
    expect(next.messagesInTransit.some(m => m.msgOrigin === id)).toBe(false);
    expect(knowledgeOf(next, lead).knownReports.some(r => r.knownBody.reportClaims.some(c => c.claimToken === 'route_unavailable'))).toBe(true);
  });
  it('closes a damaged water edge to entrusted dispatches', () => {
    const world = worldFor();
    const state = createState(world, { seed: 2 });
    const ground = morningGround(world, state, 1);
    const water = world.map.world.edges.find(e => e.type === 'sea')!;
    const latency = shipLatencyMap(ground.latency, { ...ground.march, network: { ...ground.march.network, edgeCondition: { [water.id]: 0 } } });
    expect(routeLatency(latency, world.rules.latency, 'ship', R('a_cap'), R('a_front'), F('a'), null)).toEqual({ ok: false, reason: 'route_unavailable' });
  });
  it('rejects circular or unsourced dispatch rules without filling vacant posts', () => {
    const world = worldFor();
    const row = world.rules.latency.dispatches![0]!;
    expect(latencyProblems({ ...world.rules.latency, dispatches: [{ ...row, source: '', carriers: [{ post: row.to, route: 'ship' }] }] }).length).toBeGreaterThanOrEqual(2);
    expect(() => indexSeatsWorld(indexWorld({ ...world.map.world, rules: { ...world.map.world.rules,
      latency: { ...world.rules.latency, dispatches: [{ ...row, carriers: [{ post: POST('b_office'), route: 'ship' }] }] } } }), fixtureStart())).toThrow('same-side');
  });
});
