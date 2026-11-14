import { describe, expect, it } from 'vitest';
import { toId, type SituationId } from '../src/ids.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import type { LogEntry } from '../src/log/log.ts';
import { playDays, replay } from '../src/log/session.ts';
import type { State } from '../src/root-state.ts';
import { pendingRequests } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import type { OptionDef, SituationDef } from '../src/situations/types.ts';
import { indexWorld, type CommsWorld } from '../src/standin/world.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, type TickResult } from '../src/tick/tick.ts';
import { viewFor } from '../src/view/view.ts';
import { commsFixture, F, P, POST, R } from './support/comms-fixture.ts';
import { scriptedSeats } from './support/test-seats.ts';

const S = (id: string): SituationId => toId('situation', id);
const lead = seatIdFor(P('a_lead'));

function option(id: string, displayKey: number, over: Partial<OptionDef> = {}): OptionDef {
  return {
    id,
    label: `situation.x.option.${id}`,
    displayKey,
    proposedBy: [P('a_sec')],
    group: null,
    appearsWhen: null,
    expiresWhen: null,
    waitsOn: null,
    effects: [],
    lockedCosts: [],
    orders: [],
    honours: [],
    watched: false,
    gate: null,
    ...over,
  };
}

function decision(id: string, over: Partial<SituationDef> = {}): SituationDef {
  const first = (over.options ?? [option('hold', 1)])[0]!.id;
  const base: SituationDef = {
    id: S(id),
    kind: 'decision',
    faction: F('a'),
    title: `situation.${id}.title`,
    text: `situation.${id}.text`,
    earliest: '1861-04-01',
    event: { dayAtLeast: 1 },
    knowledge: null,
    railroad: 'test fixture',
    chain: null,
    subjects: [],
    options: [option('hold', 1), option('press', 2)],
    inaction: { text: `situation.${id}.inaction`, effects: [{ setFlag: `${id}_ignored` }] },
    historicalDefault: { options: ['hold'] },
    staffLine: { authors: [POST('a_office')], recommends: ['press'], reasons: [{ kind: 'momentum', weight: 600 }], confidence: 700 },
    delegableTo: [POST('a_office')],
    resurfaceOn: [],
    effects: [],
    report: null,
    gate: { none: 'test fixture' },
    gateReview: null,
    citations: [],
  };
  // Default the staff line and the historical default to the first option, unless the test says otherwise.
  return { ...base, staffLine: { ...base.staffLine!, recommends: [first] }, historicalDefault: { options: [first] }, ...over };
}

function setup(situations: SituationDef[], drivers: Record<string, 'human' | 'rules'> = { a_lead: 'human' }) {
  const comms: CommsWorld = { ...commsFixture(), situations };
  const world = indexWorld(comms);
  return { world, state: createState(world, { seed: 3, drivers }) };
}

/** Tick day by day with the given entries per day (by day number). */
function days(world: ReturnType<typeof indexWorld>, start: State, n: number, entries: Record<number, LogEntry['command'][]> = {}, seat = lead) {
  let state = start;
  const results: TickResult[] = [];
  for (let i = 0; i < n; i++) {
    const day = state.stateDay + 1;
    const r = tick(world, state, (entries[day] ?? []).map((command) => ({ day, seat, command })), { freeze: true });
    results.push(r);
    state = r.state;
  }
  return { state, results, points: results.flatMap((r) => r.decisionPoints.map((p) => `${p.point}:${p.situation ?? ''}`)) };
}

