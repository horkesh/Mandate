import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { combatDay, type CombatResult } from '../src/combat/battle.ts';
import { believedRatio, commitAtDawn } from '../src/combat/decide.ts';
import type { BattleDay, BattleSide, BattleTerm } from '../src/combat/records.ts';
import { apportion, DRAWS_PER_DAY, LEADER_DRAWS_PER_DAY, resolveDay, type DayInput, type SideInput } from '../src/combat/resolve.ts';
import { combatRulesProblems, type CombatRules } from '../src/combat/rules.ts';
import { battleVerdict, dayShape } from '../src/combat/shape.ts';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { createDerivedMapCache } from '../src/control-index/derived.ts';
import { applyForces } from '../src/forces/forces.ts';
import { stragglersStep } from '../src/forces/stragglers.ts';
import type { ForceBlockId } from '../src/ids.ts';
import type { MarchGround } from '../src/movement/march.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { createStream, nextInt } from '../src/rng.ts';
import type { State } from '../src/root-state.ts';
import { combatPhase } from '../src/tick/forces.ts';
import { MAP_MECHANICS, mapPhase } from '../src/tick/map.ts';
import { passageOf } from '../src/tick/passage.ts';
import { createState } from '../src/tick/setup.ts';
import type { SeatsWorld } from '../src/seats/world.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { networkOf } from '../src/infrastructure/infrastructure.ts';
import type { ForceBlockStart, PostStart } from '../src/world/scenario.ts';
import { indexWorld, type WorldIndex } from '../src/world/index.ts';
import { ctxFor, worldOf } from './support/tick-context.ts';
import { B, block, DEP, forcesStart, forcesWorld, P, PER, person, post } from './support/forces-fixture.ts';
import { depot, edge, F, FIXTURE_COMBAT_RULES, R, region } from './support/map-fixture.ts';

/**
 * The battle model (lane 1.3; the combat note; FOUNDATION section 12's row 1.3), on fictional ground:
 *
 *   a1 (a's source) ==rail== a2 --road-- mid --road-- b2 ==rail== b1 (b's source)
 *                                         |      \
 *                                         n       u
 *   n: a neutral government's ground, nobody's control; u: ground of unknown government, nobody's control.
 *
 * a's army (a_gen) and b's army (b_gen) are posts whose holders command the blocks they are assigned.
 */
const PEOPLE = [person('a_lead', 'a'), person('a_gen', 'a'), person('a_bold', 'a', { boldness: 'high' }), person('a_timid', 'a', { boldness: 'low', values: ['caution'] }), person('b_lead', 'b'), person('b_gen', 'b')];

function mapWith(combat: Partial<CombatRules> = {}): WorldIndex {
  const base = forcesWorld({
    regions: ['a1', 'a2', 'mid', 'b2', 'b1', 'n', 'u'].map((r) => region(r)),
    edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line' }), edge('a2', 'mid'), edge('mid', 'b2'), edge('b2', 'b1', { type: 'rail', line: 'b_line' }), edge('mid', 'n'), edge('mid', 'u')],
    depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
    people: PEOPLE,
  });
  return indexWorld({ ...base, rules: { ...base.rules, combat: { ...FIXTURE_COMBAT_RULES, ...combat } } });
}const MAP = mapWith();

const GOVERNMENTS = [
  { region: R('n'), department: DEP('neutral_gov'), provenance: [] },
  { region: R('u'), department: 'unknown' as const, provenance: [] },
];
const BASE = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 300, b: 550 }, b2: { b: 1000 }, b1: { b: 1000 } };
const POSTS: readonly PostStart[] = [
  post('a_army', { department: 'a_war', holder: PER('a_gen'), region: R('a2') }),
  post('a_reserve', { department: 'a_war', holder: PER('a_bold'), region: R('a2') }),
  post('a_watch', { department: 'a_war', holder: PER('a_timid'), region: R('a2') }),
  post('b_army', { department: 'b_war', holder: PER('b_gen'), region: R('b2') }),
];

interface Game {
  readonly world: SeatsWorld;
  readonly state: State;
}

