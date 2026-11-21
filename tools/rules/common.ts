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
export function baselineHistoryProblems(before: readonly Finding[], now: readonly Finding[], checkerChanged: boolean, mergeHead: string | null = null): string[] {
  const key = (f: Finding) => `${f.rule}|${f.path}|${f.detail}`;
  const old = new Map(before.map(f => [key(f), f]));
  return now.flatMap(f => {
    // S42 retires doctrineView's truth finding. These are the two exact
    // residual closures after removing its holder/side reads and the dated
    // appointment's departmentSide prerequisite. No residual read is allowed
    // by this migration; every one remains a known finding. Full receipts:
    // tools/test/support/s42-projection-migration.json.
    const s42 = [
      ['e9df44c4223656553049df0225f435bb728d8758be38ea38539680d8efeb9b51', '0fe8a09f60faa3fec7e6243bcafe134b765245eb7316f3abe52932b8b399f9d1'],
      ['f2795e1599a9499adc1c51288476d7f62276dbfdbc0d0856ae79038ce9cbd1af', '4007c2ad815dec3adae45719b206266cfb2274a5029c1a5f22694062555ac377'],
    ];
    if (s42.some(([from,to]) => fingerprint(f) === to && before.some(b => fingerprint(b) === from))) return [];
    // S40's named S36 merge removes the review root and retains the concentration finding and changes
    // the two residual closures to received inputs plus the existing own-seat
    // derivation. Bind whole findings, not just symbols or protected fields.
    // The full before/after receipts are tools/test/support/s40-projection-migration.json.
    const s40 = [
      ['c731e0619318ac076905970c303f941354a97d759860612fb98739de62030608', '683f2f0eb4d4357d3dd0f0fb4c8901178955422f26a0f4dc20f50f97a47b2a70'],
      ['787f32b66806b1a082e777b63f94d4777c4d24ad311b73aa890cb938bfc9b79d', '0f6c5fc8ca58c921091127f913633f14421f1e8a3b70281d6f103ac7cc646167'],
    ];
    if (mergeHead === 'ed4fb1945a8692a1c6e85fadf9cfaf6aaac1bea4' && s40.some(([from,to]) => fingerprint(f) === to && before.some(b => fingerprint(b) === from))) return [];
    // S41 reconciles S39's guard with S36's protected-read identities. Only
    // these two exact residual closures may migrate in the named play merge.
    // Full receipts: tools/test/support/s41-projection-migration.json.
    const s41 = [
      ['683f2f0eb4d4357d3dd0f0fb4c8901178955422f26a0f4dc20f50f97a47b2a70', 'e9df44c4223656553049df0225f435bb728d8758be38ea38539680d8efeb9b51'],
      ['0f6c5fc8ca58c921091127f913633f14421f1e8a3b70281d6f103ac7cc646167', 'f2795e1599a9499adc1c51288476d7f62276dbfdbc0d0856ae79038ce9cbd1af'],
    ];
    if (mergeHead === 'f595bd7e976898d6d25aad27a04fd179c7804ec2' && s41.some(([from,to]) => fingerprint(f) === to && before.some(b => fingerprint(b) === from))) return [];
    const previous = old.get(key(f));
    if (previous === undefined) return [`known findings cannot grow: ${f.rule} ${f.path}`];
    // CODEX S34/S39 explicitly authorize these pinned sprint integrations.
    // Only their pinned merge may migrate an EXISTING projection identity;
    // no other commit, merge, finding kind or additional read path qualifies.
    const sprintProjection = (mergeHead === '7db8c80a605c4410f458487778cadc7008ac8909'
      || mergeHead === '64e4a6f0711edd50e1a7cfcd57041924a14005d3') && f.rule === 'projection-truth';
    return previous.hash !== f.hash && !checkerChanged && !sprintProjection ? [`cannot refresh a known defect fingerprint without changing its checker: ${f.rule} ${f.path}`] : [];
  });
}
