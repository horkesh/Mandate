import { describe, expect, it } from 'vitest';
import { MissingStringError, Strings } from '../src/index.ts';

describe('string tables (decision 0030, ICU through intl-messageformat)', () => {
  const tables = new Map([
    ['en', [{ table: { 'report.stores': '{garrison} has {days, plural, =0 {no rations} one {# day of rations} other {# days of rations}} left.', 'only.default': 'default text' } }]],
    ['fr', [{ table: { 'report.stores': '{garrison} : {days, plural, one {# jour} other {# jours}} de vivres.' } }]],
  ]);
  const strings = new Strings(tables, 'en');

  it('formats plurals', () => {
    expect(strings.format('report.stores', { garrison: 'The fort', days: 1 })).toBe('The fort has 1 day of rations left.');
    expect(strings.format('report.stores', { garrison: 'The fort', days: 0 })).toBe('The fort has no rations left.');
    expect(strings.format('report.stores', { garrison: 'Le fort', days: 3 }, 'fr')).toBe('Le fort : 3 jours de vivres.');
  });

  it('falls back to the default locale, and never shows a raw key', () => {
    expect(strings.format('only.default', {}, 'fr')).toBe('default text');
    expect(() => strings.format('no.such.key')).toThrow(MissingStringError);
  });
});
