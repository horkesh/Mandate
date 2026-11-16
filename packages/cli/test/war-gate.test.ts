import { canonicalHash, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

/**
 * The war gate (0064; lane 0.8, step 4): the generic rule-seat principal keeps every standing goal at hold
 * until his faction is at war, and opens his campaign the first morning after. "At war" is a chain flag the
 * pack names in its rule-seat settings: in union-1861 each side's own opening decision (lane 1.11: the seceded side's
 * seat opens the war, the president answers once he knows), in the testbed none (war from day 1). `atWar` is the labelled
 * mechanics option, no longer needed for a history run.
 */
const rules = createRuleSeat();
const seats = () => rules;
const orders = (log: readonly { readonly day: number; readonly command: { readonly cmd: string } }[]) => log.filter((e) => e.command.cmd === 'order');
/** The days of the orders that went down the chain: a later order sent around it answers an objection (lane 1.1: relays push back). */
const chainOrderDays = (log: readonly { readonly day: number; readonly command: { readonly cmd: string } }[]) => orders(log).filter((e) => (e.command as { readonly bypass?: boolean }).bypass !== true).map((e) => e.day);
const aroundEveryObjection = (log: readonly { readonly day: number; readonly command: { readonly cmd: string } }[]) => orders(log).filter((e) => (e.command as { readonly bypass?: boolean }).bypass === true).every((e) => (e.command as { readonly route?: string }).route === 'special-messenger');

describe('the war gate on union-1861', () => {
  const { world, setup } = seatsWorld('union-1861');
  const warFlags = world.map.world.rules.ruleSeats.warFlags;

  it('names a war flag for every faction, each set only by a decision option of that side’s own opening situation (0066)', () => {
    expect(warFlags.length).toBe(world.map.world.factions.length);
    for (const { faction, flag } of warFlags) {
      const setters = world.situations.flatMap((s) => s.options.filter((o) => o.effects.some((e) => 'setFlag' in e && e.setFlag === flag)).map((o) => [s.id, s.kind, s.faction, o.id]));
      expect(setters.length, flag!).toBeGreaterThan(0);
      for (const [, kind, side] of setters) expect([kind, side]).toEqual(['decision', faction]);
      // No notice, inaction or other side sets it.
      expect(world.situations.some((s) => s.effects.some((e) => 'setFlag' in e && e.setFlag === flag)), flag!).toBe(false);
    }
  });

  it('keeps the peace until the opening decisions, then each side is at war from its own decision, with no labelled option (lane 1.11)', () => {
    const start = phase0.createState(world, setup);
    const peace = phase0.playDays(world, start, seats, 30, { freeze: true });
    expect(orders(peace.log)).toEqual([]);
    expect(peace.state.situationFlags[warFlags.find((r) => r.faction === 'confederate')!.flag!]).toBeUndefined();
    const run = phase0.playDays(world, peace.state, seats, 30, { freeze: true });
    const day = (faction: string) => run.state.situationFlags[warFlags.find((r) => r.faction === faction)!.flag!]!;
    // The seceded side's seat opens the war (0040's labelled railroad); the president answers once he knows.
    expect(day('confederate')).toBeGreaterThan(30);
    expect(day('union')).toBeGreaterThanOrEqual(day('confederate'));
    expect(Math.min(...orders(run.log).map((e) => e.day))).toBeGreaterThan(day('confederate'));
    expect(run.state.forceLocations).not.toEqual(peace.state.forceLocations);
  });
  it('the labelled option sets the pack’s own war flags on day 0 and nothing else; it is State, so the run hashes differently', () => {
    const peace = phase0.createState(world, setup);
    const war = phase0.createState(world, { ...setup, atWar: true });
    expect(peace.situationFlags).toEqual({});
    expect(war.situationFlags).toEqual(Object.fromEntries(warFlags.map((r) => [r.flag, 0])));
    expect({ ...war, situationFlags: {} }).toEqual(peace);
    expect(canonicalHash(war)).not.toBe(canonicalHash(peace));
  });

  it('a war that begins mid-run opens his campaign the next morning, once', () => {
    const peace = phase0.createState(world, setup);
    const early = phase0.playDays(world, peace, seats, 10, { freeze: true });
    expect(orders(early.log)).toEqual([]);
    // What a situation's effect would do on day 10: set the pack's war flags (the test plays the situation's part).
    const flags = Object.fromEntries(warFlags.map((r) => [r.flag, 10]));
    const declared = { ...early.state, situationFlags: flags };
    const late = phase0.playDays(world, declared, seats, 10, { freeze: true });
    expect(chainOrderDays(late.log)).toEqual([11, 11]);
    expect(aroundEveryObjection(late.log)).toBe(true);
    expect(late.state.forceLocations).not.toEqual(early.state.forceLocations);
  });
});

describe('the war gate on the testbed', () => {
  const { world, setup } = seatsWorld('testbed');

  it('names no war flag: war from day 1, with or without the option, which changes nothing there', () => {
    expect(world.map.world.rules.ruleSeats.warFlags.every((r) => r.flag === null)).toBe(true);
    const plain = phase0.createState(world, setup);
    const labelled = phase0.createState(world, { ...setup, atWar: true });
    expect(canonicalHash(labelled)).toBe(canonicalHash(plain));
    const run = phase0.playDays(world, plain, seats, 5, { freeze: true });
    expect(chainOrderDays(run.log)).toEqual([1, 1]);
  });
});
