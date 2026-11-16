/**
 * The Phase 0 done check (FOUNDATION section 12; lane 0.8). Phase 0 is done when a headless run on the new
 * kernel, on the Union 1861 map and order of battle, with rule seats giving goals and their commanders drafting plans:
 *  1. moves divisions, changes control through battles and occupation (lane 1.3), and derives fronts, pockets and supply;
 *  2. gives the same state hash on Linux and Windows CI;
 *  3. resumes from a mid-run save to the same final hash as the continuous run;
 *  4. passes the liveness gate for every Phase 0 mechanic;
 *  5. keeps the tests named in section 10 passing;
 *  6. stays inside the tick budget.
 *
 * `evaluateDoneCheck` is a pure function of the runs' summaries, so every criterion has a positive control
 * (a doctored summary it must reject). `runDoneCheck` makes the runs: the Union pack at war (the labelled
 * option, 0064: its war has no opening situation yet) and the testbed. The Linux and Windows comparison is the
 * CI determinism job's (`tools/compare-runs.ts` over the summaries this check writes); inside one process the
 * check proves what it can: a second run, with State frozen and without, gives the same hashes.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gateFailures, REFERENCE_RUNS, referenceRunFor, seatsNamed, type ReferenceRun } from './liveness-gate.ts';
import { phase0Run, type Phase0Summary } from './phase0-run.ts';

/** The tick's budget in ms a day (FOUNDATION section 9: a 1,460-day campaign in under a minute). */
export const TICK_BUDGET_MS = 40;
/** The slowest 5% of days may cost this many times the budget before the check fails (CI machines are noisy; this catches a regression, not jitter). */
export const TICK_P95_FACTOR = 4;

const REPO = fileURLToPath(new URL('../../../', import.meta.url));

/** Section 10: the tests that must keep passing through Phase 0, and the least each file may carry. */
export const SECTION_TEN_TESTS: readonly { readonly file: string; readonly least: number; readonly why: string }[] = [
  { file: 'packages/kernel/test/compliance.test.ts', least: 5, why: 'compliance' },
  { file: 'packages/kernel/test/rng.test.ts', least: 3, why: 'named seeded streams' },
  { file: 'packages/kernel/test/banned-apis.test.ts', least: 3, why: 'banned APIs, extended to every kernel folder' },
  { file: 'packages/kernel/test/audience.test.ts', least: 5, why: 'the M2 audience tests' },
];

export interface DoneRun {
  readonly name: string;
  /** The run with hashes every day, State frozen, the log replayed and a mid-run save resumed. */
  readonly checked: Phase0Summary;
  /** The same game again with State not frozen: the hashes must not depend on the checks. */
  readonly repeat: Phase0Summary;
  /** The same game with the clock on and no hashing: the tick's cost. */
  readonly timed: Phase0Summary;
}

export interface Criterion {
  readonly id: 'behaviour' | 'hash' | 'resume' | 'liveness' | 'section-ten' | 'budget';
  readonly text: string;
  readonly problems: readonly string[];
  readonly evidence: readonly string[];
}

/**
 * What a run started at war by the labelled option is (0072): the stand-in generic principals march their own
 * capitals' garrisons on each other's capitals, so it proves the machinery and its outcome is not a war.
 */
export const MECHANICS_RUN = ' (a mechanics run on stand-in principals: its outcome is not a war, 0072)';

const fires = (s: Phase0Summary, mechanic: string): number => s.liveness.find((r) => r.mechanic === mechanic)?.fires ?? 0;