/** A start, with the named blocks having marched in on day 1 (so they may attack). */
function game(control: Readonly<Record<string, Readonly<Record<string, number>>>>, blocks: readonly ForceBlockStart[], marchedIn: readonly string[], o: { readonly map?: WorldIndex; readonly fortification?: number; readonly seed?: number } = {}): Game {
  const start = forcesStart(control, POSTS, blocks, { governments: GOVERNMENTS, fortification: o.fortification === undefined ? [] : [{ region: R('mid'), levelPermille: o.fortification }] });
  const world = worldOf(o.map ?? MAP, start);
  const s = createState(world, { seed: o.seed ?? 1 });
  const locations = { ...s.forceLocations };
  for (const id of marchedIn) locations[B(id)] = { ...locations[B(id)]!, locSinceDay: 1 };
  return { world, state: { ...s, forceLocations: locations } };
}

const groundOf = (g: Game): MarchGround => ({ map: g.world.map, index: buildControlIndex(g.world.map, g.state.regionControl), network: passageOf(g.world.map, g.state), month: 6 });
const day = (g: Game, d = 2): CombatResult => combatDay(g.world, groundOf(g), g.state, d);
const sideOf = (bday: BattleDay, faction: string): BattleSide => bday.bdaySides.find((s) => s.bsideFaction === faction)!;
const sum = (terms: readonly BattleTerm[]) => terms.reduce((a, t) => a + t.btermValue, 0);

const aBlock = (id: string, region: string, strength: number | null, postId = 'a_army') => block(id, { department: 'a_war', region, strength, post: P(postId) });
const bBlock = (id: string, region: string, strength: number | null) => block(id, { department: 'b_war', region, strength, post: P('b_army') });

/** Every number in a day's record is the exact sum of its typed terms (hard rule 6). */
function expectBreakdownsSum(bday: BattleDay, rules: CombatRules = FIXTURE_COMBAT_RULES): void {
  for (const s of bday.bdaySides) {
    expect(sum(s.bsideKwParts)).toBe(s.bsideKw);
    expect(s.bsideKilled + s.bsideWounded).toBe(s.bsideKw);
    expect(sum(s.bsideMissingParts)).toBe(s.bsideMissing);
    expect(sum(s.bsideCapturedParts)).toBe(s.bsideCaptured);
    expect(1000 + sum(s.bsideTerms)).toBe(s.bsideMultiplier);
    expect(sum(s.bsideFlankTerms)).toBe(s.bsideFlankThreshold);
    if (s.bsideResult !== 'routed') expect(s.bsideMoraleBefore + sum(s.bsideMoraleTerms)).toBe(s.bsideMoraleAfter);
    const total = (k: 'blossKilled' | 'blossWounded' | 'blossMissing') => s.bsideLosses.reduce((a, l) => a + l[k], 0);
    expect([total('blossKilled'), total('blossWounded'), total('blossMissing')]).toEqual([s.bsideKilled, s.bsideWounded, s.bsideMissing]);
    expect(s.bsideLosses.reduce((a, l) => a + l.blossCaptured + l.blossStragglersCaptured, 0)).toBe(s.bsideCaptured);
    // The unknown-strength list is in every record, empty or not (1A's done check reads it).
    expect(Array.isArray(s.bsideUnknown)).toBe(true);
  }
  // The day shape is derived, and each phase list sums exactly to the day's figure.
  const shape = dayShape(rules, bday);
  bday.bdaySides.forEach((s, i) => {
    expect(shape.phases.reduce((a, p) => a + p.sides[i]!.killedWounded, 0)).toBe(s.bsideKw);
    expect(shape.phases.reduce((a, p) => a + p.sides[i]!.missing, 0)).toBe(s.bsideMissing);
    expect(shape.phases.reduce((a, p) => a + p.sides[i]!.captured, 0)).toBe(s.bsideCaptured);
  });
  expect(bday.bdayDraws).toBe(DRAWS_PER_DAY);
}

