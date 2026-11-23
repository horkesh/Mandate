import { describe, expect, it } from 'vitest';
import { INFORMAL_SUBTYPES, reportProblems, type ReportBody } from '../src/knowledge/report.ts';
import { knowledgeOf, reportsForView } from '../src/knowledge/knowledge.ts';
import { MAX_REPORT_AGE_DAYS, REPORT_KINDS, templateFor, templateProblems } from '../src/knowledge/templates.ts';
import type { RouteKind } from '../src/messages/latency.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { FIXTURE_TEMPLATES } from './support/map-fixture.ts';
import { ORDER_ROUTES } from '../src/messages/latency.ts';
import { createIdMint, mintMessageId } from '../src/messages/transit.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { createFreezeLedger } from '../src/tick/freeze.ts';
import { logProblems, type LogEntry } from '../src/log/log.ts';
import { answerEntries, playDays, replay } from '../src/log/session.ts';
import { IMMUTABLE_ROOT_FIELDS, OWNED_FIELDS } from '../src/ownership.ts';
import type { State } from '../src/root-state.ts';
import { pendingRequests } from '../src/seats/requests.ts';
import { seatIdFor, seatIds } from '../src/seats/seats.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { deepFreeze } from '../src/tick/freeze.ts';
import { createState } from '../src/tick/setup.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { SEATS_MECHANICS, tick } from '../src/tick/tick.ts';
import { POLITICS_MECHANICS } from '../src/tick/politics.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { F, indexedFixture, P, R } from './support/seats-fixture.ts';
import { order, scriptedSeats } from './support/test-seats.ts';

const lead = seatIdFor(P('a_lead'));
/**
 * A reference game: an advance the office objects to, a bypass by special
 * messenger, a hold order the office relays slowly, and the other side advancing.
 */
const SCRIPT = {
  a: {
    1: [order('a_army', 'advance', 'b_cap')],
    4: [order('a_reserve', 'advance', 'b_cap', 'special-messenger', true)],
    6: [order('a_army', 'hold', null)],
    20: [order('a_army', 'hold', null, 'courier', true)],
  },
  b: { 2: [order('b_army', 'advance', 'a_cap')] },
};
/** The office holds what he forwards (low regard); the reserve is strong enough that advancing and holding are both in keeping with him. */
const REFERENCE = { persons: { a_sec: { regard: 'below', candour: 'below' } }, posts: { a_reserve: { strength: 1000 } } } as const;

function game(days: number, opts: { freeze?: boolean; worldOver?: Parameters<typeof indexedFixture>[0] } = {}) {
  const world = indexedFixture(opts.worldOver ?? REFERENCE);
  const start = createState(world, { seed: 99 });
  return { world, start, ...playDays(world, start, scriptedSeats(SCRIPT), days, { freeze: opts.freeze ?? true }) };
}

