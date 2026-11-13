#!/usr/bin/env node
// Decision 0003, enforced: no setting names in engine code.
// Scans packages/*/{src,test,demo} for whole-word, case-sensitive matches of the
// terms in tools/pack-terms.txt. Packs, docs and tools are exempt.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const terms = readFileSync(join(root, 'tools', 'pack-terms.txt'), 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

if (terms.length === 0) {
  console.error('pack-terms.txt is empty; refusing to report a clean boundary over nothing.');
  process.exit(2);
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = new RegExp(`(?<![A-Za-z])(${terms.map(escape).join('|')})(?![a-z])`, 'g');

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(path);
    return /\.(ts|tsx|js|mjs|cjs|json)$/.test(entry.name) ? [path] : [];
  });
}

const packagesDir = join(root, 'packages');
const files = readdirSync(packagesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => ['src', 'test', 'demo'].flatMap((sub) => walk(join(packagesDir, d.name, sub))));

if (files.length === 0) {
  console.error('No engine files found to scan; refusing to report a clean boundary over nothing.');
  process.exit(2);
}

const hits = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const match of line.matchAll(pattern)) {
      hits.push(`${relative(root, file)}:${i + 1}: "${match[1]}"`);
    }
  });
}

if (hits.length > 0) {
  console.error(`Pack boundary violated (decision 0003). Setting terms in engine code:\n${hits.join('\n')}`);
  process.exit(1);
}
console.log(`Pack boundary clean: ${files.length} files, ${terms.length} terms.`);
