import { expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { CallProfileSchema } from '../../../packages/pack-format/src/call-profiles.ts';
import { callDirective, callValueLinkProblems } from '../../../packages/kernel/src/recruitment/rules.ts';
const rules = seatsWorld('union-1861').world.map.world.rules.recruitment;
const profiles = rules.callProfiles!;

it('links every value in the twenty S101 profiles, preserving empty arrays and the separate later demand', () => {
  const sourceProfiles = new Set<string>();
  for (const profile of profiles) {
    if (profile.sourceProfile === 'CS-J12') continue;
    sourceProfiles.add(profile.sourceProfile);
    expect(profile.valueClauseLinks).toBeDefined();
    expect(new Set(profile.valueClauseLinks!.map(l => l.linkValue))).toEqual(new Set([...profile.honours, ...profile.offends]));
    expect(callValueLinkProblems(profile)).toEqual([]);
    const directive = callDirective(rules, { callRegiments: 1, callTermDays: 30, callProfile: profile });
    for (const link of profile.valueClauseLinks!) {
      expect(link.linkCites.length).toBeGreaterThan(0);
      const clause = directive.clauses!.find(c => c.clauseId === link.linkClause)!;
      expect(clause).toBeDefined();
      // 0122's by-kind honour has no invented quotation on a silent paper.
      if (link.linkClause === 'purpose') {
        expect(clause.clauseSubject).toBe('purpose');
        expect(clause.clauseProvenance!.length).toBeGreaterThan(0);
        expect(link.linkRationale).toContain('0122 by-kind');
      } else expect(clause.clauseWording).toBeTruthy();
    }
  }
  expect(sourceProfiles.size).toBe(20);
  // 0122 includes the later documentary release demand by kind; it creates no levy.
  expect(profiles.find(p => p.sourceProfile === 'CS-J12')!.valueClauseLinks).toContainEqual(expect.objectContaining({ linkValue: 'confederate_independence', linkClause: 'purpose', linkCites: [['OR-IV-I', 466]] }));
});

it('puts reserve autonomy on appointments and organisation, and April national repossession on purpose', () => {
  const reserve = profiles.find(p => p.id === 'cs_jun30_reserve_georgia')!;
  expect(reserve.valueClauseLinks).toContainEqual(expect.objectContaining({ linkValue: 'state_autonomy', linkClause: 'condition:appointments:2', linkCites: [['OR-IV-I', 412]] }));
  const april = profiles.find(p => p.sourceProfile === 'US-A15')!;
  const links = april.valueClauseLinks!.filter(l => l.linkValue === 'state_autonomy');
  expect(links).toHaveLength(1);
  expect(links[0]!.linkClause).toBe('condition:purpose:7');
  expect(links[0]!.linkCites).toEqual([['OR-III-I', 68]]);
});

it('validates link targets, value membership and page receipts at the pack input boundary', () => {
  const profile = profiles.find(p => p.id === 'cs_jun30_reserve_georgia')!;
  expect(CallProfileSchema.safeParse(profile).success).toBe(true);
  const link = profile.valueClauseLinks![0]!;
  for (const bad of [{ ...link, linkClause: 'missing' }, { ...link, linkValue: 'invented' }, { ...link, linkCites: [] }, { ...link, linkCites: [['paper', 0]] }]) {
    expect(CallProfileSchema.safeParse({ ...profile, valueClauseLinks: [bad] }).success).toBe(false);
  }
});
