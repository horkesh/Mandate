/**
 * The insubordination ladder and rivals on the new State (lane 1.5; P5, P6; M2's `ladder.ts` recast), owned by `ladder`.
 *
 * Each week a man's discontent (the weight of his grievances, less half his regard for his principal) points to a rung;
 * he moves one rung toward it, never jumping. Public defiance and above need standing to shield him. A man on lobbying
 * or above whose standing reaches the pack's rival threshold becomes a rival (success breeds rivals). His rung feeds
 * compliance as the `disposition` term. Nothing here draws a die (0007).
 *
 * The rung's effects on blocs are `politics`' (lane 1.6): the weekly step proposes them, nothing applies them yet.
 * Freelancing waits for operations (lane 1.4): a high rung shows instead as seat initiatives.
 */
import { strictCompare } from '../compare.ts';
import type { PersonId } from '../ids.ts';
import { regardOf } from '../people/people.ts';
import type { PeopleRules } from '../people/rules.ts';
import { LADDER_RUNGS, type LadderRung } from '../people/verb-rules.ts';
import type { State } from '../root-state.ts';

/** His rung: absent from the table is loyal. */
export function rungOf(state: State, person: PersonId): LadderRung {
  return state.personRungs[person] ?? 'loyal';
}

export function rungIndex(rung: LadderRung): number {
  return LADDER_RUNGS.indexOf(rung);
}

/** Discontent: the weight of what he holds, net of goodwill toward his principal (M2's `discontentOf`). */
export function discontentOf(rules: PeopleRules, state: State, person: PersonId, principal: PersonId | null): number {
  const load = (state.personGrievances[person] ?? []).reduce((sum, g) => sum + g.grievanceWeight, 0);
  const regard = principal === null ? rules.shadow.regardUnknown : regardOf(rules, state, person, principal);
  return load - Math.trunc(regard / 2);
}

/** The rung his discontent points to, capped by the standing open defiance needs. */
export function targetRung(rules: PeopleRules, state: State, person: PersonId, principal: PersonId | null): LadderRung {
  const discontent = discontentOf(rules, state, person, principal);
  let index = rules.verbs.ladder.thresholds.filter((t) => discontent >= t).length;
  if (index >= rungIndex('public_defiance') && (state.personStanding[person] ?? 0) < rules.verbs.ladder.publicStanding) index = rungIndex('public_defiance') - 1;
  return LADDER_RUNGS[index]!;
}

/** The compliance term his rung gives (M2's `dispositionOf`): willingness lost per rung above loyal. */
export function dispositionOf(rules: PeopleRules, state: State, person: PersonId): number {
  return 0 - rungIndex(rungOf(state, person)) * rules.verbs.ladder.dispositionPerRung;
}

export interface LadderEvent {
  readonly person: PersonId;
  readonly event: 'moved' | 'rival';
  readonly from: LadderRung;
  readonly to: LadderRung;
  readonly discontent: number;
}

/**
 * The weekly step for the ladder: each man not a principal moves one rung toward his target, and any who qualifies
 * becomes a rival. `principalOf` names each man's principal (null for none). The only writer of rungs and rivals.
 */
export function weeklyLadder(rules: PeopleRules, state: State, persons: readonly PersonId[], principalOf: (p: PersonId) => PersonId | null, day: number): { readonly state: State; readonly events: readonly LadderEvent[] } {
  const rungs: Record<PersonId, LadderRung> = { ...state.personRungs };
  const rivals: Record<PersonId, number> = { ...state.personRivals };
  const events: LadderEvent[] = [];
  for (const p of [...persons].sort(strictCompare)) {
    const principal = principalOf(p);
    if (principal === p) continue;
    const from = rungOf(state, p);
    const target = targetRung(rules, state, p, principal);
    const discontent = discontentOf(rules, state, p, principal);
    const step = Math.sign(rungIndex(target) - rungIndex(from));
    const to = LADDER_RUNGS[rungIndex(from) + step]!;
    if (to !== from) {
      if (to === 'loyal') delete rungs[p];
      else rungs[p] = to;
      events.push({ person: p, event: 'moved', from, to, discontent });
    }
    if (rivals[p] === undefined && rungIndex(to) >= rungIndex('lobbying') && (state.personStanding[p] ?? 0) >= rules.verbs.ladder.rivalStanding) {
      rivals[p] = day;
      events.push({ person: p, event: 'rival', from, to, discontent });
    }
  }
  if (events.length === 0) return { state, events };
  return { state: { ...state, personRungs: rungs, personRivals: rivals }, events };
}
