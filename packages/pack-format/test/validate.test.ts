import { describe, expect, it } from 'vitest';
import { errorsOf, formatGenerated, formatIssue, generatePack, type Issue, type PackData, validatePack } from '../src/index.ts';
import { appendRow, filesOf, fixture, type FileMap, replaceOnce, withFile, withNewFile, withoutFile } from './support/fixture.ts';

const run = (files: FileMap) => generatePack(filesOf(files));
/** Two temporary posts of a red expedition, with the given links and, optionally, a second operation or a shared department. */
const joint = (links: string, secondOperation = 'raid', secondDepartment = 'r_sea') =>
  withNewFile(
    `${S}/post_links.csv`,
    `post,kind,other,notes\n${links}`,
    withFile(`${S}/posts.csv`, appendRow(`red_raid_a,Raid troops,expedition,r_war,red_top,beta,raid,,,DESIGN,\nred_raid_b,Raid ships,expedition,${secondDepartment},red_top,beta,${secondOperation},,,DESIGN,`)),
  );
/** A neutral government (review F6): a department with no faction, its governor, and its guard in beta. */
const neutral = (post = 'grey_top,Grey Governor,chief,g_gov,,beta,,,,DESIGN,', block = 'grey_guard,Grey Guard,block,,g_gov,grey_top,beta,,foot,800,1900-04,,20,DESIGN,') => {
  let files = withFile(`${W}/departments.csv`, appendRow('g_gov,Grey Government,,ministry,DESIGN,'));
  files = withFile(`${W}/people.csv`, appendRow('grey_chief,Grey Chief,,,officer,1805,1875,average:DESIGN,average:DESIGN,average:DESIGN,average:DESIGN,,,,DESIGN,'), files);
  files = withFile(`${S}/posts.csv`, appendRow(post), files);
  files = withFile(`${S}/holders.csv`, appendRow('grey_top,grey_chief,no,,,DESIGN,'), files);
  return withFile(`${S}/force_blocks.csv`, appendRow(block), files);
};
/** An invented officer whose centres and trait cite nothing; his record cites the design. */
const INVENTED = 'pool_officer,Pool Officer,yes,red,officer,1830,1890,above,average,low,low,bold,,,DESIGN,';
const allowInvented = () =>
  withFile('pack.json', (t) => JSON.stringify({ ...(JSON.parse(t) as object), allowsInventedPeople: true }));
/** A copy of the fixture with one JSON file edited as an object. */
const editJson = <T,>(path: string, change: (value: T) => unknown) =>
  withFile(path, (t) => {
    const value = JSON.parse(t) as T;
    change(value);
    return JSON.stringify(value);
  });
const renamed = (from: string, to: string) => {
  const base = fixture();
  return withNewFile(to, base.get(from)!, withoutFile(from, base));
};
const kinds = (issues: readonly Issue[]) => [...new Set(issues.map((i) => `${i.severity} ${i.kind}`))].sort();

describe('the fixture pack', () => {
  it('generates with no errors, and only the expected warning', () => {
    const result = run(fixture());
    expect(errorsOf(result.issues).map(formatIssue)).toEqual([]);
    expect(result.issues.map(formatIssue)).toEqual([
      'warning [unknown-value] source/world/people.csv (row 2 (red_chief), column experience): the experience centre is unknown.',
      'warning [unknown-value] source/scenarios/start/force_blocks.csv (row 5 (blue_1), column strength): "strength" is unknown (needs a source).',
    ]);
    expect(result.outputs.size).toBeGreaterThan(0);
  });
});

/**
 * Positive controls: each case breaks the valid fixture in one way and names
 * the check that must catch it, with the file it must point at. A check that
 * stopped firing fails its case.
 */
