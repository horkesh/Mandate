import { describe, expect, it } from 'vitest';
import { compareSummaries, type Summary } from '../compare-runs.ts';

const run = (hashes: string[], extra: Partial<Summary> = {}): Summary => ({
  pack: 'testbed',
  hashScheme: 'sha256/canonical-json/v1',
  worldHash: 'w',
  initialHash: 'i',
  turns: hashes.map((hash, i) => ({ turn: i + 1, hash })),
  finalHash: hashes.at(-1) ?? 'i',
  resume: { matches: true },
  ...extra,
});

describe('cross-machine run comparison', () => {
  it('accepts identical runs', () => {
    expect(compareSummaries(run(['a', 'b', 'c']), run(['a', 'b', 'c']))).toEqual([]);
  });

  it('names the first diverging turn and the final difference', () => {
    expect(compareSummaries(run(['a', 'b', 'c']), run(['a', 'x', 'y']))).toEqual([
      'first diverging turn: 2 (b vs x)',
      'final hash differs: c vs y',
    ]);
  });

  it('flags different worlds, lengths and a failed resume', () => {
    expect(compareSummaries(run(['a']), run(['a', 'b'], { worldHash: 'v', resume: { matches: false } }))).toEqual([
      'worldHash differs: w vs v',
      'turn count differs: 1 vs 2',
      'final hash differs: a vs b',
      'second run: resume did not match the continuous run',
    ]);
  });
});