describe('situations fire on their causes and surface on what the seat knows (0046)', () => {
  it('fires on its event, waits for news to reach the principal, then writes the staff line', () => {
    const sit = decision('news', {
      event: { decided: S('trigger'), options: null },
      railroad: null,
      knowledge: { knows: { reportType: 'wire-dispatch', subtype: null, subjectKind: 'post', subjectId: 'a_army', claimKind: 'goal-status', token: null } },
    });
    const trigger = decision('trigger', { historicalDefault: { options: ['hold'] } });
    const { world, state } = setup([sit, trigger], { a_lead: 'rules' });
    const run = days(world, state, 6);
    const rec = run.state.situationStates[S('news')]!;
    // Situations are evaluated in id order: the trigger is decided on day 1, after this one was looked at.
    expect(rec.sitFiredDay).toBe(2);
    // The army's first dispatch is written on day 1 and rides two days to the wire: the president hears on day 3 or later.
    expect(rec.sitSurfacedDay).toBeGreaterThan(rec.sitFiredDay);
    expect(rec.sitStaffAuthor).toBe(P('a_sec'));
    const advice = knowledgeOf(run.state, lead).knownReports.find((r) => r.knownBody.reportSubjectId === 'news')!;
    expect(advice.knownBody.reportType).toBe('advice');
    expect(advice.knownBody.reportSubtype).toBe('requested');
    expect(advice.knownBody.reportAdvice).toEqual({ adviceRecommends: 'hold', adviceReasons: [{ reasonKind: 'momentum', reasonWeight: 600 }], adviceConfidence: 700 });
    expect(run.points).toContain('situation-surfaced:news');
  });

  it('surfaces only on news received since the event, never on a report the seat already held (review S1)', () => {
    const pattern = { reportType: 'wire-dispatch', subtype: null, subjectKind: 'post', subjectId: 'a_army', claimKind: 'goal-status', token: null } as const;
    // The army's first dispatch reaches the president on day 20; the event comes on day 21.
    const sit = decision('late', { event: { dayAtLeast: 21 }, knowledge: { knows: pattern } });
    const { world, state } = setup([sit]);
    const run = days(world, state, 45);
    const rec = run.state.situationStates[S('late')]!;
    expect(rec.sitFiredDay).toBe(21);
    // Knowledge is pruned as reports are superseded, so read it on the days that matter.
    const held = (day: number) =>
      knowledgeOf(run.results[day - 1]!.state, lead).knownReports.filter((r) => r.knownBody.reportType === 'wire-dispatch' && r.knownBody.reportSubjectId === 'a_army' && r.knownBody.reportClaims.some((c) => c.claimKind === 'goal-status'));
    // The control: on the event's day the president already held a matching dispatch, received before it.
    expect(held(21).some((r) => r.knownReceivedDay < 21)).toBe(true);
    // He is asked only once a dispatch received since the event reaches him.
    expect(rec.sitSurfacedDay).toBeGreaterThan(21);
    expect(held(rec.sitSurfacedDay!).some((r) => r.knownReceivedDay === rec.sitSurfacedDay)).toBe(true);
    expect(held(rec.sitSurfacedDay! - 1).every((r) => r.knownReceivedDay < 21)).toBe(true);
  });
  it('passes the staff line to the next author when the first is a subject, and records none when no author is available', () => {
    const fallsThrough = decision('subject', { subjects: [P('a_sec')], staffLine: { authors: [POST('a_office'), POST('a_filter')], recommends: ['hold'], reasons: [], confidence: 500 } });
    const nobody = decision('nobody', { subjects: [P('a_sec')], staffLine: { authors: [POST('a_office')], recommends: ['hold'], reasons: [], confidence: 500 } });
    const { world, state } = setup([fallsThrough, nobody]);
    const run = days(world, state, 1);
    expect(run.state.situationStates[S('subject')]!.sitStaffAuthor).toBe(P('a_clerk'));
    expect(run.state.situationStates[S('nobody')]!.sitStaffAuthor).toBeNull();
  });
});

describe('live situations (0040): options expire and appear, clocks resurface, a lapse resolves to inaction', () => {
  it('expires an option, resurfaces on its clock, and lapses to the inaction outcome', () => {
    const sit = decision('clock', {
      options: [option('early', 1, { expiresWhen: { clockAtLeast: 2 } }), option('late', 2, { appearsWhen: { clockAtLeast: 1 }, expiresWhen: { clockAtLeast: 4 } })],
      historicalDefault: { unsourced: 'test' },
      resurfaceOn: [3],
    });
    const { world, state } = setup([sit]);
    const run = days(world, state, 7);
    const rec = run.state.situationStates[S('clock')]!;
    expect(rec.sitStatus).toBe('lapsed');
    expect(rec.sitDecidedBy).toBe('lapse');
    expect(run.state.situationFlags.clock_ignored).toBeDefined();
    expect(run.points).toEqual(['situation-surfaced:clock', 'situation-options:clock', 'situation-options:clock', 'situation-resurfaced:clock', 'situation-lapsed:clock']);
  });
});

