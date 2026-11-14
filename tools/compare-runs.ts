#!/usr/bin/env node
/**
 * Compare headless run summaries across machines (FOUNDATION section 11.1:
 * CI runs the same scenario on Linux and Windows and compares hashes).
 *
 *   tsx tools/compare-runs.ts <dir or summary.json> <dir or summary.json>
 *
 * Each argument may be a folder; every `summary.json` under it is matched
 * with the other side's by pack. Exits 1 on any difference, naming the first
 * diverging turn, and 2 if there is nothing to compare.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export interface Summary {
  readonly pack: string;
  readonly hashScheme: string;
  readonly worldHash: string;
  readonly initialHash: string;
  readonly turns: readonly { readonly turn: number; readonly hash: string }[];
  readonly finalHash: string;
  readonly resume: { readonly matches: boolean } | null;
}

/** Differences between two runs of the same scenario. Empty when they agree on every hash. */
export function compareSummaries(a: Summary, b: Summary): string[] {
  const problems: string[] = [];
  for (const field of ['pack', 'hashScheme', 'worldHash', 'initialHash'] as const) {
    if (a[field] !== b[field]) problems.push(`${field} differs: ${a[field]} vs ${b[field]}`);
  }
  if (a.turns.length !== b.turns.length) problems.push(`turn count differs: ${a.turns.length} vs ${b.turns.length}`);
  const first = a.turns.findIndex((t, i) => t.hash !== b.turns[i]?.hash);
  if (first !== -1) problems.push(`first diverging turn: ${a.turns[first]!.turn} (${a.turns[first]!.hash} vs ${b.turns[first]?.hash ?? 'missing'})`);
  if (a.finalHash !== b.finalHash) problems.push(`final hash differs: ${a.finalHash} vs ${b.finalHash}`);
  for (const [side, s] of [['first', a], ['second', b]] as const) {
    if (s.resume && !s.resume.matches) problems.push(`${side} run: resume did not match the continuous run`);
  }
  return problems;
}

function summaries(path: string): Summary[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [JSON.parse(readFileSync(path, 'utf8')) as Summary];
  return readdirSync(path)
    .sort()
    .flatMap((name) => {
      const child = join(path, name);
      if (statSync(child).isDirectory()) return summaries(child);
      return name === 'summary.json' ? [JSON.parse(readFileSync(child, 'utf8')) as Summary] : [];
    });
}

function main(argv: readonly string[]): number {
  if (argv.length !== 2) {
    console.error('usage: compare-runs <left dir|summary.json> <right dir|summary.json>');
    return 2;
  }
  const [left, right] = argv.map(summaries) as [Summary[], Summary[]];
  if (left.length === 0 || right.length === 0) {
    console.error(`nothing to compare: ${left.length} summaries in ${argv[0]}, ${right.length} in ${argv[1]}`);
    return 2;
  }
  const packs = [...new Set([...left, ...right].map((s) => s.pack))].sort();
  let failed = false;
  for (const pack of packs) {
    const a = left.filter((s) => s.pack === pack);
    const b = right.filter((s) => s.pack === pack);
    if (a.length !== 1 || b.length !== 1) {
      console.error(`${pack}: expected one summary per side, found ${a.length} and ${b.length}`);
      failed = true;
      continue;
    }
    const problems = compareSummaries(a[0]!, b[0]!);
    if (problems.length > 0) {
      failed = true;
      console.error(`${pack}: DIFFERENT\n${problems.map((p) => `  ${p}`).join('\n')}`);
    } else {
      console.log(`${pack}: identical across both runs (${a[0]!.turns.length} turn hashes, final ${a[0]!.finalHash})`);
    }
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