describe('the command log is the truth (0015)', () => {
  it('replays a log from the start to every dayÃ¢â‚¬â„¢s hash, without asking a seat', () => {
    const { world, start, log, hashes } = game(80);
    expect(log.length).toBeGreaterThan(3);
    expect(replay(world, start, log, 80).hashes).toEqual(hashes);
  });

  it('a changed log entry changes the hashes from its day on (positive control)', () => {
    const { world, start, log, hashes } = game(40);
    const i = log.findIndex((e) => e.command.cmd === 'order' && e.day === 4);
    const tampered: LogEntry[] = log.map((e, j) => (j === i && e.command.cmd === 'order' ? { ...e, command: { ...e.command, route: 'courier' } } : e));
    const again = replay(world, start, tampered, 40).hashes;
    expect(again.slice(0, 3)).toEqual(hashes.slice(0, 3));
    expect(again[39]!.hash).not.toBe(hashes[39]!.hash);
  });

  it('saves State and the log, with both hashes, and resumes to the continuous runÃ¢â‚¬â„¢s hash', () => {
    const { world, start, log, hashes, state } = game(60);
    const mid = replay(world, start, log, 25);
    const text = encodeSave({ worldHash: canonicalHash(world.map.world), state: mid.state, log: log.filter((e) => e.day <= 25) });
    const loaded = decodeSave(text, { expectedWorldHash: canonicalHash(world.map.world) });
    expect(loaded.log.length).toBeGreaterThan(0);
    expect(loaded.logHash).toBe(canonicalHash(log.filter((e) => e.day <= 25)));
    expect(logProblems(loaded.log)).toEqual([]);
    // The saved log replays to the saved State...
    expect(replay(world, start, loaded.log as unknown as LogEntry[], 25).state).toEqual(loaded.state);
    // ...and resuming from the saved State with the rest of the log ends where the continuous run did.
    const resumed = replay(world, loaded.state as unknown as State, log, 60);
    expect(resumed.hashes).toEqual(hashes.slice(25));
    expect(canonicalHash(resumed.state)).toBe(canonicalHash(state));
  });

  it('finds malformed log entries: shape, and the type and vocabulary of each value (review F5)', () => {
    expect(logProblems([{ day: 2, seat: 's', command: { cmd: 'order', to: 'x' } }, { day: 1, seat: 's', command: { cmd: 'fly' } }, null])).toEqual([
      'entry 0: order has fields [cmd, to], expected [bypass, cmd, goal, route, to]',
      'entry 1: unknown command',
      'entry 1: day 1 comes after day 2',
      'entry 2: not an object',
    ]);
    expect(logProblems([{ day: 1, seat: 's', command: { cmd: 'order', to: 'a_army', goal: 'charge', route: 'balloon', bypass: 'no' } }])).toEqual([
      'entry 0: order.route must be one of courier, in-person, mail, rail, ship, special-messenger, wire',
      'entry 0: order.bypass must be true or false',
      'entry 0: order.goal must be an object',
    ]);
    // A goal's every term is typed (lane 1.2): its posture from the closed list, its objective a region id or null.
    const goal = { objective: 7, posture: 'charge', risk: 'high', deadlineDays: 20, rail: true, river: false, sea: false, neutral: 'no', committed: [], awaitWord: false, approveAsDrafted: true };
    expect(logProblems([{ day: 1, seat: 's', command: { cmd: 'order', to: 'a_army', goal, route: 'wire', bypass: false } }])).toEqual([
      'entry 0: order.goal objective must be a region id or null',
      'entry 0: order.goal posture must be one of hold, relieve, take',
      'entry 0: order.goal risk must be an integer',
      'entry 0: order.goal neutral must be true or false',
    ]);
  });

  it('refuses a malformed entry in play, and a malformed log in replay (review F5, positive control)', () => {
    const world = indexedFixture();
    const start = createState(world, { seed: 1 });
    const bad = { day: 1, seat: lead, command: { ...order('a_army', 'hold', null), bypass: 'no' } } as unknown as LogEntry;
    const r = tick(world, start, [bad]);
    expect(r.rejections.map((x) => x.reason)).toEqual(['malformed']);
    expect(r.state.messagesInTransit.filter((m) => m.msgOrder !== null)).toEqual([]);
    expect(() => replay(world, start, [bad], 3)).toThrow('order.bypass must be true or false');
  });
});

describe('knowledge stays bounded (FOUNDATION section 8)', () => {
  it('prunes by age and supersession, so what a seat holds plateaus while deliveries grow', () => {
    const world = indexedFixture(REFERENCE);
    const telemetry = createTelemetry([...SEATS_MECHANICS, ...MAP_MECHANICS]);
    const sizes: number[] = [];
    const { state } = playDays(world, createState(world, { seed: 3 }), scriptedSeats(SCRIPT), 240, {
      telemetry,
      onDay: (r) => sizes.push(Math.max(...seatIds(r.state).map((seat) => reportsForView(knowledgeOf(r.state, seat)).length))),
    });
    const delivered = telemetry.mechanics['messages.delivered']!.fires;
    // Lane 1.4: the battle model wounds one commander here and his post falls vacant, so fewer dispatches go (900 in 240 days).
    expect(delivered).toBeGreaterThan(800);
    // No growth: the second half never holds more than the second quarter did.
    expect(Math.max(...sizes.slice(120))).toBeLessThanOrEqual(Math.max(...sizes.slice(60, 120)));
    expect(Math.max(...sizes)).toBeLessThan(60);
    expect(telemetry.mechanics['knowledge.pruned_superseded']!.fires).toBeGreaterThan(0);
    expect(telemetry.mechanics['knowledge.pruned_age']!.fires).toBeGreaterThan(0);
    // Truth is kept only for reports some seat still holds.
    const held = new Set(seatIds(state).flatMap((seat) => reportsForView(knowledgeOf(state, seat)).map((r) => r.id)));
    expect(Object.keys(state.reportTruth).sort()).toEqual([...held].sort());
  });
});

