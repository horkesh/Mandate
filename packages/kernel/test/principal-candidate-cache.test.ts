import { expect, it } from 'vitest';
import { relieveHolder } from '../src/command/command.ts';
import type { State } from '../src/root-state.ts';
import { pendingRequests } from '../src/seats/requests.ts';
import { indexSeatsWorld, type SeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { createViewCache } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { F, P, POST, indexedFixture } from './support/seats-fixture.ts';

const base = indexedFixture();
const world = indexSeatsWorld(indexWorld({ ...base.map.world, vocabularies: { ...base.map.world.vocabularies, rankKinds: [{ id: 'regular', name: 'rank_kind.regular' }], ranks: [{ id: 'top', name: 'rank.top', seniority: 1, kind: 'regular' }] } }), base.start);
const state = createState(world, { seed: 1 });
const menu = (w: SeatsWorld, s: State, cache = createViewCache()) => {
  const r = pendingRequests(w, s, cache).find(r => r.menu.menuKind === 'principal' && r.menu.faction === F('a'));
  if (r?.menu.menuKind !== 'principal') throw new Error('missing principal');
  return r.menu;
};

it('reuses a deeply frozen candidate graph when only the day or unrelated knowledge changes', () => {
  const cache = createViewCache();
  const first = menu(world, state, cache).candidates;
  expect(first.length).toBeGreaterThan(0);
  expect(menu(world, { ...state, stateDay: 1 }, cache).candidates).toBe(first);
  expect(menu(world, { ...state, knowledgeBySeat: { ...state.knowledgeBySeat } }, cache).candidates).toBe(first);
  expect(Object.isFrozen(first)).toBe(true);
  expect(first.every(Object.isFrozen)).toBe(true);
  expect(() => (first as unknown[]).push(null)).toThrow(TypeError);
  expect(() => Object.assign(first[0]!, { seniority: 99 })).toThrow(TypeError);
});

it('invalidates every candidate dependency and keeps old-State reads equal to fresh derivation', () => {
  const cache = createViewCache();
  const initial = menu(world, state, cache).candidates;
  const alternatives: State[] = [
    relieveHolder(state, POST('a_army')),
    { ...state, personService: { ...state.personService, [P('a_spy')]: { serviceFaction: F('b'), serviceBloc: null, serviceChoice: 'resign', serviceDay: 1 } } },
    { ...state, personStatus: { ...state.personStatus, [P('a_spy')]: { statusKind: 'wounded', statusDay: 1 } } },
    { ...state, personRanks: { ...state.personRanks, [P('a_spy')]: { regular: { rankTerm: 'top', rankSince: '1900-01-01' } } } },
  ];
  for (const next of alternatives) {
    const cached = menu(world, next, cache).candidates;
    expect(cached).not.toBe(initial);
    expect(cached).toEqual(menu(world, next).candidates);
    expect(menu(world, state, cache).candidates).toEqual(initial);
  }
  const other = indexSeatsWorld(indexWorld({ ...world.map.world, people: world.map.world.people.map(p => p.id === P('a_spy') ? { ...p, faction: F('b') } : p) }), world.start);
  expect(menu(other, state, cache).candidates).toEqual(menu(other, state).candidates);
  expect(menu(other, state, cache).candidates).not.toEqual(initial);
  expect(menu(world, state, cache).candidates).toEqual(initial);
});
