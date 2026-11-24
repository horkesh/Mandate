import { describe, expect, it } from 'vitest';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { report } from './support/s25-fixture.ts';
import { toId, type PersonId, type SituationId } from '../src/ids.ts';
import type { Command } from '../src/log/commands.ts';
import type { LogEntry } from '../src/log/log.ts';
import type { OrderValueRow } from '../src/people/verb-rules.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { answerOrder, orderTerms, pushbackOf } from '../src/reading/orders.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { reviewsFor } from '../src/seats/requests.ts';
import { indexSeatsWorld, type SeatsWorld } from '../src/seats/world.ts';
import type { OptionDef, SituationDef } from '../src/situations/types.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { POLICY_GRIEVANCE, POLICY_GRIEVANCES } from '../src/tick/policy.ts';
import { SITUATION_MECHANICS } from '../src/tick/situations.ts';
import { createState } from '../src/tick/setup.ts';
import { SEATS_MECHANICS, tick, type TickResult } from '../src/tick/tick.ts';
import { indexWorld } from '../src/world/index.ts';
import { F, indexedFixture, P, POST, R } from './support/seats-fixture.ts';
import { goalTerms } from './support/test-seats.ts';
import { ctxFor } from './support/tick-context.ts';
import { oversightOf } from '../src/tick/context.ts';

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
  return { id, label: `situation.crossers.option.${id}`, displayKey, proposedBy: [P('a_sec')], group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, effects: [], lockedCosts: [], orders: [], calls: [], honours: [], watched: false, policy: null, gate: null, ...over };
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
  inaction: { text: 'situation.crossers.inaction', effects: [], policy: null },
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
function world(practice = true, rows: readonly OrderValueRow[] = ROWS, situation: SituationDef = CROSSERS): SeatsWorld {
  const base = indexedFixture({}, [situation]);
  const w = base.map.world;
  const people = w.people.map((p) => (p.id === P('a_gen') && practice ? { ...p, practices: [{ practice: PRACTICE, cites: [] }] } : p));
  const verbs = { ...w.rules.people.verbs, orderValues: [...w.rules.people.verbs.orderValues, ...rows] };
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

const KINDS = new Set<string>(Object.values(POLICY_GRIEVANCES));
const policyGrievances = (state: State) =>
  Object.entries(state.personGrievances).flatMap(([person, gs]) => gs.filter((g) => KINDS.has(g.grievanceKind)).map((g) => ({ person, kind: g.grievanceKind, weight: g.grievanceWeight, cause: g.grievanceCause })));
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
    // Every term the total counts is a grievance of its weight, typed by its term: a_bold's offended glory, and a_gen's
    // clash with his practice and his unwillingness (the standing review of lane 1.5b).
    expect(got.filter((g) => g.cause === 'policy:send_back').sort((a, b) => (a.person + a.kind < b.person + b.kind ? -1 : 1))).toEqual(
      push.terms.flatMap((t) => (t.source === 'floor' ? [] : [{ person: t.person, kind: POLICY_GRIEVANCES[t.source], weight: t.amount, cause: 'policy:send_back' }])).sort((a, b) => (a.person + a.kind < b.person + b.kind ? -1 : 1)),
    );
    expect(got.some((g) => g.kind === 'policy_practice' && g.person === P('a_gen'))).toBe(true);
    // G-1.5f: the floor's difference falls on this row's own stakeholders and carriers (a_bold, whom sending back offends;
    // a_gen, whose practice it runs against), every point of it, each naming the floor. Never on those who favoured the
    // floor's policy and are not this row's stakeholders (a_sec, a_clerk, a_spy): that would give them a stance.
    const shared = got.filter((g) => g.cause === 'floor:policy:shelter');
    expect(shared.reduce((n, g) => n + g.weight, 0)).toBe(floor.source === 'floor' ? floor.amount : -1);
    const ownPeople = new Set(push.terms.flatMap((t) => (t.source === 'floor' ? [] : [t.person as string])));
    expect(shared.every((g) => ownPeople.has(g.person))).toBe(true);
    expect(shared.map((g) => g.person).sort()).toEqual(['a_bold', 'a_gen']);
    for (const bystander of ['a_sec', 'a_clerk', 'a_spy']) expect(shared.some((g) => g.person === bystander), bystander).toBe(false);
    // Everyone holds it against the principal who chose it.
    expect(Object.values(decided.state.personGrievances).flat().filter((g) => g.grievanceKind === POLICY_GRIEVANCE).every((g) => g.grievanceAgainst === P('a_lead'))).toBe(true);
    // The carrier answered through his compliance, practice clash included, and proxy recorded it.
    const response = decided.state.orderResponses[`m.2.policy.crossers.send_back|${P('a_gen')}`]!;
    expect(response.respRole).toBe('addressee');
    expect(response.respReasons).toContainEqual({ kind: 'practice_clash', practice: PRACTICE, weight: 200 });
    expect(decided.fires('situations.policy')).toBe(1);
  });

  it('a floored row applies at least the floor row’s grievances, whoever carries it: the more a carrier resists, the dearer, never the cheaper', () => {
    // The fixture's carrier (a_gen, who keeps the practice of sheltering them), and a bold one (a_bold at a_reserve), the
    // standing review's case: before every term was applied, a bold carrier made sending back cheaper than sheltering.
    const bold = { ...CROSSERS, options: CROSSERS.options.map((o) => (o.policy === null ? o : { ...o, policy: { ...o.policy, carriedBy: [POST('a_reserve')] } })) };
    for (const [name, situation] of [['the fixture carrier', CROSSERS], ['a bold carrier', bold]] as const) {
      const wd = world(true, ROWS, situation);
      const back = (() => {
        const start = createState(wd, { seed: 1, drivers: { a_lead: 'human' } });
        const decided = run(wd, start, 2, { 2: [{ cmd: 'decide', situation: S('crossers'), options: ['send_back'] }] });
        const carriers = situation.options[1]!.policy!.carriedBy.map((p) => decided.results[0]!.state.postStates[p]!.postHolder!);
        return { sum: policyGrievances(decided.state).reduce((n, g) => n + g.weight, 0), total: pushbackOf(wd, decided.results[0]!.state, 'policy:send_back', carriers, P('a_lead'), (p) => ({ oversight: oversightOf(ctxFor(wd, decided.results[0]!.state, 2), decided.results[0]!.state, p, P('a_lead')).value })).total };
      })();
      const shelter = (() => {
        const start = createState(wd, { seed: 1, drivers: { a_lead: 'human' } });
        const decided = run(wd, start, 2, { 2: [{ cmd: 'decide', situation: S('crossers'), options: ['shelter'] }] });
        const carriers = situation.options[0]!.policy!.carriedBy.map((p) => decided.results[0]!.state.postStates[p]!.postHolder!);
        return { sum: policyGrievances(decided.state).reduce((n, g) => n + g.weight, 0), total: pushbackOf(wd, decided.results[0]!.state, 'policy:shelter', carriers, P('a_lead'), (p) => ({ oversight: oversightOf(ctxFor(wd, decided.results[0]!.state, 2), decided.results[0]!.state, p, P('a_lead')).value })).total };
      })();
      // What is applied is the pushback, term for term (each carrier read at the oversight where he stands, as the tick
      // reads him), and the floored row's is at least its floor's.
      expect(back.sum, `${name}: send_back applies its pushback`).toBe(back.total);
      expect(shelter.sum, `${name}: shelter applies its pushback`).toBe(shelter.total);
      expect(back.sum, `${name}: send_back is never cheaper than shelter`).toBeGreaterThanOrEqual(shelter.sum);
    }
  });

  it('a floor with nobody to bear it falls on the principal’s own standing, a typed floor cost (G-1.5f)', () => {
    // Sending back that offends no one, carried by no post: the floor's difference has no stakeholder of its own.
    const rows = [ROWS[0]!, row('policy:send_back', [], { notCheaperThan: 'policy:shelter' })];
    const lone = { ...CROSSERS, options: CROSSERS.options.map((o) => (o.policy === null ? o : { ...o, policy: { ...o.policy, carriedBy: [] } })) };
    const wd = world(false, rows, lone);
    // A principal with standing to lose (standing is a permille, clamped at 0).
    const start = applyPeopleChanges(createState(wd, { seed: 1, drivers: { a_lead: 'human' } }), [{ change: 'standing', person: P('a_lead'), delta: 800 }], 0, wd.map.world.rules.people, []);
    const decided = run(wd, start, 2, { 2: [{ cmd: 'decide', situation: S('crossers'), options: ['send_back'] }] });
    const morning = decided.results[0]!.state;
    const push = pushbackOf(wd, morning, 'policy:send_back', [], P('a_lead'));
    expect(push.terms.map((t) => t.source)).toEqual(['floor']);
    const cost = push.terms[0]!.amount;
    expect(cost).toBeGreaterThan(0);
    expect(policyGrievances(decided.state)).toEqual([]);
    expect(decided.state.personStanding[P('a_lead')]).toBe(Math.max(0, morning.personStanding[P('a_lead')]! - cost));
    expect(decided.state.personStanding[P('a_lead')]).toBeLessThan(morning.personStanding[P('a_lead')]!);
    const event = decided.results[1]!.events.find((e) => e.event === 'policy')!;
    expect(event.terms.map((t) => [t.termRule, t.termValue])).toEqual([['floor:policy:shelter', cost], ['floor_cost:policy:shelter', -cost]]);
     expect(decided.results[1]!.events.some((e) => e.event === 'policy_unpaid')).toBe(false);
    // Paid in full, so nothing is recorded unpaid (lane 1.4c).
    expect(decided.fires('situations.policy_unpaid')).toBe(0);
    // A principal with less standing than the cost pays what he has; the rest is recorded as unpaid, never dropped.
    const poor = applyPeopleChanges(createState(wd, { seed: 1, drivers: { a_lead: 'human' } }), [{ change: 'standing', person: P('a_lead'), delta: 100 }], 0, wd.map.world.rules.people, []);
    const short = run(wd, poor, 2, { 2: [{ cmd: 'decide', situation: S('crossers'), options: ['send_back'] }] });
    const had = short.results[0]!.state.personStanding[P('a_lead')]!;
    expect(had).toBeLessThan(cost);
    expect(short.state.personStanding[P('a_lead')]).toBe(0);
    const policy = short.results[1]!.events.find((e) => e.event === 'policy')!;
    expect(policy.terms.find((t) => t.termRule === 'floor_cost:policy:shelter')!.termValue).toBe(-had);
    const unpaid = short.results[1]!.events.find((e) => e.event === 'policy_unpaid')!;
    expect(unpaid.terms.map((t) => [t.termRule, t.termValue])).toEqual([['floor_unpaid:policy:shelter', cost - had]]);
  });

  it('with standing at 0 and no stakeholders, the whole floor cost is recorded unpaid, never dropped', () => {
    const rows = [ROWS[0]!, row('policy:send_back', [], { notCheaperThan: 'policy:shelter' })];
    const lone = { ...CROSSERS, options: CROSSERS.options.map((o) => (o.policy === null ? o : { ...o, policy: { ...o.policy, carriedBy: [] } })) };
    const wd = world(false, rows, lone);
    // The principal's standing spent to 0.
    const start = applyPeopleChanges(createState(wd, { seed: 1, drivers: { a_lead: 'human' } }), [{ change: 'standing', person: P('a_lead'), delta: -1000 }], 0, wd.map.world.rules.people, []);
    const decided = run(wd, start, 2, { 2: [{ cmd: 'decide', situation: S('crossers'), options: ['send_back'] }] });
    const morning = decided.results[0]!.state;
    expect(morning.personStanding[P('a_lead')] ?? 0).toBe(0);
    const cost = pushbackOf(wd, morning, 'policy:send_back', [], P('a_lead')).total;
    expect(cost).toBeGreaterThan(0);
    expect(decided.state.personStanding[P('a_lead')] ?? 0).toBe(0);
    const unpaid = decided.results[1]!.events.find((e) => e.event === 'policy_unpaid')!;
    expect(unpaid.terms.map((t) => [t.termRule, t.termValue])).toEqual([['floor_unpaid:policy:shelter', cost]]);
    expect(decided.fires('situations.policy_unpaid')).toBe(1);
  });
  it('inaction can be a policy too, applied through the map like an option (G-1.5g)', () => {
    const left = { ...CROSSERS, inaction: { text: 'situation.crossers.inaction', effects: [], policy: { row: 'policy:send_back', carriedBy: [POST('a_army')] } } };
    const wd = world(true, ROWS, left);
    const decided = run(wd, createState(wd, { seed: 1, drivers: { a_lead: 'human' } }), 2, { 2: [{ cmd: 'decide', situation: S('crossers'), options: [] }] });
    expect(decided.results.flatMap((r) => r.rejections)).toEqual([]);
    const got = policyGrievances(decided.state);
    expect(got.some((g) => g.cause === 'policy:send_back')).toBe(true);
    expect(got.some((g) => g.cause === 'floor:policy:shelter')).toBe(true);
    expect(decided.state.orderResponses[`m.2.policy.crossers.inaction|${P('a_gen')}`]!.respRole).toBe('addressee');
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
    let state = deliverReport(createState(wd, { seed: 7 }), seatIdFor(P('a_gen')), report('m.edit.enemy', {
      reportType: 'enemy-estimate', reportDay: 0, reportSubjectId: R('b_mid'),
      // A complete fictional search includes the adjacent regions used by hop threat.
      reportClaims: ['a_cap', 'a_mid', 'a_front', 'b_front', 'b_mid', 'b_cap'].map(r => ({ claimKind: 'enemy-strength', claimRegion: R(r), claimValue: r === 'b_mid' ? 1152 : 0, claimToken: null, claimConfidence: 1000 })),
    }, 0), NO_TRUTH);
    let edited: string | null = null;
    let sent = false;
    for (let day = 1; day <= 12 && edited === null; day++) {
      const review = sent ? undefined : reviewsFor(state, P('a_lead')).find((r) => r.post === POST('a_army'));
      // "Move now" on the first axis in the commander's received plan.
      const axis = review?.plan.axes[0]?.name ?? null;
      const commands: Command[] = day === 1 ? [take] : review === undefined ? [] : [{ cmd: 'review', to: review.post, action: 'edit', edit: { kind: 'timing', axis, region: null, via: [], concentration: 0 }, route: 'special-messenger', bypass: true }];
      if (review !== undefined) sent = true;
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

describe('a verb is read at the oversight where he stands (lane 1.4’s oversightOf; the lead’s ruling for lane 1.5b)', () => {
  it('a distant man answers a verb at his distance-reduced oversight, with the watched terms still stacking on top', () => {
    // With no wire term, so the distance shows on its own (on the fixture a_gen's wire would cancel it exactly).
    const base = indexedFixture();
    const bw = base.map.world;
    const wd = indexSeatsWorld(indexWorld({ ...bw, rules: { ...bw.rules, people: { ...bw.rules.people, context: { ...bw.rules.people.context, oversightWired: 0 } } } }), base.start, { situations: base.situations });
    const start = createState(wd, { seed: 1 });
    const rules = wd.map.world.rules.people;
    const ov = oversightOf(ctxFor(wd, start, 1), start, P('a_gen'), P('a_lead'));
    // a_gen commands at the front, courier days from his principal: the distance term lowers his oversight.
    expect(ov.terms.find((t) => t.ovKind === 'distance')!.ovValue).toBeLessThan(0);
    expect(ov.value).toBeLessThan(rules.context.oversight);
    // An observer watches him, and an inquiry follows: the verb's answer is read at that oversight, plus the observer's term.
    const played = run(wd, start, 16, { 1: [{ cmd: 'observer', person: P('a_spy'), to: POST('a_army'), route: 'courier' }], 6: [{ cmd: 'inquire', to: POST('a_army'), subject: null, route: 'courier' }] });
    const response = Object.values(played.state.orderResponses).find((r) => r.respPerson === P('a_gen') && r.respOrder.includes('inquire'))!;
    expect(response).toBeDefined();
    const morning = played.results[response.respDay - 2]!.state;
    const terms = orderTerms(rules, 'verb:inquire');
    const here = oversightOf(ctxFor(wd, morning, response.respDay), morning, P('a_gen'), P('a_lead'));
    const atDistance = answerOrder(wd, morning, P('a_gen'), P('a_lead'), terms, { oversight: here.value });
    const atBase = answerOrder(wd, morning, P('a_gen'), P('a_lead'), terms);
    expect(response.respWillingness).toBe(atDistance.willingness);
    expect(response.respWillingness).not.toBe(atBase.willingness);
    // The observer's oversight is its own typed term on top, not lost to the distance.
    expect(response.respReasons).toContainEqual({ kind: 'watched', source: 'observer', amount: rules.verbs.observer.oversight });
  });
});

void (null as unknown as PersonId);
