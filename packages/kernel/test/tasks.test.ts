import { describe, expect, it } from 'vitest';
import { combatDay } from '../src/combat/battle.ts';
import { ALL_JUDGE } from '../src/combat/orders.ts';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import type { OperationRecord } from '../src/operations/operations.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import type { State } from '../src/root-state.ts';
import { cleanTasks, executesAttack, recordDefaultTasks, taskForBlock } from '../src/operations/tasks.ts';
import { allocateTask, releaseTask } from '../src/tick/tasks.ts';
import { liveBlocks, operationsPhase } from '../src/tick/operations.ts';
import type { PlanRecord } from '../src/plans/plans.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { arriveSupport } from '../src/tick/support.ts';
import { createState } from '../src/tick/setup.ts';
import { passageOf } from '../src/tick/passage.ts';
import { B, block, forcesStart, forcesWorld, P, PER, person, post } from './support/forces-fixture.ts';
import { edge, F, R, region } from './support/map-fixture.ts';
import { ctxFor, worldOf } from './support/tick-context.ts';
import { indexWorld } from '../src/world/index.ts';

function fixture() {
  const base = forcesWorld({ regions: ['field', 'rear'].map(r => region(r)), edges: [edge('field', 'rear')],
    people: [person('a_lead', 'a'), person('a_gen', 'a'), person('a_sub', 'a'), person('b_lead', 'b'), person('b_gen', 'b')] });
  const world = worldOf(indexWorld(base), forcesStart({ field: { a: 500, b: 500 }, rear: { a: 1000 } }, [
    post('a_army', { department: 'a_war', holder: PER('a_gen'), region: R('field') }),
    post('a_sub', { department: 'a_war', parent: P('a_army'), holder: PER('a_sub'), region: R('field') }),
    post('b_army', { department: 'b_war', holder: PER('b_gen'), region: R('field') }),
  ], [block('main', { department: 'a_war', region: 'field', strength: 4000, post: P('a_army') }),
    block('reserve', { department: 'a_war', region: 'field', strength: 6000, post: P('a_sub') }),
    block('enemy', { department: 'b_war', region: 'field', strength: 1000, post: P('b_army') })], {
      factions: [{ faction: F('a'), principal: PER('a_lead'), capital: R('rear'), playable: true },
        { faction: F('b'), principal: PER('b_lead'), capital: R('field'), playable: true }],
    }));
  const start = createState(world, { seed: 1, people: 'as-history' });
  const op: OperationRecord = { opPost: P('a_army'), opCommander: PER('a_gen'), opOrder: 'goal' as never,
    opPlan: 'fictional', opMethod: 'direct', opStartDay: 1, opEndDay: null, opOutcome: null,
    opAxes: [{ oaxName: 'main', oaxPost: P('a_army'), oaxBlocks: [B('main'), B('reserve')],
      oaxRoute: { routeFrom: R('field'), routeTo: R('rear'), routeLegs: [], routeCost: 0, routeDays: 0 },
      oaxPhases: [], oaxObjective: R('rear'), oaxStage: 'march', oaxSince: 1, oaxUntil: null,
      oaxRepulses: 0, oaxPursuit: null, oaxSteps: [], oaxArrived: null, oaxLog: [] }],
    opRequests: [], opEncirclement: null, opEncirclementWhy: null };
  const state: State = { ...start, stateDay: 1, operationRecords: { mission: op },
    forceLocations: Object.fromEntries(Object.entries(start.forceLocations).map(([id, loc]) => [id, { ...loc, locSinceDay: id === 'enemy' ? 0 : 1 }])) };
  return { world, state };
}
function task(kind: 'reserve' | 'rear_guard' | 'demonstration' | 'main_effort' = 'reserve') {
  return { otaskId: 'guard', otaskOperation: 'mission', otaskIssuer: PER('a_gen'), otaskPost: P('a_sub'),
    otaskBlocks: [B('reserve')], otaskKind: kind, otaskPurpose: 'Protect the route while the main force advances.',
    otaskScope: [R('field')], otaskRelease: 'commander_order' as const };
}
const taskContext = (g: ReturnType<typeof fixture>, day: number) => ctxFor(g.world, g.state, day,
  ['messages.sent', 'operations.support_sent', 'operations.support_answered', 'operations.support_refused']);
