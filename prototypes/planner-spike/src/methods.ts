/**
 * Candidate generators (planner-design D4): each method expands one level into
 * axes, or returns every gate that stopped it. A method never silently returns
 * nothing (AWWV's silent-drop lesson). Methods are setting-free engine code;
 * the pack tunes their thresholds through `PlannerRules`.
 */
import { answeringPost, blocksOf, type Ctx } from './context.ts';
import { buildAxis, holdingAxis, splitBlocks } from './axes.ts';
import { daysTo, overlap, penaltyFor, regionsOf, retrograde, search, type Weights } from './route.ts';
import { makeCandidate } from './score.ts';
import type { Candidate, ForceStandIn, Gate, Method, Rejected, Route, SupportRequest } from './types.ts';

export type Outcome = { readonly ok: Candidate } | { readonly rejected: Rejected };

function weights(ctx: Ctx, over: Partial<Weights> = {}): Weights {
  return { riskWeight: ctx.input.profile.riskWeight, supplyCare: ctx.input.profile.supplyCare, obstacles: 'deliberate', ...over };
}

function reject(method: Method, variant: string, gates: Gate[]): Outcome {
  return { rejected: { method, variant, gates } };
}

function own(ctx: Ctx): ForceStandIn[] {
  return blocksOf(ctx.input, ctx.input.post, ctx.input.goal.committed).filter((b) => b.arm !== 'naval');
}

function staging(blocks: readonly ForceStandIn[]): ForceStandIn['region'] | null {
  return blocks[0]?.region ?? null;
}

/** Gates on an alternative route: not too long against the direct one, and never back through his own rear. */
function alternativeGates(ctx: Ctx, route: Route, alt: Route): Gate[] {
  const g: Gate[] = [];
  const limit = Math.trunc((route.daysPermille * ctx.input.rules.flankLengthMax) / 1000);
  if (alt.daysPermille > limit) g.push({ kind: 'no_route', hard: true, detail: `alternative takes ${alt.daysPermille}‰ days against a limit of ${limit}‰` });
  const back = retrograde(alt, daysTo(ctx, route.to, 'land'), ctx.input.rules.retrogradeSlack);
  if (back !== null) g.push({ kind: 'no_route', hard: true, detail: `alternative doubles back through ${back}` });
  return g;
}

/** The least-cost land route for him, shared by direct, flank and pincer. */
export function directRoute(ctx: Ctx): Route | null {
  const from = staging(own(ctx));
  return from === null ? null : search(ctx, from, ctx.input.goal.objective, 'land', weights(ctx));
}

export function direct(ctx: Ctx, route: Route | null): Outcome {
  const blocks = own(ctx);
  const gates: Gate[] = [];
  if (blocks.length === 0) gates.push({ kind: 'no_forces', hard: true, detail: 'no land blocks under his post' });
  if (route === null) gates.push({ kind: 'no_route', hard: true, detail: `no land route to ${ctx.input.goal.objective}` });
  if (gates.length > 0) return reject('direct', 'least_cost', gates);
  const axis = buildAxis(ctx, { id: 'main', post: ctx.input.post, mode: 'land', route: route!, blocks, depotSteps: false });
  return { ok: makeCandidate(ctx, 'direct', 'least_cost', [axis], []) };
}

export function flank(ctx: Ctx, route: Route | null): Outcome {
  const blocks = own(ctx);
  const gates: Gate[] = [];
  if (blocks.length === 0) gates.push({ kind: 'no_forces', hard: true, detail: 'no land blocks under his post' });
  if (route === null) gates.push({ kind: 'no_route', hard: true, detail: 'no direct route to flank' });
  if (gates.length > 0) return reject('flank', 'penalty', gates);
  const alt = search(ctx, route!.from, route!.to, 'land', weights(ctx), penaltyFor([route!], ctx.input.rules.flankPenalty));
  if (alt === null) return reject('flank', 'penalty', [{ kind: 'no_route', hard: true, detail: 'no alternative once the direct route is penalised' }]);
  const shared = overlap(regionsOf(route!), regionsOf(alt));
  const g: Gate[] = [];
  if (shared >= ctx.input.rules.flankOverlapMax) g.push({ kind: 'duplicate', hard: true, detail: `alternative shares ${shared}‰ of the direct route` });
  g.push(...alternativeGates(ctx, route!, alt));
  if (g.length > 0) return reject('flank', 'penalty', g);
  // Re-price the alternative at his true weights (the penalty only found it).
  const axis = buildAxis(ctx, { id: 'main', post: ctx.input.post, mode: 'land', route: alt, blocks, depotSteps: false });
  return { ok: makeCandidate(ctx, 'flank', 'penalty', [axis], []) };
}

