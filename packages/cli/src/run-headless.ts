/**
 * Headless run with hashes and liveness, written to a fresh folder in runs/.
 *
 *   npm run run:headless -- <pack> <max turns> [--resume-at <turn>] [--label <name>]
 *
 * Prints the world hash, the final state hash, the resume check and the
 * liveness table. Exits 1 if the resumed run does not end on the continuous
 * run's hash. CI runs this on Linux and Windows and compares the summaries.
 */
import { headlessRun } from './headless.ts';
import { createRunDir, writeRunFile } from './io/runs.ts';

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
  const turns = Number(positional[1] ?? 20);
  if (!Number.isSafeInteger(turns) || turns <= 0) throw new Error('max turns must be a positive whole number');
  const resumeAt = flags['resume-at'] === undefined ? undefined : Number(flags['resume-at']);
  if (resumeAt !== undefined && (!Number.isSafeInteger(resumeAt) || resumeAt <= 0)) throw new Error('--resume-at must be a positive whole number');
  return { pack: positional[0] ?? 'testbed', turns, resumeAt, label: flags.label ?? 'headless' };
}

const args = parse(process.argv.slice(2));
const dir = createRunDir(args.label);
const summary = headlessRun({
  pack: args.pack,
  maxTurns: args.turns,
  ...(args.resumeAt === undefined ? {} : { resumeAtTurn: args.resumeAt }),
  onSave: (text, turn) => writeRunFile(dir, `save-turn-${turn}.json`, `${text}\n`),
});
const summaryPath = writeRunFile(dir, 'summary.json', `${JSON.stringify(summary, null, 2)}\n`);

const width = Math.max(...summary.liveness.map((r) => r.mechanic.length));
console.log(
  [
    `pack        ${summary.pack}`,
    `hash scheme ${summary.hashScheme}`,
    `world hash  ${summary.worldHash}`,
    `turns       ${summary.turns.length} of ${summary.maxTurns} (day ${summary.finalDay}${summary.verdict ? `; ${summary.verdict}` : ''})`,
    `final hash  ${summary.finalHash}`,
    summary.resume
      ? `resume      from turn ${summary.resume.atTurn}: ${summary.resume.matches ? 'MATCHES' : 'DIFFERS'} (${summary.resume.finalHash})`
      : 'resume      not checked',
    '',
    'liveness (fires, magnitude):',
    ...summary.liveness.map((r) => `  ${r.mechanic.padEnd(width)}  ${String(r.fires).padStart(5)}  ${String(r.magnitude).padStart(8)}${r.fires === 0 ? '  DEAD' : ''}`),
    '',
    `summary     ${summaryPath}`,
  ].join('\n'),
);
if (summary.resume && !summary.resume.matches) process.exit(1);
