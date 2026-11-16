import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { phase0, type ids } from '@mandate/kernel';
import type { Checkpoint, Checkpoints } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';
import { toId } from '../../kernel/src/ids.ts';
import { F, indexedFixture, P, POST } from '../../kernel/test/support/seats-fixture.ts';
import { checkpointScore, checkpointsScore, dayOfDate, historyDays, operationScore, pushbackScore, unknownStrengthScore, type Observations, type Snapshot } from '../src/history-run.ts';
import { runSweep, sweepScore, type SweepResult } from '../src/lever-sweep.ts';
import { labelsIn, m2CarriedValues, PHASE0_STAND_INS, standInReport } from '../src/stand-ins.ts';
import { victoryOf } from '../src/victory.ts';

/**
 * 1A's done-check harness (FOUNDATION section 12; lane 1.14, Part A). Each scorer is a pure function of a run's
 * observations and the pack's bands, so each has a positive control here on doctored observations; the stand-in check
 * reads a planted tree; the lever sweep runs on the seats fixture. The terms are the testbed's and the fixture's.
 */
const START = '1861-03-05';
const DATE = '1861-03-15';
const DAY = dayOfDate(START, DATE);

const snapshot = (over: Partial<Snapshot> = {}): Snapshot => ({
  day: DAY,
  sides: { st_one: 'south', st_two: 'south', st_three: null, st_four: 'north', ex_office: 'south' },
  kinds: { st_one: 'state_government', st_two: 'state_government', st_three: 'state_government', st_four: 'state_government', ex_office: 'executive' },
  men: { north: { known: 120000, unknownBlocks: 0 }, south: { known: 30000, unknownBlocks: 2 } },
  holders: { capital_north: 'north' },
  ...over,
});

const side = (faction: string, over: Partial<phase0.BattleSide> = {}): phase0.BattleSide =>
  ({ bsideFaction: faction, bsideUnknown: [], bsideKw: 10, bsideKwParts: [{ btermKind: 'base', btermValue: 10, btermSource: null }], ...over }) as unknown as phase0.BattleSide;

const battle = (over: Partial<phase0.BattleRecord> = {}, sides: readonly phase0.BattleSide[] = [side('north'), side('south')]): phase0.BattleRecord => ({
  battleRegion: toId('region', 'river_crossing'),
  battleStartDay: 5,
  battleEndDay: 6,
  battleFactions: [F('north'), F('south')],
  battleCauses: [POST('n_army')],
  battleDays: [{ bdayDay: 5, bdayNumber: 1, bdayType: 'meeting', bdayAttacker: null, bdayFrontage: 1000, bdayContact: 1000, bdayDraws: 0, bdaySides: sides } as unknown as phase0.BattleDay],
  ...over,
});

const operation = (over: Partial<phase0.OperationRecord> = {}): phase0.OperationRecord => ({ opPost: POST('n_army'), opStartDay: 2, opEndDay: null, opMethod: 'direct', opObjective: toId('region', 'river_crossing'), ...over }) as unknown as phase0.OperationRecord;

const observations = (over: Partial<Observations> = {}): Observations => ({
  battles: new Map(),
  operations: new Map(),
  responses: [],
  snapshots: new Map([[DAY, snapshot()]]),
  notHeld: new Map(),
  unpaidFloors: [],
  warSince: { north: 3, south: 2 },
  lastDay: DAY,
  ...over,
});

const cite = 'a sourced research note, its section and pages';
const bands = (checkpoints: Checkpoint[], pushback: Checkpoints['pushback'] = []): Checkpoints => ({ checkpoints, pushback, victory: { capital: 1000, government: 100, menShare: 1, groundShare: 1, cite } });

