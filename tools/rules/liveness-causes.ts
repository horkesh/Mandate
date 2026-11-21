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
      // S34 imports older, explicitly documented quiet bands. This exact,
      // immutable baseline cannot authorize a later zero-floor transition.
      const inherited = n === 0 && r.after.minFires === 0 && inheritedQuiet.some(old => fingerprint(old) === fingerprint(r));
      if (!inherited) {
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
  return fingerprint(before) === fingerprint(current) ? [] : ['the S34 inherited quiet-band baseline is immutable; future changes need ordinary cause records'];
}
