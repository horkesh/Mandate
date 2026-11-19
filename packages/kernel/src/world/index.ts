/**
 * World format v2 (lane 0.2): the kernel's types for pack World data and
 * scenario starts, and a pure index over the graph. Lanes 0.4 and 0.5 build
 * control, supply, forces and movement on these.
 */
import { strictCompare } from '../compare.ts';
import { IdError, lookup, type EdgeId, type RegionId } from '../ids.ts';
import { canonicalHash } from '../serialize/hash.ts';
import { otherEnd, type EdgeRecord, type RegionRecord } from './graph.ts';
import type { ScenarioStart } from './scenario.ts';
import type { World } from './world.ts';

export * from './calendar.ts';
export * from './graph.ts';
export * from './people.ts';
export * from './scenario.ts';
export * from './world.ts';

export interface WorldIndex {
  readonly world: World;
  readonly regions: ReadonlyMap<RegionId, RegionRecord>;
  readonly edges: ReadonlyMap<EdgeId, EdgeRecord>;
  /** Each region's edges in edge-id order (decision 0002: never insertion order). */
  readonly edgesAt: ReadonlyMap<RegionId, readonly EdgeRecord[]>;
}

/**
 * Index a validated World. Throws on an edge whose end is not a region, so a
 * World that skipped validation fails here rather than deep in a tick.
 */
export function indexWorld(world: World): WorldIndex {
  const regions = new Map<RegionId, RegionRecord>(world.regions.map((r) => [r.id, r]));
  const edges = new Map<EdgeId, EdgeRecord>(world.edges.map((e) => [e.id, e]));
  const at = new Map<RegionId, EdgeRecord[]>(world.regions.map((r) => [r.id, []]));
  const sorted = [...world.edges].sort((x, y) => strictCompare(x.id, y.id));
  for (const e of sorted) {
    for (const end of [e.a, e.b]) {
      const list = at.get(end);
      if (!list) throw new IdError('region', end, 'unknown');
      list.push(e);
    }
  }
  return { world, regions, edges, edgesAt: at };
}

/** A region's edges, in edge-id order. Throws on an unknown region. */
export function edgesOf(index: WorldIndex, region: RegionId): readonly EdgeRecord[] {
  return lookup('region', index.edgesAt, region);
}

/** Days to cross an edge in a direction, before season and condition. */
export function edgeDays(edge: EdgeRecord, from: RegionId): number {
  return otherEnd(edge, from) === edge.b ? edge.lengthDays : (edge.lengthDaysBA ?? edge.lengthDays);
}

/** The World's hash, which a save records instead of the World itself (FOUNDATION section 10). */
export function worldHash(world: World): string {
  return canonicalHash(world);
}

/** A scenario start's hash, recorded beside the world hash. */
export function scenarioHash(start: ScenarioStart): string {
  return canonicalHash(start);
}
