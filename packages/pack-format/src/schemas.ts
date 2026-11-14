/**
 * World format v2 as Zod 4 schemas (decision 0035): the shape of every pack
 * file, with errors a modder can read. Shape only: references between records,
 * licences, graph rules and string tables are checked in `validate.ts`, which
 * reports them with the same `Issue` type.
 *
 * The parsed output of `WorldSchema` and `ScenarioSchema` is exactly the
 * kernel's `World` and `ScenarioStart` (checked at the bottom of this file at
 * compile time), so the kernel's types and the published schemas cannot drift.
 */
import { ids, world as w } from '@mandate/kernel';
import { z } from 'zod';

type IdKind = ids.IdKind;

/** A well-formed id of one kind, branded as the kernel's typed id (FOUNDATION 11.3). */
export function idOf<K extends IdKind>(kind: K) {
  return z
    .string()
    .max(ids.ID_MAX_LENGTH, `a ${kind} id of at most ${ids.ID_MAX_LENGTH} characters`)
    .regex(ids.ID_PATTERN, `a ${kind} id: a letter or digit, then letters, digits and _ . : / - (no spaces)`)
    .transform((s) => s as ids.Id<K>);
}

/** An id from a pack vocabulary (terrain, post kind, arm...): same grammar, no brand. */
export const termId = z.string().max(ids.ID_MAX_LENGTH).regex(ids.ID_PATTERN, 'a vocabulary id: a letter or digit, then letters, digits and _ . : / -');

/** A string-table key: lowercase dotted segments (`region.capital_north.name`). */
export const STRING_KEY_PATTERN = /^[a-z0-9_]+(?:\.[a-z0-9_:-]+)*$/;
export const stringKey = z.string().regex(STRING_KEY_PATTERN, 'a string-table key: lowercase segments of a-z, 0-9 and _ joined by dots');

const int = z.int('a whole number');
const nonNegative = int.min(0, 'zero or more');
const positive = int.min(1, 'one or more');
const permille = int.min(0, 'a permille from 0').max(1000, 'a permille up to 1000');
const month = int.min(1, 'a month from 1').max(12, 'a month up to 12');

