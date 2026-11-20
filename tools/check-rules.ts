import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { filesUnder, jsonAt, ratchet, type Finding, type JsonItem } from './rules/common.ts';
import { causeFindings, type CauseExemption } from './rules/situation-causes.ts';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export function ruleFindings(root: string): Finding[] {
  const situations: JsonItem[] = filesUnder(root, 'packs').filter(p => /\/situations\/(?:drafts\/)?[^/]+\.json$/.test(p))
    .map(path => ({ path, value: JSON.parse(readFileSync(join(root, path), 'utf8')) as Record<string, unknown> }));
  return causeFindings(situations, jsonAt<CauseExemption[]>(ROOT, 'tools/rules/cause-exemptions.json'));
}
export function checkRules(root: string): string[] {
  return ratchet(ruleFindings(root), jsonAt<Finding[]>(ROOT, 'tools/rules/existing-findings.json'));
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
