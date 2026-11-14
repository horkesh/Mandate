import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canonicalJson, CanonicalError, isCanonicalText, parseCanonical } from '../src/serialize/canonical.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { sha256Hex, sha256OfText, utf8Bytes } from '../src/serialize/sha256.ts';
import { createStream, nextU32 } from '../src/rng.ts';

describe('canonical JSON', () => {
  it('sorts keys by code unit at every depth and writes no whitespace', () => {
    expect(canonicalJson({ b: 1, a: { d: [3, { z: 0, y: null }], c: true }, B: 'x' })).toBe(
      '{"B":"x","a":{"c":true,"d":[3,{"y":null,"z":0}]},"b":1}',
    );
  });

  it('gives one text for one value, whatever the insertion order', () => {
    const one: Record<string, number> = {};
    one.x = 1;
    one.a = 2;
    const two: Record<string, number> = {};
    two.a = 2;
    two.x = 1;
    expect(canonicalJson(one)).toBe(canonicalJson(two));
  });

  it('writes -0 as 0 and keeps integer-like keys in code-unit order', () => {
    expect(canonicalJson(-0)).toBe('0');
    // JS objects enumerate integer keys first in numeric order; canonical order is code units.
    expect(canonicalJson({ 10: 'a', 9: 'b', x: 'c' })).toBe('{"10":"a","9":"b","x":"c"}');
  });

  it('rejects everything that is not plain integer data, naming the path', () => {
    const cases: [unknown, string][] = [
      [{ a: undefined }, '$.a'],
      [{ a: [1, undefined] }, '$.a[1]'],
      [{ loyalty: 0.5 }, '$.loyalty'],
      [Number.NaN, '$'],
      [Number.POSITIVE_INFINITY, '$'],
      [2 ** 53, '$'],
      [{ n: 1n }, '$.n'],
      [{ f: () => 1 }, '$.f'],
      [{ m: new Map() }, '$.m'],
      [{ s: new Set() }, '$.s'],
      [{ d: new (class Region {})() }, '$.d'],
      [{ s: Symbol('x') }, '$.s'],
      // eslint-disable-next-line no-sparse-arrays
      [[1, , 3], '$[1]'],
    ];
    for (const [value, path] of cases) {
      try {
        canonicalJson(value);
        expect.unreachable(`accepted ${String(path)}`);
      } catch (e) {
        expect(e).toBeInstanceOf(CanonicalError);
        expect((e as CanonicalError).path).toBe(path);
      }
    }
  });

  it('rejects cycles but accepts shared references', () => {
    const shared = { x: 1 };
    expect(canonicalJson({ a: shared, b: shared })).toBe('{"a":{"x":1},"b":{"x":1}}');
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => canonicalJson(cyclic)).toThrow('cycle');
  });

  it('accepts null-prototype objects and round-trips through parse', () => {
    const bare = Object.create(null) as Record<string, number>;
    bare.k = 1;
    expect(canonicalJson(bare)).toBe('{"k":1}');
    const text = canonicalJson({ z: ['é', ' ', '"q"'], a: -5 });
    expect(isCanonicalText(text)).toBe(true);
    expect(canonicalJson(parseCanonical(text))).toBe(text);
    expect(isCanonicalText('{"b":1,"a":2}')).toBe(false);
    expect(isCanonicalText('{"a": 2}')).toBe(false);
  });
});

describe('sha256 (pure, no node:crypto in the kernel)', () => {
  it('matches the FIPS 180-4 test vectors', () => {
    expect(sha256OfText('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256OfText('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256OfText('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
    expect(sha256OfText('a'.repeat(1_000_000))).toBe('cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0');
  });

  it('agrees with node:crypto across padding boundaries and arbitrary text', () => {
    const rng = createStream(2026, 'test/sha256');
    for (let length = 0; length < 200; length++) {
      const units: number[] = [];
      for (let i = 0; i < length; i++) units.push(nextU32(rng) % 0x3000);
      const text = String.fromCharCode(...units);
      expect(sha256OfText(text), `length ${length}`).toBe(createHash('sha256').update(text, 'utf8').digest('hex'));
    }
  });

  it('encodes UTF-8 like TextEncoder, including astral characters and lone surrogates', () => {
    for (const text of ['plain', 'é', '€', '𝄞 clef', 'lone \ud800 high', 'lone \udc00 low', 'end \ud83d']) {
      expect([...utf8Bytes(text)], text).toEqual([...new TextEncoder().encode(text)]);
    }
    expect(sha256Hex(new Uint8Array([0x61, 0x62, 0x63]))).toBe(sha256OfText('abc'));
  });
});

describe('the state hash', () => {
  it('is the sha256 of the canonical text, independent of key order', () => {
    expect(canonicalHash({ b: 2, a: 1 })).toBe(canonicalHash({ a: 1, b: 2 }));
    expect(canonicalHash({ a: 1, b: 2 })).toBe(sha256OfText('{"a":1,"b":2}'));
    expect(canonicalHash({ a: 1 })).not.toBe(canonicalHash({ a: 2 }));
  });

  it('refuses to hash non-canonical state rather than hashing something else', () => {
    expect(() => canonicalHash({ supply: 0.25 })).toThrow(CanonicalError);
  });
});
