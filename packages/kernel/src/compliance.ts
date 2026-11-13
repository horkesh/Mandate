import { strictCompare } from './compare.ts';
import type {
  CommandContext,
  ComplianceRung,
  Contribution,
  CounterProposal,
  DirectiveResponse,
  DirectiveTerms,
  Reason,
} from './directive.ts';
import type { ProxyProfile } from './people.ts';
import {
  assertPermille,
  assertSignedPermille,
  PERMILLE_MAX,
  scale,
  type Permille,
} from './permille.ts';

/**
 * Tunables for directive resolution. An immutable record so tests and
 * calibration can pass variants (`{ ...DEFAULT_COMPLIANCE_RULES, x: y }`).
 * Weights are permille; thresholds are on the willingness scale.
 */
export interface ComplianceRules {
  /** Willingness gained or lost per held value the directive honours or offends. */
  readonly valueWeight: number;
  /** Maximum willingness lost to a total temperament mismatch. */
  readonly temperamentWeight: Permille;
  /** Weight of regard (±1000) in willingness. */
  readonly regardWeight: Permille;
  /** Maximum willingness gained from deterrence (the expected cost of shirking). */
  readonly deterrenceWeight: Permille;
  /** How much of the leader's credibility a maximal standing cancels. */
  readonly standingShield: Permille;
  /** Willingness lost per point of resource shortfall. */
  readonly shortfallWeight: Permille;

  readonly exceedAt: number;
  readonly complyAt: number;
  readonly reservationsAt: number;
  /** Below this, unwillingness is severe enough to refuse outright, if the proxy is protected. */
  readonly severeBelow: number;
  /** Covert shirkers slow-walk above this and reinterpret below it. */
  readonly slowWalkAbove: number;

  /** Candour at or above which an unwilling proxy objects openly instead of shirking covertly. */
  readonly candidAt: Permille;
  /** Standing at or above which a proxy feels protected enough to refuse. */
  readonly protectedStandingAt: Permille;
  /** Deterrence at or below which a proxy feels protected enough to refuse. */
  readonly protectedDeterrenceAt: Permille;

  /** Reason thresholds. */
  readonly temperamentReasonAt: Permille;
  readonly regardReasonAt: Permille;
  readonly fearReasonAt: Permille;
}

export const DEFAULT_COMPLIANCE_RULES: ComplianceRules = Object.freeze({
  valueWeight: 200,
  temperamentWeight: 400,
  regardWeight: 300,
  deterrenceWeight: 250,
  standingShield: 600,
  shortfallWeight: 500,

  exceedAt: 450,
  complyAt: 150,
  reservationsAt: 0,
  severeBelow: -450,
  slowWalkAbove: -200,

  candidAt: 500,
  protectedStandingAt: 600,
  protectedDeterrenceAt: 200,

  temperamentReasonAt: 300,
  regardReasonAt: 300,
  fearReasonAt: 500,
});

const COVERT: ReadonlySet<ComplianceRung> = new Set(['slow_walk', 'reinterpret']);

/**
 * How a proxy reads a directive (P2), and what it tells the leader (P4).
 *
 * Willingness is the sum of five explainable terms:
 *  - values:      the directive honours or offends values the proxy holds
 *  - temperament: the gap between the directive's boldness and the proxy's
 *  - regard:      what the proxy thinks of the leader
 *  - deterrence:  oversight x the leader's credibility, discounted by the proxy's standing (Feaver)
 *  - capacity:    shortfall between what the task needs and what the post holds
 *
 * Unwillingness does not have one face. A candid proxy objects openly with a
 * counter-proposal. A protected proxy (high standing, or nobody watching)
 * refuses outright when the gap is severe. Everyone else shirks covertly
 * (slow-walks or reinterprets) and, unless candid, declares compliance.
 *
 * Pure and deterministic: no randomness, integer math only.
 */
