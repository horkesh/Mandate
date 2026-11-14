#!/usr/bin/env node
// Decision 0035, enforced: dependency licences are on the allow-list (tools/licences.ts),
// in every package-lock.json in the repository: the workspace's and each prototype's.
import { fileURLToPath } from 'node:url';
import { checkLockfiles } from './licences.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const reports = checkLockfiles(root);
if (!reports.some((r) => r.file === 'package-lock.json')) {
  console.error('No root package-lock.json found; refusing to report licences over nothing.');
  process.exit(2);
}
let failed = false;
for (const r of reports) {
  if (r.unreadable) {
    console.error(`${r.file}: ${r.unreadable}; refusing to report licences over nothing.`);
    failed = true;
  } else if (r.checked === 0) {
    console.error(`${r.file}: no dependencies found; refusing to report a clean result over nothing.`);
    failed = true;
  } else if (r.problems.length > 0) {
    console.error(`${r.file}: dependency licences not allowed (decision 0035):\n${r.problems.map((p) => `  ${p.path}: ${p.licence} (${p.reason})`).join('\n')}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`Dependency licences clean: ${reports.map((r) => `${r.file} (${r.checked} packages)`).join(', ')}.`);
