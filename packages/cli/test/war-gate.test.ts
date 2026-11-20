import { canonicalHash, createTelemetry, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { seatsMechanics, seatsWorld } from '../src/seats-world.ts';

/**
 * The war gate (0064): doctrine waits for each side's own opening decision (lane 1.11), then calls,
 * concentrates and orders through people (lane 1.12). The labelled atWar option opens the war on day 0.
 */
const rules = createRuleSeat();
const seats = () => rules;
type Entry = { readonly day: number; readonly seat: string; readonly command: { readonly cmd: string } };
const orders = (log: readonly Entry[]) => log.filter((e) => e.command.cmd === 'order');
/** What the principals' doctrine sends (lane 1.12): goals, calls, appointments, transfers, inquiries. */
const DOCTRINE = new Set(['order', 'call', 'appoint', 'transfer', 'inquire']);
const doctrine = (log: readonly Entry[]) => log.filter((e) => DOCTRINE.has(e.command.cmd));
/** The seats that called on their governors on a day. */
const callers = (log: readonly Entry[], day: number) => [...new Set(log.filter((e) => e.command.cmd === 'call' && e.day === day).map((e) => e.seat))];
/** The days of the orders that went down the chain: a later order sent around it answers an objection (lane 1.1: relays push back). */
const chainOrderDays = (log: readonly Entry[]) => orders(log).filter((e) => (e.command as { readonly bypass?: boolean }).bypass !== true).map((e) => e.day);

describe('the war gate on union-1861', () => {
  const { world, setup } = seatsWorld('union-1861');
  const warFlags = world.map.world.rules.ruleSeats.warFlags;

  it('names a war flag for every faction, each set only by a decision option of that side’s own opening situation (0066)', () => {
    expect(warFlags.length).toBe(world.map.world.factions.length);
    expect(warFlags.every((r) => r.flag !== null)).toBe(true);
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
    expect(doctrine(peace.log)).toEqual([]);
    expect(peace.state.situationFlags[warFlags.find((r) => r.faction === 'confederate')!.flag!]).toBeUndefined();
    let firstFire: number | null = null;
    let firstKnowledge: number | null = null;
    const telemetry = createTelemetry(seatsMechanics());
    const run = phase0.playDays(world, peace.state, seats, 30, { freeze: true, telemetry, onDay: (r) => {
      if (telemetry.mechanics['combat.bombardment']!.fires > 0) firstFire ??= r.day;
      const dispatch = r.state.knowledgeBySeat['seat:lincoln_abraham' as never]?.knownReports.find((paper) => paper.knownBody.reportAuthor === 'anderson_robert' && paper.knownBody.reportSubjectId === 'fort_sumter' && paper.knownBody.reportClaims.some((c) => c.claimKind === 'battle-phase'));
      if (dispatch !== undefined) {
        firstKnowledge ??= dispatch.knownReceivedDay;
        expect(dispatch.knownRoute).toBe('wire');
        expect(dispatch.knownBody.reportDay).toBeGreaterThanOrEqual(firstFire!);
      }
    } });
    const day = (faction: string) => run.state.situationFlags[warFlags.find((r) => r.faction === faction)!.flag!]!;
    // The seceded side's seat opens the war (0040's labelled railroad); the president answers once he knows.
    expect(day('confederate')).toBeGreaterThan(30);
    expect(day('union')).toBeGreaterThanOrEqual(day('confederate'));
    expect(firstFire).toBe(38);
    expect(firstKnowledge).toBe(38);
    const firedUpon = run.state.situationStates['sumter_fired_upon' as never]!;
    const call = run.state.situationStates['call_for_troops' as never]!;
    expect(firedUpon.sitFiredDay).toBeGreaterThanOrEqual(firstFire!);
    expect(firedUpon.sitSurfacedDay).toBe(38);
    expect(call).toMatchObject({ sitSurfacedDay: 40, sitDecidedDay: 41 });
    expect(day('union')).toBe(41);
    expect(run.state.situationFlags.virginia_seceded).toBeGreaterThan(day('union'));
    expect(run.state.situationStates['virginia_secedes' as never]!.sitFiredDay).toBeGreaterThan(day('union'));
    expect(Math.min(...orders(run.log).map((e) => e.day))).toBeGreaterThan(day('confederate'));
    expect(run.state.forceLocations).not.toEqual(peace.state.forceLocations);
  });

  it('the labelled at-war option starts doctrine, calls and concentration', () => {
    const war = phase0.createState(world, { ...setup, atWar: true });
    const warRun = phase0.playDays(world, war, seats, 60, { freeze: true });
    // Both principals start on the first morning (each asks his army where it stands). The seceding side's doctrine calls on
    // 8 April (day 34). The Union's call belongs to its news-driven authored decision, including with war forced on:
    // no dated doctrine row duplicates it; what they raise still goes to the concentration post. Sumter's goal belongs to the
    // authored opening alone: the doctrine sends no second goal down the chain, and only answers its relay objection.
    expect(Math.min(...doctrine(warRun.log).map((e) => e.day))).toBe(1);
    expect(Math.min(...warRun.log.filter((e) => e.command.cmd === 'call').map((e) => e.day))).toBe(34);
    expect(callers(warRun.log, 34)).toEqual(['seat:davis_jefferson']);
    expect(callers(warRun.log, 41)).not.toContain('seat:lincoln_abraham');
    const nyAnswers = Object.values(warRun.state.orderResponses).filter((r) =>
      r.respKind === 'call' && r.respRole === 'addressee' && r.respPost === 'st_gov_new_york');
    expect(nyAnswers).toHaveLength(1);
    expect(nyAnswers[0]!.respDay).toBe(41);
    expect(Object.keys(warRun.state.forceBlockStates).some((b) => b.startsWith('raised.st_gov_new_york.'))).toBe(true);
    expect(warRun.log.some((e) => e.command.cmd === 'transfer')).toBe(true);
    expect(chainOrderDays(warRun.log)).toEqual([]);
    expect(orders(warRun.log)).toHaveLength(1);
    expect(orders(warRun.log).every((e) => (e.command as unknown as { readonly to: string }).to === 'cs_cmd_charleston')).toBe(true);
    expect(warRun.state.forceLocations).not.toEqual(war.forceLocations);
  });
  it('the labelled option sets the pack’s own war flags on day 0 and nothing else; it is State, so the run hashes differently', () => {
    const peace = phase0.createState(world, setup);
    const war = phase0.createState(world, { ...setup, atWar: true });
    expect(peace.situationFlags).toEqual({});
    expect(war.situationFlags).toEqual(Object.fromEntries(warFlags.map((r) => [r.flag, 0])));
    expect({ ...war, situationFlags: {} }).toEqual(peace);
    expect(canonicalHash(war)).not.toBe(canonicalHash(peace));
  });

  it('a war that begins mid-run starts his doctrine the next morning, and each governor is called once', () => {
    const peace = phase0.createState(world, setup);
    const early = phase0.playDays(world, peace, seats, 10, { freeze: true });
    expect(doctrine(early.log)).toEqual([]);
    // What a situation's effect would do on day 10: set the pack's war flags (the test plays the situation's part).
    const flags = Object.fromEntries(warFlags.map((r) => [r.flag, 10]));
    const declared = { ...early.state, situationFlags: flags };
    const late = phase0.playDays(world, declared, seats, 50, { freeze: true });
    expect(Math.min(...doctrine(late.log).map((e) => e.day))).toBe(11);
    // Each call still waits for its own date (8 and 15 April), and goes once.
    expect(Math.min(...late.log.filter((e) => e.command.cmd === 'call').map((e) => e.day))).toBe(34);
    expect(callers(late.log, 34)).toEqual(['seat:davis_jefferson']);
    const called = late.log.filter((e) => e.command.cmd === 'call').map((e) => (e.command as unknown as { readonly to: string }).to);
    expect(new Set(called).size).toBe(called.length);
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
