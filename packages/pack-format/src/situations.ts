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
import { readJson, type PackFiles } from './generate.ts';
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

const knows = z.strictObject({
  reportType: z.enum(phase0.REPORT_TYPES).nullable().default(null),
  subtype: z.string().min(1).nullable().default(null),
  subjectKind: z.enum(phase0.SUBJECT_KINDS).nullable().default(null),
  subjectId: z.string().min(1).nullable().default(null),
  claimKind: z.enum(phase0.CLAIM_KINDS).nullable().default(null),
  token: z.string().min(1).nullable().default(null),
});

/** A condition: one key names the predicate (all, any, not, dayAtLeast, flag, fired, decided, knows, goal, headquartersAt, clockAtLeast). */
export const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.strictObject({ all: z.array(ConditionSchema).min(1, 'at least one condition') }),
    z.strictObject({ any: z.array(ConditionSchema).min(1, 'at least one condition') }),
    z.strictObject({ not: ConditionSchema }),
    z.strictObject({ dayAtLeast: positive }),
    z.strictObject({ flag: termId }),
    z.strictObject({ fired: idOf('situation') }),
    z.strictObject({ decided: idOf('situation'), options: z.array(termId).min(1).nullable().default(null) }),
    z.strictObject({ knows }),
    z.strictObject({ goal: z.strictObject({ post: idOf('post'), kind: z.enum(phase0.GOAL_KINDS) }) }),
    z.strictObject({ headquartersAt: z.strictObject({ post: idOf('post'), region: idOf('region') }) }),
    z.strictObject({ clockAtLeast: nonNegative }),
  ]),
);

export const EffectSchema = z.union([
  z.strictObject({ setFlag: termId }),
  z.strictObject({ clearFlag: termId }),
  z.strictObject({
    propose: z.strictObject({
      owner: termId,
      field: termId,
      subject: z.string().min(1).nullable().default(null),
      delta: int,
      reason: termId,
      side: idOf('faction').nullable().default(null),
    }),
  }),
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
});

const conditionOrNull = ConditionSchema.nullable().default(null);

