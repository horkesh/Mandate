/**
 * M1 headless run: the testbed pack, 20 turns, a scripted principal.
 *
 *   npm run run:testbed
 */
import { runPack } from './run.ts';
import { testbedScript } from './testbed-script.ts';

const log = runPack('testbed', testbedScript, 20);
console.log(log.lines.join('\n'));
