import { describe, expect, it } from 'vitest';
import { applyCommandProposals, closeGovernment, GOVERNMENT_CLOSED_FIELD, neutralGroundOf, reopenGovernment } from '../src/command/command.ts';
import { createDerivedMapCache } from '../src/control-index/derived.ts';
import type { DepartmentId } from '../src/ids.ts';
import { createIdMint } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { indexWorld as indexComms } from '../src/standin/world.ts';
import { createTelemetry } from '../src/telemetry.ts';
import type { Proposal, TickContext } from '../src/tick/context.ts';
import { commandProposalsPhase } from '../src/tick/forces.ts';
import { MAP_MECHANICS, mapPhase } from '../src/tick/map.ts';
import { passageOf } from '../src/tick/passage.ts';
import { createState } from '../src/tick/setup.ts';
import { commsFixture } from './support/comms-fixture.ts';
import { DEP, forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { depot, edge, F, R, region } from './support/map-fixture.ts';

/**
 *   a1 (a's source) --road-- a2 --road-- n1 (a neutral state's) --road-- a3 (a's)
 *                                        |
 *                                        u1 (government unknown) --road-- a4 (a's)
 */
const MAP = forcesIndex({
  regions: ['a1', 'a2', 'n1', 'a3', 'u1', 'a4', 'b1'].map((r) => region(r)),
  edges: [edge('a1', 'a2'), edge('a2', 'n1'), edge('n1', 'a3'), edge('a2', 'u1'), edge('u1', 'a4'), edge('n1', 'b1')],
  depots: [depot('a_src', 'a1')],
});
const WORLD = indexComms(commsFixture(), MAP);
const START = forcesStart({ a1: { a: 1000 }, a2: { a: 1000 }, a3: { a: 1000 }, a4: { a: 1000 }, b1: { b: 1000 } }, [], [], {
  governments: [
    { region: R('a1'), department: DEP('a_war'), provenance: [] },
    { region: R('n1'), department: DEP('neutral_gov'), provenance: [] },
    { region: R('u1'), department: 'unknown', provenance: [] },
  ],
});
const NEUTRAL: DepartmentId = DEP('neutral_gov');

function ctxFor(state: State, day: number): TickContext {
  return { world: WORLD, day, seed: state.gameSeed, mint: createIdMint(state), telemetry: createTelemetry([...MAP_MECHANICS]), outbox: [], rejections: [], events: [], proposals: [], prices: [], decisionPoints: [], controlDeltas: [], infrastructureDeltas: [], mapEvents: [] };
}

/** The proposal a situation's effect pushes (tick/situations.ts), closing (+) or reopening (-) a government. */
function proposal(delta: number, subject: string = NEUTRAL): Extract<Proposal, { proposal: 'effect' }> {
  return { proposal: 'effect', owner: 'command', field: GOVERNMENT_CLOSED_FIELD, subject, delta, reason: 'proclamation', side: null, situation: 'sit' as never, option: null };
}

describe('neutral ground from governments (0055 as amended by 0058)', () => {
  const s0 = createState(WORLD, { seed: 1, start: START });

  it('a neutral government\'s regions are neutral ground, open until it closes; a side\'s or an unknown government\'s are not', () => {
    expect(neutralGroundOf(MAP, s0)).toEqual({ n1: 'open' });
    expect(neutralGroundOf(MAP, closeGovernment(MAP, s0, NEUTRAL, 3))).toEqual({ n1: 'closed' });
    expect(passageOf(MAP, s0).neutralGround).toEqual({ n1: 'open' });
  });

  it('only a neutral government closes; reopening and repeats are plain (positive controls)', () => {
    expect(() => closeGovernment(MAP, s0, DEP('a_war'), 1)).toThrow('belongs to a side');
    expect(() => closeGovernment(MAP, s0, DEP('ghost'), 1)).toThrow('not in the World');
    const closed = closeGovernment(MAP, s0, NEUTRAL, 3);
    expect(closed.closedGovernments).toEqual({ neutral_gov: 3 });
    expect(closeGovernment(MAP, closed, NEUTRAL, 9)).toBe(closed);
    expect(reopenGovernment(closed, NEUTRAL).closedGovernments).toEqual({});
    expect(reopenGovernment(s0, NEUTRAL)).toBe(s0);
  });

  it('applies the proposals command owns, refuses what it cannot be, and leaves other owners alone', () => {
    const r = applyCommandProposals(MAP, s0, [proposal(1), { owner: 'politics', field: 'support', subject: 'x', delta: 5 }, { owner: 'command', field: 'loyalty', subject: 'n1', delta: 1 }, proposal(1, 'a_war')], 2);
    expect(r.state.closedGovernments).toEqual({ neutral_gov: 2 });
    expect(r.applied).toEqual([{ field: GOVERNMENT_CLOSED_FIELD, subject: 'neutral_gov', change: 'closed' }]);
    expect(r.refused).toEqual(['command owns no field "loyalty" with subject n1', 'department a_war belongs to a side; only a neutral government closes its territory']);
  });
});

describe('a situation closing neutral passage, through the tick\'s phases', () => {
  it('open: a3 is supplied across n1. Closed by a proposal: a3 is a pocket, reported once. Reopened: relieved', () => {
    const cache = createDerivedMapCache();
    let state = createState(WORLD, { seed: 1, start: START });
    const pockets = (ctx: TickContext) => ctx.mapEvents.flatMap((e) => (e.event === 'pocket_closed' || e.event === 'pocket_relieved' ? [`${e.event}:${e.regions.join(',')}`] : []));

    // Day 1: open. a3's line runs through n1; a4, behind ground of unknown government, is a pocket from the start.
    const d1 = ctxFor(state, 1);
    let mapped = mapPhase(d1, state, cache);
    expect(mapped.derived!.supply.factions.get(F('a'))!.paths.get(R('a3'))!.legs.map((l) => l.to)).toEqual(['a2', 'n1', 'a3']);
    expect(mapped.derived!.supply.factions.get(F('a'))!.pockets.map((p) => p.regions)).toEqual([['a4']]);
    // ... and the situation's effect proposes the closing, applied after the situations phase.
    d1.proposals.push(proposal(1));
    state = commandProposalsPhase(d1, mapped.state);
    expect(d1.mapEvents.filter((e) => e.event === 'government_changed')).toEqual([{ event: 'government_changed', department: 'neutral_gov', change: 'closed' }]);
    expect(d1.telemetry!.mechanics['command.government_closed']!.fires).toBe(1);

    // The closing reports the pocket it makes, the same day; day 2's map agrees, and reports nothing new.
    expect(pockets(d1)).toEqual(['pocket_closed:a3']);
    const d2 = ctxFor(state, 2);
    mapped = mapPhase(d2, state, cache);
    expect(pockets(d2)).toEqual([]);
    expect(mapped.derived!.supply.factions.get(F('a'))!.pockets.find((p) => p.regions.includes(R('a3')))!.cut).toMatchObject({ why: 'not_traced', region: 'n1' });

    // Day 2 too: a later situation reopens, and the pocket is relieved at once.
    d2.proposals.push(proposal(-1));
    state = commandProposalsPhase(d2, mapped.state);
    expect(pockets(d2)).toEqual(['pocket_relieved:a3']);
    const d3 = ctxFor(state, 3);
    mapPhase(d3, state, cache);
    expect(pockets(d3)).toEqual([]);
  });
});
