/**
 * The kernel's own guard on situation data: every reference resolves in the
 * World it runs on, and each kind has the fields it needs. The pack format's
 * validator (`@mandate/pack-format`) reports the same problems, and more, at a
 * file and place a modder can find; this guard keeps any World the kernel is
 * handed (a test fixture, an adapter) from running with a dangling reference.
 */
import { strictCompare } from '../compare.ts';
import { ORDER_ROUTES } from '../messages/latency.ts';
import { situationsIn, unknowableRead, type KnowablePlace } from './conditions.ts';
import type { Condition, Effect, SituationDef } from './types.ts';

export interface SituationRefs {
  readonly factions: ReadonlyMap<string, unknown>;
  readonly posts: ReadonlyMap<string, { readonly faction: string }>;
  readonly persons: ReadonlyMap<string, unknown>;
  readonly regions: ReadonlyMap<string, unknown>;
}

function walk(c: Condition, visit: (c: Condition) => void): void {
  visit(c);
  if ('all' in c) c.all.forEach((x) => walk(x, visit));
  else if ('any' in c) c.any.forEach((x) => walk(x, visit));
  else if ('not' in c) walk(c.not, visit);
}

/** Every condition in a situation, with where it sits. */
export function conditionsOf(def: SituationDef): { readonly at: string; readonly condition: Condition }[] {
  const out: { at: string; condition: Condition }[] = [{ at: 'event', condition: def.event }];
  if (def.knowledge !== null) out.push({ at: 'knowledge', condition: def.knowledge });
  def.options.forEach((o, i) => {
    for (const key of ['appearsWhen', 'expiresWhen', 'waitsOn'] as const) {
      const c = o[key];
      if (c !== null) out.push({ at: `options[${i}].${key}`, condition: c });
    }
  });
  return out;
}

/** Every effect in a situation (options' effects and locked costs, inaction, a notice's effects), with where it sits. */
export function effectsOf(def: SituationDef): { readonly at: string; readonly effect: Effect; readonly option: string | null }[] {
  const out: { at: string; effect: Effect; option: string | null }[] = [];
  def.options.forEach((o, i) => {
    o.effects.forEach((e, j) => out.push({ at: `options[${i}].effects[${j}]`, effect: e, option: o.id }));
    o.lockedCosts.forEach((e, j) => out.push({ at: `options[${i}].lockedCosts[${j}]`, effect: e, option: o.id }));
  });
  def.inaction?.effects.forEach((e, j) => out.push({ at: `inaction.effects[${j}]`, effect: e, option: null }));
  def.effects.forEach((e, j) => out.push({ at: `effects[${j}]`, effect: e, option: null }));
  return out;
}

