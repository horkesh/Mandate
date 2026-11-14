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

  it('reads claims in any case and anywhere in a sentence, and not a possessive (review S2)', () => {
    // The real 0015 and 0046 wordings.
    expect(forwardRelationsOf('accepted. Supersedes 0011. Clarifies 0007 and widens 0009. Design: x.')).toEqual([
      { relation: 'superseded', target: '0011' },
      { relation: 'clarified', target: '0007' },
      { relation: 'widened', target: '0009' },
    ]);
    expect(forwardRelationsOf('accepted. Applies 0021 and 0026; amends 0032 and 0040. Design: x.')).toEqual([
      { relation: 'amended', target: '0032' },
      { relation: 'amended', target: '0040' },
    ]);
    // Possessives are prose about a rule of a record (0033, 0040, 0044), with either apostrophe, and end a list.
    expect(forwardRelationsOf("accepted. Amends 0016; extends 0031's sourcing rule to all pack data; supersedes 0028’s lever.")).toEqual([{ relation: 'amended', target: '0016' }]);
    expect(forwardRelationsOf("accepted. Amends 0016 and 0028's lever.")).toEqual([{ relation: 'amended', target: '0016' }]);
    // Verbs without a number straight after them are prose ("amends how 0022 and 0038 present AI").
    expect(forwardRelationsOf('accepted. Extends 0037 and amends how 0022 and 0038 present AI.')).toEqual([{ relation: 'extended', target: '0037' }]);
  });

  it('reads Refines as a relation, and its mirror "refined by"', () => {
    expect(forwardRelationsOf('accepted. Refines 0008, 0015 and FOUNDATION sections 5 and 8.')).toEqual([
      { relation: 'refined', target: '0008' },
      { relation: 'refined', target: '0015' },
    ]);
    expect(relationsOf('accepted; refined by 0032')).toEqual(['refined by 0032']);
  });

  it('reads what a record says it does to others, in lists with notes', () => {
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

  it('flags a lower-case claim inside a sentence that the target does not say back: the 0015 and 0046 cases (review S2)', () => {
    const quiet = [files[0]!, record('0002-second.md', 'accepted. Supersedes 0001.'), record('0003-third.md', 'accepted. Clarifies 0001 and widens 0002.')];
    expect(indexProblems(index(rows[0]!, ['0002', '0002-second.md', 'accepted'], ['0003', '0003-third.md', 'accepted']), quiet)).toEqual([
      '0003: its Status says it widens 0002, but 0002\'s Status lacks "widened by 0003"',
      '0003: its Status says it clarifies 0001, but 0001\'s Status lacks "clarified by 0003"',
    ].sort());
    const later = [files[0]!, record('0002-second.md', 'accepted. Supersedes 0001.'), record('0003-third.md', 'accepted. Applies 0001; amends 0001 and 0002.')];
    expect(indexProblems(index(rows[0]!, ['0002', '0002-second.md', 'accepted'], ['0003', '0003-third.md', 'accepted']), later)).toEqual([
      '0003: its Status says it amends 0001, but 0001\'s Status lacks "amended by 0003"',
      '0003: its Status says it amends 0002, but 0002\'s Status lacks "amended by 0003"',
    ]);
  });

  it('flags a refinement the target does not say back, and accepts one it does (review S2)', () => {
    const one = [record('0001-first.md', 'accepted.'), record('0002-second.md', 'accepted. Refines 0001.')];
    expect(indexProblems(index(['0001', '0001-first.md', 'accepted'], ['0002', '0002-second.md', 'accepted']), one)).toEqual(['0002: its Status says it refines 0001, but 0001\'s Status lacks "refined by 0002"']);
    const both = [record('0001-first.md', 'accepted. Refined by 0002.'), record('0002-second.md', 'accepted. Refines 0001.')];
    expect(indexProblems(index(['0001', '0001-first.md', 'accepted; refined by 0002'], ['0002', '0002-second.md', 'accepted']), both)).toEqual([]);
  });

  it('ignores a possessive: prose about a rule of another record is not a claim about it', () => {
    const prose = [record('0001-first.md', 'accepted.'), record('0002-second.md', "accepted. Extends 0001's sourcing rule to all pack data.")];
    expect(indexProblems(index(['0001', '0001-first.md', 'accepted'], ['0002', '0002-second.md', 'accepted']), prose)).toEqual([]);
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

  describe('losing a claim from both sides is still caught (the reviewer’s mutations of the real files)', () => {
    const readme = readFileSync(join(dir, 'README.md'), 'utf8');
    /** Replace `from` with `to` in one record's text and in the index, requiring both to be there. */
    const without = (number: string, status: string, index: [string, string]) => {
      const edited = records.map((r) => {
        if (!r.name.startsWith(number)) return r;
        if (!r.text.includes(status)) throw new Error(`${r.name} no longer says "${status}"; update this test`);
        return { ...r, text: r.text.replace(status, '') };
      });
      if (!readme.includes(index[0])) throw new Error(`the index row no longer says "${index[0]}"; update this test`);
      return indexProblems(readme.replace(index[0], index[1]), edited);
    };

    it('0009 loses "widened by 0015" from its record and its row: 0015 still says it widens 0009', () => {
      expect(without('0009', 'widened by 0015 (a non-player principal may be an AI seat with a rule fallback)', ['accepted; widened by 0015 |', 'accepted |'])).toEqual([
        '0015: its Status says it widens 0009, but 0009\'s Status lacks "widened by 0015"',
      ]);
    });

    it('0032 loses "and 0046" from its record and its row: 0046 still says it amends 0032', () => {
      const problems = without('0032', ' and 0046 (security orders go through a holder or a situation option, never a free-standing verb)', ['accepted; amended by 0040, 0046 |', 'accepted; amended by 0040 |']);
      expect(problems).toEqual(['0046: its Status says it amends 0032, but 0032\'s Status lacks "amended by 0046"']);
    });
  });
});
