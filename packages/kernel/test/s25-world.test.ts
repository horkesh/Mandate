import { expect, it } from 'vitest';
import { CalendarError, parseIsoDate } from '../src/world/calendar.ts';

it('S25 world-01: January is a valid calendar month', () => {
  expect(parseIsoDate('1900-01-01')).toEqual({ year: 1900, month: 1, day: 1 });
  expect(() => parseIsoDate('1900-00-01')).toThrow(CalendarError);
});
