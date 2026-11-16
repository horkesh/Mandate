import { describe, expect, it } from 'vitest';
import { toId, type PersonId, type SituationId } from '../src/ids.ts';
import type { Command } from '../src/log/commands.ts';
import type { LogEntry } from '../src/log/log.ts';
import type { OrderValueRow } from '../src/people/verb-rules.ts';
import { candidateOf } from '../src/plans/plans.ts';
import { answerOrder, orderTerms, pushbackOf } from '../src/reading/orders.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld, type SeatsWorld } from '../src/seats/world.ts';
import type { OptionDef, SituationDef } from '../src/situations/types.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { POLICY_GRIEVANCE } from '../src/tick/policy.ts';
import { SITUATION_MECHANICS } from '../src/tick/situations.ts';
import { createState } from '../src/tick/setup.ts';
import { SEATS_MECHANICS, tick, type TickResult } from '../src/tick/tick.ts';
import { indexWorld } from '../src/world/index.ts';
import { F, indexedFixture, P, POST } from './support/seats-fixture.ts';
import { goalTerms } from './support/test-seats.ts';

/**
 * Lane 1.5b: the map from orders to values wired into play (the gate review's G-1.5a, G-1.5b), the practice-clash term,
 * and an edit read against what the plan holds. On the seats fixture (setting-free, 0003): sheltering or sending back
 * people who cross the fen is the testbed's fiction for a gated policy.
 */
const lead = seatIdFor(P('a_lead'));
const S = (id: string) => toId('situation', id) as SituationId;
const MECHANICS = [...SEATS_MECHANICS, ...MAP_MECHANICS, ...SITUATION_MECHANICS];
const PRACTICE = 'shelters_crossers';

const row = (order: string, offends: string[], over: Partial<OrderValueRow> = {}): OrderValueRow => ({ order, boldness: 400, honours: [], offends, gateTopics: ['fen-flight'], notCheaperThan: null, clashes: [], ...over });
// Sheltering offends caution and order (a_sec, a_gen, a_spy, a_clerk); sending back offends only glory (a_bold), so on
// its own it would be cheaper: its floor is sheltering's, and it runs against a practice of sheltering them.
const ROWS = [row('policy:shelter', ['caution', 'order']), row('policy:send_back', ['glory'], { notCheaperThan: 'policy:shelter', clashes: [PRACTICE] })];

function option(id: string, displayKey: number, over: Partial<OptionDef> = {}): OptionDef {
  return { id, label: `situation.crossers.option.${id}`, displayKey, proposedBy: [P('a_sec')], group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, effects: [], lockedCosts: [], orders: [], honours: [], watched: false, policy: null, gate: null, ...over };
}

const CROSSERS: SituationDef = {
  id: S('crossers'),
  kind: 'decision',
  faction: F('a'),
  title: 'situation.crossers.title',
  text: 'situation.crossers.text',
  earliest: '1861-04-01',
  event: { dayAtLeast: 1 },
  knowledge: null,
  railroad: 'test fixture',
  chain: null,
  subjects: [],
  options: [
    option('shelter', 1, { policy: { row: 'policy:shelter', carriedBy: [POST('a_army')] } }),
    option('send_back', 2, { watched: true, policy: { row: 'policy:send_back', carriedBy: [POST('a_army')] } }),
  ],
  inaction: { text: 'situation.crossers.inaction', effects: [] },
  historicalDefault: { options: ['shelter'] },
  staffLine: { authors: [POST('a_office')], recommends: ['shelter'], reasons: [{ kind: 'momentum', weight: 600 }], confidence: 700 },
  delegableTo: [],
  resurfaceOn: [],
  effects: [],
  report: null,
  gate: { none: 'test fixture' },
  gateReview: null,
  citations: [],
};

/** The fixture with the two policy rows, a_gen keeping the practice of sheltering them, and the crossers decision. */
function world(practice = true): SeatsWorld {
  const base = indexedFixture({}, [CROSSERS]);
  const w = base.map.world;
  const people = w.people.map((p) => (p.id === P('a_gen') && practice ? { ...p, practices: [{ practice: PRACTICE, cites: [] }] } : p));
  const verbs = { ...w.rules.people.verbs, orderValues: [...w.rules.people.verbs.orderValues, ...ROWS] };
  return indexSeatsWorld(indexWorld({ ...w, people, rules: { ...w.rules, people: { ...w.rules.people, verbs } } }), base.start, { situations: base.situations });
}

