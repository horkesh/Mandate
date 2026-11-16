/**
 * A person's trait inputs, read from people State and the World (lane 1.1, which retires lane 0.6's labelled stand-in
 * trait adapter, 0058). The seats layer, the planner, belief derivation and the reading of orders and reports all read a
 * man through `traitsOf`: his drawn boldness and candour, his public standing, his regard for his principal, and the
 * values the World cites for him.
 *
 * The two shading rules lane 0.6 wrote as stand-ins keep their call sites and their shape (`perceptionBias`,
 * `demandRatio`), with the pack's numbers (`WorldRules.people.traits`, 0072) and the pack's values in place of names.
 */
import { sideOfPerson } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import type { PersonId } from '../ids.ts';
import { term, type BiasTerm } from '../knowledge/truth.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import { regardOf, trueOf } from './people.ts';
import type { TraitRules } from './rules.ts';

/** A man as the mechanisms that read his temperament see him. */
export interface PersonTraits {
  readonly id: PersonId;
  /** Drawn boldness, permille: how bold he likes action to be. */
  readonly boldness: number;
  /** Drawn candour, permille: how truthfully he reports his own conduct. */
  readonly candour: number;
  /** Public standing, permille. */
  readonly standing: number;
  /** Regard for his principal today (his side's), signed permille; 0 for a man with no side or the principal himself. */
  readonly regard: number;
  /** The values the World cites for him, in id order. */
  readonly values: readonly string[];
}

/** The principal of each faction, as the seats layer's World knows them (kept narrow so `people` needs no seats import). */
export interface PrincipalLookup {
  readonly map: WorldIndex;
  readonly factionIds: readonly string[];
  faction(id: string): { readonly principal: PersonId };
}

/** His values as the World cites them, in id order. Throws for a person the World lacks. */
export function valuesOf(map: WorldIndex, person: PersonId): readonly string[] {
  const rec = map.world.people.find((p) => p.id === person);
  if (rec === undefined) throw new RangeError(`unknown person id "${person}"`);
  return [...new Set(rec.values.map((v) => v.value))].sort(strictCompare);
}

/** A man's trait inputs today: from people State (drawn stats, standing, regard) and the World (values). */
export function traitsOf(world: PrincipalLookup, state: State, person: PersonId): PersonTraits {
  const t = trueOf(state, person);
  const side = sideOfPerson(world.map, state, person);
  const principal = side !== null && world.factionIds.includes(side) ? world.faction(side).principal : null;
  return {
    id: person,
    boldness: t.trueBoldness,
    candour: t.trueCandour,
    standing: state.personStanding[person] ?? 0,
    regard: principal === null || principal === person ? 0 : regardOf(state, person, principal),
    values: valuesOf(world.map, person),
  };
}

/** What `perceptionBias` and `demandRatio` read of a man. */
export interface PerceivingPerson {
  readonly id: PersonId;
  readonly boldness: number;
  readonly values: readonly string[];
}

/**
 * How much larger a man sees the enemy than his sources report, permille (1000: as reported). Belief derivation applies
 * it, so his dispatches and his plans inflate the enemy by the same amount (planner-design finding 3). The terms name
 * the rule that applied: his boldness below the pivot, and each value the pack says makes a man see more.
 */
export function perceptionBias(rules: TraitRules, p: PerceivingPerson): { readonly permille: number; readonly terms: readonly BiasTerm[] } {
  const below = Math.max(0, rules.perceptionPivot - p.boldness);
  const held = rules.perceptionValues.filter((v) => p.values.includes(v.value));
  const fromValues = held.reduce((sum, v) => sum + v.permille, 0);
  const permille = Math.min(rules.perceptionMax, 1000 + below * rules.perceptionPerPoint + fromValues);
  const rule = held.length === 0 ? 'boldness' : `boldness+${held.map((v) => v.value).join('+')}`;
  return { permille, terms: [term('perception_bias', permille, { person: p.id, rule })] };
}

/** The force ratio, permille, a man needs over the enemy he perceives before he will advance. */
export function demandRatio(rules: TraitRules, p: PerceivingPerson): number {
  return rules.demandBase + Math.max(0, rules.perceptionPivot - p.boldness) * rules.demandPerPoint;
}
