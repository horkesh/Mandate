/**
 * Candidate generators (planner-design D4; 0062: one level of methods): each method expands into axes, or returns
 * every gate that stopped it. A method never silently returns nothing (AWWV's silent-drop lesson). Methods are
 * setting-free engine code; the pack tunes their thresholds (`WorldRules.planner`).
 */
import { strictCompare } from '../compare.ts';
import type { RegionId } from '../ids.ts';
import { otherEnd } from '../world/index.ts';
import { buildAxis, holdingAxis, splitBlocks } from './axes.ts';
import { answeringPost, blocksOf, willingness, type Ctx } from './context.ts';
import { daysTo, overlap, penaltyFor, regionsOf, retrograde, search, waterMode, type Weights } from './route.ts';
import { makeCandidate } from './score.ts';
import type { PlanAxis, PlanCandidate, PlanGate, Method, PlannerForce, PlannerPost, PlanRejected, PlanRoute, PlanRequest } from './types.ts';

export type Outcome = { readonly ok: PlanCandidate } | { readonly rejected: PlanRejected };

export function weights(ctx: Ctx, over: Partial<Weights> = {}): Weights {
  return { riskWeight: ctx.input.profile.riskWeight, supplyCare: ctx.input.profile.supplyCare, obstacles: 'deliberate', ...over };
}

function reject(method: Method, variant: string, gates: PlanGate[]): Outcome {
  return { rejected: { rejMethod: method, rejVariant: variant, rejGates: gates } };
}

function gate(kind: PlanGate['gateKind'], detail: string, hard = true): PlanGate {
  return { gateKind: kind, gateHard: hard, gateDetail: detail };
}

/** His land blocks for this goal: the committed ones, or every block (not detachment) of his post. */
export function own(ctx: Ctx): PlannerForce[] {
  return blocksOf(ctx.input, ctx.input.post, ctx.input.goal.goalCommitted).filter((b) => !b.naval);
}

function staging(blocks: readonly PlannerForce[]): RegionId | null {
  return blocks[0]?.region ?? null;
}

function objectiveGate(ctx: Ctx): PlanGate[] {
  return ctx.input.goal.goalObjective === null ? [gate('no_objective', 'the goal names no objective: he holds where he stands')] : [];
}

function adjacent(ctx: Ctx, a: RegionId, b: RegionId, roadOnly: boolean): boolean {
  return (ctx.input.ground.map.edgesAt.get(a) ?? []).some((e) => otherEnd(e, a) === b && (!roadOnly || e.type === 'road'));
}

/** Gates on an alternative route: not too long against the direct one, and never back through his own rear. */
function alternativeGates(ctx: Ctx, route: PlanRoute, alt: PlanRoute): PlanGate[] {
  const g: PlanGate[] = [];
  const limit = Math.trunc((route.routeDays * ctx.input.rules.flankLengthMax) / 1000);
  if (alt.routeDays > limit) g.push(gate('no_route', `alternative takes ${alt.routeDays} permille days against a limit of ${limit}`));
  const back = retrograde(alt, daysTo(ctx, route.routeTo), ctx.input.rules.retrogradeSlack);
  if (back !== null) g.push(gate('no_route', `alternative doubles back through ${back}`));
  return g;
}

/** The least-cost land route for him, shared by direct, flank and pincer. */
export function directRoute(ctx: Ctx): PlanRoute | null {
  const from = staging(own(ctx));
  const objective = ctx.input.goal.goalObjective;
  return from === null || objective === null ? null : search(ctx, from, objective, 'land', weights(ctx));
}

export function direct(ctx: Ctx, route: PlanRoute | null): Outcome {
  const blocks = own(ctx);
  const gates: PlanGate[] = objectiveGate(ctx);
  if (blocks.length === 0) gates.push(gate('no_forces', 'no land blocks under his post'));
  if (route === null && gates.length === 0) gates.push(gate('no_route', `no land route to ${ctx.input.goal.goalObjective}`));
  if (gates.length > 0) return reject('direct', 'least_cost', gates);
  const axis = buildAxis(ctx, { name: 'main', post: ctx.input.post, mode: 'land', route: route!, blocks, depotSteps: false });
  return { ok: makeCandidate(ctx, 'direct', 'least_cost', [axis], []) };
}