export const OptionSchema = z.strictObject({
  id: termId,
  label: stringKey,
  displayKey: positive,
  proposedBy: z.union([z.array(idOf('person')).min(1, 'the holders who argued for it (gate C1)'), z.literal('inaction')]),
  group: termId.nullable().default(null),
  appearsWhen: conditionOrNull,
  expiresWhen: conditionOrNull,
  waitsOn: conditionOrNull,
  effects: z.array(EffectSchema).default([]),
  lockedCosts: z.array(EffectSchema).default([]),
  orders: z
    .array(z.strictObject({ to: idOf('post'), goal: z.enum(phase0.GOAL_KINDS), region: idOf('region').nullable().default(null), route: z.enum(phase0.ROUTE_KINDS) }))
    .default([]),
  honours: z.array(termId).default([]),
  watched: z.boolean().default(false),
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
  inaction: z.strictObject({ text: stringKey, effects: z.array(EffectSchema).default([]) }).nullable().default(null),
  historicalDefault: z
    .union([z.strictObject({ options: z.array(termId).min(1) }), z.strictObject({ delegate: idOf('post') }), z.strictObject({ unsourced: z.string().min(1) })])
    .nullable()
    .default(null),
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
  for (const name of [...files.files(SITUATIONS_DIR)].sort()) {
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
  for (const folder of [...files.folders(SITUATIONS_DIR)].sort()) {
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
  return phase0.holds(c, { state: phase0.emptyState(), day: Number.MAX_SAFE_INTEGER, situation: null, knowledge: { knownReports: [] } });
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
  const regions = new Set(pack.world.regions.map((r) => r.id as string));
  const posts = new Set(pack.scenarios.flatMap((s) => s.posts.map((p) => p.id as string)));
  const byId = new Map<string, SituationDef>();
  const defaultStrings = new Map<string, string>();
  for (const { table } of pack.strings.get(pack.manifest.defaultLocale) ?? []) for (const [k, v] of Object.entries(table)) defaultStrings.set(k, v);
  const flagsSet = new Set<string>();
  for (const { def } of items) {
    for (const { effect } of phase0.effectsOf(def)) if ('setFlag' in effect) flagsSet.add(effect.setFlag);
  }
  for (const { file, def } of items) {
    if (byId.has(def.id)) sink.error('duplicate-id', file, 'id', `situation "${def.id}" is defined more than once`);
    byId.set(def.id, def);
  }

  for (const { file, def } of items) {
    const err = (kind: string, at: string, message: string, expected?: string) => sink.error(kind, file, at, message, expected);
    const ref = (set: ReadonlySet<string>, what: string, value: string, at: string) => {
      if (!set.has(value)) err('unknown-reference', at, `"${value}" is not a ${what}`, `a ${what} id defined in the pack`);
    };
    ref(factions, 'faction', def.faction, 'faction');
    def.subjects.forEach((p, i) => ref(people, 'person', p, `subjects[${i}]`));
    def.delegableTo.forEach((p, i) => ref(posts, 'post in any scenario', p, `delegableTo[${i}]`));
    const optionIds = def.options.map((o) => o.id);

    // B1: the fields each kind needs.
    if (def.kind === 'decision') {
      if (def.options.length === 0) err('situation-missing', 'options', 'a decision has no options', 'at least one option (0040)');
      if (def.inaction === null) err('situation-missing', 'inaction', 'a decision has no inaction outcome', 'an inaction outcome, costed like the options (0040; gate Q2)');
      if (def.historicalDefault === null) err('situation-missing', 'historicalDefault', 'a decision has no historical default', 'options, a delegation, or unsourced with a reason (0040)');
      if (def.staffLine === null) err('situation-missing', 'staffLine', 'a decision has no staff recommendation', 'an advice line by an ordered list of author posts (0040, 0046)');
    } else {
      for (const field of ['options', 'inaction', 'historicalDefault', 'staffLine'] as const) {
        const v = def[field];
        if (v !== null && !(Array.isArray(v) && v.length === 0)) err('situation-notice-field', field, 'a notice carries no options, inaction, historical default or staff line', 'text, sources and effects only (0046)');
      }
    }
    if (def.kind === 'decision' && def.effects.length > 0) err('situation-decision-effects', 'effects', 'a decision has effects of its own', "effects on its options, its locked costs or its inaction outcome");

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
      if (o.proposedBy !== 'inaction') o.proposedBy.forEach((p, j) => ref(people, 'person', p, `options[${i}].proposedBy[${j}]`));
      o.orders.forEach((order, j) => {
        const at = `options[${i}].orders[${j}]`;
        ref(posts, 'post in any scenario', order.to, `${at}.to`);
        if (order.region !== null) ref(regions, 'region', order.region, `${at}.region`);
        if (!phase0.ORDER_ROUTES.includes(order.route)) err('situation-route', `${at}.route`, `"${order.route}" is not a route a principal orders by`, `one of ${phase0.ORDER_ROUTES.join(', ')} (0052)`);
        if ((order.goal === 'advance') !== (order.region !== null)) err('situation-order', at, 'an advance needs a region, and a hold names none');
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

    // Conditions.
    for (const { at, condition } of phase0.conditionsOf(def)) {
      walk(condition, (c) => {
        if ('clockAtLeast' in c && (at === 'event' || at === 'knowledge')) err('situation-clock', at, 'the clock is read before it starts', 'clockAtLeast only in an option condition: the clock starts when the event holds');
        if ('fired' in c || 'decided' in c) {
          const id = 'fired' in c ? c.fired : c.decided;
          const other = byId.get(id);
          if (other === undefined) err('unknown-reference', at, `"${id}" is not a situation`);
          else if ('decided' in c) for (const o of c.options ?? []) if (!other.options.some((x) => x.id === o)) err('unknown-reference', at, `"${o}" is not an option of ${id}`);
        }
        if ('goal' in c) ref(posts, 'post in any scenario', c.goal.post, at);
        if ('headquartersAt' in c) {
          ref(posts, 'post in any scenario', c.headquartersAt.post, at);
          ref(regions, 'region', c.headquartersAt.region, at);
        }
        if ('flag' in c && !flagsSet.has(c.flag)) sink.warn('situation-flag-unset', file, at, `flag "${c.flag}" is read but no effect in the pack sets it`);
      });
    }
    for (const { at, effect } of phase0.effectsOf(def)) {
      if ('propose' in effect && effect.propose.side !== null) ref(factions, 'faction', effect.propose.side, `${at}.propose.side`);
    }

    // String keys, in the default locale. (Every message in the table is parsed as ICU by the World validator.)
    for (const { key, at } of stringKeysOf(def)) {
      if (!defaultStrings.has(key)) err('missing-string', at, `string key "${key}" has no text in the default locale`, `an entry in strings/${pack.manifest.defaultLocale}.json`);
    }
  }
  return sink.issues;
}
