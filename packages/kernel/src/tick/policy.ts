/**
 * A chosen policy (lane 1.5b; 0074; the gate review's G-1.5a): an option that names a `policy:` row of the pack's
 * order-to-value map applies that row's pushback through its owners.
 * - **Stakeholders** (`people`): every person on the side who holds a value the row offends holds a `policy_offended`
 *   grievance against the principal, weighted by his term; when the row is floored by `notCheaperThan`, the difference
 *   is shared among the floor row's own stakeholders, each a grievance whose cause names the floor (hard rule 6).
 * - **Carriers** (`proxy`): each holder of a post the option names answers the row through his compliance, practice
 *   clashes included, and `proxy` records his response.
 * `pushbackOf` is the one reader of the map's pushback, so the floor and the side-wide count bite in play.
 */
import { strictCompare } from '../compare.ts';
import type { MessageId, PersonId } from '../ids.ts';
import { applyPeopleChanges, type PeopleChange } from '../people/people.ts';
import { recordResponse, responseOf } from '../proxy/responses.ts';
import { answerOrder, orderTerms, pushbackOf, type PushbackTerm } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import type { OptionDef, SituationDef } from '../situations/types.ts';
import { fire, type TickContext } from './context.ts';

/** The grievance a policy leaves on those it offends. */
export const POLICY_GRIEVANCE = 'policy_offended';

/** The pushback terms that fall on a person, by person (the floor's own stakeholders, for the floor's share). */
function personal(terms: readonly PushbackTerm[]): { readonly person: PersonId; readonly amount: number }[] {
  return terms.flatMap((t) => (t.source === 'floor' ? [] : [{ person: t.person, amount: t.amount }]));
}

/** Share `amount` among `shares` in proportion, whole numbers, the remainder to the first in id order. */
function share(amount: number, shares: readonly { readonly person: PersonId; readonly amount: number }[]): { readonly person: PersonId; readonly amount: number }[] {
  const total = shares.reduce((s, x) => s + x.amount, 0);
  if (total <= 0 || amount <= 0) return [];
  const sorted = [...shares].sort((a, b) => strictCompare(a.person, b.person));
  const out = sorted.map((x) => ({ person: x.person, amount: Math.trunc((amount * x.amount) / total) }));
  const left = amount - out.reduce((s, x) => s + x.amount, 0);
  if (out.length > 0) out[0] = { person: out[0]!.person, amount: out[0]!.amount + left };
  return out.filter((x) => x.amount > 0);
}

/** Apply option `o`'s policy row, chosen in `def` by `principal`. */
export function applyPolicy(ctx: TickContext, start: State, def: SituationDef, o: OptionDef, principal: PersonId): State {
  if (o.policy === null) return start;
  const { world, day } = ctx;
  const rules = world.map.world.rules.people;
  const row = o.policy.row;
  const carriers = [...new Set(o.policy.carriedBy.map((p) => start.postStates[p]?.postHolder ?? null).filter((h): h is PersonId => h !== null))].sort(strictCompare);
  const push = pushbackOf(world, start, row, carriers, principal);
  const changes: PeopleChange[] = [];
  for (const t of push.terms) {
    if (t.source === 'values') changes.push({ change: 'grievance', person: t.person, kind: POLICY_GRIEVANCE, weight: t.amount, against: principal, cause: row });
  }
  const floor = push.terms.find((t) => t.source === 'floor');
  if (floor !== undefined && floor.source === 'floor') {
    // The floor's difference falls on the floor row's own stakeholders, in proportion to their share of its pushback.
    for (const s of share(floor.amount, personal(pushbackOf(world, start, floor.order, carriers, principal).terms))) {
      changes.push({ change: 'grievance', person: s.person, kind: POLICY_GRIEVANCE, weight: s.amount, against: principal, cause: `floor:${floor.order}` });
    }
  }
  let state = applyPeopleChanges(start, changes, day, rules, world.map.world.vocabularies.ranks);
  const key = `m.${day}.policy.${def.id}.${o.id}` as MessageId;
  for (const carrier of carriers) {
    const post = o.policy.carriedBy.find((p) => start.postStates[p]?.postHolder === carrier)!;
    state = recordResponse(state, responseOf(answerOrder(world, start, carrier, principal, orderTerms(rules, row)), { order: key, person: carrier, post, role: 'addressee', day }));
  }
  fire(ctx, 'situations.policy', push.total);
  return state;
}
