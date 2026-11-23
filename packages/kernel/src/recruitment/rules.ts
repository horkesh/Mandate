/**
 * The pack's rules for men and regions (lane 1.7; 0072: every kernel default is a pack rule, stated by every pack).
 * The kernel names no side and no value: which values a call honours or offends (0074's `state_autonomy`, say), and
 * whose lines people reach, are pack data.
 */
import { COMPLIANCE_RUNGS, type ComplianceRung, type DirectiveClause, type DirectiveTerms, type ReservationSubject } from '../directive.ts';
import type { FactionId, RegionId } from '../ids.ts';
import type { CallSpec } from '../messages/transit.ts';
import type { CallInformation, StateConditionRecord } from '../knowledge/evidence-types.ts';

/** A rung that raises men, and how: permille of the quota, and days added to the muster. */
export interface RaisingRung {
  readonly rung: ComplianceRung;
  readonly sharePermille: number;
  readonly delayDays: number;
}

/** Clauses of the issuer's paper. Recorded only; neither these nor demand imply available means. */
export interface CallProfile {
  /** The legal organisation this paper uses, declared by the pack (0127). */
  readonly callEstablishment?: string;
  /** Typed readings of original issuer details. Omitted metadata makes no claim of unknownness. */
  readonly information?: readonly CallInformation[];
  readonly id: string;
  /** Identity of the shared researched text profile; instances retain their own clauses. */
  readonly sourceProfile: string;
  readonly honours: readonly string[];
  readonly offends: readonly string[];
  /** Sourced links for either value array. An absent link leaves the value on the whole paper. */
  readonly valueClauseLinks?: readonly CallValueClauseLink[];
  readonly callProvenance: readonly { readonly source: string; readonly page: number }[];
  readonly conditions: readonly { readonly kind: 'service_term' | 'organisation' | 'appointments' | 'arms_equipment' | 'destination' | 'other_conditions' | 'purpose' | 'authority'; readonly clauseText: string }[];
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

/** Immutable issuer metadata; it neither cancels the value's cost nor asserts an actor's protest. */
export interface CallValueClauseLink {
  readonly linkValue: string;
  readonly linkClause: string;
  readonly linkCites: readonly (readonly [source: string, page: number])[];
  readonly linkRationale: string;
}

export function callValueLinkProblems(profile: CallProfile): string[] {
  const problems: string[] = [];
  const details = new Set<string>();
  for (const info of profile.information ?? []) {
    if (!['purpose_detail','muster_receiver','rejection_return_support'].includes(info.detail) || details.has(info.detail) || (info.value !== null && !info.value.trim())) problems.push(`invalid or duplicate call information ${info.detail}`);
    details.add(info.detail);
  }
  const ids = new Set(['course', 'purpose', 'service_term', 'organisation', 'muster',
    ...profile.conditions.map((c, i) => `condition:${c.kind}:${i}`),
    ...profile.materialDemand.map((d, i) => `demand:${d.resource}:${i}`)]);
  const values = new Set([...profile.honours, ...profile.offends]);
  const seen = new Set<string>();
  for (const link of profile.valueClauseLinks ?? []) {
    if (!ids.has(link.linkClause)) problems.push(`unknown value clause ${link.linkClause}`);
    if (!values.has(link.linkValue)) problems.push(`unassigned linked value ${link.linkValue}`);
    const key = `${link.linkValue}|${link.linkClause}`;
    if (seen.has(key)) problems.push(`duplicate value clause link ${key}`);
    seen.add(key);
    if (!link.linkRationale.trim()) problems.push(`value clause ${key} needs a rationale`);
    if (!link.linkCites.length || link.linkCites.some(([source, page]) => !source.trim() || !Number.isSafeInteger(page) || page < 1)) problems.push(`value clause ${key} needs printed-page provenance`);
  }
  return problems;
}

export interface RecruitmentRules {
  readonly establishments?: readonly RegimentEstablishment[];
  readonly defaultEstablishments?: readonly { readonly faction: FactionId; readonly arm: string; readonly id: string }[];
  /** Dated sourced own-state records, filed with their named holder; never historical replies. */
  readonly stateConditions?: readonly StateConditionRecord[];
  /** Model planning size [I], never a historical norm. At most four regiments. */
  readonly planningRegiments?: number;
  /** Legacy boldness is retained for pack compatibility but is inapplicable to calls under 0119. Values remain pack data. */
  readonly callTerms: { readonly boldness: number; readonly honours: readonly string[]; readonly offends: readonly string[] };
  /** Per-paper values and unscored clauses. Absence of a profile explicitly uses callTerms. */
  readonly callProfiles?: readonly CallProfile[];
  /** The post kinds whose holders answer a call (a governor's). A post of a self-governing department never does (SENSITIVE-HISTORY 3.7). */
  readonly raisingPostKinds: readonly string[];
  /** Men in a regiment. */
  readonly menPerRegiment?: number;
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

/** Legal minimum, not a historical return or a claim about achieved muster. */
export interface RegimentEstablishment {
  readonly id: string;
  readonly faction: FactionId;
  readonly callKind: string;
  readonly arm: string;
  readonly organisation: string;
  readonly effective: string;
  readonly men: number | null;
  readonly cites: readonly (readonly [string, number])[];
  readonly note: string;
}

export function callEstablishment(rules: RecruitmentRules, profile?: CallProfile, faction?: string | null, arm = rules.arm): RegimentEstablishment | undefined {
  const id = profile?.callEstablishment ?? rules.defaultEstablishments?.find(r => r.faction === faction && r.arm === arm)?.id;
  return rules.establishments?.find(e => e.id === id && e.arm === arm && (faction == null || e.faction === faction));
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
  const records = new Set<string>();
  for (const record of r.stateConditions ?? []) {
    if (!/^[a-z][a-z0-9_]*$/.test(record.recordId) || records.has(record.recordId)) problems.push(`invalid or duplicate state condition ${record.recordId}`);
    records.add(record.recordId);
    const condition = record.recordCondition;
    if (!condition.conditionCites.length || condition.conditionCites.some(([source,page]) => !source.trim() || !Number.isSafeInteger(page) || page < 1)) problems.push(`state condition ${record.recordId} needs printed-page provenance`);
  }
  whole(problems, 'recruitment rule callTerms.boldness', r.callTerms.boldness, 0, 1000);
  const profiles = new Set<string>();
  for (const p of r.callProfiles ?? []) {
    problems.push(...callValueLinkProblems(p).map(problem => `recruitment callProfiles.${p.id}: ${problem}`));
    if (!/^[a-z][a-z0-9_]*$/.test(p.id) || profiles.has(p.id)) problems.push(`recruitment callProfiles: invalid or duplicate id ${p.id}`);
    profiles.add(p.id);
    if (p.callProvenance.length === 0) problems.push(`recruitment callProfiles.${p.id}: callProvenance with printed pages is required`);
    for (const c of p.callProvenance) {
      if (!c.source.trim()) problems.push(`recruitment callProfiles.${p.id}: source is required`);
      whole(problems, `recruitment callProfiles.${p.id}.page`, c.page, 1);
    }
    for (const d of p.materialDemand) if (d.quantity !== null) whole(problems, `recruitment callProfiles.${p.id}.quantity`, d.quantity, 0);
  }
  whole(problems, 'recruitment rule maxTermDays', r.maxTermDays, 1);
  if (r.menPerRegiment !== undefined) whole(problems, 'recruitment rule menPerRegiment', r.menPerRegiment, 1);
  if (r.menPerRegiment !== undefined && r.establishments !== undefined) problems.push('choose establishments or legacy menPerRegiment, never both');
  if (r.menPerRegiment === undefined && !r.establishments?.length) problems.push('recruitment needs declared establishments');
  const establishmentIds = new Set<string>();
  for (const e of r.establishments ?? []) {
    if (!e.id.trim() || establishmentIds.has(e.id)) problems.push(`invalid or duplicate establishment ${e.id}`);
    establishmentIds.add(e.id);
    if (e.men !== null) whole(problems, `establishment ${e.id}.men`, e.men, 1);
    if (!e.cites.length || e.cites.some(([s,p]) => !s.trim() || !Number.isSafeInteger(p) || p < 1)) problems.push(`establishment ${e.id} needs printed-page provenance`);
  }
  for (const p of r.callProfiles ?? []) if (r.establishments !== undefined && !establishmentIds.has(p.callEstablishment ?? '')) problems.push(`call ${p.id} needs its own establishment`);
  for (const d of r.defaultEstablishments ?? []) if (!r.establishments?.some(e => e.id === d.id && e.faction === d.faction && e.arm === d.arm)) problems.push(`invalid default establishment ${d.id}`);
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
  return { boldness: null, honours: values.honours as DirectiveTerms['honours'], offends: values.offends as DirectiveTerms['offends'], required: 0 };
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
    { clauseId: 'authority', clauseSubject: 'authority' },
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
  return { ...callTerms(rules, profile), clauses,
    ...(profile?.valueClauseLinks === undefined ? {} : { valueClauseLinks: profile.valueClauseLinks.map(link => [link.linkValue, link.linkClause] as const) }),
  };
}
