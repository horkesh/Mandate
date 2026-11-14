// ONE-TIME CONVERSION RECORD. DO NOT RE-RUN OVER THE PACK.
//
// This importer converted the three Union 1861 drafts into world format v2 (lane 0.3).
// It is kept as the record of how that conversion was made, not as a build step.
// From the merge on, the pack's source CSVs (packs/union-1861/source/world and
// source/scenarios/march_1861), PROVENANCE.json, pack.json and strings/en.json are the
// source of truth, edited by hand and checked by `npm run pack:validate`. Re-running
// this file overwrites every hand edit made since. It refuses to run unless
// UNION1861_REPRODUCE_IMPORT=1 is set, which is for reproducing the conversion in a
// scratch copy only.
//
//   UNION1861_REPRODUCE_IMPORT=1 npx tsx packs/union-1861/source/import/import-drafts.mjs
//
// Reads packs/union-1861/source/drafts/{map,oob,people} and writes the v2 source
// tables (source/world, source/scenarios/march_1861), PROVENANCE.json, pack.json
// and strings/en.json.
//
// No fact comes from outside the drafts and docs/research (decision 0033). Every
// judgement the importer makes (a rule, a mapping, a design parameter) is in
// this file or vocab.mjs and is listed in notes/lane-0.3-union-data.md.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

if (process.env.UNION1861_REPRODUCE_IMPORT !== '1') {
  throw new Error('This importer is a one-time conversion record: the pack source CSVs are now the source of truth and re-running it overwrites hand edits. Set UNION1861_REPRODUCE_IMPORT=1 only to reproduce the conversion in a scratch copy.');
}

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..', '..');
const pack = join(repo, 'packs', 'union-1861');
const drafts = join(pack, 'source', 'drafts');
const { parseCsv, writeCsv } = await import(pathToFileURL(join(repo, 'packages/pack-format/src/csv.ts')).href);
const { splitOutsideParens } = await import(pathToFileURL(join(repo, 'packages/pack-format/src/cells.ts')).href);
const { makeCitations, citeText } = await import('./registry.mjs');
const V = await import('./vocab.mjs');
const { makeResolver } = await import('./places.mjs');

const START = '1861-03-05';
const SCENARIO = 'march_1861';
const cites = makeCitations(repo);
const report = []; // lines for the hand-over note's tallies
const say = (s) => report.push(s);

