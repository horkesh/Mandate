/**
 * What a day of plan drafting costs on the real Union graph (lane 0.8; 0062's
 * daily drafting cap is "a pack rule, set from the worst day measured here").
 *
 * The planner spike's `draft` is run for every post that commands force blocks
 * at the scenario start: each is asked to take the other side's capital, the
 * longest request the war can make. A "day" is every such post drafting once,
 * back to back; the worst day is the slowest of several. The spike is not
 * kernel code and reads no clock; the clock is read here.
 */
import { phase0 } from '@mandate/kernel';
import { DEFAULT_RULES, type PlannerInput } from '../../../prototypes/planner-spike/src/context.ts';
import { draft } from '../../../prototypes/planner-spike/src/planner.ts';
import { beliefsFor, boldnessOf, competenceOf, profileOf, traitHolder } from '../../../prototypes/planner-spike/src/profile.ts';
import type { ForceStandIn, PostId, RegionId } from '../../../prototypes/planner-spike/src/types.ts';
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
  readonly slowestDraftMs: number;
  /** Posts with no land force (squadrons and yards), which can draft nothing toward an inland objective. */
  readonly noLandForce: number;
  /** Every post with a land force got at least one candidate, and every candidate's score is the exact sum of its terms. */
  readonly sound: boolean;
}

/** Inputs for every post that commands a force block at the scenario start, on the pack's real graph. */
export function draftingInputs(pack: string, month = 4): PlannerInput[] {
  const { world } = seatsWorld(pack);
  const start = world.start;
  const map = world.map;
  const control = phase0.initialControl(map, start);
  const network = phase0.networkConditions(start);
  const derived = phase0.deriveMap(map, { control, month, network });
  const departmentFaction = (department: string): string | null => map.world.departments.find((d) => d.id === department)?.faction ?? null;
  const postInfo = start.posts.map((p) => ({ id: p.id, holder: p.holder, parent: p.parent, region: p.region, kind: p.kind }));
  const forces: (ForceStandIn & { faction: string | null })[] = start.forceBlocks.flatMap((b) =>
    b.post === null ? [] : [{ id: b.id, post: b.post, region: b.region, kind: b.kind as 'block' | 'detachment', arm: b.arm, strength: b.strength ?? 0, storesDays: b.storesDays ?? 0, aboard: b.aboard, faction: departmentFaction(b.department) }],
  );
  const fortification = new Map(start.fortification.map((f) => [f.region, f.levelPermille]));
  const posts = [...new Set(forces.filter((f) => f.kind === 'block').map((f) => f.post))].sort();
  const inputs: PlannerInput[] = [];
  for (const post of posts) {
    const own = forces.find((f) => f.post === post)!.faction;
    const faction = world.factionIds.find((f) => f === own);
    if (faction === undefined) continue;
    const objective = world.faction(faction).objective;
    if (objective === null) continue;
    const reported = new Map<RegionId, number>();
    for (const b of forces) if (b.faction !== own && b.faction !== null) reported.set(b.region, (reported.get(b.region) ?? 0) + b.strength);
    const holder = postInfo.find((p) => p.id === post)?.holder ?? null;
    const record = holder === null ? undefined : map.world.people.find((p) => p.id === holder);
    const boldness = record === undefined ? 500 : boldnessOf(record);
    const person = (holder ?? 'unknown_holder') as ReturnType<typeof traitHolder>['id'];
    const { beliefs } = beliefsFor(new Map([...reported].sort(([a], [b]) => (a < b ? -1 : 1))), 1000, traitHolder(person, boldness));
    inputs.push({
      map,
      month,
      network,
      controlIndex: derived.index,
      supply: derived.supply.factions.get(faction)!,
      faction,
      fortification,
      beliefs,
      forces: forces.filter((f) => f.faction === own),
      posts: postInfo,
      post: post as PostId,
      profile: profileOf(person, boldness, record === undefined ? 500 : competenceOf(record)),
      goal: { objective, posture: 'take', risk: 500, deadlineDays: 60, permissions: { rail: true, river: true, sea: false }, committed: [] },
      rules: DEFAULT_RULES,
    });
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
    const set = draft(input);
    const land = input.forces.some((f) => f.post === input.post && f.kind === 'block' && f.arm !== 'naval');
    if (!land) noLandForce += 1;
    if (land && set.candidates.length === 0) sound = false;
    for (const c of set.candidates) if (c.score !== c.contributions.reduce((n, t) => n + t.amount, 0)) sound = false;
    const samples: number[] = [];
    for (let i = 0; i < reps; i++) {
      const t = performance.now();
      draft(input);
      samples.push(performance.now() - t);
    }
    const sorted = [...samples].sort((a, b) => a - b);
    return { post: input.post, faction: input.faction, candidates: set.candidates.length, searches: set.counters.searches, medianMs: percentile(sorted, 50), maxMs: sorted[sorted.length - 1]! };
  });
  const dayCosts: number[] = [];
  for (let d = 0; d < days; d++) {
    const t = performance.now();
    for (const input of inputs) draft(input);
    dayCosts.push(performance.now() - t);
  }
  const sorted = [...dayCosts].sort((a, b) => a - b);
  return {
    pack,
    posts: inputs.length,
    drafts,
    day: { days, median: percentile(sorted, 50), p95: percentile(sorted, 95), worst: sorted[sorted.length - 1]! },
    slowestDraftMs: Math.max(...drafts.map((d) => d.maxMs)),
    noLandForce,
    sound,
  };
}
