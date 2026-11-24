/** Authored public request packet; no State, authority writer or hidden reading is reachable. */
import type { MessageId,PersonId,PostId,RegionId } from '../ids.ts';
import type { PlanGoal } from '../plans/goal.ts';
import type { AllocationScope } from '../world/allocation-scope.ts';
export type ForceRequestModeAuthority = readonly [origin:MessageId,modes:readonly ('land' | 'rail' | 'river' | 'sea')[]];

export interface ForceNeed {
 readonly needOrigin: 'commander_choice';
 readonly needMission: MessageId;
 readonly needPost: PostId;
 readonly needPerson: PersonId;
 readonly needTask: string;
 readonly needScope: AllocationScope;
 readonly needQuantity: number;
 readonly needShortfall: number | null;
 readonly needEstablishment: number | null;
 readonly needReason: 'lacks_resources' | 'unknown_enemy_bootstrap';
 readonly needDestination: RegionId;
 readonly needGoal: PlanGoal;
 readonly needEvidence: string;
}
