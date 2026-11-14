/**
 * Liveness telemetry (FOUNDATION section 11.5; AWWV's dead mechanics).
 *
 * Every mechanic counts how often it fires and how much it changes. A
 * mechanic that never fires in a reference run is a bug even when the scores
 * look good, so mechanics are declared up front and reported at zero rather
 * than missing.
 *
 * Telemetry is a report, not State: it is never saved or hashed, and the
 * kernel holds no module-level counter. The runner creates a `Telemetry`,
 * passes it into the tick, and reads `livenessReport` at the end.
 */
import { strictCompare } from './compare.ts';

export interface MechanicCount {
  /** How many times the mechanic fired (changed something). */
  fires: number;
  /** Sum of the absolute size of its changes, in the mechanic's own integer unit. */
  magnitude: number;
}

export interface Telemetry {
  readonly mechanics: Record<string, MechanicCount>;
}

export interface LivenessRow {
  readonly mechanic: string;
  readonly fires: number;
  readonly magnitude: number;
}

/** A mechanic's plausible band in a reference run. `maxFires` omitted means no upper bound. */
export interface LivenessBand {
  readonly minFires: number;
  readonly maxFires?: number;
}

export interface LivenessFailure {
  readonly mechanic: string;
  readonly problem: 'dead' | 'too_rare' | 'too_frequent' | 'undeclared' | 'no_band';
  readonly fires: number;
  readonly band?: LivenessBand;
}

/** A fresh telemetry with every declared mechanic at zero. */
export function createTelemetry(declared: readonly string[]): Telemetry {
  const mechanics: Record<string, MechanicCount> = {};
  for (const name of declared) {
    if (name.length === 0) throw new RangeError('mechanic name must not be empty');
    if (Object.prototype.hasOwnProperty.call(mechanics, name)) throw new RangeError(`mechanic "${name}" declared twice`);
    mechanics[name] = { fires: 0, magnitude: 0 };
  }
  return { mechanics };
}

/**
 * Record one firing of `mechanic` that changed something by `change` (signed;
 * its absolute value is added to the magnitude). Throws on an undeclared
 * mechanic, so a typo cannot create a second, silent counter.
 */
export function recordFire(telemetry: Telemetry | undefined, mechanic: string, change = 1): void {
  if (!telemetry) return;
  if (!Number.isSafeInteger(change)) throw new RangeError(`change for ${mechanic} must be an integer, got ${change}`);
  if (!Object.prototype.hasOwnProperty.call(telemetry.mechanics, mechanic)) {
    throw new RangeError(`mechanic "${mechanic}" was not declared`);
  }
  const count = telemetry.mechanics[mechanic]!;
  count.fires += 1;
  count.magnitude += change < 0 ? -change : change;
}

/** Every declared mechanic, in strict name order, including those that never fired. */
export function livenessReport(telemetry: Telemetry): LivenessRow[] {
  return Object.keys(telemetry.mechanics)
    .sort(strictCompare)
    .map((mechanic) => ({ mechanic, ...telemetry.mechanics[mechanic]! }));
}

/**
 * The health gate: every mechanic in the report must have a band, and fire
 * within it; every band must name a declared mechanic. Empty when healthy.
 */
export function checkLiveness(report: readonly LivenessRow[], bands: Readonly<Record<string, LivenessBand>>): LivenessFailure[] {
  const failures: LivenessFailure[] = [];
  const seen = new Set<string>();
  for (const row of report) {
    seen.add(row.mechanic);
    const band = Object.prototype.hasOwnProperty.call(bands, row.mechanic) ? bands[row.mechanic] : undefined;
    if (!band) {
      failures.push({ mechanic: row.mechanic, problem: 'no_band', fires: row.fires });
    } else if (row.fires === 0 && band.minFires > 0) {
      failures.push({ mechanic: row.mechanic, problem: 'dead', fires: 0, band });
    } else if (row.fires < band.minFires) {
      failures.push({ mechanic: row.mechanic, problem: 'too_rare', fires: row.fires, band });
    } else if (band.maxFires !== undefined && row.fires > band.maxFires) {
      failures.push({ mechanic: row.mechanic, problem: 'too_frequent', fires: row.fires, band });
    }
  }
  for (const mechanic of Object.keys(bands).sort(strictCompare)) {
    if (!seen.has(mechanic)) failures.push({ mechanic, problem: 'undeclared', fires: 0, band: bands[mechanic] });
  }
  return failures;
}
