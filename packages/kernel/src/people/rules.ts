/**
 * The people core's pack rules (lane 1.1; 0072: every kernel default is a pack rule, stated by every pack). DESIGN
 * PARAMETERS, never sourced facts: history's shadow, compliance's weights, how orders and reports are read, and the
 * trait rules that replaced lane 0.6's labelled stand-in (0058).
 *
 * The kernel never names a value (hard rule 3): which values a goal honours or offends, and which values make a filter
 * hold or trim and a man see the enemy larger, are stated here by the pack.
 */
import type { ComplianceRules } from '../compliance.ts';
import type { StatDirection } from '../world/people.ts';

/** How history's shadow draws a true stat at setup (FOUNDATION section 6; 0005, 0026). */
export interface ShadowRules {
  /** The permille centre of each cited direction. */
  readonly centrePermille: Readonly<Record<StatDirection, number>>;
  /** The centre of an unknown stat (no admissible evidence). */
  readonly unknownCentre: number;
  /** The half-width of the uniform draw around a cited centre, permille (0: as history). */
  readonly spread: number;
  /** The half-width around an unknown centre: wider, since nothing narrows it. */
  readonly unknownSpread: number;
  /** Signed permille regard for each cited direction of a person's regard for his principal; unknown is 0. */
  readonly regardPermille: Readonly<Record<StatDirection, number>>;
}

/** What a goal of each kind asks of the man who reads it: its boldness, and the values it honours or offends. */
export interface GoalTermsRule {
  /** A goal kind (`hold`, `advance`). */
  readonly goal: string;
  readonly boldness: number;
  readonly honours: readonly string[];
  readonly offends: readonly string[];
}

/**
 * The circumstances of an order read in the chain. Oversight and the principal's sanction credibility are pack values
 * until politics derives credibility from the principal's record (P7; lane 1.6 owns it).
 */
export interface ReadingContextRules {
  /** How closely the principal watches a man who relays or receives his order, permille. */
  readonly oversight: number;
  /** The principal's sanction credibility, permille (until lane 1.6 derives it). */
  readonly leaderCredibility: number;
}

/** How a relaying holder's rung becomes his relay (0040: each link applies his own compliance and delay). */
export interface RelayRules {
  /** Days he holds an order he relays with reservations. */
  readonly reservationsHoldDays: number;
  /** Days he holds an order he slow-walks. */
  readonly slowWalkHoldDays: number;
  /** Days he holds an order he reinterprets (a relay cannot rewrite it, so he sits on it longer). */
  readonly reinterpretHoldDays: number;
}

/** A filter post's holder (0032): the values that make him hold a wire, or cut claims from it. */
export interface FilterRules {
  /** A holder with this value holds a wire for its days (the longest that applies). */
  readonly holdFor: readonly { readonly value: string; readonly days: number }[];
  /** A holder with this value cuts these claim kinds, unless he is candid. */
  readonly trimFor: readonly { readonly value: string; readonly claimKinds: readonly string[] }[];
  /** Candour at or above which a holder cuts nothing. */
  readonly candidAt: number;
}

/** The trait rules lane 0.6 labelled a stand-in (0058), now the pack's: how a man's temperament and values shade what he sees and asks. */
export interface TraitRules {
  /** Boldness below this inflates a man's view of the enemy. */
  readonly perceptionPivot: number;
  /** Permille of perception bias added per point of boldness below the pivot. */
  readonly perceptionPerPoint: number;
  /** Permille added for each of these values a man holds (a cautious man sees more enemies). */
  readonly perceptionValues: readonly { readonly value: string; readonly permille: number }[];
  /** The ceiling on perception bias, permille (the information-flows note's 4x). */
  readonly perceptionMax: number;
  /** The force ratio a man of pivot boldness demands before he moves, permille. */
  readonly demandBase: number;
  /** Permille added to the demand per point of boldness below the pivot. */
  readonly demandPerPoint: number;
  /** Below this margin over his demand, holding is as consistent as advancing (permille). */
  readonly holdBand: number;
  /** The share of his strength a commander quotes as "effective" when he wants men, permille. */
  readonly wantsMenPermille: number;
  /** Present and absent against present for duty, permille (the paper army). */
  readonly paperPermille: number;
}

/** Grievances the people core applies (proposed by other mechanisms). */
export interface GrievanceRules {
  /** The weight of the grievance a bypassed relay holds (0040: going around the chain). */
  readonly bypassedWeight: number;
}