export function supplyLine(ctx: Ctx): Outcome {
  const blocks = own(ctx);
  const from = staging(blocks);
  const gates: Gate[] = [];
  if (from === null) gates.push({ kind: 'no_forces', hard: true, detail: 'no land blocks under his post' });
  const route = from === null ? null : search(ctx, from, ctx.input.goal.objective, 'land', weights(ctx, { supplyCare: 1000 }));
  if (route === null) gates.push({ kind: 'no_route', hard: true, detail: 'no land route' });
  if (gates.length > 0) return reject('supply_line', 'depot_steps', gates);
  const axis = buildAxis(ctx, { id: 'main', post: ctx.input.post, mode: 'land', route: route!, blocks, depotSteps: true });
  return { ok: makeCandidate(ctx, 'supply_line', 'depot_steps', [axis], []) };
}

/**
 * Two axes on the objective. With a partner post beside the objective, the
 * second axis is that post's, and it becomes a support request to its holder
 * with an arrival window; without one, he splits his own force over the direct
 * and flank routes (D4 two-axis).
 */
export function pincer(ctx: Ctx, route: Route | null): Outcome[] {
  const { input } = ctx;
  const blocks = own(ctx);
  const base: Gate[] = [];
  if (input.profile.maxAxes < 2) base.push({ kind: 'max_axes', hard: true, detail: `he runs at most ${input.profile.maxAxes} axis` });
  if (route === null) base.push({ kind: 'no_route', hard: true, detail: 'no main route' });
  if (blocks.length === 0) base.push({ kind: 'no_forces', hard: true, detail: 'no land blocks under his post' });
  const out: Outcome[] = [];

  // Partner version.
  const partners = input.posts
    .filter((p) => p.id !== input.post && p.region !== null && p.region !== route?.from)
    .filter((p) => blocksOf(input, p.id).some((b) => b.arm !== 'naval' && b.region === p.region))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
  const gates: Gate[] = [...base];
  if (partners.length === 0) gates.push({ kind: 'no_partner', hard: true, detail: 'no friendly post with forces beside the objective' });
  const adjacent = partners.filter((p) => input.map.edgesAt.get(p.region!)!.some((e) => (e.a === p.region ? e.b : e.a) === input.goal.objective && e.type === 'road'));
  if (partners.length > 0 && adjacent.length === 0) gates.push({ kind: 'staging_not_adjacent', hard: true, detail: `no partner stages beside ${input.goal.objective}` });
  if (route !== null && !input.map.edgesAt.get(route.from)!.some((e) => (e.a === route.from ? e.b : e.a) === input.goal.objective)) {
    gates.push({ kind: 'staging_not_adjacent', hard: true, detail: `his own staging ${route.from} is not beside ${input.goal.objective}` });
  }
  if (gates.length > 0) {
    out.push(reject('pincer', 'with_partner', gates));
  } else {
    const partner = adjacent[0]!;
    const pBlocks = blocksOf(input, partner.id).filter((b) => b.arm !== 'naval');
    const pRoute = search(ctx, partner.region!, input.goal.objective, 'land', weights(ctx));
    if (pRoute === null) {
      out.push(reject('pincer', 'with_partner', [{ kind: 'no_route', hard: true, detail: `no route from ${partner.region}` }]));
    } else {
      const mine = buildAxis(ctx, { id: 'main', post: input.post, mode: 'land', route: route!, blocks, depotSteps: false });
      const theirs = buildAxis(ctx, { id: 'partner', post: partner.id, mode: 'land', route: pRoute, blocks: pBlocks, depotSteps: false });
      const answer = answeringPost(input, partner.id);
      const conds: Gate[] = answer?.vacant ? [{ kind: 'vacant_post', hard: false, detail: `${partner.id} is vacant; ${answer.post.id} answers` }] : [];
      const req: SupportRequest = {
        kind: 'cooperating_axis',
        to: answer?.post.id ?? partner.id,
        holder: answer?.post.holder ?? null,
        from: partner.region!,
        objective: input.goal.objective,
        arriveFromPermille: mine.arrivalPermille - input.rules.pincerWindow,
        arriveToPermille: mine.arrivalPermille,
      };
      out.push({ ok: makeCandidate(ctx, 'pincer', 'with_partner', [mine, theirs], [req], conds) });
    }
  }

  // Own two-axis version: main on the direct route, a fixing axis on the flank.
  const g2: Gate[] = [...base];
  if (blocks.length < 2) g2.push({ kind: 'no_forces', hard: true, detail: 'fewer than two blocks to split' });
  const alt = route === null ? null : search(ctx, route.from, route.to, 'land', weights(ctx), penaltyFor([route], input.rules.flankPenalty));
  if (route !== null && alt === null) g2.push({ kind: 'no_route', hard: true, detail: 'no second route' });
  if (route !== null && alt !== null && overlap(regionsOf(route), regionsOf(alt)) >= input.rules.flankOverlapMax) g2.push({ kind: 'duplicate', hard: true, detail: 'second route repeats the first' });
  if (route !== null && alt !== null) g2.push(...alternativeGates(ctx, route, alt));
  if (g2.length > 0) {
    out.push(reject('pincer', 'two_axis', g2));
  } else {
    const [a, b] = splitBlocks(blocks, [2, 1]);
    const main = buildAxis(ctx, { id: 'main', post: input.post, mode: 'land', route: route!, blocks: a!, depotSteps: false });
    const fix = buildAxis(ctx, { id: 'fixing', post: input.post, mode: 'land', route: alt!, blocks: b!, depotSteps: false });
    out.push({ ok: makeCandidate(ctx, 'pincer', 'two_axis', [main, fix], []) });
  }
  return out;
}

