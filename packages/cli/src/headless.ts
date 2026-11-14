/**
 * The headless runner's core (FOUNDATION section 11.6): play a pack with the
 * generic scripted leader and report the world hash, a state hash after every
 * turn, the final hash and mechanic liveness. Optionally save mid-run, reload
 * the save and play on, and check the resumed run ends on the continuous
 * run's hash.
 *
 * On the M2 kernel a hash is taken per turn (one `advance`); the Phase 0 tick
 * will take one per day with the same `canonicalHash`.
 */
import {
  advance,
  canonicalHash,
  createGame,
  decodeSave,
  DEFAULT_KERNEL_RULES,
  encodeSave,
  HASH_SCHEME,
  livenessReport,
  playerFactionId,
  viewFor,
  type GameState,
  type LivenessRow,
  type Telemetry,
} from '@mandate/kernel';
import { loadScenario } from './load.ts';
import { createM2Telemetry, recordM2Turn } from './m2-liveness.ts';
import type { Script } from './run.ts';
import { testbedScript } from './testbed-script.ts';

export interface TurnHash {
  readonly turn: number;
  readonly fromDay: number;
  readonly toDay: number;
  readonly hash: string;
}

export interface HeadlessSummary {
  readonly pack: string;
  readonly hashScheme: string;
  readonly worldHash: string;
  readonly initialHash: string;
  readonly maxTurns: number;
  readonly turns: readonly TurnHash[];
  readonly finalHash: string;
  readonly finalDay: number;
  readonly verdict: string | null;
  readonly liveness: readonly LivenessRow[];
  readonly resume: { readonly atTurn: number; readonly finalHash: string; readonly matches: boolean } | null;
}

export interface HeadlessOptions {
  readonly pack: string;
  readonly maxTurns: number;
  /** Save after this turn, reload, and play on to check resume = continuous. */
  readonly resumeAtTurn?: number;
  readonly script?: Script;
  /** Called with the mid-run save's text, so the caller can write it to `runs/`. */
  readonly onSave?: (text: string, turn: number) => void;
}

function play(start: GameState, script: Script, maxTurns: number, telemetry: Telemetry | null, each: (turn: TurnHash, state: GameState) => void): GameState {
  let state = start;
  const player = playerFactionId(state);
  while (state.turn < maxTurns && !state.verdict) {
    const decisions = script(viewFor(state, player, DEFAULT_KERNEL_RULES), DEFAULT_KERNEL_RULES);
    const result = advance(state, decisions, DEFAULT_KERNEL_RULES);
    if (telemetry) recordM2Turn(telemetry, state, result.state);
    state = result.state;
    each({ turn: state.turn, fromDay: result.fromDay, toDay: result.toDay, hash: canonicalHash(state) }, state);
  }
  return state;
}

export function headlessRun(options: HeadlessOptions): HeadlessSummary {
  const script = options.script ?? testbedScript;
  const scenario = loadScenario(options.pack);
  const worldHash = canonicalHash(scenario);
  const initial = createGame(scenario);
  const telemetry = createM2Telemetry();
  const turns: TurnHash[] = [];
  let saveText: string | null = null;

  const final = play(initial, script, options.maxTurns, telemetry, (t, state) => {
    turns.push(t);
    if (t.turn === options.resumeAtTurn) {
      saveText = encodeSave({ worldHash, state });
      options.onSave?.(saveText, t.turn);
    }
  });
  const finalHash = canonicalHash(final);

  let resume: HeadlessSummary['resume'] = null;
  if (options.resumeAtTurn !== undefined) {
    if (saveText === null) throw new Error(`the run ended before turn ${options.resumeAtTurn}; nothing to resume from`);
    const loaded = decodeSave(saveText, { expectedWorldHash: worldHash });
    const resumed = play(loaded.state as unknown as GameState, script, options.maxTurns, null, () => {});
    const resumedHash = canonicalHash(resumed);
    resume = { atTurn: options.resumeAtTurn, finalHash: resumedHash, matches: resumedHash === finalHash };
  }

  return {
    pack: options.pack,
    hashScheme: HASH_SCHEME,
    worldHash,
    initialHash: canonicalHash(initial),
    maxTurns: options.maxTurns,
    turns,
    finalHash,
    finalDay: final.day,
    verdict: final.verdict ? `${final.verdict.kind}${final.verdict.factionId ? ` (${final.verdict.factionId})` : ''} on day ${final.verdict.day}` : null,
    liveness: livenessReport(telemetry),
    resume,
  };
}