const W = 'source/world';
const S = 'source/scenarios/start';
const cases: { name: string; files: () => FileMap; kind: string; file: string; severity?: 'error' | 'warning' }[] = [
  // Files, CSV and cells
  { name: 'a header wider than its rows', files: () => withFile(`${W}/rail_lines.csv`, replaceOnce('id,name,sources,notes', 'id,name,sources,notes,colour')), kind: 'csv-syntax', file: `${W}/rail_lines.csv` },
  { name: 'a JSON file that does not parse', files: () => withFile('pack.json', (t) => t.slice(0, -2)), kind: 'json-syntax', file: 'pack.json' },
  { name: 'a required table that is missing', files: () => withoutFile(`${W}/edges.csv`), kind: 'missing-file', file: `${W}/edges.csv` },
  { name: 'a misnamed optional scenario table (review F3)', files: () => renamed(`${S}/force_blocks.csv`, `${S}/force_block.csv`), kind: 'unknown-table', file: `${S}/force_block.csv` },
  { name: 'a misnamed optional world table', files: () => renamed(`${W}/installations.csv`, `${W}/installation.csv`), kind: 'unknown-table', file: `${W}/installation.csv` },
  { name: 'an extra file among the world tables', files: () => withNewFile(`${W}/roads_extra.csv`, 'id\n'), kind: 'unknown-table', file: `${W}/roads_extra.csv` },
  { name: 'a folder among the world tables', files: () => withNewFile(`${W}/old/regions.csv`, 'id\n'), kind: 'unknown-table', file: `${W}/old` },
  { name: 'a table outside any scenario folder', files: () => withNewFile('source/scenarios/control.csv', 'region,shares\n'), kind: 'unknown-table', file: 'source/scenarios/control.csv' },
  { name: 'a column named twice', files: () => withFile(`${W}/rail_lines.csv`, () => 'id,name,sources,sources\nmain_line,Main Line,DESIGN,DESIGN'), kind: 'duplicate-column', file: `${W}/rail_lines.csv` },
  { name: 'an unknown column (well-formed rows)', files: () => withFile(`${W}/depots.csv`, (t) => t.replace('notes', 'notes,colour').replace(/DESIGN,$/m, 'DESIGN,,red')), kind: 'unknown-column', file: `${W}/depots.csv` },
  { name: 'a missing required column', files: () => withFile(`${W}/rail_lines.csv`, () => 'id,name,notes\nmain_line,Main Line,'), kind: 'missing-column', file: `${W}/rail_lines.csv` },
  { name: 'an unclosed quote', files: () => withFile(`${W}/rail_lines.csv`, appendRow('x,"open,DESIGN,')), kind: 'csv-syntax', file: `${W}/rail_lines.csv` },
  { name: 'a bad number', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,beta,road,,2,', ',alpha,beta,road,,two,')), kind: 'bad-cell', file: `${W}/edges.csv` },
  { name: 'a bad season entry', files: () => withFile(`${W}/edges.csv`, replaceOnce('6,low_water,', '6,low water in autumn,')), kind: 'bad-cell', file: `${W}/edges.csv` },
  { name: 'an unknown marker where none is allowed', files: () => withFile(`${W}/depots.csv`, replaceOnce(',alpha,source,', ',unknown,source,')), kind: 'unknown-not-allowed', file: `${W}/depots.csv` },
  { name: 'a bad enum value (shape)', files: () => withFile(`${W}/regions.csv`, replaceOnce('beta,Beta,land,', 'beta,Beta,meadow,')), kind: 'shape/invalid_value', file: `${W}/regions.csv` },
  { name: 'a bad date (shape)', files: () => withFile(`${S}/scenario.json`, replaceOnce('1900-05-01', '1900-02-30')), kind: 'shape/custom', file: `${S}/scenario.json` },
  // ids and references
  { name: 'a duplicate id', files: () => withFile(`${W}/depots.csv`, appendRow('alpha_stores,Again,beta,depot,2,DESIGN,')), kind: 'duplicate-id', file: `${W}/depots.csv` },
  { name: 'an unknown region', files: () => withFile(`${W}/depots.csv`, replaceOnce(',alpha,source,', ',gamma,source,')), kind: 'unknown-reference', file: `${W}/depots.csv` },
  { name: 'an unknown vocabulary term', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce(',red_army,beta,,foot,', ',red_army,beta,,horse,')), kind: 'unknown-term', file: `${S}/force_blocks.csv` },
  // provenance and licences
  { name: 'an unknown source', files: () => withFile(`${W}/rail_lines.csv`, replaceOnce('Main Line,DESIGN', 'Main Line,WIKI p.2')), kind: 'unknown-source', file: `${W}/rail_lines.csv` },
  { name: 'a record citing only pointers', files: () => withFile(`${W}/rail_lines.csv`, replaceOnce('Main Line,DESIGN', 'Main Line,NOTE-x')), kind: 'pointer-only', file: `${W}/rail_lines.csv` },
  { name: 'no citation at all (shape)', files: () => withFile(`${W}/rail_lines.csv`, replaceOnce('Main Line,DESIGN', 'Main Line,')), kind: 'shape/too_small', file: `${W}/rail_lines.csv` },
  { name: 'a share-alike licence', files: () => withFile('PROVENANCE.json', replaceOnce('"licence": "public-domain"', '"licence": "CC-BY-SA-4.0"')), kind: 'licence-not-allowed', file: 'PROVENANCE.json' },
  { name: 'a non-commercial licence', files: () => withFile('PROVENANCE.json', replaceOnce('"licence": "public-domain"', '"licence": "CC-BY-NC-4.0"')), kind: 'licence-not-allowed', file: 'PROVENANCE.json' },
  { name: 'no stated licence', files: () => withFile('PROVENANCE.json', replaceOnce('"licence": "public-domain"', '"licence": "unknown"')), kind: 'licence-not-allowed', file: 'PROVENANCE.json' },
  { name: 'public domain without a basis', files: () => withFile('PROVENANCE.json', replaceOnce('"basis": "expired-copyright"', '"basis": null')), kind: 'licence-basis-missing', file: 'PROVENANCE.json' },
  { name: 'a dedication without its page', files: () => withFile('PROVENANCE.json', replaceOnce('"basis": "expired-copyright"', '"basis": "dedicated"')), kind: 'licence-page-missing', file: 'PROVENANCE.json' },
  // people
  { name: 'a centre without a citation', files: () => withFile(`${W}/people.csv`, replaceOnce('above:REG A p.3', 'above')), kind: 'centre-without-citation', file: `${W}/people.csv` },
  { name: 'a centre citing only a pointer', files: () => withFile(`${W}/people.csv`, replaceOnce('above:REG A p.3', 'above:NOTE-x')), kind: 'centre-without-citation', file: `${W}/people.csv` },
  { name: 'a trait without a citation', files: () => withFile(`${W}/people.csv`, replaceOnce('bold:REG A p.9', 'bold')), kind: 'trait-without-citation', file: `${W}/people.csv` },
  { name: 'an invented person in a pack that allows none (review F7)', files: () => withFile(`${W}/people.csv`, appendRow(INVENTED)), kind: 'invented-not-allowed', file: `${W}/people.csv` },
  { name: "an invented person's record citing an unknown source", files: () => withFile(`${W}/people.csv`, appendRow(INVENTED.replace(/,DESIGN,$/, ',NOPE p.1,')), allowInvented()), kind: 'unknown-source', file: `${W}/people.csv` },
  { name: "an invented person's record citing only a pointer", files: () => withFile(`${W}/people.csv`, appendRow(INVENTED.replace(/,DESIGN,$/, ',NOTE-x,')), allowInvented()), kind: 'pointer-only', file: `${W}/people.csv` },
  { name: 'ranks out of order', files: () => withFile(`${W}/people.csv`, replaceOnce('junior:1840;senior:1850-05', 'junior:1860;senior:1850-05')), kind: 'ranks-out-of-order', file: `${W}/people.csv` },
  { name: 'an empty date not declared unknown', files: () => withFile(`${W}/people.csv`, replaceOnce('officer,1801,1871', 'officer,,1871')), kind: 'unlisted-null', file: `${W}/people.csv` },
  { name: 'an unknown value in a release pack', files: () => withFile('pack.json', replaceOnce('"status": "draft"', '"status": "release"')), kind: 'unknown-value', file: `${S}/force_blocks.csv` },
  // regions and installations
  { name: 'a land region on water terrain', files: () => withFile(`${W}/regions.csv`, replaceOnce('beta,Beta,land,plain', 'beta,Beta,land,coastal')), kind: 'region-terrain', file: `${W}/regions.csv` },
  { name: 'an off-map box without a role', files: () => withFile(`${W}/regions.csv`, replaceOnce(',foreign_power,', ',,')), kind: 'off-map-role', file: `${W}/regions.csv` },
  { name: 'a naval base outside a key point', files: () => withFile(`${W}/installations.csv`, replaceOnce('port_base,Port Base,port,', 'port_base,Port Base,beta,')), kind: 'naval-base-not-key-point', file: `${W}/installations.csv` },
  { name: 'a fort commanding a land edge', files: () => withFile(`${W}/installations.csv`, replaceOnce('sea:bay:port', 'road:beta:port')), kind: 'fort-edge', file: `${W}/installations.csv` },
  { name: 'a fort commanding a distant edge', files: () => withFile(`${W}/installations.csv`, replaceOnce('sea:bay:port', 'river:beta:stream')), kind: 'fort-edge', file: `${W}/installations.csv` },
  // edges and the graph
  { name: 'a self-loop', files: () => withFile(`${W}/edges.csv`, appendRow(',alpha,alpha,road,,1,,1,,,,DESIGN,')), kind: 'edge-self-loop', file: `${W}/edges.csv` },
  { name: 'a duplicate edge (either direction)', files: () => withFile(`${W}/edges.csv`, appendRow(',beta,alpha,road,,2,,3,,,,DESIGN,')), kind: 'duplicate-id', file: `${W}/edges.csv` },
  { name: 'a road into the sea', files: () => withFile(`${W}/edges.csv`, appendRow(',beta,bay,road,,1,,1,,,,DESIGN,')), kind: 'edge-end-kind', file: `${W}/edges.csv` },
  { name: 'a rail edge without a line', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,port,rail,main_line,', ',alpha,port,rail,,')), kind: 'rail-without-line', file: `${W}/edges.csv` },
  { name: 'a line on a road', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,beta,road,,', ',alpha,beta,road,main_line,')), kind: 'line-on-non-rail', file: `${W}/edges.csv` },
  { name: 'capacity above the scale', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,beta,road,,2,,3,', ',alpha,beta,road,,2,,9,')), kind: 'capacity-range', file: `${W}/edges.csv` },
  { name: 'a depth on a road', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,beta,road,,2,,3,,,mud', ',alpha,beta,road,,2,,3,,4,mud')), kind: 'water-field', file: `${W}/edges.csv` },
  { name: 'low water on a road', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,beta,road,,2,,3,,,mud', ',alpha,beta,road,,2,,3,,,low_water')), kind: 'season-reason', file: `${W}/edges.csv` },
  { name: 'an unreachable region', files: () => withFile(`${W}/regions.csv`, appendRow('island,Island,land,plain,,,,,,,,,,DESIGN,')), kind: 'unreachable-region', file: `${W}/regions.csv` },
  { name: 'two roads between one pair under different ids', files: () => withFile(`${W}/edges.csv`, appendRow('second_road,alpha,beta,road,,2,,3,,,,DESIGN,')), kind: 'duplicate-edge', file: `${W}/edges.csv` },
  { name: 'a return length equal to the length', files: () => withFile(`${W}/edges.csv`, replaceOnce(',beta,stream,river,,1,2,', ',beta,stream,river,,1,1,')), kind: 'redundant-value', file: `${W}/edges.csv`, severity: 'warning' },
  { name: 'a season reason twice on one edge', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,beta,road,,2,,3,,,mud', ',alpha,beta,road,,2,,3,,,mud;mud')), kind: 'duplicate-entry', file: `${W}/edges.csv` },
  {
    name: 'default months out of order',
    files: () =>
      withFile('pack.json', (t) => {
        const m = JSON.parse(t) as { rules: { seasons: { defaultMonths: number[] }[] } };
        m.rules.seasons[0]!.defaultMonths = [12, 1, 2];
        return JSON.stringify(m);
      }),
    kind: 'season-months',
    file: 'pack.json',
  },
  { name: 'a flag listed twice', files: () => withFile(`${W}/regions.csv`, replaceOnce('alpha,Alpha,land,plain,capital;port,', 'alpha,Alpha,land,plain,capital;capital,')), kind: 'duplicate-entry', file: `${W}/regions.csv` },
  { name: 'a label spine of one point', files: () => withFile(`${W}/regions.csv`, replaceOnce('beta,Beta,land,plain,,,,,,,,', 'beta,Beta,land,plain,,,,,,,10 50,')), kind: 'label-hints', file: `${W}/regions.csv` },
  { name: 'fort facts on a naval base', files: () => withFile(`${W}/installations.csv`, replaceOnce('port_base,Port Base,port,naval_base,,', 'port_base,Port Base,port,naval_base,passage,')), kind: 'fort-fields', file: `${W}/installations.csv` },
  { name: 'died before born', files: () => withFile(`${W}/people.csv`, replaceOnce('officer,1801,1871', 'officer,1801,1790')), kind: 'date-order', file: `${W}/people.csv` },
  { name: 'a rank junior to the one before', files: () => withFile(`${W}/people.csv`, replaceOnce('junior:1840;senior:1850-05', 'senior:1840;junior:1850-05')), kind: 'rank-demotion', file: `${W}/people.csv`, severity: 'warning' },
  // scenario starts
  { name: 'control over 1000', files: () => withFile(`${S}/control.csv`, replaceOnce('red:600;blue:300', 'red:600;blue:500')), kind: 'control-sum', file: `${S}/control.csv` },
  { name: 'a land region without control', files: () => withFile(`${S}/control.csv`, replaceOnce('port,blue:1000,', '')), kind: 'control-missing', file: `${S}/control.csv` },
  { name: 'a chain of command with a loop', files: () => withFile(`${S}/posts.csv`, replaceOnce('red_top,Red Chief,chief,r_war,,', 'red_top,Red Chief,chief,r_war,red_army,')), kind: 'chain-cycle', file: `${S}/posts.csv` },
  { name: 'a chain across factions', files: () => withFile(`${S}/posts.csv`, replaceOnce('red_army,Red Army,army,r_war,red_top,', 'red_army,Red Army,army,r_war,blue_top,')), kind: 'chain-crosses-factions', file: `${S}/posts.csv` },
  { name: 'a temporary post with no operation', files: () => withFile(`${S}/posts.csv`, appendRow('red_raid,Red Raid,expedition,r_war,red_top,beta,,,,DESIGN,')), kind: 'temporary-post', file: `${S}/posts.csv` },
  { name: 'a detachment with no parent', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('detachment,red_1,', 'detachment,,')), kind: 'detachment-parent', file: `${S}/force_blocks.csv` },
  { name: 'troops aboard a land block', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce(',red_army,alpha,,foot,200', ',red_army,beta,red_1,foot,200')), kind: 'aboard-not-naval', file: `${S}/force_blocks.csv` },
  { name: "a block under the other side's post", files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('red_1,Red First,block,,r_war,red_army,', 'red_1,Red First,block,,r_war,blue_top,')), kind: 'chain-crosses-factions', file: `${S}/force_blocks.csv` },
  { name: 'a standing order issued after the start', files: () => withFile(`${S}/standing_orders.csv`, replaceOnce('1900-04-01', '1900-06-01')), kind: 'date-order', file: `${S}/standing_orders.csv` },
  {
    name: 'a department change before the start',
    files: () => withNewFile(`${S}/department_changes.csv`, 'post,on,department,parent,sources,notes\nred_fleet,1900-04-01,r_war,red_top,DESIGN,'),
    kind: 'date-order',
    file: `${S}/department_changes.csv`,
  },
  // Sides, links and ships (review F4, F5)
  { name: "a post held by the other faction's man", files: () => withFile(`${S}/holders.csv`, appendRow('red_army,blue_chief,no,,,DESIGN,')), kind: 'faction-mismatch', file: `${S}/holders.csv` },
  { name: "a principal from the other faction", files: () => withFile(`${S}/scenario.json`, replaceOnce('"principal":"red_chief"', '"principal":"blue_chief"')), kind: 'faction-mismatch', file: `${S}/scenario.json` },
  { name: "troops aboard the other side's ship", files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('blue_1,Blue First,block,,b_war,blue_top,port,,', 'blue_1,Blue First,block,,b_war,blue_top,alpha,red_ship,')), kind: 'faction-mismatch', file: `${S}/force_blocks.csv` },
  { name: 'a link to the enemy', files: () => withNewFile(`${S}/post_links.csv`, 'post,kind,other,notes\nred_army,liaison,blue_top,'), kind: 'chain-crosses-factions', file: `${S}/post_links.csv` },
  { name: 'a joint link one way only', files: () => joint('red_raid_a,joint,red_raid_b,'), kind: 'joint-link', file: `${S}/post_links.csv` },
  { name: 'a joint link across operations', files: () => joint('red_raid_a,joint,red_raid_b,\nred_raid_b,joint,red_raid_a,', 'other_op'), kind: 'joint-link', file: `${S}/post_links.csv` },
  { name: 'a joint link inside one department', files: () => joint('red_raid_a,joint,red_raid_b,\nred_raid_b,joint,red_raid_a,', 'raid', 'r_war'), kind: 'joint-link', file: `${S}/post_links.csv` },
  { name: 'a joint link to a standing post', files: () => withNewFile(`${S}/post_links.csv`, 'post,kind,other,notes\nred_army,joint,red_fleet,\nred_fleet,joint,red_army,'), kind: 'joint-link', file: `${S}/post_links.csv` },
  {
    name: 'a department change to a parent on the other side',
    files: () => withNewFile(`${S}/department_changes.csv`, 'post,on,department,parent,sources,notes\nred_fleet,1900-06-01,r_war,blue_top,DESIGN,'),
    kind: 'chain-crosses-factions',
    file: `${S}/department_changes.csv`,
  },
  {
    name: "a department change to the other side's department",
    files: () => withNewFile(`${S}/department_changes.csv`, 'post,on,department,parent,sources,notes\nred_fleet,1900-06-01,b_war,,DESIGN,'),
    kind: 'chain-crosses-factions',
    file: `${S}/department_changes.csv`,
  },
  { name: 'a department change to answer to itself', files: () => withNewFile(`${S}/department_changes.csv`, 'post,on,department,parent,sources,notes\nred_fleet,1900-06-01,r_war,red_fleet,DESIGN,'), kind: 'chain-cycle', file: `${S}/department_changes.csv` },
  { name: 'infantry standing on the sea', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce(',red_army,alpha,,foot,200', ',red_army,bay,,foot,200')), kind: 'afloat-without-ship', file: `${S}/force_blocks.csv` },
  { name: 'a ship aboard a ship', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('red_ship,Red Ship,block,,r_sea,red_fleet,alpha,,', 'red_ship,Red Ship,block,,r_sea,red_fleet,alpha,red_ship,')), kind: 'aboard-cycle', file: `${S}/force_blocks.csv` },
  { name: 'a ship inland', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('red_ship,Red Ship,block,,r_sea,red_fleet,alpha,', 'red_ship,Red Ship,block,,r_sea,red_fleet,beta,')), kind: 'ship-ashore', file: `${S}/force_blocks.csv`, severity: 'warning' },
  // Every other call site of a check (the post-review mutation run)
  { name: 'a block with a parent', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('red_ship,Red Ship,block,,', 'red_ship,Red Ship,block,red_1,')), kind: 'detachment-parent', file: `${S}/force_blocks.csv` },
  { name: 'a detachment of a detachment', files: () => withFile(`${S}/force_blocks.csv`, appendRow('red_det2,Red Picket,detachment,red_1_det,r_war,red_army,alpha,,foot,10,1900-04,,5,DESIGN,')), kind: 'detachment-parent', file: `${S}/force_blocks.csv` },
  // 0058: a post kind's role is one the engine reads, never a free name.
  { name: 'a post kind with a role the engine does not read', files: () => editJson('pack.json', (m: { vocabularies: { postKinds: { role?: string }[] } }) => (m.vocabularies.postKinds[0]!.role = 'spymaster')), kind: 'shape/invalid_value', file: 'pack.json' },
  { name: 'a season reason defined twice in the rules', files: () => editJson('pack.json', (m: { rules: { seasons: unknown[] } }) => m.rules.seasons.push(m.rules.seasons[0])), kind: 'duplicate-id', file: 'pack.json' },
  { name: 'a source key defined twice', files: () => editJson('PROVENANCE.json', (m: { sources: unknown[] }) => m.sources.push(m.sources[0])), kind: 'duplicate-id', file: 'PROVENANCE.json' },
  { name: 'a standing order id twice on one post', files: () => withFile(`${S}/standing_orders.csv`, appendRow('stay,red_army,hold,red_top,1900-04-02,Hold it still.,DESIGN,')), kind: 'duplicate-id', file: `${S}/standing_orders.csv` },
  { name: 'a sea edge between two land regions', files: () => withFile(`${W}/edges.csv`, appendRow(',alpha,beta,sea,,1,,1,,,,DESIGN,')), kind: 'edge-end-kind', file: `${W}/edges.csv` },
  { name: 'a river edge to an off-map box', files: () => withFile(`${W}/edges.csv`, appendRow(',stream,abroad,river,,1,,1,,,,DESIGN,')), kind: 'edge-end-kind', file: `${W}/edges.csv` },
  { name: 'a post linked to itself', files: () => withNewFile(`${S}/post_links.csv`, 'post,kind,other,notes\nred_army,liaison,red_army,'), kind: 'edge-self-loop', file: `${S}/post_links.csv` },
  { name: 'a water fort commanding nothing', files: () => withFile(`${W}/installations.csv`, replaceOnce('reduction,sea:bay:port,', 'reduction,,')), kind: 'fort-edge', file: `${W}/installations.csv`, severity: 'warning' },
  { name: 'a land fort commanding water', files: () => withFile(`${W}/installations.csv`, replaceOnce('reduction,sea:bay:port,', ',sea:bay:port,')), kind: 'fort-edge', file: `${W}/installations.csv` },
  { name: 'own work under another licence', files: () => editJson('PROVENANCE.json', (m: { sources: { licence: string; basis: string | null }[] }) => Object.assign(m.sources[0]!, { licence: 'public-domain', basis: 'expired-copyright' })), kind: 'licence-not-allowed', file: 'PROVENANCE.json' },
  { name: 'a land region with an off-map role', files: () => withFile(`${W}/regions.csv`, replaceOnce('beta,Beta,land,plain,,,', 'beta,Beta,land,plain,,foreign_power,')), kind: 'off-map-role', file: `${W}/regions.csv` },
  { name: 'an off-map box with a terrain', files: () => withFile(`${W}/regions.csv`, replaceOnce('abroad,Abroad,off_map,,', 'abroad,Abroad,off_map,plain,')), kind: 'region-terrain', file: `${W}/regions.csv` },
  { name: 'a land region without a terrain', files: () => withFile(`${W}/regions.csv`, replaceOnce('beta,Beta,land,plain,', 'beta,Beta,land,,')), kind: 'region-terrain', file: `${W}/regions.csv` },
  { name: 'a retreat threshold above the supply threshold', files: () => editJson('pack.json', (m: { rules: { retreatControlPermille: number } }) => (m.rules.retreatControlPermille = 300)), kind: 'rules-order', file: 'pack.json', severity: 'warning' },
  {
    name: 'a scenario folder the manifest does not list',
    files: () => {
      const base = fixture();
      return withNewFile('source/scenarios/later/control.csv', base.get(`${S}/control.csv`)!, withNewFile('source/scenarios/later/scenario.json', base.get(`${S}/scenario.json`)!, base));
    },
    kind: 'scenario-missing',
    file: 'pack.json',
  },
  { name: 'mud on a railway', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,port,rail,main_line,1,,2,,,,', ',alpha,port,rail,main_line,1,,2,,,mud,')), kind: 'season-reason', file: `${W}/edges.csv` },
  { name: 'a fort commanding an edge that does not exist', files: () => withFile(`${W}/installations.csv`, replaceOnce('sea:bay:port', 'sea:nowhere:port')), kind: 'unknown-reference', file: `${W}/installations.csv` },
  { name: 'a season reason with no effect in the rules', files: () => withFile(`${W}/edges.csv`, replaceOnce('6,low_water,', '6,flood:4-5,')), kind: 'unknown-term', file: `${W}/edges.csv` },
  { name: 'a seasonal depth on a road', files: () => withFile(`${W}/edges.csv`, replaceOnce(',alpha,beta,road,,2,,3,,,mud', ',alpha,beta,road,,2,,3,,,mud:12-2:3')), kind: 'water-field', file: `${W}/edges.csv` },
  { name: 'an empty required cell', files: () => withFile(`${W}/rail_lines.csv`, replaceOnce('main_line,Main Line,', 'main_line,,')), kind: 'missing-value', file: `${W}/rail_lines.csv` },
  { name: 'a tenure beginning after the start', files: () => withFile(`${S}/holders.csv`, appendRow('red_army,red_captain,no,1900-06-01,,DESIGN,')), kind: 'tenure-outside-start', file: `${S}/holders.csv`, severity: 'warning' },
  { name: 'unknown as a carrier', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('red_1,Red First,block,,r_war,red_army,beta,,', 'red_1,Red First,block,,r_war,red_army,beta,unknown,')), kind: 'unknown-not-allowed', file: `${S}/force_blocks.csv` },
  { name: 'unknown as a depth', files: () => withFile(`${W}/edges.csv`, replaceOnce(',port,bay,sea,,1,,4,,12,', ',port,bay,sea,,1,,4,,unknown,')), kind: 'unknown-not-allowed', file: `${W}/edges.csv` },
  { name: 'unknown as a tenure date', files: () => withFile(`${S}/holders.csv`, replaceOnce('red_top,red_chief,no,1890,', 'red_top,red_chief,no,unknown,')), kind: 'unknown-not-allowed', file: `${S}/holders.csv` },
  { name: 'a tenure of a post that does not exist', files: () => withFile(`${S}/holders.csv`, appendRow('nobody_post,red_captain,no,,,DESIGN,')), kind: 'unknown-reference', file: `${S}/holders.csv` },
  // A neutral government (review F6)
  { name: "a neutral government's guard under a faction's general", files: () => neutral(undefined, 'grey_guard,Grey Guard,block,,g_gov,red_army,beta,,foot,800,1900-04,,20,DESIGN,'), kind: 'chain-crosses-factions', file: `${S}/force_blocks.csv` },
  { name: "a faction's troops under a neutral governor", files: () => neutral(undefined, 'grey_guard,Grey Guard,block,,r_war,grey_top,beta,,foot,800,1900-04,,20,DESIGN,'), kind: 'chain-crosses-factions', file: `${S}/force_blocks.csv` },
  { name: "a neutral government's post answering to a faction", files: () => neutral('grey_top,Grey Governor,chief,g_gov,red_top,beta,,,,DESIGN,'), kind: 'chain-crosses-factions', file: `${S}/posts.csv` },
  { name: "a faction's man holding a neutral post", files: () => withFile(`${S}/holders.csv`, replaceOnce('grey_top,grey_chief,', 'grey_top,red_captain,'), neutral()), kind: 'faction-mismatch', file: `${S}/holders.csv` },
  { name: 'no playable faction', files: () => withFile(`${S}/scenario.json`, replaceOnce('"playable":true', '"playable":false')), kind: 'no-playable-faction', file: `${S}/scenario.json` },
  {
    name: 'a faction listed twice in a start',
    files: () => withFile(`${S}/scenario.json`, replaceOnce('{"faction":"blue",', '{"faction":"red","principal":null,"capital":null,"playable":false},{"faction":"blue",')),
    kind: 'duplicate-entry',
    file: `${S}/scenario.json`,
  },
  { name: 'two control rows for one region', files: () => withFile(`${S}/control.csv`, appendRow('alpha,red:900,')), kind: 'duplicate-entry', file: `${S}/control.csv` },
  { name: 'two shares for one faction', files: () => withFile(`${S}/control.csv`, replaceOnce('red:600;blue:300', 'red:600;red:300')), kind: 'duplicate-entry', file: `${S}/control.csv` },
  { name: 'an obstructed road', files: () => withNewFile(`${S}/obstructions.csv`, 'edge,by,sources,notes\nroad:alpha:beta,,DESIGN,'), kind: 'obstruction-on-land', file: `${S}/obstructions.csv` },
  { name: 'troops aboard a ship in another region', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('red_1,Red First,block,,r_war,red_army,beta,,', 'red_1,Red First,block,,r_war,red_army,beta,red_ship,')), kind: 'aboard-elsewhere', file: `${S}/force_blocks.csv` },
  {
    name: 'an uncited holder in a release pack (review N6)',
    files: () => withFile(`${S}/holders.csv`, replaceOnce('red_top,red_chief,no,1890,,DESIGN,', 'red_top,red_chief,no,1890,,,'), withFile('pack.json', replaceOnce('"status": "draft"', '"status": "release"'))),
    kind: 'holder-without-citation',
    file: `${S}/holders.csv`,
  },
  { name: 'two holders for one post', files: () => withFile(`${S}/holders.csv`, appendRow('red_top,red_captain,no,,,DESIGN,')), kind: 'duplicate-holder', file: `${S}/holders.csv` },
  { name: 'a tenure ending before the start', files: () => withFile(`${S}/holders.csv`, appendRow('red_army,red_captain,no,1890,1899-12-31,DESIGN,')), kind: 'tenure-outside-start', file: `${S}/holders.csv`, severity: 'warning' },
  { name: 'a listed scenario with no data', files: () => withFile('pack.json', replaceOnce('"scenarios": [\n    "start"\n  ]', '"scenarios": ["start", "later"]')), kind: 'scenario-missing', file: 'pack.json' },
  // strings and text
  { name: 'a vocabulary name with no text', files: () => withFile('strings/en.json', replaceOnce('"trait.bold": "bold",', '')), kind: 'missing-string', file: 'pack.json' },
  { name: 'a broken ICU message', files: () => withFile('strings/en.json', replaceOnce('"trait.bold": "bold"', '"trait.bold": "{n, plural, one {bold"')), kind: 'icu-syntax', file: 'strings/en.json' },
  { name: 'text not in NFC', files: () => withFile(`${W}/rail_lines.csv`, replaceOnce('Main Line', 'Main Line Café')), kind: 'not-nfc', file: `${W}/rail_lines.csv` },
  { name: 'hand-written text not in NFC', files: () => withFile('strings/en.json', replaceOnce('"Fixture"', '"Café"')), kind: 'not-nfc', file: 'strings/en.json' },
  { name: 'no hand-written table for the default locale', files: () => withoutFile('strings/en.json'), kind: 'missing-file', file: 'strings/en.json' },
  { name: 'a listed locale with no table', files: () => withFile('pack.json', replaceOnce('"locales": [\n    "en"\n  ]', '"locales": ["en", "fr"]')), kind: 'missing-string-table', file: 'pack.json', severity: 'warning' },
  { name: 'a key defined twice', files: () => withFile('strings/en.json', replaceOnce('"pack.name": "Fixture",', '"pack.name": "Fixture", "rail_line.main_line.name": "Again",')), kind: 'duplicate-string', file: 'strings/en.json' },
  {
    name: 'a translation of a key the default locale lacks',
    files: () => withNewFile('strings/fr.json', '{"no.such.key": "rien"}', withFile('pack.json', replaceOnce('"locales": [\n    "en"\n  ]', '"locales": ["en", "fr"]'))),
    kind: 'stray-string',
    file: 'strings/fr.json',
    severity: 'warning',
  },
];

