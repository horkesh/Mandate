/**
 * The planner: generate, filter, score (planner-design D1, D6). A pure
 * function of its input; it writes nothing. `plans` (the only writer) would
 * store the returned draft set on the request day, because a later call on a
 * changed map would not reproduce it (planner-design finding 1).
 */
import { strictCompare } from '@mandate/kernel';
import { makeCtx, type PlannerInput } from './context.ts';
import { byWater, direct, directRoute, flank, holding, pincer, supplyLine, type Outcome } from './methods.ts';
import { overlap } from './route.ts';
import type { Candidate, DraftSet, RegionId, Rejected } from './types.ts';

function regionsOfCandidate(c: Candidate): RegionId[] {
  return c.axes.flatMap((a) => a.route.legs.map((l) => l.to));
}

/** Higher score first; ties by candidate id, strictly (D6). */
export function compareCandidates(a: Candidate, b: Candidate): number {
  return b.score - a.score || strictCompare(a.id, b.id);
}

export function draft(input: PlannerInput): DraftSet {
  const ctx = makeCtx(input);
  const route = directRoute(ctx);
  const outcomes: Outcome[] = [direct(ctx, route), flank(ctx, route), supplyLine(ctx), ...pincer(ctx, route), ...byWater(ctx), holding(ctx)];
  const rejected: Rejected[] = [];
  const kept: Candidate[] = [];
  for (const o of outcomes) {
    if ('rejected' in o) rejected.push(o.rejected);
    else kept.push(o.ok);
  }
  if (ctx.searches > input.rules.maxSearches) {
    rejected.push({ method: 'direct', variant: 'search_cap', gates: [{ kind: 'no_route', hard: true, detail: `search cap ${input.rules.maxSearches} reached (${ctx.searches} asked)` }] });
  }
  // Deduplicate: a candidate repeating a better one's ground (and its method's shape) goes.
  kept.sort(compareCandidates);
  const unique: Candidate[] = [];
  let deduplicated = 0;
  for (const c of kept) {
    const twin = unique.find(
      (u) =>
        u.axes.length === c.axes.length &&
        u.method !== 'holding' &&
        c.method !== 'holding' &&
        overlap(regionsOfCandidate(u), regionsOfCandidate(c)) >= input.rules.dedupeOverlap &&
        sameShape(u, c) &&
        Math.abs(arrival(u) - arrival(c)) <= input.rules.dedupeArrival,
    );
    if (twin) {
      deduplicated += 1;
      rejected.push({ method: c.method, variant: c.variant, gates: [{ kind: 'duplicate', hard: true, detail: `repeats ${twin.id}` }] });
    } else {
      unique.push(c);
    }
  }
  const top = unique.filter((c) => c.method !== 'holding').slice(0, input.rules.topN);
  const hold = unique.find((c) => c.method === 'holding');
  const candidates = (hold ? [...top, hold] : top).sort(compareCandidates);
  return {
    goal: input.goal,
    commander: input.profile.person,
    post: input.post,
    candidates,
    rejected,
    counters: { searches: ctx.searches, generated: kept.length, deduplicated },
  };
}

function arrival(c: Candidate): number {
  return Math.max(...c.axes.map((a) => a.arrivalPermille));
}

/** Two candidates have the same shape when their phases are the same kinds in the same order. */
function sameShape(a: Candidate, b: Candidate): boolean {
  const k = (c: Candidate) => c.axes.map((x) => x.phases.map((p) => p.kind).join(',')).join('|');
  return k(a) === k(b);
}

/** The pick his seat makes on the rules model: the best-scored candidate (an AI seat may pick among equally consistent ones, FOUNDATION section 8). */
export function pick(set: DraftSet): Candidate {
  return set.candidates[0]!;
}
