import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { livenessProblems, type LivenessChange } from '../rules/liveness-causes.ts';

const record = JSON.parse(readFileSync(new URL('./support/s106-quiet-transition.json', import.meta.url), 'utf8')) as LivenessChange;
it('accepts only the evidence-bound retirement of the numeric-rung muster delay', () => {
  expect(livenessProblems({ [record.key]: record.before! }, { [record.key]: record.after! }, [record])).toEqual([]);
  for (const changed of [{ ...record, cause: 'other cause' }, { ...record, key: 'other run/mechanic' },
    { ...record, evidence: 'elsewhere' }, { ...record, observed: 1 }, { ...record, after: { ...record.after!, maxFires: 1 } }]) {
    expect(livenessProblems({ [changed.key]: changed.before! }, { [changed.key]: changed.after! }, [changed])).not.toEqual([]);
  }
});
