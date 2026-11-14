/**
 * Setting-free World builders for the control, supply and invariant tests
 * (decision 0003: no setting names under packages/). Only the fields the map
 * code reads are meaningful; the rest are empty.
 */
import { strictCompare } from '../../src/compare.ts';
import { toId, type DepotId, type EdgeId, type FactionId, type InstallationId, type RailLineId, type RegionId } from '../../src/ids.ts';
import type { ControlShares, RegionControlTable } from '../../src/control/control.ts';
import type { DepotRecord, EdgeRecord, EdgeType, InstallationRecord, RegionKind, RegionRecord, SeasonWindow } from '../../src/world/graph.ts';
import { indexWorld, type WorldIndex } from '../../src/world/index.ts';
import type { ScenarioStart } from '../../src/world/scenario.ts';
import type { SeasonEffect, World } from '../../src/world/world.ts';

export const R = (id: string): RegionId => toId('region', id);
export const F = (id: string): FactionId => toId('faction', id);
export const E = (id: string): EdgeId => toId('edge', id);
export const D = (id: string): DepotId => toId('depot', id);
export const I = (id: string): InstallationId => toId('installation', id);
export const L = (id: string): RailLineId => toId('railLine', id);

export const SEASONS: readonly SeasonEffect[] = [
  { reason: 'mud', defaultMonths: [1, 2, 3, 12], lengthPermille: 1500, capacityPermille: 600 },
  { reason: 'low_water', defaultMonths: [8, 9, 10], lengthPermille: 1300, capacityPermille: 500 },
  { reason: 'flood', defaultMonths: [4, 5], lengthPermille: 1200, capacityPermille: 800 },
  { reason: 'ice', defaultMonths: [1, 2], lengthPermille: 2000, capacityPermille: 300 },
];

export function region(id: string, kind: RegionKind = 'land'): RegionRecord {
  return {
    id: R(id),
    name: `region.${id}.name`,
    kind,
    terrain: kind === 'off_map' ? null : kind === 'river' || kind === 'sea' ? 'water' : 'plain',
    flags: [],
    offMapRole: kind === 'off_map' ? 'foreign_power' : null,
    weatherZone: null,
    refPoint: null,
    counties: [],
    labelHints: null,
    provenance: [],
  };
}

export interface EdgeOptions {
  readonly type?: EdgeType;
  readonly days?: number;
  readonly daysBA?: number | null;
  readonly capacity?: number;
  readonly line?: string | null;
  readonly breakOfBulk?: boolean;
  readonly seasons?: readonly SeasonWindow[];
}

/** An edge between two regions, ends put in code-unit order; id `type:a:b` (or `type:a:b:line`). */
export function edge(x: string, y: string, o: EdgeOptions = {}): EdgeRecord {
  const [a, b] = [x, y].sort(strictCompare) as [string, string];
  const type = o.type ?? 'road';
  const line = o.line ?? (type === 'rail' ? 'line_1' : null);
  return {
    id: E(line === null ? `${type}:${a}:${b}` : `${type}:${a}:${b}:${line}`),
    type,
    a: R(a),
    b: R(b),
    lengthDays: o.days ?? 1,
    lengthDaysBA: o.daysBA ?? null,
    capacity: o.capacity ?? 3,
    line: line === null ? null : L(line),
    breakOfBulk: o.breakOfBulk ?? false,
    depthFeet: null,
    seasons: o.seasons ?? [],
    provenance: [],
  };
}

export function depot(id: string, at: string, kind: 'source' | 'depot' = 'source', capacity = 5): DepotRecord {
  return { id: D(id), region: R(at), kind, name: `depot.${id}.name`, capacity, provenance: [] };
}

export function fort(id: string, at: string, commands: readonly string[] = []): InstallationRecord {
  return { id: I(id), region: R(at), kind: 'fort', name: `installation.${id}.name`, fort: { water: 'reduction', commandsEdges: commands.map(E) }, provenance: [] };
}

export interface WorldParts {
  readonly regions: readonly RegionRecord[];
  readonly edges: readonly EdgeRecord[];
  readonly depots?: readonly DepotRecord[];
  readonly installations?: readonly InstallationRecord[];
  readonly factions?: readonly string[];
  /** Department ids, each on the faction its prefix names (`a_gov` is a's), or none for a `neutral_` id. */
  readonly departments?: readonly string[];
  readonly supplyControlPermille?: number;
  readonly retreatControlPermille?: number;
}

