import { describe, expect, it } from 'vitest';
import { livenessProblems, ledgerHistoryProblems } from '../rules/liveness-causes.ts';

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
  it('accepts the exact around formula with its observation and recorded cause', () => {
    expect(livenessProblems(original, current, [record])).toEqual([]);
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
});