export function situationReferenceProblems(defs: readonly SituationDef[], refs: SituationRefs): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const d of [...defs].sort((a, b) => strictCompare(a.id, b.id))) {
    const at = (where: string, what: string) => problems.push(`situation ${d.id}: ${where}: ${what}`);
    if (ids.has(d.id)) at('id', 'defined twice');
    ids.add(d.id);
    if (!refs.factions.has(d.faction)) at('faction', `${d.faction} is not a faction`);
    const optionIds = new Set(d.options.map((o) => o.id));
    if (optionIds.size !== d.options.length) at('options', 'option ids repeat');
    if (d.kind === 'decision') {
      if (d.options.length === 0) at('options', 'a decision needs options');
      if (d.inaction === null) at('inaction', 'a decision needs an inaction outcome (0040)');
      if (d.historicalDefault === null) at('historicalDefault', 'a decision needs a historical default (0040)');
      if (d.staffLine === null || d.staffLine.authors.length === 0) at('staffLine', 'a decision needs a staff line with at least one author post (0040, 0046)');
    } else if (d.options.length > 0 || d.inaction !== null || d.historicalDefault !== null || d.staffLine !== null) {
      at('kind', 'a notice carries no options, inaction, historical default or staff line (0046)');
    }
    if (d.kind === 'notice' && (d.report === null || d.report.authors.length === 0)) at('report', 'a notice needs a report with at least one author post (gate F1)');
    if (d.kind === 'decision' && d.report !== null) at('report', 'a decision is told through its staff line, not a notice report');
    for (const p of d.report?.authors ?? []) if (!refs.posts.has(p)) at('report.authors', `${p} is not a post`);
    for (const p of [...(d.staffLine?.authors ?? []), ...d.delegableTo]) if (!refs.posts.has(p)) at('posts', `${p} is not a post`);
    // Standing review S6: every post the situation names is its own side's, so the other side never decides,
    // advises or reports for it (0050). An option's order to the other side is also refused by `issueOrder`.
    const named = [...(d.report?.authors ?? []), ...(d.staffLine?.authors ?? []), ...d.delegableTo, ...d.options.flatMap((o) => o.orders.map((x) => x.to))];
    for (const p of named) {
      const side = refs.posts.get(p)?.faction;
      if (side !== undefined && side !== d.faction) at('posts', `${p} is ${side}'s post, not ${d.faction}'s`);
    }
    for (const p of d.subjects) if (!refs.persons.has(p)) at('subjects', `${p} is not a person`);
    for (const r of d.staffLine?.recommends ?? []) if (!optionIds.has(r)) at('staffLine.recommends', `${r} is not an option`);
    const hd = d.historicalDefault;
    if (hd !== null && 'options' in hd) for (const o of hd.options) if (!optionIds.has(o)) at('historicalDefault', `${o} is not an option`);
    if (hd !== null && 'delegate' in hd && !d.delegableTo.includes(hd.delegate)) at('historicalDefault', `${hd.delegate} is not among delegableTo`);
    d.options.forEach((o) => {
      if (o.proposedBy !== 'inaction') for (const p of o.proposedBy) if (!refs.persons.has(p)) at(`option ${o.id}`, `proposer ${p} is not a person`);
      for (const order of o.orders) {
        if (!refs.posts.has(order.to)) at(`option ${o.id}`, `order to ${order.to}, not a post`);
        if (order.region !== null && !refs.regions.has(order.region)) at(`option ${o.id}`, `order names ${order.region}, not a region`);
        if (!ORDER_ROUTES.includes(order.route)) at(`option ${o.id}`, `route ${order.route} is not one a principal may order by (${ORDER_ROUTES.join(', ')})`);
      }
    });
    for (const { at: where, condition } of conditionsOf(d)) {
      walk(condition, (c) => {
        if ('goal' in c && !refs.posts.has(c.goal.post)) at(where, `${c.goal.post} is not a post`);
        if ('headquartersAt' in c) {
          if (!refs.posts.has(c.headquartersAt.post)) at(where, `${c.headquartersAt.post} is not a post`);
          if (!refs.regions.has(c.headquartersAt.region)) at(where, `${c.headquartersAt.region} is not a region`);
        }
      });
    }
  }
  const all = new Set(defs.map((d) => d.id));
  for (const d of defs) {
    // What the principal can know (the lead's rulings on S2 and S10): each place reads only its allow-list.
    for (const { at: where, condition } of conditionsOf(d)) {
      if (where === 'event') continue;
      const place = (where === 'knowledge' ? 'knowledge' : where.slice(where.lastIndexOf('.') + 1)) as KnowablePlace;
      const bad = unknowableRead(condition, place);
      if (bad !== null) problems.push(`situation ${d.id}: ${where}: "${bad}" is not something the principal can know here`);
    }
    const named = [...conditionsOf(d).flatMap((c) => situationsIn(c.condition)), ...(d.chain?.follows ? [d.chain.follows.situation] : [])];
    for (const s of named) if (!all.has(s)) problems.push(`situation ${d.id}: refers to situation ${s}, which does not exist`);
  }
  return problems;
}
