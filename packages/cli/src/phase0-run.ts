/**
 * The Phase 0 headless runner's core (FOUNDATION section 11.6; lane 0.8): a
 * pack's v2 World and first scenario start, every seat on the rules model,
 * the whole day tick (movement, the contest, control, fronts, pockets, supply,
 * stores, situations, messages) and these reports:
 * - the final state hash, and a hash at checkpoints or every day (0044: normal
 *   play does not pay for a full hash daily; CI and the determinism tests do);
 * - a per-day summary (what fired each day) and the liveness table;
 * - checkpoint scores (`phase0-scores.ts`);
 * - three checks: the command log replays to every hash; a mid-run save's log
 *   replays to the saved State; play resumed from the save ends on the
 *   continuous run's final hash;
 * - optionally the tick's cost per day (median, p95, maximum), measured with no
 *   hashing and no freezing, since those belong to tests.
 *
 * It does I/O only through its caller (`onSave`); a run's files go to `runs/`
 * from `run-phase0.ts`. The clock is read here, never in the kernel.
 */
import { canonicalHash, createTelemetry, decodeSave, encodeSave, HASH_SCHEME, livenessReport, phase0, type LivenessRow } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { checkpointScores, type CheckpointScores } from './phase0-scores.ts';
import { seatsMechanics, seatsWorld } from './seats-world.ts';

export const PHASE0_KERNEL = 'phase0';

/** Short runs (a mechanics check) and full-length campaigns (about four years, the section 9 budget run). */
export const RUN_MODES = {
  short: { days: 75, checkpointEvery: 15 },
  full: { days: 1460, checkpointEvery: 30 },
} as const;
export type RunMode = keyof typeof RUN_MODES;

export interface Phase0Options {
  readonly pack: string;
  readonly days: number;
  /** `daily`: a hash every day. `checkpoints`: every `checkpointEvery` days and the last. Default `checkpoints`. */
  readonly hash?: 'daily' | 'checkpoints';
  readonly checkpointEvery?: number;
  /** Save after this day, load the save, play on, and compare the final hash. */
  readonly resumeAtDay?: number;
  /** Replay the log and compare every hash taken. Default on; a gate run that only reads liveness skips it. */
  readonly replay?: boolean;
  /** Measure the tick's cost per day. The continuous run then has no freeze or deep checks. */
  readonly timings?: boolean;
  /** Freeze State after every phase and compare the derived map with a fresh derivation. Default on unless `timings`. */
  readonly checks?: boolean;
  /** Who sits in each seat; the rules model by default. */
  readonly seats?: phase0.SeatTable;
  /** Who sits in each seat after the resume; `seats` by default. A test hook: a seat that differs plants a divergence. */
  readonly resumeSeats?: phase0.SeatTable;
  /** A test hook: rewrites the save's text before it is written and loaded (a planted divergence in the save). */
  readonly saveTransform?: (text: string) => string;
  /** Called with the mid-run save's text, so the caller can write it under runs/. */
  readonly onSave?: (text: string, day: number) => void;
}

export interface DaySummary {
  readonly day: number;
  /** Mechanics that fired this day, with how many times. */
  readonly fires: Readonly<Record<string, number>>;
  readonly decisionPoints: number;
  readonly rejections: number;
}

export interface Checkpoint {
  readonly day: number;
  readonly hash: string;
  readonly scores: CheckpointScores;
}

export interface TickTiming {
  readonly unit: 'ms';
  readonly days: number;
  readonly median: number;
  readonly p95: number;
  readonly max: number;
}

export interface Phase0Summary {
  readonly pack: string;
  /** Which kernel produced the hashes, so a cross-machine comparison never mixes kernels. */
  readonly kernel: typeof PHASE0_KERNEL;
  readonly hashScheme: string;
  readonly worldHash: string;
  readonly initialHash: string;
  readonly unit: 'day';
  readonly hashMode: 'daily' | 'checkpoints';
  readonly checkpointEvery: number;
  /** The hashes taken, one per hashed day (the field is named `turns` for the comparison tool). */
  readonly turns: readonly { readonly turn: number; readonly hash: string }[];
  readonly checkpoints: readonly Checkpoint[];
  readonly daily: readonly DaySummary[];
  readonly finalHash: string;
  readonly finalDay: number;
  readonly logEntries: number;
  readonly rejections: number;
  readonly decisionPoints: number;
  readonly liveness: readonly LivenessRow[];
  /** The log replayed to every hash taken; null when the run was asked to skip it. */
  readonly replay: { readonly matches: boolean; readonly firstDifferentDay: number | null } | null;
  readonly resume: { readonly atTurn: number; readonly finalHash: string; readonly matches: boolean; readonly savedLogReplays: boolean } | null;
  /** Wall-clock cost, so it is not part of what two machines compare. Null unless asked for. */
  readonly timing: TickTiming | null;
}

/** The p-th percentile (nearest rank) of a sorted list, `p` in 1..100. */
export function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) throw new RangeError('no samples');
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)]!;
}

