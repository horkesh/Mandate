/**
 * The commanders' battle decisions (the combat note's P6; 0007: no dice for people). Each is a pure function of the
 * man's traits and what he sees, never of a stream and never of the truth plain:
 * - **what he sees** of the enemy in contact is the enemy's known men present, inflated by his own perception bias, the
 *   one rule belief derivation applies (`knowledge/beliefs.ts`, `perceived`); his own men he knows;
 * - **what he needs** is his own demand ratio (`people/traits.ts`, `demandRatio`), the force ratio he wants before he
 *   advances; the pack's shares of it set when he attacks, probes, holds, breaks out and pursues.
 *
 * So a cautious man who overestimates the enemy holds back (the combat note's P6 example), and a bold man attacks again. The kernel offers the menu; the commander's traits pick from it.
 */
import type { PersonId } from '../ids.ts';
import { perceived } from '../knowledge/beliefs.ts';
import type { BattleTerm, CutOffChoice, Pursuit } from './records.ts';
import type { CombatRules, Commit } from './rules.ts';

/** A commander as his battle decisions read him (or the pack's unknown man, for a vacant post). */
export interface CommanderView {
  readonly person: PersonId | null;
  readonly boldness: number;
  readonly competence: number;
  readonly nerve: number;
  /** How much larger he sees the enemy than it is, permille (1000: as it is). */
  readonly perceptionPermille: number;
  /** The force ratio he needs before he advances, permille. */
  readonly demandPermille: number;
}

/** The highest believed ratio recorded: an enemy he cannot see at all is a ratio this large, never a division by zero. */
export const RATIO_CAP = 1_000_000;

/** His own men against the enemy as he sees them, permille. */
export function believedRatio(view: CommanderView, own: number, enemy: number): number {
  const seen = perceived(enemy, view.perceptionPermille);
  if (seen <= 0) return own > 0 ? RATIO_CAP : 0;
  return Math.min(RATIO_CAP, Math.trunc((own * 1000) / seen));
}

const at = (share: number, demand: number): number => Math.trunc((demand * share) / 1000);

function why(kind: string, value: number, view: CommanderView): BattleTerm {
  return { btermKind: kind, btermValue: value, btermSource: view.person };
}

export interface Decision<T> {
  readonly choice: T;
  readonly terms: readonly BattleTerm[];
}

/**
 * Dawn (P6.1): attack all-out, with a main effort, or probe; or defend. Only a side that may attack does: its blocks
 * marched in and press (0064), none is recovering from a rout, and it is not the side that holds still.
 */
export function commitAtDawn(rules: CombatRules, view: CommanderView, mayAttack: boolean, own: number, enemy: number): Decision<Commit> {
  const ratio = believedRatio(view, own, enemy);
  const terms = [why('believed_ratio', ratio, view), why('demand', view.demandPermille, view)];
  if (!mayAttack) return { choice: 'defend', terms: [...terms, why('may_not_attack', 0, view)] };
  if (ratio >= view.demandPermille) return { choice: view.boldness >= rules.decisions.allOutBoldness ? 'all_out' : 'main', terms: [...terms, why('boldness', view.boldness, view)] };
  if (ratio >= at(rules.decisions.probeShare, view.demandPermille)) return { choice: 'probe', terms: [...terms, why('probe_at', at(rules.decisions.probeShare, view.demandPermille), view)] };
  return { choice: 'defend', terms: [...terms, why('probe_at', at(rules.decisions.probeShare, view.demandPermille), view)] };
}

/** Night (P6.2): stay (to attack again or hold tomorrow, which dawn decides) or withdraw. A rout is not his to choose. */
export function standAtNight(rules: CombatRules, view: CommanderView, own: number, enemy: number): Decision<'stay' | 'withdraw'> {
  const ratio = believedRatio(view, own, enemy);
  const holdAt = at(rules.decisions.holdShare, view.demandPermille);
  return { choice: ratio < holdAt ? 'withdraw' : 'stay', terms: [why('night_believed_ratio', ratio, view), why('hold_at', holdAt, view)] };
}

/** With no legal retreat (P8): break out, a new battle-day at the assault rates, or surrender the force. */
export function cutOffChoice(rules: CombatRules, view: CommanderView, own: number, enemy: number): Decision<CutOffChoice> {
  const ratio = believedRatio(view, own, enemy);
  const breakAt = at(rules.decisions.breakoutShare, view.demandPermille);
  return { choice: ratio >= breakAt ? 'break_out' : 'surrender', terms: [why('cut_off_believed_ratio', ratio, view), why('breakout_at', breakAt, view)] };
}

/**
 * The morning after the other side withdrew or routed (P6.3): none, follow or press. He pursues only at or above his
 * demand, and how hard by his boldness, so effective pursuit is rare without anyone forcing it (Frey: 2 in about 20).
 * Lane 1.4 runs the pursuit phase; this is the choice it reads.
 */
export function pursuitChoice(rules: CombatRules, view: CommanderView, own: number, enemy: number): Decision<Pursuit> {
  const ratio = believedRatio(view, own, enemy);
  const terms = [why('pursue_believed_ratio', ratio, view), why('boldness', view.boldness, view)];
  if (ratio < view.demandPermille) return { choice: 'none', terms };
  if (view.boldness >= rules.decisions.pressBoldness) return { choice: 'press', terms };
  if (view.boldness >= rules.decisions.followBoldness) return { choice: 'follow', terms };
  return { choice: 'none', terms };
}
