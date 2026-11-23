import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { conditionalDoctrineProblems, type world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { licenceVerdict, publishedSchemas, RegionSchema, SCHEMAS_MATCH_KERNEL, staleFiles, WorldSchema } from '../src/index.ts';

const schemasDir = new URL('../schemas/', import.meta.url);

it('validates bounded conditional goals and the earlier letter a sourced reply answers', () => {
  const schema = WorldSchema.shape.rules.shape.ruleSeats.shape.principals.element;
  const fallback = { objective: null, posture: 'hold' };
  const grant = { condition: 'outmatched', fallback };
  const outer = { condition: 'turned', fallback: { objective: 'front', posture: 'hold', discretion: grant } };
  const row = {
    faction: 'a', crossNeutral: false, concentrateAt: null, concentrateSource: null, calls: [],
    offensives: [{ id: 'hold_goal', post: 'army', objective: 'front', posture: 'hold', fromDate: '1900-06-01', source: 'record 1' }],
    proposalAnswers: [{ id: 'answer', post: 'army', action: 'discretion', answers: 'hold_goal', fromDate: '1900-06-02', discretion: outer, source: 'record 2' }],
    inquireEveryDays: 7, appointKinds: { land: [], naval: [] },
  };
  const parsed = schema.parse(row);
  expect(conditionalDoctrineProblems(parsed, r => r === 'front')).toEqual([]);
  expect(conditionalDoctrineProblems(parsed, () => false)).toEqual(expect.arrayContaining([expect.objectContaining({
    field: 'proposalAnswers[0].discretion.fallback',
  })]));
  expect(conditionalDoctrineProblems({ ...parsed, offensives: [] }, () => true)).toEqual(expect.arrayContaining([expect.objectContaining({
    field: 'proposalAnswers[0].answers',
  })]));
  const cyclic = { condition: 'turned', fallback: { objective: 'front', posture: 'hold' } };
  Object.assign(cyclic.fallback, { discretion: cyclic });
  for (const discretion of [cyclic, { ...outer, condition: 'when_advantageous' }]) {
    expect(schema.safeParse({ ...row, proposalAnswers: [{ ...row.proposalAnswers[0], discretion }] }).success).toBe(false);
  }
});

it('parses bounded positive receipt selectors on each identified doctrine action', () => {
  const schema = WorldSchema.shape.rules.shape.ruleSeats.shape.principals.element;
  const identity = { namespace: 'desk', key: 'initial', revision: 1 };
  const named = { kind: 'letter', issuer: 'leader', letter: identity, post: 'army', role: 'addressee' };
  const report = { kind: 'report', author: 'commander', authorPost: 'army', subjectKind: 'post', subjectId: 'army',
    reportType: 'wire-dispatch', reportSubtype: null, answers: identity,
    claims: [{ kind: 'order-obeyed', region: 'front', token: 'new', min: 1 }] };
  const row = {
    faction: 'a', letterNamespace: 'desk', maxPaperSelectors: 2, crossNeutral: false, concentrateAt: null, concentrateSource: null,
    calls: [{ id: 'call', post: 'governor', regiments: 1, termDays: 90, fromDate: '1900-06-01', source: 'test paper', requiresPapers: [named] }],
    concentrations: [{ id: 'gather', post: 'army', fromDate: '1900-06-01', requiresDepartment: 'war', fromPosts: ['governor'], source: 'test paper', requiresPapers: [report] }],
    offensives: [
      { letter: identity, post: 'army', objective: 'front', fromDate: '1900-06-01', source: 'test paper' },
      { id: 'conditional', post: 'army', objective: 'front', fromDate: '1900-06-01', source: 'test paper', requiresPapers: [named, report] },
    ],
    proposalAnswers: [{ id: 'reply', post: 'army', action: 'accept', answers: 'conditional', fromDate: '1900-06-02', source: 'test paper', requiresPapers: [named] }],
    inquireEveryDays: 7, appointKinds: { land: [], naval: [] },
  };
  const parsed = schema.parse(row);
  expect(conditionalDoctrineProblems(parsed, r => r === 'front')).toEqual([]);
  expect(conditionalDoctrineProblems({ ...parsed, maxPaperSelectors: 1 }, r => r === 'front')).toContainEqual(expect.objectContaining({
    field: 'offensives[1].requiresPapers',
  }));
  expect(schema.safeParse({ ...row, calls: [{ ...row.calls[0], requiresPapers: [{ ...named, not: true }] }] }).success).toBe(false);
});

describe('published schemas (decision 0030)', () => {
  it('are up to date with the Zod schemas: run npm run pack:schemas if not', () => {
    const disk = new Map(existsSync(schemasDir) ? readdirSync(schemasDir).map((f) => [f, readFileSync(new URL(f, schemasDir), 'utf8')] as const) : []);
    expect(staleFiles(publishedSchemas(), disk)).toEqual([]);
  });

  it('describe ids by their pattern, for modders', () => {
    const world = JSON.parse(publishedSchemas().get('world.schema.json')!) as { properties: { regions: { items: { properties: { id: { pattern: string } } } } } };
    expect(world.properties.regions.items.properties.id.pattern).toBe('^[A-Za-z0-9][A-Za-z0-9_.:/-]*$');
  });
});

describe("the schemas' output is the kernel's World", () => {
  it('matches at compile time', () => {
    expect(SCHEMAS_MATCH_KERNEL).toEqual({ world: true, scenario: true });
  });

  it('a schema that drifts from the kernel type does not match (positive control)', () => {
    type DeepReadonly<T> = T extends string | number | boolean | null | undefined ? T : T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : { readonly [K in keyof T]: DeepReadonly<T[K]> };
    type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
    const Drifted = WorldSchema.omit({ people: true });
    // @ts-expect-error a World schema without people is not the kernel's World
    const drift: Same<DeepReadonly<z.output<typeof Drifted>>, DeepReadonly<w.World>> = true;
    expect(drift).toBe(true);
  });

  it('a drift deep inside a record does not match either (positive control, nested)', () => {
    type DeepReadonly<T> = T extends string | number | boolean | null | undefined ? T : T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : { readonly [K in keyof T]: DeepReadonly<T[K]> };
    type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
    const looseCitation = z.strictObject({ source: z.string(), at: z.string().nullish() });
    const Drifted = WorldSchema.extend({ regions: z.array(RegionSchema.extend({ provenance: z.array(looseCitation) })) });
    // @ts-expect-error a citation whose place may be undefined is not the kernel's Citation
    const drift: Same<DeepReadonly<z.output<typeof Drifted>>, DeepReadonly<w.World>> = true;
    expect(drift).toBe(true);
  });
});

describe('the licence allow-list (decisions 0031, 0033, 0037)', () => {
  it('allows public domain, CC0 and own work', () => {
    expect(['public-domain', 'CC0-1.0', 'own-work'].map((l) => licenceVerdict(l).allowed)).toEqual([true, true, true]);
  });

  it('refuses share-alike, non-commercial, unstated and copyrighted sources, with reasons', () => {
    const reasons = ['CC-BY-SA-4.0', 'CC-BY-NC-SA-4.0', 'unknown', '', 'all rights reserved', 'MIT'].map((l) => {
      const v = licenceVerdict(l);
      return v.allowed ? 'allowed' : v.reason;
    });
    expect(reasons).toEqual([
      'share-alike terms would bind the pack (decision 0033)',
      'share-alike terms would bind the pack (decision 0033)',
      'sources without a stated licence are not used (decision 0033)',
      'sources without a stated licence are not used (decision 0033)',
      'copyrighted works may be consulted to check facts but never copied into a pack (decision 0033)',
      'not on the allow-list',
    ]);
  });
});
