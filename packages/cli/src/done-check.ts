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
import { atrocityDecisions, errorsOf, formatIssue, loadPack, type Checkpoints, type PushbackRegister } from '@mandate/pack-format';
import { coverageScore } from './pushback-coverage.ts';
import { checkpointsScore, dayOfDate, historyDays, observeRun, operationScore, pushbackScore, unknownStrengthScore, type Observations } from './history-run.ts';
import { runSweep, sweepScore, type SweepResult } from './lever-sweep.ts';
import { gateFailures, REFERENCE_RUNS, referenceRunFor, seatsNamed, type ReferenceRun } from './liveness-gate.ts';
import { packFilesAt, packRoot, v2Packs } from './pack-files.ts';
import { phase0Run, type Phase0Summary } from './phase0-run.ts';
import { seatsMechanics, seatsWorld } from './seats-world.ts';
import { m2CarriedValues, standInReport } from './stand-ins.ts';

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
  // Lane 1.13: M2's `audience.test.ts` retired with M2; lane 1.5 recast its nine cases on the new State, one for one
  // ("M2’s audience cases on the new State"), so the check reads them there.
  { file: 'packages/kernel/test/people-verbs.test.ts', least: 9, why: 'the M2 audience tests, recast on the new State (lane 1.5)' },
];

export interface DoneRun {
  readonly name: string;
  /** The run with hashes every day, State frozen, the log replayed and a mid-run save resumed. */
  readonly checked: Phase0Summary;
  /** The same game again with State not frozen: the hashes must not depend on the checks. */
  readonly repeat: Phase0Summary;
  /** The same game with the clock on and no hashing: the tick's cost. */
  readonly timed: Phase0Summary;
  /** The battles the repeat run saw (lane 1.14: 1A's unknown-strength criterion reads every run). */
  readonly battles?: Observations['battles'];
}

/**
 * 1A's history run (FOUNDATION section 12; lane 1.14): a pack with done-check bands, from its start to its last
 * checkpoint date with its own peace and war, observed, timed, and swept by the victory-only bot.
 */
export interface HistoryRun {
  readonly pushbackRegisters?: readonly PushbackRegister[];
  readonly name: string;
  readonly pack: string;
  readonly startDate: string;
  readonly checkpoints: Checkpoints;
  readonly summary: Phase0Summary;
  readonly observations: Observations;
  readonly timed: Phase0Summary;
  readonly sweep: SweepResult | null;
}

/** Phase 0's six criteria, and 1A's, which `run:done-check` reports beside them (lane 1.14). */
export type CriterionId = 'behaviour' | 'hash' | 'resume' | 'liveness' | 'section-ten' | 'budget' | 'checkpoints' | 'operation' | 'pushback' | 'unknown-strength' | 'stand-ins' | 'lever-sweep';

export interface Criterion {
  readonly id: CriterionId;
  /** Phase 0's criteria decide the exit status; 1A's are measured and reported until the lead makes them binding. */
  readonly milestone: 'phase0' | '1A';
  readonly text: string;
  readonly problems: readonly string[];
  readonly evidence: readonly string[];
}

/** 1A's criteria, in the order `run:done-check` reports them. */
export const MILESTONE_1A: readonly CriterionId[] = ['checkpoints', 'operation', 'pushback', 'unknown-strength', 'stand-ins', 'lever-sweep'];

/**
 * The systems the budget must be measured with running (FOUNDATION section 12, 1A: the tick budget re-measured with the
 * planner, people and situations running): a mechanic of each that some timed run fired.
 */
export const BUDGET_SYSTEMS: readonly { readonly system: string; readonly mechanic: string }[] = [
  { system: 'the planner', mechanic: 'plans.drafted' },
  { system: 'people', mechanic: 'ladder.moved' },
  { system: 'situations', mechanic: 'situations.fired' },
];

/**
 * What a run started at war by the labelled option is (0072). Lane 1.12 retired the stand-in generic principals: the
 * rule-seat principals do their doctrine's historical jobs, but the war starts on day 0 by the option, not by each
 * government's decision (lane 1.12 Part B), so the run proves the machinery and its outcome is not a war.
 */
