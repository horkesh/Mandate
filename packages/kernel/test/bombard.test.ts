import { describe, expect, it } from 'vitest';
import { BOMBARD_TARGET_KINDS, bombardDay, type BombardDefender } from '../src/combat/bombard.ts';
import type { BombardmentRules } from '../src/combat/rules.ts';
import { toId, type PersonId } from '../src/ids.ts';
import { deliverReport, knowledgeOf } from '../src/knowledge/knowledge.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { playDays } from '../src/log/session.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import { block, DEP, forcesStart, forcesWorld, P, PER, person, post, type PersonTemper } from './support/forces-fixture.ts';
import { depot, edge, F, FIXTURE_COMBAT_RULES, R, region } from './support/map-fixture.ts';
import { worldOf } from './support/tick-context.ts';
import { order, scriptedSeats } from './support/test-seats.ts';

/**
 * Bombardment across water (lane 1.12; the lead's ruling on Sumter, and the gate's conditions), on fictional ground:
 *
 *   a1 (a's source) --road-- shore ~~sea~~ fort        shore ~~sea~~ town --road-- b1 (b's source)
 *
 * a holds the shore, with guns; b's garrison holds the island fort, cut off, its stores out. a's army is ordered to take
 * the fort: no land route reaches it, so it bombards from the shore. b's town across the water holds no force and no
 * works: there is nothing there a bombardment may fire on.
 */
const RULES: BombardmentRules = FIXTURE_COMBAT_RULES.bombardment;

describe('a day of fire on a fort (combat/bombard.ts)', () => {
  const defender = (over: Partial<BombardDefender> = {}): BombardDefender => ({ guns: 80, men: 80, morale: 600, storesOut: true, works: 0, commander: 'b_gen' as PersonId, boldness: 500, ...over });

  it('wears the defender’s morale by the fire ratio and his empty stores; he surrenders below his floor, and a bolder man holds lower', () => {
    // 600 guns against 80: the ratio is capped at the pack's 3000, so 120 a day from fire, and 60 more with stores out.
    const one = bombardDay(RULES, 600, defender(), 'judge');
    expect(one.fireRatio).toBe(3000);
    expect(one.moraleLoss).toBe(180);
    expect(one.terms.filter((t) => t.btermKind.startsWith('morale_')).reduce((s, t) => s - t.btermValue, 0)).toBe(one.moraleLoss);
    expect([one.moraleAfter, one.floor, one.choice]).toEqual([420, 350, 'hold']);
    expect(bombardDay(RULES, 600, defender({ morale: 420 }), 'judge').choice).toBe('surrender');
    // A bolder commander (800): his floor is 200, so he holds the second day too.
    const bold = bombardDay(RULES, 600, defender({ morale: 420, boldness: 800 }), 'judge');
    expect([bold.floor, bold.moraleAfter, bold.choice]).toEqual([200, 240, 'hold']);
    // His seat decides when it orders: surrender is taken; a breakout cannot cross water, so he holds.
    expect(bombardDay(RULES, 600, defender(), 'surrender').choice).toBe('surrender');
    const out = bombardDay(RULES, 600, defender({ morale: 100 }), 'break_out');
    expect(out.choice).toBe('hold');
    expect(out.terms.map((t) => t.btermKind)).toContain('no_breakout_over_water');
    // Stores in hand, fire alone: 120.
    expect(bombardDay(RULES, 600, defender({ storesOut: false }), 'judge').moraleLoss).toBe(120);
  });

  it('fires only on works and forces, never a town as such (0029; SENSITIVE-HISTORY 3.6: rule 7)', () => {
    expect([...BOMBARD_TARGET_KINDS]).toEqual(['force', 'works']);
    expect(BOMBARD_TARGET_KINDS as readonly string[]).not.toContain('town');
  });
});

function game(o: { readonly boldness?: PersonTemper['boldness']; readonly recordTerms?: boolean } = {}) {
  const base = forcesWorld({
    regions: ['a1', 'shore', 'fort', 'town', 'b1'].map((r) => region(r)),
    edges: [edge('a1', 'shore'), edge('shore', 'fort', { type: 'sea' }), edge('shore', 'town', { type: 'sea' }), edge('town', 'b1')],
    depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
    people: [person('a_lead', 'a'), person('a_gen', 'a'), person('b_lead', 'b'), person('b_gen', 'b', o.boldness === undefined ? {} : { boldness: o.boldness })],
  });
  const terms = o.recordTerms === true ? [{ region: R('fort'), faction: F('b'), terms: 'evacuated_under_terms' as const, source: 'fixture record' }] : [];
  const map = indexWorld({ ...base, rules: { ...base.rules, combat: { ...FIXTURE_COMBAT_RULES, bombardment: { ...RULES, recordTerms: terms } } } });
  const start = forcesStart(
    { a1: { a: 1000 }, shore: { a: 1000 }, fort: { b: 1000 }, town: { b: 1000 }, b1: { b: 1000 } },
    [post('a_army', { department: 'a_war', holder: PER('a_gen'), region: R('shore') }), post('b_fort', { department: 'b_war', holder: PER('b_gen'), region: R('fort') })],
    [
      block('a_guns', { department: 'a_war', region: 'shore', arm: 'artillery', strength: 600, post: P('a_army') }),
      block('a_inf', { department: 'a_war', region: 'shore', strength: 2000, post: P('a_army') }),
      block('b_gar', { department: 'b_war', region: 'fort', arm: 'artillery', strength: 80, storesDays: 0, post: P('b_fort') }),
    ],
    { governments: [{ region: R('town'), department: DEP('b_war'), provenance: [] }] },
  );
  const world = worldOf(map, { ...start, factions: [{ faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true }, { faction: F('b'), principal: PER('b_lead'), capital: R('b1'), playable: true }] });
  // a's general has been told where b's garrison stands (an estimate), so he has something to fire on.
  let state = createState(world, { seed: 1 });
  const seat = seatIdFor(PER('a_gen'));
  state = deliverReport(state, seat, { id: toId('message', 'estimate.fort'), knownReceivedDay: 0, knownRoute: 'courier', knownVia: [], knownBody: { reportType: 'enemy-estimate', reportSubtype: null, reportAuthor: PER('a_gen'), reportAuthorPost: P('a_army'), reportSubjectKind: 'enemy', reportSubjectId: 'a_army', reportClaims: [{ claimKind: 'enemy-strength', claimRegion: R('fort'), claimValue: 80, claimToken: null, claimConfidence: 900 }], reportDay: 0, reportHour: null, reportAdvice: null, reportAnswers: null } }, { truthTerms: [], truthTrimmed: [] });
  return { world, state };
}

