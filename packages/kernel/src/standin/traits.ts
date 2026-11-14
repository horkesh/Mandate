/**
 * STAND-IN people rules for lane 0.6, until the Phase 1 recast of the people
 * core (`compliance`, `reading`) for goals, plans and edits.
 *
 * Each rule is a deterministic function of a person's traits (decision 0007:
 * no dice for people) and returns its typed terms (hard rule 6). The values
 * are pack-tunable (`TraitRules`). They exist so that relay, filtering and
 * belief have causes now; Phase 1 replaces each with the real machinery and
 * keeps the call sites.
 */
import type { PersonId, PostId } from '../ids.ts';
import type { StatedReason } from '../knowledge/report.ts';
import { term, type BiasTerm } from '../knowledge/truth.ts';

export interface TraitRules {
  /** Boldness below this inflates a man's view of the enemy. */
  readonly perceptionPivot: number;
  /** Permille of perception bias added per point of boldness below the pivot. */
  readonly perceptionPerPoint: number;
  /** Permille added for a man who holds the value `caution`. */
  readonly perceptionCaution: number;
  /** The ceiling on perception bias, permille (the information-flows note's 4x). */
  readonly perceptionMax: number;
  /** The force ratio a man of pivot boldness demands before he moves, permille. */
  readonly demandBase: number;
  /** Permille added to the demand per point of boldness below the pivot. */
  readonly demandPerPoint: number;
  /** Below this margin over his demand, holding is as consistent as advancing (permille). */
  readonly holdBand: number;
  /** A relaying man with negative regard holds an order one day per this many points of it. */
  readonly relayHoldPerRegard: number;
  /** A relaying man this timid or less, who values caution, objects to an advance. */
  readonly relayObjectBoldness: number;
  /** Days a filter holder who values order holds a wire for his chief. */
  readonly filterHoldDays: number;
  /** The share of his strength a commander quotes as "effective" when he wants men, permille. */
  readonly wantsMenPermille: number;
  /** Present and absent against present for duty, permille (the paper army). */
  readonly paperPermille: number;
}

export const DEFAULT_TRAIT_RULES: TraitRules = Object.freeze({
  perceptionPivot: 500,
  perceptionPerPoint: 3,
  perceptionCaution: 500,
  perceptionMax: 4000,
  demandBase: 1000,
  demandPerPoint: 2,
  holdBand: 1500,
  relayHoldPerRegard: 250,
  relayObjectBoldness: 250,
  filterHoldDays: 1,
  wantsMenPermille: 800,
  paperPermille: 1400,
});

export interface TraitHolder {
  readonly id: PersonId;
  readonly boldness: number;
  readonly regard: number;
  readonly values: readonly string[];
}

/**
 * How much larger a man sees the enemy than his sources report, permille
 * (1000: as reported). Belief derivation applies it, so his dispatches and his
 * plans inflate the enemy by the same amount (planner-design finding 3).
 */
export function perceptionBias(rules: TraitRules, p: TraitHolder): { readonly permille: number; readonly terms: readonly BiasTerm[] } {
  const below = Math.max(0, rules.perceptionPivot - p.boldness);
  const caution = p.values.includes('caution') ? rules.perceptionCaution : 0;
  const permille = Math.min(rules.perceptionMax, 1000 + below * rules.perceptionPerPoint + caution);
  const terms = [term('perception_bias', permille, { person: p.id, rule: caution > 0 ? 'boldness+caution' : 'boldness' })];
  return { permille, terms };
}

/** The force ratio, permille, a man needs over the enemy he perceives before he will advance. */
export function demandRatio(rules: TraitRules, p: TraitHolder): number {
  return rules.demandBase + Math.max(0, rules.perceptionPivot - p.boldness) * rules.demandPerPoint;
}

export interface RelayDecision {
  readonly action: 'forward' | 'object';
  /** Days he holds the order before sending it on (0: at once). */
  readonly holdDays: number;
  /** His true reasons. */
  readonly terms: readonly BiasTerm[];
  /** What he says, if he objects. */
  readonly stated: readonly StatedReason[];
}

/**
 * A relaying holder's answer to an order passing through him (0040: each link
 * applies its own compliance and delay). Stand-in for the recast compliance.
 */
export function relayDecision(rules: TraitRules, relayer: TraitHolder, post: PostId, order: { readonly advance: boolean }): RelayDecision {
  const terms: BiasTerm[] = [];
  let holdDays = 0;
  if (relayer.regard < 0) {
    holdDays = Math.ceil(-relayer.regard / rules.relayHoldPerRegard);
    terms.push(term('relay_hold', holdDays, { person: relayer.id, post, rule: 'regard' }));
  }
  if (order.advance && relayer.values.includes('caution') && relayer.boldness <= rules.relayObjectBoldness) {
    terms.push(term('relay_objection', relayer.boldness, { person: relayer.id, post, rule: 'caution' }));
    return { action: 'object', holdDays, terms, stated: [{ reasonKind: 'too_rash', reasonWeight: 1000 - relayer.boldness }] };
  }
  return { action: 'forward', holdDays, terms, stated: [] };
}

export interface FilterDecision {
  readonly holdDays: number;
  /** Claim kinds the holder cuts before the report goes on. */
  readonly trims: readonly string[];
  readonly terms: readonly BiasTerm[];
}

/** A filter post's holder deciding what to do with a wire bound for the principal (0032). */
export function filterDecision(rules: TraitRules, holder: TraitHolder, post: PostId): FilterDecision {
  const terms: BiasTerm[] = [];
  const holdDays = holder.values.includes('order') ? rules.filterHoldDays : 0;
  if (holdDays > 0) terms.push(term('filter_hold', holdDays, { person: holder.id, post, rule: 'values:order' }));
  const trims = holder.values.includes('reputation') ? ['own-losses'] : [];
  return { holdDays, trims, terms };
}
