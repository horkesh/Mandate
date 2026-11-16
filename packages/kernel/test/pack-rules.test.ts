import { describe, expect, it } from 'vitest';
import { combatDay } from '../src/combat/battle.ts';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { dailyNeedMilli, storesStep } from '../src/forces/stores.ts';
import { networkOf } from '../src/infrastructure/infrastructure.ts';
import { marchBar, type MarchGround } from '../src/movement/march.ts';
import type { State } from '../src/root-state.ts';
import { indexSeatsWorld, latencyMapFor } from '../src/seats/world.ts';
import { templateFor } from '../src/knowledge/templates.ts';
import { routeLatency } from '../src/messages/latency.ts';
import { edgeLeg, INTACT_NETWORK } from '../src/supply/supply.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld, type WorldIndex } from '../src/world/index.ts';
import type { WorldRules } from '../src/world/world.ts';
import { B, block, forcesStart, forcesWorld } from './support/forces-fixture.ts';
import { controlTable, depot, E, edge, F, FIXTURE_RULES, R, region } from './support/map-fixture.ts';

/**
 * The design parameters are the pack's (0064, the lead's ruling; hard rule 3):
 * the kernel reads each one from the World, and changing it in a pack changes
 * the outcome. Each test is a positive control for one rule.
 *
 *   a1 (a's source) ==rail== a2 --road (6 days)-- mid ~~river, capacity 1, low water in August~~ b1
 */
type RulesOver = {
  readonly stores?: Partial<WorldRules['stores']>;
  readonly occupation?: Partial<WorldRules['occupation']>;
  readonly combat?: Partial<WorldRules['combat']>;
  readonly movement?: Partial<WorldRules['movement']>;
  readonly latency?: Partial<WorldRules['latency']>;
  readonly reportTemplates?: WorldRules['reportTemplates'];
};

function mapWith(over: RulesOver = {}): WorldIndex {
  const base = forcesWorld({
    regions: ['a1', 'a2', 'mid', 'b1'].map((r) => region(r)),
    edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line', capacity: 5 }), edge('a2', 'mid', { days: 6 }), edge('mid', 'b1', { type: 'river', capacity: 1, seasons: [{ reason: 'low_water', months: [8, 9, 10], depthFeet: null }] })],
    depots: [depot('a_src', 'a1')],
  });
  return indexWorld({
    ...base,
    rules: {
      ...base.rules,
      stores: { ...FIXTURE_RULES.stores, ...over.stores },
      occupation: { ...FIXTURE_RULES.occupation, ...over.occupation },
      combat: { ...FIXTURE_RULES.combat, ...over.combat },
      movement: { ...FIXTURE_RULES.movement, ...over.movement },
      latency: { ...FIXTURE_RULES.latency, ...over.latency },
      reportTemplates: over.reportTemplates ?? FIXTURE_RULES.reportTemplates,
    },
  });
}

const CONTROL = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 300, b: 300 }, b1: { b: 1000 } };

function stateOn(map: WorldIndex, blocks: Parameters<typeof forcesStart>[2]): State {
  const s = createState(indexSeatsWorld(map, forcesStart(CONTROL, [], blocks)), { seed: 1 });
  const locations = { ...s.forceLocations };
  for (const id of Object.keys(locations)) locations[B(id)] = { ...locations[B(id)]!, locSinceDay: 1 };
  return { ...s, forceLocations: locations };
}

const ground = (map: WorldIndex, s: State, month = 6): MarchGround => ({ map, index: buildControlIndex(map, s.regionControl), network: INTACT_NETWORK, month });

