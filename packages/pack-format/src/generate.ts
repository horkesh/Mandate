/**
 * The generator: a pack's source files in, its `data/` files out
 * (FOUNDATION section 11.7: derived data from scripts; CI fails if committed
 * generated data is stale).
 *
 * Pure over a file reader, so the CLI, the staleness test and the fit test
 * share it. Deterministic: tables are sorted by id with the strict code-unit
 * order (decision 0002), output is canonical JSON, and line ends are LF.
 *
 * It reports every problem it finds, from CSV syntax to string tables, each at
 * its source file, row and column; it returns no outputs while any error
 * stands, so committed data is always valid.
 */
import { readBannedSources, readEvidencePolicy, readWeakSources } from './banned-sources.ts';
import { strictCompare, world as w } from '@mandate/kernel';
import { type z } from 'zod';
import {
  isUnknownMarker,
  list,
  parseBool,
  parseCentre,
  parseCitations,
  parseInt10,
  parsePoint,
  parseRanks,
  parseSeasons,
  parseShares,
  parseTraits,
  parseValues,
  parseRegardOthers,
  parsePractices,
  type Cell,
} from './cells.ts';
import { CsvError, parseCsv, type CsvTable } from './csv.ts';
import { formatGenerated } from './format.ts';
import { errorsOf, type Issue, IssueSink } from './issues.ts';
import {
  GENERATED_NOTE,
  generatedStringsFile,
  MANIFEST_FILE,
  PROVENANCE_FILE,
  SCENARIO_TABLES,
  scenarioFile,
  scenarioSourceDir,
  stringsFile,
  type TableSpec,
  WORLD_FILE,
  WORLD_TABLES,
} from './layout.ts';
import {
  type Manifest,
  ManifestSchema,
  type ProvenanceFile,
  ProvenanceFileSchema,
  ScenarioHeaderSchema,
  ScenarioSchema,
  type StringTable,
  StringTableSchema,
  WorldSchema,
} from './schemas.ts';
import { readSituationLayer } from './situation-layer.ts';
import { locateInData, type Locate, type PackData, validatePack, walkStrings, type Where } from './validate.ts';

/** Read access to one pack's files, by pack-relative path with forward slashes. A missing folder lists nothing. */
export interface PackFiles {
  read(path: string): string | undefined;
  /** Immediate subfolder names of a folder (for scenario sources); none for a missing folder. */
  folders(path: string): string[];
  /** Immediate file names in a folder, so a misnamed table is reported rather than ignored; none for a missing folder. */
  files(path: string): string[];
}

/**
 * The names in a folder a pack may not have (`situations/`, `gate/`): none when it is missing, even through an adapter
 * that throws ENOENT for a missing path rather than listing nothing (standing re-check, from lane 0.3's trial merge).
 * Any other error is not a missing folder, and is thrown.
 */
export function listOptional(list: (path: string) => string[], path: string): string[] {
  try {
    return list(path);
  } catch (e) {
    if ((e as { code?: unknown }).code === 'ENOENT') return [];
    throw e;
  }
}

/** Edit distance, for "did you mean" on a misnamed table. */
function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur.push(Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1)));
    prev = cur;
  }
  return prev[b.length]!;
}

/** Report every file or folder in a source folder that is not one of its known tables (review F3). */
function unknownEntries(files: PackFiles, dir: string, known: readonly string[], sink: IssueSink): void {
  for (const name of [...files.files(dir)].sort(strictCompare)) {
    if (known.includes(name)) continue;
    const nearest = [...known].sort((x, y) => distance(name, x) - distance(name, y) || strictCompare(x, y))[0];
    sink.error('unknown-table', `${dir}/${name}`, '', `"${name}" is not a table of this folder, so it would be ignored`, nearest ? `a known table name (the nearest is ${nearest})` : 'no files here');
  }
  for (const name of [...files.folders(dir)].sort(strictCompare)) {
    sink.error('unknown-table', `${dir}/${name}`, '', `"${name}/" is a folder the generator does not read`, `only the tables: ${known.join(', ')}`);
  }
}

export interface GenerateResult {
  /** Pack-relative path to file text; empty while errors stand. */
  readonly outputs: ReadonlyMap<string, string>;
  readonly issues: readonly Issue[];
  readonly pack: PackData | null;
}

// ---------------------------------------------------------------------------
// JSON files: parse, then shape-check with a schema, reporting Zod issues at their JSON path.

export function zodPath(path: readonly PropertyKey[]): string {
  return path.map((p, i) => (typeof p === 'number' ? `[${p}]` : i === 0 ? String(p) : `.${String(p)}`)).join('');
}