describe('an assault on works: the attacker bleeds (Livermore 2.2)', () => {
  const g = game(BASE, [aBlock('a_1', 'mid', 10000), bBlock('b_1', 'mid', 4000)], ['a_1'], { fortification: 600 });

  it('is an assault on works, the commander who marched in attacks, and the defender in works loses far fewer, for typed reasons', () => {
    const r = day(g);
    expect(r.fought).toHaveLength(1);
    const bday = r.fought[0]!.day;
    expect(bday.bdayType).toBe('assault_works');
    expect(bday.bdayAttacker).toBe('a');
    const a = sideOf(bday, 'a');
    const b = sideOf(bday, 'b');
    expect(a.bsideCommander).toBe('a_gen');
    expect(a.bsideCommit).not.toBe('defend');
    expect(b.bsideCommit).toBe('defend');
    expect(a.bsideBase).toBe(FIXTURE_COMBAT_RULES.baseRates.assault_works.attacker);
    expect(b.bsideBase).toBe(FIXTURE_COMBAT_RULES.baseRates.assault_works.defender);
    // Men in contact are the lesser side's engaged (P3).
    expect(bday.bdayContact).toBe(Math.min(a.bsideEngaged, b.bsideEngaged));
    expect(a.bsideKw).toBeGreaterThanOrEqual(2 * b.bsideKw);
    // The larger side's numbers lower its losses; the smaller's raise them (P3's bounded term).
    expect(a.bsideTerms.find((t) => t.btermKind === 'numbers')!.btermValue).toBeLessThan(0);
    expect(b.bsideTerms.find((t) => t.btermKind === 'numbers')!.btermValue).toBeGreaterThan(0);
    expect(a.bsideKwParts.map((t) => t.btermKind)).toContain('base');
    expectBreakdownsSum(bday);
  });

  it('without works the same fight is in the open, and the defender pays more (positive control)', () => {
    const open = game(BASE, [aBlock('a_1', 'mid', 10000), bBlock('b_1', 'mid', 4000)], ['a_1']);
    const bday = day(open).fought[0]!.day;
    expect(bday.bdayType).toBe('attack_open');
    expect(sideOf(bday, 'b').bsideKw).toBeGreaterThan(sideOf(day(g).fought[0]!.day, 'b').bsideKw);
  });

  it('a garrison the start put there never attacks, and two sides that only hold fight no battle (0064)', () => {
    const held = game(BASE, [aBlock('a_1', 'mid', 10000), bBlock('b_1', 'mid', 4000)], []);
    expect(day(held).fought).toEqual([]);
  });
});

describe('commanders decide by their traits, not by dice (0007; P6)', () => {
  it('a bold man attacks where a timid one, who sees the enemy larger, will not', () => {
    const rules = FIXTURE_COMBAT_RULES;
    const bold = game(BASE, [aBlock('a_1', 'mid', 5000, 'a_reserve'), bBlock('b_1', 'mid', 4500)], ['a_1']);
    const timid = game(BASE, [aBlock('a_1', 'mid', 5000, 'a_watch'), bBlock('b_1', 'mid', 4500)], ['a_1']);
    const boldDay = day(bold).fought[0]!.day;
    expect(sideOf(boldDay, 'a').bsideCommander).toBe('a_bold');
    expect(sideOf(boldDay, 'a').bsideCommit).toBe('all_out');
    expect(day(timid).fought).toEqual([]);
    // The timid man's view: the enemy inflated by his perception bias, against his higher demand.
    const view = { person: PER('a_timid'), boldness: 200, competence: 500, nerve: 500, perceptionPermille: 2400, demandPermille: 1600 };
    expect(believedRatio(view, 5000, 4500)).toBeLessThan(1000);
    expect(commitAtDawn(rules, view, true, 5000, 4500).choice).toBe('defend');
  });
});

