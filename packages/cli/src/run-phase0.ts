/**
 * The Phase 0 headless runner (lane 0.8), written to a fresh folder in runs/.
 *
 *   npm run run:phase0 -- <pack> [days] [--mode short|full] [--hash daily|checkpoints]
 *       [--checkpoint-every <days>] [--resume-at <day>] [--timings] [--at-war] [--label <name>]
 *
 * `short` is 75 days with a checkpoint every 15; `full` is a 1,460-day campaign with one every
 * 30; an explicit `days` replaces the mode's length. `--at-war` is the labelled mechanics-run option
 * (0064): every faction starts at war, so a pack whose war has no opening situation yet still moves
 * forces. Without it a pack keeps its own peace. Prints the world hash, the final state hash,
 * the replay and resume checks, the checkpoint scores, the liveness table (against the reference
 * bands when the run is one of them) and, with `--timings`, the tick's cost per day. Exits 1 if
 * replay or resume does not match, or a reference run leaves its liveness bands. CI runs this on
 * Linux and Windows and compares the hashes.
 */
import { createRunDir, writeRunFile } from './io/runs.ts';
import { gateFailures, referenceRunFor } from './liveness-gate.ts';
import { phase0Run, RUN_MODES, type Phase0Summary, type RunMode } from './phase0-run.ts';

function parse(argv: readonly string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  const switches = new Set(['timings', 'at-war']);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (!arg.startsWith('--')) {
      positional.push(arg);
    } else if (switches.has(arg.slice(2))) {
      flags[arg.slice(2)] = 'true';
    } else {
      const value = argv[i + 1];
      if (value === undefined) throw new Error(`${arg} needs a value`);
      flags[arg.slice(2)] = value;
      i++;
    }
  }
  const mode = (flags.mode ?? 'short') as RunMode;
  if (!(mode in RUN_MODES)) throw new Error(`--mode must be short or full, got ${mode}`);
  const whole = (name: string, text: string | undefined, fallback: number | undefined): number | undefined => {
    if (text === undefined) return fallback;
    const n = Number(text);
    if (!Number.isSafeInteger(n) || n <= 0) throw new Error(`${name} must be a positive whole number`);
    return n;
  };
  const hash = flags.hash ?? 'checkpoints';
  if (hash !== 'daily' && hash !== 'checkpoints') throw new Error(`--hash must be daily or checkpoints, got ${hash}`);
  return {
    pack: positional[0] ?? 'testbed',
    days: whole('days', positional[1], RUN_MODES[mode].days)!,
    hash,
    checkpointEvery: whole('--checkpoint-every', flags['checkpoint-every'], RUN_MODES[mode].checkpointEvery)!,
    resumeAt: whole('--resume-at', flags['resume-at'], undefined),
    timings: flags.timings === 'true',
    atWar: flags['at-war'] === 'true',
    label: flags.label ?? 'phase0',
  } as const;
}

function gateLines(summary: Phase0Summary, days: number): { readonly lines: string[]; readonly failed: boolean } {
  const reference = referenceRunFor(summary.pack, days, summary.atWar);
  if (reference === undefined) return { lines: ['gate        no reference bands for this pack and length (liveness not gated)'], failed: false };
  const failures = gateFailures(reference, summary.liveness);
  if (failures.length === 0) return { lines: [`gate        every mechanic inside its band (${reference.name})`], failed: false };
  return {
    lines: [`gate        FAILED (${reference.name}):`, ...failures.map((f) => `  ${f.mechanic}: ${f.problem} (${f.fires} fires${f.band ? `, band ${f.band.minFires}..${f.band.maxFires ?? 'any'}` : ''})`)],
    failed: true,
  };
}

function report(summary: Phase0Summary, path: string, gate: readonly string[]): string {
  const width = Math.max(...summary.liveness.map((r) => r.mechanic.length));
  const lines = [
    `pack        ${summary.pack} (kernel ${summary.kernel}${summary.atWar ? ', started at war by --at-war' : ''})`,
    `hash scheme ${summary.hashScheme}`,
    `world hash  ${summary.worldHash}`,
    `days        ${summary.finalDay} (log ${summary.logEntries} entries, ${summary.rejections} rejected, ${summary.decisionPoints} decision points; hashes ${summary.hashMode === 'daily' ? 'every day' : `every ${summary.checkpointEvery} days`})`,
    `final hash  ${summary.finalHash}`,
    `replay      ${summary.replay === null ? 'not checked' : summary.replay.matches ? 'MATCHES every hash' : `DIFFERS from day ${summary.replay.firstDifferentDay}`}`,
    summary.resume
      ? `resume      from day ${summary.resume.atTurn}: ${summary.resume.matches ? 'MATCHES' : 'DIFFERS'} (${summary.resume.finalHash}); saved log ${summary.resume.savedLogReplays ? 'replays to the saved state' : 'DOES NOT replay to the saved state'}`
      : 'resume      not checked',
    ...gate,
  ];
  if (summary.timing) lines.push(`tick        median ${summary.timing.median.toFixed(2)} ms, p95 ${summary.timing.p95.toFixed(2)} ms, max ${summary.timing.max.toFixed(2)} ms over ${summary.timing.days} days (no hashing)`);
  lines.push('', 'checkpoints (day: held / traced / front segments / pockets / men known, per faction; contested; marching):');
  for (const c of summary.checkpoints) {
    const per = c.scores.factions.map((f) => `${f.faction} ${f.held}/${f.traced}/${f.frontSegments}/${f.pockets}/${f.menKnown}`).join('  ');
    lines.push(`  day ${String(c.day).padStart(4)}  ${c.hash.slice(0, 12)}  ${per}  contested ${c.scores.contestedRegions}  marching ${c.scores.blocksMarching}/${c.scores.blocksTotal}`);
  }
  lines.push('', 'liveness (fires, magnitude):', ...summary.liveness.map((r) => `  ${r.mechanic.padEnd(width)}  ${String(r.fires).padStart(5)}  ${String(r.magnitude).padStart(8)}${r.fires === 0 ? '  quiet' : ''}`), '', `summary     ${path}`);
  return lines.join('\n');
}

const args = parse(process.argv.slice(2));
const dir = createRunDir(args.label);
const summary = phase0Run({
  pack: args.pack,
  days: args.days,
  hash: args.hash,
  checkpointEvery: args.checkpointEvery,
  timings: args.timings,
  atWar: args.atWar,
  ...(args.resumeAt === undefined ? {} : { resumeAtDay: args.resumeAt }),
  onSave: (text, day) => writeRunFile(dir, `save-day-${day}.json`, `${text}\n`),
});
const summaryPath = writeRunFile(dir, 'summary.json', `${JSON.stringify(summary, null, 2)}\n`);
const gate = gateLines(summary, args.days);
console.log(report(summary, summaryPath, gate.lines));
if (gate.failed || (summary.replay && !summary.replay.matches) || (summary.resume && (!summary.resume.matches || !summary.resume.savedLogReplays))) process.exit(1);
