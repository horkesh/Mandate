import { describe, expect, it } from 'vitest';
import type { BattleRecord } from '../src/combat/records.ts';
import { toId, type SituationId } from '../src/ids.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import type { Command } from '../src/log/commands.ts';
import type { LogEntry } from '../src/log/log.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { applyPolitics, chambersOn, credibilityOf, mandateOf, type PoliticsChange } from '../src/politics/politics.ts';
import { battleResultFor, frontPage } from '../src/politics/press.ts';
import type { PoliticsRules } from '../src/politics/rules.ts';
import { politicsRulesProblems } from '../src/politics/rules.ts';
import { contextFor } from '../src/reading/orders.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld, type SeatsWorld } from '../src/seats/world.ts';
import { holds } from '../src/situations/conditions.ts';
import type { Condition } from '../src/situations/types.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { effectChange } from '../src/tick/politics.ts';
import { createState } from '../src/tick/setup.ts';
import { SITUATION_MECHANICS } from '../src/tick/situations.ts';
import { SEATS_MECHANICS, tick, type TickResult } from '../src/tick/tick.ts';
import { indexWorld } from '../src/world/index.ts';
import { person } from './support/forces-fixture.ts';
import { F, fixtureMap, fixtureStart, P, R } from './support/seats-fixture.ts';

/**
 * Lane 1.6: politics on the seats fixture (setting-free, 0003). Blocs at their rest, moved by an address, the weekly
 * drift and the press; the mandate and the principal's credibility derived with their terms; the legislature's chambers
 * by the calendar and a call; the accountability ledger taken while away, met when a chamber sits, and answered; the
 * front page as a report route.
 */
const POLITICS: PoliticsRules = {
  blocs: [
    { id: 'a_doves', faction: F('a'), voice: 400, rest: -200, values: ['caution'], victory: -40, defeat: 40, cite: 'FIXTURE' },
    { id: 'a_hawks', faction: F('a'), voice: 600, rest: 300, values: ['glory'], victory: 50, defeat: -50, cite: 'FIXTURE' },
    { id: 'b_all', faction: F('b'), voice: 1000, rest: 400, values: ['duty'], victory: 30, defeat: -30, cite: 'FIXTURE' },
  ],
  driftDivisor: 20,
  address: { support: 100, othersPenalty: -15 },
  ladder: { lobbyingPerRung: -15, publicDefiance: -20, rival: -10 },
  chambers: [{ id: 'a_house', faction: F('a'), name: 'chamber.a_house.name', cite: 'FIXTURE' }],
  sessions: [
    // Day 0 is 1900-06-01: the regular session sits days 4 to 9.
    { id: 'a_regular', chambers: ['a_house'], callable: false, opens: '1900-06-05', closes: '1900-06-10', afterCallDays: null, sitsDays: null, cite: 'FIXTURE' },
    { id: 'a_special', chambers: ['a_house'], callable: true, opens: null, closes: null, afterCallDays: 3, sitsDays: 4, cite: 'FIXTURE' },
  ],
  credibility: { base: 400, mandatePermille: 500, perRelief: 100, min: 100, max: 900 },
  framing: { mandatePermille: 500 },
  press: { cadenceDays: 7, papers: [{ id: 'a_paper', faction: F('a'), editor: P('a_editor'), region: R('a_cap'), reachPermille: 500, cite: 'FIXTURE' }], standing: { victory: 100, defeat: -100 } },
};

function politicsWorld(): SeatsWorld {
  const base = fixtureMap().world;
  const people = [...base.people.map((p) => (p.id === P('a_gen') ? { ...p, bloc: 'a_hawks' } : p)), person('a_editor', 'a', { boldness: 'average', candour: 'average', regard: 'above', values: ['order'] })];
  const blocs = POLITICS.blocs.map((b) => ({ id: b.id, name: `bloc.${b.id}` }));
  return indexSeatsWorld(indexWorld({ ...base, people, vocabularies: { ...base.vocabularies, blocs }, rules: { ...base.rules, politics: POLITICS } }), fixtureStart());
}

const lead = seatIdFor(P('a_lead'));
const MECHANICS = [...SEATS_MECHANICS, ...MAP_MECHANICS, ...SITUATION_MECHANICS];

/** Tick `n` days with the principal's commands, counting every mechanic. */
function days(world: SeatsWorld, start: State, n: number, entries: Record<number, Command[]> = {}): { state: State; results: TickResult[]; fires: (m: string) => number } {
  let state = start;
  const results: TickResult[] = [];
  const telemetry = createTelemetry(MECHANICS);
  for (let i = 0; i < n; i++) {
    const day = state.stateDay + 1;
    const r = tick(world, state, (entries[day] ?? []).map((command): LogEntry => ({ day, seat: lead, command })), { freeze: true, telemetry });
    results.push(r);
    state = r.state;
  }
  return { state, results, fires: (m) => telemetry.mechanics[m]?.fires ?? 0 };
}

