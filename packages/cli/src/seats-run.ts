/**
 * The headless runner for the Phase 0 seats layer (lane 0.6): every seat on
 * the rules model, a state hash every day, liveness, and three checks:
 * - replay: the whole command log, replayed from the start without asking a
 *   seat, reproduces every day's hash;
 * - save: a mid-run save's log replays to the saved State's hash;
 * - resume: play resumed from the save (seats asked again) ends on the
 *   continuous run's final hash.
 *
 * On the testbed this runs through the stand-in comms World built from the M2
 * scenario file, with lane 0.2's World beside it when the pack has one: its
 * first scenario start sets control, and the map phases (control, fronts,
 * pockets, supply, the invariant barrier) run every day (lane 0.4). Lane 0.5
 * replaces the comms World with lane 0.2's.
 */
import { canonicalHash, createTelemetry, decodeSave, encodeSave, HASH_SCHEME, livenessReport, phase0, world as w, type LivenessRow } from '@mandate/kernel';
import { errorsOf, formatIssue, loadPack } from '@mandate/pack-format';
import { createRuleSeat } from '@mandate/rule-seats';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadScenario } from './load.ts';
import { packFilesAt, packRoot, v2Packs } from './pack-files.ts';

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

export interface SeatsWorld {
  readonly world: phase0.IndexedWorld;
  readonly worldHash: string;
  readonly seed: number;
  /** What `createState` takes: the seed, and the map's scenario start when the pack has one. */
  readonly setup: phase0.SetupOptions;
}

/** Lane 0.2's World and the first scenario start of a v2 pack, or null for a pack without a manifest. */
export function v2Map(pack: string): { readonly world: w.World; readonly start: w.ScenarioStart } | null {
  const root = packRoot(pack);
  if (!existsSync(join(root, 'pack.json'))) return null;
  const { pack: data, issues } = loadPack(packFilesAt(root));
  if (data === null) throw new Error(`pack ${pack} does not load:\n${errorsOf(issues).map(formatIssue).join('\n')}`);
  const start = data.scenarios[0];
  if (start === undefined) throw new Error(`pack ${pack} has no scenario start`);
  return { world: data.world, start };
}

export function seatsWorld(pack: string): SeatsWorld {
  const scenario = loadScenario(pack);
  const comms = { ...phase0.commsWorldFromScenario(scenario), situations: packSituations(pack) };
  const map = v2Map(pack);
  if (map === null) return { world: phase0.indexWorld(comms), worldHash: canonicalHash(comms), seed: scenario.seed, setup: { seed: scenario.seed } };
  return {
    world: phase0.indexWorld(comms, w.indexWorld(map.world)),
    worldHash: canonicalHash({ comms: canonicalHash(comms), map: w.worldHash(map.world), start: w.scenarioHash(map.start) }),
    seed: scenario.seed,
    setup: { seed: scenario.seed, start: map.start },
  };
}

/** Every mechanic a seats run counts: the tick's (the seats layer's and the situations phase's), and the map's when the pack has a map. */
export function seatsMechanics(world: phase0.IndexedWorld): readonly string[] {
  return world.map === null ? phase0.TICK_MECHANICS : [...phase0.TICK_MECHANICS, ...phase0.MAP_MECHANICS];
}

/**
 * The pack's situations (lane 0.7), loaded and gate-checked through the pack
 * format when the pack has a v2 manifest; none otherwise. A pack whose
 * situations or gate fail validation does not run.
 */
function packSituations(pack: string): readonly phase0.SituationDef[] {
  if (!v2Packs().includes(pack)) return [];
  const { pack: loaded, issues } = loadPack(packFilesAt(packRoot(pack)));
  if (loaded === null) throw new Error(`packs/${pack} does not validate:\n${errorsOf(issues).map(formatIssue).join('\n')}`);
  return loaded.situations ?? [];
}

/**
 * A real mid-run save: every seat on the rules model for `day` days, then the
 * State and the log in a save envelope. The fixture in
 * `packages/cli/test/fixtures/saves/` is one of these (`tools/make-save-fixture.ts`).
 */
export function seatsSave(pack: string, day: number): string {
  const { world, worldHash, setup } = seatsWorld(pack);
  const seat = createRuleSeat();
  const run = phase0.playDays(world, phase0.createState(world, setup), () => seat, day, { freeze: true, deepChecks: true });
  return encodeSave({ worldHash, state: run.state, log: run.log });
}

export function seatsRun(options: SeatsRunOptions): SeatsSummary {
  const { world, worldHash, setup } = seatsWorld(options.pack);
  const seat = createRuleSeat();
  const seats = () => seat;
  const initial = phase0.createState(world, setup);
  const telemetry = createTelemetry(seatsMechanics(world));
  let rejections = 0;
  let decisionPoints = 0;
  const run = phase0.playDays(world, initial, seats, options.days, {
    telemetry,
    freeze: true,
    deepChecks: true,
    onDay: (r) => {
      rejections += r.rejections.length;
      decisionPoints += r.decisionPoints.length;
    },
  });
  const finalHash = canonicalHash(run.state);

  const replayed = phase0.replay(world, initial, run.log, options.days, { freeze: true, deepChecks: true }).hashes;
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
    const resumed = phase0.playDays(world, loaded.state as unknown as phase0.State, seats, options.days - at, { freeze: true, deepChecks: true });
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
