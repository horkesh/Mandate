/**
 * Lane 1.5's pack rules (0072: every kernel default is a pack rule, stated by every pack): the president's attention,
 * the map from orders to values, and the numbers behind the people verbs, the ladder, the audience and seat
 * initiatives. DESIGN PARAMETERS, never sourced facts.
 */

/** Every verb that costs (or may cost) attention, by its cost-table key (FOUNDATION section 5; 0025, 0040). */
export const ATTENTION_KEYS = [
  'order', 'review_edit', 'review_approve', 'review_send_back', 'go', 'decide_staff', 'decide_overrule', 'delegate',
  'appoint', 'relieve', 'transfer', 'inquire', 'consult', 'audience', 'observer', 'promise', 'pressure', 'address',
] as const;
export type AttentionKey = (typeof ATTENTION_KEYS)[number];

/** The president's attention (0025, 0040): a weekly budget, refilled to its cap with no carry-over. */
export interface AttentionRules {
  readonly cap: number;
  /** Days between refills. */
  readonly refillDays: number;
  /** The cost table: one row per verb. FOUNDATION section 5's rules are the packs' values (approve 0, each edit 1, inquire 0, consult 1...). */
  readonly costs: Readonly<Record<AttentionKey, number>>;
}

/**
 * One row of the map from orders to values (0074: gate content). An order of `order` (`goal:<kind>`, `verb:<verb>` or
 * `policy:<option>`) asks this boldness of the man who reads it and honours or offends these values. A row tagged with
 * gate topics is signed off by the gate reviewer. A row with `notCheaperThan` is, by construction, never cheaper in
 * pushback than the row it names (`pushbackOf` takes the larger of the two).
 */
export interface OrderValueRow {
  readonly order: string;
  /** How bold the order asks him to be; null where temperament has no bearing (an appointment, an inquiry): no temperament term. */
  readonly boldness: number | null;
  readonly honours: readonly string[];
  readonly offends: readonly string[];
  readonly gateTopics: readonly string[];
  readonly notCheaperThan: string | null;
}

/** What a relief costs the man relieved, by its mode (FOUNDATION section 5). */
export interface ReliefRule {
  readonly mode: 'quiet_department' | 'own_request' | 'outright';
  readonly grievanceWeight: number;
  /** Signed regard change toward the principal. */
  readonly regardDelta: number;
  /** Standing change (an outright relief is public). */
  readonly standingDelta: number;
}

export const LADDER_RUNGS = ['loyal', 'grumbling', 'foot_dragging', 'lobbying', 'leaking', 'public_defiance', 'open_insubordination', 'armed_defiance'] as const;
export type LadderRung = (typeof LADDER_RUNGS)[number];

/** A seat initiative (0040): something a person does unprompted, if his compliance with it is high enough. */
export interface InitiativeRule {
  readonly id: string;
  /** Person kinds from the pack's vocabulary who may take it. */
  readonly kinds: readonly string[];
  readonly boldness: number;
  readonly honours: readonly string[];
  readonly offends: readonly string[];
  /** He takes it only from this ladder rung up (loyal: any man). */
  readonly fromRung: LadderRung;
  readonly cooldownDays: number;
  /** What his memorandum to the principal recommends. */
  readonly recommends: string;
}

export interface VerbRules {
  /** Days between the weekly people steps (ladder, rivals, grievance decay, initiatives, due promises). */
  readonly weekDays: number;
  readonly orderValues: readonly OrderValueRow[];
  readonly relief: readonly ReliefRule[];
  /** An appointment's own boldness and values are the `verb:appoint` row; an appointee who refuses declines the post. */
  readonly inquiry: { readonly freePerWeek: number; readonly pesteredWeight: number };
  readonly promise: { readonly dueDays: number; readonly brokenWeight: number; readonly brokenRegard: number };
  readonly pressure: { readonly weight: number; readonly oversight: number; readonly days: number };
  readonly observer: { readonly oversight: number; readonly monitoredWeight: number; readonly letterEveryDays: number };
  readonly audience: { readonly maxCounters: number; readonly cooldownDays: number; readonly vindicateRegard: number; readonly vindicateStanding: number };
  readonly ladder: {
    /** Discontent (grievance load minus half his regard) at which each rung above loyal begins: seven thresholds, ascending. */
    readonly thresholds: readonly number[];
    readonly dispositionPerRung: number;
    /** Standing needed for public defiance and above. */
    readonly publicStanding: number;
    /** Standing at which a man on lobbying or above becomes a rival. */
    readonly rivalStanding: number;
    /** A grievance loses its weight divided by this each week (at least 1). */
    readonly decayDivisor: number;
  };
  readonly initiatives: readonly InitiativeRule[];
}

