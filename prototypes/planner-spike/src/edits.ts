/**
 * The 0026 edit grammar (planner-design D11, D12): an axis's objective, its
 * waypoints, its timing, adding an axis with an objective, removing an axis.
 * Each edit is applied to a copy of the chosen candidate, re-expanded by the
 * same machinery, and scored by HIS scorer. Its distance from his judgement is
 * his best score minus the edited plan's. The kernel's `resolveDirective`
 * then decides how he answers; the seat never does (FOUNDATION section 8).
 *
 * An edit that cannot be expanded (an unreachable waypoint) is a validation
 * failure with a reason, not a compliance outcome.
 */
import { resolveDirective, clampPermille, type ComplianceRung, type DirectiveResponse, type ProxyProfile } from '@mandate/kernel';
import { blocksOf, makeCtx, type Ctx, type PlannerInput } from './context.ts';
import { buildAxis, splitBlocks } from './axes.ts';
import { overlap, search, viaRoute, type Weights } from './route.ts';
import { makeCandidate } from './score.ts';
import type { Axis, Candidate, DraftSet, ForceStandIn, RegionId, TermKind } from './types.ts';

export type Edit =
  | { readonly kind: 'objective'; readonly axis: string; readonly objective: RegionId }
  | { readonly kind: 'waypoints'; readonly axis: string; readonly via: readonly RegionId[] }
  | { readonly kind: 'timing'; readonly axis: string; readonly concentrationDays: number }
  | { readonly kind: 'add_axis'; readonly objective: RegionId }
  | { readonly kind: 'remove_axis'; readonly axis: string };

export type EditResult =
  | { readonly ok: true; readonly edited: Candidate; readonly distance: number; readonly fell: readonly { readonly term: TermKind; readonly drop: number }[] }
  | { readonly ok: false; readonly reason: string };

function weights(ctx: Ctx): Weights {
  return { riskWeight: ctx.input.profile.riskWeight, supplyCare: ctx.input.profile.supplyCare, obstacles: 'deliberate' };
}

function blocksOfAxis(ctx: Ctx, axis: Axis): ForceStandIn[] {
  return axis.blocks.map((id) => ctx.input.forces.find((f) => f.id === id)!).filter(Boolean);
}

function rebuild(ctx: Ctx, axis: Axis, over: { route?: Axis['route']; blocks?: ForceStandIn[]; concentrationDays?: number }): Axis {
  const depotSteps = axis.phases.some((p) => p.kind === 'depot_step');
  return buildAxis(ctx, {
    id: axis.id,
    post: axis.post,
    mode: axis.mode,
    route: over.route ?? axis.route,
    blocks: over.blocks ?? blocksOfAxis(ctx, axis),
    depotSteps,
    ...(over.concentrationDays !== undefined ? { concentrationDays: over.concentrationDays } : {}),
  });
}

export function applyEdit(input: PlannerInput, set: DraftSet, chosen: Candidate, edit: Edit): EditResult {
  // An edit to a different objective is scored against that objective (his scorer, the edited goal).
  const goal = edit.kind === 'objective' ? { ...input.goal, objective: edit.objective } : input.goal;
  const ctx = makeCtx({ ...input, goal });
  const find = (id: string) => chosen.axes.find((a) => a.id === id);
  let axes: Axis[];
  switch (edit.kind) {
    case 'objective': {
      const a = find(edit.axis);
      if (!a) return { ok: false, reason: `no axis ${edit.axis}` };
      const r = search(ctx, a.route.from, edit.objective, a.mode, weights(ctx));
      if (r === null) return { ok: false, reason: `no ${a.mode} route from ${a.route.from} to ${edit.objective}` };
      axes = chosen.axes.map((x) => (x.id === a.id ? rebuild(ctx, x, { route: r }) : x));
      break;
    }
    case 'waypoints': {
      const a = find(edit.axis);
      if (!a) return { ok: false, reason: `no axis ${edit.axis}` };
      const { route, unreachable } = viaRoute(ctx, a.route.from, edit.via, a.route.to, a.mode, weights(ctx));
      if (route === null) return { ok: false, reason: `waypoint ${unreachable} cannot be reached by ${a.mode}` };
      axes = chosen.axes.map((x) => (x.id === a.id ? rebuild(ctx, x, { route }) : x));
      break;
    }
    case 'timing': {
      const a = find(edit.axis);
      if (!a) return { ok: false, reason: `no axis ${edit.axis}` };
      axes = chosen.axes.map((x) => (x.id === a.id ? rebuild(ctx, x, { concentrationDays: edit.concentrationDays }) : x));
      break;
    }
    case 'add_axis': {
      if (chosen.axes.length >= input.profile.maxAxes + 1) return { ok: false, reason: 'the plan already has as many axes as the grammar allows him plus one' };
      const mine = chosen.axes.filter((x) => x.post === input.post);
      const pool = mine.flatMap((x) => blocksOfAxis(ctx, x));
      if (pool.length < 2) return { ok: false, reason: 'too few blocks to form another axis' };
      const from = mine[0]!.route.from;
      const r = search(ctx, from, edit.objective, 'land', weights(ctx));
      if (r === null) return { ok: false, reason: `no route to ${edit.objective}` };
      const [keep, give] = splitBlocks(pool, [2, 1]);
      const others = chosen.axes.filter((x) => x.post !== input.post);
      axes = [rebuild(ctx, mine[0]!, { blocks: keep! }), buildAxis(ctx, { id: `added:${edit.objective}`, post: input.post, mode: 'land', route: r, blocks: give!, depotSteps: false }), ...others];
      break;
    }
    case 'remove_axis': {
      const a = find(edit.axis);
      if (!a) return { ok: false, reason: `no axis ${edit.axis}` };
      if (chosen.axes.length === 1) return { ok: false, reason: 'a plan needs one axis' };
      const rest = chosen.axes.filter((x) => x.id !== a.id);
      // His own blocks from the removed axis go to his first remaining axis; a partner's simply stay home.
      const target = rest.find((x) => x.post === a.post);
      axes = target ? rest.map((x) => (x === target ? rebuild(ctx, x, { blocks: [...blocksOfAxis(ctx, x), ...blocksOfAxis(ctx, a)] }) : x)) : rest;
      break;
    }
  }
  const requests = chosen.requests.filter((r) => r.kind !== 'reinforcement').filter((r) => r.kind !== 'cooperating_axis' || axes.some((x) => x.post === r.to || x.id === 'partner'));
  const edited = makeCandidate(ctx, chosen.method, `${chosen.variant}+${edit.kind}`, axes, requests);
  // His judgement: the best he drafted for the goal as he understood it.
  const best = set.candidates[0]!.score;
  const distance = clampPermille(best - edited.score);
  const fell = chosen.contributions
    .map((c) => ({ term: c.term, drop: c.amount - (edited.contributions.find((e) => e.term === c.term)?.amount ?? 0) }))
    .filter((x) => x.drop > 0)
    .sort((x, y) => y.drop - x.drop || (x.term < y.term ? -1 : 1));
  return { ok: true, edited, distance, fell };
}