export function resolveDirective(
  proxy: ProxyProfile,
  terms: DirectiveTerms,
  context: CommandContext,
  rules: ComplianceRules = DEFAULT_COMPLIANCE_RULES,
): DirectiveResponse {
  validate(proxy, terms, context);

  const reasons: Reason[] = [];
  const held = new Set(proxy.values);

  // Values honoured or offended, in strict order for stable reason lists.
  let values = 0;
  for (const value of [...new Set(terms.honours)].sort(strictCompare)) {
    if (held.has(value)) {
      values += rules.valueWeight;
      reasons.push({ kind: 'values_honoured', value });
    }
  }
  for (const value of [...new Set(terms.offends)].sort(strictCompare)) {
    if (held.has(value)) {
      values -= rules.valueWeight;
      reasons.push({ kind: 'values_offended', value });
    }
  }

  // Temperament: a cautious man ordered to attack, or a bold one ordered to wait.
  const boldnessGap = Math.abs(terms.boldness - proxy.boldness);
  const temperament = -scale(boldnessGap, rules.temperamentWeight);
  if (boldnessGap >= rules.temperamentReasonAt) {
    reasons.push(
      terms.boldness > proxy.boldness
        ? { kind: 'too_rash', gap: boldnessGap }
        : { kind: 'too_timid', gap: boldnessGap },
    );
  }

  // Regard for the leader.
  const regard = scale(proxy.regard, rules.regardWeight);
  if (proxy.regard >= rules.regardReasonAt) reasons.push({ kind: 'trusts_leader' });
  if (proxy.regard <= -rules.regardReasonAt) reasons.push({ kind: 'distrusts_leader' });

  // Deterrence: the expected cost of shirking, discounted by the proxy's own standing.
  const shield = scale(proxy.standing, rules.standingShield);
  const effectiveCredibility = scale(context.leaderCredibility, PERMILLE_MAX - shield);
  const deterrenceLevel = scale(context.oversight, effectiveCredibility);
  const deterrence = scale(deterrenceLevel, rules.deterrenceWeight);
  if (deterrenceLevel >= rules.fearReasonAt) reasons.push({ kind: 'fears_sanction' });
  if (proxy.standing >= rules.protectedStandingAt) reasons.push({ kind: 'shielded_by_standing' });

  // Capacity: what the task needs against what the post holds.
  const shortfall = Math.max(0, terms.required - context.available);
  const capacity = -scale(shortfall, rules.shortfallWeight);
  if (shortfall > 0) reasons.push({ kind: 'lacks_resources', shortfall });

  const contributions: Contribution[] = [
    { term: 'values', amount: values },
    { term: 'temperament', amount: temperament },
    { term: 'regard', amount: regard },
    { term: 'deterrence', amount: deterrence },
    { term: 'capacity', amount: capacity },
  ];
  const willingness = values + temperament + regard + deterrence + capacity;

  const honoursAHeldValue = reasons.some((r) => r.kind === 'values_honoured');
  const isProtected =
    proxy.standing >= rules.protectedStandingAt || deterrenceLevel <= rules.protectedDeterrenceAt;
  const isCandid = proxy.candour >= rules.candidAt;

  let actual: ComplianceRung;
  if (willingness >= rules.exceedAt && shortfall === 0 && honoursAHeldValue) actual = 'exceed';
  else if (willingness >= rules.complyAt) actual = 'comply';
  else if (willingness >= rules.reservationsAt) actual = 'comply_with_reservations';
  else if (willingness < rules.severeBelow && isProtected) actual = 'refuse';
  else if (isCandid) actual = 'object';
  else if (willingness > rules.slowWalkAbove) actual = 'slow_walk';
  else actual = 'reinterpret';

  // An uncandid proxy covers covert shirking, and his own doubts, with a plain "yes".
  let declared: ComplianceRung = actual;
  if (!isCandid && (COVERT.has(actual) || actual === 'comply_with_reservations')) declared = 'comply';

  const counterProposal: CounterProposal | null =
    actual === 'object'
      ? { boldness: proxy.boldness, required: Math.min(terms.required, context.available) }
      : null;

  return { actual, declared, willingness, contributions, reasons, counterProposal };
}

function validate(proxy: ProxyProfile, terms: DirectiveTerms, context: CommandContext): void {
  assertPermille(proxy.boldness, 'proxy.boldness');
  assertPermille(proxy.candour, 'proxy.candour');
  assertPermille(proxy.standing, 'proxy.standing');
  assertSignedPermille(proxy.regard, 'proxy.regard');
  assertPermille(terms.boldness, 'terms.boldness');
  assertPermille(terms.required, 'terms.required');
  assertPermille(context.available, 'context.available');
  assertPermille(context.oversight, 'context.oversight');
  assertPermille(context.leaderCredibility, 'context.leaderCredibility');
}
