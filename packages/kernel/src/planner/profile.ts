/**
 * The commander's planning profile (planner-design D2, D7; 0062: character comes from boldness and competence), from
 * the trait inputs the seats layer reads (`seats/world.ts`, which lane 1.1 re-points to the people State). His demand
 * is the trait rules' `demandRatio`. His perception of the enemy is NOT a profile field: it is applied in belief
 * derivation, so his dispatches and his plans inflate the enemy by the same amount (0052; 0062 rejects a bias knob in
 * the planner). The weights are the pack's (`WorldRules.planner.weights`).
 */
import { clampPermille } from '../permille.ts';
import type { PersonId } from '../ids.ts';
import { demandRatio, type TraitHolder, type TraitRules } from '../standin/traits.ts';
import type { PlannerWeights } from '../world/world.ts';
import type { Profile } from './types.ts';

export function profileOf(person: TraitHolder & { readonly competence: number }, traits: TraitRules, weights: PlannerWeights): Profile {
  const timid = 1000 - person.boldness;
  return {
    person: person.id as PersonId,
    boldness: person.boldness,
    demand: demandRatio(traits, person),
    riskWeight: clampPermille(weights.riskBase + timid),
    supplyCare: clampPermille(weights.supplyBase - person.boldness),
    gloryWeight: person.boldness,
    concentrationDays: 1 + Math.trunc(timid / weights.concentrationPerTimid),
    pauseDays: 1 + Math.trunc(timid / weights.pausePerTimid),
    maxAxes: person.competence >= weights.threeAxesAt ? 3 : person.competence >= weights.twoAxesAt ? 2 : 1,
    competence: person.competence,
  };
}
