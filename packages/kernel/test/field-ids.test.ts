import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as phase0 from '../src/phase0.ts';
import { REPO_ROOT, repoPath, tsFiles } from './support/source.ts';

/**
 * Every field id the kernel exports for situations to propose to (`*_FIELD`) is lowercase (the standing review of lane
 * 1.8's register, S1). The gate's field signatures find words by their separators, so a camelCase id such as
 * `prisonersHeld` would pass every one of them; the situation schema refuses a camelCase `propose.field`
 * (`packages/pack-format/src/situations.ts`), and this keeps the kernel's own ids on the same side of that rule.
 */
const LOWER = /^[a-z0-9][a-z0-9_.:/-]*$/;

describe('field ids are lowercase', () => {
  it('every exported *_FIELD constant in the kernel source is a lowercase id', () => {
    const found: { at: string; value: string }[] = [];
    for (const file of tsFiles(join(REPO_ROOT, 'packages', 'kernel', 'src'))) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/export const ([A-Z][A-Z0-9_]*_FIELD)\s*(?::[^=]+)?=\s*'([^']*)'/g)) found.push({ at: `${repoPath(file)} ${m[1]}`, value: m[2]! });
    }
    expect(found.length, 'the scan finds the kernel’s field ids').toBeGreaterThanOrEqual(2);
    for (const f of found) expect(f.value, f.at).toMatch(LOWER);
  });

  it('and so is every *_FIELD the kernel exports at run time (the scan’s control)', () => {
    const fields = Object.entries(phase0).filter(([name, v]) => name.endsWith('_FIELD') && typeof v === 'string') as [string, string][];
    expect(fields.map(([n]) => n).sort()).toEqual(expect.arrayContaining(['DEPARTMENT_SIDE_FIELD', 'GOVERNMENT_CLOSED_FIELD']));
    for (const [name, value] of fields) expect(value, name).toMatch(LOWER);
    // The rule bites: a camelCase id fails it.
    expect('prisonersHeld').not.toMatch(LOWER);
  });
});