describe('a rout by morale kills no one; the missing straggle and rejoin (P5, P8)', () => {
  const shaky = (g: Game, morale: number): Game => {
    const id = B('b_1');
    return { ...g, state: { ...g.state, forceBlockStates: { ...g.state.forceBlockStates, [id]: { ...g.state.forceBlockStates[id]!, fbMorale: morale } } } };
  };
  const base = game(BASE, [aBlock('a_1', 'mid', 12000), bBlock('b_1', 'mid', 6000)], ['a_1']);

  it('routs from morale, leaves for its own ground, and its dead are only the day\'s hits', () => {
    const r = day(shaky(base, 280));
    const b = sideOf(r.fought[0]!.day, 'b');
    expect(b.bsideResult).toBe('routed');
    expect(b.bsideRetreatTo).toBe('b2');
    // The rout adds missing (half the hits, by the pack's rule), not dead: the killed are the pack's share of the hits.
    expect(b.bsideKilled).toBe(Math.trunc((b.bsideKw * FIXTURE_COMBAT_RULES.killedPermille) / 1000));
    expect(b.bsideMissingParts.find((t) => t.btermKind === 'result_routed')!.btermValue).toBe(Math.trunc((b.bsideKw * FIXTURE_COMBAT_RULES.missingPermille.routed) / 1000));
    expect(b.bsideMoraleAfter).toBeLessThanOrEqual(FIXTURE_COMBAT_RULES.morale.routFloor);
    expectBreakdownsSum(r.fought[0]!.day);
    // Applied: the block survives, smaller; its stragglers hold the missing; it stands in b2; it may not attack for a while.
    const after = applyForces(base.state, r.forces).state.forceBlockStates[B('b_1')]!;
    expect(after.fbStrength).toBe(6000 - b.bsideKw - b.bsideMissing - b.bsideCaptured);
    expect(after.fbStragglers).toBe(b.bsideMissing);
    expect(after.fbRoutedDay).toBe(2);
    expect(after.fbSurrenderedDay).toBeNull();
    expect(r.retreats.map((x) => [x.faction, x.to, x.routed])).toEqual([['b', 'b2', true]]);
    // The winner chose whether to pursue (lane 1.4 runs it): a commander's choice, never a draw.
    expect(sideOf(r.fought[0]!.day, 'a').bsidePursue).not.toBeNull();
  });

  it('the same fight with steady men does not rout (positive control)', () => {
    expect(sideOf(day(shaky(base, 900)).fought[0]!.day, 'b').bsideResult).not.toBe('routed');
  });

  it('stragglers rejoin a block in supply, a share a day, at least one man while any are out', () => {
    let s = applyForces(base.state, [{ change: 'battle_losses', block: B('b_1'), killed: 0, wounded: 0, missing: 905, captured: 0, stragglersCaptured: 0, cause: 'combat' }]).state;
    s = { ...s, forceLocations: { ...s.forceLocations, [B('b_1')]: { ...s.forceLocations[B('b_1')]!, locRegion: R('b2') } } };
    const supply = deriveMap(MAP, { control: s.regionControl, month: 6, network: networkOf(s) }).supply;
    const once = stragglersStep(MAP, s, supply, new Set());
    expect(once.state.forceBlockStates[B('b_1')]).toMatchObject({ fbStrength: 5095 + 90, fbStragglers: 815 });
    // Not while in battle today.
    expect(stragglersStep(MAP, s, supply, new Set([B('b_1')])).changes).toEqual([]);
  });
});