export const MECHANICS_RUN = ' (a mechanics run: at war from day 0 by the labelled option, not by the governments’ decisions; its outcome is not a war, 0072)';

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
export function budgetProblems(run: Pick<DoneRun, 'name' | 'timed'>, budgetMs = TICK_BUDGET_MS): string[] {
  const t = run.timed.timing;
  if (t === null) return [`${run.name}: the timed run took no timings`];
  const problems: string[] = [];
  if (t.median > budgetMs) problems.push(`${run.name}: median ${t.median.toFixed(1)} ms a day, over the ${budgetMs} ms budget`);
  if (t.p95 > budgetMs * TICK_P95_FACTOR) problems.push(`${run.name}: p95 ${t.p95.toFixed(1)} ms a day, over ${TICK_P95_FACTOR} times the budget`);
  return problems;
}

/** Criterion 6's second half (1A): the budget was measured with the planner, people and situations running. */
export function budgetSystemsProblems(timed: readonly Phase0Summary[]): string[] {
  const fired = (m: string) => timed.some((s) => (s.liveness.find((r) => r.mechanic === m)?.fires ?? 0) > 0);
  return BUDGET_SYSTEMS.filter((s) => !fired(s.mechanic)).map((s) => `no timed run had ${s.system} running (${s.mechanic} fired in none), so the budget was not measured with it`);
}

export interface DoneCheckInput {
  readonly runs: readonly DoneRun[];
  /** Liveness of the exercise runs, by reference run name. */
  readonly exercises: Readonly<Record<string, Phase0Summary['liveness']>>;
  readonly root?: string;
  /** 1A's history runs (lane 1.14): one per pack with done-check bands. */
  readonly history?: readonly HistoryRun[];
  /** The stand-ins criterion, read from the code (`standInReport`). */
  readonly standIns?: { readonly problems: readonly string[]; readonly evidence: readonly string[] };
}

