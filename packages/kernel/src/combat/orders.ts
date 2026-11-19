/**
 * A commander's battle orders for the day (lane 1.12): his seat answers the morning's battle menu with a choice at each
 * of the battle model's decision points, or `judge`, which leaves it to his traits on the spot (`combat/decide.ts`).
 * An order is the commander's own act through his seat, so a human or an AI seat can fight a battle choice by choice and
 * the lever sweep can drive each option; a rule seat answers `judge` everywhere, so its battles are the trait rule's.
 *
 * The orders live only for the day they are given (the tick context carries them to `combatDay`; nothing in State). An
 * explicit order replaces the trait rule's choice and adds an `ordered` term beside the rule's own terms, so the record
 * shows both what he ordered and what his traits would have done (hard rule 6). An order the battle cannot carry out (an
 * attack by a side that may not attack) is not obeyed, with an `order_not_possible` term.
 */
import type { PersonId } from '../ids.ts';
import type { Decision } from './decide.ts';
import { JUDGE, type Judge } from './order-kinds.ts';
import type { BattleTerm } from './records.ts';

export * from './order-kinds.ts';

/** The trait rule's decision, replaced by an explicit order when there is one (its terms kept, with an `ordered` term). */
export function ordered<T extends string>(rule: Decision<T>, order: T | Judge, person: PersonId | null): Decision<T> {
  if (order === JUDGE) return rule;
  return { choice: order, terms: [...rule.terms, orderedTerm(person)] };
}

function orderedTerm(person: PersonId | null): BattleTerm {
  return { btermKind: 'ordered', btermValue: 0, btermSource: person };
}

/** The term for an order the battle could not carry out. */
export function notPossible(person: PersonId | null): BattleTerm {
  return { btermKind: 'order_not_possible', btermValue: 0, btermSource: person };
}
