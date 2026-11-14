import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { forwardRelationsOf, indexProblems, parseIndex, relationsOf, statusHead, statusOf, type RecordFile } from '../decisions-index.ts';

/** A record file whose Status line is `status`. */
const record = (name: string, status: string): RecordFile => ({ name, text: `# ${name.slice(0, 4)}: A title\n\nStatus: ${status}\n\n## Context\n\nText.\n` });
const index = (...rows: readonly [string, string, string][]): string =>
  ['# Decision records', '', '| # | Title | Status |', '|---|---|---|', ...rows.map(([n, file, status]) => `| [${n}](${file}) | A title | ${status} |`)].join('\n');

describe('reading the index and the Status line', () => {
  it('reads rows, and ignores everything else in the file', () => {
    const text = `Intro.\n\n| # | Title | Status |\n|---|---|---|\n| [0002](0002-x.md) | TypeScript kernel | accepted; clarified by 0044 |\n\nOutro.`;
    expect(parseIndex(text)).toEqual([{ number: '0002', file: '0002-x.md', title: 'TypeScript kernel', status: 'accepted; clarified by 0044' }]);
  });

  it('takes the Status paragraph, across lines, and its leading word', () => {
    const text = '# 0001: T\n\nStatus: Superseded by 0016 (2026-11-14).\nAccepted earlier.\n\n## Context\n\nStatus: not this one\n';
    expect(statusOf(text)).toBe('Superseded by 0016 (2026-11-14). Accepted earlier.');
    expect(statusHead(statusOf(text)!)).toBe('superseded');
    expect(statusOf('# 0001: T\n\nNo status here.\n')).toBeNull();
  });

  it('reads relations with notes, lists, "and", several relations and a qualifying word', () => {
    expect(relationsOf('accepted; amended by 0026, 0033, 0040')).toEqual(['amended by 0026', 'amended by 0033', 'amended by 0040']);
    expect(relationsOf('accepted (2026-11-14); clarified by 0015 (seat responses) and 0020 (stats drawn at setup). Erratum: see 0099.')).toEqual(['clarified by 0015', 'clarified by 0020']);
    expect(relationsOf('accepted; amended by 0040, clarified by 0042')).toEqual(['amended by 0040', 'clarified by 0042']);
    expect(relationsOf('accepted; extended by 0019, confirmed by 0035')).toEqual(['confirmed by 0035', 'extended by 0019']);
    expect(relationsOf('accepted (2026-11-13); its test is replaced by 0024 (the "wars with fronts" test).')).toEqual(['replaced by 0024']);
    // Forward references and prose are not relations of this record.
    expect(relationsOf('accepted. Amends 0016 and 0017. It was amended by the lead, then by hand.')).toEqual([]);
  });

  it('reads what a record says it does to others, only in the sentence-initial form', () => {
    expect(forwardRelationsOf('accepted. Amends 0016, 0017, 0020 and 0023. Amended by 0040 (walkthrough).')).toEqual([
      { relation: 'amended', target: '0016' },
      { relation: 'amended', target: '0017' },
      { relation: 'amended', target: '0020' },
      { relation: 'amended', target: '0023' },
    ]);
    expect(forwardRelationsOf('accepted. Supersedes 0001. Extends 0013 (the map).')).toEqual([
      { relation: 'superseded', target: '0001' },
      { relation: 'extended', target: '0013' },
    ]);
    expect(forwardRelationsOf('accepted; amends the plan; extends 0031\'s sourcing rule to all pack data.')).toEqual([]);
  });
});

