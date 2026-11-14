/**
 * The invariant barrier for control and the derived map (FOUNDATION section
 * 10, day-tick phase 10): assertions run after every tick, each failure typed
 * so a test or a run report says exactly what broke and where. A failure is a
 * bug report against the step that broke it; nothing here repairs State
 * (AWWV lesson M3).
 */
import { strictCompare } from '../compare.ts';
import type { EdgeId, FactionId, RegionId } from '../ids.ts';
import type { WorldIndex } from '../world/index.ts';
import { otherEnd } from '../world/index.ts';
import type { RegionControlTable } from '../control/control.ts';
import { buildControlIndex } from '../control-index/control-index.ts';
import type { DerivedMap } from '../control-index/derived.ts';
import { deriveSupply, INTACT_NETWORK, type NetworkConditions } from '../supply/supply.ts';
import { canonicalJson } from '../serialize/canonical.ts';

export type MapInvariantKind =
  | 'control_unknown_region'
  | 'control_unknown_faction'
  | 'control_not_carried'
  | 'control_bad_share'
  | 'control_zero_share'
  | 'control_over_1000'
  | 'control_unsorted'
  | 'derived_stale'
  | 'front_not_mirrored'
  | 'component_overlap'
  | 'path_broken'
  | 'path_sum'
  | 'pocket_supplied';

export interface MapInvariantFailure {
  readonly kind: MapInvariantKind;
  readonly region: RegionId | null;
  readonly faction: FactionId | null;
  readonly edge: EdgeId | null;
  readonly detail: string;
}

export class InvariantError extends Error {
  constructor(readonly day: number, readonly failures: readonly MapInvariantFailure[]) {
    super(`invariants failed after day ${day}:\n- ${failures.map((f) => `${f.kind}${f.region ? ` ${f.region}` : ''}${f.faction ? ` ${f.faction}` : ''}${f.edge ? ` ${f.edge}` : ''}: ${f.detail}`).join('\n- ')}`);
    this.name = 'InvariantError';
  }
}

const fail = (kind: MapInvariantKind, detail: string, at: { region?: RegionId; faction?: FactionId; edge?: EdgeId } = {}): MapInvariantFailure => ({
  kind,
  region: at.region ?? null,
  faction: at.faction ?? null,
  edge: at.edge ?? null,
  detail,
});

/** Control in State: known regions and factions, whole permille, no zero shares, at most 1000, in id order. */
export function controlInvariants(map: WorldIndex, control: RegionControlTable): MapInvariantFailure[] {
  const out: MapInvariantFailure[] = [];
  const factions = new Set(map.world.factions.map((f) => f.id));
  const regions = Object.keys(control) as RegionId[];
  if (regions.join() !== [...regions].sort(strictCompare).join()) out.push(fail('control_unsorted', 'regions are not in id order'));
  for (const region of regions) {
    const record = map.regions.get(region);
    if (!record) {
      out.push(fail('control_unknown_region', 'not in the World', { region }));
      continue;
    }
    if (record.kind !== 'land' && record.kind !== 'key_point') out.push(fail('control_not_carried', `${record.kind} carries no control`, { region }));
    const shares = control[region]!;
    const names = Object.keys(shares) as FactionId[];
    if (names.join() !== [...names].sort(strictCompare).join()) out.push(fail('control_unsorted', 'factions are not in id order', { region }));
    let total = 0;
    for (const faction of names) {
      const v = shares[faction]!;
      if (!factions.has(faction)) out.push(fail('control_unknown_faction', 'not in the World', { region, faction }));
      if (!Number.isSafeInteger(v) || v < 0 || v > 1000) out.push(fail('control_bad_share', `share ${v} is not a whole permille`, { region, faction }));
      if (v === 0) out.push(fail('control_zero_share', 'zero shares are omitted', { region, faction }));
      total += v;
    }
    if (total > 1000) out.push(fail('control_over_1000', `shares sum to ${total}`, { region }));
  }
  return out;
}

