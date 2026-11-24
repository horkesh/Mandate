import { forceTotals } from '@mandate/kernel';
/**
 * What a day of plan drafting costs on the real Union graph (lane 0.8; 0062's daily drafting cap is "a pack rule, set
 * from the worst day measured here"). Lane 1.2 moved the planner into the kernel: this now measures the kernel's
 * `planner.draft`, on inputs built as the plans phase builds them (`plannerInputFor`: the commander's view, the
 * derived map, his side's forces and posts).
 *
 * Every post that commands force blocks at the scenario start is asked to take the other side's capital, the longest
 * request the war can make. His knowledge holds one intelligence estimate of every enemy block he can be told of (his
 * side's whole picture), so the planner has an enemy to weigh. A "day" is every such post drafting once, back to back;
 * the worst day is the slowest of several. The kernel reads no clock; the clock is read here.
 */
import { ids, phase0, planner } from '@mandate/kernel';
import { percentile } from './phase0-run.ts';
import { seatsWorld } from './seats-world.ts';

export interface DraftSample {
  readonly post: string;
  readonly faction: string;
  readonly candidates: number;
  readonly searches: number;
  readonly medianMs: number;
  readonly maxMs: number;
}

export interface DraftingReport {
  readonly pack: string;
  /** Posts that command at least one force block at the start: the commands that can ask for a plan. */
  readonly posts: number;
  readonly drafts: readonly DraftSample[];
  /** Milliseconds for one day's drafts (every post once, back to back), over `days` such days. */
  readonly day: { readonly days: number; readonly median: number; readonly p95: number; readonly worst: number };
  /** Milliseconds for a day capped at the pack's daily drafting cap for each side (each side's slowest such posts, all drafting together). */
  readonly cappedDay: { readonly cap: number; readonly sides: number; readonly worst: number };
  readonly slowestDraftMs: number;
  /** Posts with no land force (squadrons and yards), which can draft nothing toward an inland objective. */
  readonly noLandForce: number;
  /** Every post with a land force got at least one candidate, and every candidate's score is the exact sum of its terms. */
  readonly sound: boolean;
}

/** Inputs for every post that commands a force block at the scenario start, on the pack's real graph. */
export function draftingInputs(pack: string): planner.PlannerInput[] {
  const { world, seed } = seatsWorld(pack);
  let state = phase0.createState(world, { seed });
  const map = world.map;
  const month = phase0.monthOf(state, 1);
  const network = phase0.passageOf(map, state);
  const derived = phase0.deriveMap(map, { control: state.regionControl, month, network });
  const posts = [...new Set((Object.keys(state.forceAssignments) as ids.ForceBlockId[]).map((b) => state.forceAssignments[b]).filter((p): p is ids.PostId => p !== null && p !== undefined))].sort();
  const inputs: planner.PlannerInput[] = [];
  for (const post of posts) {
    const holder = state.postStates[post]?.postHolder ?? null;
    const faction = phase0.postFaction(world, state, post);
    if (holder === null || faction === null || !world.factionIds.includes(faction)) continue;
    // A benchmark's objective, not a goal anyone gives (lane 1.12 retired the capital as every side's objective): each
    // post drafts toward the other side's capital, so the measure stays the same draft as before.
    const capitals = Object.entries(state.factionCapitals);
    const objective = capitals.length === 2 ? (capitals.find(([f]) => f !== faction)?.[1] ?? null) : null;
    if (objective === null) continue;
    // His side's whole picture of the enemy, as one estimate in his knowledge.
    const enemy = new Map<string, number>();
    for (const b of Object.keys(state.forceLocations).sort() as ids.ForceBlockId[]) {
      const side = phase0.factionOfBlock(map, state, b);
      if (side === null || side === faction) continue;
      const region = state.forceLocations[b]!.locRegion;
      enemy.set(region, (enemy.get(region) ?? 0) + (forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength ?? 0));
    }
    const seat = phase0.seatIdFor(holder);
    const id = ids.toId('message', `measure.${post}`);
    if (!phase0.knowledgeOf(state, seat).knownReports.some((r) => r.id === id)) {
      state = phase0.deliverReport(
        state,
        seat,
        {
          id,
          knownReceivedDay: 0,
          knownRoute: 'courier',
          knownVia: [],
          knownBody: {
            reportType: 'enemy-estimate',
            reportSubtype: null,
            reportAuthor: holder,
            reportAuthorPost: post,
            reportSubjectKind: 'enemy',
            reportSubjectId: post,
            // Exhaustive fictional observation fixture, including affirmative clearances.
            reportClaims: [...world.map.regions.keys()].sort().map((region) => ({ claimKind: 'enemy-strength' as const, claimRegion: region as ids.RegionId, claimValue: enemy.get(region) ?? 0, claimToken: null, claimConfidence: 700 })),
            reportDay: 0,
            reportHour: null,
            reportAdvice: null,
            reportAnswers: null,
          },
        },
        { truthTerms: [], truthTrimmed: [] },
      );
    }
    const view = phase0.viewFor(world, state, seat);
    const d = map.world.rules.plans.goalDefaults;
    const goal: phase0.PlanGoal = {
      goalObjective: objective,
      goalPosture: 'take',
      goalRisk: d.risk,
      goalDeadlineDays: 60,
      goalRail: true,
      goalRiver: true,
      goalSea: false,
      // The longest request: neutral ground permitted (a benchmark, not a doctrine goal), so no route ends early.
      goalNeutral: true,
      goalCommitted: [],
      goalAwaitWord: false,
      goalApproveAsDrafted: true,
    };
    inputs.push(planner.plannerInputFor(world, state, derived, network, month, view, post, goal, 1));
  }
  return inputs;
}

