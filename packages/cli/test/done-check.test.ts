import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { compareSummaries } from '../../../tools/compare-runs.ts';
import {
  behaviourProblems,
  budgetProblems,
  evaluateDoneCheck,
  hashProblems,
  livenessProblems,
  MECHANICS_RUN,
  resumeProblems,
  runDoneCheck,
  SECTION_TEN_TESTS,
  sectionTenProblems,
  TICK_BUDGET_MS,
  type DoneCheckResult,
  type DoneRun,
} from '../src/done-check.ts';
import { measureDrafting } from '../src/drafting-measure.ts';
import { REFERENCE_RUNS } from '../src/liveness-gate.ts';
import { phase0Run, type Phase0Summary } from '../src/phase0-run.ts';
import { TIMING } from '../../kernel/test/support/timing.ts';

/**
 * The Phase 0 done check (FOUNDATION section 12; lane 0.8, step 5): a headless run on the new kernel, on
 * the Union 1861 map and order of battle, with rule seats giving goals and commanders drafting plans, moves divisions, changes
 * control through battles and occupation and derives fronts, pockets and supply; its hash does not depend on how
 * it is run; it resumes to the same final hash; every mechanic is alive or quiet for a reason; the section 10
 * tests stand; and the tick stays inside its budget. Each criterion has a positive control below.
 */
let result: DoneCheckResult;
beforeAll(() => {
  result = runDoneCheck();
});

const union = () => result.runs.find((r) => r.checked.pack === 'union-1861')!;
const testbed = () => result.runs.find((r) => r.checked.pack === 'testbed')!;

