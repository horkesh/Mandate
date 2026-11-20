import { execFileSync, spawnSync } from 'node:child_process';
import { ledgerHistoryProblems, type LivenessChange } from './rules/liveness-causes.ts';
import { baselineHistoryProblems, fingerprint, type Finding } from './rules/common.ts';

export const ORIGIN = 'tools/rules/liveness-origin.json';
export const LEDGER = 'tools/rules/liveness-changes.json';
export const FINDINGS = 'tools/rules/existing-findings.json';
/** Read exact index blobs, honoring GIT_INDEX_FILE, never the working copy.
 * Missing in both trees means an older/disposable fixture repository predates S18.
 */
export function stagedRuleHistoryProblems(root: string): string[] {
  const read = (spec: string): string | null => {
    const result = spawnSync('git', ['show', spec], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    if (result.status === 0) return result.stdout;
    // Distinguish an absent path from a broken Git command: prove whether the tree contains it.
    const revision = spec.startsWith(':') ? null : 'HEAD';
    const files = execFileSync('git', revision ? ['ls-tree', '-r', '--name-only', revision] : ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n');
    if (!files.includes(spec.slice(spec.indexOf(':') + 1))) return null;
    throw new Error(`cannot read ${spec}: ${result.stderr}`);
  };
  const oldOrigin = read(`HEAD:${ORIGIN}`);
  const newOrigin = read(`:${ORIGIN}`);
  const oldLedger = read(`HEAD:${LEDGER}`);
  const newLedger = read(`:${LEDGER}`);
  const problems: string[] = [];
  const oldFindings = read(`HEAD:${FINDINGS}`);
  const newFindings = read(`:${FINDINGS}`);
  if (oldFindings !== null) {
    if (newFindings === null) problems.push('the known-finding baseline must remain present, even when empty');
    else {
      const changed = execFileSync('git', ['diff', '--cached', '--name-only', 'HEAD', '--', 'tools/rules/*.ts', 'tools/check-rules.ts'], { cwd: root, encoding: 'utf8' }).trim().length > 0;
      problems.push(...baselineHistoryProblems(JSON.parse(oldFindings) as Finding[], JSON.parse(newFindings) as Finding[], changed));
    }
  }
  if (oldOrigin === null && newOrigin === null && oldLedger === null && newLedger === null) return problems;
  if (newOrigin === null || newLedger === null) return ['liveness origin and cause history must remain present in the staged tree'];
  if (oldOrigin !== null && fingerprint(JSON.parse(oldOrigin)) !== fingerprint(JSON.parse(newOrigin))) problems.push('the S18 liveness origin is immutable; append a cause record instead');
  problems.push(...ledgerHistoryProblems(oldLedger === null ? [] : JSON.parse(oldLedger) as LivenessChange[], JSON.parse(newLedger) as LivenessChange[]));
  return problems;
}