/** Criterion 1, for one run: forces move, ground changes hands through battles and occupation, and the map phases derive. */
export function behaviourProblems(s: Phase0Summary): string[] {
  const problems: string[] = [];
  for (const m of ['movement.leg_started', 'movement.arrived']) if (fires(s, m) === 0) problems.push(`${s.pack}: no division moved (${m} is 0)`);
  // Ground changes hands through battles or occupation, and control changes (0075's criterion, lane 1.2; lane 1.3's battles
  // replaced the contest). Lane 1.2: the Union run's occupations came only from Phase 0's principal leaving Washington
  // empty; its garrison now holds, so Washington is fought for and little ground is occupied unopposed. Each run needs a
  // battle-day or an occupation, and a control change.
  if (fires(s, 'combat.battle_day') + fires(s, 'combat.occupation') === 0) problems.push(`${s.pack}: control never changed through battle or occupation (combat.battle_day and combat.occupation are 0)`);
  if (fires(s, 'control.changed') === 0) problems.push(`${s.pack}: control never changed through battle or occupation (control.changed is 0)`);
  for (const m of ['orders.obeyed', 'plans.goal_reached']) if (fires(s, m) === 0) problems.push(`${s.pack}: the rule seats' goals did nothing (${m} is 0)`);
  const last = s.checkpoints.at(-1);
  if (last === undefined) return [...problems, `${s.pack}: no checkpoint scores`];
  for (const f of last.scores.factions) {
    if (f.frontSegments === 0) problems.push(`${s.pack}: ${f.faction} has no front at day ${last.day}`);
    if (f.supplied === 0) problems.push(`${s.pack}: ${f.faction} has no supplied region at day ${last.day}`);
  }
  if (!s.checkpoints.some((c) => c.scores.factions.some((f) => f.pockets > 0))) problems.push(`${s.pack}: no pocket was derived at any checkpoint`);
  return problems;
}

/** Criterion 2, within one process: a second run (State not frozen) gives every hash again, and the timed run the final one. */
export function hashProblems(run: DoneRun): string[] {
  const problems: string[] = [];
  const { checked, repeat, timed } = run;
  if (checked.hashMode !== 'daily') problems.push(`${run.name}: the checked run did not hash every day`);
  if (checked.turns.length !== checked.finalDay) problems.push(`${run.name}: ${checked.turns.length} hashes for ${checked.finalDay} days`);
  if (repeat.worldHash !== checked.worldHash) problems.push(`${run.name}: the World hash differs between runs`);
  const first = checked.turns.findIndex((t, i) => t.hash !== repeat.turns[i]?.hash);
  if (first !== -1) problems.push(`${run.name}: the repeat run diverges at day ${checked.turns[first]!.turn}`);
  if (repeat.finalHash !== checked.finalHash) problems.push(`${run.name}: the repeat run ends on another hash`);
  if (timed.finalHash !== checked.finalHash) problems.push(`${run.name}: the timed run (no hashing, no freezing) ends on another hash`);
  return problems;
}

/** Criterion 3. */
export function resumeProblems(run: DoneRun): string[] {
  const { checked } = run;
  const problems: string[] = [];
  if (checked.resume === null) return [`${run.name}: no mid-run save was resumed`];
  if (!checked.resume.matches) problems.push(`${run.name}: resumed from day ${checked.resume.atTurn}, the run ends on ${checked.resume.finalHash}, not ${checked.finalHash}`);
  if (!checked.resume.savedLogReplays) problems.push(`${run.name}: the saved log does not replay to the saved State`);
  if (checked.replay === null) problems.push(`${run.name}: the log was not replayed`);
  else if (!checked.replay.matches) problems.push(`${run.name}: the log does not replay to every hash (from day ${checked.replay.firstDifferentDay})`);
  return problems;
}

/** Criterion 4, for a reference run and the liveness it was seen to have. */
export function livenessProblems(reference: ReferenceRun, liveness: Phase0Summary['liveness']): string[] {
  return gateFailures(reference, liveness).map((f) => `${reference.name}: ${f.mechanic} is ${f.problem} (${f.fires} fires${f.band ? `, band ${f.band.minFires}..${f.band.maxFires ?? 'any'}` : ''})`);
}

