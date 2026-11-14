import { strictCompare } from './compare.ts';
import { resolveDirective } from './compliance.ts';
import type { DirectiveResponse } from './directive.ts';
import {
  assaultAvailability,
  dispositionOf,
  oversightOf,
  promiseCredibility,
  sanctionCredibility,
} from './derive.ts';
import type { ValueId } from './people.ts';
import { clampPermille, scale, type Permille } from './permille.ts';
import type { KernelRules } from './rules.ts';
import type { FactionId, GameState, Objective, Person, Post } from './state.ts';

/** The terms a holder reads: an order as issued, or a draft in an audience. */
export interface Reading {
  readonly objective: Objective;
  readonly boldness: Permille;
  readonly framing: ValueId | null;
  readonly promisedForce: number;
  readonly insisted: boolean;
}

/**
 * How a holder reads an order, from his own position (P2). The single owner
 * of this computation: both a directive's arrival and an audience preview
 * call it, so what you are told in an audience is what the proxy would say.
 */
export function readOrder(
  state: GameState,
  factionId: FactionId,
  holder: Person,
  post: Post,
  reading: Reading,
  rules: KernelRules,
): DirectiveResponse {
  const objective = reading.objective;
  const values = state.objectiveValues[objective.kind];
  const honours = reading.framing && !values.honours.includes(reading.framing)
    ? [...values.honours, reading.framing].sort(strictCompare)
    : values.honours;

  // He counts on promised reinforcements only as far as he believes the principal's promises (P7).
  const believed = scale(reading.promisedForce, promiseCredibility(state, factionId, rules));
  const required = objective.kind === 'attack' ? 1000 : 0;
  const available = objective.kind === 'attack'
    ? assaultAvailability(state, post, objective.targetRegionId, rules, believed)
    : 1000;

  let credibility = sanctionCredibility(state, factionId, rules);
  if (reading.insisted) credibility = clampPermille(credibility + rules.insistCredibility);

  return resolveDirective(
    holder,
    { boldness: reading.boldness, honours, offends: values.offends, required },
    {
      available,
      oversight: oversightOf(state, holder.id, rules),
      leaderCredibility: credibility,
      disposition: dispositionOf(state, holder.id, rules),
      grievances: holder.grievances,
    },
    rules.compliance,
  );
}
