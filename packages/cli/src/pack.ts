/**
 * World format v2 tooling (lane 0.2):
 *
 *   npm run pack:generate -- <pack>            build data/ from the sources, validate, write
 *   npm run pack:generate -- <pack> --check    fail if data/ is stale (what the test runs)
 *   npm run pack:generate -- <pack> --report   validate only and print issue counts by kind
 *   npm run pack:validate -- <pack>            validate the committed files (no sources needed)
 *   npm run pack:schemas [-- --check]          write (or check) the published JSON Schemas
 *   npm run pack:gate-hash -- <pack>           print each situation's gate content hash, for a sign-off (lane 0.7)
 *   npm run pack:release-check -- <pack>       the ship rule (gate A8): fail if a release would ship a held topic or a fixture sign-off
 */
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  countByKind,
  errorsOf,
  formatIssue,
  gateContentHash,
  generatePack,
  type Issue,
  IssueSink,
  loadPack,
  localeStrings,
  publishedSchemas,
  PUBLISHED_SCHEMAS_DIR,
  readSituations,
  releaseProblems,
  staleFiles,
} from '@mandate/pack-format';
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

/** Each situation's gate content hash, whatever else is wrong with it: what a reviewer records in a sign-off. */
function gateHash(packId: string): number {
  const files = packFilesAt(packRoot(packId));
  const { pack } = generatePack(files);
  if (pack === null) {
    console.error(`packs/${packId}: the World does not validate; run npm run pack:generate -- ${packId} --report`);
    return 1;
  }
  const strings = localeStrings(pack.strings);
  for (const { file, def } of readSituations(files, new IssueSink())) console.log(`${gateContentHash(def, strings, pack.provenance)}  ${file}`);
  return 0;
}

/** The ship rule as a release check (gate A8). */
function releaseCheck(packId: string): number {
  const files = packFilesAt(packRoot(packId));
  const { pack, issues } = generatePack(files);
  if (pack === null || errorsOf(issues).length > 0 || !pack.gate) {
    printIssues(errorsOf(issues));
    console.error(`packs/${packId}: fix the pack's errors (and give it a gate/ folder) before a release check`);
    return 1;
  }
  const problems = releaseProblems(readSituations(files, new IssueSink()), pack.gate, pack.manifest.scenarios);
  for (const p of problems) console.log(`ship-blocker: ${p}`);
  console.log(problems.length === 0 ? `packs/${packId}: no ship-blockers for ${pack.manifest.scenarios.join(', ')}.` : `packs/${packId}: ${problems.length} ship-blockers.`);
  return problems.length === 0 ? 0 : 1;
}

function main(argv: readonly string[]): number {
  const [command, ...rest] = argv;
  const flags = new Set(rest.filter((a) => a.startsWith('--')));
  const [packId] = rest.filter((a) => !a.startsWith('--'));
  if (command === 'schemas') return schemas(flags.has('--check'));
  if (packId && command === 'gate-hash') return gateHash(packId);
  if (packId && command === 'release-check') return releaseCheck(packId);
  if (!packId || (command !== 'generate' && command !== 'validate')) {
    console.error('usage: pack.ts generate <pack> [--check | --report] | validate <pack> | schemas [--check] | gate-hash <pack> | release-check <pack>');
    return 2;
  }
  if (command === 'validate') return validate(packId);
  return generate(packId, flags.has('--check') ? 'check' : flags.has('--report') ? 'report' : 'write');
}

process.exitCode = main(process.argv.slice(2));
