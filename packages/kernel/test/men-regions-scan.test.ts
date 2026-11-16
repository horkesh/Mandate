import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Who reached the lines is State only the derived self-emancipation term proposes and only `regions` writes (0046;
 * SENSITIVE-HISTORY 3.2: never a lever). `applyArrivals` checks its proposals' tag, but any caller could write the tag,
 * so this makes the rule structural, as lane 1.3's battle-loss scan does: one caller of the writer, one proposer.
 */
const root = fileURLToPath(new URL('../../../', import.meta.url));
const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => (statSync(join(dir, name)).isDirectory() ? files(join(dir, name)) : name.endsWith('.ts') ? [join(dir, name)] : []));
const sources = readdirSync(join(root, 'packages')).flatMap((pkg) => {
  try {
    return files(join(root, 'packages', pkg, 'src'));
  } catch {
    return [];
  }
});
const where = (pattern: RegExp) => sources.filter((f) => pattern.test(readFileSync(f, 'utf8'))).map((f) => relative(root, f).split('\\').join('/'));

describe('only the derived term reaches the lines (lane 1.7; the standing review)', () => {
  it('only the regions phase calls applyArrivals, and only regions writes the arrivals table', () => {
    expect(where(/applyArrivals\(/)).toEqual(['packages/kernel/src/regions/regions.ts', 'packages/kernel/src/tick/regions.ts']);
    expect(where(/regionReachedUnionLines:/)).toEqual(['packages/kernel/src/regions/regions.ts', 'packages/kernel/src/root-state.ts', 'packages/kernel/src/tick/setup.ts']);
  });

  it('only the term builds a proposal for the protected field', () => {
    expect(where(/field:\s*REACHED_UNION_LINES_FIELD/)).toEqual(['packages/kernel/src/regions/self-emancipation.ts']);
    // The id as a string literal (doc comments name it in backticks): one declaration.
    expect(where(/['"]region_reached_union_lines['"]/)).toEqual(['packages/kernel/src/regions/regions.ts']);
  });
});