export function readJson<S extends z.ZodType>(files: PackFiles, path: string, schema: S, sink: IssueSink, required = true): z.output<S> | null {
  const text = files.read(path);
  if (text === undefined) {
    if (required) sink.error('missing-file', path, '', 'the file is missing');
    return null;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch (e) {
    sink.error('json-syntax', path, '', `not valid JSON: ${(e as Error).message}`);
    return null;
  }
  walkStrings(raw, '', (s, at) => {
    if (s.normalize('NFC') !== s) sink.error('not-nfc', path, at, 'text is not in Unicode NFC', 'NFC-normalised text (decision 0044)');
  });
  return shapeCheck(schema, raw, (p) => ({ file: path, at: zodPath(p) }), sink);
}

function shapeCheck<S extends z.ZodType>(schema: S, raw: unknown, place: (path: readonly PropertyKey[]) => { file: string; at: string }, sink: IssueSink): z.output<S> | null {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;
  for (const issue of parsed.error.issues) {
    const { file, at } = place(issue.path);
    sink.error(`shape/${issue.code}`, file, at, issue.message);
  }
  return null;
}

// ---------------------------------------------------------------------------
// CSV tables

interface Origin {
  readonly file: string;
  readonly line: number;
  readonly id: string;
  /** Records built from other tables' rows inside this record (a post's standing orders). */
  readonly nested: Map<string, Origin>;
}

class Rows {
  readonly rows: Row[] = [];
  constructor(
    readonly file: string,
    readonly present: boolean,
  ) {}
}

class Row {
  readonly unknowns: string[] = [];
  constructor(
    readonly file: string,
    readonly line: number,
    private readonly cells: ReadonlyMap<string, string>,
    private readonly sink: IssueSink,
  ) {}

  get id(): string {
    return (this.cells.get('id') ?? '').trim();
  }

  where(column: string): string {
    return `row ${this.line}${this.id ? ` (${this.id})` : ''}, column ${column}`;
  }

  raw(column: string): string {
    return (this.cells.get(column) ?? '').trim();
  }

  origin(): Origin {
    return { file: this.file, line: this.line, id: this.id, nested: new Map() };
  }

  error(kind: string, column: string, message: string, expected?: string): void {
    this.sink.error(kind, this.file, this.where(column), message, expected);
  }

  warn(kind: string, column: string, message: string, expected?: string): void {
    this.sink.warn(kind, this.file, this.where(column), message, expected);
  }

  private take<T>(column: string, cell: Cell<T>, fallback: T): T {
    if (cell.ok) return cell.value;
    this.error('bad-cell', column, cell.problem, cell.expected);
    return fallback;
  }

  /** Text that must be present. A column missing from the header is reported once, as missing-column, not per row. */
  text(column: string): string {
    const v = this.raw(column);
    if (v === '' && this.cells.has(column)) this.error('missing-value', column, 'the cell is empty', 'a value');
    if (isUnknownMarker(v)) this.error('unknown-not-allowed', column, `"${v}" is not allowed in this column`, 'a value');
    return v;
  }

  optionalText(column: string): string | null {
    const v = this.raw(column);
    return v === '' ? null : v;
  }

  /** An id that must be present. Unknown markers are refused; its form is the schema's to check (one report, not two). */
  id_(column: string): string {
    return this.text(column);
  }

  /** An optional id; `unknown` is allowed only when `unknownField` names the field it declares unknown. */
  optionalId(column: string, unknownField?: string): string | null {
    const v = this.raw(column);
    if (v === '') return null;
    if (isUnknownMarker(v)) {
      if (unknownField === undefined) this.error('unknown-not-allowed', column, `"${v}" is not allowed in this column`, 'a value or empty');
      else this.unknowns.push(unknownField);
      return null;
    }
    return v;
  }

  int(column: string, fallback = 1): number {
    const v = this.text(column);
    return v === '' || isUnknownMarker(v) ? fallback : this.take(column, parseInt10(v), fallback);
  }

  optionalInt(column: string, unknownField?: string): number | null {
    const v = this.raw(column);
    if (v === '') return null;
    if (isUnknownMarker(v)) {
      if (unknownField === undefined) this.error('unknown-not-allowed', column, `"${v}" is not allowed in this column`, 'a whole number or empty');
      else this.unknowns.push(unknownField);
      return null;
    }
    return this.take(column, parseInt10(v), null);
  }

  bool(column: string): boolean {
    return this.take(column, parseBool(this.raw(column)), false);
  }

  /** An optional date; `unknown` declares the field unknown. Shape is checked by the schema. */
  optionalDate(column: string, unknownField?: string): string | null {
    const v = this.raw(column);
    if (v === '') return null;
    if (isUnknownMarker(v)) {
      if (unknownField === undefined) this.error('unknown-not-allowed', column, `"${v}" is not allowed in this column`, 'a date or empty');
      else this.unknowns.push(unknownField);
      return null;
    }
    return v;
  }

  cell<T>(column: string, cell: Cell<T>, fallback: T): T {
    return this.take(column, cell, fallback);
  }
}

function readTable(files: PackFiles, path: string, spec: TableSpec, sink: IssueSink): Rows {
  const text = files.read(path);
  if (text === undefined) {
    if (spec.required) sink.error('missing-file', path, '', 'the table is missing');
    return new Rows(path, false);
  }
  let table: CsvTable;
  try {
    table = parseCsv(text);
  } catch (e) {
    if (!(e instanceof CsvError)) throw e;
    sink.error('csv-syntax', path, `line ${e.line}`, e.message);
    return new Rows(path, false);
  }
  const known = new Set(spec.columns.map((col) => col.name));
  table.header.forEach((h, i) => {
    if (!known.has(h)) sink.error('unknown-column', path, `column ${i + 1}`, `"${h}" is not a column of this table`, spec.columns.map((col) => col.name).join(', '));
    if (table.header.indexOf(h) !== i) sink.error('duplicate-column', path, `column ${i + 1}`, `"${h}" appears twice`);
  });
  for (const col of spec.columns) {
    if (col.required && !table.header.includes(col.name)) sink.error('missing-column', path, '', `required column "${col.name}" is missing`, spec.columns.map((x) => x.name).join(', '));
  }
  const nfc = (text: string, at: string) => {
    if (text.normalize('NFC') !== text) sink.error('not-nfc', path, at, 'text is not in Unicode NFC', 'NFC-normalised text (decision 0044)');
  };
  table.header.forEach((h, i) => nfc(h, `column ${i + 1}`));
  for (const r of table.rows) r.cells.forEach((cell, i) => nfc(cell, `row ${r.line}, column ${table.header[i] ?? i + 1}`));
  const rows = new Rows(path, true);
  for (const r of table.rows) {
    const cells = new Map<string, string>();
    table.header.forEach((h, i) => cells.set(h, r.cells[i] ?? ''));
    rows.rows.push(new Row(path, r.line, cells, sink));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Names become string-table entries; the record keeps the key.

/** Escape text so ICU MessageFormat shows it literally. */
export function icuLiteral(text: string): string {
  return text.replace(/'/g, "''").replace(/[{}]/g, (m) => `'${m}'`);
}

class NameTable {
  readonly entries = new Map<string, string>();
  add(key: string, text: string): string {
    if (text !== '') this.entries.set(key, icuLiteral(text));
    return key;
  }
}

/** Column for a field path inside a record, for pointing issues at source cells. */
const COLUMN_OVERRIDES: Readonly<Record<string, string>> = Object.freeze({
  provenance: 'sources',
  cites: 'sources',
  a: 'from',
  b: 'to',
  lengthDaysBA: 'length_days_back',
  seasons: 'seasonal',
  'labelHints.anchor': 'label_anchor',
  'labelHints.spine': 'label_spine',
  'labelHints.sizeClass': 'label_size',
  'labelHints.minZoomPermille': 'label_min_zoom',
  'fort.water': 'fort_water',
  'fort.commandsEdges': 'commands_edges',
  temporary: 'temporary_operation',
  issuedOn: 'issued_on',
  holder: 'person',
  'centres.competence': 'competence',
  'centres.nerve': 'nerve',
  'centres.experience': 'experience',
  'centres.reputation': 'reputation',
  'temperament.boldness': 'boldness',
  'temperament.candour': 'candour',
  shares: 'shares',
  levelPermille: 'level',
  conditionPermille: 'condition',
  by: 'by',
});

export function columnFor(field: string): string {
  const clean = field.replace(/\[\d+\]/g, '');
  for (const [prefix, col] of Object.entries(COLUMN_OVERRIDES).sort(([x], [y]) => y.length - x.length)) {
    if (clean === prefix || clean.startsWith(`${prefix}.`)) return col;
  }
  const first = clean.split('.')[0] ?? clean;
  return first.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

// ---------------------------------------------------------------------------

export function generatePack(files: PackFiles): GenerateResult {
  const sink = new IssueSink();
  const manifest = readJson(files, MANIFEST_FILE, ManifestSchema, sink);
  const provenance = readJson(files, PROVENANCE_FILE, ProvenanceFileSchema, sink);
  if (!manifest || !provenance) return { outputs: new Map(), issues: sink.issues, pack: null };

  const sourceKeys = provenance.sources.map((s) => s.key);
  const names = new NameTable();
  const origins = new Map<string, Origin>();
  const cites = (row: Row, column = 'sources') => parseCitations(row.raw(column), sourceKeys);

  /** Sort records by id and remember where each came from, by its index after sorting. */
  function place<T extends { readonly id: string }>(scope: string, table: string, items: { rec: T; origin: Origin }[]): T[] {
    const sorted = [...items].sort((x, y) => strictCompare(x.rec.id, y.rec.id));
    sorted.forEach((it, i) => origins.set(`${scope}|${table}|${i}`, it.origin));
    return sorted.map((it) => it.rec);
  }
  const wt = (key: keyof typeof WORLD_TABLES) => readTable(files, `source/world/${WORLD_TABLES[key].file}`, WORLD_TABLES[key], sink);
  unknownEntries(files, 'source/world', Object.values(WORLD_TABLES).map((t) => t.file), sink);
  for (const name of files.files('source/scenarios')) sink.error('unknown-table', `source/scenarios/${name}`, '', 'scenario tables live in a folder per scenario', 'source/scenarios/<id>/');

  // ---- World tables
  /** A department's polity (0070), present only when its cell is: absent keeps every other department's record, and so the World's hash, as it was. */
  const optionalPolity = (r: { optionalId(column: string): string | null }): { polity?: string } => {
    const polity = r.optionalId('polity');
    return polity === null ? {} : { polity };
  };
  const departments = place(
    'world',
    'departments',
    wt('departments').rows.map((r) => ({
      origin: r.origin(),
      rec: {
        id: r.id_('id'),
        faction: r.optionalId('faction'),
        kind: r.text('kind'),
        ...optionalPolity(r),
        name: names.add(`department.${r.id}.name`, r.text('name')),
        provenance: cites(r),
      },
    })),
  );

  const regions = place(
    'world',
    'regions',
    wt('regions').rows.map((r) => {
      const anchor = r.raw('label_anchor');
      const spine = r.raw('label_spine');
      const size = r.raw('label_size');
      const minZoom = r.optionalInt('label_min_zoom');
      const hasHints = anchor !== '' || spine !== '' || size !== '' || minZoom !== null;
      const point = (raw: string, col: string) => r.cell(col, parsePoint(raw), { lonE6: 0, latE6: 0 });
      return {
        origin: r.origin(),
        rec: {
          id: r.id_('id'),
          name: names.add(`region.${r.id}.name`, r.text('name')),
          kind: r.text('kind'),
          terrain: r.optionalText('terrain'),
          flags: list(r.raw('flags')),
          offMapRole: r.optionalText('off_map_role'),
          weatherZone: r.optionalId('weather_zone'),
          refPoint: r.raw('ref_point') === '' ? null : point(r.raw('ref_point'), 'ref_point'),
          counties: list(r.raw('counties')),
          labelHints: hasHints
            ? {
                anchor: anchor === '' ? null : point(anchor, 'label_anchor'),
                spine: list(spine).map((p) => point(p, 'label_spine')),
                sizeClass: size === '' ? null : size,
                minZoomPermille: minZoom,
              }
            : null,
          provenance: cites(r),
        },
      };
    }),
  );

  const edgeRows = wt('edges').rows.map((r) => {
    const from = r.id_('from');
    const to = r.id_('to');
    const type = r.text('type');
    const line = r.optionalId('line');
    const forward = r.int('length_days');
    const back = r.optionalInt('length_days_back');
    const swap = to < from;
    const [a, b] = swap ? [to, from] : [from, to];
    const lengthDays = swap ? (back ?? forward) : forward;
    const lengthDaysBA = back === null ? null : swap ? forward : back;
    const id = r.optionalId('id') ?? (line ? `${type}:${a}:${b}:${line}` : `${type}:${a}:${b}`);
    return {
      origin: { ...r.origin(), id },
      rec: {
        id,
        type,
        a,
        b,
        lengthDays,
        lengthDaysBA,
        capacity: r.int('capacity'),
        line,
        breakOfBulk: r.bool('break_of_bulk'),
        depthFeet: r.optionalInt('depth_feet'),
        seasons: r.cell('seasonal', parseSeasons(r.raw('seasonal'), manifest.rules), []),
        provenance: cites(r),
      },
    };
  });
  const edges = place('world', 'edges', edgeRows);

  const installations = place(
    'world',
    'installations',
    wt('installations').rows.map((r) => {
      const kind = r.text('kind');
      const water = r.optionalText('fort_water');
      const commands = list(r.raw('commands_edges'));
      if (kind !== 'fort' && (water !== null || commands.length > 0)) r.error('fort-fields', 'fort_water', `a ${kind} has no fort facts`, 'empty');
      return {
        origin: r.origin(),
        rec: {
          id: r.id_('id'),
          region: r.id_('region'),
          kind,
          name: names.add(`installation.${r.id}.name`, r.text('name')),
          fort: kind === 'fort' ? { water, commandsEdges: commands } : null,
          provenance: cites(r),
        },
      };
    }),
  );

  const railLines = place(
    'world',
    'railLines',
    wt('railLines').rows.map((r) => ({ origin: r.origin(), rec: { id: r.id_('id'), name: names.add(`rail_line.${r.id}.name`, r.text('name')), provenance: cites(r) } })),
  );
  const depots = place(
    'world',
    'depots',
    wt('depots').rows.map((r) => ({
      origin: r.origin(),
      rec: { id: r.id_('id'), region: r.id_('region'), kind: r.text('kind'), name: names.add(`depot.${r.id}.name`, r.text('name')), capacity: r.int('capacity'), provenance: cites(r) },
    })),
  );
  const census = place(
    'world',
    'census',
    wt('census').rows.map((r) => {
      const region = r.id_('region');
      return { origin: { ...r.origin(), id: region }, rec: { id: region, region, enslavedPopulation: r.int('enslaved_population'), provenance: cites(r) } };
    }),
  ).map(({ id: _id, ...rest }) => rest);
  const weatherZones = place(
    'world',
    'weatherZones',
    wt('weatherZones').rows.map((r) => ({ origin: r.origin(), rec: { id: r.id_('id'), name: names.add(`weather_zone.${r.id}.name`, r.text('name')) } })),
  );

  const people = place(
    'world',
    'people',
    wt('people').rows.map((r) => {
      const centre = (col: string) => r.cell(col, parseCentre(r.raw(col), sourceKeys), { direction: null, cites: [] });
      const rec = {
        id: r.id_('id'),
        name: names.add(`person.${r.id}.name`, r.text('name')),
        invented: r.bool('invented'),
        faction: r.optionalId('faction', 'faction'),
        kind: r.text('kind'),
        born: r.optionalDate('born', 'born'),
        died: r.optionalDate('died', 'died'),
        centres: { competence: centre('competence'), nerve: centre('nerve'), experience: centre('experience'), reputation: centre('reputation') },
        temperament: { boldness: centre('boldness'), candour: centre('candour') },
        values: r.cell('values', parseValues(r.raw('values'), sourceKeys), []),
        regard: centre('regard'),
        regardOthers: r.cell('regard_others', parseRegardOthers(r.raw('regard_others'), sourceKeys), []),
        practices: r.cell('practices', parsePractices(r.raw('practices'), sourceKeys), []),
        traits: r.cell('traits', parseTraits(r.raw('traits'), sourceKeys), []),
        bloc: r.optionalId('bloc', 'bloc'),
        ranks: r.cell('ranks', parseRanks(r.raw('ranks')), []),
        unknowns: [] as string[],
        provenance: cites(r),
      };
      rec.unknowns = [...new Set(r.unknowns)].sort(strictCompare);
      return { origin: r.origin(), rec };
    }),
  );

  const rawWorld = {
    formatVersion: w.WORLD_FORMAT_VERSION,
    pack: manifest.id,
    rules: manifest.rules,
    vocabularies: manifest.vocabularies,
    factions: manifest.factions,
    departments,
    regions,
    installations,
    edges,
    railLines,
    depots,
    weatherZones,
    census,
    people,
  };

  // ---- Scenarios
  const rawScenarios: { id: string; raw: unknown }[] = [];
  const scenarioFolders = files.folders('source/scenarios').sort(strictCompare);
  for (const sid of scenarioFolders) {
    const dir = scenarioSourceDir(sid);
    unknownEntries(files, dir, ['scenario.json', ...Object.values(SCENARIO_TABLES).map((t) => t.file)], sink);
    const header = readJson(files, `${dir}/scenario.json`, ScenarioHeaderSchema, sink);
    if (!header) continue;
    const scope = `scenario:${sid}`;
    const st = (key: keyof typeof SCENARIO_TABLES) => readTable(files, `${dir}/${SCENARIO_TABLES[key].file}`, SCENARIO_TABLES[key], sink);

    const control = place(
      scope,
      'control',
      st('control').rows.map((r) => {
        const region = r.id_('region');
        return { origin: { ...r.origin(), id: region }, rec: { id: region, region, shares: r.cell('shares', parseShares(r.raw('shares')), []) } };
      }),
    ).map(({ region, shares }) => ({ region, shares: [...shares].sort((x, y) => strictCompare(x.faction, y.faction)) }));

    type PostRec = {
      id: string;
      name: string;
      kind: string;
      department: string;
      parent: string | null;
      holder: string | null;
      acting: boolean;
      intelligenceChief: string | null;
      region: string | null;
      temporary: { operation: string } | null;
      installation: string | null;
      railLine: string | null;
      links: { kind: string; post: string }[];
      departmentChanges: { on: string; department: string; parent: string | null; provenance: w.Citation[] }[];
      standingOrders: { id: string; kind: string; from: string | null; issuedOn: string; summary: string; cites: w.Citation[] }[];
      unknowns: string[];
      provenance: w.Citation[];
    };
    const postItems: { rec: PostRec; origin: Origin }[] = st('posts').rows.map((r) => {
      const op = r.optionalId('temporary_operation');
      const rec: PostRec = {
        id: r.id_('id'),
        name: names.add(`post.${r.id}.name`, r.text('name')),
        kind: r.text('kind'),
        department: r.id_('department'),
        parent: r.optionalId('parent', 'parent'),
        holder: null,
        acting: false,
        intelligenceChief: r.optionalId('intelligence_chief', 'intelligenceChief'),
        region: r.optionalId('region', 'region'),
        temporary: op === null ? null : { operation: op },
        installation: r.optionalId('installation'),
        railLine: r.optionalId('rail_line'),
        links: [],
        departmentChanges: [],
        standingOrders: [],
        unknowns: r.unknowns,
        provenance: cites(r),
      };
      return { rec, origin: r.origin() };
    });
    const postById = new Map(postItems.map((p) => [p.rec.id, p]));
    const attach = (r: Row, column: string) => {
      const post = r.id_(column);
      const target = postById.get(post);
      if (!target && post !== '') r.error('unknown-reference', column, `"${post}" is not a post in posts.csv`, 'a post id defined in posts.csv');
      return target;
    };

    const holderSeen = new Map<string, number>();
    for (const r of st('holders').rows) {
      const target = attach(r, 'post');
      const person = r.optionalId('person', 'holder');
      const from = r.optionalDate('from');
      const to = r.optionalDate('to');
      if (from !== null && from > header.startDate) {
        r.warn('tenure-outside-start', 'from', `the tenure begins ${from}, after the start (${header.startDate}); it is not part of this start`, 'tenures that cover the start date');
        continue;
      }
      if (to !== null && to < header.startDate) {
        r.warn('tenure-outside-start', 'to', `the tenure ends ${to}, before the start (${header.startDate}); it is not part of this start`, 'tenures that cover the start date');
        continue;
      }
      if (!target) continue;
      if (holderSeen.has(target.rec.id)) {
        r.error('duplicate-holder', 'post', `post "${target.rec.id}" already has a holder at the start (row ${holderSeen.get(target.rec.id)})`, 'one holder per post on the start date');
        continue;
      }
      holderSeen.set(target.rec.id, r.line);
      target.rec.holder = person;
      target.rec.acting = r.bool('acting');
      if (person === null && r.unknowns.includes('holder')) target.rec.unknowns.push('holder');
      target.origin.nested.set('holder', r.origin());
      // Who held the post at the start is cited with the post (review N6); a release pack must cite it.
      const tenureCites = cites(r);
      if (tenureCites.length === 0 && manifest.status === 'release') r.error('holder-without-citation', 'sources', `who held "${target.rec.id}" at the start is not cited`, 'a citation: a release pack cites every holder');
      for (const c of tenureCites) if (!target.rec.provenance.some((x) => x.source === c.source && x.at === c.at)) target.rec.provenance.push(c);
    }
    for (const r of st('postLinks').rows) {
      const target = attach(r, 'post');
      const link = { kind: r.text('kind'), post: r.id_('other') };
      if (target) {
        target.rec.links.push(link);
        target.origin.nested.set(`links[${target.rec.links.length - 1}]`, r.origin());
      }
    }
    for (const r of st('departmentChanges').rows) {
      const target = attach(r, 'post');
      const change = { on: r.text('on'), department: r.id_('department'), parent: r.optionalId('parent'), provenance: cites(r) };
      if (target) {
        target.rec.departmentChanges.push(change);
        target.origin.nested.set(`departmentChanges[${target.rec.departmentChanges.length - 1}]`, r.origin());
      }
    }
    for (const r of st('standingOrders').rows) {
      const target = attach(r, 'post');
      const id = r.id_('id');
      const order = {
        id,
        kind: r.text('kind'),
        from: r.optionalId('from'),
        issuedOn: r.text('issued_on'),
        summary: names.add(`post.${target?.rec.id ?? 'unknown'}.order.${id}`, r.text('summary')),
        cites: cites(r),
      };
      if (target) {
        target.rec.standingOrders.push(order);
        target.origin.nested.set(`standingOrders[${target.rec.standingOrders.length - 1}]`, r.origin());
      }
    }
    for (const { rec, origin } of postItems) {
      // Nested lists in a stable order; origins follow their records.
      const reorder = <T>(listName: string, items: T[], key: (t: T) => string) => {
        const idx = items.map((t, i) => ({ t, i })).sort((x, y) => strictCompare(key(x.t), key(y.t)) || x.i - y.i);
        const old = new Map(origin.nested);
        idx.forEach(({ i }, j) => {
          const o = old.get(`${listName}[${i}]`);
          if (o) origin.nested.set(`${listName}[${j}]`, o);
        });
        return idx.map(({ t }) => t);
      };
      rec.links = reorder('links', rec.links, (l) => `${l.kind}|${l.post}`);
      rec.departmentChanges = reorder('departmentChanges', rec.departmentChanges, (c) => c.on);
      rec.standingOrders = reorder('standingOrders', rec.standingOrders, (o) => o.id);
      rec.unknowns = [...new Set(rec.unknowns)].sort(strictCompare);
    }
    const posts = place(scope, 'posts', postItems);

    const forceBlocks = place(
      scope,
      'forceBlocks',
      st('forceBlocks').rows.map((r) => {
        const rec = {
          id: r.id_('id'),
          name: names.add(`force_block.${r.id}.name`, r.text('name')),
          kind: r.text('kind'),
          parent: r.optionalId('parent'),
          department: r.id_('department'),
          post: r.optionalId('post', 'post'),
          region: r.id_('region'),
          aboard: r.optionalId('aboard'),
          arm: r.text('arm'),
          strength: r.optionalInt('strength', 'strength'),
          strengthDate: r.optionalDate('strength_date', 'strengthDate'),
          nonCombatants: r.optionalInt('non_combatants') ?? 0,
          storesDays: r.optionalInt('stores_days', 'storesDays'),
          storesDate: r.optionalDate('stores_date', 'storesDate'),
          unknowns: [] as string[],
          provenance: cites(r),
        };
        rec.unknowns = [...new Set(r.unknowns)].sort(strictCompare);
        return { origin: r.origin(), rec };
      }),
    );

    const keyed = <T>(key: keyof typeof SCENARIO_TABLES, idCol: string, build: (r: Row, id: string) => T) =>
      place(
        scope,
        key,
        st(key).rows.map((r) => {
          const id = r.id_(idCol);
          return { origin: { ...r.origin(), id }, rec: { id, ...build(r, id) } };
        }),
      ).map(({ id: _id, ...rest }) => rest);

    rawScenarios.push({
      id: sid,
      raw: {
        id: sid,
        name: names.add(`scenario.${sid}.name`, header.name),
        startDate: header.startDate,
        seed: header.seed,
        factions: header.factions,
        openingControl: header.openingControl,
        control,
        fortification: keyed('fortification', 'region', (r, id) => ({ region: id, levelPermille: r.int('level', 0) })),
        loyalty: keyed('loyalty', 'region', (r, id) => ({ region: id, shares: [...r.cell('shares', parseShares(r.raw('shares')), [])].sort((x, y) => strictCompare(x.faction, y.faction)) })),
        edgeConditions: keyed('edgeConditions', 'edge', (r, id) => ({ edge: id, conditionPermille: r.int('condition', 1000) })),
        obstructions: keyed('obstructions', 'edge', (r, id) => ({ edge: id, by: r.optionalId('by'), provenance: cites(r) })),
        depotConditions: keyed('depotConditions', 'depot', (r, id) => ({ depot: id, conditionPermille: r.int('condition', 1000) })),
        posts,
        forceBlocks,
        // `unknown` here is a modelled value (no known government: not neutral ground, 0058), not the "needs a source"
        // marker other columns use; the reason goes in the row's notes.
        governments: keyed('governments', 'region', (r, id) => ({ region: id, department: isUnknownMarker(r.raw('department')) ? w.UNKNOWN_GOVERNMENT : r.id_('department'), provenance: cites(r) })),
      },
    });
  }

  // ---- Locating issues at their source cells
  const locate: Locate = (where: Where) => {
    if (where.scope === 'world' && (where.table === 'pack' || where.table.startsWith('vocabularies') || where.table.startsWith('rules') || where.table === 'factions')) {
      return { file: MANIFEST_FILE, at: where.table === 'pack' ? (where.field ?? '') : `${where.table}[${where.index}]${where.field ? `.${where.field}` : ''}` };
    }
    if (where.table === 'scenario') return { file: `${scenarioSourceDir(where.scope.slice('scenario:'.length))}/scenario.json`, at: where.field ?? '' };
    if (where.scope.startsWith('scenario:') && where.table === 'factions') {
      return { file: `${scenarioSourceDir(where.scope.slice('scenario:'.length))}/scenario.json`, at: `factions[${where.index}]${where.field ? `.${where.field}` : ''}` };
    }
    if (where.scope.startsWith('scenario:') && where.table.startsWith('openingControl.')) {
      return { file: `${scenarioSourceDir(where.scope.slice('scenario:'.length))}/scenario.json`, at: `${where.table}[${where.index}]${where.field ? `.${where.field}` : ''}` };
    }
    let origin = origins.get(`${where.scope}|${where.table}|${where.index}`);
    let field = where.field ?? '';
    if (origin) {
      for (const [nestedKey, nestedOrigin] of origin.nested) {
        if (field === nestedKey || field.startsWith(`${nestedKey}.`) || field.startsWith(`${nestedKey}[`)) {
          origin = nestedOrigin;
          field = field.slice(nestedKey.length).replace(/^\./, '');
          // In post_links.csv the linked post is the `other` column; `post` is the owner.
          if (nestedKey.startsWith('links[') && field === 'post') field = 'other';
          break;
        }
      }
      return { file: origin.file, at: `row ${origin.line}${origin.id ? ` (${origin.id})` : ''}${field ? `, column ${columnFor(field)}` : ''}` };
    }
    // A record that is not there (a missing control row): point at the table it belongs in, never at data/.
    if (where.scope === 'world' && where.table in WORLD_TABLES) return { file: `source/world/${WORLD_TABLES[where.table as keyof typeof WORLD_TABLES].file}`, at: '' };
    if (where.scope.startsWith('scenario:') && where.table in SCENARIO_TABLES) {
      return { file: `${scenarioSourceDir(where.scope.slice('scenario:'.length))}/${SCENARIO_TABLES[where.table as keyof typeof SCENARIO_TABLES].file}`, at: '' };
    }
    return locateInData(where);
  };

  // ---- Shape check, record by record: a bad record is reported and left out
  // (its id quarantined, so references to it are not reported twice), and the
  // semantic pass still runs over the rest. Every problem is reported at once.
  const quarantined = new Map<string, Set<string>>();
  function records<S extends z.ZodType>(scope: string, table: string, schema: S, items: readonly unknown[]): z.output<S>[] {
    const kept: z.output<S>[] = [];
    const keptOrigins: (Origin | undefined)[] = [];
    items.forEach((item, i) => {
      const parsed = schema.safeParse(item);
      if (parsed.success) {
        kept.push(parsed.data);
        keptOrigins.push(origins.get(`${scope}|${table}|${i}`));
        return;
      }
      for (const issue of parsed.error.issues) {
        const field = zodPath(issue.path);
        const { file, at } = locate({ scope, table, index: i, ...(field ? { field } : {}) });
        sink.error(`shape/${issue.code}`, file, at, issue.message);
      }
      const id = (item as { id?: unknown }).id;
      if (typeof id === 'string') quarantined.set(`${scope}|${table}`, (quarantined.get(`${scope}|${table}`) ?? new Set<string>()).add(id));
    });
    items.forEach((_, i) => origins.delete(`${scope}|${table}|${i}`));
    keptOrigins.forEach((o, i) => {
      if (o) origins.set(`${scope}|${table}|${i}`, o);
    });
    return kept;
  }
  const WS = WorldSchema.shape;
  const world: w.World = {
    formatVersion: w.WORLD_FORMAT_VERSION,
    pack: manifest.id,
    rules: manifest.rules,
    vocabularies: manifest.vocabularies,
    factions: manifest.factions,
    departments: records('world', 'departments', WS.departments.element, rawWorld.departments),
    regions: records('world', 'regions', WS.regions.element, rawWorld.regions),
    installations: records('world', 'installations', WS.installations.element, rawWorld.installations),
    edges: records('world', 'edges', WS.edges.element, rawWorld.edges),
    railLines: records('world', 'railLines', WS.railLines.element, rawWorld.railLines),
    depots: records('world', 'depots', WS.depots.element, rawWorld.depots),
    weatherZones: records('world', 'weatherZones', WS.weatherZones.element, rawWorld.weatherZones),
    census: records('world', 'census', WS.census.element, rawWorld.census),
    people: records('world', 'people', WS.people.element, rawWorld.people),
  };
  const SS = ScenarioSchema.shape;
  const Head = ScenarioSchema.pick({ id: true, name: true, startDate: true, seed: true, factions: true, openingControl: true });
  const scenarios: w.ScenarioStart[] = [];
  for (const s of rawScenarios) {
    const scope = `scenario:${s.id}`;
    const raw = s.raw as Record<string, unknown> & Record<'control' | 'fortification' | 'loyalty' | 'edgeConditions' | 'obstructions' | 'depotConditions' | 'posts' | 'forceBlocks' | 'governments', unknown[]>;
    const headRaw = { id: raw.id, name: raw.name, startDate: raw.startDate, seed: raw.seed, factions: raw.factions, ...(raw.openingControl === undefined ? {} : { openingControl: raw.openingControl }) };
    const head = shapeCheck(Head, headRaw, (p) => ({ file: `${scenarioSourceDir(s.id)}/scenario.json`, at: zodPath(p) }), sink);
    if (!head) continue;
    scenarios.push({
      ...head,
      control: records(scope, 'control', SS.control.element, raw.control),
      fortification: records(scope, 'fortification', SS.fortification.element, raw.fortification),
      loyalty: records(scope, 'loyalty', SS.loyalty.element, raw.loyalty),
      edgeConditions: records(scope, 'edgeConditions', SS.edgeConditions.element, raw.edgeConditions),
      obstructions: records(scope, 'obstructions', SS.obstructions.element, raw.obstructions),
      depotConditions: records(scope, 'depotConditions', SS.depotConditions.element, raw.depotConditions),
      posts: records(scope, 'posts', SS.posts.element, raw.posts),
      forceBlocks: records(scope, 'forceBlocks', SS.forceBlocks.element, raw.forceBlocks),
      governments: records(scope, 'governments', SS.governments.element, raw.governments),
    });
  }

  // ---- String tables: hand-written per locale, plus the generated names
  const strings = new Map<string, { file: string; table: StringTable }[]>();
  for (const locale of manifest.locales) {
    const table = readJson(files, stringsFile(locale), StringTableSchema, sink, locale === manifest.defaultLocale);
    if (table) strings.set(locale, [{ file: stringsFile(locale), table }]);
  }
  const generatedNames: StringTable = Object.fromEntries([...names.entries].sort(([x], [y]) => strictCompare(x, y)));
  const defaults = strings.get(manifest.defaultLocale) ?? [];
  strings.set(manifest.defaultLocale, [...defaults, { file: generatedStringsFile(manifest.defaultLocale), table: generatedNames }]);

  const worldPack: PackData = { manifest, provenance, world, scenarios, strings, quarantined, bannedSources: readBannedSources(files), weakSources: readWeakSources(files), evidencePolicy: readEvidencePolicy(files) };
  sink.add(validatePack(worldPack, locate));
  if (errorsOf(sink.issues).length > 0) return { outputs: new Map(), issues: sink.issues, pack: worldPack };
  // Situations and the gate (lane 0.7): hand-written, committed as they are, checked here and at load.
  const layer = readSituationLayer(files, worldPack);
  sink.add(layer.issues);
  const pack: PackData = { ...worldPack, situations: layer.situations, gate: layer.gate };
  if (errorsOf(sink.issues).length > 0) return { outputs: new Map(), issues: sink.issues, pack };

  // The schemas admit only integers and plain data, so canonical JSON cannot
  // fail here; if it ever did, `canonicalJson` throws naming the path.
  const outputs = new Map<string, string>();
  outputs.set(WORLD_FILE, formatGenerated(world));
  for (const s of scenarios) outputs.set(scenarioFile(s.id), formatGenerated(s));
  outputs.set(generatedStringsFile(manifest.defaultLocale), formatGenerated(generatedNames));
  outputs.set(GENERATED_NOTE, generatedNote(manifest, [...outputs.keys()]));
  return { outputs, issues: sink.issues, pack };
}

function generatedNote(manifest: Manifest, paths: readonly string[]): string {
  return [
    `# Generated files: ${manifest.id}`,
    '',
    'Everything in this folder is written by `npm run pack:generate -- ' + manifest.id + '` from `pack.json`, `PROVENANCE.json` and `source/`.',
    'Do not edit it by hand: edit the sources and regenerate. `npm test` fails when these files are stale.',
    '',
    ...[...paths].sort(strictCompare).map((p) => `- \`${p}\``),
    '',
  ].join('\n');
}

/** Files under `data/` that differ from the generator's output, are missing, or should not be there. */
export function staleFiles(outputs: ReadonlyMap<string, string>, existing: ReadonlyMap<string, string>): { path: string; problem: 'stale' | 'missing' | 'extra' }[] {
  const out: { path: string; problem: 'stale' | 'missing' | 'extra' }[] = [];
  for (const [path, text] of outputs) {
    const now = existing.get(path);
    if (now === undefined) out.push({ path, problem: 'missing' });
    else if (now.replace(/\r\n/g, '\n') !== text) out.push({ path, problem: 'stale' });
  }
  for (const path of existing.keys()) if (!outputs.has(path)) out.push({ path, problem: 'extra' });
  return out.sort((x, y) => strictCompare(x.path, y.path));
}

export type { Manifest, ProvenanceFile };
