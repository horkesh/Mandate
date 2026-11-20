import { describe, expect, it } from 'vitest';
import { BOMBARD_TARGET_KINDS, bombardDay, fortDay, type BombardDefender } from '../src/combat/bombard.ts';
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
import { ctxFor, worldOf } from './support/tick-context.ts';
import { order, scriptedSeats } from './support/test-seats.ts';
import { believedHolder } from '../src/seats/believed.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { appointHolder, relieveHolder } from '../src/command/command.ts';
import { bombardFort } from '../src/tick/bombard.ts';
import { deliverBattleDispatches } from '../src/tick/deliver.ts';
import { combatRulesProblems } from '../src/combat/rules.ts';
import { sendMessages, type TransitMessage } from '../src/messages/transit.ts';
import { placeAndRemove } from '../src/movement/movement.ts';
import { pruneBattles } from '../src/combat/records.ts';
import { battleVerdict, dayShape } from '../src/combat/shape.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';

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

describe('guns already in battery', () => {
  it('sends the defending commander’s phase dispatch on each day of fire, even while he holds', () => {
    const g = game();
    const ctx = ctxFor(g.world, g.state, 1, [...TICK_MECHANICS, ...MAP_MECHANICS]);
    const result = bombardFort(ctx, g.state, P('a_army'), [toId('forceBlock', 'a_guns')], R('fort'), F('a'), []);
    expect(result.fort?.surrendered).toBeNull();
    const wire = ctx.outbox.find((m) => m.msgReport?.reportClaims.some((c) => c.claimKind === 'battle-phase'));
    expect(wire?.msgReport).toMatchObject({ reportType: 'wire-dispatch', reportAuthor: PER('b_gen'), reportAuthorPost: P('b_fort'), reportSubjectId: 'fort', reportDay: 1 });
    expect(wire?.msgReport?.reportClaims).toContainEqual({ claimKind: 'battle-phase', claimRegion: R('fort'), claimValue: 1, claimToken: 'bombard', claimConfidence: 1000 });
    expect(wire?.msgTo).toBe(PER('b_lead'));
  });
  it('settles only due battle dispatches before situations, preserving travel and other reports’ dispatch phase', () => {
    const g = game();
    const ctx = ctxFor(g.world, g.state, 1, [...TICK_MECHANICS, ...MAP_MECHANICS]);
    bombardFort(ctx, g.state, P('a_army'), [toId('forceBlock', 'a_guns')], R('fort'), F('a'), []);
    const wire = ctx.outbox[0]!;
    ctx.outbox.length = 0;
    const due = { ...wire, msgArriveDay: 1, msgRoute: 'wire' as const, msgRole: 'addressee' as const, msgPending: [] };
    const later = { ...due, id: toId('message', 'later'), msgOrigin: toId('message', 'later'), msgArriveDay: 3, msgRoute: 'courier' as const };
    const surrender = { ...due, id: toId('message', 'surrender'), msgReport: { ...due.msgReport!, reportClaims: [{ ...due.msgReport!.reportClaims[0]!, claimKind: 'fort-surrendered' as const }] } };
    ctx.outbox.push(due, later, surrender);
    const state = deliverBattleDispatches(ctx, g.state);
    expect(knowledgeOf(state, seatIdFor(PER('b_lead'))).knownReports).toMatchObject([{ knownReceivedDay: 1, knownRoute: 'wire' }]);
    expect(state.messagesInTransit).toContainEqual(later);
    expect(ctx.outbox).toEqual([surrender]);
  });
  it('requires every pack to state a whole, nonnegative preparation time', () => {
    for (const inPositionPreparationDays of [undefined, -1, 0.5]) {
      const bombardment = { ...RULES, inPositionPreparationDays } as BombardmentRules;
      expect(combatRulesProblems({ ...FIXTURE_COMBAT_RULES, bombardment }, []).join('\n')).toContain('inPositionPreparationDays');
    }
  });
  it('opens the day after receipt, without concentration, march or works', () => {
    const g = game();
    const seats = scriptedSeats({ a: { 1: [order('a_army', 'advance', 'fort')] } });
    const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
    let state = g.state;
    let received: number | null = null;
    let fired: number | null = null;
    for (let i = 0; i < 15 && fired === null; i++) {
      state = playDays(g.world, state, seats, 1, { telemetry, freeze: true }).state;
      received ??= state.planRecords[P('a_army')]?.planSetDay ?? null;
      if (telemetry.mechanics['combat.bombardment']!.fires > 0) fired = state.stateDay;
    }
    expect(received).not.toBeNull();
    expect(fired).toBe(received! + 1);
    const op = Object.values(state.operationRecords)[0]!;
    expect(op.opAxes[0]!.oaxLog.some((e) => ['march', 'works'].includes(e.axevStage))).toBe(false);
    expect(state.forceLocations[toId('forceBlock', 'a_guns')]!.locRegion).toBe(R('shore'));
  });

  it('marches back to its firing position if its guns moved after drafting, without firing inland', () => {
    const g = game();
    const seats = scriptedSeats({ a: { 1: [order('a_army', 'advance', 'fort')] } });
    const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
    let state = g.state;
    for (let i = 0; i < 15 && state.planRecords[P('a_army')]?.planStatus !== 'choosing'; i++) state = playDays(g.world, state, seats, 1, { telemetry }).state;
    expect(state.planRecords[P('a_army')]?.planStatus).toBe('choosing');
    const moved = ['a_guns', 'a_inf'].map((id) => toId('forceBlock', id));
    state = placeAndRemove(g.world.map, placeAndRemove(g.world.map, state, [], moved), moved.map((block) => ({ block, region: R('a1'), day: state.stateDay })), []);
    state = playDays(g.world, state, seats, 1, { telemetry }).state;
    expect(telemetry.mechanics['combat.bombardment']!.fires).toBe(0);
    expect(telemetry.mechanics['movement.leg_started']!.fires).toBeGreaterThan(0);
    expect(Object.values(state.operationRecords)[0]!.opAxes[0]!.oaxLog.some((e) => e.axevStage === 'march')).toBe(true);
    for (let i = 0; i < 15 && telemetry.mechanics['combat.bombardment']!.fires === 0; i++) state = playDays(g.world, state, seats, 1, { telemetry }).state;
    expect(telemetry.mechanics['combat.bombardment']!.fires).toBeGreaterThan(0);
    expect(state.forceLocations[toId('forceBlock', 'a_guns')]!.locRegion).toBe(R('shore'));
  });
});

