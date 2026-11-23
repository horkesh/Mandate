import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COMMAND_KINDS, type Command } from '../src/log/commands.ts';
import { entryProblems } from '../src/log/log.ts';

/**
 * The verb list is the interface (FOUNDATION section 11.10, rule 10: the edit grammar is part of it), for the new kernel as for M2's console
 * (`packages/cli/test/verb-list.test.ts` guards M2's `VERBS`). The new kernel's commands are pinned here (exit review
 * S4, 0072): a new command changes this list on purpose, and the Phase 1 console's own verb-list test will map its
 * commands onto it. None moves a division: a place is named only inside an order to the holder of a post, a goal or an
 * edit of his plan's arrows within 0026's grammar (hard rule 1). Lane 1.2 adds `review` (approve, send back, edit) and `go`.
 * Lane 1.5 adds the people verbs: each an order to a person; a transfer names two posts and an amount, never a block.
 * Lane 1.12 adds `battle`: a commander's own orders for his battle, sent by the holder of the post and never by a
 * principal; it names no place and no block.
 */

/** Compile time: the logged command union and the list name the same kinds. */
type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const KINDS_MATCH: Same<Command['cmd'], (typeof COMMAND_KINDS)[number]> = true;

const entry = (command: unknown) => ({ day: 1, seat: 'seat.a_lead', command });
const WELL_FORMED: Readonly<Record<(typeof COMMAND_KINDS)[number], unknown>> = {
  recall_offer: {cmd:'recall_offer',offer:'m.offer'},
  answer_proposal: { cmd: 'answer_proposal', to: 'a_army', proposal: 'm.proposal', action: 'accept', route: 'wire', bypass: false },
  call: { cmd: 'call', to: 'a_army', regiments: 2, termDays: 90, route: 'wire', bypass: false },
  battle: { cmd: 'battle', post: 'a_army', commit: 'probe', night: 'judge', cutOff: 'break_out', pursue: 'judge' },
  choose: { cmd: 'choose', request: 'plan:a_army:1', option: 'direct:least_cost:a_front>b_front' },
  decide: { cmd: 'decide', situation: 'ordinance', options: [] },
  delegate: { cmd: 'delegate', situation: 'ordinance', to: 'a_office' },
  go: { cmd: 'go', to: 'a_army', route: 'wire', bypass: false },
  order: {
    cmd: 'order',
    to: 'a_army',
    goal: { objective: 'b_cap', posture: 'take', risk: 500, deadlineDays: 20, rail: true, river: false, sea: false, neutral: false, committed: [], awaitWord: false, approveAsDrafted: true },
    route: 'wire',
    bypass: false,
  },
  review: { cmd: 'review', to: 'a_army', action: 'edit', edit: { kind: 'waypoints', axis: 'main', region: null, via: ['a_mid'], concentration: null }, route: 'wire', bypass: false },
  // Lane 1.5: the people verbs.
  appoint: { cmd: 'appoint', post: 'a_army', person: 'a_bold', rank: null, route: 'wire' },
  relieve: { cmd: 'relieve', post: 'a_army', mode: 'quiet_department', to: 'a_reserve', route: 'wire' },
  transfer: { cmd: 'transfer', from: 'a_reserve', to: 'a_army', force: 'men', amount: 300, route: 'wire' },
  inquire: { cmd: 'inquire', to: 'a_army', subject: 'b_front', route: 'wire' },
  consult: { cmd: 'consult', situation: 'ordinance', posts: ['a_office'] },
  audience: { cmd: 'audience', to: 'a_army', counters: [{ kind: 'vindicate', value: null, boldness: null, from: null, men: null }] },
  observer: { cmd: 'observer', person: 'a_spy', to: 'a_army', route: 'courier' },
  promise: { cmd: 'promise', person: 'a_bold' },
  pressure: { cmd: 'pressure', person: 'a_gen' },
  address: { cmd: 'address', bloc: 'greens' },
};