function run(wd: SeatsWorld, start: State, days: number, entries: Record<number, Command[]>): { state: State; results: TickResult[]; fires: (m: string) => number } {
  const telemetry = createTelemetry(MECHANICS);
  let state = start;
  const results: TickResult[] = [];
  for (let i = 0; i < days; i++) {
    const day = state.stateDay + 1;
    const r = tick(wd, state, (entries[day] ?? []).map((command): LogEntry => ({ day, seat: lead, command })), { freeze: true, telemetry });
    results.push(r);
    state = r.state;
  }
  return { state, results, fires: (m) => telemetry.mechanics[m]?.fires ?? 0 };
}

const policyGrievances = (state: State) =>
  Object.entries(state.personGrievances).flatMap(([person, gs]) => gs.filter((g) => g.grievanceKind === POLICY_GRIEVANCE).map((g) => ({ person, weight: g.grievanceWeight, cause: g.grievanceCause })));

describe('the map from orders to values in play (gate review G-1.5a, G-1.5b)', () => {
  it('a floored row explains itself: its own terms and one floor term for the difference sum to the total', () => {
    const wd = world();
    const s = createState(wd, { seed: 1, drivers: { a_lead: 'human' } });
    const shelter = pushbackOf(wd, s, 'policy:shelter', [P('a_gen')], P('a_lead'));
    const back = pushbackOf(wd, s, 'policy:send_back', [P('a_gen')], P('a_lead'));
    expect(back.floor).toBe('policy:shelter');
    expect(back.total).toBe(shelter.total);
    // Hard rule 6: every term typed, and they sum to the total.
    expect(back.terms.reduce((n, t) => n + t.amount, 0)).toBe(back.total);
    const floor = back.terms.filter((t) => t.source === 'floor');
    expect(floor).toEqual([{ source: 'floor', order: 'policy:shelter', amount: back.total - back.terms.filter((t) => t.source !== 'floor').reduce((n, t) => n + t.amount, 0) }]);
    expect(floor[0]!.amount).toBeGreaterThan(0);
    // An unfloored row carries no floor term.
    expect(shelter.terms.some((t) => t.source === 'floor')).toBe(false);
    expect(shelter.terms.reduce((n, t) => n + t.amount, 0)).toBe(shelter.total);
  });

  it('a chosen policy applies its pushback through the owners: a grievance per stakeholder, the floor shared, the carrier’s answer recorded', () => {
    const wd = world();
    const start = createState(wd, { seed: 1, drivers: { a_lead: 'human' } });
    const decided = run(wd, start, 2, { 2: [{ cmd: 'decide', situation: S('crossers'), options: ['send_back'] }] });
    expect(decided.results.flatMap((r) => r.rejections)).toEqual([]);
    const morning = decided.results[0]!.state;
    const push = pushbackOf(wd, morning, 'policy:send_back', [P('a_gen')], P('a_lead'));
    const floor = push.terms.find((t) => t.source === 'floor')!;
    const got = policyGrievances(decided.state);
    // Each stakeholder who holds an offended value (here a_bold, glory) holds a grievance of his term's weight.
    expect(got.filter((g) => g.cause === 'policy:send_back')).toEqual(push.terms.flatMap((t) => (t.source === 'values' ? [{ person: t.person, weight: t.amount, cause: 'policy:send_back' }] : [])));
    // The floor's difference falls on the floor row's own stakeholders, every point of it, each naming the floor.
    const shared = got.filter((g) => g.cause === 'floor:policy:shelter');
    expect(shared.reduce((n, g) => n + g.weight, 0)).toBe(floor.source === 'floor' ? floor.amount : -1);
    const floorPeople = new Set(pushbackOf(wd, morning, 'policy:shelter', [P('a_gen')], P('a_lead')).terms.flatMap((t) => (t.source === 'floor' ? [] : [t.person as string])));
    expect(shared.every((g) => floorPeople.has(g.person))).toBe(true);
    // Everyone holds it against the principal who chose it.
    expect(Object.values(decided.state.personGrievances).flat().filter((g) => g.grievanceKind === POLICY_GRIEVANCE).every((g) => g.grievanceAgainst === P('a_lead'))).toBe(true);
    // The carrier answered through his compliance, practice clash included, and proxy recorded it.
    const response = decided.state.orderResponses[`m.2.policy.crossers.send_back|${P('a_gen')}`]!;
    expect(response.respRole).toBe('addressee');
    expect(response.respReasons).toContainEqual({ kind: 'practice_clash', practice: PRACTICE, weight: 200 });
    expect(decided.fires('situations.policy')).toBe(1);
  });

  it('an option that is no policy applies no pushback', () => {
    const wd = world();
    const plain = indexSeatsWorld(indexWorld(wd.map.world), wd.start, { situations: [{ ...CROSSERS, options: CROSSERS.options.map((o) => ({ ...o, policy: null })) }] });
    const decided = run(plain, createState(plain, { seed: 1, drivers: { a_lead: 'human' } }), 2, { 2: [{ cmd: 'decide', situation: S('crossers'), options: ['send_back'] }] });
    expect(policyGrievances(decided.state)).toEqual([]);
    expect(decided.fires('situations.policy')).toBe(0);
  });
});

