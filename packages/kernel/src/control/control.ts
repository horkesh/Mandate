/**
 * Control (FOUNDATION sections 4 and 10; decisions 0019, 0050): a permille per
 * faction per region, so fronts are soft. This module is State's only writer
 * of control. Others propose typed deltas (`ControlDelta`: combat, occupation,
 * lane 0.5) and `applyControl` applies them, returning every change and every
 * threshold crossed with its cause (hard rule 6).
 *
 * Rules:
 * - shares are whole permille, zero shares are omitted, and a region's shares
 *   sum to at most 1000; the rest is no one's;
 * - only land regions and key points carry control. Open water (river and sea
 *   regions) is no one's, and off-map boxes stand outside the map's control;
 * - a gain that would push the total over 1000 is taken from the other
 *   factions, the largest share first (ties by faction id);
 * - the thresholds (the pack's supply and retreat permille, 250 and 50 to
 *   start, 0019) are where derived indexes recompute (`control-index`).
 *
 * State is copy-on-write (0052): `applyControl` returns a new State sharing
 * every unchanged region's shares.
 */
import { strictCompare } from '../compare.ts';
import { lookup, type FactionId, type RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import type { ScenarioStart } from '../world/scenario.ts';
import type { ControlShares, RegionControlTable } from './vocabulary.ts';

export type { ControlShares, RegionControlTable } from './vocabulary.ts';

/**
 * Who may propose a control change: the proposers `OWNED_FIELDS` lists for
 * region control. A typed reason (hard rule 6), so an unlisted proposer fails
 * typecheck; a test keeps this list and `OWNED_FIELDS` equal.
 */
export const CONTROL_CAUSES = ['combat', 'occupation'] as const;
export type ControlCause = (typeof CONTROL_CAUSES)[number];

/** A change a mechanism proposes for the control writer to apply. */
export interface ControlDelta {
  readonly region: RegionId;
  readonly faction: FactionId;
  /** Signed permille. */
  readonly deltaPermille: number;
  /** What proposed it, for the explanation trail. */
  readonly cause: ControlCause;
}

/** A change applied, with the shares it took from others when the total would pass 1000. */
export interface ControlChange {
  readonly region: RegionId;
  readonly faction: FactionId;
  readonly before: number;
  readonly after: number;
  readonly cause: ControlCause;
  readonly takenFrom: readonly { readonly faction: FactionId; readonly permille: number }[];
}

/** A faction's share passing one of the pack's control thresholds. */
export interface ThresholdCrossing {
  readonly region: RegionId;
  readonly faction: FactionId;
  readonly threshold: number;
  readonly direction: 'up' | 'down';
  readonly cause: ControlCause;
}

export class ControlError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid control:\n- ${problems.join('\n- ')}`);
    this.name = 'ControlError';
  }
}

/** Whether a region kind carries control (land and key points); open water and off-map boxes never do. */
export function carriesControl(map: WorldIndex, region: RegionId): boolean {
  const kind = lookup('region', map.regions, region).kind;
  return kind === 'land' || kind === 'key_point';
}

/** A faction's share of a region; 0 when it holds none. Throws on an unknown region. */
export function shareOf(map: WorldIndex, control: RegionControlTable, region: RegionId, faction: FactionId): number {
  lookup('region', map.regions, region);
  return control[region]?.[faction] ?? 0;
}

/** The pack's thresholds, ascending: retreat (50) and supply (250) to start (0019). */
export function controlThresholds(map: WorldIndex): readonly number[] {
  const { retreatControlPermille, supplyControlPermille } = map.world.rules;
  return [...new Set([retreatControlPermille, supplyControlPermille])].sort((a, b) => a - b);
}

/**
 * Control at a scenario start, copied once into State at setup (0050). Every
 * problem is reported together: unknown regions or factions, control on open
 * water or off the map, shares that are not whole permille, a total over 1000,
 * a region listed twice.
 */
export function initialControl(map: WorldIndex, start: ScenarioStart): RegionControlTable {
  const factions = new Set(map.world.factions.map((f) => f.id));
  const problems: string[] = [];
  const out: Record<RegionId, ControlShares> = {};
  for (const row of [...start.control].sort((a, b) => strictCompare(a.region, b.region))) {
    const region = map.regions.get(row.region);
    if (!region) {
      problems.push(`region ${row.region} is not in the World`);
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(out, row.region)) problems.push(`region ${row.region} is listed twice`);
    if (region.kind !== 'land' && region.kind !== 'key_point') problems.push(`region ${row.region} is ${region.kind}, which carries no control`);
    const shares: Record<FactionId, number> = {};
    let total = 0;
    for (const s of [...row.shares].sort((a, b) => strictCompare(a.faction, b.faction))) {
      if (!factions.has(s.faction)) problems.push(`region ${row.region}: faction ${s.faction} is not in the World`);
      if (!Number.isSafeInteger(s.permille) || s.permille < 0 || s.permille > 1000) problems.push(`region ${row.region}: ${s.faction}'s share must be a whole permille, got ${s.permille}`);
      if (Object.prototype.hasOwnProperty.call(shares, s.faction)) problems.push(`region ${row.region}: ${s.faction} is listed twice`);
      total += s.permille;
      if (s.permille > 0) shares[s.faction] = s.permille;
    }
    if (total > 1000) problems.push(`region ${row.region}: shares sum to ${total}, more than 1000`);
    if (Object.keys(shares).length > 0) out[row.region] = shares;
  }
  if (problems.length > 0) throw new ControlError(problems);
  return out;
}

