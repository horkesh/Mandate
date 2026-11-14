/**
 * What one drafting request reads (planner-design D2), and the pack-tunable
 * rules. The planner is a pure function of this; it writes nothing (D1).
 */
import { phase0, strictCompare, world as w } from '@mandate/kernel';
import type { FactionId, ForceStandIn, Goal, PersonId, PostId, Profile, RegionId } from './types.ts';

/** A post as the commander knows it: who holds it, where it sits, what it links to. */
export interface PostInfo {
  readonly id: PostId;
  readonly holder: PersonId | null;
  readonly parent: PostId | null;
  readonly region: RegionId | null;
  readonly kind: string;
}

/** Pack-tunable thresholds. Design parameters, not sourced facts. */
export interface PlannerRules {
  /** Share of a neighbouring region's perceived enemy that bleeds into a region's threat, permille (one-hop influence). */
  readonly hopShare: number;
  /** Men of perceived enemy that weigh as one day's march in route cost (at risk weight 1000). */
  readonly menPerDay: number;
  /** A flank route is kept only if it shares fewer than this many permille of its regions with the direct route. */
  readonly flankOverlapMax: number;
  /** Candidates sharing more than this many permille of their regions are duplicates; the better one stays. */
  readonly dedupeOverlap: number;
  /** Candidates returned, plus a holding action when legal. */
  readonly topN: number;
  /** Permille days to reduce works per point of fortification. */
  readonly reducePerLevel: number;
  /** Permille days to clear unmodelled works (a boom) deliberately. */
  readonly clearDays: number;
  /** Permille days to force unmodelled works in one night. */
  readonly forceDays: number;
  /** Extra threat, as men, of forcing works or running past batteries in one night. */
  readonly forcingThreat: number;
  /** A flank route may take at most this many permille of the direct route's days (README: 30-50% longer). */
  readonly flankLengthMax: number;
  /** An alternative may pass regions at most this many permille days further from the objective than its start. */
  readonly retrogradeSlack: number;
  /** Two candidates over the same ground are duplicates only if they arrive within this many permille days. */
  readonly dedupeArrival: number;
  /** Penalty, permille, on the direct route's edges when looking for a flank (2000 doubles them). */
  readonly flankPenalty: number;
  /** A pincer's partner may arrive up to this many permille days before the main axis. */
  readonly pincerWindow: number;
  /** Hard cap on route searches per request; the cap is counted, never silent (D9). */
  readonly maxSearches: number;
}

export const DEFAULT_RULES: PlannerRules = Object.freeze({
  hopShare: 250,
  menPerDay: 1000,
  flankOverlapMax: 600,
  dedupeOverlap: 800,
  topN: 4,
  reducePerLevel: 10,
  clearDays: 4000,
  forceDays: 1000,
  forcingThreat: 4000,
  flankLengthMax: 1600,
  retrogradeSlack: 0,
  dedupeArrival: 1500,
  flankPenalty: 2000,
  pincerWindow: 2000,
  maxSearches: 64,
});

export interface PlannerInput {
  readonly map: w.WorldIndex;
  readonly month: number;
  readonly network: phase0.NetworkConditions;
  readonly controlIndex: phase0.ControlIndex;
  /** His side's supply: which regions his trains reach. */
  readonly supply: phase0.FactionSupply;
  readonly faction: FactionId;
  /** Fortification permille per region (State owned by `regions`; read from the start until lane 0.5). */
  readonly fortification: ReadonlyMap<RegionId, number>;
  /** Men he believes the enemy has per region, already through his perception bias (beliefs.ts). Never truth. */
  readonly beliefs: ReadonlyMap<RegionId, number>;
  /** Blocks he knows of on his own side: his post's and his neighbours'. */
  readonly forces: readonly ForceStandIn[];
  readonly posts: readonly PostInfo[];
  readonly post: PostId;
  readonly profile: Profile;
  readonly goal: Goal;
  readonly rules: PlannerRules;
}

/** Per-request working state: the influence field and a search counter. Built once, discarded after. */
export interface Ctx {
  readonly input: PlannerInput;
  /** Threat per region, men: his belief there plus a share of his beliefs one hop away. */
  readonly threat: ReadonlyMap<RegionId, number>;
  readonly inSupply: ReadonlySet<RegionId>;
  searches: number;
}

export function makeCtx(input: PlannerInput): Ctx {
  const threat = new Map<RegionId, number>();
  for (const region of [...input.map.regions.keys()].sort(strictCompare)) {
    let men = input.beliefs.get(region) ?? 0;
    let near = 0;
    for (const e of w.edgesOf(input.map, region)) near += input.beliefs.get(w.otherEnd(e, region)) ?? 0;
    men += Math.trunc((near * input.rules.hopShare) / 1000);
    if (men > 0) threat.set(region, men);
  }
  return { input, threat, inSupply: new Set(input.supply.paths.keys()), searches: 0 };
}

/** The post's own blocks (garrison detachments stay home), or the committed ones, in (strength desc, id) order. */
export function blocksOf(input: PlannerInput, post: PostId, committed: readonly string[] = []): ForceStandIn[] {
  return input.forces
    .filter((b) => b.post === post && (committed.length === 0 ? b.kind === 'block' : committed.includes(b.id)))
    .sort((a, b) => b.strength - a.strength || strictCompare(a.id, b.id));
}

/** The holder of a post, walking up the chain past vacancies. Returns the post that answers and whether it was vacant. */
export function answeringPost(input: PlannerInput, post: PostId): { readonly post: PostInfo; readonly vacant: boolean } | null {
  let p = input.posts.find((x) => x.id === post) ?? null;
  let vacant = false;
  while (p !== null && p.holder === null) {
    vacant = true;
    p = p.parent === null ? null : (input.posts.find((x) => x.id === p!.parent) ?? null);
  }
  return p === null ? null : { post: p, vacant };
}
