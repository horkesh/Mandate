/**
 * Regions' own State (FOUNDATION section 10: `regions` owns region population,
 * loyalty, supply value and fortification). Phase 0 builds one field, the
 * fortification a scenario start gives (0050: "each part of a start is copied
 * into State once at setup ... fortification by `regions`"). In play, operations
 * propose works dug by an axis holding its objective, and combat proposes works lost
 * when a defender is driven from them (lane 1.4; 0029); `applyFortification` applies both.
 */
import { strictCompare } from '../compare.ts';
import type { RegionId } from '../ids.ts';
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

/** Who may propose a change to fortification (FOUNDATION section 10's row: operations, combat). */
export const FORTIFICATION_CAUSES = ['operations', 'combat'] as const;
export type FortificationCause = (typeof FORTIFICATION_CAUSES)[number];

/** A proposed change to a region's works, signed permille. */
export interface FortificationDelta {
  readonly region: RegionId;
  readonly deltaPermille: number;
  readonly cause: FortificationCause;
}

/** A change applied, with the level before and after (the explanation trail). */
export interface FortificationChange {
  readonly region: RegionId;
  readonly before: number;
  readonly after: number;
  readonly cause: FortificationCause;
}

/**
 * The only writer of fortification in play: apply changes in order, each level clamped to 0..1000; a region at 0 is
 * removed, so the table stays sparse. Returns the State unchanged when nothing changes.
 */
export function applyFortification(state: State, deltas: readonly FortificationDelta[]): { readonly state: State; readonly changes: readonly FortificationChange[] } {
  if (deltas.length === 0) return { state, changes: [] };
  const next: Record<RegionId, number> = { ...state.regionFortification };
  const changes: FortificationChange[] = [];
  for (const d of deltas) {
    if (!Number.isSafeInteger(d.deltaPermille)) throw new FortificationError([`fortification change for ${d.region} must be a whole permille, got ${d.deltaPermille}`]);
    const before = next[d.region] ?? 0;
    const after = Math.max(0, Math.min(1000, before + d.deltaPermille));
    if (after === before) continue;
    if (after === 0) delete next[d.region];
    else next[d.region] = after;
    changes.push({ region: d.region, before, after, cause: d.cause });
  }
  if (changes.length === 0) return { state, changes };
  const sorted: Record<RegionId, number> = {};
  for (const r of (Object.keys(next) as RegionId[]).sort(strictCompare)) sorted[r] = next[r]!;
  return { state: { ...state, regionFortification: sorted }, changes };
}