const at = (state: State, day: number): Parameters<typeof holds>[1] => ({ state, day, situation: null, knowledge: knowledgeOf(state, lead), since: null });

/** A battle at a_front closed on `end`, which side b left: side a's commander a_gen won it. */
function battle(end: number): BattleRecord {
  const side = (faction: string, result: string, commander: string, killed: number, wounded: number, missing: number) => ({ bsideFaction: F(faction), bsideResult: result, bsideCommander: P(commander), bsideKilled: killed, bsideWounded: wounded, bsideMissing: missing });
  return {
    battleRegion: R('a_front'),
    battleStartDay: end - 1,
    battleEndDay: end,
    battleFactions: [F('a'), F('b')],
    battleCauses: [],
    battleDays: [{ bdayDay: end, bdaySides: [side('a', 'held', 'a_gen', 100, 300, 50), side('b', 'withdrew', 'b_gen', 200, 400, 100)] }],
  } as unknown as BattleRecord;
}

describe('blocs, the mandate and credibility (lane 1.6)', () => {
  it('starts every bloc at its rest, and derives the mandate and credibility with their terms', () => {
    const world = politicsWorld();
    const s = createState(world, { seed: 1 });
    expect(s.blocSupport).toEqual({ a_doves: -200, a_hawks: 300, b_all: 400 });
    expect(mandateOf(POLITICS, s, F('a'))).toEqual({
      value: 100,
      terms: [
        { polKind: 'bloc', polSubject: 'a_doves', polValue: -80 },
        { polKind: 'bloc', polSubject: 'a_hawks', polValue: 180 },
      ],
    });
    // Credibility: the base, half the mandate; no reliefs yet. Every order a man of side a reads carries it.
    expect(credibilityOf(POLITICS, s, F('a'), P('a_lead'))).toEqual({ value: 450, terms: [{ polKind: 'base', polSubject: null, polValue: 400 }, { polKind: 'mandate', polSubject: F('a'), polValue: 50 }] });
    expect(contextFor(world, s, P('a_gen')).leaderCredibility).toBe(450);
    // A man who holds a relief against the principal is the record that he does relieve (P7).
    const relieved = applyPeopleChanges(s, [{ change: 'grievance', person: P('a_bold'), kind: 'relieved', weight: 100, against: P('a_lead'), cause: null }], 0, world.rules.people, world.map.world.vocabularies.ranks);
    expect(credibilityOf(POLITICS, relieved, F('a'), P('a_lead')).value).toBe(550);
    expect(contextFor(world, relieved, P('a_gen')).leaderCredibility).toBe(550);
    // The framing term counts in the mandate at the pack's permille.
    const framed = applyPolitics(POLITICS, s, [{ change: 'framing', faction: F('a'), delta: 200, reason: 'test' }], 0).state;
    expect(mandateOf(POLITICS, framed, F('a')).value).toBe(200);
    expect(mandateOf(POLITICS, framed, F('a')).terms.at(-1)).toEqual({ polKind: 'framing', polSubject: F('a'), polValue: 100 });
  });

  it('moves the addressed bloc and costs the blocs sharing none of its values, then drifts weekly toward rest', () => {
    const world = politicsWorld();
    const run = days(world, createState(world, { seed: 1 }), 7, { 1: [{ cmd: 'address', bloc: 'a_hawks' }] });
    const after1 = run.results[0]!.state.blocSupport;
    expect([after1['a_hawks'], after1['a_doves'], after1['b_all']]).toEqual([400, -215, 400]);
    // Day 7, the people step's week: each bloc closes 1/20 of the gap to its rest.
    const week = world.map.world.rules.people.verbs.weekDays;
    expect(week).toBe(7);
    expect(run.state.blocSupport['a_hawks']).toBe(400 + Math.trunc((300 - 400) / 20));
    expect(run.state.blocSupport['a_doves']).toBe(-215 + Math.trunc((-200 - -215) / 20));
    expect(run.fires('politics.support')).toBeGreaterThan(0);
  });

  it('maps a situation effect to a change, refuses what it cannot be, and leaves the fields 1B builds', () => {
    const base = { proposal: 'effect' as const, owner: 'politics', subject: null as string | null, delta: 30, reason: 'r', side: F('a'), situation: toId('situation', 's') as SituationId, option: 'o', origin: 'decision' as const };
    expect(effectChange({ ...base, field: 'bloc-support', subject: 'a_hawks' })).toEqual({ change: 'support', bloc: 'a_hawks', delta: 30, reason: 'r' });
    expect(effectChange({ ...base, field: 'framing' })).toEqual({ change: 'framing', faction: F('a'), delta: 30, reason: 'r' });
    expect(effectChange({ ...base, field: 'ledger-act', subject: 'spring_acts' })).toEqual({ change: 'act', act: 'spring_acts', side: F('a'), situation: base.situation, option: 'o' });
    expect(effectChange({ ...base, field: 'ledger-answer' })).toEqual({ change: 'answer', act: null, side: F('a') });
    expect(effectChange({ ...base, field: 'session-call', subject: 'a_special' })).toEqual({ change: 'call', session: 'a_special' });
    expect(effectChange({ ...base, field: 'bloc-support' })).toBe('bloc-support names no bloc');
    expect(effectChange({ ...base, field: 'foreign-patience' })).toBeNull();
    expect(effectChange({ ...base, field: 'invented' })).toBe('politics has no field invented');
  });
});