/**
 * Checks the generator never trips, because it builds those fields itself,
 * but which guard committed data loaded without sources (`loadPack`): each
 * breaks the generated fixture pack directly and runs the validator.
 */
const direct: { name: string; change: (p: Mutable<PackData>) => void; kind: string; severity?: 'error' | 'warning' }[] = [
  { name: 'edge ends out of order', change: (p) => swapEnds(p.world.edges[0]!), kind: 'edge-order' },
  { name: 'a fort without its fort facts', change: (p) => (p.world.installations.find((i) => i.kind === 'fort')!.fort = null), kind: 'fort-fields' },
  { name: 'edge months out of order', change: (p) => (p.world.edges.find((e) => e.seasons.length > 0)!.seasons[0]!.months = [9, 8]), kind: 'season-months' },
  { name: 'a field that cannot be unknown', change: (p) => (p.world.people[0]!.unknowns = ['kind']), kind: 'unknowns-field' },
  { name: 'a field declared unknown that has a value', change: (p) => (p.world.people[0]!.unknowns = ['born']), kind: 'unknowns-field' },
  {
    name: 'an unknown centre with citations',
    change: (p) => (p.world.people.find((x) => x.id === 'red_chief')!.centres.experience = { direction: null, cites: [{ source: 'DESIGN', at: null }] }),
    kind: 'redundant-value',
    severity: 'warning',
  },
  { name: 'no string table at all for the default locale', change: (p) => p.strings.delete('en'), kind: 'missing-string-table' },
  { name: 'a string table for a locale the manifest does not list', change: (p) => p.strings.set('de', [{ file: 'strings/de.json', table: {} }]), kind: 'missing-string-table' },
];

