import { readFileSync } from 'node:fs';
import { ids, phase0 } from '@mandate/kernel';
import { commandText } from '../src/desk/render.ts';
import { describe, expect, it } from 'vitest';
import { DESK_COMMANDS, parseLine, VERB_COMMANDS } from '../src/desk/commands.ts';
import { ConsoleGame } from '../src/console/game.ts';
import { deskStrings } from '../src/pack-text.ts';

/**
 * The verb list is the interface (FOUNDATION section 11.10; AWWV's shell let unit orders back in). Lane 1.13: the
 * console's game-changing words must map onto the new kernel's commands exactly, every one reachable and nothing else:
 * the principal's command kinds (`phase0.COMMAND_KINDS`, less `choose`, which is a commander's answer to a plan menu,
 * never the principal's), with `review` taken by its three actions (approve, send back, edit: 0026's grammar).
 */

/**
 * The new kernel's verb list, as the principal sends it. Lane 1.12: `battle`, like `choose`, is a commander's answer
 * (his battle orders), never the principal's, and the kernel refuses it from a player's seat (hard rule 1).
 */
export function kernelVerbs(): string[] {
  return phase0.COMMAND_KINDS.filter((k) => k !== 'choose' && k !== 'battle' && k !== 'recall_offer')
    .flatMap((k) => (k === 'review' ? phase0.REVIEW_ACTIONS.map((a) => `review:${a}`) : [k]))
    .sort();
}

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

describe('the console commands are the kernel verb list (lane 1.13: the new kernel)', () => {
  it('maps commands onto the kernel’s verbs exactly, one command per verb', () => {
    expect(kernelVerbs()).toEqual(['address', 'answer_proposal', 'appoint', 'audience', 'call', 'consult', 'decide', 'delegate', 'go', 'inquire', 'observer', 'order', 'pressure', 'promise', 'relieve', 'review:approve', 'review:edit', 'review:send_back', 'transfer']);
    expect(verbListMismatch(VERB_COMMANDS, kernelVerbs())).toEqual([]);
  });

  it('keeps look-and-clock commands apart from verb commands', () => {
    expect(DESK_COMMANDS.filter((c) => Object.prototype.hasOwnProperty.call(VERB_COMMANDS, c))).toEqual([]);
  });

  it('recognises every declared command and nothing undeclared: no word moves a force (hard rule 1)', () => {
    const game = new ConsoleGame({ pack: 'testbed' });
    const request = game.morning();
    const t = deskStrings(game.strings, game.locale);
    const unknown = (line: string) => {
      const r = parseLine(line, request, t);
      return r.kind === 'error' && r.message.startsWith('Unknown command');
    };
    for (const word of [...Object.keys(VERB_COMMANDS), ...DESK_COMMANDS]) expect(unknown(word), word).toBe(false);
    for (const word of ['move', 'march', 'attack', 'reinforce', 'garrison', 'retreat', 'assign', 'detach', 'embark']) expect(unknown(word), word).toBe(true);
  });

  it('has no other path from a word to the kernel: every command the desk builds is a principal’s verb', () => {
    const source = readFileSync(new URL('../src/desk/commands.ts', import.meta.url), 'utf8');
    const built = [...new Set([...source.matchAll(/\bcmd:\s*'([a-z_]+)'/g)].map((m) => m[1]!))].sort();
    const kinds = [...new Set(kernelVerbs().map((v) => v.split(':')[0]!))].sort();
    // `promise` and `pressure` share one builder (`cmd: word`), so they are counted from the switch's cases instead.
    expect([...built, 'pressure', 'promise'].sort()).toEqual(kinds);
    expect(source).not.toMatch(/cmd:\s*'choose'/);
    expect(source).not.toMatch(/cmd:\s*'battle'/);
  });

  it('detects a mismatch (positive control)', () => {
    expect(verbListMismatch({ order: 'order', move: 'move_division', also: 'order' }, ['order', 'appoint'])).toEqual([
      'verb order has 2 commands',
      'verb appoint has no command',
      'command move names move_division, which is not a kernel verb',
    ]);
  });
});

it('the console answers a received proposal and can write a nested conditional order', () => {
  const game = new ConsoleGame({ pack: 'testbed' });
  const request = game.morning();
  const t = deskStrings(game.strings, game.locale);
  if (request.menu.menuKind !== 'principal') throw Error('expected the principal');
  const { post, holder } = request.menu.commandable[0]!;
  const paper = ids.toId('message', 'm.example.proposal');
  const region = ids.toId('region', 'rear_region');
  const goal = { ...request.menu.goalDefaults, objective: null, posture: 'hold' as const, committed: [] };
  const proposal = { paper, post, author: holder!, order: ids.toId('message', 'm.example.order'), ordered: goal, goal, reasons: [] };
  const heard = { ...request, menu: { ...request.menu, proposals: [proposal] } };
  expect(parseLine(`proposal ${post} ${paper} accept`, request, t)).toMatchObject({ kind: 'error' });
  for (const action of ['accept', 'decline']) {
    expect(parseLine(`proposal ${post} ${paper} ${action}`, heard, t)).toMatchObject({
      kind: 'command', command: { cmd: 'answer_proposal', to: post, proposal: paper, action },
    });
  }
  const fallback = `fallback=turned,hold,${region}/outmatched,hold,-`;
  for (const input of [`proposal ${post} ${paper} discretion`, `order ${post} hold`]) {
    const parsed = parseLine(`${input} ${fallback}`, heard, t);
    expect(parsed).toMatchObject({ kind: 'command', command: { goal: { discretion: {
      condition: 'turned', fallback: { objective: region, posture: 'hold', discretion: {
        condition: 'outmatched', fallback: { objective: null, posture: 'hold' },
      } },
    } } } });
    if (parsed.kind === 'command') expect(commandText(parsed.command, t)).toContain(`if turned, hold ${region} | if outmatched, hold in place`);
  }
  expect(parseLine(`order ${post} hold fallback=unknown,hold,-`, heard, t)).toMatchObject({ kind: 'error' });
});
