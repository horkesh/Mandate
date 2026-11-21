import { expect, it } from 'vitest';
import { baselineHistoryProblems, type Finding } from '../rules/common.ts';
import { readFileSync } from 'node:fs';
it('permits only the exact S39 fixes merge to migrate an existing projection fingerprint', () => {
  const head='64e4a6f0711edd50e1a7cfcd57041924a14005d3';
  const old:Finding={rule:'projection-truth',path:'old.ts',detail:'unchanged protected reads',hash:'before'};
  const changed={...old,hash:'after'};
  expect(baselineHistoryProblems([old],[changed],false,head)).toEqual([]);
  for(const other of [null,'64e4a6f',head+'0','9c820e4bc0f93d4bb570777fe918fd7b3ce5e64d'])
    expect(baselineHistoryProblems([old],[changed],false,other)).not.toEqual([]);
  expect(baselineHistoryProblems([old],[{...changed,detail:'new protected reads'}],false,head)).not.toEqual([]);
  expect(baselineHistoryProblems([old],[changed,{...changed,path:'new.ts'}],false,head)).not.toEqual([]);
  const cause={...old,rule:'situation-cause'};
  expect(baselineHistoryProblems([cause],[{...cause,hash:'after'}],false,head)).not.toEqual([]);
});

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

it.each(['s40', 's41'])('permits only %s\'s exact merge and two recorded residual projection migrations', sprint => {
  const receipt = JSON.parse(readFileSync(new URL(`./support/${sprint}-projection-migration.json`, import.meta.url), 'utf8')) as {
    mergeHead: string; migrations: { before: Finding; after: Finding }[];
  };
  for (const { before, after } of receipt.migrations) {
    expect(baselineHistoryProblems([before], [after], false, receipt.mergeHead)).toEqual([]);
    for (const head of [null, 'another-head', receipt.mergeHead.slice(0,7)]) {
      expect(baselineHistoryProblems([before], [after], false, head)).not.toEqual([]);
    }
    for (const change of [{ hash: 'edited' }, { path: 'another.ts' }, { detail: after.detail + '; another truth read' }]) {
      expect(baselineHistoryProblems([before], [{ ...after, ...change }], false, receipt.mergeHead)).not.toEqual([]);
    }
    expect(baselineHistoryProblems([], [after], false, receipt.mergeHead)).not.toEqual([]);
    expect(baselineHistoryProblems([before], [after, finding], false, receipt.mergeHead)).not.toEqual([]);
  }
});