/**
 * The derived map against a fresh derivation and its own structure:
 * - rebuilding from scratch gives the same index and supply (AWWV lesson M1: rebuilding derived data changes nothing);
 * - every contact edge is a front segment for both sides, facing each other;
 * - a faction's components do not overlap;
 * - every supply path starts at one of the faction's origins, runs edge to edge
 *   to its region, and its days and capacity are the sum and minimum of its legs;
 * - no pocket region has a supply path.
 */
export function derivedInvariants(map: WorldIndex, control: RegionControlTable, month: number, network: NetworkConditions | undefined, derived: DerivedMap): MapInvariantFailure[] {
  const out: MapInvariantFailure[] = [];
  const freshIndex = buildControlIndex(map, control);
  const freshSupply = deriveSupply(map, freshIndex, month, network ?? INTACT_NETWORK);
  if (snapshot(freshIndex) !== snapshot(derived.index) || snapshot(freshSupply) !== snapshot(derived.supply)) {
    out.push(fail('derived_stale', 'the cached derived map differs from a fresh derivation'));
  }
  const { index, supply } = derived;
  for (const c of index.contactEdges) {
    const fromA = index.fronts.get(c.holderA)!.some((l) => l.segments.some((s) => s.edge === c.edge && s.own === c.a && s.faces === c.b && s.enemy === c.holderB));
    const fromB = index.fronts.get(c.holderB)!.some((l) => l.segments.some((s) => s.edge === c.edge && s.own === c.b && s.faces === c.a && s.enemy === c.holderA));
    if (!fromA || !fromB) out.push(fail('front_not_mirrored', 'a contact edge is not a front segment for both sides', { edge: c.edge }));
  }
  for (const [faction, comps] of index.components) {
    const seen = new Set<RegionId>();
    for (const c of comps) {
      for (const r of c.regions) {
        if (seen.has(r)) out.push(fail('component_overlap', `in two components`, { region: r, faction }));
        seen.add(r);
      }
    }
  }
  for (const [faction, fs] of supply.factions) {
    const origins = new Map(fs.origins.map((o) => [o.depot, o]));
    for (const [region, path] of fs.paths) {
      const origin = origins.get(path.origin);
      if (!origin) {
        out.push(fail('path_broken', `origin ${path.origin} is not one of the faction's origins`, { region, faction }));
        continue;
      }
      let at = origin.region;
      let days = 0;
      let capacity = origin.capacityMilli;
      for (const leg of path.legs) {
        const edge = map.edges.get(leg.edge);
        if (!edge || leg.from !== at || otherEnd(edge, at) !== leg.to) {
          out.push(fail('path_broken', `leg ${leg.edge} does not continue from ${at}`, { region, faction, edge: leg.edge }));
          break;
        }
        at = leg.to;
        days += leg.daysPermille;
        capacity = Math.min(capacity, leg.capacityMilli);
      }
      if (at !== region) out.push(fail('path_broken', `the path ends at ${at}`, { region, faction }));
      if (days !== path.daysPermille || capacity !== path.capacityMilli) out.push(fail('path_sum', `days ${path.daysPermille} and capacity ${path.capacityMilli} are not the legs' ${days} and ${capacity}`, { region, faction }));
    }
    for (const pocket of fs.pockets) {
      for (const r of pocket.regions) if (fs.paths.has(r)) out.push(fail('pocket_supplied', `in ${pocket.id} but has a path`, { region: r, faction }));
    }
  }
  return out;
}

/** A canonical text of a derived structure (Maps as sorted entries), for comparing two derivations. */
export function snapshot(value: unknown): string {
  return canonicalJson(plain(value));
}

function plain(value: unknown): unknown {
  if (value instanceof Map) {
    return [...value.entries()].sort(([a], [b]) => strictCompare(String(a), String(b))).map(([k, v]) => [String(k), plain(v)]);
  }
  if (Array.isArray(value)) return value.map(plain);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = plain(v);
    return out;
  }
  return value;
}
