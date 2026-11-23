import { patchBlock, observeBlock } from './support/lot-fixture.ts';
import { forceTotals } from '../src/forces/lots.ts';
import { describe, expect, it } from 'vitest';
import { combatDay } from '../src/combat/battle.ts';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { toId, type ForceBlockId, type MessageId } from '../src/ids.ts';
import type { PlanCandidate } from '../src/planner/types.ts';
import type { PlanRecord } from '../src/plans/plans.ts';
import type { State } from '../src/root-state.ts';
import { transferForce } from '../src/command/command.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { applyDetachmentProposals } from '../src/tick/detachments.ts';
import { passageOf } from '../src/tick/passage.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, TICK_MECHANICS } from '../src/tick/tick.ts';
import { worldOf } from './support/tick-context.ts';
import { B, block, forcesIndex, forcesStart, P, PER, post } from './support/forces-fixture.ts';
import { depot, edge, F, R, region } from './support/map-fixture.ts';

/**
 * Detachments in play (lane 1.4b), on fictional ground:
 *
 *   a1 ==rail== a2 --road-- mid --road-- b2 ==rail== b1
 *                \                       /
 *                 ---------- w ---------      (w: a river; a ship there can put men ashore at a2 or b2)
 *                            |
 *                            w0               (w0: the river upstream, one water leg from w; no land beside it)
 */
const MAP = forcesIndex({
  regions: ['a1', 'a2', 'mid', 'b2', 'b1'].map((r) => region(r)).concat([region('w', 'river'), region('w0', 'river')]),
  edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line' }), edge('a2', 'mid'), edge('mid', 'b2'), edge('b2', 'b1', { type: 'rail', line: 'b_line' }), edge('a2', 'w', { type: 'river' }), edge('b2', 'w', { type: 'river' }), edge('w0', 'w', { type: 'river' })],
  depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
});
const CONTROL = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 500, b: 500 }, b2: { b: 1000 }, b1: { b: 1000 } };
const POSTS = [post('a_army', { department: 'a_war', holder: PER('a_gen'), region: R('a2') }), post('a_navy', { department: 'a_war', holder: PER('a_gen2'), region: R('a2') })];

function game(blocks: Parameters<typeof forcesStart>[2]) {
  const start = forcesStart(CONTROL, POSTS, blocks, {
    factions: [
      { faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true },
      { faction: F('b'), principal: PER('b_lead'), capital: R('b1'), playable: true },
    ],
  });
  const world = worldOf(MAP, start);
  return { world, state: createState(world, { seed: 1, people: 'as-history' }) };
}

/** Every man of these blocks and every detachment of them: present and straggling. */
const men = (s: State, roots: readonly string[]) =>
  (Object.keys(s.forceBlockStates) as ForceBlockId[])
    .filter((id) => roots.includes(id) || roots.includes(s.forceBlockStates[id]!.fbParent ?? ''))
    .reduce((a, id) => a + (forceTotals(s.forceBlockStates[id]!).fbStrength ?? 0) + forceTotals(s.forceBlockStates[id]!).fbStragglers, 0);

const SHIP = [block('a_ship', { department: 'a_war', region: 'w', arm: 'naval', strength: 300, post: P('a_navy') }), block('a_troops', { department: 'a_war', region: 'w', aboard: B('a_ship'), strength: 600, storesDays: 10, post: P('a_army') })];

