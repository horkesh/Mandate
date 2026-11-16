import { decodeSave, encodeSave, phase0, SaveError } from '@mandate/kernel';
import { createRuleSeat, DEFAULT_RULE_SEAT_POLICY } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { phase0Run } from '../src/phase0-run.ts';
import { seatsWorld } from '../src/seats-world.ts';

/**
 * The resume check (FOUNDATION section 12: "resumes from a mid-run save to the same final hash as
 * the continuous run"; AWWV's resumed games drifted by 616 differences). Each check has a positive
 * control: a planted divergence that the check must catch, or it checks nothing.
 */

/** The rules model with a different opening day: on the resumed leg, the principal opens a second campaign. */
const SECOND_OPENING: phase0.SeatTable = (() => {
  const seat = createRuleSeat({ ...DEFAULT_RULE_SEAT_POLICY, openingDay: 5 });
  return () => seat;
})();

describe('resume = continuous', () => {
  // The Union run starts at war by the labelled option (0064), or nothing would move to resume.
  for (const [pack, days, at, atWar] of [
    ['testbed', 120, 40, false],
    ['union-1861', 75, 30, true],
  ] as const) {
    it(`${pack}: a save at day ${at}, loaded, plays on to the continuous run's final hash`, () => {
      const saves: string[] = [];
      const s = phase0Run({ pack, days, atWar, resumeAtDay: at, hash: 'checkpoints', onSave: (text) => saves.push(text) });
      expect(s.resume).toEqual({ atTurn: at, finalHash: s.finalHash, matches: true, savedLogReplays: true });
      expect(saves).toHaveLength(1);
      // The save really is a mid-run save: it carries the day and the log up to it, and loads on this World.
      const loaded = decodeSave(saves[0]!, { expectedWorldHash: s.worldHash });
      expect((loaded.state as unknown as phase0.State).stateDay).toBe(at);
      expect(loaded.log.length).toBeGreaterThan(0);
    });
  }

  it('the check can fail: a resumed leg whose seats act differently ends on another hash', () => {
    // Positive control for the resume check. Resuming at day 2 leaves the whole war ahead of the resumed leg.
    const s = phase0Run({ pack: 'testbed', days: 60, resumeAtDay: 2, resumeSeats: SECOND_OPENING });
    expect(s.resume!.matches, 'a different leg must not match').toBe(false);
    expect(s.resume!.finalHash).not.toBe(s.finalHash);
    // The saved log and State are still sound: the divergence is in the resumed play, and the check says where.
    expect(s.resume!.savedLogReplays).toBe(true);
  });

  it('the check can fail: a save whose State is not what its log makes is reported', () => {
    // Positive control for the save check: the day-30 log saved beside a State that its replay never reaches.
    const s = phase0Run({
      pack: 'testbed',
      days: 40,
      resumeAtDay: 30,
      saveTransform: (text) => {
        const { worldHash } = seatsWorld('testbed');
        const save = decodeSave(text, { expectedWorldHash: worldHash });
        const state = save.state as unknown as phase0.State;
        // A hash-consistent save (encodeSave hashes what it is given), so only the log check can catch it.
        return encodeSave({ worldHash, state: { ...state, gameSeed: state.gameSeed + 1 }, log: save.log });
      },
    });
    expect(s.resume!.savedLogReplays).toBe(false);
    expect(s.resume!.matches, 'play from a State the log does not make ends elsewhere').toBe(false);
  });

  it('a tampered save does not load', () => {
    const { worldHash } = seatsWorld('testbed');
    let text = '';
    phase0Run({ pack: 'testbed', days: 12, resumeAtDay: 6, onSave: (t) => (text = t) });
    const tampered = text.replace('"stateDay":6', '"stateDay":7');
    expect(tampered).not.toBe(text);
    expect(() => decodeSave(tampered, { expectedWorldHash: worldHash })).toThrow(SaveError);
    // And a save made for another World is refused, even when it is intact.
    expect(() => decodeSave(text, { expectedWorldHash: seatsWorld('union-1861').worldHash })).toThrow(SaveError);
  });
});
