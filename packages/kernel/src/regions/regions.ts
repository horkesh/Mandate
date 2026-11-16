/**
 * Regions' own State (FOUNDATION section 10: `regions` owns region population,
 * loyalty, supply value and fortification). Phase 0 builds one field, the
 * fortification a scenario start gives (0050: "each part of a start is copied
 * into State once at setup ... fortification by `regions`"). Nothing writes it
 * in play yet: the siege method (0062) and Phase 1's operations and combat will
 * read it, and propose changes for `regions` to apply.
 */
import { strictCompare } from '../compare.ts';
import type { FactionId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import type { ScenarioStart } from '../world/scenario.ts';

/** Fortification and entrenchment per region, permille (0: none). A region absent has none. */
export type FortificationTable = Readonly<Record<RegionId, number>>;

export class FortificationError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid fortification:\n- ${problems.join('\n- ')}`);
    this.name = 'FortificationError';
  }
}

/**
 * The start's fortification, in canonical (region id) order, checked as control's and the governments' setup are:
 * every problem is reported together (a region not in the World, a water or off-map region, a region listed twice, a
 * level that is not a whole permille from 0 to 1000). The pack validator says the same at a source cell; this keeps
 * any start the kernel is handed (a fixture, an adapter) from setting up with a bad row.
 */
export function initialFortification(map: WorldIndex, start: ScenarioStart): FortificationTable {
  const problems: string[] = [];
  const out: Record<RegionId, number> = {};
  for (const f of [...start.fortification].sort((a, b) => strictCompare(a.region, b.region))) {
    const region = map.regions.get(f.region);
    if (!region) {
      problems.push(`region ${f.region} is not in the World`);
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(out, f.region)) problems.push(`region ${f.region} is listed twice`);
    if (region.kind !== 'land' && region.kind !== 'key_point') problems.push(`region ${f.region} is ${region.kind}, which is never fortified`);
    if (!Number.isSafeInteger(f.levelPermille) || f.levelPermille < 0 || f.levelPermille > 1000) problems.push(`region ${f.region}: level ${f.levelPermille} is not a permille from 0 to 1000`);
    out[f.region] = f.levelPermille;
  }
  if (problems.length > 0) throw new FortificationError(problems);
  return out;
}

/** A problem with regions' own State (loyalty, arrivals). */
export class RegionsError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid regions State:\n- ${problems.join('\n- ')}`);
    this.name = 'RegionsError';
  }
}

/**
 * Loyalty per region (lane 1.7; FOUNDATION section 10: `regions` owns it): each faction's share of the people's loyalty,
 * permille, summing to at most 1000 (the rest is no one's). It is never a stand-in for control (`OPEN_QUESTIONS`): control
 * is who holds the ground, loyalty is whom its people hold to. A region absent has no loyalty recorded.
 */
export type LoyaltyTable = Readonly<Record<RegionId, Readonly<Record<FactionId, number>>>>;

/** The start's loyalty, checked as fortification's is: every problem together (a region not in the World or not land, a faction not in the World, a share not a permille, shares over 1000, a region listed twice). */
export function initialLoyalty(map: WorldIndex, start: ScenarioStart): LoyaltyTable {
  const factions = new Set(map.world.factions.map((f) => f.id));
  const problems: string[] = [];
  const out: Record<RegionId, Readonly<Record<FactionId, number>>> = {};
  for (const l of [...start.loyalty].sort((a, b) => strictCompare(a.region, b.region))) {
    const region = map.regions.get(l.region);
    if (!region) {
      problems.push(`loyalty: region ${l.region} is not in the World`);
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(out, l.region)) problems.push(`loyalty: region ${l.region} is listed twice`);
    if (region.kind !== 'land' && region.kind !== 'key_point') problems.push(`loyalty: region ${l.region} is ${region.kind}, which has no people of its own`);
    const shares: Record<FactionId, number> = {};
    let sum = 0;
    for (const s of l.shares) {
      if (!factions.has(s.faction)) problems.push(`loyalty: region ${l.region}: faction ${s.faction} is not in the World`);
      if (!Number.isSafeInteger(s.permille) || s.permille < 0 || s.permille > 1000) problems.push(`loyalty: region ${l.region}: share ${s.permille} is not a permille`);
      if (Object.prototype.hasOwnProperty.call(shares, s.faction)) problems.push(`loyalty: region ${l.region}: faction ${s.faction} has two shares`);
      shares[s.faction] = s.permille;
      sum += s.permille;
    }
    if (sum > 1000) problems.push(`loyalty: region ${l.region}: shares sum to ${sum}, over 1000`);
    out[l.region] = shares;
  }
  if (problems.length > 0) throw new RegionsError(problems);
  return out;
}

/** A faction's share of a region's loyalty, permille; null when no loyalty is recorded for the region (never guessed from control). */
export function loyaltyOf(state: State, region: RegionId, faction: FactionId): number | null {
  const row = state.regionLoyalty[region];
  return row === undefined ? null : (row[faction] ?? 0);
}

/**
 * The protected field ids the Union pack's gate register reserves for this topic (lane 1.8; SENSITIVE-HISTORY 3.2):
 * people who have reached the lines are State written only by `regions`, proposed only by the derived self-emancipation
 * term; the census population is protected World input, read only by that derivation and never written.
 */
export const REACHED_UNION_LINES_FIELD = 'region_reached_union_lines';
/** Not a proposal field (nothing proposes it): the census is World input, named here so the gate's protected id and the kernel's agree. */
export const ENSLAVED_POPULATION_INPUT = 'region_enslaved_population';

/** People who have reached the lines, by the region where they reached them (0046; never a lever, never a stock either side spends). */
export type ArrivalTable = Readonly<Record<RegionId, number>>;

/** What the derived self-emancipation term proposes: people who reached the lines in `region` today (`regions/self-emancipation.ts`). */
export interface ArrivalProposal {
  readonly field: typeof REACHED_UNION_LINES_FIELD;
  readonly region: RegionId;
  readonly people: number;
  readonly origin: 'self-emancipation';
}

/** Apply the derived term's proposals: the only writer of who has reached the lines. A count only grows; none proposed, the same State. */
export function applyArrivals(state: State, proposals: readonly ArrivalProposal[]): State {
  const real = proposals.filter((p) => p.people > 0);
  if (real.length === 0) return state;
  const next: Record<RegionId, number> = { ...state.regionReachedUnionLines };
  for (const p of real) {
    if (p.field !== REACHED_UNION_LINES_FIELD || p.origin !== 'self-emancipation') throw new RegionsError([`only the derived self-emancipation term proposes ${REACHED_UNION_LINES_FIELD}`]);
    if (!Number.isSafeInteger(p.people)) throw new RegionsError([`arrivals in ${p.region} must be a whole number`]);
    next[p.region] = (next[p.region] ?? 0) + p.people;
  }
  return { ...state, regionReachedUnionLines: next };
}