export function flank(ctx: Ctx, route: PlanRoute | null): Outcome {
  const blocks = own(ctx);
  const gates: PlanGate[] = objectiveGate(ctx);
  if (blocks.length === 0) gates.push(gate('no_forces', 'no land blocks under his post'));
  if (route === null && gates.length === 0) gates.push(gate('no_route', 'no direct route to flank'));
  if (gates.length > 0) return reject('flank', 'penalty', gates);
  const alt = search(ctx, route!.routeFrom, route!.routeTo, 'land', weights(ctx), penaltyFor([route!], ctx.input.rules.flankPenalty));
  if (alt === null) return reject('flank', 'penalty', [gate('no_route', 'no alternative once the direct route is penalised')]);
  const shared = overlap(regionsOf(route!), regionsOf(alt));
  const g: PlanGate[] = [];
  if (shared >= ctx.input.rules.flankOverlapMax) g.push(gate('duplicate', `alternative shares ${shared} permille of the direct route`));
  g.push(...alternativeGates(ctx, route!, alt));
  if (g.length > 0) return reject('flank', 'penalty', g);
  // Re-priced at his true weights through the axis (the penalty only found it).
  const axis = buildAxis(ctx, { name: 'main', post: ctx.input.post, mode: 'land', route: alt, blocks, depotSteps: false });
  return { ok: makeCandidate(ctx, 'flank', 'penalty', [axis], []) };
}

/**
 * Bombard (lane 1.12; `combat/bombard.ts`): a goal to take an objective that lies across a short water edge (within the
 * pack's battery range) from ground his side holds, where his guns stand. He fires on it from there; nothing crosses.
 * Only a fort's works or a force in it is a target (`BOMBARD_TARGET_KINDS`): an objective where he believes no enemy
 * stands and knows of no works is refused (`no_target`), so a town is never bombarded as such. The guns are his blocks of
 * the pack's gun arms; with several such shores he fires from the one with the most, ties by region id.
 */
