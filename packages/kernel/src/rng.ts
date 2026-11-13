/**
 * Named, seeded random streams (decision 0002; pattern from Starfleet Career).
 *
 * One stream per purpose, so adding a draw in one system never shifts the
 * sequence of another. A stream's state is a plain serializable object.
 * People's decisions do NOT draw from these streams: they are caused by state.
 * Streams are for exogenous noise (weather, battle variance).
 */

export interface RngStream {
  readonly name: string;
  /** Unsigned 32-bit generator state. */
  state: number;
}

/** FNV-1a 32-bit hash of a string's UTF-16 code units. */
export function fnv1a32(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** A 32-bit integer finalizer (lowbias32) to spread seed bits. */
export function mix32(value: number): number {
  let x = value >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

/** Derive a stream from the save seed and a stream name such as `battle/<opId>`. */
export function createStream(seed: number, name: string): RngStream {
  return { name, state: mix32((seed >>> 0) ^ fnv1a32(name)) };
}

/** Next unsigned 32-bit value (mulberry32 step). */
export function nextU32(stream: RngStream): number {
  stream.state = (stream.state + 0x6d2b79f5) >>> 0;
  let t = stream.state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) >>> 0;
}

/** Uniform integer in [0, maxExclusive), without modulo bias. */
export function nextInt(stream: RngStream, maxExclusive: number): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > 0x100000000) {
    throw new RangeError(`maxExclusive must be an integer in 1..2^32, got ${maxExclusive}`);
  }
  const limit = 0x100000000 - (0x100000000 % maxExclusive);
  for (;;) {
    const value = nextU32(stream);
    if (value < limit) return value % maxExclusive;
  }
}

/** Uniform permille in 0..1000 inclusive. */
export function nextPermille(stream: RngStream): number {
  return nextInt(stream, 1001);
}
