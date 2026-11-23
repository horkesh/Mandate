import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { fingerprint } from '../rules/common.ts';
import { livenessProblems } from '../rules/liveness-causes.ts';
import { QUIET, REFERENCE_RUNS } from '../../packages/cli/src/liveness-gate.ts';

const frozen = JSON.parse(readFileSync(new URL('./support/s130-quiet-transition.json', import.meta.url), 'utf8'));
const record = frozen.record;

it('permits only the lead-authorized S130 time zero with its complete cause and both named live drivers', () => {
  expect(frozen.fingerprint).toBe('9fa5be7cd39404a145de49a41a375e34efd5c6bba90be758a4de22e4dfb8ed67');
  expect(fingerprint(record)).toBe(frozen.fingerprint);
  expect(record.key).toBe('union-1861, war by decision, 148 days/planner.term.time');
  expect(record.after).toMatchObject({ minFires: 0, maxFires: 0 });
  expect(livenessProblems({ [record.key]: record.before }, { [record.key]: record.after }, [record])).toEqual([]);
  for (const changed of [
    { ...record, cause: 'another cause' }, { ...record, evidence: 'elsewhere' },
    { ...record, key: 'testbed, 120 days/planner.term.time' },
    { ...record, key: 'union-1861, war by decision, 148 days/planner.term.goal_fit' },
    { ...record, observed: 1 }, { ...record, before: null },
    { ...record, after: { ...record.after, why: 'another explanation' } },
    { ...record, after: { ...record.after, maxFires: 1 } },
  ]) expect(livenessProblems({ [changed.key]: changed.before }, { [changed.key]: changed.after }, [changed])).not.toEqual([]);
  expect(frozen.drivers).toEqual([
    { test: 'packages/cli/test/planner.test.ts', needle: 'S41 time live control: dropping time changes the chosen candidate' },
    { test: 'packages/cli/test/planner.test.ts', needle: 'counts every scoring term live in some case' },
  ]);
  for (const driver of frozen.drivers) {
    expect(readFileSync(new URL('../../' + driver.test, import.meta.url), 'utf8')).toContain(driver.needle);
    expect(record.cause).toContain(driver.needle);
  }
  expect(QUIET).not.toHaveProperty('planner.term.time');
});

it('keeps the accepted capture and frozen transition, with the S134 positive revival following it', () => {
  const review = JSON.parse(readFileSync(new URL('../../docs/audit/s130-evidence/band-review.json', import.meta.url), 'utf8'));
  const history = JSON.parse(readFileSync(new URL('../rules/liveness-changes.json', import.meta.url), 'utf8'));
  expect(review.quietApplied).toBe(true);
  expect(review.quietRecord).toEqual(frozen);
  expect(history).toContainEqual(record);
  expect(history.filter((r: typeof record) => r.evidence.startsWith('docs/audit/s130-evidence/') && r.observed === 0)).toEqual([record]);
  const revival = history.find((r: typeof record) => r.key === record.key && r.evidence === 'docs/audit/s134-evidence/merge/band-review.json#planner.term.time');
  expect(revival).toMatchObject({ before: record.after, observed: 1, after: { minFires: 1, maxFires: 4 } });
  const current = REFERENCE_RUNS.find(r => record.key.startsWith(r.name + '/'))!.bands['planner.term.time']!;
  const sameKey = history.filter((r: typeof record) => r.key === record.key);
  const inherited = JSON.parse(readFileSync(new URL('../rules/inherited-quiet-bands.json', import.meta.url), 'utf8'));
  expect(livenessProblems({ [record.key]: sameKey[0].before }, { [record.key]: current }, sameKey, inherited)).toEqual([]);
  expect(review.effectiveGateFailures).toEqual([]);
  for (const r of review.movedBands) {
    expect(r.observed).toBeGreaterThan(0);
    expect(history).toContainEqual(r);
    expect(livenessProblems({ [r.key]: r.before }, { [r.key]: r.after }, [r])).toEqual([]);
  }
  expect(review.movedBands).toHaveLength(11);
});
