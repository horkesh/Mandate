import { describe, expect, it } from 'vitest';
import { toId, type MessageId } from '../src/ids.ts';
import { traitsOf } from '../src/people/traits.ts';
import { responseKey } from '../src/proxy/responses.ts';
import { enemyBeliefs } from '../src/knowledge/beliefs.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { LogEntry } from '../src/log/log.ts';
import { playDays } from '../src/log/session.ts';
import { routeLatency } from '../src/messages/latency.ts';
import { createIdMint, sendMessages } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { viewGround } from '../src/planner/input.ts';
import { headquartersOf } from '../src/seats/posts.ts';
import { latencyMapFor, type SeatsWorld } from '../src/seats/world.ts';
import { indexWorld } from '../src/world/index.ts';
import type { WorldRules } from '../src/world/world.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { sendReport, type TickContext } from '../src/tick/context.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, type TickResult } from '../src/tick/tick.ts';
import { viewFor } from '../src/view/view.ts';
import { F, indexedFixture, P, POST, R } from './support/seats-fixture.ts';
import { order, scriptedSeats } from './support/test-seats.ts';

const lead = seatIdFor(P('a_lead'));

/** The same seats World on a World whose rules differ (the person lookups and the start are kept). */
function withRules(world: SeatsWorld, over: Partial<WorldRules>): SeatsWorld {
  return { ...world, map: indexWorld({ ...world.map.world, rules: { ...world.map.world.rules, ...over } }) };
}

/** Run days with the scripted seats, collecting every tick result. */
function run(world: ReturnType<typeof indexedFixture>, days: number, script: Parameters<typeof scriptedSeats>[0] = {}, start?: State) {
  const results: TickResult[] = [];
  const out = playDays(world, start ?? createState(world, { seed: 11 }), scriptedSeats(script), days, { freeze: true, onDay: (r) => results.push(r) });
  return { ...out, results };
}

describe('latency is the kernel’s (0026)', () => {
  const world = indexedFixture();
  // Latency on the start's map: the wire is the holder's (0052).
  const latency = latencyMapFor(world, buildControlIndex(world.map, createState(world, { seed: 1 }).regionControl));
  const L = (route: Parameters<typeof routeLatency>[2], from: string, to: string, noise: { seed: number; message: MessageId } | null = null) =>
    routeLatency(latency, world.map.world.rules.latency, route, R(from), R(to), F('a'), noise);
  const days = (r: ReturnType<typeof L>) => (r.ok ? r.latency.days : -1);

  it('computes courier, wire, special messenger and mail from the map', () => {
    expect(days(L('courier', 'a_cap', 'a_front'))).toBe(3);
    expect(days(L('wire', 'a_cap', 'a_mid'))).toBe(0);
    // The wire is a side's own: nobody of side a files a message at side b's office in b_cap.
    expect(L('wire', 'a_cap', 'b_cap')).toEqual({ ok: true, latency: { days: 5, parts: [{ part: 'wire', days: 0 }, { part: 'from the wire', days: 5 }] } });
    // Off the wire at one end: ride two days to the office at a_mid, then wire.
    expect(L('wire', 'a_front', 'a_cap')).toEqual({ ok: true, latency: { days: 2, parts: [{ part: 'to the wire', days: 2 }, { part: 'wire', days: 0 }] } });
    expect(days(L('special-messenger', 'a_cap', 'a_front'))).toBe(1);
    expect(days(L('mail', 'a_cap', 'a_front'))).toBe(6);
    expect(L('rail', 'a_cap', 'a_mid')).toEqual({ ok: false, reason: 'route_unavailable' });
  });

  it('draws courier weather from a stream keyed by the message alone', () => {
    const a = toId('message', 'm.1.x.y.a');
    const draws = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => days(L('courier', 'a_cap', 'a_front', { seed: i, message: a })));
    expect(new Set(draws).size).toBeGreaterThan(1);
    // The same message, the same seed: the same delay, whatever else has been drawn in between.
    days(L('courier', 'a_cap', 'b_cap', { seed: 3, message: toId('message', 'm.1.x.y.other') }));
    expect(days(L('courier', 'a_cap', 'a_front', { seed: 3, message: a }))).toBe(draws[2]);
    // A special messenger does not wait for the weather.
    expect(new Set([1, 2, 3, 4, 5, 6].map((i) => days(L('special-messenger', 'a_cap', 'a_front', { seed: i, message: a }))))).toEqual(new Set([1]));
  });
});

