import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Decision 0002, enforced: the kernel is pure, deterministic and integer.
 * This scans kernel source (comments stripped) for APIs that break determinism
 * or purity.
 */
const SRC = fileURLToPath(new URL('../src', import.meta.url));

const BANNED: ReadonlyArray<[RegExp, string]> = [
  [/Math\.random\b/, 'Math.random: use a named RNG stream'],
  [/\bDate\b/, 'Date: the kernel has no clock'],
  [/\bperformance\./, 'performance: the kernel has no clock'],
  [/\bset(Timeout|Interval|Immediate)\b/, 'timers: the kernel is synchronous'],
  [/\blocaleCompare\b/, 'localeCompare: use strictCompare'],
  [
    /Math\.(exp|expm1|log|log1p|log2|log10|pow|sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh|cbrt|hypot|fround)\b/,
    'transcendental Math: results vary across engines; use integer math',
  ],
  [/\bfrom\s+['"]node:/, 'node: imports: the kernel runs in browsers too'],
  [/\brequire\(/, 'require: the kernel has no I/O'],
  [/\bprocess\./, 'process: the kernel has no environment'],
  [/\bfetch\(/, 'fetch: the kernel has no I/O'],
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('kernel banned APIs (decision 0002)', () => {
  const files = sourceFiles(SRC);

  it('scans a non-empty set of files', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('uses no banned API', () => {
    const violations: string[] = [];
    for (const file of files) {
      const code = stripComments(readFileSync(file, 'utf8'));
      for (const [pattern, why] of BANNED) {
        if (pattern.test(code)) violations.push(`${file}: ${why}`);
      }
    }
    expect(violations).toEqual([]);
  });
});
