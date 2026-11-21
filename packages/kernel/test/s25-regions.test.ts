import { expect, it } from 'vitest';
import { applyFortification, initialFortification, initialLoyalty } from '../src/regions/regions.ts';
import { selfEmancipationTerms } from '../src/regions/self-emancipation.ts';
import { indexWorld } from '../src/world/index.ts';
import type { State } from '../src/root-state.ts';
import { fresh } from './support/s25-fixture.ts';
import { B, DEP } from './support/forces-fixture.ts';
import { F, R } from './support/seats-fixture.ts';

it('S25 regions-01: zero fortification is a valid explicit opening level', () => {
  const { world } = fresh();
  expect(initialFortification(world.map, { ...world.start, fortification: [{ region: R('a_front'), levelPermille: 0 }] })).toEqual({ a_front: 0 });
  expect(() => initialFortification(world.map, { ...world.start, fortification: [{ region: R('a_front'), levelPermille: -1 }] })).toThrow(/permille/);
});

it('S25 regions-03: a nonempty works proposal is applied with its cause', () => {
  const { state } = fresh();
  const next = applyFortification(state, [{ region: R('a_front'), deltaPermille: 75, cause: 'operations' }]);
  expect(next.state.regionFortification[R('a_front')]).toBe(75);
  expect(next.changes).toEqual([{ region: R('a_front'), before: 0, after: 75, cause: 'operations' }]);
  expect(state.regionFortification[R('a_front')]).toBeUndefined();
});

it('S25 regions-05: a known loyalty vector may give one faction zero support', () => {
  const { world } = fresh();
  expect(initialLoyalty(world.map, { ...world.start, loyalty: [{ region: R('a_front'), shares: [{ faction: F('a'), permille: 0 }, { faction: F('b'), permille: 1000 }] }] })).toEqual({ a_front: { a: 0, b: 1000 } });
});

it.each([0, null])('S25 regions-02/04: a block with %s known men does not extend the lines; reasons retain the governing side', strength => {
  const { world, state } = fresh();
  const map = indexWorld({ ...world.map.world, census: [{ region: R('b_front'), enslavedPopulation: 1_000_000, provenance: [] }] });
  const rules = { ...world.map.world.rules.selfEmancipation, linesFaction: F('a'), resistancePerMillion: 1000,
    flightPerMillion: 1000, reachWithForce: 1000, reachLinesOnly: 400, policyBase: 1000 };
  const held: State = { ...state, regionControl: { ...state.regionControl, [R('a_front')]: { a: 1000 }, [R('b_front')]: { b: 1000 } },
    regionGovernments: { ...state.regionGovernments, [R('b_front')]: DEP('b_war') },
    forceBlockStates: { ...state.forceBlockStates, [B('a_army_1')]: { ...state.forceBlockStates[B('a_army_1')]!, fbStrength: strength } } };
  const term = selfEmancipationTerms(map, held, rules)[0]!;
  expect(term.toLines).toBe(400);
  expect(term.reasons[0]).toMatchObject({ cause: 'resistance-within', government: 'enslaving-side' });
  const withMen = { ...held, forceBlockStates: { ...held.forceBlockStates, [B('a_army_1')]: { ...held.forceBlockStates[B('a_army_1')]!, fbStrength: 1 } } };
  expect(selfEmancipationTerms(map, withMen, rules)[0]!.toLines).toBe(1000);
});
