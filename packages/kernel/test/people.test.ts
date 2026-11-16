import { describe, expect, it } from 'vitest';
import { toId, type PersonId } from '../src/ids.ts';
import { applyPeopleChanges, drawStat, initialPeople } from '../src/people/people.ts';
import { peopleRulesProblems, type PeopleRules } from '../src/people/rules.ts';
import { perceptionBias, traitsOf } from '../src/people/traits.ts';
import { answerOrder, goalTerms } from '../src/reading/orders.ts';
import { createStream } from '../src/rng.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { indexWorld } from '../src/world/index.ts';
import type { World } from '../src/world/world.ts';
import { forcesStart, forcesWorld, person } from './support/forces-fixture.ts';
import { edge, FIXTURE_PEOPLE_RULES, FIXTURE_VALUES, region } from './support/map-fixture.ts';
import { indexedFixture } from './support/seats-fixture.ts';
import { order } from './support/test-seats.ts';

/**
 * People as State, owned by `people` (lane 1.1; FOUNDATION sections 6 and 10). Setting-free (0003).
 */
const PR = (id: string): PersonId => toId('person', id);

/** A World whose shadow draws with the packs' spread (100 around a cited centre, 200 around an unknown one). */
function shadowWorld(people = ['ann', 'bob', 'cy'], rules: Partial<PeopleRules['shadow']> = {}): World {
  const base = forcesWorld({
    regions: [region('a1'), region('a2')],
    edges: [edge('a1', 'a2')],
    people: people.map((id) => person(id, 'a', { boldness: 'high', candour: 'low', reputation: 'average', values: ['glory'] })),
  });
  const shadow = { ...FIXTURE_PEOPLE_RULES.shadow, centrePermille: { high: 800, above: 650, average: 500, below: 350, low: 200 }, spread: 100, unknownSpread: 200, ...rules };
  return { ...base, rules: { ...base.rules, people: { ...base.rules.people, shadow } } };
}
const START = forcesStart({ a1: { a: 1000 }, a2: { a: 1000 } }, [], []);

describe("history's shadow: true stats drawn at setup from cited centres (FOUNDATION section 6; 0005, 0026)", () => {
  it('draws each stat within its spread of the cited centre, and unknown stats more widely around the unknown centre', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const p = initialPeople(indexWorld(shadowWorld()), START, seed, 'shadow');
      for (const id of ['ann', 'bob', 'cy']) {
        const t = p.personTrue[PR(id)]!;
        expect(t.trueBoldness).toBeGreaterThanOrEqual(700);
        expect(t.trueBoldness).toBeLessThanOrEqual(900);
        expect(t.trueCandour).toBeGreaterThanOrEqual(100);
        expect(t.trueCandour).toBeLessThanOrEqual(300);
        // Competence has no cited centre in this World: the unknown centre, the wider spread.
        expect(t.trueCompetence).toBeGreaterThanOrEqual(300);
        expect(t.trueCompetence).toBeLessThanOrEqual(700);
        expect(p.personStanding[PR(id)]).toBeGreaterThanOrEqual(400);
        expect(p.personStanding[PR(id)]).toBeLessThanOrEqual(600);
      }
    }
  });

  it('is a shadow, not a copy: different seeds give different men, the same seed the same ones', () => {
    const map = indexWorld(shadowWorld());
    const boldness = (seed: number) => initialPeople(map, START, seed, 'shadow').personTrue[PR('ann')]!.trueBoldness;
    expect(new Set([1, 2, 3, 4, 5, 6, 7, 8].map(boldness)).size).toBeGreaterThan(1);
    expect(initialPeople(map, START, 7, 'shadow')).toEqual(initialPeople(map, START, 7, 'shadow'));
  });

  it('draws each man on his own named stream: adding a person never shifts another’s draw', () => {
    const few = initialPeople(indexWorld(shadowWorld(['ann', 'cy'])), START, 9, 'shadow');
    const more = initialPeople(indexWorld(shadowWorld(['ann', 'bob', 'cy', 'dee'])), START, 9, 'shadow');
    expect(more.personTrue[PR('ann')]).toEqual(few.personTrue[PR('ann')]);
    expect(more.personTrue[PR('cy')]).toEqual(few.personTrue[PR('cy')]);
    // The stream is the one its name says: the first draw for ann's competence comes from `people/shadow/ann`.
    const stream = createStream(9, `people/shadow/${PR('ann')}`);
    expect(drawStat(shadowWorld().rules.people.shadow, { direction: null, cites: [] }, 'shadow', stream)).toBe(few.personTrue[PR('ann')]!.trueCompetence);
  });

  it('as history puts every stat at its centre; unknown men draws every stat as unknown', () => {
    const map = indexWorld(shadowWorld());
    const history = initialPeople(map, START, 3, 'as-history').personTrue[PR('ann')]!;
    expect(history).toEqual({ trueCompetence: 500, trueNerve: 500, trueExperience: 500, trueBoldness: 800, trueCandour: 200 });
    for (let seed = 1; seed <= 20; seed++) {
      const unknown = initialPeople(map, START, seed, 'unknown-men').personTrue[PR('ann')]!;
      // Cited as bold, but in this setup option nothing is known: the boldness draw spans the unknown range.
      expect(unknown.trueBoldness).toBeGreaterThanOrEqual(300);
      expect(unknown.trueBoldness).toBeLessThanOrEqual(700);
    }
    const seats = indexSeatsWorld(map, START);
    expect(() => createState(seats, { seed: 1, people: 'nonsense' as never })).toThrow('people must be one of shadow, as-history, unknown-men');
    expect(createState(seats, { seed: 1, people: 'as-history' }).personTrue[PR('ann')]).toEqual(history);
  });
});

