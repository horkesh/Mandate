import { expect, it } from 'vitest';
import { resolveDirective } from '../src/compliance.ts';
import { callDirective, recruitmentRuleProblems } from '../src/recruitment/rules.ts';
import { FIXTURE_RULES } from './support/map-fixture.ts';

const profile = {
  id: 'reserve', sourceProfile: 'research', honours: ['order'], offends: ['state_autonomy'],
  callProvenance: [{ source: 'paper', page: 4 }],
  conditions: [{ kind: 'appointments' as const, clauseText: 'The President appoints field officers.' }],
  materialDemand: [], rationale: '[I] Appointment rights.', limits: 'No new means.',
  valueClauseLinks: [{ linkValue: 'state_autonomy', linkClause: 'condition:appointments:0', linkCites: [['paper', 4] as const], linkRationale: '[I] The appointment clause displaces State choice.' }],
};
const call = { callRegiments: 1, callTermDays: 30, callProfile: profile };
const governor = { id: 'governor', values: ['state_autonomy'], boldness: 500, candour: 1000, standing: 0, regard: 0 };
const context = { available: 1000, oversight: 0, leaderCredibility: 0, disposition: 267 };

it('grounds a held offence on the named clause, without cancelling its cost or creating an arms gate', () => {
  const response = resolveDirective(governor, callDirective(FIXTURE_RULES.recruitment, call), context);
  expect(response.willingness).toBe(67);
  expect(response.reservations).toEqual([expect.objectContaining({ clause: 'condition:appointments:0', subject: 'appointments', effect: 'statement', grounds: { groundKind: 'offended_value', groundReference: 'state_autonomy' } })]);
  expect(response.conditions).toEqual([]);
  expect(response.reservationGaps).toEqual([]);
});

it('keeps unlinked offences on the paper and produces no protest from an unheld or honoured value', () => {
  const terms = callDirective(FIXTURE_RULES.recruitment, { ...call, callProfile: { ...profile, valueClauseLinks: [] } });
  expect(resolveDirective(governor, terms, context).reservations[0]!.clause).toBe('course');
  expect(resolveDirective({ ...governor, values: ['order'] }, terms, context).reservations).toEqual([]);
});

it('rejects dangling links and values the paper never honours or offends', () => {
  for (const link of [{ ...profile.valueClauseLinks[0]!, linkClause: 'missing' }, { ...profile.valueClauseLinks[0]!, linkValue: 'invented' }]) {
    expect(recruitmentRuleProblems({ ...FIXTURE_RULES.recruitment, callProfiles: [{ ...profile, valueClauseLinks: [link] }] })).not.toEqual([]);
  }
});
