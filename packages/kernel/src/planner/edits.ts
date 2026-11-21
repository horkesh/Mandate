/**
 * The 0026 edit grammar (planner-design D11, D12; 0062): an axis's objective, its waypoints, its timing, adding an axis
 * with an objective, removing an axis. Each edit is applied to the chosen plan, re-expanded by the same machinery, and
 * scored by HIS scorer. Its distance from his judgement is his best score minus the edited plan's.
 *
 * The edit maps to `DirectiveTerms` (`editDirective`) read against his own best plan (lane 0.9 finding 2; 0062): his
 * best (`ownBest`) is the pack's boldness for the goal's kind, the edit moves it by the change in risk, and its distance
 * from his judgement is `departure` (lane 1.1). Compliance answers it (`answerOrder`, called by `plans` at the edit's
 * arrival); the seat never does (FOUNDATION section 8).
 *
 * An edit that cannot be expanded (an unreachable waypoint) is a validation failure with a reason, not a compliance
 * outcome.
 */
import { strictCompare } from '../compare.ts';
import type { ComplianceRung, DirectiveTerms } from '../directive.ts';
import type { RegionId } from '../ids.ts';
import { clampPermille } from '../permille.ts';
import type { EditSpec } from '../plans/goal.ts';
import { buildAxis, searchModeOf, splitBlocks } from './axes.ts';
import { blocksOf, makeCtx, type Ctx, type PlannerInput } from './context.ts';
import { weights } from './methods.ts';
import { overlap, search, viaRoute } from './route.ts';
import { demandFor, makeCandidate } from './score.ts';
import type { AxisMode, PlanAxis, PlanCandidate, DraftSet, PlannerForce, TermKind } from './types.ts';

/** A term that fell between his chosen plan and the edited one, and by how much. */
export interface Fell {
  readonly term: TermKind;
  readonly drop: number;
}

export type EditFailure =
  | { readonly kind: 'no-axis'; readonly axis: string | null }
  | { readonly kind: 'holding-axis'; readonly axis: string }
  | { readonly kind: 'no-axis-route'; readonly mode: AxisMode; readonly from: RegionId; readonly region: RegionId | null }
  | { readonly kind: 'no-waypoint'; readonly region: RegionId | null; readonly mode: AxisMode }
  | { readonly kind: 'too-many-axes' }
  | { readonly kind: 'too-few-blocks' }
  | { readonly kind: 'no-route'; readonly region: RegionId | null }
  | { readonly kind: 'last-axis' };

export type EditResult =
  | { readonly ok: true; readonly edited: PlanCandidate; readonly distance: number; readonly fell: readonly Fell[] }
  | { readonly ok: false; readonly reason: EditFailure };

/** Preserve the existing technical diagnostic written to the saved plan counter. */
export function editFailureDiagnostic(reason: EditFailure): string {
  switch (reason.kind) {
    case 'no-axis': return `no axis ${reason.axis}`;
    case 'holding-axis': return `axis ${reason.axis} holds where it stands; give a new goal instead`;
    case 'no-axis-route': return `no ${reason.mode} route from ${reason.from} to ${reason.region}`;
    case 'no-waypoint': return `waypoint ${reason.region} cannot be reached by ${reason.mode}`;
    case 'too-many-axes': return 'the plan already has as many axes as he can run, and one more';
    case 'too-few-blocks': return 'too few blocks to form another axis';
    case 'no-route': return `no route to ${reason.region}`;
    case 'last-axis': return 'a plan needs one axis';
  }
}

function blocksOfAxis(ctx: Ctx, axis: PlanAxis): PlannerForce[] {
  return axis.axisBlocks.map((id) => ctx.input.forces.find((f) => f.id === id)).filter((f): f is PlannerForce => f !== undefined);
}

function rebuild(ctx: Ctx, axis: PlanAxis, over: { readonly route?: PlanAxis['axisRoute']; readonly blocks?: PlannerForce[]; readonly concentrationDays?: number }): PlanAxis {
  return buildAxis(ctx, {
    name: axis.axisName,
    post: axis.axisPost,
    mode: axis.axisMode,
    route: over.route ?? axis.axisRoute,
    blocks: over.blocks ?? blocksOfAxis(ctx, axis),
    depotSteps: axis.axisPhases.some((p) => p.phaseKind === 'depot_step'),
    ...(over.concentrationDays !== undefined ? { concentrationDays: over.concentrationDays } : {}),
  });
}

