import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface Finding { rule: string; path: string; detail: string; hash: string }
export interface JsonItem { path: string; value: Record<string, unknown>; context?: unknown }
export function fingerprint(value: unknown): string {
  const ordered = (v: unknown): unknown => Array.isArray(v) ? v.map(ordered)
    : v !== null && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, ordered(x)])) : v;
  return createHash('sha256').update(JSON.stringify(ordered(value))).digest('hex');
}
export function filesUnder(root: string, directory: string): string[] {
  return readdirSync(join(root, directory), { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    .flatMap(e => e.isDirectory() ? (['node_modules', 'dist', '.git', 'runs'].includes(e.name) ? [] : filesUnder(root, `${directory}/${e.name}`)) : [relative(root, join(root, directory, e.name)).replaceAll('\\', '/')]);
}
export function jsonAt<T>(root: string, path: string): T { return JSON.parse(readFileSync(join(root, path), 'utf8')) as T; }

/** Existing defects are evidence, never broad exemptions: edits invalidate their fingerprint. */
export function ratchet(findings: readonly Finding[], baseline: readonly Finding[]): string[] {
  const key = (f: Finding) => `${f.rule}|${f.path}|${f.detail}|${f.hash}`;
  const old = new Set(baseline.map(key));
  const now = new Set(findings.map(key));
  return [
    ...findings.filter(f => !old.has(key(f))).map(f => `NEW ${f.rule} ${f.path}: ${f.detail} [${f.hash}]`),
    ...baseline.filter(f => !now.has(key(f))).map(f => `STALE baseline ${f.rule} ${f.path}: remove the resolved entry; do not refresh a changed defect`),
    ...(old.size !== baseline.length ? ['duplicate baseline entry'] : []),
  ];
}
export function baselineHistoryProblems(before: readonly Finding[], now: readonly Finding[], checkerChanged: boolean): string[] {
  const key = (f: Finding) => `${f.rule}|${f.path}|${f.detail}`;
  const old = new Map(before.map(f => [key(f), f]));
  return now.flatMap(f => {
    const previous = old.get(key(f));
    if (previous === undefined) return [`known findings cannot grow: ${f.rule} ${f.path}`];
    return previous.hash !== f.hash && !checkerChanged ? [`cannot refresh a known defect fingerprint without changing its checker: ${f.rule} ${f.path}`] : [];
  });
}
