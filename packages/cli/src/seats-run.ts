/**
 * The headless runner for the Phase 0 seats layer (lane 0.6): every seat on
 * the rules model, a state hash every day, liveness, and three checks (replay,
 * save, resume). Lane 0.8's `phase0-run.ts` is the one implementation of the
 * run and its checks; this is that run with a hash every day, in the summary
 * shape `run:seats` and its tests have always had. The World helpers it
 * re-exports live in `seats-world.ts`.
 */
import type { LivenessRow } from '@mandate/kernel';
import { phase0Run } from './phase0-run.ts';

export { seatsMechanics, seatsSave, seatsWorld, v2Map, type SeatsWorld } from './seats-world.ts';

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

export function seatsRun(options: SeatsRunOptions): SeatsSummary {
  const s = phase0Run({
    pack: options.pack,
    days: options.days,
    hash: 'daily',
    ...(options.resumeAtDay === undefined ? {} : { resumeAtDay: options.resumeAtDay }),
    ...(options.onSave === undefined ? {} : { onSave: options.onSave }),
  });
  return {
    pack: s.pack,
    kernel: SEATS_KERNEL,
    hashScheme: s.hashScheme,
    worldHash: s.worldHash,
    initialHash: s.initialHash,
    unit: s.unit,
    turns: s.turns,
    finalHash: s.finalHash,
    finalDay: s.finalDay,
    logEntries: s.logEntries,
    rejections: s.rejections,
    decisionPoints: s.decisionPoints,
    liveness: s.liveness,
    replay: s.replay,
    resume: s.resume,
  };
}