export interface PeopleRules {
  readonly shadow: ShadowRules;
  readonly compliance: ComplianceRules;
  readonly goalTerms: readonly GoalTermsRule[];
  readonly context: ReadingContextRules;
  readonly relay: RelayRules;
  readonly filter: FilterRules;
  readonly traits: TraitRules;
  readonly grievances: GrievanceRules;
}

const DIRECTIONS: readonly StatDirection[] = ['high', 'above', 'average', 'below', 'low'];
const COMPLIANCE_KEYS: readonly (keyof ComplianceRules)[] = [
  'valueWeight', 'temperamentWeight', 'regardWeight', 'deterrenceWeight', 'standingShield', 'shortfallWeight',
  'exceedAt', 'complyAt', 'reservationsAt', 'severeBelow', 'slowWalkAbove', 'candidAt', 'protectedStandingAt',
  'protectedDeterrenceAt', 'grievanceWeight', 'grievanceReasonAt', 'temperamentReasonAt', 'regardReasonAt',
  'fearReasonAt', 'departureWeight', 'departureReasonAt', 'reinforceShareTimid', 'reinforceShareBold',
  'conflictChainWeight', 'conflictNewerWeight',
];

/** Problems with a pack's people rules, as the validator and the kernel's setup see them (the kernel takes any World it is handed). */
export function peopleRulesProblems(rules: PeopleRules | undefined, values: readonly string[]): string[] {
  if (rules === undefined) return ['the pack states no people rules (rules.people)'];
  const problems: string[] = [];
  const permille = (v: unknown, what: string, signed = false) => {
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v > 1000 || v < (signed ? -1000 : 0)) problems.push(`people rule ${what} must be a whole ${signed ? 'signed ' : ''}permille`);
  };
  const whole = (v: unknown, what: string) => {
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0) problems.push(`people rule ${what} must be a whole number, at least 0`);
  };
  const known = new Set(values);
  const value = (v: string, what: string) => {
    if (!known.has(v)) problems.push(`people rule ${what} names value "${v}", which is not in the pack's values vocabulary`);
  };
  for (const d of DIRECTIONS) {
    permille(rules.shadow.centrePermille[d], `shadow.centrePermille.${d}`);
    permille(rules.shadow.regardPermille[d], `shadow.regardPermille.${d}`, true);
  }
  permille(rules.shadow.unknownCentre, 'shadow.unknownCentre');
  permille(rules.shadow.spread, 'shadow.spread');
  permille(rules.shadow.unknownSpread, 'shadow.unknownSpread');
  for (const k of COMPLIANCE_KEYS) if (typeof rules.compliance[k] !== 'number' || !Number.isSafeInteger(rules.compliance[k])) problems.push(`people rule compliance.${k} must be a whole number`);
  const goals = new Set<string>();
  for (const g of rules.goalTerms) {
    if (goals.has(g.goal)) problems.push(`people rule goalTerms names goal ${g.goal} twice`);
    goals.add(g.goal);
    permille(g.boldness, `goalTerms.${g.goal}.boldness`);
    for (const v of [...g.honours, ...g.offends]) value(v, `goalTerms.${g.goal}`);
  }
  permille(rules.context.oversight, 'context.oversight');
  permille(rules.context.leaderCredibility, 'context.leaderCredibility');
  whole(rules.relay.reservationsHoldDays, 'relay.reservationsHoldDays');
  whole(rules.relay.slowWalkHoldDays, 'relay.slowWalkHoldDays');
  whole(rules.relay.reinterpretHoldDays, 'relay.reinterpretHoldDays');
  for (const h of rules.filter.holdFor) {
    value(h.value, 'filter.holdFor');
    whole(h.days, `filter.holdFor.${h.value}.days`);
  }
  for (const t of rules.filter.trimFor) value(t.value, 'filter.trimFor');
  permille(rules.filter.candidAt, 'filter.candidAt');
  for (const p of rules.traits.perceptionValues) {
    value(p.value, 'traits.perceptionValues');
    whole(p.permille, `traits.perceptionValues.${p.value}`);
  }
  for (const k of ['perceptionPivot', 'perceptionPerPoint', 'perceptionMax', 'demandBase', 'demandPerPoint', 'holdBand', 'wantsMenPermille', 'paperPermille'] as const) whole(rules.traits[k], `traits.${k}`);
  whole(rules.grievances.bypassedWeight, 'grievances.bypassedWeight');
  return problems;
}
