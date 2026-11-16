import { describe, expect, it } from 'vitest';
import {
  applyCommandProposals,
  DEPARTMENT_SIDE_FIELD,
  GOVERNMENT_CLOSED_FIELD,
  isSelfGoverning,
  neutralGroundOf,
  regionMoveProblem,
  type CommandProposal,
  type ProposalOrigin,
} from '../src/command/command.ts';
import { toId, type DepartmentId, type FactionId } from '../src/ids.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import type { SituationDef } from '../src/situations/types.ts';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { indexWorld } from '../src/world/index.ts';
import { DEP, forcesStart, forcesWorld, P, PER, person, post } from './support/forces-fixture.ts';
import { depot, edge, F, R, region } from './support/map-fixture.ts';

/**
 * A self-governing government (0069) is a department whose kind the pack marks `selfGoverning`. Only its own act, a
 * notice, changes its side, closes or reopens it, or moves its regions; never a principal's decision. The fixture:
 *
 *   a1 (a's source) --road-- a2 --road-- n1 (nation_x's land) --road-- n2 (nation_y's land) --road-- b1
 *
 * nation_x, its rival government nation_x2 (same polity) and nation_y (another polity) are of kind `nation`
 * (self-governing); neutral_gov is an ordinary government of no side.
 */
const WORLD = (() => {
  const base = forcesWorld({
    regions: ['a1', 'a2', 'n1', 'n2', 'b1', 'g1'].map((r) => region(r)),
    edges: [edge('a1', 'a2'), edge('a2', 'n1'), edge('n1', 'n2'), edge('n2', 'b1'), edge('a2', 'g1')],
    depots: [depot('a_src', 'a1')],
    departments: ['a_war', 'b_war', 'neutral_gov', 'neutral_nation_x', 'neutral_nation_x2', 'neutral_nation_y'],
    people: [...['a_lead', 'a_gen'].map((p) => person(p, 'a')), ...['b_lead'].map((p) => person(p, 'b'))],
  });
  return indexWorld({ ...base, departments: base.departments.map((d) => (d.id.includes('nation_') ? { ...d, kind: 'nation', polity: d.id.includes('nation_x') ? 'xfolk' : 'yfolk' } : d)) });
})();
const X: DepartmentId = DEP('neutral_nation_x');
const X2: DepartmentId = DEP('neutral_nation_x2');
const Y: DepartmentId = DEP('neutral_nation_y');
const GOV: DepartmentId = DEP('neutral_gov');
const START = {
  ...forcesStart({ a1: { a: 1000 }, a2: { a: 1000 }, b1: { b: 1000 } }, [post('a_office', { kind: 'office', department: 'a_war', holder: PER('a_gen'), region: R('a1') })], [], {
    governments: [
      { region: R('a1'), department: DEP('a_war'), provenance: [] },
      { region: R('n1'), department: X, provenance: [] },
      { region: R('n2'), department: Y, provenance: [] },
      { region: R('g1'), department: GOV, provenance: [] },
    ],
  }),
  factions: [{ faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true }],
};
const SEATS = indexSeatsWorld(WORLD, START);
const S0 = createState(SEATS, { seed: 1 });

const joins = (subject: DepartmentId, origin: ProposalOrigin, side: FactionId = F('a')): CommandProposal => ({ owner: 'command', field: DEPARTMENT_SIDE_FIELD, subject, delta: 1, side, origin });
const closes = (subject: DepartmentId, origin: ProposalOrigin, delta = 1): CommandProposal => ({ owner: 'command', field: GOVERNMENT_CLOSED_FIELD, subject, delta, side: null, origin });

