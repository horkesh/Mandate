import { describe, expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { headquartersOf } from '../src/seats/posts.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { indexSeatsWorld, SeatsWorldError } from '../src/seats/world.ts';
import type { State } from '../src/root-state.ts';
import { createState } from '../src/tick/setup.ts';
import { block, DEP, forcesIndex, forcesStart, P, PER, person, post } from './support/forces-fixture.ts';
import { edge, F, R, region } from './support/map-fixture.ts';

/**
 * Two small fixes of the exit review (0072 item 6), each with its control:
 * - P2: a principal's menu tells him typical days to a post's seat, or to where it stood at the start, never to where
 *   its headquarters is today;
 * - P4: a start post whose department is not in the World is refused, not given a side of ''.
 *
 *   a1 (a's capital) --road-- a2 --road-- a3
 */
const MAP = forcesIndex({
  regions: ['a1', 'a2', 'a3'].map((r) => region(r)),
  edges: [edge('a1', 'a2'), edge('a2', 'a3')],
  departments: ['a_war', 'neutral_gov'],
  people: [person('a_lead', 'a'), person('a_gen', 'a'), person('a_gen2', 'a')],
});
const POSTS = [
  // A post with no seat in pack data: its typical days are to where its block stood at the start.
  post('a_field', { department: 'a_war', holder: PER('a_gen') }),
  // A post with a seat: typical days to the seat, wherever its block goes.
  post('a_seated', { department: 'a_war', holder: PER('a_gen2'), region: R('a2') }),
];
const BLOCKS = [block('a_1', { department: 'a_war', region: 'a3', post: P('a_field') }), block('a_2', { department: 'a_war', region: 'a3', post: P('a_seated') })];
const START = { ...forcesStart({ a1: { a: 1000 }, a2: { a: 1000 }, a3: { a: 1000 } }, POSTS, BLOCKS), factions: [{ faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true }] };
const WORLD = indexSeatsWorld(MAP, START);

const typical = (state: State, postId: string): number => {
  const menu = principalMenu(WORLD, state, F('a'), morningGround(WORLD, state, state.stateDay + 1));
  return menu.commandable.find((c) => c.post === postId)!.routes.find((r) => r.route === 'courier')!.typicalDays;
};

describe('a principal is told typical days from pack data, never where a post is today (exit review P2)', () => {
  it('a seatless post\'s days are to where its block stood at the start, after the block has moved', () => {
    const s0 = createState(WORLD, { seed: 1 });
    expect(WORLD.startHeadquarters(P('a_field'))).toBe('a3');
    const moved: State = { ...s0, forceLocations: { ...s0.forceLocations, [toId('forceBlock', 'a_1')]: { ...s0.forceLocations[toId('forceBlock', 'a_1')]!, locRegion: R('a2') } } };
    // Its headquarters today is a2, one courier day from the capital; the menu still says two, to a3.
    expect(headquartersOf(WORLD, moved, P('a_field'))).toBe('a2');
    expect([typical(s0, 'a_field'), typical(moved, 'a_field')]).toEqual([2, 2]);
    // The control: a post with a seat is measured to its seat (a2, one day), wherever its block stands.
    expect([typical(s0, 'a_seated'), typical(moved, 'a_seated')]).toEqual([1, 1]);
  });

  it('a post the start gave no block falls back to the side\'s own capital', () => {
    const world = indexSeatsWorld(MAP, { ...START, forceBlocks: [block('a_2', { department: 'a_war', region: 'a3', post: P('a_seated') })] });
    expect(world.startHeadquarters(P('a_field'))).toBeNull();
    expect(world.startHeadquarters(P('a_seated'))).toBe('a3');
  });
});

describe('a start post\'s department must be in the World (exit review P4)', () => {
  it('refuses a post whose department is not in the World, naming it; a neutral government\'s post has no side', () => {
    const ghost = { ...START, posts: [...POSTS, post('ghost_post', { department: 'ghost_dept' })] };
    expect(() => indexSeatsWorld(MAP, ghost)).toThrow(SeatsWorldError);
    expect(() => indexSeatsWorld(MAP, ghost)).toThrow('post ghost_post: department ghost_dept is not in the World');
    // The control: a neutral government's post indexes, as a post of no side.
    expect(() => indexSeatsWorld(MAP, { ...START, posts: [...POSTS, post('n_post', { department: DEP('neutral_gov') })] })).not.toThrow();
  });
});