describe('occupation and battle read the pack\'s rates', () => {
  const alone = [block('a_1', { department: 'a_war', region: 'mid', strength: 5000 })];
  const clash = [block('a_1', { department: 'a_war', region: 'mid', strength: 4000 }), block('b_1', { department: 'b_war', region: 'mid', strength: 2000 })];
  const dayOf = (map: WorldIndex, blocks: Parameters<typeof forcesStart>[2]) => {
    const s = stateOn(map, blocks);
    return combatDay(indexSeatsWorld(map, forcesStart(CONTROL, [], blocks)), ground(map, s), s, 1);
  };
  const deltaOf = (map: WorldIndex, blocks: Parameters<typeof forcesStart>[2]) => dayOf(map, blocks).control.map((d) => d.deltaPermille);

  it('occupyPermille: the full occupation rate', () => {
    expect(deltaOf(mapWith(), alone)).toEqual([100]);
    expect(deltaOf(mapWith({ occupation: { occupyPermille: 40 } }), alone)).toEqual([40]);
  });

  it('occupyFullMen: the men at which occupation reaches that rate', () => {
    expect(deltaOf(mapWith({ occupation: { occupyFullMen: 10000 } }), alone)).toEqual([50]);
  });

  it('baseRates and killedPermille: the losses of a battle-day, and the killed among them', () => {
    const kw = (map: WorldIndex) => dayOf(map, clash).fought[0]!.day.bdaySides.map((s) => [s.bsideKw, s.bsideKilled]);
    const base = kw(mapWith());
    const doubled = FIXTURE_RULES.combat.baseRates;
    const twice = kw(mapWith({ combat: { baseRates: Object.fromEntries(Object.entries(doubled).map(([t, r]) => [t, { attacker: r.attacker * 2, defender: r.defender * 2 }])) as WorldRules['combat']['baseRates'] } }));
    expect(base.map(([k]) => k! > 0)).toEqual([true, true]);
    // Doubling every base rate doubles each side's killed and wounded, give or take a man of rounding.
    twice.forEach(([k], i) => expect(Math.abs(k! - 2 * base[i]![0]!)).toBeLessThanOrEqual(1));
    expect(kw(mapWith({ combat: { killedPermille: 0 } })).map(([, killed]) => killed)).toEqual([0, 0]);
  });
});
describe('stores read the pack\'s rules', () => {
  const blocks = [block('line', { department: 'a_war', region: 'a2', strength: 10000, storesDays: 8 })];
  const step = (map: WorldIndex) => {
    const s = stateOn(map, blocks);
    return storesStep(map, s, deriveMap(map, { control: s.regionControl, month: 6, network: networkOf(s) }).supply);
  };

  it('menPerCapacityUnit: a block\'s daily need', () => {
    const map = mapWith({ stores: { menPerCapacityUnit: 10000 } });
    expect(dailyNeedMilli(mapWith().world.rules.stores, stateOn(mapWith(), blocks), B('line'))).toBe(500);
    expect(dailyNeedMilli(map.world.rules.stores, stateOn(map, blocks), B('line'))).toBe(1000);
  });

  it('capDays: a block at the cap only eats and draws a day; below it, it refills', () => {
    expect(step(mapWith()).state.forceBlockStates[B('line')]!.fbStoresMilli).toBe(9000);
    expect(step(mapWith({ stores: { capDays: 8 } })).state.forceBlockStates[B('line')]!.fbStoresMilli).toBe(8000);
  });

  it('lowDays: the threshold whose crossing is a truth event', () => {
    const cutOff = (map: WorldIndex) => {
      const s = stateOn(map, [block('raider', { department: 'a_war', region: 'b1', strength: 10000, storesDays: 7 })]);
      // In enemy-held b1 a has no supply path, so nothing comes: stores fall from 7 days to 6.
      return storesStep(map, s, deriveMap(map, { control: s.regionControl, month: 6, network: networkOf(s) }).supply).crossings.map((c) => c.direction);
    };
    expect(cutOff(mapWith())).toEqual(['down']);
    expect(cutOff(mapWith({ stores: { lowDays: 5 } }))).toEqual([]);
  });
});

describe('movement reads the pack\'s rules', () => {
  it('marchMinCapacityPermille: low water closes a capacity-1 river at one unit, not at half a unit', () => {
    const leg = (map: WorldIndex) => edgeLeg(map, map.edges.get(E('river:b1:mid'))!, R('mid'), 8, INTACT_NETWORK);
    const strict = mapWith();
    const loose = mapWith({ movement: { marchMinCapacityPermille: 500 } });
    const s = stateOn(strict, []);
    expect(marchBar(ground(strict, s, 8), leg(strict), F('a'), true)).toBe('edge_closed');
    expect(marchBar(ground(loose, s, 8), leg(loose), F('a'), true)).toBeNull();
  });

  it('courierPermille: a courier\'s days on an edge', () => {
    const third = indexSeatsWorld(mapWith(), forcesStart(CONTROL, [], []));
    const asSlow = indexSeatsWorld(mapWith({ movement: { courierPermille: 1000 } }), forcesStart(CONTROL, [], []));
    expect(third.courierDays(R('a2'), R('mid'))).toBe(2);
    expect(asSlow.courierDays(R('a2'), R('mid'))).toBe(6);
  });
});

