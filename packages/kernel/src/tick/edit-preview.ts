/**
 * The preview of an arrow edit before it is sent (lane 1.13; lane 0.9's finding 5: "the plan-review screen must
 * preview an edited route and its distance before the player sends it", since a distant waypoint can yield a route the
 * player did not mean). It re-expands the edit exactly as the commander will when it reaches him (`tick/plans.ts`'s
 * `answerEdit`): on today's map, from his view, with his scorer. The answer is the edited plan as a seat sees one
 * (`OptionView`), or the reason it cannot be made. Pure: it writes nothing, and the commander's compliance is not read
 * (that answer comes when the edit arrives, as an order).
 *
 * The edit arrives days later, on that day's map; the preview is the route as things stand today.
 */
import { deriveMap } from '../control-index/derived.ts';
import type { PostId } from '../ids.ts';
import type { EditTerms } from '../log/commands.ts';
import { applyEdit } from '../planner/edits.ts';
import { plannerInputFor } from '../planner/input.ts';
import { editProblems } from '../plans/goal.ts';
import { candidateOf } from '../plans/plans.ts';
import type { State } from '../root-state.ts';
import type { OptionView } from '../seats/api.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { createViewCache, viewFor } from '../view/view.ts';
import { monthOf } from './map.ts';
import { editOf } from './orders.ts';
import { passageOf } from './passage.ts';
import { optionView } from './plans.ts';

export type EditPreview = { readonly ok: true; readonly plan: OptionView } | { readonly ok: false; readonly reason: string };

/** The plan at `post` as `edit` would make it, re-expanded on the map of `day` from its holder's view. */
export function previewEdit(world: SeatsWorld, state: State, post: PostId, edit: EditTerms, day: number): EditPreview {
  const spec = editOf(edit);
  const problems = editProblems(spec);
  if (problems.length > 0) return { ok: false, reason: problems.join('; ') };
  const record = state.planRecords[post];
  const holder = state.postStates[post]?.postHolder ?? null;
  if (record === undefined || record.planDraft === null || holder === null) return { ok: false, reason: `${post} has no drafted plan to edit` };
  const chosen = record.planApproved ?? (record.planChosen === null ? undefined : candidateOf(record, record.planChosen));
  if (chosen === undefined) return { ok: false, reason: `${post} has not chosen a plan yet` };
  const network = passageOf(world.map, state);
  const month = monthOf(state, day);
  const derived = deriveMap(world.map, { control: state.regionControl, month, network });
  const input = plannerInputFor(world, state, derived, network, month, viewFor(world, state, seatIdFor(holder), createViewCache()), post, record.planGoal, day);
  const result = applyEdit(input, record.planDraft, chosen, spec);
  return result.ok ? { ok: true, plan: optionView(result.edited, false) } : { ok: false, reason: result.reason };
}