describe('the legislature: chambers, calls and the ledger (0040, 0046)', () => {
  it('sits and adjourns by the calendar', () => {
    const world = politicsWorld();
    const run = days(world, createState(world, { seed: 1 }), 11);
    const state = (d: number) => run.results[d - 1]!.state.chamberStates['a_house']!.chamState;
    expect([state(3), state(4), state(9), state(10)]).toEqual(['adjourned', 'sitting', 'sitting', 'adjourned']);
    expect([run.fires('politics.opened'), run.fires('politics.adjourned')]).toEqual([1, 1]);
  });

  it('calls a special session, which sits after its notice for its days, and refuses a call while one stands', () => {
    const s = createState(politicsWorld(), { seed: 1 });
    const called = applyPolitics(POLITICS, s, [{ change: 'call', session: 'a_special' }], 12);
    expect(called.state.chamberStates['a_house']).toEqual({ chamState: 'called', chamSession: 'a_special', chamOpens: 15, chamCloses: 18, chamCalled: true, chamSince: 12 });
    expect(chambersOn(POLITICS, s.calendarStart, called.state.chamberStates, 15)['a_house']!.chamState).toBe('sitting');
    expect(chambersOn(POLITICS, s.calendarStart, called.state.chamberStates, 19)['a_house']!.chamState).toBe('adjourned');
    const again = applyPolitics(POLITICS, called.state, [{ change: 'call', session: 'a_special' }], 13);
    expect(again.events.map((e) => [e.polEvent, e.polWhy])).toEqual([['refused', 'a chamber already sits or is called']]);
    expect(applyPolitics(POLITICS, s, [{ change: 'call', session: 'a_regular' }], 12).events[0]!.polEvent).toBe('refused');
  });

  it('enters an act taken while away, meets it when a chamber sits, and answers it; the conditions read each status', () => {
    const s = createState(politicsWorld(), { seed: 1 });
    const act: PoliticsChange = { change: 'act', act: 'spring_acts', side: F('a'), situation: null, option: null };
    const status = (state: State, day: number, st: 'away' | 'before' | 'answered') => holds({ ledger: { side: F('a'), act: 'spring_acts', status: st } } as Condition, at(state, day));
    const taken = applyPolitics(POLITICS, s, [act], 1).state;
    expect([status(taken, 1, 'away'), status(taken, 1, 'before')]).toEqual([true, false]);
    expect(holds({ chamber: { id: 'a_house', state: 'adjourned' } }, at(taken, 1))).toBe(true);
    // Day 4: the regular session opens, and the act is before it.
    const met = applyPolitics(POLITICS, taken, [], 4);
    expect(met.events.map((e) => e.polEvent)).toEqual(['opened', 'met']);
    expect(met.state.congressLedger[0]!.ledgerMetDay).toBe(4);
    expect([status(met.state, 4, 'away'), status(met.state, 4, 'before')]).toEqual([false, true]);
    expect(holds({ chamber: { id: 'a_house', state: 'sitting' } }, at(met.state, 4))).toBe(true);
    // An answer (S20's ratification) closes it; with nothing before the legislature, an answer is refused.
    const answered = applyPolitics(POLITICS, met.state, [{ change: 'answer', act: null, side: F('a') }], 5);
    expect(answered.state.congressLedger[0]!.ledgerAnsweredDay).toBe(5);
    expect(status(answered.state, 5, 'answered')).toBe(true);
    expect(applyPolitics(POLITICS, answered.state, [{ change: 'answer', act: null, side: F('a') }], 6).events.map((e) => e.polEvent)).toEqual(['refused']);
    // An act taken while a chamber sits is before it at once.
    expect(applyPolitics(POLITICS, met.state, [{ ...act, act: 'loan' } as PoliticsChange], 5).state.congressLedger[1]!.ledgerMetDay).toBe(5);
  });
});

