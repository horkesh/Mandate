/**
 * The headless runner for the Phase 0 seats layer (lane 0.6): every seat on
 * the rules model, a state hash every day, liveness, and three checks:
 * - replay: the whole command log, replayed from the start without asking a
 *   seat, reproduces every day's hash;
 * - save: a mid-run save's log replays to the saved State's hash;
 * - resume: play resumed from the save (seats asked again) ends on the
 *   continuous run's final hash.
 *
 * On the testbed this runs through the stand-in World built from the M2
 * scenario file, until lane 0.2's World format exists.
 */
import { canonicalHash, createTelemetry, decodeSave, encodeSave, HASH_SCHEME, livenessReport, phase0, type LivenessRow } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { loadScenario } from './load.ts';

export const SEATS_KERNEL = 'phase0-seats';

export interface SeatsSummary {
  readonly pack: string;
  /** Which kernel produced the hashes, so a cross-machine comparison never mixes kernels. */
  readonly kernel: typeof SEATS_KERNEL;
  readonly hashScheme: string;
  readonly worldHash: string;
  readonly initialHash: string;
  /** One hash per day (the field is named `turns` for the comparison tool; each entry is a day). */
  readonly unit: 'day';
  readonly turns: readonly { readonly turn: number; readonly hash: string }[];
  readonly finalHash: string;
  readonly finalDay: number;
  readonly logEntries: number;
  readonly rejections: number;
  readonly decisionPoints: number;
  readonly liveness: readonly LivenessRow[];
  readonly replay: { readonly matches: boolean; readonly firstDifferentDay: number | null };
  readonly resume: { readonly atTurn: number; readonly finalHash: string; readonly matches: boolean; readonly savedLogReplays: boolean } | null;
}

export interface SeatsRunOptions {
  readonly pack: string;
  readonly days: number;
  readonly resumeAtDay?: number;
  /** Called with the mid-run save's text, so the caller can write it under runs/. */
  readonly onSave?: (text: string, day: number) => void;
}

export function seatsWorld(pack: string): { readonly world: phase0.IndexedWorld; readonly worldHash: string; readonly seed: number } {
  const scenario = loadScenario(pack);
  const comms = phase0.commsWorldFromScenario(scenario);
  return { world: phase0.indexWorld(comms), worldHash: canonicalHash(comms), seed: scenario.seed };
}

/**
 * A real mid-run save: every seat on the rules model for `day` days, then the
 * State and the log in a save envelope. The fixture in
 * `packages/cli/test/fixtures/saves/` is one of these (`tools/make-save-fixture.ts`).
 */
export function seatsSave(pack: string, day: number): string {
  const { world, worldHash, seed } = seatsWorld(pack);
  const seat = createRuleSeat();
  const run = phase0.playDays(world, phase0.createState(world, { seed }), () => seat, day, { freeze: true });
  return encodeSave({ worldHash, state: run.state, log: run.log });
}

export function seatsRun(options: SeatsRunOptions): SeatsSummary {
  const { world, worldHash, seed } = seatsWorld(options.pack);
  const seat = createRuleSeat();
  const seats = () => seat;
  const initial = phase0.createState(world, { seed });
  const telemetry = createTelemetry(phase0.SEATS_MECHANICS);
  let rejections = 0;
  let decisionPoints = 0;
  const run = phase0.playDays(world, initial, seats, options.days, {
    telemetry,
    freeze: true,
    onDay: (r) => {
      rejections += r.rejections.length;
      decisionPoints += r.decisionPoints.length;
    },
  });
  const finalHash = canonicalHash(run.state);

  const replayed = phase0.replay(world, initial, run.log, options.days, { freeze: true }).hashes;
  const firstDifferent = replayed.findIndex((h, i) => h.hash !== run.hashes[i]?.hash);

  let resume: SeatsSummary['resume'] = null;
  if (options.resumeAtDay !== undefined) {
    const at = options.resumeAtDay;
    if (at < 1 || at >= options.days) throw new Error(`--resume-at must be between 1 and ${options.days - 1}`);
    const log = phase0.logThrough(run.log, at);
    const mid = phase0.replay(world, initial, log, at);
    const text = encodeSave({ worldHash, state: mid.state, log });
    options.onSave?.(text, at);
    const loaded = decodeSave(text, { expectedWorldHash: worldHash });
    // The saved log is the truth: refuse a malformed one before replaying or resuming (review F5).
    const savedLog = phase0.checkedLog(loaded.log);
    const savedLogReplays = canonicalHash(phase0.replay(world, initial, savedLog, at).state) === loaded.stateHash;
    const resumed = phase0.playDays(world, loaded.state as unknown as phase0.State, seats, options.days - at, { freeze: true });
    const resumedHash = canonicalHash(resumed.state);
    resume = { atTurn: at, finalHash: resumedHash, matches: resumedHash === finalHash, savedLogReplays };
  }

  return {
    pack: options.pack,
    kernel: SEATS_KERNEL,
    hashScheme: HASH_SCHEME,
    worldHash,
    initialHash: canonicalHash(initial),
    unit: 'day',
    turns: run.hashes.map((h) => ({ turn: h.day, hash: h.hash })),
    finalHash,
    finalDay: run.state.stateDay,
    logEntries: run.log.length,
    rejections,
    decisionPoints,
    liveness: livenessReport(telemetry),
    replay: { matches: firstDifferent === -1 && replayed.length === run.hashes.length, firstDifferentDay: firstDifferent === -1 ? null : firstDifferent + 1 },
    resume,
  };
}
