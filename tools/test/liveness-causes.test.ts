import { describe, expect, it } from 'vitest';
import { inheritedQuietHistoryProblems, livenessProblems, ledgerHistoryProblems } from '../rules/liveness-causes.ts';
import { readFileSync } from 'node:fs';

const original = { 'reference/mechanic': { minFires: 5, maxFires: 20 } };
const current = { 'reference/mechanic': { minFires: 10, maxFires: 40 } };
const record = { key: 'reference/mechanic', before: original['reference/mechanic'], after: current['reference/mechanic'], observed: 20, cause: 'The new received notice adds ten deliveries.', evidence: 'notes/change.md#notice' };
describe('liveness changes require a cause and around(observed)', () => {
  it('rejects a changed band with no record', () => {
    expect(livenessProblems(original, current, [])).not.toEqual([]);
  });
  it('accepts an unchanged band without inventing a new observation', () => {
    expect(livenessProblems(original, original, [])).toEqual([]);
  });
  it('S92 permits only its four exact quiet transitions and preserves each live control', () => {
    const receipts = JSON.parse(readFileSync(new URL('./support/s92-quiet-transitions.json', import.meta.url), 'utf8'));
    expect(receipts).toHaveLength(4);
    for (const { record: r, driver } of receipts) {
      expect(readFileSync(new URL('../../' + driver.test, import.meta.url), 'utf8')).toContain(driver.needle);
      expect(livenessProblems({ [r.key]: r.before }, { [r.key]: r.after }, [r])).toEqual([]);
      for (const changed of [{ ...r, cause: 'another cause' }, { ...r, key: 'testbed, 120 days/orders.relay_held' },
        { ...r, evidence: 'elsewhere' }, { ...r, observed: 1 }, { ...r, after: { ...r.after, maxFires: 1 } }]) {
        expect(livenessProblems({ [changed.key]: changed.before }, { [changed.key]: changed.after }, [changed])).not.toEqual([]);
      }
    }
  });
  it('accepts the exact around formula with its observation and recorded cause', () => {
    expect(livenessProblems(original, current, [record])).toEqual([]);
  });
  it('S82 permits only the exact authorized quiet return with its existing live driver', () => {
    const receipt = JSON.parse(readFileSync(new URL('./support/s82-quiet-transition.json', import.meta.url), 'utf8'));
    const r = receipt.record;
    const origin = { [r.key]: r.before }, current = { [r.key]: r.after };
    expect(readFileSync(new URL('../../' + receipt.driver.test, import.meta.url), 'utf8')).toContain(receipt.driver.needle);
    expect(livenessProblems(origin, current, [r])).toEqual([]);
    for (const changed of [{ ...r, cause: 'another cause' }, { ...r, key: 'testbed, 120 days/orders.returned' },
      { ...r, evidence: 'elsewhere' }, { ...r, after: { ...r.after, maxFires: 1 } }]) {
      expect(livenessProblems({ [changed.key]: changed.before }, { [changed.key]: changed.after }, [changed])).not.toEqual([]);
    }
  });
  it.each([
    { ...record, cause: '' }, { ...record, evidence: '' }, { ...record, observed: 0 },
    { ...record, observed: 19 }, { ...record, after: { minFires: 9, maxFires: 40 } },
    { ...record, before: { minFires: 1, maxFires: 2 } },
  ])('rejects unsupported or unchained recentering: %j', r => {
    expect(livenessProblems(original, current, [r])).not.toEqual([]);
  });
  it('requires causes for deletions and additions too', () => {
    expect(livenessProblems(original, {}, [])).not.toEqual([]);
    expect(livenessProblems({}, current, [])).not.toEqual([]);
    expect(livenessProblems({}, current, [{ ...record, before: null }])).toEqual([]);
    expect(livenessProblems(original, {}, [{ ...record, after: null, observed: null }])).toEqual([]);
  });
  it('does not allow a commit to rewrite, remove or reuse an old cause', () => {
    expect(ledgerHistoryProblems([record], [{ ...record, cause: 'another cause' }])).not.toEqual([]);
    expect(ledgerHistoryProblems([record], [])).not.toEqual([]);
    expect(ledgerHistoryProblems([record], [record])).toEqual([]);
    expect(ledgerHistoryProblems([], [record])).toEqual([]);
    expect(livenessProblems(original, original, [record])).not.toEqual([]);
  });
  it('uses the small-observation ceiling n+3, not just double', () => {
    const after = { minFires: 1, maxFires: 4 };
    expect(livenessProblems({}, { tiny: after }, [{ ...record, key: 'tiny', before: null, after, observed: 1 }])).toEqual([]);
    expect(livenessProblems({}, { tiny: { minFires: 1, maxFires: 2 } }, [{ ...record, key: 'tiny', before: null, after: { minFires: 1, maxFires: 2 }, observed: 1 }])).not.toEqual([]);
  });
  it('checks numeric bounds without rejecting the cause retained on the band itself', () => {
    const after = { ...record.after, why: record.cause };
    expect(livenessProblems(original, { 'reference/mechanic': after }, [{ ...record, after }])).toEqual([]);
    expect(livenessProblems(original, { 'reference/mechanic': after }, [{ ...record, after: { ...after, maxFires: 41 } }])).not.toEqual([]);
  });
  it('accepts only the exact inherited quiet transition explicitly baselined at integration', () => {
    const after = { minFires: 0, maxFires: 0, why: 'No authored call exists; its named kernel test drives it.' };
    const inherited = { ...record, after, observed: 0 };
    const current = { 'reference/mechanic': after };
    expect(livenessProblems(original, current, [inherited])).not.toEqual([]);
    expect(livenessProblems(original, current, [inherited], [inherited])).toEqual([]);
    expect(livenessProblems(original, current, [{ ...inherited, cause: 'Another cause' }], [inherited])).not.toEqual([]);
    expect(livenessProblems(original, current, [inherited], [{ ...inherited, key: 'another/mechanic' }])).not.toEqual([]);
  });
  it('does not permit the inherited quiet baseline to grow, shrink or change', () => {
    expect(inheritedQuietHistoryProblems([record], [record])).toEqual([]);
    expect(inheritedQuietHistoryProblems([record], [])).not.toEqual([]);
    expect(inheritedQuietHistoryProblems([record], [record, record])).not.toEqual([]);
    expect(inheritedQuietHistoryProblems([record], [{ ...record, cause: 'Changed' }])).not.toEqual([]);
  });
  it('permits exactly the lead-authorized S41 time transition, then freezes the 25-entry list', () => {
    const receipt = JSON.parse(readFileSync(new URL('./support/s41-quiet-transition.json', import.meta.url), 'utf8'));
    const before = JSON.parse(readFileSync(new URL('../rules/inherited-quiet-bands.json', import.meta.url), 'utf8')).slice(0, 24);
    const after = [...before, receipt.record];
    expect(inheritedQuietHistoryProblems(before, after)).toEqual([]);
    expect(inheritedQuietHistoryProblems(after, after)).toEqual([]);
    for (const changed of [before, [...after, receipt.record], [...before, { ...receipt.record, cause: 'another ruling' }],
      [...before.slice(1), receipt.record], [receipt.record, ...before]]) {
      expect(inheritedQuietHistoryProblems(after, changed)).not.toEqual([]);
      if (changed !== before) expect(inheritedQuietHistoryProblems(before, changed)).not.toEqual([]);
    }
    expect(inheritedQuietHistoryProblems(before, [...before, { ...receipt.record, key: 'another/time' }])).not.toEqual([]);
  });
  it('permits only S44’s exact Union withdrawal ruling and freezes all 26 entries', () => {
    const receipt = JSON.parse(readFileSync(new URL('./support/s44-quiet-transition.json', import.meta.url), 'utf8'));
    const after = JSON.parse(readFileSync(new URL('../rules/inherited-quiet-bands.json', import.meta.url), 'utf8'));
    const before = after.slice(0, 25);
    expect(after).toHaveLength(26);
    expect(after[25]).toEqual(receipt.record);
    expect(inheritedQuietHistoryProblems(before, after)).toEqual([]);
    expect(inheritedQuietHistoryProblems(after, after)).toEqual([]);
    for (const changed of [before, [...after, receipt.record], [...before, { ...receipt.record, cause: 'another ruling' }],
      [...before, { ...receipt.record, key: 'testbed, 120 days/combat.withdrew' }], [...before.slice(1), receipt.record]]) {
      expect(inheritedQuietHistoryProblems(after, changed)).not.toEqual([]);
      if (changed !== before) expect(inheritedQuietHistoryProblems(before, changed)).not.toEqual([]);
    }
    expect(livenessProblems({ [receipt.record.key]: receipt.record.before }, { [receipt.record.key]: receipt.record.after }, [receipt.record])).not.toEqual([]);
    expect(livenessProblems({ [receipt.record.key]: receipt.record.before }, { [receipt.record.key]: receipt.record.after }, [receipt.record], after)).toEqual([]);
  });
});
