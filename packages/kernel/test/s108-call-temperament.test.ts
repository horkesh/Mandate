import { expect, it } from 'vitest';
import { resolveDirective } from '../src/compliance.ts';
import { callTerms } from '../src/recruitment/rules.ts';
import { goalTerms } from '../src/reading/orders.ts';
import { FIXTURE_PEOPLE_RULES, FIXTURE_RULES } from './support/map-fixture.ts';

const governor = { id: 'governor', boldness: 100, candour: 1000, standing: 0, regard: 0, values: [] };
const context = { available: 1000, oversight: 0, leaderCredibility: 0 };

it('0119 records a troop call as inapplicable and retains the same governor’s field-goal temperament', () => {
  const terms = callTerms(FIXTURE_RULES.recruitment);
  expect(terms.boldness).toBeNull();
  const call = resolveDirective(governor, terms, context);
  const field = resolveDirective(governor, goalTerms(FIXTURE_PEOPLE_RULES, 'advance'), context);
  expect(call.contributions.some(c => c.term === 'temperament')).toBe(false);
  expect(call.reasons.some(r => r.kind === 'too_rash' || r.kind === 'too_timid')).toBe(false);
  expect(field.contributions.find(c => c.term === 'temperament')!.amount).toBeLessThan(0);
  expect(field.reasons).toContainEqual(expect.objectContaining({ kind: 'too_rash' }));
});

it('0119 makes known and unknown boldness, and different unsupported draws, immaterial to a call', () => {
  const terms = callTerms(FIXTURE_RULES.recruitment);
  const answer = (boldness: number, known: boolean) => resolveDirective({ ...governor, boldness, evidence: { boldness: known, candour: true, standing: true } }, terms, context);
  expect(answer(100, true)).toEqual(answer(100, false));
  expect(answer(100, false)).toEqual(answer(900, false));
  expect(answer(100, true)).toEqual(answer(900, true));
});

it('0119 does not invent a boldness counterproposal when a call is rejected', () => {
  const response = resolveDirective({ ...governor, values: ['held'] }, { ...callTerms(FIXTURE_RULES.recruitment), honours: [], offends: ['held'] }, context);
  expect(response.actual).toBe('object');
  expect(response.counterProposal?.boldness).toBeNull();
});