describe('checkpoints (1A: bands sourced before the run, scored from it)', () => {
  it('counts the run’s days from the start’s date, and plays to the last date any band reads', () => {
    expect(dayOfDate('1861-03-05', '1861-07-31')).toBe(148);
    expect(historyDays(bands([{ id: 'a', kind: 'held', date: DATE, region: 'capital_north', faction: 'north', throughout: false, cite } as Checkpoint], [{ id: 'p', name: 'p', count: { mechanic: 'orders.relay_held' }, through: '1861-04-01', min: 0, max: null, cite }]), START)).toBe(27);
  });

  it('a side-set is exact: one too many, or one missing, is named', () => {
    const k = { id: 'seceded', kind: 'side-set', date: DATE, faction: 'south', departmentKinds: ['state_government'], exactly: ['st_one', 'st_two'], cite } as Checkpoint;
    expect(checkpointScore(k, observations(), START).problems).toEqual([]);
    const more = observations({ snapshots: new Map([[DAY, snapshot({ sides: { ...snapshot().sides, st_three: 'south' } })]]) });
    expect(checkpointScore(k, more, START).problems.join('\n')).toContain('beyond the band: st_three');
    const fewer = observations({ snapshots: new Map([[DAY, snapshot({ sides: { ...snapshot().sides, st_two: null } })]]) });
    expect(checkpointScore(k, fewer, START).problems.join('\n')).toContain('not on the south side: st_two');
    // A department of a kind the set does not count is never an extra.
    expect(checkpointScore(k, observations(), START).problems.join('\n')).not.toContain('ex_office');
  });

  it('a government’s side: the wrong side, a neutral one, and a government the pack lacks (a data gap) each fail', () => {
    const k = (departments: string[], s: string | null) => ({ id: 'side_x', kind: 'government-side', date: DATE, name: 'the fourth state', departments, side: s, cite }) as Checkpoint;
    expect(checkpointScore(k(['st_four'], 'north'), observations(), START).problems).toEqual([]);
    expect(checkpointScore(k(['st_three'], null), observations(), START).problems).toEqual([]);
    expect(checkpointScore(k(['st_three'], 'north'), observations(), START).problems.join('\n')).toContain('should be north: st_three is neutral');
    expect(checkpointScore(k([], 'north'), observations(), START).problems.join('\n')).toContain('no government in the pack stands for the fourth state (a data gap');
  });

  it('a region held throughout fails on any day it was not', () => {
    const k = { id: 'held', kind: 'held', date: DATE, region: 'capital_north', faction: 'north', throughout: true, cite } as Checkpoint;
    expect(checkpointScore(k, observations({ notHeld: new Map([['held', []]]) }), START).problems).toEqual([]);
    expect(checkpointScore(k, observations({ notHeld: new Map([['held', [4, 5]]]) }), START).problems.join('\n')).toContain('not held by north on 2 days (first day 4)');
    const lost = observations({ snapshots: new Map([[DAY, snapshot({ holders: { capital_north: 'south' } })]]) });
    expect(checkpointScore(k, lost, START).problems.join('\n')).toContain('held by south, not north');
  });

  it('men: above the band fails; below fails only where the floor is binding, and is reported where it is not', () => {
    const k = (min: number, max: number | null, floorBinding: boolean) => ({ id: 'men', kind: 'men', date: DATE, faction: 'south', min, max, floorBinding, cite }) as Checkpoint;
    expect(checkpointScore(k(20000, 40000, true), observations(), START).problems).toEqual([]);
    expect(checkpointScore(k(50000, null, true), observations(), START).problems.join('\n')).toContain('30000 men, below 50000');
    const soft = checkpointScore(k(50000, null, false), observations(), START);
    expect(soft.problems).toEqual([]);
    expect(soft.evidence.join('\n')).toContain('reported and not failed');
    expect(checkpointScore(k(0, 20000, true), observations(), START).problems.join('\n')).toContain('above 20000');
    expect(checkpointScore(k(0, null, true), observations(), START).evidence.join('\n')).toContain('2 blocks of unknown strength');
  });

  it('planned operations fought: an operation counts when its post caused a battle while it ran', () => {
    const k = (min: number, max: number | null) => ({ id: 'ops', kind: 'operations-fought', date: DATE, faction: 'north', min, max, cite }) as Checkpoint;
    const fought = observations({ operations: new Map([['op:1', { record: operation(), faction: 'north' }]]), battles: new Map([['battle:1', battle()]]) });
    expect(checkpointScore(k(1, 1), fought, START).problems).toEqual([]);
    expect(checkpointScore(k(1, null), observations({ operations: fought.operations }), START).problems.join('\n')).toContain('fought 0 planned operations, below 1');
    // A battle before the operation began, or after it ended, is not its battle.
    const ended = observations({ operations: new Map([['op:1', { record: operation({ opStartDay: 1, opEndDay: 3 }), faction: 'north' }]]), battles: fought.battles });
    expect(checkpointScore(k(1, null), ended, START).problems.join('\n')).toContain('below 1');
    expect(checkpointScore(k(0, 0), fought, START).problems.join('\n')).toContain('above 0');
  });

  it('a run that stops short of a checkpoint fails it, and so does a run started at war or a side never at war (0066)', () => {
    const k = { id: 'held', kind: 'held', date: DATE, region: 'capital_north', faction: 'north', throughout: false, cite } as Checkpoint;
    expect(checkpointScore(k, observations({ snapshots: new Map(), lastDay: 3 }), START).problems.join('\n')).toContain('did not reach the checkpoint (it ended on day 3)');
    expect(checkpointsScore(bands([k]), observations(), START, false).problems).toEqual([]);
    expect(checkpointsScore(bands([k]), observations(), START, true).problems.join('\n')).toContain('started at war by the labelled option');
    expect(checkpointsScore(bands([k]), observations({ warSince: { north: 3, south: null } }), START, false).problems.join('\n')).toContain('south is not at war');
  });
});