describe('orders through chains (0040)', () => {
  it('relays through the office, whose holder objects; the order never reaches the army', () => {
    const world = indexedFixture();
    const { state, results } = run(world, 6, { a: { 1: [order('a_army', 'advance', 'b_cap')] } });
    const objected = results.flatMap((r) => r.events).filter((e) => e.event === 'objected');
    expect(objected).toHaveLength(1);
    expect(objected[0]!.person).toBe(P('a_sec'));
    // His objection's terms: the rung, then each term of his willingness (lane 1.1: compliance on the new State).
    expect(objected[0]!.terms.map((t) => `${t.termKind}:${t.termRule}:${t.termValue}`)).toEqual([
      // A candid man: an advance offends his caution and is 400 bolder than he likes; his regard and the oversight do not make up for it.
      'relay_objection:object:-227',
      'relay_term:values:-200',
      'relay_term:temperament:-160',
      'relay_term:regard:90',
      'relay_term:deterrence:43',
      'relay_term:capacity:0',
      'relay_term:disposition:0',
      'relay_term:grievances:0',
    ]);
    // The memorandum is advice he volunteered, with stated reasons, answering the order.
    const memo = knowledgeOf(state, lead).knownReports.find((r) => r.knownBody.reportType === 'advice')!;
    expect(memo.knownBody.reportSubtype).toBe('memorandum');
    expect(memo.knownBody.reportAdvice).toEqual({ adviceRecommends: 'withdraw-order', adviceReasons: [{ reasonKind: 'values_offended', reasonWeight: 1000 }, { reasonKind: 'too_rash', reasonWeight: 400 }, { reasonKind: 'trusts_leader', reasonWeight: 1000 }], adviceConfidence: 800 });
    expect(results[0]!.decisionPoints.map((d) => d.point)).toEqual(['objection']);
    // He was given no goal: no plan record, and nothing moves him.
    expect(state.planRecords[POST('a_army')]).toBeUndefined();
    expect(Object.values(state.operationRecords).filter((o) => o.opPost === POST('a_army'))).toEqual([]);
  });

  it('goes around the chain by special messenger: faster, priced, and a grievance for the man bypassed', () => {
    const world = indexedFixture();
    const { state, results } = run(world, 8, { a: { 1: [order('a_army', 'advance', 'b_cap', 'special-messenger', true)] } });
    expect(results[0]!.prices).toEqual([{ seat: lead, attention: 1, why: 'special-messenger' }]);
    expect(results[0]!.proposals).toEqual([{ proposal: 'grievance', person: P('a_sec'), cause: 'bypassed', order: expect.any(String) }]);
    // Three courier days, halved and truncated: it lands on day 2, and the goal is set then (lane 1.2: a goal in plans).
    const goal = state.planRecords[POST('a_army')]!;
    expect(goal.planGoal).toMatchObject({ goalObjective: R('b_cap'), goalPosture: 'take' });
    expect(goal.planSetDay).toBe(2);
    expect(goal.planViaChain).toBe(false);
    // His acknowledgement rides to the wire and passes the filter post on its way to the principal (read on the days it
    // was held: the plan he submits later answers the same order and supersedes it).
    const ack = results.flatMap((r) => knowledgeOf(r.state, lead).knownReports).find((r) => r.knownBody.reportClaims.some((c) => c.claimKind === 'order-obeyed'))!;
    expect(ack.knownVia).toEqual([POST('a_filter')]);
    expect(ack.knownRoute).toBe('wire');
  });

  it('relays a forwarded order with the relayer’s own delay', () => {
    const world = indexedFixture({ persons: { a_sec: { values: ['duty'], regard: 'below', boldness: 'average', candour: 'low' } } });
    const { state, results } = run(world, 8, { a: { 1: [order('a_army', 'advance', 'b_cap')] } });
    const relayed = results.flatMap((r) => r.events).filter((e) => e.event === 'relayed');
    // His compliance (lane 1.1): an advance 100 bolder than he likes, from a leader he regards below par, watched a little:
    // mild covert unwillingness, a slow walk, which a relay turns into the pack's two days' hold.
    expect(relayed).toHaveLength(1);
    expect(relayed[0]!.terms[0]).toEqual({ termKind: 'relay_hold', termPerson: P('a_sec'), termPost: POST('a_office'), termRegion: null, termValue: 2, termRule: 'slow_walk' });
    expect(relayed[0]!.terms.slice(1).map((t) => `${t.termRule}:${t.termValue}`)).toEqual(['values:0', 'temperament:-40', 'regard:-90', 'deterrence:43', 'capacity:0', 'disposition:0', 'grievances:0']);
    const response = state.orderResponses[responseKey(relayed[0]!.message!, P('a_sec'))]!;
    expect([response.respActual, response.respDeclared, response.respWillingness, response.respRole]).toEqual(['slow_walk', 'comply', -87, 'relay']);
    // Wired from the capital to the office at once, held two days, then two days to the front by wire and horse.
    expect(state.planRecords[POST('a_army')]!.planSetDay).toBe(5);
    expect(state.planRecords[POST('a_army')]!.planViaChain).toBe(true);
  });

  describe('conflicting orders: one down the chain, one around it (the office holds what it relays)', () => {
    const world = indexedFixture({ persons: { a_sec: { values: ['duty'], regard: 'below', boldness: 'average', candour: 'low' } } });
    function play(script: Record<number, LogEntry['command']>, days: number, on: SeatsWorld = world) {
      let state = createState(on, { seed: 5 });
      const results: TickResult[] = [];
      for (let d = 1; d <= days; d++) {
        const r = tick(on, state, script[d] ? [{ day: d, seat: lead, command: script[d]! }] : [], { freeze: true });
        results.push(r);
        state = r.state;
      }
      // Every acknowledgement he received, on whichever day he held it (a later answer to the same order supersedes one).
      const acks = new Map<string, string | null>();
      for (const r of results) for (const k of knowledgeOf(r.state, lead).knownReports) for (const c of k.knownBody.reportClaims) if (c.claimKind === 'order-obeyed') acks.set(k.id, c.claimToken);
      const tokens = [...acks.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([, t]) => t);
      return { state, results, tokens };
    }

    // Lane 1.2 calls lane 1.1's `resolveOrderConflict` at arrival: he resolves the two by his own compliance, each order
    // read with the pack's terms for its kind, the chain's order and the newer one weighing more (0040).
    it('resolves the conflict by his own compliance: the timid, cautious general obeys the hold, whichever arrives last, and says so', () => {
      // The chain's advance lands on day 5 (held two days by the office); the hold sent around it on day 7.
      const late = play({ 1: order('a_army', 'advance', 'b_front'), 6: order('a_army', 'hold', null, 'special-messenger', true) }, 12);
      expect(late.state.planRecords[POST('a_army')]!.planGoal.goalPosture).toBe('hold');
      expect(late.results.flatMap((r) => r.events).filter((e) => e.event === 'conflict')).toHaveLength(1);
      expect(late.results.flatMap((r) => r.decisionPoints).map((d) => d.point)).toContain('order-conflict');
      expect(late.tokens).toEqual(['new', 'conflict-new']);
      // The hold lands first (day 3); the chain's advance, written first, on day 5: he keeps the hold.
      const early = play({ 1: order('a_army', 'advance', 'b_front'), 2: order('a_army', 'hold', null, 'special-messenger', true) }, 12);
      expect(early.state.planRecords[POST('a_army')]!.planGoal.goalPosture).toBe('hold');
      expect(early.tokens).toEqual(['new', 'conflict-kept']);
    });

    it('a bold general who values glory keeps the chain’s advance against a hold sent around it (positive control)', () => {
      const bold = indexedFixture({ persons: { a_sec: { values: ['duty'], regard: 'below', boldness: 'average', candour: 'low' }, a_gen: { boldness: 'high', candour: 'average', regard: 'above', values: ['glory'] } } });
      const { state, tokens } = play({ 1: order('a_army', 'advance', 'b_front'), 6: order('a_army', 'hold', null, 'special-messenger', true) }, 12, bold);
      expect(state.planRecords[POST('a_army')]!.planGoal).toMatchObject({ goalObjective: R('b_front'), goalPosture: 'take' });
      expect(tokens).toEqual(['new', 'conflict-kept']);
    });

    it('reads the conflict window from the pack (0072): with two days, the bypass two days after the chain order is simply obeyed', () => {
      const script = { 1: order('a_army', 'advance', 'b_front'), 6: order('a_army', 'hold', null, 'special-messenger', true) };
      const narrow = play(script, 12, withRules(world, { standing: { conflictWindowDays: 2 } }));
      expect(narrow.state.planRecords[POST('a_army')]!.planGoal.goalPosture).toBe('hold');
      expect(narrow.results.flatMap((r) => r.events).filter((e) => e.event === 'conflict')).toEqual([]);
      // The control: the pack's seven days make it a conflict, as above.
      expect(play(script, 12).results.flatMap((r) => r.events).filter((e) => e.event === 'conflict')).toHaveLength(1);
    });
  });

  it('accepts orders only from a principal (review F3, positive control: the office holder’s order is refused)', () => {
    const world = indexedFixture();
    const sec = seatIdFor(P('a_sec'));
    const r = tick(world, createState(world, { seed: 5 }), [{ day: 1, seat: sec, command: order('a_army', 'advance', 'b_cap') }]);
    expect(r.rejections.map((x) => x.reason)).toEqual(['not_a_principal']);
    expect(r.state.messagesInTransit.filter((m) => m.msgOrder !== null)).toEqual([]);
  });

  it('rejects commands the kernel cannot carry, with a reason each', () => {
    const world = indexedFixture();
    const bold = seatIdFor(P('a_bold'));
    const r = tick(world, createState(world, { seed: 1 }), [
      { day: 1, seat: lead, command: order('nowhere', 'hold', null) },
      { day: 1, seat: lead, command: order('b_army', 'hold', null) },
      { day: 1, seat: bold, command: order('a_army', 'hold', null) },
      { day: 1, seat: lead, command: order('a_army', 'advance', null) },
      { day: 1, seat: lead, command: order('a_army', 'hold', null, 'rail') },
      { day: 1, seat: lead, command: { cmd: 'choose', request: 'plan:a_army:1', option: 'hold' } },
      { day: 2, seat: lead, command: order('a_army', 'hold', null) },
    ]);
    expect(r.rejections.map((x) => x.reason)).toEqual(['unknown_post', 'not_field_post', 'not_a_principal', 'bad_goal', 'route_unavailable', 'no_such_request', 'wrong_day']);
  });
});