describe('the index against the records (each rule has a broken case)', () => {
  const files = [
    record('0001-first.md', 'superseded by 0002 (2026-11-14). Accepted earlier.'),
    record('0002-second.md', 'accepted (2026-11-14). Supersedes 0001. Amended by 0003 (a tweak).'),
    record('0003-third.md', 'accepted (2026-11-14). Amends 0002.'),
  ];
  const rows: [string, string, string][] = [
    ['0001', '0001-first.md', 'superseded by 0002'],
    ['0002', '0002-second.md', 'accepted; amended by 0003'],
    ['0003', '0003-third.md', 'accepted'],
  ];

  it('accepts records and an index that agree', () => {
    expect(indexProblems(index(...rows), files)).toEqual([]);
  });

  it('flags a record that is not in the index, and a row with no record', () => {
    expect(indexProblems(index(rows[0]!, rows[1]!), files)).toEqual(['0003: 0003-third.md is not in the index (docs/decisions/README.md)']);
    expect(indexProblems(index(...rows, ['0004', '0004-fourth.md', 'accepted']), files)).toEqual(['0004: the index lists a record that has no file in docs/decisions']);
  });

  it('flags a duplicate row, a duplicate number, and a row that links the wrong file', () => {
    expect(indexProblems(index(...rows, rows[2]!), files)).toEqual(['0003: the index has 2 rows for this record']);
    expect(indexProblems(index(...rows), [...files, record('0003-other.md', 'accepted')])).toEqual(['0003: two record files carry this number (0003-third.md, 0003-other.md); numbers are never reused']);
    expect(indexProblems(index(rows[0]!, rows[1]!, ['0003', '0003-thrid.md', 'accepted']), files)).toEqual(['0003: the index row links 0003-thrid.md, but the record is 0003-third.md']);
  });

  it('flags a record with no Status line', () => {
    expect(indexProblems(index(...rows), [files[0]!, files[1]!, { name: '0003-third.md', text: '# 0003: T\n\nNo status.\n' }])).toEqual(['0003: 0003-third.md has no Status line']);
  });

  it('flags a leading status word that differs', () => {
    expect(indexProblems(index(['0001', '0001-first.md', 'accepted'], rows[1]!, rows[2]!), files)).toEqual([
      '0001: the index says "accepted", the record\'s Status says "superseded"',
      '0001: the record\'s Status says superseded by 0002, which the index row lacks',
    ]);
  });

  it('flags a note the record has and the row lacks: the 0017 case', () => {
    expect(indexProblems(index(rows[0]!, ['0002', '0002-second.md', 'accepted'], rows[2]!), files)).toEqual(["0002: the record's Status says amended by 0003, which the index row lacks"]);
  });

  it('flags a note the row has and the record lacks, and one that names another relation', () => {
    expect(indexProblems(index(rows[0]!, rows[1]!, ['0003', '0003-third.md', 'accepted; extended by 0002']), files)).toEqual([
      "0003: the index row says extended by 0002, which the record's Status lacks",
    ]);
    // The 0003 case: the record says "replaced", the row says "amended".
    const replaced = [files[0]!, record('0002-second.md', 'accepted. Supersedes 0001. Replaced by 0003.'), files[2]!];
    expect(indexProblems(index(...rows), replaced)).toEqual([
      "0002: the record's Status says replaced by 0003, which the index row lacks",
      "0002: the index row says amended by 0003, which the record's Status lacks",
    ]);
  });

  it('flags a relation that names a record that does not exist', () => {
    const odd = [files[0]!, record('0002-second.md', 'accepted. Supersedes 0001. Amended by 0003 and 0009.'), files[2]!];
    expect(indexProblems(index(rows[0]!, ['0002', '0002-second.md', 'accepted; amended by 0003, 0009'], rows[2]!), odd)).toEqual([
      '0002: its Status names 0009 (amended by 0009), which is not a record',
    ]);
  });

  it('flags a record that says it amends another which does not say so back: the 0033 case', () => {
    const quiet = [files[0]!, record('0002-second.md', 'accepted. Supersedes 0001.'), files[2]!];
    expect(indexProblems(index(rows[0]!, ['0002', '0002-second.md', 'accepted'], rows[2]!), quiet)).toEqual([
      '0003: its Status says it amends 0002, but 0002\'s Status lacks "amended by 0003"',
    ]);
    // A target that says "replaced by" counts as amended; one that says nothing about a supersession does not.
    const replaced = [files[0]!, record('0002-second.md', 'accepted. Supersedes 0001. Replaced by 0003.'), files[2]!];
    expect(indexProblems(index(rows[0]!, ['0002', '0002-second.md', 'accepted; replaced by 0003'], rows[2]!), replaced)).toEqual([]);
    const nobody = [record('0001-first.md', 'accepted.'), files[1]!, files[2]!];
    expect(indexProblems(index(['0001', '0001-first.md', 'accepted'], rows[1]!, rows[2]!), nobody)).toEqual([
      '0002: its Status says it supersedes 0001, but 0001\'s Status lacks "superseded by 0002"',
    ]);
  });

  it('flags a forward reference to a record that does not exist', () => {
    const ghost = [files[0]!, files[1]!, record('0003-third.md', 'accepted. Amends 0002 and 0008.')];
    expect(indexProblems(index(...rows), ghost)).toEqual(['0003: its Status says it amends 0008, which is not a record']);
  });

  it('flags a gap in the numbering', () => {
    const gap = [files[0]!, files[2]!];
    expect(indexProblems(index(rows[0]!, rows[2]!), gap)).toContain('0002: no record and no row; records are numbered without gaps');
  });
});

describe('the real decisions', () => {
  const dir = fileURLToPath(new URL('../../docs/decisions/', import.meta.url));
  const records: RecordFile[] = readdirSync(dir)
    .filter((name) => /^\d{4}-.+\.md$/.test(name))
    .sort()
    .map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }));

  it('has records and rows to check (the check never passes over nothing)', () => {
    expect(records.length).toBeGreaterThan(50);
    expect(parseIndex(readFileSync(join(dir, 'README.md'), 'utf8')).length).toBe(records.length);
  });

  it('lists every record, and every row says what its record says', () => {
    expect(indexProblems(readFileSync(join(dir, 'README.md'), 'utf8'), records)).toEqual([]);
  });
});