describe('a landing: men go ashore from a ship as a detachment (lane 1.4b)', () => {
  it('lands across an edge from the ship\'s region, under the parent\'s post, arriving that day; the parent stays aboard', () => {
    const g = game(SHIP);
    const r = applyDetachmentProposals(MAP, g.state, [{ kind: 'landing', parent: B('a_troops'), men: 450, region: R('b2'), post: null, cause: 'operations' }], 5);
    expect(r.refused).toEqual([]);
    const id = r.made[0]!;
    expect(id).toBe('a_troops.det.5');
    expect(observeBlock(r.state.forceBlockStates[id]!)).toMatchObject({ fbKind: 'detachment', fbParent: 'a_troops', fbStrength: 450, fbDepartment: 'a_war' });
    expect(forceTotals(r.state.forceBlockStates[B('a_troops')]!).fbStrength).toBe(150);
    expect(r.state.forceLocations[id]).toEqual({ locRegion: 'b2', locAboard: null, locSinceDay: 5, locMarch: null });
    expect(r.state.forceLocations[B('a_troops')]!.locAboard).toBe('a_ship');
    expect(r.state.forceAssignments[id]).toBe('a_army');
    // Stores go with the men, in proportion: 10 days for 600 men split as 450 and 150.
    expect([r.state.forceBlockStates[id]!.fbStoresMilli, r.state.forceBlockStates[B('a_troops')]!.fbStoresMilli]).toEqual([7500, 2500]);
    expect(men(r.state, ['a_troops'])).toBe(600);
  });

  it('refuses a landing that is not across an edge, not on land, or not from aboard, each with its reason, and changes nothing', () => {
    const g = game([...SHIP, block('a_foot', { department: 'a_war', region: 'a2', strength: 1000, post: P('a_army') })]);
    const r = applyDetachmentProposals(
      MAP,
      g.state,
      [
        { kind: 'landing', parent: B('a_troops'), men: 100, region: R('mid'), post: null, cause: 'operations' },
        { kind: 'landing', parent: B('a_troops'), men: 100, region: R('w'), post: null, cause: 'operations' },
        { kind: 'landing', parent: B('a_foot'), men: 100, region: R('b2'), post: null, cause: 'operations' },
        { kind: 'landing', parent: B('a_troops'), men: 601, region: R('b2'), post: null, cause: 'operations' },
      ],
      5,
    );
    expect(r.refused.map((x) => x.reason)).toEqual(['not_adjacent', 'not_land', 'not_aboard', 'forces']);
    expect(r.state).toBe(g.state);
  });

  it('an operation by water sails its carrier and lands its troops at the objective, then holds it as a land axis', () => {
    // The ship starts one water leg away (w0), so the carrier must sail before the troops can land (lane 1.4c).
    const { state, telemetry } = landByOperation();
    const op = Object.values(state.operationRecords)[0]!;
    const log = op.opAxes[0]!.oaxLog.map((e) => `${e.axevStage}:${e.axevReason}`);
    expect(log).toContain('march:landed');
    const landed = op.opAxes[0]!.oaxBlocks[0]!;
    expect(observeBlock(state.forceBlockStates[landed]!)).toMatchObject({ fbKind: 'detachment', fbParent: 'a_troops', fbStrength: 600 });
    expect(state.forceLocations[landed]!.locRegion).toBe('b2');
    // The carrier sailed: it left w0 on a leg and stands beside the objective, and the landing was counted.
    expect(state.forceLocations[B('a_ship')]!.locRegion).toBe('w');
    expect(telemetry.mechanics['movement.leg_started']!.fires).toBeGreaterThanOrEqual(1);
    expect(telemetry.mechanics['operations.landed']!.fires).toBe(1);
    // The men are conserved: ashore as the landing, none lost in the boats.
    expect(men(state, ['a_troops'])).toBe(600);
    expect(op.opAxes[0]!.oaxArrived).not.toBeNull();
  });
});

/** The ship and its troops one water leg up the river from w, at w0. */
const SHIP_UP = [block('a_ship', { department: 'a_war', region: 'w0', arm: 'naval', strength: 300, post: P('a_navy') }), block('a_troops', { department: 'a_war', region: 'w0', aboard: B('a_ship'), strength: 600, storesDays: 10, post: P('a_army') })];