describe('people State: setup and the one writer (FOUNDATION section 10)', () => {
  it('starts each man serving on day 0, with his traits, his cited regard for his principal, and no grievances or stances', () => {
    const world = indexedFixture();
    const state = createState(world, { seed: 1 });
    expect(state.personStatus[PR('a_gen')]).toEqual({ statusKind: 'serving', statusDay: 0 });
    // a_gen's regard for his principal is cited "above": the fixtures' 300. The principal holds none for himself.
    expect(state.personRegard[PR('a_gen')]).toEqual({ a_lead: 300 });
    expect(state.personRegard[PR('a_lead')]).toBeUndefined();
    expect(state.personGrievances).toEqual({});
    expect(state.personStances).toEqual({});
    expect(traitsOf(world, state, PR('a_gen'))).toEqual({ id: PR('a_gen'), boldness: 200, candour: 500, standing: 500, regard: 300, values: ['caution'] });
  });

  it('applies typed changes: standing and regard clamped, regard kept sparse, grievances, status, stances and ranks with their day', () => {
    const world = indexedFixture();
    const state = createState(world, { seed: 1 });
    const next = applyPeopleChanges(
      state,
      [
        { change: 'standing', person: PR('a_gen'), delta: 900 },
        { change: 'regard', person: PR('a_gen'), toward: PR('a_lead'), delta: -300 },
        { change: 'regard', person: PR('a_gen'), toward: PR('a_bold'), delta: -2000 },
        { change: 'grievance', person: PR('a_gen'), kind: 'overruled', weight: 250, against: PR('a_lead'), cause: 'm.4.x' },
        { change: 'status', person: PR('a_gen'), status: 'wounded' },
        { change: 'stance', person: PR('a_sec'), subject: 'sit.harbour', recommends: 'evacuate', confidence: 700 },
        { change: 'rank', person: PR('a_gen'), kind: 'brevet', rank: 'bvt_general', since: '1900-07-04' },
      ],
      4,
    );
    expect(next.personStanding[PR('a_gen')]).toBe(1000);
    // Regard for his principal returned to none and was removed; regard for a rival clamped at -1000.
    expect(next.personRegard[PR('a_gen')]).toEqual({ a_bold: -1000 });
    expect(next.personGrievances[PR('a_gen')]).toEqual([{ grievanceKind: 'overruled', grievanceWeight: 250, grievanceDay: 4, grievanceAgainst: PR('a_lead'), grievanceCause: 'm.4.x' }]);
    expect(next.personStatus[PR('a_gen')]).toEqual({ statusKind: 'wounded', statusDay: 4 });
    expect(next.personStances[PR('a_sec')]).toEqual([{ stanceSubject: 'sit.harbour', stanceRecommends: 'evacuate', stanceDay: 4, stanceConfidence: 700 }]);
    expect(next.personRanks[PR('a_gen')]).toEqual({ brevet: { rankTerm: 'bvt_general', rankSince: '1900-07-04' } });
    // Copy-on-write: the State it was given is unchanged, and no change returns the same State.
    expect(state.personStanding[PR('a_gen')]).toBe(500);
    expect(applyPeopleChanges(state, [], 4)).toBe(state);
    expect(() => applyPeopleChanges(state, [{ change: 'standing', person: PR('ghost'), delta: 1 }], 4)).toThrow('unknown person id "ghost"');
  });

  it('a bypassed relay holds a grievance against the principal who went around him, and it weighs in his next reading', () => {
    const world = indexedFixture({ persons: { a_sec: { values: ['duty'], boldness: 'average', candour: 'low', regard: 'above' } } });
    const lead = seatIdFor(PR('a_lead'));
    const start = createState(world, { seed: 1 });
    const r = tick(world, start, [{ day: 1, seat: lead, command: order('a_army', 'advance', 'b_cap', 'special-messenger', true) }], { freeze: true });
    expect(r.state.personGrievances[PR('a_sec')]).toEqual([{ grievanceKind: 'bypassed', grievanceWeight: 150, grievanceDay: 1, grievanceAgainst: PR('a_lead'), grievanceCause: expect.any(String) }]);
    // 150 is past the reason threshold (100), so he can name it, and it costs him 45 of willingness (300 permille of it).
    const terms = goalTerms(world.rules.people, 'advance');
    const before = answerOrder(world, start, PR('a_sec'), PR('a_lead'), terms);
    const after = answerOrder(world, r.state, PR('a_sec'), PR('a_lead'), terms);
    expect(after.willingness - before.willingness).toBe(-45);
    expect(after.reasons).toContainEqual({ kind: 'holds_grievance', grievance: 'bypassed', weight: 150 });
    expect(before.reasons.some((x) => x.kind === 'holds_grievance')).toBe(false);
  });

  it('reads a man’s perception through the pack’s values, never a value the kernel names', () => {
    const rules = { ...FIXTURE_PEOPLE_RULES.traits, perceptionValues: [{ value: 'order', permille: 300 }] };
    expect(perceptionBias(rules, { id: PR('x'), boldness: 500, values: ['caution'] }).permille).toBe(1000);
    expect(perceptionBias(rules, { id: PR('x'), boldness: 500, values: ['order'] })).toEqual({ permille: 1300, terms: [expect.objectContaining({ termKind: 'perception_bias', termValue: 1300, termRule: 'boldness+order' })] });
  });
});