describe("the new kernel's command list (the verb-list test, 0072; lane 1.2)", () => {
  it('is exactly the plan commands, lane 1.7’s call, lane 1.5’s people verbs and lane 1.12’s battle orders', () => {
    expect(KINDS_MATCH).toBe(true);
    expect([...COMMAND_KINDS]).toEqual(['address', 'answer_proposal', 'appoint', 'audience', 'battle', 'call', 'choose', 'consult', 'decide', 'delegate', 'go', 'inquire', 'observer', 'order', 'pressure', 'promise', 'recall_offer', 'relieve', 'review', 'transfer']);
  });

  it('the log accepts each, well formed', () => {
    for (const kind of COMMAND_KINDS) expect(entryProblems(entry(WELL_FORMED[kind]), 0), kind).toEqual([]);
  });

  it('refuses a command that would move a division, and an order that names a force (positive controls)', () => {
    for (const cmd of ['move', 'march', 'attack', 'reinforce', 'garrison', 'retreat', 'assign']) {
      expect(entryProblems(entry({ cmd, to: 'a_army', region: 'b_cap' }), 0), cmd).toEqual(['entry 0: unknown command']);
    }
    const withForce = { ...(WELL_FORMED.order as object), division: 'a_1' };
    expect(entryProblems(entry(withForce), 0)).toEqual(['entry 0: order has fields [bypass, cmd, division, goal, route, to], expected [bypass, cmd, goal, route, to]']);
    // An edit is within the grammar or refused: no edit kind names a division, and a goal carries only blocks the post commands.
    const moveEdit = { ...(WELL_FORMED.review as object), edit: { kind: 'move_division', axis: 'main', region: 'b_cap', via: [], concentration: null } };
    expect(entryProblems(entry(moveEdit), 0)).toEqual(['entry 0: review.edit kind must be one of add_axis, objective, remove_axis, timing, waypoints']);
  });

  it('a transfer names posts and an amount, never a division; a verb that names a place does so only as an inquiry’s subject (hard rule 1)', () => {
    const withBlock = { ...(WELL_FORMED.transfer as object), blocks: ['a_army_1'] };
    expect(entryProblems(entry(withBlock), 0)).toEqual(['entry 0: transfer has fields [amount, blocks, cmd, force, from, route, to], expected [amount, cmd, force, from, route, to]']);
    expect(entryProblems(entry({ ...(WELL_FORMED.relieve as object), mode: 'shot' }), 0)).toEqual(['entry 0: relieve.mode must be one of own_request, outright, quiet_department', 'entry 0: relieve.to names the quiet post for quiet_department, and only for it']);
    expect(entryProblems(entry({ ...(WELL_FORMED.audience as object), counters: [{ kind: 'bribe', value: null, boldness: null, from: null, men: null }] }), 0)[0]).toContain('audience.counters must be counters');
  });

  it('battle orders name no place and no block, and each point takes only its own answers (hard rule 1)', () => {
    expect(entryProblems(entry({ ...(WELL_FORMED.battle as object), region: 'b_cap' }), 0)[0]).toContain('battle has fields');
    expect(entryProblems(entry({ ...(WELL_FORMED.battle as object), commit: 'massacre' }), 0)).toEqual(['entry 0: battle.commit must be one of judge, all_out, main, probe, defend']);
    expect(entryProblems(entry({ ...(WELL_FORMED.battle as object), cutOff: 'stay' }), 0)).toEqual(['entry 0: battle.cutOff must be one of judge, break_out, surrender']);
  });

  it('the tick handles every kind and no other', () => {
    const tick = readFileSync(new URL('../src/tick/tick.ts', import.meta.url), 'utf8');
    const branched = [...tick.matchAll(/c\.cmd === '([a-z_]+)'/g)].map((m) => m[1]);
    // `choose` is the tick's last branch: whatever is not an order, a review, a go, a decision or a delegation.
    expect([...new Set(branched), 'choose'].sort()).toEqual([...COMMAND_KINDS]);
  });
});
