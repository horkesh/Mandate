import { describe, expect, it } from 'vitest';
import { CalendarError, civilFromDays, dateOfDay, daysFromCivil, daysInMonth, formatIsoDate, isLeapYear, parseIsoDate } from '../src/world/calendar.ts';

describe('the integer calendar (no Date in the kernel)', () => {
  it('counts days from 1970-01-01 both ways', () => {
    expect(daysFromCivil({ year: 1970, month: 1, day: 1 })).toBe(0);
    expect(daysFromCivil({ year: 1969, month: 12, day: 31 })).toBe(-1);
    expect(daysFromCivil({ year: 2000, month: 3, day: 1 })).toBe(11017);
    // A 19th-century date, far before the epoch.
    expect(formatIsoDate(civilFromDays(daysFromCivil({ year: 1861, month: 3, day: 4 })))).toBe('1861-03-04');
    for (let d = -60000; d <= 60000; d += 997) expect(daysFromCivil(civilFromDays(d))).toBe(d);
  });

  it('knows leap years by the Gregorian rule', () => {
    expect([1860, 1864, 1900, 2000, 1861].map(isLeapYear)).toEqual([true, true, false, true, false]);
    expect(daysInMonth(1860, 2)).toBe(29);
    expect(daysInMonth(1861, 2)).toBe(28);
    expect(formatIsoDate(dateOfDay('1860-02-28', 1))).toBe('1860-02-29');
    expect(formatIsoDate(dateOfDay('1861-02-28', 1))).toBe('1861-03-01');
  });

  it('gives the date and month of a later day', () => {
    expect(formatIsoDate(dateOfDay('1861-03-04', 30))).toBe('1861-04-03');
    expect(dateOfDay('1861-04-01', 0).month).toBe(4);
    expect(dateOfDay('1861-04-01', 30).month).toBe(5);
    expect(formatIsoDate(dateOfDay('1861-12-31', 1))).toBe('1862-01-01');
  });

  it('refuses dates that do not exist (positive control)', () => {
    for (const bad of ['1861-02-29', '1861-13-01', '1861-00-10', '1861-4-1', 'April 1861', '1861-04-31']) {
      expect(() => parseIsoDate(bad), bad).toThrow(CalendarError);
    }
  });
});