describe('filters on the wire (0032)', () => {
  it('holds a wire for a day and cuts the losses from it, keeping the cut in the truth layer', () => {
    const world = indexedFixture();
    let state = createState(world, { seed: 2 });
    const ctx: TickContext = { world, latency: latencyMapFor(world, buildControlIndex(world.map, state.regionControl)), day: 1, seed: 2, mint: createIdMint(state), telemetry: undefined, outbox: [], rejections: [], events: [], proposals: [], prices: [], decisionPoints: [], controlDeltas: [], infrastructureDeltas: [], mapEvents: [] };
    sendReport(ctx, state, {
      body: {
        reportType: 'wire-dispatch',
        reportSubtype: null,
        reportAuthor: P('a_bold'),
        reportAuthorPost: POST('a_reserve'),
        reportSubjectKind: 'post',
        reportSubjectId: 'a_reserve',
        reportClaims: [
          { claimKind: 'position', claimRegion: R('a_mid'), claimValue: 0, claimToken: null, claimConfidence: 1000 },
          { claimKind: 'own-losses', claimRegion: null, claimValue: 450, claimToken: null, claimConfidence: 500 },
        ],
        reportDay: 1,
        reportHour: 14,
        reportAdvice: null,
        reportAnswers: null,
      },
      truth: NO_TRUTH,
      to: P('a_lead'),
      tag: 'probe',
    });
    state = sendMessages(state, ctx.outbox.splice(0));
    for (let i = 0; i < 3; i++) state = tick(world, state, [], { freeze: true }).state;
    const got = knowledgeOf(state, lead).knownReports.find((r) => r.knownBody.reportSubjectId === 'a_reserve' && r.knownBody.reportHour === 14)!;
    expect(got.knownReceivedDay).toBe(2);
    expect(got.knownVia).toEqual([POST('a_filter')]);
    expect(got.knownBody.reportClaims.map((c) => c.claimKind)).toEqual(['position']);
    const truth = state.reportTruth[got.id]!;
    expect(truth.truthTrimmed.map((c) => c.claimKind)).toEqual(['own-losses']);
    expect(truth.truthTerms.map((t) => t.termKind)).toEqual(['filter_hold', 'filter_trim']);
    // The principal's view shows the route and the post it passed, never what was cut or why.
    const json = JSON.stringify(viewFor(world, state, lead));
    expect(json).toContain('a_filter');
    for (const hidden of ['own-losses', 'filter_trim', 'truth', 'termKind']) expect(json).not.toContain(hidden);
  });

  it('lets a report off the wire ride past the filter post', () => {
    const world = indexedFixture();
    const { state } = run(world, 6);
    const fromFront = knowledgeOf(state, lead).knownReports.filter((r) => r.knownBody.reportAuthor === P('a_gen') && r.knownBody.reportType === 'wire-dispatch');
    expect(fromFront.length).toBeGreaterThan(0);
    // a_front is off the wire, but two days' ride to a_mid's office beats three by courier: it goes by wire, and is filtered.
    expect(fromFront.every((r) => r.knownRoute === 'wire' && r.knownVia.join() === 'a_filter')).toBe(true);
  });
});

