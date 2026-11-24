import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { fingerprint } from '../rules/common.ts';
import { livenessProblems } from '../rules/liveness-causes.ts';
import { REFERENCE_RUNS } from '../../packages/cli/src/liveness-gate.ts';

const frozen = JSON.parse(readFileSync(new URL('./support/s134-quiet-transition.json', import.meta.url), 'utf8'));
const record = frozen.record;

it('permits only the lead-authorised S134 goal-fit zero with its independent unknown-strength driver', () => {
  expect(frozen.fingerprint).toBe('48a1f2aaed89179a9018f2f5039fcd0676624594b76bbd409bbac272a2bf9d88');
  expect(fingerprint(record)).toBe(frozen.fingerprint);
  expect(record.key).toBe('union-1861, war by decision, 148 days/planner.term.goal_fit');
  expect(record.after).toMatchObject({ minFires: 0, maxFires: 0 });
  expect(record.after).not.toHaveProperty('driver');
  expect(livenessProblems({ [record.key]: record.before }, { [record.key]: record.after }, [record])).toEqual([]);
  for (const changed of [
    { ...record, cause: 'another cause' }, { ...record, evidence: 'elsewhere' },
    { ...record, key: 'testbed, 120 days/planner.term.goal_fit' },
    { ...record, key: 'union-1861, war by decision, 148 days/planner.term.time' },
    { ...record, observed: 1 }, { ...record, before: null },
    { ...record, after: { ...record.after, why: 'another explanation' } },
    { ...record, after: { ...record.after, maxFires: 1 } },
    { ...record, after: { ...record.after, driver: { ...frozen.driver, needle: 'another driver' } } },
  ]) expect(livenessProblems({ [changed.key]: changed.before }, { [changed.key]: changed.after }, [changed])).not.toEqual([]);
  expect(readFileSync(new URL('../../' + frozen.driver.test, import.meta.url), 'utf8')).toContain(frozen.driver.needle);
  expect(record.cause).toContain(frozen.driver.needle);
  const history = JSON.parse(readFileSync(new URL('../rules/liveness-changes.json', import.meta.url), 'utf8'));
  expect(history.filter((r: typeof record) => r.key === record.key && r.evidence === record.evidence)).toEqual([record]);
  const current = REFERENCE_RUNS.find(r => record.key.startsWith(r.name + '/'))?.bands['planner.term.goal_fit'];
  expect(current).toEqual(record.after);
});
