/**
 * Regions' own State (FOUNDATION section 10: `regions` owns region population,
 * loyalty, supply value and fortification). Phase 0 builds one field, the
 * fortification a scenario start gives (0050: "each part of a start is copied
 * into State once at setup ... fortification by `regions`"). Nothing writes it
 * in play yet: the siege method (0062) and Phase 1's operations and combat will
 * read it, and propose changes for `regions` to apply.
 */
import { strictCompare } from '../compare.ts';
import type { RegionId } from '../ids.ts';
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
