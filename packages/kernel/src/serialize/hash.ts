/**
 * The state hash (FOUNDATION section 11.1; decision 0035): SHA-256 over the
 * canonical JSON text of a value. Pure: no `node:crypto`, no I/O. The same
 * state gives the same hash on Linux, Windows and in a browser, which CI checks.
 */
import { canonicalJson } from './canonical.ts';
import { sha256OfText } from './sha256.ts';

/** Names the hashing scheme, so a save or run summary says how its hashes were made. */
export const HASH_SCHEME = 'sha256/canonical-json/v1';

/** Hash of any canonical value: World data, State, a command log. Throws `CanonicalError` if `value` is not canonical. */
export function canonicalHash(value: unknown): string {
  return sha256OfText(canonicalJson(value));
}
