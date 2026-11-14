/**
 * Liveness for the M2 kernel, measured from the outside. The M2 modules are
 * being replaced in Phase 0, so instead of instrumenting them this reads each
 * turn's ledger and state difference into the kernel's telemetry API. The new
 * Phase 0 mechanics call `recordFire` themselves, from the tick.
 */
import { createTelemetry, recordFire, VERBS, type GameState, type Telemetry } from '@mandate/kernel';

/** Ledger entry kinds the M2 kernel writes, each counted as one mechanic. */
const LEDGER_MECHANICS = [
  'bot_decision_rejected',
  'checkpoint',
  'delegated_by_default',
  'directive_moot',
  'directive_read',
  'directive_unheld',
  'force_destroyed',
  'ladder_moved',
  'operation_cancelled',
  'operation_planned',
  'operation_resolved',
  'promise_broken',
  'rival_emerged',
  'transfer_arrived',
  'transfer_sent',
  ...VERBS.map((v) => `verb_${v}`),
] as const;

/** Changes read from state differences: control flips (one per region) and post force (magnitude in men). */
const STATE_MECHANICS = ['control_flip', 'force_change'] as const;

export const M2_MECHANICS: readonly string[] = [...LEDGER_MECHANICS, ...STATE_MECHANICS];

export function createM2Telemetry(): Telemetry {
  return createTelemetry(M2_MECHANICS);
}

/** Record what changed between two consecutive states. Throws on a ledger kind this list does not know. */
export function recordM2Turn(telemetry: Telemetry, before: GameState, after: GameState): void {
  for (const entry of after.ledger.slice(before.ledger.length)) recordFire(telemetry, entry.kind);
  for (const id of Object.keys(after.regions).sort()) {
    if (before.regions[id]?.controllerId !== after.regions[id]!.controllerId) recordFire(telemetry, 'control_flip');
  }
  for (const id of Object.keys(after.posts).sort()) {
    const change = after.posts[id]!.force - (before.posts[id]?.force ?? 0);
    if (change !== 0) recordFire(telemetry, 'force_change', change);
  }
}
