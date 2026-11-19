/**
 * The planner: generate, filter, score (planner-design D1, D6; 0062). A pure function of its input; it writes nothing.
 * `plans` (the only writer) stores the returned draft set on the request day, because a later call on a changed map
 * would not reproduce it (planner-design finding 1).
 */
import { strictCompare } from '../compare.ts';
import type { RegionId } from '../ids.ts';
import { makeCtx, type PlannerInput } from './context.ts';
import { bombard, byWater, direct, directRoute, flank, holding, pincer, supplyLine, type Outcome } from './methods.ts';
import { overlap } from './route.ts';
import type { PlanCandidate, DraftSet, PlanRejected } from './types.ts';

function regionsOfCandidate(c: PlanCandidate): RegionId[] {
  return c.candAxes.flatMap((a) => a.axisRoute.routeLegs.map((l) => l.legTo));
}

/** Higher score first; ties by candidate id, strictly (D6). */
export function compareCandidates(a: PlanCandidate, b: PlanCandidate): number {
  return b.candScore - a.candScore || strictCompare(a.id, b.id);
}

function arrival(c: PlanCandidate): number {
  return Math.max(...c.candAxes.map((a) => a.axisArrival));
}

/** Two candidates have the same shape when their phases are the same kinds in the same order. */
function sameShape(a: PlanCandidate, b: PlanCandidate): boolean {
  const k = (c: PlanCandidate) => c.candAxes.map((x) => x.axisPhases.map((p) => p.phaseKind).join(',')).join('|');
  return k(a) === k(b);
}

export function draft(input: PlannerInput): DraftSet {
  const ctx = makeCtx(input);
  const route = directRoute(ctx);
  // Lane 1.12: a bombardment only where no land route reaches the objective (it fires instead of halting with no route).
  const outcomes: Outcome[] = [direct(ctx, route), flank(ctx, route), supplyLine(ctx), ...pincer(ctx, route), ...byWater(ctx), ...(route === null ? [bombard(ctx)] : []), holding(ctx)];
  const rejected: PlanRejected[] = [];
  const kept: PlanCandidate[] = [];
  for (const o of outcomes) {
    if ('rejected' in o) rejected.push(o.rejected);
    else kept.push(o.ok);
  }
  if (ctx.searches > input.rules.maxSearches) {
    rejected.push({ rejMethod: 'direct', rejVariant: 'search_cap', rejGates: [{ gateKind: 'no_route', gateHard: true, gateDetail: `search cap ${input.rules.maxSearches} reached (${ctx.searches} asked)` }] });
  }
  // Deduplicate: a candidate repeating a better one's ground, shape and arrival goes.
  kept.sort(compareCandidates);
  const unique: PlanCandidate[] = [];
  let deduplicated = 0;
  for (const c of kept) {
    const twin = unique.find(
      (u) =>
        u.candAxes.length === c.candAxes.length &&
        u.candMethod !== 'holding' &&
        c.candMethod !== 'holding' &&
        overlap(regionsOfCandidate(u), regionsOfCandidate(c)) >= input.rules.dedupeOverlap &&
        sameShape(u, c) &&
        Math.abs(arrival(u) - arrival(c)) <= input.rules.dedupeArrival,
    );
    if (twin) {
      deduplicated += 1;
      rejected.push({ rejMethod: c.candMethod, rejVariant: c.candVariant, rejGates: [{ gateKind: 'duplicate', gateHard: true, gateDetail: `repeats ${twin.id}` }] });
    } else {
      unique.push(c);
    }
  }
  const top = unique.filter((c) => c.candMethod !== 'holding').slice(0, input.rules.topN);
  const hold = unique.find((c) => c.candMethod === 'holding');
  const candidates = (hold ? [...top, hold] : top).sort(compareCandidates);
  return {
    draftCommander: input.profile.person,
    draftPost: input.post,
    draftFaction: input.faction,
    draftDay: input.day,
    draftCandidates: candidates,
    draftRejected: rejected,
    draftSearches: ctx.searches,
    draftGenerated: kept.length,
    draftDeduplicated: deduplicated,
  };
}

/**
 * Which scoring terms are live in a draft set (0062, FOUNDATION 11.5): a term is live when dropping it would change
 * the top pick. Counted by the plans phase as liveness telemetry; the edit counterpart is `fell` on an edit.
 */
export function liveTerms(set: DraftSet): readonly string[] {
  const top = set.draftCandidates[0];
  if (top === undefined || set.draftCandidates.length < 2) return [];
  const terms = new Set(set.draftCandidates.flatMap((c) => c.candTerms.map((t) => t.contribTerm)));
  const live: string[] = [];
  for (const t of [...terms].sort(strictCompare)) {
    const without = (c: PlanCandidate) => c.candScore - (c.candTerms.find((x) => x.contribTerm === t)?.contribAmount ?? 0);
    const alt = [...set.draftCandidates].sort((a, b) => without(b) - without(a) || strictCompare(a.id, b.id))[0]!;
    if (alt.id !== top.id) live.push(t);
  }
  return live;
}
