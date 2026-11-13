/**
 * Deterministic ordering (decision 0002). Never use `localeCompare` or rely on
 * object insertion order for anything that reaches state or reports.
 */

/** Code-unit comparison of strings, identical on every platform and locale. */
export function strictCompare(a: string, b: string): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** The keys of a record in strict order. */
export function sortedKeys<T>(record: Readonly<Record<string, T>>): string[] {
  return Object.keys(record).sort(strictCompare);
}

/** A sorted copy of a list of ids, removing duplicates. */
export function sortedUnique(ids: readonly string[]): string[] {
  return [...new Set(ids)].sort(strictCompare);
}