export function tickTiming(samples: readonly number[]): TickTiming {
  const sorted = [...samples].sort((a, b) => a - b);
  return { unit: 'ms', days: sorted.length, median: percentile(sorted, 50), p95: percentile(sorted, 95), max: sorted[sorted.length - 1]! };
}

export function phase0Run(options: Phase0Options): Phase0Summary {
  const hashMode = options.hash ?? 'checkpoints';
  const every = options.checkpointEvery ?? RUN_MODES.short.checkpointEvery;
  if (!Number.isSafeInteger(options.days) || options.days < 1) throw new RangeError('days must be a positive whole number');
  if (!Number.isSafeInteger(every) || every < 1) throw new RangeError('checkpointEvery must be a positive whole number');
  const { world, worldHash, setup } = seatsWorld(options.pack);
  const defaultSeat = createRuleSeat();
  const seats: phase0.SeatTable = options.seats ?? (() => defaultSeat);
  const resumeSeats = options.resumeSeats ?? seats;
  const checks = options.checks ?? options.timings !== true;
  const cadence = hashMode === 'daily' ? {} : { hashEvery: every };
  const checked = { freeze: true, deepChecks: true, ...cadence };

  const initial = phase0.createState(world, setup);
  const telemetry = createTelemetry(seatsMechanics());
  const daily: DaySummary[] = [];
  const checkpoints = new Map<number, CheckpointScores>();
  const samples: number[] = [];
  let before: Record<string, number> = {};
  let started = 0;
  let rejections = 0;
  let decisionPoints = 0;
  const run = phase0.playDays(world, initial, seats, options.days, {
    telemetry,
    ...(checks ? { freeze: true, deepChecks: true } : {}),
    ...cadence,
    beforeDay: () => {
      before = Object.fromEntries(Object.entries(telemetry.mechanics).map(([m, c]) => [m, c.fires]));
      started = performance.now();
    },
    onDay: (r) => {
      if (options.timings) samples.push(performance.now() - started);
      rejections += r.rejections.length;
      decisionPoints += r.decisionPoints.length;
      const fires: Record<string, number> = {};
      for (const [m, c] of Object.entries(telemetry.mechanics)) if (c.fires > (before[m] ?? 0)) fires[m] = c.fires - (before[m] ?? 0);
      daily.push({ day: r.day, fires, decisionPoints: r.decisionPoints.length, rejections: r.rejections.length });
      if (r.day % every === 0 || r.day === options.days) checkpoints.set(r.day, checkpointScores(world, r));
    },
  });
  const finalHash = canonicalHash(run.state);

  // The log is the truth: replaying it, with no seat asked, gives every hash the run took.
  let replayCheck: Phase0Summary['replay'] = null;
  if (options.replay !== false) {
    const replayed = phase0.replay(world, initial, run.log, options.days, checked).hashes;
    const firstDifferent = replayed.findIndex((h, i) => h.hash !== run.hashes[i]?.hash || h.day !== run.hashes[i]?.day);
    replayCheck = { matches: firstDifferent === -1 && replayed.length === run.hashes.length, firstDifferentDay: firstDifferent === -1 ? null : (replayed[firstDifferent]?.day ?? run.hashes[firstDifferent]!.day) };
  }

  let resume: Phase0Summary['resume'] = null;
  if (options.resumeAtDay !== undefined) {
    const at = options.resumeAtDay;
    if (!Number.isSafeInteger(at) || at < 1 || at >= options.days) throw new RangeError(`resume day must be between 1 and ${options.days - 1}`);
    const log = phase0.logThrough(run.log, at);
    const mid = phase0.replay(world, initial, log, at);
    const saved = encodeSave({ worldHash, state: mid.state, log });
    const text = options.saveTransform?.(saved) ?? saved;
    options.onSave?.(text, at);
    const loaded = decodeSave(text, { expectedWorldHash: worldHash });
    // The saved log is the truth: refuse a malformed one before replaying or resuming (review F5).
    const savedLog = phase0.checkedLog(loaded.log);
    const savedLogReplays = canonicalHash(phase0.replay(world, initial, savedLog, at).state) === loaded.stateHash;
    const resumed = phase0.playDays(world, loaded.state as unknown as phase0.State, resumeSeats, options.days - at, checked);
    const resumedHash = canonicalHash(resumed.state);
    resume = { atTurn: at, finalHash: resumedHash, matches: resumedHash === finalHash, savedLogReplays };
  }

  return {
    pack: options.pack,
    kernel: PHASE0_KERNEL,
    hashScheme: HASH_SCHEME,
    worldHash,
    initialHash: canonicalHash(initial),
    unit: 'day',
    hashMode,
    checkpointEvery: every,
    turns: run.hashes.map((h) => ({ turn: h.day, hash: h.hash })),
    checkpoints: run.hashes.filter((h) => checkpoints.has(h.day)).map((h) => ({ day: h.day, hash: h.hash, scores: checkpoints.get(h.day)! })),
    daily,
    finalHash,
    finalDay: run.state.stateDay,
    logEntries: run.log.length,
    rejections,
    decisionPoints,
    liveness: livenessReport(telemetry),
    replay: replayCheck,
    resume,
    timing: options.timings ? tickTiming(samples) : null,
  };
}
