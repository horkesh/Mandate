/** Certify the union of the two accepted parents' protected-reader identities. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { filesUnder } from './rules/common.ts';
import { projectionFindings, type Source } from './rules/projection-truth.ts';

const stage = process.argv[2]!;
assert(/^[a-z0-9-]+$/.test(stage));
const isSource = (p: string) => /\.[cm]?[jt]sx?$/.test(p) && !/(?:\/tests?\/|\.test\.|\.d\.ts$)/.test(p);
function parent(ref: string): Source[] {
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', ref, '--', 'packages', 'prototypes/desk'], { encoding: 'utf8' }).trim().split('\n').filter(isSource);
  const bytes = execFileSync('git', ['cat-file', '--batch'], { input: paths.map(p => `${ref}:${p}\n`).join(''), maxBuffer: 32 * 1024 * 1024 });
  let offset = 0;
  return paths.map(path => {
    const end = bytes.indexOf(10, offset);
    const size = Number(bytes.subarray(offset, end).toString().split(' ')[2]);
    assert(Number.isSafeInteger(size));
    const code = bytes.subarray(end + 1, end + 1 + size).toString('utf8').replaceAll('\r\n', '\n');
    offset = end + 2 + size;
    return { path, code };
  });
}
const sources = ['packages', 'prototypes/desk'].flatMap(p => filesUnder(process.cwd(), p)).filter(isSource).map(path => ({ path, code: readFileSync(path, 'utf8').replaceAll('\r\n', '\n') }));
const current = projectionFindings(sources, []);
const parents = ['7d3c1bcd', 'de3a6601'].map(ref => ({ ref, findings: projectionFindings(parent(ref), []) }));
const root = (r: { path: string; detail: string }) => `${r.path}:${r.detail.split(' reaches ')[0]}`;
const readers = (detail: string) => detail.split(' reaches ')[1]!.split('; ');
for (const row of current) {
  const expected = [...new Set(parents.flatMap(p => p.findings.filter(r => root(r) === root(row)).flatMap(r => readers(r.detail))))].sort();
  assert.deepEqual(readers(row.detail).sort(), expected, `unreviewed reader at ${root(row)}`);
}
assert.equal(current.length, parents[0]!.findings.length);
const permissionPath = 'tools/rules/projection-derivations.json';
const permissions = JSON.parse(readFileSync(permissionPath, 'utf8'));
for (const row of current) {
  const permission = permissions.find((p: { path: string; symbol: string }) => `${p.path}:${p.symbol}` === root(row));
  assert(permission);
  if (permission.hash === row.hash) continue;
  permission.hash = row.hash;
  permission.reason += ' S153: exact union of both accepted parent reader identities; S148 task readers and S150 allocation/request readers retained. Disposable exact-State caching changes no authority or disclosure.';
  permission.citation += `; docs/audit/s153-evidence/${stage}-projection.json`;
}
writeFileSync(`docs/audit/s153-evidence/${stage}-projection.json`, JSON.stringify({ parents, current, exactUnion: true }, null, 2) + '\n');
writeFileSync(permissionPath, JSON.stringify(permissions, null, 2) + '\n');
assert.deepEqual(projectionFindings(sources, permissions), []);
console.log(JSON.stringify({ roots: current.length, exactUnion: true }));
