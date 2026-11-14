import { sortedKeys } from './compare.ts';
import { clampRegard } from './derive.ts';
import { send } from './messages.ts';
import type { PersonId, ValueId } from './people.ts';
import type { Permille } from './permille.ts';
import type { KernelRules } from './rules.ts';
import {
  newId,
  type DirectiveId,
  type FactionId,
  type GameState,
  type GrievanceKind,
  type Objective,
  type PostId,
} from './state.ts';

/**
 * Low-level state operations shared by the verbs and the audience. Each has
 * one job and one set of writes (CLAUDE.md rule 5).
 */

export interface DirectOptions {
  readonly insisted?: boolean;
  readonly counterOf?: DirectiveId | null;
  readonly framing?: ValueId | null;
  readonly promisedForce?: number;
}

/** Issue a directive: it travels to the post and is read by whoever holds it on arrival. */
export function direct(
  state: GameState,
  factionId: FactionId,
  postId: PostId,
  objective: Objective,
  boldness: Permille,
  options: DirectOptions = {},
): string | null {
  const post = state.posts[postId];
  if (!post || post.factionId !== factionId) return `unknown post ${postId}`;
  if (!Number.isSafeInteger(boldness) || boldness < 0 || boldness > 1000) return 'boldness must be an integer permille';
  if (objective.kind === 'attack') {
    const region = state.regions[post.regionId]!;
    if (!region.neighbours.includes(objective.targetRegionId)) return `region ${objective.targetRegionId} is not adjacent to ${postId}`;
    if (state.regions[objective.targetRegionId]!.controllerId === factionId) return 'cannot attack a region you control';
  }
  // A new directive supersedes any earlier one to the same post that is not yet executing.
  for (const id of sortedKeys(state.directives)) {
    const prior = state.directives[id]!;
    if (prior.postId === postId && (prior.status === 'in_transit' || prior.status === 'awaiting_answer')) {
      prior.status = 'superseded';
    }
  }
  const id = newId(state, 'dir');
  state.directives[id] = {
    id,
    factionId,
    postId,
    issuedDay: state.day,
    objective,
    boldness,
    insisted: options.insisted ?? false,
    counterOf: options.counterOf ?? null,
    framing: options.framing ?? null,
    promisedForce: options.promisedForce ?? 0,
    status: 'in_transit',
    response: null,
  };
  send(state, state.day, post.linkDays, { kind: 'directive', directiveId: id });
  return null;
}

/** Add a typed grievance. It also costs regard immediately. */
export function addGrievance(state: GameState, personId: PersonId, kind: GrievanceKind, rules: KernelRules): void {
  const person = state.persons[personId]!;
  const weight = rules.grievanceWeight[kind];
  person.grievances.push({ kind, weight, sinceDay: state.day });
  person.regard = clampRegard(person.regard - Math.trunc(weight / 2));
}

/** Remove every grievance of the given kinds. Returns the total weight removed. */
export function removeGrievances(state: GameState, personId: PersonId, kinds: readonly GrievanceKind[]): number {
  const person = state.persons[personId]!;
  let removed = 0;
  person.grievances = person.grievances.filter((g) => {
    if (!kinds.includes(g.kind)) return true;
    removed += g.weight;
    return false;
  });
  return removed;
}

/** If a promise to this person is pending, it is kept now. */
export function keepPromise(state: GameState, factionId: FactionId, personId: PersonId): void {
  const faction = state.factions[factionId]!;
  const index = faction.promises.findIndex((p) => p.personId === personId);
  if (index < 0) return;
  faction.promises.splice(index, 1);
  faction.record.push({ day: state.day, kind: 'promise_kept', personId });
}
