import { describe, expect, it } from 'vitest';
import { combatDay } from '../src/combat/battle.ts';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { toId, type ForceBlockId, type MessageId } from '../src/ids.ts';
import type { PlanCandidate } from '../src/planner/types.ts';
import type { PlanRecord } from '../src/plans/plans.ts';
import type { State } from '../src/root-state.ts';
import { applyDetachmentProposals } from '../src/tick/detachments.ts';
import { passageOf } from '../src/tick/passage.ts';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { worldOf } from './support/tick-context.ts';
import { B, block, forcesIndex, forcesStart, P, PER, post } from './support/forces-fixture.ts';
import { depot, edge, F, R, region } from './support/map-fixture.ts';

/**
 * Detachments in play (lane 1.4b), on fictional ground:
 *
 *   a1 ==rail== a2 --road-- mid --road-- b2 ==rail== b1
 *                \                       /
 *                 ---------- w ---------      (w: a river; a ship there can put men ashore at a2 or b2)
 */
const MAP = forcesIndex({
  regions: ['a1', 'a2', 'mid', 'b2', 'b1'].map((r) => region(r)).concat([region('w', 'river')]),
  edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line' }), edge('a2', 'mid'), edge('mid', 'b2'), edge('b2', 'b1', { type: 'rail', line: 'b_line' }), edge('a2', 'w', { type: 'river' }), edge('b2', 'w', { type: 'river' })],
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
    .reduce((a, id) => a + (s.forceBlockStates[id]!.fbStrength ?? 0) + s.forceBlockStates[id]!.fbStragglers, 0);

const SHIP = [block('a_ship', { department: 'a_war', region: 'w', arm: 'naval', strength: 300, post: P('a_navy') }), block('a_troops', { department: 'a_war', region: 'w', aboard: B('a_ship'), strength: 600, storesDays: 10, post: P('a_army') })];

describe('a landing: men go ashore from a ship as a detachment (lane 1.4b)', () => {
  it('lands across an edge from the ship\'s region, under the parent\'s post, arriving that day; the parent stays aboard', () => {
    const g = game(SHIP);
    const r = applyDetachmentProposals(MAP, g.state, [{ kind: 'landing', parent: B('a_troops'), men: 450, region: R('b2'), post: null, cause: 'operations' }], 5);
    expect(r.refused).toEqual([]);
    const id = r.made[0]!;
    expect(id).toBe('a_troops.det.5');
    expect(r.state.forceBlockStates[id]).toMatchObject({ fbKind: 'detachment', fbParent: 'a_troops', fbStrength: 450, fbDepartment: 'a_war' });
    expect(r.state.forceBlockStates[B('a_troops')]!.fbStrength).toBe(150);
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
    const g = game(SHIP);
    const leg = { legEdge: toId('edge', 'river:b2:w'), legFrom: R('w'), legTo: R('b2'), legType: 'river' as const, legDays: 1000, legThreat: 0, legSupply: 0, legObstacleDays: 0, legObstacle: null, legHeld: true };
    const candidate: PlanCandidate = {
      id: 'by_water:b2',
      candMethod: 'by_water',
      candVariant: 'run_in',
      candAxes: [{ axisName: 'afloat', axisPost: P('a_army'), axisMode: 'river', axisRoute: { routeFrom: R('w'), routeTo: R('b2'), routeLegs: [leg], routeCost: 0, routeDays: 1000 }, axisBlocks: [B('a_troops')], axisStrength: 600, axisPhases: [], axisArrival: 0, axisOutOfSupply: 0, axisStoresDays: 10, axisStoresAssumed: false }],
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
    let state: State = { ...g.state, planRecords: { [P('a_army')]: record } };
    for (let d = 0; d < 12; d++) state = tick(g.world, state, [], { freeze: true }).state;
    const op = Object.values(state.operationRecords)[0]!;
    const log = op.opAxes[0]!.oaxLog.map((e) => `${e.axevStage}:${e.axevReason}`);
    expect(log).toContain('march:landed');
    const landed = op.opAxes[0]!.oaxBlocks[0]!;
    expect(state.forceBlockStates[landed]).toMatchObject({ fbKind: 'detachment', fbParent: 'a_troops', fbStrength: 600 });
    expect(state.forceLocations[landed]!.locRegion).toBe('b2');
    // The men are conserved: ashore as the landing, none lost in the boats.
    expect(men(state, ['a_troops'])).toBe(600);
    expect(op.opAxes[0]!.oaxArrived).not.toBeNull();
  });
});

describe('a garrison: detached where its parent stands, rejoined, or left to stand alone (lane 1.4b)', () => {
  const FIELD = [block('a_1', { department: 'a_war', region: 'a2', strength: 5000, storesDays: 10, post: P('a_army') })];

  it('detaches a garrison in place, keeping the parent\'s arrival day (it does not press), and rejoins it with the strength conserved', () => {
    const g = game(FIELD);
    const out = applyDetachmentProposals(MAP, g.state, [{ kind: 'garrison', parent: B('a_1'), men: 1200, post: null, cause: 'command' }], 3);
    const id = out.made[0]!;
    expect(out.state.forceLocations[id]).toEqual({ locRegion: 'a2', locAboard: null, locSinceDay: 0, locMarch: null });
    expect([out.state.forceBlockStates[B('a_1')]!.fbStrength, out.state.forceBlockStates[id]!.fbStrength]).toEqual([3800, 1200]);
    expect(men(out.state, ['a_1'])).toBe(5000);
    // A garrison's stragglers come home with it.
    const straggling = { ...out.state, forceBlockStates: { ...out.state.forceBlockStates, [id]: { ...out.state.forceBlockStates[id]!, fbStrength: 1100, fbStragglers: 100 } } };
    const back = applyDetachmentProposals(MAP, straggling, [{ kind: 'rejoin', detachment: id, cause: 'command' }], 9);
    expect(back.rejoined).toEqual([id]);
    expect(back.state.forceBlockStates[id]).toBeUndefined();
    expect(back.state.forceLocations[id]).toBeUndefined();
    expect(back.state.forceAssignments[id]).toBeUndefined();
    expect(back.state.forceBlockStates[B('a_1')]).toMatchObject({ fbStrength: 4900, fbStragglers: 100, fbStoresMilli: 10000 });
    expect(men(back.state, ['a_1'])).toBe(5000);
  });

  it('refuses to rejoin when the two stand apart, and lets a detachment stand alone as a block', () => {
    const g = game(FIELD);
    const out = applyDetachmentProposals(MAP, g.state, [{ kind: 'garrison', parent: B('a_1'), men: 1000, post: null, cause: 'command' }], 3);
    const id = out.made[0]!;
    const apart = { ...out.state, forceLocations: { ...out.state.forceLocations, [B('a_1')]: { ...out.state.forceLocations[B('a_1')]!, locRegion: R('mid') } } };
    expect(applyDetachmentProposals(MAP, apart, [{ kind: 'rejoin', detachment: id, cause: 'command' }], 4).refused.map((r) => r.reason)).toEqual(['apart']);
    const alone = applyDetachmentProposals(MAP, apart, [{ kind: 'stand_alone', detachment: id, cause: 'command' }], 4);
    expect(alone.state.forceBlockStates[id]).toMatchObject({ fbKind: 'block', fbParent: null, fbStrength: 1000 });
    expect(alone.state.forceAssignments[id]).toBe('a_army');
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
