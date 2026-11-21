/** Preview an arrow edit on the immutable enclosure that reached the principal (0062).
 * Its route and distance use the submitted judgement, not today's unreceived intelligence or a later holder.
 * Execution still re-expands on arrival and may differ; compliance is never predicted here.
 */
import type { PersonId, PostId } from '../ids.ts';
import type { EditTerms } from '../log/commands.ts';
import { applyEdit, type EditFailure } from '../planner/edits.ts';
import { inputFromPaper } from '../planner/paper.ts';
import { editIssues, type EditProblem } from '../plans/goal.ts';
import type { State } from '../root-state.ts';
import type { OptionView } from '../seats/api.ts';
import { receivedPlanPapers } from '../seats/received.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { editOf } from './orders.ts';
import { optionView } from './plans.ts';

export type EditPreviewFailure =
  | { readonly kind: 'invalid-edit'; readonly problems: readonly EditProblem[] }
  | { readonly kind: 'no-plan-draft' | 'no-plan-chosen'; readonly post: PostId }
  | EditFailure;

export type EditPreview = { readonly ok: true; readonly plan: OptionView } | { readonly ok: false; readonly reason: EditPreviewFailure };

/** Counterfactual on the received enclosure's written-day basis. No current commander, intelligence or profile read. */
export function previewEdit(world: SeatsWorld, state: State, post: PostId, edit: EditTerms, _day: number, principal?: PersonId): EditPreview {
  const spec = editOf(edit);
  const problems = editIssues(spec);
  if (problems.length > 0) return { ok: false, reason: { kind: 'invalid-edit', problems } };
  const issuer = principal ?? state.planRecords[post]?.planIssuer;
  const received = issuer === undefined ? undefined : receivedPlanPapers(state, issuer).find(r => r.knownBody.reportPlan?.paperPost === post);
  const paper = received?.knownBody.reportPlan;
  if (paper === undefined) return { ok: false, reason: { kind: 'no-plan-draft', post } };
  const result = applyEdit(inputFromPaper(world,paper), paper.paperDraft, paper.paperChosen, spec);
  return result.ok ? { ok: true, plan: optionView(result.edited, false) } : { ok: false, reason: result.reason };
}
