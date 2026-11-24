import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { QUIET, REFERENCE_RUNS } from '../../packages/cli/src/liveness-gate.ts';
import { livenessProblems } from '../rules/liveness-causes.ts';
import { fingerprint } from '../rules/common.ts';

const read = (p: string) => JSON.parse(readFileSync(new URL('../../' + p, import.meta.url), 'utf8'));

it('recentres every moved positive testbed band and retains the flank evidence before the lead ruling', () => {
  const review = read('docs/audit/s134-evidence/repair/testbed-band-review.json');
  const changes = read('docs/audit/s134-evidence/repair/testbed-count-changes.json');
  const history = read('tools/rules/liveness-changes.json');
  const current = REFERENCE_RUNS.find(r => r.kind === 'full' && r.pack === 'testbed')!;
  const positive = changes.filter((r: any) => r.after.fires > 0 && r.after.fires !== r.before.fires);
  expect(QUIET).not.toHaveProperty('planner.term.glory');
  expect(review.records.map((r: any) => r.key).sort()).toEqual(positive.map((r: any) => current.name + '/' + r.mechanic).sort());
  for (const record of review.records) {
    expect(history).toContainEqual(record);
    expect(livenessProblems({ [record.key]: record.before }, { [record.key]: record.after }, [record])).toEqual([]);
    expect(current.bands[record.key.slice(current.name.length + 1)]).toEqual(record.after);
  }
  const flank = read('docs/audit/s134-evidence/repair/flank-zero.json');
  expect(flank).toMatchObject({ beforeFires: 1, afterFires: 0, requiresLeadBeforeHook: true, quietApplied: false });
  const authorised = read('tools/test/support/s134-flank-quiet-transition.json');
  expect(authorised.record.before).toEqual({ minFires: 1, maxFires: 4 });
  expect(current.bands['combat.flank_broken']).toEqual(authorised.record.after);
  expect(authorised.driver).toEqual(flank.driver);
  expect(readFileSync(new URL('../../' + flank.driver.test, import.meta.url), 'utf8')).toContain(flank.driver.needle);
});

it('permits only the lead-authorised testbed flank zero with its complete fingerprint and low-draw driver', () => {
  const frozen = read('tools/test/support/s134-flank-quiet-transition.json');
  const record = frozen.record;
  expect(frozen.fingerprint).toBe('f9b10278f80eec8fd448192c0175c5d80a7eb95cf79db3b4b110dbebe23cfcc0');
  expect(fingerprint(record)).toBe(frozen.fingerprint);
  expect(record.key).toBe('testbed, 120 days/combat.flank_broken');
  expect(record.after).toMatchObject({ minFires: 0, maxFires: 0 });
  expect(record.after).not.toHaveProperty('driver');
  expect(livenessProblems({ [record.key]: record.before }, { [record.key]: record.after }, [record])).toEqual([]);
  for (const changed of [
    { ...record, cause: 'another cause' }, { ...record, evidence: 'elsewhere' },
    { ...record, key: 'union-1861, war by decision, 148 days/combat.flank_broken' },
    { ...record, key: 'testbed, 120 days/planner.term.goal_fit' },
    { ...record, observed: 1 }, { ...record, before: null },
    { ...record, after: { ...record.after, why: 'another explanation' } },
    { ...record, after: { ...record.after, maxFires: 1 } },
    { ...record, after: { ...record.after, driver: frozen.driver } },
  ]) expect(livenessProblems({ [changed.key]: changed.before }, { [changed.key]: changed.after }, [changed])).not.toEqual([]);
  expect(record.cause).toContain(frozen.driver.needle);
  expect(readFileSync(new URL('../../' + frozen.driver.test, import.meta.url), 'utf8')).toContain(frozen.driver.needle);
  const history = read('tools/rules/liveness-changes.json');
  expect(history.at(-1)).toEqual(record);
});
