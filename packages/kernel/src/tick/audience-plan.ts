/**
 * What an audience during a plan is about (lane 1.5; the lead's ruling on review item 7): the chosen candidate's terms,
 * as lane 1.2's `editDirective` builds them for an edit, read with no edit (distance 0). Boldness comes from his own
 * best, `required` from the candidate's men needed against what it commits, and support from its requests. Before a
 * plan the audience stays on the goal's terms (`reading/orders.ts`), which carry no `required`: the force-ratio number
 * has one owner, the planner.
 */
import { deriveMap } from '../control-index/derived.ts';
import type { PostId } from '../ids.ts';
import { editDirective } from '../planner/edits.ts';
import { plannerInputFor } from '../planner/input.ts';
import { goalKindOf } from '../plans/goal.ts';
import { candidateOf } from '../plans/plans.ts';
import { goalTerms } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import type { PlanReading } from '../audience/audience.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { createViewCache, viewFor, type ViewCache } from '../view/view.ts';
import { monthOf } from './map.ts';
import { passageOf } from './passage.ts';

/** The plan at `post` as its holder reads it on `day`, or null when there is no drafted, chosen plan to read. */
export function planReading(world: SeatsWorld, state: State, post: PostId, day: number, cache: ViewCache = createViewCache()): PlanReading | null {
  const record = state.planRecords[post];
  const holder = state.postStates[post]?.postHolder ?? null;
  if (record === undefined || record.planDraft === null || holder === null) return null;
  const chosen = record.planApproved ?? (record.planChosen === null ? undefined : candidateOf(record, record.planChosen));
  if (chosen === undefined) return null;
  const network = passageOf(world.map, state);
  const month = monthOf(state, day);
  const derived = deriveMap(world.map, { control: state.regionControl, month, network });
  const input = plannerInputFor(world, state, derived, network, month, viewFor(world, state, seatIdFor(holder), cache), post, record.planGoal, day);
  const terms = editDirective(input, record.planDraft, chosen, 0, world.map.world.rules.plans.holdingRisk, goalTerms(world.rules.people, goalKindOf(record.planGoal)));
  return { terms, strength: chosen.candAxes.reduce((s, a) => s + a.axisStrength, 0) };
}