export function mapWorld(parts: WorldParts): World {
  const lines = [...new Set(parts.edges.flatMap((e) => (e.line === null ? [] : [e.line])))].sort(strictCompare);
  return {
    formatVersion: 2,
    pack: 'fixture',
    rules: {
      capacityMax: 5,
      supplyControlPermille: parts.supplyControlPermille ?? 250,
      retreatControlPermille: parts.retreatControlPermille ?? 50,
      seasons: SEASONS,
    },
    vocabularies: { terrains: [], postKinds: [], departmentKinds: [], arms: [], personKinds: [], traits: [], ranks: [], blocs: [], standingOrderKinds: [] },
    factions: (parts.factions ?? ['a', 'b']).map((f) => ({ id: F(f), name: `faction.${f}.name` })),
    departments: (parts.departments ?? []).map((d) => ({ id: toId('department', d), faction: d.startsWith('neutral_') ? null : F(d.split('_')[0]!), kind: 'government', name: `department.${d}.name`, provenance: [] })),
    regions: parts.regions,
    installations: parts.installations ?? [],
    edges: parts.edges,
    railLines: lines.map((l) => ({ id: l, name: `rail.${l}.name`, provenance: [] })),
    depots: parts.depots ?? [],
    weatherZones: [],
    people: [],
  };
}

export function mapIndex(parts: WorldParts): WorldIndex {
  return indexWorld(mapWorld(parts));
}

/** A control table from `{ region: { faction: permille } }`, in canonical order. */
export function controlTable(spec: Readonly<Record<string, Readonly<Record<string, number>>>>): RegionControlTable {
  const out: Record<RegionId, ControlShares> = {};
  for (const r of Object.keys(spec).sort(strictCompare)) {
    const shares: Record<FactionId, number> = {};
    for (const f of Object.keys(spec[r]!).sort(strictCompare)) if (spec[r]![f]! > 0) shares[F(f)] = spec[r]![f]!;
    out[R(r)] = shares;
  }
  return out;
}

/** A scenario start carrying only control and, optionally, governments (the rest empty), for setup tests. */
export function startWith(
  control: Readonly<Record<string, Readonly<Record<string, number>>>>,
  startDate = '1900-03-01',
  governments: Readonly<Record<string, string>> = {},
): ScenarioStart {
  return {
    id: toId('scenario', 'fixture_start'),
    name: 'scenario.fixture_start.name',
    startDate,
    seed: 1,
    factions: [],
    control: Object.keys(control).map((r) => ({ region: R(r), shares: Object.keys(control[r]!).map((f) => ({ faction: F(f), permille: control[r]![f]! })) })),
    fortification: [],
    edgeConditions: [],
    obstructions: [],
    depotConditions: [],
    posts: [],
    forceBlocks: [],
    governments: Object.keys(governments).map((r) => ({ region: R(r), department: governments[r] === 'unknown' ? 'unknown' : toId('department', governments[r]!), provenance: [{ source: 'FIXTURE', at: null }] })),
  };
}

/**
 * The line: a1 - a2 - mid - b2 - b1, a road chain, with a river region `w`
 * off a2 and b2 (open water), a source at each end, and a forward depot at a2.
 *
 *   a1 -- a2 -- mid -- b2 -- b1
 *          \          /
 *           +-- w ---+   (river edges)
 */
export function lineMap(departments: readonly string[] = []): WorldIndex {
  return mapIndex({
    departments,
    regions: ['a1', 'a2', 'mid', 'b2', 'b1'].map((r) => region(r)).concat([region('w', 'river')]),
    edges: [
      edge('a1', 'a2', { type: 'rail', days: 1, capacity: 4, line: 'a_line' }),
      edge('a2', 'mid', { days: 2, capacity: 3 }),
      edge('mid', 'b2', { days: 2, capacity: 3 }),
      edge('b2', 'b1', { type: 'rail', days: 1, capacity: 4, line: 'b_line' }),
      edge('a2', 'w', { type: 'river', days: 1, capacity: 2 }),
      edge('b2', 'w', { type: 'river', days: 1, capacity: 2 }),
    ],
    depots: [depot('a_src', 'a1'), depot('b_src', 'b1'), depot('a_fwd', 'a2', 'depot', 2)],
  });
}
