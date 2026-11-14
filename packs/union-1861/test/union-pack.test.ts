import { describe, expect, it } from 'vitest';
import { createGame, DEFAULT_KERNEL_RULES, holdAudience, validateScenario } from '@mandate/kernel';
import { loadScenario } from '../../../packages/cli/src/load.ts';
import { runPack } from '../../../packages/cli/src/run.ts';
import { testbedScript } from '../../../packages/cli/src/testbed-script.ts';

describe('union-1861 pack (M2)', () => {
  const data = loadScenario('union-1861');

  it('validates cleanly', () => {
    expect(validateScenario(data)).toEqual([]);
  });

  it('McClellan, asked to attack Manassas, refuses and says why', () => {
    const outcome = holdAudience(createGame(data), 'union', {
      postId: 'us_army_potomac',
      objective: { kind: 'attack', targetRegionId: 'northern_virginia' },
      boldness: 800,
      counters: [],
    }, DEFAULT_KERNEL_RULES);
    expect(outcome.personId).toBe('mcclellan');
    expect(['refuse', 'object']).toContain(outcome.declared);
    expect(outcome.statedReasons.map((r) => r.kind)).toContain('too_rash');
    // He is uncandid: his distrust of Lincoln is not among the reasons he gives.
    expect(outcome.statedReasons.map((r) => r.kind)).not.toContain('distrusts_leader');
  });

  it('plays deterministically to a verdict', () => {
    const a = runPack('union-1861', testbedScript, 80);
    const b = runPack('union-1861', testbedScript, 80);
    expect(a.lines).toEqual(b.lines);
    expect(a.final.verdict).not.toBeNull();
    expect(a.turns.some((t) => (t.botDecisions.confederacy ?? []).length > 0)).toBe(true);
  });
});