/** 1A's criteria over the history runs and every run's battles. */
export function milestone1A(input: DoneCheckInput): Criterion[] {
  const history = input.history ?? [];
  const none = history.length === 0 ? ['no history run was made (no pack has done-check bands, checkpoints.json)'] : [];
  const each = (f: (h: HistoryRun) => { readonly problems: readonly string[]; readonly evidence: readonly string[] }) => {
    const problems: string[] = [...none];
    const evidence: string[] = [];
    for (const h of history) {
      const s = f(h);
      problems.push(...s.problems.map((p) => `${h.name}: ${p}`));
      evidence.push(...s.evidence.map((e) => `${h.name}: ${e}`));
    }
    return { problems, evidence };
  };
  const declared = new Set(seatsMechanics());
  const checkpoints = each((h) => checkpointsScore(h.checkpoints, h.observations, h.startDate, h.summary.atWar));
  const operation = each((h) => operationScore(h.observations));
  const pushback = each((h) => h.checkpoints.pushbackRegisters === undefined
    ? pushbackScore(h.checkpoints, h.observations, h.summary.daily, h.startDate, declared)
    : (h.pushbackRegisters === undefined || h.pushbackRegisters.length !== h.checkpoints.pushbackRegisters.length)
      ? { problems: ['named pushback registers were not loaded'], evidence: [] }
      : coverageScore(h.pushbackRegisters, h.observations.pushbackActs ?? [], h.startDate, h.observations.lastDay, h.summary.daily));
  const unknown = unknownStrengthScore([
    ...input.runs.filter((r) => r.battles !== undefined).map((r) => ({ name: r.name, battles: r.battles! })),
    ...history.map((h) => ({ name: h.name, battles: h.observations.battles })),
  ]);
  const sweep = each((h) => (h.sweep === null ? { problems: ['the lever sweep was not run'], evidence: [] } : sweepScore(h.sweep)));
  const standIns = input.standIns ?? { problems: ['the stand-ins were not read'], evidence: [] };
  return [
    { id: 'checkpoints', milestone: '1A', text: 'the history run reaches its last checkpoint with each side at war by its own decision (no --at-war), and every checkpoint falls inside its sourced band: states seceded, the sides of the governments that could change, Washington held, men under arms, planned operations fought', ...checkpoints },
    { id: 'operation', milestone: '1A', text: 'at least one operation drafted by the kernel planner, chosen by its commander’s seat, approved, executed and fought with the battle model, with a breakdown', ...operation },
    { id: 'pushback', milestone: '1A', text: 'every represented named pushback act is covered once by issuing side, actor, role and matter; representation gaps and raw diagnostics are reported separately (0111/0112)', ...pushback },
    { id: 'unknown-strength', milestone: '1A', text: 'no block fights with unknown strength: every battle record, in every run, lists none unknown', problems: [...unknown.problems], evidence: [...unknown.evidence] },
    { id: 'stand-ins', milestone: '1A', text: 'the eight stand-ins Phase 0 labelled are gone, and any stand-in left in the code is labelled and owned by a 1B lane', problems: [...standIns.problems], evidence: [...standIns.evidence] },
    { id: 'lever-sweep', milestone: '1A', text: 'the lever sweep (D6): no watched option, nor an atrocity-class decision’s inaction, is the victory-only bot’s best choice in more than a quarter of the seeds; no floor goes unpaid; recruitment is active', ...sweep },
  ];
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
  const history = input.history ?? [];
  const phase0Criteria: Omit<Criterion, 'milestone'>[] = [
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
      text: `the day's cost stays inside the ${TICK_BUDGET_MS} ms tick budget (median), and its slowest days inside ${TICK_P95_FACTOR} times it (p95), measured with the planner, people and situations running (1A)`,
      problems: [
        ...[...runs, ...history].flatMap((r) => budgetProblems(r)),
        ...(runs.length + history.length > 0 ? budgetSystemsProblems([...runs, ...history].map((r) => r.timed)) : []),
      ],
      evidence: [...runs, ...history].map((r) => {
        const t = r.timed.timing;
        const live = BUDGET_SYSTEMS.map((s) => `${s.mechanic} ${r.timed.liveness.find((x) => x.mechanic === s.mechanic)?.fires ?? 0}`).join(', ');
        return t ? `${r.name}: median ${t.median.toFixed(2)} ms, p95 ${t.p95.toFixed(2)} ms, max ${t.max.toFixed(2)} ms over ${t.days} days (${live})` : `${r.name}: no timings`;
      }),
    },
  ];
  return [...phase0Criteria.map((c) => ({ ...c, milestone: 'phase0' as const })), ...milestone1A(input)];
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
  readonly history: readonly HistoryRun[];
  /** Phase 0's criteria all pass: the exit status. */
  readonly passed: boolean;
  /** 1A's criteria all pass too (lane 1.14: measured and reported; binding when the lead says so). */
  readonly passed1A: boolean;
}

/** The lever sweep's size in the done check: seeds from the start's own, and how far each move is played on. */
export const SWEEP = { seeds: 8, horizonDays: 30 } as const;

/** A pack's done-check bands and what the history run and the sweep need from it; null for a pack without bands. */
export function historyPack(pack: string): { readonly checkpoints: Checkpoints; readonly pushbackRegisters: readonly PushbackRegister[]; readonly startDate: string; readonly seed: number; readonly atrocity: ReadonlySet<string>; readonly rules: unknown } | null {
  const { pack: data, issues } = loadPack(packFilesAt(packRoot(pack)));
  if (data === null) throw new Error(`pack ${pack} does not load:\n${errorsOf(issues).map(formatIssue).join('\n')}`);
  const start = data.scenarios[0];
  if (data.checkpoints === undefined || data.checkpoints === null || start === undefined) return null;
  const atrocity = data.gate === undefined || data.gate === null ? new Set<string>() : atrocityDecisions(data.situations ?? [], data.gate);
  return { checkpoints: data.checkpoints, pushbackRegisters: data.pushbackRegisters ?? [], startDate: start.startDate, seed: start.seed, atrocity, rules: data.world.rules };
}