function game(o: { readonly boldness?: PersonTemper['boldness']; readonly recordTerms?: boolean; readonly offerWindow?: { readonly offerDay: number; readonly lastDay: number } | null } = {}) {
  const base = forcesWorld({
    regions: ['a1', 'shore', 'fort', 'town', 'b1'].map((r) => region(r)),
    edges: [edge('a1', 'shore'), edge('shore', 'fort', { type: 'sea' }), edge('shore', 'town', { type: 'sea' }), edge('town', 'b1')],
    depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
    people: [person('a_lead', 'a'), person('a_gen', 'a'), person('b_lead', 'b'), person('b_other', 'b'), person('b_gen', 'b', o.boldness === undefined ? {} : { boldness: o.boldness })],
  });
  const terms = o.recordTerms === true ? [{ region: R('fort'), faction: F('b'), commander: PER('b_gen'), offerWindow: o.offerWindow === undefined ? { offerDay: 0, lastDay: 15 } : o.offerWindow, terms: 'evacuated_under_terms' as const, source: 'fixture record' }] : [];
  // G-1.12a: only the fort may be bombarded; the town is no fortification on the list.
  const map = indexWorld({ ...base, rules: { ...base.rules, combat: { ...FIXTURE_COMBAT_RULES, bombardment: { ...RULES, objectives: [{ region: R('fort'), source: 'fixture fort' }], recordTerms: terms } } } });
  const start = forcesStart(
    { a1: { a: 1000 }, shore: { a: 1000 }, fort: { b: 1000 }, town: { b: 1000 }, b1: { b: 1000 } },
    [post('a_army', { department: 'a_war', holder: PER('a_gen'), region: R('shore') }), post('b_fort', { department: 'b_war', holder: PER('b_gen'), region: R('fort') }), post('b_town', { department: 'b_war', region: R('town') })],
    [
      block('a_guns', { department: 'a_war', region: 'shore', arm: 'artillery', strength: 600, post: P('a_army') }),
      block('a_inf', { department: 'a_war', region: 'shore', strength: 2000, post: P('a_army') }),
      block('b_gar', { department: 'b_war', region: 'fort', arm: 'artillery', strength: 80, storesDays: 0, post: P('b_fort') }),
      // b's men in the town across the water: a force a's general believes is there, which still makes no target (G-1.12a).
      block('b_town', { department: 'b_war', region: 'town', strength: 500, post: P('b_town') }),
    ],
    { governments: [{ region: R('town'), department: DEP('b_war'), provenance: [] }] },
  );
  const world = worldOf(map, { ...start, factions: [{ faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true }, { faction: F('b'), principal: PER('b_lead'), capital: R('b1'), playable: true }] });
  // a's general has been told where b's garrison stands (an estimate), so he has something to fire on.
  let state = createState(world, { seed: 1 });
  const seat = seatIdFor(PER('a_gen'));
  state = deliverReport(state, seat, { id: toId('message', 'estimate.fort'), knownReceivedDay: 0, knownRoute: 'courier', knownVia: [], knownBody: { reportType: 'enemy-estimate', reportSubtype: null, reportAuthor: PER('a_gen'), reportAuthorPost: P('a_army'), reportSubjectKind: 'enemy', reportSubjectId: 'a_army', reportClaims: [{ claimKind: 'enemy-strength', claimRegion: R('fort'), claimValue: 80, claimToken: null, claimConfidence: 900 }, { claimKind: 'enemy-strength', claimRegion: R('town'), claimValue: 500, claimToken: null, claimConfidence: 900 }], reportDay: 0, reportHour: null, reportAdvice: null, reportAnswers: null } }, { truthTerms: [], truthTrimmed: [] });
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
  it('keeps the daily fire in one battle, with the attacking post as its cause, then closes and prunes it', () => {
    const { state, telemetry } = play(game({ recordTerms: true }), 'fort', 15);
    const records = Object.values(state.battleRecords);
    expect(records).toHaveLength(1);
    const record = records[0]!;
    expect(record.battleCauses).toEqual([P('a_army')]);
    expect(record.battleFactions).toEqual([F('a'), F('b')]);
    expect(record.battleDays).toHaveLength(telemetry.mechanics['combat.bombardment']!.fires);
    expect(record.battleDays.map(d => d.bdayNumber)).toEqual(record.battleDays.map((_, i) => i + 1));
    expect(record.battleStartDay).toBe(record.battleDays[0]!.bdayDay);
    expect(record.battleEndDay).toBe(record.battleDays.at(-1)!.bdayDay);
    expect(battleVerdict(record).field).toBe(F('a'));
    for (const day of record.battleDays) {
      expect(day).toMatchObject({ bdayType: 'bombard', bdayDraws: 0, bdayContact: 0 });
      for (const side of day.bdaySides) {
        expect(side.bsideUnknown).toEqual([]);
        expect(side.bsideKwParts.reduce((s, t) => s + t.btermValue, 0)).toBe(side.bsideKw);
        expect(side.bsideCaptured).toBe(0); // Evacuation is not capture.
      }
    }
    const text = encodeSave({ worldHash: canonicalHash({ fixture: 'bombard' }), state });
    const loaded = decodeSave(text).state as unknown as State;
    expect(loaded.battleRecords).toEqual(state.battleRecords);
    expect(pruneBattles(loaded, record.battleEndDay! + 10, 10).pruned).toBe(0);
    expect(pruneBattles(loaded, record.battleEndDay! + 11, 10).state.battleRecords).toEqual({});
  });

  it('records the actual killed, wounded, capture and morale deltas with summing parts, without a second loss calculation', () => {
    const base = game();
    const raw = base.world.map.world;
    const map = indexWorld({ ...raw, rules: { ...raw.rules, combat: { ...raw.rules.combat, bombardment: { ...raw.rules.combat.bombardment, lossPermille: 50 } } } });
    const world = worldOf(map, base.world.start);
    const gar = toId('forceBlock', 'b_gar');
    const start: State = { ...base.state, forceBlockStates: { ...base.state.forceBlockStates, [gar]: { ...base.state.forceBlockStates[gar]!, fbStragglers: 3 } } };
    const ctx = { ...ctxFor(world, start, 1, [...TICK_MECHANICS, ...MAP_MECHANICS]), battleOrders: new Map([[P('b_fort'), { commit: 'judge', night: 'judge', cutOff: 'surrender', pursue: 'judge' } as const]]) };
    const result = bombardFort(ctx, start, P('a_army'), [toId('forceBlock', 'a_guns')], R('fort'), F('a'), []);
    const record = Object.values(result.state.battleRecords)[0];
    expect(record).toBeDefined();
    const day = record!.battleDays[0]!;
    const defender = day.bdaySides.find(s => s.bsideFaction === F('b'))!;
    expect(defender.bsideKw).toBe(12);
    expect(defender.bsideKwParts).toEqual(result.fort!.day.terms.filter(t => t.btermKind === 'killed_wounded'));
    expect(defender.bsideKilled + defender.bsideWounded).toBe(12);
    expect(defender.bsideCaptured).toBe(71);
    expect(defender.bsideCapturedParts.reduce((s, t) => s + t.btermValue, 0)).toBe(71);
    expect(defender.bsideMissingParts.reduce((s, t) => s + t.btermValue, 0)).toBe(defender.bsideMissing);
    expect(defender.bsideLosses).toEqual([{ blossBlock: gar, blossKilled: defender.bsideKilled, blossWounded: defender.bsideWounded, blossMissing: 0, blossCaptured: 68, blossStragglersCaptured: 3 }]);
    expect(defender.bsideMoraleBefore).toBe(start.forceBlockStates[gar]!.fbMorale);
    expect(defender.bsideMoraleAfter).toBe(result.state.forceBlockStates[gar]!.fbMorale);
    expect(defender.bsideMoraleBefore + defender.bsideMoraleTerms.reduce((s, t) => s + t.btermValue, 0)).toBe(defender.bsideMoraleAfter);
    expect(defender.bsideHit).toBe('captured');
    expect(defender.bsideKw + defender.bsideCaptured).toBe(83);
    const shape = dayShape(world.map.world.rules.combat, day);
    expect(shape.phases).toEqual([]); // The model resolves a whole day, with no hour distribution.
  });

  it('records only batteries that supplied known fire, without guessing the supporting blocks’ strength', () => {
    const g = game();
    const unknown = toId('forceBlock', 'a_inf');
    const start = { ...g.state, forceBlockStates: { ...g.state.forceBlockStates, [unknown]: { ...g.state.forceBlockStates[unknown]!, fbStrength: null } } };
    const ctx = ctxFor(g.world, start, 1, [...TICK_MECHANICS, ...MAP_MECHANICS]);
    const result = bombardFort(ctx, start, P('a_army'), [unknown, toId('forceBlock', 'a_guns')], R('fort'), F('a'), []);
    const record = Object.values(result.state.battleRecords)[0];
    expect(record).toBeDefined();
    expect(record!.battleEndDay).toBeNull();
    expect(record!.battleDays[0]!.bdaySides[0]).toMatchObject({ bsideBlocks: [toId('forceBlock', 'a_guns')], bsideUnknown: [], bsidePresent: 600, bsideKw: 0 });
    expect(result.fort!.day.terms.find(t => t.btermKind === 'guns_attacker')?.btermValue).toBe(600);
    expect(result.state.forceBlockStates[unknown]!.fbStrength).toBeNull();
  });

  it('still lists unknown defenders under fire and counts their strength as none', () => {
    const g = game();
    const unknown = toId('forceBlock', 'b_gar');
    const start: State = { ...g.state, forceBlockStates: { ...g.state.forceBlockStates, [unknown]: { ...g.state.forceBlockStates[unknown]!, fbStrength: null } } };
    const ctx = ctxFor(g.world, start, 1, [...TICK_MECHANICS, ...MAP_MECHANICS]);
    const result = bombardFort(ctx, start, P('a_army'), [toId('forceBlock', 'a_guns')], R('fort'), F('a'), []);
    const record = Object.values(result.state.battleRecords)[0]!;
    expect(record.battleDays[0]!.bdaySides[1]).toMatchObject({ bsideBlocks: [unknown], bsideUnknown: [unknown], bsidePresent: 0, bsideKw: 0 });
    expect(result.state.forceBlockStates[unknown]!.fbStrength).toBeNull();
  });

  it('resumes an open bombardment from a save to the same record and State', () => {
    const g = game({ recordTerms: true });
    const seats = scriptedSeats({ a: { 1: [order('a_army', 'advance', 'fort')] } });
    let state = g.state;
    for (let d = 0; d < 15 && Object.keys(state.battleRecords).length === 0; d++) state = playDays(g.world, state, seats, 1, { freeze: true }).state;
    const record = Object.values(state.battleRecords)[0]!;
    expect(record.battleEndDay).toBeNull();
    const loaded = decodeSave(encodeSave({ worldHash: canonicalHash(g.world.map.world), state })).state as unknown as State;
    const continuous = playDays(g.world, state, seats, 10, { freeze: true }).state;
    const resumed = playDays(g.world, loaded, seats, 10, { freeze: true }).state;
    expect(canonicalHash(resumed)).toBe(canonicalHash(continuous));
    expect(Object.values(resumed.battleRecords)).toHaveLength(1);
    expect(Object.values(resumed.battleRecords)[0]!.battleEndDay).not.toBeNull();
  });

  it('captures a replacement commander and his garrison instead of granting another man’s recorded terms', () => {
    const g = game({ recordTerms: true });
    const changed = appointHolder(g.world.map, relieveHolder(g.state, P('b_fort')), P('b_fort'), PER('b_other'));
    const { state, telemetry } = play({ ...g, state: changed }, 'fort', 15);
    expect(telemetry.mechanics['combat.evacuated']!.fires).toBe(0);
    expect(state.personStatus[PER('b_other')]?.statusKind).toBe('captured');
    expect(state.personStatus[PER('b_gen')]?.statusKind ?? 'serving').toBe('serving');
    expect(state.postStates[P('b_fort')]!.postHolder).toBeNull();
    expect(state.forceBlockStates[toId('forceBlock', 'b_gar')]!.fbStrength).toBe(0);
    expect(state.forceBlockStates[toId('forceBlock', 'b_gar')]!.fbSurrenderedDay).not.toBeNull();
    const told = knowledgeOf(state, seatIdFor(PER('b_lead'))).knownReports.flatMap((r) => r.knownBody.reportClaims).find((c) => c.claimKind === 'fort-surrendered');
    expect(told?.claimToken).toBe('captured');
  });

  it.each([{ offerDay: 15, lastDay: 17 }, { offerDay: 0, lastDay: 1 }])('captures a garrison whose fall is outside the recorded offer window %j', (offerWindow) => {
    const { state, telemetry } = play(game({ recordTerms: true, offerWindow }), 'fort', 15);
    expect(telemetry.mechanics['combat.evacuated']!.fires).toBe(0);
    expect(state.personStatus[PER('b_gen')]?.statusKind).toBe('captured');
    expect(state.forceBlockStates[toId('forceBlock', 'b_gar')]!.fbStrength).toBe(0);
    expect(state.forceBlockStates[toId('forceBlock', 'b_gar')]!.fbSurrenderedDay).not.toBeNull();
    const told = knowledgeOf(state, seatIdFor(PER('b_lead'))).knownReports.flatMap((r) => r.knownBody.reportClaims).find((c) => c.claimKind === 'fort-surrendered');
    expect(told?.claimToken).toBe('captured');
  });

  it.each([4, 5, 6, 7, 8])('applies dated terms strictly after the offer through the last day (fall on day %i)', (day) => {
    const g = game({ recordTerms: true, offerWindow: { offerDay: 5, lastDay: 7 } });
    const ctx = { ...ctxFor(g.world, g.state, day, [...TICK_MECHANICS, ...MAP_MECHANICS]), battleOrders: new Map([[P('b_fort'), { commit: 'judge', night: 'judge', cutOff: 'surrender', pursue: 'judge' } as const]]) };
    const result = bombardFort(ctx, g.state, P('a_army'), [toId('forceBlock', 'a_guns')], R('fort'), F('a'), []);
    const granted = day > 5 && day <= 7;
    expect(result.fort?.surrendered).toBe(granted ? 'evacuated_under_terms' : 'captured');
    expect(result.fort?.recordSource).toBe(granted ? 'fixture record' : null);
    expect(result.state.personStatus[PER('b_gen')]?.statusKind ?? 'serving').toBe(granted ? 'serving' : 'captured');
    expect(result.state.forceBlockStates[toId('forceBlock', 'b_gar')] === undefined).toBe(granted);
  });

  it('keeps a commander-only record undated when no offer date is recorded', () => {
    const g = game({ recordTerms: true, offerWindow: null });
    expect(fortDay(g.world, g.state, [toId('forceBlock', 'a_guns')], R('fort'), F('a'), () => 'surrender', 100)?.surrendered).toBe('evacuated_under_terms');
    const vacant = relieveHolder(g.state, P('b_fort'));
    expect(fortDay(g.world, vacant, [toId('forceBlock', 'a_guns')], R('fort'), F('a'), () => 'surrender', 100)?.surrendered).toBe('captured');
  });

  it('rejects invalid recorded offer windows and unknown commanders at the world boundary', () => {
    const g = game({ recordTerms: true });
    const combat = g.world.map.world.rules.combat;
    const row = combat.bombardment.recordTerms[0]!;
    for (const offerWindow of [{ offerDay: -1, lastDay: 3 }, { offerDay: 1.5, lastDay: 3 }, { offerDay: 3, lastDay: 3 }, { offerDay: 4, lastDay: 3 }]) {
      expect(combatRulesProblems({ ...combat, bombardment: { ...combat.bombardment, recordTerms: [{ ...row, offerWindow }] } }, []).join('\n')).toContain('offerWindow');
    }
    const map = indexWorld({ ...g.world.map.world, rules: { ...g.world.map.world.rules, combat: { ...combat, bombardment: { ...combat.bombardment, recordTerms: [{ ...row, commander: PER('missing') }] } } } });
    expect(() => worldOf(map, g.world.start)).toThrow('missing is not a person');
  });

  it('reports a commander appointed earlier on the very day the bombardment captures him', () => {
    const g = game();
    const rules = scriptedSeats({ a: { 1: [order('a_army', 'advance', 'fort')] } });
    let state = g.state;
    let before = state;
    for (let d = 1; d <= 20 && state.personStatus[PER('b_gen')]?.statusKind !== 'captured'; d++) {
      before = state;
      state = playDays(g.world, state, rules, 1).state;
    }
    expect(state.personStatus[PER('b_gen')]?.statusKind).toBe('captured');
    const day = before.stateDay + 1;
    const id = toId('message', 'appointment.arrives');
    const appoint: TransitMessage = {
      id, msgOrigin: id, msgFrom: PER('b_lead'), msgTo: PER('b_gen'), msgToPost: null, msgRole: 'addressee', msgRoute: 'courier',
      msgSentDay: day - 1, msgArriveDay: day, msgVia: [], msgPending: [], msgOrder: null, msgReport: null, msgTruth: null,
      msgVerb: { verbKind: 'appoint', verbIssuer: PER('b_lead'), verbIssuedDay: day - 1, verbPost: P('b_fort'), verbTo: null, verbMode: null, verbAmount: null, verbRank: null, verbSubject: null },
    };
    const vacant = relieveHolder(before, P('b_fort'));
    const captured = playDays(g.world, sendMessages(vacant, [appoint]), rules, 1).state;
    expect(captured.personStatus[PER('b_gen')]?.statusKind).toBe('captured');
    expect(captured.messagesInTransit.some((m) => m.msgReport?.reportClaims.some((c) => c.claimKind === 'commander-lost'))).toBe(true);
    expect(believedHolder(captured, PER('b_lead'), P('b_fort'))).toBe(PER('b_gen'));
  });
  it('a bombardment capture leaves the commander believed in post until its report arrives', () => {
    const g = game();
    const rules = scriptedSeats({ a: { 1: [order('a_army', 'advance', 'fort')] } });
    let state = g.state;
    for (let d = 1; d <= 20 && state.personStatus[PER('b_gen')]?.statusKind !== 'captured'; d++) state = playDays(g.world, state, rules, 1, { freeze: true }).state;
    expect(state.personStatus[PER('b_gen')]?.statusKind).toBe('captured');
    expect(Object.values(state.battleRecords)).toHaveLength(1);
    const report = state.messagesInTransit.find((m) => m.msgReport?.reportClaims.some((c) => c.claimKind === 'commander-lost'))!;
    expect(report).toBeDefined();
    expect(believedHolder(state, PER('b_lead'), P('b_fort'))).toBe(PER('b_gen'));
    const menu = principalMenu(g.world, state, F('b'), morningGround(g.world, state, state.stateDay + 1));
    expect(menu.commandable.find((p) => p.post === P('b_fort'))?.holder).toBe(PER('b_gen'));
    for (let d = 0; d < 30 && state.messagesInTransit.some((m) => m.msgOrigin === report.msgOrigin); d++) state = playDays(g.world, state, rules, 1).state;
    expect(knowledgeOf(state, seatIdFor(PER('b_lead'))).knownReports.some((r) => r.id === report.msgOrigin)).toBe(true);
    expect(believedHolder(state, PER('b_lead'), P('b_fort'))).toBeNull();
  });
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

  it('a town is never bombarded, even with a force believed in it: only a listed fortification is a target (G-1.12a), no_target', () => {
    const g = game();
    // a's general believes b's 500 men stand in the town, and his guns are within range of it across the water.
    expect(knowledgeOf(g.state, seatIdFor(PER('a_gen'))).knownReports.some((r) => r.knownBody.reportClaims.some((c) => c.claimRegion === R('town') && c.claimValue > 0))).toBe(true);
    const { state, telemetry } = play(g, 'town', 10);
    expect(telemetry.mechanics['combat.bombardment']!.fires).toBe(0);
    const rejected = state.planRecords[P('a_army')]?.planDraft?.draftRejected.find((r) => r.rejMethod === 'bombard');
    expect(rejected?.rejGates.map((g) => g.gateKind)).toEqual(['no_target']);
    expect(rejected?.rejGates[0]!.gateDetail).toContain('not a fortification the rules let be bombarded');
    // The town's men are untouched.
    expect(state.forceBlockStates[toId('forceBlock', 'b_town')]!.fbStrength).toBe(500);
  });

  it('the stage itself fires on nothing the list leaves out (rule 7: a check, not only the planner’s judgement)', () => {
    const g = game();
    const fort = fortDay(g.world, g.state, [toId('forceBlock', 'a_guns')], R('town'), F('a'), () => 'judge', 1);
    expect(fort).toBeNull();
    expect(fortDay(g.world, g.state, [toId('forceBlock', 'a_guns')], R('fort'), F('a'), () => 'judge', 1)).not.toBeNull();
  });
});
