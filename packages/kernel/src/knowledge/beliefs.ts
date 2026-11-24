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
import type { EdgeId, MessageId, PersonId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { TraitRules } from '../people/rules.ts';
import { perceptionBias, type PerceivingPerson } from '../people/traits.ts';
import type { KnownReport, SeatKnowledge } from './knowledge.ts';
import type { ClaimKind, ReportClaim, ReportBody } from './report.ts';
import { term, truthOf, type BiasTerm } from './truth.ts';
import { biasStrength, claimEstimate, completeUpper, type StrengthEstimate } from './strength.ts';

export interface EnemyBelief {
  /** Men he believes are there. */
  readonly value: number | null;
  readonly strength?: StrengthEstimate;
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

/** The latest claim of `kind` per key in a body of knowledge, by stamp then arrival then id. Claims with no key are skipped. */
function latestClaims<K extends string>(knowledge: SeatKnowledge, kind: ClaimKind, keyOf: (c: ReportClaim) => K | null): Map<K, { report: KnownReport; claim: ReportClaim }> {
  const out = new Map<K, { report: KnownReport; claim: ReportClaim }>();
  for (const r of knowledge.knownReports) {
    for (const c of r.knownBody.reportClaims) {
      if (c.claimKind !== kind) continue;
      const key = keyOf(c);
      if (key === null) continue;
      const prev = out.get(key);
      if (prev === undefined || newer(r, prev.report)) out.set(key, { report: r, claim: c });
    }
  }
  return out;
}

/** The latest enemy-strength claim per region in a body of knowledge, by stamp then arrival then id. */
export function latestEnemyClaims(knowledge: SeatKnowledge, freshness?: {readonly day:number;readonly maxAge:(body:ReportBody)=>number}): ReadonlyMap<RegionId, { readonly report: KnownReport; readonly value: number | null; readonly strength?: StrengthEstimate }> {
  const scopes = new Map<RegionId, Map<string, { report: KnownReport; claim: ReportClaim }>>();
  const stamp=(r:KnownReport,c:ReportClaim)=>c.claimStrength?.strengthDay??r.knownBody.reportDay;
  const later=(a:{report:KnownReport;claim:ReportClaim},b:{report:KnownReport;claim:ReportClaim})=>stamp(a.report,a.claim)!==stamp(b.report,b.claim)?stamp(a.report,a.claim)>stamp(b.report,b.claim):newer(a.report,b.report);
  for (const report of knowledge.knownReports) for (const claim of report.knownBody.reportClaims) {
    if (claim.claimRegion === null || claim.claimConfidence <= 0 || !['enemy-strength','enemy-estimate-unknown'].includes(claim.claimKind)) continue;
    const region = claim.claimRegion, scope = claim.claimStrength?.strengthScope ?? 'region';
    const rows = scopes.get(region) ?? new Map(); const old = rows.get(scope);
    if (old === undefined || later({report,claim},old) || report.id === old.report.id && claim.claimKind === 'enemy-estimate-unknown') rows.set(scope,{report,claim});
    scopes.set(region,rows);
  }
  const out = new Map<RegionId, { report: KnownReport; value: number | null; strength?: StrengthEstimate }>();
  for (const [region,rows] of scopes) {
    const ordered = [...rows.values()].sort((a,b) => later(a,b) ? -1 : later(b,a) ? 1 : strictCompare(a.claim.claimStrength?.strengthScope ?? 'region',b.claim.claimStrength?.strengthScope ?? 'region'));
    const first = ordered[0]!;
    // A total and its constituents overlap. They are alternatives, never reinforcement.
    const chosen = (first.claim.claimStrength?.strengthScope ?? 'region') === 'region' ? [first] : ordered.filter(r => (r.claim.claimStrength?.strengthScope ?? 'region') !== 'region');
    const stale=(r:{report:KnownReport;claim:ReportClaim})=>freshness!==undefined && freshness.day-stamp(r.report,r.claim)>freshness.maxAge(r.report.knownBody);
    if (chosen.length === 1 && first.claim.claimKind === 'enemy-strength' && first.claim.claimStrength === undefined && !stale(first)) { out.set(region,{report:first.report,value:first.claim.claimValue}); continue; }
    const estimates = chosen.map(r => {const s=claimEstimate(r.claim,r.report.knownBody.reportDay,r.report.knownBody.reportAuthor);return stale(r)?{...s,strengthUnknown:true,strengthCoverage:'partial' as const,strengthConditions:s.strengthConditions+'; stale received account'}:s;});
    const seen = new Set<string>(); const unique = estimates.filter(s => {const ids=s.strengthComponents.map(c=>c.componentId);if(ids.some(id=>seen.has(id)))return false;for(const id of ids)seen.add(id);return true;});
    const s = estimates[0]!;
    const scoped=(first.claim.claimStrength?.strengthScope??'region')!=='region';
    const strength: StrengthEstimate = unique.length === 1 ? (scoped?{...s,strengthUnknown:true,strengthCoverage:'partial'}:s) : { ...s,
      strengthScope: 'region', strengthPresence: unique.some(s=>s.strengthPresence), strengthUnknown: true,
      strengthCoverage: 'partial',strengthAccounts:unique,
      strengthReaders:s.strengthReaders.filter(p=>unique.every(a=>a.strengthReaders.includes(p))),
      strengthLower: unique.some(s=>s.strengthLower!==null) ? unique.reduce((n,s)=>n+(s.strengthLower??0),0) : null,
      strengthUpper: unique.some(s=>s.strengthUpper!==null) ? unique.reduce((n,s)=>n+(s.strengthUpper??0),0) : null,
      strengthComponents: unique.flatMap(s=>s.strengthComponents), strengthCounts: unique.flatMap(s=>s.strengthCounts) };
    out.set(region,{report:first.report,value:completeUpper(strength),strength});
  }
  return out;
}

/**
 * The latest works claim per region (lane 1.2): the fortification he has been told stands there, permille. No
 * perception bias: what he misjudges is the enemy's numbers, not the height of a parapet he has had described.
 */
export function latestWorksClaims(knowledge: SeatKnowledge): ReadonlyMap<RegionId, { readonly report: KnownReport; readonly value: number }> {
  const out = new Map<RegionId, { report: KnownReport; value: number }>();
  for (const [region, { report, claim }] of latestClaims(knowledge, 'works', (c) => c.claimRegion)) out.set(region, { report, value: claim.claimValue });
  return out;
}

/**
 * The latest obstruction claim per water edge (lane 1.2): whether he has been told it is closed to his side (1) or
 * clear (0), and the region of the installation whose works close it (null: works no installation holds).
 */
export function latestObstructionClaims(knowledge: SeatKnowledge): ReadonlyMap<EdgeId, { readonly report: KnownReport; readonly closed: boolean; readonly by: RegionId | null }> {
  const out = new Map<EdgeId, { report: KnownReport; closed: boolean; by: RegionId | null }>();
  for (const [edge, { report, claim }] of latestClaims(knowledge, 'obstruction', (c) => (c.claimToken === null ? null : (c.claimToken as EdgeId)))) {
    out.set(edge, { report, closed: claim.claimValue !== 0, by: claim.claimRegion });
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
export function enemyBeliefs(state: State, rules: TraitRules, person: PerceivingPerson, knowledge: SeatKnowledge, maxAge?: (body:ReportBody)=>number): ReadonlyMap<RegionId, EnemyBelief> {
  const bias = perceptionBias(rules, person);
  const out = new Map<RegionId, EnemyBelief>();
  for (const [region, { report, value, strength }] of [...latestEnemyClaims(knowledge,maxAge===undefined?undefined:{day:state.stateDay,maxAge})].sort(([a], [b]) => strictCompare(a, b))) {
    const below = truthOf(state, report.id)?.truthTerms.filter((t) => t.termRegion === null || t.termRegion === region) ?? [];
    out.set(region, {
      value: strength === undefined ? (value === null ? null : perceived(value,bias.permille)) : completeUpper(biasStrength(strength,bias.permille,person.id)),
      ...(strength === undefined ? {} : {strength:biasStrength(strength,bias.permille,person.id)}),
      asOfDay: strength?.strengthDay ?? report.knownBody.reportDay,
      source: report.id,
      terms: [...below, ...(value === null ? [] : [term('reported', value, { person: report.knownBody.reportAuthor, region })]), ...(strength?.strengthReaders.includes(person.id) ? [] : bias.terms)],
    });
  }
  return out;
}
