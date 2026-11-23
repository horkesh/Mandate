import type { RegionId } from '../ids.ts';
import type { WorldIndex } from '../world/index.ts';
import { otherEnd } from '../world/graph.ts';
import type { DemonstrationPolicy } from '../world/world.ts';
import type { DetentionPurpose } from './goal.ts';

/** Accepted values are a validation contract. Packs must still supply every value. */
export function validDemonstrationPolicy(policy: DemonstrationPolicy | undefined): policy is DemonstrationPolicy {
  return policy != null && policy.detentionRegions === 2 && policy.actionRegions === 4 &&
    Array.isArray(policy.deploymentDays) && policy.deploymentDays.length === 2 &&
    policy.deploymentDays[0] === 1 && policy.deploymentDays[1] === 2 && policy.reconnaissanceDays === 1 &&
    policy.demonstrationCandidates === 12 && policy.totalCandidates === 16 && policy.reserveDays === 1;
}

export function adjacent(map: WorldIndex, region: RegionId, others: ReadonlySet<RegionId>): boolean {
  return (map.edgesAt.get(region) ?? []).some(edge => others.has(otherEnd(edge, region)));
}

function validArea(map: WorldIndex, regions: readonly RegionId[], max: number): boolean {
  if (!Array.isArray(regions) || regions.length < 1 || regions.length > max ||
    new Set(regions).size !== regions.length || regions.some(r => !map.regions.has(r))) return false;
  const reached = new Set([regions[0]!]);
  for (let n = 1; n < regions.length; n++) {
    for (const region of regions) if (adjacent(map, region, reached)) reached.add(region);
  }
  return reached.size === regions.length;
}

export function detentionProblems(map: WorldIndex, purpose: DetentionPurpose): string[] {
  const policy = map.world.rules.plans.demonstration;
  if (!validDemonstrationPolicy(policy)) return ['detention requires a valid demonstration policy'];
  const problems: string[] = [];
  if (!validArea(map, purpose.detentionArea, policy.detentionRegions)) problems.push('invalid detention area');
  if (!validArea(map, purpose.actionArea, policy.actionRegions)) problems.push('invalid action area');
  return problems;
}
