/**
 * The day's regions phase (lane 1.7): the derived self-emancipation term (0046), recomputed on its cadence over
 * today's control and forces, proposes the people who reached the lines; `regions` alone applies them. Never a lever:
 * nothing a seat sends reaches this phase, and no seat's view or option reads its count.
 */
import { applyArrivals } from '../regions/regions.ts';
import { arrivalProposals, selfEmancipationDue, selfEmancipationTerms } from '../regions/self-emancipation.ts';
import type { State } from '../root-state.ts';
import { fire, type TickContext } from './context.ts';

/** Every mechanic the regions phase counts: census regions where the term's within cause is live, and arrivals proposed (one per region where people reached the lines). */
export const REGIONS_MECHANICS = ['regions.self_emancipation', 'regions.reached_lines'] as const;

export function regionsPhase(ctx: TickContext, state: State): State {
  const rules = ctx.world.map.world.rules.selfEmancipation;
  if (!selfEmancipationDue(rules, ctx.day)) return state;
  const terms = selfEmancipationTerms(ctx.world.map, state, rules);
  for (const t of terms) if (t.within > 0 || t.toLines > 0) fire(ctx, 'regions.self_emancipation');
  const proposals = arrivalProposals(terms);
  for (const _ of proposals) fire(ctx, 'regions.reached_lines');
  return applyArrivals(state, proposals);
}
