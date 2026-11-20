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
import type { BombardmentRules } from '../combat/rules.ts';
import type { PlannerForce, PlannerPost, Profile } from './types.ts';
import type { PlanNote } from '../plans/notes.ts';

export interface PlannerInput {
  /** Compliance-weighted preferences, from the delivered send-back. Never constraints. */
  readonly notes?: readonly { readonly mark: PlanNote; readonly weight: number }[];
  readonly noteScoreWeight?: number;
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
  /** His demand for an assault on held ground, permille of his demand in the open (`people.traits.assaultMargin`, lane 0.9 finding 1). */
  readonly assaultMargin: number;
  /**
   * The shortfall share, permille of the men he needs, past which he waits for men: compliance's own rule
   * (`people.compliance.reinforceShareTimid/Bold`, lane 1.1; lane 0.9 finding 8), so his plan and his answer agree.
   */
  readonly reinforceShare: { readonly timid: number; readonly bold: number };
  /** The day of the request (stamped on the draft set). */
  readonly day: number;
  /** The pack's bombardment rules (lane 1.12): the gun arms and the batteries' range across water. */
  readonly bombardment: Pick<BombardmentRules, 'gunArms' | 'objectives' | 'rangeMaxDaysPermille' | 'inPositionPreparationDays'>;
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
 * How willing he expects a post's holder to be to answer a support request (lane 0.9 finding 7): the cooperation he
 * expects of him from his regard and the holder's public standing (`PlannerPost.holderWillingness`), weighted by the pack.
 */
export function willingness(input: PlannerInput, post: PlannerPost): number {
  return Math.trunc((post.holderWillingness * input.rules.partnerWillingnessWeight) / 1000);
}
