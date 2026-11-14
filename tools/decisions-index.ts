/**
 * The decisions index check (tooling batch; the steward once found 14 drifted
 * rows by hand). `docs/decisions/README.md` indexes every record, and each
 * row's status must say what the record's own Status line says:
 *
 * - every `docs/decisions/NNNN-*.md` has exactly one row, linking its file;
 * - every row has a record, and numbers run 0001 up with no gap (records are
 *   "numbered, never reused");
 * - the row's leading status word (accepted, proposed, superseded) matches the
 *   record's;
 * - the row's amendment notes match the record's: the same relations to the
 *   same records, in either direction of drift. A relation is one of
 *   `amended by`, `clarified by`, `extended by`, `widened by`, `confirmed by`,
 *   `superseded by` or `replaced by`, followed by record numbers (a number may
 *   carry a parenthetical, and a list joins with commas and `and`);
 * - every record number a relation names is a record;
 * - a record that says it "Amends 0016" (or Clarifies, Extends, Widens, Confirms,
 *   Supersedes, Replaces: the sentence-initial forms) is named back by the
 *   target's own Status ("amended by" that record; a target that says
 *   "replaced by" counts as amended).
 *
 * Pure functions over text, so the test can run them on the real files and on
 * deliberately broken ones.
 */

export const RELATIONS = ['amended', 'clarified', 'extended', 'widened', 'confirmed', 'superseded', 'replaced'] as const;
export type Relation = (typeof RELATIONS)[number];

export interface IndexRow {
  readonly number: string;
  /** The link target in the row (`0002-typescript-deterministic-kernel.md`). */
  readonly file: string;
  readonly title: string;
  readonly status: string;
}

export interface RecordFile {
  /** `0002-typescript-deterministic-kernel.md` */
  readonly name: string;
  readonly text: string;
}

/** The rows of the index table, in file order. Lines that are not rows are ignored. */
export function parseIndex(text: string): IndexRow[] {
  const rows: IndexRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^\|\s*\[(\d{4})\]\(([^)]+)\)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/.exec(line);
    if (m) rows.push({ number: m[1]!, file: m[2]!, title: m[3]!, status: m[4]! });
  }
  return rows;
}

/** A record's Status paragraph: the `Status:` line and any lines after it up to the next blank line. */
export function statusOf(text: string): string | null {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith('Status:'));
  if (start === -1) return null;
  const out = [lines[start]!.slice('Status:'.length).trim()];
  for (let i = start + 1; i < lines.length && lines[i]!.trim() !== ''; i++) out.push(lines[i]!.trim());
  return out.join(' ');
}

/** The leading status word, lowercased: `accepted`, `proposed`, `superseded`, ... */
export function statusHead(status: string): string {
  return /^[A-Za-z]+/.exec(status.trim())?.[0]?.toLowerCase() ?? '';
}

const NUMBER_WITH_NOTE = String.raw`\d{4}(?:\s*\([^()]*\))?`;
const RELATION = new RegExp(
  String.raw`\b(${RELATIONS.join('|')}) by (${NUMBER_WITH_NOTE}(?:(?:,\s*(?:and\s+)?|\s+and\s+)${NUMBER_WITH_NOTE})*)`,
  'gi',
);

/**
 * The relations a status names, as sorted unique `relation by NNNN` strings:
 * "accepted; amended by 0040 (walkthrough), 0041 and clarified by 0042" gives
 * `amended by 0040`, `amended by 0041`, `clarified by 0042`.
 */
export function relationsOf(status: string): string[] {
  const out = new Set<string>();
  for (const m of status.matchAll(RELATION)) {
    const relation = m[1]!.toLowerCase();
    // Strip the notes in parentheses, then read the numbers.
    for (const n of m[2]!.replace(/\([^()]*\)/g, ' ').matchAll(/\d{4}/g)) out.add(`${relation} by ${n[0]}`);
  }
  return [...out].sort();
}

const FORWARD: Readonly<Record<string, Relation>> = Object.freeze({
  Amends: 'amended',
  Clarifies: 'clarified',
  Extends: 'extended',
  Widens: 'widened',
  Confirms: 'confirmed',
  Supersedes: 'superseded',
  Replaces: 'replaced',
});
const FORWARD_RELATION = new RegExp(
  String.raw`\b(${Object.keys(FORWARD).join('|')}) (${NUMBER_WITH_NOTE}(?:(?:,\s*(?:and\s+)?|\s+and\s+)${NUMBER_WITH_NOTE})*)`,
  'g',
);

