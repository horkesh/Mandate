import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COMMAND_KINDS, type Command } from '../src/log/commands.ts';
import { entryProblems } from '../src/log/log.ts';

/**
 * The verb list is the interface (FOUNDATION section 11.10), for Phase 0's kernel as for M2's console
 * (`packages/cli/test/verb-list.test.ts` guards M2's `VERBS`). The new kernel's commands are pinned here (exit review
 * S4, 0072): a new command changes this list on purpose, and the Phase 1 console's own verb-list test will map its
 * commands onto it. None moves a division: a place is named only inside an order to the holder of a post (hard rule 1).
 */

/** Compile time: the logged command union and the list name the same kinds. */
type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const KINDS_MATCH: Same<Command['cmd'], (typeof COMMAND_KINDS)[number]> = true;

const entry = (command: unknown) => ({ day: 1, seat: 'seat.a_lead', command });
const WELL_FORMED: Readonly<Record<(typeof COMMAND_KINDS)[number], unknown>> = {
  choose: { cmd: 'choose', request: 'standing:a_army:1', option: 'hold' },
  decide: { cmd: 'decide', situation: 'ordinance', options: [] },
  delegate: { cmd: 'delegate', situation: 'ordinance', to: 'a_office' },
  order: { cmd: 'order', to: 'a_army', goal: 'advance', region: 'b_cap', route: 'wire', bypass: false },
};

describe("Phase 0's command list (the verb-list test, 0072)", () => {
  it('is exactly choose, decide, delegate and order', () => {
    expect(KINDS_MATCH).toBe(true);
    expect([...COMMAND_KINDS]).toEqual(['choose', 'decide', 'delegate', 'order']);
  });

  it('the log accepts each, well formed', () => {
    for (const kind of COMMAND_KINDS) expect(entryProblems(entry(WELL_FORMED[kind]), 0), kind).toEqual([]);
  });

  it('refuses a command that would move a division, and an order that names a force (positive controls)', () => {
    for (const cmd of ['move', 'march', 'attack', 'reinforce', 'garrison', 'retreat', 'assign']) {
      expect(entryProblems(entry({ cmd, to: 'a_army', region: 'b_cap' }), 0), cmd).toEqual(['entry 0: unknown command']);
    }
    const withForce = { ...(WELL_FORMED.order as object), division: 'a_1' };
    expect(entryProblems(entry(withForce), 0)).toEqual(['entry 0: order has fields [bypass, cmd, division, goal, region, route, to], expected [bypass, cmd, goal, region, route, to]']);
  });

  it('the tick handles every kind and no other', () => {
    const tick = readFileSync(new URL('../src/tick/tick.ts', import.meta.url), 'utf8');
    const branched = [...tick.matchAll(/c\.cmd === '([a-z]+)'/g)].map((m) => m[1]);
    // `choose` is the tick's last branch: whatever is not an order, a decision or a delegation.
    expect([...new Set(branched), 'choose'].sort()).toEqual([...COMMAND_KINDS]);
  });
});
