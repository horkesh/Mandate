import { strictCompare } from './compare.ts';
import type {
  CommandContext,
  ComplianceRung,
  Contribution,
  CounterProposal,
  DirectiveResponse,
  DirectiveTerms,
  Reason,
  ResponseCondition,
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

  /** Weight of held grievances in willingness (permille of total grievance weight). */
  readonly grievanceWeight: Permille;
  /** A grievance at or above this weight is a reason the proxy can name. */
  readonly grievanceReasonAt: number;

  /** Reason thresholds. */
  readonly temperamentReasonAt: Permille;
  readonly regardReasonAt: Permille;
  readonly fearReasonAt: Permille;

  /** Maximum willingness lost to an edit that departs wholly from his judgement (lane 1.1). */
  readonly departureWeight: Permille;
  /** An edit departing at least this far is a reason he can name. */
  readonly departureReasonAt: Permille;
  /**
   * "Move when reinforced" (lane 0.9 finding 8): a shortfall becomes a condition only past a share of the task, which
   * runs from `reinforceShareTimid` (permille of `required`) for a man of boldness 0 to `reinforceShareBold` for one of
   * boldness 1000: a bold man moves a little short, a cautious one waits for nearly all of it.
   */
  readonly reinforceShareTimid: Permille;
  readonly reinforceShareBold: Permille;
  /** Conflicting orders (0040): the weight, on the willingness scale, of an order that came down his own chain. */
  readonly conflictChainWeight: number;
  /** Conflicting orders: the weight of being the newer of the two (0040: a newer order from his own department supersedes). */
  readonly conflictNewerWeight: number;
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

  grievanceWeight: 300,
  grievanceReasonAt: 100,

  temperamentReasonAt: 300,
  regardReasonAt: 300,
  fearReasonAt: 500,

  departureWeight: 500,
  departureReasonAt: 200,
  reinforceShareTimid: 10,
  reinforceShareBold: 50,
  conflictChainWeight: 200,
  conflictNewerWeight: 100,
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

  // Temperament: a cautious man ordered to attack, or a bold one ordered to wait. Read against his own best plan when
  // the directive is a plan (lane 0.9 finding 2), else against his temperament.
  const reference = terms.ownBest ?? proxy.boldness;
  const boldnessGap = Math.abs(terms.boldness - reference);
  const temperament = 0 - scale(boldnessGap, rules.temperamentWeight);
  if (boldnessGap >= rules.temperamentReasonAt) {
    reasons.push(
      terms.boldness > reference
        ? { kind: 'too_rash', gap: boldnessGap }
        : { kind: 'too_timid', gap: boldnessGap },
    );
  }

  // Judgement: an edit that departs from what he would have chosen (lane 1.1).
  const departure = terms.departure ?? 0;
  const judgement = 0 - scale(departure, rules.departureWeight);
  if (terms.departure !== undefined && departure >= rules.departureReasonAt) reasons.push({ kind: 'departs_from_judgement', departure });

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
  const capacity = 0 - scale(shortfall, rules.shortfallWeight);
  if (shortfall > 0) reasons.push({ kind: 'lacks_resources', shortfall });

  const disposition = context.disposition ?? 0;

  // Grievances: what he holds against the principal, each a nameable reason.
  let grievanceTotal = 0;
  const byKind = new Map<string, number>();
  for (const g of context.grievances ?? []) {
    grievanceTotal += g.weight;
    byKind.set(g.kind, (byKind.get(g.kind) ?? 0) + g.weight);
  }
  for (const kind of [...byKind.keys()].sort(strictCompare)) {
    const weight = byKind.get(kind)!;
    if (weight >= rules.grievanceReasonAt) reasons.push({ kind: 'holds_grievance', grievance: kind, weight });
  }
  const grievances = 0 - scale(grievanceTotal, rules.grievanceWeight);

  const contributions: Contribution[] = [
    { term: 'values', amount: values },
    { term: 'temperament', amount: temperament },
    { term: 'regard', amount: regard },
    { term: 'deterrence', amount: deterrence },
    { term: 'capacity', amount: capacity },
    { term: 'disposition', amount: disposition },
    { term: 'grievances', amount: grievances },
    // Only an edit has a judgement term; a plain directive's contributions are unchanged.
    ...(terms.departure === undefined ? [] : [{ term: 'judgement' as const, amount: judgement }]),
  ];
  const willingness = values + temperament + regard + deterrence + capacity + disposition + grievances + judgement;

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

  const statedReasons = isCandid ? reasons : statedByUncandid(reasons, declared);

  // Conditions on acting at all: none for a man who will not act, or who acts on his own terms.
  const conditions: ResponseCondition[] = [];
  if (actual !== 'refuse' && actual !== 'object') {
    // A shortfall past the share a man of his boldness tolerates: "move when reinforced" (lane 0.9 finding 8).
    const tolerated = rules.reinforceShareTimid + scale(proxy.boldness, Math.max(0, rules.reinforceShareBold - rules.reinforceShareTimid));
    if (shortfall > 0 && shortfall * 1000 > tolerated * terms.required) conditions.push({ kind: 'when_reinforced', shortfall });
    const promised = new Set(context.supportPromised ?? []);
    const needs = [...(terms.support ?? [])].sort((a, b) => strictCompare(a.supportKind, b.supportKind) || strictCompare(a.supportFrom ?? '', b.supportFrom ?? ''));
    for (const need of needs) if (!promised.has(need.supportKind)) conditions.push({ kind: 'if_supported', supportKind: need.supportKind, from: need.supportFrom });
  }

  return { actual, declared, willingness, contributions, reasons, statedReasons, counterProposal, conditions };
}

