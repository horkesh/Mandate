import { strictCompare } from '../compare.ts';
import type { FactionId, RegionId } from '../ids.ts';
import type { ControlShares } from '../control/vocabulary.ts';
import type { ReportClaim } from './report.ts';

/** Snapshot the shares in one region. All-zero claims explicitly say it is held by no faction. */
export function controlClaims(region: RegionId, shares: ControlShares, factions: readonly FactionId[]): ReportClaim[] {
  const holders = Object.keys(shares) as FactionId[];
  return (holders.length > 0 ? holders : [...factions]).sort(strictCompare).map((faction) => ({
    claimKind: 'control', claimRegion: region, claimValue: Object.hasOwn(shares, faction) ? shares[faction]! : 0, claimToken: faction, claimConfidence: 1000,
  }));
}
