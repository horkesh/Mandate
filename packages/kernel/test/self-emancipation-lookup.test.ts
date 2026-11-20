import { expect, it } from 'vitest';
import { initialDepartmentSides } from '../src/command/command.ts';
import { initialForces } from '../src/forces/forces.ts';
import { initialLocations } from '../src/movement/movement.ts';
import { selfEmancipationTerms } from '../src/regions/self-emancipation.ts';
import { deepFreeze } from '../src/tick/freeze.ts';
import { emptyState } from '../src/tick/setup.ts';
import { B, block, DEP, forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { edge, F, R, region } from './support/map-fixture.ts';

const base = forcesIndex({ regions: ['c1', 'c2', 'a1', 'a2'].map(r => region(r)), edges: [edge('c1', 'a1'), edge('c1', 'a2'), edge('c2', 'a1'), edge('c2', 'a2')] });
const map = { ...base, world: { ...base.world, census: ['c2', 'c1'].map(r => ({ region: R(r), enslavedPopulation: 1000000, provenance: [] })) } };
const rules = { ...map.world.rules.selfEmancipation, linesFaction: F('a') };
const start = forcesStart({}, [], [block('present', { department: 'a_war', region: 'a2' }), block('unknown', { department: 'a_war', region: 'a1', strength: null }), block('enemy', { department: 'b_war', region: 'a1' })]);
const state = deepFreeze({ ...emptyState(), departmentFactions: initialDepartmentSides(map), regionControl: { [R('c1')]: { [F('b')]: 1000 }, [R('c2')]: { [F('b')]: 1000 }, [R('a1')]: { [F('a')]: 1000 }, [R('a2')]: { [F('a')]: 1000 } }, forceBlockStates: initialForces(map, start), forceLocations: initialLocations(map, start) });

it('scans the force locations once for all census regions, preserving destination and every term', () => {
  let scans = 0;
  const counted = { ...state, forceLocations: new Proxy(state.forceLocations, { ownKeys: target => { scans++; return Reflect.ownKeys(target); } }) };
  const terms = selfEmancipationTerms(map, counted, rules);
  expect(terms).toEqual(selfEmancipationTerms(map, state, rules));
  expect(terms.map(t => [t.region, t.destination, t.within, t.toLines])).toEqual([['c1', 'a2', 200, 500], ['c2', 'a2', 200, 500]]);
  expect(scans).toBe(1);
});

it('recomputes presence after movement, surrender, strength and department-side changes', () => {
  const without = (strength: number | null, surrendered: number | null) => ({ ...state, forceBlockStates: { ...state.forceBlockStates, [B('present')]: { ...state.forceBlockStates[B('present')]!, fbStrength: strength, fbSurrenderedDay: surrendered } } });
  const first = (s: typeof state) => selfEmancipationTerms(map, s, rules)[0]!;
  for (const s of [without(0, null), without(null, null), without(-1, null), without(1000, 1), { ...state, departmentFactions: { ...state.departmentFactions, [DEP('a_war')]: F('b') } }]) {
    expect([first(s).destination, first(s).toLines]).toEqual(['a1', 200]);
  }
  const moved = { ...state, forceLocations: { ...state.forceLocations, [B('present')]: { ...state.forceLocations[B('present')]!, locRegion: R('a1') } } };
  expect([first(moved).destination, first(moved).toLines]).toEqual(['a1', 500]);
  const missing = { ...state, forceBlockStates: { [B('unknown')]: state.forceBlockStates[B('unknown')]!, [B('enemy')]: state.forceBlockStates[B('enemy')]! } };
  expect([first(missing).destination, first(missing).toLines]).toEqual(['a1', 200]);
  expect([first(state).destination, first(state).toLines]).toEqual(['a2', 500]);
});

it('does no force work when there are no eligible census regions or no lines faction', () => {
  const noRead = { ...state, forceLocations: new Proxy(state.forceLocations, { ownKeys: () => { throw new Error('unneeded force scan'); } }) };
  expect(selfEmancipationTerms(map, noRead, { ...rules, linesFaction: null })).toEqual([]);
  expect(selfEmancipationTerms({ ...map, world: { ...map.world, census: [] } }, noRead, rules)).toEqual([]);
  expect(selfEmancipationTerms(map, { ...noRead, situationFlags: { protected: 0 } }, { ...rules, protectedFlags: [{ flag: 'protected', regions: [R('c1'), R('c2')] }] })).toEqual([]);
});