describe('deciding: the principal, a history default, several options, waiting, chains', () => {
  it('a rule-driven principal takes the historical default; a human one is asked and decides by command', () => {
    const { world: rw, state: rs } = setup([decision('d')], { a_lead: 'rules' });
    const ruled = days(rw, rs, 2).state.situationStates[S('d')]!;
    expect([ruled.sitChosen, ruled.sitDecidedBy]).toEqual([['hold'], 'history-default']);
    const { world, state } = setup([decision('d')]);
    const asked = days(world, state, 3, { 2: [{ cmd: 'decide', situation: S('d'), options: ['press'] }] });
    expect(asked.state.situationStates[S('d')]!.sitChosen).toEqual(['press']);
    expect(asked.state.situationStates[S('d')]!.sitDecidedBy).toBe('principal');
  });

  it('refuses a decision on a closed situation, from the wrong seat, or with a bad selection', () => {
    const grouped = decision('g', { options: [option('a', 1, { group: 'x' }), option('b', 2, { group: 'y' }), option('c', 3), option('d', 4)] });
    const { world, state } = setup([grouped]);
    const morning = days(world, state, 1).state;
    const sec = seatIdFor(P('a_sec'));
    const r = tick(world, morning, [
      { day: 2, seat: sec, command: { cmd: 'decide', situation: S('g'), options: ['a'] } },
      { day: 2, seat: lead, command: { cmd: 'decide', situation: S('nowhere'), options: [] } },
      { day: 2, seat: lead, command: { cmd: 'decide', situation: S('g'), options: ['c', 'd'] } },
      { day: 2, seat: lead, command: { cmd: 'decide', situation: S('g'), options: ['zz'] } },
      { day: 2, seat: lead, command: { cmd: 'decide', situation: S('g'), options: ['a', 'b'] } },
      { day: 2, seat: lead, command: { cmd: 'decide', situation: S('g'), options: ['a'] } },
    ]);
    expect(r.rejections.map((x) => x.reason)).toEqual(['not_the_decider', 'situation_not_open', 'bad_selection', 'not_an_option', 'situation_not_open']);
    // Two options in different groups are taken together (catalogue P3).
    expect(r.state.situationStates[S('g')]!.sitChosen).toEqual(['a', 'b']);
  });

  it('a waiting option defers the decision until its condition holds, then reopens without it', () => {
    // A wait reads what the principal can know (standing review S2): here the clock.
    const sit = decision('wait', { options: [option('hold-until', 1, { waitsOn: { clockAtLeast: 3 } }), option('now', 2), option('never', 3)] });
    const { world, state } = setup([sit]);
    const run = days(world, state, 5, { 2: [{ cmd: 'decide', situation: S('wait'), options: ['hold-until'] }] });
    const rec = run.state.situationStates[S('wait')]!;
    expect(rec.sitStatus).toBe('open');
    expect(rec.sitOpenOptions).toEqual(['now', 'never']);
    expect(run.points).toContain('situation-resurfaced:wait');
  });

  it('the guard refuses a truth read, or the other side’s decision, where the principal must know (standing review S2)', () => {
    const theirs = decision('theirs', { faction: F('b'), staffLine: { authors: [POST('b_office')], recommends: ['hold'], reasons: [], confidence: 500 }, delegableTo: [] });
    const world = (over: Partial<SituationDef>) => () => setup([decision('mine', over), theirs]);
    expect(world({ knowledge: { flag: 'x' } })).toThrow(/knowledge: "flag" reads State/);
    expect(world({ options: [option('hold', 1, { waitsOn: { fired: S('theirs') } })] })).toThrow(/waitsOn: "fired" reads State/);
    expect(world({ options: [option('hold', 1, { appearsWhen: { not: { headquartersAt: { post: POST('a_army'), region: R('a_front') } } } })] })).toThrow(/appearsWhen: "headquartersAt" reads State/);
    expect(world({ options: [option('hold', 1, { expiresWhen: { decided: S('theirs'), options: null } })] })).toThrow(/another side's decision/);
    // The control: the event may read the truth, and the rest may read his own side's decisions, the clock and the date.
    expect(world({ event: { flag: 'x' }, knowledge: { all: [{ dayAtLeast: 2 }, { decided: S('mine'), options: null }] }, options: [option('hold', 1, { expiresWhen: { clockAtLeast: 3 } })] })).not.toThrow();
  });

  it('a chain stage fires only after the stage it follows was decided with a leading option', () => {
    const first = decision('first');
    const second = decision('second', { chain: { id: 'c', stage: 2, follows: { situation: S('first'), options: ['press'] } } });
    const run = (choice: string) => {
      const { world, state } = setup([first, second]);
      return days(world, state, 4, { 2: [{ cmd: 'decide', situation: S('first'), options: [choice] }] }).state.situationStates[S('second')];
    };
    expect(run('hold')).toBeUndefined();
    expect(run('press')?.sitFiredDay).toBe(2);
  });
});

describe('orders an option issues, and delegation (0052)', () => {
  it('issues an option’s orders in the principal’s name through the validated path, and reports a refused one', () => {
    const sit = decision('order', {
      options: [option('advance', 1, { orders: [{ to: POST('a_reserve'), goal: 'advance', region: R('b_mid'), route: 'special-messenger' }, { to: POST('b_army'), goal: 'hold', region: null, route: 'courier' }] }), option('hold', 2)],
      historicalDefault: { options: ['advance'] },
    });
    const { world, state } = setup([sit], { a_lead: 'rules' });
    const run = days(world, state, 1);
    const orders = run.state.messagesInTransit.filter((m) => m.msgOrder !== null);
    expect(orders.map((m) => [m.msgOrder!.orderIssuer, m.msgOrder!.orderTarget, m.msgRoute])).toEqual([[P('a_lead'), POST('a_reserve'), 'special-messenger']]);
    // An option ordering the other side's army is refused like any order: entry -1 marks it as option-issued.
    expect(run.results[0]!.rejections).toEqual([{ day: 1, seat: lead, entry: -1, reason: 'not_field_post' }]);
  });

  it('hands the choice to a holder, who decides from the same options by his values; the orders stay the principal’s', () => {
    const sit = decision('handed', {
      options: [
        option('bold', 1, { honours: ['glory'], orders: [{ to: POST('a_reserve'), goal: 'advance', region: R('b_mid'), route: 'courier' }] }),
        option('careful', 2, { honours: ['caution'], orders: [{ to: POST('a_reserve'), goal: 'hold', region: null, route: 'courier' }] }),
      ],
      historicalDefault: { delegate: POST('a_office') },
    });
    const { world, state } = setup([sit], { a_lead: 'rules' });
    const first = playDays(world, state, scriptedSeats(), 1).state;
    expect(first.situationStates[S('handed')]!.sitDelegate).toBe(P('a_sec'));
    const requests = pendingRequests(world, first).filter((r) => r.menu.menuKind === 'delegated-situation');
    expect(requests.map((r) => r.requestSeat)).toEqual([seatIdFor(P('a_sec'))]);
    const menu = requests[0]!.menu;
    if (menu.menuKind !== 'delegated-situation') throw new Error('expected a delegated menu');
    // The same options as the principal's (gate B7), scored by the cautious secretary's values.
    expect(menu.choice.options.map((o) => [o.optionId, o.score])).toEqual([
      ['bold', 0],
      ['careful', 1000],
    ]);
    const after = playDays(world, first, scriptedSeats(), 1).state;
    expect(after.situationStates[S('handed')]!.sitChosen).toEqual(['careful']);
    expect(after.situationStates[S('handed')]!.sitDecidedBy).toBe('delegate');
    expect(after.messagesInTransit.filter((m) => m.msgOrder !== null).map((m) => m.msgOrder!.orderIssuer)).toEqual([P('a_lead')]);
  });

  it('lets the principal delegate by command, only to a listed post', () => {
    const { world, state } = setup([decision('d')]);
    const morning = days(world, state, 1).state;
    const r = tick(world, morning, [
      { day: 2, seat: lead, command: { cmd: 'delegate', situation: S('d'), to: POST('a_army') } },
      { day: 2, seat: lead, command: { cmd: 'delegate', situation: S('d'), to: POST('a_office') } },
    ]);
    expect(r.rejections.map((x) => x.reason)).toEqual(['not_delegable']);
    expect(r.state.situationStates[S('d')]!.sitDelegate).toBe(P('a_sec'));
  });
});

describe('notices, effects and proposals', () => {
  it('a notice applies its effects when it fires, sets chain flags and proposes the rest to their owners', () => {
    const notice: SituationDef = {
      ...decision('told'),
      kind: 'notice',
      options: [],
      inaction: null,
      historicalDefault: null,
      staffLine: null,
      delegableTo: [],
      report: { authors: [POST('a_office')], reportType: 'informal', subtype: 'cabinet-word' },
      effects: [{ setFlag: 'told' }, { propose: { owner: 'politics', field: 'bloc-support', subject: 'hawks', delta: -40, reason: 'news', side: F('a') } }],
    };
    const { world, state } = setup([notice]);
    const run = days(world, state, 2);
    expect(run.state.situationStates[S('told')]!.sitStatus).toBe('noticed');
    // Gate F1 (review S10): the notice goes as a report from its author, and surfaces when that report arrives.
    expect(run.state.situationStates[S('told')]!.sitStaffAuthor).toBe(P('a_sec'));
    expect(run.state.situationStates[S('told')]!.sitSurfacedDay).toBe(2);
    expect(knowledgeOf(run.state, lead).knownReports.some((r) => r.knownBody.reportSubjectId === 'told' && r.knownBody.reportSubtype === 'cabinet-word')).toBe(true);
    expect(run.state.situationFlags.told).toBe(1);
    expect(run.results[0]!.proposals).toEqual([{ proposal: 'effect', owner: 'politics', field: 'bloc-support', subject: 'hawks', delta: -40, reason: 'news', side: F('a'), situation: S('told'), option: null }]);
    expect(run.points).toEqual([]);
  });
});

describe('situations in the log, the view and the hash', () => {
  const world = indexWorld({
    ...commsFixture(),
    situations: [decision('a'), decision('b', { event: { decided: S('a'), options: null }, railroad: null, historicalDefault: { delegate: POST('a_office') } })],
  });

  it('replays to every day’s hash, decisions and delegations included', () => {
    const start = createState(world, { seed: 5 });
    const run = playDays(world, start, scriptedSeats(), 20, { freeze: true });
    expect(replay(world, start, run.log, 20).hashes).toEqual(run.hashes);
    expect(canonicalHash(run.state)).toBe(run.hashes.at(-1)!.hash);
  });

  it('never shows the historical default to any seat, in a view or a request (gate B9)', () => {
    const run = playDays(world, createState(world, { seed: 5, drivers: { a_lead: 'human' } }), scriptedSeats(), 3);
    const views = Object.keys(run.state.seatAssignments).map((s) => JSON.stringify(viewFor(world, run.state, s as never)));
    const requests = pendingRequests(world, run.state).map((r) => JSON.stringify(r));
    for (const text of [...views, ...requests]) expect(text).not.toMatch(/historicalDefault|history-default|unsourced/);
    const v = viewFor(world, run.state, lead);
    expect(v.situations.map((s) => [s.id, s.status, s.options.map((o) => o.id)])).toEqual([[S('a'), 'open', ['hold', 'press']]]);
  });
});
