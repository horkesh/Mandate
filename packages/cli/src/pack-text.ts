import { Strings } from '@mandate/pack-format';
import type { DeskStrings } from './desk/strings.ts';

/** The supplied table is already merged in the pack's default locale. */
export function deskStrings(table: Readonly<Record<string, string>>, locale = 'en'): DeskStrings {
  const strings = new Strings(new Map([[locale, [{ table }]]]), locale);
  return (key, values) => strings.has(key) && (key.startsWith('console.') || values !== undefined)
    ? strings.format(key, values)
    : table[key] ?? key;
}
