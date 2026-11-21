import { expect, it } from 'vitest';
import { recruitmentRuleProblems } from '../src/recruitment/rules.ts';
import { regimentsRaised } from '../src/tick/recruitment.ts';
import { fresh } from './support/s25-fixture.ts';

it('S25 recruitment-05: a disabled loyalty weight needs no positive normalization floor', () => {
  const { world } = fresh();
  const rules = { ...world.map.world.rules.recruitment, loyaltyWeight: 0, loyaltyFull: 0 };
  expect(recruitmentRuleProblems(rules)).toEqual([]);
  expect(regimentsRaised(rules, 2, 'comply', 0)!.loyaltyPermille).toBe(1000);
  expect(recruitmentRuleProblems({ ...rules, loyaltyWeight: 1 })).toContain('recruitment rule loyaltyFull must be above 0 when loyalty is read');
});
