/**
 * Situations and the gate, read and checked together (lane 0.7). Both the
 * generator (from sources) and the loader (committed files only) call this
 * after the World validates: situation files are hand-written and committed
 * as they are, so there is nothing to generate and nothing to go stale.
 */
import { phase0 } from '@mandate/kernel';
import { checkGate, choiceTaint, GATE_DIR, localeStrings, readGate, triggerDependencies, type GateData } from './gate.ts';
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
  warFlagSources(items, pack, sink);
  nationActs(items, pack, sink);
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

/**
 * Who may set a war flag (0066): only a decision option of the faction whose flag it is. A decision applies its options
 * only after it has surfaced on its principal's knowledge, so a principal is never at war before he knows. A notice
 * applies its effects when it fires, before the news reaches anyone, so a flag it set would tell every principal of a war
 * he has not heard of; another faction's situation would put a government at war by someone else's choice; and an
 * inaction outcome or a locked cost is not a choice of war; and going to war is the principal's own act, so a situation
 * he can delegate to another post may not set one. Each is an error.
 */
export function warFlagSources(items: readonly { readonly file: string; readonly def: phase0.SituationDef }[], pack: PackData, sink: IssueSink): void {
  const owner = new Map<string, string>();
  for (const row of pack.world.rules.ruleSeats.warFlags) if (row.flag !== null) owner.set(row.flag, row.faction);
  for (const { file, def } of items) {
    for (const { at, effect } of phase0.effectsOf(def)) {
      if (!('setFlag' in effect) || !owner.has(effect.setFlag)) continue;
      const faction = owner.get(effect.setFlag)!;
      const err = (message: string, expected: string) => sink.error('war-flag-source', file, at, message, expected);
      if (def.faction !== faction) err(`"${def.id}" is ${def.faction}'s situation but sets ${faction}'s war flag "${effect.setFlag}"`, `only ${faction}'s own decision sets it (0066)`);
      else if (def.kind !== 'decision') err(`"${def.id}" is a notice and sets the war flag "${effect.setFlag}": it applies before any principal has the news`, 'a decision option of the faction itself (0066)');
      else if (def.delegableTo.length > 0) err(`"${def.id}" can be delegated (to ${def.delegableTo.join(', ')}) and its option sets the war flag "${effect.setFlag}": a delegate's choice would put the war in the president's menu before the delegate's report reached him`, 'no delegable situation sets a war flag: going to war is an act of the principal himself (0066)');
      else if (!/^options\[\d+\]\.effects\[\d+\]$/.test(at)) err(`"${def.id}" sets the war flag "${effect.setFlag}" from ${at}, which is not a chosen option's effect`, 'an effect of a decision option (0066)');
    }
  }
}

/**
 * A nation's act is its own (0070). A notice that moves a self-governing department (its side, closing or reopening):
 * - names whose act it is (`actingGovernment`), which must be the proposal's subject, so a side's act authored as a
 *   notice cannot move a nation;
 * - carries a gate topic tag and a reviewer's sign-off, so the gate reviewer reads every one;
 * - does not depend on a principal's decision by any route (reading it, a flag an option or its inaction sets, a chain
 *   stage after it), through any chain of items, found to a fixed point with 0060's machinery (`choiceTaint`): no
 *   principal's choice moves a nation, however many notices it passes through;
 * - and for the events and news it does depend on (a firing, a report, a flag a notice sets), the sign-off carries the
 *   reviewer's note on that route, keyed `route|<situation id>` (the notes' own place, as for review-severity wording).
 * A decision that moves one is refused by `commandProposal` (0069); it is skipped here.
 */
