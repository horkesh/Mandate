/**
 * Scoring (planner-design D6): a signed sum of typed contributions, weighted
 * by his profile. The score is exactly the sum of its terms (a test asserts
 * it). Every weight is a design parameter.
 */
import type { Ctx } from './context.ts';
import type { Axis, Candidate, Contribution, Gate, Method, SupportRequest } from './types.ts';

export interface Scored {
  readonly contributions: readonly Contribution[];
  readonly score: number;
  readonly perceivedAtObjective: number;
  readonly forceRatio: number;
  readonly shortfallMen: number;
}

/** Defenders he believes stand at the objective, plus a share of those one hop away. */
export function opposition(ctx: Ctx): number {
  return ctx.threat.get(ctx.input.goal.objective) ?? 0;
}

export function scoreAxes(ctx: Ctx, method: Method, axes: readonly Axis[], requests: readonly SupportRequest[]): Scored {
  const { profile, goal, rules } = ctx.input;
  const c: Contribution[] = [];
  const holding = method === 'holding';
  const enemy = opposition(ctx);
  const strength = axes.reduce((s, a) => s + a.strength, 0);
  const ratio = enemy === 0 ? 10000 : Math.trunc((strength * 1000) / enemy);
  const needed = Math.trunc((enemy * profile.demand) / 1000);
  const shortfallMen = Math.max(0, needed - strength);

  if (holding) {
    c.push({ term: 'goal_fit', amount: 0, why: 'does not move on the objective' });
    c.push({ term: 'time', amount: -300, why: 'the deadline passes with nothing attempted' });
    c.push({ term: 'caution', amount: Math.trunc((1000 - profile.boldness) / 2), why: 'keeps the force whole' });
    return finish(c, enemy, ratio, shortfallMen);
  }

  c.push({ term: 'goal_fit', amount: 400, why: `reaches ${goal.objective}` });

  if (ratio >= profile.demand) {
    c.push({ term: 'force_ratio', amount: Math.min(300, Math.trunc((ratio - profile.demand) / 10)), why: `ratio ${ratio} over his demand ${profile.demand}` });
  } else {
    c.push({ term: 'force_ratio', amount: -Math.min(600, Math.trunc(((profile.demand - ratio) * 600) / profile.demand)), why: `ratio ${ratio} under his demand ${profile.demand}; short ${shortfallMen} men` });
  }

  const arrival = Math.max(...axes.map((a) => a.arrivalPermille));
  const deadline = goal.deadlineDays * 1000;
  if (arrival > deadline) {
    c.push({ term: 'time', amount: -Math.min(600, Math.trunc(((arrival - deadline) * 40) / 1000)), why: `arrives ${arrival - deadline}‰ days late` });
  } else {
    c.push({ term: 'time', amount: Math.min(300, Math.trunc(((deadline - arrival) * profile.boldness) / 25000)), why: `arrives ${deadline - arrival}‰ days early` });
  }

  // Moving before he has concentrated as long as he wants (a timing edit): costs a cautious man more.
  let rushed = 0;
  for (const a of axes) {
    const concentrated = a.phases.find((p) => p.kind === 'concentrate')?.daysPermille ?? 0;
    rushed += Math.max(0, profile.concentrationDays * 1000 - concentrated);
  }
  c.push({ term: 'haste', amount: -Math.trunc((rushed * (1100 - profile.boldness)) / 10000), why: rushed > 0 ? `moves ${rushed}‰ days before he is concentrated` : 'concentrated as he wants' });

  const outside = axes.reduce((s, a) => s + a.outOfSupplyPermille, 0);
  const outrun = axes.some((a) => a.outOfSupplyPermille > a.storesDays * 1000);
  const supply = -Math.trunc((outside * profile.supplyCare) / 10000) - (outrun ? Math.trunc(profile.supplyCare / 4) : 0);
  c.push({ term: 'supply', amount: supply, why: `${outside}‰ days outside supply${outrun ? '; outruns his stores' : ''}` });

  // Threat along the way, excluding the objective (judged by the ratio) and works (priced in time).
  let threatMen = 0;
  for (const a of axes) for (const l of a.route.legs) if (l.to !== goal.objective) threatMen += ctx.threat.get(l.to) ?? 0;
  for (const a of axes) for (const l of a.route.legs) if (l.obstacle === 'run_past' || (l.obstacle === 'clear' && l.obstaclePermille <= rules.forceDays)) threatMen += rules.forcingThreat;
  const tolerated = 1000 - Math.trunc(goal.risk / 2);
  const weighted = Math.trunc((Math.trunc((threatMen * profile.riskWeight) / 1000) * tolerated) / 1000);
  c.push({ term: 'exposure', amount: -Math.trunc(weighted / 20), why: `${threatMen} perceived men along the route` });

  if (axes.length > 1) {
    const arrivals = axes.map((a) => a.arrivalPermille);
    const spread = Math.max(...arrivals) - Math.min(...arrivals);
    c.push({ term: 'coordination', amount: -Math.trunc((spread * (1100 - profile.competence)) / 10000) - 50 * (axes.length - 1), why: `${axes.length} axes, arrivals ${spread}‰ days apart` });
  } else {
    c.push({ term: 'coordination', amount: 0, why: 'one axis' });
  }

  const others = requests.filter((r) => r.kind !== 'reinforcement').length;
  c.push({ term: 'dependence', amount: -120 * others, why: `${others} support request(s) to other holders` });

  c.push({ term: 'glory', amount: Math.trunc(profile.gloryWeight / 5), why: 'his name on the objective' });
  c.push({ term: 'caution', amount: 0, why: 'commits the force' });
  return finish(c, enemy, ratio, shortfallMen);
}

function finish(c: Contribution[], enemy: number, ratio: number, shortfallMen: number): Scored {
  return { contributions: c, score: c.reduce((s, x) => s + x.amount, 0), perceivedAtObjective: enemy, forceRatio: ratio, shortfallMen };
}

/** Assemble a candidate: score, add the reinforcement request and start condition for a shortfall (D5). */
export function makeCandidate(ctx: Ctx, method: Method, variant: string, axes: readonly Axis[], requests: readonly SupportRequest[], conditions: readonly Gate[] = []): Candidate {
  const s = scoreAxes(ctx, method, axes, requests);
  const reqs: SupportRequest[] = [...requests];
  const conds: Gate[] = [...conditions];
  if (method !== 'holding' && s.shortfallMen > 0) {
    reqs.push({ kind: 'reinforcement', to: 'principal', men: s.shortfallMen });
    conds.push({ kind: 'move_when_reinforced', hard: false, detail: `${s.shortfallMen} men short of his demand` });
  }
  const id = `${method}:${variant}:${axes.map((a) => [a.route.from, ...a.route.legs.map((l) => l.to)].join('>')).join('|')}`;
  return {
    id,
    method,
    variant,
    axes,
    requests: reqs,
    conditions: conds,
    contributions: s.contributions,
    score: s.score,
    perceivedAtObjective: s.perceivedAtObjective,
    forceRatio: s.forceRatio,
  };
}
