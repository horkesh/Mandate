/**
 * String tables (decision 0030): all player-facing text lives in pack tables
 * keyed by id, as ICU messages formatted with intl-messageformat (0035).
 * Engine code produces typed reasons and keys, never English; a shell turns
 * keys into text here.
 */
import { IntlMessageFormat } from 'intl-messageformat';
import type { StringTable } from './schemas.ts';

export type MessageValues = Record<string, string | number | boolean | Date>;

export class MissingStringError extends Error {
  constructor(
    readonly key: string,
    readonly locale: string,
  ) {
    super(`no text for string key "${key}" in locale "${locale}" or the default locale`);
    this.name = 'MissingStringError';
  }
}

/** A locale's tables merged over the default locale's, so a missing translation falls back to the default text. */
export class Strings {
  private readonly tables: ReadonlyMap<string, ReadonlyMap<string, string>>;

  constructor(
    tables: ReadonlyMap<string, readonly { readonly table: StringTable }[]>,
    readonly defaultLocale: string,
  ) {
    const merged = new Map<string, Map<string, string>>();
    for (const [locale, files] of tables) {
      const m = new Map<string, string>();
      for (const { table } of files) for (const [k, v] of Object.entries(table)) m.set(k, v);
      merged.set(locale, m);
    }
    this.tables = merged;
  }

  has(key: string, locale = this.defaultLocale): boolean {
    return this.tables.get(locale)?.has(key) === true || this.tables.get(this.defaultLocale)?.has(key) === true;
  }

  /** Format a key's message. Throws `MissingStringError` rather than showing a key to the player. */
  format(key: string, values: MessageValues = {}, locale = this.defaultLocale): string {
    const own = this.tables.get(locale)?.get(key);
    const message = own ?? this.tables.get(this.defaultLocale)?.get(key);
    if (message === undefined) throw new MissingStringError(key, locale);
    return String(new IntlMessageFormat(message, own === undefined ? this.defaultLocale : locale).format(values));
  }
}