describe('destruction only when cut off: surrender, capture, and the trapped garrison (0019; OPEN_QUESTIONS)', () => {
  // b2 is a's: b has no neighbour it holds at the retreat threshold, so b in mid is cut off.
  const TRAPPED = { ...BASE, mid: { a: 1000 }, b2: { a: 1000 } };

  it('a trapped garrison with nowhere to go surrenders: its men captured, its blocks out of the fight, its commander taken', () => {
    const g = game(TRAPPED, [aBlock('a_1', 'mid', 8000), bBlock('b_gar', 'mid', 600)], ['a_1']);
    const ctx = ctxFor(g.world, g.state, 2, MAP_MECHANICS);
    const after = combatPhase(ctx, g.state).state;
    const bday = (ctx.mapEvents.find((e) => e.event === 'battle') as { fought: { day: BattleDay } }).fought.day;
    const b = sideOf(bday, 'b');
    expect(b.bsideCutOff).toBe('surrender');
    expect(b.bsideRetreatTo).toBeNull();
    expect(b.bsideCaptured).toBe(600 - b.bsideKw - b.bsideMissing);
    expect(b.bsideCapturedParts.map((t) => t.btermKind)).toContain('surrender');
    expectBreakdownsSum(bday);
    // forces: no men left, marked surrendered; command: released from its post; people: its commander captured, his post vacant.
    expect(after.forceBlockStates[B('b_gar')]).toMatchObject({ fbStrength: 0, fbStragglers: b.bsideMissing, fbSurrenderedDay: 2 });
    expect(after.forceAssignments[B('b_gar')]).toBeNull();
    expect(after.personStatus[PER('b_gen')]).toEqual({ statusKind: 'captured', statusDay: 2 });
    expect(after.postStates[P('b_army')]!.postHolder).toBeNull();
    expect(ctx.telemetry!.mechanics['combat.surrendered']!.fires).toBe(1);
    // The field is a's: control to the side left holding it. The battle closes the day the other side is gone.
    expect(after.battleRecords['battle:mid:2']!.battleEndDay).toBe(2);
    // A surrendered block is no side present: the next day nobody fights.
    const next = combatDay(g.world, groundOf({ world: g.world, state: after }), after, 3);
    expect(next.fought).toEqual([]);
  });

  it('with a way out the same garrison withdraws instead (positive control)', () => {
    const g = game(BASE, [aBlock('a_1', 'mid', 8000), bBlock('b_gar', 'mid', 600)], ['a_1']);
    const b = sideOf(day(g).fought[0]!.day, 'b');
    expect(['withdrew', 'routed']).toContain(b.bsideResult);
    expect([b.bsideCutOff, b.bsideRetreatTo]).toEqual([null, 'b2']);
  });

  it('a cut-off force strong enough to fight breaks out, and a second failure surrenders it', () => {
    // b believes it can fight its way out (above its breakout share, below its hold share): it breaks out.
    const start = game(TRAPPED, [aBlock('a_1', 'mid', 9000), bBlock('b_1', 'mid', 5000)], ['a_1']);
    // Steady men, so neither day ends in a rout (a routed force in a pocket surrenders at once).
    const g = { ...start, state: { ...start.state, forceBlockStates: { ...start.state.forceBlockStates, [B('b_1')]: { ...start.state.forceBlockStates[B('b_1')]!, fbMorale: 1000 } } } };
    const first = day(g);
    const b1 = sideOf(first.fought[0]!.day, 'b');
    expect([b1.bsideResult, b1.bsideCutOff]).toEqual(['withdrew', 'break_out']);
    let s = applyForces(g.state, first.forces).state;
    s = { ...s, battleRecords: { 'battle:mid:2': { battleRegion: R('mid'), battleStartDay: 2, battleEndDay: null, battleFactions: [F('a'), F('b')], battleCauses: [], battleDays: [first.fought[0]!.day] } } };
    const second = combatDay(g.world, groundOf({ world: g.world, state: s }), s, 3);
    const day2 = second.fought[0]!.day;
    // The breakout is fought at the assault rates, with b attacking all-out.
    expect([day2.bdayType, day2.bdayAttacker, sideOf(day2, 'b').bsideCommit]).toEqual(['assault_works', 'b', 'all_out']);
    expect(sideOf(day2, 'b').bsideCutOff).toBe('surrender');
    // It surrenders, never breaking out twice: its breakout failed, or it routed with nowhere to go.
    expect(sideOf(day2, 'b').bsideDecisions.map((t) => t.btermKind).filter((k) => k === 'breakout_failed' || k === 'routed_in_pocket')).toHaveLength(1);
  });

  it('a rout that captures men on the field: a typed loss, kept apart from the missing (R4\'s battle ruling)', () => {
    const g = game(BASE, [aBlock('a_1', 'mid', 12000), bBlock('b_1', 'mid', 6000)], ['a_1']);
    const shaken = { ...g.state, forceBlockStates: { ...g.state.forceBlockStates, [B('b_1')]: { ...g.state.forceBlockStates[B('b_1')]!, fbMorale: 280 } } };
    const b = sideOf(day({ world: g.world, state: shaken }).fought[0]!.day, 'b');
    expect(b.bsideCaptured).toBeGreaterThan(0);
    expect(b.bsideCapturedParts).toEqual([{ btermKind: 'captured_on_field', btermValue: b.bsideCaptured, btermSource: null }]);
    expect(b.bsideMissingParts.find((t) => t.btermKind === 'captured_on_field')!.btermValue).toBe(-b.bsideCaptured);
  });
});