type Mutable<T> = T extends string | number | boolean | null
  ? T
  : T extends ReadonlyMap<infer A, infer B>
    ? Map<A, B>
    : T extends readonly (infer U)[]
      ? Mutable<U>[]
      : { -readonly [K in keyof T]: Mutable<T[K]> };

function swapEnds(e: { a: unknown; b: unknown }) {
  [e.a, e.b] = [e.b, e.a];
}

describe('checks that guard committed data (positive controls)', () => {
  const base = run(fixture()).pack!;
  for (const c of direct) {
    it(c.name, () => {
      const pack = structuredClone(base) as unknown as Mutable<PackData>;
      expect(validatePack(base).filter((i) => i.kind === c.kind && i.severity === (c.severity ?? 'error'))).toEqual([]);
      c.change(pack);
      const hit = validatePack(pack as unknown as PackData).filter((i) => i.kind === c.kind && i.severity === (c.severity ?? 'error'));
      expect(hit.length).toBeGreaterThan(0);
    });
  }

  it('the canonical writer refuses a float rather than writing it', () => {
    expect(() => formatGenerated({ regions: [{ lengthDays: 1.5 }] })).toThrow();
  });
});

describe('harbour channels (lane 0.3)', () => {
  const harbour = (type: string, regionRow: string) =>
    withFile(`${W}/edges.csv`, appendRow(`,port,harbour,${type},,1,,2,,,,DESIGN,`), withFile(`${W}/regions.csv`, appendRow(regionRow)));
  it('a sea edge may join two key points on one harbour', () => {
    const result = run(harbour('sea', 'harbour,Harbour,key_point,plain,,,,,,,,,,DESIGN,'));
    expect(result.issues.filter((i) => i.kind === 'edge-end-kind')).toEqual([]);
  });
  it('but not a key point and an ordinary land region (positive control)', () => {
    const result = run(harbour('sea', 'harbour,Harbour,land,plain,,,,,,,,,,DESIGN,'));
    expect(result.issues.filter((i) => i.kind === 'edge-end-kind').map((i) => i.severity)).toEqual(['error']);
  });
});

