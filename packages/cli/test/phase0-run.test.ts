import { phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { percentile, phase0Run, tickTiming } from '../src/phase0-run.ts';
import { seatsMechanics, seatsWorld } from '../src/seats-world.ts';

/** The Phase 0 runner (lane 0.8, step 1): hashes at checkpoints, a per-day summary, scores, liveness, timings. */
describe('the Phase 0 runner on the testbed', () => {
  const daily = phase0Run({ pack: 'testbed', days: 40, hash: 'daily', resumeAtDay: 15 });
  const checkpoints = phase0Run({ pack: 'testbed', days: 40, hash: 'checkpoints', checkpointEvery: 10, resumeAtDay: 15 });

  it('hashes only at checkpoints and the last day, and they are the daily run’s hashes', () => {
    expect(daily.turns).toHaveLength(40);
    expect(checkpoints.turns.map((t) => t.turn)).toEqual([10, 20, 30, 40]);
    for (const t of checkpoints.turns) expect(t.hash, `day ${t.turn}`).toBe(daily.turns[t.turn - 1]!.hash);
    expect(checkpoints.finalHash).toBe(daily.finalHash);
    expect(checkpoints.initialHash).toBe(daily.initialHash);
  });

  it('a last day off the cadence is still hashed', () => {
    const odd = phase0Run({ pack: 'testbed', days: 25, hash: 'checkpoints', checkpointEvery: 10 });
    expect(odd.turns.map((t) => t.turn)).toEqual([10, 20, 25]);
    expect(odd.turns.at(-1)!.hash).toBe(odd.finalHash);
  });

  it('replays the log to every hash it took and resumes from a mid-run save, in either mode', () => {
    for (const s of [daily, checkpoints]) {
      expect(s.replay).toEqual({ matches: true, firstDifferentDay: null });
      expect(s.resume).toEqual({ atTurn: 15, finalHash: s.finalHash, matches: true, savedLogReplays: true });
    }
  });

  it('reports a checkpoint score for each checkpoint, with the hash taken that day', () => {
    expect(checkpoints.checkpoints.map((c) => c.day)).toEqual([10, 20, 30, 40]);
    for (const c of checkpoints.checkpoints) {
      expect(c.hash).toBe(daily.turns[c.day - 1]!.hash);
      expect(c.scores.factions.length).toBeGreaterThanOrEqual(2);
      expect(c.scores.blocksTotal).toBeGreaterThan(0);
    }
  });

  it('summarises every day: what fired, decision points and rejections', () => {
    expect(daily.daily.map((d) => d.day)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    const total = new Map<string, number>();
    for (const d of daily.daily) for (const [m, n] of Object.entries(d.fires)) total.set(m, (total.get(m) ?? 0) + n);
    for (const row of daily.liveness) expect(total.get(row.mechanic) ?? 0, row.mechanic).toBe(row.fires);
    expect(daily.daily.reduce((n, d) => n + d.decisionPoints, 0)).toBe(daily.decisionPoints);
  });

  it('declares every mechanic of the tick and the map, and reports each, at zero if it never fired', () => {
    expect(daily.liveness.map((r) => r.mechanic).sort()).toEqual([...seatsMechanics()].sort());
    expect(daily.liveness.some((r) => r.fires === 0)).toBe(true);
    expect(daily.liveness.some((r) => r.fires > 0)).toBe(true);
  });

  it('is deterministic: a second run gives the same hashes', () => {
    const again = phase0Run({ pack: 'testbed', days: 40, hash: 'daily' });
    expect(again.turns).toEqual(daily.turns);
    expect(again.worldHash).toBe(daily.worldHash);
  });

  it('times the tick only when asked, with no hashing in the measure', () => {
    expect(daily.timing).toBeNull();
    const timed = phase0Run({ pack: 'testbed', days: 20, timings: true });
    expect(timed.timing).not.toBeNull();
    expect(timed.timing!.days).toBe(20);
    expect(timed.timing!.median).toBeLessThanOrEqual(timed.timing!.p95);
    expect(timed.timing!.p95).toBeLessThanOrEqual(timed.timing!.max);
    // The run itself is the same game, timed or not.
    expect(timed.finalHash).toBe(phase0Run({ pack: 'testbed', days: 20 }).finalHash);
  });

  it('refuses a resume day outside the run and a cadence that is not a whole number', () => {
    expect(() => phase0Run({ pack: 'testbed', days: 10, resumeAtDay: 10 })).toThrow(RangeError);
    expect(() => phase0Run({ pack: 'testbed', days: 10, checkpointEvery: 0 })).toThrow(RangeError);
  });
});

describe('the clock statistics', () => {
  it('takes the nearest-rank percentile, median to maximum', () => {
    const t = tickTiming([5, 1, 4, 2, 3, 10, 9, 8, 7, 6]);
    expect(t).toEqual({ unit: 'ms', days: 10, median: 5, p95: 10, max: 10 });
    expect(percentile([1, 2, 3, 4], 50)).toBe(2);
    expect(() => percentile([], 50)).toThrow(RangeError);
  });
});

describe('the session loop’s hash cadence', () => {
  const { world, setup } = seatsWorld('testbed');
  const run = (hashEvery?: number) => phase0.playDays(world, phase0.createState(world, setup), () => ({ driver: 'rules' as const, respond: () => ({ answerKind: 'commands' as const, commands: [] }) }), 7, hashEvery === undefined ? {} : { hashEvery });

  it('changes which hashes are listed and nothing about the game', () => {
    const every = run();
    const sparse = run(3);
    expect(every.hashes.map((h) => h.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(sparse.hashes.map((h) => h.day)).toEqual([3, 6, 7]);
    expect(sparse.hashes.at(-1)).toEqual(every.hashes.at(-1));
  });
});
