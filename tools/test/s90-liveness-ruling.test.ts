import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { livenessProblems } from '../rules/liveness-causes.ts';
import { REFERENCE_RUNS } from '../../packages/cli/src/liveness-gate.ts';

const receipt = JSON.parse(readFileSync(new URL('./support/s90-quiet-transition.json', import.meta.url), 'utf8'));
const r = receipt.record;

describe('S90 continuation ruling 4', () => {
  it('permits only the exact authorized quiet messenger transition with its independent driver', () => {
    expect(readFileSync(new URL('../../' + receipt.driver.test, import.meta.url), 'utf8')).toContain(receipt.driver.needle);
    expect(livenessProblems({ [r.key]: r.before }, { [r.key]: r.after }, [r])).toEqual([]);
    for (const changed of [{ ...r, cause: 'another cause' }, { ...r, key: 'testbed, 120 days/messages.special_messenger' },
      { ...r, evidence: 'elsewhere' }, { ...r, observed: 1 }, { ...r, after: { ...r.after, maxFires: 1 } }]) {
      expect(livenessProblems({ [changed.key]: changed.before }, { [changed.key]: changed.after }, [changed])).not.toEqual([]);
    }
  });
  it('changes only the Union reference to quiet and around(9), leaving the testbed messenger live', () => {
    const union = REFERENCE_RUNS.find(run => run.name === 'union-1861, war by decision, 148 days')!;
    expect(union.bands['messages.special_messenger']).toEqual(r.after);
    expect(union.bands['orders.relayed']).toEqual({ minFires: 4, maxFires: 18 });
    expect(REFERENCE_RUNS.find(run => run.name === 'testbed, 120 days')!.bands['messages.special_messenger']!.minFires).toBe(1);
  });
});
