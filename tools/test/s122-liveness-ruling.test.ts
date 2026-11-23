import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fingerprint } from '../rules/common.ts';
import { livenessProblems } from '../rules/liveness-causes.ts';
import { QUIET, REFERENCE_RUNS } from '../../packages/cli/src/liveness-gate.ts';

const receipt = JSON.parse(readFileSync(new URL('./support/s122-quiet-transition.json', import.meta.url), 'utf8'));
const record = receipt.record;

describe('S122 authorised landing zero', () => {
  it('accepts only the exact record, including its cause and evidence', () => {
    expect(livenessProblems({ [record.key]: record.before }, { [record.key]: record.after }, [record])).toEqual([]);
    for (const changed of [
      { ...record, key: 'testbed, 120 days/forces.landed_by_situation' },
      { ...record, cause: 'another cause' },
      { ...record, evidence: 'elsewhere' },
      { ...record, observed: 1 },
      { ...record, after: { ...record.after, maxFires: 1 } },
    ]) expect(livenessProblems({ [changed.key]: changed.before }, { [changed.key]: changed.after }, [changed])).not.toEqual([]);
  });

  it('binds the Union zero and its fingerprint to the paired fictional driver', () => {
    const review = JSON.parse(readFileSync(new URL('../../docs/audit/s122-evidence/band-review.json', import.meta.url), 'utf8'));
    expect(review.quietFingerprints).toEqual([{ key: record.key, fingerprint: fingerprint(record) }]);
    expect(REFERENCE_RUNS.find(r => r.name === 'union-1861, war by decision, 148 days')!.bands['forces.landed_by_situation']).toEqual(record.after);
    expect(QUIET['forces.landed_by_situation']).toEqual({ why: record.cause, ...receipt.driver });
    expect(readFileSync(new URL('../../' + receipt.driver.test, import.meta.url), 'utf8')).toContain(receipt.driver.needle);
  });
});
