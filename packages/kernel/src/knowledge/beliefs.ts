/**
 * Beliefs, derived on read from a seat's knowledge (FOUNDATION section 8).
 * Never stored, so they cannot drift from the reports behind them.
 *
 * A man's estimate of the enemy in a region is the latest enemy-strength claim
 * he holds for it, times his own perception bias. The bias lives here, in
 * belief derivation, and nowhere else (planner-design finding 3): his
 * dispatches are written from this belief and his plans read it, so both
 * inflate the enemy by the same amount. The intelligence source's bias is a
 * separate term, carried from the report's truth (finding 6), so the reckoning
 * and the assessment can tell a timid general from a bad intelligence chief.
 */
import { strictCompare } from '../compare.ts';
import type { MessageId, PersonId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { perceptionBias, type TraitHolder, type TraitRules } from '../standin/traits.ts';
import type { KnownReport, SeatKnowledge } from './knowledge.ts';
import { term, type BiasTerm } from './truth.ts';

export interface EnemyBelief {
  /** Men he believes are there. */
  readonly value: number;
  /** The stamp day of the report it rests on. */
  readonly asOfDay: number;
  readonly source: MessageId;
  /**
   * Every term behind the value, outermost last: the source report's own
   * terms (observation, intelligence bias, an earlier reader's perception),
   * the claim as reported, then this man's perception bias.
   */
  readonly terms: readonly BiasTerm[];
}

/** The latest enemy-strength claim per region in a body of knowledge, by stamp then arrival then id. */
export function latestEnemyClaims(knowledge: SeatKnowledge): ReadonlyMap<RegionId, { readonly report: KnownReport; readonly value: number }> {
  const out = new Map<RegionId, { report: KnownReport; value: number }>();
  for (const r of knowledge.knownReports) {
    for (const c of r.knownBody.reportClaims) {
      if (c.claimKind !== 'enemy-strength' || c.claimRegion === null) continue;
      const prev = out.get(c.claimRegion);
      if (prev === undefined || newer(r, prev.report)) out.set(c.claimRegion, { report: r, value: c.claimValue });
    }
  }
  return out;
}

function newer(a: KnownReport, b: KnownReport): boolean {
  if (a.knownBody.reportDay !== b.knownBody.reportDay) return a.knownBody.reportDay > b.knownBody.reportDay;
  if (a.knownReceivedDay !== b.knownReceivedDay) return a.knownReceivedDay > b.knownReceivedDay;
  return strictCompare(a.id, b.id) > 0;
}

/** Apply a reader's perception to a reported value: the one formula both the view and the truth side use. */
export function perceived(value: number, perceptionPermille: number): number {
  return Math.trunc((value * perceptionPermille) / 1000);
}

/**
 * What `person` believes of the enemy, region by region, with every term.
 * `knowledge` is his seat's; `state` supplies the truth of the reports behind it.
 */
export function enemyBeliefs(state: State, rules: TraitRules, person: TraitHolder & { readonly id: PersonId }, knowledge: SeatKnowledge): ReadonlyMap<RegionId, EnemyBelief> {
  const bias = perceptionBias(rules, person);
  const out = new Map<RegionId, EnemyBelief>();
  for (const [region, { report, value }] of [...latestEnemyClaims(knowledge)].sort(([a], [b]) => strictCompare(a, b))) {
    const below = state.reportTruth[report.id]?.truthTerms.filter((t) => t.termRegion === null || t.termRegion === region) ?? [];
    out.set(region, {
      value: perceived(value, bias.permille),
      asOfDay: report.knownBody.reportDay,
      source: report.id,
      terms: [...below, term('reported', value, { person: report.knownBody.reportAuthor, region }), ...bias.terms],
    });
  }
  return out;
}