/**
 * By water (D4 envelopment by water; the joint relief of 0040): troops carried
 * by a naval block along river or sea edges. If the carrier belongs to another
 * post, the plan carries a naval support request to that post's holder.
 * Two variants differ in how works on the way are handled: deliberately
 * (clear or reduce them, slow) or forced in a night (fast, costly).
 */
export function byWater(ctx: Ctx): Outcome[] {
  const { input } = ctx;
  const out: Outcome[] = [];
  for (const style of ['deliberate', 'force'] as const) {
    const variant = style === 'deliberate' ? 'clear_first' : 'run_in';
    const gates: Gate[] = [];
    const mode = input.goal.permissions.sea ? 'sea' : input.goal.permissions.river ? 'river' : null;
    if (mode === null) gates.push({ kind: 'needs_permission', hard: true, detail: 'neither river nor sea is permitted' });
    const troops = blocksOf(input, input.post, input.goal.committed).filter((b) => b.arm !== 'naval');
    if (troops.length === 0) gates.push({ kind: 'no_forces', hard: true, detail: 'no troops under his post' });
    // The carrier: the ship his troops are aboard, else a naval block of his own post.
    const aboard = troops.find((b) => b.aboard !== null)?.aboard ?? null;
    const carrier = (aboard !== null ? input.forces.find((f) => f.id === aboard) : blocksOf(input, input.post).find((b) => b.arm === 'naval')) ?? null;
    if (carrier === null) gates.push({ kind: 'no_carrier', hard: true, detail: 'no ship or boat to carry his troops' });
    if (gates.length > 0) {
      out.push(reject('by_water', variant, gates));
      continue;
    }
    const route = search(ctx, carrier!.region, input.goal.objective, mode!, { riskWeight: input.profile.riskWeight, supplyCare: 0, obstacles: style });
    if (route === null) {
      out.push(reject('by_water', variant, [{ kind: 'no_route', hard: true, detail: `no ${mode} route from ${carrier!.region}` }]));
      continue;
    }
    const requests: SupportRequest[] = [];
    const conds: Gate[] = [];
    if (carrier!.post !== input.post) {
      const answer = answeringPost(input, carrier!.post);
      if (answer?.vacant) conds.push({ kind: 'vacant_post', hard: false, detail: `${carrier!.post} is vacant; ${answer.post.id} answers` });
      requests.push({ kind: 'naval_support', to: answer?.post.id ?? carrier!.post, holder: answer?.post.holder ?? null, carrier: carrier!.id, route: route.legs.map((l) => l.edge) });
    }
    const axis = buildAxis(ctx, { id: 'afloat', post: input.post, mode: mode!, route, blocks: troops, depotSteps: false });
    out.push({ ok: makeCandidate(ctx, 'by_water', variant, [axis], requests, conds) });
  }
  return out;
}

export function holding(ctx: Ctx): Outcome {
  const blocks = blocksOf(ctx.input, ctx.input.post, ctx.input.goal.committed).filter((b) => b.arm !== 'naval');
  if (blocks.length === 0) return reject('holding', 'hold', [{ kind: 'no_forces', hard: true, detail: 'nothing to hold with' }]);
  const kind = ctx.input.goal.posture === 'relieve' ? 'await' : 'hold';
  return { ok: makeCandidate(ctx, 'holding', kind, [holdingAxis(ctx, ctx.input.post, blocks, kind)], []) };
}
