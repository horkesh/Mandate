#!/usr/bin/env node
// The decisions index check (tools/decisions-index.ts): docs/decisions/README.md
// lists every record, and each row's status says what the record's own Status says.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexProblems, parseIndex, type RecordFile } from './decisions-index.ts';

const dir = fileURLToPath(new URL('../docs/decisions/', import.meta.url));
const records: RecordFile[] = readdirSync(dir)
  .filter((name) => /^\d{4}-.+\.md$/.test(name))
  .sort()
  .map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }));
const indexText = readFileSync(join(dir, 'README.md'), 'utf8');

if (records.length === 0) {
  console.error('No decision records found; refusing to report a clean index over nothing.');
  process.exit(2);
}
if (parseIndex(indexText).length === 0) {
  console.error('No index rows found in docs/decisions/README.md; refusing to report a clean index over nothing.');
  process.exit(2);
}
const problems = indexProblems(indexText, records);
if (problems.length > 0) {
  console.error(`The decisions index does not match the records:\n${problems.map((p) => `  ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`Decisions index clean: ${records.length} records, ${parseIndex(indexText).length} rows.`);
