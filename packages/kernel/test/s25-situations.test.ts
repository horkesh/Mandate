import { expect, it } from 'vitest';
import { isProposalBasis } from '../src/situations/types.ts';
import type { SituationDef } from '../src/situations/types.ts';
import { situationReferenceProblems } from '../src/situations/references.ts';
import { toId } from '../src/ids.ts';
import { F } from './support/seats-fixture.ts';

it('S25 situations-04: a missing proposal basis is rejected without dereferencing it', () => {
  expect(isProposalBasis(null)).toBe(false);
  expect(isProposalBasis(undefined)).toBe(false);
  expect(isProposalBasis([])).toBe(false);
  expect(isProposalBasis({ basis: 'law-and-practice', cites: [] })).toBe(true);
});

it('S25 situations-02: an empty decision still needs staff and is not classified as the principal initiative', () => {
  const def: SituationDef = {
    id: toId('situation', 's25.empty'), kind: 'decision', faction: F('a'), title: 'situation.empty', text: 'situation.empty.text',
    earliest: '1900-06-01', event: { dayAtLeast: 1 }, knowledge: null, railroad: 'test fixture', chain: null,
    subjects: [], options: [], inaction: null, historicalDefault: null, staffLine: null, delegableTo: [], resurfaceOn: [],
    effects: [], report: null, gate: { none: 'test fixture' }, gateReview: null, citations: [],
  };
  const problems = situationReferenceProblems([def], { factions: new Map([[F('a'), {}]]), posts: new Map(), persons: new Map(), regions: new Map() });
  expect(problems).toContain('situation s25.empty: options: a decision needs options');
  expect(problems.some(p => p.includes(': staffLine:'))).toBe(true);
});