// ---- helpers -----------------------------------------------------------------
const readCsv = (p) => parseCsv(readFileSync(join(drafts, p), 'utf8'));
function rows(p) {
  const t = readCsv(p);
  return t.rows.map((r, i) => ({ line: r.line, get: (c) => { const k = t.header.indexOf(c); if (k < 0) throw new Error(`${p}: no column ${c}`); return r.cells[k]; } }));
}
const write = (rel, header, data) => {
  const file = join(pack, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, writeCsv(header, data));
};
const writeJson = (rel, value) => {
  const file = join(pack, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const slug = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const pointerKey = (k) => k.startsWith('NOTE-');

/** Canonicalise a draft `sources` cell. Returns the cell text; pointers never stand alone. */
function convertSources(cell, fallback, extra = []) {
  const out = [];
  for (const tok of splitOutsideParens(cell, ';')) {
    const c = cites.canon(tok);
    if (c.key) out.push(c);
    else if (c.unknown) say(`UNRESOLVED source token: ${c.unknown}`);
  }
  // A primary source a research note itself cites (lead ruling S3: pointers are never enough alone).
  for (const e of extra) out.push(cites.canon(e));
  if (!out.some((c) => !pointerKey(c.key))) {
    // Nothing admissible: the record says so in its data (the place of the citation reads needs-source).
    const f = cites.canon(`${fallback} needs-source (primary source not reached)`);
    out.push(f);
    stats.fallbackCites[fallback] = (stats.fallbackCites[fallback] ?? 0) + 1;
  }
  const seen = new Set();
  return out.filter((c) => { const k = citeText(c); if (seen.has(k)) return false; seen.add(k); return true; }).map(citeText).join('; ');
}
const stats = { fallbackCites: {} };
const keep = (v) => (v === undefined ? '' : v);

// ---- 1. regions ---------------------------------------------------------------
const regionRows = rows('map/regions.csv');
const ROLE = {
  pacific_coast: 'distant_theatre', panama: 'distant_theatre', britain_canada: 'foreign_power', france_mexico: 'foreign_power',
  nassau: 'blockade_port', bermuda: 'blockade_port', havana: 'blockade_port', matamoros: 'blockade_port', mediterranean: 'distant_theatre',
  north_atlantic: 'raider_zone', south_atlantic: 'raider_zone', eastern_seas: 'raider_zone',
};
const regions = [];
for (const r of regionRows) {
  const id = r.get('id');
  const notes = r.get('notes');
  const ref = /\[ref point (-?\d+\.\d+),\s*(-?\d+\.\d+)/.exec(notes);
  const kind = r.get('kind');
  const flags = r.get('key_point_flags').split(';').map((s) => s.trim()).filter(Boolean);
  regions.push({
    id, name: r.get('name'), kind, terrain: r.get('terrain'), draftFlags: flags,
    flags: flags.filter((f) => ['capital', 'port', 'rail_junction', 'river_junction'].includes(f)),
    role: kind === 'off_map' ? (ROLE[id] ?? '') : '',
    refPoint: ref ? `${ref[1]} ${ref[2]}` : '',
    counties: r.get('counties_1861').split(';').map((s) => s.trim()).filter(Boolean),
    fortMode: r.get('fort_mode'), notes,
    sources: convertSources(r.get('sources'), 'MAP-LANE'),
  });
}
// The Mediterranean box (lead ruling after review: the draft has no box for the Mediterranean squadron). Added by this lane.
regions.push({
  id: 'mediterranean', name: 'Mediterranean Sea', kind: 'off_map', terrain: '', draftFlags: [], flags: [], role: ROLE.mediterranean, refPoint: '', counties: [], fortMode: '',
  notes: "Box added by lane 0.3 for the Mediterranean squadron (no such box in the map draft). No reference point: it is a notional box like the draft's other off-map boxes.",
  sources: convertSources('LANE-0.3 off-map box added after review', 'LANE-0.3'),
});
say(`regions: ${regions.length}; off-map boxes without a role: ${regions.filter((r) => r.kind === 'off_map' && r.role === '').map((r) => r.id).join(', ') || 'none'}`);
write('source/world/regions.csv',
  ['id', 'name', 'kind', 'terrain', 'flags', 'off_map_role', 'weather_zone', 'ref_point', 'counties', 'label_anchor', 'label_spine', 'label_size', 'label_min_zoom', 'sources', 'notes'],
  regions.map((r) => [r.id, r.name, r.kind, r.terrain, r.flags.join(';'), r.role, '', r.refPoint, r.counties.join(';'), '', '', '', '', r.sources, r.notes]));

// ---- 2. installations ----------------------------------------------------------
// One record per thing a post can hold, named from the draft's region notes or
// post names. [id, name, region, kind, water mode ('' = take the draft's fort_mode), note]
const I = (id, name, region, kind, note = '') => ({ id, name, region, kind, note });
const INSTALLATIONS = [
  I('washington_navy_yard', 'Washington Navy Yard', 'washington', 'navy_yard'),
  I('washington_arsenal', 'Washington Arsenal', 'washington', 'arsenal'),
  I('richmond_armory', 'Richmond state armory', 'richmond', 'arsenal', 'Tredegar works and the state armory (region notes)'),
  I('fort_monroe', 'Fort Monroe', 'fort_monroe', 'fort'),
  I('fort_monroe_naval_base', 'Fort Monroe naval base', 'fort_monroe', 'naval_base', 'the draft flags naval_base; no name in its notes'),
  I('gosport_navy_yard', 'Gosport Navy Yard', 'norfolk', 'navy_yard'),
  I('harpers_ferry_armory', 'Harpers Ferry Armory and Arsenal', 'harpers_ferry', 'arsenal'),
  I('fort_delaware', 'Fort Delaware', 'delaware', 'fort', 'Pea Patch Island'),
  I('fort_mchenry', 'Fort McHenry', 'baltimore', 'fort'),
  I('fort_washington', 'Fort Washington', 'southern_maryland', 'fort'),
  I('philadelphia_navy_yard', 'Philadelphia Navy Yard', 'philadelphia', 'navy_yard'),
  I('frankford_arsenal', 'Frankford Arsenal', 'philadelphia', 'arsenal'),
  I('schuylkill_arsenal', 'Schuylkill Arsenal', 'philadelphia', 'arsenal'),
  I('allegheny_arsenal', 'Allegheny Arsenal', 'pittsburgh', 'arsenal'),
  I('brooklyn_navy_yard', 'Brooklyn Navy Yard', 'new_york', 'navy_yard'),
  I('watervliet_arsenal', 'Watervliet Arsenal', 'new_york', 'arsenal'),
  I('sackets_harbor_navy_yard', "Sackets Harbor navy yard", 'new_york', 'navy_yard', 'from the oob draft post us_navy_yard_sacketts_harbor; not a flag in the map draft'),
  I('charlestown_navy_yard', 'Charlestown (Boston) Navy Yard', 'new_england', 'navy_yard'),
  I('portsmouth_navy_yard', 'Portsmouth (Kittery) Navy Yard', 'new_england', 'navy_yard'),
  I('springfield_armory', 'Springfield Armory', 'new_england', 'arsenal'),
  I('fort_macon', 'Fort Macon', 'new_bern', 'fort'),
  I('forts_caswell_johnston', 'Forts Caswell and Johnston', 'wilmington', 'fort'),
  I('fayetteville_arsenal', 'Fayetteville Arsenal', 'cape_fear', 'arsenal'),
  I('fort_sumter', 'Fort Sumter', 'fort_sumter', 'fort'),
  I('charleston_harbour_forts', 'Charleston harbour forts (Moultrie, Johnson, Castle Pinckney)', 'charleston', 'fort'),
  I('charleston_arsenal', 'Charleston Arsenal', 'charleston', 'arsenal'),
  I('fort_pulaski', 'Fort Pulaski', 'savannah', 'fort'),
  I('augusta_arsenal', 'Augusta Arsenal', 'augusta', 'arsenal'),
  I('pensacola_navy_yard', 'Pensacola Navy Yard (Warrington)', 'pensacola', 'navy_yard'),
  I('forts_barrancas_mcree', 'Forts Barrancas and McRee', 'pensacola', 'fort'),
  I('fort_pickens', 'Fort Pickens', 'fort_pickens', 'fort'),
  I('forts_clinch_marion', 'Fort Clinch and Fort Marion', 'northeast_florida', 'fort'),
  I('fort_taylor', 'Fort Taylor', 'key_west', 'fort'),
  I('fort_jefferson', 'Fort Jefferson', 'key_west', 'fort', 'Garden Key, Dry Tortugas'),
  I('key_west_naval_base', 'Key West naval base', 'key_west', 'naval_base'),
  I('forts_morgan_gaines', 'Forts Morgan and Gaines', 'mobile', 'fort'),
  I('mount_vernon_arsenal', 'Mount Vernon Arsenal', 'mobile', 'arsenal'),
  I('vicksburg_battery', 'Vicksburg battery', 'vicksburg', 'fort', 'whether guns stood there in March 1861 is unconfirmed (region notes)'),
  I('ship_island_fort', 'Ship Island fort', 'ship_island', 'fort', 'unfinished fort, seized 20 January 1861'),
  I('ship_island_naval_base', 'Ship Island naval base', 'ship_island', 'naval_base', 'the draft flags naval_base ("later the Union\'s staging base")'),
  I('forts_pike_macomb', 'Forts Pike and Macomb', 'new_orleans', 'fort'),
  I('forts_jackson_st_philip', 'Forts Jackson and St. Philip', 'forts_jackson_st_philip', 'fort'),
  I('baton_rouge_arsenal', 'Baton Rouge Arsenal', 'baton_rouge', 'arsenal'),
  I('island_no_10_works', 'Island No. 10 works', 'island_no_10', 'fort', 'fortified later in 1861 (region notes)'),
  I('fort_henry', 'Fort Henry', 'fort_henry', 'fort', 'built later in 1861 (region notes)'),
  I('fort_donelson', 'Fort Donelson', 'fort_donelson', 'fort'),
  I('cumberland_gap_works', 'Cumberland Gap works', 'cumberland_gap', 'fort', 'the draft flags fort; no name in its notes'),
  I('columbus_ky_works', 'Columbus works', 'columbus_ky', 'fort', 'seized and fortified by Polk in September 1861 (region notes)'),
  I('cairo_naval_base', 'Cairo naval base', 'cairo', 'naval_base'),
  I('st_louis_arsenal', 'St. Louis Arsenal', 'st_louis', 'arsenal'),
  I('new_madrid_works', 'New Madrid works', 'new_madrid', 'fort', 'fortified with Island No. 10 in 1861-62 (region notes)'),
  I('liberty_arsenal', 'Liberty Arsenal', 'mo_northwest', 'arsenal'),
  I('little_rock_arsenal', 'Little Rock Arsenal', 'little_rock', 'arsenal'),
  I('fort_smith', 'Fort Smith', 'ar_northwest', 'fort'),
  I('san_antonio_arsenal', 'San Antonio Arsenal', 'tx_san_antonio_austin', 'arsenal'),
  I('fort_brown', 'Fort Brown', 'brownsville', 'fort'),
  I('west_texas_frontier_forts', 'West Texas frontier forts', 'tx_west', 'fort'),
  I('fort_leavenworth', 'Fort Leavenworth', 'kansas_east', 'fort'),
  I('fort_leavenworth_arsenal', 'Fort Leavenworth Arsenal', 'kansas_east', 'arsenal'),
  I('fort_snelling', 'Fort Snelling', 'minnesota', 'fort'),
  I('forts_union_craig', 'Fort Union and Fort Craig', 'new_mexico', 'fort'),
  I('fort_fillmore', 'Fort Fillmore', 'arizona', 'fort'),
  I('fort_gibson', 'Fort Gibson', 'it_cherokee_creek', 'fort'),
  I('forts_washita_arbuckle_cobb', 'Forts Washita, Arbuckle and Cobb', 'it_choctaw_chickasaw', 'fort'),
  I('mare_island_navy_yard', 'Mare Island Navy Yard', 'pacific_coast', 'navy_yard'),
];
const regionById = new Map(regions.map((r) => [r.id, r]));
// Check every draft flag has an installation, except the named exceptions.
const SKIPPED_FLAGS = {
  'lowcountry:naval_base': 'Port Royal became a Union base in November 1861; a naval base must sit in a key point (0050) and lowcountry is a land region',
  'britain_canada:naval_base': 'a foreign naval station, not an installation either side can command',
};
for (const r of regions) {
  for (const f of r.draftFlags.filter((x) => ['fort', 'naval_base', 'navy_yard', 'arsenal'].includes(x))) {
    if (SKIPPED_FLAGS[`${r.id}:${f}`]) continue;
    if (!INSTALLATIONS.some((i) => i.region === r.id && i.kind === f)) say(`FLAG WITHOUT INSTALLATION: ${r.id} ${f}`);
  }
}
for (const i of INSTALLATIONS) {
  if (!regionById.has(i.region)) say(`INSTALLATION IN UNKNOWN REGION: ${i.id} ${i.region}`);
}
say(`flags not turned into installations: ${Object.entries(SKIPPED_FLAGS).map(([k, v]) => `${k} (${v})`).join('; ')}`);
say(`region fort_mode with no fort flag (no installation made): ${regions.filter((r) => r.fortMode && !r.draftFlags.includes('fort')).map((r) => `${r.id}=${r.fortMode}`).join(', ') || 'none'}`);

// ---- 3. edges, rail lines, obstructions ----------------------------------------
const edgeRows = rows('map/edges.csv');
const SEASONS = {
  mud: 'mud', none: '', '': '',
  'Aug–Oct (low water; to confirm)': 'low_water:8-10',
  'Aug–Oct (navigable about nine months a year)': 'low_water:8-10',
  'Jul–Nov for large boats': 'low_water:7-11',
  'Jul–Nov for seagoing ships (falling river)': 'low_water:7-11',
  'Jul–Nov low water, Dec–Feb ice (to confirm)': 'low_water:7-11;ice:12-2',
  'Aug–Nov low water, Dec–Mar ice (to confirm)': 'low_water:8-11;ice:12-3',
  'Aug–Nov low water over the Des Moines Rapids, Dec–Mar ice (to confirm)': 'low_water:8-11;ice:12-3',
  'Dec–Feb (ice; to confirm)': 'ice:12-2',
  'Dec–Feb (ice in hard winters; to confirm)': 'ice:12-2',
  'Jul–Oct (the Red is navigable about eight months a year to Shreveport)': 'low_water:7-10',
  'Jul–Oct above the Alexandria falls (the Red is navigable about eight months a year to Shreveport)': 'low_water:7-10',
  // "High water only": the complement is the closed season (inferred, and said so in the row's notes).
  'Jun–Dec (small boats only, in high water)': 'low_water:1-5',
  'Jul–Dec (high water only; to confirm)': 'low_water:1-6',
};
// Seasonal texts the draft gives with no months, or none at all: no window is written.
const NO_MONTHS = new Set([
  'Falls of the Ohio passable only at high water; otherwise by the Louisville and Portland Canal',
  'none to the Black River; Batesville most of the year',
  'none (the bars at the passes limit draught all year; depth to source)',
  'All year except the highest stages of water',
]);
const INFERRED = new Set(['Jun–Dec (small boats only, in high water)', 'Jul–Dec (high water only; to confirm)']);

/** Rail line name from a CEN1860-RR item: drop a trailing branch, unify commas. */
function lineName(item) {
  return item
    .replace(/,\s*[A-Za-z ]+ branch$/i, '')
    .replace(/, of Georgia/, ' of Georgia')
    .replace(/,\s+and\s+/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim();
}
// Rail edges whose draft sources name no census line: the line is the first one the notes name.
const MANUAL_LINE = {
  'philadelphia>new_jersey': 'Camden and Amboy',
  'new_jersey>new_york': 'New Jersey Railroad',
  'new_york>new_england': 'New York and New Haven',
  'pennsylvania_north>new_york': 'New York and Erie',
  'montgomery>al_wiregrass': 'Alabama and Florida',
  'indiana_north>indiana_south': 'Jeffersonville, Madison and Indianapolis',
  'indiana_north>illinois_north': 'Lines from Indiana into Chicago (composite; the draft names no line)',
  'illinois_north>michigan_wisconsin': 'Lines from Chicago into Wisconsin and round the lake (composite; the draft names no line)',
  'ohio_north>michigan_wisconsin': 'Michigan Southern',
  'illinois_north>iowa': 'Chicago and Rock Island',
  'illinois_north>mo_northeast': 'Quincy and Palmyra',
  'britain_canada>new_england': 'Grand Trunk',
  'britain_canada>michigan_wisconsin': 'Great Western of Canada',
  'mo_east_central>rolla': 'Pacific',
  'houston>tx_southeast': 'Texas and New Orleans',
};
// "Ferry" capitalised mid-sentence is a place (Edwards Ferry), so only the lower-case word, or one starting a sentence, counts.
const BULK = /(?:^|[.;]\s*)Ferry\b|\bferr(?:y|ied)\b|horse[- ]car|break of gauge|no bridge|no through track|changed stations/;
const lines = new Map(); // id -> { name, composite }
const edges = [];
const multiLine = [];
for (const r of edgeRows) {
  const from = r.get('from'), to = r.get('to'), type = r.get('type');
  const srcCell = r.get('sources');
  const notes = r.get('notes');
  let line = '';
  if (type === 'rail') {
    let names = [];
    for (const s of splitOutsideParens(srcCell, ';')) {
      const m = /^CEN1860-RR\s*\((.*)\)$/s.exec(s.trim());
      if (m) names = names.concat(splitOutsideParens(m[1], ';').map(lineName));
    }
    const manual = MANUAL_LINE[`${from}>${to}`];
    const name = names[0] ?? manual;
    if (!name) say(`RAIL EDGE WITHOUT A LINE: ${from}>${to}`);
    else {
      line = slug(name);
      if (!lines.has(line)) lines.set(line, { name, composite: /composite/.test(name), manual: names.length === 0 });
      if (names.length > 1) multiLine.push(`${from}>${to}: ${names.join(' / ')}`);
    }
  }
  const sRaw = r.get('seasonal');
  let seasonal = type === 'road' ? (sRaw === 'mud' ? 'mud' : '') : (SEASONS[sRaw] ?? '');
  if (type === 'road' && sRaw !== 'mud' && sRaw !== 'none') say(`ROAD SEASONAL ODD: ${from}>${to}: ${sRaw}`);
  if ((type === 'river' || type === 'sea') && !(sRaw in SEASONS) && !NO_MONTHS.has(sRaw)) say(`UNMAPPED SEASONAL (${type}) ${from}>${to}: ${sRaw}`);
  const extra = [];
  if (type !== 'road' && sRaw !== '' && sRaw !== 'none' && sRaw !== 'mud') extra.push(`[seasonal: ${sRaw}${INFERRED.has(sRaw) ? ' - closed season inferred as the complement' : ''}]`);
  if (type === 'river' && sRaw === '') extra.push('[seasonal: needs-source]');
  const bulk = BULK.test(notes) && !/(ferry|gauge)[^.]{0,60}to confirm|gauge\?/i.test(notes);
  edges.push({
    from, to, type, line, length: r.get('length_days'), capacity: r.get('capacity'), bulk, seasonal,
    sources: convertSources(srcCell, 'MAP-LANE'), notes: [notes, ...extra].join(' '), obstruction: r.get('obstruction_1861'),
  });
}
// The Mediterranean box's one leg: a DESIGN PARAMETER, 15 days at capacity 5, equal to the draft's transatlantic legs from north_atlantic (to britain_canada and france_mexico). No source gives the route.
edges.push({
  from: 'mediterranean', to: 'north_atlantic', type: 'sea', line: '', length: '15', capacity: '5', bulk: false, seasonal: '',
  sources: convertSources('LANE-0.3 off-map leg added after review', 'LANE-0.3'),
  notes: "Leg added by lane 0.3: a design parameter equal to the draft's transatlantic legs (15 days, capacity 5); no source gives the route to the Mediterranean.", obstruction: '',
});
say(`edges: ${edges.length}; rail lines: ${lines.size}; rail edges that name more than one line (first line used): ${multiLine.length}`);
const ldef = [...lines].sort(([a], [b]) => cmp(a, b));
write('source/world/rail_lines.csv', ['id', 'name', 'sources', 'notes'],
  ldef.map(([id, l]) => [id, l.name, l.manual ? convertSources('', 'MAP-LANE') : convertSources(`CEN1860-RR (${l.name})`, 'MAP-LANE'), l.composite ? 'composite: the draft names no single line' : '']));

// Water-edge helper for forts and obstructions.
const waterEdgeIds = (regionId) => edges.filter((e) => (e.type === 'river' || e.type === 'sea') && (e.from === regionId || e.to === regionId))
  .map((e) => { const [a, b] = e.from < e.to ? [e.from, e.to] : [e.to, e.from]; return `${e.type}:${a}:${b}`; });
const edgeId = (e) => { const [a, b] = e.from < e.to ? [e.from, e.to] : [e.to, e.from]; return e.line ? `${e.type}:${a}:${b}:${e.line}` : `${e.type}:${a}:${b}`; };
write('source/world/edges.csv',
  ['id', 'from', 'to', 'type', 'line', 'length_days', 'length_days_back', 'capacity', 'break_of_bulk', 'depth_feet', 'seasonal', 'sources', 'notes'],
  edges.map((e) => ['', e.from, e.to, e.type, e.line, e.length, '', e.capacity, e.bulk ? 'yes' : '', '', e.seasonal, e.sources, e.notes]));

// installations.csv (needs edge ids for the water forts)
const instRows = INSTALLATIONS.map((i) => {
  const reg = regionById.get(i.region);
  const water = i.kind === 'fort' && reg.fortMode ? reg.fortMode : '';
  const commands = water ? waterEdgeIds(i.region).sort(cmp).join(';') : '';
  // A region's fort_mode applies to the forts in it; where a region has two forts the mode is shared.
  return [i.id, i.name, i.region, i.kind, water, commands, convertSources(reg.sources.split('; ').filter((s) => !s.startsWith('NOTE-')).join('; '), 'MAP-LANE'), i.note];
});
write('source/world/installations.csv', ['id', 'name', 'region', 'kind', 'fort_water', 'commands_edges', 'sources', 'notes'], instRows);

// Supply sources and depots (decision 0055, lead ruling; the draft has none, so without them every traced region is a pocket on day 1).
// Every capacity and every choice of region below is a DESIGN PARAMETER of this lane (cited LANE-0.3), not a sourced figure.
// Sources: coarse northern regions for the Union; for the Confederacy its capital and the arsenals its states held on 5 March.
// Depots: the navy yards and the Washington Arsenal, which the drafts and the installation list name.
const DESIGN = (what) => `LANE-0.3 ${what}`;
const SOURCES_UNION = [
  ['new_england', 'New England', 4], ['new_york', 'New York', 5], ['new_jersey', 'New Jersey', 3], ['pennsylvania_north', 'Northern Pennsylvania', 4],
  ['ohio_north', 'Northern Ohio', 4], ['indiana_north', 'Northern Indiana', 3], ['illinois_north', 'Northern Illinois', 4], ['michigan_wisconsin', 'Michigan and Wisconsin', 3],
];
const SOURCES_CONFEDERATE = [
  ['montgomery', 'Montgomery (Confederate capital)', 4, ''],
  ['baton_rouge', 'Baton Rouge Arsenal', 3, 'baton_rouge_arsenal'], ['mobile', 'Mount Vernon Arsenal', 3, 'mount_vernon_arsenal'],
  ['augusta', 'Augusta Arsenal', 3, 'augusta_arsenal'], ['charleston', 'Charleston Arsenal', 3, 'charleston_arsenal'],
  ['tx_san_antonio_austin', 'San Antonio Arsenal', 3, 'san_antonio_arsenal'],
];
const DEPOT_INSTALLATIONS = [
  'washington_navy_yard', 'washington_arsenal', 'gosport_navy_yard', 'philadelphia_navy_yard', 'brooklyn_navy_yard', 'charlestown_navy_yard',
  'portsmouth_navy_yard', 'sackets_harbor_navy_yard', 'mare_island_navy_yard', 'pensacola_navy_yard',
];
const instSources = (id) => instRows.find((r) => r[0] === id)[6];
const depotRows = [];
for (const [region, name, cap] of SOURCES_UNION) {
  depotRows.push([`source_${region}`, `${name} (Union supply source)`, region, 'source', String(cap), convertSources(DESIGN('Union supply source: the region and its capacity are design parameters standing for the North\'s railways and industry'), 'LANE-0.3'),
    'Design parameter (decision 0055): a Union source in a coarse northern region; capacity chosen by lane 0.3, not sourced.']);
}
for (const [region, name, cap, inst] of SOURCES_CONFEDERATE) {
  const srcCell = inst ? `${instSources(inst)}; ${DESIGN('Confederate supply source: capacity is a design parameter')}` : DESIGN('Confederate supply source at the capital: capacity is a design parameter');
  depotRows.push([`source_${region}`, `${name} (Confederate supply source)`, region, 'source', String(cap), convertSources(srcCell, 'LANE-0.3'),
    inst ? 'Design parameter (decision 0055): a Confederate source at an arsenal in a region the seceded state held on 5 March (control row); capacity chosen by lane 0.3, not sourced.'
      : 'Design parameter (decision 0055): a Confederate source at the capital; capacity chosen by lane 0.3, not sourced.']);
}
for (const id of DEPOT_INSTALLATIONS) {
  const inst = INSTALLATIONS.find((i) => i.id === id);
  depotRows.push([`depot_${id}`, `${inst.name} depot`, inst.region, 'depot', '3', convertSources(`${instSources(id)}; ${DESIGN('depot capacity is a design parameter')}`, 'LANE-0.3'),
    'Design parameter (decision 0055): a forward depot at an installation the drafts name (navy yard or arsenal); capacity chosen by lane 0.3, not sourced.']);
}
write('source/world/depots.csv', ['id', 'name', 'region', 'kind', 'capacity', 'sources', 'notes'], depotRows);
say(`depots.csv: ${depotRows.length} rows (${depotRows.filter((r) => r[3] === 'source').length} sources)`);

// Obstructions (scenario): which installation obstructs which water edge at the start.
const OBS_BY = {
  'pensacola_coast>mobile_bay': 'forts_morgan_gaines',
  'mobile_bay>mississippi_sound': 'forts_morgan_gaines',
  'charleston>charleston_bar': 'charleston_harbour_forts',
  'fort_sumter>charleston_bar': 'charleston_harbour_forts',
  'fort_sumter>charleston': 'charleston_harbour_forts',
  'savannah>sea_islands_coast': 'fort_pulaski',
  'northeast_florida>georgia_bight': 'forts_clinch_marion',
  'northeast_florida>florida_east_coast': 'forts_clinch_marion',
  'pensacola>pensacola_coast': 'forts_barrancas_mcree',
  'fort_pickens>pensacola': 'forts_barrancas_mcree',
  'new_orleans>mississippi_sound': 'forts_pike_macomb',
  'mississippi_lower>mississippi_passes': 'forts_jackson_st_philip',
};
const obstructions = [];
for (const e of edges) {
  const o = e.obstruction;
  if (o === '' || o.startsWith('none')) continue;
  const key = `${e.from}>${e.to}`;
  const by = OBS_BY[key];
  if (!by) {
    say(`obstruction not entered (${key}): ${o.slice(0, 100)}`);
    continue;
  }
  if (/^Fort Caswell and Fort Johnston: federal and unmanned/.test(o)) { say(`obstruction not entered (${key}): federal and unmanned in March 1861`); continue; }
  obstructions.push([edgeId(e), by, e.sources, o]);
}
say(`obstructions entered: ${obstructions.length}`);
write(`source/scenarios/${SCENARIO}/obstructions.csv`, ['edge', 'by', 'sources', 'notes'], obstructions);

export { START, SCENARIO, cites, report, say, rows, write, writeJson, regions, regionById, convertSources, stats, cmp, slug, pack, drafts, repo, V, makeResolver, keep, INSTALLATIONS, pointerKey, readCsv };
