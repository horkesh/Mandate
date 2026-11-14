import { describe, expect, it } from 'vitest';
import { checkLiveness, createTelemetry, livenessReport, recordFire } from '../src/telemetry.ts';

describe('liveness telemetry', () => {
  it('reports every declared mechanic, including those that never fired, in strict order', () => {
    const t = createTelemetry(['movement', 'combat', 'attrition']);
    recordFire(t, 'combat', -120);
    recordFire(t, 'combat', 30);
    expect(livenessReport(t)).toEqual([
      { mechanic: 'attrition', fires: 0, magnitude: 0 },
      { mechanic: 'combat', fires: 2, magnitude: 150 },
      { mechanic: 'movement', fires: 0, magnitude: 0 },
    ]);
  });

  it('refuses undeclared mechanics, duplicate declarations and non-integer changes', () => {
    const t = createTelemetry(['combat']);
    expect(() => recordFire(t, 'comabt')).toThrow('not declared');
    expect(() => createTelemetry(['a', 'a'])).toThrow('declared twice');
    expect(() => recordFire(t, 'combat', 0.5)).toThrow('integer');
  });

  it('is optional: a mechanic can record into no telemetry at all', () => {
    expect(() => recordFire(undefined, 'anything', 3)).not.toThrow();
  });

  it('the health gate flags dead, rare, frequent, unbanded and undeclared mechanics', () => {
    const t = createTelemetry(['dead', 'rare', 'busy', 'fine', 'unbanded']);
    for (let i = 0; i < 9; i++) recordFire(t, 'busy');
    recordFire(t, 'rare');
    recordFire(t, 'fine');
    recordFire(t, 'unbanded');
    const failures = checkLiveness(livenessReport(t), {
      dead: { minFires: 1 },
      rare: { minFires: 2 },
      busy: { minFires: 1, maxFires: 5 },
      fine: { minFires: 1, maxFires: 5 },
      ghost: { minFires: 1 },
    });
    expect(failures.map((f) => `${f.mechanic}:${f.problem}`)).toEqual(['busy:too_frequent', 'dead:dead', 'rare:too_rare', 'unbanded:no_band', 'ghost:undeclared']);
  });
});