export function bombard(ctx: Ctx): Outcome {
  const { input } = ctx;
  const objective = input.goal.goalObjective;
  const gates: PlanGate[] = objectiveGate(ctx);
  if (input.goal.goalPosture !== 'take') gates.push(gate('no_objective', 'only a goal to take is bombarded'));
  if (gates.length > 0) return reject('bombard', 'across_water', gates);
  // G-1.12a: only a fortification the pack lets be bombarded, cited; a town is refused whatever force stands in it.
  if (!input.bombardment.objectives.some((o) => o.region === objective)) return reject('bombard', 'across_water', [gate('no_target', `${objective} is not a fortification the rules let be bombarded (combat.bombardment.objectives)`)]);
  const target = (input.beliefs.get(objective!) ?? 0) > 0 || (input.works.get(objective!) ?? 0) > 0;
  if (!target) return reject('bombard', 'across_water', [gate('no_target', `no force he believes in ${objective} and no works he knows of: nothing a bombardment may fire on`)]);
  // His land force, garrison detachments included: a shore's batteries are garrisons, and a bombardment moves nobody.
  const blocks = input.forces.filter((b) => b.post === input.post && !b.naval && b.aboard === null);
  if (blocks.length === 0) return reject('bombard', 'across_water', [gate('no_forces', 'no land blocks under his post')]);
  const guns = (region: RegionId) => blocks.filter((b) => b.region === region && input.bombardment.gunArms.includes(b.arm)).reduce((s, b) => s + b.strength, 0);
  const shores: { readonly region: RegionId; readonly guns: number }[] = [];
  const passed: string[] = [];
  for (const e of input.ground.map.edgesAt.get(objective!) ?? []) {
    if (e.type !== 'river' && e.type !== 'sea') continue;
    const shore = otherEnd(e, objective!);
    if (input.ground.index.holdings.get(shore)?.holder !== input.faction) {
      passed.push(`${shore}: not held`);
      continue;
    }
    if (e.lengthDays * 1000 > input.bombardment.rangeMaxDaysPermille) {
      passed.push(`${shore}: ${e.lengthDays * 1000} permille days, beyond range`);
      continue;
    }
    const g = guns(shore);
    if (g > 0) shores.push({ region: shore, guns: g });
    else passed.push(`${shore}: no guns of his`);
  }
  if (shores.length === 0) return reject('bombard', 'across_water', [gate('no_guns', `no guns of his on held ground within range of ${objective} across water (${passed.join('; ') || 'no water edge'})`)]);
  const from = [...shores].sort((a, b) => b.guns - a.guns || strictCompare(a.region, b.region))[0]!.region;
  const here = blocks.filter((b) => b.region === from);
  // These blocks are already on the firing shore: the pack's battery preparation replaces field concentration.
  const concentrate = input.bombardment.inPositionPreparationDays * 1000;
  const axis: PlanAxis = {
    axisName: 'main',
    axisPost: input.post,
    axisMode: 'land',
    axisRoute: { routeFrom: from, routeTo: objective!, routeLegs: [], routeCost: 0, routeDays: 0 },
    axisBlocks: here.map((b) => b.id),
    axisStrength: here.reduce((s, b) => s + b.strength, 0),
    axisPhases: [
      { phaseKind: 'concentrate', phaseStart: 0, phaseDays: concentrate, phaseRegion: from },
      { phaseKind: 'bombard', phaseStart: concentrate, phaseDays: input.goal.goalDeadlineDays * 1000, phaseRegion: objective! },
    ],
    axisArrival: concentrate,
    axisOutOfSupply: 0,
    axisStoresDays: here.length === 0 ? 0 : Math.min(...here.map((b) => b.storesDays)),
    axisStoresAssumed: here.some((b) => b.storesAssumed),
  };
  return { ok: makeCandidate(ctx, 'bombard', 'across_water', [axis], []) };
}

export function supplyLine(ctx: Ctx): Outcome {
  const blocks = own(ctx);
  const from = staging(blocks);
  const objective = ctx.input.goal.goalObjective;
  const gates: PlanGate[] = objectiveGate(ctx);
  if (from === null) gates.push(gate('no_forces', 'no land blocks under his post'));
  const route = from === null || objective === null ? null : search(ctx, from, objective, 'land', weights(ctx, { supplyCare: 1000 }));
  if (route === null && gates.length === 0) gates.push(gate('no_route', 'no land route'));
  if (gates.length > 0) return reject('supply_line', 'depot_steps', gates);
  const axis = buildAxis(ctx, { name: 'main', post: ctx.input.post, mode: 'land', route: route!, blocks, depotSteps: true });
  return { ok: makeCandidate(ctx, 'supply_line', 'depot_steps', [axis], []) };
}

/**
 * The partner for a pincer: a friendly post with land forces at its headquarters, beside the objective by road, whose
 * holder answers him. Ranked by the cooperation he expects of that holder (lane 0.9 finding 7), then post id;
 * never a post whose answering holder is the commander himself (lane 0.9 finding 10).
 */
function partnersFor(ctx: Ctx, route: PlanRoute | null): { readonly all: readonly PlannerPost[]; readonly beside: readonly { readonly post: PlannerPost; readonly answer: { readonly post: PlannerPost; readonly vacant: boolean } }[] } {
  const { input } = ctx;
  const objective = input.goal.goalObjective!;
  const all = input.posts
    .filter((p) => p.id !== input.post && p.region !== null && p.region !== route?.routeFrom)
    .filter((p) => blocksOf(input, p.id).some((b) => !b.naval && b.region === p.region));
  const beside = all
    .filter((p) => adjacent(ctx, p.region!, objective, true))
    .map((post) => ({ post, answer: answeringPost(input, post.id) }))
    .filter((x): x is { post: PlannerPost; answer: { post: PlannerPost; vacant: boolean } } => x.answer !== null && x.answer.post.holder !== input.profile.person)
    .sort((a, b) => willingness(input, b.answer.post) - willingness(input, a.answer.post) || strictCompare(a.post.id, b.post.id));
  return { all, beside };
}