/** Apply one edit to the chosen plan, on the ground and beliefs of `input`, scored against his draft set's best. */
export function applyEdit(input: PlannerInput, set: DraftSet, chosen: PlanCandidate, edit: EditSpec): EditResult {
  // An edit to a different objective is scored against that objective (his scorer, the edited goal).
  const goal = edit.editKind === 'objective' && edit.editRegion !== null ? { ...input.goal, goalObjective: edit.editRegion } : input.goal;
  const ctx = makeCtx({ ...input, goal });
  const find = (name: string | null) => chosen.candAxes.find((a) => a.axisName === name);
  const w = weights(ctx);
  let axes: PlanAxis[];
  switch (edit.editKind) {
    case 'objective': {
      const a = find(edit.editAxis);
      if (!a) return { ok: false, reason: { kind: 'no-axis', axis: edit.editAxis } };
      if (a.axisRoute.routeLegs.length === 0) return { ok: false, reason: { kind: 'holding-axis', axis: a.axisName } };
      const r = search(ctx, a.axisRoute.routeFrom, edit.editRegion!, searchModeOf(a.axisMode), w);
      if (r === null) return { ok: false, reason: { kind: 'no-axis-route', mode: a.axisMode, from: a.axisRoute.routeFrom, region: edit.editRegion } };
      axes = chosen.candAxes.map((x) => (x.axisName === a.axisName ? rebuild(ctx, x, { route: r }) : x));
      break;
    }
    case 'waypoints': {
      const a = find(edit.editAxis);
      if (!a) return { ok: false, reason: { kind: 'no-axis', axis: edit.editAxis } };
      if (a.axisRoute.routeLegs.length === 0) return { ok: false, reason: { kind: 'holding-axis', axis: a.axisName } };
      const { route, unreachable } = viaRoute(ctx, a.axisRoute.routeFrom, edit.editVia, a.axisRoute.routeTo, searchModeOf(a.axisMode), w);
      if (route === null) return { ok: false, reason: { kind: 'no-waypoint', region: unreachable, mode: a.axisMode } };
      axes = chosen.candAxes.map((x) => (x.axisName === a.axisName ? rebuild(ctx, x, { route }) : x));
      break;
    }
    case 'timing': {
      const a = find(edit.editAxis);
      if (!a) return { ok: false, reason: { kind: 'no-axis', axis: edit.editAxis } };
      axes = chosen.candAxes.map((x) => (x.axisName === a.axisName ? rebuild(ctx, x, { concentrationDays: edit.editConcentration! }) : x));
      break;
    }
    case 'add_axis': {
      if (chosen.candAxes.length >= input.profile.maxAxes + 1) return { ok: false, reason: { kind: 'too-many-axes' } };
      const mine = chosen.candAxes.filter((x) => x.axisPost === input.post);
      const pool = mine.flatMap((x) => blocksOfAxis(ctx, x));
      if (pool.length < 2) return { ok: false, reason: { kind: 'too-few-blocks' } };
      const from = mine[0]!.axisRoute.routeFrom;
      const r = search(ctx, from, edit.editRegion!, 'land', w);
      if (r === null) return { ok: false, reason: { kind: 'no-route', region: edit.editRegion } };
      const [keep, give] = splitBlocks(pool, [2, 1]);
      const others = chosen.candAxes.filter((x) => x.axisPost !== input.post);
      axes = [rebuild(ctx, mine[0]!, { blocks: keep! }), buildAxis(ctx, { name: `added:${edit.editRegion}`, post: input.post, mode: 'land', route: r, blocks: give!, depotSteps: false }), ...others];
      break;
    }
    case 'remove_axis': {
      const a = find(edit.editAxis);
      if (!a) return { ok: false, reason: { kind: 'no-axis', axis: edit.editAxis } };
      if (chosen.candAxes.length === 1) return { ok: false, reason: { kind: 'last-axis' } };
      const rest = chosen.candAxes.filter((x) => x.axisName !== a.axisName);
      // His own blocks from the removed axis go to his first remaining axis; a partner's simply stay home.
      const target = rest.find((x) => x.axisPost === a.axisPost);
      axes = target ? rest.map((x) => (x === target ? rebuild(ctx, x, { blocks: [...blocksOfAxis(ctx, x), ...blocksOfAxis(ctx, a)] }) : x)) : rest;
      break;
    }
  }
  const posts = new Set(axes.map((x) => x.axisPost));
  const requests = chosen.candRequests.filter((r) => r.reqKind !== 'reinforcement').filter((r) => r.reqKind !== 'cooperating_axis' || axes.some((x) => x.axisName === 'partner') || (r.reqPost !== null && posts.has(r.reqPost)));
  const edited = makeCandidate(ctx, chosen.candMethod, `${chosen.candVariant}+${edit.editKind}`, axes, requests);
  // His judgement: the best he drafted for the goal as he understood it.
  const best = set.draftCandidates[0]?.candScore ?? chosen.candScore;
  const distance = clampPermille(best - edited.candScore);
  const fell = chosen.candTerms
    .map((c) => ({ term: c.contribTerm, drop: c.contribAmount - (edited.candTerms.find((e) => e.contribTerm === c.contribTerm)?.contribAmount ?? 0) }))
    .filter((x) => x.drop > 0)
    .sort((x, y) => y.drop - x.drop || strictCompare(x.term, y.term));
  return { ok: true, edited, distance, fell };
}

