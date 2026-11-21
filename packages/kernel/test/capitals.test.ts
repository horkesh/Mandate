import { describe, expect, it } from 'vitest';
import { applyCommandProposals } from '../src/command/command.ts';
import { headquartersOf, whereIsPerson } from '../src/seats/posts.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { routeLatency } from '../src/messages/latency.ts';
import { createState } from '../src/tick/setup.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { ctxFor } from './support/tick-context.ts';
import { dispatchOrder } from '../src/tick/orders.ts';
import { encodeSave, decodeSave } from '../src/serialize/save.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
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

  it('dispatches from the moved State capital and preserves that origin after saving, without falling back to the World start', () => {
    const world = indexedFixture();
    const start = createState(world, { seed: 1 });
    const moved = applyCommandProposals(world.map, start, [{ owner: 'command', field: 'faction_capital', subject: R('a_front'), side: F('a'), delta: 0, origin: 'notice' }], 1).state;
    const dispatch = (state: State) => {
      const ctx = ctxFor(world, state, 2, [...TICK_MECHANICS, ...MAP_MECHANICS]);
      dispatchOrder(ctx, state, seatIdFor(P('a_lead')), P('a_lead'), POST('a_army'), 'courier', true, { orderKind: 'go', orderGoal: null, orderEdit: null, orderCall: null, orderNotes: [] });
      expect(ctx.outbox).toHaveLength(1);
      return ctx.outbox[0]!;
    };
    const before = dispatch(start);
    const after = dispatch(moved);
    expect(after.msgArriveDay).toBe(after.msgSentDay);
    expect(before.msgArriveDay).toBeGreaterThan(after.msgArriveDay);
    expect(world.faction(F('a')).seatRegion).toBe(start.factionCapitals[F('a')]);
    const worldHash = canonicalHash(world.map.world);
    const resumed = decodeSave(encodeSave({ worldHash, state: moved }), { expectedWorldHash: worldHash }).state as unknown as State;
    expect(resumed.factionCapitals).toEqual(moved.factionCapitals);
    expect(whereIsPerson(world, resumed, P('a_lead'))).toBe(R('a_front'));
    expect(dispatch(resumed)).toEqual(after);
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