/** Problems with the attention and verb rules (the kernel and the validator say the same). */
export function verbRulesProblems(attention: AttentionRules | undefined, verbs: VerbRules | undefined, values: readonly string[], personKinds: readonly string[]): string[] {
  const problems: string[] = [];
  if (attention === undefined) problems.push('the pack states no attention rules (rules.people.attention)');
  if (verbs === undefined) problems.push('the pack states no verb rules (rules.people.verbs)');
  if (attention === undefined || verbs === undefined) return problems;
  const whole = (v: unknown, what: string) => {
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0) problems.push(`people rule ${what} must be a whole number, at least 0`);
  };
  const signed = (v: unknown, what: string) => {
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < -1000 || v > 1000) problems.push(`people rule ${what} must be a whole signed permille`);
  };
  const known = new Set(values);
  const value = (v: string, what: string) => {
    if (!known.has(v)) problems.push(`people rule ${what} names value "${v}", which is not in the pack's values vocabulary`);
  };
  whole(attention.cap, 'attention.cap');
  if (!(attention.refillDays >= 1)) problems.push('people rule attention.refillDays must be at least 1');
  for (const k of ATTENTION_KEYS) whole(attention.costs[k], `attention.costs.${k}`);
  if (!(verbs.weekDays >= 1)) problems.push('people rule verbs.weekDays must be at least 1');
  const orders = new Set<string>();
  for (const r of verbs.orderValues) {
    if (orders.has(r.order)) problems.push(`people rule orderValues names ${r.order} twice`);
    orders.add(r.order);
    if (!/^(?:goal|verb|policy):[a-z0-9_-]+$/.test(r.order)) problems.push(`people rule orderValues: "${r.order}" must be goal:<kind>, verb:<verb> or policy:<option>`);
    if (r.boldness !== null && !(r.boldness >= 0 && r.boldness <= 1000)) problems.push(`people rule orderValues.${r.order}.boldness must be a permille`);
    for (const v of [...r.honours, ...r.offends]) value(v, `orderValues.${r.order}`);
  }
  for (const r of verbs.orderValues) {
    if (r.notCheaperThan !== null && !orders.has(r.notCheaperThan)) problems.push(`people rule orderValues.${r.order}.notCheaperThan names ${r.notCheaperThan}, which is not a row`);
  }
  // Review S1: `pushbackOf` follows `notCheaperThan`, so a chain that comes back to a row would recurse without end.
  // Each row on a loop reports it; a row merely leading into another's loop does not.
  const floorOf = new Map(verbs.orderValues.map((r) => [r.order, r.notCheaperThan]));
  for (const r of verbs.orderValues) {
    const chain = [r.order];
    let next = r.notCheaperThan;
    while (next !== null && floorOf.has(next) && !chain.includes(next)) {
      chain.push(next);
      next = floorOf.get(next) ?? null;
    }
    if (next === r.order) problems.push(`people rule orderValues.${r.order}.notCheaperThan loops back to itself: ${[...chain, r.order].join(' -> ')}`);
  }
  for (const verb of ['appoint', 'relieve', 'transfer', 'inquire', 'consult', 'observer']) if (!orders.has(`verb:${verb}`)) problems.push(`people rule orderValues has no row for verb:${verb}`);
  for (const mode of ['quiet_department', 'own_request', 'outright'] as const) {
    const r = verbs.relief.find((x) => x.mode === mode);
    if (r === undefined) problems.push(`people rule relief has no row for ${mode}`);
    else {
      whole(r.grievanceWeight, `relief.${mode}.grievanceWeight`);
      signed(r.regardDelta, `relief.${mode}.regardDelta`);
      signed(r.standingDelta, `relief.${mode}.standingDelta`);
    }
  }
  whole(verbs.inquiry.freePerWeek, 'inquiry.freePerWeek');
  whole(verbs.inquiry.pesteredWeight, 'inquiry.pesteredWeight');
  whole(verbs.promise.dueDays, 'promise.dueDays');
  whole(verbs.promise.brokenWeight, 'promise.brokenWeight');
  signed(verbs.promise.brokenRegard, 'promise.brokenRegard');
  whole(verbs.pressure.weight, 'pressure.weight');
  whole(verbs.pressure.oversight, 'pressure.oversight');
  whole(verbs.pressure.days, 'pressure.days');
  whole(verbs.observer.oversight, 'observer.oversight');
  whole(verbs.observer.monitoredWeight, 'observer.monitoredWeight');
  if (!(verbs.observer.letterEveryDays >= 1)) problems.push('people rule observer.letterEveryDays must be at least 1');
  whole(verbs.audience.maxCounters, 'audience.maxCounters');
  whole(verbs.audience.cooldownDays, 'audience.cooldownDays');
  signed(verbs.audience.vindicateRegard, 'audience.vindicateRegard');
  signed(verbs.audience.vindicateStanding, 'audience.vindicateStanding');
  const t = verbs.ladder.thresholds;
  if (t.length !== LADDER_RUNGS.length - 1 || t.some((x, i) => !Number.isSafeInteger(x) || (i > 0 && x <= t[i - 1]!))) problems.push(`people rule ladder.thresholds must be ${LADDER_RUNGS.length - 1} ascending whole numbers`);
  whole(verbs.ladder.dispositionPerRung, 'ladder.dispositionPerRung');
  whole(verbs.ladder.publicStanding, 'ladder.publicStanding');
  whole(verbs.ladder.rivalStanding, 'ladder.rivalStanding');
  if (!(verbs.ladder.decayDivisor >= 1)) problems.push('people rule ladder.decayDivisor must be at least 1');
  const ids = new Set<string>();
  const kinds = new Set(personKinds);
  for (const i of verbs.initiatives) {
    if (ids.has(i.id)) problems.push(`people rule initiatives names ${i.id} twice`);
    ids.add(i.id);
    for (const k of i.kinds) if (!kinds.has(k)) problems.push(`people rule initiatives.${i.id} names person kind "${k}", which is not in the vocabulary`);
    for (const v of [...i.honours, ...i.offends]) value(v, `initiatives.${i.id}`);
    if (!(LADDER_RUNGS as readonly string[]).includes(i.fromRung)) problems.push(`people rule initiatives.${i.id}.fromRung must be a ladder rung`);
    if (!(i.cooldownDays >= 1)) problems.push(`people rule initiatives.${i.id}.cooldownDays must be at least 1`);
  }
  return problems;
}
