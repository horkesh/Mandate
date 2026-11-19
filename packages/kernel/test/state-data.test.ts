import { describe, expect, it } from 'vitest';
import { canonicalJson } from '../src/serialize/canonical.ts';
import { compareOpenings } from './support/opening-comparison.ts';

/** Canonical JSON walks every value and reports the path of unsupported data.
 * Also reject array subclasses: Array.isArray alone accepts class instances. */
function assertStateData(value: unknown): void {
  canonicalJson(value);
  const seen = new WeakSet<object>();
  function walk(v: unknown, path: string): void {
    if (v === null || typeof v !== 'object' || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v) && Object.getPrototypeOf(v) !== Array.prototype) throw new TypeError(`${path}: array class instance`);
    for (const [key, child] of Object.entries(v)) walk(child, `${path}.${key}`);
  }
  walk(value, '$');
}

describe('State contains only plain data (the deep-freeze backstop)', () => {
  class Row { amount = 1; }
  class Rows extends Array<number> {}
  it.each([new Map(), new Set(), new Row(), new Rows(), new Date(0), new Uint8Array(1), () => 1])('rejects an unsupported value at its State path: %s', value => {
    expect(() => assertStateData({ nested: { rows: [value] } })).toThrow(/\$\.nested\.rows(?:\[0\]|\.0)/);
  });
  it('accepts primitives, arrays, plain records and null-prototype records', () => {
    expect(() => assertStateData({ a: [null, true, 'word', 1], b: Object.create(null) })).not.toThrow();
  });
  // R42's one-off proof that compact opening bulletins change no seat's view (days 0, 1 and 30, both packs, both
  // modes) compared these views with a pre-change capture. It is kept in the ignored `art-masters/R42/`, not as a
  // golden here, so later changes to the view are not held to R42's snapshot.
  it('walks starting and 30-day States in each real pack, at peace and at war', () => {
    let walked = 0;
    const views = compareOpenings((_key, _day, state) => { assertStateData(state); walked++; });
    expect(Object.keys(views)).toHaveLength(4);
    expect(walked).toBe(12);
  });
});
