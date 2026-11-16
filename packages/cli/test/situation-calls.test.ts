import { ids, phase0, world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { v2Map } from '../src/seats-world.ts';

/**
 * A situation option issues a call for regiments (lane 1.11): in the principal's name, through the validated call path
 * as a goal goes through the order path, and each governor answers by his own compliance (lane 1.7). On the testbed.
 */
const P = (id: string) => ids.toId('person', id);
const POST = (id: string) => ids.toId('post', id);

function callSituation(to: string, termDays: number): phase0.SituationDef {
  return {
    id: ids.toId('situation', 'muster_call'),
    kind: 'decision',
    faction: ids.toId('faction', 'north'),
    title: 'situation.muster_call.title',
    text: 'situation.muster_call.text',
    earliest: '1861-03-01',
    event: { dayAtLeast: 1 },
    knowledge: null,
    railroad: 'a test call on day 1',
    chain: null,
    subjects: [],
    options: [
      {
        id: 'call_out',
        label: 'situation.muster_call.option.call_out',
        displayKey: 1,
        proposedBy: [P('n_secretary')],
        group: null,
        appearsWhen: null,
        expiresWhen: null,
        waitsOn: null,
        effects: [],
        lockedCosts: [],
        orders: [],
        calls: [{ to: POST(to), regiments: 8, termDays, route: 'courier' }],
        honours: [],
        watched: false,
        gate: null,
      },
    ],
    inaction: { text: 'situation.muster_call.inaction', effects: [] },
    historicalDefault: { options: ['call_out'] },
    staffLine: { authors: [POST('n_war_office')], recommends: ['call_out'], reasons: [], confidence: 600 },
    delegableTo: [],
    resurfaceOn: [],
    effects: [],
    report: null,
    gate: { none: 'a test call' },
    gateReview: null,
    citations: [],
  };
}

function run(situation: phase0.SituationDef, days: number) {
  const map = v2Map('testbed')!;
  let world: phase0.SeatsWorld;
  try {
    world = phase0.indexSeatsWorld(w.indexWorld(map.world), map.start, { situations: [situation] });
  } catch (e) {
    throw new Error(String((e as { problems?: string[] }).problems));
  }
  let state = phase0.createState(world, { seed: map.start.seed, people: 'as-history' });
  const results: phase0.TickResult[] = [];
  for (let d = 1; d <= days; d++) {
    // No seat answers here, so the decision takes its historical default, the option that calls.
    const r = phase0.tick(world, state, [], { freeze: true });
    results.push(r);
    state = r.state;
  }
  return { state, results };
}

describe('a situation option issues a call (lane 1.11)', () => {
  it('sends the call through the validated path; the governor answers it by his own compliance and holds a levy', () => {
    const { state, results } = run(callSituation('n_brenmark_governor', 90), 6);
    expect(results.flatMap((r) => r.rejections).map((r) => r.reason)).toEqual([]);
    const levy = Object.values(state.postLevies)[0]!;
    expect(levy).toMatchObject({ levyPost: POST('n_brenmark_governor'), levyGovernor: P('n_governor'), levyIssuer: P('n_leader'), levyTermDays: 90 });
    expect(Object.values(state.orderResponses).some((r) => r.respPerson === P('n_governor') && r.respRole === 'addressee')).toBe(true);
  });

  it('a call the path refuses is a rejection, as an order is: here a post that raises no regiments', () => {
    const { state, results } = run(callSituation('n_army_west', 90), 4);
    expect(results.flatMap((r) => r.rejections).map((r) => [r.entry, r.reason])).toEqual([[-1, 'not_raising_post']]);
    expect(state.postLevies).toEqual({});
  });
});

describe('a government’s act a pack-set delay after the call reaches it (lane 1.11, the lead’s ruling)', () => {
  it('fires the notice once the call has reached the governor the condition names, that many days before, never earlier', () => {
    const notice: phase0.SituationDef = {
      ...callSituation('n_brenmark_governor', 90),
      id: ids.toId('situation', 'shire_act'),
      kind: 'notice',
      event: { callReceived: { post: POST('n_brenmark_governor'), days: 3 } },
      railroad: null,
      options: [],
      inaction: null,
      historicalDefault: null,
      staffLine: null,
      effects: [{ setFlag: 'shire_acted' }],
      report: { authors: [POST('n_war_office')], reportType: 'wire-dispatch', subtype: null },
    };
    const map = v2Map('testbed')!;
    const world = phase0.indexSeatsWorld(w.indexWorld(map.world), map.start, { situations: [callSituation('n_brenmark_governor', 90), notice] });
    let state = phase0.createState(world, { seed: map.start.seed, people: 'as-history' });
    for (let d = 1; d <= 12; d++) state = phase0.tick(world, state, [], { freeze: true }).state;
    const arrived = Object.values(state.orderResponses).find((r) => r.respKind === 'call' && r.respPost === POST('n_brenmark_governor'))!;
    expect(arrived).toBeDefined();
    expect(state.situationFlags['shire_acted']).toBe(arrived.respDay + 3);
  });
});