describe('belief: perception in belief derivation, the intelligence chief a separate term (planner-design findings 3 and 6)', () => {
  it('inflates his dispatches and his plans by the same amount', () => {
    // A strong army, so his plans move and show what he perceives.
    const world = indexedFixture({ posts: { a_army: { strength: 20_000 } } });
    // Two days: the order lands on day 2, and his first estimate has reached him; he has not moved yet.
    const { state } = run(world, 2, { a: { 1: [order('a_army', 'advance', 'b_cap', 'special-messenger', true)] } });
    const gen = traitsOf(world, state, P('a_gen'));
    const belief = enemyBeliefs(state, world.rules.traits, gen, knowledgeOf(state, seatIdFor(gen.id))).get(R('b_front'))!;
    // 800 men seen, 2.4 times by the timid, cautious chief (his own perception bias), then 2.4 times by a timid, cautious general.
    expect(belief.value).toBe(4608);
    expect(belief.terms.map((t) => `${t.termKind}:${t.termValue}`)).toEqual(['observed:800', 'intelligence_bias:2400', 'reported:1920', 'perception_bias:2400']);
    // The planner reads his view, never truth (0062): the same figure.
    const view = viewFor(world, state, seatIdFor(gen.id));
    expect(view.enemyBeliefs[R('b_front')]!.value).toBe(4608);
    expect(viewGround(view).beliefs.get(R('b_front'))).toBe(4608);
    // The next dispatch he writes carries the same figure to the principal.
    const later = run(world, 6, {}, state).state;
    const dispatch = knowledgeOf(later, lead).knownReports.filter((r) => r.knownBody.reportAuthor === gen.id && r.knownBody.reportType === 'wire-dispatch').at(-1)!;
    expect(dispatch.knownBody.reportClaims.find((c) => c.claimKind === 'enemy-strength' && c.claimRegion === R('b_front'))!.claimValue).toBe(4608);
  });

  it('tells a timid general from a bad intelligence chief by their terms, though the figure is the same', () => {
    // A chief's bias is his own perception bias (lane 1.1): a timid chief without caution reads 1900, a steady one 1000.
    const badChief = indexedFixture({ persons: { a_gen: { boldness: 'average', values: ['duty'] }, a_spy: { boldness: 'low', values: ['duty'] } } });
    const timid = indexedFixture({ persons: { a_gen: { boldness: 'low', values: ['duty'] }, a_spy: { boldness: 'average', values: ['duty'] } } });
    const beliefIn = (world: ReturnType<typeof indexedFixture>) => {
      const { state } = run(world, 2);
      const gen = traitsOf(world, state, P('a_gen'));
      return enemyBeliefs(state, world.rules.traits, gen, knowledgeOf(state, seatIdFor(gen.id))).get(R('b_front'))!;
    };
    const a = beliefIn(badChief);
    const b = beliefIn(timid);
    expect(a.value).toBe(1520);
    expect(b.value).toBe(1520);
    expect(a.terms.filter((t) => t.termKind === 'intelligence_bias').map((t) => [t.termPerson, t.termValue])).toEqual([[P('a_spy'), 1900]]);
    expect(b.terms.filter((t) => t.termKind === 'intelligence_bias')).toEqual([]);
    expect(a.terms.find((t) => t.termKind === 'perception_bias')!.termValue).toBe(1000);
    expect(b.terms.find((t) => t.termKind === 'perception_bias')!.termValue).toBe(1900);
  });

  it('holds a timid general whose belief makes every advance too weak, and has him ask for men once his plan is approved', () => {
    const world = indexedFixture();
    const { state } = run(world, 16, { a: { 1: [order('a_army', 'advance', 'b_cap', 'special-messenger', true)] } });
    // He waits: a holding action, or an advance on condition of reinforcement; either departs from the goal, so it went for review and was approved.
    const record = state.planRecords[POST('a_army')]!;
    expect(record.planStatus).toBe('approved');
    expect(record.planApproved!.candMethod === 'holding' || record.planApproved!.candConditions.some((g) => g.gateKind === 'move_when_reinforced')).toBe(true);
    expect(headquartersOf(world, state, POST('a_army'))).toBe(R('a_front'));
    const last = knowledgeOf(state, lead).knownReports.filter((r) => r.knownBody.reportAuthor === P('a_gen') && r.knownBody.reportType === 'wire-dispatch').at(-1)!;
    expect(last.knownBody.reportClaims.find((c) => c.claimKind === 'goal-status')!.claimToken).toBe('awaiting-strength');
    expect(last.knownBody.reportClaims.find((c) => c.claimKind === 'effective-strength')!.claimValue).toBe(800);
    expect(state.reportTruth[last.id]!.truthTerms.some((t) => t.termKind === 'wants_men')).toBe(true);
  });

  it('advances a bold commander to his objective, and he wires that he has arrived', () => {
    const world = indexedFixture({ posts: { a_reserve: { strength: 2000 } } });
    const { state, results } = run(world, 30, { a: { 1: [order('a_reserve', 'advance', 'b_mid', 'special-messenger', true)] } });
    expect(headquartersOf(world, state, POST('a_reserve'))).toBe(R('b_mid'));
    // Lane 1.4: his operation's main axis reached b_mid and holds it, digging in.
    const op = Object.values(state.operationRecords).find((o) => o.opPost === POST('a_reserve'))!;
    expect(op.opAxes[0]!).toMatchObject({ oaxObjective: R('b_mid') });
    expect(op.opAxes[0]!.oaxArrived).not.toBeNull();
    expect(results.flatMap((r) => r.decisionPoints).map((d) => d.point)).toContain('objective-reached');
  });
});
