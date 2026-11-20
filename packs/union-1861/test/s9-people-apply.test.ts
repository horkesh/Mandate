import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { parse, serialise } = require('../../../docs/research/_resource/tools/csvlib.js');
const base = 'packs/union-1861/';
const research = 'docs/research/_resource/';
const people = `${base}source/world/people.csv`;
const held = `${base}source/drafts/people/held-back-judgments-1861.csv`;
const columns = ['id', 'competence', 'experience', 'reputation', 'values', 'traits', 'regard_others', 'bloc', 'bloc_cites', 'notes', 'service_government', 'resigned_on'];
function fixture() {
  return new Map<string, string>([
    [people, serialise([columns,
      ['lincoln_abraham', '', 'above:REGISTER entry', '', '', '', '', '', '', 'note', '', ''],
      ['lee_robert_e', 'above:OLD p1', '', '', 'duty:OLD p2', '', '', 'army', 'REGISTER entry', 'untouched', 'us', '1861-04-20'],
      ['houston_samuel', '', '', '', 'union:HOUSTON-DALY-1860 p118 dated 1860-08-14', '', 'davis_jefferson:below:OLD p3', '', '', 'note', '', ''],
      ['dix_john_a', '', '', '', '', '', '', '', '', '', '', ''],
      ['late', 'above:OLD p8', 'above:REGISTER entry', '', 'order:OLD p9', '', 'lincoln_abraham:above:OLD p10', '', '', '', '', ''],
    ])],
    [held, serialise([['person', 'cell', 'prior_value', 'reader_basis'], ['lincoln_abraham', 'competence', 'above:REFERENCE entry', 'old hold'], ['lincoln_abraham', 'reputation', 'average:REFERENCE entry', '0097 hold']])],
    [`${base}PROVENANCE.json`, JSON.stringify({ sources: [{ key: 'OLD', kind: 'primary' }, { key: 'REGISTER', kind: 'primary' }, { key: 'HOUSTON-DALY-1860', kind: 'primary' }] })],
    [`${base}gate/source-policy.json`, JSON.stringify({ weak: [], banned: [], evidence: { startBefore: '1861-03-05', innateThrough: '1861-07-31', innateStats: ['competence', 'nerve'], innateTraits: [], factTraits: [], referenceWorks: ['REGISTER'], factBlocs: ['army'] } })],
    [`${research}rs15.csv`, serialise([['person', 'cell', 'decision', 'proposed_direction', 'citations', 'basis', 'prior_value'],
      ['lincoln_abraham', 'competence', 'KEEP', 'above', 'NEW:CHASE-LINCOLN-1861-DOC p377 dated 1861-01-09', '[I] letter', 'above:REFERENCE entry'],
      ['lincoln_abraham', 'reputation', 'HOLD', '', '', '0097 hold', 'average:REFERENCE entry'],
      ['dix_john_a', 'competence', 'KEEP', 'above', 'NEW:DIX-BANKERS-1861-DOC p363 dated 1861-01', '[I] resolution', 'above:REFERENCE entry'],
    ])],
    [`${research}rs16.csv`, serialise([['person', 'cell', 'decision', 'proposed_direction', 'citations', 'basis', 'prior_value'],
      ['lee_robert_e', 'value:duty', 'HOLD', '', '', 'officer owner', 'duty:OLD p2'],
      ['houston_samuel', 'value:union', 'KEEP', 'union', 'NEW:HOUSTON-AUSTIN-1860-DOC p599 dated 1860-09-22', '[I] corroboration', 'union:HOUSTON-DALY-1860 p118 dated 1860-08-14'],
      ['houston_samuel', 'value:slavery_defence', 'CHANGE', 'slavery_defence', 'NEW:HOUSTON-AUSTIN-1860-DOC p602 dated 1860-09-22', '[I] cost only; gate', ''],
    ])],
    [`${research}dating.csv`, serialise([['cell', 'citation', 'date', 'source of the date'],
      ['lee_robert_e/value:duty', 'OLD p2', '1861-04-20', 'later letter'],
      ['late/competence', 'OLD p8', '1861-07..1861-08', 'crosses innate boundary'],
      ['late/value:order', 'OLD p9', '1861-03', 'crosses start boundary'],
      ['late/regard_others:lincoln_abraham', 'OLD p10', '1861-02', 'timely month'],
      ['lincoln_abraham/reputation', 'REFERENCE entry', 'not found', 'not a dated appraisal'],
    ])],
  ]);
}
function run(files = fixture()) {
  const { applyS9 } = require('../../../docs/research/_resource/tools/apply-s9.js');
  const result = applyS9(files);
  const rows = parse(result.outputs.get(people));
  return { ...result, files, rows: new Map<string, string[]>(rows.slice(1).map((r: string[]) => [r[0], r])) };
}

