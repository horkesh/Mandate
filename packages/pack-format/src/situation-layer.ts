/**
 * Situations and the gate, read and checked together (lane 0.7). Both the
 * generator (from sources) and the loader (committed files only) call this
 * after the World validates: situation files are hand-written and committed
 * as they are, so there is nothing to generate and nothing to go stale.
 */
import type { phase0 } from '@mandate/kernel';
import { checkGate, GATE_DIR, localeStrings, readGate, type GateData } from './gate.ts';
import { listOptional, type PackFiles } from './generate.ts';
import { errorsOf, type Issue, IssueSink } from './issues.ts';
import { readSituations, SITUATIONS_DIR, validateSituations } from './situations.ts';
import type { PackData } from './validate.ts';

export interface SituationLayer {
  /** Empty while any situation or gate error stands. */
  readonly situations: readonly phase0.SituationDef[];
  readonly gate: GateData | null;
  readonly issues: readonly Issue[];
}

export function readSituationLayer(files: PackFiles, pack: PackData): SituationLayer {
  const sink = new IssueSink();
  const items = readSituations(files, sink);
  const hasGate = listOptional((p) => files.files(p), GATE_DIR).length > 0;
  if (items.length === 0 && !hasGate && listOptional((p) => files.folders(p), SITUATIONS_DIR).length === 0) return { situations: [], gate: null, issues: sink.issues };
  // A pack with situations must carry its gate: without it, A1 cannot tell what needs a tag.
  const gate = readGate(files, sink);
  sink.add(validateSituations(items, pack));
  if (gate !== null) {
    sink.add(checkGate(items, gate, localeStrings(pack.strings), pack.provenance));
  }
  const ok = errorsOf(sink.issues).length === 0;
  return { situations: ok ? items.map((i) => i.def) : [], gate, issues: sink.issues };
}