/** An approved plan to take b2 by water, sailing w0 -> w, then landing at b2; played until the troops are ashore. */
function landByOperation(extra: Parameters<typeof forcesStart>[2] = []) {
  const g = game([...SHIP_UP, ...extra]);
  const water = (from: string, to: string, edgeId: string) => ({ legEdge: toId('edge', edgeId), legFrom: R(from), legTo: R(to), legType: 'river' as const, legDays: 1000, legThreat: 0, legSupply: 0, legObstacleDays: 0, legObstacle: null, legHeld: true });
  const legs = [water('w0', 'w', 'river:w:w0'), water('w', 'b2', 'river:b2:w')];
  const candidate: PlanCandidate = {
    id: 'by_water:b2',
    candMethod: 'by_water',
    candVariant: 'run_in',
    candAxes: [{ axisName: 'afloat', axisPost: P('a_army'), axisMode: 'river', axisRoute: { routeFrom: R('w0'), routeTo: R('b2'), routeLegs: legs, routeCost: 0, routeDays: 2000 }, axisBlocks: [B('a_troops')], axisStrength: 600, axisPhases: [], axisArrival: 0, axisOutOfSupply: 0, axisStoresDays: 10, axisStoresAssumed: false }],
    candRequests: [],
    candConditions: [],
    candTerms: [],
    candScore: 0,
    candPerceived: 0,
    candRatio: 0,
  };
  const record: PlanRecord = {
    planGoal: { goalObjective: R('b2'), goalPosture: 'take', goalRisk: 500, goalDeadlineDays: 30, goalRail: false, goalRiver: true, goalSea: false, goalNeutral: false, goalCommitted: [], goalAwaitWord: false, goalApproveAsDrafted: true },
    planIssuer: PER('a_lead'),
    planViaChain: true,
    planSetDay: 0,
    planIssuedDay: 0,
    planOrder: 'order:land' as MessageId,
    planResponse: 'order:land|a_gen',
    planStatus: 'approved',
    planDraft: null,
    planChosen: candidate.id,
    planApproved: candidate,
    planSubmitted: null,
    planCounters: [],
    planPending: null,
  };
  const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
  let state: State = { ...g.state, planRecords: { [P('a_army')]: record } };
  for (let d = 0; d < 14; d++) state = tick(g.world, state, [], { freeze: true, telemetry }).state;
  return { g, state, telemetry };
}

describe('a transfer never hands over an empty shell, nor a force standing elsewhere (lane 1.4c; 0081)', () => {
  it('lands 600 men, then a transfer weakest first by block and by men: the shell is not chosen, the landing stays on its axis, and the men sent are true', () => {
    const foot = block('a_foot', { department: 'a_war', region: 'a2', strength: 1000, post: P('a_army') });
    const { g, state } = landByOperation([foot]);
    const op = Object.values(state.operationRecords)[0]!;
    const landing = op.opAxes[0]!.oaxBlocks[0]!;
    // The parent is an emptied shell aboard; its landing stands ashore at b2 under the same post.
    expect(forceTotals(state.forceBlockStates[B('a_troops')]!).fbStrength).toBe(0);
    expect(state.forceAssignments[landing]).toBe(P('a_army'));
    for (const force of [{ force: 'blocks' as const, count: 1 }, { force: 'men' as const, men: 500 }]) {
      const r = transferForce(g.world.map, state, P('a_army'), P('a_navy'), force, 'weakest_first');
      // The weakest block with men is chosen, never the shell; the landing is the field's, not the shell's to give.
      expect(r.moved, force.force).toEqual([B('a_foot')]);
      expect(r.menSent, force.force).toBe(1000);
      expect(r.state.forceAssignments[B('a_troops')]).toBe(P('a_army'));
      expect(r.state.forceAssignments[landing]).toBe(P('a_army'));
      // The landing stays on its axis: the operation still holds it a day later.
      const next = tick(g.world, r.state, [], { freeze: true }).state;
      expect(Object.values(next.operationRecords)[0]!.opAxes[0]!.oaxBlocks).toContain(landing);
    }
  });

  it('a detachment standing with its chosen parent goes with it, and its men are counted sent', () => {
    const g = game([block('a_1', { department: 'a_war', region: 'a2', strength: 5000, post: P('a_army') }), block('a_2', { department: 'a_war', region: 'a2', strength: 7000, post: P('a_army') })]);
    const out = applyDetachmentProposals(MAP, g.state, [{ kind: 'garrison', parent: B('a_1'), men: 1000, post: null, cause: 'command' }], 3);
    const garrison = out.made[0]!;
    const r = transferForce(g.world.map, out.state, P('a_army'), P('a_navy'), { force: 'blocks', count: 1 }, 'weakest_first');
    expect(r.moved).toEqual([B('a_1'), garrison].sort());
    expect(r.menSent).toBe(5000);
    // Moved apart, the same garrison stays where it stands.
    const apart = { ...out.state, forceLocations: { ...out.state.forceLocations, [garrison]: { ...out.state.forceLocations[garrison]!, locRegion: R('mid') } } };
    const r2 = transferForce(g.world.map, apart, P('a_army'), P('a_navy'), { force: 'blocks', count: 1 }, 'weakest_first');
    expect(r2.moved).toEqual([B('a_1')]);
    expect(r2.menSent).toBe(4000);
  });
});