function isCalendarDate(y: number, m: number, d: number): boolean {
  const days = [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return m >= 1 && m <= 12 && d >= 1 && d <= days[m - 1]!;
}

/** A full ISO date (YYYY-MM-DD) that exists on the calendar. */
export const isoDate = z.string().refine((s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m !== null && isCalendarDate(Number(m[1]), Number(m[2]), Number(m[3]));
}, 'a calendar date written YYYY-MM-DD');

/** A historical date: YYYY-MM-DD, or YYYY-MM or YYYY when the day or month is not in the source. */
export const historicalDate = z.string().refine((s) => {
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(s);
  if (!m) return false;
  if (m[2] === undefined) return true;
  return isCalendarDate(Number(m[1]), Number(m[2]), m[3] === undefined ? 1 : Number(m[3]));
}, 'a date written YYYY-MM-DD, YYYY-MM or YYYY');

const citation = z.strictObject({
  source: z.string().min(1, 'a source key from PROVENANCE.json'),
  at: z.string().min(1).nullable(),
});
const provenance = z.array(citation).min(1, 'at least one citation of a source in PROVENANCE.json (decisions 0031, 0033)');

const geoPoint = z.strictObject({
  lonE6: int.min(-180_000_000).max(180_000_000),
  latE6: int.min(-90_000_000).max(90_000_000),
});

const labelHints = z.strictObject({
  anchor: geoPoint.nullable(),
  spine: z.array(geoPoint),
  sizeClass: z.enum(w.LABEL_SIZE_CLASSES).nullable(),
  minZoomPermille: nonNegative.nullable(),
});

export const RegionSchema = z.strictObject({
  id: idOf('region'),
  name: stringKey,
  kind: z.enum(w.REGION_KINDS),
  terrain: termId.nullable(),
  flags: z.array(z.enum(w.REGION_FLAGS)),
  offMapRole: z.enum(w.OFF_MAP_ROLES).nullable(),
  weatherZone: idOf('weatherZone').nullable(),
  refPoint: geoPoint.nullable(),
  counties: z.array(z.string().min(1)),
  labelHints: labelHints.nullable(),
  provenance,
});

export const InstallationSchema = z.strictObject({
  id: idOf('installation'),
  region: idOf('region'),
  kind: z.enum(w.INSTALLATION_KINDS),
  name: stringKey,
  fort: z.strictObject({ water: z.enum(w.FORT_WATER_MODES).nullable(), commandsEdges: z.array(idOf('edge')) }).nullable(),
  provenance,
});

const seasonWindow = z.strictObject({
  reason: z.enum(w.SEASON_REASONS),
  months: z.array(month).min(1, 'at least one month'),
  depthFeet: nonNegative.nullable(),
});

export const EdgeSchema = z.strictObject({
  id: idOf('edge'),
  type: z.enum(w.EDGE_TYPES),
  a: idOf('region'),
  b: idOf('region'),
  lengthDays: positive,
  lengthDaysBA: positive.nullable(),
  capacity: positive,
  line: idOf('railLine').nullable(),
  breakOfBulk: z.boolean(),
  depthFeet: nonNegative.nullable(),
  seasons: z.array(seasonWindow),
  provenance,
});

export const RailLineSchema = z.strictObject({ id: idOf('railLine'), name: stringKey, provenance });

export const DepotSchema = z.strictObject({
  id: idOf('depot'),
  region: idOf('region'),
  kind: z.enum(w.DEPOT_KINDS),
  name: stringKey,
  capacity: positive,
  provenance,
});

export const WeatherZoneSchema = z.strictObject({ id: idOf('weatherZone'), name: stringKey });

const statCentre = z.strictObject({ direction: z.enum(w.STAT_DIRECTIONS).nullable(), cites: z.array(citation) });

export const PersonSchema = z.strictObject({
  id: idOf('person'),
  name: stringKey,
  invented: z.boolean(),
  faction: idOf('faction').nullable(),
  kind: termId,
  born: historicalDate.nullable(),
  died: historicalDate.nullable(),
  centres: z.strictObject({ competence: statCentre, nerve: statCentre, experience: statCentre, reputation: statCentre }),
  traits: z.array(z.strictObject({ trait: termId, cites: z.array(citation) })),
  bloc: termId.nullable(),
  ranks: z.array(z.strictObject({ rank: termId, from: historicalDate })),
  unknowns: z.array(z.string()),
  provenance,
});

const term = z.strictObject({ id: termId, name: stringKey });

export const RulesSchema = z.strictObject({
  capacityMax: positive,
  supplyControlPermille: permille,
  retreatControlPermille: permille,
  seasons: z.array(
    z.strictObject({
      reason: z.enum(w.SEASON_REASONS),
      defaultMonths: z.array(month).min(1),
      lengthPermille: positive,
      capacityPermille: nonNegative,
    }),
  ),
});

export const VocabulariesSchema = z.strictObject({
  terrains: z.array(z.strictObject({ id: termId, name: stringKey, roadLengthPermille: positive, water: z.boolean() })),
  postKinds: z.array(z.strictObject({ id: termId, name: stringKey, creatable: z.enum(w.POST_CREATION), temporary: z.boolean() })),
  departmentKinds: z.array(term),
  arms: z.array(z.strictObject({ id: termId, name: stringKey, naval: z.boolean() })),
  personKinds: z.array(term),
  traits: z.array(z.strictObject({ id: termId, name: stringKey, gate: z.boolean() })),
  ranks: z.array(z.strictObject({ id: termId, name: stringKey, seniority: nonNegative })),
  blocs: z.array(term),
  standingOrderKinds: z.array(term),
});

const faction = z.strictObject({ id: idOf('faction'), name: stringKey });

export const DepartmentSchema = z.strictObject({
  id: idOf('department'),
  /** Null for a neutral government (review F6). */
  faction: idOf('faction').nullable(),
  kind: termId,
  name: stringKey,
  provenance,
});

export const WorldSchema = z.strictObject({
  formatVersion: z.literal(w.WORLD_FORMAT_VERSION),
  pack: termId,
  rules: RulesSchema,
  vocabularies: VocabulariesSchema,
  factions: z.array(faction),
  departments: z.array(DepartmentSchema),
  regions: z.array(RegionSchema),
  installations: z.array(InstallationSchema),
  edges: z.array(EdgeSchema),
  railLines: z.array(RailLineSchema),
  depots: z.array(DepotSchema),
  weatherZones: z.array(WeatherZoneSchema),
  people: z.array(PersonSchema),
});

const standingOrder = z.strictObject({
  id: termId,
  kind: termId,
  from: idOf('post').nullable(),
  issuedOn: isoDate,
  summary: stringKey,
  cites: z.array(citation).min(1, 'at least one citation'),
});

export const PostSchema = z.strictObject({
  id: idOf('post'),
  name: stringKey,
  kind: termId,
  department: idOf('department'),
  parent: idOf('post').nullable(),
  holder: idOf('person').nullable(),
  acting: z.boolean(),
  region: idOf('region').nullable(),
  temporary: z.strictObject({ operation: termId }).nullable(),
  installation: idOf('installation').nullable(),
  railLine: idOf('railLine').nullable(),
  links: z.array(z.strictObject({ kind: z.enum(w.POST_LINK_KINDS), post: idOf('post') })),
  departmentChanges: z.array(z.strictObject({ on: isoDate, department: idOf('department'), parent: idOf('post').nullable(), provenance })),
  standingOrders: z.array(standingOrder),
  unknowns: z.array(z.string()),
  provenance,
});

export const ForceBlockSchema = z.strictObject({
  id: idOf('forceBlock'),
  name: stringKey,
  kind: z.enum(w.FORCE_BLOCK_KINDS),
  parent: idOf('forceBlock').nullable(),
  department: idOf('department'),
  post: idOf('post').nullable(),
  region: idOf('region'),
  aboard: idOf('forceBlock').nullable(),
  arm: termId,
  strength: nonNegative.nullable(),
  strengthDate: historicalDate.nullable(),
  nonCombatants: nonNegative,
  storesDays: nonNegative.nullable(),
  unknowns: z.array(z.string()),
  provenance,
});

export const ScenarioSchema = z.strictObject({
  id: idOf('scenario'),
  name: stringKey,
  startDate: isoDate,
  seed: int.min(0).max(2_147_483_647),
  factions: z.array(
    z.strictObject({ faction: idOf('faction'), principal: idOf('person').nullable(), capital: idOf('region').nullable(), playable: z.boolean() }),
  ),
  control: z.array(z.strictObject({ region: idOf('region'), shares: z.array(z.strictObject({ faction: idOf('faction'), permille })) })),
  fortification: z.array(z.strictObject({ region: idOf('region'), levelPermille: permille })),
  edgeConditions: z.array(z.strictObject({ edge: idOf('edge'), conditionPermille: permille })),
  obstructions: z.array(z.strictObject({ edge: idOf('edge'), by: idOf('installation').nullable(), provenance })),
  depotConditions: z.array(z.strictObject({ depot: idOf('depot'), conditionPermille: permille })),
  posts: z.array(PostSchema),
  forceBlocks: z.array(ForceBlockSchema),
});

/** The pack manifest, `pack.json` (hand-written). */
export const ManifestSchema = z.strictObject({
  formatVersion: z.literal(w.WORLD_FORMAT_VERSION),
  id: termId,
  /** A draft may carry unknown values; a release may not. */
  status: z.enum(['draft', 'release']),
  /** Whether people may be marked invented (exempt from citing their centres and traits); off for a historical pack (review F7). */
  allowsInventedPeople: z.boolean().default(false),
  name: stringKey,
  defaultLocale: z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, 'a locale such as en or en-GB'),
  locales: z.array(z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/)).min(1),
  rules: RulesSchema,
  vocabularies: VocabulariesSchema,
  factions: z.array(faction).min(1),
  scenarios: z.array(idOf('scenario')).min(1, 'at least one scenario start (decision 0030)'),
});