/**
 * What a record says it does to others ("Amends 0016, 0017 and 0023"), as
 * `{ relation, target }` pairs in the passive: `amended` means the target
 * should say "amended by <this record>". Only the sentence-initial capitalised
 * forms count: prose such as "extends 0031's sourcing rule" is not a claim
 * about the target's Status.
 */
export function forwardRelationsOf(status: string): { relation: Relation; target: string }[] {
  const out: { relation: Relation; target: string }[] = [];
  for (const m of status.matchAll(FORWARD_RELATION)) {
    for (const n of m[2]!.replace(/\([^()]*\)/g, ' ').matchAll(/\d{4}/g)) out.push({ relation: FORWARD[m[1]!]!, target: n[0] });
  }
  return out;
}

const numberOf = (name: string): string => name.slice(0, 4);

/** Every problem between the index and the records, in a stable order. Empty when they agree. */
export function indexProblems(indexText: string, records: readonly RecordFile[]): string[] {
  const problems: string[] = [];
  const rows = parseIndex(indexText);
  const byNumber = new Map<string, IndexRow[]>();
  for (const r of rows) byNumber.set(r.number, [...(byNumber.get(r.number) ?? []), r]);
  const files = new Map<string, RecordFile[]>();
  for (const f of records) files.set(numberOf(f.name), [...(files.get(numberOf(f.name)) ?? []), f]);

  const numbers = [...new Set([...byNumber.keys(), ...files.keys()])].sort();
  for (const n of numbers) {
    const theseRows = byNumber.get(n) ?? [];
    const theseFiles = files.get(n) ?? [];
    if (theseFiles.length > 1) problems.push(`${n}: two record files carry this number (${theseFiles.map((f) => f.name).join(', ')}); numbers are never reused`);
    if (theseRows.length > 1) problems.push(`${n}: the index has ${theseRows.length} rows for this record`);
    if (theseFiles.length === 0) {
      problems.push(`${n}: the index lists a record that has no file in docs/decisions`);
      continue;
    }
    if (theseRows.length === 0) {
      problems.push(`${n}: ${theseFiles[0]!.name} is not in the index (docs/decisions/README.md)`);
      continue;
    }
    const file = theseFiles[0]!;
    const row = theseRows[0]!;
    if (row.file !== file.name) problems.push(`${n}: the index row links ${row.file}, but the record is ${file.name}`);
    const status = statusOf(file.text);
    if (status === null) {
      problems.push(`${n}: ${file.name} has no Status line`);
      continue;
    }
    if (statusHead(row.status) !== statusHead(status)) {
      problems.push(`${n}: the index says "${statusHead(row.status)}", the record's Status says "${statusHead(status)}"`);
    }
    const inIndex = relationsOf(row.status);
    const inRecord = relationsOf(status);
    const missingFromIndex = inRecord.filter((r) => !inIndex.includes(r));
    const missingFromRecord = inIndex.filter((r) => !inRecord.includes(r));
    if (missingFromIndex.length > 0) problems.push(`${n}: the record's Status says ${missingFromIndex.join(', ')}, which the index row lacks`);
    if (missingFromRecord.length > 0) problems.push(`${n}: the index row says ${missingFromRecord.join(', ')}, which the record's Status lacks`);
    for (const r of inRecord) {
      const other = r.slice(-4);
      if (!files.has(other)) problems.push(`${n}: its Status names ${other} (${r}), which is not a record`);
    }
  }

  // A record that says it amends another is named back by that record's Status.
  const statuses = new Map<string, string>();
  for (const f of records) {
    const s = statusOf(f.text);
    if (s !== null) statuses.set(numberOf(f.name), s);
  }
  for (const [n, status] of [...statuses].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    for (const { relation, target } of forwardRelationsOf(status)) {
      const verb = Object.entries(FORWARD).find(([, r]) => r === relation)![0];
      if (!files.has(target)) {
        problems.push(`${n}: its Status says it ${verb.toLowerCase()} ${target}, which is not a record`);
        continue;
      }
      const back = relationsOf(statuses.get(target) ?? '');
      const accepted = relation === 'amended' ? [`amended by ${n}`, `replaced by ${n}`] : [`${relation} by ${n}`];
      if (!accepted.some((a) => back.includes(a))) problems.push(`${n}: its Status says it ${verb.toLowerCase()} ${target}, but ${target}'s Status lacks "${relation} by ${n}"`);
    }
  }

  // "Numbered, never reused": no gaps from 0001 to the last.
  const last = numbers.length > 0 ? Number(numbers[numbers.length - 1]) : 0;
  for (let i = 1; i <= last; i++) {
    const n = String(i).padStart(4, '0');
    if (!files.has(n) && !byNumber.has(n)) problems.push(`${n}: no record and no row; records are numbered without gaps`);
  }
  return problems;
}
