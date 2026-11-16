import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COMPLIANCE_RULES,
  resolveConflict,
  resolveDirective,
  type CommandContext,
  type DirectiveTerms,
  type ProxyProfile,
} from '../src/index.ts';
import { toId, type PersonId } from '../src/ids.ts';
import { applyPeopleChanges, type PeopleChange } from '../src/people/people.ts';
import { answerOrder, profileOf, resolveOrderConflict } from '../src/reading/orders.ts';
import type { State } from '../src/root-state.ts';
import { indexSeatsWorld, type SeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import { forcesStart, forcesWorld, person, type PersonTemper } from './support/forces-fixture.ts';
import { edge, FIXTURE_PEOPLE_RULES as PEOPLE_RULES, region } from './support/map-fixture.ts';

/**
 * Compliance on the new State (lane 1.1; FOUNDATION section 6). Every case M1 and M2 wrote is kept: each proxy is now a
 * person in people State, his temperament drawn by history's shadow from the World (the fixtures draw with no spread,
 * high 800, above 600, average 500, below 400, low 200), his values cited in the World, and his standing and regard
 * moved by the changes `people` applies, exactly as the press and the verbs will move them. Setting-free (0003): values
 * are arbitrary ids, people and places invented.
 */
const PR = (id: string): PersonId => toId('person', id);
const LEADER = PR('a_leader');

const CAST: Readonly<Record<string, PersonTemper>> = {
  a_leader: { boldness: 'above', candour: 'average', values: ['duty'] },
  // M1's eager officer: bold, glory-seeking, trusting.
  eager: { boldness: 'high', candour: 'above', reputation: 'low', values: ['glory', 'career'] },
  // M1's protected, cautious grandee: famous, candid, distrusts the leader.
  grandee: { boldness: 'low', candour: 'above', reputation: 'high', values: ['caution', 'reputation'] },
  // M1's watched functionary: timid, uncandid, obscure.
  functionary: { boldness: 'low', candour: 'low', reputation: 'low', values: ['caution', 'career'] },
  // The same functionary, candid.
  candid: { boldness: 'low', candour: 'above', reputation: 'low', values: ['caution', 'career'] },
};

/** The cast's standing and regard for the leader, set through `people` as the press and the verbs would move them. */
const MOVES: readonly PeopleChange[] = [
  { change: 'regard', person: PR('eager'), toward: LEADER, delta: 800 },
  { change: 'regard', person: PR('grandee'), toward: LEADER, delta: -400 },
  { change: 'regard', person: PR('functionary'), toward: LEADER, delta: -400 },
  { change: 'regard', person: PR('candid'), toward: LEADER, delta: -400 },
  // Reputation "low" draws 200; the functionary is obscurer still.
  { change: 'standing', person: PR('functionary'), delta: -100 },
  { change: 'standing', person: PR('candid'), delta: -100 },
];

function castWorld(cast: Readonly<Record<string, PersonTemper>> = CAST): SeatsWorld {
  const map = indexWorld(
    forcesWorld({
      regions: [region('a1'), region('a2')],
      edges: [edge('a1', 'a2')],
      people: Object.keys(cast).map((id) => person(id, 'a', cast[id])),
    }),
  );
  return indexSeatsWorld(map, forcesStart({ a1: { a: 1000 }, a2: { a: 1000 } }, [], []));
}

const WORLD = castWorld();
const STATE: State = applyPeopleChanges(createState(WORLD, { seed: 1 }), MOVES, 0, PEOPLE_RULES, []);
const proxy = (id: string): ProxyProfile => profileOf(WORLD, STATE, PR(id), LEADER);

const boldOffensive: DirectiveTerms = { boldness: 900, honours: ['glory'], offends: ['caution'], required: 700 };
const thinResources: CommandContext = { available: 400, oversight: 300, leaderCredibility: 500 };
const closeWatch: CommandContext = { available: 400, oversight: 900, leaderCredibility: 900 };

describe('the proxies are people State', () => {
  it('reads each proxy from people State: drawn temperament, cited values, standing and regard as moved', () => {
    expect(proxy('eager')).toEqual({ id: PR('eager'), values: ['career', 'glory'], boldness: 800, candour: 600, standing: 200, regard: 800 });
    expect(proxy('grandee')).toEqual({ id: PR('grandee'), values: ['caution', 'reputation'], boldness: 200, candour: 600, standing: 800, regard: -400 });
    expect(proxy('functionary')).toEqual({ id: PR('functionary'), values: ['career', 'caution'], boldness: 200, candour: 200, standing: 100, regard: -400 });
  });
});

describe('resolveDirective on the new State', () => {
  it('an aligned, trusting proxy with resources exceeds the directive', () => {
    const response = resolveDirective(proxy('eager'), { boldness: 800, honours: ['glory'], offends: [], required: 400 }, { available: 600, oversight: 300, leaderCredibility: 500 });
    expect(response.actual).toBe('exceed');
    expect(response.declared).toBe('exceed');
    expect(response.willingness).toBe(473);
    expect(response.reasons).toContainEqual({ kind: 'values_honoured', value: 'glory' });
    expect(response.reasons).toContainEqual({ kind: 'trusts_leader' });
  });

  it('a protected, cautious grandee refuses a rash order outright, and says why', () => {
    const response = resolveDirective(proxy('grandee'), boldOffensive, thinResources);
    expect(response.willingness).toBe(-731);
    expect(response.actual).toBe('refuse');
    expect(response.declared).toBe('refuse');
    expect(response.reasons.map((r) => r.kind)).toEqual(['values_offended', 'too_rash', 'distrusts_leader', 'shielded_by_standing', 'lacks_resources']);
    expect(response.reasons).toContainEqual({ kind: 'lacks_resources', shortfall: 300 });
    // He refuses: no condition, since he will not act at all.
    expect(response.conditions).toEqual([]);
  });

  it('a watched, uncandid functionary reinterprets the order while declaring compliance', () => {
    const response = resolveDirective(proxy('functionary'), boldOffensive, closeWatch);
    expect(response.willingness).toBe(-560);
    expect(response.actual).toBe('reinterpret');
    expect(response.declared).toBe('comply');
    expect(response.reasons).toContainEqual({ kind: 'fears_sanction' });
  });

  it('the same unwillingness in a candid man becomes an open objection with a counter-proposal', () => {
    const response = resolveDirective(proxy('candid'), boldOffensive, closeWatch);
    expect(response.actual).toBe('object');
    expect(response.declared).toBe('object');
    expect(response.counterProposal).toEqual({ boldness: 200, required: 400 });
  });

  it('mild covert unwillingness is a slow-walk, not a reinterpretation', () => {
    // His regard for the leader rises (a verb's work), from -400 to 200.
    const warmer = applyPeopleChanges(STATE, [{ change: 'regard', person: PR('functionary'), toward: LEADER, delta: 600 }], 1, PEOPLE_RULES, []);
    const response = resolveDirective(profileOf(WORLD, warmer, PR('functionary'), LEADER), { boldness: 600, honours: ['glory'], offends: ['caution'], required: 400 }, closeWatch);
    expect(response.willingness).toBe(-110);
    expect(response.actual).toBe('slow_walk');
    expect(response.declared).toBe('comply');
  });

  it('standing shields a proxy: the same functionary, now famous, refuses openly (P6)', () => {
    // The press makes him famous: standing from 100 to 900.
    const famous = applyPeopleChanges(STATE, [{ change: 'standing', person: PR('functionary'), delta: 800 }], 1, PEOPLE_RULES, []);
    const response = resolveDirective(profileOf(WORLD, famous, PR('functionary'), LEADER), boldOffensive, closeWatch);
    expect(response.willingness).toBe(-657);
    expect(response.actual).toBe('refuse');
  });

  it('contributions always sum to willingness and are integers', () => {
    const cases: Array<[ProxyProfile, DirectiveTerms, CommandContext]> = [
      [proxy('grandee'), boldOffensive, thinResources],
      [proxy('functionary'), boldOffensive, closeWatch],
      [proxy('eager'), { ...boldOffensive, ownBest: 700, departure: 450 }, thinResources],
    ];
    for (const [p, terms, context] of cases) {
      const response = resolveDirective(p, terms, context);
      const sum = response.contributions.reduce((total, c) => total + c.amount, 0);
      expect(sum).toBe(response.willingness);
      for (const c of response.contributions) expect(Number.isSafeInteger(c.amount)).toBe(true);
    }
  });

  it('is deterministic and does not depend on the order of value lists', () => {
    const a = resolveDirective(proxy('grandee'), boldOffensive, thinResources);
    const b = resolveDirective({ ...proxy('grandee'), values: ['reputation', 'caution'] }, { ...boldOffensive, honours: ['glory'], offends: ['caution', 'caution'] }, thinResources);
    expect(b).toEqual(a);
    // The same seed and World give the same people, so the same answer.
    const again = applyPeopleChanges(createState(WORLD, { seed: 1 }), MOVES, 0, PEOPLE_RULES, []);
    expect(resolveDirective(profileOf(WORLD, again, PR('grandee'), LEADER), boldOffensive, thinResources)).toEqual(a);
  });

  it('accepts rule variants for calibration', () => {
    const lenient = { ...DEFAULT_COMPLIANCE_RULES, severeBelow: -2000 };
    expect(resolveDirective(proxy('grandee'), boldOffensive, thinResources, lenient).actual).toBe('object');
  });

  it('rejects non-integer or out-of-range inputs', () => {
    expect(() => resolveDirective({ ...proxy('grandee'), boldness: 0.5 }, boldOffensive, thinResources)).toThrow(RangeError);
    expect(() => resolveDirective(proxy('grandee'), boldOffensive, { ...thinResources, oversight: 1001 })).toThrow(RangeError);
    expect(() => resolveDirective(proxy('grandee'), { ...boldOffensive, ownBest: 1200 }, thinResources)).toThrow(RangeError);
    expect(() => resolveDirective(proxy('grandee'), { ...boldOffensive, departure: -1 }, thinResources)).toThrow(RangeError);
  });

  it('answers an order end to end on the new State, with the pack’s weights and context (answerOrder)', () => {
    // The pack's context (oversight 500, credibility 500) and its weights: the grandee reads a bold offensive.
    const response = answerOrder(WORLD, STATE, PR('grandee'), LEADER, boldOffensive, { available: 400 });
    expect(response).toEqual(resolveDirective(proxy('grandee'), boldOffensive, { available: 400, oversight: 500, leaderCredibility: 500, grievances: [] }, WORLD.map.world.rules.people.compliance));
    expect(response.actual).toBe('refuse');
  });
});

describe('plans and edits (lane 1.1; lane 0.9 findings 1, 2 and 8)', () => {
  it('reads a plan’s boldness against his own best plan, not on an absolute scale: a bold man is not too timid for his own plan', () => {
    // His best plan, mapped to the directive scale, is 500 for this goal; on an absolute scale he would find it too timid.
    const absolute = resolveDirective(proxy('eager'), { boldness: 500, honours: [], offends: [], required: 0 }, thinResources);
    expect(absolute.reasons).toContainEqual({ kind: 'too_timid', gap: 300 });
    const relative = resolveDirective(proxy('eager'), { boldness: 500, ownBest: 500, honours: [], offends: [], required: 0 }, thinResources);
    expect(relative.reasons.some((r) => r.kind === 'too_timid' || r.kind === 'too_rash')).toBe(false);
    expect(relative.contributions.find((c) => c.term === 'temperament')!.amount).toBe(0);
    // An edit 400 bolder than his own best is too rash for him, whatever his temperament.
    expect(resolveDirective(proxy('eager'), { boldness: 900, ownBest: 500, honours: [], offends: [], required: 0 }, thinResources).reasons).toContainEqual({ kind: 'too_rash', gap: 400 });
  });

  it('an edit far from his judgement draws an objection from a candid man, for a typed reason', () => {
    // A plan that serves his career, which he would carry out though he distrusts the leader.
    const plan: DirectiveTerms = { boldness: 650, ownBest: 600, honours: ['career'], offends: [], required: 0 };
    // His own plan, unedited: he carries it out, with reservations.
    const own = answerOrder(WORLD, STATE, PR('candid'), LEADER, { ...plan, departure: 0 });
    expect(own.actual).toBe('comply_with_reservations');
    // The same plan with the player's arrows moved far from what he would choose.
    const edited = answerOrder(WORLD, STATE, PR('candid'), LEADER, { ...plan, departure: 700 });
    expect(edited.actual).toBe('object');
    expect(edited.reasons).toContainEqual({ kind: 'departs_from_judgement', departure: 700 });
    expect(edited.contributions.find((c) => c.term === 'judgement')).toEqual({ term: 'judgement', amount: -350 });
    expect(edited.statedReasons).toContainEqual({ kind: 'departs_from_judgement', departure: 700 });
    // A plain goal has no judgement term at all.
    expect(answerOrder(WORLD, STATE, PR('candid'), LEADER, plan).contributions.map((c) => c.term)).not.toContain('judgement');
  });

  it('a mild edit draws compliance with reservations from a man who would otherwise comply, and he says nothing of it if uncandid', () => {
    const steady = castWorld({ ...CAST, steady: { boldness: 'average', candour: 'low', reputation: 'average', values: ['duty'] } });
    const state = applyPeopleChanges(createState(steady, { seed: 1 }), [{ change: 'regard', person: PR('steady'), toward: LEADER, delta: 300 }], 0, PEOPLE_RULES, []);
    const plan: DirectiveTerms = { boldness: 500, ownBest: 500, honours: ['duty'], offends: [], required: 0 };
    expect(answerOrder(steady, state, PR('steady'), LEADER, { ...plan, departure: 0 }).actual).toBe('comply');
    const edited = answerOrder(steady, state, PR('steady'), LEADER, { ...plan, departure: 500 });
    expect(edited.actual).toBe('comply_with_reservations');
    expect(edited.declared).toBe('comply');
    expect(edited.reasons).toContainEqual({ kind: 'departs_from_judgement', departure: 500 });
    // An uncandid man who declares compliance gives only flattering reasons.
    expect(edited.statedReasons.some((r) => r.kind === 'departs_from_judgement')).toBe(false);
  });

  it('a slow walk of an edit by an uncandid man, declared as compliance', () => {
    const edited = answerOrder(WORLD, STATE, PR('functionary'), LEADER, { boldness: 300, ownBest: 200, honours: ['caution'], offends: [], required: 0, departure: 500 });
    expect(edited.actual).toBe('slow_walk');
    expect(edited.declared).toBe('comply');
    expect(edited.reasons.map((r) => r.kind)).toContain('departs_from_judgement');
  });

  it('carries "move when reinforced" only past the shortfall a man of his boldness tolerates (finding 8)', () => {
    const terms: DirectiveTerms = { boldness: 500, ownBest: 500, honours: ['glory'], offends: [], required: 1000 };
    const near = { available: 970, oversight: 900, leaderCredibility: 900 };
    // 30 short of 1000: the bold man (800) tolerates 10 + 0.8 x 40 = 42 per mille and moves; the timid one (200), 18, and waits.
    expect(resolveDirective(proxy('eager'), terms, near).conditions).toEqual([]);
    expect(resolveDirective({ ...proxy('eager'), boldness: 200 }, terms, near).conditions).toEqual([{ kind: 'when_reinforced', shortfall: 30 }]);
    // The reason is there either way: he lacks resources, typed.
    expect(resolveDirective(proxy('eager'), terms, near).reasons).toContainEqual({ kind: 'lacks_resources', shortfall: 30 });
  });

  it('carries "if supported" for support the plan needs that was not promised (finding 1)', () => {
    const terms: DirectiveTerms = { boldness: 800, ownBest: 800, honours: ['glory'], offends: [], required: 0, support: [{ supportKind: 'naval', supportFrom: 'a_squadron' }, { supportKind: 'cooperating', supportFrom: null }] };
    const response = resolveDirective(proxy('eager'), terms, thinResources);
    expect(response.conditions).toEqual([
      { kind: 'if_supported', supportKind: 'cooperating', from: null },
      { kind: 'if_supported', supportKind: 'naval', from: 'a_squadron' },
    ]);
    expect(resolveDirective(proxy('eager'), terms, { ...thinResources, supportPromised: ['naval'] }).conditions).toEqual([{ kind: 'if_supported', supportKind: 'cooperating', from: null }]);
  });
});

describe('conflicting orders, resolved by his compliance (0040; lane 1.1, called by lane 1.2 at an order’s arrival)', () => {
  const hold: DirectiveTerms = { boldness: 200, honours: ['caution'], offends: [], required: 0 };
  const attack: DirectiveTerms = { boldness: 900, honours: ['glory'], offends: ['caution'], required: 0 };

  it('obeys the order he is more willing to carry out, and says why in typed terms', () => {
    const r = resolveConflict(proxy('grandee'), { order: 'm.1', terms: attack, viaChain: true, issuedDay: 1 }, { order: 'm.2', terms: hold, viaChain: false, issuedDay: 2 }, thinResources, DEFAULT_COMPLIANCE_RULES);
    expect(r.obeyed).toBe('arriving');
    expect(r.terms.map((t) => `${t.order}:${t.term}`)).toEqual(['held:willingness', 'held:chain', 'arriving:willingness', 'arriving:newer']);
    expect(r.scores.arriving).toBeGreaterThan(r.scores.held);
    expect(r.held.actual).toBe('refuse');
  });

  it('weighs the chain and the newer order when he is indifferent between them', () => {
    const same = { boldness: 500, honours: [], offends: [], required: 0 };
    // The chain's order stands against an equal one sent around it (the chain weighs more than being newer).
    expect(resolveConflict(proxy('eager'), { order: 'm.1', terms: same, viaChain: true, issuedDay: 1 }, { order: 'm.2', terms: same, viaChain: false, issuedDay: 3 }, thinResources, DEFAULT_COMPLIANCE_RULES).obeyed).toBe('held');
    // A newer chain order supersedes one sent around it (0040: a newer order from his own department supersedes).
    expect(resolveConflict(proxy('eager'), { order: 'm.1', terms: same, viaChain: false, issuedDay: 1 }, { order: 'm.2', terms: same, viaChain: true, issuedDay: 3 }, thinResources, DEFAULT_COMPLIANCE_RULES).obeyed).toBe('arriving');
    // A tie keeps the order he holds.
    expect(resolveConflict(proxy('eager'), { order: 'm.1', terms: same, viaChain: true, issuedDay: 2 }, { order: 'm.2', terms: same, viaChain: true, issuedDay: 2 }, thinResources, DEFAULT_COMPLIANCE_RULES).obeyed).toBe('held');
  });

  it('reads each order with his regard for its own issuer, on the new State', () => {
    // A second issuer he distrusts (a rival's order): the same terms from the leader are obeyed instead.
    const rival = PR('grandee');
    const state = applyPeopleChanges(STATE, [{ change: 'regard', person: PR('eager'), toward: rival, delta: -1000 }], 1, PEOPLE_RULES, []);
    const same = { boldness: 800, honours: ['glory'], offends: [], required: 0 };
    const r = resolveOrderConflict(WORLD, state, PR('eager'), { order: 'm.1', issuer: rival, terms: same, viaChain: false, issuedDay: 3 }, { order: 'm.2', issuer: LEADER, terms: same, viaChain: false, issuedDay: 1 });
    expect(r.obeyed).toBe('arriving');
    expect(r.held.reasons).toContainEqual({ kind: 'distrusts_leader' });
    expect(r.arriving.reasons).toContainEqual({ kind: 'trusts_leader' });
  });
});
