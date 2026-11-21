/** Immutable enclosure of a submitted plan. Projection reveals the plan, never its sealed scorer. */
import type { EdgeId, FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import type { PlanGoal } from '../plans/goal.ts';
import type { DraftSet, PlanCandidate } from '../planner/types.ts';

export interface PlanPaper {
  readonly paperPost: PostId;
  readonly paperGoal: PlanGoal;
  readonly paperDraft: DraftSet;
  readonly paperChosen: PlanCandidate;
  /** Frozen scorer coefficients in Profile field order, prefixed historical values rather than live person stats. */
  readonly paperProfile: readonly [PersonId, number, number, number, number, number, number, number, number, number];
  /** Id, post, region, kind, naval, arm, men, stores days, assumed stores, carrier. */
  readonly paperForces: readonly (readonly [ForceBlockId, PostId, RegionId, 'block' | 'detachment', boolean, string, number, number, boolean, ForceBlockId | null])[];
  /** Id, holder, parent, region, seat, expected willingness. */
  readonly paperPosts: readonly (readonly [PostId, PersonId | null, PostId | null, RegionId | null, RegionId | null, number])[];
  readonly paperBeliefs: readonly (readonly [RegionId, number])[];
  readonly paperWorks: readonly (readonly [RegionId, number])[];
  readonly paperObstructions: readonly (readonly [EdgeId, RegionId | null])[];
  readonly paperControl: Readonly<Record<RegionId, Readonly<Record<FactionId, number>>>>;
  readonly paperSupplied: readonly RegionId[];
  readonly paperNetwork: { readonly edgeCondition: Readonly<Record<EdgeId, number>>; readonly depotCondition: Readonly<Record<string, number>>; readonly obstructions: readonly []; readonly neutralGround?: Readonly<Record<RegionId, 'open' | 'closed'>> };
  readonly paperMonth: number;
}