/** A plan's riskiness, from its risk terms: exposure, supply, haste and any shortfall of force. A holding action is the timid floor. */
export function riskOf(c: PlanCandidate, holdingRisk: number): number {
  if (c.candMethod === 'holding') return holdingRisk;
  const t = (k: TermKind) => c.candTerms.find((x) => x.contribTerm === k)?.contribAmount ?? 0;
  return -t('exposure') - Math.trunc(t('supply') / 2) - t('haste') - Math.min(0, t('force_ratio'));
}

/**
 * What a post holds for its plan, on `editDirective`'s scale for `required` (its men needed * 500 / the men the plan
 * commits): 500 is "the men the plan commits are enough". Whoever reads a plan's terms through compliance (an edit's
 * answer, an audience) passes it as `available`, so a plan that needs more men than it commits states the shortfall.
 */
export const PLAN_HOLDS = 500;

/**
 * The directive an edited plan is, as compliance reads it (lane 0.9 finding 2; 0062; lane 1.1's terms): `base` is the
 * pack's terms for the goal's kind (`WorldRules.people.goalTerms`: its boldness and the values it honours or offends).
 * His own best plan reads as that boldness (`ownBest`); the edited plan moves it by the change in risk; `required`
 * comes from his demand against the strength the plan commits; `departure` is the edit's distance from his judgement;
 * and each support the plan asks of another post is a `SupportNeed` (an "if supported" condition unless promised).
 */
export function editDirective(input: PlannerInput, set: DraftSet, edited: PlanCandidate, distance: number, holdingRisk: number, base: DirectiveTerms): DirectiveTerms {
  const best = set.draftCandidates[0] ?? edited;
  const ctx = makeCtx(input);
  const strength = edited.candAxes.reduce((s, a) => s + a.axisStrength, 0);
  const needed = Math.trunc((edited.candPerceived * demandFor(ctx)) / 1000);
  const support = edited.candRequests
    .filter((r) => r.reqKind !== 'reinforcement')
    .map((r) => ({ supportKind: r.reqKind === 'naval_support' ? 'naval' : 'cooperating', supportFrom: r.reqPost }));
  return {
    boldness: clampPermille(base.boldness + riskOf(edited, holdingRisk) - riskOf(best, holdingRisk)),
    honours: base.honours,
    offends: base.offends,
    required: clampPermille(strength === 0 ? 1000 : Math.trunc((needed * 500) / strength)),
    ownBest: base.boldness,
    departure: clampPermille(distance),
    ...(support.length === 0 ? {} : { support }),
  };
}

/**
 * The plan he actually executes for each rung (D12): reinterpret executes his own candidate nearest the edit by ground
 * covered; slow walk stretches the edit's timing by his concentration days; object and refuse keep his own chosen plan;
 * every other rung executes the edit.
 */
export function concretePlan(input: PlannerInput, set: DraftSet, chosen: PlanCandidate, edited: PlanCandidate, rung: ComplianceRung): PlanCandidate {
  if (rung === 'object' || rung === 'refuse') return chosen;
  if (rung === 'reinterpret') {
    const ground = (c: PlanCandidate): RegionId[] => c.candAxes.flatMap((a) => a.axisRoute.routeLegs.map((l) => l.legTo));
    const own = set.draftCandidates.filter((c) => c.candMethod !== 'holding');
    return [...own].sort((a, b) => overlap(ground(edited), ground(b)) - overlap(ground(edited), ground(a)) || strictCompare(a.id, b.id))[0] ?? edited;
  }
  if (rung === 'slow_walk') {
    const ctx = makeCtx(input);
    const stretch = input.profile.concentrationDays * 1000;
    const axes = edited.candAxes.map((a) =>
      buildAxis(ctx, {
        name: a.axisName,
        post: a.axisPost,
        mode: a.axisMode,
        route: a.axisRoute,
        blocks: blocksOf(input, a.axisPost).filter((b) => a.axisBlocks.includes(b.id)),
        depotSteps: a.axisPhases.some((p) => p.phaseKind === 'depot_step'),
        stretch,
      }),
    );
    return makeCandidate(ctx, edited.candMethod, `${edited.candVariant}+slow_walk`, axes, edited.candRequests.filter((r) => r.reqKind !== 'reinforcement'));
  }
  return edited;
}