describe('the view (decision 0035: stable references; FOUNDATION section 8: no truth)', () => {
  it('returns the same objects for unchanged data, and new ones only where something changed', () => {
    const { world, state } = game(12);
    const cache = createViewCache();
    const v1 = viewFor(world, state, lead, cache);
    expect(viewFor(world, state, lead, cache)).toBe(v1);
    const next = tick(world, state, []).state;
    const v2 = viewFor(world, next, lead, cache);
    expect(v2).not.toBe(v1);
    // Reports carried over from yesterday are the very same objects.
    const carried = v2.reports.filter((r) => v1.reports.some((o) => o.id === r.id));
    expect(carried.length).toBeGreaterThan(0);
    for (const r of carried) expect(r).toBe(v1.reports.find((o) => o.id === r.id));
    // A seat whose knowledge did not change keeps its whole list and its beliefs.
    const idle = seatIdFor(P('b_min'));
    const before = viewFor(world, state, idle, cache);
    const after = viewFor(world, next, idle, cache);
    if (state.knowledgeBySeat[idle] === next.knowledgeBySeat[idle]) {
      expect(after.reports).toBe(before.reports);
      expect(after.enemyBeliefs).toBe(before.enemyBeliefs);
    }
    expect(Object.isFrozen(v2) && Object.isFrozen(v2.reports) && Object.isFrozen(v2.reports[0])).toBe(true);
  });

  it('rebuilds a cached belief when the readerÃ¢â‚¬â„¢s perception changes, though his knowledge did not (review F4, positive control)', () => {
    const timid = indexedFixture();
    const steadier = indexedFixture({ persons: { a_gen: { boldness: 'average', values: ['duty'] } } });
    const state = playDays(timid, createState(timid, { seed: 4 }), scriptedSeats(), 3).state;
    const gen = seatIdFor(P('a_gen'));
    const bf = R('b_front');
    const cache = createViewCache();
    const before = viewFor(timid, state, gen, cache).enemyBeliefs;
    const after = viewFor(steadier, state, gen, cache).enemyBeliefs;
    const fresh = viewFor(steadier, state, gen).enemyBeliefs;
    // 800 seen, overstated by the timid, cautious chief (2400 permille) and again by the timid, cautious general (2400).
    expect(before[bf]!.value).toBe(4608);
    expect(after[bf]!.value).toBe(fresh[bf]!.value);
    // Boldness is drawn State, so the steadier World changes only his values: without caution he sees 1900 permille, not 2400.
    expect(after[bf]!.value).toBe(3648);
    // Unchanged perception and knowledge: still the very same object.
    expect(viewFor(steadier, state, gen, cache).enemyBeliefs).toBe(after);
  });

  it('never shows a truth term, a trait or a message in transit', () => {
    const { world, state } = game(30);
    for (const seat of Object.keys(state.seatAssignments) as (keyof State['seatAssignments'])[]) {
      const json = JSON.stringify(viewFor(world, state, seat));
      for (const hidden of ['truth', 'termKind', 'intelligenceBias', 'boldness', 'perception', 'msgPending', 'msgArriveDay']) expect(json, `${seat}: ${hidden}`).not.toContain(hidden);
    }
  });

  it('reading views and beliefs never changes what happens (no draw, no write)', () => {
    const world = indexedFixture({ posts: { a_reserve: { strength: 2000 } } });
    const start = createState(world, { seed: 99 });
    const plain = playDays(world, start, scriptedSeats(SCRIPT), 50).hashes;
    let state = start;
    const hashes: string[] = [];
    const seats = scriptedSeats(SCRIPT);
    for (let d = 0; d < 50; d++) {
      for (const s of Object.keys(state.seatAssignments)) viewFor(world, state, s as never);
      const entries = pendingRequests(world, state).flatMap((r) => answerEntries(r, seats(r.requestSeat)));
      state = tick(world, state, entries).state;
      hashes.push(canonicalHash(state));
    }
    expect(hashes).toEqual(plain.map((h) => h.hash));
  });
});

