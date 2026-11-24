import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { livenessProblems } from '../rules/liveness-causes.ts';
import { fingerprint } from '../rules/common.ts';
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
  it('keeps the authorized quiet messenger transition while sourced positive relay bands advance', () => {
    const union = REFERENCE_RUNS.find(run => run.name === 'union-1861, war by decision, 148 days')!;
    const history = JSON.parse(readFileSync(new URL('../rules/liveness-changes.json', import.meta.url), 'utf8'));
    expect(history.filter((row: unknown) => fingerprint(row) === fingerprint(r))).toEqual([r]);
    const later = history.slice(history.findIndex((row: unknown) => fingerprint(row) === fingerprint(r)) + 1)
      .filter((row: { key: string }) => row.key === r.key);
    // Keep S90's exact quiet grant; later observed positive firings follow the ordinary ledger.
    expect(livenessProblems({ [r.key]: r.after }, { [r.key]: union.bands['messages.special_messenger']! }, later)).toEqual([]);
    const key = `${union.name}/orders.relayed`;
    const updates = history.filter((change: { key: string }) => change.key === key);
    const s123 = updates.find((change: { evidence: string }) => change.evidence === 'docs/audit/s123-evidence/band-changes.json#orders.relayed');
    // S123's historical relay reading stays exact; current bands may advance through the ledger.
    expect(s123.before).toEqual({ minFires: 4, maxFires: 18 });
    expect(s123.observed).toBe(20);
    expect(s123.after).toEqual({ minFires: 10, maxFires: 40 });
    expect(livenessProblems({ [key]: s123.before }, { [key]: s123.after }, [s123])).toEqual([]);
    expect(livenessProblems({ [key]: s123.after }, { [key]: union.bands['orders.relayed']! }, updates.slice(updates.indexOf(s123) + 1))).toEqual([]);
    expect(REFERENCE_RUNS.find(run => run.name === 'testbed, 120 days')!.bands['messages.special_messenger']!.minFires).toBe(1);
  });
});
