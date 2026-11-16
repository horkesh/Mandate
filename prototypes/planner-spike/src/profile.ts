/**
 * The commander's planning profile (planner-design D2, D7), derived from the
 * trait rules the kernel's belief rules read (now `people/traits.ts` with
 * each pack's numbers, lane 1.1; decision 0058). Every number is a design parameter.
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

/**
 * The trait rules this prototype was measured with: lane 0.6's stand-in values, which the kernel now reads from each
 * pack (`WorldRules.people.traits`, lane 1.1). Kept here so the prototype's recorded findings still reproduce.
 */
export const PROTOTYPE_TRAIT_RULES: phase0.TraitRules = Object.freeze({
  perceptionPivot: 500,
  perceptionPerPoint: 3,
  perceptionValues: [{ value: 'caution', permille: 500 }],
  perceptionMax: 4000,
  demandBase: 1000,
  demandPerPoint: 2,
  holdBand: 1500,
  wantsMenPermille: 800,
  paperPermille: 1400,
});

/** The trait inputs the kernel's rules read. Values are empty, as the prototype ran (0058). */
export function traitHolder(person: PersonId, boldness: number): phase0.PerceivingPerson {
  return { id: person, boldness, values: [] };
}

export function profileOf(person: PersonId, boldness: number, competence: number, rules: phase0.TraitRules = PROTOTYPE_TRAIT_RULES): Profile {
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
  holder: phase0.PerceivingPerson,
  rules: phase0.TraitRules = PROTOTYPE_TRAIT_RULES,
): { readonly beliefs: ReadonlyMap<RegionId, number>; readonly perceptionPermille: number } {
  const bias = phase0.perceptionBias(rules, holder).permille;
  const out = new Map<RegionId, number>();
  for (const [region, men] of reported) out.set(region, phase0.perceived(phase0.perceived(men, sourceBiasPermille), bias));
  return { beliefs: out, perceptionPermille: bias };
}