export function nationActs(items: readonly { readonly file: string; readonly def: phase0.SituationDef }[], pack: PackData, sink: IssueSink): void {
  const selfGoverning = new Set(pack.world.vocabularies.departmentKinds.filter((k) => k.selfGoverning).map((k) => k.id as string));
  const nations = new Set(pack.world.departments.filter((d) => selfGoverning.has(d.kind)).map((d) => d.id as string));
  if (nations.size === 0) return;
  const taint = choiceTaint(items);
  for (const { file, def } of items) {
    if (def.kind !== 'notice') continue;
    const moves = phase0.effectsOf(def).flatMap(({ at, effect }) => {
      if (!('propose' in effect) || effect.propose.owner !== 'command' || effect.propose.subject === null) return [];
      if (effect.propose.field !== phase0.DEPARTMENT_SIDE_FIELD && effect.propose.field !== phase0.GOVERNMENT_CLOSED_FIELD) return [];
      return nations.has(effect.propose.subject) ? [{ at, subject: effect.propose.subject }] : [];
    });
    if (moves.length === 0) continue;
    const err = (kind: string, at: string, message: string, expected: string) => sink.error(kind, file, at, message, expected);
    if (def.actingGovernment === undefined) err('acting-government-missing', 'actingGovernment', `"${def.id}" moves ${moves[0]!.subject}, which governs itself, but names no acting government`, `actingGovernment: ${moves[0]!.subject}, the nation whose act it is (0070)`);
    for (const m of moves) {
      if (def.actingGovernment !== undefined && def.actingGovernment !== m.subject) {
        err('acting-government-mismatch', m.at, `"${def.id}" is the act of ${def.actingGovernment}, but moves ${m.subject}, which governs itself`, `only the nation's own act moves it: actingGovernment must be ${m.subject} (0070)`);
      }
    }
    if ('none' in def.gate || def.gate.topics.length === 0) err('self-governing-gate', 'gate', `"${def.id}" moves a self-governing department but carries no gate topic`, 'a gate tag naming its topics, so the gate reviewer reads it (0070)');
    if (def.gateReview === null) err('self-governing-gate', 'gateReview', `"${def.id}" moves a self-governing department but has no sign-off`, 'a sign-off by a gate reviewer who is not the author (0070)');
    // State predicates carry no route through another item, so they are read here (gate re-check R2): a standing goal is the
    // principal's own order, so a nation's act may not wait on it; a headquarters is a consequence, so it needs a route note.
    const states = statePredicates([def.event, ...(def.knowledge === null ? [] : [def.knowledge])]);
    for (const g of states.goals) err('self-governing-goal', 'event', `"${def.id}" moves ${moves[0]!.subject} and reads the standing goal of post "${g.post}": a standing goal is the principal's own order`, 'no order of a principal moves a nation: read events and news, never a goal (0070)');
    for (const h of states.headquarters) {
      const key = `route|state:headquartersAt:${h.post}:${h.region}`;
      if ((def.gateReview?.notes[key] ?? '').trim().length === 0) err('self-governing-route-note', 'gateReview.notes', `"${def.id}" moves ${moves[0]!.subject} and reads where "${h.post}" has its headquarters (${h.region}), a consequence of orders: the sign-off carries no reviewer's note on that route`, `gateReview.notes["${key}"]: the reviewer's note that the nation answers where the army stands, not a choice (0070)`);
    }
    // A direct read of a standing goal is reported above, as its own error; what is left is a choice reached through another item.
    const chosen = (taint.get(def.id) ?? []).filter((t) => !(t.atrocity.startsWith('goal:') && t.via.length === 0));
    for (const t of chosen) {
      err('self-governing-choice', 'event', `"${def.id}" moves ${moves[0]!.subject} but depends on ${t.atrocity.startsWith('goal:') ? `the standing goal of post "${t.atrocity.slice('goal:'.length)}"` : `the principal's decision "${t.atrocity}"`}${t.via.length === 0 ? '' : `, through ${t.via.map((v) => `"${v}"`).join(' then ')}`}`, 'no choice of a principal moves a nation by any route: reading the decision, a flag an option sets, or a chain; a nation answers events and news, never a choice (0070)');
    }
    if (chosen.length > 0) continue;
    for (const dep of triggerDependencies(def, items)) {
      if ((def.gateReview?.notes[`route|${dep}`] ?? '').trim().length === 0) {
        err('self-governing-route-note', 'gateReview.notes', `"${def.id}" moves ${moves[0]!.subject} and depends on "${dep}" (an event or news): the sign-off carries no reviewer's note on that route`, `gateReview.notes["route|${dep}"]: the reviewer's note that the nation answers what happened, not a choice (0070)`);
      }
    }
  }
}

/** The State predicates in conditions: standing goals and headquarters, which no other item sets, so they carry no route (gate re-check R2). */
function statePredicates(conditions: readonly phase0.Condition[]): { readonly goals: { readonly post: string; readonly kind: string }[]; readonly headquarters: { readonly post: string; readonly region: string }[] } {
  const goals: { post: string; kind: string }[] = [];
  const headquarters: { post: string; region: string }[] = [];
  const walk = (c: phase0.Condition): void => {
    if ('all' in c) c.all.forEach(walk);
    else if ('any' in c) c.any.forEach(walk);
    else if ('not' in c) walk(c.not);
    else if ('goal' in c) goals.push({ post: c.goal.post, kind: c.goal.kind });
    else if ('headquartersAt' in c) headquarters.push({ post: c.headquartersAt.post, region: c.headquartersAt.region });
  };
  conditions.forEach(walk);
  return { goals, headquarters };
}
