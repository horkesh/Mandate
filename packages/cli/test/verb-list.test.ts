import { readFileSync } from 'node:fs';
import { VERBS } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { CONSOLE_COMMANDS, GameConsole, VERB_COMMANDS } from '../src/console.ts';
import { loadScenario } from '../src/load.ts';

/**
 * The verb list is the interface (FOUNDATION section 11.10; AWWV's shell let
 * unit orders back in). The console's game-changing commands must map onto
 * the kernel's verb list exactly: every verb reachable, nothing else.
 */

/** Differences between an app's command-to-verb table and the kernel's verbs. Empty when they match exactly. */
export function verbListMismatch(commands: Readonly<Record<string, string>>, verbs: readonly string[]): string[] {
  const problems: string[] = [];
  const targets = Object.values(commands);
  for (const verb of verbs) {
    const count = targets.filter((t) => t === verb).length;
    if (count === 0) problems.push(`verb ${verb} has no command`);
    if (count > 1) problems.push(`verb ${verb} has ${count} commands`);
  }
  for (const [command, target] of Object.entries(commands)) {
    if (!verbs.includes(target)) problems.push(`command ${command} names ${target}, which is not a kernel verb`);
  }
  return problems;
}

describe('the console commands are the kernel verb list', () => {
  it('maps commands onto VERBS exactly, one command per verb', () => {
    expect(verbListMismatch(VERB_COMMANDS, VERBS)).toEqual([]);
  });

  it('keeps look-and-clock commands apart from verb commands', () => {
    const overlap = CONSOLE_COMMANDS.filter((c) => Object.prototype.hasOwnProperty.call(VERB_COMMANDS, c));
    expect(overlap).toEqual([]);
  });

  it('recognises every declared command and nothing undeclared', () => {
    const game = new GameConsole(loadScenario('testbed'));
    const unknown = (cmd: string) => game.handle(cmd).some((line) => line.startsWith('Unknown command'));
    for (const cmd of [...Object.keys(VERB_COMMANDS), ...CONSOLE_COMMANDS.filter((c) => c !== 'quit' && c !== 'end')]) {
      expect(unknown(cmd), cmd).toBe(false);
    }
    for (const cmd of ['move', 'march', 'attack', 'reinforce', 'garrison', 'retreat', 'assign']) {
      expect(unknown(cmd), cmd).toBe(true);
    }
  });

  it('has no other path from a command to the kernel than the decision queue', () => {
    // Every decision object is built by one of the per-verb builders or the
    // audience commit; nothing else in the console may name a verb.
    const source = readFileSync(new URL('../src/console.ts', import.meta.url), 'utf8');
    const verbLiterals = [...source.matchAll(/\bverb:\s*'([a-z_]+)'/g)].map((m) => m[1]);
    expect(verbLiterals.sort()).toEqual([...VERBS].sort());
    expect(source.match(/\{ verb: 'audience', \.\.\.draft \}/g)?.length).toBe(1);
  });

  it('detects a mismatch (positive control)', () => {
    expect(verbListMismatch({ order: 'direct', move: 'move_division', also: 'direct' }, ['direct', 'appoint'])).toEqual([
      'verb direct has 2 commands',
      'verb appoint has no command',
      'command move names move_division, which is not a kernel verb',
    ]);
  });
});
