/** Generate optional alternatives, then score all candidates with soft, compliance-weighted preferences. */
import { strictCompare } from '../compare.ts';
import type { PlanNote } from '../plans/notes.ts';
import { buildAxis, searchModeOf } from './axes.ts';
import type { Ctx } from './context.ts';
import { weights } from './methods.ts';
import { search, viaRoute } from './route.ts';
import { makeCandidate } from './score.ts';
import type { PlanCandidate, PlanTerm } from './types.ts';

export function followsNote(c: PlanCandidate, n: PlanNote): boolean {
  const a = c.candAxes.find(a => a.axisName === n.markAxis);
  if (a === undefined) return n.markKind === 'avoid';
  const regions = [a.axisRoute.routeFrom, ...a.axisRoute.routeLegs.map(l => l.legTo)];
  if (n.markKind === 'focus') return a.axisRoute.routeTo === n.markRegion && c.candMethod !== 'holding';
  if (n.markKind === 'avoid') return !regions.includes(n.markRegion!);
  if (n.markKind === 'wait') return (a.axisPhases.find(p => p.phaseKind === 'concentrate')?.phaseDays ?? 0) >= n.markDays! * 1000;
  let from = 0;
  for (const waypoint of n.markVia) {
    const at = regions.indexOf(waypoint, from);
    if (at < 0) return false;
    from = at + 1;
  }
  return true;
}

function alternative(start: Ctx, c: PlanCandidate, n: PlanNote, index: number): PlanCandidate | null {
  // A suggested objective is judged at that objective, with the same beliefs and permissions.
  const objective = n.markKind === 'focus' ? n.markRegion : (c.candAxes.find(a=>a.axisName==='main') ?? c.candAxes[0])?.axisRoute.routeTo ?? start.input.goal.goalObjective;
  const ctx: Ctx = { ...start, input: { ...start.input, goal: { ...start.input.goal, goalObjective: objective } } };
  const result = alternativeOn(ctx,c,n,index);
  start.searches = ctx.searches;
  return result;
}

function alternativeOn(ctx: Ctx, c: PlanCandidate, n: PlanNote, index: number): PlanCandidate | null {
  const a = c.candAxes.find(a => a.axisName === n.markAxis);
  // A note never changes a holding or bombardment method into a marching order.
  if (!a || c.candMethod === 'holding' || c.candMethod === 'bombard') return null;
  let route = a.axisRoute;
  const mode = searchModeOf(a.axisMode);
  if (n.markKind === 'focus') {
    const r = search(ctx, route.routeFrom, n.markRegion!, mode, weights(ctx));
    if (!r) return null;
    route = r;
  } else if (n.markKind === 'via') {
    const r = viaRoute(ctx, route.routeFrom, n.markVia, route.routeTo, mode, weights(ctx)).route;
    if (!r) return null;
    route = r;
  } else if (n.markKind === 'avoid') {
    // Same penalty method as the flank search: expensive ground is still legal.
    const penalty = new Map((ctx.input.ground.map.edgesAt.get(n.markRegion!) ?? []).map(e => [e.id, ctx.input.rules.flankPenalty]));
    const r = search(ctx, route.routeFrom, route.routeTo, mode, weights(ctx), penalty);
    if (!r) return null;
    route = r;
  }
  const rebuilt = buildAxis(ctx, { name: a.axisName, post: a.axisPost, mode: a.axisMode, route,
    blocks: ctx.input.forces.filter(b => a.axisBlocks.includes(b.id)), depotSteps: a.axisPhases.some(p => p.phaseKind === 'depot_step'),
    concentrationDays: n.markKind === 'wait' ? n.markDays! : Math.trunc((a.axisPhases.find(p => p.phaseKind === 'concentrate')?.phaseDays ?? 0) / 1000),
  });
  const axes = c.candAxes.map(x => x === a ? rebuilt : x);
  return makeCandidate(ctx, c.candMethod, `${c.candVariant}+note${index}`, axes, c.candRequests.filter(r => r.reqKind !== 'reinforcement'), c.candConditions.filter(g => g.gateKind !== 'move_when_reinforced'));
}

export function noteCandidates(ctx: Ctx, originals: readonly PlanCandidate[]): PlanCandidate[] {
  const notes = ctx.input.notes ?? [];
  if (!notes.length) return [...originals];
  const candidates = [...originals];
  let combined = [...originals].filter(c => c.candMethod !== 'holding').sort((a,b) => b.candScore-a.candScore || strictCompare(a.id,b.id))[0];
  for (const [index, reading] of notes.entries()) {
    if (reading.weight <= 0 || !combined) continue;
    const alt = alternative(ctx, combined, reading.mark, index);
    if (alt) { candidates.push(alt); combined = alt; }
  }
  const max = ctx.input.noteScoreWeight;
  if (max === undefined) throw new RangeError('note scoring needs the pack weight');
  return candidates.map(c => {
    const breakdown = notes.map((n, i) => {
      const followed = followsNote(c, n.mark);
      const possible = candidates.some(other => followsNote(other, n.mark));
      return { noteIndex: i, noteFollowed: n.weight > 0 && followed,
        noteWhy: n.weight <= 0 ? 'declined' as const : followed ? 'followed' as const : possible ? 'own_judgement' as const : 'unavailable' as const,
        noteAmount: n.weight > 0 && followed ? Math.trunc(max * n.weight / 1000) : 0 };
    });
    const term: PlanTerm = { contribTerm: 'notes', contribAmount: breakdown.reduce((s,n) => s+n.noteAmount,0), contribWhy: 'delivered marks, weighted by compliance' };
    return { ...c, candNotes: breakdown, candTerms: [...c.candTerms, term], candScore: c.candScore + term.contribAmount };
  });
}
