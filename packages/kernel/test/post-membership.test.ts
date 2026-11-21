import { expect, it } from 'vitest';
import { relieveHolder } from '../src/command/command.ts';
import { fieldPosts, offices } from '../src/seats/posts.ts';
import { createState } from '../src/tick/setup.ts';
import { F, POST, indexedFixture } from './support/seats-fixture.ts';

const world = indexedFixture();
const original = createState(world, { seed: 1 });

it.each([
  ['field posts', fieldPosts, ['a_army', 'a_reserve', 'b_army']],
  ['offices', offices, ['a_office', 'b_office']],
] as const)('%s enumerates assignments once for its whole post list', (_name, list, expected) => {
  let scans = 0;
  const state = { ...original, forceAssignments: new Proxy(original.forceAssignments, { ownKeys: target => { scans++; return Reflect.ownKeys(target); } }) };
  expect(list(world, state)).toEqual(expected);
  expect(scans).toBe(1);
});

it('keeps empty, neutral, vacant and transferred commands distinct, without changing older States', () => {
  const empty = { ...original, forceAssignments: Object.fromEntries(Object.keys(original.forceAssignments).map(b => [b, null])) };
  expect(fieldPosts(world, empty)).toEqual([]);
  expect(offices(world, empty)).toEqual(['a_army', 'a_office', 'a_reserve', 'b_army', 'b_office']);
  const neutral = { ...original, departmentFactions: { ...original.departmentFactions, b_war: null } };
  expect(fieldPosts(world, neutral)).toEqual(['a_army', 'a_reserve']);
  expect(offices(world, neutral)).toEqual(['a_office']);
  const vacant = relieveHolder(original, POST('a_army'));
  expect(fieldPosts(world, vacant)).toEqual(['a_reserve', 'b_army']);
  expect(offices(world, vacant)).toEqual(['a_office', 'b_office']);
  const transferred = { ...original, forceAssignments: Object.fromEntries(Object.entries(original.forceAssignments).map(([b, p]) => [b, p === POST('a_reserve') ? POST('a_army') : p])) };
  expect(fieldPosts(world, transferred)).toEqual(['a_army', 'b_army']);
  expect(offices(world, transferred)).toEqual(['a_office', 'a_reserve', 'b_office']);
  expect(fieldPosts(world, original)).toEqual(['a_army', 'a_reserve', 'b_army']);
  expect(offices(world, original)).toEqual(['a_office', 'b_office']);
  expect(original.departmentFactions[original.postStates[POST('a_army')]!.postDepartment]).toBe(F('a'));
});

it('ignores inherited assignments and never classifies the principal or filter as an office', () => {
  const assignments = Object.assign(Object.create({ inherited: POST('b_office') }), original.forceAssignments, { unassigned: null });
  const state = { ...original, forceAssignments: assignments, postStates: { ...original.postStates, [POST('a_office')]: { ...original.postStates[POST('a_office')]!, postHolder: world.faction(F('a')).principal } } };
  expect(fieldPosts(world, state)).toEqual(['a_army', 'a_reserve', 'b_army']);
  expect(offices(world, state)).toEqual(['b_office']);
});
