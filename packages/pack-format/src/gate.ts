/**
 * The sensitive-history gate, mechanised (decision 0021, amended by 0026;
 * 0046; `docs/design/SENSITIVE-HISTORY.md` sections 1, 2.2 and 5).
 *
 * The engine holds the mechanism; the pack holds every word (hard rule 3,
 * 0024). A pack with situations carries `gate/`:
 *
 *     register.json        topics: class, window, allowed placements, interim placement, status,
 *                          protected fields and groups, superseded options, refused signatures
 *     classes.json         topic classes with their two flags: atrocity, requiresAgencyReason
 *     triggers.json        terms whose presence needs a gate tag (A1), with a proper-noun allowlist
 *     forbidden.json       patterns by scope and severity, and the proximity rule's resource words (C4, F2, F5)
 *     anachronisms.json    terms with the earliest date they may appear (C3, F6)
 *     source-policy.json   sources banned as evidence, and weak ones never cited alone (A6)
 *     checklist.json       each question's id, version, kind and the item types it applies to (A7)
 *     release.json         the scenarios a release ships, with their windows (A8, the ship rule)
 *
 * Every check reports an `Issue` at the situation file and path. Which
 * questions are tests here, and which wait for an artefact type that does
 * not exist yet, is listed in `GATE_QUESTIONS_TESTED` and in the lane note.
 */
import { canonicalHash, phase0 } from '@mandate/kernel';
import { z } from 'zod';
import { readJson, type PackFiles } from './generate.ts';
import { type Issue, IssueSink } from './issues.ts';
import { historicalDate, termId, type ProvenanceFile } from './schemas.ts';
import { stringKeysOf } from './situations.ts';

type SituationDef = phase0.SituationDef;
type Placement = phase0.Placement;

export const GATE_DIR = 'gate';
export const gateFile = (name: string) => `${GATE_DIR}/${name}`;

const date = historicalDate;
const regex = z.string().refine((s) => {
  try {
    new RegExp(s, 'u');
    return true;
  } catch {
    return false;
  }
}, 'a valid regular expression');

export const TopicSchema = z.strictObject({
  id: termId,
  class: termId,
  window: z.strictObject({ from: date, to: date.nullable().default(null) }),
  placements: z.array(z.enum(phase0.PLACEMENTS)).min(1),
  /** A held topic may allow cited text-only items, and nothing else (section 1). */
  interim: z.literal('text').nullable().default(null),
  status: z.enum(['open', 'record']),
  /** On the whole topic, needs-source holds it like `record` (section 1); facet flags live in prose and block nothing. */
  needsSource: z.boolean().default(false),
  /** Fields no option, notice or effect may target (B3, D3, E2): only derivations read them. */
  protectedFields: z.array(termId).default([]),
  /** Terms naming a protected group, for the proximity rule (F2). */
  protectedGroups: z.array(z.string().min(1)).default([]),
  agencyReasons: z.array(termId).default([]),
  /** Options a later law forbids: each must expire when the principal learns of the law, the situation that enacts it (B10). */
  supersededOptions: z.array(z.strictObject({ situation: termId, option: termId, law: termId })).default([]),
  /** Refused facets as machine signatures: an effect field matching `fieldPattern` (or an option id matching `optionPattern`) is refused. */
  refused: z.array(z.strictObject({ fieldPattern: regex.nullable().default(null), optionPattern: regex.nullable().default(null), reason: z.string().min(1) })).default([]),
});
export const RegisterSchema = z.strictObject({ topics: z.array(TopicSchema) });
export const ClassesSchema = z.strictObject({ classes: z.array(z.strictObject({ id: termId, atrocity: z.boolean(), requiresAgencyReason: z.boolean() })) });
export const TriggersSchema = z.strictObject({
  terms: z.array(z.strictObject({ term: regex, caseSensitive: z.boolean().default(false) })),
  /** Proper nouns that contain a trigger term but are not about a gated topic (section 5). */
  allow: z.array(z.string().min(1)).default([]),
});
export const ForbiddenSchema = z.strictObject({
  patterns: z.array(z.strictObject({ pattern: regex, scope: z.enum(['any', 'label', 'narrator']), severity: z.enum(['fail', 'review']), reason: z.string().min(1) })),
  resourceWords: z.array(z.string().min(1)).default([]),
  proximityTokens: z.int().min(1).default(5),
});
export const AnachronismsSchema = z.strictObject({ terms: z.array(z.strictObject({ term: z.string().min(1), earliest: date, source: z.string().min(1) })) });
export const SourcePolicySchema = z.strictObject({ banned: z.array(z.string().min(1)).default([]), weak: z.array(z.string().min(1)).default([]) });
export const ChecklistSchema = z.strictObject({
  questions: z.array(
    z.strictObject({
      id: z.string().regex(/^[A-HQ][0-9]+$/),
      version: z.int().min(1),
      kind: z.enum(['field', 'tag', 'pattern', 'graph', 'arch', 'hash', 'run', 'reader']),
      appliesTo: z.array(z.enum(['situation', 'option', 'string', 'derived', 'lever', 'setup', 'verdict'])).min(1),
    }),
  ),
});
export const ReleaseSchema = z.strictObject({ scenarios: z.array(z.strictObject({ scenario: termId, from: date, to: date })) });

