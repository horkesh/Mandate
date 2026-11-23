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
      // S90 continuation ruling 4 authorizes only the exact messenger return
      // to quiet, with its named independent driver and retained event evidence.
      const s90Quiet = fingerprint(r) === '8ba5f6d556f19e7141ca66023f8dbb2b3b257debb6a27a6af2c221a5ccd78dfc';
      // S92 ruling 3 permits four newly quiet Union bands after 0113. Freeze
      // the complete records, including cause, evidence and exact zero ceiling.
      // Receipts and live controls: tools/test/support/s92-quiet-transitions.json.
      const s92Quiet = [
        '8bdb4ffc7da869dd1bfe69aa9eb4423e745e323d607d7b218e2da663027fa800',
        '47543daa3889e6fd2ad26ce427befe0126cbe9bb9da626ca67e10b0977975d7e',
        '2e93b31911e1584cfcc62153fa48095d3800963555bd4ca8394df1e5256e22f7',
        '369be556873a08393c353c4dc15f1c8bbe28bdbba2eeba9b24c365d60700f336',
      ].includes(fingerprint(r));
      // S98: review the accepted S97 application band by band, as S92 did.
      // Bind five now-quiet Union paths and three testbed wording corrections
      // to their complete observed records and retained live controls.
      const s98Quiet = [
        'a7451a43e70a8130c20d6b8adc284081f79f1e253ac118e219d109963081018a',
        'c0680fd24f7d05223653c54969aa4b3e78c7a57b14bc44c6f436ff64e7dbf417',
        '752859cc4580b4ad3610a6b74e30a24877d6e57e4eb3935ed0054726591155aa',
        '050979f2c7a814065b2b31800764ead8f0e228184429b85ab1c09d6286ca88ea',
        'a980a88dc7af1ed1213a5330e4d2f3d2b6a5f0bcba7c63d911a2bbc42e089822',
        '9fb4d82ec7415440bd8acf7d3f0ccfa122b8b8f0560d878a239e2865961a1803',
        '4fa865169228dbab8f3d90ea90fb379afed80e97ae181e8469785fe0c9e5f045',
        '629dcb749c4a4a0cb3ac02098eb628369b3cffe7df4bee452ca2a092a0df1f33',
      ].includes(fingerprint(r));
      // S96 adds only four new exact quiet diagnostics under0114, each
      // with the independent live driver in its retained band review.
      // Bind the whole records so no other zero transition is admitted.
      const s96Quiet = [
        'f87e2732d638e4c3d9c77361ff76b156cababe6f52358a0ee5ba798f6b959ebd',
        '3c08c2839304b1ba5c585acc0ef09907836a9c9f81fc275954b66d847ae78bb7',
        'de0a4fef9d2c273238bc429e3e140d228f0432d7a701854758afb7649dd9dfa4',
        '3b6c6f35b534739ecdf43873f23123175738980d0a042719e268695f4fd97c33',
      ].includes(fingerprint(r));
      // S106 /0118 retires the numeric-rung muster delay. This exact observed
      // Union zero retains the testbed's live slow-walk control; no other transition is admitted.
      const s106Quiet = fingerprint(r) === 'ce57e127980428ee61974fc114d635695fe316a04a9cc771390594aade04d3ef';
      // CODEX 2026-11-23: S119 received; the three quiet bands are authorised; commit.
      // Only these complete Union records are allowed; their independent live driver is retained.
      const s119Quiet = [
        '79d9f1777d4c05289150b08e6b0f5cbcf5175af5d33d9981d432c90a4079afda',
        'd267609dfc583151e2c695995f945fe29cdb04306ff59448b1147683308fd064',
        '1a0118e99e7d9c808ee42d1f4d7524fc425281ff8cbaba84238449f9f4562cc4',
      ].includes(fingerprint(r));
      // CODEX 2026-11-23: S122's one landing zero is authorised with its paired driver.
      // The complete record is frozen; no other zero or cause is admitted.
      const s122Quiet = fingerprint(r) === 'd88f7c043e717692f3fe541b545a1385efaca2bfeda16a1cba32d6a20c8e2652';
      if (!inherited && !s82Quiet && !s90Quiet && !s92Quiet && !s98Quiet && !s96Quiet && !s106Quiet && !s119Quiet && !s122Quiet) {
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
