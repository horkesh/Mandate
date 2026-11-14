/**
 * Typed IDs (FOUNDATION section 11.3; AWWV lesson M10).
 *
 * One branded string type per kind of thing, so a region id can never be
 * passed where a person id is expected. Ids are minted once, from the pack or
 * at creation, and never re-derived. A lookup with an unknown id throws: it
 * never defaults to zero, empty or undefined.
 *
 * New code uses these. The M2 kernel's plain-string aliases (`RegionId` in
 * `state.ts` and friends) stay until their modules are replaced, which is why
 * the package index re-exports this module as the `ids` namespace.
 */
import { strictCompare } from './compare.ts';

/**
 * Every kind of id the kernel knows. Add a kind here (and a type alias below)
 * when a module needs one; never reuse a kind for a different thing.
 */
export const ID_KINDS = [
  'bloc',
  'department',
  'depot',
  'edge',
  'faction',
  'forceBlock',
  'installation',
  'person',
  'post',
  'railLine',
  'region',
  'scenario',
  'seat',
  'situation',
  'weatherZone',
] as const;

export type IdKind = (typeof ID_KINDS)[number];

declare const idKind: unique symbol;

/** A string that is known to be an id of kind `K`. */
export type Id<K extends IdKind> = string & { readonly [idKind]: K };

export type BlocId = Id<'bloc'>;
export type DepartmentId = Id<'department'>;
export type DepotId = Id<'depot'>;
export type EdgeId = Id<'edge'>;
export type FactionId = Id<'faction'>;
export type ForceBlockId = Id<'forceBlock'>;
export type InstallationId = Id<'installation'>;
export type PersonId = Id<'person'>;
export type PostId = Id<'post'>;
export type RailLineId = Id<'railLine'>;
export type RegionId = Id<'region'>;
export type ScenarioId = Id<'scenario'>;
export type SeatId = Id<'seat'>;
export type SituationId = Id<'situation'>;
export type WeatherZoneId = Id<'weatherZone'>;

/**
 * The id grammar: starts with a letter or digit, then letters, digits and
 * `_ . : / -`. No whitespace, so ids survive logs, command lines and file names.
 */
export const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:/-]*$/;

export const ID_MAX_LENGTH = 128;

/** Thrown when an id is malformed, or when a lookup finds no entry for it. */
export class IdError extends Error {
  constructor(
    readonly kind: IdKind,
    readonly id: string,
    readonly problem: 'malformed' | 'unknown',
  ) {
    super(problem === 'unknown' ? `unknown ${kind} id "${id}"` : `malformed ${kind} id "${id}"`);
    this.name = 'IdError';
  }
}

export function isIdKind(value: string): value is IdKind {
  return (ID_KINDS as readonly string[]).includes(value);
}

/** Whether `raw` is a well-formed id (of any kind). */
export function isWellFormedId(raw: string): boolean {
  return raw.length <= ID_MAX_LENGTH && ID_PATTERN.test(raw);
}

/**
 * Brand a raw string as an id of `kind`, checking its form. Use this at the
 * edges (pack loading, command parsing); inside the kernel, ids arrive typed.
 */
export function toId<K extends IdKind>(kind: K, raw: string): Id<K> {
  if (!isWellFormedId(raw)) throw new IdError(kind, raw, 'malformed');
  return raw as Id<K>;
}

/** A table of entries keyed by ids of one kind. */
export type IdRecord<K extends IdKind, V> = Readonly<Partial<Record<Id<K>, V>>>;

/**
 * Look up `id` in a record or map of `kind`. Throws `IdError` if absent; never
 * returns a default. Inherited properties (such as `toString`) are not entries.
 */
export function lookup<K extends IdKind, V>(
  kind: K,
  table: IdRecord<K, V> | ReadonlyMap<Id<K>, V>,
  id: Id<K>,
): V {
  if (isMap(table)) {
    if (!table.has(id)) throw new IdError(kind, id, 'unknown');
    return table.get(id) as V;
  }
  if (!Object.prototype.hasOwnProperty.call(table, id)) throw new IdError(kind, id, 'unknown');
  return table[id] as V;
}

/** Whether `id` has an entry in the table. The non-throwing check, for validation code. */
export function hasId<K extends IdKind, V>(table: IdRecord<K, V> | ReadonlyMap<Id<K>, V>, id: Id<K>): boolean {
  return isMap(table) ? table.has(id) : Object.prototype.hasOwnProperty.call(table, id);
}

/** The ids of a table in strict code-unit order (decision 0002), never insertion order. */
export function idsOf<K extends IdKind, V>(table: IdRecord<K, V> | ReadonlyMap<Id<K>, V>): Id<K>[] {
  const keys = isMap(table) ? [...table.keys()] : (Object.keys(table) as Id<K>[]);
  return keys.sort(strictCompare);
}

/** Compare two ids of the same kind: the explicit tie-break every comparator ends with. */
export function compareIds<K extends IdKind>(a: Id<K>, b: Id<K>): -1 | 0 | 1 {
  return strictCompare(a, b);
}

function isMap<K, V>(table: unknown): table is ReadonlyMap<K, V> {
  return table instanceof Map;
}