describe('separate streams (0041): one messageÃ¢â‚¬â„¢s weather never shifts anotherÃ¢â‚¬â„¢s', () => {
  it('an extra report leaves every other messageÃ¢â‚¬â„¢s arrival unchanged', () => {
    const world = indexedFixture();
    const base = createState(world, { seed: 7 });
    const a = playDays(world, base, scriptedSeats({ a: { 1: [order('a_army', 'hold', null, 'courier', true)] } }), 12, { freeze: true });
    const b = playDays(world, base, scriptedSeats({ a: { 1: [order('a_army', 'hold', null, 'courier', true), order('a_reserve', 'hold', null, 'courier', true)] } }), 12, { freeze: true });
    const arrivals = (s: State) => new Map(s.messagesInTransit.map((m) => [m.id, m.msgArriveDay]));
    const inA = arrivals(a.state);
    const inB = arrivals(b.state);
    let shared = 0;
    for (const [id, arrive] of inA) {
      if (!inB.has(id)) continue;
      shared++;
      expect(inB.get(id), id).toBe(arrive);
    }
    expect(shared).toBeGreaterThan(0);
  });
});

describe('the deep-freeze backstop (0044Ã¢â‚¬â„¢s candidate)', () => {
  it('a whole game runs with State frozen after every phase', () => {
    expect(() => game(90, { freeze: true })).not.toThrow();
  });

  it('turns an in-place write through an alias into a TypeError (positive control: unfrozen, it slips through)', () => {
    const world = indexedFixture();
    const frozen = tick(world, createState(world, { seed: 1 }), [], { freeze: true }).state;
    const alias = frozen.messagesInTransit as unknown as unknown[];
    expect(() => alias.push({})).toThrow(TypeError);
    const goals = frozen.planRecords as unknown as Record<string, unknown>;
    expect(() => {
      goals.a_army = null;
    }).toThrow(TypeError);
    const loose = tick(world, createState(world, { seed: 1 }), []).state;
    (loose.messagesInTransit as unknown as unknown[]).push({});
    expect(loose.messagesInTransit.length).toBeGreaterThan(0);
    expect(Object.isFrozen(deepFreeze({ a: { b: [1] } }).a.b)).toBe(true);
  });
});

describe('review nits, each with a positive control', () => {
  it('N1: an order may take only a route the menu offers', () => {
    const world = indexedFixture();
    const start = createState(world, { seed: 1 });
    const r = tick(world, start, [
      { day: 1, seat: lead, command: order('a_army', 'hold', null, 'in-person') },
      { day: 1, seat: lead, command: order('a_army', 'hold', null, 'mail') },
      { day: 1, seat: lead, command: order('a_army', 'hold', null, 'courier') },
    ]);
    expect(r.rejections.map((x) => [x.entry, x.reason])).toEqual([
      [0, 'route_unavailable'],
      [1, 'route_unavailable'],
    ]);
    const offered = principalMenu(world, start, F('a'), morningGround(world, start, 1)).commandable.flatMap((c) => c.routes.map((x) => x.route));
    expect([...new Set(offered)].sort()).toEqual([...ORDER_ROUTES].sort());
  });

  it('N2: deepFreeze walks into a shallow-frozen record and freezes its mutable child', () => {
    const value = deepFreeze({ a: Object.freeze({ inner: [1] }) });
    expect(Object.isFrozen(value.a.inner)).toBe(true);
    expect(() => (value.a.inner as number[]).push(2)).toThrow(TypeError);
    // A ledger skips only what it froze all the way down.
    const ledger = createFreezeLedger();
    const shared = { list: [1] };
    deepFreeze({ shared }, ledger);
    expect(ledger.has(shared.list)).toBe(true);
  });

  it('N3: a shortened message id keeps 64 bits of hash, so same-day keys do not collide', () => {
    const long = P(`p${'x'.repeat(100)}`);
    const mint = createIdMint(createState(indexedFixture(), { seed: 1 }));
    const a = mintMessageId(mint, 3, long, long, 'order.a');
    const b = mintMessageId(mint, 3, long, long, 'order.b');
    expect(a).toMatch(/^m\.3\.[0-9a-f]{16}$/);
    expect(b).toMatch(/^m\.3\.[0-9a-f]{16}$/);
    expect(a).not.toBe(b);
  });

  it('N4: a template cannot keep reports past a campaign', () => {
    const typo = { ...FIXTURE_TEMPLATES[0]!, maxAgeDays: 100_000 };
    const withFirst = (x: (typeof FIXTURE_TEMPLATES)[number]) => [x, ...FIXTURE_TEMPLATES.slice(1)];
    expect(templateProblems(withFirst(typo))).toEqual([`template wire-dispatch: maxAgeDays must be at most ${MAX_REPORT_AGE_DAYS}, or knowledge would never fade`]);
    expect(templateProblems(withFirst({ ...typo, maxAgeDays: 20, keepSupersededDays: 30 }))).toEqual(['template wire-dispatch: keepSupersededDays must not exceed maxAgeDays']);
    expect(templateProblems(FIXTURE_TEMPLATES)).toEqual([]);
  });

  it('a pack states a template for every report type and subtype, and none for a kind the kernel does not write (0072)', () => {
    const withFirstRoute = (route: string) => [{ ...FIXTURE_TEMPLATES[0]!, templateRoute: route as RouteKind }, ...FIXTURE_TEMPLATES.slice(1)];
    expect(REPORT_KINDS).toHaveLength(FIXTURE_TEMPLATES.length);
    expect(templateProblems(FIXTURE_TEMPLATES.slice(1))).toEqual(['report wire-dispatch has no template: the pack states one for every report type and subtype']);
    expect(templateProblems([...FIXTURE_TEMPLATES, { ...FIXTURE_TEMPLATES[0]!, templateSubtype: 'gossip' }])).toEqual(['template wire-dispatch/gossip is for no report type and subtype the kernel writes']);
    expect(templateProblems(withFirstRoute('semaphore'))).toEqual(['template wire-dispatch: route semaphore is not a route']);
    // The kernel reads the pack's table, never a default: a World whose table lacks one is refused at indexing.
    const world = indexedFixture();
    const lacking = { ...world.map, world: { ...world.map.world, rules: { ...world.map.world.rules, reportTemplates: FIXTURE_TEMPLATES.slice(1) } } };
    expect(() => indexSeatsWorld(lacking, world.start)).toThrow('report wire-dispatch has no template');
    expect(() => indexSeatsWorld(world.map, world.start)).not.toThrow();
  });
});

