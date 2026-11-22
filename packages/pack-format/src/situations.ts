/**
 * Situations in the pack format (lane 0.7; decisions 0023, 0030, 0040, 0041,
 * 0046 and 0050).
 *
 *     packs/<id>/situations/<situation-id>.json   one situation per file, hand-written
 *     packs/<id>/situations/drafts/               never loaded (SENSITIVE-HISTORY section 5)
 *
 * The Zod schema's output is exactly the kernel's `SituationDef` (checked at
 * compile time below). Optional fields take their empty value, so a modder
 * writes only what a situation uses. The semantic pass reports every problem
 * at its file and JSON path: references, the fields each kind needs (gate
 * question B1), a cause that is not a bare date (B2), the fixed display order
 * (0041), chains, routes and string keys. The gate (`gate.ts`) runs on top.
 */
import { phase0 } from '@mandate/kernel';
import { z } from 'zod';
import { listOptional, readJson, type PackFiles } from './generate.ts';
import { type Issue, IssueSink } from './issues.ts';
import { historicalDate, idOf, stringKey, termId } from './schemas.ts';
import type { PackData } from './validate.ts';

type SituationDef = phase0.SituationDef;
type Condition = phase0.Condition;

export const SITUATIONS_DIR = 'situations';
export const DRAFTS_DIR = 'situations/drafts';
export const situationFile = (id: string) => `${SITUATIONS_DIR}/${id}.json`;

const int = z.int('a whole number');
const positive = int.min(1, 'one or more');
const nonNegative = int.min(0, 'zero or more');
const permille = int.min(0).max(1000, 'a permille up to 1000');

/**
 * A field or option id in lowercase (the standing review of lane 1.8's register, S1): the gate's field and option
 * signatures find words by their separators, so `blackSoldiers` or `exchangePrisoners` would pass every one of them.
 * Lowercase closes that for every signature at once; no pack uses a capital in either today.
 */
export const lowerId = termId.regex(/^[a-z0-9][a-z0-9_.:\/-]*$/, 'lowercase letters, digits and _ . : / - only, so the gate’s signatures see every word (no camelCase)');

const knows = z.strictObject({
  reportType: z.enum(phase0.REPORT_TYPES).nullable().default(null),
  subtype: z.string().min(1).nullable().default(null),
  subjectKind: z.enum(phase0.SUBJECT_KINDS).nullable().default(null),
  subjectId: z.string().min(1).nullable().default(null),
  claimKind: z.enum(phase0.CLAIM_KINDS).nullable().default(null),
  token: z.string().min(1).nullable().default(null),
});

/** A condition: one key names the predicate (all, any, not, dayAtLeast, flag, fired, decided, knows, goal, headquartersAt, callReceived, clockAtLeast). */
const renewal = z.strictObject({
  post: idOf('post'), arm: termId, regiments: positive, fromTermDays: positive, termDays: positive,
  musteredBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.strictObject({ all: z.array(ConditionSchema).min(1, 'at least one condition') }),
    z.strictObject({ any: z.array(ConditionSchema).min(1, 'at least one condition') }),
    z.strictObject({ not: ConditionSchema }),
    z.strictObject({ dayAtLeast: positive }),
    z.strictObject({ flag: termId }),
    z.strictObject({ fired: idOf('situation'), forDays: nonNegative.optional().describe('Elapsed days from the actual event in State; does not assert receipt.') }),
    z.strictObject({ decided: idOf('situation'), options: z.array(termId).min(1).nullable().default(null), forDays: nonNegative.optional().describe('Elapsed days from the actual final decision with the required choice; does not assert receipt.') }),
    z.strictObject({ knows, forDays: nonNegative.optional().describe('A pack-stated deliberation interval from receipt of a matching report; omitting it requires receipt only.') }),
    z.strictObject({ goal: z.strictObject({ post: idOf('post'), posture: z.enum(phase0.POSTURES) }).describe('The post holds a goal of this posture, ordered by its principal (lane 1.2: a goal in plans, no longer a standing goal).') }),
    z.strictObject({ headquartersAt: z.strictObject({ post: idOf('post'), region: idOf('region') }) }),
    z.strictObject({ renewableEnlistment: renewal }),
    z.strictObject({ callReceived: z.strictObject({ post: idOf('post'), days: int.min(0) }) }).describe('A call for regiments reached the holder of a post at least this many days ago (lane 1.11): a state’s act a pack-set delay after the call arrives. STAND-IN(call-received-delay; owner: 1B, conventions and legislatures).'),
    z.strictObject({ holds: z.strictObject({ post: idOf('post'), person: idOf('person') }) }).describe('The post is held today by this person (lane 1.11).'),
    z.strictObject({ holderPractice: z.strictObject({ post: idOf('post'), practice: termId }) }).describe('The post’s holder today carries this cited practice (lane 1.11, on lane 1.5b’s practices).'),
    z.strictObject({ clockAtLeast: nonNegative }),
    z.strictObject({ chamber: z.strictObject({ id: termId, state: z.enum(phase0.CHAMBER_STATES) }).describe('A chamber of the legislature is in this state today (lane 1.6): a public fact.') }),
    z.strictObject({
      ledger: z
        .strictObject({ side: idOf('faction'), act: termId.nullable().default(null), status: z.enum(phase0.LEDGER_STATUSES) })
        .describe('An act of the side (this one, or any) stands away (taken while the legislature was away), before it (met, not answered) or answered (lane 1.6, 0046): a public fact.'),
    }),
  ]),
);

export const EffectSchema = z.union([
  z.strictObject({ setFlag: termId }),
  z.strictObject({ clearFlag: termId }),
  z.strictObject({
    propose: z.strictObject({
      owner: termId,
      field: lowerId,
      subject: z.string().min(1).nullable().default(null),
      delta: int.describe(
        'Signed permille. The owner declares whether a rise helps or harms the side. The gate requires that declaration to check an atrocity-class effect (E7, D5).',
      ),
      reason: termId,
      succession: z.strictObject({ from: idOf('person'), to: idOf('person') }).optional(),
      renewal: renewal.optional(),
      stateForces: z.strictObject({
        id: z.string().regex(/^[a-z][a-z0-9_]*$/), regiments: positive.nullable(), men: nonNegative.nullable(),
        arm: termId, termDays: positive.nullable(), termUnknown: z.boolean().optional(), includesCalls: z.array(termId).optional(),
      }).optional(),
      side: idOf('faction')
        .nullable()
        .default(null)
        .describe('The side whose measure this is; null for a measure no side owns. An atrocity-class item may only worsen its acting side’s measures (E7, D5).'),
    }),
  }),
  z
    .strictObject({ landing: z.strictObject({ parent: idOf('forceBlock'), men: positive, region: idOf('region') }) })
    .describe('A landing (lane 1.11, on lane 1.4b’s detachment path): this many men of a block aboard ship go ashore in the region, across an edge from the ship; forces applies or refuses it in phase 4c.'),
]);

