/**
 * Scoring (planner-design D6; 0062): a signed sum of typed contributions, weighted by his profile and the pack's
 * weights. The score is exactly the sum of its terms (hard rule 6; a test asserts it).
 *
 * Lane 0.9's fixes live here:
 * - the assault margin (finding 1): against a garrisoned objective held by the enemy, he demands the pack's margin
 *   over his open-field demand;
 * - the shortfall threshold (finding 8): he asks the principal for men and waits for them only past a shortfall
 *   share scaled by his caution, never for any shortfall at all;
 * - a support request costs `dependence` less its holder's willingness (finding 7: regard and values).
 */
import { enemyHeld, willingness, type Ctx } from './context.ts';
import type { PlanAxis, PlanCandidate, PlanTerm, PlanGate, Method, PlanRequest, TermKind } from './types.ts';

export interface Scored {
  readonly terms: readonly PlanTerm[];
  readonly score: number;
  readonly perceived: number;
  readonly ratio: number;
  /** Men short of what he needs. */
  readonly shortfall: number;
  /** Whether the shortfall is past his threshold, so he asks for men and waits. */
  readonly waits: boolean;
}

/** Defenders he believes stand at the objective, plus a share of those one hop away. */
export function opposition(ctx: Ctx): number {
  const objective = ctx.input.goal.goalObjective;
  return objective === null ? 0 : (ctx.threat.get(objective) ?? 0);
}

/** His demand for this goal, permille: his open-field demand, times the assault margin against a garrisoned enemy-held objective. */
export function demandFor(ctx: Ctx): number {
  const { profile, goal, ground, faction, rules, beliefs } = ctx.input;
  const objective = goal.goalObjective;
  const assault = objective !== null && goal.goalPosture === 'take' && enemyHeld(ground.index, objective, faction) && (beliefs.get(objective) ?? 0) > 0;
  return assault ? Math.trunc((profile.demand * rules.assaultMargin) / 1000) : profile.demand;
}

/** The shortfall share, permille of the men he needs, past which he waits: the pack's, scaled by his boldness. */
export function shortfallShare(ctx: Ctx): number {
  const r = ctx.input.rules;
  return r.shortfallTimid + Math.trunc(((r.shortfallBold - r.shortfallTimid) * ctx.input.profile.boldness) / 1000);
}

function term(c: PlanTerm[], kind: TermKind, amount: number, why: string): void {
  // `+ 0` turns a negated zero (-Math.trunc(0)) into 0: -0 does not survive a save, so a replay would differ.
  c.push({ contribTerm: kind, contribAmount: amount + 0, contribWhy: why });
}

