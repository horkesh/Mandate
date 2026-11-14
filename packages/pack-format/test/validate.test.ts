import { describe, expect, it } from 'vitest';
import { errorsOf, formatIssue, generatePack, type Issue } from '../src/index.ts';
import { appendRow, filesOf, fixture, type FileMap, replaceOnce, withFile } from './support/fixture.ts';

const run = (files: FileMap) => generatePack(filesOf(files));
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
  // CSV and cells
  { name: 'an unknown column', files: () => withFile(`${W}/rail_lines.csv`, replaceOnce('id,name,sources,notes', 'id,name,sources,notes,colour')), kind: 'csv-syntax', file: `${W}/rail_lines.csv` },
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
  // scenario starts
  { name: 'control over 1000', files: () => withFile(`${S}/control.csv`, replaceOnce('red:600;blue:300', 'red:600;blue:500')), kind: 'control-sum', file: `${S}/control.csv` },
  { name: 'a land region without control', files: () => withFile(`${S}/control.csv`, replaceOnce('port,blue:1000,', '')), kind: 'control-missing', file: 'data/scenarios/start.json' },
  { name: 'a chain of command with a loop', files: () => withFile(`${S}/posts.csv`, replaceOnce('red_top,Red Chief,chief,r_war,,', 'red_top,Red Chief,chief,r_war,red_army,')), kind: 'chain-cycle', file: `${S}/posts.csv` },
  { name: 'a chain across factions', files: () => withFile(`${S}/posts.csv`, replaceOnce('red_army,Red Army,army,r_war,red_top,', 'red_army,Red Army,army,r_war,blue_top,')), kind: 'chain-crosses-factions', file: `${S}/posts.csv` },
  { name: 'a temporary post with no operation', files: () => withFile(`${S}/posts.csv`, appendRow('red_raid,Red Raid,expedition,r_war,red_top,beta,,,,DESIGN,')), kind: 'temporary-post', file: `${S}/posts.csv` },
  { name: 'a detachment with no parent', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('detachment,red_1,', 'detachment,,')), kind: 'detachment-parent', file: `${S}/force_blocks.csv` },
  { name: 'troops aboard a land block', files: () => withFile(`${S}/force_blocks.csv`, replaceOnce(',red_army,alpha,,foot,200', ',red_army,beta,red_1,foot,200')), kind: 'aboard-not-naval', file: `${S}/force_blocks.csv` },
  { name: "a block under the other side's post", files: () => withFile(`${S}/force_blocks.csv`, replaceOnce('red_1,Red First,block,,r_war,red_army,', 'red_1,Red First,block,,r_war,blue_top,')), kind: 'chain-crosses-factions', file: `${S}/force_blocks.csv` },
  { name: 'a standing order issued after the start', files: () => withFile(`${S}/standing_orders.csv`, replaceOnce('1900-04-01', '1900-06-01')), kind: 'date-order', file: `${S}/standing_orders.csv` },
  { name: 'two holders for one post', files: () => withFile(`${S}/holders.csv`, appendRow('red_top,red_captain,no,,,DESIGN,')), kind: 'duplicate-holder', file: `${S}/holders.csv` },
  { name: 'a tenure ending before the start', files: () => withFile(`${S}/holders.csv`, appendRow('red_army,red_captain,no,1890,1899-12-31,DESIGN,')), kind: 'tenure-outside-start', file: `${S}/holders.csv`, severity: 'warning' },
  { name: 'a listed scenario with no data', files: () => withFile('pack.json', replaceOnce('"scenarios": [\n    "start"\n  ]', '"scenarios": ["start", "later"]')), kind: 'scenario-missing', file: 'pack.json' },
  // strings and text
  { name: 'a vocabulary name with no text', files: () => withFile('strings/en.json', replaceOnce('"trait.bold": "bold",', '')), kind: 'missing-string', file: 'pack.json' },
  { name: 'a broken ICU message', files: () => withFile('strings/en.json', replaceOnce('"trait.bold": "bold"', '"trait.bold": "{n, plural, one {bold"')), kind: 'icu-syntax', file: 'strings/en.json' },
  { name: 'text not in NFC', files: () => withFile(`${W}/rail_lines.csv`, replaceOnce('Main Line', 'Main Line Café')), kind: 'not-nfc', file: 'data/strings/en.json' },
];

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

  it('points a nested record at the table it came from', () => {
    const result = run(withFile(`${S}/standing_orders.csv`, replaceOnce(',hold,red_top,', ',hold,blue_top,').bind(null)));
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
    const bad = run(withFile(`${S}/standing_orders.csv`, replaceOnce(',hold,red_top,', ',hold,nobody,')));
    const issue = bad.issues.find((i) => i.kind === 'unknown-reference')!;
    expect(`${issue.file} (${issue.at})`).toBe(`${S}/standing_orders.csv (row 2 (stay), column from)`);
  });
});
