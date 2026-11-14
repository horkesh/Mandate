/**
 * The commander's planning profile (planner-design D2, D7), derived from the
 * same stand-in traits the kernel's relay, filter and belief rules read
 * (`standin/traits.ts`, decision 0058). Every number is a design parameter.
 *
 * Boldness comes from the person's cited nerve centre by 0058's table. His
 * demand ratio is the kernel's `demandRatio`. His perception bias is NOT a
 * profile field: it is applied in belief derivation (`beliefsFor`), so his
 * dispatches and his plans inflate the enemy by the same amount (0052).
 */
import { clampPermille, phase0, type world as w } from '@mandate/kernel';
import type { PersonId, Profile, RegionId } from './types.ts';

/** 0058's stand-in mapping from a nerve centre to boldness. */
export const BOLDNESS_FROM_NERVE: Readonly<Record<string, number>> = Object.freeze({ high: 800, above: 650, average: 500, below: 350, low: 200 });

/** The same table for competence, used only for how many axes he can run and how well he coordinates them. */
export const COMPETENCE_FROM_CENTRE: Readonly<Record<string, number>> = BOLDNESS_FROM_NERVE;

export function boldnessOf(person: w.PersonRecord): number {
  const d = person.centres.nerve.direction;
  return d === null ? 500 : BOLDNESS_FROM_NERVE[d]!;
}

export function competenceOf(person: w.PersonRecord): number {
  const d = person.centres.competence.direction;
  return d === null ? 500 : COMPETENCE_FROM_CENTRE[d]!;
}

/** The stand-in trait holder the kernel's rules read. Values are empty and regard 0 until Phase 1 (0058). */
export function traitHolder(person: PersonId, boldness: number): phase0.TraitHolder {
  return { id: person, boldness, regard: 0, values: [] };
}

export function profileOf(person: PersonId, boldness: number, competence: number, rules: phase0.TraitRules = phase0.DEFAULT_TRAIT_RULES): Profile {
  const timid = 1000 - boldness;
  return {
    person,
    boldness,
    demand: phase0.demandRatio(rules, traitHolder(person, boldness)),
    riskWeight: clampPermille(200 + timid),
    supplyCare: clampPermille(1100 - boldness),
    gloryWeight: boldness,
    concentrationDays: 1 + Math.trunc(timid / 250),
    pauseDays: 1 + Math.trunc(timid / 400),
    maxAxes: competence >= 800 ? 3 : competence >= 500 ? 2 : 1,
    competence,
  };
}

/**
 * His beliefs about the enemy: each reported figure, times the intelligence
 * source's bias (a separate term, 0052), times his own perception bias, by the
 * kernel's one formula (`perceived`). A stand-in for `enemyBeliefs`, which
 * needs a seat's knowledge and State; it applies the same two terms in the
 * same order.
 */
export function beliefsFor(
  reported: ReadonlyMap<RegionId, number>,
  sourceBiasPermille: number,
  holder: phase0.TraitHolder,
  rules: phase0.TraitRules = phase0.DEFAULT_TRAIT_RULES,
): { readonly beliefs: ReadonlyMap<RegionId, number>; readonly perceptionPermille: number } {
  const bias = phase0.perceptionBias(rules, holder).permille;
  const out = new Map<RegionId, number>();
  for (const [region, men] of reported) out.set(region, phase0.perceived(phase0.perceived(men, sourceBiasPermille), bias));
  return { beliefs: out, perceptionPermille: bias };
}