/** One of two orders a holder has in hand, as he reads it (0040: conflicting orders). */
export interface OrderInHand {
  /** The order's message id, for the report of which he obeyed. */
  readonly order: string;
  readonly terms: DirectiveTerms;
  /** Whether it came down his own chain of posts (true) or went around it. */
  readonly viaChain: boolean;
  /** The day it was issued: the newer of two orders weighs more (0040: a newer order from his own department supersedes). */
  readonly issuedDay: number;
  /** His regard for this order's issuer, when the two orders have different issuers; else the profile's regard. */
  readonly issuerRegard?: number;
}

/** A typed term of a conflict's resolution, for one order. */
export interface ConflictTerm {
  readonly order: 'held' | 'arriving';
  readonly term: 'willingness' | 'chain' | 'newer';
  readonly amount: number;
}

/** Which of two conflicting orders he obeys, and why (hard rule 6). */
export interface ConflictResolution {
  readonly obeyed: 'held' | 'arriving';
  /** Each order's score: his willingness to it, plus the chain and newer terms. */
  readonly scores: { readonly held: number; readonly arriving: number };
  readonly terms: readonly ConflictTerm[];
  /** His reading of each order, through his own compliance. */
  readonly held: DirectiveResponse;
  readonly arriving: DirectiveResponse;
}

/**
 * Conflicting orders (0040; lane 1.1): a holder with two orders resolves them by his own compliance and reports which he
 * obeyed. He reads each through `resolveDirective` in the same context; an order that came down his chain weighs
 * `conflictChainWeight` more, and the newer weighs `conflictNewerWeight` more. He obeys the higher score; on a tie, the
 * order he already holds stands (a man does not change course for an equal order). Pure and deterministic.
 */
export function resolveConflict(
  proxy: ProxyProfile,
  held: OrderInHand,
  arriving: OrderInHand,
  context: CommandContext,
  rules: ComplianceRules = DEFAULT_COMPLIANCE_RULES,
): ConflictResolution {
  const heldResponse = resolveDirective({ ...proxy, regard: held.issuerRegard ?? proxy.regard }, held.terms, context, rules);
  const arrivingResponse = resolveDirective({ ...proxy, regard: arriving.issuerRegard ?? proxy.regard }, arriving.terms, context, rules);
  const terms: ConflictTerm[] = [];
  const score = (which: 'held' | 'arriving', o: OrderInHand, r: DirectiveResponse, other: OrderInHand): number => {
    terms.push({ order: which, term: 'willingness', amount: r.willingness });
    let s = r.willingness;
    if (o.viaChain) {
      terms.push({ order: which, term: 'chain', amount: rules.conflictChainWeight });
      s += rules.conflictChainWeight;
    }
    if (o.issuedDay > other.issuedDay) {
      terms.push({ order: which, term: 'newer', amount: rules.conflictNewerWeight });
      s += rules.conflictNewerWeight;
    }
    return s;
  };
  const scores = { held: score('held', held, heldResponse, arriving), arriving: score('arriving', arriving, arrivingResponse, held) };
  return { obeyed: scores.arriving > scores.held ? 'arriving' : 'held', scores, terms, held: heldResponse, arriving: arrivingResponse };
}

/** Reasons nobody volunteers to their superior unless they are candid. */
const PRIVATE_REASONS: ReadonlySet<Reason['kind']> = new Set([
  'distrusts_leader',
  'fears_sanction',
  'shielded_by_standing',
  // An uncandid man nurses a grudge in silence; you counter what he tells you, not what he feels.
  'holds_grievance',
]);
const FLATTERING_REASONS: ReadonlySet<Reason['kind']> = new Set(['values_honoured', 'trusts_leader']);

/**
 * An uncandid proxy who declares compliance gives only flattering reasons.
 * Otherwise he keeps his private motives to himself.
 */
function statedByUncandid(reasons: readonly Reason[], declared: ComplianceRung): Reason[] {
  if (declared === 'comply' || declared === 'exceed') {
    return reasons.filter((r) => FLATTERING_REASONS.has(r.kind));
  }
  return reasons.filter((r) => !PRIVATE_REASONS.has(r.kind));
}

function validate(proxy: ProxyProfile, terms: DirectiveTerms, context: CommandContext): void {
  assertPermille(proxy.boldness, 'proxy.boldness');
  assertPermille(proxy.candour, 'proxy.candour');
  assertPermille(proxy.standing, 'proxy.standing');
  assertSignedPermille(proxy.regard, 'proxy.regard');
  assertPermille(terms.boldness, 'terms.boldness');
  assertPermille(terms.required, 'terms.required');
  if (terms.ownBest !== undefined) assertPermille(terms.ownBest, 'terms.ownBest');
  if (terms.departure !== undefined) assertPermille(terms.departure, 'terms.departure');
  assertPermille(context.available, 'context.available');
  assertPermille(context.oversight, 'context.oversight');
  assertPermille(context.leaderCredibility, 'context.leaderCredibility');
  if (context.disposition !== undefined && !Number.isSafeInteger(context.disposition)) {
    throw new RangeError(`context.disposition must be an integer, got ${context.disposition}`);
  }
}
