import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ruleFindings, ROOT } from './check-rules.ts';
import { collectBands, livenessProblems, type Bands, type LivenessChange } from './rules/liveness-causes.ts';
import { filesUnder, jsonAt, type JsonItem } from './rules/common.ts';
import { signedPackFindings } from './rules/signed-pack.ts';

/** Read-only audit of a pinned exported Git tree. It does not load a game or repair an input. */
const root = resolve(process.argv[2] ?? ROOT);
const output = process.argv[3];
const items: JsonItem[] = filesUnder(root, 'packs').filter(p => /\/situations\/(?:drafts\/)?[^/]+\.json$/.test(p))
  .map(path => ({ path, value: JSON.parse(readFileSync(join(root, path), 'utf8')) as Record<string, unknown> }));
const liveness = await import(pathToFileURL(join(root, 'packages/cli/src/liveness-gate.ts')).href) as { REFERENCE_RUNS: { name: string; bands: Bands }[] };
const report = {
  root,
  situationCount: items.length,
  signedCount: items.filter(i => i.value.gateReview != null).length,
  findings: ruleFindings(root),
  signedFindings: signedPackFindings(root, items),
  livenessProblems: livenessProblems(jsonAt<{ bands: Bands }>(ROOT, 'tools/rules/liveness-origin.json').bands, collectBands(liveness.REFERENCE_RUNS), jsonAt<LivenessChange[]>(ROOT, 'tools/rules/liveness-changes.json'), jsonAt<LivenessChange[]>(ROOT, 'tools/rules/inherited-quiet-bands.json')),
  livenessBands: Object.keys(collectBands(liveness.REFERENCE_RUNS)).length,
};
if (output) writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
else console.log(JSON.stringify(report, null, 2));
