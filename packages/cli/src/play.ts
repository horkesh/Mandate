/**
 * Play a pack in the terminal (M2).
 *
 *   npm run play               # the testbed
 *   npm run play -- union-1861 # another pack
 *
 * Also accepts piped commands, one per line, for scripted sessions.
 */
import { createInterface } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { GameConsole } from './console.ts';
import { loadScenario } from './load.ts';

const pack = process.argv[2] ?? 'testbed';
const game = new GameConsole(loadScenario(pack));
const echo = !input.isTTY;
const prompt = () => output.write(game.over ? '\n(game over) > ' : '\n> ');

console.log(game.intro().join('\n'));
prompt();
const rl = createInterface({ input, terminal: input.isTTY });
for await (const line of rl) {
  if (echo) output.write(`${line}\n`);
  if (line.trim() === 'quit') break;
  console.log(game.handle(line).join('\n'));
  prompt();
}
rl.close();