export const GateTagSchema = z.union([
  z.strictObject({
    topics: z.array(termId).min(1, 'at least one register topic'),
    placement: z.enum(phase0.PLACEMENTS),
    risks: z.array(termId).default([]),
    actingSide: idOf('faction').nullable().default(null),
  }),
  z.strictObject({ none: z.string().min(1, 'the reason this item is not gated') }),
]);

export const GateReviewSchema = z.strictObject({
  author: z.string().min(1),
  reviewer: z.string().min(1),
  date: historicalDate,
  questionVersions: z.record(z.string().regex(/^[A-HQ][0-9]+$/, 'a checklist question id such as B5'), positive),
  contentHash: z.string().regex(/^[0-9a-f]{64}$/, 'a SHA-256 hash in 64 hex digits'),
  notes: z.record(z.string().min(1), z.string().min(1)).default({}),
});

const conditionOrNull = ConditionSchema.nullable().default(null);

/** A policy row of the map and the posts that carry it (lane 1.5b): on an option, or on a decision's inaction. */
const PolicySchema = z
  .strictObject({ row: z.string().regex(/^policy:[a-z0-9_-]+$/), carriedBy: z.array(idOf('post')).default([]) })
  .nullable()
  .default(null);

export const OptionSchema = z.strictObject({
  id: lowerId,
  label: stringKey,
  displayKey: positive,
  proposedBy: z.union([
    z.array(idOf('person')).min(1, 'the holders who argued for it (gate C1)'),
    z.literal('inaction'),
    z
      .strictObject({ basis: z.literal('law-and-practice'), cites: z.array(z.strictObject({ source: z.string().min(1), at: z.string().min(1).nullable().default(null) })).min(1, 'the law and the practice, cited') })
      .describe('A recorded exception (the lead’s ruling on S17): the law and practice a gate-kept option rests on, where no adviser is on record. Only an option the register supersedes or marks watched may carry it.'),
    z
      .strictObject({
        basis: z.literal('principal-initiative'),
        author: idOf('person'),
        dated: historicalDate,
        cites: z.array(z.strictObject({ source: z.string().min(1), at: z.string().min(1).nullable().default(null) })).min(1, 'the principal’s own document, cited'),
      })
      .describe('A recorded exception (the lead’s ruling on S12): the principal’s own consideration, on record before the decision, where no adviser is. Only on a gated option; the author must be the side’s principal, the document dated inside the topic’s window. Provenance only: the option shows no proposer (B9).'),
  ]),
  group: termId.nullable().default(null),
  appearsWhen: conditionOrNull,
  expiresWhen: conditionOrNull,
  waitsOn: conditionOrNull,
  effects: z.array(EffectSchema).default([]),
  lockedCosts: z.array(EffectSchema).default([]),
  orders: z
    .array(
      z.strictObject({
        to: idOf('post'),
        posture: z.enum(phase0.POSTURES).describe('The goal the order gives: take, relieve or hold its objective. Its other terms are the pack’s goalDefaults (rules.plans).'),
        objective: idOf('region').nullable().default(null).describe('The goal’s objective; null only for a hold where he stands.'),
        route: z.enum(phase0.ROUTE_KINDS),
      }),
    )
    .default([]),
  calls: z
    .array(
      z.strictObject({
        to: idOf('post'),
        regiments: int.min(1).describe('Regiments asked of the governor.'),
        termDays: int.min(1).describe('Days the men are enlisted for, from the muster.'),
        route: z.enum(phase0.ROUTE_KINDS),
      }),
    )
    .default([])
    .describe('Calls for regiments to governors’ posts (lane 1.11), through the validated call path: each governor answers by his own compliance (lane 1.7).'),
  honours: z.array(termId).default([]),
  watched: z.boolean().default(false),
  policy: PolicySchema.describe('The policy this option is (lane 1.5b; 0074): a policy: row of the map, and the posts whose holders carry it out. Its honours must equal the row’s.'),
  gate: GateTagSchema.nullable().default(null),
});

