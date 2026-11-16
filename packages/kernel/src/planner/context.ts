/**
 * What one drafting request reads (planner-design D2; 0062's boundary), and the per-request working state.
 *
 * Every input that describes the enemy or the ground comes from the commander's view: the enemy he believes stands
 * in each region (already through his perception, 0052), the works he has been told of, and the obstructions he has
 * been told close a water edge to his side. The map, his side's control and supply (the derived map), his own side's
 * forces and posts, and the passage rule (`movement`) are the rest. The planner is a pure function of this; it writes
 * nothing (D1).
 */
import { strictCompare } from '../compare.ts';
import type { ControlIndex } from '../control-index/control-index.ts';
import type { EdgeId, FactionId, ForceBlockId, PostId, RegionId } from '../ids.ts';
import type { MarchGround } from '../movement/march.ts';
import type { PlanGoal } from '../plans/goal.ts';
import type { FactionSupply } from '../supply/supply.ts';
import { otherEnd } from '../world/index.ts';
import type { PlannerRules } from '../world/world.ts';
import type { PlannerForce, PlannerPost, Profile } from './types.ts';

export interface PlannerInput {
  /**
   * The map, his side's control index and the network as the derived map reads them, and the month. Its network
   * carries no obstructions: those he plans on are `obstructions`, from his view.
   */
  readonly ground: MarchGround;
  /** His side's supply: which regions his trains reach (the derived map). */
  readonly supply: FactionSupply;
  readonly faction: FactionId;
  /** Men he believes the enemy has per region, through his perception (his view's beliefs). Never truth. */
  readonly beliefs: ReadonlyMap<RegionId, number>;
  /** Fortification he has been told of per region, permille (his view). */
  readonly works: ReadonlyMap<RegionId, number>;
  /** Water edges he has been told are closed to his side, with the region of the installation whose works close them (null: a boom). */
  readonly obstructions: ReadonlyMap<EdgeId, RegionId | null>;
  /** His side's blocks, in id order. */
  readonly forces: readonly PlannerForce[];
  /** His side's posts, in id order. */
  readonly posts: readonly PlannerPost[];
  readonly post: PostId;
  readonly profile: Profile;
  readonly goal: PlanGoal;
  readonly rules: PlannerRules;
  /** The day of the request (stamped on the draft set). */
  readonly day: number;
}

/** Per-request working state: the influence field, supply set and a search counter. Built once, discarded after. */
export interface Ctx {
  readonly input: PlannerInput;
  /** Threat per region, men: his belief there plus a share of his beliefs one hop away. */
  readonly threat: ReadonlyMap<RegionId, number>;
  readonly inSupply: ReadonlySet<RegionId>;
  searches: number;
}

export function makeCtx(input: PlannerInput): Ctx {
  const map = input.ground.map;
  const threat = new Map<RegionId, number>();
  for (const region of [...map.regions.keys()].sort(strictCompare)) {
    let men = input.beliefs.get(region) ?? 0;
    let near = 0;
    for (const e of map.edgesAt.get(region) ?? []) near += input.beliefs.get(otherEnd(e, region)) ?? 0;
    men += Math.trunc((near * input.rules.hopShare) / 1000);
    if (men > 0) threat.set(region, men);
  }
  return { input, threat, inSupply: new Set(input.supply.paths.keys()), searches: 0 };
}

/** The holder of the region, by his side's control index: whether the enemy holds it (lane 0.9 finding 9). */
export function enemyHeld(index: ControlIndex, region: RegionId, faction: FactionId): boolean {
  const holder = index.holdings.get(region)?.holder ?? null;
  return holder !== null && holder !== faction;
}

/** A post's blocks (garrison detachments stay home), or the committed ones, in (strength desc, id) order. */
export function blocksOf(input: PlannerInput, post: PostId, committed: readonly ForceBlockId[] = []): PlannerForce[] {
  return input.forces
    .filter((b) => b.post === post && (committed.length === 0 ? b.kind === 'block' : committed.includes(b.id)))
    .sort((a, b) => b.strength - a.strength || strictCompare(a.id, b.id));
}

/** The holder of a post, walking up the chain past vacancies: the post that answers, and whether it was vacant. */
export function answeringPost(input: PlannerInput, post: PostId): { readonly post: PlannerPost; readonly vacant: boolean } | null {
  let p = input.posts.find((x) => x.id === post) ?? null;
  let vacant = false;
  for (let guard = 0; p !== null && p.holder === null; guard++) {
    if (guard > input.posts.length) return null;
    vacant = true;
    const parent: PostId | null = p.parent;
    p = parent === null ? null : (input.posts.find((x) => x.id === parent) ?? null);
  }
  return p === null ? null : { post: p, vacant };
}

/**
 * How willing a post's holder is to answer a support request (lane 0.9 finding 7): his regard, and the values a
 * cooperating axis honours or offends in him (pack rules). Permille-ish points, signed; 0 for a man with neither.
 */
export function willingness(input: PlannerInput, post: PlannerPost): number {
  const r = input.rules;
  const honoured = post.holderValues.filter((v) => r.partnerHonours.includes(v)).length;
  const offended = post.holderValues.filter((v) => r.partnerOffends.includes(v)).length;
  return Math.trunc((post.holderRegard * r.partnerRegardWeight) / 1000) + (honoured - offended) * r.partnerValueWeight;
}
