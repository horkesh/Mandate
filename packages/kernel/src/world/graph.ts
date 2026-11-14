/**
 * World format v2, the map (FOUNDATION section 4; decisions 0019, 0029, 0031,
 * 0043). Regions over a typed graph of authored edges, with installations,
 * rail lines, depots and weather zones.
 *
 * Everything here is World: static pack data, immutable, hashed, never saved
 * (FOUNDATION section 10). What changes during play (control, edge condition,
 * obstructions, fortification, depot condition, weather) starts from a
 * scenario (`scenario.ts`) and lives in State with one writer each.
 *
 * Every number is an integer (decision 0002; canonical JSON rejects floats):
 * coordinates are microdegrees, rates are permille, lengths are whole days.
 * Every record carries provenance: one or more citations of a source in the
 * pack's PROVENANCE.json, whose licence must be on the allow-list (0031, 0033).
 *
 * These types are the kernel's side of the format. The pack-format package's
 * Zod schemas produce exactly these types (a type-level test holds them
 * together), so the kernel never imports a schema library.
 */
import type { DepotId, EdgeId, InstallationId, RailLineId, RegionId, WeatherZoneId } from '../ids.ts';

/** A key into the pack's string tables (decision 0030). World records hold keys, never player text. */
export type StringKey = string;

/** A key into the pack's PROVENANCE.json. Not an id: source keys may contain spaces ("OR I-1"). */
export type SourceKey = string;

/** One citation: a source and where in it (page, table, line); `at` is null when the whole source is meant. */
export interface Citation {
  readonly source: SourceKey;
  readonly at: string | null;
}

/** At least one citation, checked by the validator; pointer sources (research notes) never count alone. */
export type Provenance = readonly Citation[];

/** A point in integer microdegrees (longitude, latitude times 1,000,000). */
export interface GeoPoint {
  readonly lonE6: number;
  readonly latE6: number;
}

export const REGION_KINDS = ['land', 'key_point', 'river', 'sea', 'off_map'] as const;
export type RegionKind = (typeof REGION_KINDS)[number];

/** Attributes of a region that no post holds. Things a post can hold are installations. */
export const REGION_FLAGS = ['capital', 'port', 'rail_junction', 'river_junction'] as const;
export type RegionFlag = (typeof REGION_FLAGS)[number];

/** What an off-map box stands for (0031: foreign powers, runners' ports, raider zones, distant theatres). */
export const OFF_MAP_ROLES = ['foreign_power', 'blockade_port', 'raider_zone', 'distant_theatre'] as const;
export type OffMapRole = (typeof OFF_MAP_ROLES)[number];

export const LABEL_SIZE_CLASSES = ['xs', 's', 'm', 'l', 'xl'] as const;
export type LabelSizeClass = (typeof LABEL_SIZE_CLASSES)[number];

/**
 * Optional label hints (0043): the map draws a region's name automatically and
 * uses these only where automatic placement fails. `minZoomPermille` is the
 * zoom (1000 = the fitted overview) below which the name is hidden.
 */
export interface LabelHints {
  readonly anchor: GeoPoint | null;
  readonly spine: readonly GeoPoint[];
  readonly sizeClass: LabelSizeClass | null;
  readonly minZoomPermille: number | null;
}

export interface RegionRecord {
  readonly id: RegionId;
  readonly name: StringKey;
  readonly kind: RegionKind;
  /** A terrain from the pack's vocabulary; null only for off-map boxes. Water kinds take a water terrain. */
  readonly terrain: string | null;
  readonly flags: readonly RegionFlag[];
  /** Set for off-map boxes, null for every other kind. */
  readonly offMapRole: OffMapRole | null;
  /** Reserved for weather (0029); null until the pack defines zones. */
  readonly weatherZone: WeatherZoneId | null;
  /** The point lengths were measured from, if the pack has one. */
  readonly refPoint: GeoPoint | null;
  /** Source-geometry units (county names) dissolved into this region; geometry itself is never World data. */
  readonly counties: readonly string[];
  readonly labelHints: LabelHints | null;
  readonly provenance: Provenance;
}

/** Things inside a region that a post can hold, under any department's command. */
export const INSTALLATION_KINDS = ['fort', 'naval_base', 'navy_yard', 'arsenal'] as const;
export type InstallationKind = (typeof INSTALLATION_KINDS)[number];

/** A fort on water: ships can run past it (`passage`) or it must be taken (`reduction`). */
export const FORT_WATER_MODES = ['passage', 'reduction'] as const;
export type FortWaterMode = (typeof FORT_WATER_MODES)[number];

export interface FortFacts {
  /** Null for a fort that commands no water. */
  readonly water: FortWaterMode | null;
  /** The water edges its guns command; each must touch the fort's region. */
  readonly commandsEdges: readonly EdgeId[];
}

export interface InstallationRecord {
  readonly id: InstallationId;
  readonly region: RegionId;
  readonly kind: InstallationKind;
  readonly name: StringKey;
  /** Set when kind is `fort`, null otherwise. */
  readonly fort: FortFacts | null;
  readonly provenance: Provenance;
}

export const EDGE_TYPES = ['road', 'rail', 'river', 'sea'] as const;
export type EdgeType = (typeof EDGE_TYPES)[number];

/** Why an edge changes with the season (0029). The pack sets each reason's effect and default months. */
export const SEASON_REASONS = ['mud', 'low_water', 'flood', 'ice'] as const;
export type SeasonReason = (typeof SEASON_REASONS)[number];

export interface SeasonWindow {
  readonly reason: SeasonReason;
  /** Months 1-12, ascending; the pack's default months for the reason when the source gave none. */
  readonly months: readonly number[];
  /** Water edges only: the depth in those months, when known. */
  readonly depthFeet: number | null;
}

export interface EdgeRecord {
  /** `type:a:b`, or `type:a:b:line` for a rail edge, unless the source names it. */
  readonly id: EdgeId;
  readonly type: EdgeType;
  /** The two ends, a before b in code-unit order. Edges are undirected unless `lengthDaysBA` differs. */
  readonly a: RegionId;
  readonly b: RegionId;
  /** Days for a division from a to b. */
  readonly lengthDays: number;
  /** Days from b to a when different (downstream against upstream); null means the same. */
  readonly lengthDaysBA: number | null;
  /** On the pack's capacity scale, 1 to `rules.capacityMax`. */
  readonly capacity: number;
  /** Rail edges belong to a named line (whose president can later hold a post); null for the rest. */
  readonly line: RailLineId | null;
  /** Goods must be unloaded and reloaded here: a break of gauge, a ferry, a horse-car link. */
  readonly breakOfBulk: boolean;
  /** Water edges only: depth at ordinary water, when known. */
  readonly depthFeet: number | null;
  readonly seasons: readonly SeasonWindow[];
  readonly provenance: Provenance;
}

export interface RailLineRecord {
  readonly id: RailLineId;
  readonly name: StringKey;
  readonly provenance: Provenance;
}

export const DEPOT_KINDS = ['source', 'depot'] as const;
export type DepotKind = (typeof DEPOT_KINDS)[number];

/** A supply source (a hub, a port, a foundry town) or a forward depot, on a region (FOUNDATION section 4). */
export interface DepotRecord {
  readonly id: DepotId;
  readonly region: RegionId;
  readonly kind: DepotKind;
  readonly name: StringKey;
  /** Throughput on the pack's capacity scale. */
  readonly capacity: number;
  readonly provenance: Provenance;
}

/** Reserved for weather (0029): regions that share one day's weather draw. */
export interface WeatherZoneRecord {
  readonly id: WeatherZoneId;
  readonly name: StringKey;
}
