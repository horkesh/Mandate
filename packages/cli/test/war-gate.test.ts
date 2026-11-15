import { canonicalHash, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

/**
 * The war gate (0064; lane 0.8, step 4): the generic rule-seat principal keeps every standing goal at hold
 * until his faction is at war, and opens his campaign the first morning after. "At war" is a chain flag the
 * pack names in its rule-seat settings: in union-1861 the war's opening situation (not authored yet, so a
 * history run keeps the peace), in the testbed none (war from day 1). `atWar` is the labelled mechanics option.
 */
const rules = createRuleSeat();
const seats = () => rules;
const orders = (log: readonly { readonly day: number; readonly command: { readonly cmd: string } }[]) => log.filter((e) => e.command.cmd === 'order');

describe('the war gate on union-1861', () => {
  const { world, setup } = seatsWorld('union-1861');
  const warFlags = world.map.world.rules.ruleSeats.warFlags;

  it('names a war flag for every faction, and nothing sets it yet', () => {
    expect(warFlags.length).toBe(world.map.world.factions.length);
    expect(warFlags.every((r) => r.flag !== null)).toBe(true);
    expect(world.situations.length).toBe(0);
  });

  it('at peace: no order is given, no force marches, no ground changes hands (positive control: it does at war)', { timeout: 120_000 }, () => {
    const peace = phase0.createState(world, setup);
    const run = phase0.playDays(world, peace, seats, 40, { freeze: true });
    expect(orders(run.log)).toEqual([]);
    expect(run.state.regionControl).toEqual(peace.regionControl);
    expect(run.state.forceLocations).toEqual(peace.forceLocations);

    const war = phase0.createState(world, { ...setup, atWar: true });
    const warRun = phase0.playDays(world, war, seats, 40, { freeze: true });
    // Each side's principal opens once, on the first morning.
    expect(orders(warRun.log).map((e) => e.day)).toEqual([1, 1]);
    expect(warRun.state.forceLocations).not.toEqual(war.forceLocations);
    expect(warRun.state.regionControl).not.toEqual(war.regionControl);
  });

  it('the labelled option sets the pack’s own war flags on day 0 and nothing else; it is State, so the run hashes differently', () => {
    const peace = phase0.createState(world, setup);
    const war = phase0.createState(world, { ...setup, atWar: true });
    expect(peace.situationFlags).toEqual({});
    expect(war.situationFlags).toEqual(Object.fromEntries(warFlags.map((r) => [r.flag, 0])));
    expect({ ...war, situationFlags: {} }).toEqual(peace);
    expect(canonicalHash(war)).not.toBe(canonicalHash(peace));
  });

  it('a war that begins mid-run opens his campaign the next morning, once', { timeout: 120_000 }, () => {
    const peace = phase0.createState(world, setup);
    const early = phase0.playDays(world, peace, seats, 10, { freeze: true });
    expect(orders(early.log)).toEqual([]);
    // What a situation's effect would do on day 10: set the pack's war flags (the test plays the situation's part).
    const flags = Object.fromEntries(warFlags.map((r) => [r.flag, 10]));
    const declared = { ...early.state, situationFlags: flags };
    const late = phase0.playDays(world, declared, seats, 10, { freeze: true });
    expect(orders(late.log).map((e) => e.day)).toEqual([11, 11]);
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
    expect(orders(run.log).map((e) => e.day)).toEqual([1, 1]);
  });
});