describe('the practice-clash term (lane 1.5b; the gate review of lane 1.9: a commander’s resistance can live in his practice, not his values)', () => {
  it('an order that runs against his own practice costs him its weight as a typed term and reason, and the pushback counts it once', () => {
    const wd = world();
    const s = createState(wd, { seed: 1 });
    const rules = wd.map.world.rules.people;
    const keeper = answerOrder(wd, s, P('a_gen'), P('a_lead'), orderTerms(rules, 'policy:send_back'));
    expect(keeper.reasons).toContainEqual({ kind: 'practice_clash', practice: PRACTICE, weight: rules.verbs.practiceWeight });
    expect(keeper.contributions).toContainEqual({ term: 'practice', amount: -rules.verbs.practiceWeight });
    // The same man without the practice reads the same order with no such term, and exactly that much more willingly.
    const plain = world(false);
    const other = answerOrder(plain, createState(plain, { seed: 1 }), P('a_gen'), P('a_lead'), orderTerms(rules, 'policy:send_back'));
    expect(other.contributions.some((c) => c.term === 'practice')).toBe(false);
    expect(other.willingness - keeper.willingness).toBe(rules.verbs.practiceWeight);
    // In the pushback, the clash is its own term; the recipient term counts only his unwillingness apart from it.
    const back = pushbackOf(wd, s, 'policy:send_back', [P('a_gen')], P('a_lead'));
    expect(back.terms).toContainEqual({ source: 'practice', person: P('a_gen'), practice: PRACTICE, amount: rules.verbs.practiceWeight });
    const recipient = back.terms.find((t) => t.source === 'recipient');
    expect(recipient?.amount ?? 0).toBe(Math.max(0, -other.willingness));
    // Sending back a man who keeps no such practice clashes with nothing.
    expect(pushbackOf(wd, s, 'policy:send_back', [P('a_bold')], P('a_lead')).terms.some((t) => t.source === 'practice')).toBe(false);
  });
});

describe('an edit read against what the plan holds (lane 1.5b; finding of lane 1.5)', () => {
  it('an edit to a plan that needs more men than it commits states the shortfall: lacks_resources can fire on an edit', () => {
    const wd = indexedFixture();
    const take: Command = { cmd: 'order', to: POST('a_army'), goal: goalTerms('take', 'b_mid', { approveAsDrafted: false }), route: 'special-messenger', bypass: true };
    let state = createState(wd, { seed: 7 });
    let edited: string | null = null;
    let sent = false;
    for (let day = 1; day <= 12 && edited === null; day++) {
      const record = state.planRecords[POST('a_army')];
      const reviewing = !sent && record?.planStatus === 'review';
      // "Move now" on his chosen plan's first axis.
      const axis = reviewing ? candidateOf(record!, record!.planChosen!)!.candAxes[0]!.axisName : null;
      const commands: Command[] = day === 1 ? [take] : reviewing ? [{ cmd: 'review', to: POST('a_army'), action: 'edit', edit: { kind: 'timing', axis, region: null, via: [], concentration: 0 }, route: 'special-messenger', bypass: true }] : [];
      if (reviewing) sent = true;
      const r = tick(wd, state, commands.map((command): LogEntry => ({ day, seat: lead, command })), { freeze: true });
      expect(r.rejections, `day ${day}`).toEqual([]);
      state = r.state;
      const counter = state.planRecords[POST('a_army')]?.planCounters.find((x) => x.counterResponse !== null);
      if (counter !== undefined) edited = JSON.stringify(state.orderResponses[counter.counterResponse!]!.respReasons);
    }
    expect(edited).not.toBeNull();
    // a_gen's plan against the 1152 men he believes at b_mid needs more than it commits: he says so.
    expect(JSON.parse(edited!)).toContainEqual(expect.objectContaining({ kind: 'lacks_resources' }));
  });
});

void (null as unknown as PersonId);
