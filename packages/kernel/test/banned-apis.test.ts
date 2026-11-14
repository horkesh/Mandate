import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lexSource, LexerError, repoPath, tsFiles, workspacePackages, type PackageInfo } from './support/source.ts';

/**
 * Decision 0002, enforced: deterministic packages are pure, deterministic and
 * integer. FOUNDATION section 11 extends the check from the kernel to every
 * deterministic package (the rule-seat package included, 11.12).
 *
 * Every workspace package must declare in its `package.json` whether it is
 * deterministic: `"mandate": { "deterministic": true }`, or `false` with a
 * `reason`. A new package therefore cannot appear unchecked: it fails here
 * until it declares itself, and if it declares `true` its `src` is scanned.
 */

interface Ban {
  readonly pattern: RegExp;
  readonly why: string;
  /** `strings` scans with string contents kept (for import specifiers); `code` scans with them emptied. */
  readonly scope: 'code' | 'strings';
}

const ban = (pattern: RegExp, why: string, scope: Ban['scope'] = 'code'): Ban => ({ pattern, why, scope });

const BANNED: readonly Ban[] = [
  ban(/Math\.random\b/, 'Math.random: use a named RNG stream'),
  ban(/\bDate\b/, 'Date: the kernel has no clock'),
  ban(/\bperformance\./, 'performance: the kernel has no clock'),
  ban(/\bset(Timeout|Interval|Immediate)\b/, 'timers: the kernel is synchronous'),
  ban(/\blocaleCompare\b/, 'localeCompare: use strictCompare'),
  ban(/\bIntl\b|\.toLocale\w*\s*\(/, 'Intl and toLocale*: output varies by locale'),
  ban(
    /Math\.(exp|expm1|log|log1p|log2|log10|pow|sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh|cbrt|hypot|fround)\b/,
    'transcendental Math: results vary across engines; use integer math',
  ),
  ban(/\bfrom\s+['"]node:/, 'node: imports: the kernel runs in browsers too', 'strings'),
  ban(
    /\bfrom\s+['"](fs|path|os|crypto|child_process|url|util|process|worker_threads|readline|http|https|net|stream)(\/[^'"]*)?['"]/,
    'Node built-in imports: the kernel has no I/O',
    'strings',
  ),
  ban(/\bimport\s*\(/, 'dynamic import: the kernel loads nothing at run time'),
  ban(/\brequire\s*\(/, 'require: the kernel has no I/O'),
  ban(/\bprocess\./, 'process: the kernel has no environment'),
  ban(/\bfetch\s*\(/, 'fetch: the kernel has no I/O'),
  ban(/\bcrypto\./, 'crypto: use the kernel hash and named RNG streams'),
  ban(/\bglobalThis\b|\bwindow\.|\bdocument\./, 'globals: the kernel reads no ambient state'),
  ban(/\bWeakRef\b|\bFinalizationRegistry\b/, 'WeakRef and FinalizationRegistry: behaviour depends on garbage collection'),
  ban(/\bObject\.(assign|defineProperty|defineProperties|setPrototypeOf)\s*\(|\bReflect\.(set|defineProperty|deleteProperty|setPrototypeOf)\s*\(/, 'reflective writes: they hide writes from the one-writer test'),
  // AWWV lesson M4: kernel modules hold no module-level mutable state.
  ban(/^(?:export\s+)?(?:let|var)\s/m, 'module-level let/var: kernel modules hold no mutable state'),
  ban(
    /^(?:export\s+)?const\s+[\w$]+\s*(?::(?!\s*Readonly)[^=]*)?=\s*new\s+(?:Map|Set|WeakMap|WeakSet)\b/m,
    'module-level mutable collection: type it ReadonlyMap/ReadonlySet, or keep it inside a function',
  ),
];

/** Violations in one file's source text, as `path:line: why`. */
export function bannedApiViolations(path: string, source: string): string[] {
  let lexed;
  try {
    lexed = lexSource(source);
  } catch (e) {
    if (e instanceof LexerError) return [`${path}:${e.line}: ${e.message}`];
    throw e;
  }
  const views = { code: lexed.code, strings: lexed.withStrings };
  const violations: string[] = [];
  for (const { pattern, why, scope } of BANNED) {
    const text = views[scope];
    const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    for (const m of text.matchAll(global)) violations.push(`${path}:${lexed.lineOf(m.index)}: ${why}`);
  }
  return violations;
}

function declaration(pkg: PackageInfo): { deterministic?: unknown; reason?: unknown } | undefined {
  const mandate = pkg.manifest.mandate;
  return typeof mandate === 'object' && mandate !== null ? (mandate as { deterministic?: unknown; reason?: unknown }) : undefined;
}

const packages = workspacePackages();
const deterministic = packages.filter((p) => declaration(p)?.deterministic === true);

describe('deterministic packages are declared', () => {
  it('every workspace package declares whether it is deterministic', () => {
    const problems = packages.flatMap((p) => {
      const d = declaration(p);
      if (typeof d?.deterministic !== 'boolean') return [`${p.dir}/package.json: add "mandate": { "deterministic": true | false }`];
      if (d.deterministic === false && (typeof d.reason !== 'string' || d.reason.length === 0)) {
        return [`${p.dir}/package.json: a non-deterministic package must give a "reason"`];
      }
      return [];
    });
    expect(problems).toEqual([]);
  });

  it('the kernel is among them', () => {
    expect(deterministic.map((p) => p.dir)).toContain('kernel');
  });

  it('a deterministic package depends on no non-deterministic workspace package', () => {
    const impure = new Set(packages.filter((p) => declaration(p)?.deterministic === false).map((p) => p.name));
    const problems = deterministic.flatMap((p) => {
      const deps = { ...(p.manifest.dependencies as Record<string, string> | undefined), ...(p.manifest.peerDependencies as Record<string, string> | undefined) };
      return Object.keys(deps).filter((d) => impure.has(d)).map((d) => `${p.name} depends on non-deterministic ${d}`);
    });
    expect(problems).toEqual([]);
  });
});

describe('banned APIs in deterministic packages (decision 0002)', () => {
  for (const pkg of deterministic) {
    const files = tsFiles(join(pkg.root, 'src'));

    it(`${pkg.dir}: scans a non-empty set of files`, () => {
      expect(files.length).toBeGreaterThan(0);
    });

    it(`${pkg.dir}: uses no banned API`, () => {
      const violations = files.flatMap((file) => bannedApiViolations(repoPath(file), readFileSync(file, 'utf8')));
      expect(violations).toEqual([]);
    });
  }

  it('catches each kind of violation (positive control)', () => {
    const bad = [
      "import { readFileSync } from 'node:fs';",
      "import os from 'os';",
      'let counter = 0;',
      'const cache = new Map<string, number>();',
      'export function f(): number { return Math.random() + Math.pow(2, 3) + Date.now(); }',
      'export function g(a: object): void { Object.assign(a, { x: 1 }); }',
      "export const s = 'x'.localeCompare('y');",
    ].join('\n');
    const found = bannedApiViolations('fixture.ts', bad);
    for (const why of ['node: imports', 'Node built-in', 'module-level let', 'module-level mutable collection', 'Math.random', 'transcendental', 'Date', 'reflective writes', 'localeCompare']) {
      expect(found.some((v) => v.includes(why)), why).toBe(true);
    }
  });

  it('sees past regex literals that look like strings, comments or templates (the reviewer probes)', () => {
    const probes = [
      "export const a = /'/.test('x') || Math.random();",
      "export const b = 'a/b'.split(/\\//).length + Math.random();",
      "export const c = /[/*]/.test('x');",
      'export const d = Math.random();',
      "export const e = /`/.test('x');",
      'export const f = Date.now();',
    ].join('\n');
    const found = bannedApiViolations('fixture.ts', probes);
    expect(found).toEqual([
      'fixture.ts:1: Math.random: use a named RNG stream',
      'fixture.ts:2: Math.random: use a named RNG stream',
      'fixture.ts:4: Math.random: use a named RNG stream',
      'fixture.ts:6: Date: the kernel has no clock',
    ]);
  });

  it('fails closed when the lexer loses sync', () => {
    expect(bannedApiViolations('fixture.ts', "const s = 'unterminated\nMath.random();")).toEqual([
      'fixture.ts:1: lexer lost sync at line 1: a quoted string meets a newline',
    ]);
    expect(bannedApiViolations('fixture.ts', 'const t = `open\n/* Math.random() */')[0]).toContain('lexer lost sync');
  });

  it('ignores comments and string contents, and allows readonly module constants', () => {
    const fine = [
      '// Math.random() and Date are fine in a comment',
      "export const note = 'Date and Math.random in a string';",
      "const ALLOWED: ReadonlySet<string> = new Set(['a']);",
      'export function h(): number { let x = 1; x += 1; return x; }',
    ].join('\n');
    expect(bannedApiViolations('fixture.ts', fine)).toEqual([]);
  });
});