export function scoreAxes(ctx: Ctx, method: Method, axes: readonly PlanAxis[], requests: readonly PlanRequest[]): Scored {
  const { profile, goal, rules } = ctx.input;
  const w = rules.weights;
  const c: PlanTerm[] = [];
  const enemy = opposition(ctx);
  const demand = demandFor(ctx);
  const strength = axes.reduce((s, a) => s + a.axisStrength, 0);
  const ratio = enemy === 0 ? 10000 : Math.trunc((strength * 1000) / enemy);
  const needed = Math.trunc((enemy * demand) / 1000);
  const shortfall = Math.max(0, needed - strength);
  const waits = shortfall > 0 && shortfall * 1000 > needed * shortfallShare(ctx);

  if (method === 'holding') {
    term(c, 'goal_fit', 0, 'does not move on the objective');
    term(c, 'time', w.holdingTime, 'the deadline passes with nothing attempted');
    term(c, 'caution', Math.trunc((1000 - profile.boldness) / w.cautionDivisor), 'keeps the force whole');
    return { terms: c, score: sum(c), perceived: enemy, ratio, shortfall, waits };
  }

  term(c, 'goal_fit', w.goalFit, `reaches ${goal.goalObjective}`);
  if (ratio >= demand) {
    term(c, 'force_ratio', Math.min(w.ratioBonusMax, Math.trunc((ratio - demand) / w.ratioBonusDivisor)), `ratio ${ratio} over his demand ${demand}`);
  } else {
    term(c, 'force_ratio', -Math.min(w.ratioPenaltyMax, Math.trunc(((demand - ratio) * w.ratioPenaltyMax) / demand)), `ratio ${ratio} under his demand ${demand}; short ${shortfall} men`);
  }

  const arrival = Math.max(...axes.map((a) => a.axisArrival));
  const deadline = goal.goalDeadlineDays * 1000;
  if (arrival > deadline) {
    term(c, 'time', -Math.min(w.latePenaltyMax, Math.trunc(((arrival - deadline) * w.latePerDay) / 1000)), `arrives ${arrival - deadline} permille days late`);
  } else {
    term(c, 'time', Math.min(w.earlyBonusMax, Math.trunc(((deadline - arrival) * profile.boldness) / w.earlyDivisor)), `arrives ${deadline - arrival} permille days early`);
  }

  // Moving before he has concentrated as long as he wants (a timing edit) costs a cautious man more.
  let rushed = 0;
  for (const a of axes) {
    const concentrated = a.axisPhases.find((p) => p.phaseKind === 'concentrate')?.phaseDays ?? 0;
    rushed += Math.max(0, profile.concentrationDays * 1000 - concentrated);
  }
  term(c, 'haste', -Math.trunc((rushed * (w.traitBase - profile.boldness)) / w.hasteDivisor), rushed > 0 ? `moves ${rushed} permille days before he is concentrated` : 'concentrated as he wants');

  const outside = axes.reduce((s, a) => s + a.axisOutOfSupply, 0);
  const outrun = axes.some((a) => a.axisOutOfSupply > a.axisStoresDays * 1000);
  term(c, 'supply', -Math.trunc((outside * profile.supplyCare) / w.supplyDivisor) - (outrun ? Math.trunc(profile.supplyCare / w.outrunDivisor) : 0), `${outside} permille days outside supply${outrun ? '; outruns his stores' : ''}`);

  // Threat along the way, excluding the objective (judged by the ratio) and works (priced in time).
  let threatMen = 0;
  for (const a of axes) for (const l of a.axisRoute.routeLegs) if (l.legTo !== goal.goalObjective) threatMen += ctx.threat.get(l.legTo) ?? 0;
  for (const a of axes) for (const l of a.axisRoute.routeLegs) if (l.legObstacle === 'run_past' || (l.legObstacle === 'clear' && l.legObstacleDays <= rules.forceDays)) threatMen += rules.forcingThreat;
  const tolerated = 1000 - Math.trunc(goal.goalRisk / 2);
  const weighted = Math.trunc((Math.trunc((threatMen * profile.riskWeight) / 1000) * tolerated) / 1000);
  term(c, 'exposure', -Math.trunc(weighted / w.exposureDivisor), `${threatMen} perceived men along the route`);

  if (axes.length > 1) {
    const arrivals = axes.map((a) => a.axisArrival);
    const spread = Math.max(...arrivals) - Math.min(...arrivals);
    term(c, 'coordination', -Math.trunc((spread * (w.traitBase - profile.competence)) / w.coordinationDivisor) - w.perExtraAxis * (axes.length - 1), `${axes.length} axes, arrivals ${spread} permille days apart`);
  } else {
    term(c, 'coordination', 0, 'one axis');
  }

  let dependence = 0;
  let asked = 0;
  for (const r of requests) {
    if (r.reqKind === 'reinforcement') continue;
    asked += 1;
    const post = r.reqPost === null ? undefined : ctx.input.posts.find((p) => p.id === r.reqPost);
    dependence += Math.min(0, -rules.dependenceCost + (post === undefined ? 0 : willingness(ctx.input, post)));
  }
  term(c, 'dependence', dependence, `${asked} support request(s) to other holders`);
  term(c, 'glory', Math.trunc(profile.gloryWeight / w.gloryDivisor), 'his name on the objective');
  term(c, 'caution', 0, 'commits the force');
  return { terms: c, score: sum(c), perceived: enemy, ratio, shortfall, waits };
}

function sum(c: readonly PlanTerm[]): number {
  return c.reduce((s, x) => s + x.contribAmount, 0);
}

/** The id of a candidate: method, variant, then each axis's regions. Content-derived, so one new candidate renumbers nothing. */
export function candidateId(method: Method, variant: string, axes: readonly PlanAxis[]): string {
  return `${method}:${variant}:${axes.map((a) => [a.axisRoute.routeFrom, ...a.axisRoute.routeLegs.map((l) => l.legTo)].join('>')).join('|')}`;
}

/** Assemble a candidate: score it, and add the reinforcement request and start condition for a shortfall past his threshold (D5). */
export function makeCandidate(ctx: Ctx, method: Method, variant: string, axes: readonly PlanAxis[], requests: readonly PlanRequest[], conditions: readonly PlanGate[] = []): PlanCandidate {
  const s = scoreAxes(ctx, method, axes, requests);
  const reqs: PlanRequest[] = [...requests];
  const conds: PlanGate[] = [...conditions];
  if (method !== 'holding' && s.waits) {
    reqs.push({ reqKind: 'reinforcement', reqPost: null, reqHolder: null, reqMen: s.shortfall, reqFrom: null, reqObjective: ctx.input.goal.goalObjective, reqArriveFrom: 0, reqArriveTo: 0, reqCarrier: null, reqEdges: [] });
    conds.push({ gateKind: 'move_when_reinforced', gateHard: false, gateDetail: `${s.shortfall} men short of his demand` });
  }
  return {
    id: candidateId(method, variant, axes),
    candMethod: method,
    candVariant: variant,
    candAxes: axes,
    candRequests: reqs,
    candConditions: conds,
    candTerms: s.terms,
    candScore: s.score,
    candPerceived: s.perceived,
    candRatio: s.ratio,
  };
}
