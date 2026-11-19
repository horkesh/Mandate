import { describe, expect, it } from 'vitest';
import { errorsOf, generatePack, RulesSchema } from '../src/index.ts';
import { filesOf, fixture } from './support/fixture.ts';

function filesWithTerms(over: Record<string, unknown> = {}) {
  const files = fixture();
  const manifest = JSON.parse(files.get('pack.json')!);
  manifest.rules.combat.bombardment.objectives = [{ region: 'alpha', source: 'DESIGN' }];
  manifest.rules.combat.bombardment.recordTerms = [{ region: 'alpha', faction: 'red', commander: 'red_chief', offerWindow: { offerDay: 5, lastDay: 7 }, terms: 'evacuated_under_terms', source: 'DESIGN', ...over }];
  files.set('pack.json', JSON.stringify(manifest));
  return { files, rules: manifest.rules };
}

describe('recorded surrender conditions at the pack boundary', () => {
  it('requires an explicit commander and offer window, with null for an undated record', () => {
    const { rules } = filesWithTerms();
    expect(RulesSchema.safeParse(rules).success).toBe(true);
    expect(RulesSchema.safeParse(filesWithTerms({ offerWindow: null }).rules).success).toBe(true);
    for (const field of ['commander', 'offerWindow']) {
      const missing = structuredClone(rules);
      delete missing.combat.bombardment.recordTerms[0][field];
      expect(RulesSchema.safeParse(missing).success).toBe(false);
    }
  });

  it.each([{ offerDay: -1, lastDay: 7 }, { offerDay: 5.5, lastDay: 7 }, { offerDay: 7, lastDay: 7 }, { offerDay: 8, lastDay: 7 }])('rejects an invalid offer window %j', (offerWindow) => {
    expect(errorsOf(generatePack(filesOf(filesWithTerms({ offerWindow }).files)).issues).length).toBeGreaterThan(0);
  });

  it('rejects a recorded commander missing from the pack', () => {
    const valid = generatePack(filesOf(filesWithTerms().files));
    expect(errorsOf(valid.issues)).toEqual([]);
    const invalid = generatePack(filesOf(filesWithTerms({ commander: 'missing' }).files));
    expect(errorsOf(invalid.issues)).toContainEqual(expect.objectContaining({ kind: 'unknown-reference', message: expect.stringContaining('missing') }));
  });
});