describe('generals hit on their own stream: status to people, the vacancy to command (0073)', () => {
  it('a general wounded leaves his post vacant; with no hits, nobody is (positive control)', () => {
    const wounding = mapWith({ leaders: { killedPermille: 0, woundedPermille: 1000, capturedPermille: 0 } });
    const g = game(BASE, [aBlock('a_1', 'mid', 10000), bBlock('b_1', 'mid', 4000)], ['a_1'], { map: wounding });
    const ctx = ctxFor(g.world, g.state, 2, MAP_MECHANICS);
    const after = combatPhase(ctx, g.state).state;
    expect(after.personStatus[PER('a_gen')]).toEqual({ statusKind: 'wounded', statusDay: 2 });
    expect(after.postStates[P('a_army')]!.postHolder).toBeNull();
    expect(after.personStatus[PER('b_gen')]!.statusKind).toBe('wounded');
    expect(ctx.telemetry!.mechanics['combat.general_hit']!.fires).toBe(2);
    const safe = mapWith({ leaders: { killedPermille: 0, woundedPermille: 0, capturedPermille: 0 } });
    const h = game(BASE, [aBlock('a_1', 'mid', 10000), bBlock('b_1', 'mid', 4000)], ['a_1'], { map: safe });
    const quiet = combatPhase(ctxFor(h.world, h.state, 2, MAP_MECHANICS), h.state).state;
    expect(quiet.personStatus[PER('a_gen')]!.statusKind).toBe('serving');
    expect(quiet.postStates[P('a_army')]!.postHolder).toBe('a_gen');
  });

  it('nothing moves a person out of captured (or killed): the people writer refuses it', () => {
    const g = game(BASE, [], []);
    const rules = g.world.rules.people;
    const taken = applyPeopleChanges(g.state, [{ change: 'status', person: PER('b_gen'), status: 'captured' }], 3, rules);
    for (const status of ['serving', 'wounded', 'killed'] as const) {
      expect(() => applyPeopleChanges(taken, [{ change: 'status', person: PER('b_gen'), status }], 4, rules)).toThrow('nothing moves a person out of captured');
    }
    // Captured again is no change, and keeps its day.
    expect(applyPeopleChanges(taken, [{ change: 'status', person: PER('b_gen'), status: 'captured' }], 9, rules).personStatus[PER('b_gen')]).toEqual({ statusKind: 'captured', statusDay: 3 });
    const dead = applyPeopleChanges(g.state, [{ change: 'status', person: PER('b_gen'), status: 'killed' }], 3, rules);
    expect(() => applyPeopleChanges(dead, [{ change: 'status', person: PER('b_gen'), status: 'serving' }], 4, rules)).toThrow('nothing moves a person out of killed');
  });
});

describe('only the battle model captures men (R4\'s battle ruling; lane 1.8\'s note)', () => {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? (name === 'node_modules' ? [] : files(path)) : /\.ts$/.test(name) ? [path] : [];
    });
  const sources = readdirSync(join(root, 'packages')).flatMap((pkg) => {
    const src = join(root, 'packages', pkg, 'src');
    try {
      return files(src);
    } catch {
      return [];
    }
  });

  it('only combat proposes a battle loss, the one change that captures men, and only forces applies it', () => {
    const proposers = sources.filter((f) => /change:\s*'battle_losses'/.test(readFileSync(f, 'utf8'))).map((f) => relative(root, f).split('\\').join('/'));
    expect(proposers).toEqual(['packages/kernel/src/combat/battle.ts', 'packages/kernel/src/forces/forces.ts']);
    expect(readFileSync(join(root, 'packages/kernel/src/forces/forces.ts'), 'utf8')).toContain("readonly cause: 'combat';");
  });

  it('only people writes a person\'s status, and only combat proposes one', () => {
    const writers = sources.filter((f) => /change:\s*'status'/.test(readFileSync(f, 'utf8'))).map((f) => relative(root, f).split('\\').join('/'));
    expect(writers).toEqual(['packages/kernel/src/combat/battle.ts', 'packages/kernel/src/people/people.ts']);
  });
});