describe('reports are typed (0032, 0040)', () => {
  const body = (over: Partial<ReportBody>): ReportBody => ({
    reportType: 'informal',
    reportSubtype: 'caller',
    reportAuthor: P('a_sec'),
    reportAuthorPost: null,
    reportSubjectKind: 'region',
    reportSubjectId: 'a_cap',
    reportClaims: [],
    reportDay: 1,
    reportHour: null,
    reportAdvice: null,
    reportAnswers: null,
    ...over,
  });

  it('splits the informal route into sub-types, each with its own template', () => {
    expect(INFORMAL_SUBTYPES.length).toBeGreaterThanOrEqual(4);
    for (const s of INFORMAL_SUBTYPES) expect(templateFor(FIXTURE_TEMPLATES, 'informal', s).templateSubtype).toBe(s);
    expect(reportProblems(body({}))).toEqual([]);
    expect(reportProblems(body({ reportSubtype: null }))[0]).toContain('informal report needs a subtype');
    expect(reportProblems(body({ reportSubtype: 'gossip' }))[0]).toContain('informal report needs a subtype');
  });

  it('gives advice a recommendation, reasons and a confidence, and a memorandum subtype', () => {
    const advice = { adviceRecommends: 'refuse', adviceReasons: [{ reasonKind: 'precedent', reasonWeight: 600 }], adviceConfidence: 700 };
    expect(reportProblems(body({ reportType: 'advice', reportSubtype: 'memorandum', reportAdvice: advice }))).toEqual([]);
    expect(reportProblems(body({ reportType: 'advice', reportSubtype: 'memorandum', reportAdvice: null }))).toEqual(['advice needs a recommendation, reasons and a confidence']);
    expect(reportProblems(body({ reportType: 'press', reportSubtype: null, reportAdvice: advice }))).toEqual(['only advice carries an advice body']);
    expect(reportProblems(body({ reportType: 'press', reportSubtype: null, reportHour: 30 }))).toEqual(['hour must be 0..23']);
  });
});