/**
 * Two axes on the objective. With a partner post beside the objective, the second axis is that post's, and it becomes
 * a support request to its holder with an arrival window; without one, he splits his own force over the direct and
 * flank routes (D4's two axes).
 */
export function pincer(ctx: Ctx, route: PlanRoute | null): Outcome[] {
  const { input } = ctx;
  const blocks = own(ctx);
  const base: PlanGate[] = objectiveGate(ctx);
  if (input.profile.maxAxes < 2) base.push(gate('max_axes', `he runs at most ${input.profile.maxAxes} axis`));
  if (route === null && input.goal.goalObjective !== null) base.push(gate('no_route', 'no main route'));
  if (blocks.length === 0) base.push(gate('no_forces', 'no land blocks under his post'));
  const out: Outcome[] = [];

  const gates: PlanGate[] = [...base];
  const objective = input.goal.goalObjective;
  const partners = objective === null ? { all: [], beside: [] } : partnersFor(ctx, route);
  if (objective !== null && partners.all.length === 0) gates.push(gate('no_partner', 'no friendly post with forces of its own to cooperate'));
  if (partners.all.length > 0 && partners.beside.length === 0) gates.push(gate('staging_not_adjacent', `no partner whose holder would answer stages beside ${objective}`));
  if (route !== null && !adjacent(ctx, route.routeFrom, route.routeTo, false)) gates.push(gate('staging_not_adjacent', `his own staging ${route.routeFrom} is not beside ${route.routeTo}`));
  if (gates.length > 0) {
    out.push(reject('pincer', 'with_partner', gates));
  } else {
    const { post: partner, answer } = partners.beside[0]!;
    const pBlocks = blocksOf(input, partner.id).filter((b) => !b.naval);
    const pRoute = search(ctx, partner.region!, objective!, 'land', weights(ctx));
    if (pRoute === null) {
      out.push(reject('pincer', 'with_partner', [gate('no_route', `no route from ${partner.region}`)]));
    } else {
      const mine = buildAxis(ctx, { name: 'main', post: input.post, mode: 'land', route: route!, blocks, depotSteps: false });
      const theirs = buildAxis(ctx, { name: 'partner', post: partner.id, mode: 'land', route: pRoute, blocks: pBlocks, depotSteps: false });
      const conds: PlanGate[] = answer.vacant ? [gate('vacant_post', `${partner.id} is vacant; ${answer.post.id} answers`, false)] : [];
      const req: PlanRequest = {
        reqKind: 'cooperating_axis',
        reqPost: answer.post.id,
        reqHolder: answer.post.holder,
        reqMen: 0,
        reqFrom: partner.region,
        reqObjective: objective,
        reqArriveFrom: mine.axisArrival - input.rules.pincerWindow,
        reqArriveTo: mine.axisArrival,
        reqCarrier: null,
        reqEdges: [],
      };
      out.push({ ok: makeCandidate(ctx, 'pincer', 'with_partner', [mine, theirs], [req], conds) });
    }
  }

  // His own two axes: main on the direct route, a fixing axis on the flank.
  const g2: PlanGate[] = [...base];
  if (blocks.length < 2) g2.push(gate('no_forces', 'fewer than two blocks to split'));
  const alt = route === null ? null : search(ctx, route.routeFrom, route.routeTo, 'land', weights(ctx), penaltyFor([route], input.rules.flankPenalty));
  if (route !== null && alt === null) g2.push(gate('no_route', 'no second route'));
  if (route !== null && alt !== null && overlap(regionsOf(route), regionsOf(alt)) >= input.rules.flankOverlapMax) g2.push(gate('duplicate', 'second route repeats the first'));
  if (route !== null && alt !== null) g2.push(...alternativeGates(ctx, route, alt));
  if (g2.length > 0) {
    out.push(reject('pincer', 'two_axis', g2));
  } else {
    const [a, b] = splitBlocks(blocks, [2, 1]);
    const main = buildAxis(ctx, { name: 'main', post: input.post, mode: 'land', route: route!, blocks: a!, depotSteps: false });
    const fix = buildAxis(ctx, { name: 'fixing', post: input.post, mode: 'land', route: alt!, blocks: b!, depotSteps: false });
    out.push({ ok: makeCandidate(ctx, 'pincer', 'two_axis', [main, fix], []) });
  }
  return out;
}

