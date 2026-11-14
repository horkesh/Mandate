/**
 * World format v2 tooling (lane 0.2):
 *
 *   npm run pack:generate -- <pack>            build data/ from the sources, validate, write
 *   npm run pack:generate -- <pack> --check    fail if data/ is stale (what the test runs)
 *   npm run pack:generate -- <pack> --report   validate only and print issue counts by kind
 *   npm run pack:validate -- <pack>            validate the committed files (no sources needed)
 *   npm run pack:schemas [-- --check]          write (or check) the published JSON Schemas
 */
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { countByKind, errorsOf, formatIssue, generatePack, type Issue, loadPack, publishedSchemas, PUBLISHED_SCHEMAS_DIR, staleFiles } from '@mandate/pack-format';
import { writeGenerated } from './io/packs.ts';
import { filesUnder, packFilesAt, packRoot } from './pack-files.ts';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

function printIssues(issues: readonly Issue[], limit = 200): void {
  for (const i of issues.slice(0, limit)) console.log(formatIssue(i));
  if (issues.length > limit) console.log(`... and ${issues.length - limit} more`);
}

function printCounts(issues: readonly Issue[]): void {
  console.log(`${errorsOf(issues).length} errors, ${issues.length - errorsOf(issues).length} warnings`);
  for (const [kind, n] of countByKind(issues)) console.log(`  ${String(n).padStart(5)}  ${kind}`);
}

function generate(packId: string, mode: 'write' | 'check' | 'report'): number {
  const root = packRoot(packId);
  const result = generatePack(packFilesAt(root));
  if (mode === 'report') {
    printCounts(result.issues);
    return errorsOf(result.issues).length > 0 ? 1 : 0;
  }
  printIssues(result.issues);
  if (errorsOf(result.issues).length > 0) {
    printCounts(result.issues);
    return 1;
  }
  const stale = staleFiles(result.outputs, filesUnder(root, 'data'));
  if (mode === 'check') {
    for (const s of stale) console.log(`${s.problem}: packs/${packId}/${s.path}`);
    console.log(stale.length === 0 ? `packs/${packId}/data is up to date.` : `packs/${packId}/data is stale: run npm run pack:generate -- ${packId}`);
    return stale.length === 0 ? 0 : 1;
  }
  const write = new Map([...result.outputs].filter(([path]) => stale.some((s) => s.path === path)));
  writeGenerated(root, write, stale.filter((s) => s.problem === 'extra').map((s) => s.path));
  console.log(`packs/${packId}/data: ${write.size} written, ${stale.filter((s) => s.problem === 'extra').length} removed, ${result.outputs.size - write.size} unchanged.`);
  return 0;
}

function validate(packId: string): number {
  const { issues } = loadPack(packFilesAt(packRoot(packId)));
  printIssues(issues);
  printCounts(issues);
  return errorsOf(issues).length > 0 ? 1 : 0;
}

function schemas(check: boolean): number {
  const root = join(REPO_ROOT, ...PUBLISHED_SCHEMAS_DIR.split('/'));
  const wanted = new Map([...publishedSchemas()].map(([file, text]) => [`schemas/${file}`, text]));
  const stale = staleFiles(wanted, filesUnder(join(root, '..'), 'schemas'));
  if (check) {
    for (const s of stale) console.log(`${s.problem}: ${PUBLISHED_SCHEMAS_DIR}/${s.path.slice('schemas/'.length)}`);
    return stale.length === 0 ? 0 : 1;
  }
  writeGenerated(join(root, '..'), new Map([...wanted].filter(([p]) => stale.some((s) => s.path === p))), stale.filter((s) => s.problem === 'extra').map((s) => s.path));
  console.log(`${PUBLISHED_SCHEMAS_DIR}: ${stale.length} files updated.`);
  return 0;
}

function main(argv: readonly string[]): number {
  const [command, ...rest] = argv;
  const flags = new Set(rest.filter((a) => a.startsWith('--')));
  const [packId] = rest.filter((a) => !a.startsWith('--'));
  if (command === 'schemas') return schemas(flags.has('--check'));
  if (!packId || (command !== 'generate' && command !== 'validate')) {
    console.error('usage: pack.ts generate <pack> [--check | --report] | validate <pack> | schemas [--check]');
    return 2;
  }
  if (command === 'validate') return validate(packId);
  return generate(packId, flags.has('--check') ? 'check' : flags.has('--report') ? 'report' : 'write');
}

process.exitCode = main(process.argv.slice(2));