describe('the press as a report route (FOUNDATION section 7)', () => {
  it('reads a closed battle as won, lost or drawn by who left the field', () => {
    const b = battle(5);
    expect([battleResultFor(b, F('a')), battleResultFor(b, F('b'))]).toEqual(['won', 'lost']);
    const drawn = { ...b, battleDays: [{ ...b.battleDays[0]!, bdaySides: b.battleDays[0]!.bdaySides.map((x) => ({ ...x, bsideResult: 'held' })) }] } as unknown as BattleRecord;
    expect(battleResultFor(drawn, F('a'))).toBe('drawn');
  });

  it('prints the week’s battles, moves the blocs and the commander’s standing at its reach, and reaches the readers', () => {
    const world = politicsWorld();
    const s0 = createState(world, { seed: 1 });
    const page = frontPage(POLITICS, { ...s0, battleRecords: { 'battle:a_front:4': battle(5) } }, POLITICS.press.papers[0]!, 7);
    expect(page.claims).toEqual([{ claimKind: 'battle-result', claimRegion: R('a_front'), claimValue: 450, claimToken: 'won', claimConfidence: 1000 }]);
    expect(page.politics).toEqual([
      { change: 'support', bloc: 'a_doves', delta: -20, reason: 'press:a_paper:won' },
      { change: 'support', bloc: 'a_hawks', delta: 25, reason: 'press:a_paper:won' },
    ]);
    expect(page.people).toEqual([{ change: 'standing', person: P('a_gen'), delta: 50 }]);
    // In the tick: day 7 is the press's day; the battle closed on day 5.
    const run = days(world, { ...s0, stateDay: 6, battleRecords: { 'battle:a_front:4': battle(5) } }, 3);
    const day7 = run.results[0]!.state;
    expect([day7.blocSupport['a_hawks'], day7.blocSupport['a_doves']]).toEqual([300 + 25, -200 - 20]);
    expect(day7.personStanding[P('a_gen')]).toBe((s0.personStanding[P('a_gen')] ?? 0) + 50);
    expect(run.fires('politics.front_page')).toBe(1);
    // The principal holds the front page, written by the editor, with the battle as his public hears it.
    const held = knowledgeOf(run.state, lead).knownReports.filter((r) => r.knownBody.reportType === 'press');
    expect(held.map((r) => [r.knownBody.reportAuthor, r.knownBody.reportClaims.map((c) => c.claimToken)])).toEqual([[P('a_editor'), ['won']]]);
    // Each serving holder of a side-a post reads it too; side b's do not.
    const readers = run.state.messagesInTransit.length + Object.keys(run.state.knowledgeBySeat).filter((seat) => (run.state.knowledgeBySeat[seat as keyof State['knowledgeBySeat']]?.knownReports ?? []).some((r) => r.knownBody.reportType === 'press')).length;
    expect(readers).toBeGreaterThanOrEqual(2);
    expect((knowledgeOf(run.state, seatIdFor(P('b_lead'))).knownReports ?? []).some((r) => r.knownBody.reportType === 'press')).toBe(false);
  });
});

describe('a silent press', () => {
  it('a paper whose editor no longer serves prints nothing, and moves nothing', () => {
    const world = politicsWorld();
    const s0 = createState(world, { seed: 1 });
    const gone = applyPeopleChanges({ ...s0, stateDay: 6, battleRecords: { 'battle:a_front:4': battle(5) } }, [{ change: 'status', person: P('a_editor'), status: 'killed' }], 6, world.rules.people, world.map.world.vocabularies.ranks);
    const run = days(world, gone, 1);
    expect([run.fires('politics.press_silent'), run.fires('politics.front_page')]).toEqual([1, 0]);
    expect(run.state.blocSupport['a_hawks']).toBe(300);
  });
});

describe('the politics rules (pack rules, 0072)', () => {
  it('refuses unknown blocs, voices that do not sum to 1000, incomplete sessions and an editor of the other side', () => {
    const world = politicsWorld().map.world;
    expect(politicsRulesProblems(world)).toEqual([]);
    const bad = {
      ...world,
      rules: {
        ...world.rules,
        politics: {
          ...POLITICS,
          blocs: [...POLITICS.blocs.slice(1), { ...POLITICS.blocs[0]!, id: 'nobody', voice: 300 }],
          sessions: [{ ...POLITICS.sessions[1]!, sitsDays: null }],
          press: { ...POLITICS.press, papers: [{ ...POLITICS.press.papers[0]!, editor: P('b_gen') }] },
        },
      },
    };
    expect(politicsRulesProblems(bad)).toEqual([
      'politics bloc nobody is not in the bloc vocabulary',
      "politics: faction a's blocs' voices sum to 900, not 1000",
      'politics session a_special: a callable session states exactly one of closes and sitsDays',
      'politics paper a_paper: editor b_gen is not of its side a',
    ]);
  });
});
