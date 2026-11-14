import { readFileSync } from 'node:fs';
import { canonicalHash, decodeSave, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { dispatchLog } from '../src/desk/dispatches.ts';
import { seatsRun, seatsWorld } from '../src/seats-run.ts';

const REGENERATE =
  'the saved shape of State or a mechanic changed. Before any public build: regenerate with `npx tsx tools/make-save-fixture.ts` and say so in the commit. After one: bump CURRENT_SAVE_SCHEMA and add a migration.';

describe('the seats layer on the testbed, every seat on the rules model', () => {
  const summary = seatsRun({ pack: 'testbed', days: 120, resumeAtDay: 40 });

  it('replays its log to every day’s hash, and resumes from a mid-run save to the same final hash', () => {
    expect(summary.turns).toHaveLength(120);
    expect(summary.replay).toEqual({ matches: true, firstDifferentDay: null });
    expect(summary.resume).toEqual({ atTurn: 40, finalHash: summary.finalHash, matches: true, savedLogReplays: true });
    expect(summary.logEntries).toBeGreaterThan(0);
    expect(summary.rejections).toBe(0);
  });

  it('is deterministic: a second run gives the same hash on every day', () => {
    const again = seatsRun({ pack: 'testbed', days: 120 });
    expect(again.turns).toEqual(summary.turns);
    expect(again.worldHash).toBe(summary.worldHash);
  });

  it('fires the seats layer’s core mechanics on the testbed', () => {
    const fires = Object.fromEntries(summary.liveness.map((r) => [r.mechanic, r.fires]));
    for (const m of ['messages.sent', 'messages.delivered', 'messages.courier_delay', 'orders.relayed', 'orders.obeyed', 'knowledge.pruned_superseded', 'standin.advance']) {
      expect(fires[m], m).toBeGreaterThan(0);
    }
  });
});

describe('the real mid-run save fixture (testbed, day 40)', () => {
  const text = readFileSync(new URL('./fixtures/saves/testbed-seats-day40.json', import.meta.url), 'utf8');
  const { world, worldHash, seed } = seatsWorld('testbed');
  const seat = createRuleSeat();

  it('loads against the current testbed World, with its log and both hashes', () => {
    const save = decodeSave(text, { expectedWorldHash: worldHash });
    expect(save.log.length, 'the fixture should carry commands').toBeGreaterThan(0);
    expect((save.state as unknown as phase0.State).stateDay).toBe(40);
  });

  it('its log, replayed from the start, reproduces its State (the log is the truth)', () => {
    const save = decodeSave(text, { expectedWorldHash: worldHash });
    const replayed = phase0.replay(world, phase0.createState(world, { seed }), save.log as unknown as phase0.CommandLog, 40, { freeze: true });
    expect(canonicalHash(replayed.state), REGENERATE).toBe(save.stateHash);
  });

  it('resuming from it reaches the continuous run’s final hash', () => {
    const save = decodeSave(text, { expectedWorldHash: worldHash });
    const continuous = phase0.playDays(world, phase0.createState(world, { seed }), () => seat, 120, { freeze: true });
    const resumed = phase0.playDays(world, save.state as unknown as phase0.State, () => seat, 80, { freeze: true });
    expect(canonicalHash(resumed.state), REGENERATE).toBe(canonicalHash(continuous.state));
    expect(resumed.hashes, REGENERATE).toEqual(continuous.hashes.slice(40));
  });
});

describe('the desk reads a view, never State', () => {
  it('lists the principal’s dispatches from his view', () => {
    const { world, seed } = seatsWorld('testbed');
    const seat = createRuleSeat();
    const end = phase0.playDays(world, phase0.createState(world, { seed }), () => seat, 20).state;
    const principal = world.faction(world.factionIds[0]!).principal;
    const lines = dispatchLog(phase0.viewFor(world, end, phase0.seatIdFor(principal)));
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.join('\n')).toContain('wire-dispatch');
  });
});
