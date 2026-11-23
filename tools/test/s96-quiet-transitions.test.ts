import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { livenessProblems, type LivenessChange } from '../rules/liveness-causes.ts';

const records = JSON.parse(readFileSync(new URL('./support/s96-quiet-transitions.json', import.meta.url), 'utf8')) as LivenessChange[];

it('accepts only the four exact S96 new quiet diagnostic records, retaining their independent drivers', () => {
  expect(records).toHaveLength(4);
  for (const record of records) {
    const table = { [record.key]: record.after! };
    expect(livenessProblems({}, table, [record])).toEqual([]);
    for (const changed of [{ ...record, cause: 'unrelated cause' }, { ...record, evidence: 'unread evidence' },
      { ...record, key: 'another run/mechanic' }, { ...record, before: { minFires: 1, maxFires: 4 } },
      { ...record, after: { ...record.after!, maxFires: 1 } }]) {
      expect(livenessProblems({}, { [changed.key]: changed.after! }, [changed])).not.toEqual([]);
    }
  }
});