describe('invented people (review F7)', () => {
  it('need no citations for their centres and traits where the pack allows them', () => {
    const result = run(withFile(`${W}/people.csv`, appendRow(INVENTED), allowInvented()));
    expect(errorsOf(result.issues).map(formatIssue)).toEqual([]);
  });
});

describe('a neutral government (review F6)', () => {
  it('loads: a department with no faction, its governor and its guard, on no one\'s ground', () => {
    const result = run(withFile(`${S}/control.csv`, replaceOnce('beta,red:600;blue:300,', 'beta,,'), neutral()));
    expect(errorsOf(result.issues).map(formatIssue)).toEqual([]);
    expect(result.pack!.world.departments.find((d) => d.id === 'g_gov')?.faction).toBeNull();
  });

  it('cannot change sides by a scheduled department change', () => {
    const files = withNewFile(`${S}/department_changes.csv`, 'post,on,department,parent,sources,notes\ngrey_top,1900-09-01,r_war,red_top,DESIGN,', neutral());
    expect(run(files).issues.filter((i) => i.kind === 'chain-crosses-factions').length).toBeGreaterThan(0);
  });
});

describe('every check fires on the fault it is for (positive controls)', () => {
  for (const c of cases) {
    it(c.name, () => {
      const result = run(c.files());
      const hit = result.issues.filter((i) => i.kind === c.kind && i.severity === (c.severity ?? 'error'));
      expect(hit.map((i) => i.file), `issues were:\n${result.issues.map(formatIssue).join('\n')}`).toContain(c.file);
      if ((c.severity ?? 'error') === 'error') expect(result.outputs.size).toBe(0);
    });
  }

  it('reports every problem at once, not only the first: a record failing its shape is set aside and the rest are still checked', () => {
    let files = withFile(`${W}/depots.csv`, replaceOnce(',alpha,source,4,', ',gamma,source,9,'));
    files = withFile(`${W}/regions.csv`, replaceOnce('beta,Beta,land,', 'beta,Beta,meadow,'), files);
    const result = run(files);
    expect(kinds(result.issues)).toEqual(['error capacity-range', 'error shape/invalid_value', 'error unknown-reference', 'warning unknown-value']);
    // beta was set aside, but the edges and control rows naming it are not reported as unknown references.
    expect(result.issues.filter((i) => i.kind === 'unknown-reference').map((i) => i.message)).toEqual(['"gamma" is not a region']);
  });
});

