import { describe, expect, it } from 'vitest';
import { resolveDirective } from '../src/compliance.ts';
import { toId, type PersonId, type PostId, type SituationId } from '../src/ids.ts';
import { previewAudience } from '../src/audience/audience.ts';
import type { CounterTerms } from '../src/audience/counters.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import type { AudienceCommand, Command } from '../src/log/commands.ts';
import type { LogEntry } from '../src/log/log.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { verbRulesProblems } from '../src/people/verb-rules.ts';
import { planReading } from '../src/tick/audience-plan.ts';
import { goalTerms } from './support/test-seats.ts';
import { answerOrder, contextFor, orderTerms, profileOf, pushbackOf } from '../src/reading/orders.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld, type SeatsWorld } from '../src/seats/world.ts';
import type { OptionDef, SituationDef } from '../src/situations/types.ts';
import { attentionPrice } from '../src/tick/attention.ts';
import { createState } from '../src/tick/setup.ts';
import { createTelemetry, type Telemetry } from '../src/telemetry.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { SITUATION_MECHANICS } from '../src/tick/situations.ts';
import { SEATS_MECHANICS, tick, type TickResult } from '../src/tick/tick.ts';

const MECHANICS = [...SEATS_MECHANICS, ...MAP_MECHANICS, ...SITUATION_MECHANICS];
import { indexWorld } from '../src/world/index.ts';
import type { PeopleRules } from '../src/people/rules.ts';
import { F, indexedFixture, P, POST, R } from './support/seats-fixture.ts';

/**
 * Lane 1.5: the people verbs, the audience, attention, the ladder and rivals, seat initiatives, cost-only values and the
 * order-to-value map, on the seats fixture (setting-free, 0003). Each verb is an order to a person, answered through his
 * compliance with typed reasons that `proxy` records.
 */
const lead = seatIdFor(P('a_lead'));
const S = (id: string) => toId('situation', id) as SituationId;
const counter = (kind: CounterTerms['kind'], over: Partial<CounterTerms> = {}): CounterTerms => ({ kind, value: null, boldness: null, from: null, men: null, ...over });

/** Tick day by day with the principal's commands for each day, counting every mechanic (the liveness gate's QUIET needles name these tests). */
function days(world: SeatsWorld, start: State, n: number, entries: Record<number, Command[]> = {}): { state: State; results: TickResult[]; fires: (mechanic: string) => number } {
  let state = start;
  const results: TickResult[] = [];
  const telemetry: Telemetry = createTelemetry(MECHANICS);
  for (let i = 0; i < n; i++) {
    const day = state.stateDay + 1;
    const r = tick(world, state, (entries[day] ?? []).map((command): LogEntry => ({ day, seat: lead, command })), { freeze: true, telemetry });
    results.push(r);
    state = r.state;
  }
  return { state, results, fires: (mechanic) => telemetry.mechanics[mechanic]?.fires ?? 0 };
}
const fired = (results: readonly TickResult[]) => results.flatMap((r) => r.rejections.map((x) => x.reason));
const answers = (state: State, person: string) => Object.values(state.orderResponses).filter((r) => r.respPerson === P(person));
/** Hold only after the request reaches its commander (R48); counter tests inspect the delivered result. */
function audienceArrives(world: SeatsWorld, state: State, command: AudienceCommand, telemetry?: Telemetry): TickResult {
  let result = tick(world, state, [{ day: state.stateDay + 1, seat: lead, command }], { telemetry, freeze: true });
  if (result.rejections.length > 0) return result;
  const letter = result.state.messagesInTransit.find((m) => m.msgVerb?.verbKind === 'audience');
  if (letter === undefined) return result; // Same-region delivery already held it.
  expect(result.state.audienceHeld).toEqual(state.audienceHeld);
  for (let i = 0; result.day < letter.msgArriveDay && i < 30; i++) result = tick(world, result.state, [], { telemetry, freeze: true });
  expect(result.day).toBe(letter.msgArriveDay);
  return result;
}
const audienceResponse = (state: State) => Object.values(state.orderResponses).find((r) => r.respPerson === P('a_gen') && r.respOrder.includes('verb.audience'))!;

const answered = (state: State) =>
  knowledgeOf(state, lead).knownReports.flatMap((r) => r.knownBody.reportClaims.filter((c) => c.claimKind === 'verb-answered').map((c) => `${r.knownBody.reportAuthor}:${c.claimToken}:${c.claimValue}`));

/** `state` with an approved plan to hold at a_army (the plans machinery would put it there; here its status is set directly). */
function planned(state: State): State {
  const plan = {
    planGoal: { goalObjective: null, goalPosture: 'hold', goalRisk: 300, goalDeadlineDays: 20, goalRail: false, goalRiver: false, goalSea: false, goalNeutral: false, goalCommitted: [], goalAwaitWord: false, goalApproveAsDrafted: true },
    planIssuer: P('a_lead'),
    planViaChain: true,
    planSetDay: 1,
    planIssuedDay: 1,
    planOrder: 'm.1.probe',
    planResponse: 'm.1.probe|a_gen',
    planStatus: 'approved',
    planDraft: null,
    planChosen: null,
    planApproved: null,
    planSubmitted: null,
    planCounters: [],
    planPending: null,
  } as unknown as State['planRecords'][PostId];
  return { ...state, planRecords: { ...state.planRecords, [POST('a_army')]: plan } } as State;
}

