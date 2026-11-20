import { describe, expect, it } from 'vitest';
import { applyCommandProposals } from '../src/command/command.ts';
import { headquartersOf, whereIsPerson } from '../src/seats/posts.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { routeLatency } from '../src/messages/latency.ts';
import { createState } from '../src/tick/setup.ts';
import { indexedFixture, F, P, POST, R } from './support/seats-fixture.ts';

describe('the capital has one State owner', () => {
  it('copies the start, moves by a command proposal, and every principal location reads the move', () => {
    const world = indexedFixture();
    const state = createState(world, { seed: 1 });
    const initial = world.faction(F('a')).seatRegion;
    expect(state.factionCapitals[F('a')]).toBe(initial);
    const result = applyCommandProposals(world.map, state, [{ owner: 'command', field: 'faction_capital', subject: R('b_cap'), side: F('a'), delta: 0, origin: 'notice' }], 2);
    expect(result.refused).toEqual([]);
    expect(result.state.factionCapitals[F('a')]).toBe(R('b_cap'));
    expect(whereIsPerson(world, result.state, P('a_lead'))).toBe(R('b_cap'));
    expect(state.factionCapitals[F('a')]).toBe(initial);
    expect(result.state.factionCapitals[F('b')]).toBe(state.factionCapitals[F('b')]);
    const withoutSeat = { ...result.state, postStates: { ...result.state.postStates, [POST('a_office')]: { ...result.state.postStates[POST('a_office')]!, postSeat: null } } };
    expect(headquartersOf(world, withoutSeat, POST('a_office'))).toBe(R('b_cap'));
    const ground = morningGround(world, result.state, 3);
    const menu = principalMenu(world, result.state, F('a'), ground);
    const route = menu.commandable.find((p) => p.post === POST('a_army'))!.routes.find((r) => r.route === 'courier')!;
    const latency = routeLatency(ground.latency, world.rules.latency, 'courier', R('b_cap'), state.postStates[POST('a_army')]!.postSeat!, F('a'), null);
    expect(latency.ok).toBe(true);
    if (latency.ok) expect(route.typicalDays).toBe(latency.latency.days);
  });

  it('refuses an unknown side or place', () => {
    const world = indexedFixture();
    const state = createState(world, { seed: 1 });
    for (const [side, subject] of [['missing', 'b_cap'], ['a', 'missing']]) {
      const result = applyCommandProposals(world.map, state, [{ owner: 'command', field: 'faction_capital', subject: subject!, side: F(side!), delta: 0, origin: 'notice' }], 2);
      expect(result.state).toBe(state);
      expect(result.refused).toHaveLength(1);
    }
  });
});
