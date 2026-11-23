import { forceTotals, type StrengthKinds } from '@mandate/kernel';
/**
 * Checkpoint scores for a Phase 0 run (FOUNDATION section 11.6).
 *
 * Phase 0 has no victory measure, no politics and no casualties, so a
 * checkpoint's "scores" are counts of named things the map phases derive,
 * read from the tick's own derived map and State, never recomputed here:
 * ground held, fronts, pockets, strength on hand (with the blocks whose
 * strength no source gives, listed rather than counted as zero), and how many
 * blocks are marching. They are a report, never saved or hashed. Phase 1's
 * history run replaces them with the calibration targets (bands and counts of
 * named things, section 11).
 */
import { phase0 } from '@mandate/kernel';

export interface FactionScore {
  readonly faction: string;
  /** Regions it holds (the holder: a share at the supply threshold and no equal rival). */
  readonly held: number;
  /** Regions it traces (a share at or above the threshold), held or contested. */
  readonly traced: number;
  /** Sum of its control shares over every region, in permille. */
  readonly controlPermille: number;
  /** Land regions it traces that have a supply path from a source or depot. */
  readonly supplied: number;
  readonly frontLines: number;
  readonly frontSegments: number;
  readonly pockets: number;
  readonly pocketRegions: number;
  /** Men in its blocks that have a known strength. */
  readonly menKnown: number;
  readonly menByKind: StrengthKinds;
  readonly unknownLots: readonly string[];
  /** Blocks whose strength no source gives (counted as none, and listed here). */
  readonly blocksUnknownStrength: number;
}

export interface CheckpointScores {
  readonly factions: readonly FactionScore[];
  readonly contestedRegions: number;
  readonly blocksMarching: number;
  readonly blocksTotal: number;
}

/** The checkpoint's scores from the day's tick result and the World. */
export function checkpointScores(world: phase0.SeatsWorld, result: phase0.TickResult): CheckpointScores {
  const { state, map } = result;
  const factions = world.map.world.factions.map((f) => f.id).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const rows: FactionScore[] = factions.map((faction) => {
    let controlPermille = 0;
    for (const shares of Object.values(state.regionControl)) controlPermille += shares[faction] ?? 0;
    let menKnown = 0;
    let unknown = 0;
    const menByKind = { return:0,estimate:0,rule:0,unknown:null };
    const unknownLots:string[]=[];
    for (const block of Object.values(state.forceBlockStates)) {
      // A block's side is its department's side today, which is State (0065): a government that changed side counts on its new one.
      if (phase0.departmentSide(state, block.fbDepartment) !== faction) continue;
      const totals = forceTotals(block, world.map.forceTotalsCache);
      if (totals.fbStrength === null) unknown += 1;
      for (const kind of ['return','estimate','rule'] as const) menByKind[kind] += totals.fbByKind[kind];
      unknownLots.push(...totals.fbUnknownLots);
      menKnown += totals.fbByKind.return + totals.fbByKind.estimate + totals.fbByKind.rule;
    }
    const fronts = map?.index.fronts.get(faction) ?? [];
    const pockets = map?.supply.factions.get(faction)?.pockets ?? [];
    let held = 0;
    for (const holding of map?.index.holdings.values() ?? []) if (holding.holder === faction) held += 1;
    return {
      faction,
      held,
      traced: map?.index.traced.get(faction)?.length ?? 0,
      controlPermille,
      supplied: map?.supply.factions.get(faction)?.paths.size ?? 0,
      frontLines: fronts.length,
      frontSegments: fronts.reduce((n, f) => n + f.segments.length, 0),
      pockets: pockets.length,
      pocketRegions: pockets.reduce((n, p) => n + p.regions.length, 0),
      menKnown,
      menByKind,
      unknownLots,
      blocksUnknownStrength: unknown,
    };
  });
  const locations = Object.values(state.forceLocations);
  return {
    factions: rows,
    contestedRegions: map?.index.contested.length ?? 0,
    blocksMarching: locations.filter((l) => l.locMarch !== null).length,
    blocksTotal: locations.length,
  };
}
