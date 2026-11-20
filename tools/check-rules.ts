import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { filesUnder, jsonAt, ratchet, type Finding, type JsonItem } from './rules/common.ts';
import { causeFindings, type CauseExemption } from './rules/situation-causes.ts';
import { projectionFindings, type Derivation } from './rules/projection-truth.ts';
import { livenessProblems, type Bands, type LivenessChange } from './rules/liveness-causes.ts';
import { currentBands } from './rules/liveness-snapshot.ts';
import { withSituationContext } from './rules/pack-content.ts';
import { signedPackFindings } from './rules/signed-pack.ts';
import { signaturePresenceFindings } from './rules/signed-situations.ts';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export function ruleFindings(root: string): Finding[] {
  const situations: JsonItem[] = filesUnder(root, 'packs').filter(p => /\/situations\/(?:drafts\/)?[^/]+\.json$/.test(p))
    .map(path => ({ path, value: JSON.parse(readFileSync(join(root, path), 'utf8')) as Record<string, unknown> }));
  const sources = ['packages', 'prototypes/desk'].flatMap(p => filesUnder(root, p)).filter(p => /\.[cm]?[jt]sx?$/.test(p) && !/(?:\/tests?\/|\.test\.|\.d\.ts$)/.test(p))
    .map(path => ({ path, code: readFileSync(join(root, path), 'utf8').replaceAll('\r\n', '\n') }));
  return [
    ...causeFindings(withSituationContext(root, situations), jsonAt<CauseExemption[]>(ROOT, 'tools/rules/cause-exemptions.json')),
    ...projectionFindings(sources, jsonAt<Derivation[]>(ROOT, 'tools/rules/projection-derivations.json')),
    ...signedPackFindings(root, situations),
    ...signaturePresenceFindings(situations, jsonAt<string[]>(ROOT, 'tools/rules/signed-inventory.json')),
  ];
}
export function checkRules(root: string): string[] {
  const origin = jsonAt<{ bands: Bands }>(ROOT, 'tools/rules/liveness-origin.json');
  const changes = jsonAt<LivenessChange[]>(ROOT, 'tools/rules/liveness-changes.json');
  return [
    ...ratchet(ruleFindings(root), jsonAt<Finding[]>(ROOT, 'tools/rules/existing-findings.json')),
    ...livenessProblems(origin.bands, currentBands, changes),
    ...changes.filter(c => !existsSync(join(root, c.evidence.split('#')[0]!))).map(c => `${c.key}: cause evidence file does not exist: ${c.evidence}`),
  ];
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--report')) console.log(JSON.stringify(ruleFindings(ROOT), null, 2));
  else {
    const problems = checkRules(ROOT);
    for (const p of problems) console.error(p);
    console.log(`rules: ${problems.length} new, changed or stale findings`);
    process.exitCode = problems.length > 0 ? 1 : 0;
  }
}
