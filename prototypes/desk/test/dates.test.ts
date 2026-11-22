import { describe, expect, it } from 'vitest';
import { calendarFace, writtenDate, writtenDates } from '../web/dates.ts';

// The desk's one date formatter (lead's ruling on S60): written dates in the
// view, ISO dates only in data.
describe('written dates', () => {
  it('writes an ISO date out, with the weekday on request', () => {
    expect(writtenDate('1861-03-05')).toBe('5 March 1861');
    expect(writtenDate('1861-03-05', { weekday: true })).toBe('Tuesday, 5 March 1861');
    expect(writtenDate('1861-12-31')).toBe('31 December 1861');
  });
  it('finds the weekday by arithmetic, across century rules', () => {
    expect(calendarFace('2000-01-01')?.weekday).toBe('Saturday');
    expect(calendarFace('1900-01-01')?.weekday).toBe('Monday');
    expect(calendarFace('2000-02-29')?.weekday).toBe('Tuesday');
    expect(calendarFace('1900-03-01')?.weekday).toBe('Thursday');
  });
  it('leaves text that is not an ISO date alone', () => {
    expect(writtenDate('Unknown')).toBe('Unknown');
    expect(writtenDate('Day 12')).toBe('Day 12');
    expect(writtenDate('1861-13-01')).toBe('1861-13-01');
  });
  it('writes out every ISO date inside prose', () => {
    expect(writtenDates('Received 1861-04-02; expected by 1861-04-09.')).toBe('Received 2 April 1861; expected by 9 April 1861.');
    expect(writtenDates('3 divisions, 12,000 men')).toBe('3 divisions, 12,000 men');
  });
});