describe('the operation criterion, pushback bands and unknown strength', () => {
  it('needs an operation that fought, with a breakdown whose parts sum to its losses', () => {
    expect(operationScore(observations()).problems.join('\n')).toContain('no operation fought a battle');
    const ops = new Map([['op:1', { record: operation(), faction: 'north' }]]);
    expect(operationScore(observations({ operations: ops, battles: new Map([['battle:1', battle()]]) })).problems).toEqual([]);
    const broken = battle({}, [side('north', { bsideKw: 11 }), side('south')]);
    expect(operationScore(observations({ operations: ops, battles: new Map([['battle:1', broken]]) })).problems.join('\n')).toContain('loss breakdown');
  });

  it('counts a mechanic by day through its date, and the addressees’ answers by rung; outside its band, or an undeclared mechanic, fails', () => {
    const c = bands([], [
      { id: 'holds', name: 'relay holds', count: { mechanic: 'orders.relay_held' }, through: DATE, min: 2, max: 3, cite },
      { id: 'objections', name: 'objections to a plan', count: { response: 'object' }, through: DATE, min: 1, max: 1, cite },
    ]);
    const daily = [{ day: 1, fires: { 'orders.relay_held': 1 } }, { day: DAY, fires: { 'orders.relay_held': 1 } }, { day: DAY + 1, fires: { 'orders.relay_held': 9 } }];
    const declared = new Set(['orders.relay_held']);
    const one = observations({ responses: [{ key: 'm1|p1', actual: 'object', day: 2 }, { key: 'm2|p1', actual: 'slow_walk', day: 3 }, { key: 'm3|p2', actual: 'object', day: DAY + 2 }] });
    expect(pushbackScore(c, one, daily, START, declared).problems).toEqual([]);
    expect(pushbackScore(c, observations(), daily.slice(0, 1), START, declared).problems).toEqual(["relay holds: 1, below the record's 2", "objections to a plan: 0, below the record's 1"]);
    const many = observations({ responses: [...one.responses, { key: 'm4|p3', actual: 'object', day: 4 }] });
    expect(pushbackScore(c, many, daily, START, declared).problems).toEqual(['objections to a plan: 2, above 1']);
    expect(pushbackScore(c, one, daily, START, new Set()).problems.join('\n')).toContain('orders.relay_held, which no mechanic declares');
  });

  it('names every battle-day on which a side fought with blocks of unknown strength', () => {
    const clean = new Map([['battle:1', battle()]]);
    expect(unknownStrengthScore([{ name: 'run', battles: clean }]).problems).toEqual([]);
    const gap = new Map([['battle:1', battle({}, [side('north'), side('south', { bsideUnknown: [toId('forceBlock', 'fb_s_militia')] as never })])]]);
    expect(unknownStrengthScore([{ name: 'run', battles: gap }]).problems).toEqual(['run: battle battle:1 at river_crossing, day 5: south fought with 1 blocks of unknown strength (fb_s_militia)']);
  });
});