describe('a detachment id is never re-minted (lane 1.4c; 0081)', () => {
  it('a make, a rejoin and a make again from one parent on one day never give the first id twice, call by call', () => {
    const g = game([block('a_1', { department: 'a_war', region: 'a2', strength: 5000, storesDays: 10, post: P('a_army') })]);
    const garrison = (men: number) => ({ kind: 'garrison' as const, parent: B('a_1'), men, post: null, cause: 'command' as const });
    const first = applyDetachmentProposals(MAP, g.state, [garrison(1000)], 3);
    expect(first.made).toEqual(['a_1.det.3']);
    // The same day, in a later call: the rejoin waits a day, so the first id is not freed, and changes nothing.
    const rejoin = applyDetachmentProposals(MAP, first.state, [{ kind: 'rejoin', detachment: 'a_1.det.3' as ForceBlockId, cause: 'command' }], 3);
    expect(rejoin.refused.map((x) => x.reason)).toEqual(['same_day']);
    expect(rejoin.state).toBe(first.state);
    const again = applyDetachmentProposals(MAP, rejoin.state, [garrison(500)], 3);
    expect(again.made).toEqual(['a_1.det.3.2']);
    // A day later the first rejoins, and what is made that day carries its own day: the first id is never made again.
    const back = applyDetachmentProposals(MAP, again.state, [{ kind: 'rejoin', detachment: 'a_1.det.3' as ForceBlockId, cause: 'command' }], 4);
    expect(back.rejoined).toEqual(['a_1.det.3']);
    const later = applyDetachmentProposals(MAP, back.state, [garrison(700)], 4);
    expect(later.made).toEqual(['a_1.det.4']);
    expect(new Set([...first.made, ...again.made, ...later.made]).size).toBe(3);
  });
});
describe('a garrison: detached where its parent stands, rejoined, or left to stand alone (lane 1.4b)', () => {
  const FIELD = [block('a_1', { department: 'a_war', region: 'a2', strength: 5000, storesDays: 10, post: P('a_army') })];

  it('detaches a garrison in place, keeping the parent\'s arrival day (it does not press), and rejoins it with the strength conserved', () => {
    const g = game(FIELD);
    const out = applyDetachmentProposals(MAP, g.state, [{ kind: 'garrison', parent: B('a_1'), men: 1200, post: null, cause: 'command' }], 3);
    const id = out.made[0]!;
    expect(out.state.forceLocations[id]).toEqual({ locRegion: 'a2', locAboard: null, locSinceDay: 0, locMarch: null });
    expect([forceTotals(out.state.forceBlockStates[B('a_1')]!).fbStrength, forceTotals(out.state.forceBlockStates[id]!).fbStrength]).toEqual([3800, 1200]);
    expect(men(out.state, ['a_1'])).toBe(5000);
    // A garrison's stragglers come home with it.
    const straggling = { ...out.state, forceBlockStates: { ...out.state.forceBlockStates, [id]: patchBlock({ ...out.state.forceBlockStates[id]! }, { fbStrength: 1100, fbStragglers: 100 }) } };
    const back = applyDetachmentProposals(MAP, straggling, [{ kind: 'rejoin', detachment: id, cause: 'command' }], 9);
    expect(back.rejoined).toEqual([id]);
    expect(back.state.forceBlockStates[id]).toBeUndefined();
    expect(back.state.forceLocations[id]).toBeUndefined();
    expect(back.state.forceAssignments[id]).toBeUndefined();
    expect(observeBlock(back.state.forceBlockStates[B('a_1')]!)).toMatchObject({ fbStrength: 4900, fbStragglers: 100, fbStoresMilli: 10000 });
    expect(men(back.state, ['a_1'])).toBe(5000);
  });

  it('refuses to rejoin when the two stand apart, and lets a detachment stand alone as a block', () => {
    const g = game(FIELD);
    const out = applyDetachmentProposals(MAP, g.state, [{ kind: 'garrison', parent: B('a_1'), men: 1000, post: null, cause: 'command' }], 3);
    const id = out.made[0]!;
    const apart = { ...out.state, forceLocations: { ...out.state.forceLocations, [B('a_1')]: { ...out.state.forceLocations[B('a_1')]!, locRegion: R('mid') } } };
    const refused = applyDetachmentProposals(MAP, apart, [{ kind: 'rejoin', detachment: id, cause: 'command' }], 4);
    expect(refused.refused.map((r) => r.reason)).toEqual(['apart']);
    // A refusal changes nothing: the State is the very one given (lane 1.4c).
    expect(refused.state).toBe(apart);
    const alone = applyDetachmentProposals(MAP, apart, [{ kind: 'stand_alone', detachment: id, cause: 'command' }], 4);
    expect(observeBlock(alone.state.forceBlockStates[id]!)).toMatchObject({ fbKind: 'block', fbParent: null, fbStrength: 1000 });
    expect(alone.state.forceAssignments[id]).toBe('a_army');
  });

  it('rejoins with the condition averaged by men (lane 1.4c)', () => {
    const g = game(FIELD);
    const out = applyDetachmentProposals(MAP, g.state, [{ kind: 'garrison', parent: B('a_1'), men: 1000, post: null, cause: 'command' }], 3);
    const id = out.made[0]!;
    // The parent's 4000 men at morale 800, experience 300, equipment 600; the garrison's 1000 at 300, 800, 100.
    const blocks = out.state.forceBlockStates;
    const set = { ...out.state, forceBlockStates: { ...blocks, [B('a_1')]: { ...blocks[B('a_1')]!, fbMorale: 800, fbExperience: 300, fbEquipment: 600 }, [id]: { ...blocks[id]!, fbMorale: 300, fbExperience: 800, fbEquipment: 100 } } };
    const back = applyDetachmentProposals(MAP, set, [{ kind: 'rejoin', detachment: id, cause: 'command' }], 4);
    // (4000 * 800 + 1000 * 300) / 5000 = 700; (4000 * 300 + 1000 * 800) / 5000 = 400; (4000 * 600 + 1000 * 100) / 5000 = 500.
    expect(observeBlock(back.state.forceBlockStates[B('a_1')]!)).toMatchObject({ fbStrength: 5000, fbMorale: 700, fbExperience: 400, fbEquipment: 500 });
  });

  it('refuses a garrison from a block not standing on land, and one no post commands, each with its own reason, changing nothing (lane 1.4c)', () => {
    const g = game([...FIELD, ...SHIP, block('a_loose', { department: 'a_war', region: 'a2', strength: 800 })]);
    const r = applyDetachmentProposals(
      MAP,
      g.state,
      [
        { kind: 'garrison', parent: B('a_troops'), men: 100, post: null, cause: 'command' },
        { kind: 'garrison', parent: B('a_loose'), men: 100, post: null, cause: 'command' },
      ],
      3,
    );
    expect(r.refused.map((x) => x.reason)).toEqual(['not_standing', 'no_post']);
    expect(r.state).toBe(g.state);
    // A block on a leg is not standing either.
    const marching = { ...g.state, forceLocations: { ...g.state.forceLocations, [B('a_1')]: { ...g.state.forceLocations[B('a_1')]!, locMarch: { marchTo: R('mid') } as never } } };
    const m = applyDetachmentProposals(MAP, marching, [{ kind: 'garrison', parent: B('a_1'), men: 100, post: null, cause: 'command' }], 3);
    expect(m.refused.map((x) => x.reason)).toEqual(['not_standing']);
    expect(m.state).toBe(marching);
  });

  it('a detachment fights as a block: the battle model counts it, and its losses come out of its own men', () => {
    const g = game([...FIELD, block('b_1', { department: 'b_war', region: 'a2', strength: 9000 })]);
    const out = applyDetachmentProposals(MAP, g.state, [{ kind: 'garrison', parent: B('a_1'), men: 1500, post: null, cause: 'command' }], 3);
    const id = out.made[0]!;
    const s = { ...out.state, forceLocations: { ...out.state.forceLocations, [B('b_1')]: { ...out.state.forceLocations[B('b_1')]!, locSinceDay: 2 } } };
    const ground = { map: MAP, index: buildControlIndex(MAP, s.regionControl), network: passageOf(MAP, s), month: 6 };
    const r = combatDay(g.world, ground, s, 4);
    const a = r.fought[0]!.day.bdaySides.find((x) => x.bsideFaction === 'a')!;
    expect(a.bsideBlocks).toEqual(['a_1', id]);
    expect(a.bsidePresent).toBe(5000);
    expect(a.bsideLosses.some((l) => l.blossBlock === id)).toBe(true);
  });
});
