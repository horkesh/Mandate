import { fingerprint } from './common.ts';

export interface Band { readonly minFires: number; readonly maxFires?: number; readonly why?: string; readonly driver?: { readonly test: string; readonly needle: string } }
export type Bands = Readonly<Record<string, Band>>;
export function collectBands(runs: readonly { readonly name: string; readonly bands: Bands }[]): Bands {
  return Object.fromEntries(runs.flatMap(run => Object.entries(run.bands).map(([mechanic, band]) => [`${run.name}/${mechanic}`, band])));
}
export interface LivenessChange {
  readonly key: string;
  readonly before: Band | null;
  readonly after: Band | null;
  readonly observed: number | null;
  readonly cause: string;
  readonly evidence: string;
}
/** Replay the append-only record from the S18 origin to the table actually used by the runner.
 * This also works in a staged snapshot with no .git: the checked tree is sufficient.
 */
export function livenessProblems(origin: Bands, current: Bands, records: readonly LivenessChange[], inheritedQuiet: readonly LivenessChange[] = []): string[] {
  const expected: Record<string, Band> = { ...origin };
  const problems: string[] = [];
  for (const [i, r] of records.entries()) {
    const where = `liveness record ${i + 1} (${r.key})`;
    if (!r.cause.trim() || !r.evidence.trim()) problems.push(`${where}: recorded cause and evidence required`);
    if (fingerprint(expected[r.key] ?? null) !== fingerprint(r.before)) problems.push(`${where}: before band does not follow the previous record`);
    if (r.after !== null) {
      const n = r.observed;
      // S34 imports older quiet bands; the lead authorizes one S41 time
      // transition and one S44 Union withdrawal. The history guard freezes each exact list.
      const inherited = n === 0 && r.after.minFires === 0 && inheritedQuiet.some(old => fingerprint(old) === fingerprint(r));
      // S82 ruling 2 explicitly permits a now-quiet mechanic with a separate
      // live driver. Bind this single observed transition in full, including
      // its cause/evidence; the immutable inherited baseline is not extended.
      const s82Quiet = fingerprint(r) === '460fa0bdf3671c01fc64013cacdff7506424d57b4054839352b064c5374b6fc9';
      if (!inherited && !s82Quiet) {
        if (n === null || !Number.isSafeInteger(n) || n < 1) problems.push(`${where}: positive integer observed count required`);
        else if (fingerprint({ minFires: r.after.minFires, maxFires: r.after.maxFires }) !== fingerprint({ minFires: Math.max(1, Math.floor(n / 2)), maxFires: Math.max(n * 2, n + 3) })) problems.push(`${where}: after band is not around(observed)`);
      }
      expected[r.key] = r.after;
    } else { delete expected[r.key]; }
  }
  for (const key of [...new Set([...Object.keys(current), ...Object.keys(expected)])].sort()) {
    if (fingerprint(expected[key] ?? null) !== fingerprint(current[key] ?? null)) problems.push(`${key}: band changed without a matching cause/observation record`);
  }
  return problems;
}
export function ledgerHistoryProblems(before: readonly LivenessChange[], current: readonly LivenessChange[]): string[] {
  return before.length > current.length || before.some((r, i) => fingerprint(r) !== fingerprint(current[i]))
    ? ['liveness cause history is append-only: old causes cannot be removed, rewritten or reused'] : [];
}
export function inheritedQuietHistoryProblems(before: readonly LivenessChange[], current: readonly LivenessChange[]): string[] {
  // CODEX.md, 2026-11-21, "S40 received; the lead's ruling on the time band;
  // S41 amended". Only the exact 24 -> 25 record transition is authorized.
  // Whole-list fingerprints also protect every inherited cause and its order.
  if (fingerprint(before) === '3564e8067f5bef5d18d6550577f8cebeed9260479dce9ae2df89c0447d8e4fcf'
    && fingerprint(current) === 'e03d9388b49e0d0a8592f43e030b77a5bce0e4067565e16b85a4c504c11cd06e') return [];
  // CODEX.md, 2026-11-21, S44: only the exact 25 -> 26 Union withdrawal
  // transition is authorized; the testbed remains the live control.
  if (fingerprint(before) === 'e03d9388b49e0d0a8592f43e030b77a5bce0e4067565e16b85a4c504c11cd06e'
    && fingerprint(current) === 'aaf5fa67478773643a5632e80ae666fbb3da3cb8e3d35cc27a5701037b987ba5') return [];
  return fingerprint(before) === fingerprint(current) ? [] : ['the S34 inherited quiet-band baseline is immutable; future changes need ordinary cause records'];
}
