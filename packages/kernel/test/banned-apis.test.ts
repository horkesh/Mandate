import { readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { allFiles, lexSource, LexerError, repoPath, workspacePackages, type PackageInfo } from './support/source.ts';

/**
 * Decision 0002, enforced: deterministic packages are pure, deterministic and
 * integer. FOUNDATION section 11 extends the check from the kernel to every
 * deterministic package (the rule-seat package included, 11.12).
 *
 * Every workspace package must declare in its `package.json` whether it is
 * deterministic: `"mandate": { "deterministic": true }`, or `false` with a
 * `reason`. A new package therefore cannot appear unchecked: it fails here
 * until it declares itself, and if it declares `true` its `src` is scanned.
 *
 * Three layers:
 * - every file under `src` is TypeScript (a `.js` file would go unscanned);
 * - imports are allow-listed: relative specifiers must stay inside the
 *   package, and bare specifiers must name a deterministic workspace package,
 *   so nothing unscanned (an npm package, the CLI, `node:`) can be pulled in;
 * - banned patterns, with `Math` allow-listed member by member rather than
 *   deny-listed, so aliases and bracket access fail too.
 */

interface Ban {
  readonly pattern: RegExp;
  readonly why: string;
}

const ban = (pattern: RegExp, why: string): Ban => ({ pattern, why });

/** The only `Math` members deterministic code may use: exact integer operations. */
export const MATH_ALLOWED = ['trunc', 'abs', 'min', 'max', 'sign', 'imul', 'floor', 'ceil'] as const;

const BANNED: readonly Ban[] = [
  ban(
    new RegExp(String.raw`\bMath\b(?!\s*\.\s*(?:${MATH_ALLOWED.join('|')})\b)`),
    `Math beyond ${MATH_ALLOWED.join(', ')}: Math.random must be a named RNG stream, and transcendental results vary across engines`,
  ),
  ban(/\bDate\b/, 'Date: the kernel has no clock'),
  ban(/\bperformance\./, 'performance: the kernel has no clock'),
  ban(/\bset(Timeout|Interval|Immediate)\b/, 'timers: the kernel is synchronous'),
  ban(/\blocaleCompare\b/, 'localeCompare: use strictCompare'),
  ban(/\bIntl\b|\.toLocale\w*\s*\(/, 'Intl and toLocale*: output varies by locale'),
  ban(/\bimport\s*\(/, 'dynamic import: the kernel loads nothing at run time'),
  ban(/\brequire\s*\(/, 'require: the kernel has no I/O'),
  ban(/\bprocess\./, 'process: the kernel has no environment'),
  ban(/\bfetch\s*\(/, 'fetch: the kernel has no I/O'),
  ban(/\bcrypto\./, 'crypto: use the kernel hash and named RNG streams'),
  ban(/\bglobalThis\b|\bwindow\.|\bdocument\./, 'globals: the kernel reads no ambient state'),
  ban(/\bWeakRef\b|\bFinalizationRegistry\b/, 'WeakRef and FinalizationRegistry: behaviour depends on garbage collection'),
  ban(/\beval\b|\bFunction\s*\(/, 'eval and Function(): code built from strings escapes every scan'),
  ban(/\bReflect\./, 'Reflect: reflective calls and writes escape the scans'),
  ban(/\bObject\.(assign|defineProperty|defineProperties|setPrototypeOf)\s*\(/, 'reflective writes: they hide writes from the one-writer test'),
  // AWWV lesson M4: kernel modules hold no module-level mutable state.
  ban(/^(?:export\s+)?(?:let|var)\s/m, 'module-level let/var: kernel modules hold no mutable state'),
  ban(
    /^(?:export\s+)?const\s+[\w$]+\s*(?::(?!\s*Readonly)[^=]*)?=\s*new\s+(?:Map|Set|WeakMap|WeakSet)\b/m,
    'module-level mutable collection: type it ReadonlyMap/ReadonlySet, or keep it inside a function',
  ),
];

const MUTABLE_CONST_WHY = 'module-level mutable object or array: type it readonly/Readonly, add `as const`, or Object.freeze it';

/** Where a file sits, for the import allow-list. */
export interface ImportContext {
  /** Absolute path of the file. */
  readonly file: string;
  /** Absolute path of its package root. */
  readonly packageRoot: string;
  /** Names of workspace packages that declare `deterministic: true`. */
  readonly deterministicPackages: ReadonlySet<string>;
}

/** Violations in one file's source text, as `path:line: why`. */
export function bannedApiViolations(path: string, source: string, imports?: ImportContext): string[] {
  let lexed;
  try {
    lexed = lexSource(source);
  } catch (e) {
    if (e instanceof LexerError) return [`${path}:${e.line}: ${e.message}`];
    throw e;
  }
  const found: { line: number; why: string }[] = [];
  for (const { pattern, why } of BANNED) {
    const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    for (const m of lexed.code.matchAll(global)) found.push({ line: lexed.lineOf(m.index), why });
  }
  for (const index of mutableModuleConsts(lexed.code)) found.push({ line: lexed.lineOf(index), why: MUTABLE_CONST_WHY });
  if (imports) {
    for (const { index, specifier } of importSpecifiers(lexed.withStrings)) {
      const problem = importProblem(specifier, imports);
      if (problem) found.push({ line: lexed.lineOf(index), why: problem });
    }
  }
  return found.sort((a, b) => a.line - b.line).map((v) => `${path}:${v.line}: ${v.why}`);
}

/**
 * Offsets of module-level `const x = [ ... ]` or `const x = { ... }` whose
 * type does not start with `readonly`/`Readonly` and whose value is not
 * followed by `as const`. (`Object.freeze(...)` values don't start with a
 * bracket, so they pass.)
 */
function mutableModuleConsts(code: string): number[] {
  const out: number[] = [];
  for (const m of code.matchAll(/^(?:export\s+)?const\s+[\w$]+\s*(:[^=]*)?=\s*([[{])/gm)) {
    if (m[1] && /^:\s*(?:readonly|Readonly)\b/.test(m[1])) continue;
    const open = m.index + m[0].length - 1;
    const close = matchingBracket(code, open);
    if (close !== -1 && /^\s*as\s+const\b/.test(code.slice(close + 1))) continue;
    out.push(m.index);
  }
  return out;
}

function matchingBracket(code: string, open: number): number {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (c === '[' || c === '{' || c === '(') depth++;
    else if ((c === ']' || c === '}' || c === ')') && --depth === 0) return i;
  }
  return -1;
}

/** Static `import ... from '...'`, `import '...'` and `export ... from '...'` specifiers, with offsets. */
function importSpecifiers(withStrings: string): { index: number; specifier: string }[] {
  const pattern = /\b(?:import|export)\s+(?:type\s+)?(?:[\w$*{}\s,]+?\s+from\s+)?(['"])([^'"\n]+)\1/g;
  return [...withStrings.matchAll(pattern)].map((m) => ({ index: m.index, specifier: m[2]! }));
}

/** Why an import is not allowed, or null. */
export function importProblem(specifier: string, ctx: ImportContext): string | null {
  if (specifier.startsWith('.')) {
    const target = resolve(dirname(ctx.file), specifier);
    const rel = relative(ctx.packageRoot, target);
    if (rel.split(sep)[0] === '..' || isAbsolute(rel)) {
      return `import "${specifier}" leaves the package: relative imports must stay inside it`;
    }
    return null;
  }
  const name = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]!;
  if (ctx.deterministicPackages.has(name)) return null;
  return `import "${specifier}" is not allowed: only relative imports inside the package and deterministic workspace packages`;
}

function declaration(pkg: PackageInfo): { deterministic?: unknown; reason?: unknown } | undefined {
  const mandate = pkg.manifest.mandate;
  return typeof mandate === 'object' && mandate !== null ? (mandate as { deterministic?: unknown; reason?: unknown }) : undefined;
}

const packages = workspacePackages();
const deterministic = packages.filter((p) => declaration(p)?.deterministic === true);
const deterministicNames: ReadonlySet<string> = new Set(deterministic.map((p) => p.name));

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
    const files = allFiles(join(pkg.root, 'src'));

    it(`${pkg.dir}: scans a non-empty set of files, all of them TypeScript`, () => {
      expect(files.length).toBeGreaterThan(0);
      expect(files.filter((f) => extname(f) !== '.ts').map(repoPath)).toEqual([]);
    });

    it(`${pkg.dir}: uses no banned API and imports nothing unscanned`, () => {
      const violations = files.flatMap((file) =>
        bannedApiViolations(repoPath(file), readFileSync(file, 'utf8'), { file, packageRoot: pkg.root, deterministicPackages: deterministicNames }),
      );
      expect(violations).toEqual([]);
    });
  }

  const kernelRoot = join(packages.find((p) => p.dir === 'kernel')!.root);
  const ctx: ImportContext = { file: join(kernelRoot, 'src', 'zz-probe.ts'), packageRoot: kernelRoot, deterministicPackages: deterministicNames };

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
    const found = bannedApiViolations('fixture.ts', bad, ctx);
    for (const why of ['import "node:fs" is not allowed', 'import "os" is not allowed', 'module-level let', 'module-level mutable collection', 'Math beyond', 'Date', 'reflective writes', 'localeCompare']) {
      expect(found.some((v) => v.includes(why)), why).toBe(true);
    }
  });

  it('allow-lists imports: inside the package, or a deterministic workspace package (reviewer probes)', () => {
    const src = [
      "import { writeFileAtomic } from '../../cli/src/io/atomic.ts';",
      "import { expect } from 'vitest';",
      "import type { Verb } from '@mandate/cli';",
      "export * from '../package.json';",
      "import { strictCompare } from './compare.ts';",
      "import { ids } from '@mandate/kernel';",
      "export { canonicalJson } from './serialize/canonical.ts';",
    ].join('\n');
    expect(bannedApiViolations('fixture.ts', src, ctx).map((v) => v.split(': ')[0])).toEqual(['fixture.ts:1', 'fixture.ts:2', 'fixture.ts:3']);
    expect(importProblem('../outside.ts', { ...ctx, file: join(kernelRoot, 'src', 'a.ts') })).toBeNull();
    expect(importProblem('../../outside.ts', { ...ctx, file: join(kernelRoot, 'src', 'a.ts') })).toContain('leaves the package');
  });

  it('allow-lists Math members, so aliases, brackets and destructuring fail (reviewer probes)', () => {
    const src = [
      'const M = Math; export const a = M.random();',
      "export const b = Math['random']();",
      'export const { pow, exp } = Math;',
      'export const c = Math.trunc(Math.abs(-3) / Math.max(1, 2));',
    ].join('\n');
    expect(bannedApiViolations('fixture.ts', src).map((v) => v.split(': ')[0])).toEqual(['fixture.ts:1', 'fixture.ts:2', 'fixture.ts:3']);
  });

  it('bans eval, Function() and Reflect (reviewer probes)', () => {
    const src = ["export const a = eval('1');", "export const b = new Function('return 1');", 'export const c = Reflect.apply(f, null, []);'].join('\n');
    expect(bannedApiViolations('fixture.ts', src).map((v) => v.split(': ')[0])).toEqual(['fixture.ts:1', 'fixture.ts:2', 'fixture.ts:3']);
  });

  it('bans module-level mutable objects and arrays unless readonly, as const or frozen (reviewer probes)', () => {
    const src = [
      'export const cache: Record<string, number> = {};',
      'export const list: number[] = [];',
      'const plain = { a: 1 };',
      "export const KINDS = ['a', 'b'] as const;",
      'export const TABLE: readonly number[] = [1, 2];',
      'export const MAP: Readonly<Record<string, number>> = { a: 1 };',
      'export const RULES = Object.freeze({ a: 1 });',
      "export const VERBS = ['x'] as const satisfies readonly string[];",
      'export function f(): number[] { const local = []; return local; }',
    ].join('\n');
    expect(bannedApiViolations('fixture.ts', src).map((v) => v.split(': ')[0])).toEqual(['fixture.ts:1', 'fixture.ts:2', 'fixture.ts:3']);
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
    expect(bannedApiViolations('fixture.ts', probes).map((v) => v.split(': ')[0])).toEqual(['fixture.ts:1', 'fixture.ts:2', 'fixture.ts:4', 'fixture.ts:6']);
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