export const SituationSchema = z.strictObject({
  id: idOf('situation'),
  kind: z.enum(phase0.SITUATION_KINDS),
  faction: idOf('faction'),
  title: stringKey,
  text: stringKey,
  earliest: historicalDate,
  event: ConditionSchema,
  knowledge: conditionOrNull,
  railroad: z.string().min(1).nullable().default(null),
  chain: z
    .strictObject({
      id: termId,
      stage: positive,
      follows: z.strictObject({ situation: idOf('situation'), options: z.array(termId).min(1).nullable().default(null) }).nullable().default(null),
    })
    .nullable()
    .default(null),
  subjects: z.array(idOf('person')).default([]),
  options: z.array(OptionSchema).default([]),
  inaction: z
    .strictObject({
      text: stringKey,
      effects: z.array(EffectSchema).default([]),
      policy: PolicySchema.describe('The policy inaction is (lane 1.5b; G-1.5g): required in a situation the map from orders to values gates.'),
    })
    .nullable()
    .default(null),
  historicalDefault: z
    .union([z.strictObject({ options: z.array(termId).min(1) }), z.strictObject({ delegate: idOf('post') }), z.strictObject({ unsourced: z.string().min(1) })])
    .nullable()
    .default(null),
  staffAbsence: z
    .strictObject({ none: z.literal('no-adviser-on-record'), cites: z.array(z.strictObject({ source: z.string().min(1), at: z.string().min(1).nullable().default(null) })).min(1, 'the research that found no adviser') })
    .optional()
    .describe('No staff recommendation, as a typed and cited absence (the lead’s S18 ruling): the research that found no adviser on record. The decision is then told by a plain report.'),
  staffLine: z
    .strictObject({
      authors: z.array(idOf('post')).min(1, 'an ordered list of author posts (0046)'),
      recommends: z.array(termId).min(1),
      reasons: z.array(z.strictObject({ kind: termId, weight: int })).default([]),
      confidence: permille,
    })
    .nullable()
    .default(null),
  delegableTo: z.array(idOf('post')).default([]),
  resurfaceOn: z.array(positive).default([]),
  effects: z.array(EffectSchema).default([]),
  report: z
    .strictObject({
      authors: z.array(idOf('post')).min(1, 'an ordered list of author posts (gate F1)'),
      reportType: z.enum(phase0.REPORT_TYPES),
      subtype: z.string().min(1).nullable().default(null),
    })
    .nullable()
    .default(null),
  speakers: z
    .array(z.strictObject({ post: idOf('post').nullable(), person: idOf('person') }))
    .optional()
    .describe('The post-holder check (lane 1.11): the named men whose words or acts the text gives, each in the post he must hold that day (null: serving). The item fires only while every one does.'),
  namedOnly: z.string().min(1).optional().describe('Why the text names a man without giving his words or acts (lane 1.11: the post-holder check).'),
  actingGovernment: idOf('department').optional(),
  gate: GateTagSchema,
  gateReview: GateReviewSchema.nullable().default(null),
  citations: z.array(z.strictObject({ source: z.string().min(1), at: z.string().min(1).nullable().default(null) })).default([]),
});

type DeepReadonly<T> = T extends string | number | boolean | null | undefined
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : { readonly [K in keyof T]: DeepReadonly<T[K]> };
type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/** The schema's output is exactly the kernel's type: a mismatch fails `npm run typecheck`. */
export const SITUATION_SCHEMA_MATCHES_KERNEL: { situation: Same<DeepReadonly<z.output<typeof SituationSchema>>, DeepReadonly<SituationDef>> } = { situation: true };

/** Read every situation in `situations/` (not `drafts/`), shape-checked. */
export function readSituations(files: PackFiles, sink: IssueSink): { readonly file: string; readonly def: SituationDef }[] {
  const out: { file: string; def: SituationDef }[] = [];
  for (const name of [...listOptional((p) => files.files(p), SITUATIONS_DIR)].sort()) {
    const file = `${SITUATIONS_DIR}/${name}`;
    if (!name.endsWith('.json')) {
      sink.error('unknown-table', file, '', `"${name}" is not a situation file, so it would be ignored`, 'a <situation-id>.json file');
      continue;
    }
    const def = readJson(files, file, SituationSchema, sink);
    if (def === null) continue;
    if (name !== `${def.id}.json`) sink.error('situation-file-name', file, 'id', `the file holds situation "${def.id}"`, `the file named ${def.id}.json`);
    out.push({ file, def });
  }
  for (const folder of [...listOptional((p) => files.folders(p), SITUATIONS_DIR)].sort()) {
    if (folder !== 'drafts') sink.error('unknown-table', `${SITUATIONS_DIR}/${folder}`, '', `"${folder}/" is a folder the loader does not read`, 'situation files, and drafts/ for drafts the loader never reads');
  }
  return out;
}

/** The string key a reason id renders through, in explanations and the staff report (hard rule 6). */
export const reasonKey = (reason: string) => `reason.${reason}`;

/**
 * Every string key a situation shows, with its JSON path: its title, text,
 * labels and inaction text, and every reason it shows (effect reasons and the
 * staff line's stated reasons), which are player-facing too (gate review S2).
 */
export function stringKeysOf(def: SituationDef): { readonly key: string; readonly at: string }[] {
  const keys = [
    { key: def.title, at: 'title' },
    { key: def.text, at: 'text' },
  ];
  def.options.forEach((o, i) => keys.push({ key: o.label, at: `options[${i}].label` }));
  if (def.inaction !== null) keys.push({ key: def.inaction.text, at: 'inaction.text' });
  for (const { at, effect } of phase0.effectsOf(def)) if ('propose' in effect) keys.push({ key: reasonKey(effect.propose.reason), at: `${at}.propose.reason` });
  def.staffLine?.reasons.forEach((r, i) => keys.push({ key: reasonKey(r.kind), at: `staffLine.reasons[${i}].kind` }));
  return keys;
}

/** Whether a condition holds on an empty State and an empty knowledge, on the last day there is (gate B2). */
export function holdsOnNothing(c: Condition): boolean {
  return phase0.holds(c, { state: phase0.emptyState(), day: Number.MAX_SAFE_INTEGER, situation: null, knowledge: { knownReports: [] }, since: null });
}

function walk(c: Condition, visit: (c: Condition) => void): void {
  visit(c);
  if ('all' in c) c.all.forEach((x) => walk(x, visit));
  else if ('any' in c) c.any.forEach((x) => walk(x, visit));
  else if ('not' in c) walk(c.not, visit);
}