describe('S9 incremental people apply', () => {
  it('restores rs15 held directions and keeps Lincoln reputation held', () => {
    const { rows, outputs } = run();
    expect(rows.get('lincoln_abraham')![1]).toBe('above:CHASE-LINCOLN-1861-DOC p377 dated 1861-01-09');
    expect(rows.get('lincoln_abraham')![3]).toBe('');
    expect(outputs.get(held)).not.toContain('lincoln_abraham,competence,');
    expect(outputs.get(held)).toContain('lincoln_abraham,reputation,average:REFERENCE entry');
  });
  it('preserves every column of protected officers and unrelated Houston fields', () => {
    const { rows, files } = run();
    const before = parse(files.get(people));
    expect(rows.get('lee_robert_e')).toEqual(before.find((r: string[]) => r[0] === 'lee_robert_e'));
    expect(rows.get('houston_samuel')![6]).toBe('davis_jefferson:below:OLD p3');
  });
  it('appends corroboration once and keeps unsigned gate recommendations out of live data', () => {
    const { rows, outputs } = run();
    expect(rows.get('houston_samuel')![4]).toBe('union:HOUSTON-DALY-1860 p118 dated 1860-08-14+HOUSTON-AUSTIN-1860-DOC p599 dated 1860-09-22');
    expect(rows.get('houston_samuel')![4]).not.toContain('slavery_defence');
    const draft = JSON.parse(outputs.get(`${base}situations/drafts/s9-people-gate.json`));
    expect(draft.status).toBe('draft');
    expect(draft.recommendations[0].cell).toBe('value:slavery_defence');
    expect(draft.gateReview).toBeUndefined();
  });
  it('keeps month and range precision, holds boundary-crossing judgments, and dates the named relationship', () => {
    const { rows, outputs } = run();
    expect(rows.get('dix_john_a')![1]).toContain('dated 1861-01');
    expect(rows.get('dix_john_a')![1]).not.toContain('dated 1861-01-01');
    expect(rows.get('late')![1]).toBe('');
    expect(rows.get('late')![4]).toBe('');
    expect(rows.get('late')![6]).toBe('lincoln_abraham:above:OLD p10 dated 1861-02');
    expect(outputs.get(held)).toContain('dated 1861-07..1861-08');
    expect(outputs.get(held)).toContain('dated 1861-03');
  });
  it('produces repeatable bytes on reapply without replaying old rounds or restoring dated holds', () => {
    const first = run();
    const again = run(new Map([...first.files, ...first.outputs]));
    expect([...again.outputs]).toEqual([...first.outputs]);
  });
  it('rejects a malformed date before producing outputs', () => {
    const files = fixture();
    files.set(`${research}dating.csv`, files.get(`${research}dating.csv`)!.replace('1861-02,', '1861-99,'));
    expect(() => run(files)).toThrow(/date/i);
  });
  it('uses the verified supplemental date over an unresolved older spelling, but refuses conflicting verified dates', () => {
    const files = fixture();
    files.set(`${research}dating.csv`, files.get(`${research}dating.csv`) + 'late/regard_others:lincoln_abraham,OLD p10,not found,older inventory\n');
    expect(run(files).rows.get('late')![6]).toContain('dated 1861-02');
    files.set(`${research}dating.csv`, files.get(`${research}dating.csv`) + 'late/regard_others:lincoln_abraham,OLD p10,1861-01,conflicting verified reading\n');
    expect(() => run(files)).toThrow(/Conflicting dates/);
  });
  it('preserves the source format unknown sentinel without manufacturing held judgments', () => {
    const files = fixture();
    const rows = parse(files.get(people));
    rows.find((r: string[]) => r[0] === 'lincoln_abraham')[3] = 'unknown';
    files.set(people, serialise(rows));
    expect(run(files).rows.get('lincoln_abraham')![3]).toBe('unknown');
  });
  it('refuses to erase a later owner-cleared cell with an older HOLD', () => {
    const files = fixture();
    const rows = parse(files.get(people));
    rows.find((r: string[]) => r[0] === 'lincoln_abraham')[3] = 'high:OLD new-evidence';
    files.set(people, serialise(rows));
    expect(() => run(files)).toThrow(/HOLD.*conflict/);
  });
  it('opts into an individually reviewed S6 innate leg without consuming the later observation table', () => {
    const files = fixture();
    const rows = parse(files.get(people));
    rows.push(['mcclellan_george_b', '', '', '', '', '', '', '', '', '', '', '']);
    files.set(people, serialise(rows));
    files.set(`${research}s9-backlog.csv`, serialise([
      ['person', 'cell', 'decision', 'proposed_direction', 'citations', 'basis', 'prior_value'],
      ['mcclellan_george_b', 'competence', 'KEEP', 'above', 'NEW:SHERMAN-MCCLELLAN-1861-DOC pp120-121 dated 1861-05-20', '[I] third-party appraisal', 'above:OLD later-diary'],
    ]));
    expect(run(files).rows.get('mcclellan_george_b')![1]).toContain('above:SHERMAN-MCCLELLAN-1861-DOC');
    files.set(`${research}s9-backlog.csv`, files.get(`${research}s9-backlog.csv`)!.replace(',KEEP,above,', ',HOLD,above,'));
    expect(() => run(files)).toThrow(/S6.*HOLD/);
  });
});