describe('issues read like sentences (decision 0030: file, field, what is wrong, what is expected)', () => {
  it('points at the source row and column', () => {
    const result = run(withFile(`${W}/depots.csv`, replaceOnce(',alpha,source,', ',gamma,source,')));
    const issue = result.issues.find((i) => i.kind === 'unknown-reference')!;
    expect(formatIssue(issue)).toBe(
      'error [unknown-reference] source/world/depots.csv (row 2 (alpha_stores), column region): "gamma" is not a region. Expected: a region id defined in the pack.',
    );
  });

  it('points a link at its row and column in post_links.csv', () => {
    const issue = run(withNewFile(`${S}/post_links.csv`, 'post,kind,other,notes\nred_army,liaison,nobody,')).issues.find((i) => i.kind === 'unknown-reference')!;
    expect(`${issue.file} (${issue.at})`).toBe(`${S}/post_links.csv (row 2, column other)`);
  });

  it('names the nearest table for a misnamed one', () => {
    const issue = run(renamed(`${S}/force_blocks.csv`, `${S}/force_block.csv`)).issues.find((i) => i.kind === 'unknown-table')!;
    expect(formatIssue(issue)).toBe(
      'error [unknown-table] source/scenarios/start/force_block.csv: "force_block.csv" is not a table of this folder, so it would be ignored. Expected: a known table name (the nearest is force_blocks.csv).',
    );
  });

  it('points a nested record at the table it came from', () => {
    const result = run(withFile(`${S}/standing_orders.csv`, replaceOnce(',hold,red_top,', ',hold,blue_top,').bind(null)));
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
    const bad = run(withFile(`${S}/standing_orders.csv`, replaceOnce(',hold,red_top,', ',hold,nobody,')));
    const issue = bad.issues.find((i) => i.kind === 'unknown-reference')!;
    expect(`${issue.file} (${issue.at})`).toBe(`${S}/standing_orders.csv (row 2 (stay), column from)`);
  });
});