/**
 * Apply proposed deltas in order, the only way control changes in play.
 * Returns the new State, every change, and every threshold any faction's
 * share crossed (counting the shares taken from others). A delta that changes
 * nothing is not a change; if none changes anything, the same State returns.
 */
export function applyControl(
  map: WorldIndex,
  state: State,
  deltas: readonly ControlDelta[],
): { readonly state: State; readonly changes: readonly ControlChange[]; readonly crossings: readonly ThresholdCrossing[] } {
  if (deltas.length === 0) return { state, changes: [], crossings: [] };
  const factions = new Set(map.world.factions.map((f) => f.id));
  const thresholds = controlThresholds(map);
  const next: Record<RegionId, ControlShares> = { ...state.regionControl };
  const changes: ControlChange[] = [];
  const crossings: ThresholdCrossing[] = [];
  const crossed = (region: RegionId, faction: FactionId, before: number, after: number, cause: ControlCause) => {
    for (const t of thresholds) {
      if (before < t && after >= t) crossings.push({ region, faction, threshold: t, direction: 'up', cause });
      if (before >= t && after < t) crossings.push({ region, faction, threshold: t, direction: 'down', cause });
    }
  };
  for (const d of deltas) {
    if (!carriesControl(map, d.region)) throw new ControlError([`region ${d.region} carries no control`]);
    if (!factions.has(d.faction)) throw new ControlError([`faction ${d.faction} is not in the World`]);
    if (!Number.isSafeInteger(d.deltaPermille)) throw new ControlError([`delta for ${d.faction} in ${d.region} must be a whole permille, got ${d.deltaPermille}`]);
    const shares: Record<FactionId, number> = { ...(next[d.region] ?? {}) };
    const before = shares[d.faction] ?? 0;
    const after = Math.max(0, Math.min(1000, before + d.deltaPermille));
    // A delta that changes nothing (clamped, or a loss from a zero share) is no change and no firing.
    if (after === before) continue;
    shares[d.faction] = after;
    const takenFrom: { faction: FactionId; permille: number }[] = [];
    let excess = Object.values(shares).reduce((s, v) => s + v, 0) - 1000;
    if (excess > 0) {
      const others = (Object.keys(shares) as FactionId[]).filter((f) => f !== d.faction).sort((a, b) => shares[b]! - shares[a]! || strictCompare(a, b));
      for (const f of others) {
        if (excess <= 0) break;
        const take = Math.min(excess, shares[f]!);
        const was = shares[f]!;
        shares[f] = was - take;
        excess -= take;
        takenFrom.push({ faction: f, permille: take });
        crossed(d.region, f, was, shares[f]!, d.cause);
      }
    }
    for (const f of Object.keys(shares) as FactionId[]) if (shares[f] === 0) delete shares[f];
    if (Object.keys(shares).length > 0) next[d.region] = sortedShares(shares);
    else delete next[d.region];
    changes.push({ region: d.region, faction: d.faction, before, after, cause: d.cause, takenFrom });
    crossed(d.region, d.faction, before, after, d.cause);
  }
  if (changes.length === 0) return { state, changes, crossings };
  return { state: { ...state, regionControl: sortedTable(next) }, changes, crossings };
}

function sortedShares(shares: Readonly<Record<FactionId, number>>): ControlShares {
  const out: Record<FactionId, number> = {};
  for (const f of (Object.keys(shares) as FactionId[]).sort(strictCompare)) out[f] = shares[f]!;
  return out;
}

function sortedTable(table: Readonly<Record<RegionId, ControlShares>>): RegionControlTable {
  const out: Record<RegionId, ControlShares> = {};
  for (const r of (Object.keys(table) as RegionId[]).sort(strictCompare)) out[r] = table[r]!;
  return out;
}