describe('the stand-ins (1A: the eight gone, any left labelled and owned by a 1B lane)', () => {
  const tree = (files: Record<string, string>): string => {
    const root = mkdtempSync(join(tmpdir(), 'mandate-stand-ins-'));
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(join(root, path, '..'), { recursive: true });
      writeFileSync(join(root, path), text);
    }
    return root;
  };

  it('reads a label’s key and owner', () => {
    expect(labelsIn('a.ts', '// STAND-IN(capital-objective; owner: lane 1.12; 0058): the capital.')).toEqual([{ file: 'a.ts', line: 1, key: 'capital-objective', owner: 'lane 1.12', text: '// STAND-IN(capital-objective; owner: lane 1.12; 0058): the capital.' }]);
    expect(labelsIn('a.ts', 'x\n/* STAND-IN (0072): old style */')[0]).toMatchObject({ line: 2, key: null, owner: null });
  });

  it('passes a tree where each of the eight is gone and the one stand-in left is owned by 1B', () => {
    const root = tree({ 'packages/k/src/a.ts': '// STAND-IN(owner: 1B, ships; 0064): ships eat nothing.\nexport const a = 1;\n' });
    const r = standInReport(root);
    expect(r.problems).toEqual([]);
    expect(r.evidence.filter((e) => e.includes('gone'))).toHaveLength(PHASE0_STAND_INS.length);
  });

  it('fails a label with no owner, one owned by a 1A lane, and a retired stand-in back unlabelled', () => {
    const root = tree({
      'packages/k/src/a.ts': '// STAND-IN (0072): no owner\n// STAND-IN(generic-principal; owner: lane 1.12): the generic principal\n',
      'packages/k/src/b.ts': 'export const contestPermille = 1;\n',
    });
    const problems = standInReport(root).problems.join('\n');
    expect(problems).toContain('packages/k/src/a.ts:1: a stand-in with no owner');
    expect(problems).toContain('packages/k/src/a.ts:2: a stand-in owned by lane 1.12, not a 1B lane (the generic rule-seat principal)');
    expect(problems).toContain('the simple contest is back, unlabelled, at packages/k/src/b.ts:1');
  });

  it('lists the pack values carried from M2 by their rule paths', () => {
    expect(m2CarriedValues({ politics: { drift: { divisor: 8, cite: "M2's blocReversionDivisor" }, framing: { cite: '[I]' }, papers: [{ cite: 'M2’s reach' }] } })).toEqual(['rules.politics.drift', 'rules.politics.papers[0]']);
  });
});