/** The semantic pass over a pack's situations: everything the schema cannot say. */
export function validateSituations(items: readonly { readonly file: string; readonly def: SituationDef }[], pack: PackData): Issue[] {
  const sink = new IssueSink();
  const factions = new Set(pack.manifest.factions.map((f) => f.id as string));
  const people = new Set(pack.world.people.map((p) => p.id as string));
  // Each person's surname as the text would name him (the last word of his name, less a generational suffix).
  // Read lazily: the default-locale strings resolve the names, and they are filled below.
  const surnames = () => pack.world.people.flatMap((p) => {
    const words = (defaultStrings.get(p.name) ?? p.name).replace(/[^A-Za-z .'-]/g, ' ').split(/\s+/).filter((w) => w !== '' && !/^(Jr|Sr|II|III)\.?$/.test(w));
    const last = words[words.length - 1];
    return last === undefined || last.length < 3 ? [] : [[p.id as string, last.replace(/[^A-Za-z'-]/g, '')] as const];
  });
  const regions = new Set(pack.world.regions.map((r) => r.id as string));
  const posts = new Set(pack.scenarios.flatMap((s) => s.posts.map((p) => p.id as string)));
  const forceBlocks = new Set(pack.scenarios.flatMap((s) => s.forceBlocks.map((b) => b.id as string)));
  // A post's side is its department's (null for a neutral government).
  const departmentSide = new Map(pack.world.departments.map((d) => [d.id as string, d.faction as string | null]));
  const postSide = new Map(pack.scenarios.flatMap((s) => s.posts.map((p) => [p.id as string, departmentSide.get(p.department) ?? null] as const)));
  const byId = new Map<string, SituationDef>();
  const defaultStrings = new Map<string, string>();
  for (const { table } of pack.strings.get(pack.manifest.defaultLocale) ?? []) for (const [k, v] of Object.entries(table)) defaultStrings.set(k, v);
  const flagsSet = new Set<string>();
  // Lane 1.6: the acts effects enter on the accountability ledger, and the politics records an effect may name.
  const ledgerActs = new Set<string>();
  for (const { def } of items) {
    for (const { effect } of phase0.effectsOf(def)) {
      if ('setFlag' in effect) flagsSet.add(effect.setFlag);
      if ('propose' in effect && effect.propose.owner === 'politics' && effect.propose.field === 'ledger-act' && effect.propose.subject !== null) ledgerActs.add(effect.propose.subject);
    }
  }
  const politics = pack.world.rules.politics;
  const chambers = new Set(politics.chambers.map((c) => c.id));
  const blocs = new Set(politics.blocs.map((b) => b.id));
  const sessions = new Set(politics.sessions.filter((s) => s.callable).map((s) => s.id));
  /** A proposal to `politics`, checked as the kernel would refuse it in play (`tick/politics.ts`). */
  const politicsProposal = (p: { readonly field: string; readonly subject: string | null; readonly side: string | null }, at: string, err: (kind: string, where: string, message: string, expected?: string) => void) => {
    const fields: readonly string[] = phase0.POLITICS_FIELDS;
    const reserved: readonly string[] = phase0.POLITICS_RESERVED_FIELDS;
    if (!fields.includes(p.field) && !reserved.includes(p.field)) return err('politics-field', `${at}.field`, `politics has no field "${p.field}"`, `one of ${[...fields, ...reserved].join(', ')}`);
    if (p.field === 'bloc-support' && (p.subject === null || !blocs.has(p.subject))) err('unknown-reference', `${at}.subject`, `"${p.subject}" is not a bloc in rules.politics.blocs`);
    if (p.field === 'session-call' && (p.subject === null || !sessions.has(p.subject))) err('unknown-reference', `${at}.subject`, `"${p.subject}" is not a callable session in rules.politics.sessions`);
    if ((p.field === 'ledger-act' || p.field === 'ledger-answer') && p.side === null) err('politics-side', `${at}.side`, 'a ledger act or answer names no side', "the side whose legislature it answers to");
    if (p.field === 'ledger-act' && p.subject === null) err('politics-act', `${at}.subject`, 'a ledger act names no act', 'an act id');
    if (p.field === 'framing' && p.subject === null && p.side === null) err('politics-side', `${at}.side`, 'framing names no side', 'a subject faction or a side');
  };
  for (const { file, def } of items) {
    if (byId.has(def.id)) sink.error('duplicate-id', file, 'id', `situation "${def.id}" is defined more than once`);
    byId.set(def.id, def);
  }
  // The proposals `command` owns (0058, 0065), checked here as the kernel would refuse them in play.
  const governmentKinds = new Set(pack.world.vocabularies.departmentKinds.filter((k) => k.government).map((k) => k.id as string));
  const departmentKind = new Map(pack.world.departments.map((d) => [d.id as string, d.kind as string]));
  const selfGoverningKinds = new Set(pack.world.vocabularies.departmentKinds.filter((k) => k.selfGoverning).map((k) => k.id as string));
  const raisingKinds = new Set<string>(pack.world.rules.recruitment.raisingPostKinds);
  const postRaising = new Map(
    pack.scenarios.flatMap((s) =>
      s.posts.map((p) => [p.id as string, selfGoverningKinds.has(departmentKind.get(p.department) ?? '') ? 'self-governing' : raisingKinds.has(p.kind) ? 'raising' : 'not-raising'] as const),
    ),
  );
  const temporaryPostIds = new Set(pack.scenarios.flatMap((s) => s.temporaryPosts.map((p) => p.id as string)));
  const declaredGovernmentIds = new Set(pack.scenarios.flatMap((s) => (s.declaredGovernments ?? []).map((g) => g.id as string)));
  type Err = (kind: string, at: string, message: string, expected?: string) => void;
  const commandProposal = (p: { readonly field: string; readonly subject: string | null; readonly delta: number; readonly side: string | null; readonly succession?: { readonly from: string; readonly to: string } }, at: string, err: Err, fromNotice: boolean) => {
    if (p.field === phase0.FACTION_CAPITAL_FIELD) {
      const region = pack.world.regions.find((r) => r.id === p.subject);
      if (region === undefined || !['land', 'key_point'].includes(region.kind)) err('situation-command-proposal', `${at}.subject`, 'a capital needs a land or key-point region');
      if (p.side === null || !factions.has(p.side)) err('situation-command-proposal', `${at}.side`, 'a capital move needs a faction');
      if (p.delta !== 0) err('situation-command-proposal', `${at}.delta`, 'a capital move uses delta 0; its subject names the destination');
      return;
    }
    if (p.field === phase0.POST_SUCCESSION_FIELD) {
      if (!fromNotice) err('situation-command-proposal', at, 'institutional succession must come from a notice, not a principal decision');
      if (p.subject === null || !posts.has(p.subject)) err('unknown-reference', `${at}.subject`, 'succession names no existing post');
      if (p.delta !== 1 || p.side !== null) err('situation-command-proposal', at, 'succession requires delta +1 and no side measure');
      if (p.succession === undefined || p.succession.from === p.succession.to) err('situation-command-proposal', `${at}.succession`, 'succession must name distinct incumbent and successor');
      for (const person of Object.values(p.succession ?? {})) if (!people.has(person)) err('unknown-reference', `${at}.succession`, `unknown person ${person}`);
      return;
    }
    // Lane 1.11: a government the start declares, established by an effect.
    if (p.field === phase0.GOVERNMENT_ESTABLISHED_FIELD) {
      if (p.subject === null || !declaredGovernmentIds.has(p.subject)) err('situation-command-proposal', `${at}.subject`, `"${p.subject ?? 'none'}" is not a government any start declares`, 'the id of a row in a start’s declared_governments.csv');
      if (p.delta !== 1) err('situation-command-proposal', `${at}.delta`, `establishing a government has delta ${p.delta}`, '+1: it establishes the government');
      // 0069, 0070: regions change government only by the act of those who form it, a notice, never a principal's choice.
      if (!fromNotice) err('self-governing-decision', `${at}.field`, 'a government is established from a decision option, inaction or a locked cost, which would let a principal move regions by choice', 'the effects of a notice only: those who form it act');
      return;
    }
    // Lane 1.11: a temporary post the start declares, opened by an effect (0040).
    if (p.field === phase0.TEMPORARY_POST_FIELD) {
      if (p.subject === null || !temporaryPostIds.has(p.subject)) err('situation-command-proposal', `${at}.subject`, `"${p.subject ?? 'none'}" is not a temporary post any start declares`, 'the id of a row in a start’s temporary_posts.csv');
      if (p.delta !== 1) err('situation-command-proposal', `${at}.delta`, `opening a temporary post has delta ${p.delta}`, '+1: it opens the post');
      return;
    }
    const closing = p.field === phase0.GOVERNMENT_CLOSED_FIELD;
    if (!closing && p.field !== phase0.DEPARTMENT_SIDE_FIELD) {
      err('situation-command-proposal', `${at}.field`, `command owns no field "${p.field}"`, `"${phase0.GOVERNMENT_CLOSED_FIELD}" (a neutral government closes or reopens), "${phase0.DEPARTMENT_SIDE_FIELD}" (a government joins a side) or "${phase0.TEMPORARY_POST_FIELD}" (a declared temporary post opens)`);
      return;
    }
    if (p.subject === null) err('situation-command-proposal', `${at}.subject`, `a "${p.field}" proposal names no department`, 'a government department id');
    else if (!departmentKind.has(p.subject)) err('unknown-reference', `${at}.subject`, `"${p.subject}" is not a department`, 'a government department id');
    else if (!governmentKinds.has(departmentKind.get(p.subject)!)) err('not-a-government', `${at}.subject`, `department "${p.subject}" is not a government; only a government ${closing ? 'closes its territory' : 'changes side'}`, 'a department whose kind the pack marks a government');
    // 0069: a people who govern themselves are moved only by their own act, a notice, never by a principal's choice.
    if (p.subject !== null && !fromNotice && selfGoverningKinds.has(departmentKind.get(p.subject) ?? '')) {
      err('self-governing-decision', `${at}.subject`, `"${p.subject}" governs itself, and a ${closing ? 'closing' : 'change of side'} proposed from a decision option, inaction or a locked cost would let a principal move it by choice`, 'the effects of a notice only: the nation itself acts (0069)');
    }
    if (closing) {
      if (p.delta !== 1 && p.delta !== -1) err('situation-command-proposal', `${at}.delta`, `a closing's delta is ${p.delta}`, '+1 to close, -1 to reopen');
    } else {
      if (p.side === null) err('situation-command-proposal', `${at}.side`, 'a change of side names no side to join', 'the faction the government joins');
      if (p.delta !== 1) err('situation-command-proposal', `${at}.delta`, `a change of side's delta is ${p.delta}`, '+1: it joins the side it names; no proposal takes a side away');
    }
  };

  for (const { file, def } of items) {
    const err = (kind: string, at: string, message: string, expected?: string) => sink.error(kind, file, at, message, expected);
    const ref = (set: ReadonlySet<string>, what: string, value: string, at: string) => {
      if (!set.has(value)) err('unknown-reference', at, `"${value}" is not a ${what}`, `a ${what} id defined in the pack`);
    };
    ref(factions, 'faction', def.faction, 'faction');
    // Standing review S6 (0050: sides are checked wherever two records meet): every post a situation names is its side's.
    const ownSide = (p: string, at: string) => {
      if (postSide.has(p) && postSide.get(p) !== def.faction) err('situation-side', at, `"${p}" is ${postSide.get(p) ?? 'a neutral government'}'s post, not ${def.faction}'s`, "a post of the situation's own side: the other side neither decides, advises nor reports for it");
    };
    def.delegableTo.forEach((p, i) => ownSide(p, `delegableTo[${i}]`));
    def.staffLine?.authors.forEach((p, i) => ownSide(p, `staffLine.authors[${i}]`));
    def.report?.authors.forEach((p, i) => ownSide(p, `report.authors[${i}]`));
    def.options.forEach((o, i) => o.orders.forEach((order, j) => ownSide(order.to, `options[${i}].orders[${j}].to`)));
    // A call may go to a neutral government's governor too (a requisition he answers by his own compliance), never the other side's.
    def.options.forEach((o, i) =>
      o.calls.forEach((call, j) => {
        if (postSide.has(call.to) && postSide.get(call.to) !== null && postSide.get(call.to) !== def.faction) err('situation-side', `options[${i}].calls[${j}].to`, `\"${call.to}\" is ${postSide.get(call.to)}'s post, not ${def.faction}'s`, 'a governor of the calling side or of a neutral government');
      }),
    );
    def.subjects.forEach((p, i) => ref(people, 'person', p, `subjects[${i}]`));
    def.delegableTo.forEach((p, i) => ref(posts, 'post in any scenario', p, `delegableTo[${i}]`));
    const optionIds = def.options.map((o) => o.id);

    // B1: the fields each kind needs.
    if (def.kind === 'decision') {
      if (def.options.length === 0) err('situation-missing', 'options', 'a decision has no options', 'at least one option (0040)');
      if (def.inaction === null) err('situation-missing', 'inaction', 'a decision has no inaction outcome', 'an inaction outcome, costed like the options (0040; gate Q2)');
      if (def.historicalDefault === null) err('situation-missing', 'historicalDefault', 'a decision has no historical default', 'options, a delegation, or unsourced with a reason (0040)');
      // B9 (the lead's S12 ruling): where every option rests on the principal's own initiative, no staff line may recommend it.
      const allInitiative = def.options.length > 0 && def.options.every((o) => phase0.isProposalBasis(o.proposedBy) && o.proposedBy.basis === 'principal-initiative');
      if (def.staffLine !== null && def.staffAbsence !== undefined) err('situation-staff-line', 'staffAbsence', 'a decision has both a staff line and a declared absence of one', 'one or the other');
      if (def.staffLine === null && !allInitiative && def.staffAbsence === undefined) err('situation-missing', 'staffLine', 'a decision has no staff recommendation', 'an advice line by an ordered list of author posts (0040, 0046)');
    } else {
      for (const field of ['options', 'inaction', 'historicalDefault', 'staffLine'] as const) {
        const v = def[field];
        if (v !== null && !(Array.isArray(v) && v.length === 0)) err('situation-notice-field', field, 'a notice carries no options, inaction, historical default or staff line', 'text, sources and effects only (0046)');
      }
    }
    if (def.kind === 'decision' && def.effects.length > 0) err('situation-decision-effects', 'effects', 'a decision has effects of its own', "effects on its options, its locked costs or its inaction outcome");
    // F1 (review S10): a notice reaches the principal as a report with an author and a route.
    if (def.kind === 'notice' && def.report === null) err('situation-missing', 'report', 'a notice has no report', 'a report with author posts and a report type, so the notice has an author and a route (gate F1)');
    // B9 (the lead's S12 ruling): a decision whose every option rests on the principal's own initiative has no staff line, so it is told by a plain report.
    const initiativeOnly = def.kind === 'decision' && def.options.length > 0 && def.options.every((o) => phase0.isProposalBasis(o.proposedBy) && o.proposedBy.basis === 'principal-initiative');
    if (def.kind === 'decision' && def.staffAbsence !== undefined && def.report === null) err('situation-missing', 'report', 'a decision with no staff line has no report', 'a plain report (gate F1)');
    if (def.kind === 'decision' && def.report !== null && !initiativeOnly && def.staffAbsence === undefined) err('situation-decision-report', 'report', 'a decision has a notice report', 'none: a decision is told through its staff line (only a decision resting wholly on the principal’s own initiative is told by a plain report)');
    if (initiativeOnly && def.staffLine !== null) err('situation-staff-line', 'staffLine', 'a decision resting on the principal’s own initiative has a staff line', 'none (B9): no staff line recommends what the president himself considered; tell it by a plain report');
    if (initiativeOnly && def.report === null) err('situation-missing', 'report', 'a decision resting on the principal’s own initiative has neither staff line nor report', 'a plain report (gate F1)');
    if (def.report !== null) {
      def.report.authors.forEach((p, i) => ref(posts, 'post in any scenario', p, `report.authors[${i}]`));
      const probe = { reportType: def.report.reportType, reportSubtype: def.report.subtype, reportAuthor: def.faction as never, reportAuthorPost: null, reportSubjectKind: 'situation' as const, reportSubjectId: def.id, reportClaims: [], reportDay: 1, reportHour: null, reportAdvice: null, reportAnswers: null };
      for (const problem of phase0.reportProblems(probe)) err('situation-report', 'report', problem, 'a report type and subtype the kernel can carry');
      // The pack's own templates (0072), never a kernel default.
      if (!pack.world.rules.reportTemplates.some((x) => x.templateType === def.report!.reportType && x.templateSubtype === def.report!.subtype)) err('situation-report', 'report', `no report template for ${def.report.reportType}${def.report.subtype === null ? '' : '/' + def.report.subtype}`, 'a report type and subtype with a template in the pack’s rules.reportTemplates');
    }

    // B2: a cause in State, not a date alone, unless a labelled railroad. Evaluated, not parsed (review S6): a cause that
    // would hold with nothing in State but a far date is a date or vacuous, however it is written (a date inside `any`, a bare `not`).
    if (holdsOnNothing(def.event) && def.railroad === null) err('situation-date-cause', 'event', 'the cause holds with nothing in State but the date', 'a cause in State, or a labelled railroad (0028, 0040; gate B2)');

    // 0041: options in a fixed display order, by a neutral key.
    const keys = def.options.map((o) => o.displayKey);
    if (new Set(keys).size !== keys.length) err('situation-display-order', 'options', 'two options share a display key', 'each option its own displayKey');
    if (keys.some((k, i) => i > 0 && k <= keys[i - 1]!)) err('situation-display-order', 'options', 'options are not listed in display-key order', 'options in ascending displayKey (0041: a fixed order unrelated to the default)');
    if (new Set(optionIds).size !== optionIds.length) err('duplicate-id', 'options', 'two options share an id');

    // The historical default and the staff line refer to real options.
    const hd = def.historicalDefault;
    if (hd !== null && 'options' in hd) {
      hd.options.forEach((o, i) => {
        if (!optionIds.includes(o)) err('unknown-reference', `historicalDefault.options[${i}]`, `"${o}" is not an option of this situation`);
      });
      const groups = hd.options.map((o) => def.options.find((x) => x.id === o)?.group ?? null);
      if (hd.options.length > 1 && (groups.some((g) => g === null) || new Set(groups).size !== groups.length)) {
        err('situation-selection', 'historicalDefault.options', 'the default takes options that cannot be taken together', 'at most one option per group, and grouped options only');
      }
    }
    if (hd !== null && 'delegate' in hd && !def.delegableTo.includes(hd.delegate)) err('unknown-reference', 'historicalDefault.delegate', `"${hd.delegate}" is not among delegableTo`);
    def.staffLine?.authors.forEach((p, i) => ref(posts, 'post in any scenario', p, `staffLine.authors[${i}]`));
    def.staffLine?.recommends.forEach((o, i) => {
      if (!optionIds.includes(o)) err('unknown-reference', `staffLine.recommends[${i}]`, `"${o}" is not an option of this situation`);
    });

    def.options.forEach((o, i) => {
      if (Array.isArray(o.proposedBy)) (o.proposedBy as readonly string[]).forEach((p, j) => ref(people, 'person', p, `options[${i}].proposedBy[${j}]`));
      o.orders.forEach((order, j) => {
        const at = `options[${i}].orders[${j}]`;
        ref(posts, 'post in any scenario', order.to, `${at}.to`);
        if (order.objective !== null) ref(regions, 'region', order.objective, `${at}.objective`);
        if (!phase0.ORDER_ROUTES.includes(order.route)) err('situation-route', `${at}.route`, `"${order.route}" is not a route a principal orders by`, `one of ${phase0.ORDER_ROUTES.join(', ')} (0052)`);
        if (order.posture !== 'hold' && order.objective === null) err('situation-order', at, `a ${order.posture} order names no objective`, 'only a hold may name none: it holds where he stands');
      });
      o.calls.forEach((call, j) => {
        const at = `options[${i}].calls[${j}]`;
        ref(posts, 'post in any scenario', call.to, `${at}.to`);
        // The lead's ruling: a call goes to a state government's raising post, of the calling side or neutral, never to a
        // people who govern themselves (0069, 0070; SENSITIVE-HISTORY 3.7: no seat recruits a nation). The kernel refuses it
        // as `not_raising_post`; the pack refuses it here first.
        const raising = postRaising.get(call.to);
        if (raising === 'self-governing') err('self-governing-call', `${at}.to`, `"${call.to}" belongs to a people who govern themselves; no principal calls on a nation for regiments`, 'a state governor’s post (0069, 0070)');
        else if (raising === 'not-raising') err('situation-call', `${at}.to`, `"${call.to}" is not a post that raises regiments`, `a post of a kind in rules.recruitment.raisingPostKinds`);
        if (!phase0.ORDER_ROUTES.includes(call.route)) err('situation-route', `${at}.route`, `\"${call.route}\" is not a route a principal orders by`, `one of ${phase0.ORDER_ROUTES.join(', ')} (0052)`);
        if (call.termDays > pack.world.rules.recruitment.maxTermDays) err('situation-call', `${at}.termDays`, `a term of ${call.termDays} days is longer than the pack allows`, `at most ${pack.world.rules.recruitment.maxTermDays} days (rules.recruitment.maxTermDays)`);
      });
    });

    // Chains.
    if (def.chain !== null && def.chain.follows !== null) {
      const parent = byId.get(def.chain.follows.situation);
      if (parent === undefined) err('unknown-reference', 'chain.follows.situation', `"${def.chain.follows.situation}" is not a situation`);
      else {
        if (parent.chain === null || parent.chain.id !== def.chain.id || parent.chain.stage >= def.chain.stage) {
          err('situation-chain', 'chain.follows', `"${parent.id}" is not an earlier stage of chain "${def.chain.id}"`, 'a situation of the same chain with a lower stage');
        }
        (def.chain.follows.options ?? []).forEach((o, i) => {
          if (!parent.options.some((x) => x.id === o)) err('unknown-reference', `chain.follows.options[${i}]`, `"${o}" is not an option of ${parent.id}`);
        });
      }
    }

    // The lead's ruling on the gate review's S10: an option's appear, expire and wait conditions follow what the
    // principal knows, never State, like the situation's own knowledge trigger (0046). A change in the options must
    // never tell him of an event before a report does. Standing review S2, as the lead ruled: the knowledge trigger and
    // the waits likewise, each place from its own allow-list (knows; the clock in waits and options; dates in options).
    const knowable = (c: Condition, at: string, place: phase0.KnowablePlace, kind: string) => {
      const bad = phase0.unknowableRead(c, place);
      if (bad !== null) err(kind, at, `"${bad}" is not something the principal can know here`, `only ${phase0.KNOWABLE[place].join(', ')}, under all, any and not`);
    };
    if (def.knowledge !== null) knowable(def.knowledge, 'knowledge', 'knowledge', 'situation-knowledge-truth');
    def.options.forEach((o, i) => {
      for (const key of ['appearsWhen', 'expiresWhen', 'waitsOn'] as const) {
        const c = o[key];
        if (c !== null) knowable(c, `options[${i}].${key}`, key, 'situation-option-truth');
      }
    });
    // Conditions.
    for (const { at, condition } of phase0.conditionsOf(def)) {
      walk(condition, (c) => {
        if ('clockAtLeast' in c && (at === 'event' || at === 'knowledge')) err('situation-clock', at, 'the clock is read before it starts', 'clockAtLeast only in an option condition: the clock starts when the situation surfaces');
        if ('fired' in c || 'decided' in c) {
          const id = 'fired' in c ? c.fired : c.decided;
          const other = byId.get(id);
          if (other === undefined) err('unknown-reference', at, `"${id}" is not a situation`);
          else if ('decided' in c) for (const o of c.options ?? []) if (!other.options.some((x) => x.id === o)) err('unknown-reference', at, `"${o}" is not an option of ${id}`);
        }
        if ('goal' in c) ref(posts, 'post in any scenario', c.goal.post, at);
        if ('renewableEnlistment' in c) {
          const r = c.renewableEnlistment;
          ref(posts, 'post in any scenario', r.post, at);
          if (at !== 'event' || def.kind !== 'notice') err('situation-renewal', at, 'renewal eligibility is event-only for an autonomous notice');
          if (!historicalDate.safeParse(r.musteredBy).success) err('situation-renewal', at, 'invalid original muster cutoff');
          if (!pack.world.vocabularies.arms.some(a => a.id === r.arm && !a.naval) || r.termDays <= r.fromTermDays || r.termDays > pack.world.rules.recruitment.maxTermDays) err('situation-renewal', at, 'renewal eligibility requires a land arm and a longer valid term');
        }
        if ('callReceived' in c) ref(posts, 'post in any scenario', c.callReceived.post, at);
        if ('headquartersAt' in c) {
          ref(posts, 'post in any scenario', c.headquartersAt.post, at);
          ref(regions, 'region', c.headquartersAt.region, at);
        }
        if ('chamber' in c) ref(chambers, 'chamber', c.chamber.id, at);
        if ('ledger' in c) {
          ref(factions, 'faction', c.ledger.side, at);
          if (c.ledger.act !== null && !ledgerActs.has(c.ledger.act)) err('unknown-reference', at, `no effect in the pack enters act "${c.ledger.act}" on the ledger`);
        }
        if ('flag' in c && !flagsSet.has(c.flag)) sink.warn('situation-flag-unset', file, at, `flag "${c.flag}" is read but no effect in the pack sets it`);
      });
    }
    for (const { at, effect } of phase0.effectsOf(def)) {
      if ('propose' in effect && (effect.propose.stateForces !== undefined || (effect.propose.owner === 'recruitment' && effect.propose.field !== 'renew_enlistment'))) {
        const p = effect.propose;
        const entry = p.stateForces;
        const fail = (message: string) => err('situation-state-forces', `${at}.propose`, message);
        if (p.owner !== 'recruitment' || p.field !== 'state_forces' || entry === undefined) fail('stateForces belongs only to recruitment.state_forces');
        if (def.kind !== 'notice') fail('state forces enter service only through their state’s own notice');
        if (p.delta !== 1 || p.side !== def.faction) fail('state forces require delta +1 and the notice faction');
        if (p.subject === null || postRaising.get(p.subject) !== 'raising') fail('state forces require a raising state post, never a self-governing nation');
        if (p.subject !== null && postSide.has(p.subject) && postSide.get(p.subject) !== null && postSide.get(p.subject) !== p.side) fail('state forces cannot enter another side’s service');
        if (entry !== undefined) {
          if (!pack.world.vocabularies.arms.some(a => a.id === entry.arm && !a.naval)) fail('state forces require a land arm from the pack vocabulary');
          if (entry.termDays !== null && entry.termDays > pack.world.rules.recruitment.maxTermDays) fail('term exceeds the pack maximum');
          if (entry.termUnknown === true && entry.termDays !== null) fail('an unknown original expiry cannot also have a fixed term');
          for (const id of entry.includesCalls ?? []) {
            const prior = pack.world.rules.ruleSeats.principals.flatMap(p => p.calls).find(c => c.id === id);
            if (prior === undefined || prior.post !== p.subject || (prior.arm ?? pack.world.rules.recruitment.arm) !== entry.arm) fail('an included call must name a pack requisition for the same post and arm');
          }
        }
      }
      if ('propose' in effect && (effect.propose.renewal !== undefined || (effect.propose.owner === 'recruitment' && effect.propose.field === 'renew_enlistment'))) {
        const p = effect.propose;
        const r = p.renewal;
        const fail = (message: string) => err('situation-renewal', `${at}.propose`, message);
        if (p.owner !== 'recruitment' || p.field !== 'renew_enlistment' || r === undefined) fail('renewal belongs only to recruitment.renew_enlistment');
        if (def.kind !== 'notice') fail('voluntary remuster is notice-only');
        if (p.delta !== 1 || p.side !== def.faction || p.subject !== r?.post || postRaising.get(p.subject ?? '') !== 'raising') fail('renewal requires its own raising post and notice side, delta +1');
        if (p.subject !== null && postSide.get(p.subject) !== p.side) fail('renewal cannot target another side or a neutral government');
        if (r !== undefined) {
          if (!pack.world.vocabularies.arms.some(a => a.id === r.arm && !a.naval) || r.termDays <= r.fromTermDays || r.termDays > pack.world.rules.recruitment.maxTermDays) fail('renewal requires a land arm and a longer term within the pack maximum');
          let guarded = false;
          walk(def.event, c => { if ('renewableEnlistment' in c && JSON.stringify(c.renewableEnlistment) === JSON.stringify(r)) guarded = true; });
          // A nested disjunction or negation would not require eligibility. Require it in an all-only path.
          const required = (c: Condition): boolean => 'renewableEnlistment' in c ? JSON.stringify(c.renewableEnlistment) === JSON.stringify(r) : 'all' in c && c.all.some(required);
          if (!guarded || !required(def.event)) fail('renewal notice must require the identical qualifying enlistment in its event');
        }
      }
      if ('propose' in effect && effect.propose.succession !== undefined && (effect.propose.owner !== 'command' || effect.propose.field !== phase0.POST_SUCCESSION_FIELD)) err('situation-command-proposal', `${at}.propose.succession`, 'a succession payload belongs only to command.post_succession');
      if ('propose' in effect && effect.propose.side !== null) ref(factions, 'faction', effect.propose.side, `${at}.propose.side`);
      if ('propose' in effect && effect.propose.owner === 'command') commandProposal(effect.propose, `${at}.propose`, err, def.kind === 'notice');
      if ('propose' in effect && effect.propose.owner === 'politics') politicsProposal(effect.propose, `${at}.propose`, err);
      // Lane 1.11: a landing names a start's force block and a region; forces checks the rest in play (aboard, adjacent).
      if ('landing' in effect) {
        ref(forceBlocks, 'force block in any scenario', effect.landing.parent, `${at}.landing.parent`);
        ref(regions, 'region', effect.landing.region, `${at}.landing.region`);
      }
    }

    // The post-holder check (lane 1.11, the lead's rule; rule 7): a notice whose text names a person of the World must
    // say whose words or acts it gives (speakers, each in the post he must hold) or why it only names him (namedOnly).
    (def.speakers ?? []).forEach((s, j) => {
      ref(people, 'person', s.person, `speakers[${j}].person`);
      if (s.post !== null && !temporaryPostIds.has(s.post)) ref(posts, 'post in any scenario', s.post, `speakers[${j}].post`);
    });
    if (def.kind === 'notice' && def.namedOnly === undefined) {
      const text = defaultStrings.get(def.text) ?? '';
      const declared = new Set((def.speakers ?? []).map((s) => s.person as string));
      for (const [person, surname] of surnames()) {
        // A place named for a man (a fort or a camp) names no man.
        if (declared.has(person) || !new RegExp(`(?<!\\b(?:Fort|Camp) )\\b${surname}\\b`).test(text)) continue;
        err('post-holder-check', 'speakers', `the text names ${surname} (${person}) but neither lists him in speakers nor says why it only names him`, 'speakers: [{ post, person }] when the text quotes him or gives an act of his as a holder of a post (it then fires only while he holds it); namedOnly: "<why>" when it names him without giving his words or acts (a treaty’s signers, an appointment as the record states it)');
      }
    }

    // String keys, in the default locale. (Every message in the table is parsed as ICU by the World validator.)
    for (const { key, at } of stringKeysOf(def)) {
      if (!defaultStrings.has(key)) err('missing-string', at, `string key "${key}" has no text in the default locale`, `an entry in strings/${pack.manifest.defaultLocale}.json`);
    }
  }
  return sink.issues;
}
