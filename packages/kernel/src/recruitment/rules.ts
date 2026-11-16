/**
 * The pack's rules for men and regions (lane 1.7; 0072: every kernel default is a pack rule, stated by every pack).
 * The kernel names no side and no value: which values a call honours or offends (0074's `state_autonomy`, say), and
 * whose lines people reach, are pack data.
 */
import { COMPLIANCE_RUNGS, type ComplianceRung, type DirectiveTerms } from '../directive.ts';
import type { FactionId, RegionId } from '../ids.ts';

/** A rung that raises men, and how: permille of the quota, and days added to the muster. */
export interface RaisingRung {
  readonly rung: ComplianceRung;
  readonly sharePermille: number;
  readonly delayDays: number;
}

export interface RecruitmentRules {
  /** How a governor reads a call: its boldness and the values it honours and offends (pack data). */
  readonly callTerms: { readonly boldness: number; readonly honours: readonly string[]; readonly offends: readonly string[] };
  /** The post kinds whose holders answer a call (a governor's). A post of a self-governing department never does (SENSITIVE-HISTORY 3.7). */
  readonly raisingPostKinds: readonly string[];
  /** Men in a regiment. */
  readonly menPerRegiment: number;
  /** The arm new blocks are (the pack's vocabulary). */
  readonly arm: string;
  /** Days of stores a new block is issued at muster. */
  readonly storesDays: number;
  /** Days from a call's arrival to muster for a governor who complies at once. */
  readonly musterDays: number;
  /** The rungs that raise men; a rung not listed (an objection, a refusal) raises none and sends a memorandum back. */
  readonly rungs: readonly RaisingRung[];
  /** The loyalty to his side, permille, at which a governor's region gives its full share. */
  readonly loyaltyFull: number;
  /** How far loyalty below that scales the share down, permille (0: loyalty is not read). */
  readonly loyaltyWeight: number;
  /** The longest enlistment a call may name, in days. */
  readonly maxTermDays: number;
  /** Days a levy due to muster waits while its region is enemy-held; past them it lapses, reported to the caller (the lead's ruling). */
  readonly musterBlockedDays: number;
}

/** A pack's situation flag and what it adds, for the self-emancipation term. */
export interface FlagTerm {
  readonly flag: string;
  readonly permille: number;
}

/**
 * The derived self-emancipation term (0046; SENSITIVE-HISTORY 3.2): two kinds of cause, so that it is the people's
 * agency and not a side's output. Rates are per million of a region's census, per cadence.
 */
export interface SelfEmancipationRules {
  /** The faction whose lines people reach (pack data); null: the pack has no such term. */
  readonly linesFaction: FactionId | null;
  /**
   * The reason type each cause carries: one of the pack's gate register agency types (SENSITIVE-HISTORY E3). Cause 1 by the
   * region's government: within the enslaving side's own regions, or elsewhere (a neutral government's, or the lines'
   * side's own, where slavery may still be lawful: G-1.7a). Cause 2's. Pressure's are each flag's own (`pressureFlags`).
   */
  readonly agencyReasons: { readonly resistanceWithin: string; readonly resistanceElsewhere: string; readonly flightToLines: string };
  /**
   * Where the lines' side's known policy protects people who reach its lines (the lead's ruling on G-1.7a): while a flag is
   * set, the term skips its regions. Holding a region protects no one by itself: elsewhere the term runs, and known policy,
   * a policy of return included, scales it. Flags are set by the pack's decisions (R7, S17).
   */
  readonly protectedFlags: readonly { readonly flag: string; readonly regions: readonly RegionId[] }[];
  /** The term is recomputed every this many days. */
  readonly cadenceDays: number;
  /** Cause (1), resistance and flight within the side that holds the census region, not keyed to anyone's reach: per million per cadence. */
  readonly resistancePerMillion: number;
  /** What the pack's situation flags add to both causes, permille of each (pressure within the side, such as impressment), each with its own agency type (N9). */
  readonly pressureFlags: readonly (FlagTerm & { readonly agency: string })[];
  /** Cause (2), flight to the lines, per million per cadence at full reach and full policy. */
  readonly flightPerMillion: number;
  /** Reach, permille, when the lines' side holds the region or a neighbour with its force there. */
  readonly reachWithForce: number;
  /** Reach, permille, when it holds one with no force there. */
  readonly reachLinesOnly: number;
  /** The control share, permille, at which the lines' side holds a region. */
  readonly holdShare: number;
  /** Known policy, permille: the pack's base. */
  readonly policyBase: number;
  /** What the pack's situation flags add to policy, signed permille (a policy of return lowers it, 0046's S17). */
  readonly policyFlags: readonly FlagTerm[];
}