/** 1A's history run for one pack: observed, timed and (unless `seeds` is 0) swept. */
export function historyRun(pack: string, options: { readonly sweepSeeds?: number } = {}): HistoryRun | null {
  const h = historyPack(pack);
  if (h === null) return null;
  const days = Math.max(historyDays(h.checkpoints, h.startDate), ...h.pushbackRegisters.map(r => dayOfDate(h.startDate, r.through)));
  const observer = observeRun(h.checkpoints, h.startDate);
  const summary = phase0Run({ pack, days, atWar: false, checks: false, replay: false, hash: 'checkpoints', checkpointEvery: days, onTick: observer.onTick });
  const timed = phase0Run({ pack, days, atWar: false, hash: 'checkpoints', checkpointEvery: days, timings: true, replay: false });
  const seeds = options.sweepSeeds ?? SWEEP.seeds;
  const sweep =
    seeds === 0
      ? null
      : runSweep(seatsWorld(pack).world, {
          seeds: Array.from({ length: seeds }, (_, i) => h.seed + i),
          days,
          horizonDays: SWEEP.horizonDays,
          weights: h.checkpoints.victory,
          atrocity: h.atrocity,
          // G-1.14b: the governments whose side could change; their governors close the recruitment chain.
          borderDepartments: h.checkpoints.checkpoints.flatMap((k) => (k.kind === 'government-side' ? k.departments : [])),
        });
  return { name: `${pack} history run, ${days} days to ${h.checkpoints.checkpoints.map((k) => k.date).sort().at(-1) ?? 'its end'}`, pack, startDate: h.startDate, checkpoints: h.checkpoints, pushbackRegisters: h.pushbackRegisters, summary, observations: observer.observations(), timed, sweep };
}

/** The packs with done-check bands, whose history runs 1A's criteria read. */
export function historyPacks(): string[] {
  return v2Packs().filter((p) => existsSync(`${packRoot(p)}/checkpoints.json`));
}

/** Make the runs and evaluate them. `onChecked` sees each checked run's summary, to write it for the cross-machine comparison. */
export function runDoneCheck(options: { readonly onChecked?: (summary: Phase0Summary, saves: ReadonlyMap<number, string>) => void; readonly sweepSeeds?: number } = {}): DoneCheckResult {
  const runs: DoneRun[] = DONE_CHECK_RUNS.map((spec) => {
    const saves = new Map<number, string>();
    const checked = phase0Run({ pack: spec.pack, days: spec.days, atWar: spec.atWar, hash: 'daily', resumeAtDay: spec.resumeAt, onSave: (text, day) => saves.set(day, text) });
    options.onChecked?.(checked, saves);
    // The repeat run also lends its battles to 1A's unknown-strength criterion (an observer reads; it never writes).
    const observer = observeRun(null, '1861-01-01');
    const repeat = phase0Run({ pack: spec.pack, days: spec.days, atWar: spec.atWar, hash: 'daily', checks: false, replay: false, onTick: observer.onTick });
    const timed = phase0Run({ pack: spec.pack, days: spec.days, atWar: spec.atWar, hash: 'checkpoints', checkpointEvery: spec.days, timings: true, replay: false });
    return { name: spec.name, checked, repeat, timed, battles: observer.observations().battles };
  });
  const exercises: Record<string, Phase0Summary['liveness']> = {};
  for (const reference of REFERENCE_RUNS.filter((r) => r.kind === 'exercise')) {
    exercises[reference.name] = phase0Run({ pack: reference.pack, days: reference.days, atWar: reference.atWar, seats: seatsNamed(reference.seats), checks: false, replay: false, hash: 'checkpoints', checkpointEvery: reference.days }).liveness;
  }
  const history = historyPacks().flatMap((p) => historyRun(p, options.sweepSeeds === undefined ? {} : { sweepSeeds: options.sweepSeeds }) ?? []);
  const m2 = history.flatMap((h) => m2CarriedValues(historyPack(h.pack)?.rules ?? null).map((path) => `${h.pack} ${path}`));
  const criteria = evaluateDoneCheck({ runs, exercises, history, standIns: standInReport(REPO, m2) });
  return {
    criteria,
    runs,
    history,
    passed: criteria.filter((c) => c.milestone === 'phase0').every((c) => c.problems.length === 0),
    passed1A: criteria.every((c) => c.problems.length === 0),
  };
}
