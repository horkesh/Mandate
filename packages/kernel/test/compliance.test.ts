import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COMPLIANCE_RULES,
  resolveDirective,
  type CommandContext,
  type DirectiveTerms,
  type ProxyProfile,
} from '../src/index.ts';

// Setting-free test fixtures (decision 0003). Values are arbitrary ids.
const boldOffensive: DirectiveTerms = {
  boldness: 900,
  honours: ['glory'],
  offends: ['caution'],
  required: 700,
};

const thinResources: CommandContext = { available: 400, oversight: 300, leaderCredibility: 500 };
const closeWatch: CommandContext = { available: 400, oversight: 900, leaderCredibility: 900 };

const cautiousGrandee: ProxyProfile = {
  id: 'proxy-grandee',
  values: ['caution', 'reputation'],
  boldness: 200,
  candour: 700,
  standing: 800,
  regard: -400,
};

const watchedFunctionary: ProxyProfile = {
  id: 'proxy-functionary',
  values: ['caution', 'career'],
  boldness: 200,
  candour: 200,
  standing: 100,
  regard: -400,
};

describe('resolveDirective', () => {
  it('an aligned, trusting proxy with resources exceeds the directive', () => {
    const eager: ProxyProfile = {
      id: 'proxy-eager',
      values: ['glory', 'career'],
      boldness: 800,
      candour: 600,
      standing: 200,
      regard: 800,
    };
    const response = resolveDirective(
      eager,
      { boldness: 800, honours: ['glory'], offends: [], required: 400 },
      { available: 600, oversight: 300, leaderCredibility: 500 },
    );
    expect(response.actual).toBe('exceed');
    expect(response.declared).toBe('exceed');
    expect(response.willingness).toBe(473);
    expect(response.reasons).toContainEqual({ kind: 'values_honoured', value: 'glory' });
    expect(response.reasons).toContainEqual({ kind: 'trusts_leader' });
  });

  it('a protected, cautious grandee refuses a rash order outright, and says why', () => {
    const response = resolveDirective(cautiousGrandee, boldOffensive, thinResources);
    expect(response.willingness).toBe(-731);
    expect(response.actual).toBe('refuse');
    expect(response.declared).toBe('refuse');
    expect(response.reasons.map((r) => r.kind)).toEqual([
      'values_offended',
      'too_rash',
      'distrusts_leader',
      'shielded_by_standing',
      'lacks_resources',
    ]);
    expect(response.reasons).toContainEqual({ kind: 'lacks_resources', shortfall: 300 });
  });

  it('a watched, uncandid functionary reinterprets the order while declaring compliance', () => {
    const response = resolveDirective(watchedFunctionary, boldOffensive, closeWatch);
    expect(response.willingness).toBe(-560);
    expect(response.actual).toBe('reinterpret');
    expect(response.declared).toBe('comply');
    expect(response.reasons).toContainEqual({ kind: 'fears_sanction' });
  });

  it('the same unwillingness in a candid man becomes an open objection with a counter-proposal', () => {
    const candid = { ...watchedFunctionary, candour: 700 };
    const response = resolveDirective(candid, boldOffensive, closeWatch);
    expect(response.actual).toBe('object');
    expect(response.declared).toBe('object');
    expect(response.counterProposal).toEqual({ boldness: 200, required: 400 });
  });

  it('mild covert unwillingness is a slow-walk, not a reinterpretation', () => {
    const response = resolveDirective(
      { ...watchedFunctionary, regard: 200 },
      { boldness: 600, honours: ['glory'], offends: ['caution'], required: 400 },
      closeWatch,
    );
    expect(response.willingness).toBe(-110);
    expect(response.actual).toBe('slow_walk');
    expect(response.declared).toBe('comply');
  });

  it('standing shields a proxy: the same functionary, now famous, refuses openly (P6)', () => {
    const famous = { ...watchedFunctionary, standing: 900 };
    const response = resolveDirective(famous, boldOffensive, closeWatch);
    expect(response.willingness).toBe(-657);
    expect(response.actual).toBe('refuse');
  });

  it('contributions always sum to willingness and are integers', () => {
    const cases: Array<[ProxyProfile, DirectiveTerms, CommandContext]> = [
      [cautiousGrandee, boldOffensive, thinResources],
      [watchedFunctionary, boldOffensive, closeWatch],
    ];
    expect(cases.length).toBeGreaterThan(0);
    for (const [proxy, terms, context] of cases) {
      const response = resolveDirective(proxy, terms, context);
      const sum = response.contributions.reduce((total, c) => total + c.amount, 0);
      expect(sum).toBe(response.willingness);
      for (const c of response.contributions) expect(Number.isSafeInteger(c.amount)).toBe(true);
    }
  });

  it('is deterministic and does not depend on the order of value lists', () => {
    const a = resolveDirective(cautiousGrandee, boldOffensive, thinResources);
    const b = resolveDirective(
      { ...cautiousGrandee, values: ['reputation', 'caution'] },
      { ...boldOffensive, honours: ['glory'], offends: ['caution', 'caution'] },
      thinResources,
    );
    expect(b).toEqual(a);
  });

  it('accepts rule variants for calibration', () => {
    const lenient = { ...DEFAULT_COMPLIANCE_RULES, severeBelow: -2000 };
    const response = resolveDirective(cautiousGrandee, boldOffensive, thinResources, lenient);
    expect(response.actual).toBe('object');
  });

  it('rejects non-integer or out-of-range inputs', () => {
    expect(() =>
      resolveDirective({ ...cautiousGrandee, boldness: 0.5 }, boldOffensive, thinResources),
    ).toThrow(RangeError);
    expect(() =>
      resolveDirective(cautiousGrandee, boldOffensive, { ...thinResources, oversight: 1001 }),
    ).toThrow(RangeError);
  });
});
