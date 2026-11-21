import { expect, it } from 'vitest';
import { latestDayOf } from '../src/people/ranks.ts';

it('S25 people-02: a rank cited to January is certain only at the end of January', () => {
  expect(latestDayOf('1900-01')).toBe('1900-01-31');
  expect(() => latestDayOf('1900-00')).toThrow(RangeError);
  expect(() => latestDayOf('1900-13')).toThrow(RangeError);
});
