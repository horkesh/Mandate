/**
 * Play in the text console (lane 1.13): `npm run play -- <pack> [--at-war]`. The new kernel, the player in his side's
 * principal's seat, the rules model in every other; turns of up to a week that end on a decision point (0027).
 */
import { createInterface } from 'node:readline';
import { ConsoleGame } from './console/game.ts';
import { ConsoleSession } from './console/session.ts';

const args = process.argv.slice(2);
const pack = args.find((a) => !a.startsWith('--')) ?? 'testbed';
const session = new ConsoleSession(new ConsoleGame({ pack, atWar: args.includes('--at-war') }));
for (const line of session.start()) console.log(line);

const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
rl.prompt();
rl.on('line', (line) => {
  const { lines, done } = session.handle(line);
  for (const l of lines) console.log(l);
  if (done) rl.close();
  else rl.prompt();
});
