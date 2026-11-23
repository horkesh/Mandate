import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '../src/index.ts';
import { ConditionSchema, holdsOnNothing } from '../../pack-format/src/situations.ts';

const id = ids.toId('situation', 'prior');
const prior: phase0.SituationRecord = {
  sitStatus: 'decided', sitFiredDay: 10, sitSurfacedDay: 13,
  sitOpenOptions: [], sitResurfaced: [], sitDecidedDay: 17,
  sitChosen: ['send'], sitDecidedBy: 'principal', sitDelegate: null,
  sitWaitingOn: null, sitStaffAuthor: null,
};
const context = (day: number, record: phase0.SituationRecord | null = prior) => ({
  state: { ...phase0.emptyState(), situationStates: record === null ? {} : { [id]: record } },
  day, situation: null, knowledge: { knownReports: [] }, since: null,
});

describe('S58: elapsed time retains its State cause', () => {
  it('waits the stated interval from the event, independently of receipt', () => {
    const c = ConditionSchema.parse({ fired: id, forDays: 8 });
    expect(phase0.holds(c, context(17))).toBe(false);
    expect(phase0.holds(c, context(18))).toBe(true);
    expect(phase0.holds(c, context(100, null))).toBe(false);
    expect(phase0.holds(c, context(18, { ...prior, sitSurfacedDay: null }))).toBe(true);
    expect(holdsOnNothing(c)).toBe(false);
  });
  it('waits from the actual decision, with the named choice and final status', () => {
    const c = ConditionSchema.parse({ decided: id, options: ['send'], forDays: 31 });
    expect(phase0.holds(c, context(47))).toBe(false);
    expect(phase0.holds(c, context(48))).toBe(true);
    expect(phase0.holds(c, context(100, null))).toBe(false);
    expect(phase0.holds(c, context(100, { ...prior, sitChosen: [] }))).toBe(false);
    expect(phase0.holds(c, context(100, { ...prior, sitStatus: 'waiting' }))).toBe(false);
    expect(phase0.holds(c, context(100, { ...prior, sitDecidedDay: null }))).toBe(false);
    expect(holdsOnNothing(c)).toBe(false);
  });
  it('keeps existing predicates unchanged and validates whole nonnegative days', () => {
    expect(phase0.holds(ConditionSchema.parse({ fired: id }), context(10))).toBe(true);
    expect(phase0.holds(ConditionSchema.parse({ decided: id, options: null }), context(17))).toBe(true);
    for (const field of [{ fired: id }, { decided: id, options: null }]) {
      expect(ConditionSchema.safeParse({ ...field, forDays: 0 }).success).toBe(true);
      for (const forDays of [-1, 0.5]) expect(ConditionSchema.safeParse({ ...field, forDays }).success).toBe(false);
    }
  });
});
