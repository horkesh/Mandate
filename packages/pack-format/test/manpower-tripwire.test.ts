import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OWNED_FIELDS, type OwnedField } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';

/**
 * A tripwire for the gate register (0070; the register review's N1). A refused signature or a protected field can only
 * name what a pack knows, and the kernel's owners are built after the register is written. So this fails the day a kernel
 * owner declares a field that is about manpower or population (recruitment, recruits, manpower, levy, draft, quota,
 * enlistment, population) unless some pack's register already names that stem in a protected field or a refused
 * signature, which is where whoever builds the owner is told to look. A field a nation's land could be drawn on
 * (recruitment aimed at it) must have its register entry first, not after.
 */
const STEMS = ['recruit', 'manpower', 'levy', 'draft', 'quota', 'enlist', 'population'] as const;
const KERNEL_SRC = fileURLToPath(new URL('../../kernel/src/', import.meta.url));
const PACKS = fileURLToPath(new URL('../../../packs/', import.meta.url));

interface RegisterNames {
  /** Protected field ids, and the text of every refused signature's field and subject patterns, lower-cased. */
  readonly texts: readonly string[];
}

/** What every pack's gate register names: protected fields and refused signatures' field and subject patterns. */
export function registerNames(packsDir: string = PACKS): RegisterNames {
  const texts: string[] = [];
  for (const pack of readdirSync(packsDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const file = join(packsDir, pack.name, 'gate', 'register.json');
    if (!existsSync(file)) continue;
    const register = JSON.parse(readFileSync(file, 'utf8')) as { topics: { protectedFields?: string[]; refused?: { fieldPattern?: string | null; subjectPattern?: string | null }[] }[] };
    for (const t of register.topics) {
      texts.push(...(t.protectedFields ?? []).map((f) => f.toLowerCase()));
      for (const r of t.refused ?? []) texts.push(...[r.fieldPattern, r.subjectPattern].filter((x): x is string => typeof x === 'string').map((x) => x.toLowerCase()));
    }
  }
  return { texts };
}

/** The field declarations a kernel owner makes: its owned-field descriptions and State keys, and the proposal field ids its modules export (`*_FIELD`). */
export function declaredFields(owned: readonly OwnedField[], kernelSources: readonly string[]): string[] {
  const ids = kernelSources.flatMap((text) => [...text.matchAll(/export const \w+_FIELD\s*=\s*'([^']+)'/g)].map((m) => m[1]!));
  return [...owned.map((f) => f.field), ...owned.flatMap((f) => f.code.map((c) => c.key)), ...ids];
}

function kernelSources(dir: string = KERNEL_SRC): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? kernelSources(join(dir, e.name)) : e.name.endsWith('.ts') ? [readFileSync(join(dir, e.name), 'utf8')] : []));
}

/** The manpower and population stems a declared field carries that no register names. */
export function unregisteredStems(declared: readonly string[], names: RegisterNames): { readonly field: string; readonly stem: string }[] {
  return declared.flatMap((field) => STEMS.filter((s) => field.toLowerCase().includes(s) && !names.texts.some((t) => t.includes(s))).map((stem) => ({ field, stem })));
}

const WHY = (found: readonly { field: string; stem: string }[]) =>
  `a kernel owner declares a manpower or population field no pack register names: ${found.map((f) => `"${f.field}" (${f.stem})`).join(', ')}. Add a protected field or a refused signature (a fieldPattern, with a subjectPattern to aim it at a nation's department) to a pack's gate register first (docs/design/SENSITIVE-HISTORY.md 3.7, decision 0070), so the new owner cannot be aimed at a nation's land unguarded.`;

describe('the manpower and population tripwire (0070)', () => {
  it('every kernel field about manpower or population is named by a pack register', () => {
    const found = unregisteredStems(declaredFields(OWNED_FIELDS, kernelSources()), registerNames());
    expect(found, WHY(found)).toEqual([]);
  });

  it('is looking at something: the kernel does declare a population field today, and a register does name it', () => {
    const declared = declaredFields(OWNED_FIELDS, kernelSources());
    expect(declared.some((f) => f.toLowerCase().includes('population'))).toBe(true);
    expect(registerNames().texts.some((t) => t.includes('population'))).toBe(true);
  });

  it('positive controls: a new manpower field with no register entry fails, each stem, and one a register names passes', () => {
    const names: RegisterNames = { texts: ['fenfolk-population', '^recruit'] };
    for (const stem of ['recruit', 'manpower', 'levy', 'draft', 'quota', 'enlist', 'population']) {
      const found = unregisteredStems([`a ${stem} field`], { texts: [] });
      expect(found, stem).toEqual([{ field: `a ${stem} field`, stem }]);
    }
    expect(unregisteredStems(['regional manpower'], names)).toEqual([{ field: 'regional manpower', stem: 'manpower' }]);
    expect(unregisteredStems(['region population', 'recruitment quotas'], names)).toEqual([{ field: 'recruitment quotas', stem: 'quota' }]);
    expect(unregisteredStems(['region loyalty', 'division location'], names)).toEqual([]);
    // A declared proposal field id is read from `*_FIELD` constants, and an owned field from its description or State key.
    expect(declaredFields([{ field: 'army levy', writer: 'x', proposedBy: [], code: [{ record: 'State', key: 'conscriptDraft' }] }], ["export const RECRUITMENT_FIELD = 'recruitment';"])).toEqual(['army levy', 'conscriptDraft', 'recruitment']);
    expect(WHY([{ field: 'f', stem: 'draft' }])).toContain('subjectPattern');
  });
});
