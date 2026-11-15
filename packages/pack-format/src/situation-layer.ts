/**
 * Situations and the gate, read and checked together (lane 0.7). Both the
 * generator (from sources) and the loader (committed files only) call this
 * after the World validates: situation files are hand-written and committed
 * as they are, so there is nothing to generate and nothing to go stale.
 */
import { phase0 } from '@mandate/kernel';
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
  warFlagsUnset(items, pack, sink);
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

/**
 * The rule-seat war setting (0064) names situation flags: warn for each one no
 * situation in the pack sets, so that faction's generic principal would keep
 * the peace for the whole run. A warning, not an error: a pack may ship before
 * the war's opening situation is authored (union-1861 does today).
 */
export function warFlagsUnset(items: readonly { readonly def: phase0.SituationDef }[], pack: PackData, sink: IssueSink): void {
  const set = new Set<string>();
  for (const { def } of items) for (const { effect } of phase0.effectsOf(def)) if ('setFlag' in effect) set.add(effect.setFlag);
  pack.world.rules.ruleSeats.warFlags.forEach((row, i) => {
    if (row.flag !== null && !set.has(row.flag)) {
      sink.warn('war-flag-unset', 'pack.json', `rules.ruleSeats.warFlags[${i}].flag`, `no situation sets "${row.flag}", so ${row.faction}'s rule-seat principal keeps the peace for the whole run`, 'a situation whose effects set this flag (the war\'s opening), or null for war from day 1');
    }
  });
}