const whole = (problems: string[], name: string, v: number, min: number, max: number | null = null) => {
  if (!Number.isSafeInteger(v) || v < min || (max !== null && v > max)) problems.push(`${name} must be a whole number${max === null ? `, at least ${min}` : ` from ${min} to ${max}`}`);
};

/** Problems with the recruitment rules, as the validator checks them. */
export function recruitmentRuleProblems(r: RecruitmentRules): string[] {
  const problems: string[] = [];
  whole(problems, 'recruitment rule callTerms.boldness', r.callTerms.boldness, 0, 1000);
  for (const k of ['menPerRegiment', 'maxTermDays'] as const) whole(problems, `recruitment rule ${k}`, r[k], 1);
  for (const k of ['storesDays', 'musterDays', 'musterBlockedDays'] as const) whole(problems, `recruitment rule ${k}`, r[k], 0);
  for (const k of ['loyaltyFull', 'loyaltyWeight'] as const) whole(problems, `recruitment rule ${k}`, r[k], 0, 1000);
  if (r.loyaltyWeight > 0 && r.loyaltyFull === 0) problems.push('recruitment rule loyaltyFull must be above 0 when loyalty is read');
  const seen = new Set<string>();
  for (const g of r.rungs) {
    if (!(COMPLIANCE_RUNGS as readonly string[]).includes(g.rung)) problems.push(`recruitment rule rungs: ${g.rung} is not a compliance rung`);
    if (seen.has(g.rung)) problems.push(`recruitment rule rungs: ${g.rung} is listed twice`);
    seen.add(g.rung);
    whole(problems, `recruitment rule rungs.${g.rung}.sharePermille`, g.sharePermille, 0);
    whole(problems, `recruitment rule rungs.${g.rung}.delayDays`, g.delayDays, 0);
  }
  return problems;
}

/** Problems with the self-emancipation rules, as the validator checks them. */
export function selfEmancipationRuleProblems(r: SelfEmancipationRules): string[] {
  const problems: string[] = [];
  whole(problems, 'selfEmancipation rule cadenceDays', r.cadenceDays, 1);
  for (const k of ['resistancePerMillion', 'flightPerMillion'] as const) whole(problems, `selfEmancipation rule ${k}`, r[k], 0, 1000000);
  for (const k of ['reachWithForce', 'reachLinesOnly', 'holdShare', 'policyBase'] as const) whole(problems, `selfEmancipation rule ${k}`, r[k], 0, 1000);
  for (const f of r.pressureFlags) whole(problems, `selfEmancipation rule pressureFlags.${f.flag}`, f.permille, 0);
  for (const f of r.policyFlags) whole(problems, `selfEmancipation rule policyFlags.${f.flag}`, f.permille, -1000, 1000);
  return problems;
}

/** How a governor reads a call: the pack's terms, as compliance takes them. */
export function callTerms(rules: RecruitmentRules): DirectiveTerms {
  return { boldness: rules.callTerms.boldness, honours: rules.callTerms.honours as DirectiveTerms['honours'], offends: rules.callTerms.offends as DirectiveTerms['offends'], required: 0 };
}