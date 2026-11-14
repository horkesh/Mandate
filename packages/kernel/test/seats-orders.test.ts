import { describe, expect, it } from 'vitest';
import { toId, type MessageId } from '../src/ids.ts';
import { enemyBeliefs } from '../src/knowledge/beliefs.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { LogEntry } from '../src/log/log.ts';
import { playDays } from '../src/log/session.ts';
import { DEFAULT_LATENCY_RULES, routeLatency } from '../src/messages/latency.ts';
import { createIdMint, sendMessages } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { standingOptions } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { sendReport, type TickContext } from '../src/tick/context.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, type TickResult } from '../src/tick/tick.ts';
import { viewFor } from '../src/view/view.ts';
import { F, indexedFixture, P, POST, R } from './support/comms-fixture.ts';
import { order, scriptedSeats } from './support/test-seats.ts';

const lead = seatIdFor(P('a_lead'));

/** Run days with the scripted seats, collecting every tick result. */
function run(world: ReturnType<typeof indexedFixture>, days: number, script: Parameters<typeof scriptedSeats>[0] = {}, start?: State) {
  const results: TickResult[] = [];
  const out = playDays(world, start ?? createState(world, { seed: 11 }), scriptedSeats(script), days, { freeze: true, onDay: (r) => results.push(r) });
  return { ...out, results };
}

describe('latency is the kernel’s (0026)', () => {
  const world = indexedFixture();
  const L = (route: Parameters<typeof routeLatency>[2], from: string, to: string, noise: { seed: number; message: MessageId } | null = null) =>
    routeLatency(world, DEFAULT_LATENCY_RULES, route, R(from), R(to), F('a'), noise);
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
    expect(objected[0]!.terms.map((t) => t.termKind)).toEqual(['relay_objection']);
    // The memorandum is advice he volunteered, with stated reasons, answering the order.
    const memo = knowledgeOf(state, lead).knownReports.find((r) => r.knownBody.reportType === 'advice')!;
    expect(memo.knownBody.reportSubtype).toBe('memorandum');
    expect(memo.knownBody.reportAdvice).toEqual({ adviceRecommends: 'withdraw-order', adviceReasons: [{ reasonKind: 'too_rash', reasonWeight: 800 }], adviceConfidence: 800 });
    expect(results[0]!.decisionPoints.map((d) => d.point)).toEqual(['objection']);
    expect(state.standingGoals[POST('a_army')]!.standingSpec.goalSpecKind).toBe('hold');
  });

  it('goes around the chain by special messenger: faster, priced, and a grievance for the man bypassed', () => {
    const world = indexedFixture();
    const { state, results } = run(world, 8, { a: { 1: [order('a_army', 'advance', 'b_cap', 'special-messenger', true)] } });
    expect(results[0]!.prices).toEqual([{ seat: lead, attention: 1, why: 'special-messenger' }]);
    expect(results[0]!.proposals).toEqual([{ proposal: 'grievance', person: P('a_sec'), cause: 'bypassed', order: expect.any(String) }]);
    // Three courier days, halved and truncated: it lands on day 2, and the goal is set then.
    const goal = state.standingGoals[POST('a_army')]!;
    expect(goal.standingSpec).toEqual({ goalSpecKind: 'advance', goalSpecRegion: R('b_cap') });
    expect(goal.standingSetDay).toBe(2);
    expect(goal.standingViaChain).toBe(false);
    // His acknowledgement rides to the wire and passes the filter post on its way to the principal.
    const ack = knowledgeOf(state, lead).knownReports.find((r) => r.knownBody.reportClaims.some((c) => c.claimKind === 'order-obeyed'))!;
    expect(ack.knownVia).toEqual([POST('a_filter')]);
    expect(ack.knownRoute).toBe('wire');
  });

  it('relays a forwarded order with the relayer’s own delay', () => {
    const world = indexedFixture({ persons: { a_sec: { values: ['duty'], regard: -500 } } });
    const { state, results } = run(world, 8, { a: { 1: [order('a_army', 'advance', 'b_cap')] } });
    const relayed = results.flatMap((r) => r.events).filter((e) => e.event === 'relayed');
    expect(relayed.map((e) => e.terms)).toEqual([[{ termKind: 'relay_hold', termPerson: P('a_sec'), termPost: POST('a_office'), termRegion: null, termValue: 2, termRule: 'regard' }]]);
    // Wired from the capital to the office at once, held two days, then two days to the front by wire and horse.
    expect(state.standingGoals[POST('a_army')]!.standingSetDay).toBe(5);
    expect(state.standingGoals[POST('a_army')]!.standingViaChain).toBe(true);
  });

  it('resolves conflicting orders by keeping the chain’s, and reports which it obeyed', () => {
    const world = indexedFixture();
    const sec = seatIdFor(P('a_sec'));
    let state = createState(world, { seed: 5 });
    const results: TickResult[] = [];
    const day = (entries: LogEntry[]) => {
      const r = tick(world, state, entries, { freeze: true });
      results.push(r);
      state = r.state;
    };
    day([{ day: 1, seat: sec, command: order('a_army', 'advance', 'b_front') }]);
    day([]);
    day([{ day: 3, seat: lead, command: order('a_army', 'hold', null, 'special-messenger', true) }]);
    for (let i = 0; i < 6; i++) day([]);
    expect(state.standingGoals[POST('a_army')]!.standingSpec).toEqual({ goalSpecKind: 'advance', goalSpecRegion: R('b_front') });
    expect(results.flatMap((r) => r.events).filter((e) => e.event === 'conflict')).toHaveLength(1);
    expect(results.flatMap((r) => r.decisionPoints).map((d) => d.point)).toContain('order-conflict');
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
      { day: 1, seat: lead, command: { cmd: 'choose', request: 'standing:a_army:1', option: 'hold' } },
      { day: 2, seat: lead, command: order('a_army', 'hold', null) },
    ]);
    expect(r.rejections.map((x) => x.reason)).toEqual(['unknown_post', 'not_field_post', 'not_in_chain', 'bad_goal', 'route_unavailable', 'no_such_request', 'wrong_day']);
  });
});

