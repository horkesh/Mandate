/** Service choices are a man's own act. The pack supplies every weight and any historical date (R49). */
import { strictCompare } from '../compare.ts';
import type { FactionId, PersonId } from '../ids.ts';
import { term, type BiasTerm } from '../knowledge/truth.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';

/** Replaced whole by people, once this officer has chosen. No post, force or rank is transferred here. */
export interface PersonService {
  readonly serviceFaction: FactionId;
  readonly serviceBloc: string | null;
  readonly serviceChoice: 'resign' | 'stay';
  readonly serviceDay: number;
}

export interface ResignationRules {
  /** The history baseline uses the cited date; other packs can ask the values model instead. */
  readonly historicalDefaults: boolean;
  readonly base: number;
  /** A score at least this high resigns. Ties below it stay. */
  readonly resignAt: number;
  readonly values: readonly { readonly value: string; readonly weight: number }[];
  readonly traits: readonly { readonly trait: string; readonly weight: number }[];
}

/** Today's personal bloc; an unchosen man retains his starting bloc. */
export function blocOfPerson(map: WorldIndex, state: State, person: PersonId): string | null {
  const chosen = state.personService?.[person];
  return chosen === undefined ? map.world.people.find(p => p.id === person)?.bloc ?? null : chosen.serviceBloc;
}

/** The score and every contributing term, never a hindsight explanation presented as the man's motive. */
export function resignationChoice(map: WorldIndex, state: State, person: PersonId): { readonly choice: 'resign' | 'stay'; readonly terms: readonly BiasTerm[] } {
  const rules = map.world.rules.people.resignation;
  const record = map.world.people.find(p => p.id === person)!;
  const terms: BiasTerm[] = [term('service_term', rules.base, { person, rule: 'base' })];
  for (const row of [...rules.values].sort((a, b) => strictCompare(a.value, b.value))) {
    if (record.values.some(v => v.value === row.value)) terms.push(term('service_term', row.weight, { person, rule: `value:${row.value}` }));
  }
  for (const row of [...rules.traits].sort((a, b) => strictCompare(a.trait, b.trait))) {
    if (state.personTraits[person]?.includes(row.trait)) terms.push(term('service_term', row.weight, { person, rule: `trait:${row.trait}` }));
  }
  const score = terms.reduce((n, t) => n + t.termValue, 0);
  terms.push(term('service_term', -rules.resignAt, { person, rule: 'threshold' }));
  return { choice: score >= rules.resignAt ? 'resign' : 'stay', terms };
}