describe('streams: a fixed number of draws per battle-day, whatever happens (P7)', () => {
  const side = (faction: string, men: number | null, commit: SideInput['commit'], retreatTo: string | null): SideInput => ({
    faction: F(faction),
    post: null,
    commander: { person: null, boldness: 500, competence: 500, nerve: 500, perceptionPermille: 1000, demandPermille: 1000 },
    commit,
    commitTerms: [],
    blocks: [{ id: B(`${faction}_1`), men, stragglers: 0, morale: 600, experience: 400, equipment: 600 }],
    retreatTo: retreatTo === null ? null : R(retreatTo),
    breakingOut: false,
    surprised: false,
  });
  const input = (a: SideInput, b: SideInput): DayInput => ({ day: 5, dayNumber: 1, type: 'attack_open', attacker: F('a'), terrain: 'plain', frontageMen: 60000, terrainLossPermille: 0, sides: [a, b] });
  const after = (i: DayInput) => {
    const s = createStream(7, 'combat/x/5');
    resolveDay(FIXTURE_COMBAT_RULES, i, s);
    return s.state;
  };
  const fixed = () => {
    const s = createStream(7, 'combat/x/5');
    for (let k = 0; k < 2; k++) {
      nextInt(s, 1001);
      nextInt(s, 1001);
      nextInt(s, 1000);
    }
    return s.state;
  };

  it('draws six values in every branch: a fight, no contact (unknown strength), and a surrender', () => {
    expect(DRAWS_PER_DAY).toBe(6);
    expect(LEADER_DRAWS_PER_DAY).toBe(2);
    expect(after(input(side('a', 9000, 'main', 'a2'), side('b', 4000, 'defend', 'b2')))).toBe(fixed());
    expect(after(input(side('a', 9000, 'main', 'a2'), side('b', null, 'defend', 'b2')))).toBe(fixed());
    expect(after(input(side('a', 9000, 'all_out', 'a2'), side('b', 300, 'defend', null)))).toBe(fixed());
  });

  it('a flank breaks on a low draw: morale falls by the pack\'s loss, more go missing, and the break has its phase', () => {
    const always = { ...FIXTURE_COMBAT_RULES, flank: { ...FIXTURE_COMBAT_RULES.flank, basePermille: 1000, maxPermille: 1000 } };
    const never = { ...FIXTURE_COMBAT_RULES, flank: { ...FIXTURE_COMBAT_RULES.flank, basePermille: 0, maxPermille: 0, numbersWeight: 0, qualityWeight: 0 } };
    const i = input(side('a', 9000, 'main', 'a2'), side('b', 6000, 'defend', 'b2'));
    const broken = resolveDay(always, i, createStream(7, 'combat/x/5')).day;
    const whole = resolveDay(never, i, createStream(7, 'combat/x/5')).day;
    const b = broken.bdaySides[1]!;
    expect([b.bsideFlankBroken, whole.bdaySides[1]!.bsideFlankBroken]).toEqual([true, false]);
    expect(b.bsideMoraleTerms.find((t) => t.btermKind === 'flank_broken')!.btermValue).toBe(-always.flank.moraleLoss);
    expect(b.bsideMissing).toBeGreaterThan(whole.bdaySides[1]!.bsideMissing);
    expect(dayShape(always, broken).phases.filter((p) => p.sides[1]!.flankBreaks)).toHaveLength(1);
    expectBreakdownsSum(broken, always);
  });

  it('an unknown strength fights as none and is listed in the record (0064; 1A\'s done check)', () => {
    const r = resolveDay(FIXTURE_COMBAT_RULES, input(side('a', 9000, 'main', 'a2'), side('b', null, 'defend', 'b2')), createStream(7, 'combat/x/5'));
    const b = r.day.bdaySides[1]!;
    expect([r.day.bdayContact, b.bsidePresent, b.bsideUnknown]).toEqual([0, 0, ['b_1']]);
    expect(r.day.bdaySides[0]!.bsideUnknown).toEqual([]);
  });

  it('the same seed and inputs give the same day; another battle-day\'s stream gives another (determinism)', () => {
    const i = input(side('a', 9000, 'main', 'a2'), side('b', 4000, 'defend', 'b2'));
    const one = resolveDay(FIXTURE_COMBAT_RULES, i, createStream(7, 'combat/x/5'));
    expect(resolveDay(FIXTURE_COMBAT_RULES, i, createStream(7, 'combat/x/5'))).toEqual(one);
    const draws = (name: string) => resolveDay(FIXTURE_COMBAT_RULES, i, createStream(7, name)).day.bdaySides.map((s) => s.bsideFlankDraw);
    expect(draws('combat/x/6')).not.toEqual(draws('combat/x/5'));
  });
});

