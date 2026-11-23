import { deliverReport, knowledgeOf } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { fieldPosts, headquartersOf, offices, whereIsPerson } from '../src/seats/posts.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { generateReports } from '../src/tick/generate.ts';
import { indexWorld } from '../src/world/index.ts';
import { report, claim } from './support/s25-fixture.ts';
import { describe, expect, it } from 'vitest';
import { applyCommandProposals } from '../src/command/command.ts';
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
import { indexedFixture, F, P, POST, R, fixtureMap, fixtureStart } from './support/seats-fixture.ts';

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

function fixture() {
  const map = fixtureMap();
  // A pack's arbitrary kind name carries the role; it is not a kernel keyword.
  const world = indexSeatsWorld(indexWorld({ ...map.world, vocabularies: {
    ...map.world.vocabularies,
    postKinds: map.world.vocabularies.postKinds.map(k => k.id === 'office' ? { ...k, role: 'office' as const } : k),
  } }), (() => {
    const start = fixtureStart();
    return { ...start, forceBlocks: start.forceBlocks.map(b => b.post === POST('a_reserve') ? { ...b, post: POST('a_office') } : b) };
  })());
  const initial = createState(world, { seed: 17 });
  return { world, state: initial };
}

describe('S71 institutional offices', () => {
  it('keeps an office at its government seat despite directly assigned distant forces, while field headquarters follow their body', () => {
    const { world, state } = fixture();
    expect(headquartersOf(world, state, POST('a_office'))).toBe(R('a_cap'));
    expect(whereIsPerson(world, state, P('a_sec'))).toBe(R('a_cap'));
    expect(world.startHeadquarters(POST('a_office'))).toBe(R('a_cap'));
    expect(headquartersOf(world, state, POST('a_army'))).toBe(R('a_front'));
    expect(fieldPosts(world, state)).not.toContain(POST('a_office'));
    expect(offices(world, state)).toContain(POST('a_office'));
    const menu = principalMenu(world, state, F('a'), morningGround(world, state, 1));
    expect(menu.commandable.map(p => p.post)).not.toContain(POST('a_office'));
  });

  it('follows the government act without rewriting its starting seat, force locations or old received papers', () => {
    const { world, state } = fixture();
    const seat = seatIdFor(P('a_lead'));
    const paper = report('m.old-office-wire', { reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'),
      reportSubjectKind: 'post', reportSubjectId: POST('a_office'), reportClaims: [claim('position', 0)] });
    const heard = deliverReport(state, seat, paper, NO_TRUTH);
    const moved = applyCommandProposals(world.map, heard, [{ owner: 'command', field: 'faction_capital', subject: R('b_cap'), side: F('a'), delta: 0, origin: 'notice' }], 2);
    expect(moved.refused).toEqual([]);
    expect(headquartersOf(world, moved.state, POST('a_office'))).toBe(R('b_cap'));
    expect(headquartersOf(world, heard, POST('a_office'))).toBe(R('a_cap'));
    expect(moved.state.postStates).toBe(heard.postStates);
    expect(moved.state.forceLocations).toBe(heard.forceLocations);
    expect(moved.state.knowledgeBySeat).toBe(heard.knowledgeBySeat);
    expect(knowledgeOf(moved.state, seat).knownReports.find(r => r.id === paper.id)).toEqual(paper);
    const worldHash = canonicalHash(world.map.world);
    const resumed = decodeSave(encodeSave({ worldHash, state: moved.state }), { expectedWorldHash: worldHash }).state as unknown as State;
    expect(headquartersOf(world, resumed, POST('a_office'))).toBe(R('b_cap'));
    expect(knowledgeOf(resumed, seat).knownReports.find(r => r.id === paper.id)).toEqual(paper);
  });

  it('gives an office word on returns it actually holds, rather than scouting or field dispatches from its assigned force', () => {
    const { world, state } = fixture();
    const held = deliverReport(state, seatIdFor(P('a_sec')), report('m.army-return', {
      reportType: 'strength-return', reportSubjectKind: 'post', reportSubjectId: POST('a_army'),
      reportClaims: [claim('present-for-duty', 731)],
    }), NO_TRUTH);
    const ctx = ctxFor(world, held, 8, TICK_MECHANICS);
    generateReports(ctx, held);
    const outgoing = ctx.outbox.filter(m => m.msgReport?.reportAuthorPost === POST('a_office'));
    expect(outgoing.map(m => m.msgReport!.reportSubtype)).toEqual(['cabinet-word']);
    expect(outgoing[0]!.msgReport!.reportClaims[0]!.claimValue).toBe(731);
    expect(outgoing[0]!.msgRoute).toBe('in-person');
  });
});


describe('0110 joining headquarters', () => {
  it('ignores incoming blocks, falls back to the declared seat, and follows them once joined', () => {
    const world = indexedFixture();
    const state = createState(world, { seed: 1 });
    const post = POST('a_army');
    const assigned = Object.keys(state.forceAssignments).filter(b => state.forceAssignments[b as never] === post);
    expect(assigned.length).toBeGreaterThan(0);
    const forceLocations = { ...state.forceLocations };
    const forceJoins = { ...state.forceJoins };
    for (const b of assigned) {
      forceLocations[b as never] = { ...forceLocations[b as never]!, locRegion: R('b_mid') };
      forceJoins[b as never] = { joinPost: post, joinRegion: R('a_front'), joinSinceDay: 1, joinBlocked: null };
    }
    const incoming = { ...state, forceLocations, forceJoins };
    expect(headquartersOf(world, incoming, post)).toBe(state.postStates[post]!.postSeat);
    expect(headquartersOf(world, { ...incoming, forceJoins: {} }, post)).toBe(R('b_mid'));
    expect(headquartersOf(world, state, post)).toBe(R('a_front'));
  });
});