describe('ownership of the new State (0044)', () => {
  it('registers every root field with one writer, and the stand-ins are labelled', () => {
    const roots = OWNED_FIELDS.flatMap((f) => f.code.filter((c) => c.record === 'State').map((c) => `${c.key}:${f.writer}`)).sort();
    expect(roots).toEqual([
      'audienceHeld:audience',
      'battleRecords:combat',
      'blocSupport:politics',
      'chamberStates:politics',
      'closedGovernments:command',
      'congressLedger:politics',
      'departmentFactions:command',
      'factionCapitals:command',
      'forceAssignments:command',
      'forceBlockStates:forces',
      'forceJoins:movement',
      'forceLocations:movement',
      'forceRaisedIdentities:forces',
      'infraDepotCondition:infrastructure',
      'infraEdgeCondition:infrastructure',
      'infraObstructions:infrastructure',
      'knowledgeBySeat:knowledge',
      'messagesInTransit:messages',
      'observerPostings:command',
      'openingControlClaims:knowledge',
      'openingControlReports:knowledge',
      'operationRecords:operations',
      'orderResponses:proxy',
      'personGrievances:people',
      'personInquiries:people',
      'personPromises:people',
      'personRanks:people',
      'personRegard:people',
      'personRivals:ladder',
      'personRungs:ladder',
      'personService:people',
      'personStances:people',
      'personStanding:people',
      'personStatus:people',
      'personTraits:people',
      'personTrue:people',
      'planRecords:plans',
      'postLevies:command',
      'postStates:command',
      'regionControl:control',
      'regionFortification:regions',
      'regionGovernments:command',
      'regionLoyalty:regions',
      'regionReachedUnionLines:regions',
      'reportTruth:knowledge',
      'seatAssignments:seats',
      'seatAttention:seats',
      'seatInitiatives:seats',
      'situationFlags:situations',
      'situationStates:situations',
      'stateDay:tick',
      'warFraming:politics',
    ]);
    expect(IMMUTABLE_ROOT_FIELDS).toContain('gameSeed');
    expect(IMMUTABLE_ROOT_FIELDS).toContain('calendarStart');
  });

  it('declares every seats mechanic once, and a reference game fires most of them', () => {
    expect(new Set(SEATS_MECHANICS).size).toBe(SEATS_MECHANICS.length);
    const world = indexedFixture(REFERENCE);
    const telemetry = createTelemetry([...SEATS_MECHANICS, ...MAP_MECHANICS]);
    playDays(world, createState(world, { seed: 99 }), scriptedSeats(SCRIPT), 60, { telemetry });
    // Lane 1.7: recruitment and the regions term have their own tests (`men-regions.test.ts`); this game makes no call and its fixture no census.
    const plan = (m: string) => m.startsWith('plans.') || m.startsWith('planner.') || m.startsWith('recruitment.') || m.startsWith('regions.');
    const dead = SEATS_MECHANICS.filter((m) => !plan(m) && telemetry.mechanics[m]!.fires === 0);
    // Each of these has its own test above. Rejections need a bad command and defaults an
    // unanswered request, which this game has not; a conflict needs two issuers (here only the
    // principal orders); and a filter cuts only a losses claim, which no cyclic report carries
    // until lane 0.5's casualty returns. Here the one relaying man (a_sec, uncandid) holds what he dislikes rather than
    // objecting (lane 1.1: an objection needs a candid man), so objections are driven in seats-orders.test.ts.
    // Lane 1.5: the scripted seats send no people verbs and never run out of attention; promises, rivals and initiatives
    // need verbs or a rung this game does not reach. Each has its own kernel test (people-verbs.test.ts).
    // Lane 1.4: no plan here asks another holder for support, and nothing is old enough to prune in 60 days; both have their own tests.
    // A scripted order meets a post the battle model left vacant; lane 1.12 (0052) accepts it, since the principal has not been told, and it comes back as a returned dispatch, so `commands.rejected` is dead here and `orders.returned` live;
    // no state's ground sees a battle (no governor's wire) and no headquarters is cut off (no pocket report).
    expect([...dead].sort()).toEqual(['combat.bombardment', 'combat.evacuated', 'commands.rejected', 'ladder.rival', 'movement.join_blocked', 'movement.joined', 'operations.landed', 'operations.support_answered', 'operations.support_refused', 'operations.support_sent', 'orders.conflict', 'orders.relay_objected', 'orders.responses_pruned', 'people.promise_broken', 'people.promise_kept', 'people.resigned', 'people.stayed', ...POLITICS_MECHANICS, 'reports.governor_wire', 'reports.observer_letter', 'reports.pocket', 'reports.trimmed', 'seats.attention_refused', 'seats.defaulted', 'seats.initiative', 'verbs.answered', 'verbs.audience', 'verbs.consulted', 'verbs.declined', 'verbs.in_washington']);
    // The plan cycle's mechanics have their own tests (`plans.test.ts`); this game goals, drafts and picks plans.
    const fired = SEATS_MECHANICS.filter((m) => plan(m) && telemetry.mechanics[m]!.fires > 0);
    expect(fired).toEqual(expect.arrayContaining(['planner.candidates', 'planner.searches', 'plans.chosen', 'plans.drafted', 'plans.goal_set']));
  });
});
