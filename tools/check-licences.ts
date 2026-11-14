#!/usr/bin/env node
// Decision 0035, enforced: dependency licences are on the allow-list (tools/licences.ts).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { licenceProblems, type LockEntry } from './licences.ts';

const lockPath = fileURLToPath(new URL('../package-lock.json', import.meta.url));
const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as { lockfileVersion?: number; packages?: Record<string, LockEntry> };
if (lock.lockfileVersion !== 3 || !lock.packages) {
  console.error('package-lock.json is not lockfile v3; refusing to report licences over nothing.');
  process.exit(2);
}
const checked = Object.entries(lock.packages).filter(([path, e]) => path.includes('node_modules/') && !e.link).length;
if (checked === 0) {
  console.error('No dependencies found in package-lock.json; refusing to report a clean result over nothing.');
  process.exit(2);
}
const problems = licenceProblems(lock.packages);
if (problems.length > 0) {
  console.error(`Dependency licences not allowed (decision 0035):\n${problems.map((p) => `  ${p.path}: ${p.licence} (${p.reason})`).join('\n')}`);
  process.exit(1);
}
console.log(`Dependency licences clean: ${checked} packages.`);
