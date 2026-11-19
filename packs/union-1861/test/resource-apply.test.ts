import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { parse, serialise } = require('../../../docs/research/_resource/tools/csvlib.js');
const script = readFileSync(new URL('../../../docs/research/_resource/tools/apply.js', import.meta.url), 'utf8');
const columns = ['id', 'competence', 'reputation', 'values', 'traits', 'regard_others', 'bloc', 'bloc_cites', 'notes'];
const fifteen = ['buchanan_franklin', 'cooper_samuel', 'crittenden_george_b', 'ewell_richard_s', 'gorgas_josiah', 'holmes_theophilus_h', 'johnston_albert_s', 'johnston_joseph_e', 'lee_robert_e', 'longstreet_james', 'loring_william_w', 'magruder_john_b', 'pemberton_john_c', 'smith_edmund_k', 'stuart_james_e_b'];
const none = ['breckinridge_john_c', 'buckner_simon_b', 'vance_zebulon_b', 'letcher_john', 'polk_leonidas', 'lovell_mansfield', 'mason_james_m', 'hunter_robert_m_t', 'floyd_john_b', 'bulloch_james_d', 'burnside_ambrose_e', 'grant_ulysses_s', 'halleck_henry_w', 'hitchcock_ethan_a', 'hooker_joseph', 'mitchel_ormsby_m', 'patterson_robert', 'rosecrans_william_s', 'sherman_william_t', 'stone_charles_p'];
function apply() {
  const ids = [...fifteen, ...none, 'lincoln_abraham', 'andrew_john_a', 'dana_charles_a'];
  const input = serialise([columns, ...ids.map(id => [id, 'above:OLD p1', 'average:OLD p2', 'state_autonomy:PEARSON-ANDREW v1 p138-139', id === 'lincoln_abraham' ? 'secretive:OLD p4' : id === 'dana_charles_a' ? 'antislavery:OLD p4' : '', '', id === 'stone_charles_p' ? 'army' : 'confederate', 'OLD p3', 'Original note.'])]);
  const files = new Map<string, string>([['packs/union-1861/source/world/people.csv', input]]);
  for (let n = 1; n <= 14; n++) {
    files.set(`docs/research/_resource/rs${n}.csv`, n >= 7 && n <= 9 ? 'person,decision,proposed_bloc,bloc_cites,basis\n' : 'person,cell,decision,proposed_direction,citations,basis\n');
  }
  files.set('docs/research/_resource/rs1.csv', serialise([['person', 'cell', 'decision', 'proposed_direction', 'citations', 'basis'], ...fifteen.map(id => [id, 'competence', 'HOLD', '', '', 'held by old reader'])]));
  files.set('docs/research/_resource/rs7.csv', serialise([['person', 'decision', 'proposed_bloc', 'bloc_cites', 'basis'], ...[...fifteen, ...none].map(id => [id, 'HOLD', '', '', 'reader hold'])]));
  files.set('docs/research/_resource/rs11.csv', 'person,cell,decision,proposed_direction,citations,basis\nlincoln_abraham,reputation,CHANGE,above,NEW:PEARSON-ANDREW p116 dated 1860,rejected recommendation\n');
  files.set('docs/research/_resource/rs10.csv', 'person,cell,decision,proposed_direction,citations,basis\nandrew_john_a,value:state_autonomy,KEEP,state_autonomy,PEARSON-ANDREW v1 p138-139,reprinted inaugural\n');
  files.set('docs/research/_resource/rs4.csv', 'person,cell,decision,proposed_direction,citations,basis\ndana_charles_a,trait:antislavery,KEEP,antislavery,NEW:BATES-D p36-37,diary edition licence unresolved\nlincoln_abraham,trait:secretive,KEEP,secretive,LINCOLN p91+NEW:BATES-D p165,independent letter and diary\n');
  files.set('docs/research/_resource/dating.csv', 'cell,citation,date,source of the date\nandrew_john_a/value:state_autonomy,PEARSON-ANDREW v1 p138-139,1861-01-05,document heading\n');
  runInNewContext(script, {
    require: (name: string) => name === 'fs' ? {
      readFileSync: (path: string) => { path = path.replace(/^\.\//, ''); if (!files.has(path)) throw new Error(path); return files.get(path); },
      existsSync: (path: string) => files.has(path.replace(/^\.\//, '')),
      writeFileSync: (path: string, text: string) => files.set(path.replace(/^\.\//, ''), text),
    } : { parse, serialise },
    process: { env: { HELD_OUT_CELLS: 'held-cells.csv', HELD_OUT_BLOCS: 'held-blocs.csv' }, argv: [] }, console: { log() {} },
  });
  const output = parse(files.get('packs/union-1861/source/world/people.csv'));
  return { files, before: parse(input), rows: new Map<string, string[]>(output.slice(1).map((r: string[]) => [r[0], r])) };
}

describe('0097 resource apply', () => {
  it('preserves every column of all fifteen R49-owned rows, including judgments', () => {
    const { before, rows } = apply();
    for (const id of fifteen) expect(rows.get(id)).toEqual(before.find((r: string[]) => r[0] === id));
  });
  it('clears all twenty disputed blocs and records Stone without calling him a civilian', () => {
    const { rows } = apply();
    for (const id of none) expect(rows.get(id)![6], id).toBe('');
    expect(rows.get('stone_charles_p')![8]).toContain('1 January 1861');
    expect(rows.get('stone_charles_p')![8]).toContain('authority');
  });
  it('holds Lincoln reputation instead of accepting rs11 above', () => {
    const { rows, files } = apply();
    expect(rows.get('lincoln_abraham')![2]).toBe('');
    expect(files.get('held-cells.csv')).toContain('lincoln_abraham,reputation,average:OLD p2');
  });
  it('applies the dated citation to the specified cell and produces repeatable bytes', () => {
    const first = apply();
    expect(first.rows.get('andrew_john_a')![3]).toContain('dated 1861-01-05');
    expect([...first.files]).toEqual([...apply().files]);
  });
  it('distinguishes reprinted documents from the biographies that contain them', () => {
    const { rows } = apply();
    expect(rows.get('andrew_john_a')![3]).toBe('state_autonomy:PEARSON-ANDREW-DOCS v1 p138-139 dated 1861-01-05');
  });
  it('preserves the existing Bates rights exclusion, holding only a cell with no other citation', () => {
    const { rows, files } = apply();
    expect(rows.get('dana_charles_a')![4]).toBe('');
    expect(rows.get('lincoln_abraham')![4]).toBe('secretive:LINCOLN p91');
    expect(files.get('held-cells.csv')).toContain('dana_charles_a,trait:antislavery');
  });
});
