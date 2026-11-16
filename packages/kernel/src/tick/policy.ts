/**
 * A chosen policy (lane 1.5b; 0074; the gate review's G-1.5a, G-1.5f, G-1.5g): an option, or a decision's inaction, that
 * names a `policy:` row of the pack's order-to-value map applies that row's pushback through its owners.
 * - **Stakeholders** (`people`): every person on the side who holds a value the row offends holds a `policy_offended`
 *   grievance against the principal, weighted by his term.
 * - **The floor** (G-1.5f): when the row is floored by `notCheaperThan`, the difference falls on the floored row's own
 *   stakeholders and carriers (those it offends, those whose practice it runs against, those unwilling to carry it), in
 *   proportion to their share of its pushback, each a grievance whose cause names the floor. Never on the floor row's
 *   stakeholders: they favoured the policy the floor stands for, and a grievance would give them a stance no source
 *   gives them. With none to bear it, it falls on the principal's own standing, a typed floor cost.
 * - **Carriers** (`proxy`): each holder of a post the policy names answers the row through his compliance, practice
 *   clashes included, and `proxy` records his response.
 * Every term reaches the explanation trail as a `policy` event (hard rule 6). `pushbackOf` is the one reader of the
 * map's pushback, so the floor and the side-wide count bite in play.
 */
import { strictCompare } from '../compare.ts';
import type { MessageId, PersonId } from '../ids.ts';
import { term } from '../knowledge/truth.ts';
import { applyPeopleChanges, type PeopleChange } from '../people/people.ts';
import { recordResponse, responseOf } from '../proxy/responses.ts';
import { answerOrder, orderTerms, pushbackOf, type PushbackTerm } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import type { OptionPolicy, SituationDef } from '../situations/types.ts';
import { fire, oversightOf, type TickContext } from './context.ts';

/** The grievance a policy leaves on those it offends. */
export const POLICY_GRIEVANCE = 'policy_offended';

/** The pushback terms that fall on a person, by person (the row's own stakeholders and carriers, for the floor's share). */
function personal(terms: readonly PushbackTerm[]): { readonly person: PersonId; readonly amount: number }[] {
  return terms.flatMap((t) => (t.source === 'floor' ? [] : [{ person: t.person, amount: t.amount }]));
}

/** Share `amount` among `shares` in proportion, whole numbers, the remainder to the first in id order. */
function share(amount: number, shares: readonly { readonly person: PersonId; readonly amount: number }[]): { readonly person: PersonId; readonly amount: number }[] {
  const byPerson = new Map<PersonId, number>();
  for (const s of shares) byPerson.set(s.person, (byPerson.get(s.person) ?? 0) + s.amount);
  const total = [...byPerson.values()].reduce((s, x) => s + x, 0);
  if (total <= 0 || amount <= 0) return [];
  const sorted = [...byPerson.keys()].sort(strictCompare);
  const out = sorted.map((person) => ({ person, amount: Math.trunc((amount * byPerson.get(person)!) / total) }));
  const left = amount - out.reduce((s, x) => s + x.amount, 0);
  if (out.length > 0) out[0] = { person: out[0]!.person, amount: out[0]!.amount + left };
  return out.filter((x) => x.amount > 0);
}

/** Apply a policy chosen in `def` by `principal`: an option's (`choice` its id) or the inaction outcome's (`choice` `inaction`). */
export function applyPolicy(ctx: TickContext, start: State, def: SituationDef, policy: OptionPolicy | null, choice: string, principal: PersonId): State {
  if (policy === null) return start;
  const { world, day } = ctx;
  const rules = world.map.world.rules.people;
  const row = policy.row;
  const carriers = [...new Set(policy.carriedBy.map((p) => start.postStates[p]?.postHolder ?? null).filter((h): h is PersonId => h !== null))].sort(strictCompare);
  // Lane 1.4: each carrier reads the policy at the oversight where he stands.
  const readAt = (p: PersonId) => ({ oversight: oversightOf(ctx, start, p, principal).value });
  const push = pushbackOf(world, start, row, carriers, principal, readAt);
  const changes: PeopleChange[] = [];
  const trail = push.terms.map((t) => (t.source === 'floor' ? term('relay_term', t.amount, { person: principal, rule: `floor:${t.order}` }) : term('relay_term', t.amount, { person: t.person, rule: `pushback:${t.source}` })));
  for (const t of push.terms) {
    if (t.source === 'values') changes.push({ change: 'grievance', person: t.person, kind: POLICY_GRIEVANCE, weight: t.amount, against: principal, cause: row });
  }
  const floor = push.terms.find((t) => t.source === 'floor');
  if (floor !== undefined && floor.source === 'floor') {
    // G-1.5f: the difference falls on this row's own stakeholders and carriers, in proportion to their pushback.
    const shares = share(floor.amount, personal(push.terms));
    for (const s of shares) changes.push({ change: 'grievance', person: s.person, kind: POLICY_GRIEVANCE, weight: s.amount, against: principal, cause: `floor:${floor.order}` });
    if (shares.length === 0) {
      // Nobody to bear it: the principal's own standing pays, a typed floor cost.
      changes.push({ change: 'standing', person: principal, delta: -floor.amount });
      trail.push(term('relay_term', -floor.amount, { person: principal, rule: `floor_cost:${floor.order}` }));
    }
  }
  let state = applyPeopleChanges(start, changes, day, rules, world.map.world.vocabularies.ranks);
  const key = `m.${day}.policy.${def.id}.${choice}` as MessageId;
  for (const carrier of carriers) {
    const post = policy.carriedBy.find((p) => start.postStates[p]?.postHolder === carrier)!;
    state = recordResponse(state, responseOf(answerOrder(world, start, carrier, principal, orderTerms(rules, row), readAt(carrier)), { order: key, person: carrier, post, role: 'addressee', day }));
  }
  ctx.events.push({ event: 'policy', person: principal, post: null, message: key, terms: trail });
  fire(ctx, 'situations.policy', push.total);
  return state;
}