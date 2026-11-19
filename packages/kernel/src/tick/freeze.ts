/**
 * The deep-freeze backstop for one writer per field (decision 0044's
 * candidate, the lane 0.1 reviewer's suggestion).
 *
 * The one-writer test is a source scan and cannot see every write through
 * an alias, parameter or function call. State is copy-on-write, so nothing
 * legitimate ever edits a record in place; freezing it therefore costs no
 * writer anything and turns any in-place write, by anyone, through any alias,
 * into a TypeError. Tests and determinism runs freeze State after every phase
 * of the tick and before handing it to a seat; normal play may skip it for speed.
 */

/**
 * Objects already proven frozen all the way down. A run keeps one (held by
 * the caller, never in State), so unchanged State shared between days is not
 * walked again every phase.
 */
export type FreezeLedger = WeakSet<object>;

export function createFreezeLedger(): FreezeLedger {
  return new WeakSet();
}

/**
 * Freeze a value and everything reachable from it. An object that is frozen
 * but not in the ledger is still walked: a shallow-frozen record may hold a
 * mutable child (review N2). Only objects this function froze all the way
 * down are skipped.
 */
export function deepFreeze<T>(value: T, ledger: FreezeLedger = createFreezeLedger()): T {
  if (typeof value !== 'object' || value === null || ledger.has(value)) return value;
  ledger.add(value);
  Object.freeze(value);
  for (const v of Object.values(value as object)) deepFreeze(v, ledger);
  return value;
}