/** Criterion 5: each named test file exists, has at least its tests, and skips none. */
export function sectionTenProblems(root: string = REPO): string[] {
  const problems: string[] = [];
  for (const t of SECTION_TEN_TESTS) {
    const path = `${root}${t.file}`;
    if (!existsSync(path)) {
      problems.push(`${t.file} (${t.why}) is gone`);
      continue;
    }
    const text = readFileSync(path, 'utf8');
    const count = [...text.matchAll(/^\s*(?:it|test)(?:\.each\([^)]*\))?\s*\(/gm)].length;
    if (count < t.least) problems.push(`${t.file} (${t.why}) has ${count} tests, at least ${t.least} expected`);
    if (/\b(?:it|test|describe)\.(?:skip|todo)\b/.test(text)) problems.push(`${t.file} (${t.why}) skips or defers a test`);
  }
  return problems;
}

/** Criterion 6: the day's cost (requests, seats and tick; no hashing) against the budget. */
export function budgetProblems(run: DoneRun, budgetMs = TICK_BUDGET_MS): string[] {
  const t = run.timed.timing;
  if (t === null) return [`${run.name}: the timed run took no timings`];
  const problems: string[] = [];
  if (t.median > budgetMs) problems.push(`${run.name}: median ${t.median.toFixed(1)} ms a day, over the ${budgetMs} ms budget`);
  if (t.p95 > budgetMs * TICK_P95_FACTOR) problems.push(`${run.name}: p95 ${t.p95.toFixed(1)} ms a day, over ${TICK_P95_FACTOR} times the budget`);
  return problems;
}

export interface DoneCheckInput {
  readonly runs: readonly DoneRun[];
  /** Liveness of the exercise runs, by reference run name. */
  readonly exercises: Readonly<Record<string, Phase0Summary['liveness']>>;
  readonly root?: string;
}

export function evaluateDoneCheck(input: DoneCheckInput): Criterion[] {
  const { runs } = input;
  const livenessProblemsAll: string[] = [];
  const livenessEvidence: string[] = [];
  for (const run of runs) {
    const reference = referenceRunFor(run.checked.pack, run.checked.finalDay, run.checked.atWar);
    if (reference === undefined) livenessProblemsAll.push(`${run.name}: no reference run has these bands`);
    else {
      livenessProblemsAll.push(...livenessProblems(reference, run.checked.liveness));
      livenessEvidence.push(`${reference.name}: ${run.checked.liveness.length} mechanics inside their bands`);
    }
  }
  for (const reference of REFERENCE_RUNS.filter((r) => r.kind === 'exercise')) {
    const liveness = input.exercises[reference.name];
    if (liveness === undefined) livenessProblemsAll.push(`${reference.name}: the exercise run was not made`);
    else {
      livenessProblemsAll.push(...livenessProblems(reference, liveness));
      livenessEvidence.push(`${reference.name}: ${Object.keys(reference.bands).length} mechanics inside their bands`);
    }
  }
  const sectionTen = sectionTenProblems(input.root);
  return [
    {
      id: 'behaviour',
      text: 'rule seats giving goals, whose commanders draft and execute plans, move divisions, change control through battles and occupation (a battle-day or an occupation, and a control change), and derive fronts, pockets and supply',
      problems: runs.flatMap((r) => behaviourProblems(r.checked)),
      evidence: runs.map((r) => `${r.name}${r.checked.atWar ? MECHANICS_RUN : ''}: ${fires(r.checked, 'movement.arrived')} arrivals, ${fires(r.checked, 'combat.battle_day')} battle-days, ${fires(r.checked, 'control.changed')} control changes, ${r.checked.checkpoints.at(-1)?.scores.factions.map((f) => `${f.faction} ${f.frontSegments} front segments ${f.supplied} supplied ${f.pockets} pockets`).join('; ') ?? 'no checkpoint'}`),
    },
    {
      id: 'hash',
      text: 'the same state hash on every run, with State frozen or not (Linux against Windows is the CI determinism job, over the summaries this writes)',
      problems: runs.flatMap(hashProblems),
      evidence: runs.map((r) => `${r.name}: ${r.checked.turns.length} daily hashes, final ${r.checked.finalHash.slice(0, 16)}`),
    },
    {
      id: 'resume',
      text: 'a mid-run save, loaded, resumes to the continuous run’s final hash, and the log replays to every hash',
      problems: runs.flatMap(resumeProblems),
      evidence: runs.map((r) => (r.checked.resume ? `${r.name}: from day ${r.checked.resume.atTurn}, ${r.checked.resume.matches ? 'matches' : 'DIFFERS'}` : `${r.name}: not resumed`)),
    },
    { id: 'liveness', text: 'every Phase 0 mechanic is inside its band in the reference runs, or quiet for a stated reason', problems: livenessProblemsAll, evidence: livenessEvidence },
    {
      id: 'section-ten',
      text: 'the tests named in FOUNDATION section 10 are present and none is skipped (that they pass is the suite’s)',
      problems: sectionTen,
      evidence: SECTION_TEN_TESTS.map((t) => t.file),
    },
    {
      id: 'budget',
      text: `the day's cost stays inside the ${TICK_BUDGET_MS} ms tick budget (median), and its slowest days inside ${TICK_P95_FACTOR} times it (p95)`,
      problems: runs.flatMap((r) => budgetProblems(r)),
      evidence: runs.map((r) => (r.timed.timing ? `${r.name}: median ${r.timed.timing.median.toFixed(2)} ms, p95 ${r.timed.timing.p95.toFixed(2)} ms, max ${r.timed.timing.max.toFixed(2)} ms` : `${r.name}: no timings`)),
    },
  ];
}

