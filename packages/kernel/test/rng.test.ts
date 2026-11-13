import { describe, expect, it } from 'vitest';
import { createStream, nextInt, nextPermille, nextU32, type RngStream } from '../src/index.ts';

function draw(stream: RngStream, n: number): number[] {
  return Array.from({ length: n }, () => nextU32(stream));
}

describe('named RNG streams', () => {
  it('same seed and name give the same sequence', () => {
    expect(draw(createStream(42, 'battle/op-1'), 20)).toEqual(draw(createStream(42, 'battle/op-1'), 20));
  });

  it('different names or seeds give different sequences', () => {
    const base = draw(createStream(42, 'battle/op-1'), 8);
    expect(draw(createStream(42, 'battle/op-2'), 8)).not.toEqual(base);
    expect(draw(createStream(43, 'battle/op-1'), 8)).not.toEqual(base);
  });

  it('state survives a JSON round trip mid-sequence', () => {
    const live = createStream(7, 'weather');
    draw(live, 5);
    const restored = JSON.parse(JSON.stringify(live)) as RngStream;
    expect(draw(restored, 10)).toEqual(draw(live, 10));
  });

  it('nextInt and nextPermille stay in range and produce integers', () => {
    const stream = createStream(1, 'range');
    for (let i = 0; i < 2000; i++) {
      const v = nextInt(stream, 6);
      expect(Number.isInteger(v) && v >= 0 && v < 6).toBe(true);
      const p = nextPermille(stream);
      expect(Number.isInteger(p) && p >= 0 && p <= 1000).toBe(true);
    }
  });

  it('pins the sequence, so a change to the generator is caught', () => {
    expect(draw(createStream(1, 'pin'), 3)).toMatchInlineSnapshot(`
      [
        2561805321,
        4162055082,
        2547855797,
      ]
    `);
  });
});