/**
 * By water (D4's envelopment by water; the joint relief of 0040): troops carried by a ship or boat along river or sea
 * edges, landing at the objective. A carrier of another post makes a naval support request to that post's holder. Two
 * variants differ in how works he has been told of are met: deliberately (clear or reduce them) or forced in a night.
 */
export function byWater(ctx: Ctx): Outcome[] {
  const { input } = ctx;
  const out: Outcome[] = [];
  for (const style of ['deliberate', 'force'] as const) {
    const variant = style === 'deliberate' ? 'clear_first' : 'run_in';
    const gates: PlanGate[] = objectiveGate(ctx);
    if (!input.goal.goalSea && !input.goal.goalRiver) gates.push(gate('needs_permission', 'neither river nor sea is permitted'));
    const troops = blocksOf(input, input.post, input.goal.goalCommitted).filter((b) => !b.naval);
    if (troops.length === 0) gates.push(gate('no_forces', 'no troops under his post'));
    // The carrier: the ship his troops are aboard, else a naval block of his own post.
    const aboard = troops.find((b) => b.aboard !== null)?.aboard ?? null;
    const carrier = (aboard !== null ? input.forces.find((f) => f.id === aboard) : blocksOf(input, input.post).find((b) => b.naval)) ?? null;
    if (carrier === null) gates.push(gate('no_carrier', 'no ship or boat to carry his troops'));
    if (gates.length > 0) {
      out.push(reject('by_water', variant, gates));
      continue;
    }
    const route = search(ctx, carrier!.region, input.goal.goalObjective!, 'water', { riskWeight: input.profile.riskWeight, supplyCare: 0, obstacles: style });
    if (route === null) {
      out.push(reject('by_water', variant, [gate('no_route', `no water route from ${carrier!.region}`)]));
      continue;
    }
    const requests: PlanRequest[] = [];
    const conds: PlanGate[] = [];
    if (carrier!.post !== input.post) {
      const answer = answeringPost(input, carrier!.post);
      if (answer?.vacant) conds.push(gate('vacant_post', `${carrier!.post} is vacant; ${answer.post.id} answers`, false));
      requests.push({
        reqKind: 'naval_support',
        reqPost: answer?.post.id ?? carrier!.post,
        reqHolder: answer?.post.holder ?? null,
        reqMen: 0,
        reqFrom: carrier!.region,
        reqObjective: input.goal.goalObjective,
        reqArriveFrom: 0,
        reqArriveTo: 0,
        reqCarrier: carrier!.id,
        reqEdges: route.routeLegs.map((l) => l.legEdge),
      });
    }
    const axis = buildAxis(ctx, { name: 'afloat', post: input.post, mode: waterMode(route), route, blocks: troops, depotSteps: false });
    out.push({ ok: makeCandidate(ctx, 'by_water', variant, [axis], requests, conds) });
  }
  return out;
}

export function holding(ctx: Ctx): Outcome {
  const blocks = blocksOf(ctx.input, ctx.input.post, ctx.input.goal.goalCommitted).filter((b) => !b.naval);
  if (blocks.length === 0) return reject('holding', 'hold', [gate('no_forces', 'nothing to hold with')]);
  const kind = ctx.input.goal.goalPosture === 'relieve' ? 'await' : 'hold';
  return { ok: makeCandidate(ctx, 'holding', kind, [holdingAxis(ctx, ctx.input.post, blocks, kind)], []) };
}
