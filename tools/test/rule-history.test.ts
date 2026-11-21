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
it('permits only S34\'s exact owner-named desk merge to migrate an existing fingerprint', () => {
  const head = '7db8c80a605c4410f458487778cadc7008ac8909';
  const changed = { ...finding, hash: 'changed' };
  expect(baselineHistoryProblems([finding], [changed], false, head)).toEqual([]);
  for (const other of [null, '', 'another-head', head.slice(0, 7)]) {
    expect(baselineHistoryProblems([finding], [changed], false, other)).not.toEqual([]);
  }
  expect(baselineHistoryProblems([finding], [changed, { ...changed, path: 'new.ts' }], false, head)).not.toEqual([]);
  expect(baselineHistoryProblems([finding], [{ ...changed, detail: 'a new read path' }], false, head)).not.toEqual([]);
  const cause = { ...finding, rule: 'situation-cause' };
  expect(baselineHistoryProblems([cause], [{ ...cause, hash: 'changed' }], false, head)).not.toEqual([]);
});
