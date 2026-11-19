import { toId } from '../src/ids.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import type { SituationDef } from '../src/situations/types.ts';
import { tick } from '../src/tick/tick.ts';
import { describe, expect, it } from 'vitest';
import { applyCommandProposals, closeGovernment, GOVERNMENT_CLOSED_FIELD, neutralGroundOf, reopenGovernment } from '../src/command/command.ts';
import { createDerivedMapCache } from '../src/control-index/derived.ts';
import type { DepartmentId } from '../src/ids.ts';
import { createIdMint } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { createTelemetry } from '../src/telemetry.ts';
import type { Proposal, TickContext } from '../src/tick/context.ts';
import { commandProposalsPhase } from '../src/tick/forces.ts';
import { MAP_MECHANICS, mapPhase } from '../src/tick/map.ts';
import { passageOf } from '../src/tick/passage.ts';
import { createState } from '../src/tick/setup.ts';
import { ctxFor as ctxIn, worldOf } from './support/tick-context.ts';
import { DEP, forcesIndex, forcesStart, P, PER, post } from './support/forces-fixture.ts';
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
const START = forcesStart({ a1: { a: 1000 }, a2: { a: 1000 }, a3: { a: 1000 }, a4: { a: 1000 }, b1: { b: 1000 } }, [], [], {
  governments: [
    { region: R('a1'), department: DEP('a_war'), provenance: [] },
    { region: R('n1'), department: DEP('neutral_gov'), provenance: [] },
    { region: R('u1'), department: 'unknown', provenance: [] },
  ],
});
const NEUTRAL: DepartmentId = DEP('neutral_gov');

function ctxFor(state: State, day: number): TickContext {
  return ctxIn(worldOf(MAP, START), state, day, MAP_MECHANICS);
}

/** The proposal a situation's effect pushes (tick/situations.ts), closing (+) or reopening (-) a government. */
function proposal(delta: number, subject: string = NEUTRAL): Extract<Proposal, { proposal: 'effect' }> {
  return { proposal: 'effect', owner: 'command', field: GOVERNMENT_CLOSED_FIELD, subject, delta, reason: 'proclamation', side: null, situation: 'sit' as never, option: null, origin: 'notice' };
}

describe('neutral ground from governments (0055 as amended by 0058)', () => {
  const s0 = createState(worldOf(MAP, START), { seed: 1 });

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
    const r = applyCommandProposals(MAP, s0, [proposal(1), { owner: 'politics', field: 'support', subject: 'x', delta: 5, side: null, origin: 'notice' }, { owner: 'command', field: 'loyalty', subject: 'n1', delta: 1, side: null, origin: 'notice' }, proposal(1, 'a_war')], 2);
    expect(r.state.closedGovernments).toEqual({ neutral_gov: 2 });
    expect(r.applied).toEqual([{ field: GOVERNMENT_CLOSED_FIELD, subject: 'neutral_gov', change: 'closed' }]);
    expect(r.refused.map((x) => x.why)).toEqual(['command owns no field "loyalty" with subject n1', 'department a_war belongs to a side; only a neutral government closes its territory']);
  });
});

describe('a situation closing neutral passage, end to end through the tick (0055: "a situation closes it")', () => {
  it('a principal on the rules model takes the default "close" on day 2; the tick applies it and the region beyond is cut off', () => {
    const close: SituationDef = {
      id: toId('situation', 'proclamation'),
      kind: 'decision',
      faction: F('a'),
      title: 'situation.proclamation.title',
      text: 'situation.proclamation.text',
      earliest: '1900-06-01',
      event: { dayAtLeast: 2 },
      knowledge: null,
      railroad: 'test fixture',
      chain: null,
      subjects: [],
      options: [
        {
          id: 'close',
          label: 'situation.proclamation.option.close',
          displayKey: 1,
          proposedBy: [PER('a_gen')],
          group: null,
          appearsWhen: null,
          expiresWhen: null,
          waitsOn: null,
          effects: [{ propose: { owner: 'command', field: GOVERNMENT_CLOSED_FIELD, subject: 'neutral_gov', delta: 1, reason: 'proclamation', side: null } }],
          lockedCosts: [],
          orders: [], calls: [],
          honours: [],
          watched: false, policy: null,
          gate: null,
        },
      ],
      inaction: { text: 'situation.proclamation.inaction', effects: [], policy: null },
      historicalDefault: { options: ['close'] },
      staffLine: { authors: [P('a_office')], recommends: ['close'], reasons: [], confidence: 600 },
      delegableTo: [],
      resurfaceOn: [],
      effects: [],
      report: null,
      gate: { none: 'test fixture' },
      gateReview: null,
      citations: [],
    };
    const start = { ...START, factions: [{ faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true }], posts: [post('a_office', { kind: 'office', department: 'a_war', holder: PER('a_gen'), region: R('a1') })] };
    const world = indexSeatsWorld(MAP, start, { situations: [close] });
    let state = createState(world, { seed: 1 });
    const events: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = tick(world, state, [], { freeze: true, deepChecks: true });
      for (const e of r.mapEvents) {
        if (e.event === 'government_changed') events.push(`${r.day}:${e.department}:${e.change}`);
        if (e.event === 'pocket_closed') events.push(`${r.day}:pocket:${e.regions.join(',')}`);
      }
      state = r.state;
    }
    expect(state.situationStates[close.id]).toMatchObject({ sitStatus: 'decided', sitChosen: ['close'], sitDecidedBy: 'history-default' });
    expect(state.closedGovernments).toEqual({ neutral_gov: 2 });
    expect(events).toEqual(['2:neutral_gov:closed', '2:pocket:a3']);
    // The control: with no situation, nothing closes.
    const plain = indexSeatsWorld(MAP, start);
    let s2 = createState(plain, { seed: 1 });
    for (let i = 0; i < 3; i++) s2 = tick(plain, s2, []).state;
    expect(s2.closedGovernments).toEqual({});
  });
});

describe('a situation closing neutral passage, through the tick\'s phases', () => {
  it('open: a3 is supplied across n1. Closed by a proposal: a3 is a pocket, reported once. Reopened: relieved', () => {
    const cache = createDerivedMapCache();
    let state = createState(worldOf(MAP, START), { seed: 1 });
    const pockets = (ctx: TickContext) => ctx.mapEvents.flatMap((e) => (e.event === 'pocket_closed' || e.event === 'pocket_relieved' ? [`${e.event}:${e.regions.join(',')}`] : []));

    // Day 1: open. a3's line runs through n1; a4, behind ground of unknown government, is a pocket from the start.
    const d1 = ctxFor(state, 1);
    let mapped = mapPhase(d1, state, cache);
    expect(mapped.derived!.supply.factions.get(F('a'))!.paths.get(R('a3'))!.legs.map((l) => l.to)).toEqual(['a2', 'n1', 'a3']);
    expect(mapped.derived!.supply.factions.get(F('a'))!.pockets.map((p) => p.regions)).toEqual([['a4']]);
    // ... and the situation's effect proposes the closing, applied after the situations phase.
    d1.proposals.push(proposal(1));
    state = commandProposalsPhase(d1, mapped.state).state;
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
    state = commandProposalsPhase(d2, mapped.state).state;
    expect(pockets(d2)).toEqual(['pocket_relieved:a3']);
    const d3 = ctxFor(state, 3);
    mapPhase(d3, state, cache);
    expect(pockets(d3)).toEqual([]);
  });
});
