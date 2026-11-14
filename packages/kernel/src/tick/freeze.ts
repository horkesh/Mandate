/**
 * The deep-freeze backstop for one writer per field (decision 0044's
 * candidate, the lane 0.1 reviewer's suggestion).
 *
 * The one-writer test is a source scan and cannot see writes through an
 * alias (`const c = state.x; c.push(v)`). State is copy-on-write, so nothing
 * legitimate ever edits a record in place; freezing it therefore costs no
 * writer anything and turns any in-place write, by anyone, through any alias,
 * into a TypeError. Tests and determinism runs freeze State after every phase
 * of the tick and before handing it to a seat; normal play may skip it for speed.
 */

/** Freeze a value and everything reachable from it. Already-frozen subtrees are skipped. */
export function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const v of Object.values(value as object)) deepFreeze(v);
  return value;
}