/** Order a's army to take `objective` on day 1, and play until the fort falls or `days` pass. */
function play(g: ReturnType<typeof game>, objective: string, days: number) {
  const seats = scriptedSeats({ a: { 1: [order('a_army', 'advance', objective)] } });
  const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
  let s: State = g.state;
  let fell: number | null = null;
  // Day by day, the seats answering their requests, so the test sees the day the fort passes.
  for (let d = 1; d <= days; d++) {
    s = playDays(g.world, s, seats, 1, { freeze: true, telemetry }).state;
    if (fell === null && (s.regionControl[R('fort')]?.[F('a')] ?? 0) === 1000) fell = d;
  }
  return { state: s, telemetry, fell };
}

describe('a fort across water is bombarded until its commander surrenders (tick/bombard.ts)', () => {
  it('a’s army, with no land route, bombards from the shore; b’s commander surrenders by his traits; his men are captured with no record terms', () => {
    const { state, telemetry, fell } = play(game(), 'fort', 15);
    expect(fell).not.toBeNull();
    expect(telemetry.mechanics['combat.bombardment']!.fires).toBeGreaterThanOrEqual(2);
    expect(telemetry.mechanics['combat.surrendered']!.fires).toBe(1);
    // No record terms here: captured (lane 1.3's surrender), his post vacant, his men gone as a typed capture.
    expect(state.personStatus[PER('b_gen')]?.statusKind).toBe('captured');
    expect(state.postStates[P('b_fort')]!.postHolder).toBeNull();
    expect(state.forceBlockStates[toId('forceBlock', 'b_gar')]).toMatchObject({ fbStrength: 0 });
    expect(state.forceBlockStates[toId('forceBlock', 'b_gar')]!.fbSurrenderedDay).not.toBeNull();
    // Nothing crossed the water: a's men are all still on the shore.
    expect(state.forceLocations[toId('forceBlock', 'a_guns')]!.locRegion).toBe(R('shore'));
    // b's principal is told, by a typed report: captured.
    const told = knowledgeOf(state, seatIdFor(PER('b_lead'))).knownReports.flatMap((r) => r.knownBody.reportClaims).find((c) => c.claimKind === 'fort-surrendered');
    expect(told?.claimToken).toBe('captured');
  });

  it('a bolder commander holds longer', () => {
    const average = play(game(), 'fort', 20).fell!;
    const bold = play(game({ boldness: 'high' }), 'fort', 20).fell!;
    expect(bold).toBeGreaterThan(average);
  });

  it('with the record’s terms for this fort, the garrison is evacuated, not captured, and its commander keeps serving', () => {
    const { state, telemetry } = play(game({ recordTerms: true }), 'fort', 15);
    expect(telemetry.mechanics['combat.evacuated']!.fires).toBe(1);
    expect(state.forceBlockStates[toId('forceBlock', 'b_gar')]).toBeUndefined();
    expect(state.forceLocations[toId('forceBlock', 'b_gar')]).toBeUndefined();
    expect(state.personStatus[PER('b_gen')]?.statusKind ?? 'serving').toBe('serving');
    expect(state.postStates[P('b_fort')]!.postHolder).toBeNull();
    expect(state.regionControl[R('fort')]).toEqual({ a: 1000 });
    const told = knowledgeOf(state, seatIdFor(PER('b_lead'))).knownReports.flatMap((r) => r.knownBody.reportClaims).find((c) => c.claimKind === 'fort-surrendered');
    expect(told?.claimToken).toBe('evacuated_under_terms');
  });

  it('a town with no force and no works across the water is never bombarded: the method refuses it, no_target', () => {
    const { state, telemetry } = play(game(), 'town', 10);
    expect(telemetry.mechanics['combat.bombardment']!.fires).toBe(0);
    const rejected = state.planRecords[P('a_army')]?.planDraft?.draftRejected.find((r) => r.rejMethod === 'bombard');
    expect(rejected?.rejGates.map((g) => g.gateKind)).toEqual(['no_target']);
  });
});