describe('the done check on union-1861 at war and the testbed', () => {
  it('passes every criterion but the budget, which is a stopwatch', () => {
    for (const c of result.criteria) if (c.id !== 'budget') expect(c.problems, c.id).toEqual([]);
    expect(result.criteria.map((c) => c.id)).toEqual(['behaviour', 'hash', 'resume', 'liveness', 'section-ten', 'budget']);
  });

  // Wall clock: runs only with MANDATE_TIMING=1 (lane 1.0t; CI's Linux job sets it, the pre-commit hook does not).
  // `npm run run:done-check` always measures the budget; its logic is tested below on given timings.
  it.runIf(TIMING)('stays inside the tick budget on this machine, so the whole check passes (wall clock: MANDATE_TIMING=1)', () => {
    expect(result.criteria.find((c) => c.id === 'budget')!.problems).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it('runs about 75 days of the Union pack at war, with rule seats giving orders', () => {
    const s = union().checked;
    expect(s.atWar).toBe(true);
    expect(s.finalDay).toBe(75);
    expect(s.logEntries).toBeGreaterThan(0);
    expect(s.rejections).toBe(0);
  });

  it('says the Union run is a mechanics run whose outcome is not a war; the testbed line says nothing of the kind (0072)', () => {
    const behaviour = result.criteria.find((c) => c.id === 'behaviour')!;
    expect(behaviour.evidence.find((e) => e.startsWith(union().name))).toContain(MECHANICS_RUN);
    expect(MECHANICS_RUN).toContain('its outcome is not a war');
    expect(behaviour.evidence.find((e) => e.startsWith(testbed().name))).not.toContain(MECHANICS_RUN);
  });

  it('hashes every day in the checked run, and the timed run hashes none but the last', () => {
    expect(union().checked.turns).toHaveLength(75);
    expect(testbed().checked.turns).toHaveLength(120);
    expect(union().timed.turns.map((t) => t.turn)).toEqual([75]);
    expect(union().timed.timing!.days).toBe(75);
  });

  it('writes summaries two machines can compare, and a planted divergence is the first thing it names', () => {
    const a = union().checked;
    expect(compareSummaries(a, union().repeat)).toEqual([]);
    const planted: Phase0Summary = { ...a, turns: a.turns.map((t) => (t.turn === 40 ? { ...t, hash: '0'.repeat(64) } : t)), finalHash: '0'.repeat(64) };
    expect(compareSummaries(a, planted).join('\n')).toContain('first diverging turn: 40');
    // The clock is never part of what two machines compare.
    const otherClock: Phase0Summary = { ...a, timing: { unit: 'ms', days: 1, median: 1, p95: 1, max: 1 } };
    expect(compareSummaries(a, otherClock)).toEqual([]);
  });

  it('measures what a day of plan drafting costs on the Union graph, with sound drafts', () => {
    const d = measureDrafting('union-1861', { days: 3, reps: 2 });
    expect(d.sound).toBe(true);
    // Every held post that commands a block (a vacant post has nobody to plan; lane 1.2's inputs are built from State).
    expect(d.posts).toBeGreaterThanOrEqual(20);
    expect(d.cappedDay.cap).toBe(3);
    expect(d.posts - d.noLandForce).toBeGreaterThanOrEqual(15);
    expect(d.day.worst).toBeGreaterThanOrEqual(d.day.median);
  });
});

describe('each criterion can fail (positive controls)', () => {
  it('behaviour: the Union pack at peace moves nothing and fights nothing', () => {
    const peace = phase0Run({ pack: 'union-1861', days: 30, atWar: false, checks: false, replay: false, hash: 'checkpoints', checkpointEvery: 15 });
    const problems = behaviourProblems(peace);
    expect(problems.join('\n')).toContain('no division moved (movement.leg_started is 0)');
    expect(problems.join('\n')).toContain('control never changed through battle or occupation');
    expect(problems.join('\n')).toContain("goals did nothing");
    // And a run whose last checkpoint shows no front, no supply and no pocket anywhere.
    const s = union().checked;
    const bare: Phase0Summary = { ...s, checkpoints: s.checkpoints.map((c) => ({ ...c, scores: { ...c.scores, factions: c.scores.factions.map((f) => ({ ...f, frontSegments: 0, supplied: 0, pockets: 0 })) } })) };
    const bareProblems = behaviourProblems(bare).join('\n');
    expect(bareProblems).toContain('has no front');
    expect(bareProblems).toContain('has no supplied region');
    expect(bareProblems).toContain('no pocket was derived');
  });

  it('hash: a repeat run that diverges on one day, or a timed run that ends elsewhere, is named', () => {
    const run = union();
    expect(hashProblems(run)).toEqual([]);
    const diverged: DoneRun = { ...run, repeat: { ...run.repeat, turns: run.repeat.turns.map((t) => (t.turn === 33 ? { ...t, hash: 'f'.repeat(64) } : t)) } };
    expect(hashProblems(diverged).join('\n')).toContain('diverges at day 33');
    expect(hashProblems({ ...run, timed: { ...run.timed, finalHash: 'f'.repeat(64) } }).join('\n')).toContain('the timed run (no hashing, no freezing) ends on another hash');
    expect(hashProblems({ ...run, checked: { ...run.checked, hashMode: 'checkpoints' } }).join('\n')).toContain('did not hash every day');
  });

  it('resume: a resume that ends elsewhere, a save its log does not make, a replay that differs, or no resume at all', () => {
    const run = union();
    expect(resumeProblems(run)).toEqual([]);
    const r = run.checked.resume!;
    expect(resumeProblems({ ...run, checked: { ...run.checked, resume: { ...r, matches: false, finalHash: 'f'.repeat(64) } } }).join('\n')).toContain('resumed from day 30');
    expect(resumeProblems({ ...run, checked: { ...run.checked, resume: { ...r, savedLogReplays: false } } }).join('\n')).toContain('does not replay to the saved State');
    expect(resumeProblems({ ...run, checked: { ...run.checked, replay: { matches: false, firstDifferentDay: 12 } } }).join('\n')).toContain('from day 12');
    expect(resumeProblems({ ...run, checked: { ...run.checked, resume: null } })).toEqual([`${run.name}: no mid-run save was resumed`]);
  });

  it('liveness: a planted dead mechanic in a reference run fails the check', () => {
    const run = union();
    const reference = REFERENCE_RUNS.find((x) => x.name === 'union-1861 at war, 75 days')!;
    expect(livenessProblems(reference, run.checked.liveness)).toEqual([]);
    const planted = run.checked.liveness.map((row) => (row.mechanic === 'movement.arrived' ? { ...row, fires: 0, magnitude: 0 } : row));
    expect(livenessProblems(reference, planted)).toEqual([expect.stringContaining('movement.arrived is dead (0 fires')]);
    // The whole check reports it, under the liveness criterion and no other.
    const doctored: DoneRun = { ...run, checked: { ...run.checked, liveness: planted } };
    const exercises = Object.fromEntries(REFERENCE_RUNS.filter((x) => x.kind === 'exercise').map((x) => [x.name, [] as Phase0Summary['liveness']]));
    const criteria = evaluateDoneCheck({ runs: [doctored, testbed()], exercises });
    expect(criteria.find((c) => c.id === 'liveness')!.problems.join('\n')).toContain('movement.arrived is dead');
  });

  it('section ten: a deleted test file, a skipped test and a thinned file are each named', () => {
    expect(sectionTenProblems()).toEqual([]);
    const root = `${mkdtempSync(join(tmpdir(), 'mandate-done-check-'))}/`;
    mkdirSync(join(root, 'packages/kernel/test'), { recursive: true });
    const many = (n: number, extra = '') => `${Array.from({ length: n }, (_, i) => `  it('t${i}', () => {});`).join('\n')}\n${extra}`;
    for (const t of SECTION_TEN_TESTS) writeFileSync(join(root, t.file), many(t.least));
    expect(sectionTenProblems(root)).toEqual([]);
    writeFileSync(join(root, SECTION_TEN_TESTS[1]!.file), many(SECTION_TEN_TESTS[1]!.least, "  it.skip('later', () => {});"));
    writeFileSync(join(root, SECTION_TEN_TESTS[2]!.file), many(1));
    const problems = sectionTenProblems(root).join('\n');
    expect(problems).toContain('skips or defers a test');
    expect(problems).toContain('has 1 tests');
    const gone = `${mkdtempSync(join(tmpdir(), 'mandate-done-check-'))}/`;
    expect(sectionTenProblems(gone)).toHaveLength(SECTION_TEN_TESTS.length);
    expect(sectionTenProblems(gone)[0]).toContain('is gone');
  });

  it('budget: a tick over the budget, or a slow tail, fails', () => {
    const run = union();
    const slow = (median: number, p95: number): DoneRun => ({ ...run, timed: { ...run.timed, timing: { unit: 'ms', days: 75, median, p95, max: p95 * 2 } } });
    // Given timings, not this machine's stopwatch (lane 1.0t; lane 1.13): the real run's budget is the MANDATE_TIMING test above.
    expect(budgetProblems(slow(10, 20))).toEqual([]);
    expect(budgetProblems(slow(TICK_BUDGET_MS * 2, TICK_BUDGET_MS * 2)).join('\n')).toContain('over the 40 ms budget');
    expect(budgetProblems(slow(10, TICK_BUDGET_MS * 5)).join('\n')).toContain('p95');
    expect(budgetProblems({ ...run, timed: { ...run.timed, timing: null } })).toEqual([`${run.name}: the timed run took no timings`]);
  });
});
