/**
 * SHA-256 (FIPS 180-4) in pure integer TypeScript, for the state hash.
 *
 * The kernel has no I/O and no Node APIs (decision 0002), so it cannot use
 * `node:crypto`; and it must give the same answer in a browser. It uses only
 * 32-bit bitwise operations and integer additions (each sum stays far below
 * 2^53, then wraps with `>>> 0`), which are exact on every engine. Tests check
 * it against the standard vectors and against `node:crypto`.
 */

const K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

const H0: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

/** UTF-8 bytes of a JS string. Lone surrogates become U+FFFD, as `TextEncoder` does. */
export function utf8Bytes(text: string): Uint8Array {
  // At most three bytes per UTF-16 code unit (a surrogate pair is two units, four bytes).
  const out = new Uint8Array(text.length * 3);
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = i + 1 < text.length ? text.charCodeAt(i + 1) : 0;
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i++;
      } else {
        code = 0xfffd;
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      code = 0xfffd;
    }
    if (code < 0x80) {
      out[n++] = code;
    } else if (code < 0x800) {
      out[n++] = 0xc0 | (code >>> 6);
      out[n++] = 0x80 | (code & 0x3f);
    } else if (code < 0x10000) {
      out[n++] = 0xe0 | (code >>> 12);
      out[n++] = 0x80 | ((code >>> 6) & 0x3f);
      out[n++] = 0x80 | (code & 0x3f);
    } else {
      out[n++] = 0xf0 | (code >>> 18);
      out[n++] = 0x80 | ((code >>> 12) & 0x3f);
      out[n++] = 0x80 | ((code >>> 6) & 0x3f);
      out[n++] = 0x80 | (code & 0x3f);
    }
  }
  return out.subarray(0, n);
}

/** SHA-256 digest of `bytes` as 64 lowercase hex characters. */
export function sha256Hex(bytes: Uint8Array): string {
  const bitLength = bytes.length * 8;
  const padded = new Uint8Array((((bytes.length + 8) >>> 6) + 1) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  // Message length in bits, big-endian, in the last 8 bytes. Split into high
  // and low 32-bit words with integer division, so lengths above 2^32 bits work.
  const high = Math.trunc(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  const end = padded.length;
  padded[end - 8] = (high >>> 24) & 0xff;
  padded[end - 7] = (high >>> 16) & 0xff;
  padded[end - 6] = (high >>> 8) & 0xff;
  padded[end - 5] = high & 0xff;
  padded[end - 4] = (low >>> 24) & 0xff;
  padded[end - 3] = (low >>> 16) & 0xff;
  padded[end - 2] = (low >>> 8) & 0xff;
  padded[end - 1] = low & 0xff;

  const h = [...H0];
  const w = new Array<number>(64).fill(0);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let t = 0; t < 16; t++) {
      const i = offset + t * 4;
      w[t] = ((padded[i]! << 24) | (padded[i + 1]! << 16) | (padded[i + 2]! << 8) | padded[i + 3]!) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const x = w[t - 15]!;
      const y = w[t - 2]!;
      const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
      const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
      w[t] = (w[t - 16]! + s0 + w[t - 7]! + s1) >>> 0;
    }
    let a = h[0]!;
    let b = h[1]!;
    let c = h[2]!;
    let d = h[3]!;
    let e = h[4]!;
    let f = h[5]!;
    let g = h[6]!;
    let k = h[7]!;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (k + S1 + ch + K[t]! + w[t]!) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      k = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0]! + a) >>> 0;
    h[1] = (h[1]! + b) >>> 0;
    h[2] = (h[2]! + c) >>> 0;
    h[3] = (h[3]! + d) >>> 0;
    h[4] = (h[4]! + e) >>> 0;
    h[5] = (h[5]! + f) >>> 0;
    h[6] = (h[6]! + g) >>> 0;
    h[7] = (h[7]! + k) >>> 0;
  }
  return h.map((word) => word.toString(16).padStart(8, '0')).join('');
}

/** SHA-256 of a string's UTF-8 bytes, as hex. */
export function sha256OfText(text: string): string {
  return sha256Hex(utf8Bytes(text));
}

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}