describe('the victory measure and the lever sweep (D6)', () => {
  const S = (id: string) => toId('situation', id) as ids.SituationId;
  const opt = (id: string, displayKey: number, honours: string[], watched = false): phase0.OptionDef => ({ id, label: `situation.crossers.option.${id}`, displayKey, proposedBy: [P('a_sec')], group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, effects: [], lockedCosts: [], orders: [], honours, watched, policy: null, gate: null });
  const CROSSERS: phase0.SituationDef = {
    id: S('crossers'),
    kind: 'decision',
    faction: F('a'),
    title: 'situation.crossers.title',
    text: 'situation.crossers.text',
    earliest: '1861-04-01',
    event: { dayAtLeast: 1 },
    knowledge: null,
    railroad: 'test fixture',
    chain: null,
    subjects: [],
    options: [opt('shelter', 1, ['caution']), opt('send_back', 2, ['glory'], true)],
    inaction: { text: 'situation.crossers.inaction', effects: [], policy: null },
    historicalDefault: { options: ['shelter'] },
    staffLine: { authors: [POST('a_office')], recommends: ['shelter'], reasons: [{ kind: 'momentum', weight: 600 }], confidence: 700 },
    delegableTo: [POST('a_office'), POST('a_reserve')],
    resurfaceOn: [],
    effects: [],
    report: null,
    gate: { none: 'test fixture' },
    gateReview: null,
    citations: [],
  };
  const world = indexedFixture({}, [CROSSERS]);
  const weights = { capital: 1000, government: 100, menShare: 1, groundShare: 1 };
  /** A score that reads what was chosen, so the test decides which move is best. */
  const favouring = (option: string | null) => (_w: phase0.SeatsWorld, end: phase0.TickResult) => {
    const chosen = end.state.situationStates[S('crossers')]?.sitChosen ?? [];
    return option === null ? (chosen.length === 0 ? 1 : 0) : chosen.includes(option) ? 1 : 0;
  };

  it('reads its four terms from the scores, each with its amount, and sums them', () => {
    const state = phase0.createState(world, { seed: 1 });
    const v = victoryOf(world, state, null, 'a', weights);
    expect(v.terms.map((t) => t.term)).toEqual(['capital', 'government', 'men', 'ground']);
    expect(v.value).toBe(v.terms.reduce((n, t) => n + t.amount, 0));
  });

  it('flags a watched option the bot finds best in more than a quarter of the seeds, and leaves it when it never is', () => {
    const run = (option: string | null, atrocity: ReadonlySet<string> = new Set()) => runSweep(world, { seeds: [1, 2, 3, 4], days: 3, horizonDays: 2, weights, atrocity, scoreOf: favouring(option) });
    const lever = run('send_back');
    expect(lever.decisionsWeighed).toBe(4);
    expect(lever.flagged.map((f) => [f.situation, f.choice, f.best, f.weighed])).toEqual([[S('crossers'), 'send_back', 4, 4]]);
    expect(sweepScore(lever).problems.join('\n')).toContain('watched option send_back is the a bot’s best choice in 4 of 4 seeds');
    const fine = run('shelter');
    expect(fine.flagged).toEqual([]);
    expect(fine.findings.map((f) => [f.choice, f.best])).toEqual([['send_back', 0]]);
  });

  it('reads an atrocity-class decision’s inaction as watched (0074)', () => {
    const r = runSweep(world, { seeds: [1, 2], days: 3, horizonDays: 2, weights, atrocity: new Set([S('crossers')]), scoreOf: favouring(null) });
    expect(r.flagged.map((f) => f.choice)).toEqual(['inaction']);
    expect(sweepScore(r).problems.join('\n')).toContain('inaction (an atrocity-class decision’s, read as watched, 0074)');
  });

  it('fails a sweep that weighed nothing, ran no recruitment, or met an unpaid floor (0082)', () => {
    const empty: SweepResult = { seeds: 8, findings: [], flagged: [], unpaid: [], recruitmentCalls: 0, decisionsWeighed: 0 };
    const problems = sweepScore(empty).problems.join('\n');
    expect(problems).toContain('weighed nothing');
    expect(problems).toContain('recruitment active');
    const breach: SweepResult = { ...empty, decisionsWeighed: 1, recruitmentCalls: 2, unpaid: [{ seed: 3, day: 40, rule: 'floor_unpaid:policy:return', where: 'the base run' }] };
    expect(sweepScore(breach).problems).toEqual(['seed 3, day 40: floor_unpaid:policy:return in the base run, a breach of the watched option’s floor (0082)']);
  });
});
