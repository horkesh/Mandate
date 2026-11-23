import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { holds, predicateOf, unknowableRead } from '../src/situations/conditions.ts';
import type { OperationRecord } from '../src/operations/operations.ts';
import { createState } from '../src/tick/setup.ts';
import { F, POST, R, indexedFixture } from './support/seats-fixture.ts';


it('an advance notice requires troops actually marching on the named objective, never just a goal or its date', () => {
  const world = indexedFixture({ posts: { a_reserve: { strength: 2000 } } });
  const first = createState(world, { seed: 7 });
  const op: OperationRecord = {
    opPost: POST('a_reserve'), opCommander: toId('person', 'a_bold'), opOrder: toId('message', 'advance'),
    opPlan: 'advance', opMethod: 'direct', opPosture: 'take', opObjective: R('b_mid'), opStartDay: 2,
    opEndDay: null, opOutcome: null, opRequests: [], opEncirclement: null, opEncirclementWhy: null,
    opAxes: [{ oaxName: 'main', oaxPost: POST('a_reserve'), oaxBlocks: [toId('forceBlock', 'a_reserve_1')],
      oaxRoute: { routeFrom: R('a_mid'), routeTo: R('b_mid'), routeLegs: [], routeCost: 0, routeDays: 0 },
      oaxPhases: [], oaxObjective: R('b_mid'), oaxStage: 'assemble', oaxSince: 2, oaxUntil: 5,
      oaxRepulses: 0, oaxPursuit: null, oaxSteps: [], oaxLog: [], oaxArrived: null }],
  };
  const planned = { ...first, operationRecords: { advance: op } };
  const c = { advancingOn: { post: POST('a_reserve'), region: R('b_mid') } };
  const check = (state: typeof first) => holds(c, { state, day: 40, situation: null, knowledge: { knownReports: [] }, since: null });
  expect(check(first)).toBe(false);
  const withStage = (stage: 'assemble' | 'march' | 'end', end: number | null = null) => ({ ...planned,
    operationRecords: { advance: { ...op, opEndDay: end, opAxes: op.opAxes.map(a => ({ ...a, oaxStage: stage })) } } });
  expect(check(withStage('assemble'))).toBe(false);
  expect(check(withStage('march'))).toBe(false);
  const block = toId('forceBlock', 'a_reserve_1');
  const moving = { ...withStage('march'), forceLocations: { ...first.forceLocations, [block]: {
    ...first.forceLocations[block]!, locSinceDay: 3, locRegion: R('a_front'),
  } } };
  expect(check(moving)).toBe(true);
  expect(check(withStage('end'))).toBe(false);
  expect(check(withStage('march', 3))).toBe(false);
  expect(check({ ...moving, forceBlockStates: {} })).toBe(false);
  expect(holds({ advancingOn: { post: POST('a_reserve'), region: R('a_front') } }, { state: withStage('march'), day: 40, situation: null, knowledge: { knownReports: [] }, since: null })).toBe(false);
  expect(predicateOf(c)).toBe('advancingOn');
  expect(unknowableRead(c, 'knowledge')).toContain('advancingOn');
});