function accepted(g: ReturnType<typeof fixture>, kind: Parameters<typeof task>[0] = 'reserve') {
  const ctx = taskContext(g, 2);
  const allocated = allocateTask(ctx, g.state, task(kind));
  expect(allocated.reason).toBe('allocated');
  expect(ctx.outbox).toHaveLength(1);
  return { ...g, state: arriveSupport(ctx, allocated.state, ctx.outbox[0]!) };
}
function battle(g: ReturnType<typeof fixture>, enemyAttack = false, bothAttack = false) {
  const ground = { map: g.world.map, index: buildControlIndex(g.world.map, g.state.regionControl), network: passageOf(g.world.map, g.state), month: 6 };
  return combatDay(g.world, ground, g.state, 3, new Map([
    [P('a_army'), { ...ALL_JUDGE, commit: enemyAttack && !bothAttack ? 'defend' as const : 'all_out' as const }],
    [P('a_sub'), { ...ALL_JUDGE, commit: enemyAttack ? 'defend' as const : 'all_out' as const }],
    [P('b_army'), { ...ALL_JUDGE, commit: enemyAttack ? 'all_out' as const : 'defend' as const }],
  ]));
}
describe('S136 C01-C04: fictional tasks and same-region contact', () => {
  it('C01: excludes an accepted unreleased reserve, then includes it only after release receipt', () => {
    const g = accepted(fixture());
    expect(battle(g).fought[0]!.day.bdaySides.find(s => s.bsideFaction === F('a'))!.bsideBlocks).toEqual([B('main')]);
    const ctx = taskContext(g, 3);
    const sent = releaseTask(ctx, g.state, 'mission', 'guard', PER('a_gen'));
    expect(sent.reason).toBe('release_sent');
    expect(battle({ ...g, state: sent.state }).inBattle).not.toContain(B('reserve'));
    const released = arriveSupport(ctx, sent.state, ctx.outbox[0]!);
    expect(battle({ ...g, state: released }).inBattle).toContain(B('reserve'));
  });
  it('C02: reserve status cannot protect any eligible defender from an actual regional attack', () => {
    const g = accepted(fixture());
    const state = { ...g.state, forceLocations: { ...g.state.forceLocations, [B('enemy')]: { ...g.state.forceLocations[B('enemy')]!, locSinceDay: 1 } } };
    expect(battle({ ...g, state }, true).inBattle).toContain(B('reserve'));
  });
  it('C03: conflicting main allocation cannot spend a rear guard, and preserves assignments, lots and location', () => {
    const g = accepted(fixture(), 'rear_guard');
    const before = canonicalHash([g.state.forceAssignments, g.state.forceBlockStates, g.state.forceLocations]);
    const ctx = taskContext(g, 3);
    const conflict = allocateTask(ctx, g.state, { ...task('main_effort'), otaskId: 'steal' });
    expect(conflict.reason).toBe('task_conflict');
    expect(conflict.state).toBe(g.state);
    expect(ctx.outbox).toEqual([]);
    expect(canonicalHash([g.state.forceAssignments, g.state.forceBlockStates, g.state.forceLocations])).toBe(before);
    expect(battle(g).inBattle).not.toContain(B('reserve'));
  });
  it('C04: names and civil calendar labels cannot change commitment', () => {
    const g = accepted(fixture());
    const renamed = { ...g.state, calendarStart: '1903-01-01', postStates: { ...g.state.postStates,
      [P('a_sub')]: { ...g.state.postStates[P('a_sub')]!, postName: 'An anonymous commander' } },
      forceBlockStates: { ...g.state.forceBlockStates,
        [B('main')]: { ...g.state.forceBlockStates[B('main')]!, fbName: g.state.forceBlockStates[B('reserve')]!.fbName },
        [B('reserve')]: { ...g.state.forceBlockStates[B('reserve')]!, fbName: g.state.forceBlockStates[B('main')]!.fbName } } };
    expect(battle({ ...g, state: renamed }).fought).toEqual(battle(g).fought);
  });
  it('a pending task cannot count as a receipt, and saves preserve pending and accepted allocations', () => {
    const g = fixture();
    const ctx = taskContext(g, 2);
    const pending = allocateTask(ctx, g.state, task()).state;
    expect(taskForBlock(pending, B('reserve'), 2)?.otaskKind).not.toBe('reserve');
    const text = encodeSave({ worldHash: canonicalHash('fixture'), state: pending });
    expect(decodeSave(text).state).toEqual(pending);
    const resumed = arriveSupport(ctx, decodeSave(text).state as unknown as State, ctx.outbox[0]!);
    expect(resumed).toEqual(arriveSupport(ctx, pending, ctx.outbox[0]!));
  });
  it('a rear guard stays on duty while the main axis moves; release restores its ordinary journey', () => {
    const g = accepted(fixture(), 'rear_guard');
    const axis = g.state.operationRecords.mission!.opAxes[0]!;
    expect(liveBlocks(g.state, axis)).toEqual([B('main')]);
    const ctx = taskContext(g, 3);
    const sent = releaseTask(ctx, g.state, 'mission', 'guard', PER('a_gen'));
    const state = arriveSupport(ctx, sent.state, ctx.outbox[0]!);
    expect(liveBlocks(state, axis, 3)).toEqual([B('main'), B('reserve')]);
  });
  it('executes the main march while the rear guard actually holds the road, including after save/resume', () => {
    const g = accepted(fixture(), 'rear_guard');
    const original = g.state.operationRecords.mission!;
    const route = { ...original.opAxes[0]!.oaxRoute, routeDays: 1000, routeLegs: [{ legEdge: 'road:field:rear' as never,
      legFrom: R('field'), legTo: R('rear'), legType: 'road' as const, legDays: 1000, legThreat: 0,
      legSupply: 0, legObstacleDays: 0, legObstacle: null, legHeld: false }] };
    const op = { ...original, opAxes: original.opAxes.map(a => ({ ...a, oaxRoute: route, oaxStage: 'assemble' as const, oaxUntil: 0 })) };
    const plan: PlanRecord = { planGoal: { goalObjective: R('rear'), goalPosture: 'take', goalRisk: 1000,
      goalDeadlineDays: 14, goalRail: false, goalRiver: false, goalSea: false, goalNeutral: false,
      goalCommitted: [B('main'), B('reserve')], goalAwaitWord: false, goalApproveAsDrafted: true },
      planIssuer: PER('a_lead'), planViaChain: true, planSetDay: 0, planIssuedDay: 0, planOrder: op.opOrder,
      planResponse: 'goal|a_gen', planStatus: 'approved', planDraft: null, planChosen: 'fictional',
      planApproved: { id: 'fictional', candMethod: 'direct', candVariant: 'test', candAxes: [{ axisName: 'main',
        axisPost: P('a_army'), axisMode: 'land', axisRoute: route, axisBlocks: [B('main'), B('reserve')], axisPhases: [],
        axisStrength: 10000, axisArrival: 0, axisOutOfSupply: 0, axisStoresDays: 10, axisStoresAssumed: false }],
        candRequests: [], candConditions: [], candTerms: [], candScore: 0, candPerceived: 0, candRatio: 0 },
      planSubmitted: null, planCounters: [], planPending: null };
    const state: State = { ...g.state, stateDay: 2, operationRecords: { mission: op }, planRecords: { [P('a_army')]: plan },
      forceLocations: { ...g.state.forceLocations, [B('enemy')]: { ...g.state.forceLocations[B('enemy')]!, locRegion: R('rear') } } };
    const run = (s: State) => operationsPhase(ctxFor(g.world, s, 3, TICK_MECHANICS), s);
    const marched = run(state);
    expect(marched.forceLocations[B('main')]!.locRegion).toBe(R('rear'));
    expect(marched.forceLocations[B('reserve')]).toEqual(state.forceLocations[B('reserve')]);
    expect(marched.forceAssignments).toBe(state.forceAssignments);
    expect(marched.forceBlockStates).toBe(state.forceBlockStates);
    expect(run(decodeSave(encodeSave({ worldHash: canonicalHash('fixture'), state })).state as unknown as State)).toEqual(marched);
  });
  it.each(['refused', 'delayed'] as const)('ordinary %s compliance cannot be treated as immediate execution', answer => {
    const g = fixture();
    const ctx = taskContext(g, 2);
    const state = allocateTask(ctx, g.state, task()).state;
    const op = state.operationRecords.mission!;
    const answered = { ...state, operationRecords: { mission: { ...op, opRequests: op.opRequests.map(r => ({ ...r,
      oreqAnswer: answer, oreqAnswerDay: 2, oreqFrom: answer === 'delayed' ? 5 : null })) } } };
    expect(taskForBlock(answered, B('reserve'), 4)?.otaskKind).toBe('main_effort');
    expect(taskForBlock(answered, B('reserve'), 5)?.otaskKind).toBe(answer === 'delayed' ? 'reserve' : 'main_effort');
  });
  it('releases stale reservations on closure, loss of commander, assignment and force', () => {
    const g = accepted(fixture());
    const cases: State[] = [
      { ...g.state, operationRecords: { mission: { ...g.state.operationRecords.mission!, opEndDay: 4 } } },
      { ...g.state, postStates: { ...g.state.postStates, [P('a_army')]: { ...g.state.postStates[P('a_army')]!, postHolder: null } } },
      { ...g.state, postStates: { ...g.state.postStates, [P('a_sub')]: { ...g.state.postStates[P('a_sub')]!, postHolder: null } } },
      { ...g.state, forceAssignments: { ...g.state.forceAssignments, [B('reserve')]: P('b_army') } },
      { ...g.state, forceBlockStates: { ...g.state.forceBlockStates, [B('reserve')]: { ...g.state.forceBlockStates[B('reserve')]!, fbSurrenderedDay: 4 } } },
    ];
    for (const state of cases) {
      const clean = cleanTasks(state, 4);
      expect(clean.operationRecords.mission!.opTasks!.find(t => t.otaskId === 'guard')!.otaskEndedDay).toBe(4);
      expect(taskForBlock(clean, B('reserve'), 4)?.otaskKind).not.toBe('reserve');
    }
  });
  it('records default main duty only at execution, and assembling blocks cannot swell an attack', () => {
    const g = fixture();
    const original = g.state.operationRecords.mission!;
    expect(original.opTasks).toBeUndefined();
    const op = recordDefaultTasks({ ...original, opAxes: original.opAxes.map(a => ({ ...a, oaxStage: 'assemble' })) }, 'mission');
    expect(op.opTasks![0]).toMatchObject({ otaskDefault: true, otaskKind: 'main_effort', otaskBlocks: [B('main'), B('reserve')] });
    const state = { ...g.state, operationRecords: { mission: op } };
    expect(executesAttack(state, B('main'), 2)).toBe(false);
    expect(battle({ ...g, state }).fought).toEqual([]);
  });
  it('a task cannot claim a foreign block, a vacant executor or another issuer', () => {
    const g = fixture();
    for (const order of [{ ...task(), otaskIssuer: PER('a_sub') }, { ...task(), otaskBlocks: [B('enemy')] },
      { ...task(), otaskScope: [R('rear')] }]) {
      const ctx = taskContext(g, 2);
      expect(allocateTask(ctx, g.state, order).state).toBe(g.state);
      expect(ctx.outbox).toEqual([]);
    }
  });
  it('an unknown reserve is excluded only from its own attack and remains unknown when defending', () => {
    const g = accepted(fixture());
    const state = { ...g.state, forceBlockStates: { ...g.state.forceBlockStates, [B('reserve')]: {
      ...g.state.forceBlockStates[B('reserve')]!, fbLots: g.state.forceBlockStates[B('reserve')]!.fbLots.map(l => ({ ...l, lotMen: null })) } },
      forceLocations: { ...g.state.forceLocations, [B('enemy')]: { ...g.state.forceLocations[B('enemy')]!, locSinceDay: 1 } } };
    expect(battle({ ...g, state }).inBattle).not.toContain(B('reserve'));
    expect(battle({ ...g, state }, true).fought[0]!.day.bdaySides.find(s => s.bsideFaction === F('a'))!.bsideUnknown).toContain(B('reserve'));
  });
  it('meeting attacks expose local reserves as defenders without committing them to the offensive', () => {
    const g = accepted(fixture());
    const state = { ...g.state, forceLocations: { ...g.state.forceLocations,
      [B('enemy')]: { ...g.state.forceLocations[B('enemy')]!, locSinceDay: 1 } } };
    const side = battle({ ...g, state }, true, true).fought[0]!.day.bdaySides.find(s => s.bsideFaction === F('a'))!;
    expect(side.bsideBlocks).toContain(B('reserve'));
    expect(side.bsideAttackBlocks).toEqual([B('main')]);
    expect(side.bsideCommitted).toBe(4000);
    expect(side.bsideCommander).toBe(PER('a_gen'));
  });
  it('a released guard can receive a replacement task, but not before the release receipt', () => {
    const g = accepted(fixture(), 'rear_guard');
    const ctx = taskContext(g, 3);
    const sent = releaseTask(ctx, g.state, 'mission', 'guard', PER('a_gen'));
    expect(allocateTask(ctx, sent.state, { ...task(), otaskId: 'replacement' }).reason).toBe('task_conflict');
    const released = arriveSupport(ctx, sent.state, ctx.outbox[0]!);
    const nextCtx = ctxFor(g.world, released, 4, TICK_MECHANICS);
    const replacement = allocateTask(nextCtx, released, { ...task(), otaskId: 'replacement' });
    expect(replacement.reason).toBe('allocated');
    expect(taskForBlock(replacement.state, B('reserve'), 4)!.otaskKind).toBe('main_effort');
    const received = arriveSupport(nextCtx, replacement.state, nextCtx.outbox[0]!);
    expect(taskForBlock(received, B('reserve'), 4)!.otaskKind).toBe('reserve');
  });
  it('a commander releases his directly held guard locally and can then reassign it', () => {
    const g = fixture();
    const own = { ...task('rear_guard'), otaskPost: P('a_army'), otaskBlocks: [B('main')] };
    const ctx = taskContext(g, 2);
    const allocated = allocateTask(ctx, g.state, own);
    expect(ctx.outbox).toEqual([]);
    expect(executesAttack(allocated.state, B('main'), 2)).toBe(false);
    const released = releaseTask(ctx, allocated.state, 'mission', 'guard', PER('a_gen'));
    expect(taskForBlock(released.state, B('main'), 2)).toMatchObject({ otaskKind: 'main_effort', otaskReleasedDay: 2 });
    expect(allocateTask(ctx, released.state, { ...own, otaskId: 'new-duty' }).reason).toBe('allocated');
  });
  it('default partner tasks require ordinary support receipt and end when their holder is lost', () => {
    const g = fixture();
    const original = g.state.operationRecords.mission!;
    const message = 'partner-support' as never;
    const state: State = { ...g.state, postStates: { ...g.state.postStates,
      [P('a_sub')]: { ...g.state.postStates[P('a_sub')]!, postParent: null } }, operationRecords: { mission: recordDefaultTasks({ ...original,
      opAxes: [{ ...original.opAxes[0]!, oaxBlocks: [B('main')] },
        { ...original.opAxes[0]!, oaxName: 'partner', oaxPost: P('a_sub'), oaxBlocks: [B('reserve')] }],
      opRequests: [{ oreqKind: 'cooperating_axis', oreqPost: P('a_sub'), oreqHolder: PER('a_sub'), oreqAxis: 'partner',
        oreqMessage: message, oreqSentDay: 1, oreqAnswer: 'pending', oreqRung: null, oreqResponse: null, oreqAnswerDay: null, oreqFrom: null }],
    }, 'mission') } };
    expect(executesAttack(state, B('reserve'), 2)).toBe(false);
    const op = state.operationRecords.mission!;
    const received: State = { ...state, operationRecords: { mission: { ...op,
      opRequests: op.opRequests.map(r => ({ ...r, oreqAnswer: 'complied', oreqRung: 'comply', oreqAnswerDay: 3, oreqFrom: 3 })) } } };
    expect(executesAttack(received, B('reserve'), 3)).toBe(true);
    const vacant = cleanTasks({ ...received, postStates: { ...received.postStates,
      [P('a_sub')]: { ...received.postStates[P('a_sub')]!, postHolder: null } } }, 4);
    expect(vacant.operationRecords.mission!.opTasks!.find(t => t.otaskId === 'default:partner')!.otaskEndedDay).toBe(4);
    expect(executesAttack(vacant, B('reserve'), 4)).toBe(false);
  });
  it('a recorded defensive default retains the approved axis movement without acquiring an offensive task', () => {
    const g = fixture();
    const op = recordDefaultTasks({ ...g.state.operationRecords.mission!, opPosture: 'hold' }, 'mission');
    const state = { ...g.state, operationRecords: { mission: op } };
    expect(op.opTasks![0]!.otaskKind).toBe('local_defence');
    expect(liveBlocks(state, op.opAxes[0]!)).toEqual([B('main'), B('reserve')]);
    expect(executesAttack(state, B('main'), 2)).toBe(false);
  });
});
