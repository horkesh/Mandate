/**
 * Where things live in a v2 pack, and which columns each source table has.
 *
 *     packs/<id>/
 *       pack.json                  manifest: status, locales, rules, vocabularies, factions, scenarios
 *       PROVENANCE.json            every source, its licence and the copy used (decision 0031)
 *       strings/<locale>.json      hand-written player text (ICU messages)
 *       source/world/*.csv         the World's tables
 *       source/scenarios/<id>/     scenario.json (header) and the start's tables
 *       data/                      GENERATED: world.json, scenarios/<id>.json, strings/<locale>.json
 *
 * `data/` is written only by the generator; a test fails when it is stale.
 */

export const MANIFEST_FILE = 'pack.json';
export const PROVENANCE_FILE = 'PROVENANCE.json';
export const DATA_DIR = 'data';
export const WORLD_FILE = 'data/world.json';
export const GENERATED_NOTE = 'data/GENERATED.md';
export const scenarioFile = (id: string) => `data/scenarios/${id}.json`;
export const generatedStringsFile = (locale: string) => `data/strings/${locale}.json`;
export const stringsFile = (locale: string) => `strings/${locale}.json`;
export const scenarioSourceDir = (id: string) => `source/scenarios/${id}`;

export interface ColumnSpec {
  readonly name: string;
  readonly required?: boolean;
}

export interface TableSpec {
  /** Path relative to the world source folder or a scenario's source folder. */
  readonly file: string;
  /** A missing optional table is an empty one. */
  readonly required: boolean;
  readonly columns: readonly ColumnSpec[];
}

const c = (name: string, required = false): ColumnSpec => ({ name, required });

/** The World's source tables, under `source/world/`. */
export const WORLD_TABLES = {
  departments: { file: 'departments.csv', required: true, columns: [c('id', true), c('name', true), c('faction', true), c('kind', true), c('polity'), c('sources', true), c('notes')] },
  regions: {
    file: 'regions.csv',
    required: true,
    columns: [
      c('id', true),
      c('name', true),
      c('kind', true),
      c('terrain'),
      c('flags'),
      c('off_map_role'),
      c('weather_zone'),
      c('ref_point'),
      c('counties'),
      c('label_anchor'),
      c('label_spine'),
      c('label_size'),
      c('label_min_zoom'),
      c('sources', true),
      c('notes'),
    ],
  },
  installations: {
    file: 'installations.csv',
    required: false,
    columns: [c('id', true), c('name', true), c('region', true), c('kind', true), c('fort_water'), c('commands_edges'), c('sources', true), c('notes')],
  },
  edges: {
    file: 'edges.csv',
    required: true,
    columns: [
      c('id'),
      c('from', true),
      c('to', true),
      c('type', true),
      c('line'),
      c('length_days', true),
      c('length_days_back'),
      c('capacity', true),
      c('break_of_bulk'),
      c('depth_feet'),
      c('seasonal'),
      c('sources', true),
      c('notes'),
    ],
  },
  railLines: { file: 'rail_lines.csv', required: false, columns: [c('id', true), c('name', true), c('sources', true), c('notes')] },
  depots: { file: 'depots.csv', required: false, columns: [c('id', true), c('name', true), c('region', true), c('kind', true), c('capacity', true), c('sources', true), c('notes')] },
  weatherZones: { file: 'weather_zones.csv', required: false, columns: [c('id', true), c('name', true), c('notes')] },
  // Protected census input (lane 1.7; SENSITIVE-HISTORY 3.2): read only by the derived self-emancipation term.
  census: { file: 'census.csv', required: false, columns: [c('region', true), c('enslaved_population', true), c('sources', true), c('notes')] },
  people: {
    file: 'people.csv',
    required: false,
    columns: [
      c('id', true),
      c('name', true),
      c('invented'),
      c('faction'),
      c('kind', true),
      c('born'),
      c('died'),
      c('competence'),
      c('nerve'),
      c('experience'),
      c('reputation'),
      c('boldness'),
      c('candour'),
      c('regard'),
      c('values'),
      c('regard_others'),
      c('practices'),
      c('traits'),
      c('bloc'),
      c('ranks'),
      c('service_government'), c('resigned_on'), c('resignation_side'), c('resignation_bloc'), c('resignation_cites'),
      c('sources'),
      c('notes'),
    ],
  },
} as const satisfies Record<string, TableSpec>;

/** A scenario start's tables, under `source/scenarios/<id>/`. */
export const SCENARIO_TABLES = {
  control: { file: 'control.csv', required: true, columns: [c('region', true), c('shares', true), c('notes')] },
  posts: {
    file: 'posts.csv',
    required: false,
    columns: [
      c('id', true),
      c('name', true),
      c('kind', true),
      c('department', true),
      c('parent'),
      c('region'),
      c('temporary_operation'),
      c('installation'),
      c('rail_line'),
      c('intelligence_chief'),
      c('sources', true),
      c('notes'),
    ],
  },
  holders: { file: 'holders.csv', required: false, columns: [c('post', true), c('person', true), c('acting'), c('from'), c('to'), c('sources'), c('notes')] },
  postLinks: { file: 'post_links.csv', required: false, columns: [c('post', true), c('kind', true), c('other', true), c('notes')] },
  departmentChanges: {
    file: 'department_changes.csv',
    required: false,
    columns: [c('post', true), c('on', true), c('department', true), c('parent'), c('sources', true), c('notes')],
  },
  standingOrders: {
    file: 'standing_orders.csv',
    required: false,
    columns: [c('id', true), c('post', true), c('kind', true), c('from'), c('issued_on', true), c('summary', true), c('sources', true), c('notes')],
  },
  forceBlocks: {
    file: 'force_blocks.csv',
    required: false,
    columns: [
      c('id', true),
      c('name', true),
      c('kind', true),
      c('parent'),
      c('department', true),
      c('post'),
      c('region', true),
      c('aboard'),
      c('arm', true),
      c('strength'),
      c('strength_date'),
      c('non_combatants'),
      c('stores_days'),
      c('stores_date'),
      c('sources', true),
      c('notes'),
    ],
  },
  fortification: { file: 'fortification.csv', required: false, columns: [c('region', true), c('level', true), c('notes')] },
  loyalty: { file: 'loyalty.csv', required: false, columns: [c('region', true), c('shares', true), c('notes')] },
  edgeConditions: { file: 'edge_conditions.csv', required: false, columns: [c('edge', true), c('condition', true), c('notes')] },
  obstructions: { file: 'obstructions.csv', required: false, columns: [c('edge', true), c('by'), c('sources', true), c('notes')] },
  depotConditions: { file: 'depot_conditions.csv', required: false, columns: [c('depot', true), c('condition', true), c('notes')] },
  /** Each land region's civil government on the start date (0058): a department, or unknown with the reason in notes. */
  governments: { file: 'governments.csv', required: true, columns: [c('region', true), c('department', true), c('sources', true), c('notes')] },
} as const satisfies Record<string, TableSpec>;
