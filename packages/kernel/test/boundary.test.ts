import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lexSource, REPO_ROOT, repoPath, tsFiles, workspacePackages } from './support/source.ts';

/**
 * The player-visible boundary (FOUNDATION section 8; decision 0015; brief of lane 0.6).
 *
 * 1. The view layer (`seat-api.ts`, and everything it imports) never reaches
 *    State or the truth layer: no import path from it leads to the files below.
 * 2. Player-facing code (rule seats, the AI caller later, the console's desk,
 *    the interface later) imports the kernel only as `@mandate/kernel/seat-api`,
 *    so it can be handed a view and nothing else. A package joins this check
 *    by declaring `"mandate": { "playerFacing": true }`; the rule-seat package
 *    and `packages/cli/src/desk/` are on it now.
 * 3. M2's console still renders M2's own view and imports the M2 kernel; it is
 *    the one named exception, and retires with `turn` and `theatre`.
 */

/** Files the view layer must never reach: State, the truth layer, traits, transit, the tick. */
const FORBIDDEN = [
  'packages/kernel/src/root-state.ts',
  'packages/kernel/src/knowledge/truth.ts',
  'packages/kernel/src/knowledge/knowledge.ts',
  'packages/kernel/src/knowledge/beliefs.ts',
  'packages/kernel/src/messages/transit.ts',
  'packages/kernel/src/standin/',
  'packages/kernel/src/tick/',
  'packages/kernel/src/view/view.ts',
  'packages/kernel/src/state.ts',
] as const;

const VIEW_LAYER_ROOT = 'packages/kernel/src/seat-api.ts';
const SEAT_API = '@mandate/kernel/seat-api';

/** M2's player-facing files, which import the M2 kernel until M2 retires. The list only shrinks. */
const LEGACY_PLAYER_FACING = ['packages/cli/src/console.ts', 'packages/cli/src/format.ts'] as const;

/** Static import and re-export specifiers in a file (type-only imports included: a type is a dependency too). */
export function importsOf(source: string): string[] {
  const { withStrings } = lexSource(source);
  const pattern = /\b(?:import|export)\s+(?:type\s+)?(?:[\w$*{}\s,]+?\s+from\s+)?(['"])([^'"\n]+)\1/g;
  return [...withStrings.matchAll(pattern)].map((m) => m[2]!);
}

/** Resolve a relative specifier from a repo-relative file to a repo-relative path. */
function resolveRelative(from: string, specifier: string): string {
  const parts = from.split('/').slice(0, -1);
  for (const seg of specifier.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.') parts.push(seg);
  }
  return parts.join('/');
}

/** Every file reachable by relative imports from `root`, given a reader of repo-relative paths. */
export function importClosure(root: string, read: (path: string) => string): string[] {
  const seen = new Set<string>([root]);
  const queue = [root];
  while (queue.length > 0) {
    const file = queue.pop()!;
    for (const spec of importsOf(read(file))) {
      if (!spec.startsWith('.')) continue;
      const target = resolveRelative(file, spec);
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return [...seen].sort();
}

export function forbiddenIn(closure: readonly string[]): string[] {
  return closure.filter((f) => FORBIDDEN.some((x) => (x.endsWith('/') ? f.startsWith(x) : f === x)));
}

/** Why a player-facing file's import is not allowed, or null. */
export function playerFacingProblem(file: string, specifier: string, root: string): string | null {
  if (specifier.startsWith('.')) {
    const target = resolveRelative(file, specifier);
    return target.startsWith(root) ? null : `${file}: "${specifier}" leaves the player-facing folder ${root}`;
  }
  if (specifier === SEAT_API) return null;
  if (specifier.startsWith('@mandate/')) return `${file}: "${specifier}": player-facing code imports the kernel only as ${SEAT_API}`;
  return `${file}: "${specifier}": player-facing code imports nothing outside its folder but ${SEAT_API}`;
}

const readRepo = (path: string) => readFileSync(join(REPO_ROOT, path), 'utf8');

function playerFacingRoots(): string[] {
  const declared = workspacePackages()
    .filter((p) => (p.manifest.mandate as { playerFacing?: unknown } | undefined)?.playerFacing === true)
    .map((p) => `packages/${p.dir}/src/`);
  return [...declared, 'packages/cli/src/desk/'].sort();
}

describe('the view layer cannot reach State or the truth layer', () => {
  it('seat-api.ts and everything it imports stay clear of the forbidden files', () => {
    const closure = importClosure(VIEW_LAYER_ROOT, readRepo);
    expect(closure).toContain('packages/kernel/src/view/types.ts');
    expect(closure).toContain('packages/kernel/src/seats/api.ts');
    expect(forbiddenIn(closure)).toEqual([]);
  });

  it('catches a forbidden file reached through an intermediate (positive control)', () => {
    const files: Record<string, string> = {
      'packages/kernel/src/seat-api.ts': "export type { SeatView } from './view/types.ts';",
      'packages/kernel/src/view/types.ts': "import type { State } from '../root-state.ts';\nexport interface SeatView { s: State }",
      'packages/kernel/src/root-state.ts': "import type { ReportTruth } from './knowledge/truth.ts';",
      'packages/kernel/src/knowledge/truth.ts': '',
    };
    expect(forbiddenIn(importClosure('packages/kernel/src/seat-api.ts', (p) => files[p] ?? ''))).toEqual([
      'packages/kernel/src/knowledge/truth.ts',
      'packages/kernel/src/root-state.ts',
    ]);
  });
});

describe('player-facing code imports the kernel only through seat-api', () => {
  it('the rule-seat package is declared player-facing', () => {
    expect(playerFacingRoots()).toContain('packages/rule-seats/src/');
  });

  it('every player-facing file imports only its own folder and @mandate/kernel/seat-api', () => {
    const problems: string[] = [];
    let scanned = 0;
    for (const root of playerFacingRoots()) {
      for (const abs of tsFiles(join(REPO_ROOT, root))) {
        const file = repoPath(abs);
        scanned++;
        for (const spec of importsOf(readFileSync(abs, 'utf8'))) {
          const p = playerFacingProblem(file, spec, root);
          if (p) problems.push(p);
        }
      }
    }
    expect(scanned).toBeGreaterThan(1);
    expect(problems).toEqual([]);
  });

  it('flags State, the kernel root, a relative climb into the kernel and a node module (positive control)', () => {
    const file = 'packages/rule-seats/src/probe.ts';
    const root = 'packages/rule-seats/src/';
    const src = [
      "import type { State } from '@mandate/kernel';",
      "import { phase0 } from '@mandate/kernel';",
      "import type { ReportTruth } from '../../kernel/src/knowledge/truth.ts';",
      "import { readFileSync } from 'node:fs';",
      "import type { SeatView } from '@mandate/kernel/seat-api';",
      "import { chooseStep } from './index.ts';",
    ].join('\n');
    const problems = importsOf(src).map((s) => playerFacingProblem(file, s, root));
    expect(problems.map((p) => p !== null)).toEqual([true, true, true, true, false, false]);
  });

  it('names M2’s console as the only legacy exception, and the list shrinks when it retires', () => {
    for (const f of LEGACY_PLAYER_FACING) {
      expect(existsSync(join(REPO_ROOT, f)), `${f} is gone: remove it from LEGACY_PLAYER_FACING`).toBe(true);
      expect(importsOf(readRepo(f)).some((s) => s === '@mandate/kernel'), `${f} no longer imports the M2 kernel: remove it from the list`).toBe(true);
    }
    for (const root of playerFacingRoots()) for (const f of LEGACY_PLAYER_FACING) expect(f.startsWith(root)).toBe(false);
  });
});