/** a_gen with a grievance of being passed over (weight 300). */
function passedOver(world: SeatsWorld, state: State): State {
  return applyPeopleChanges(state, [{ change: 'grievance', person: P('a_gen'), kind: 'passed_over', weight: 300, against: P('a_lead'), cause: null }], 0, world.map.world.rules.people, []);
}

/** A world whose people rules are the fixture's with `over` applied. */
function withPeople(world: SeatsWorld, over: Partial<PeopleRules['verbs']>, values?: { id: string; costOnly: boolean }[]): SeatsWorld {
  const people = world.map.world.rules.people;
  const base = { ...world.map.world.vocabularies, personKinds: [{ id: 'officer', name: 'kind.officer' }] };
  const vocab = values === undefined ? base : { ...base, values: values.map((v) => ({ ...v, name: `value.${v.id}` })) };
  return indexSeatsWorld(indexWorld({ ...world.map.world, vocabularies: vocab, rules: { ...world.map.world.rules, people: { ...people, verbs: { ...people.verbs, ...over } } } }), world.start, { situations: world.situations });
}

describe('attention (0025, 0040; FOUNDATION section 5)', () => {
  it('starts full, is spent by the cost table, refuses what it cannot pay, and refills to its cap with no carry-over', () => {
    const world = indexedFixture();
    const start = createState(world, { seed: 1 });
    expect(start.seatAttention[lead]).toEqual({ attnLeft: 12, attnRefilledDay: 0 });
    // Only principals have a budget: a commander's seat has none.
    expect(start.seatAttention[seatIdFor(P('a_gen'))]).toBeUndefined();
    // Thirteen pressures on one day: twelve are paid for, the thirteenth is refused for want of attention.
    const press: Command = { cmd: 'pressure', person: P('a_gen') };
    const one = days(world, start, 1, { 1: Array.from({ length: 13 }, () => press) });
    expect(one.state.seatAttention[lead]).toEqual({ attnLeft: 0, attnRefilledDay: 0 });
    expect(fired(one.results)).toEqual(['no_attention']);
    expect([one.fires('seats.attention_spent'), one.fires('seats.attention_refused')]).toEqual([12, 1]);
    // A free verb still goes through on an empty budget: an inquiry costs nothing.
    const two = days(world, one.state, 1, { 2: [{ cmd: 'inquire', to: POST('a_army'), subject: null, route: 'courier' }] });
    expect(fired(two.results)).toEqual([]);
    // Day 7: the week has run, and it refills to the cap, not to what was left plus the cap.
    const week = days(world, two.state, 5);
    expect(week.state.seatAttention[lead]).toEqual({ attnLeft: 12, attnRefilledDay: 7 });
    expect(week.fires('seats.attention_refilled')).toBeGreaterThan(0);
    // The refill control: a week that ends with points left refills to exactly the cap, not the cap plus the remainder.
    const spare = days(world, start, 7, { 1: [press, press] });
    expect(spare.results[5]!.state.seatAttention[lead]).toEqual({ attnLeft: 10, attnRefilledDay: 0 });
    expect(spare.state.seatAttention[lead]).toEqual({ attnLeft: 12, attnRefilledDay: 7 });
  });

  it('prices by the pack’s table: approving and sending back free, an edit 1, a special messenger its own price on top', () => {
    const world = indexedFixture();
    const s = createState(world, { seed: 1 });
    const review = (action: 'approve' | 'edit' | 'send_back') => ({ cmd: 'review', to: POST('a_army'), action, edit: action === 'edit' ? { kind: 'timing', axis: null, region: null, via: [], concentration: 0 } : null, route: 'wire', bypass: false }) as Command;
    expect([attentionPrice(world, s, review('approve')), attentionPrice(world, s, review('send_back')), attentionPrice(world, s, review('edit'))]).toEqual([0, 0, 1]);
    expect(attentionPrice(world, s, { cmd: 'inquire', to: POST('a_army'), subject: null, route: 'special-messenger' })).toBe(world.rules.latency.specialMessengerPrice);
    expect(attentionPrice(world, s, { cmd: 'consult', situation: S('x'), posts: [POST('a_office')] })).toBe(1);
    expect(attentionPrice(world, s, { cmd: 'decide', situation: S('x'), options: [] })).toBe(0);
    // Lane 1.7's call for regiments is an order to a governor, priced as an order.
    expect(attentionPrice(world, s, { cmd: 'call', to: POST('a_office'), regiments: 1, termDays: 90, route: 'courier', bypass: false })).toBe(world.map.world.rules.people.attention.costs.order);
  });
});