/** How a source may be cited: a pointer (our own research notes) never satisfies a citation on its own. */
export const SOURCE_KINDS = ['primary', 'secondary', 'pointer', 'own-work'] as const;

/** One source in `PROVENANCE.json` (decision 0031). */
export const SourceSchema = z.strictObject({
  key: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ._:/()-]*$/, 'a source key: letters, digits, spaces and . _ : / ( ) -'),
  title: z.string().min(1),
  kind: z.enum(SOURCE_KINDS),
  /** Checked against the allow-list in `validate.ts`, so a rejected licence gets a reason, not just "invalid enum". */
  licence: z.string().min(1),
  /** Why a public-domain source is public domain (a government work, published before 1931, dedicated by its owner). */
  basis: z.string().nullable(),
  /** The copy actually used: an archive identifier or a stable reference (0031's archived copy). */
  copyUsed: z.string().min(1),
  /** The licence page and the day it was read, for sources whose licence is a statement on a page. */
  licencePage: z.string().nullable(),
  licenceReadOn: isoDate.nullable(),
});

export const ProvenanceFileSchema = z.strictObject({
  formatVersion: z.literal(w.WORLD_FORMAT_VERSION),
  sources: z.array(SourceSchema),
});

/** A string table: flat keys to ICU messages (decision 0030; intl-messageformat). */
export const StringTableSchema = z.record(z.string().regex(STRING_KEY_PATTERN, 'a string-table key'), z.string());

/** A scenario's hand-written header, `source/scenarios/<id>/scenario.json`; its tables are CSV beside it. */
export const ScenarioHeaderSchema = z.strictObject({
  name: z.string().min(1),
  startDate: isoDate,
  seed: int.min(0).max(2_147_483_647),
  factions: z.array(
    z.strictObject({ faction: idOf('faction'), principal: idOf('person').nullable(), capital: idOf('region').nullable(), playable: z.boolean() }),
  ),
});

export type Manifest = z.output<typeof ManifestSchema>;
export type ProvenanceFile = z.output<typeof ProvenanceFileSchema>;
export type SourceEntry = z.output<typeof SourceSchema>;
export type StringTable = z.output<typeof StringTableSchema>;
export type ScenarioHeader = z.output<typeof ScenarioHeaderSchema>;

// ---------------------------------------------------------------------------
// The schemas' output is exactly the kernel's types. A mismatch fails
// `npm run typecheck`, so neither side can change alone.

type DeepReadonly<T> = T extends string | number | boolean | null | undefined
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : { readonly [K in keyof T]: DeepReadonly<T[K]> };
type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

export const SCHEMAS_MATCH_KERNEL: {
  world: Same<DeepReadonly<z.output<typeof WorldSchema>>, DeepReadonly<w.World>>;
  scenario: Same<DeepReadonly<z.output<typeof ScenarioSchema>>, DeepReadonly<w.ScenarioStart>>;
} = { world: true, scenario: true };