export interface GateData {
  readonly register: z.output<typeof RegisterSchema>;
  readonly classes: z.output<typeof ClassesSchema>;
  readonly triggers: z.output<typeof TriggersSchema>;
  readonly forbidden: z.output<typeof ForbiddenSchema>;
  readonly anachronisms: z.output<typeof AnachronismsSchema>;
  readonly sourcePolicy: z.output<typeof SourcePolicySchema>;
  readonly checklist: z.output<typeof ChecklistSchema>;
  /** Null when `gate/release.json` is missing, which the release check refuses (review S7). */
  readonly release: z.output<typeof ReleaseSchema> | null;
}

/** Read `gate/`. The first five files are required once a pack has situations; the rest default to empty. */
export function readGate(files: PackFiles, sink: IssueSink): GateData | null {
  const register = readJson(files, gateFile('register.json'), RegisterSchema, sink);
  const classes = readJson(files, gateFile('classes.json'), ClassesSchema, sink);
  const triggers = readJson(files, gateFile('triggers.json'), TriggersSchema, sink);
  const forbidden = readJson(files, gateFile('forbidden.json'), ForbiddenSchema, sink);
  const checklist = readJson(files, gateFile('checklist.json'), ChecklistSchema, sink);
  const anachronisms = readJson(files, gateFile('anachronisms.json'), AnachronismsSchema, sink, false) ?? { terms: [] };
  const sourcePolicy = readJson(files, gateFile('source-policy.json'), SourcePolicySchema, sink, false) ?? { banned: [], weak: [] };
  const release = readJson(files, gateFile('release.json'), ReleaseSchema, sink, false);
  if (!register || !classes || !triggers || !forbidden || !checklist) return null;
  return { register, classes, triggers, forbidden, anachronisms, sourcePolicy, checklist, release };
}

/** The questions this module tests, by id (the rest are the reviewer's, or wait for an artefact type). */
export const GATE_QUESTIONS_TESTED = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'B10', 'C1', 'C2', 'C3', 'C4', 'E7', 'F2', 'F5', 'F6'] as const;

/** Resolved text of every string a situation shows, by key (the default locale). */
export function resolvedStrings(def: SituationDef, strings: ReadonlyMap<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key } of stringKeysOf(def)) {
    const text = strings.get(key);
    if (text !== undefined) out[key] = text;
  }
  return out;
}

/**
 * The content hash a sign-off records (A7; section 5): the item in canonical
 * JSON without its `gateReview`, with the text of every string it shows and
 * every source row it cites. Any edit to any of them voids the sign-off.
 */