describe('the people verbs, each an order to a person answered with typed reasons', () => {
  it('relieve outright, then appoint: each answered through his compliance, recorded by proxy, and reported back', () => {
    const world = indexedFixture();
    const start = createState(world, { seed: 1 });
    const first = days(world, start, 6, { 1: [{ cmd: 'relieve', post: POST('a_reserve'), mode: 'outright', to: null, route: 'courier' }] });
    expect(first.state.postStates[POST('a_reserve')]!.postHolder).toBeNull();
    // Relief by its mode: a heavy grievance, his regard and standing fall.
    expect(first.state.personGrievances[P('a_bold')]).toEqual([expect.objectContaining({ grievanceKind: 'relieved', grievanceWeight: 250, grievanceAgainst: P('a_lead'), grievanceCause: 'outright' })]);
    expect(first.state.personRegard[P('a_bold')]![P('a_lead')]).toBe(300 - 250);
    const relieved = answers(first.state, 'a_bold');
    expect(relieved.map((r) => [r.respRole, r.respActual])).toEqual([['addressee', expect.any(String)]]);
    expect(relieved[0]!.respReasons.length).toBeGreaterThan(0);
    // Now the vacant post is filled by appointment, with a promise of advancement kept by it.
    const second = days(world, first.state, 6, { 7: [{ cmd: 'promise', person: P('a_spy') }, { cmd: 'appoint', post: POST('a_reserve'), person: P('a_spy'), rank: null, route: 'courier' }] });
    expect(second.state.postStates[POST('a_reserve')]!.postHolder).toBe(P('a_spy'));
    expect(second.state.personPromises[P('a_spy')]).toBeUndefined();
    expect([first.fires('verbs.answered'), second.fires('verbs.answered'), second.fires('people.promise_kept')]).toEqual([1, 1, 1]);
    expect(answered(second.state)).toEqual(expect.arrayContaining([expect.stringMatching(/^a_bold:relieve:/), expect.stringMatching(/^a_spy:appoint:[a-z_]+:1$/)]));
  });

  it('a transfer: the sending commander picks the blocks by his own answer, or declines and says why', () => {
    const world = indexedFixture({ posts: { a_reserve: { strength: 600 } } });
    const go = days(world, createState(world, { seed: 1 }), 6, { 1: [{ cmd: 'transfer', from: POST('a_reserve'), to: POST('a_army'), force: 'men', amount: 300, route: 'courier' }] });
    expect(go.state.forceAssignments[toId('forceBlock', 'a_reserve_1')]).toBe(POST('a_army'));
    // A candid man who distrusts his principal and is told to give up his men objects: nothing moves, and his memorandum says why.
    const sour = indexedFixture({ persons: { a_bold: { regard: 'low', candour: 'high', values: ['reputation'] } } });
    const no = days(sour, createState(sour, { seed: 1 }), 6, { 1: [{ cmd: 'transfer', from: POST('a_reserve'), to: POST('a_army'), force: 'men', amount: 300, route: 'courier' }] });
    expect(no.state.forceAssignments[toId('forceBlock', 'a_reserve_1')]).toBe(POST('a_reserve'));
    const answer = answers(no.state, 'a_bold')[0]!;
    expect(['object', 'refuse']).toContain(answer.respActual);
    expect(answer.respReasons.map((r) => r.kind)).toEqual(expect.arrayContaining(['values_offended', 'distrusts_leader']));
    const memo = knowledgeOf(no.state, lead).knownReports.find((r) => r.knownBody.reportType === 'advice' && r.knownBody.reportAuthor === P('a_bold'))!;
    expect(memo.knownBody.reportAdvice!.adviceReasons.map((x) => x.reasonKind)).toContain('values_offended');
    expect([go.fires('verbs.answered'), no.fires('verbs.declined')]).toEqual([1, 1]);
  });

  it('inquire: he reports where he stands and the enemy as he believes it; past the week’s free inquiries he is pestered', () => {
    const world = indexedFixture();
    const ask: Command = { cmd: 'inquire', to: POST('a_army'), subject: R('b_front'), route: 'courier' };
    const run = days(world, createState(world, { seed: 1 }), 10, { 2: [ask], 3: [ask], 4: [ask] });
    expect(fired(run.results)).toEqual([]);
    expect(run.state.personInquiries[P('a_gen')]!.length).toBe(3);
    expect(run.state.personGrievances[P('a_gen')]?.map((g) => g.grievanceKind)).toEqual(['pestered']);
    const reports = knowledgeOf(run.state, lead).knownReports.filter((r) => r.knownBody.reportAuthor === P('a_gen') && r.knownBody.reportClaims.some((c) => c.claimKind === 'verb-answered'));
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]!.knownBody.reportClaims.map((c) => c.claimKind)).toEqual(expect.arrayContaining(['position', 'verb-answered']));
  });

  it('consult: each holder recommends by his values in writing, and his answer becomes a stance on record', () => {
    const sit = decision('choice', { options: [option('stand', 1, { honours: ['caution'] }), option('strike', 2, { honours: ['glory'] })], staffLine: { authors: [POST('a_office')], recommends: ['stand'], reasons: [{ kind: 'momentum', weight: 600 }], confidence: 700 }, historicalDefault: { options: ['stand'] } });
    const world = indexedFixture({}, [sit]);
    const start = createState(world, { seed: 3, drivers: { a_lead: 'human' } });
    const run = days(world, start, 10, { 3: [{ cmd: 'consult', situation: S('choice'), posts: [POST('a_office'), POST('a_reserve')] }] });
    expect(fired(run.results)).toEqual([]);
    expect(run.state.personStances[P('a_sec')]).toEqual([expect.objectContaining({ stanceSubject: 'choice', stanceRecommends: 'stand' })]);
    expect(run.state.personStances[P('a_bold')]).toEqual([expect.objectContaining({ stanceSubject: 'choice', stanceRecommends: 'strike' })]);
    const advice = knowledgeOf(run.state, lead).knownReports.filter((r) => r.knownBody.reportType === 'advice' && r.knownBody.reportSubtype === 'requested' && r.knownBody.reportDay >= 3);
    // The staff line's own advice (day 1) is the situation's; the consultation adds one letter per holder.
    expect(advice.map((r) => r.knownBody.reportAdvice!.adviceRecommends).sort()).toEqual(['stand', 'strike']);
    expect(run.fires('verbs.consulted')).toBe(2);
  });

  it('send an observer: he watches, the watched man is monitored and watched more closely (its own typed term), and letters come', () => {
    const world = indexedFixture();
    const run = days(world, createState(world, { seed: 1 }), 21, { 1: [{ cmd: 'observer', person: P('a_spy'), to: POST('a_army'), route: 'courier' }] });
    expect(run.state.observerPostings[P('a_spy')]).toEqual(expect.objectContaining({ obsPost: POST('a_army'), obsSender: P('a_lead') }));
    expect(run.state.personGrievances[P('a_gen')]?.map((g) => g.grievanceKind)).toContain('monitored');
    const context = contextFor(world, run.state, P('a_gen'));
    expect(context.oversightTerms).toEqual([{ source: 'observer', amount: 150 }]);
    // The base oversight stand-in is untouched: the observer's term sits on top of it.
    expect(context.oversight).toBe(world.map.world.rules.people.context.oversight);
    expect(answerOrder(world, run.state, P('a_gen'), P('a_lead'), orderTerms(world.map.world.rules.people, 'verb:inquire')).reasons).toContainEqual({ kind: 'watched', source: 'observer', amount: 150 });
    expect(run.fires('reports.observer_letter')).toBeGreaterThan(0);
    expect(knowledgeOf(run.state, lead).knownReports.some((r) => r.knownBody.reportType === 'observer-letter' && r.knownBody.reportAuthor === P('a_spy'))).toBe(true);
  });

  it('promise, pressure and address act in Washington: a promise falls due and breaks, pressure leaves a grievance, address is a proposal for politics', () => {
    const world = indexedFixture();
    const run = days(world, createState(world, { seed: 1 }), 35, { 1: [{ cmd: 'promise', person: P('a_bold') }, { cmd: 'pressure', person: P('a_gen') }] });
    expect(run.state.personPromises[P('a_bold')]).toBeUndefined();
    expect(run.state.personGrievances[P('a_bold')]?.map((g) => g.grievanceKind)).toEqual(['promise_broken']);
    expect(run.state.personRegard[P('a_bold')]![P('a_lead')]).toBe(300 - 150);
    expect([run.fires('verbs.in_washington'), run.fires('people.promise_broken')]).toEqual([2, 1]);
    const addressed = tick(world, createState(world, { seed: 1 }), [{ day: 1, seat: lead, command: { cmd: 'address', bloc: 'nobody' } }]);
    expect(addressed.rejections.map((r) => r.reason)).toEqual(['unknown_bloc']);
    const promisedTwice = tick(world, createState(world, { seed: 1 }), [{ day: 1, seat: lead, command: { cmd: 'promise', person: P('a_bold') } }, { day: 1, seat: lead, command: { cmd: 'promise', person: P('a_bold') } }]);
    expect(promisedTwice.rejections.map((r) => r.reason)).toEqual(['already_promised']);
  });

  it('refuses a verb from anyone but the principal, and an appointment of an unknown rank (FOUNDATION 11.3)', () => {
    const world = indexedFixture();
    const s = createState(world, { seed: 1 });
    const bySec = tick(world, s, [{ day: 1, seat: seatIdFor(P('a_sec')), command: { cmd: 'pressure', person: P('a_gen') } }]);
    expect(bySec.rejections.map((r) => r.reason)).toEqual(['not_a_principal']);
    const vacant = days(world, s, 6, { 1: [{ cmd: 'relieve', post: POST('a_reserve'), mode: 'outright', to: null, route: 'courier' }] }).state;
    const ranked = tick(world, vacant, [{ day: 7, seat: lead, command: { cmd: 'appoint', post: POST('a_reserve'), person: P('a_spy'), rank: 'field_marshal', route: 'courier' } }]);
    expect(ranked.rejections.map((r) => r.reason)).toEqual(['unknown_rank']);
    expect(() => applyPeopleChanges(s, [{ change: 'rank', person: P('a_gen'), kind: 'regular', rank: 'colonel', since: '1900-06-02' }], 1, world.map.world.rules.people, [{ id: 'colonel', kind: 'volunteer' }])).toThrow('rank "colonel" is a volunteer rank, not regular');
  });
});

