/**
 * The pack's rules for men and regions (lane 1.7; 0072: every kernel default is a pack rule, stated by every pack).
 * The kernel names no side and no value: which values a call honours or offends (0074's `state_autonomy`, say), and
 * whose lines people reach, are pack data.
 */
import { COMPLIANCE_RUNGS, type ComplianceRung, type DirectiveClause, type DirectiveTerms, type ReservationSubject } from '../directive.ts';
import type { FactionId, RegionId } from '../ids.ts';
import type { CallSpec } from '../messages/transit.ts';

/** A rung that raises men, and how: permille of the quota, and days added to the muster. */
export interface RaisingRung {
  readonly rung: ComplianceRung;
  readonly sharePermille: number;
  readonly delayDays: number;
}

/** Clauses of the issuer's paper. Recorded only; neither these nor demand imply available means. */
export interface CallProfile {
  readonly id: string;
  /** Identity of the shared researched text profile; instances retain their own clauses. */
  readonly sourceProfile: string;
  readonly honours: readonly string[];
  readonly offends: readonly string[];
  readonly callProvenance: readonly { readonly source: string; readonly page: number }[];
  readonly conditions: readonly { readonly kind: 'service_term' | 'organisation' | 'appointments' | 'arms_equipment' | 'destination' | 'other_conditions'; readonly clauseText: string }[];
  readonly materialDemand: readonly {
    readonly resource: 'arms' | 'equipment' | 'horses' | 'clothing' | 'transport' | 'subsistence';
    readonly obligation: 'required' | 'as_practicable' | 'not_required' | 'unspecified';
    readonly provider: 'state' | 'national' | 'either' | 'volunteer' | 'unspecified';
    readonly quantity: number | null;
    readonly demandText: string;
  }[];
  readonly rationale: string;
  readonly limits: string;
}

export interface RecruitmentRules {
  /** Model planning size [I], never a historical norm. At most four regiments. */
  readonly planningRegiments?: number;
  /** How a governor reads a call: its boldness and the values it honours and offends (pack data). */
  readonly callTerms: { readonly boldness: number; readonly honours: readonly string[]; readonly offends: readonly string[] };
  /** Per-paper values and unscored clauses. Absence of a profile explicitly uses callTerms. */
  readonly callProfiles?: readonly CallProfile[];
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
   * Where slavery has ended, in law or in fact (G-1.7b; the District of Columbia act of April 1862 is the model): while a
   * flag is set, the term skips its regions, for no one there is enslaved. Nothing else skips a region (G-1.7a): holding it
   * protects no one by itself, and a policy that protects people who reach the lines is a policy flag (`policyFlags`),
   * which raises flight to the lines and never skips a region. Flags are set by the pack's decisions.
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
  const profiles = new Set<string>();
  for (const p of r.callProfiles ?? []) {
    if (!/^[a-z][a-z0-9_]*$/.test(p.id) || profiles.has(p.id)) problems.push(`recruitment callProfiles: invalid or duplicate id ${p.id}`);
    profiles.add(p.id);
    if (p.callProvenance.length === 0) problems.push(`recruitment callProfiles.${p.id}: callProvenance with printed pages is required`);
    for (const c of p.callProvenance) {
      if (!c.source.trim()) problems.push(`recruitment callProfiles.${p.id}: source is required`);
      whole(problems, `recruitment callProfiles.${p.id}.page`, c.page, 1);
    }
    for (const d of p.materialDemand) if (d.quantity !== null) whole(problems, `recruitment callProfiles.${p.id}.quantity`, d.quantity, 0);
  }
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
export function callTerms(rules: RecruitmentRules, profile?: CallProfile): DirectiveTerms {
  const values = profile ?? rules.callTerms;
  // No complete, dated means balance: material clauses must not invent a capacity term.
  return { boldness: rules.callTerms.boldness, honours: values.honours as DirectiveTerms['honours'], offends: values.offends as DirectiveTerms['offends'], required: 0 };
}

const MATERIAL_SUBJECTS: Readonly<Record<CallProfile['materialDemand'][number]['resource'], ReservationSubject>> = {
  arms: 'arms_equipment', equipment: 'arms_equipment', horses: 'arms_equipment', clothing: 'arms_equipment',
  transport: 'transport', subsistence: 'support',
};

/** Clause IDs belong to the received call, including when other calls share its source profile. */
export function callDirective(rules: RecruitmentRules, call: CallSpec): DirectiveTerms {
  const profile = call.callProfile;
  const clauseProvenance = profile?.callProvenance.map(({ source, page }) => [source, page] as const);
  const provenance = clauseProvenance === undefined ? {} : { clauseProvenance };
  const clauses: DirectiveClause[] = [
    { clauseId: 'course', clauseSubject: 'course', ...provenance },
    { clauseId: 'purpose', clauseSubject: 'purpose', ...provenance },
    { clauseId: 'service_term', clauseSubject: 'service_term' },
    { clauseId: 'organisation', clauseSubject: 'organisation' },
    { clauseId: 'muster', clauseSubject: 'muster' },
  ];
  for (const [index, condition] of (profile?.conditions ?? []).entries()) clauses.push({
    clauseId: `condition:${condition.kind}:${index}`,
    clauseSubject: condition.kind === 'other_conditions' ? 'course' : condition.kind,
    clauseWording: condition.clauseText,
    ...provenance,
  });
  for (const [index, demand] of (profile?.materialDemand ?? []).entries()) clauses.push({
    clauseId: `demand:${demand.resource}:${index}`, clauseSubject: MATERIAL_SUBJECTS[demand.resource],
    clauseWording: demand.demandText, clauseObligation: demand.obligation, ...provenance,
  });
  return { ...callTerms(rules, profile), clauses };
}
