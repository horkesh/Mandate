import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkLiveness, phase0, type LivenessRow } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { bandProblems, declaredMechanics, gateFailures, QUIET, REFERENCE_RUNS, seatsNamed, type ReferenceRun } from '../src/liveness-gate.ts';
import { phase0Run } from '../src/phase0-run.ts';

/**
 * The Phase 0 liveness gate (lane 0.8, step 3; FOUNDATION section 11.5): every mechanic the tick and the
 * map declare fires within a plausible band in a reference run, or is quiet for a stated reason with a
 * kernel test that drives it. Each rule has a positive control: a planted dead mechanic must fail.
 */
const REPO = fileURLToPath(new URL('../../../', import.meta.url));
const NOTHING: phase0.SeatTable = () => ({ driver: 'rules' as const, respond: () => ({ answerKind: 'commands' as const, commands: [] }) });

function liveness(run: ReferenceRun, seats?: phase0.SeatTable): readonly LivenessRow[] {
  return phase0Run({ pack: run.pack, days: run.days, atWar: run.atWar, seats: seats ?? seatsNamed(run.seats), checks: false, replay: false, hash: 'checkpoints', checkpointEvery: run.days }).liveness;
}

describe('the band table', () => {
  it('is sound: every mechanic banded in each full run, every zero band explained, none fires nowhere unexplained', () => {
    expect(bandProblems()).toEqual([]);
  });

  it('names a kernel test for every mechanic that fires in no reference run, and that test exists and says so', () => {
    expect(Object.keys(QUIET).length).toBeGreaterThan(0);
    for (const [mechanic, q] of Object.entries(QUIET)) {
      const path = `${REPO}${q.test}`;
      expect(existsSync(path), `${mechanic}: ${q.test} exists`).toBe(true);
      expect(readFileSync(path, 'utf8'), `${mechanic}: ${q.test} contains "${q.needle}"`).toContain(q.needle);
    }
  });

  it('the checks can fail: a missing band, a zero band with no reason, a mechanic firing nowhere, an undeclared band', () => {
    const full = REFERENCE_RUNS.find((r) => r.kind === 'full')!;
    const without = Object.fromEntries(Object.entries(full.bands).filter(([m]) => m !== 'messages.sent'));
    expect(bandProblems([{ ...full, bands: without }, ...REFERENCE_RUNS.filter((r) => r !== full)])).toContain(`${full.name}: no band for messages.sent`);
    const unexplained = { ...full.bands, 'combat.retreat': { minFires: 0 } };
    expect(bandProblems([{ ...full, bands: unexplained }, ...REFERENCE_RUNS.filter((r) => r !== full)]).join('\n')).toContain('combat.retreat is banded at zero with no reason');
    // A mechanic quiet in every run and absent from QUIET: here, the testbed's only live source of movement.
    const allQuiet = REFERENCE_RUNS.map((r) => ({ ...r, bands: { ...r.bands, 'movement.arrived': { minFires: 0, maxFires: 0, why: 'planted: switched off in every run' } } }));
    expect(bandProblems(allQuiet)).toContain('movement.arrived fires in no reference run and has no quiet reason with a driving kernel test');
    const undeclared = { ...full.bands, 'bogus.mechanic': { minFires: 1 } };
    expect(bandProblems([{ ...full, bands: undeclared }, ...REFERENCE_RUNS.filter((r) => r !== full)])).toContain(`${full.name}: a band for bogus.mechanic, which nothing declares`);
  });

  it('declares each Phase 0 mechanic once', () => {
    const declared = declaredMechanics();
    expect(new Set(declared).size).toBe(declared.length);
    expect(declared).toEqual(expect.arrayContaining(['movement.arrived', 'combat.contest', 'map.recomputed', 'situations.fired', 'messages.sent', 'forces.stores_fell']));
  });
});

describe('the reference runs', () => {
  for (const run of REFERENCE_RUNS) {
    it(`${run.name}: every mechanic fires within its band`, { timeout: 120_000 }, () => {
      expect(gateFailures(run, liveness(run))).toEqual([]);
    });
  }
});

describe('the gate can fail (positive controls)', () => {
  const union = REFERENCE_RUNS.find((r) => r.pack === 'union-1861')!;
  const testbed = REFERENCE_RUNS.find((r) => r.pack === 'testbed' && r.kind === 'full')!;

  it('a run in which no seat orders anything leaves the movement and contest mechanics dead', { timeout: 120_000 }, () => {
    const failures = gateFailures(union, liveness(union, NOTHING));
    const dead = failures.filter((f) => f.problem === 'dead').map((f) => f.mechanic);
    expect(dead).toEqual(expect.arrayContaining(['movement.leg_started', 'movement.arrived', 'combat.contest', 'control.changed', 'orders.obeyed']));
  });

  it('a planted dead mechanic is reported dead, and one that fires too often too frequent', () => {
    const rows = liveness(testbed);
    const planted = rows.map((r) => (r.mechanic === 'messages.sent' ? { ...r, fires: 0, magnitude: 0 } : r));
    expect(gateFailures(testbed, planted)).toEqual([{ mechanic: 'messages.sent', problem: 'dead', fires: 0, band: testbed.bands['messages.sent'] }]);
    const flooded = rows.map((r) => (r.mechanic === 'combat.contest' ? { ...r, fires: r.fires * 10 } : r));
    expect(gateFailures(testbed, flooded).map((f) => [f.mechanic, f.problem])).toEqual([['combat.contest', 'too_frequent']]);
    const rare = rows.map((r) => (r.mechanic === 'messages.delivered' ? { ...r, fires: 1 } : r));
    expect(gateFailures(testbed, rare).map((f) => [f.mechanic, f.problem])).toEqual([['messages.delivered', 'too_rare']]);
  });

  it('a mechanic that is quiet by design fails the gate the day it starts to fire, so its band is moved on purpose', () => {
    const rows = liveness(testbed).map((r) => (r.mechanic === 'orders.relay_objected' ? { ...r, fires: 1, magnitude: 1 } : r));
    expect(gateFailures(testbed, rows).map((f) => [f.mechanic, f.problem])).toEqual([['orders.relay_objected', 'too_frequent']]);
  });

  it('a run with no band for one of its mechanics fails', () => {
    const rows = [...liveness(testbed), { mechanic: 'bogus.mechanic', fires: 3, magnitude: 3 }];
    expect(checkLiveness(rows, testbed.bands).map((f) => [f.mechanic, f.problem])).toEqual([['bogus.mechanic', 'no_band']]);
  });
});