/** Measure the drafts on the pack's real graph: each post alone (`reps` times), then `days` whole days. */
export function measureDrafting(pack: string, options: { readonly days?: number; readonly reps?: number } = {}): DraftingReport {
  const days = options.days ?? 20;
  const reps = options.reps ?? 10;
  const inputs = draftingInputs(pack);
  let sound = inputs.length > 0;
  let noLandForce = 0;
  const drafts: DraftSample[] = inputs.map((input) => {
    const set = planner.draft(input);
    const land = input.forces.some((f) => f.post === input.post && f.kind === 'block' && !f.naval);
    if (!land) noLandForce += 1;
    if (land && set.draftCandidates.length === 0) sound = false;
    for (const c of set.draftCandidates) if (c.candScore !== c.candTerms.reduce((n, t) => n + t.contribAmount, 0)) sound = false;
    const samples: number[] = [];
    for (let i = 0; i < reps; i++) {
      const t = performance.now();
      planner.draft(input);
      samples.push(performance.now() - t);
    }
    const sorted = [...samples].sort((a, b) => a - b);
    return { post: input.post, faction: input.faction, candidates: set.draftCandidates.length, searches: set.draftSearches, medianMs: percentile(sorted, 50), maxMs: sorted[sorted.length - 1]! };
  });
  const dayCosts: number[] = [];
  for (let d = 0; d < days; d++) {
    const t = performance.now();
    for (const input of inputs) planner.draft(input);
    dayCosts.push(performance.now() - t);
  }
  const sorted = [...dayCosts].sort((a, b) => a - b);
  // A capped day: the pack's cap of drafts for each side (the cap is counted per side), each side's slowest posts by median, together.
  const cap = inputs[0]?.rules.dailyDraftCap ?? 0;
  const ranked = [...drafts].map((d, i) => ({ d, i })).sort((a, b) => b.d.medianMs - a.d.medianMs || (a.d.post < b.d.post ? -1 : 1));
  const sides = [...new Set(drafts.map((d) => d.faction))].sort();
  const slowest = sides.flatMap((side) => ranked.filter((x) => x.d.faction === side).slice(0, cap)).map((x) => inputs[x.i]!);
  let cappedWorst = 0;
  for (let d = 0; d < days; d++) {
    const t = performance.now();
    for (const input of slowest) planner.draft(input);
    cappedWorst = Math.max(cappedWorst, performance.now() - t);
  }
  return {
    pack,
    posts: inputs.length,
    drafts,
    day: { days, median: percentile(sorted, 50), p95: percentile(sorted, 95), worst: sorted[sorted.length - 1]! },
    cappedDay: { cap, sides: sides.length, worst: cappedWorst },
    slowestDraftMs: Math.max(...drafts.map((d) => d.maxMs)),
    noLandForce,
    sound,
  };
}
