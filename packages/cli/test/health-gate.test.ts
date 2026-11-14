import { checkLiveness, type LivenessBand } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { headlessRun } from '../src/headless.ts';
import { M2_MECHANICS } from '../src/m2-liveness.ts';

/**
 * The health gate (FOUNDATION section 11.5): in a reference run, every
 * mechanic fires within a plausible band. A dead mechanic is a bug even when
 * the scores look good.
 *
 * This is the skeleton. The reference run today is the M2 kernel on the
 * testbed, 20 turns, with the generic scripted leader. Mechanics that leader
 * never exercises carry `minFires: 0` and say so; they retire with M2. Lane
 * 0.8 replaces the reference run with the Phase 0 headless run, and every
 * Phase 0 mechanic gets a band with `minFires >= 1` (the todos below).
 */

const NOT_EXERCISED: LivenessBand = { minFires: 0 };

const M2_TESTBED_BANDS: Readonly<Record<string, LivenessBand>> = {
  checkpoint: { minFires: 1, maxFires: 4 },
  directive_read: { minFires: 10, maxFires: 40 },
  force_change: { minFires: 10, maxFires: 60 },
  ladder_moved: { minFires: 4, maxFires: 30 },
  operation_planned: { minFires: 4, maxFires: 30 },
  operation_resolved: { minFires: 4, maxFires: 30 },
  transfer_arrived: { minFires: 1, maxFires: 10 },
  transfer_sent: { minFires: 1, maxFires: 10 },
  verb_accept_counter: { minFires: 1, maxFires: 10 },
  verb_address: { minFires: 5, maxFires: 25 },
  verb_allocate: { minFires: 1, maxFires: 10 },
  verb_appoint: { minFires: 1, maxFires: 10 },
  verb_direct: { minFires: 5, maxFires: 30 },
  verb_dismiss: { minFires: 1, maxFires: 10 },
  verb_insist: { minFires: 1, maxFires: 10 },
  verb_oversee: { minFires: 1, maxFires: 10 },
  verb_promise: { minFires: 1, maxFires: 10 },
  // The scripted leader and a 20-turn testbed never reach these.
  bot_decision_rejected: NOT_EXERCISED,
  control_flip: NOT_EXERCISED,
  delegated_by_default: NOT_EXERCISED,
  directive_moot: NOT_EXERCISED,
  directive_unheld: NOT_EXERCISED,
  force_destroyed: NOT_EXERCISED,
  operation_cancelled: NOT_EXERCISED,
  promise_broken: NOT_EXERCISED,
  rival_emerged: NOT_EXERCISED,
  verb_audience: NOT_EXERCISED,
  verb_honour: NOT_EXERCISED,
  verb_pressure: NOT_EXERCISED,
};

describe('health gate: mechanic liveness in the reference run', () => {
  const summary = headlessRun({ pack: 'testbed', maxTurns: 20 });

  it('has a band for every declared mechanic, and no band for an undeclared one', () => {
    expect(Object.keys(M2_TESTBED_BANDS).sort()).toEqual([...M2_MECHANICS].sort());
  });

  it('every mechanic fires within its band', () => {
    expect(checkLiveness(summary.liveness, M2_TESTBED_BANDS)).toEqual([]);
  });

  it.todo('Phase 0: movement, control contest, control index, supply, infrastructure and messages each fire (lane 0.8)');
  it.todo('Phase 0: the reference run is the Union 1861 headless run with rule seats (lane 0.8)');
});