/** A plan's riskiness, from its risk terms: exposure, supply, haste and any shortfall of force. Holding is the timid floor. */
export function riskOf(c: Candidate, holdingRisk = -400): number {
  if (c.method === 'holding') return holdingRisk;
  const t = (k: TermKind) => c.contributions.find((x) => x.term === k)?.amount ?? 0;
  return -t('exposure') - Math.trunc(t('supply') / 2) - t('haste') - Math.min(0, t('force_ratio'));
}

/**
 * A plan's boldness on the directive scale, relative to HIS judgement (D12):
 * his own best candidate maps to his own boldness, so the temperament term of
 * compliance sees only how much riskier or safer the edit is than what he would
 * have chosen. An absolute mapping put a bold man's favourite plan at a
 * boldness he found "too timid" (spike finding).
 */
export function planBoldness(input: PlannerInput, set: DraftSet, edited: Candidate): number {
  return clampPermille(input.profile.boldness + riskOf(edited) - riskOf(set.candidates[0]!));
}

/**
 * How he answers an edited plan, through the kernel's compliance: the plan
 * maps to `DirectiveTerms` (boldness relative to his best, `required` from his
 * demand), and an "overruled" grievance scales with the edit's distance.
 */
export function respond(input: PlannerInput, set: DraftSet, edited: Candidate, distance: number, proxy: Omit<ProxyProfile, 'id' | 'boldness'>): DirectiveResponse {
  const strength = edited.axes.reduce((s, a) => s + a.strength, 0);
  const needed = Math.trunc((edited.perceivedAtObjective * input.profile.demand) / 1000);
  return resolveDirective(
    { id: input.profile.person, boldness: input.profile.boldness, ...proxy },
    { boldness: planBoldness(input, set, edited), honours: [], offends: [], required: clampPermille(strength === 0 ? 1000 : Math.trunc((needed * 500) / strength)) },
    { available: 500, oversight: 500, leaderCredibility: 500, grievances: distance > 0 ? [{ kind: 'overruled', weight: distance }] : [] },
  );
}

/** The concrete plan behind each covert rung (D12). */
export function concretePlan(input: PlannerInput, set: DraftSet, edited: Candidate, rung: ComplianceRung): Candidate {
  if (rung === 'reinterpret') {
    // He executes the candidate of his own nearest the edit, by ground covered.
    const ground = (c: Candidate) => c.axes.flatMap((a) => a.route.legs.map((l) => l.to));
    const own = set.candidates.filter((c) => c.method !== 'holding');
    return [...own].sort((a, b) => overlap(ground(edited), ground(b)) - overlap(ground(edited), ground(a)) || (a.id < b.id ? -1 : 1))[0] ?? edited;
  }
  if (rung === 'slow_walk') {
    const ctx = makeCtx(input);
    const stretch = input.profile.concentrationDays * 1000;
    const axes = edited.axes.map((a) =>
      buildAxis(ctx, { id: a.id, post: a.post, mode: a.mode, route: a.route, blocks: blocksOf(input, a.post).filter((b) => a.blocks.includes(b.id)), depotSteps: a.phases.some((p) => p.kind === 'depot_step'), stretchPermille: stretch }),
    );
    return makeCandidate(ctx, edited.method, `${edited.variant}+slow_walk`, axes, edited.requests.filter((r) => r.kind !== 'reinforcement'));
  }
  return edited;
}