export interface DoneCheckRunSpec {
  readonly name: string;
  readonly pack: string;
  readonly days: number;
  readonly atWar: boolean;
  readonly resumeAt: number;
}

/** The runs the done check makes: the Union pack from 5 March to 31 July, its war opened by each side's own decision (lane 1.11), and the testbed. */
export const DONE_CHECK_RUNS: readonly DoneCheckRunSpec[] = [
  { name: 'union-1861, war by decision, 148 days', pack: 'union-1861', days: 148, atWar: false, resumeAt: 60 },
  { name: 'testbed, 120 days', pack: 'testbed', days: 120, atWar: false, resumeAt: 40 },
];

export interface DoneCheckResult {
  readonly criteria: readonly Criterion[];
  readonly runs: readonly DoneRun[];
  readonly passed: boolean;
}

/** Make the runs and evaluate them. `onChecked` sees each checked run's summary, to write it for the cross-machine comparison. */
export function runDoneCheck(options: { readonly onChecked?: (summary: Phase0Summary, saves: ReadonlyMap<number, string>) => void } = {}): DoneCheckResult {
  const runs: DoneRun[] = DONE_CHECK_RUNS.map((spec) => {
    const saves = new Map<number, string>();
    const checked = phase0Run({ pack: spec.pack, days: spec.days, atWar: spec.atWar, hash: 'daily', resumeAtDay: spec.resumeAt, onSave: (text, day) => saves.set(day, text) });
    options.onChecked?.(checked, saves);
    const repeat = phase0Run({ pack: spec.pack, days: spec.days, atWar: spec.atWar, hash: 'daily', checks: false, replay: false });
    const timed = phase0Run({ pack: spec.pack, days: spec.days, atWar: spec.atWar, hash: 'checkpoints', checkpointEvery: spec.days, timings: true, replay: false });
    return { name: spec.name, checked, repeat, timed };
  });
  const exercises: Record<string, Phase0Summary['liveness']> = {};
  for (const reference of REFERENCE_RUNS.filter((r) => r.kind === 'exercise')) {
    exercises[reference.name] = phase0Run({ pack: reference.pack, days: reference.days, atWar: reference.atWar, seats: seatsNamed(reference.seats), checks: false, replay: false, hash: 'checkpoints', checkpointEvery: reference.days }).liveness;
  }
  const criteria = evaluateDoneCheck({ runs, exercises });
  return { criteria, runs, passed: criteria.every((c) => c.problems.length === 0) };
}