describe('filters on the wire (0032)', () => {
  it('holds a wire for a day and cuts the losses from it, keeping the cut in the truth layer', () => {
    const world = indexedFixture();
    let state = createState(world, { seed: 2 });
    const ctx: TickContext = { world, day: 1, seed: 2, mint: createIdMint(state), telemetry: undefined, outbox: [], rejections: [], events: [], proposals: [], prices: [], decisionPoints: [] };
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
  it('inflates his dispatches and his menu by the same amount', () => {
    // A strong army, so advancing stays consistent and the menu shows what he perceives.
    const world = indexedFixture({ posts: { a_army: { strength: 10_000 } } });
    // Two days: the order lands on day 2, and his first estimate has reached him; he has not moved yet.
    const { state } = run(world, 2, { a: { 1: [order('a_army', 'advance', 'b_cap', 'special-messenger', true)] } });
    const gen = world.person(P('a_gen'));
    const belief = enemyBeliefs(state, world.rules.traits, gen, knowledgeOf(state, seatIdFor(gen.id))).get(R('b_front'))!;
    // 800 men seen, doubled by the chief, then 2.4 times by a timid, cautious general.
    expect(belief.value).toBe(3840);
    expect(belief.terms.map((t) => `${t.termKind}:${t.termValue}`)).toEqual(['observed:800', 'intelligence_bias:2000', 'reported:1600', 'perception_bias:2400']);
    const options = standingOptions(world, state, POST('a_army'), state.stateDay + 1)!;
    expect(options.find((o) => o.region === R('b_front'))!.perceivedEnemy).toBe(3840);
    expect(viewFor(world, state, seatIdFor(gen.id)).enemyBeliefs[R('b_front')]!.value).toBe(3840);
    // The next dispatch he writes carries the same figure to the principal.
    const later = run(world, 6, {}, state).state;
    const dispatch = knowledgeOf(later, lead).knownReports.filter((r) => r.knownBody.reportAuthor === gen.id && r.knownBody.reportType === 'wire-dispatch').at(-1)!;
    expect(dispatch.knownBody.reportClaims.find((c) => c.claimKind === 'enemy-strength' && c.claimRegion === R('b_front'))!.claimValue).toBe(3840);
  });

  it('tells a timid general from a bad intelligence chief by their terms, though the figure is the same', () => {
    const badChief = indexedFixture({ persons: { a_gen: { boldness: 500, values: ['duty'] }, a_spy: { intelligenceBias: 1900 } } });
    const timid = indexedFixture({ persons: { a_gen: { boldness: 200, values: ['duty'] }, a_spy: { intelligenceBias: 1000 } } });
    const beliefIn = (world: ReturnType<typeof indexedFixture>) => {
      const { state } = run(world, 2);
      const gen = world.person(P('a_gen'));
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

  it('holds a timid general whose belief makes every advance inconsistent, and has him ask for men', () => {
    const world = indexedFixture();
    const { state } = run(world, 8, { a: { 1: [order('a_army', 'advance', 'b_cap', 'special-messenger', true)] } });
    expect(standingOptions(world, state, POST('a_army'), state.stateDay + 1)!.map((o) => o.optionId)).toEqual(['hold']);
    expect(state.headquarters[POST('a_army')]!.hqRegion).toBe(R('a_front'));
    const last = knowledgeOf(state, lead).knownReports.filter((r) => r.knownBody.reportAuthor === P('a_gen') && r.knownBody.reportType === 'wire-dispatch').at(-1)!;
    expect(last.knownBody.reportClaims.find((c) => c.claimKind === 'goal-status')!.claimToken).toBe('awaiting-strength');
    expect(last.knownBody.reportClaims.find((c) => c.claimKind === 'effective-strength')!.claimValue).toBe(800);
    expect(state.reportTruth[last.id]!.truthTerms.some((t) => t.termKind === 'wants_men')).toBe(true);
  });

  it('advances a bold commander to his objective, and he wires that he has arrived', () => {
    const world = indexedFixture({ posts: { a_reserve: { strength: 2000 } } });
    const { state, results } = run(world, 30, { a: { 1: [order('a_reserve', 'advance', 'b_mid', 'special-messenger', true)] } });
    expect(state.headquarters[POST('a_reserve')]!.hqRegion).toBe(R('b_mid'));
    expect(state.standingGoals[POST('a_reserve')]!.standingSpec).toEqual({ goalSpecKind: 'hold', goalSpecRegion: R('b_mid') });
    expect(results.flatMap((r) => r.decisionPoints).map((d) => d.point)).toContain('objective-reached');
  });
});
