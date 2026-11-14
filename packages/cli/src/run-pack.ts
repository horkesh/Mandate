/**
 * Headless run of any pack with the generic scripted principal.
 *
 *   npm run run:pack -- union-1861 30
 */
import { runPack } from './run.ts';
import { testbedScript } from './testbed-script.ts';

const pack = process.argv[2] ?? 'testbed';
const turns = Number(process.argv[3] ?? 20);
console.log(runPack(pack, testbedScript, turns).lines.join('\n'));