export function gateContentHash(def: SituationDef, strings: ReadonlyMap<string, string>, provenance: ProvenanceFile): string {
  const { gateReview: _review, ...item } = def;
  const cited = new Set(def.citations.map((c) => c.source));
  const sources = provenance.sources.filter((s) => cited.has(s.key)).sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return canonicalHash({ item, strings: resolvedStrings(def, strings), sources });
}

/** Trigger matches in a text (whole words, case rules, proper nouns on the allowlist removed). */
export function triggerMatches(text: string, triggers: GateData['triggers']): string[] {
  let scrubbed = text;
  for (const a of triggers.allow) scrubbed = scrubbed.split(a).join(' ');
  const out: string[] = [];
  for (const t of triggers.terms) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${t.term})(?![\\p{L}\\p{N}])`, t.caseSensitive ? 'u' : 'iu');
    const m = re.exec(scrubbed);
    if (m) out.push(m[0]);
  }
  return out;
}

/** Whole-word matches of a pattern in a text, as token ranges (review S9: phrases and inflections, not single tokens). */
function tokenMatches(text: string, pattern: string, starts: readonly number[]): { readonly from: number; readonly to: number; readonly text: string }[] {
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`, 'giu');
  const tokenAt = (offset: number) => starts.filter((s) => s <= offset).length - 1;
  return [...text.matchAll(re)].map((m) => ({ from: tokenAt(m.index), to: tokenAt(m.index + m[0].length - 1), text: m[0] }));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whether a resource term stands within `n` words of a protected-group term
 * (F2's proximity rule). Resource terms are patterns, so a pack can match a
 * phrase ("labour force") and inflections ("count(?:s|ed|ing)?"); group terms
 * are literal phrases.
 */
export function proximityHit(text: string, resourceTerms: readonly string[], groups: readonly string[], n: number): string | null {
  const starts = [...text.matchAll(/[\p{L}\p{N}'-]+/gu)].map((m) => m.index);
  for (const g of groups) {
    for (const gm of tokenMatches(text, escapeRegExp(g), starts)) {
      for (const r of resourceTerms) {
        for (const rm of tokenMatches(text, r, starts)) {
          const gap = rm.from > gm.to ? rm.from - gm.to : gm.from > rm.to ? gm.from - rm.to : 0;
          if (gap <= n) return `"${rm.text}" near "${gm.text}"`;
        }
      }
    }
  }
  return null;
}

type Tag = phase0.GateTag;
const topicsOf = (tag: Tag | null): readonly string[] => (tag === null || 'none' in tag ? [] : tag.topics);

/**
 * The gate's checks over a pack's situations. `strings` is the default
 * locale's table; `provenance` the pack's sources.
 */
export function checkGate(
  items: readonly { readonly file: string; readonly def: SituationDef }[],
  gate: GateData,
  strings: ReadonlyMap<string, string>,
  provenance: ProvenanceFile,
  defaultLocale: string,
): Issue[] {
  const sink = new IssueSink();
  const topics = new Map(gate.register.topics.map((t) => [t.id, t]));
  const classes = new Map(gate.classes.classes.map((c) => [c.id, c]));
  const sources = new Set(provenance.sources.map((s) => s.key));
  const protectedFields = new Set(gate.register.topics.flatMap((t) => t.protectedFields));
  const groups = gate.register.topics.flatMap((t) => t.protectedGroups);
  const held = (t: z.output<typeof TopicSchema>) => t.status === 'record' || t.needsSource;
  const atrocity = (topic: string) => classes.get(topics.get(topic)?.class ?? '')?.atrocity === true;

  gate.register.topics.forEach((t, i) => {
    if (!classes.has(t.class)) sink.error('gate-register', gateFile('register.json'), `topics[${i}].class`, `class "${t.class}" is not in classes.json`);
    if (t.interim !== null && !held(t)) sink.warn('gate-register', gateFile('register.json'), `topics[${i}].interim`, 'an interim placement on a topic that is not held does nothing');
  });

  // D5's inputs: every atrocity-class item, its acting side and the flags it sets.
  const atrocityItems = items.flatMap(({ def }) => {
    const t = def.gate;
    if ('none' in t || !t.topics.some(atrocity) || t.actingSide === null) return [];
    const flags = phase0.effectsOf(def).flatMap(({ effect }) => ('setFlag' in effect ? [effect.setFlag] : []));
    return [{ id: def.id as string, actingSide: t.actingSide as string, flags }];
  });

  // C2's pack-wide count: the display position of the default in gated decisions of three or more options.
  const positions: number[] = [];

  for (const { file, def } of items) {
    const err = (kind: string, at: string, message: string, expected?: string) => sink.error(kind, file, at, message, expected);
    const texts = Object.entries(resolvedStrings(def, strings));
    const effects = phase0.effectsOf(def);
    const tag = def.gate;
    const named = topicsOf(tag);
    const gated = named.length > 0;

    // A1: a trigger match, or an effect on a protected field, needs a tag (or `none` with a reason and a sign-off).
    const hits = texts.flatMap(([key, text]) => triggerMatches(text, gate.triggers).map((m) => `"${m}" in ${key}`));
    const touchesProtected = effects.filter(({ effect }) => 'propose' in effect && protectedFields.has(effect.propose.field));
    if ((hits.length > 0 || touchesProtected.length > 0) && !gated && def.gateReview === null) {
      err('gate-untagged', 'gate', `the item matches the gate (${[...hits, ...touchesProtected.map((e) => `a protected field at ${e.at}`)].join('; ')}) but carries no topic`, 'a gate tag naming its topics and placement, or gate.none with a reason and a reviewer sign-off (A1)');
    }

    // A2–A4 for the situation's tag and each option's own tag.
    const tags: { at: string; tag: Tag }[] = [{ at: 'gate', tag }, ...def.options.flatMap((o, i) => (o.gate === null ? [] : [{ at: `options[${i}].gate`, tag: o.gate }]))];
    for (const { at, tag: t } of tags) {
      if ('none' in t) continue;
      for (const id of t.topics) {
        const topic = topics.get(id);
        if (topic === undefined) {
          err('gate-unknown-topic', at, `"${id}" is not a register topic`, 'a topic id from gate/register.json');
          continue;
        }
        if (held(topic)) {
          const textOnly = t.placement === 'text' && topic.interim === 'text' && effects.length === 0 && def.options.length === 0 && def.citations.length > 0;
          if (!textOnly) err('gate-held-topic', at, `topic "${id}" is held (${topic.status === 'record' ? 'awaiting its record' : 'needs-source'})`, topic.interim === 'text' ? 'only a cited, text-only item with no effects and no options (A3)' : 'nothing until its record or its sources exist (A3)');
        } else if (!topic.placements.includes(t.placement as Placement)) {
          err('gate-placement', at, `placement "${t.placement}" is not allowed for topic "${id}"`, `one of ${topic.placements.join(', ')} (A2)`);
        }
        if (def.earliest < topic.window.from || (topic.window.to !== null && def.earliest > topic.window.to)) {
          err('gate-window', 'earliest', `${def.earliest} is outside topic "${id}"'s window (${topic.window.from} to ${topic.window.to ?? 'open'})`, 'an item dated inside its topic window (A4)');
        }
      }
    }

    // A2 and B5 (review S1): the placement matches the item's kind. A gated decision is placed `decision`,
    // so its locked costs are always checked; `event` is a notice; `text` is a notice with no effects;
    // `derived` and `refused` are never situations.
    if (!('none' in tag)) {
      const p = tag.placement;
      if (p === 'derived' || p === 'refused') err('gate-placement-kind', 'gate.placement', `a situation cannot be placed "${p}"`, 'decision for a decision; event or text for a notice');
      else if (def.kind === 'decision' && p !== 'decision') err('gate-placement-kind', 'gate.placement', `a gated decision is placed "${p}"`, 'placement decision, so its locked costs are checked (A2, B5)');
      else if (def.kind === 'notice' && p === 'decision') err('gate-placement-kind', 'gate.placement', 'a notice is placed decision', 'event, or text for a notice with no effects');
      else if (p === 'text' && effects.length > 0) err('gate-placement-kind', 'gate.placement', 'a text item carries effects', 'no effects on a text item (section 1: text changes no state)');
    }
    def.options.forEach((o, i) => {
      if (o.gate !== null && !('none' in o.gate) && o.gate.placement !== 'decision') err('gate-placement-kind', `options[${i}].gate.placement`, `an option is placed "${o.gate.placement}"`, 'decision: an option is a facet of a decision');
    });

    // A5, A6: citations resolve; none banned, and not weak alone.
    if (gated && def.citations.length === 0) err('gate-citation', 'citations', 'a gated item cites no source', 'at least one source from PROVENANCE.json (A5)');
    def.citations.forEach((c, i) => {
      if (!sources.has(c.source)) err('unknown-reference', `citations[${i}].source`, `"${c.source}" is not a source in PROVENANCE.json`, 'a source key (A5)');
      if (gate.sourcePolicy.banned.includes(c.source)) err('gate-banned-source', `citations[${i}].source`, `"${c.source}" is banned as evidence by the pack's source policy`, 'another source (A6)');
    });
    if (def.citations.length > 0 && def.citations.every((c) => gate.sourcePolicy.weak.includes(c.source))) err('gate-weak-sources', 'citations', 'every citation is a weak source', 'at least one source the policy does not mark weak (A6)');

    // A7: the sign-off.
    if (gated || hits.length > 0 || touchesProtected.length > 0) {
      const review = def.gateReview;
      if (review === null) err('gate-unsigned', 'gateReview', 'a gated item has no sign-off', 'a sign-off by a reviewer who is not the author (A7), or move it to situations/drafts/');
      else {
        if (review.author === review.reviewer) err('gate-self-signed', 'gateReview.reviewer', 'the reviewer is the author', 'a separate gate reviewer (A7; 0021)');
        // Every situation shows strings, so string questions (Q9, Q10, the F-questions) are recorded too (review S8).
        const applicable = gate.checklist.questions.filter((q) => q.appliesTo.includes('situation') || q.appliesTo.includes('option') || q.appliesTo.includes('string'));
        for (const q of applicable) {
          if (review.questionVersions[q.id] !== q.version) err('gate-stale-review', `gateReview.questionVersions.${q.id}`, `the sign-off read ${q.id} at version ${review.questionVersions[q.id] ?? 'none'}`, `version ${q.version}: re-review against the current question (A7)`);
        }
        const hash = gateContentHash(def, strings, provenance);
        if (review.contentHash !== hash) err('gate-stale-review', 'gateReview.contentHash', 'the item changed after its sign-off', `contentHash ${hash}, after a fresh review (A7)`);
      }
    }

    // B3 and the refused signatures: no effect targets a protected field or a refused shape.
    for (const { at, effect } of touchesProtected) err('gate-protected-target', at, `the effect targets protected field "${'propose' in effect ? effect.propose.field : ''}"`, 'no option, notice or effect targets a protected field; only derivations read it (B3, D3, E2)');
    for (const topic of gate.register.topics) {
      for (const r of topic.refused) {
        const field = r.fieldPattern === null ? null : new RegExp(r.fieldPattern, 'u');
        const option = r.optionPattern === null ? null : new RegExp(r.optionPattern, 'u');
        for (const { at, effect } of effects) if (field !== null && 'propose' in effect && field.test(effect.propose.field)) err('gate-refused', at, `refused under topic "${topic.id}": ${r.reason}`);
        def.options.forEach((o, i) => {
          if (option !== null && option.test(o.id)) err('gate-refused', `options[${i}].id`, `refused under topic "${topic.id}": ${r.reason}`);
        });
      }
    }

    // B4: no option, and no decision, carries an atrocity-class topic. An option's own tag adds to the
    // situation's and never replaces it (review S3).
    if (def.kind === 'decision') {
      for (const id of named) if (atrocity(id)) err('gate-atrocity-lever', 'gate', `a decision carries atrocity-class topic "${id}"`, 'atrocities are events and text only, never a choice for any seat (B4, D4; rule 1)');
    }
    def.options.forEach((o, i) => {
      const own = [...new Set([...named, ...topicsOf(o.gate)])];
      for (const id of own) if (atrocity(id)) err('gate-atrocity-lever', `options[${i}]`, `an option carries atrocity-class topic "${id}"`, 'atrocities are events and text only, never a choice for any seat (B4, D4; rule 1)');
    });

    // B5: a gated decision's options all carry locked costs, and nothing cancels them.
    if (gated && def.kind === 'decision') {
      def.options.forEach((o, i) => {
        if (o.lockedCosts.length === 0) err('gate-no-locked-cost', `options[${i}].lockedCosts`, `option "${o.id}" has no locked costs`, 'at least one locked cost on every option of a gated decision (B5)');
      });
      const opposes = (e: phase0.Effect, cost: Extract<phase0.Effect, { propose: unknown }>): boolean =>
        'propose' in e &&
        e.propose.owner === cost.propose.owner &&
        e.propose.field === cost.propose.field &&
        e.propose.subject === cost.propose.subject &&
        Math.sign(e.propose.delta) === -Math.sign(cost.propose.delta);
      def.options.forEach((o, i) => {
        for (const cost of o.lockedCosts) {
          if (!('propose' in cost)) continue;
          // Inside the item (review S4): the option's own effects, and options that can be taken with it.
          o.effects.forEach((e, j) => {
            if (opposes(e, cost)) err('gate-cancelled-cost', `options[${i}].effects[${j}]`, `this effect cancels a locked cost of option "${o.id}"`, 'locked costs that nothing cancels (B5)');
          });
          def.options.forEach((o2, i2) => {
            if (o2 === o || o.group === null || o2.group === null || o2.group === o.group) return;
            [...o2.effects, ...o2.lockedCosts].forEach((e) => {
              if (opposes(e, cost)) err('gate-cancelled-cost', `options[${i2}]`, `option "${o2.id}", which can be taken with "${o.id}", cancels one of its locked costs`, 'locked costs that nothing cancels (B5)');
            });
          });
        }
      });
      for (const o of def.options) {
        for (const cost of o.lockedCosts) {
          if (!('propose' in cost)) continue;
          for (const other of items) {
            const refersHere = phase0.conditionsOf(other.def).some(({ condition }) => decidedWith(condition, def.id, o.id));
            if (!refersHere) continue;
            for (const { at, effect } of phase0.effectsOf(other.def)) {
              if ('propose' in effect && effect.propose.owner === cost.propose.owner && effect.propose.field === cost.propose.field && effect.propose.subject === cost.propose.subject && Math.sign(effect.propose.delta) === -Math.sign(cost.propose.delta)) {
                sink.error('gate-cancelled-cost', other.file, at, `this effect cancels a locked cost of ${def.id}/${o.id}`, 'locked costs that nothing cancels (B5)');
              }
            }
          }
        }
      }
    }

    // B10: options a later law forbids expire with it.
    for (const topic of gate.register.topics) {
      for (const s of topic.supersededOptions) {
        if (s.situation !== def.id) continue;
        const i = def.options.findIndex((o) => o.id === s.option);
        if (i === -1) err('unknown-reference', 'options', `the register lists option "${s.option}" as superseded, but this situation has none`);
        else if (def.options[i]!.expiresWhen === null || !knowsSubjects(def.options[i]!.expiresWhen!).includes(s.law)) {
          err('gate-no-expiry', `options[${i}].expiresWhen`, `option "${s.option}" does not expire when the principal learns of law "${s.law}"`, 'expiresWhen: knows the situation that enacts the superseding law (B10)');
        }
      }
    }

    // E7: the sign rule. Every effect of an atrocity-class item names its side, so `side: null` cannot escape (review S5).
    if (!('none' in tag) && named.some(atrocity)) {
      if (tag.actingSide === null) err('gate-acting-side', 'gate.actingSide', 'an atrocity-class item does not name the acting side', 'the side whose conduct it is (E7)');
      for (const { at, effect } of effects) {
        if (!('propose' in effect)) continue;
        if (effect.propose.side === null) err('gate-acting-side', `${at}.propose.side`, 'an effect of an atrocity-class item names no side', 'the side whose measure it moves (E7)');
        else if (effect.propose.side === tag.actingSide && effect.propose.delta > 0) err('gate-sign-rule', at, 'atrocity-class conduct helps the side that acted', 'a non-positive sign on the acting side’s measures, whoever appointed the actor (E7)');
      }
    }

    // D5 (review S5): no effect conditioned on an atrocity-class item (its firing, its decision, a flag it sets) helps its acting side.
    const referenced = new Set<string>([...phase0.conditionsOf(def).flatMap((c) => phase0.situationsIn(c.condition)), ...(def.chain?.follows ? [def.chain.follows.situation] : [])]);
    const readFlags = new Set(phase0.conditionsOf(def).flatMap((c) => phase0.flagsIn(c.condition)));
    for (const a of atrocityItems) {
      if (a.id === def.id || !(referenced.has(a.id) || a.flags.some((f) => readFlags.has(f)))) continue;
      for (const { at, effect } of effects) {
        if ('propose' in effect && effect.propose.side === a.actingSide && effect.propose.delta > 0) {
          err('gate-atrocity-benefit', at, `this effect, conditioned on atrocity-class item "${a.id}", helps the side that acted`, 'no positive effect for any seat conditioned on atrocity-class conduct (D5)');
        }
      }
    }

    // C3/F6 anachronisms, C4/F5 forbidden patterns, F2 proximity.
    for (const [key, text] of texts) {
      const scope = def.options.some((o) => o.label === key) ? 'label' : 'narrator';
      const at = stringKeysOf(def).find((k) => k.key === key)!.at;
      for (const a of gate.anachronisms.terms) {
        if (a.earliest > def.earliest && text.toLowerCase().includes(a.term.toLowerCase())) err('gate-anachronism', at, `"${a.term}" before ${a.earliest} (the item's earliest date is ${def.earliest})`, 'no term dated after the item (C3, F6)');
      }
      for (const p of gate.forbidden.patterns) {
        if (p.scope !== 'any' && p.scope !== scope) continue;
        const m = new RegExp(p.pattern, 'iu').exec(text);
        if (m === null) continue;
        if (p.severity === 'fail') err('gate-forbidden-wording', at, `"${m[0]}": ${p.reason}`, 'wording free of the pack’s forbidden patterns (C4, F2, F5)');
        else if (def.gateReview?.notes[`${key}|${p.pattern}`] === undefined) {
          // Section 5: a review hit forces a reviewer note, recorded in the sign-off (review S8).
          err('gate-review-note-missing', at, `"${m[0]}": ${p.reason}`, `a reviewer's note in gateReview.notes["${key}|${p.pattern}"]`);
        }
      }
      const near = proximityHit(text, gate.forbidden.resourceWords, groups, gate.forbidden.proximityTokens);
      if (near !== null) err('gate-forbidden-wording', at, `resource wording ${near}`, 'people of a protected group are never a resource (F2; 0021)');
    }

    const hd = def.historicalDefault;
    if (gated && def.kind === 'decision' && def.options.length >= 3 && hd !== null && 'options' in hd && hd.options.length === 1) positions.push(def.options.findIndex((o) => o.id === hd.options[0]));
  }

  // F2 and F5 over the whole string table (review S9), not only situation strings: every other message is
  // checked against the patterns that apply anywhere and to narrator text, and the proximity rule. Review hits
  // here have no sign-off to hold a note, so they stay warnings; anachronisms need a date, which only items have.
  const shown = new Set(items.flatMap(({ def }) => stringKeysOf(def).map((k) => k.key)));
  const table = `strings/${defaultLocale}.json`;
  for (const [key, text] of [...strings].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (shown.has(key)) continue;
    for (const p of gate.forbidden.patterns) {
      if (p.scope === 'label') continue;
      const m = new RegExp(p.pattern, 'iu').exec(text);
      if (m === null) continue;
      if (p.severity === 'fail') sink.error('gate-forbidden-wording', table, key, `"${m[0]}": ${p.reason}`, 'wording free of the pack’s forbidden patterns (F2, F5)');
      else sink.warn('gate-review-wording', table, key, `"${m[0]}": ${p.reason}; the reviewer must note it`);
    }
    const near = proximityHit(text, gate.forbidden.resourceWords, groups, gate.forbidden.proximityTokens);
    if (near !== null) sink.error('gate-forbidden-wording', table, key, `resource wording ${near}`, 'people of a protected group are never a resource (F2; 0021)');
  }

  // C2: no display position holds the default in more than half of the gated decisions with three or more options.
  // With fewer than three such situations a position always holds half or more, so the count waits for three.
  if (positions.length >= C2_MINIMUM) {
    const counts = new Map<number, number>();
    for (const p of positions) counts.set(p, (counts.get(p) ?? 0) + 1);
    for (const [p, n] of counts) {
      if (n * 2 > positions.length) sink.error('gate-default-position', GATE_DIR, '', `display position ${p + 1} holds the historical default in ${n} of ${positions.length} gated decisions`, 'no position holding the default in more than half of them (C2; 0041)');
    }
  }
  return sink.issues;
}

/** The fewest gated decisions of three or more options before C2 counts positions. */
export const C2_MINIMUM = 3;

/** The situations whose reports a condition waits for (knows with subject kind situation). */
function knowsSubjects(c: phase0.Condition): string[] {
  if ('all' in c) return c.all.flatMap(knowsSubjects);
  if ('any' in c) return c.any.flatMap(knowsSubjects);
  if ('not' in c) return knowsSubjects(c.not);
  return 'knows' in c && c.knows.subjectKind === 'situation' && c.knows.subjectId !== null ? [c.knows.subjectId] : [];
}

function decidedWith(c: phase0.Condition, situation: string, option: string): boolean {
  if ('all' in c) return c.all.some((x) => decidedWith(x, situation, option));
  if ('any' in c) return c.any.some((x) => decidedWith(x, situation, option));
  if ('not' in c) return decidedWith(c.not, situation, option);
  // `fired` of the situation applies whatever is chosen, so it offsets every option's costs (review S4).
  if ('fired' in c) return c.fired === situation;
  return 'decided' in c && c.decided === situation && (c.options === null || c.options.includes(option));
}

/**
 * The ship rule (A8; section 1), a release check rather than a loader rule:
 * no held topic's window may overlap a scenario the release ships, and no
 * sign-off may be a fixture's (a testbed's placeholder, never a reviewer's).
 */
export function releaseProblems(items: readonly { readonly file: string; readonly def: SituationDef }[], gate: GateData, shipped: readonly string[]): string[] {
  const problems: string[] = [];
  // Review S7: no release.json, or a shipped scenario without a window, is not a pass.
  if (gate.release === null) problems.push('gate/release.json is missing: list every scenario the pack ships, with its window');
  const windows = gate.release?.scenarios ?? [];
  for (const id of shipped) if (!windows.some((w) => w.scenario === id)) problems.push(`scenario ${id} ships but has no window in gate/release.json`);
  for (const s of windows) {
    for (const t of gate.register.topics) {
      if (!(t.status === 'record' || t.needsSource)) continue;
      const overlaps = t.window.from <= s.to && (t.window.to === null || t.window.to >= s.from);
      if (overlaps) problems.push(`scenario ${s.scenario} (${s.from} to ${s.to}) overlaps held topic ${t.id} (${t.status === 'record' ? 'awaiting its record' : 'needs-source'}, ${t.window.from} to ${t.window.to ?? 'open'})`);
    }
  }
  for (const { file, def } of items) if (def.gateReview?.reviewer.startsWith('fixture') === true) problems.push(`${file}: signed off by a fixture (${def.gateReview.reviewer}), not a gate reviewer`);
  return problems;
}
