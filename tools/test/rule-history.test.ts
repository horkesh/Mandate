import { expect, it } from 'vitest';
import { baselineHistoryProblems, type Finding } from '../rules/common.ts';

const finding: Finding = { rule: 'projection-truth', path: 'view.ts', detail: 'a known read', hash: 'old' };
it('permits removing resolved findings but never silently growing the known-defect baseline', () => {
  expect(baselineHistoryProblems([finding], [], false)).toEqual([]);
  expect(baselineHistoryProblems([finding], [finding], false)).toEqual([]);
  expect(baselineHistoryProblems([finding], [finding, { ...finding, path: 'new.ts' }], false)).not.toEqual([]);
  expect(baselineHistoryProblems([finding], [finding, { ...finding, path: 'new.ts' }], true)).not.toEqual([]);
});
it('allows a fingerprint migration only alongside a checker change, preserving the same finding identity', () => {
  expect(baselineHistoryProblems([finding], [{ ...finding, hash: 'changed' }], false)).not.toEqual([]);
  expect(baselineHistoryProblems([finding], [{ ...finding, hash: 'changed' }], true)).toEqual([]);
});