describe('the audience, before and during a plan (P3)', () => {
  it('refuses an audience with no plan at issue without charging attention or sending a message', () => {
    const world = indexedFixture();
    const state = createState(world, { seed: 1 });
    const command: AudienceCommand = { cmd: 'audience', to: POST('a_army'), counters: [] };
    expect(state.planRecords[command.to]).toBeUndefined();
    expect(attentionPrice(world, state, command)).toBeGreaterThan(0);
    const issued = tick(world, state, [{ day: 1, seat: lead, command }], { freeze: true });
    expect(issued.rejections.map((r) => r.reason)).toEqual(['bad_counters']);
    expect(issued.state.seatAttention[lead]!.attnLeft).toBe(state.seatAttention[lead]!.attnLeft);
    expect(issued.state.messagesInTransit.filter((m) => m.msgVerb?.verbKind === 'audience')).toEqual([]);
    expect(issued.state.audienceHeld).toEqual(state.audienceHeld);
  });

  it('before: he states his reasons about a goal not yet sent; only counters that answer them are offered; a preview changes nothing', () => {
    const world = indexedFixture();
    const pressed = days(world, createState(world, { seed: 1 }), 1, { 1: [{ cmd: 'pressure', person: P('a_gen') }] }).state;
    const before = previewAudience(world, pressed, P('a_lead'), POST('a_army'), [], 2, 'advance');
    if (typeof before === 'string') throw new Error(before);
    expect(before.about).toBe('before');
    expect(before.statedReasons.map((r) => r.kind)).toEqual(expect.arrayContaining(['holds_grievance']));
    expect(before.options.map((o) => o.counter)).toEqual(expect.arrayContaining(['ease_pressure', 'threaten']));
    expect(before.options.map((o) => o.counter)).not.toContain('promise_advancement');
    // Easing the pressure answers his grievance: previewed, his willingness rises; the State is untouched.
    const eased = previewAudience(world, pressed, P('a_lead'), POST('a_army'), [counter('ease_pressure')], 2, 'advance');
    if (typeof eased === 'string') throw new Error(eased);
    expect(eased.response.willingness).toBeGreaterThan(before.response.willingness);
    expect(pressed.personGrievances[P('a_gen')]?.map((g) => g.grievanceKind)).toEqual(['pressured']);
  });

  it('during: held about an approved plan, the counters take effect through their owners; a second audience the same week is refused', () => {
    const world = indexedFixture();
    const s = createState(world, { seed: 1 });
    const withPlan = days(world, s, 1, { 1: [{ cmd: 'pressure', person: P('a_gen') }] }).state;
    const during = planned(withPlan);
    const telemetry = createTelemetry(MECHANICS);
    const r = audienceArrives(world, during, { cmd: 'audience', to: POST('a_army'), counters: [counter('ease_pressure'), counter('vindicate')] }, telemetry);
    expect(telemetry.mechanics['verbs.audience']!.fires).toBe(1);
    expect(r.rejections).toEqual([]);
    expect(r.state.audienceHeld[P('a_gen')]).toEqual({ audDay: r.day, audAbout: 'during', audCounters: ['ease_pressure', 'vindicate'] });
    expect(r.state.personGrievances[P('a_gen')]).toBeUndefined();
    expect(r.state.personRegard[P('a_gen')]![P('a_lead')]).toBe(300 + 150);
    expect(r.state.seatAttention[lead]!.attnLeft).toBe(12 - 1 - 1);
    expect(audienceResponse(r.state).respRole).toBe('addressee');
    const again = tick(world, r.state, [{ day: r.day + 1, seat: lead, command: { cmd: 'audience', to: POST('a_army'), counters: [] } }]);
    expect(again.rejections.map((x) => x.reason)).toEqual(['too_soon']);
    // A counter that answers nothing he holds is refused, and a refused audience changes nothing.
    const bad = tick(world, s, [{ day: 1, seat: lead, command: { cmd: 'audience', to: POST('a_army'), counters: [counter('ease_pressure')] } }]);
    expect(bad.rejections.map((x) => x.reason)).toEqual(['bad_counters']);
  });
});