describe('the kernel checks the standing rules of any World it is handed (0072; close-out review N1)', () => {
  const withStanding = (standing: WorldRules['standing']) => {
    const map = mapWith();
    return indexWorld({ ...map.world, rules: { ...map.world.rules, standing } });
  };
  it('refuses a conflict window under a day; the pack\'s values index', () => {
    expect(() => indexSeatsWorld(withStanding({ conflictWindowDays: 0 }), forcesStart(CONTROL, [], []))).toThrow('standing rule conflictWindowDays must be a whole number of days, at least 1');
    expect(() => indexSeatsWorld(withStanding({ conflictWindowDays: 1 }), forcesStart(CONTROL, [], []))).not.toThrow();
  });
});

describe('the kernel checks the planner and plans rules of any World it is handed (lane 1.2; 0072: no hidden default)', () => {
  const withPlanner = (over: Partial<WorldRules['planner']>, plans: Partial<WorldRules['plans']> = {}) => {
    const map = mapWith();
    return indexWorld({ ...map.world, rules: { ...map.world.rules, planner: { ...map.world.rules.planner, ...over }, plans: { ...map.world.rules.plans, ...plans } } });
  };
  it('refuses a drafting cap under one draft a day, a zero divisor and an out-of-range permille; the pack\'s values index', () => {
    expect(() => indexSeatsWorld(withPlanner({ dailyDraftCap: 0 }), forcesStart(CONTROL, [], []))).toThrow('planner rule dailyDraftCap must be a whole number, at least 1');
    const map = mapWith();
    expect(() => indexSeatsWorld(withPlanner({ weights: { ...map.world.rules.planner.weights, exposureDivisor: 0 } }), forcesStart(CONTROL, [], []))).toThrow('planner rule weights.exposureDivisor must be a whole number, at least 1');
    expect(() => indexSeatsWorld(withPlanner({}, { holdingRisk: 0.5 }), forcesStart(CONTROL, [], []))).toThrow('plans rule holdingRisk must be a whole number');
    expect(() => indexSeatsWorld(withPlanner({}), forcesStart(CONTROL, [], []))).not.toThrow();
  });
});

describe('latency and the report templates read the pack\'s rules (0072)', () => {
  const seats = (over: RulesOver = {}) => indexSeatsWorld(mapWith(over), forcesStart(CONTROL, [], []));
  const days = (world: ReturnType<typeof seats>, route: Parameters<typeof routeLatency>[2]) => {
    const r = routeLatency(latencyMapFor(world, buildControlIndex(world.map, controlTable(CONTROL))), world.rules.latency, route, R('a2'), R('mid'), F('a'), null);
    return r.ok ? r.latency.days : -1;
  };

  it('specialMessengerPermille and mailPermille: a route against a courier', () => {
    // Two courier days from a2 to mid.
    expect([days(seats(), 'courier'), days(seats(), 'special-messenger'), days(seats(), 'mail')]).toEqual([2, 1, 4]);
    expect(days(seats({ latency: { specialMessengerPermille: 1000 } }), 'special-messenger')).toBe(2);
    expect(days(seats({ latency: { mailPermille: 3000 } }), 'mail')).toBe(6);
  });

  it('the seats layer reads the World\'s latency and templates, and no other', () => {
    const world = seats({ latency: { specialMessengerPrice: 3 } });
    expect(world.rules.latency).toBe(world.map.world.rules.latency);
    expect(world.rules.latency.specialMessengerPrice).toBe(3);
    const byMail = FIXTURE_RULES.reportTemplates.map((x) => (x.templateType === 'wire-dispatch' ? { ...x, templateRoute: 'mail' as const } : x));
    const mailed = seats({ reportTemplates: byMail });
    expect(templateFor(mailed.rules.templates, 'wire-dispatch', null).templateRoute).toBe('mail');
    expect(templateFor(seats().rules.templates, 'wire-dispatch', null).templateRoute).toBe('wire');
  });
});
