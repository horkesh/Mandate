import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { licenceVerdict, publishedSchemas, SCHEMAS_MATCH_KERNEL, staleFiles, WorldSchema } from '../src/index.ts';

const schemasDir = new URL('../schemas/', import.meta.url);

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
