import { sortedKeys } from './compare.ts';
import type { PersonId } from './people.ts';
import { clamp, clampPermille, scale, type Permille, type SignedPermille } from './permille.ts';
import type { KernelRules } from './rules.ts';
import { LADDER, type FactionId, type GameState, type LadderRung, type Post, type RegionId } from './state.ts';

/**
 * Derived values. These are recomputed from state on demand and never stored
 * (CLAUDE.md rule 5).
 */

/** The principal's mandate: support of its blocs, weighted (P10). Range -1000..1000. */
export function mandate(state: GameState, factionId: FactionId): SignedPermille {
  let total = 0;
  for (const id of sortedKeys(state.blocs)) {
    const bloc = state.blocs[id]!;
    if (bloc.factionId === factionId) total += scale(bloc.support, bloc.weight);
  }
  return total;
}

/** How credible the principal's sanctions are, from the record of dismissals and overrides (P7). */
export function sanctionCredibility(state: GameState, factionId: FactionId, rules: KernelRules): Permille {
  const record = state.factions[factionId]!.record;
  const dismissals = record.filter((r) => r.kind === 'dismissal').length;
  const overrides = record.filter((r) => r.kind === 'override').length;
  return clampPermille(
    rules.baseCredibility + dismissals * rules.credibilityPerDismissal + overrides * rules.credibilityPerOverride,
  );
}

/** How much the principal's promises are believed: kept / (kept + broken). */
export function promiseCredibility(state: GameState, factionId: FactionId, rules: KernelRules): Permille {
  const record = state.factions[factionId]!.record;
  const kept = record.filter((r) => r.kind === 'promise_kept').length;
  const broken = record.filter((r) => r.kind === 'promise_broken').length;
  if (kept + broken === 0) return rules.defaultPromiseCredibility;
  return Math.trunc((kept * 1000) / (kept + broken));
}

/** The post a person currently holds, if any. */
export function postOf(state: GameState, personId: PersonId): Post | null {
  for (const id of sortedKeys(state.posts)) {
    const post = state.posts[id]!;
    if (post.holderId === personId) return post;
  }
  return null;
}

/** How closely the principal watches a person: distance erodes it; overseers and pressure add to it. */
export function oversightOf(state: GameState, personId: PersonId, rules: KernelRules): Permille {
  const person = state.persons[personId]!;
  const faction = state.factions[person.factionId]!;
  const link = postOf(state, personId)?.linkDays ?? 0;
  let value = faction.baseOversight - link * faction.oversightLossPerLinkDay;
  if (person.overseen) value += rules.overseerOversight;
  if (person.pressuredUntil >= state.day) value += rules.pressureOversight;
  return clampPermille(value);
}

export function ladderIndex(rung: LadderRung): number {
  return LADDER.indexOf(rung);
}

/** Willingness adjustment from a person's ladder rung (P5). */
export function dispositionOf(state: GameState, personId: PersonId, rules: KernelRules): number {
  return -ladderIndex(state.persons[personId]!.ladder) * rules.dispositionPerRung;
}

/** Total grievance weight a person carries. */
export function grievanceLoad(state: GameState, personId: PersonId): number {
  return state.persons[personId]!.grievances.reduce((sum, g) => sum + g.weight, 0);
}

/** All defending force in a region: the controller's posts there plus the static garrison. */
export function defendingForce(state: GameState, regionId: RegionId): number {
  const region = state.regions[regionId]!;
  let force = region.garrison;
  for (const id of sortedKeys(state.posts)) {
    const post = state.posts[id]!;
    if (post.regionId === regionId && post.factionId === region.controllerId) force += post.force;
  }
  return force;
}

/** Best competence among the controller's holders in a region (or a militia default). */
export function defendingCompetence(state: GameState, regionId: RegionId): Permille {
  const region = state.regions[regionId]!;
  let best = 400;
  for (const id of sortedKeys(state.posts)) {
    const post = state.posts[id]!;
    if (post.regionId !== regionId || post.factionId !== region.controllerId || post.holderId === null) continue;
    best = Math.max(best, state.persons[post.holderId]!.competence);
  }
  return best;
}

/**
 * The holder's own assessment of an assault: how much of what is needed he has.
 * Proxies know local truth; the principal only knows what they report.
 */
export function assaultAvailability(state: GameState, post: Post, targetRegionId: RegionId, rules: KernelRules): Permille {
  const needed = Math.max(1, scale(defendingForce(state, targetRegionId), rules.attackRatio));
  return clampPermille(Math.trunc((post.force * 1000) / needed));
}

/** Days for a message between a faction's principal and one of its posts. */
export function linkDays(state: GameState, postId: string): number {
  return state.posts[postId]!.linkDays;
}

export function adjacentEnemyRegions(state: GameState, post: Post): RegionId[] {
  const region = state.regions[post.regionId]!;
  return region.neighbours.filter((n) => state.regions[n]!.controllerId !== post.factionId);
}

export function clampRegard(value: number): SignedPermille {
  return clamp(value, -1000, 1000);
}
