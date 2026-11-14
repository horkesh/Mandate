import { describe, expect, it } from 'vitest';
import { headlessRun } from '../src/headless.ts';

/**
 * Determinism (FOUNDATION section 11.1): the same scenario run twice gives the
 * same state hash after every turn, and a run resumed from a mid-run save ends
 * on the continuous run's hash (AWWV's resumed games drifted). CI runs the
 * same scenario on Linux and Windows and compares the hashes across machines.
 */
describe('determinism on the testbed', () => {
  const first = headlessRun({ pack: 'testbed', maxTurns: 20, resumeAtTurn: 6 });
  const second = headlessRun({ pack: 'testbed', maxTurns: 20 });

  it('plays enough turns to mean something', () => {
    expect(first.turns.length).toBeGreaterThan(5);
  });

  it('gives identical per-turn hashes on two runs', () => {
    expect(second.turns).toEqual(first.turns);
    expect(second.finalHash).toBe(first.finalHash);
    expect(second.worldHash).toBe(first.worldHash);
  });

  it('changes the hash as the game moves (the hash is not constant)', () => {
    expect(new Set(first.turns.map((t) => t.hash)).size).toBe(first.turns.length);
  });

  it('resumes from a mid-run save to the same final hash as the continuous run', () => {
    expect(first.resume).toEqual({ atTurn: 6, finalHash: first.finalHash, matches: true });
  });
});