/**
 * M2's audience cases (`audience.test.ts`, on the M2 kernel) moved onto the new State, one for one. a_gen (timid,
 * cautious, candid enough) holds a_army; the subject is an advance (bold, honours glory, offends caution).
 */
describe('M2’s audience cases on the new State (P3)', () => {
  const world = indexedFixture();
  const preview = (state: State, counters: CounterTerms[] = []) => {
    const o = previewAudience(world, state, P('a_lead'), POST('a_army'), counters, 1, 'advance');
    if (typeof o === 'string') throw new Error(o);
    return o;
  };
  const hold = (state: State, counters: CounterTerms[]) => audienceArrives(world, planned(state), { cmd: 'audience', to: POST('a_army'), counters });

  it('M2 case 1: a candid man states his reasons, and only matching counters are offered', () => {
    const o = preview(createState(world, { seed: 1 }));
    expect(['object', 'refuse', 'comply_with_reservations']).toContain(o.declared);
    expect(o.statedReasons.map((r) => r.kind)).toEqual(expect.arrayContaining(['values_offended', 'too_rash']));
    expect(o.options.map((x) => x.counter)).toEqual(['frame', 'adjust', 'threaten']);
    expect(o.frames).toEqual(['caution']);
  });

  it('M2 case 2: answering his stated reasons moves him, and a cautious man must be met most of the way', () => {
    // M2's a_wary had no regard to spend; here a_gen's regard for his leader is average, so only the counters move him.
    const cool = indexedFixture({ persons: { a_gen: { regard: 'average' } } });
    const s = createState(cool, { seed: 1 });
    const at = (counters: CounterTerms[]) => {
      const o = previewAudience(cool, s, P('a_lead'), POST('a_army'), counters, 1, 'advance');
      if (typeof o === 'string') throw new Error(o);
      return o;
    };
    const plain = at([]);
    const halfway = at([counter('frame', { value: 'caution' }), counter('adjust', { boldness: 500 })]);
    const met = at([counter('frame', { value: 'caution' }), counter('adjust', { boldness: 250 })]);
    expect([halfway.problems, met.problems]).toEqual([[], []]);
    expect(halfway.response.willingness).toBeGreaterThan(plain.response.willingness);
    expect(met.response.willingness).toBeGreaterThan(halfway.response.willingness);
    // The rungs, as M2 had them: met halfway he still objects; met most of the way he complies with reservations.
    expect([plain.declared, halfway.declared, met.declared]).toEqual(['object', 'object', 'comply_with_reservations']);
    expect(met.statedReasons.map((r) => r.kind)).not.toContain('too_rash');
  });

  it('M2 case 3: a preview never changes the game', () => {
    const s = createState(world, { seed: 1 });
    const before = JSON.stringify(s);
    preview(s, [counter('threaten'), counter('frame', { value: 'caution' })]);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('M2 case 4: grievances are not interchangeable: reinforcements do not answer a man passed over', () => {
    const o = preview(passedOver(world, createState(world, { seed: 1 })));
    const grievance = o.statedReasons.find((r) => r.kind === 'holds_grievance');
    expect(grievance).toEqual({ kind: 'holds_grievance', grievance: 'passed_over', weight: 300 });
    expect(o.options.find((x) => x.counter === 'promise_advancement')?.answers).toEqual([grievance]);
    expect(o.options.some((x) => x.counter === 'reinforce')).toBe(false);
  });

  it('M2 case 5: an uncandid man hides his grievance, so nothing is offered to answer it', () => {
    const shy = indexedFixture({ persons: { a_gen: { candour: 'low' } } });
    const s = passedOver(shy, createState(shy, { seed: 1 }));
    const o = previewAudience(shy, s, P('a_lead'), POST('a_army'), [], 1, 'advance');
    if (typeof o === 'string') throw new Error(o);
    expect(o.statedReasons.some((r) => r.kind === 'holds_grievance')).toBe(false);
    expect(o.options.some((x) => x.counter === 'promise_advancement')).toBe(false);
  });

  it('M2 case 6: a promise of advancement clears the grievance now, and is recorded as a promise to keep', () => {
    const r = hold(passedOver(world, createState(world, { seed: 1 })), [counter('promise_advancement')]);
    expect(r.rejections).toEqual([]);
    expect(r.state.personGrievances[P('a_gen')]).toBeUndefined();
    expect(r.state.personPromises[P('a_gen')]).toEqual([expect.objectContaining({ promiseKind: 'advancement', promiseDay: r.day })]);
  });

  it('M2 case 7: promised reinforcements are an order to another holder, who answers it by his own compliance', () => {
    const strong = indexedFixture({ posts: { a_reserve: { strength: 600 } } });
    const r = audienceArrives(strong, planned(createState(strong, { seed: 1 })), { cmd: 'audience', to: POST('a_army'), counters: [counter('reinforce', { from: POST('a_reserve'), men: 300 })] });
    expect(r.rejections).toEqual([]);
    // The promise is not the men: a transfer order goes by courier to a_reserve's holder, and he answers it himself.
    expect(r.state.forceAssignments[toId('forceBlock', 'a_reserve_1')]).toBe(POST('a_reserve'));
    const later = days(strong, r.state, 6);
    expect(answered(later.state)).toEqual(expect.arrayContaining([expect.stringMatching(/^a_bold:transfer:/)]));
    expect(later.state.forceAssignments[toId('forceBlock', 'a_reserve_1')]).toBe(POST('a_army'));
  });

  it('M2 case 7, its second half: during a plan he reads its own terms, and a promised reinforcement shrinks the shortfall he states, as far as promises are believed', () => {
    const w = indexedFixture();
    const take = { cmd: 'order', to: POST('a_army'), goal: goalTerms('take', 'b_mid'), route: 'special-messenger', bypass: true } as Command;
    const approve = { cmd: 'review', to: POST('a_army'), action: 'approve', edit: null, route: 'special-messenger', bypass: true } as Command;
    // a_gen drafts a plan against the 1152 men he believes hold b_mid, and asks for it to be reviewed: it is approved.
    let run = days(w, createState(w, { seed: 7 }), 2, { 1: [take] });
    for (let i = 0; i < 6 && run.state.planRecords[POST('a_army')]?.planStatus !== 'approved'; i++) {
      const day = run.state.stateDay + 1;
      run = days(w, run.state, 1, run.state.planRecords[POST('a_army')]?.planStatus === 'review' ? { [day]: [approve] } : {});
    }
    expect(run.state.planRecords[POST('a_army')]?.planStatus).toBe('approved');
    const day = run.state.stateDay + 1;
    const reading = planReading(w, run.state, POST('a_army'), day)!;
    // Before a plan the audience reads the goal's terms, which never carry a required strength; the plan's own do.
    expect(reading.terms.required).toBeGreaterThan(0);
    const at = (counters: CounterTerms[]) => {
      const o = previewAudience(w, run.state, P('a_lead'), POST('a_army'), counters, day, null, reading);
      if (typeof o === 'string') throw new Error(o);
      return o;
    };
    const shortfall = (o: ReturnType<typeof at>) => o.statedReasons.flatMap((r) => (r.kind === 'lacks_resources' ? [r.shortfall] : []))[0] ?? 0;
    const plain = at([]);
    expect(plain.about).toBe('during');
    expect(shortfall(plain)).toBeGreaterThan(0);
    expect(plain.options.find((o) => o.counter === 'reinforce')?.answers.map((r) => r.kind)).toEqual(['lacks_resources']);
    const men = 200;
    const reinforced = at([counter('reinforce', { from: POST('a_reserve'), men })]);
    // The promise counts at the principal's credibility: half the men, on the plan's scale.
    const believed = Math.trunc((Math.trunc((men * 500) / reading.strength) * w.map.world.rules.politics.credibility.base) / 1000);
    expect(shortfall(reinforced)).toBe(Math.max(0, shortfall(plain) - believed));
    expect(shortfall(reinforced)).toBeLessThan(shortfall(plain));
    // Held in the tick, the audience reads the same plan: his recorded answer states the reduced shortfall, and the promise goes as a transfer order.
    const held = audienceArrives(w, run.state, { cmd: 'audience', to: POST('a_army'), counters: [counter('reinforce', { from: POST('a_reserve'), men })] });
    expect(held.rejections).toEqual([]);
    expect(audienceResponse(held.state).respReasons).toContainEqual({ kind: 'lacks_resources', shortfall: shortfall(reinforced) });
  });

  it('M2 case 8: counters are limited and validated, and a refused audience changes nothing', () => {
    const s = createState(world, { seed: 1 });
    expect(preview(s, [counter('frame', { value: 'glory' })]).problems[0]).toContain('cannot be framed as glory');
    const refused = hold(s, [counter('frame', { value: 'glory' })]);
    expect(refused.rejections.map((x) => x.reason)).toEqual(['bad_counters']);
    expect([refused.state.audienceHeld, refused.state.personGrievances, refused.state.seatAttention[lead]!.attnLeft]).toEqual([{}, {}, 12]);
    const tooMany = preview(s, [counter('threaten'), counter('frame', { value: 'caution' }), counter('adjust', { boldness: 400 }), counter('vindicate')]);
    expect(tooMany.problems[0]).toContain('at most 3');
  });

  it('M2 case 9: threats answer nothing and leave a grievance', () => {
    const o = preview(createState(world, { seed: 1 }));
    expect(o.options.find((x) => x.counter === 'threaten')?.answers).toEqual([]);
    const r = hold(createState(world, { seed: 1 }), [counter('threaten')]);
    expect(r.state.personGrievances[P('a_gen')]?.map((g) => g.grievanceKind)).toEqual(['pressured']);
  });
});

describe('the ladder, rivals and seat initiatives (P5, P6; 0040)', () => {
  it('a man with grievances climbs one rung a week; a famous one on lobbying becomes a rival; his rung costs willingness', () => {
    const world = indexedFixture();
    const s = createState(world, { seed: 1 });
    const sore = applyPeopleChanges(s, [{ change: 'grievance', person: P('a_bold'), kind: 'overruled', weight: 2000, against: P('a_lead'), cause: null }, { change: 'standing', person: P('a_bold'), delta: 400 }], 0, world.map.world.rules.people, []);
    // One rung a week, never a jump: grumbling, foot-dragging, then lobbying on day 21, where his standing makes him a rival.
    const run = days(world, sore, 21);
    expect(run.state.personRungs[P('a_bold')]).toBe('lobbying');
    expect(run.state.personRivals[P('a_bold')]).toBe(21);
    expect([run.fires('ladder.moved'), run.fires('ladder.rival')]).toEqual([3, 1]);
    expect(run.fires('people.grievances_faded')).toBeGreaterThan(0);
    expect(contextFor(world, run.state, P('a_bold')).disposition).toBe(-3 * world.map.world.rules.people.verbs.ladder.dispositionPerRung);
  });

  it('an initiative fires through the same compliance machinery, reaches the principal as a memorandum, and waits out its cooldown', () => {
    const base = indexedFixture();
    const world = withPeople(base, { initiatives: [{ id: 'write_to_the_press', kinds: ['officer'], boldness: 800, honours: ['glory'], offends: [], fromRung: 'loyal', cooldownDays: 28, recommends: 'publish' }] });
    const run = days(world, createState(world, { seed: 1 }), 21);
    // a_bold (bold, glory-seeking, regards his leader) takes it on day 7; the timid and cautious do not.
    expect(run.state.seatInitiatives).toEqual({ [seatIdFor(P('a_bold'))]: { write_to_the_press: 7 } });
    expect(run.results.flatMap((r) => r.events.filter((e) => e.event === 'initiative').map((e) => `${r.day}:${e.person}`))).toEqual(['7:a_bold']);
    const memo = knowledgeOf(run.state, lead).knownReports.find((r) => r.knownBody.reportAdvice?.adviceRecommends === 'publish')!;
    expect(memo.knownBody.reportSubtype).toBe('memorandum');
    expect(run.fires('seats.initiative')).toBe(1);
  });
});

describe('cost-only values (0074): honouring one never helps its holder', () => {
  it('adds nothing to willingness and gives no reason when honoured, still costs when offended, and cannot frame an audience', () => {
    const base = indexedFixture({ persons: { a_gen: { values: ['old_order', 'caution'] } } });
    const values = [...base.map.world.vocabularies.values.map((v) => ({ id: v.id, costOnly: false })), { id: 'old_order', costOnly: true }];
    const world = withPeople(base, {}, values);
    const s = createState(world, { seed: 1 });
    const read = (honours: string[], offends: string[]) => answerOrder(world, s, P('a_gen'), P('a_lead'), { boldness: 200, honours, offends, required: 0 });
    const plain = read([], []);
    const honoured = read(['old_order'], []);
    expect(honoured.willingness).toBe(plain.willingness);
    expect(honoured.contributions.find((c) => c.term === 'values')!.amount).toBe(0);
    expect(honoured.reasons.some((r) => r.kind === 'values_honoured')).toBe(false);
    expect(read([], ['old_order']).willingness).toBe(plain.willingness - world.map.world.rules.people.compliance.valueWeight);
    // An ordinary value he holds still helps, so the flag is what makes the difference.
    expect(read(['caution'], []).willingness).toBe(plain.willingness + world.map.world.rules.people.compliance.valueWeight);
    const audience = previewAudience(world, s, P('a_lead'), POST('a_army'), [counter('frame', { value: 'old_order' })], 1, 'hold');
    if (typeof audience === 'string') throw new Error(audience);
    expect(audience.frames).toEqual(['caution']);
    expect(audience.problems[0]).toContain('cannot be framed as old_order');
  });

  it('for every cost-only value of the Union pack’s vocabulary, no compliance term on its holder is positive (rule 7)', () => {
    const base = indexedFixture();
    const union = ['slavery_defence', 'slavery_noninterference'];
    const values = [...base.map.world.vocabularies.values.map((v) => ({ id: v.id, costOnly: false })), ...union.map((id) => ({ id, costOnly: true }))];
    const world = withPeople(base, {}, values);
    const s = createState(world, { seed: 1 });
    for (const v of union) {
      const profile = { ...profileOf(world, s, P('a_gen'), P('a_lead')), values: [v] };
      const r = resolveDirective(profile, { boldness: profile.boldness, honours: [v], offends: [], required: 0 }, contextFor(world, s, P('a_gen')), world.map.world.rules.people.compliance);
      expect(r.contributions.find((c) => c.term === 'values')!.amount, v).toBe(0);
      expect(r.reasons.some((x) => x.kind === 'values_honoured'), v).toBe(false);
      expect(r.actual === 'exceed', v).toBe(false);
    }
  });
});

describe('the map from orders to values (0074)', () => {
  it('counts pushback from every person on the side who holds an offended value, and a row is never cheaper than the row it names', () => {
    const base = indexedFixture();
    const rules = base.map.world.rules.people;
    const world = withPeople(base, {
      orderValues: [
        ...rules.verbs.orderValues,
        { order: 'policy:shelter', boldness: 400, honours: [], offends: ['caution', 'order'], gateTopics: ['fen-flight'], notCheaperThan: null, clashes: [] },
        { order: 'policy:send_back', boldness: 400, honours: [], offends: ['glory'], gateTopics: ['fen-flight'], notCheaperThan: 'policy:shelter', clashes: [] },
      ],
    });
    const s = createState(world, { seed: 1 });
    const shelter = pushbackOf(world, s, 'policy:shelter', [P('a_gen')], P('a_lead'));
    // a_sec and a_gen (caution) and a_clerk (order) are on the side and hold what sheltering offends.
    expect(shelter.terms.filter((t) => t.source === 'values').map((t) => t.person).sort()).toEqual(['a_clerk', 'a_gen', 'a_sec', 'a_spy']);
    const sendBack = pushbackOf(world, s, 'policy:send_back', [P('a_gen')], P('a_lead'));
    // Only a_bold holds glory, so sending back would be cheaper; by construction it is not.
    expect(sendBack.total).toBe(shelter.total);
    expect(sendBack.floor).toBe('policy:shelter');
  });

  it('refuses a notCheaperThan chain that loops, which pushbackOf would follow without end (review S1)', () => {
    const base = indexedFixture();
    const rules = base.map.world.rules.people;
    const values = base.map.world.vocabularies.values.map((v) => v.id);
    const kinds = base.map.world.vocabularies.personKinds.map((k) => k.id);
    const row = (order: string, floor: string | null) => ({ order, boldness: 400, honours: [], offends: [], gateTopics: [], notCheaperThan: floor, clashes: [] });
    const check = (extra: ReturnType<typeof row>[]) => verbRulesProblems(rules.attention, { ...rules.verbs, orderValues: [...rules.verbs.orderValues, ...extra] }, values, kinds);
    expect(check([row('policy:a', null), row('policy:b', 'policy:a')])).toEqual([]);
    expect(check([row('policy:self', 'policy:self')])).toEqual(['people rule orderValues.policy:self.notCheaperThan loops back to itself: policy:self -> policy:self']);
    expect(check([row('policy:a', 'policy:b'), row('policy:b', 'policy:a'), row('policy:c', 'policy:a')])).toEqual([
      'people rule orderValues.policy:a.notCheaperThan loops back to itself: policy:a -> policy:b -> policy:a',
      'people rule orderValues.policy:b.notCheaperThan loops back to itself: policy:b -> policy:a -> policy:b',
    ]);
    // A World with a loop does not index, so no tick ever reaches pushbackOf with one.
    expect(() => withPeople(base, { orderValues: [...rules.verbs.orderValues, row('policy:self', 'policy:self')] })).toThrow('loops back to itself');
  });
});

describe('regard between people (lane 1.5’s column)', () => {
  it('starts from the World’s cited regard for others, and the unknown elsewhere', () => {
    const world = indexedFixture();
    const people = world.map.world.people.map((p) => (p.id === P('a_gen') ? { ...p, regardOthers: [{ toward: P('a_bold'), direction: 'low' as const, cites: [{ source: 'FIXTURE', at: null }] }] } : p));
    const w2 = indexSeatsWorld(indexWorld({ ...world.map.world, people }), world.start);
    const s = createState(w2, { seed: 1 });
    expect(s.personRegard[P('a_gen')]).toEqual({ a_bold: -1000, a_lead: 300 });
    expect(s.personRegard[P('a_bold')]).toEqual({ a_lead: 300 });
  });
});

function option(id: string, displayKey: number, over: Partial<OptionDef> = {}): OptionDef {
  return { id, label: `situation.x.option.${id}`, displayKey, proposedBy: [P('a_sec')], group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, effects: [], lockedCosts: [], orders: [], honours: [], watched: false, policy: null, gate: null, ...over };
}

function decision(id: string, over: Partial<SituationDef> = {}): SituationDef {
  return {
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
    inaction: { text: `situation.${id}.inaction`, effects: [{ setFlag: `${id}_ignored` }], policy: null },
    historicalDefault: { options: ['hold'] },
    staffLine: { authors: [POST('a_office')], recommends: ['hold'], reasons: [{ kind: 'momentum', weight: 600 }], confidence: 700 },
    delegableTo: [POST('a_office')],
    resurfaceOn: [],
    effects: [],
    report: null,
    gate: { none: 'test fixture' },
    gateReview: null,
    citations: [],
    ...over,
  };
}

void (null as unknown as PersonId);