describe('the people rules are the pack’s, stated whole (0072)', () => {
  it('names only values in the vocabulary, and every number is whole and in range', () => {
    expect(peopleRulesProblems(FIXTURE_PEOPLE_RULES, FIXTURE_VALUES)).toEqual([]);
    expect(peopleRulesProblems(undefined, FIXTURE_VALUES)).toEqual(['the pack states no people rules (rules.people)']);
    const bad: PeopleRules = {
      ...FIXTURE_PEOPLE_RULES,
      shadow: { ...FIXTURE_PEOPLE_RULES.shadow, spread: 1500 },
      goalTerms: [...FIXTURE_PEOPLE_RULES.goalTerms, { goal: 'advance', boldness: 600, honours: ['zeal'], offends: [] }],
      relay: { ...FIXTURE_PEOPLE_RULES.relay, slowWalkHoldDays: -1 },
    };
    expect(peopleRulesProblems(bad, FIXTURE_VALUES)).toEqual([
      'people rule shadow.spread must be a whole permille',
      'people rule goalTerms names goal advance twice',
      'people rule goalTerms.advance names value "zeal", which is not in the pack\'s values vocabulary',
      'people rule relay.slowWalkHoldDays must be a whole number, at least 0',
    ]);
    // The kernel refuses a World whose people rules are wrong, as the validator does.
    const world = indexedFixture();
    const broken = { ...world.map, world: { ...world.map.world, rules: { ...world.map.world.rules, people: bad } } };
    expect(() => indexSeatsWorld(broken, world.start)).toThrow('people rule shadow.spread must be a whole permille');
  });

});
