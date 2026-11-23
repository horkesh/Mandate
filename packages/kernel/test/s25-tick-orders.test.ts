import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import type { PlanCandidate } from '../src/planner/types.ts';
import { setGoal, type PlanRecord } from '../src/plans/plans.ts';
import { goalOf, issueOrder } from '../src/tick/orders.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { tick, TICK_MECHANICS } from '../src/tick/tick.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { createState } from '../src/tick/setup.ts';
import { ctxFor } from './support/tick-context.ts';
import { fresh, report } from './support/s25-fixture.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { enclosePlan } from '../src/planner/paper.ts';
import { plannerInputFor } from '../src/planner/input.ts';
import { passageOf } from '../src/tick/passage.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { viewFor } from '../src/view/view.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { F, P, POST, R, indexedFixture } from './support/seats-fixture.ts';
import { goalTerms, order } from './support/test-seats.ts';

function planned(status: PlanRecord['planStatus']) {
  const { world, state, seat } = fresh();
  const post = POST('a_army');
  const set = setGoal(state, post, { id: toId('message', 's25.goal'), issuer: P('a_lead'),
    goal: goalOf(goalTerms('take', 'b_front')), viaChain: true, issuedDay: 1, response: 's25.response' }, 1);
  const candidate: PlanCandidate = {
    id: 's25.candidate', candMethod: 'direct', candVariant: 'fixture', candRequests: [], candConditions: [], candTerms: [],
    candScore: 0, candPerceived: 0, candRatio: 1000,
    candAxes: [{ axisName: 'main', axisPost: post, axisMode: 'land', axisBlocks: [], axisStrength: 0,
      axisPhases: [], axisArrival: 0, axisOutOfSupply: 0, axisStoresDays: 0, axisStoresAssumed: false,
      axisRoute: { routeFrom: R('a_front'), routeTo: R('b_front'), routeLegs: [], routeCost: 0, routeDays: 0 } }],
  };
  const record: PlanRecord = { ...set.planRecords[post]!, planStatus: status, planChosen: candidate.id,
    planDraft: { draftCommander: P('a_gen'), draftPost: post, draftFaction: F('a'), draftDay: 1,
      draftCandidates: [candidate], draftRejected: [], draftSearches: 0, draftGenerated: 1, draftDeduplicated: 0 } };
  let ready = { ...set, stateDay: 1, planRecords: { ...set.planRecords, [post]: record } };
  if (status !== 'drafting') {
    const network = passageOf(world.map, ready);
    const derived = deriveMap(world.map, { control: ready.regionControl, network, month: 6 });
    const input = plannerInputFor(world, ready, derived, network, 6, viewFor(world, ready, seatIdFor(P('a_gen'))), post, record.planGoal, 1);
    // Post-draft edits and reviews need a commander paper in this fixture; a private status supplies no knowledge.
    ready = deliverReport(ready, seat, report('s25.submission', { reportAuthorPost: post, reportSubjectKind: 'post', reportSubjectId: post,
      reportAnswers: record.planOrder, reportPlan: enclosePlan(input, record.planDraft!, candidate) }), NO_TRUTH);
  }
  return { world, state: ready, seat, post };
}

it.each(['ready', 'approved', 'review', 'drafting'] as const)('S25 tick-orders-04: an arrow edit is allowed only after drafting (%s)', status => {
  const { world, state, seat, post } = planned(status);
  const ctx = ctxFor(world, state, 2, TICK_MECHANICS);
  const allowed = status !== 'drafting';
  expect(issueOrder(ctx, state, seat, { cmd: 'review', action: 'edit', to: post, route: 'courier', bypass: true,
    edit: { kind: 'timing', axis: 'main', region: null, via: [], concentration: 1 } })).toBe(allowed ? null : 'no_plan');
  expect(ctx.outbox).toHaveLength(allowed ? 1 : 0);
});

it.each(['waypoints', 'wait'] as const)('S25 tick-orders-05/07: accepts the exact %s note limit and rejects one more', kind => {
  const { world, state, seat, post } = planned('review');
  const limits = world.map.world.rules.plans.notes;
  for (const extra of [0, 1]) {
    const note = kind === 'waypoints'
      ? { markKind: 'via' as const, markAxis: 'main', markRegion: null, markDays: null, markVia: Array.from({ length: limits.maxWaypoints + extra }, () => R('a_mid')) }
      : { markKind: 'wait' as const, markAxis: 'main', markRegion: null, markDays: limits.maxWaitDays + extra, markVia: [] };
    const ctx = ctxFor(world, state, 2, TICK_MECHANICS);
    expect(issueOrder(ctx, state, seat, { cmd: 'review', to: post, action: 'send_back', edit: null, notes: [note], route: 'courier', bypass: true })).toBe(extra === 0 ? null : 'bad_review');
  }
});

it('S25 tick-orders-09: forwarding without delay does not fire the relay-held mechanic', () => {
  const world = indexedFixture({ persons: { a_sec: { values: ['duty'], regard: 'high', candour: 'low' } } });
  const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
  const { seat } = fresh();
  let state = createState(world, { seed: 17 });
  for (let day = 1; day <= 3; day++) {
    state = tick(world, state, day === 1 ? [{ day, seat, command: order('a_army', 'hold', null, 'courier') }] : [], { telemetry }).state;
  }
  expect(telemetry.mechanics['orders.relayed']!.fires).toBeGreaterThan(0);
  expect(telemetry.mechanics['orders.relay_held']).toEqual({ fires: 0, magnitude: 0 });
});
