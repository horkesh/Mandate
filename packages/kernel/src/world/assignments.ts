import type { PersonId, PostId, RegionId } from '../ids.ts';
import { parseIsoDate } from './calendar.ts';
import type { ScenarioStart } from './scenario.ts';
import type { World } from './world.ts';

/** A read onward order for one identified regiment already received at a rendezvous. */
export interface OnwardAssignment {
  readonly id: string;
  readonly source: string;
  readonly fromDate: string;
  readonly issuer: PersonId;
  readonly from: PostId;
  readonly to: PostId;
  readonly destination: RegionId;
  readonly mandate: string;
  readonly call: string;
  readonly regiment: string;
}

export function assignmentProblems(world: World, start: ScenarioStart): string[] {
  const ids = new Set<string>();
  const posts = new Set([...start.posts, ...start.temporaryPosts].map(p => p.id));
  const problems: string[] = [];
  for (const paper of world.rules.onwardAssignments ?? []) {
    const at = `onwardAssignments.${paper.id}`;
    if (!paper.id || ids.has(paper.id) || !paper.source.trim()) problems.push(`${at}: a unique sourced instrument is required`);
    ids.add(paper.id);
    try { parseIsoDate(paper.fromDate); } catch { problems.push(`${at}: invalid earliest date`); }
    if (paper.from === paper.to || !posts.has(paper.from) || !posts.has(paper.to) ||
      !world.regions.some(r => r.id === paper.destination) || !world.people.some(p => p.id === paper.issuer) ||
      !paper.mandate || !paper.call || !paper.regiment) problems.push(`${at}: invalid authority, route or regiment reference`);
  }
  return problems;
}
