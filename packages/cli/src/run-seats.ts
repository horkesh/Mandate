/**
 * Headless run of the Phase 0 seats layer, written to a fresh folder in runs/.
 *
 *   npm run run:seats -- <pack> <days> [--resume-at <day>] [--label <name>] [--show <person>]
 *
 * Prints the world hash, the final state hash, the replay, save and resume
 * checks and the liveness table; `--show` prints one seat's dispatch log, as
 * the desk would show it. Exits 1 if replay or resume does not match. CI runs
 * this on Linux and Windows and compares the per-day hashes.
 */
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { dispatchLog, enemyPicture } from './desk/dispatches.ts';
import { createRunDir, writeRunFile } from './io/runs.ts';
import { seatsRun, seatsWorld } from './seats-run.ts';

function parse(argv: readonly string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg.startsWith('--')) {
      const value = argv[i + 1];
      if (value === undefined) throw new Error(`${arg} needs a value`);
      flags[arg.slice(2)] = value;
      i++;
    } else {
      positional.push(arg);
    }
  }
  const days = Number(positional[1] ?? 60);
  if (!Number.isSafeInteger(days) || days <= 0) throw new Error('days must be a positive whole number');
  const resumeAt = flags['resume-at'] === undefined ? undefined : Number(flags['resume-at']);
  if (resumeAt !== undefined && (!Number.isSafeInteger(resumeAt) || resumeAt <= 0)) throw new Error('--resume-at must be a positive whole number');
  return { pack: positional[0] ?? 'testbed', days, resumeAt, label: flags.label ?? 'seats', show: flags.show };
}

const args = parse(process.argv.slice(2));
const dir = createRunDir(args.label);
const summary = seatsRun({
  pack: args.pack,
  days: args.days,
  ...(args.resumeAt === undefined ? {} : { resumeAtDay: args.resumeAt }),
  onSave: (text, day) => writeRunFile(dir, `save-day-${day}.json`, `${text}\n`),
});
const summaryPath = writeRunFile(dir, 'summary.json', `${JSON.stringify(summary, null, 2)}\n`);

const width = Math.max(...summary.liveness.map((r) => r.mechanic.length));
const lines = [
  `pack        ${summary.pack} (kernel ${summary.kernel})`,
  `hash scheme ${summary.hashScheme}`,
  `world hash  ${summary.worldHash}`,
  `days        ${summary.turns.length} (log ${summary.logEntries} entries, ${summary.rejections} rejected, ${summary.decisionPoints} decision points)`,
  `final hash  ${summary.finalHash}`,
  `replay      ${summary.replay.matches ? 'MATCHES every day' : `DIFFERS from day ${summary.replay.firstDifferentDay}`}`,
  summary.resume
    ? `resume      from day ${summary.resume.atTurn}: ${summary.resume.matches ? 'MATCHES' : 'DIFFERS'} (${summary.resume.finalHash}); saved log ${summary.resume.savedLogReplays ? 'replays to the saved state' : 'DOES NOT replay to the saved state'}`
    : 'resume      not checked',
  '',
  'liveness (fires, magnitude):',
  ...summary.liveness.map((r) => `  ${r.mechanic.padEnd(width)}  ${String(r.fires).padStart(5)}  ${String(r.magnitude).padStart(8)}${r.fires === 0 ? '  DEAD' : ''}`),
];
if (args.show !== undefined) {
  // What one person may read at the end of the run: his view, never State.
  const { world, seed } = seatsWorld(args.pack);
  const seat = createRuleSeat();
  const end = phase0.playDays(world, phase0.createState(world, { seed }), () => seat, args.days).state;
  const view = phase0.viewFor(world, end, phase0.seatIdFor(world.person(ids.toId('person', args.show)).id));
  lines.push('', `${args.show}'s dispatches:`, ...dispatchLog(view).map((l) => `  ${l}`), '', `${args.show}'s picture of the enemy:`, ...enemyPicture(view).map((l) => `  ${l}`));
}
lines.push('', `summary     ${summaryPath}`);
console.log(lines.join('\n'));
if (!summary.replay.matches || (summary.resume && (!summary.resume.matches || !summary.resume.savedLogReplays))) process.exit(1);