describe('the kernel guard: a self-governing government is moved only by a notice (0069)', () => {
  it('reads the flag from the department kind, never a kind name', () => {
    expect([isSelfGoverning(WORLD, X), isSelfGoverning(WORLD, Y), isSelfGoverning(WORLD, GOV), isSelfGoverning(WORLD, DEP('a_war'))]).toEqual([true, true, false, false]);
  });

  it('refuses a change of side from a decision, with a typed reason, and changes nothing (positive control: the same proposal from a notice is applied)', () => {
    const refused = applyCommandProposals(WORLD, S0, [joins(X, 'decision')], 3);
    expect(refused.refused).toEqual([{ reason: 'self_governing_decision', why: `department ${X} governs itself: only a notice, its own act, moves it, never a decision option, inaction or a locked cost` }]);
    expect(refused.applied).toEqual([]);
    expect(refused.state).toBe(S0);
    const applied = applyCommandProposals(WORLD, S0, [joins(X, 'notice')], 3);
    expect(applied.refused).toEqual([]);
    expect(applied.state.departmentFactions[X]).toBe('a');
    expect(applied.applied).toMatchObject([{ field: DEPARTMENT_SIDE_FIELD, subject: X, change: 'joined' }]);
  });

  it('refuses a closing and a reopening from a decision, and applies them from a notice', () => {
    const closed = applyCommandProposals(WORLD, S0, [closes(X, 'notice')], 4).state;
    expect(closed.closedGovernments[X]).toBe(4);
    expect(neutralGroundOf(WORLD, closed)).toMatchObject({ n1: 'closed', n2: 'open' });
    const noClose = applyCommandProposals(WORLD, S0, [closes(X, 'decision')], 4);
    expect(noClose.refused.map((r) => r.reason)).toEqual(['self_governing_decision']);
    expect(noClose.state).toBe(S0);
    const noReopen = applyCommandProposals(WORLD, closed, [closes(X, 'decision', -1)], 5);
    expect(noReopen.refused.map((r) => r.reason)).toEqual(['self_governing_decision']);
    expect(noReopen.state).toBe(closed);
    expect(applyCommandProposals(WORLD, closed, [closes(X, 'notice', -1)], 5).state.closedGovernments).toEqual({});
  });

  it('leaves an ordinary government to a decision, and refuses only the nation in a mixed batch', () => {
    const r = applyCommandProposals(WORLD, S0, [joins(GOV, 'decision'), joins(X, 'decision'), closes(Y, 'notice')], 3);
    expect(r.refused.map((x) => x.reason)).toEqual(['self_governing_decision']);
    expect(r.state.departmentFactions[GOV]).toBe('a');
    expect(r.state.departmentFactions[X]).toBeNull();
    expect(r.state.closedGovernments[Y]).toBe(3);
  });

  it('a region held by a self-governing government passes only to another department of its kind and its polity', () => {
    // A nation's own rival government (same kind, same polity) may hold the region.
    expect(regionMoveProblem(WORLD, X, X2)).toBeNull();
    // Another nation's government (same kind, another polity) may not: one people's land never passes to another's.
    expect(regionMoveProblem(WORLD, X, Y)).toContain('passes only to a government of its own people (polity xfolk), not to neutral_nation_y (polity yfolk)');
    // Nor a side's government, an ordinary government, or no known government.
    expect(regionMoveProblem(WORLD, X, DEP('a_war'))).toContain('passes only to another department of its kind and polity');
    expect(regionMoveProblem(WORLD, X, GOV)).toContain('passes only to another department of its kind and polity');
    expect(regionMoveProblem(WORLD, X, 'unknown')).toContain('passes only to another department of its kind and polity');
    // An ordinary government's regions, and a region of unknown government, are not this rule's.
    expect(regionMoveProblem(WORLD, GOV, DEP('a_war'))).toBeNull();
    expect(regionMoveProblem(WORLD, 'unknown', X)).toBeNull();
  });
});

describe('end to end through the tick', () => {
  const sit = (id: string, kind: 'decision' | 'notice', field: typeof DEPARTMENT_SIDE_FIELD | typeof GOVERNMENT_CLOSED_FIELD): SituationDef => {
    const propose = { owner: 'command', field, subject: X as string, delta: 1, reason: 'treaty', side: field === DEPARTMENT_SIDE_FIELD ? F('a') : null };
    const base: SituationDef = {
      id: toId('situation', id),
      kind: 'decision',
      faction: F('a'),
      title: `situation.${id}.title`,
      text: `situation.${id}.text`,
      earliest: '1900-06-01',
      event: { dayAtLeast: 2 },
      knowledge: null,
      railroad: 'test fixture',
      chain: null,
      subjects: [],
      options: [{ id: 'sign', label: `situation.${id}.option.sign`, displayKey: 1, proposedBy: [PER('a_gen')], group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, effects: [{ propose }], lockedCosts: [], orders: [], honours: [], watched: false, policy: null, gate: null }],
      inaction: { text: `situation.${id}.inaction`, effects: [], policy: null },
      historicalDefault: { options: ['sign'] },
      staffLine: { authors: [P('a_office')], recommends: ['sign'], reasons: [], confidence: 600 },
      delegableTo: [],
      resurfaceOn: [],
      effects: [],
      report: null,
      gate: { none: 'test fixture' },
      gateReview: null,
      citations: [],
    };
    if (kind === 'decision') return base;
    return { ...base, kind: 'notice', options: [], inaction: null, historicalDefault: null, staffLine: null, report: { authors: [P('a_office')], reportType: 'informal', subtype: 'cabinet-word' }, effects: [{ propose }] };
  };
  const play = (situation: SituationDef) => {
    const world = indexSeatsWorld(WORLD, START, { situations: [situation] });
    let state = createState(world, { seed: 1 });
    const refused: string[] = [];
    const changed: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = tick(world, state, [], { freeze: true, deepChecks: true });
      for (const e of r.mapEvents) {
        if (e.event === 'proposal_refused') refused.push(`${r.day}:${e.reason}`);
        if (e.event === 'side_changed') changed.push(`${r.day}:${e.change.department}->${e.change.to}`);
        if (e.event === 'government_changed') changed.push(`${r.day}:${e.change}:${e.department}`);
      }
      state = r.state;
    }
    return { state, refused, changed };
  };

  it('a decision option that would sign a nation over is refused, reported with its reason, and the nation stays its own', () => {
    const run = play(sit('treaty_decision', 'decision', DEPARTMENT_SIDE_FIELD));
    expect(run.refused).toEqual(['2:self_governing_decision']);
    expect(run.changed).toEqual([]);
    expect(run.state.departmentFactions[X]).toBeNull();
  });

  it('a decision option that would close a nation land is refused too', () => {
    const run = play(sit('closing_decision', 'decision', GOVERNMENT_CLOSED_FIELD));
    expect(run.refused).toEqual(['2:self_governing_decision']);
    expect(run.state.closedGovernments).toEqual({});
  });

  it('a notice, the nation own act, changes its side and passes (positive control)', () => {
    const run = play(sit('treaty_notice', 'notice', DEPARTMENT_SIDE_FIELD));
    expect(run.refused).toEqual([]);
    expect(run.changed).toEqual([`2:${X}->a`]);
    expect(run.state.departmentFactions[X]).toBe('a');
  });
});
