import { strictCompare } from '../compare.ts';
import { holdingFromShares } from '../control-index/control-index.ts';
import type { ControlShares } from '../control/vocabulary.ts';
import type { FactionId, RegionId } from '../ids.ts';
import type { KnownReport } from './records.ts';

interface ControlReport {
  readonly report: KnownReport;
  readonly shares: ControlShares;
}

interface ControlEvidence {
  readonly latest: ControlReport;
  readonly holder: FactionId | null;
  readonly contested: boolean;
  readonly corroboration: KnownReport | undefined;
  readonly precedingChange: KnownReport | undefined;
  readonly government: { readonly neutral: boolean; readonly report: KnownReport } | undefined;
}

function newestFirst(a: KnownReport, b: KnownReport): number {
  return b.knownBody.reportDay - a.knownBody.reportDay || b.knownReceivedDay - a.knownReceivedDay || strictCompare(b.id, a.id);
}

/** Parse the reports the seat holds, with no State, perception or truth input. */
export function controlEvidence(reports: readonly KnownReport[], threshold: number): ReadonlyMap<RegionId, ControlEvidence> {
  const history = new Map<RegionId, ControlReport[]>();
  const governments = new Map<RegionId, { neutral: boolean; report: KnownReport }>();
  for (const report of reports) {
    const sharesByRegion = new Map<RegionId, Map<FactionId, number>>();
    for (const c of report.knownBody.reportClaims) {
      if (c.claimRegion === null || c.claimToken === null) continue;
      if (c.claimKind === 'control-government') {
        const existing = governments.get(c.claimRegion);
        if (existing === undefined || newestFirst(report, existing.report) < 0) governments.set(c.claimRegion, { neutral: c.claimValue === 1, report });
      }
      if (c.claimKind !== 'control') continue;
      let shares = sharesByRegion.get(c.claimRegion);
      if (shares === undefined) {
        shares = new Map();
        sharesByRegion.set(c.claimRegion, shares);
      }
      if (c.claimValue > 0) shares.set(c.claimToken as FactionId, c.claimValue);
    }
    for (const [region, shares] of sharesByRegion) {
      const snapshot = { report, shares: Object.freeze(Object.fromEntries([...shares].sort(([a], [b]) => strictCompare(a, b)))) };
      const existing = history.get(region);
      if (existing === undefined) history.set(region, [snapshot]);
      else existing.push(snapshot);
    }
  }

  const evidence = new Map<RegionId, ControlEvidence>();
  for (const region of [...history.keys()].sort(strictCompare)) {
    const snapshots = history.get(region)!.sort((a, b) => newestFirst(a.report, b.report));
    const latest = snapshots[0]!;
    const { holder, tracedBy } = holdingFromShares(region, latest.shares, threshold);
    let corroboration: KnownReport | undefined;
    let precedingChange: KnownReport | undefined;
    for (let i = 1; i < snapshots.length; i++) {
      const { report, shares } = snapshots[i]!;
      if (holdingFromShares(region, shares, threshold).holder !== holder) {
        precedingChange = report;
        break;
      }
      if (report.knownBody.reportAuthor !== latest.report.knownBody.reportAuthor) corroboration ??= report;
    }
    evidence.set(region, { latest, holder, contested: tracedBy.length > 1, corroboration, precedingChange, government: governments.get(region) });
  }
  return evidence;
}