describe('the breakdowns and the derived views', () => {
  it('apportions exactly by the largest remainder, signed weights included, never past a weight', () => {
    expect(apportion(10, [1, 1, 1])).toEqual([4, 3, 3]);
    expect(apportion(100, [1000, -200, 300])).toEqual([91, -18, 27]);
    expect(apportion(7, [3, 0, 5])).toEqual([3, 0, 4]);
    expect(apportion(0, [0, 0])).toEqual([0, 0]);
  });

  it('a battle\'s verdict: who held the field and each side\'s loss share', () => {
    const g = game(BASE, [aBlock('a_1', 'mid', 8000), bBlock('b_gar', 'mid', 600)], ['a_1']);
    const r = day(g);
    const record = { battleRegion: R('mid'), battleStartDay: 2, battleEndDay: 2, battleFactions: [F('a'), F('b')], battleCauses: [], battleDays: [r.fought[0]!.day] };
    const v = battleVerdict(record);
    expect(v.field).toBe('a');
    expect(v.sides.map((s) => s.engagedAtStart)).toEqual([8000, 600]);
    expect(r.fought[0]!.day.bdaySides.map((s) => s.bsidePost)).toEqual(['a_army', 'b_army']);
  });

  it('the pack\'s combat rules are checked as the validator checks them', () => {
    expect(combatRulesProblems(FIXTURE_COMBAT_RULES, [])).toEqual([]);
    expect(combatRulesProblems(undefined, [])).toEqual(['the pack states no combat rules (rules.combat)']);
    const bad = { ...FIXTURE_COMBAT_RULES, terrain: [{ terrain: 'moon', frontageMen: 1, lossPermille: 0 }], works: { hastyAt: 600, preparedAt: 500 }, maxBattleDays: 0 };
    expect(combatRulesProblems(bad, ['plain'])).toEqual([
      'combat rule works.preparedAt must be at least works.hastyAt',
      'combat rule terrain names "moon", which is not in the pack\'s terrains',
      'combat rule maxBattleDays must be a whole number from 1',
    ]);
  });
});

describe('neutral ground is passed, never fought over (0055; review S1)', () => {
  const clash = (where: string) => [aBlock('a_1', where, 5000), bBlock('b_1', where, 1000)];

  it('two sides on a neutral government\'s ground nobody holds fight no battle and gain nothing', () => {
    const g = game(BASE, clash('n'), ['a_1', 'b_1']);
    const r = day(g);
    expect([r.fought, r.control, r.occupations]).toEqual([[], [], []]);
  });

  it('on ground of unknown government they fight (positive control), and a side alone there occupies it', () => {
    expect(day(game(BASE, clash('u'), ['a_1', 'b_1'])).fought).toHaveLength(1);
    expect(day(game(BASE, [aBlock('a_1', 'u', 5000)], ['a_1'])).control).toEqual([{ region: R('u'), faction: F('a'), deltaPermille: 100, cause: 'occupation' }]);
  });
});

describe('a pocket forming when a force cuts a line, and lifting when it is relieved (lane 0.5\'s case, now by occupation and battle)', () => {
  it('a raid occupies b2 until b no longer traces it, cutting mid off; relief drives the raiders out and the pocket lifts', () => {
    const cache = createDerivedMapCache();
    const g = game({ ...BASE, mid: { b: 1000 } }, [aBlock('a_raid', 'b2', 5000)], ['a_raid']);
    let state = g.state;
    const events: string[] = [];
    const step = (d: number) => {
      const ctx = ctxFor(g.world, state, d, MAP_MECHANICS);
      state = combatPhase(ctx, state).state;
      state = mapPhase(ctx, state, cache).state;
      for (const e of ctx.mapEvents) if (e.event === 'pocket_closed' || e.event === 'pocket_relieved' || e.event === 'pocket_lost') events.push(`${d}:${e.faction}:${e.event}`);
    };
    for (let d = 1; d <= 8; d++) step(d);
    expect(state.regionControl[R('b2')]).toEqual({ a: 800, b: 200 });
    expect(events).toEqual(['3:a:pocket_closed', '8:b:pocket_closed']);
    // Relief: b's force marches into b2, twice the raiders; it attacks, the raiders give way, and b takes b2 back.
    const relief: ForceBlockId = B('b_relief');
    state = {
      ...state,
      forceBlockStates: { ...state.forceBlockStates, [relief]: { ...state.forceBlockStates[B('a_raid')]!, fbDepartment: 'b_war' as never, fbStrength: 10000, fbMorale: 700 } },
      forceLocations: { ...state.forceLocations, [relief]: { locRegion: R('b2'), locAboard: null, locSinceDay: 8, locMarch: null } },
      forceAssignments: { ...state.forceAssignments, [relief]: P('b_army') },
    };
    for (let d = 9; d <= 12 && !events.some((e) => e.includes('b:pocket_relieved')); d++) step(d);
    expect(events).toContain('8:b:pocket_closed');
    expect(events.some((e) => e.endsWith(':b:pocket_relieved'))).toBe(true);
    expect(Object.values(state.battleRecords).length).toBeGreaterThan(0);
  });
});
